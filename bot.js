const { App } = require("@slack/bolt");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
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

// Load statuses from JSON
function loadStatuses() {
  const statusPath = path.join(__dirname, "status.json");
  const data = fs.readFileSync(statusPath, "utf-8");
  return JSON.parse(data).statuses;
}

// Get random status
function getRandomStatus(statuses) {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Get latest commit hash with full details from GitHub
async function getLatestCommit() {
  try {
    const response = await fetch("https://api.github.com/repos/jeninh/fredrick/commits?per_page=1");
    const data = await response.json();
    
    if (!data || data.length === 0) {
      return { hash: "unknown", message: "unknown", author: "unknown" };
    }
    
    const commit = data[0];
    const hash = commit.sha.substring(0, 7);
    const message = commit.commit.message.split("\n")[0];
    const author = commit.commit.author.name;
    
    return { hash, message, author };
  } catch (error) {
    console.error("Error getting commit info from GitHub:", error.message);
    return { hash: "unknown", message: "unknown", author: "unknown" };
  }
}

// Load last commit from file
function loadLastCommit() {
  try {
    const path2 = path.join(__dirname, "last_commit.json");
    const data = fs.readFileSync(path2, "utf-8");
    return JSON.parse(data).hash;
  } catch (error) {
    return "";
  }
}

// Save last commit to file
function saveLastCommit(hash) {
  try {
    const path2 = path.join(__dirname, "last_commit.json");
    fs.writeFileSync(path2, JSON.stringify({ hash }, null, 2));
  } catch (error) {
    console.error("Error saving last commit:", error.message);
  }
}

// Handle /fredrickchannel command
app.command("/fredrickchannel", async ({ command, ack, respond, client }) => {
  await ack();
  
  const userId = command.user_id;
  const authorizedUser = "U0926UASBJ7";
  
  if (userId !== authorizedUser) {
    await respond({
      text: "you're not authorized to use this command",
      response_type: "ephemeral",
    });
    return;
  }
  
  const text = command.text || "";
  
  try {
    // Get user profile info
    const userInfo = await client.users.info({ user: userId });
    const username = userInfo.user.real_name;
    const profilePic = userInfo.user.profile.image_72;
    
    await client.chat.postMessage({
      channel: command.channel_id,
      text: `<!channel|channel> ${text}`,
      username: username,
      icon_url: profilePic,
    });
  } catch (error) {
    console.error("Error posting channel message:", error.message);
    await respond({
      text: "error posting message",
      response_type: "ephemeral",
    });
  }
});

// Listen for messages
app.message(async ({ message, client, body }) => {
  console.log("Message received:", message.text);
  
  // Check if message mentions the bot or contains "fredrick"
  const botUserId = body.authorizations[0].user_id;
  const hasMention = message.text && message.text.includes("<@" + botUserId + ">");
  const hasFredrick = message.text && message.text.toLowerCase().includes("fredrick");
  
  console.log("Has mention:", hasMention, "Has fredrick:", hasFredrick);
  
  if (hasMention || hasFredrick) {
    try {
      const responses = loadResponses();
      const reply = getRandomResponse(responses);

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

// Check for new commits and send message
async function checkForNewCommits() {
  try {
    const lastCommitHash = loadLastCommit();
    const { hash, message, author } = await getLatestCommit();
    
    console.log("Last commit:", lastCommitHash);
    console.log("Current commit:", hash);
    
    if (hash !== lastCommitHash && hash !== "unknown") {
      // New commit found
      const channelId = "C0978HUQ36X";
      const statuses = loadStatuses();
      const randomStatus = getRandomStatus(statuses);
      
      try {
        const result = await app.client.chat.postMessage({
          channel: channelId,
          text: `${randomStatus} <https://github.com/jeninh/fredrick/commit/${hash}|${hash}>`,
        });
        console.log("Commit notification sent:", hash, result);
        saveLastCommit(hash);
      } catch (msgError) {
        console.error("Error posting message:", msgError.message);
        console.error(msgError);
      }
    }
  } catch (error) {
    console.error("Error checking for commits:", error.message);
  }
}

// Start the app
(async () => {
  await app.start();
  console.log("fredrick is running!");
  
  // Send startup message
  try {
    const startTime = Date.now();
    await app.client.auth.test();
    const ping = Date.now() - startTime;
    
    await app.client.chat.postMessage({
      channel: "C09BQEC01FZ",
      text: `boop! i am fredrick, and my ping is ${ping}ms!`,
    });
  } catch (error) {
    console.error("Error sending startup message:", error.message);
  }
  
  // Check for new commits immediately on startup
  await checkForNewCommits();
  
  // Then check every 3 minutes
  setInterval(checkForNewCommits, 3 * 60 * 1000);
})();
