import { BotAPI, BotEvent } from "../types";
import { CommandRegistry } from "../commands/CommandRegistry";
import { config } from "../config/ConfigManager";
import { i18n } from "../i18n";

export class MessageHandler {
  private api: BotAPI;
  private commandRegistry: CommandRegistry;
  private cooldowns: Map<string, number> = new Map(); // userId -> timestamp
  private globalCooldown: number = 0; // global cooldown timestamp

  constructor(api: BotAPI) {
    this.api = api;
    this.commandRegistry = new CommandRegistry();
  }

  public handleMessage = async (event: BotEvent): Promise<void> => {
    if (!event.body) return;

    // Check if message is a command (starts with /)
    if (event.body.startsWith("/")) {
      const commandName = event.body.split(" ")[0]; // Get first word as command

      // Check cooldown before executing command
      if (this.isOnCooldown(event.senderID)) {
        await this.handleCooldownMessage(event);
        return;
      }

      const executed = await this.commandRegistry.executeEventCommand(
        commandName,
        this.api,
        event
      );

      if (executed) {
        // Set cooldown after successful command execution
        this.setCooldown(event.senderID);
        console.log(`✅ Executed command: ${commandName}`);
      } else {
        // Command not found
        await this.handleUnknownCommand(event, commandName);
      }
    }
  };

  private handleUnknownCommand = async (
    event: BotEvent,
    commandName: string
  ): Promise<void> => {
    const message = `❌ Unknown command: ${commandName}\nUse /help to see available commands.`;

    try {
      await this.api.sendMessage(message, event.threadID);
    } catch (err) {
      console.error("Error sending unknown command message:", err);
    }
  };

  /**
   * Check if user or global cooldown is active
   */
  private isOnCooldown(userId: string): boolean {
    const cooldownConfig = config.getConfig().commands.cooldown;

    if (!cooldownConfig.enabled) {
      return false;
    }

    const now = Date.now();

    // Check global cooldown
    if (cooldownConfig.globalMs > 0 && now < this.globalCooldown) {
      return true;
    }

    // Check per-user cooldown
    if (cooldownConfig.perUserMs > 0) {
      const userCooldown = this.cooldowns.get(userId);
      if (userCooldown && now < userCooldown) {
        return true;
      }
    }

    return false;
  }

  /**
   * Set cooldown for user and global
   */
  private setCooldown(userId: string): void {
    const cooldownConfig = config.getConfig().commands.cooldown;
    const now = Date.now();

    if (cooldownConfig.globalMs > 0) {
      this.globalCooldown = now + cooldownConfig.globalMs;
    }

    if (cooldownConfig.perUserMs > 0) {
      this.cooldowns.set(userId, now + cooldownConfig.perUserMs);
    }
  }

  /**
   * Handle cooldown message
   */
  private handleCooldownMessage = async (event: BotEvent): Promise<void> => {
    const cooldownConfig = config.getConfig().commands.cooldown;
    const now = Date.now();

    let remainingTime = 0;
    let messageKey = "messages.cooldown.active";

    // Check which cooldown is active
    if (cooldownConfig.globalMs > 0 && now < this.globalCooldown) {
      remainingTime = Math.ceil((this.globalCooldown - now) / 1000);
      messageKey = "messages.cooldown.global";
    } else {
      const userCooldown = this.cooldowns.get(event.senderID);
      if (userCooldown && now < userCooldown) {
        remainingTime = Math.ceil((userCooldown - now) / 1000);
        messageKey = "messages.cooldown.active";
      }
    }

    const message = i18n.t(messageKey, event.senderID, {
      seconds: remainingTime.toString(),
    });

    try {
      await this.api.sendMessage(message, event.threadID);
    } catch (err) {
      console.error("Error sending cooldown message:", err);
    }
  };

  public getCommandRegistry(): CommandRegistry {
    return this.commandRegistry;
  }
}
