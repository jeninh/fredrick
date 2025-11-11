fredrick - slack bot

a multipurpose slack bot.

setup

1. install dependencies:
   npm install

2. create a slack app:
   - go to https://api.slack.com/apps
   - click "create new app" > "from scratch"
   - name it "fredrick"
   - select your workspace

3. enable socket mode:
   - go to "socket mode" in the left sidebar
   - toggle "enable socket mode"
   - generate an app-level token (xapp-...) and save it

4. set up bot token scopes:
   - go to "oauth & permissions"
   - under "scopes" > "bot token scopes", add:
     - chat:write - to post messages
     - app_mentions:read - to listen for mentions
   - install/reinstall the app to your workspace
   - copy the "bot user oauth token" (xoxb-...)

5. get signing secret:
   - go to "basic information"
   - copy the "signing secret"

6. create .env file:
   cp .env.example .env
   then edit .env and add your tokens:
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_SIGNING_SECRET=...
   SLACK_APP_TOKEN=xapp-...

7. run the bot:
   npm start

customizing responses

edit responses.json to add or modify bot responses. the bot will pick a random response each time it's mentioned.

```json
{
  "responses": [
    "your response here",
    "another response",
    "keep adding more..."
  ]
}
```

development

for development with auto-restart:
npm run dev

this requires nodemon (included in devdependencies).
