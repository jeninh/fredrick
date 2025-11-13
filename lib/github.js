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

module.exports = { getLatestCommit };
