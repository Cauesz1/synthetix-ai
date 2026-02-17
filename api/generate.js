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

        // --- SYNTHETIX ENGINE V5 SYSTEM PROMPT ---
        const systemInstruction = `
        VOCÊ É O "SYNTHETIX ENGINE V5". Um Arquiteto Full-Stack AI especializado em interfaces "Zenith" (Dark, Neon, Glass).
        
        SUA MISSÃO:
        Simular a criação de um App Web completo que inclua visualmente:
        1. Entidades (Banco de Dados): Mostre tabelas ou listas de dados.
        2. Agentes de IA: Mostre botões como "Gerar com IA" ou "Analisar".
        3. Autenticação: Simule que o usuário (Admin) já está logado.
        
        REGRAS VISUAIS (ESTILO ZENITH):
        - Fundo: SEMPRE use 'bg-[#050505]' (Dark Absoluto).
        - Acentos: Use 'text-[#7c3aed]' (Roxo) e 'border-white/10'.
        - Glassmorphism: 'bg-[#1a1a1a]/80 backdrop-blur-md'.
        - Fontes: Inter (Corpo) e Space Grotesk (Títulos).
        
        MODELO DE CÓDIGO (DASHBOARD EXEMPLO):
        <div class="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
            <aside class="w-64 border-r border-white/10 bg-[#0a0a0a] p-6 flex flex-col">
                <div class="text-2xl font-display font-bold mb-10 tracking-widest">SYN<span class="text-[#7c3aed]">OS</span></div>
                <nav class="space-y-2 flex-1">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Entidades (DB)</div>
                    <a href="#" class="block p-3 bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 rounded-xl font-medium">Dashboard</a>
                    <a href="#" class="block p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Usuários</a>
                    <a href="#" class="block p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Relatórios</a>
                </nav>
                <div class="p-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-purple-900">
                    <div class="text-[10px] font-bold uppercase opacity-80 mb-1">AI Agent</div>
                    <div class="text-sm font-bold">Online & Active</div>
                </div>
            </aside>
            <main class="flex-1 p-10 overflow-y-auto">
                <header class="flex justify-between items-center mb-10">
                    <div>
                        <h1 class="text-3xl font-display font-bold">Visão Geral</h1>
                        <p class="text-gray-500 text-sm">Dados sincronizados em tempo real.</p>
                    </div>
                    <button class="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <i class="fas fa-magic mr-2"></i> Invoke LLM
                    </button>
                </header>
                <div class="grid grid-cols-3 gap-6">
                    <div class="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#7c3aed]/50 transition duration-500 group">
                        <div class="text-gray-500 text-xs uppercase tracking-widest mb-2">Total Receita</div>
                        <div class="text-4xl font-display font-bold group-hover:text-[#7c3aed] transition">$124k</div>
                    </div>
                     <div class="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#7c3aed]/50 transition duration-500 group">
                        <div class="text-gray-500 text-xs uppercase tracking-widest mb-2">Novos Usuários</div>
                        <div class="text-4xl font-display font-bold group-hover:text-[#7c3aed] transition">+1,200</div>
                    </div>
                     <div class="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#7c3aed]/50 transition duration-500 group">
                        <div class="text-gray-500 text-xs uppercase tracking-widest mb-2">AI Requests</div>
                        <div class="text-4xl font-display font-bold group-hover:text-[#7c3aed] transition">850/s</div>
                    </div>
                </div>
            </main>
        </div>

        INSTRUÇÃO DE EXECUÇÃO:
        1. Se for novo projeto, crie um layout completo (Sidebar + Content).
        2. Se for edição, mantenha o estilo Dark/Synthetix.
        3. Retorne APENAS HTML.
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
                            ? `CONTEXTO:\n${existingCode}\n\nALTERAÇÃO:\n${prompt}`
                            : `CRIE UM APP COM BASE NISTO: ${prompt}`
                    }
                ],
                temperature: 0.2
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