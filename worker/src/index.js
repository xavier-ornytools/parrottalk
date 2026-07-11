// ParrotTalk API Worker — Cloudflare
// Proxy entre parrottalk.app et Gemini Flash
// Secrets (wrangler secret put): GEMINI_API_KEY
// KV binding: RATE_KV

const ALLOWED_ORIGINS = new Set([
  'https://parrottalk.app',
  'https://www.parrottalk.app',
  'http://localhost:3000',
  'http://localhost:8000',
]);
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ── CORS ────────────────────────────────────────────────────────────────────

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://parrottalk.app',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = 'https://parrottalk.app') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ── Rate limiting ────────────────────────────────────────────────────────────

// Liste d'IP exemptées du quota quotidien, définie par variable d'environnement
// Wrangler (EXEMPT_IPS, séparées par des virgules), jamais en dur dans le code.
// DAILY_LIMIT_PER_IP reste inchangé pour toutes les autres IP.
function isExemptIp(env, ip) {
  const list = (env.EXEMPT_IPS || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.includes(ip);
}

async function checkRateLimit(env, ip) {
  if (isExemptIp(env, ip)) return true;
  const today = new Date().toISOString().slice(0, 10);
  const key = `rl:${ip}:${today}`;
  const current = parseInt((await env.RATE_KV.get(key)) || '0');
  const limit = parseInt(env.DAILY_LIMIT_PER_IP || '10');
  if (current >= limit) return false;
  await env.RATE_KV.put(key, String(current + 1), { expirationTtl: 90000 });
  return true;
}

// ── Cost tracking ────────────────────────────────────────────────────────────

async function checkAndUpdateBudget(env, costEur) {
  const month = new Date().toISOString().slice(0, 7);
  const key = `budget:${month}`;
  const current = parseFloat((await env.RATE_KV.get(key)) || '0');
  const limit = parseFloat(env.MONTHLY_BUDGET_EUR || '50');
  if (current >= limit) return { ok: false, current, limit };
  const updated = current + costEur;
  await env.RATE_KV.put(key, String(updated), { expirationTtl: 2700000 });
  return { ok: true, current: updated, limit, alert: updated >= limit * 0.8 };
}

function estimateCost(env, textInputTokens, audioTokens, outputTokens) {
  const textRate  = parseFloat(env.GEMINI_COST_PER_1K_INPUT_TOKENS  || '0.0003');
  const audioRate = parseFloat(env.GEMINI_COST_PER_1K_AUDIO_TOKENS  || '0.001');
  const outRate   = parseFloat(env.GEMINI_COST_PER_1K_OUTPUT_TOKENS || '0.0025');
  return (textInputTokens / 1000) * textRate
       + (audioTokens     / 1000) * audioRate
       + (outputTokens    / 1000) * outRate;
}

// ── Calibration logs ─────────────────────────────────────────────────────────

async function logEvaluation(env, type, bands, durationSeconds, usage) {
  const key = `log:${type}:${Date.now()}`;
  await env.RATE_KV.put(key, JSON.stringify({
    type, bands, durationSeconds, ts: Date.now(),
    promptTokenCount:     usage?.promptTokenCount     ?? null,
    candidatesTokenCount: usage?.candidatesTokenCount ?? null,
    totalTokenCount:      usage?.totalTokenCount       ?? null,
    audioTokenCount:      usage?.audioTokenCount       ?? null,
    costEur:              usage?.costEur               ?? null,
  }), {
    expirationTtl: 7776000, // 90 jours
  });
}

// Journal minimal des échecs Gemini (après épuisement des tentatives) : aucun
// contenu candidat, seulement de quoi diagnostiquer après coup sans dépendre
// d'une écoute wrangler tail en direct au moment précis de l'incident.
async function logGeminiFailure(env, endpoint, status, message, retries) {
  const key = `error:${Date.now()}`;
  await env.RATE_KV.put(key, JSON.stringify({
    ts: Date.now(),
    endpoint,
    status,
    message: (message || '').slice(0, 200),
    retries: retries || 0,
  }), {
    expirationTtl: 7776000, // 90 jours, cohérent avec logEvaluation
  });

  const day = new Date().toISOString().slice(0, 10);
  const counterKey = `errors:${day}`;
  const current = parseInt((await env.RATE_KV.get(counterKey)) || '0');
  await env.RATE_KV.put(counterKey, String(current + 1), { expirationTtl: 172800 }); // 2 jours
}

// ── Gemini call ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Délais avant chaque nouvelle tentative (2 tentatives supplémentaires au
// maximum, jamais plus). setTimeout via un await ne consomme aucun temps CPU
// sur Cloudflare Workers, seule l'exécution JS réelle est comptée dans la
// limite du plan : ces attentes n'ont donc pas d'impact sur le quota CPU.
// Pire cas ajouté en temps d'horloge : 2s + 5s = 7s, uniquement quand Gemini
// est réellement en échec, jamais sur le chemin nominal.
const GEMINI_RETRY_DELAYS_MS = [2000, 5000];

async function callGemini(env, contents, maxOutputTokens = 1024) {
  const body = JSON.stringify({
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  let res;
  let retriesUsed = 0;
  for (let attempt = 0; attempt <= GEMINI_RETRY_DELAYS_MS.length; attempt++) {
    res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (res.ok) break;

    // On ne retente jamais sur un 4xx autre que 429 (requête malformée, clé
    // API invalide, quota Gemini définitivement dépassé...) : ces cas ne se
    // corrigent pas en réessayant. Seuls 503 (surcharge) et 429 (rate limit
    // Gemini, distinct de nos propres quotas internes) sont retentés.
    const retryable = res.status === 503 || res.status === 429;
    const hasDelayLeft = attempt < GEMINI_RETRY_DELAYS_MS.length;
    if (!retryable || !hasDelayLeft) {
      const err = await res.text();
      throw { status: res.status, message: err, retries: retriesUsed };
    }

    retriesUsed++;
    console.warn(`[callGemini] statut ${res.status} de Gemini, nouvelle tentative ${retriesUsed} dans ${GEMINI_RETRY_DELAYS_MS[attempt]} ms`);
    await sleep(GEMINI_RETRY_DELAYS_MS[attempt]);
  }

  const data = await res.json();
  // Skip thinking parts (gemini-2.5-flash thinking mode) — keep only output text
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter(p => !p.thought).map(p => p.text || '').join('');
  if (!text) throw { status: 502, message: 'Empty response from Gemini', retries: retriesUsed };

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Strip markdown fences, then extract first complete {...} block
    const clean = text.replace(/```[\w]*\n?/g, '').replace(/\n?```/g, '').trim();
    const match = clean.match(/\{[\s\S]+\}/);
    try {
      if (!match) throw new Error('no JSON object found');
      parsed = JSON.parse(match[0]);
    } catch {
      console.error('[Gemini parse error] raw text:', text);
      throw { status: 502, message: 'Could not parse AI response as JSON', retries: retriesUsed };
    }
  }

  const usage = data?.usageMetadata || {};
  if (usage.promptTokenCount == null || usage.candidatesTokenCount == null) {
    console.warn('[usageMetadata manquant] fallback 500/500 tokens appliqué — réponse Gemini incomplète ou format changé', JSON.stringify(usage));
  }
  const promptDetails = usage.promptTokensDetails || [];
  const audioDetail = promptDetails.find(d => d.modality === 'AUDIO');
  const textDetail  = promptDetails.find(d => d.modality === 'TEXT');

  return {
    parsed,
    inputTokens:  usage.promptTokenCount     ?? 500,
    outputTokens: usage.candidatesTokenCount ?? 500,
    totalTokens:  usage.totalTokenCount ?? null,
    audioTokens:  audioDetail ? audioDetail.tokenCount : null,
    textTokens:   textDetail  ? textDetail.tokenCount  : null,
  };
}

// ── Band clamping ─────────────────────────────────────────────────────────────
// Un band renvoyé par Gemini n'est jamais garanti d'être un multiple de 0.5 ni
// borné entre 0 et 9 : on le force côté code avant tout log ou renvoi au client.
function clampBand(x) {
  const n = typeof x === 'number' ? x : parseFloat(x);
  if (!Number.isFinite(n)) return null;
  return Math.min(9, Math.max(0, Math.round(n * 2) / 2));
}

// ── /evaluate/writing ─────────────────────────────────────────────────────────

async function handleWriting(req, env, origin) {
  const { task, taskType, prompt, essay, wordCount, minWords } = await req.json();
  if (!essay || !prompt) return json({ error: 'Missing essay or prompt' }, 400, origin);

  const criterion1 = task === 1 ? 'Task Achievement (TA)' : 'Task Response (TR)';
  const criterion1key = task === 1 ? 'taskAchievement' : 'taskResponse';

  const userPrompt = `You are an expert IELTS examiner. Evaluate this IELTS Writing ${taskType} response.

TASK PROMPT: ${prompt}

STUDENT'S ESSAY (${wordCount} words):
${essay}

${wordCount < (minWords || 0) ? `⚠️ Essay is ${(minWords || 0) - wordCount} words short of the minimum.` : ''}

GRADING RULES (hard numeric caps, not suggestions; apply these strictly regardless of how good the content otherwise is):
- If the essay does not address the task prompt (off topic, or answers a different question), penalize ${criterion1} heavily, even if the English itself is excellent. A fluent essay on the wrong topic cannot score highly on this criterion.
- If the response is written mainly as notes, bullet points, or short fragments instead of full paragraphs, cap both ${criterion1} and Coherence and Cohesion at 5.0 maximum, regardless of content quality.
- If the essay is severely under length (fewer than 80 percent of the required minimum, i.e. fewer than ${Math.round((minWords || 0) * 0.8)} words for this task), cap ${criterion1} at 5.0 maximum.
- If the content reads as a memorized or generic answer with no real connection to the specific prompt given, penalize severely.

Return ONLY valid JSON — no markdown:
{
  "band": "6.5",
  "summary": "One sentence overall assessment. AI estimate — may vary from official scores by ±0.5–1 band.",
  "${criterion1key}": { "band": "6.5", "comment": "2-3 sentences on ${criterion1}" },
  "coherence": { "band": "6.5", "comment": "2-3 sentences on Coherence & Cohesion" },
  "lexical":   { "band": "6.5", "comment": "2-3 sentences on Lexical Resource" },
  "grammar":   { "band": "6.0", "comment": "2-3 sentences on Grammatical Range & Accuracy" },
  "topTip": "Single most impactful improvement"
}

Be realistic. An average test-taker scores 5.5–6.5.`;

  const { parsed, inputTokens, outputTokens, totalTokens } = await callGemini(env, [
    { role: 'user', parts: [{ text: userPrompt }] },
  ], 1024);

  // Plafonds appliqués en code, pas seulement demandés au prompt : un test réel
  // a montré que Gemini peut écrire dans son commentaire que le plafond est
  // appliqué tout en renvoyant un chiffre qui l'ignore. Même philosophie que
  // clampBand : une règle qui doit être absolue ne peut pas dépendre de
  // l'obéissance du modèle aux instructions du prompt.
  const essayWordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const underLengthThreshold = Math.round((minWords || 0) * 0.8);
  const isSeverelyUnderLength = essayWordCount < underLengthThreshold;

  const nonEmptyLines = essay.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const bulletLines = nonEmptyLines.filter(l => /^([-*•]|\d+[.)])\s/.test(l));
  const isBulletFormat = nonEmptyLines.length > 0 && (bulletLines.length / nonEmptyLines.length) > 0.5;

  const capsApplied = [];
  if (isSeverelyUnderLength) capsApplied.push('under_length');
  if (isBulletFormat) capsApplied.push('bullet_format');

  if ((isSeverelyUnderLength || isBulletFormat) && parsed[criterion1key]) {
    const rawTaskBand = parseFloat(parsed[criterion1key].band);
    if (Number.isFinite(rawTaskBand)) parsed[criterion1key].band = Math.min(5.0, rawTaskBand);
  }
  if (isBulletFormat && parsed.coherence) {
    const rawCoherenceBand = parseFloat(parsed.coherence.band);
    if (Number.isFinite(rawCoherenceBand)) parsed.coherence.band = Math.min(5.0, rawCoherenceBand);
  }
  if (capsApplied.length > 0) {
    const rawOverallBand = parseFloat(parsed.band);
    if (Number.isFinite(rawOverallBand)) parsed.band = Math.min(5.0, rawOverallBand);
    parsed.capsApplied = capsApplied;
    console.warn('[caps] plafond Writing appliqué en code', { task, capsApplied, essayWordCount, underLengthThreshold });
  }

  parsed.band = clampBand(parsed.band);
  if (parsed.band === null) {
    parsed.bandError = 'AI returned an invalid band value.';
    console.warn('[clampBand] band Writing invalide, mis à null', { task });
  }

  // Même garde-fou sur les 4 sous-critères (taskAchievement/taskResponse,
  // coherence, lexical, grammar) : chacun porte son propre band Gemini,
  // niché dans un sous-objet { band, comment }.
  [criterion1key, 'coherence', 'lexical', 'grammar'].forEach(key => {
    if (!parsed[key]) return;
    parsed[key].band = clampBand(parsed[key].band);
    if (parsed[key].band === null) {
      parsed[key].bandError = 'AI returned an invalid band value.';
      console.warn('[clampBand] band Writing invalide (critère)', { task, key });
    }
  });

  const cost = estimateCost(env, inputTokens, 0, outputTokens);
  const budget = await checkAndUpdateBudget(env, cost);
  if (!budget.ok) return json({ error: 'Monthly evaluation budget reached — service resumes next month' }, 429, origin);
  if (budget.alert) console.log(`[BUDGET ALERT] ${budget.current.toFixed(4)}€ / ${budget.limit}€`);

  await logEvaluation(env, 'writing', {
    band: parsed.band,
    task: task || 1,
    promptExcerpt: (prompt || '').slice(0, 300),
  }, 0, {
    promptTokenCount: inputTokens,
    candidatesTokenCount: outputTokens,
    totalTokenCount: totalTokens,
    audioTokenCount: null,
    costEur: cost,
  });

  return json(parsed, 200, origin);
}

// ── /evaluate/speaking ────────────────────────────────────────────────────────

async function handleSpeaking(req, env, origin) {
  const formData = await req.formData();
  const topic = formData.get('topic') || '';
  const questionsRaw = formData.get('questions') || '[]';
  const questions = JSON.parse(questionsRaw);

  // Chaque enregistrement est associé à l'index réel de sa question
  // (audio_<questionIndex>), plus de compteur contigu séparé : une question
  // sautée par le candidat ne décale plus l'étiquette des questions suivantes.
  // Une question sans enregistrement est marquée comme sautée dans le prompt
  // Gemini, au lieu d'être silencieusement omise.
  const geminiParts = [];
  let totalDurationSeconds = 0;
  let recordedCount = 0;
  for (let i = 0; i < questions.length; i++) {
    const questionText = questions[i] || `Question ${i + 1}`;
    const audioFile = formData.get(`audio_${i}`);
    if (!audioFile) {
      geminiParts.push({ text: `Question ${i + 1} (${questionText}): skipped by candidate, no recording provided.` });
      continue;
    }
    recordedCount++;
    const durationStr = formData.get(`duration_${i}`);
    const duration = parseFloat(durationStr || '0') || 0;
    totalDurationSeconds += duration;

    const ab = await audioFile.arrayBuffer();
    const bytes = new Uint8Array(ab);
    let b64 = '';
    for (let j = 0; j < bytes.length; j += 8192) {
      b64 += String.fromCharCode(...bytes.subarray(j, j + 8192));
    }
    const mimeType = audioFile.type || 'audio/webm';
    geminiParts.push({ text: `Recording (Question ${i + 1}): ${questionText}` });
    geminiParts.push({ inlineData: { mimeType, data: btoa(b64) } });
  }

  if (recordedCount === 0) return json({ error: 'No audio recordings received' }, 400, origin);

  const systemPrompt = `You are an expert IELTS examiner. Evaluate the candidate's full IELTS Speaking test on the topic: "${topic}".

The recordings and skipped-question notes above correspond to the test questions, in order. ${recordedCount} of ${questions.length} questions have an audio recording; skipped questions are marked as such and simply provide no evidence for that response.
Listen to each recording carefully. Evaluate holistically across all 4 IELTS Speaking criteria.
Pronunciation must be evaluated from the audio signal — not inferred.
For Lexical Resource (lr), treat the candidate's ability to paraphrase or describe a concept when a precise word is missing (circumlocution) as a positive sign of communicative skill, not a weakness to penalize.

Return ONLY valid JSON:
{
  "fc":   <number 0-9, halves allowed>,
  "lr":   <number 0-9, halves allowed>,
  "gra":  <number 0-9, halves allowed>,
  "pron": <number 0-9, halves allowed>,
  "overall": <average of all 4, rounded to nearest 0.5>,
  "transcript": "Verbatim or close-verbatim transcript of the candidate's full speech, all parts concatenated.",
  "summary": "2-sentence holistic assessment. AI estimate — may vary from official scores by ±0.5–1 band.",
  "strengths": ["strength 1", "strength 2"],
  "toFix":    ["weakness 1", "weakness 2", "weakness 3"],
  "topTip": "One concrete actionable improvement"
}

Be realistic. Average test-taker: 5.5–6.5. Band 7+ requires consistent fluency and accurate complex grammar.`;

  geminiParts.push({ text: systemPrompt });

  const { parsed, inputTokens, outputTokens, totalTokens, audioTokens, textTokens } = await callGemini(env, [
    { role: 'user', parts: geminiParts },
  ], 1500);

  // Chaque critère est clampé individuellement, puis "overall" est recalculé
  // à partir des 4 valeurs déjà clampées (pas de la valeur brute renvoyée par
  // Gemini pour "overall") : on ne fait pas confiance à l'arithmétique du
  // modèle, même pour une simple moyenne.
  ['fc', 'lr', 'gra', 'pron'].forEach(key => {
    parsed[key] = clampBand(parsed[key]);
    if (parsed[key] === null) {
      parsed[`${key}Error`] = 'AI returned an invalid band value.';
      console.warn(`[clampBand] ${key} Speaking invalide, mis à null`);
    }
  });

  const criteria = [parsed.fc, parsed.lr, parsed.gra, parsed.pron];
  if (criteria.every(v => v !== null)) {
    parsed.overall = clampBand(criteria.reduce((a, b) => a + b, 0) / 4);
  } else {
    parsed.overall = null;
    parsed.overallError = 'AI returned an invalid criterion value, overall band could not be computed.';
    console.warn('[clampBand] overall Speaking non calculable, un critère est invalide');
  }

  // Répartition texte/audio pour le coût : on préfère le détail par modalité renvoyé
  // par Gemini (audioTokens/textTokens réels) ; sinon on retombe sur l'estimation par
  // durée (32 tokens/s), moins précise mais toujours basée sur inputTokens réel.
  const hasModalityDetail = audioTokens != null || textTokens != null;
  const audioTokensForCost = hasModalityDetail ? (audioTokens || 0) : Math.round(totalDurationSeconds * 32);
  const textTokensForCost  = hasModalityDetail ? (textTokens  || 0) : inputTokens;

  const cost = estimateCost(env, textTokensForCost, audioTokensForCost, outputTokens);
  const budget = await checkAndUpdateBudget(env, cost);
  if (!budget.ok) return json({ error: 'Monthly evaluation budget reached — service resumes next month' }, 429, origin);
  if (budget.alert) console.log(`[BUDGET ALERT] ${budget.current.toFixed(4)}€ / ${budget.limit}€`);

  await logEvaluation(env, 'speaking', {
    fc: parsed.fc, lr: parsed.lr, gra: parsed.gra, pron: parsed.pron, overall: parsed.overall,
  }, totalDurationSeconds, {
    promptTokenCount: inputTokens,
    candidatesTokenCount: outputTokens,
    totalTokenCount: totalTokens,
    audioTokenCount: audioTokensForCost,
    costEur: cost,
  });

  return json(parsed, 200, origin);
}

// ── /stats ────────────────────────────────────────────────────────────────────

async function handleStats(env, origin) {
  const month = new Date().toISOString().slice(0, 7);
  const current = parseFloat((await env.RATE_KV.get(`budget:${month}`)) || '0');
  const limit = parseFloat(env.MONTHLY_BUDGET_EUR || '50');

  const today = new Date().toISOString().slice(0, 10);
  const geminiErrorsToday = parseInt((await env.RATE_KV.get(`errors:${today}`)) || '0');

  const listed = await env.RATE_KV.list({ prefix: 'log:' });
  const thisMonthTs = new Date(month + '-01').getTime();
  let writingCount = 0;
  let speakingCount = 0;

  let totalPromptTokens = 0;
  let totalCandidatesTokens = 0;
  let totalTokens = 0;
  let totalAudioTokens = 0;
  let totalCostEur = 0;
  const byDay = {}; // 'YYYY-MM-DD' -> { tokens, costEur, calls }

  for (const key of listed.keys) {
    const ts = parseInt(key.name.split(':')[2] || '0');
    if (ts >= thisMonthTs) {
      if (key.name.startsWith('log:writing:'))  writingCount++;
      if (key.name.startsWith('log:speaking:')) speakingCount++;
    }

    const raw = await env.RATE_KV.get(key.name);
    if (!raw) continue;
    let entry;
    try { entry = JSON.parse(raw); } catch { continue; }

    const prompt = entry.promptTokenCount || 0;
    const cand   = entry.candidatesTokenCount || 0;
    const tot    = entry.totalTokenCount || (prompt + cand);
    const audio  = entry.audioTokenCount || 0;
    const costEur = entry.costEur || 0;

    totalPromptTokens     += prompt;
    totalCandidatesTokens += cand;
    totalTokens           += tot;
    totalAudioTokens      += audio;
    totalCostEur          += costEur;

    const day = new Date(entry.ts || ts).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { tokens: 0, costEur: 0, calls: 0 };
    byDay[day].tokens  += tot;
    byDay[day].costEur += costEur;
    byDay[day].calls   += 1;
  }

  const history = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, tokens: v.tokens, cost_eur: parseFloat(v.costEur.toFixed(4)), calls: v.calls }));

  // Burn rate : moyenne quotidienne sur les jours d'activité des 7 derniers jours
  const last7 = history.slice(-7);
  const burnRatePerDayEur    = last7.length ? last7.reduce((s, h) => s + h.cost_eur, 0) / last7.length : 0;
  const burnRatePerDayTokens = last7.length ? Math.round(last7.reduce((s, h) => s + h.tokens, 0) / last7.length) : 0;

  return json({
    month,
    budget_used_eur: parseFloat(current.toFixed(4)),
    budget_limit_eur: limit,
    budget_pct: parseFloat(((current / limit) * 100).toFixed(1)),
    alert: current >= limit * 0.8,
    gemini_errors_today: geminiErrorsToday,
    evaluations: { writing: writingCount, speaking: speakingCount, total: writingCount + speakingCount },
    tokens: {
      prompt:     totalPromptTokens,
      candidates: totalCandidatesTokens,
      total:      totalTokens,
      audio:      totalAudioTokens,
    },
    cost_estimate_eur_alltime: parseFloat(totalCostEur.toFixed(4)),
    burn_rate: {
      per_day_eur:    parseFloat(burnRatePerDayEur.toFixed(4)),
      per_day_tokens: burnRatePerDayTokens,
      window_days:    last7.length,
    },
    history, // [{date, tokens, cost_eur, calls}] — borné par le TTL 90j des logs
  }, 200, origin);
}

