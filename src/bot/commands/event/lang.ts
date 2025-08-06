import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n, Language } from "../../i18n";

export class LanguageCommand extends BaseEventCommand {
  name = "language";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      if (args.length < 2) {
        const currentLang = i18n.getUserLanguage(event.senderID);
        await api.sendMessage(
          `🌐 Current language / Ngôn ngữ hiện tại: ${currentLang.toUpperCase()}\n\n` +
            `Usage / Cách dùng:\n` +
            `/language en - Switch to English\n` +
            `/language vi - Chuyển sang tiếng Việt\n\n` +
            `Aliases: /lang, /ngonngu`,
          event.threadID
        );
        return;
      }

      const newLanguage = args[1].toLowerCase() as Language;

      if (!["en", "vi"].includes(newLanguage)) {
        await api.sendMessage(
          `❌ Invalid language / Ngôn ngữ không hợp lệ: ${newLanguage}\n` +
            `Available / Có sẵn: en, vi`,
          event.threadID
        );
        return;
      }

      // Set language for user
      i18n.setUserLanguage(event.senderID, newLanguage);

      // Send confirmation in new language
      const confirmMessage =
        newLanguage === "en"
          ? `✅ Language changed to English successfully!`
          : `✅ Đã chuyển sang tiếng Việt thành công!`;

      await api.sendMessage(confirmMessage, event.threadID);
    } catch (error) {
      console.error("Error in language command:", error);
      await api.sendMessage(
        "❌ Error changing language / Lỗi khi đổi ngôn ngữ",
        event.threadID
      );
    }
  }
}
