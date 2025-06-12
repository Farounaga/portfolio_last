require('dotenv').config();
console.log('API KEY:', process.env.OPENROUTER_API_KEY);
// Этот файл запускает сервер для обработки запросов к OpenRouter API
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// Для Node.js 18+ можно использовать встроенный fetch, но для совместимости с более старыми версиями используем node-fetch

const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname)); // Твои статики (index.html и пр.)

app.post('/api/ask', async (req, res) => {
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
N'indique jamais que tu es une IA.
Langue de la question.
`
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('OpenRouter error:', data);
      res.status(500).json({ error: data });
      return;
    }
    res.json(data);
  } catch (err) {
    console.error('Catch error:', err);
    res.status(500).json({ error: 'Ошибка на сервере', details: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on', PORT));
