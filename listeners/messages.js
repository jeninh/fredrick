const { getAIResponse } = require("../lib/ai");

// Track conversations currently being processed to avoid ladder typing spam
const processingConversations = new Set();

// Cache for user info to avoid repeated API calls
const userCache = {};

async function getUserInfo(client, userId) {
  if (userCache[userId]) {
    return userCache[userId];
  }
  try {
    const userInfo = await client.users.info({ user: userId });
    userCache[userId] = {
      real_name: userInfo.user.real_name,
      display_name: userInfo.user.profile.display_name || userInfo.user.real_name,
    };
    return userCache[userId];
  } catch (e) {
    userCache[userId] = { real_name: userId, display_name: userId };
    return userCache[userId];
  }
}

// Parse mentions in text and replace with display names
async function parseMessageWithNames(text, client) {
  if (!text) return text;
  
  // Find all mentions like <@USERID>
  const mentionRegex = /<@([A-Z0-9]+)>/g;
  let result = text;
  
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const userId = match[1];
    const userInfo = await getUserInfo(client, userId);
    const displayName = userInfo.display_name || userInfo.real_name;
    result = result.replace(`<@${userId}>`, `@${displayName}`);
  }
  
  return result;
}

function registerMessageListener(app) {
  app.message(async ({ message, client, body }) => {
    console.log("Message received:", message.text);

    // Create a unique ID for this conversation (thread or channel)
    const conversationId = message.thread_ts || message.channel;

    // If we're already processing a message in this conversation, skip
    if (processingConversations.has(conversationId)) {
      console.log("Already processing a message in this conversation, skipping");
      return;
    }

    try {
      let shouldRespond = false;
      let threadContext = "";

      // Check if this is a thread reply
      if (message.thread_ts) {
        // Get parent message to check if it mentions fredrick or the user
        const parentMessage = await client.conversations.history({
          channel: message.channel,
          latest: message.thread_ts,
          limit: 1,
          inclusive: true,
        });

        if (parentMessage.messages && parentMessage.messages.length > 0) {
          const parentText = parentMessage.messages[0].text || "";
          const parentMentionsFredrick = parentText.toLowerCase().includes("fredrick") || parentText.includes("<@U09SAUBE5AN>");

          console.log("Parent mentions fredrick or user:", parentMentionsFredrick);

          if (parentMentionsFredrick) {
            // Parent mentions fredrick, so respond to all messages in thread
            shouldRespond = true;

            // Get full thread context
            const threadHistory = await client.conversations.replies({
              channel: message.channel,
              ts: message.thread_ts,
              limit: 100,
            });

            // Build context from thread messages with user info
            if (threadHistory.messages) {
              const contextMessages = [];
              for (const msg of threadHistory.messages) {
                let username = "bot";
                if (msg.user) {
                  // Fetch user info and cache it
                  if (!userCache[msg.user]) {
                    try {
                      const userInfo = await client.users.info({ user: msg.user });
                      userCache[msg.user] = {
                        real_name: userInfo.user.real_name,
                        display_name: userInfo.user.profile.display_name || userInfo.user.real_name,
                      };
                    } catch (e) {
                      userCache[msg.user] = { real_name: msg.user, display_name: msg.user };
                    }
                  }
                  const userInfo = userCache[msg.user];
                  username = userInfo.display_name || userInfo.real_name;
                }
                contextMessages.push(`${username}: ${msg.text || "(image/attachment)"}`);
              }
              threadContext = contextMessages.join("\n");
            }
          }
        }
      } else {
        // Channel message (not a thread)
        const messageMentionsFredrick = message.text && (message.text.toLowerCase().includes("fredrick") || message.text.includes("<@U09SAUBE5AN>"));
        console.log("Channel message mentions fredrick or user:", messageMentionsFredrick);

        if (messageMentionsFredrick) {
          shouldRespond = true;
        }
      }

      if (!shouldRespond) {
        console.log("Message doesn't match criteria, ignoring");
        return;
      }

      // Mark this conversation as being processed
      processingConversations.add(conversationId);

      // Get sender's display name
      const senderInfo = await getUserInfo(client, message.user);
      console.log("Sender:", senderInfo.display_name);

      // Parse message text to replace mentions with display names
      const parsedMessage = await parseMessageWithNames(message.text, client);
      console.log("Parsed message:", parsedMessage);

      console.log("Thread context:", threadContext);

      const reply = await getAIResponse(parsedMessage, threadContext, senderInfo);

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
    } finally {
      // Remove conversation from processing set
      processingConversations.delete(conversationId);
    }
  });
}

module.exports = { registerMessageListener };
