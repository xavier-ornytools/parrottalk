export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { questions, answers, topic } = req.body || {};
  if (!Array.isArray(answers) || !Array.isArray(questions) || !answers.length)
    return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ error: 'No API key configured' });

  const qa = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || '(no answer provided)'}`).join('\n\n');

  const prompt = `You are an expert IELTS examiner. Evaluate the following IELTS Speaking written simulation responses on the topic: "${topic}".

The candidate has written their responses as if speaking. Evaluate across all 4 IELTS Speaking criteria.

${qa}

Return a JSON object only (no markdown, no explanation outside JSON):
{
  "fc": <number 0-9, halves allowed>,
  "lr": <number 0-9, halves allowed>,
  "gra": <number 0-9, halves allowed>,
  "pron": <number 0-9, halves allowed>,
  "overall": <number 0-9, halves allowed — average of the 4>,
  "summary": "<2-sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "toFix": ["<error or weakness 1>", "<error or weakness 2>", "<error or weakness 3>"],
  "topTip": "<one actionable improvement tip>"
}

Be realistic and constructive. An average candidate should score around 5.5–6.5.`;

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024, responseMimeType: 'application/json' }
      })
    }
  );

  if (!r.ok) {
    const err = await r.text();
    return res.status(502).json({ error: 'Gemini API error', detail: err });
  }

  const gemini = await r.json();
  const text = gemini.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    return res.status(200).json(JSON.parse(text));
  } catch {
    return res.status(502).json({ error: 'Failed to parse AI response', raw: text });
  }
}
