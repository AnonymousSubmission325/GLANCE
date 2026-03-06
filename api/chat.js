export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://anonymoussubmission325.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY missing" });

  try {
    const { messages, model, temperature, max_tokens } = req.body || {};

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "gpt-4.1-mini",
        messages: messages || [],
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 800
      })
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}