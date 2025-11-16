const fs = require("fs");
const path = require("path");

function loadLastCommit() {
  try {
    const path2 = path.join(__dirname, "../last_commit.json");
    const data = fs.readFileSync(path2, "utf-8");
    return JSON.parse(data).hash;
  } catch (error) {
    return "";
  }
}

function saveLastCommit(hash) {
  try {
    const path2 = path.join(__dirname, "../last_commit.json");
    fs.writeFileSync(path2, JSON.stringify({ hash }, null, 2));
  } catch (error) {
    console.error("Error saving last commit:", error.message);
  }
}

// Cache statuses in memory to avoid repeated disk reads
let cachedStatuses = null;

function loadStatuses() {
  if (cachedStatuses !== null) {
    return cachedStatuses;
  }
  
  const statusPath = path.join(__dirname, "../status.json");
  const data = fs.readFileSync(statusPath, "utf-8");
  cachedStatuses = JSON.parse(data).statuses;
  return cachedStatuses;
}

function getRandomStatus(statuses) {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

module.exports = {
  loadLastCommit,
  saveLastCommit,
  loadStatuses,
  getRandomStatus,
};
