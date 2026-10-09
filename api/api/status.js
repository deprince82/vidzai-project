module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Use GET to check video status."
    });
  }

  const key = process.env.RUNWAYML_API_SECRET;

  if (!key) {
    return res.status(500).json({
      error: "Runway API key is missing."
    });
  }

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      error: "Video task ID is missing."
    });
  }

  try {
    const response = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
          "X-Runway-Version": "2024-11-06"
        }
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Unexpected response from Runway."
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data.message || "Could not check video status."
      });
    }

    return res.status(200).json({
      status: data.status,
      url: data.output?.[0] || null
    });
  } catch (error) {
    return res.status(500).json({
