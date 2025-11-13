const fs = require("fs");
const path = require("path");

function loadPrompt() {
  try {
    const promptPath = path.join(__dirname, "../prompt.txt");
    return fs.readFileSync(promptPath, "utf-8");
  } catch (error) {
    console.error("Error loading prompt:", error.message);
    return "You are a helpful slack bot.";
  }
}

async function getAIResponse(userMessage) {
  try {
    const systemPrompt = loadPrompt();

    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.message) {
      return "idk what to say";
    }

    return data.message;
  } catch (error) {
    console.error("Error calling AI API:", error.message);
    return "something broke";
  }
}

module.exports = { getAIResponse };
