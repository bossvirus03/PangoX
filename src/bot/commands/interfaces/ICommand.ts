import { BotAPI, BotEvent } from "../../types";

export interface IEventCommand {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];

  // Localization methods
  getLocalizedName?(userID?: string): string;
  getLocalizedDescription?(userID?: string): string;
  getLocalizedUsage?(userID?: string): string;
  getLocalizedAliases?(userID?: string): string[];

  execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> | void;
}

export interface IScheduleCommand {
  name: string;
  description: string;
  cronExpression: string; // Cron expression cho schedule
  execute(api: BotAPI): Promise<void> | void;
}

export enum CommandType {
  EVENT = "event",
  SCHEDULE = "schedule",
}
