const { getTimeUntilNextThreeHour } = require("../lib/scheduler");

async function sendPingMessage(app) {
  try {
    const startTime = Date.now();
    await app.client.auth.test();
    const ping = Date.now() - startTime;

    await app.client.chat.postMessage({
      channel: "C09BQEC01FZ",
      text: `boop! i am fredrick, and my ping is ${ping}ms!`,
    });
  } catch (error) {
    console.error("Error sending ping message:", error.message);
  }
}

function schedulePingMessages(app) {
  const timeUntilNext = getTimeUntilNextThreeHour();
  setTimeout(() => {
    sendPingMessage(app);
    setInterval(() => sendPingMessage(app), 3 * 60 * 60 * 1000);
  }, timeUntilNext);

  console.log(`Next ping message in ${Math.round(timeUntilNext / 1000)} seconds`);
}

module.exports = { sendPingMessage, schedulePingMessages };
