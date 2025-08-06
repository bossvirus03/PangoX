import { BaseScheduleCommand } from "../base/BaseScheduleCommand";
import { BotAPI } from "../../types";

export class WeeklyReportCommand extends BaseScheduleCommand {
  name = "weekly-report";
  description = "Báo cáo hàng tuần";
  cronExpression = "0 9 * * 1"; // 9:00 AM every Monday

  private targetThreadID = "100049732817959"; // ID thread để gửi tin nhắn

  async execute(api: BotAPI): Promise<void> {
    try {
      const now = new Date();
      const weekNumber = this.getWeekNumber(now);

      const reportMessage = `
📊 Weekly Report - Week ${weekNumber}:
📅 Date: ${now.toLocaleDateString("vi-VN")}
🤖 Bot has been running smoothly this week
📈 All systems operational
💪 Ready for another productive week!

Have a great week ahead! 🌟
      `.trim();

      await this.sendMessageToThread(api, reportMessage, this.targetThreadID);
      console.log(`Weekly report sent at ${now.toISOString()}`);
    } catch (error) {
      console.error("Error in weekly report command:", error);
    }
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor(
      (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((days + start.getDay() + 1) / 7);
  }
}
