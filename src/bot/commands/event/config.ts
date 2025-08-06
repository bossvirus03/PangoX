import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";
import { config } from "../../config/ConfigManager";

export class ConfigCommand extends BaseEventCommand {
  name = "config";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      // Check permission - chỉ admin mới được dùng
      if (!config.isUserAdmin(event.senderID)) {
        await api.sendMessage(
          i18n.t("messages.config.noPermission", event.senderID),
          event.threadID
        );
        return;
      }

      if (args.length < 2) {
        await this.showConfigHelp(api, event);
        return;
      }

      const subCommand = args[1].toLowerCase();

      switch (subCommand) {
        case "show":
          await this.showConfig(api, event, args[2]);
          break;
        case "set":
          await this.setConfig(api, event, args.slice(2));
          break;
        case "reload":
          await this.reloadConfig(api, event);
          break;
        default:
          await this.showConfigHelp(api, event);
      }
    } catch (error) {
      console.error("Error in config command:", error);
      await api.sendMessage(
        i18n.t("messages.general.error", event.senderID),
        event.threadID
      );
    }
  }

  private async showConfigHelp(api: BotAPI, event: BotEvent): Promise<void> {
    const help = `
🔧 Config Command Help:

📋 Available commands:
/config show [section] - Show config (all or specific section)
/config set <key> <value> - Set config value
/config reload - Reload config from file

📝 Examples:
/config show bot
/config set language.default en
/config reload
    `.trim();

    await api.sendMessage(help, event.threadID);
  }

  private async showConfig(
    api: BotAPI,
    event: BotEvent,
    section?: string
  ): Promise<void> {
    try {
      const botConfig = config.getConfig();

      if (section) {
        if (section in botConfig) {
          const sectionData = botConfig[section as keyof typeof botConfig];
          const formatted = JSON.stringify(sectionData, null, 2);
          await api.sendMessage(
            `🔧 Config section '${section}':\n\`\`\`json\n${formatted}\n\`\`\``,
            event.threadID
          );
        } else {
          await api.sendMessage(
            `❌ Config section '${section}' not found.`,
            event.threadID
          );
        }
      } else {
        // Show summary
        const summary = `
🤖 Bot Config Summary:

📊 Bot: ${botConfig.bot.name} v${botConfig.bot.version}
🌐 Language: ${botConfig.language.default} (supported: ${botConfig.language.supported.join(", ")})
⚡ Prefix: ${botConfig.commands.prefix}
📝 Logging: ${botConfig.features.logging.enabled ? "Enabled" : "Disabled"}
⏰ Schedule: ${botConfig.schedule.enabled ? "Enabled" : "Disabled"}
🔐 Admins: ${botConfig.admin.userIds.length} users

Use /config show <section> for details
        `.trim();

        await api.sendMessage(summary, event.threadID);
      }
    } catch (error) {
      console.error("Error showing config:", error);
      await api.sendMessage("❌ Failed to show config", event.threadID);
    }
  }

  private async setConfig(
    api: BotAPI,
    event: BotEvent,
    args: string[]
  ): Promise<void> {
    if (args.length < 2) {
      await api.sendMessage(
        "❌ Usage: /config set <key> <value>\nExample: /config set language.default en",
        event.threadID
      );
      return;
    }

    const key = args[0];
    const value = args.slice(1).join(" ");

    try {
      // Parse value if it looks like JSON
      let parsedValue: any = value;
      if (value.toLowerCase() === "true") parsedValue = true;
      else if (value.toLowerCase() === "false") parsedValue = false;
      else if (!isNaN(Number(value))) parsedValue = Number(value);
      else if (value.startsWith("[") || value.startsWith("{")) {
        parsedValue = JSON.parse(value);
      }

      // Update config using dot notation
      const keys = key.split(".");
      const configObj = config.getConfig();
      let current: any = configObj;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          await api.sendMessage(
            `❌ Config key '${key}' not found`,
            event.threadID
          );
          return;
        }
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (!(lastKey in current)) {
        await api.sendMessage(
          `❌ Config key '${key}' not found`,
          event.threadID
        );
        return;
      }

      const oldValue = current[lastKey];
      current[lastKey] = parsedValue;

      // Save config
      config.updateConfig(configObj);

      await api.sendMessage(
        `✅ Config updated:\n${key}: ${JSON.stringify(oldValue)} → ${JSON.stringify(parsedValue)}`,
        event.threadID
      );
    } catch (error) {
      console.error("Error setting config:", error);
      await api.sendMessage(
        "❌ Failed to set config. Check your value format.",
        event.threadID
      );
    }
  }

  private async reloadConfig(api: BotAPI, event: BotEvent): Promise<void> {
    try {
      config.reloadConfig();
      await api.sendMessage("✅ Config reloaded from file", event.threadID);
    } catch (error) {
      console.error("Error reloading config:", error);
      await api.sendMessage("❌ Failed to reload config", event.threadID);
    }
  }
}
