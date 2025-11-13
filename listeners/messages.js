const { getAIResponse } = require("../lib/ai");

function registerMessageListener(app) {
  app.message(async ({ message, client, body }) => {
    console.log("Message received:", message.text);

    const botUserId = body.authorizations[0].user_id;
    const hasMention = message.text && message.text.includes("<@" + botUserId + ">");
    const hasFredrick = message.text && message.text.toLowerCase().includes("fredrick");

    console.log("Has mention:", hasMention, "Has fredrick:", hasFredrick);

    if (hasMention || hasFredrick) {
      try {
        const reply = await getAIResponse(message.text);

        console.log("Sending reply:", reply);
        const result = await client.chat.postMessage({
          channel: message.channel,
          thread_ts: message.thread_ts || message.ts,
          text: reply,
        });
        console.log("Message sent successfully:", result);
      } catch (error) {
        console.error("Error sending message:", error.message);
        console.error(error);
      }
    }
  });
}

module.exports = { registerMessageListener };
