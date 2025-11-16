const fs = require("fs");
const path = require("path");

// Cache prompt in memory to avoid repeated disk reads
let cachedPrompt = null;

function loadPrompt() {
  if (cachedPrompt !== null) {
    return cachedPrompt;
  }
  
  try {
    const promptPath = path.join(__dirname, "../prompt.txt");
    cachedPrompt = fs.readFileSync(promptPath, "utf-8");
    return cachedPrompt;
  } catch (error) {
    console.error("Error loading prompt:", error.message);
    cachedPrompt = "You are a helpful slack bot.";
    return cachedPrompt;
  }
}

async function getAIResponse(userMessage, threadContext = "", senderInfo = null) {
  try {
    const systemPrompt = loadPrompt();

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Add thread context if provided
    if (threadContext) {
      messages.push({
        role: "user",
        content: `Thread context:\n${threadContext}`,
      });
    }

    // Add sender info if provided
    let finalMessage = userMessage;
    if (senderInfo) {
      finalMessage = `${senderInfo.display_name}: ${userMessage}`;
    }

    messages.push({
      role: "user",
      content: finalMessage,
    });

    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        messages: messages,
      }),
    });

    console.log("AI API status:", response.status);
    console.log("AI API statusText:", response.statusText);

    if (!response.ok) {
      console.error("AI API error:", response.status, response.statusText);
      return "server is sleeping";
    }

    const data = await response.json();

    console.log("AI API response:", JSON.stringify(data));

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("No message in response. Full response:", data);
      return "idk what to say";
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling AI API:", error.message);
    console.error(error);
    return "something broke";
  }
}

module.exports = { getAIResponse };
