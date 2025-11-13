function registerChannelCommand(app) {
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
}

module.exports = { registerChannelCommand };
