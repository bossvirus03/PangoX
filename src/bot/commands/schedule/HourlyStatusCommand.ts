import { BaseScheduleCommand } from "../base/BaseScheduleCommand";
import { BotAPI } from "../../types";

export class HourlyStatusCommand extends BaseScheduleCommand {
  name = "hourly-status";
  description = "Báo cáo trạng thái bot mỗi giờ";
  cronExpression = "0 * * * *"; // Every hour

  private targetThreadID = "100049732817959"; // ID thread để gửi tin nhắn

  async execute(api: BotAPI): Promise<void> {
    try {
      const now = new Date();
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const statusMessage = `
🤖 Bot Status Report:
⏰ Time: ${now.toLocaleTimeString("vi-VN")}
🔄 Uptime: ${hours}h ${minutes}m
✅ Status: Running normally
💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
      `.trim();

      await this.sendMessageToThread(api, statusMessage, this.targetThreadID);
      console.log(`Hourly status sent at ${now.toISOString()}`);
    } catch (error) {
      console.error("Error in hourly status command:", error);
    }
  }
}
