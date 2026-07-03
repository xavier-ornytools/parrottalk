module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { audioData, mimeType, question, part } = req.body || {};
  if (!audioData || !mimeType) return res.status(400).json({ error: 'Missing audio data' });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'No API key configured' });

  const prompt = `You are assessing an IELTS Speaking candidate.
Question (Part ${part}): "${question}"
Listen to the audio recording and return JSON only (no markdown):
{"transcript":"<verbatim transcription of what was said>","pronunciationNotes":"<brief note on accent clarity, mispronunciations, intelligibility>"}`;

  const cleanMime = mimeType.split(';')[0].trim();

  const geminiBody = JSON.stringify({
    contents: [{ parts: [
      { inlineData: { mimeType: cleanMime, data: audioData } },
      { text: prompt }
    ]}],
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 }
  });

  try {
    let r;
    for (let attempt = 0; attempt < 2; attempt++) {
      r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: geminiBody }
      );
      if (r.status === 429 && attempt === 0) {
        await new Promise(resolve => setTimeout(resolve, 12000));
        continue;
      }
      break;
    }

    if (!r.ok) {
      const err = await r.text();
      const is429 = r.status === 429;
      return res.status(502).json({
        error: is429 ? 'Rate limit exceeded' : 'Gemini API error',
        detail: err,
        sentMimeType: cleanMime,
        audioBytes: audioData.length,
        rateLimit: is429
      });
    }

    const g = await r.json();
    const text = g.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
