const { getLatestCommit } = require("../lib/github");
const { loadLastCommit, saveLastCommit, loadStatuses, getRandomStatus } = require("../lib/storage");

async function checkForNewCommits(app) {
  try {
    const lastCommitHash = loadLastCommit();
    const { hash, message, author } = await getLatestCommit();

    console.log("Last commit:", lastCommitHash);
    console.log("Current commit:", hash);

    if (hash !== lastCommitHash && hash !== "unknown") {
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

module.exports = { checkForNewCommits };
