import { IScheduleCommand } from "../interfaces/ICommand";
import { BotAPI } from "../../types";

export abstract class BaseScheduleCommand implements IScheduleCommand {
  abstract name: string;
  abstract description: string;
  abstract cronExpression: string;

  abstract execute(api: BotAPI): Promise<void> | void;

  protected async sendMessageToThread(
    api: BotAPI,
    message: string,
    threadID: string
  ): Promise<void> {
    try {
      await api.sendMessage(message, threadID);
    } catch (err) {
      console.error(`Error sending scheduled message in ${this.name}:`, err);
      throw err;
    }
  }
}
