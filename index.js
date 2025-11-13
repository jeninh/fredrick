const { App } = require("@slack/bolt");
require("dotenv").config();

const { registerChannelCommand } = require("./commands/channel");
const { registerMessageListener } = require("./listeners/messages");
const { checkForNewCommits } = require("./features/commits");
const { sendPingMessage, schedulePingMessages } = require("./features/ping");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

registerChannelCommand(app);
registerMessageListener(app);

(async () => {
  await app.start();
  console.log("fredrick is running!");

  await sendPingMessage(app);
  schedulePingMessages(app);

  await checkForNewCommits(app);
  setInterval(() => checkForNewCommits(app), 3 * 60 * 1000);
})();
