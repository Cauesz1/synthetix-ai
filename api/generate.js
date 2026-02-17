export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, existingCode } = req.body;

  try {
    const systemPrompt = `
Você é uma IA arquiteta full-stack chamada SYNTHETIX V7.

REGRAS ABSOLUTAS:
- Sempre retornar HTML completo
- Incluir <html>, <head>, <body>
- Código moderno
- Responsivo
- Visual premium
- Sem explicações
- Sem markdown
- Apenas código puro

Se existir código anterior, você deve melhorar ou modificar mantendo estrutura.
`;

    const userPrompt = existingCode
      ? `
CÓDIGO ATUAL:
${existingCode}

MODIFICAÇÃO SOLICITADA:
${prompt}

Atualize o código completo mantendo funcionalidades anteriores.
`
      : `
Crie um site completo com base na seguinte descrição:

${prompt}

O site deve:
- Ter design moderno
- Ser responsivo
- Ter animações suaves
- Usar CSS interno
- Usar JS interno
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const html = data.choices[0].message.content;

    res.status(200).json({ html });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar site." });
  }
}
