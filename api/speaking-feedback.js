module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { qas, topic } = req.body || {};
  if (!Array.isArray(qas) || !qas.length)
    return res.status(400).json({ error: 'Missing qas array' });
  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'No API key configured' });

  const qaText = qas.map((qa, i) =>
    `Q${i+1} (Part ${qa.part}): ${qa.question}\nTranscript: ${qa.transcript || '(no answer)'}\nPronunciation: ${qa.pronunciationNotes || 'N/A'}`
  ).join('\n\n');

  const prompt = `You are an expert IELTS examiner. Evaluate the following candidate's speaking test on the topic: "${topic}".

The responses below were transcribed from audio recordings, with pronunciation notes from speech analysis:

${qaText}

Evaluate holistically across all 4 IELTS Speaking criteria. Consider fluency patterns, vocabulary range, grammatical accuracy, and pronunciation intelligibility.

Return a JSON object only (no markdown):
{
  "fc": <number 0-9, halves allowed>,
  "lr": <number 0-9, halves allowed>,
  "gra": <number 0-9, halves allowed>,
  "pron": <number 0-9, halves allowed>,
  "overall": <number 0-9, halves allowed — average of the 4 rounded to nearest 0.5>,
  "summary": "<2-sentence holistic assessment of the candidate's speaking performance>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "toFix": ["<specific error or weakness 1>", "<specific error or weakness 2>", "<specific error or weakness 3>"],
  "topTip": "<one concrete, actionable improvement tip>"
}

Be realistic and constructive. An average test-taker scores 5.5–6.5. Band 7+ requires consistent fluency and accurate complex grammar.`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
        })
      }
    );
    if (!r.ok) {
      const err = await r.text();
      return res.status(502).json({ error: 'Gemini API error', detail: err });
    }
    const gemini = await r.json();
    const text = gemini.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'No JSON in response', raw: text });
    try {
      return res.status(200).json(JSON.parse(match[0]));
    } catch {
      return res.status(502).json({ error: 'Failed to parse AI response', raw: text });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
