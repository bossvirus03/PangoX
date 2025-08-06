import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";

export class PingCommand extends BaseEventCommand {
  name = "ping";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      const startTime = Date.now();
      await api.sendMessage(
        i18n.t("messages.ping.response", event.senderID),
        event.threadID
      );
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      await api.sendMessage(
        `⚡ Response time: ${responseTime}ms`,
        event.threadID
      );
    } catch (error) {
      console.error("Error in ping command:", error);
    }
  }
}
