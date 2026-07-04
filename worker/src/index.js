// ParrotTalk API Worker — Cloudflare
// Proxy entre parrottalk.app et Gemini Flash
// Secrets (wrangler secret put): GEMINI_API_KEY
// KV binding: RATE_KV

const ALLOWED_ORIGIN = 'https://parrottalk.app';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ── CORS ────────────────────────────────────────────────────────────────────

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

// ── Rate limiting ────────────────────────────────────────────────────────────

async function checkRateLimit(env, ip) {
  const today = new Date().toISOString().slice(0, 10);
  const key = `rl:${ip}:${today}`;
  const current = parseInt((await env.RATE_KV.get(key)) || '0');
  const limit = parseInt(env.DAILY_LIMIT_PER_IP || '10');
  if (current >= limit) return false;
  await env.RATE_KV.put(key, String(current + 1), { expirationTtl: 90000 }); // 25h TTL
  return true;
}

// ── Cost tracking ────────────────────────────────────────────────────────────

async function checkAndUpdateBudget(env, estimatedCost) {
  const month = new Date().toISOString().slice(0, 7);
  const key = `budget:${month}`;
  const current = parseFloat((await env.RATE_KV.get(key)) || '0');
  const limit = parseFloat(env.MONTHLY_BUDGET_EUR || '50');
  if (current >= limit) return { ok: false, current, limit };
  const updated = current + estimatedCost;
  await env.RATE_KV.put(key, String(updated), { expirationTtl: 2700000 }); // ~31 days
  return { ok: true, current: updated, limit, alert: updated >= limit * 0.8 };
}

function estimateCost(env, inputTokens, outputTokens) {
  const inRate = parseFloat(env.GEMINI_COST_PER_1K_INPUT_TOKENS || '0.000075');
  const outRate = parseFloat(env.GEMINI_COST_PER_1K_OUTPUT_TOKENS || '0.0003');
  return (inputTokens / 1000) * inRate + (outputTokens / 1000) * outRate;
}

// ── Calibration logs ─────────────────────────────────────────────────────────

async function logEvaluation(env, type, bands) {
  const ts = Date.now();
  const key = `log:${type}:${ts}`;
  const entry = { type, bands, ts };
  await env.RATE_KV.put(key, JSON.stringify(entry), { expirationTtl: 7776000 }); // 90 days
}

// ── Gemini call ───────────────────────────────────────────────────────────────

