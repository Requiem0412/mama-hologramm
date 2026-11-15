export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { question } = body;

  if (!question) {
    return res.status(400).json({ error: 'Keine Frage übermittelt.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-Key nicht auf Vercel hinterlegt.' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: 'Du bist ein herzlicher, geduldiger deutscher Alltags-Assistent. Erkläre Rezepte, Haushaltstipps, Vergleiche und Empfehlungen klar, freundlich, gut strukturiert und ohne Fachchinesisch, sodass man es angenehm vorlesen und leicht nachmachen kann.'
              }
            ]
          },
          contents: [{ parts: [{ text: question }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const apiErr = data?.error?.message || 'Fehler von der Gemini API';
      return res.status(response.status).json({ error: apiErr });
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Entschuldige, da ist gerade etwas schiefgelaufen.';

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Serverfehler' });
  }
}
