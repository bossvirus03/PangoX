import { config } from "./ConfigManager";

// Legacy support - sử dụng ConfigManager
export const botConfig = {
  appStatePath: config.getAppStatePath(),
};

export const botOptions = config.getFacebookOptions();