async function callGemini(env, contents, maxOutputTokens = 1024) {
  const res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw { status: res.status, message: err };
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw { status: 502, message: 'Empty response from Gemini' };

  let parsed;
  try { parsed = JSON.parse(text); }
  catch {
    const match = text.match(/\{[\s\S]+\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw { status: 502, message: 'Could not parse AI response as JSON' };
  }

  const usage = data?.usageMetadata || {};
  return { parsed, inputTokens: usage.promptTokenCount || 800, outputTokens: usage.candidatesTokenCount || 400 };
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

Return ONLY valid JSON — no markdown:
{
  "band": "6.5",
  "summary": "One sentence overall assessment",
  "${criterion1key}": { "band": "6.5", "comment": "2-3 sentences on ${criterion1}" },
  "coherence": { "band": "6.5", "comment": "2-3 sentences on Coherence & Cohesion" },
  "lexical": { "band": "6.5", "comment": "2-3 sentences on Lexical Resource" },
  "grammar": { "band": "6.0", "comment": "2-3 sentences on Grammatical Range & Accuracy" },
  "topTip": "Single most impactful improvement"
}

Note at the end of summary: "AI estimate — may vary from official scores by ±0.5–1 band."
Be realistic. An average test-taker scores 5.5–6.5.`;

  const { parsed, inputTokens, outputTokens } = await callGemini(env, [
    { role: 'user', parts: [{ text: userPrompt }] },
  ], 1024);

  const cost = estimateCost(env, inputTokens, outputTokens);
  const budget = await checkAndUpdateBudget(env, cost);
  if (!budget.ok) return json({ error: 'Monthly evaluation budget reached — service resumes next month' }, 429, origin);

  await logEvaluation(env, 'writing', { band: parsed.band, task: task || 1 });

  if (budget.alert) console.log(`[BUDGET ALERT] ${budget.current.toFixed(4)}€ / ${budget.limit}€`);

  return json(parsed, 200, origin);
}

// ── /evaluate/speaking ────────────────────────────────────────────────────────

async function handleSpeaking(req, env, origin) {
  const formData = await req.formData();
  const audioFile = formData.get('audio');
  const topic = formData.get('topic') || '';
  const questionsRaw = formData.get('questions') || '[]';

  if (!audioFile) return json({ error: 'Missing audio file' }, 400, origin);

  const audioBuffer = await audioFile.arrayBuffer();
  const audioBytes = new Uint8Array(audioBuffer);
  let b64 = '';
  for (let i = 0; i < audioBytes.length; i += 8192) {
    b64 += String.fromCharCode(...audioBytes.subarray(i, i + 8192));
  }
  const audioBase64 = btoa(b64);
  const mimeType = audioFile.type || 'audio/webm';

  const questions = JSON.parse(questionsRaw);
  const qText = questions.length
    ? `\n\nTest questions asked:\n${questions.map((q, i) => `Q${i + 1}: ${q}`).join('\n')}`
    : '';

  const systemPrompt = `You are an expert IELTS examiner. Evaluate the following candidate's IELTS Speaking test on the topic: "${topic}".${qText}

Listen to the audio recording carefully. Evaluate across all 4 IELTS Speaking criteria including Pronunciation (evaluated from the audio signal).

Return ONLY valid JSON:
{
  "fc": 6.5,
  "lr": 6.0,
  "gra": 6.5,
  "pron": 6.0,
  "overall": 6.0,
  "summary": "2-sentence holistic assessment. AI estimate — may vary from official scores by ±0.5–1 band.",
  "strengths": ["strength 1", "strength 2"],
  "toFix": ["weakness 1", "weakness 2", "weakness 3"],
  "topTip": "One concrete actionable improvement"
}

overall = average of all 4 criteria, rounded to nearest 0.5.
Be realistic. An average test-taker scores 5.5–6.5. Band 7+ requires consistent fluency and accurate complex grammar.`;

  const { parsed, inputTokens, outputTokens } = await callGemini(env, [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: audioBase64 } },
        { text: systemPrompt },
      ],
    },
  ], 1500);

  const cost = estimateCost(env, inputTokens + 1000, outputTokens); // +1000 for audio tokens approx
  const budget = await checkAndUpdateBudget(env, cost);
  if (!budget.ok) return json({ error: 'Monthly evaluation budget reached — service resumes next month' }, 429, origin);

  await logEvaluation(env, 'speaking', {
    fc: parsed.fc, lr: parsed.lr, gra: parsed.gra, pron: parsed.pron, overall: parsed.overall,
  });

  if (budget.alert) console.log(`[BUDGET ALERT] ${budget.current.toFixed(4)}€ / ${budget.limit}€`);

  return json(parsed, 200, origin);
}

// ── /stats ────────────────────────────────────────────────────────────────────

async function handleStats(env, origin) {
  const month = new Date().toISOString().slice(0, 7);
  const budgetKey = `budget:${month}`;
  const current = parseFloat((await env.RATE_KV.get(budgetKey)) || '0');
  const limit = parseFloat(env.MONTHLY_BUDGET_EUR || '50');

  // Count evaluations this month (approximate — scan log keys)
  const listed = await env.RATE_KV.list({ prefix: `log:` });
  const monthPrefix = `log:`;
  const thisMonthTs = new Date(month + '-01').getTime();
  let writingCount = 0;
  let speakingCount = 0;
  for (const key of listed.keys) {
    const ts = parseInt(key.name.split(':')[2] || '0');
    if (ts >= thisMonthTs) {
      if (key.name.startsWith('log:writing:')) writingCount++;
      if (key.name.startsWith('log:speaking:')) speakingCount++;
    }
  }

  return json({
    month,
    budget_used_eur: parseFloat(current.toFixed(4)),
    budget_limit_eur: limit,
    budget_pct: parseFloat(((current / limit) * 100).toFixed(1)),
    alert: current >= limit * 0.8,
    evaluations: { writing: writingCount, speaking: speakingCount, total: writingCount + speakingCount },
  }, 200, origin);
}

// ── Router ────────────────────────────────────────────────────────────────────

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || ALLOWED_ORIGIN;
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
      return json({ error: message }, status, origin);
    }
  },
};
