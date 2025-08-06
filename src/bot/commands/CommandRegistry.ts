import { IEventCommand, IScheduleCommand } from "./interfaces/ICommand";
import { BotAPI, BotEvent } from "../types";

// Dynamic imports - commands will be loaded automatically
import * as EventCommands from "./event";
import * as ScheduleCommands from "./schedule";

export class CommandRegistry {
  private eventCommands = new Map<string, IEventCommand>();
  private scheduleCommands: IScheduleCommand[] = [];

  constructor() {
    this.registerEventCommands();
    this.registerScheduleCommands();
  }

  private registerEventCommands(): void {
    // Dynamically load all event commands
    const commands: IEventCommand[] = [];

    // Get all exported classes from event commands module
    Object.values(EventCommands).forEach((CommandClass: any) => {
      if (CommandClass && typeof CommandClass === "function") {
        try {
          const commandInstance = new CommandClass();
          if (
            commandInstance &&
            typeof commandInstance.execute === "function"
          ) {
            commands.push(commandInstance);
          }
        } catch (error) {
          console.warn(`Failed to instantiate event command:`, error);
        }
      }
    });

    commands.forEach((command) => {
      // Register main command name
      this.eventCommands.set(command.name, command);

      // Register aliases
      if (command.aliases) {
        command.aliases.forEach((alias) => {
          this.eventCommands.set(alias, command);
        });
      }

      // Inject CommandRegistry vào HelpCommand để có thể tự động generate menu
      if (command.name === "help" && "setCommandRegistry" in command) {
        (command as any).setCommandRegistry(this);
      }
    });

    console.log(`📋 Registered ${commands.length} event commands`);
  }

  private registerScheduleCommands(): void {
    // Dynamically load all schedule commands
    const commands: IScheduleCommand[] = [];

    // Get all exported classes from schedule commands module
    Object.values(ScheduleCommands).forEach((CommandClass: any) => {
      if (CommandClass && typeof CommandClass === "function") {
        try {
          const commandInstance = new CommandClass();
          if (
            commandInstance &&
            typeof commandInstance.execute === "function"
          ) {
            commands.push(commandInstance);
          }
        } catch (error) {
          console.warn(`Failed to instantiate schedule command:`, error);
        }
      }
    });

    this.scheduleCommands = commands;
    console.log(`⏰ Registered ${commands.length} schedule commands`);
  }

  public getEventCommand(commandName: string): IEventCommand | undefined {
    // Remove / prefix and convert to lowercase
    const cleanName = commandName.startsWith("/")
      ? commandName.slice(1).toLowerCase()
      : commandName.toLowerCase();

    return this.eventCommands.get(cleanName);
  }

  public getAllEventCommands(): IEventCommand[] {
    // Return unique commands (avoid duplicates from aliases)
    const uniqueCommands = new Set<IEventCommand>();
    for (const command of this.eventCommands.values()) {
      uniqueCommands.add(command);
    }
    return Array.from(uniqueCommands);
  }

  public getAllScheduleCommands(): IScheduleCommand[] {
    return this.scheduleCommands;
  }

  public async executeEventCommand(
    commandName: string,
    api: BotAPI,
    event: BotEvent
  ): Promise<boolean> {
    const command = this.getEventCommand(commandName);
    if (command) {
      try {
        // Parse arguments from event body
        const args = event.body?.split(" ") || [];
        await command.execute(api, event, args);
        return true;
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        return false;
      }
    }
    return false;
  }
}
