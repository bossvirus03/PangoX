import app from "./main";
import config from "./config/config";
import { startBot } from "./bot/launcher";

const server = app.listen(config.port, () => {
  console.log(`🌐 Server running on http://localhost:${config.port}`);
  console.log("📱 Facebook Chat Bot is also starting...");
});

// Start the Facebook bot
startBot().catch(console.error);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
