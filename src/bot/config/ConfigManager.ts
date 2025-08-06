import fs from "fs";
import path from "path";

export interface BotConfig {
  bot: {
    name: string;
    version: string;
    description: string;
  };
  logEvents: boolean;
  selfListen: boolean;
  language: {
    default: "vi" | "en";
    supported: string[];
    autoDetect: boolean;
  };
  commands: {
    prefix: string;
    caseSensitive: boolean;
    maxArgsLength: number;
    cooldown: {
      enabled: boolean;
      globalMs: number;
      perUserMs: number;
    };
  };
  features: {
    welcomeMessage: {
      enabled: boolean;
      message: Record<string, string>;
    };
    autoReply: {
      enabled: boolean;
      prefix: string;
      unknownCommand: Record<string, string>;
    };
    logging: {
      enabled: boolean;
      level: string;
      logCommands: boolean;
      logErrors: boolean;
    };
    resend: {
      enabled: boolean;
      maxStoredMessages: number;
      adminOnly: boolean;
    };
  };
  facebook: {
    appStatePath: string;
    options: {
      listenEvents: boolean;
      logLevel: string;
      selfListen: boolean;
      selfListenEvent: boolean;
      listenTyping: boolean;
      updatePresence: boolean;
      autoMarkDelivery: boolean;
      autoMarkRead: boolean;
      autoReconnect: boolean;
    };
  };
  admin: {
    userIds: string[];
    testThreadId: string;
    permissions: Record<string, string[]>;
  };
  schedule: {
    enabled: boolean;
    timezone: string;
    commands: Record<
      string,
      {
        enabled: boolean;
        cron: string;
      }
    >;
  };
  database: {
    enabled: boolean;
    type: string;
    path: string;
  };
  security: {
    rateLimiting: {
      enabled: boolean;
      maxRequestsPerMinute: number;
    };
    blockedUsers: string[];
    allowedThreads: string[];
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: BotConfig;
  private configPath: string;

  constructor(configPath: string = "pangox.config.json") {
    this.configPath = path.resolve(configPath);
    this.config = this.loadConfig();
  }

  public static getInstance(configPath?: string): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager(configPath);
    }
    return ConfigManager.instance;
  }

  private loadConfig(): BotConfig {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Config file not found: ${this.configPath}`);
      }

      const configData = fs.readFileSync(this.configPath, "utf8");
      const parsedConfig = JSON.parse(configData);

      console.log(`✅ Loaded config from: ${this.configPath}`);
      return parsedConfig as BotConfig;
    } catch (error) {
      console.error(`❌ Failed to load config:`, error);
      throw error;
    }
  }

  public getConfig(): BotConfig {
    return this.config;
  }

  public get<K extends keyof BotConfig>(section: K): BotConfig[K] {
    return this.config[section];
  }

  public getBotName(): string {
    return this.config.bot.name;
  }

  public getDefaultLanguage(): "vi" | "en" {
    return this.config.language.default;
  }

  public getCommandPrefix(): string {
    return this.config.commands.prefix;
  }

  public isFeatureEnabled(feature: keyof BotConfig["features"]): boolean {
    return this.config.features[feature].enabled;
  }

  public getWelcomeMessage(language: string): string {
    const message =
      this.config.features.welcomeMessage.message[language] ||
      this.config.features.welcomeMessage.message[this.config.language.default];
    return message.replace("{botName}", this.config.bot.name);
  }

  public getUnknownCommandMessage(language: string): string {
    return (
      this.config.features.autoReply.unknownCommand[language] ||
      this.config.features.autoReply.unknownCommand[
        this.config.language.default
      ]
    );
  }

  public isUserAdmin(userID: string): boolean {
    return this.config.admin.userIds.includes(userID);
  }

  public hasPermission(userID: string, action: string): boolean {
    const permissions = this.config.admin.permissions[action];
    if (!permissions) return true; // No restrictions

    if (permissions.includes("user")) return true; // Everyone can do this
    if (permissions.includes("admin") && this.isUserAdmin(userID)) return true;

    return false;
  }

  public getScheduleConfig(commandName: string) {
    return this.config.schedule.commands[commandName];
  }

  public isScheduleEnabled(): boolean {
    return this.config.schedule.enabled;
  }

  public getFacebookOptions() {
    return this.config.facebook.options;
  }

  public getAppStatePath(): string {
    return this.config.facebook.appStatePath;
  }

  // Update config và save
  public updateConfig(updates: Partial<BotConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log(`✅ Config saved to: ${this.configPath}`);
    } catch (error) {
      console.error(`❌ Failed to save config:`, error);
    }
  }

  // Reload config từ file
  public reloadConfig(): void {
    this.config = this.loadConfig();
    console.log("🔄 Config reloaded");
  }
}

// Global config instance
export const config = ConfigManager.getInstance();
