export const config = { runtime: 'edge' };

export default async function handler(req) {

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS')
        return new Response(null, { status: 204, headers });

    if (req.method !== 'POST')
        return new Response(JSON.stringify({ error: "Apenas POST permitido" }), { status: 405, headers });

    try {

        const { prompt, existingCode } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey)
            return new Response(JSON.stringify({ error: "Chave API não configurada." }), { status: 500, headers });

        const systemInstruction = `
VOCÊ É O SYNTHETIX ENGINE.

MODO CREATE:
Se não houver código existente, gere um HTML completo.

MODO UPDATE:
Se houver código existente:
- Preserve estrutura
- Preserve <head>
- Preserve CDNs
- Preserve Tailwind config
- Preserve scripts
- Preserve design system Zenith
- Modifique apenas o necessário
- Nunca reescreva tudo

DESIGN SYSTEM ZENITH:
- Dark mode
- Fundo #050505
- Roxo #7c3aed
- Tailwind CDN
- Inter + Space Grotesk
- Futurista clean

RETORNO:
- Sempre HTML válido
- Nunca markdown
- Nunca explicações externas
`;

        const userContent = existingCode
            ? `
MODO UPDATE

CÓDIGO ATUAL:
${existingCode}

ALTERAÇÃO SOLICITADA:
${prompt}

Lembre-se: altere somente o necessário.
`
            : `
MODO CREATE

Crie um novo projeto:
${prompt}
`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4.1-mini',
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: userContent }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();

        if (data.error)
            throw new Error(data.error.message);

        let html = data.choices[0].message.content.trim();
        html = html.replace(/```html/g,'').replace(/```/g,'');

        return new Response(JSON.stringify({ html }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Erro: " + error.message }), { status: 500, headers });
    }
}
