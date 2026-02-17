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

        // PROMPT TREINADO COM O VISUAL "BASE44"
        const systemInstruction = `
        Você é o Base44 AI Engine.
        Sua missão é criar Landing Pages de altíssima conversão com design moderno.
        
        --- REGRAS VISUAIS (DESIGN SYSTEM) ---
        1. SE O USUÁRIO PEDIR "SITE ROXO" OU "TRANSFORME IDEIAS", USE ESTE PADRÃO EXATO:
           - Fundo: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800'.
           - Texto: Branco puro.
           - Botões: Brancos com texto roxo (Pílula).
           - Título: 'TRANSFORME SUAS IDEIAS EM REALIDADE' (em caixa alta, font-extrabold).
        
        --- EXEMPLO DE CÓDIGO PERFEITO (USE COMO BASE) ---
        <div class="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white font-sans">
            <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">TRANSFORME SUAS<br>IDEIAS EM REALIDADE</h1>
            <p class="text-lg md:text-xl opacity-90 max-w-2xl mb-10 font-medium">Plataforma completa para criar, gerenciar e escalar seus projetos com ferramentas intuitivas e inteligência artificial de ponta.</p>
            <div class="flex flex-col sm:flex-row gap-4 mb-16">
                <button class="bg-white text-purple-700 px-8 py-4 rounded-full font-bold text-sm hover:scale-105 transition shadow-xl">Começar gratuitamente</button>
                <button class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/10 transition">Saiba mais</button>
            </div>
            <div class="flex gap-12 text-center">
                <div><div class="text-3xl font-bold">10k+</div><div class="text-xs uppercase tracking-widest opacity-70">Usuários</div></div>
                <div><div class="text-3xl font-bold">99.9%</div><div class="text-xs uppercase tracking-widest opacity-70">Uptime</div></div>
                <div><div class="text-3xl font-bold">4.9★</div><div class="text-xs uppercase tracking-widest opacity-70">Rating</div></div>
            </div>
        </div>

        --- INSTRUÇÕES GERAIS ---
        1. Retorne APENAS o código HTML.
        2. Use Tailwind CSS via CDN.
        3. Se o usuário pedir outra coisa, mantenha o padrão de qualidade: Fontes grandes, Botões arredondados, Gradientes suaves.
        `;

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
                            : `CRIE UM SITE: ${prompt}`
                    }
                ],
                temperature: 0.1 // Baixa temperatura para ele copiar fielmente o exemplo
            })
        });

        const data = await response.json();
        let html = data.choices[0].message.content.trim();
        html = html.replace(/```html/g, '').replace(/```/g, '').trim();

        return new Response(JSON.stringify({ html }), { status: 200, headers });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}