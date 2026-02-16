export const config = { runtime: 'edge' };

export default async function handler(req) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const { prompt, existingCode } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) return new Response(JSON.stringify({ error: "Chave não configurada." }), { status: 500 });

        // INSTRUÇÃO MESTRA PARA EVITAR ERROS
        const systemInstruction = `Você é o SYNTHETIX AI ARCHITECT, uma inteligência de elite em desenvolvimento web.
        REGRAS DE OURO:
        1. Responda APENAS com código HTML/Tailwind CSS puro. Nunca use markdown (ex: \`\`\`html).
        2. Use Tailwind CSS via CDN e fontes Google Fonts.
        3. Se houver CÓDIGO ATUAL, você deve agir de forma INCREMENTAL. Não mude o que não foi pedido. Mantenha a identidade visual.
        4. Se o usuário pedir uma mudança, localize a parte exata no código e a modifique cirurgicamente.
        5. Todo código deve ser 100% responsivo (mobile-first).
        6. Garanta que botões e links tenham estados de hover e transições suaves.
        7. Se o pedido for vago, interprete-o da forma mais profissional e moderna possível.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Modelo mais inteligente para entender prompts complexos
                messages: [
                    { role: "system", content: systemInstruction },
                    { 
                        role: "user", 
                        content: existingCode 
                            ? `ESTE É O CÓDIGO ATUAL:\n${existingCode}\n\nINSTRUÇÃO DO USUÁRIO PARA ALTERAÇÃO:\n${prompt}\n\nRetorne o código completo atualizado.`
                            : `CRIE UM NOVO SITE DO ZERO COM ESTA DESCRIÇÃO: ${prompt}`
                    }
                ],
                temperature: 0.2 // Menor temperatura = menos "invenção" e mais precisão técnica
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let html = data.choices[0].message.content;
        // Limpeza rigorosa de qualquer sobra de texto/markdown
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}