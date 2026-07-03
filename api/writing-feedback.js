// Vercel Serverless Function — Writing feedback via Google Gemini Flash (free)
// Requires GEMINI_API_KEY environment variable in Vercel dashboard

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Add it in Vercel → Settings → Environment Variables.' });
  }

  const { task, taskType, prompt, essay, wordCount, minWords } = req.body;
  if (!essay || !prompt) {
    return res.status(400).json({ error: 'Missing essay or prompt' });
  }

  const criterion1 = task === 1 ? 'Task Achievement (TA)' : 'Task Response (TR)';
  const criterion1key = task === 1 ? 'taskAchievement' : 'taskResponse';
  const criterion1desc = task === 1
    ? 'Does the response cover main features, provide an overview, and make comparisons?'
    : 'Does the response address both views and give a clear personal opinion with developed arguments?';

  const systemPrompt = `You are an expert IELTS examiner with 15 years of experience.
Your task is to evaluate a student's IELTS Writing ${taskType} response according to the official Cambridge IELTS band descriptors.
Be accurate, constructive, and realistic. Use half-band increments (e.g. 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0).
Return ONLY a valid JSON object — no markdown, no explanation outside the JSON.`;

  const userPrompt = `IELTS Writing ${taskType}

TASK PROMPT:
${prompt}

STUDENT'S ESSAY (${wordCount} words):
${essay}

Word count requirement: minimum ${minWords} words.
${wordCount < minWords ? `⚠️ Essay is ${minWords - wordCount} words SHORT of the minimum.` : ''}

Evaluate on all 4 IELTS criteria and return this exact JSON structure:
{
  "band": "6.5",
  "summary": "One sentence overall assessment of the essay",
  "${criterion1key}": {
    "band": "6.5",
    "comment": "2-3 sentence specific feedback on ${criterion1} — ${criterion1desc}"
  },
  "coherence": {
    "band": "7.0",
    "comment": "2-3 sentence feedback on Coherence & Cohesion — logical structure, paragraphing, linking words"
  },
  "lexical": {
    "band": "6.5",
    "comment": "2-3 sentence feedback on Lexical Resource — vocabulary range, precision, collocations, avoid repetition"
  },
  "grammar": {
    "band": "6.0",
    "comment": "2-3 sentence feedback on Grammatical Range & Accuracy — sentence variety, error patterns, complex structures"
  },
  "topTip": "The single most impactful improvement the student can make to raise their band score"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded', rateLimit: true });
      }
      return res.status(502).json({ error: `Gemini API error: ${response.status}`, detail: errText });
    }

    const geminiData = await response.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(502).json({ error: 'Empty response from Gemini API' });

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]+\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return res.status(502).json({ error: 'Could not parse AI response as JSON', raw: text });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
