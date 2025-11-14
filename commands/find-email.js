function registerFindEmailCommand(app) {
  app.command("/find-email", async ({ command, ack, respond, client }) => {
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

    const slackId = command.text?.trim();

    if (!slackId) {
      await respond({
        text: "please provide a slack id",
        response_type: "ephemeral",
      });
      return;
    }

    // Extract just the ID from format like <@U1234|user>
    const idMatch = slackId.match(/<?@?([A-Z0-9]+)\|?.*>?/);
    const cleanId = idMatch ? idMatch[1] : slackId;

    try {
      const apiKey = process.env.WHOIS_API_KEY;
      if (!apiKey) {
        await respond({
          text: "api key not configured",
          response_type: "ephemeral",
        });
        return;
      }

      const response = await fetch(
        `https://whois.hacktable.org/?userId=${cleanId}`,
        {
          headers: {
            "x-api-key": apiKey,
          },
        }
      );

      if (!response.ok) {
        await respond({
          text: `error: ${response.status} ${response.statusText}`,
          response_type: "ephemeral",
        });
        return;
      }

      const email = await response.text();

      await respond({
        text: `<@${cleanId}> -> ${email}`,
        response_type: "in_channel",
      });
    } catch (error) {
      console.error("Error fetching email:", error.message);
      await respond({
        text: `error: ${error.message}`,
        response_type: "ephemeral",
      });
    }
  });
}

module.exports = { registerFindEmailCommand };
