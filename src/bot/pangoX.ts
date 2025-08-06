import fsSync from "fs";
const { login } = require("../../facebook-chat-api");

// Import command system
import { MessageHandler } from "./handlers/messageHandler";
import * as EventCommands from "./commands/event";
import { config } from "./config/ConfigManager";
const botConfig = config.getConfig();
/**
 * Custom error types for better error handling
 */
class LoginError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "LoginError";
  }
}

class AppStateError extends Error {
  constructor(
    message: string,
    public readonly filePath: string
  ) {
    super(message);
    this.name = "AppStateError";
  }
}

/**
 * App state structure validation
 */
interface AppStateItem {
  key: string;
  value: string;
  domain: string;
  path: string;
  hostOnly: boolean;
  creation: string;
  lastAccessed: string;
}

class ChatBot {
  private stopListening?: () => void;
  private running: boolean = false;
  private loginAttempts: number = 0;
  private readonly appStatePath: string = "appstate.json";
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 2000;
  private readonly timeout: number = 30000;

  // Command system
  private messageHandler?: MessageHandler;
  private eventListenerCommands: any[] = [];

  constructor() {
    this.loadEventListenerCommands();
  }

  /**
   * Load all event commands that have onEvent method
   */
  private loadEventListenerCommands(): void {
    console.log("🔄 Loading event listener commands...");

    // Get all exported classes from event commands module
    Object.values(EventCommands).forEach((CommandClass: any) => {
      if (CommandClass && typeof CommandClass === "function") {
        try {
          const commandInstance = new CommandClass();

          // Check if command has onEvent method
          if (
            commandInstance &&
            typeof commandInstance.onEvent === "function"
          ) {
            this.eventListenerCommands.push(commandInstance);
            console.log(
              `📡 ${commandInstance.name} command loaded for event listening`
            );
          }
        } catch (error) {
          console.warn(`Failed to load event listener command:`, error);
        }
      }
    });

    console.log(
      `✅ Loaded ${this.eventListenerCommands.length} event listener commands`
    );
  }

  public async start(): Promise<void> {
    return this.startBot();
  }

  public stop(): void {
    this.stopBot();
  }

  public isRunning(): boolean {
    return this.running;
  }

  public async startBot(): Promise<void> {
    if (this.running) {
      console.log("⚠️  Bot is already running");
      return;
    }

    console.log("🚀 Starting Facebook Chat Bot...");
    console.log("🔐 Initializing Facebook Chat Bot login...");
    console.log(`📁 App state path: ${this.appStatePath}`);

    for (
      this.loginAttempts = 1;
      this.loginAttempts <= this.maxRetries;
      this.loginAttempts++
    ) {
      try {
        console.log(
          `🎯 Login attempt ${this.loginAttempts}/${this.maxRetries}`
        );

        const api = await this.attemptLogin();

        console.log("✅ Facebook Chat Bot login successful!");
        console.log("🔧 Applying bot configuration...");

        // Configure bot options
        api.setOptions({ listenEvents: true });
        console.log("⚙️  Bot options applied successfully");

        // Initialize message handler with command system
        this.messageHandler = new MessageHandler(api);

        // Set up event listening
        this.setupEventListening(api);

        this.running = true;
        console.log("🚀 Bot is ready to use!");
        return;
      } catch (error) {
        await this.handleLoginError(error);

        // If this was the last attempt, throw the error
        if (this.loginAttempts >= this.maxRetries) {
          throw error;
        }

        // Wait before retrying
        console.log(`⏳ Waiting ${this.retryDelay / 1000}s before retry...`);
        await this.delay(this.retryDelay);
      }
    }

    throw new LoginError(
      `Failed to login after ${this.maxRetries} attempts`,
      "MAX_RETRIES_EXCEEDED"
    );
  }

