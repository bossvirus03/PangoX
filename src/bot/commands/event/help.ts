import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { CommandRegistry } from "../CommandRegistry";
import { i18n } from "../../i18n";

export class HelpCommand extends BaseEventCommand {
  name = "help";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  private commandRegistry?: CommandRegistry;

  // Method để inject CommandRegistry từ bên ngoài
  setCommandRegistry(registry: CommandRegistry): void {
    this.commandRegistry = registry;
  }

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      // Kiểm tra nếu có argument để xem chi tiết command
      if (args && args.length > 1) {
        const commandName = args[1].toLowerCase();
        const helpMessage = this.buildCommandDetails(
          commandName,
          event.senderID
        );
        await api.sendMessage(helpMessage, event.threadID);
      } else {
        // Hiển thị menu tổng quan
        const helpMessage = this.buildHelpMessage(event.senderID);
        await api.sendMessage(helpMessage, event.threadID);
      }
    } catch (error) {
      console.error("Error in help command:", error);
    }
  }

  private buildHelpMessage(userID?: string): string {
    if (!this.commandRegistry) {
      return i18n.t("messages.help.registryNotAvailable", userID);
    }

    let helpMessage = i18n.t("messages.help.title", userID) + "\n\n";
    helpMessage += i18n.t("messages.help.eventCommands", userID);

    // Tự động lấy tất cả event commands
    const eventCommands = this.commandRegistry.getAllEventCommands();
    eventCommands.forEach((command) => {
      // Use localized command info if available
      const description = command.getLocalizedDescription
        ? command.getLocalizedDescription(userID)
        : command.description;
      const aliases = command.getLocalizedAliases
        ? command.getLocalizedAliases(userID)
        : command.aliases || [];

      const aliasesStr =
        aliases && aliases.length > 0 ? `, /${aliases.join(", /")}` : "";

      helpMessage += `\n/${command.name}${aliasesStr} - ${description}`;
    });

    helpMessage += `\n\n${i18n.t("messages.help.scheduleCommands", userID)}`;

    // Tự động lấy tất cả schedule commands
    const scheduleCommands = this.commandRegistry.getAllScheduleCommands();
    scheduleCommands.forEach((command) => {
      helpMessage += `\n• ${command.name} - ${command.description} (${command.cronExpression})`;
    });

    helpMessage += `\n\n${i18n.t("messages.help.usage", userID)}`;
    helpMessage += `\n${i18n.t("messages.help.helpUsage", userID)}`;

    return helpMessage.trim();
  }

  private buildCommandDetails(commandName: string, userID?: string): string {
    if (!this.commandRegistry) {
      return i18n.t("messages.help.registryNotAvailable", userID);
    }

    // Remove / prefix if present
    const cleanCommandName = commandName.startsWith("/")
      ? commandName.slice(1)
      : commandName;

    // Tìm command (có thể là name hoặc alias)
    const command = this.commandRegistry.getEventCommand(cleanCommandName);

    if (!command) {
      return i18n.t("messages.help.commandNotFound", userID, {
        command: cleanCommandName,
      });
    }

    // Build chi tiết command
    const description = command.getLocalizedDescription
      ? command.getLocalizedDescription(userID)
      : command.description;

    const usage = command.getLocalizedUsage
      ? command.getLocalizedUsage(userID)
      : command.usage;

    const aliases = command.getLocalizedAliases
      ? command.getLocalizedAliases(userID)
      : command.aliases || [];

    let details = i18n.t("messages.help.commandDetails", userID, {
      command: command.name,
    });

    details += `\n${i18n.t("messages.help.commandDescription", userID, {
      description,
    })}`;

    details += `\n${i18n.t("messages.help.commandUsage", userID, {
      usage,
    })}`;

    if (aliases.length > 0) {
      details += `\n${i18n.t("messages.help.commandAliases", userID, {
        aliases: aliases.map((a) => `/${a}`).join(", "),
      })}`;
    }

    return details.trim();
  }
}
