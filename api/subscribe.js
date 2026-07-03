module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email } = req.body || {};
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
  if (!process.env.BREVO_API_KEY) return res.status(500).json({ error: 'Not configured' });

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
    body: JSON.stringify({ email, listIds: [2], updateEnabled: true })
  });

  if (r.status === 201 || r.status === 204) return res.status(200).json({ ok: true });
  const data = await r.json();
  return res.status(502).json({ error: data.message || 'Brevo error' });
}
