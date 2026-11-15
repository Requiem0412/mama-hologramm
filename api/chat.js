export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API-Key nicht auf Vercel hinterlegt.' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: "Du bist ein herzlicher, geduldiger deutscher Alltags-Assistent. Erkläre Rezepte, Haushaltstipps, Vergleiche und Empfehlungen klar, heiterisch, gut strukturiert und ohne Fachchinesisch, sodass man es angenehm vorlesen und leicht nachmachen kann." }]
        },
        contents: [{ parts: [{ text: question }] }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Entschuldigung, da ist gerade etwas schiefgelaufen.';
    
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Serverfehler' });
  }
}