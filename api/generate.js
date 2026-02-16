export const config = { runtime: 'edge' };

export default async function handler(req) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const { prompt, existingCode } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        const systemInstruction = `Você é o SYNTHETIX ARCHITECT V2 (Estilo Base44/Mocha). 
        Sua missão é gerar interfaces ultra-profissionais, minimalistas e modernas.
        
        REGRAS TÉCNICAS:
        1. Use apenas HTML5 e Tailwind CSS via CDN.
        2. Retorne APENAS o código completo do documento. Sem markdown (\`\`\`).
        3. Se houver CÓDIGO ATUAL, edite-o preservando a estrutura e focando na alteração pedida.
        4. Use fontes como 'Space Grotesk' e 'Inter'.
        5. Foque em: Bento Grids, Glassmorphism suave, animações de entrada e tipografia grande.
        6. O código DEVE ser perfeito no celular (Responsivo).
        
        Sua personalidade é técnica, direta e focada em design de elite.`;

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
                            ? `CÓDIGO ATUAL:\n${existingCode}\n\nALTERAÇÃO:\n${prompt}`
                            : `CRIE UM NOVO SITE MODERNISTA: ${prompt}`
                    }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();
        let html = data.choices[0].message.content.trim();
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
}