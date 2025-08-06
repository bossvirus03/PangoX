import { BaseScheduleCommand } from "../base/BaseScheduleCommand";
import { BotAPI } from "../../types";

export class DailyGreetingCommand extends BaseScheduleCommand {
  name = "daily-greeting";
  description = "Gửi lời chào hàng ngày";
  cronExpression = "0 8 * * *"; // 8:00 AM every day

  private targetThreadID = "100049732817959"; // ID thread để gửi tin nhắn

  async execute(api: BotAPI): Promise<void> {
    try {
      const now = new Date();
      const greeting = `🌅 Chào buổi sáng! Hôm nay là ${now.toLocaleDateString("vi-VN")}. Chúc bạn một ngày tốt lành! ☀️`;

      await this.sendMessageToThread(api, greeting, this.targetThreadID);
      console.log(`Daily greeting sent at ${now.toISOString()}`);
    } catch (error) {
      console.error("Error in daily greeting command:", error);
    }
  }
}
