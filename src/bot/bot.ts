import fs from "fs";
const { login } = require("../../facebook-chat-api");

export const startBot = () => {
  console.log("Starting Facebook Chat Bot...");

  login(
    { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) },
    (err: any, api: any) => {
      if (err) {
        console.error("Facebook Chat Bot Error:", err);
        return;
      }

      console.log("Facebook Chat Bot started successfully!");
      api.setOptions({ listenEvents: true });

      const stopListening = api.listenMqtt((err: any, event: any) => {
        if (err) return console.error(err);

        api.sendMessage(`TEST BOT:`, 100049732817959);
        // Only process events that have threadID
        if (!event || !event.threadID) return;

        console.log(event);
        switch (event.type) {
          case "message":
            if (event.body === "/stop") {
              api.sendMessage("Goodbye…", event.threadID);
              return stopListening();
            }
            break;
          case "event":
            console.log(event);
            break;
        }
      });
    }
  );
};

// Auto-start bot when module is imported
startBot();
