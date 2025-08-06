import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";

export class StopCommand extends BaseEventCommand {
  name = "stop";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      await api.sendMessage(
        i18n.t("messages.stop.response", event.senderID),
        event.threadID
      );

      // TODO: Implement proper bot stopping mechanism
      console.log(`Stop command executed by user in thread ${event.threadID}`);

      // Có thể thêm logic để thực sự stop bot ở đây
      // process.exit(0);
    } catch (error) {
      console.error("Error in stop command:", error);
    }
  }
}
