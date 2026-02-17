export const config = { runtime: 'edge' };

export default async function handler(req) {
    // 1. Configuração de Segurança (CORS) para permitir que o site fale com a API
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Responde a verificações de pré-voo do navegador
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    // Só aceita método POST (envio de dados)
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: "Apenas POST permitido" }), { status: 405, headers });

    try {
        // 2. Recebe os dados do Front-end
        const { prompt, existingCode } = await req.json();
        
        // Pega a chave da API das variáveis de ambiente (Vercel)
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Chave da API não configurada no servidor." }), { status: 500, headers });
        }

        // 3. O "Cérebro" da Engenharia (Prompt do Sistema)
        // Aqui definimos como a IA deve se comportar.
        const systemInstruction = `
        VOCÊ É O "SYNTHETIX ENGINE". Um Arquiteto de Software Full-Stack.
        
        SUA MISSÃO:
        Gerar interfaces web modernas, responsivas e bonitas baseadas no pedido do usuário.
        
        REGRAS VISUAIS (DESIGN SYSTEM - ZENITH):
        - Estilo: Dark Mode, Futurista, Clean.
        - Cores: Fundo #050505, Detalhes em Roxo (#7c3aed) e Branco.
        - Componentes: Use Tailwind CSS para tudo. Cards com efeito de vidro (bg-white/5 backdrop-blur).
        - Fontes: Sans-serif (Inter) para leitura, Display (Space Grotesk) para títulos.
        
        INSTRUÇÕES TÉCNICAS:
        1. Retorne APENAS o código HTML completo (<!DOCTYPE html>...). NADA DE MARKDOWN.
        2. O código deve ser único e funcional (HTML + CSS no <head> + JS no <body> se precisar).
        3. Se o usuário pedir para editar, mantenha o estilo Zenith.
        4. Use ícones FontAwesome (CDN) e imagens via Unsplash (source.unsplash.com).
        
        EXEMPLO DE RESPOSTA ESPERADA (Estrutura):
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <script src="https://cdn.tailwindcss.com"></script>
            </head>
        <body class="bg-[#050505] text-white">
            </body>
        </html>
        `;

        // 4. Chama a OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Modelo rápido e inteligente
                messages: [
                    { role: "system", content: systemInstruction },
                    { 
                        role: "user", 
                        content: existingCode 
                            ? `CÓDIGO ATUAL:\n${existingCode}\n\nALTERAÇÃO SOLICITADA:\n${prompt}`
                            : `CRIE UM NOVO PROJETO: ${prompt}`
                    }
                ],
                temperature: 0.2 // Criatividade baixa para seguir regras estritas
            })
        });

        const data = await response.json();

        // Tratamento de erro da OpenAI
        if (data.error) {
            throw new Error(data.error.message);
        }

        // 5. Limpa e envia o HTML de volta
        let html = data.choices[0].message.content.trim();
        // Remove crases de markdown se a IA colocar sem querer
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Erro no servidor: " + error.message }), { status: 500, headers });
    }
}