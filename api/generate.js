export const config = { runtime: 'edge' };

export default async function handler(req) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const { prompt, existingCode } = await req.json();
        const apiKey = process.env.OPENAI_API_KEY;

        const systemInstruction = `Você é o SYNTHETIX ARCHITECT PRO, um sistema de codificação de precisão militar.
        
        SUA MISSÃO:
        1. Gerar apenas código HTML5/Tailwind CSS 100% funcional.
        2. Se houver CÓDIGO ATUAL, você deve EDITAR e não substituir tudo por algo genérico.
        3. NUNCA use markdown (\`\`\`). Retorne apenas o texto puro do código.
        4. Verifique se todas as tags (div, section, main) estão fechadas. Tag aberta = erro, e você não comete erros.
        5. Use bibliotecas estáveis: Tailwind via CDN, FontAwesome 6.0 e Google Fonts.
        
        REGRAS DE DESIGN PROFISSIONAL:
        - Mobile-First: O site DEVE ser perfeito no celular.
        - Estética: Use Dark Mode por padrão, com acentos em Roxo (#7c3aed).
        - Interatividade: Todo botão deve ter 'transition-all duration-300 hover:scale-105'.
        
        Se o usuário pedir algo impossível, adapte para a solução técnica mais elegante possível.
        RETORNE SEMPRE O DOCUMENTO COMPLETO (do <!DOCTYPE html> ao </html>).`;

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
                            ? `CONTEXTO ATUAL:\n${existingCode}\n\nNOVA ORDEM: ${prompt}\n\nAtualize o código mantendo o que já existe e aplicando a nova ordem.`
                            : `CRIE UM SITE DO ZERO: ${prompt}`
                    }
                ],
                temperature: 0.1 // Quase zero para evitar que a IA "invente" coisas erradas
            })
        });

        const data = await response.json();
        let html = data.choices[0].message.content.trim();
        
        // Limpeza de segurança extra
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Erro de Sincronia Neural" }), { status: 500 });
    }
}