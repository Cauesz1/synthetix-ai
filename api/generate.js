export const config = { runtime: 'edge' };

export default async function handler(req) {
    // 1. Configuração de CORS (Essencial para não dar erro de permissão)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // 2. Trata requisições de verificação (Preflight)
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: "Apenas POST permitido" }), { status: 405, headers });
    }

    try {
        const { prompt, existingCode } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        // Erro Comum: Esquecer de colocar a chave na Vercel
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API Key ausente nas configurações da Vercel." }), { status: 500, headers });
        }

        const systemInstruction = `Você é o SYNTHETIX ARCHITECT V2. 
        Sua missão é gerar interfaces profissionais, minimalistas e modernas.
        REGRAS:
        1. Retorne APENAS o código HTML completo. Sem markdown.
        2. Se houver código existente, edite-o mantendo a estrutura.
        3. Use Tailwind CSS via CDN.
        4. O design deve ser mobile-first e responsivo.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', 
                messages: [
                    { role: "system", content: systemInstruction },
                    { 
                        role: "user", 
                        content: existingCode 
                            ? `CÓDIGO ATUAL:\n${existingCode}\n\nALTERAÇÃO SOLICITADA:\n${prompt}`
                            : `CRIE UM SITE COMPLETO DO ZERO: ${prompt}`
                    }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();

        // Se a OpenAI retornar erro (ex: falta de créditos)
        if (data.error) {
            return new Response(JSON.stringify({ error: data.error.message }), { status: 400, headers });
        }

        let html = data.choices[0].message.content.trim();
        
        // Limpeza de Markdown
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Falha na conexão: " + error.message }), { status: 500, headers });
    }
}