import { IScheduleCommand } from "./interfaces/ICommand";
import { BotAPI } from "../types";

interface ScheduledJob {
  command: IScheduleCommand;
  intervalId: NodeJS.Timeout;
}

export class CommandScheduler {
  private api: BotAPI;
  private scheduledJobs: ScheduledJob[] = [];

  constructor(api: BotAPI) {
    this.api = api;
  }

  public scheduleCommands(commands: IScheduleCommand[]): void {
    commands.forEach((command) => {
      this.scheduleCommand(command);
    });

    console.log(`📅 Scheduled ${commands.length} commands`);
  }

  private scheduleCommand(command: IScheduleCommand): void {
    try {
      const intervalMs = this.parseCronToInterval(command.cronExpression);

      const intervalId = setInterval(async () => {
        try {
          console.log(`⏰ Executing scheduled command: ${command.name}`);
          await command.execute(this.api);
        } catch (error) {
          console.error(
            `Error executing scheduled command ${command.name}:`,
            error
          );
        }
      }, intervalMs);

      this.scheduledJobs.push({
        command,
        intervalId,
      });

      console.log(
        `📅 Scheduled "${command.name}" with expression: ${command.cronExpression}`
      );
    } catch (error) {
      console.error(`Failed to schedule command ${command.name}:`, error);
    }
  }

  private parseCronToInterval(cronExpression: string): number {
    // Simple cron parser - for production use a proper cron library like 'node-cron'
    const parts = cronExpression.split(" ");
    if (parts.length !== 5) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // For demo purposes, implement basic patterns
    if (cronExpression === "0 * * * *") {
      // Every hour
      return 60 * 60 * 1000;
    } else if (cronExpression === "0 8 * * *") {
      // Daily at 8:00 AM
      return 24 * 60 * 60 * 1000;
    } else if (cronExpression === "0 9 * * 1") {
      // Weekly on Monday at 9:00 AM
      return 7 * 24 * 60 * 60 * 1000;
    } else {
      // Default to 1 hour for unknown patterns
      console.warn(
        `Unknown cron pattern: ${cronExpression}, defaulting to 1 hour`
      );
      return 60 * 60 * 1000;
    }
  }

  public stopAllScheduledCommands(): void {
    this.scheduledJobs.forEach((job) => {
      clearInterval(job.intervalId);
    });

    console.log(`🛑 Stopped ${this.scheduledJobs.length} scheduled commands`);
    this.scheduledJobs = [];
  }

  public getScheduledCommands(): IScheduleCommand[] {
    return this.scheduledJobs.map((job) => job.command);
  }
}
