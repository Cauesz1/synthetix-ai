export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { prompt } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Chave API não configurada na Vercel." });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: "system", content: "Você é um expert em criação de sites. Retorne apenas código HTML/Tailwind limpo, sem markdown." },
                    { role: "user", content: `Crie um site: ${prompt}` }
                ],
                max_tokens: 1500
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const html = data.choices[0].message.content.replace(/```html/g, '').replace(/```/g, '');
        return res.status(200).json({ html });

    } catch (error) {
        return res.status(500).json({ error: "Erro interno: " + error.message });
    }
}