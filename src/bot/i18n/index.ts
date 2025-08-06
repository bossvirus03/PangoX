import { vi } from "./vi";
import { en } from "./en";
import { config } from "../config/ConfigManager";

export type Language = "vi" | "en";
export type LanguageData = typeof vi;

export const languages = {
  vi,
  en,
};

export class I18n {
  private currentLanguage: Language; // Will be set from config
  private userLanguages = new Map<string, Language>(); // Per-user language settings

  constructor() {
    // Get default language from config
    this.currentLanguage = config.getDefaultLanguage();
    console.log(
      `🌐 I18n initialized with default language: ${this.currentLanguage}`
    );
  }

  // Set language for specific user
  setUserLanguage(userID: string, language: Language): void {
    this.userLanguages.set(userID, language);
  }

  // Get language for specific user
  getUserLanguage(userID?: string): Language {
    if (userID && this.userLanguages.has(userID)) {
      return this.userLanguages.get(userID)!;
    }
    return this.currentLanguage;
  }

  // Set global default language
  setDefaultLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  // Get translation with optional parameters
  t(key: string, userID?: string, params?: Record<string, string>): string {
    const language = this.getUserLanguage(userID);
    const langData = languages[language];

    // Navigate through nested object path (e.g., "messages.help.title")
    const keys = key.split(".");
    let value: any = langData;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(
          `Translation key not found: ${key} for language: ${language}`
        );
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Replace parameters in the string
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, "g"), paramValue);
      }, value);
    }

    return value;
  }

  // Get command info for specific language
  getCommandInfo(commandName: string, userID?: string) {
    const language = this.getUserLanguage(userID);
    const langData = languages[language];

    if (langData.commands[commandName as keyof typeof langData.commands]) {
      return langData.commands[commandName as keyof typeof langData.commands];
    }

    return null;
  }

  // Get all available languages
  getAvailableLanguages(): Language[] {
    return Object.keys(languages) as Language[];
  }
}

// Global i18n instance
export const i18n = new I18n();
