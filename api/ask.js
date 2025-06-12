import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  const { userMsg, markdown } = req.body;

  const prompt = `
Voici mon profil :
${markdown}

Réponds à la question suivante comme si tu étais cet utilisateur, à la première personne, de façon concise, claire, et sans aucune digression.
Rédige la réponse en texte lisible, sous forme de paragraphes courts (2-3 phrases maximum par paragraphe), sans listes ni markdown.
N'écris jamais d'introduction, de résumé, ni de reformulation.
N'indique jamais que tu es une IA ou un assistant.
Utilise la langue de la question.

Question :
"${userMsg}"
`;

  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
Tu simules l'utilisateur. Toujours à la première personne ("je", "mon", "ma").
Pas de compliments, pas de reformulation, pas de digression.
Respecte strictement les faits et le style du profil fourni.
Réponds toujours en texte lisible, avec des paragraphes courts (2-3 phrases chacun), sans liste ni markdown.
N'indique jamais que tu es une IA ou un assistant.
Utilise la langue de la question.
`
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await r.json();
    if (!r.ok) {
      res.status(500).json({ error: data });
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne', details: err.message });
  }
}
