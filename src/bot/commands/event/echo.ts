import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";

export class EchoCommand extends BaseEventCommand {
  name = "echo";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      if (args.length < 2) {
        await api.sendMessage(
          i18n.t("messages.echo.usage", event.senderID, {
            usage: this.getLocalizedUsage(event.senderID),
          }),
          event.threadID
        );
        return;
      }

      const textToEcho = args.slice(1).join(" ");
      await api.sendMessage(
        i18n.t("messages.echo.response", event.senderID, { text: textToEcho }),
        event.threadID
      );
    } catch (error) {
      console.error("Error in echo command:", error);
    }
  }
}
