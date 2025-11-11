const { App } = require("@slack/bolt");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Load responses from JSON
function loadResponses() {
  const responsesPath = path.join(__dirname, "responses.json");
  const data = fs.readFileSync(responsesPath, "utf-8");
  return JSON.parse(data).responses;
}

// Get random response
function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

// Listen for mentions
app.message(async ({ message, say, client }) => {
  // Check if the message mentions the bot or is a reply to the bot
  const isMentioningBot =
    message.text && message.text.includes("<@" + (await app.client.auth.test()).user_id + ">");
  
  if (isMentioningBot || message.thread_ts) {
    try {
      const responses = loadResponses();
      const reply = getRandomResponse(responses);

      // Reply in thread
      await client.chat.postMessage({
        channel: message.channel,
        thread_ts: message.thread_ts || message.ts,
        text: reply,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
});

// Start the app
(async () => {
  await app.start();
  console.log("fredrick is running!");
})();
