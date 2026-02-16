export const config = { runtime: 'edge' };

export default async function handler(req) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

    try {
        const { prompt, existingCode } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) return new Response(JSON.stringify({ error: "Missing API Key" }), { status: 500, headers });

        const systemInstruction = `Você é o SYNTHETIX ARCHITECT (Base44 Model).
        Sua função é gerar interfaces web ultra-modernas (SaaS, Dark Mode, Minimalistas).
        
        REGRAS:
        1. Retorne APENAS o código HTML completo. NADA MAIS.
        2. Use Tailwind CSS via CDN.
        3. Se receber código existente, EDITE-O de forma inteligente (Incremental).
        4. Estilo: Use fontes 'Inter' e 'Space Grotesk'. Use bordas sutis (border-white/10).
        5. Componentes: Bento Grids, Glassmorphism, Botões com hover suave.
        
        Não explique. Apenas codifique.`;

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
                            ? `CÓDIGO ATUAL:\n${existingCode}\n\nMODIFICAÇÃO:\n${prompt}`
                            : `CRIAR NOVO SITE: ${prompt}`
                    }
                ],
                temperature: 0.1
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        let html = data.choices[0].message.content.trim();
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}