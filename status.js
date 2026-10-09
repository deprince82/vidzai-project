export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });
  const key = process.env.RUNWAYML_API_SECRET;
  if (!key) return res.status(500).json({ error: "Runway API key is not configured on Vercel." });
  const id = req.query?.id;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(id)) return res.status(400).json({ error: "A valid task ID is required." });
  try {
    const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(id)}`, {
      headers: { "Authorization": `Bearer ${key}`, "X-Runway-Version": "2024-11-06" }
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: data.error || data.message || "Task status request failed.", details: data });
    return res.status(200).json(data);
  } catch { return res.status(502).json({ error: "Could not connect to Runway." }); }
}
