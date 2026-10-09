export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const key = process.env.RUNWAYML_API_SECRET;
  if (!key) return res.status(500).json({ error: "Runway API key is not configured on Vercel." });
  const { prompt, ratio = "720:1280", duration = 5 } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Enter a prompt." });
  if (prompt.length > 1500) return res.status(400).json({ error: "Prompt is too long (max 1500 characters)." });
  if (![5,10].includes(Number(duration))) return res.status(400).json({ error: "Choose 5 or 10 seconds." });
  if (!["720:1280","1280:720","960:960"].includes(ratio)) return res.status(400).json({ error: "Unsupported ratio." });
  try {
    const r = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "X-Runway-Version": "2024-11-06", "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gen4.5", promptText: prompt.trim(), ratio, duration: Number(duration) })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error || data.message || "Runway request failed.", details: data });
    return res.status(200).json(data);
  } catch { return res.status(502).json({ error: "Could not connect to Runway." }); }
}
