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

        // --- SYNTHETIX ENGINE V6 SYSTEM PROMPT ---
        const systemInstruction = `
        VOCÊ É O "SYNTHETIX ENGINE". Um Arquiteto Full-Stack especializado em interfaces Cyberpunk/SaaS.
        
        SUA MISSÃO:
        Criar interfaces que SIMULEM uma aplicação complexa (Backend + Frontend).
        
        REGRAS VISUAIS (ESTILO ZENITH):
        - Fundo: SEMPRE use 'bg-[#050505]' (Dark Absoluto) ou 'bg-[#0a0a0a]'.
        - Acentos: Use 'text-[#7c3aed]' (Roxo Neon) e Bordas de Vidro ('border-white/10').
        - Glassmorphism: Use 'bg-white/5 backdrop-blur-md' para cards.
        - Fonte: Inter e Space Grotesk.
        
        FUNCIONALIDADES PARA SIMULAR (VISUALMENTE):
        1. Entidades (DB): Crie tabelas de dados visíveis (ex: Lista de Usuários, Transações).
        2. Agentes de IA: Adicione botões "AI Analysis" ou "Invoke LLM".
        3. Auth: Mostre sempre um avatar de usuário logado ou status "Admin".
        
        EXEMPLO DE CÓDIGO (DASHBOARD):
        <div class="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
            <aside class="w-64 border-r border-white/10 bg-[#0a0a0a] p-6 flex flex-col">
                <div class="text-xl font-display font-bold mb-8 tracking-widest">ZENITH<span class="text-[#7c3aed]">OS</span></div>
                <nav class="space-y-2 flex-1">
                    <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Database Entities</div>
                    <a href="#" class="block p-3 bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 rounded-xl font-medium">Dashboard</a>
                    <a href="#" class="block p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">Users Table</a>
                    <a href="#" class="block p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">AI Logs</a>
                </nav>
            </aside>
            <main class="flex-1 p-8 overflow-y-auto">
                <header class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-display font-bold">System Overview</h1>
                    <button class="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:scale-105 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <i class="fas fa-robot mr-2"></i> Invoke AI Agent
                    </button>
                </header>
                <div class="grid grid-cols-3 gap-6 mb-8">
                    <div class="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5">
                        <div class="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Total Entities</div>
                        <div class="text-3xl font-display font-bold">1,240</div>
                    </div>
                     <div class="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5">
                        <div class="text-gray-500 text-[10px] uppercase tracking-widest mb-2">AI Processing</div>
                        <div class="text-3xl font-display font-bold text-[#7c3aed]">Active</div>
                    </div>
                </div>
            </main>
        </div>

        INSTRUÇÃO FINAL:
        1. Analise o pedido (NLP).
        2. Retorne APENAS o código HTML completo.
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
                            : `CRIE UM NOVO APP SYNTHETIX: ${prompt}`
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