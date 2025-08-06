import { IEventCommand } from "../interfaces/ICommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";

export abstract class BaseEventCommand implements IEventCommand {
  abstract name: string;

  // Default fallback values - sẽ được override bởi localization
  get description(): string {
    return this.getLocalizedDescription();
  }

  get usage(): string {
    return this.getLocalizedUsage();
  }

  get aliases(): string[] {
    return this.getLocalizedAliases();
  }

  // Dynamic getters that use i18n
  getLocalizedName(userID?: string): string {
    const commandInfo = i18n.getCommandInfo(this.name, userID);
    return commandInfo?.name || this.name;
  }

  getLocalizedDescription(userID?: string): string {
    const commandInfo = i18n.getCommandInfo(this.name, userID);
    return (commandInfo as any)?.description || `${this.name} command`;
  }

  getLocalizedUsage(userID?: string): string {
    const commandInfo = i18n.getCommandInfo(this.name, userID);
    return (commandInfo as any)?.usage || `/${this.name}`;
  }

  getLocalizedAliases(userID?: string): string[] {
    const commandInfo = i18n.getCommandInfo(this.name, userID);
    return (commandInfo as any)?.aliases || [];
  }

  /**
   * Method called when a listened event occurs
   * Commands that need to listen to events should override this method
   */
  public onEvent(api: BotAPI, event: BotEvent): void {}

  abstract execute(
    api: BotAPI,
    event: BotEvent,
    args: string[]
  ): Promise<void> | void;
}
