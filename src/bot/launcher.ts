import { createBot } from "./index";

let botInstance: any = null;

export const startBot = async (): Promise<void> => {
  try {
    if (botInstance && botInstance.isRunning()) {
      console.log("⚠️  Bot is already running");
      return;
    }

    botInstance = createBot();
    await botInstance.start();
  } catch (error) {
    console.error("💥 Error starting bot:", error);
    throw error;
  }
};

export const stopBot = (): void => {
  if (botInstance) {
    botInstance.stop();
    botInstance = null;
  }
};

export const getBotInstance = () => {
  return botInstance;
};

// Remove auto-start to prevent duplicate initialization
// Let server.ts handle the bot startup manually
