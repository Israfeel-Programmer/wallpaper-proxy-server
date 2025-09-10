import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// IMPORTANT: Your API key is now securely accessed from environment variables.
// Do NOT paste your key here. You will set it up in your hosting provider's dashboard.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/generate", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key is not configured on the server." });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // Updated to the correct, high-quality DALL-E 3 model
        model: "dall-e-3", 
        prompt: prompt,
        n: 1, // Generate one image
        size: "1024x1792", // A great size for phone wallpapers
        quality: "standard", // Use "hd" for higher quality if needed
      }),
    });

    const data = await response.json();

    if (response.status !== 200 || !data.data || !data.data[0].url) {
      console.error("Error from OpenAI:", data);
      return res.status(500).json({ error: "Failed to get a valid response from OpenAI." });
    }

    res.json({ url: data.data[0].url });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Failed to generate image due to a server error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
