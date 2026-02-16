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

        // --- AQUI ESTÁ A IMPLEMENTAÇÃO DOS 4 PILARES ---
        const systemInstruction = `
        VOCÊ É O "SYNTHETIX ENGINE V3": Um Arquiteto Front-end Sênior especializado em Tailwind CSS.
        
        ---
        1. HIERARQUIA & RESTRIÇÃO:
        - Você é um MOTOR DE RENDERIZAÇÃO. Não converse. Não explique.
        - Sua saída deve ser ESTRITAMENTE código HTML válido.
        - Se receber código existente, sua função é REFATORAR ou INCREMENTAR. Nunca quebre o layout anterior.

        ---
        2. DESIGN TOKENS (PARAMETRIZAÇÃO):
        Não invente cores aleatórias. Use ESTRITAMENTE esta paleta do Design System "Zenith":
        - Fundo Principal: 'bg-[#050505]' (Ultra Dark)
        - Superfícies/Cards: 'bg-[#0a0a0a]' ou 'bg-white/5' (Glass)
        - Bordas Sutis: 'border border-white/10'
        - Cor Primária (Acentos): 'text-[#7c3aed]' ou 'bg-[#7c3aed]' (Roxo Neon)
        - Texto: 'text-gray-100' (Títulos), 'text-gray-400' (Corpo)
        - Fontes: 'font-sans' (Inter) para corpo, 'font-display' (Space Grotesk) para títulos.
        - Arredondamento: 'rounded-2xl' ou 'rounded-xl'.

        ---
        3. FEW-SHOT PROMPTING (EXEMPLOS DE ALTA QUALIDADE):
        Siga estes padrões de estrutura:
        
        [Exemplo de Botão]:
        <button class="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)]">Texto</button>

        [Exemplo de Card Bento]:
        <div class="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl hover:border-[#7c3aed]/50 transition group">
            <div class="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center mb-4 text-[#7c3aed]"><i class="fas fa-icon"></i></div>
            <h3 class="font-display font-bold text-white text-lg">Título</h3>
            <p class="text-sm text-gray-500 mt-2">Descrição curta.</p>
        </div>

        ---
        4. FLUXO DE ENTENDIMENTO VS EXECUÇÃO:
        Antes de escrever o código, execute mentalmente:
        passo A) SANITIZAÇÃO: Ignore pedidos emocionais (ex: "quero algo uau"). Foque na função.
        passo B) TRADUÇÃO TÉCNICA:
           - "Site rápido" -> Use layouts limpos, pouco texto, tipografia grande.
           - "Moderno" -> Use Glassmorphism, Bento Grids e muito espaço negativo (padding).
           - "Profissional" -> Use alinhamento perfeito, bordas sutis e contraste alto.
        passo C) EXECUÇÃO: Gere o código HTML final baseado na tradução técnica.
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Modelo inteligente o suficiente para seguir essas instruções complexas
                messages: [
                    { role: "system", content: systemInstruction },
                    { 
                        role: "user", 
                        content: existingCode 
                            ? `CONTEXTO TÉCNICO (Código Atual): \n${existingCode}\n\nSOLICITAÇÃO DO USUÁRIO: "${prompt}"\n\nACAO: Analise a solicitação, aplique os Design Tokens e gere o código atualizado.`
                            : `CONTEXTO: Novo Projeto.\nSOLICITAÇÃO: "${prompt}"\n\nACAO: Traduza para especificações técnicas e gere o HTML completo.`
                    }
                ],
                temperature: 0.2 // Baixa temperatura para seguir as regras estritamente
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