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

        // --- SISTEMA DE ENGENHARIA "SYNTHETIX V4" ---
        const systemInstruction = `
        VOCÊ É O "SYNTHETIX ENGINE V4".
        Sua função não é apenas escrever código, mas compilar interfaces baseadas em INTENÇÃO e COMPONENTES.
        
        --- ETAPA 1: NLP & SEGMENTAÇÃO ---
        Analise o pedido do usuário. Identifique:
        - Nicho (ex: SaaS, Automotivo, Portfolio).
        - Tom de Voz (ex: Luxuoso, Técnico, Minimalista).
        - Objetivo (ex: Conversão, Showcase).

        --- ETAPA 2: SISTEMA DE DESIGN (TOKENS) ---
        Aplique RIGOROSAMENTE estes tokens visuais. Não invente cores fora da paleta.
        - Background: 'bg-[#050505]' (Absoluto Dark).
        - Surface: 'bg-[#0a0a0a]' ou 'bg-white/5' (Vidro).
        - Primary: 'text-[#7c3aed]' ou 'bg-[#7c3aed]' (Roxo Zenith).
        - Typography: 'font-sans' (Inter) e 'font-display' (Space Grotesk).
        - Spacing: Margens amplas (py-24, gap-8). O layout deve respirar.

        --- ETAPA 3: MONTAGEM DE COMPONENTES (BIBLIOTECA VIRTUAL) ---
        Use estas estruturas HTML de alta qualidade como base. Preencha com Copywriting persuasivo.

        [Comp: Hero Section Premium]
        <section class="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-[#050505]">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#7c3aed]/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md animate-fade-in-up">
                <span class="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse"></span>
                <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">System Online</span>
            </div>
            <h1 class="text-5xl md:text-8xl font-display font-bold mb-6 tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 max-w-4xl mx-auto">[INSERIR TÍTULO DE IMPACTO]</h1>
            <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">[INSERIR SUBTÍTULO PERSUASIVO]</p>
            <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button class="bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-sm hover:scale-105 transition duration-300 shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)]">[CTA PRIMÁRIO]</button>
                <button class="px-8 py-4 rounded-xl font-bold text-sm border border-white/10 hover:bg-white/5 transition text-white">[CTA SECUNDÁRIO]</button>
            </div>
        </section>

        [Comp: Bento Grid Features]
        <section class="py-24 px-6 bg-[#050505]">
            <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="md:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 hover:border-[#7c3aed]/30 transition duration-500 group relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div class="relative z-10">
                        <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-[#7c3aed]"><i class="fas fa-layer-group"></i></div>
                        <h3 class="text-2xl font-display font-bold text-white mb-2">[FEATURE PRINCIPAL]</h3>
                        <p class="text-gray-500 text-sm leading-relaxed">[DESCRIÇÃO TÉCNICA DETALHADA]</p>
                    </div>
                </div>
                <div class="bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 flex flex-col justify-center hover:bg-white/5 transition duration-500">
                    <h3 class="text-4xl font-bold text-[#7c3aed] mb-1">[DADO ESTATÍSTICO]</h3>
                    <p class="text-xs font-mono uppercase tracking-widest text-gray-500">[LEGENDA]</p>
                </div>
            </div>
        </section>

        --- EXECUÇÃO FINAL ---
        1. Retorne APENAS o código HTML completo.
        2. Mantenha o código existente se solicitado, mas aplique os Tokens de Design.
        3. O site DEVE ser responsivo e seguir a estética "Base44" (Dark, Clean, Tech).
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
                            ? `CONTEXTO TÉCNICO:\n${existingCode}\n\nSOLICITAÇÃO (NLP): "${prompt}"\n\nACAO: Analise a intenção, selecione componentes da biblioteca e monte o código.`
                            : `CONTEXTO: Novo Projeto.\nSOLICITAÇÃO (NLP): "${prompt}"\n\nACAO: Extraia o nicho/tom, aplique os Tokens e gere o HTML.`
                    }
                ],
                temperature: 0.2
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