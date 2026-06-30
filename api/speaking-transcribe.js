export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { audioData, mimeType, question, part } = req.body || {};
  if (!audioData || !mimeType) return res.status(400).json({ error: 'Missing audio data' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'No API key configured' });

  const prompt = `You are assessing an IELTS Speaking candidate.
Question (Part ${part}): "${question}"
Listen to the audio recording and return JSON only (no markdown):
{"transcript":"<verbatim transcription of what was said>","pronunciationNotes":"<brief note on accent clarity, mispronunciations, intelligibility>"}`;

  // Strip codec suffix: "audio/webm;codecs=opus" → "audio/webm"
  const cleanMime = mimeType.split(';')[0].trim();

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inlineData: { mimeType: cleanMime, data: audioData } },
            { text: prompt }
          ]}],
          generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
        })
      }
    );
    if (!r.ok) {
      const err = await r.text();
      return res.status(502).json({ error: 'Gemini API error', detail: err });
    }
    const g = await r.json();
    const text = g.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Extract JSON even if Gemini wraps it in markdown code fences
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'No JSON in response', raw: text });
    try {
      return res.status(200).json(JSON.parse(match[0]));
    } catch {
      return res.status(502).json({ error: 'Parse error', raw: text });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