// ── Router ────────────────────────────────────────────────────────────────────

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || 'https://parrottalk.app';
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const ip = req.headers.get('CF-Connecting-IP') || '0.0.0.0';

    try {
      if (url.pathname === '/evaluate/writing' && req.method === 'POST') {
        const allowed = await checkRateLimit(env, ip);
        if (!allowed) return json({ error: 'Daily evaluation limit reached. Try again tomorrow.' }, 429, origin);
        return await handleWriting(req, env, origin);
      }

      if (url.pathname === '/evaluate/speaking' && req.method === 'POST') {
        const allowed = await checkRateLimit(env, ip);
        if (!allowed) return json({ error: 'Daily evaluation limit reached. Try again tomorrow.' }, 429, origin);
        return await handleSpeaking(req, env, origin);
      }

      if (url.pathname === '/stats' && req.method === 'GET') {
        return await handleStats(env, origin);
      }

      return json({ error: 'Not found' }, 404, origin);

    } catch (err) {
      const status = err.status || 500;
      const message = typeof err.message === 'string' ? err.message : 'Internal error';
      console.error('[Worker error]', status, message);
      if (url.pathname === '/evaluate/writing' || url.pathname === '/evaluate/speaking') {
        await logGeminiFailure(env, url.pathname, status, message, err.retries);
      }
      return json({ error: message }, status, origin);
    }
  },
};
