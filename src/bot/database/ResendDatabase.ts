import * as fs from "fs";
import * as path from "path";

interface ThreadResendSettings {
  threadID: string;
  enabled: boolean;
  lastUpdated: number;
}

export class ResendDatabase {
  private static instance: ResendDatabase;
  private dbPath: string;
  private data: Map<string, ThreadResendSettings>;

  private constructor() {
    this.dbPath = path.join(process.cwd(), "data", "resend_settings.json");
    this.data = new Map();
    this.ensureDataDir();
    this.loadData();
  }

  public static getInstance(): ResendDatabase {
    if (!ResendDatabase.instance) {
      ResendDatabase.instance = new ResendDatabase();
    }
    return ResendDatabase.instance;
  }

  private ensureDataDir(): void {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, "utf8");
        const jsonData = JSON.parse(fileContent);

        Object.entries(jsonData).forEach(([threadID, settings]) => {
          this.data.set(threadID, settings as ThreadResendSettings);
        });

        console.log(`📁 Loaded resend settings for ${this.data.size} threads`);
      }
    } catch (error) {
      console.error("Error loading resend database:", error);
      this.data = new Map();
    }
  }

  private saveData(): void {
    try {
      const jsonData: { [key: string]: ThreadResendSettings } = {};
      this.data.forEach((settings, threadID) => {
        jsonData[threadID] = settings;
      });

      fs.writeFileSync(this.dbPath, JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error("Error saving resend database:", error);
    }
  }

  public isThreadResendEnabled(threadID: string): boolean {
    const settings = this.data.get(threadID);
    return settings ? settings.enabled : false; // Default is disabled
  }

  public setThreadResendEnabled(threadID: string, enabled: boolean): void {
    const settings: ThreadResendSettings = {
      threadID,
      enabled,
      lastUpdated: Date.now(),
    };

    this.data.set(threadID, settings);
    this.saveData();

    console.log(
      `🔧 Thread ${threadID} resend: ${enabled ? "enabled" : "disabled"}`
    );
  }

  public getThreadSettings(threadID: string): ThreadResendSettings | null {
    return this.data.get(threadID) || null;
  }

  public getAllEnabledThreads(): string[] {
    const enabledThreads: string[] = [];
    this.data.forEach((settings, threadID) => {
      if (settings.enabled) {
        enabledThreads.push(threadID);
      }
    });
    return enabledThreads;
  }

  public getStats(): {
    totalThreads: number;
    enabledThreads: number;
    disabledThreads: number;
  } {
    let enabled = 0;
    let disabled = 0;

    this.data.forEach((settings) => {
      if (settings.enabled) {
        enabled++;
      } else {
        disabled++;
      }
    });

    return {
      totalThreads: this.data.size,
      enabledThreads: enabled,
      disabledThreads: disabled,
    };
  }

  public clearThreadSettings(threadID: string): void {
    this.data.delete(threadID);
    this.saveData();
    console.log(`🗑️ Cleared resend settings for thread ${threadID}`);
  }

  public clearAllSettings(): void {
    this.data.clear();
    this.saveData();
    console.log("🗑️ Cleared all resend settings");
  }
}