  /**
   * Single login attempt with timeout and validation
   */
  private async attemptLogin(): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new LoginError("Login timeout exceeded", "TIMEOUT"));
      }, this.timeout);

      try {
        const appState = this.loadAppStateSync();

        console.log("📡 Connecting to Facebook servers...");

        login({ appState }, (err: any, api: any) => {
          clearTimeout(timeout);
          if (err) {
            reject(
              new LoginError(
                `Facebook authentication failed: ${err.error || err.message || err}`,
                this.getErrorCode(err)
              )
            );
            return;
          }

          if (!api) {
            reject(
              new LoginError("API instance is null or undefined", "NULL_API")
            );
            return;
          }

          console.log("🔗 Successfully connected to Facebook Chat API");
          resolve(api);
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Load and validate app state synchronously
   */
  private loadAppStateSync(): AppStateItem[] {
    try {
      console.log("📖 Loading app state...");

      // Check if file exists
      if (!fsSync.existsSync(this.appStatePath)) {
        throw new AppStateError(
          "App state file not found. Please ensure you have a valid appstate.json file.",
          this.appStatePath
        );
      }

      // Read and parse app state
      const appStateData = fsSync.readFileSync(this.appStatePath, "utf8");

      if (!appStateData.trim()) {
        throw new AppStateError("App state file is empty", this.appStatePath);
      }

      let appState: AppStateItem[];
      try {
        appState = JSON.parse(appStateData);
      } catch (parseError) {
        throw new AppStateError(
          `Invalid JSON in app state file: ${parseError}`,
          this.appStatePath
        );
      }

      // Validate app state structure
      this.validateAppState(appState);

      console.log(
        `✅ App state loaded successfully (${appState.length} cookies)`
      );
      return appState;
    } catch (error) {
      if (error instanceof AppStateError) {
        throw error;
      }

      throw new AppStateError(
        `Failed to load app state: ${error}`,
        this.appStatePath
      );
    }
  }

  /**
   * Validate app state structure and content
   */
  private validateAppState(appState: any): void {
    if (!Array.isArray(appState)) {
      throw new AppStateError(
        "App state must be an array of cookies",
        this.appStatePath
      );
    }

    if (appState.length === 0) {
      throw new AppStateError(
        "App state is empty - no cookies found",
        this.appStatePath
      );
    }

    // Check for required Facebook cookies
    const requiredDomains = [".facebook.com", "facebook.com"];
    const hasRequiredCookies = appState.some(
      (cookie) =>
        cookie &&
        cookie.domain &&
        requiredDomains.some((domain) => cookie.domain.includes(domain))
    );

    if (!hasRequiredCookies) {
      throw new AppStateError(
        "App state does not contain valid Facebook cookies",
        this.appStatePath
      );
    }

    console.log("🔍 App state validation passed");
  }

  /**
   * Setup event listening with proper error handling and command processing
   */
  private setupEventListening(api: any): void {
    this.stopListening = api.listenMqtt((err: any, event: any) => {
      if (botConfig.logEvents) console.log("📬 Event received:", event);
      if (err) {
        console.error("❌ Event listening error:", err);
        return;
      }

      // Only process events that have threadID
      if (!event || !event.threadID) return;

      // Let all event listener commands handle the event first
      this.eventListenerCommands.forEach((command) => {
        try {
          command.onEvent(api, event);
        } catch (error) {
          console.error(`Error in ${command.name} onEvent:`, error);
        }
      });

      // Handle stop command locally (override any other processing)
      if (event.body === "/stop") {
        api.sendMessage("Goodbye…", event.threadID);
        return this.stopListening?.();
      }

      // Let MessageHandler process all messages
      if (event.type === "message" || event.type === "message_reply") {
        this.messageHandler?.handleMessage(event);
      }
    });
  }

  /**
   * Handle different types of login errors
   */
  private async handleLoginError(error: any): Promise<void> {
    console.error(
      `❌ Login attempt ${this.loginAttempts} failed:`,
      error.message
    );

    if (error instanceof AppStateError) {
      console.error("📁 App State Error:", error.message);
      console.error(
        "� Solution: Please update your appstate.json file with valid Facebook cookies"
      );
    } else if (error instanceof LoginError) {
      console.error("🔐 Login Error:", error.message);

      switch (error.code) {
        case "TIMEOUT":
          console.error(
            "💡 Solution: Check your internet connection and try again"
          );
          break;
        case "AUTHENTICATION_FAILED":
          console.error(
            "💡 Solution: Your appstate.json may be expired. Please get a new one"
          );
          break;
        case "RATE_LIMITED":
          console.error(
            "💡 Solution: Too many login attempts. Please wait before trying again"
          );
          break;
        default:
          console.error(
            "💡 Solution: Check your appstate.json and internet connection"
          );
      }
    } else {
      console.error("❓ Unknown Error:", error);
    }
  }

  /**
   * Get error code from Facebook API error
   */
  private getErrorCode(err: any): string {
    if (typeof err === "string") {
      if (err.includes("timeout")) return "TIMEOUT";
      if (err.includes("rate") || err.includes("limit")) return "RATE_LIMITED";
      if (err.includes("authenticate") || err.includes("login"))
        return "AUTHENTICATION_FAILED";
    }

    if (err.error) {
      if (err.error.includes("Please try logging in from a computer"))
        return "LOGIN_APPROVAL_NEEDED";
      if (err.error.includes("checkpoint")) return "CHECKPOINT_REQUIRED";
    }

    return "UNKNOWN_ERROR";
  }

  /**
   * Utility method for delays
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public stopBot(): void {
    if (!this.running) {
      console.log("⚠️  Bot is not running");
      return;
    }

    try {
      if (this.stopListening) {
        this.stopListening();
        this.stopListening = undefined;
      }

      this.running = false;
      console.log("🛑 Facebook Chat Bot stopped");
    } catch (error) {
      console.error("❌ Error stopping bot:", error);
    }
  }

  public getBotStatus(): { isRunning: boolean; loginStats?: any } {
    return {
      isRunning: this.running,
      loginStats: {
        attempts: this.loginAttempts,
        maxRetries: this.maxRetries,
      },
    };
  }

  /**
   * Validate app state file without attempting login
   */
  public async validateAppStateFile(): Promise<boolean> {
    try {
      this.loadAppStateSync();
      return true;
    } catch (error) {
      console.error("App state validation failed:", error);
      return false;
    }
  }

  public async restartBot(): Promise<void> {
    console.log("🔄 Restarting bot...");
    this.stopBot();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
    await this.startBot();
  }
}

export { ChatBot };

export const createBot = (): ChatBot => {
  return new ChatBot();
};

export const startBot = async (): Promise<ChatBot> => {
  const bot = createBot();
  await bot.startBot();
  return bot;
};
