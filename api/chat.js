export default async function handler(req, res) {
  const allowedOrigins = new Set([
    "https://anonymoussubmission325.github.io",
    "https://glance-rho-five.vercel.app"
  ]);

  const origin = req.headers.origin;
  if (allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY missing",
        vercel_url: process.env.VERCEL_URL || null,
        host: req.headers.host || null
      });
    }

    const { messages, model, temperature, max_tokens } = req.body || {};

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const text = await response.text();

    return res.status(response.status).send(text);
  } catch (err) {
    return res.status(500).json({
      error: String(err),
      vercel_url: process.env.VERCEL_URL || null,
      host: req.headers.host || null
    });
  }
}