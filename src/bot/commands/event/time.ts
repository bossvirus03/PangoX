import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";

export class TimeCommand extends BaseEventCommand {
  name = "time";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      const now = new Date();
      const timeString = now.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const message = `${i18n.t("messages.time.current", event.senderID)} ${timeString}`;
      await api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error("Error in time command:", error);
    }
  }
}
