export interface BotEvent {
  type: string;
  threadID: string;
  messageID: string;
  body?: string;
  attachments?: any[];
  senderID: string;
  senderName?: string;
  isGroup: boolean;
  timestamp: number;
}

export interface BotAPI {
  setOptions: (options: any) => void;
  listenMqtt: (callback: (err: any, event: BotEvent) => void) => () => void;
  sendMessage: {
    // Overload 1: Simple message
    (message: string, threadID: string): Promise<any>;
    // Overload 2: With callback
    (
      message: string,
      threadID: string,
      callback: (err: any, messageInfo: any) => void
    ): void;
    // Overload 3: Reply to message
    (message: string, threadID: string, messageID: string): Promise<any>;
    // Overload 4: Reply to message with callback
    (
      message: string,
      threadID: string,
      messageID: string,
      callback: (err: any, messageInfo: any) => void
    ): void;
  };
  markAsRead: (threadID: string, callback?: (err: any) => void) => void;
}

export interface BotConfig {
  appStatePath: string;
}

export type MessageHandler = (api: BotAPI, event: BotEvent) => void;
