module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Use POST to generate a video."
    });
  }

  const key = process.env.RUNWAYML_API_SECRET;

  if (!key) {
    return res.status(500).json({
      error: "Runway API key is missing. Check Vercel Environment Variables."
    });
  }

  try {
    const { prompt, duration = 5, ratio = "9:16" } = req.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter a video description."
      });
    }

    if (![5, 10].includes(Number(duration))) {
      return res.status(400).json({
        error: "Choose 5 or 10 seconds."
      });
    }

    const ratios = {
      "16:9": "1280:720",
      "9:16": "720:1280",
      "1:1": "960:960"
    };

    if (!ratios[ratio]) {
      return res.status(400).json({
        error: "Choose a supported aspect ratio."
      });
    }

    const response = await fetch(
      "https://api.dev.runwayml.com/v1/image_to_video",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "X-Runway-Version": "2024-11-06",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gen4.5",
          promptText: prompt.trim(),
          ratio: ratios[ratio],
          duration: Number(duration)
        })
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Runway returned an unexpected response.",
        details: text.slice(0, 300)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data.message || "Runway rejected the request.",
        details: data
      });
    }

    if (!data.id) {
      return res.status(502).json({
        error: "Runway did not return a task ID.",
        details: data
      });
    }

    return res.status(200).json({
      id: data.id
    });
  } catch (error) {
    return res.status(500).json({
      error: "Could not connect to Runway.",
      details: error.message
    });
  }
};
