export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Você é um gerador profissional de sites.
Retorne apenas HTML completo com CSS e JS embutidos.
Código limpo, moderno e responsivo.
Sem explicações.
            `
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    res.status(200).json({
      code: data.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar site." });
  }
}
