import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

interface CachedMessage {
  messageID: string;
  senderID: string;
  threadID: string;
  body: string;
  attachments?: any[];
  timestamp: number;
}

export class ResendCommand extends BaseEventCommand {
  name = "resend";

  private static threadSettings: Map<string, boolean> = new Map();
  private static cachedMessages: Map<string, CachedMessage[]> = new Map();
  private static maxStoredMessages = 50;
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    console.log(`📡 ${this.name} command initialized for event listening`);
  }

  /**
   * Check if resend is enabled for a thread
   */
  private static isResendEnabled(threadID: string): boolean {
    return ResendCommand.threadSettings.get(threadID) || false;
  }

  /**
   * Set resend enabled/disabled for a thread
   */
  private static setResendEnabled(threadID: string, enabled: boolean): void {
    ResendCommand.threadSettings.set(threadID, enabled);
  }

  /**
   * Cache message for potential resend
   */
  private static cacheMessage(event: BotEvent): void {
    if (!event.messageID || !event.threadID) return;

    const message: CachedMessage = {
      messageID: event.messageID,
      senderID: event.senderID || "unknown",
      threadID: event.threadID,
      body: event.body || "",
      attachments: event.attachments || [],
      timestamp: Date.now(),
    };

    if (!ResendCommand.cachedMessages.has(event.threadID)) {
      ResendCommand.cachedMessages.set(event.threadID, []);
    }

    const threadCache = ResendCommand.cachedMessages.get(event.threadID)!;

    // Check if already cached
    const exists = threadCache.some((msg) => msg.messageID === event.messageID);
    if (!exists) {
      threadCache.push(message);

      // Keep only recent messages
      if (threadCache.length > ResendCommand.maxStoredMessages) {
        threadCache.shift();
      }
    }

    // Clean old messages
    const now = Date.now();
    const filtered = threadCache.filter(
      (msg) => now - msg.timestamp < ResendCommand.cacheTimeout
    );
    ResendCommand.cachedMessages.set(event.threadID, filtered);
  }

  /**
   * Handle message unsend - resend the deleted message
   */
  private static async handleMessageUnsend(
    api: BotAPI,
    event: BotEvent
  ): Promise<void> {
    if (!event.messageID || !event.threadID) return;

    const threadCache = ResendCommand.cachedMessages.get(event.threadID) || [];
    const originalMessage = threadCache.find(
      (msg) => msg.messageID === event.messageID
    );

    if (!originalMessage) return;

    try {
      // Get sender name
      let senderName = `User ${originalMessage.senderID}`;

      const resendBody = `🔄 **Tin nhắn đã bị gỡ:**\n👤 **${senderName}**\n💬 ${originalMessage.body || "[Media/Sticker/File]"}`;

      // If no attachments, just send text
      if (
        !originalMessage.attachments ||
        originalMessage.attachments.length === 0
      ) {
        await api.sendMessage(resendBody, event.threadID);
        return;
      }

      // Handle attachments
      const attachments = originalMessage.attachments;
      const downloadedAttachments: any[] = [];
      let completed = 0;

      const onFinish = async () => {
        if (++completed === attachments.length) {
          try {
            await api.sendMessage(
              {
                body: resendBody,
                attachment: downloadedAttachments,
              } as any,
              event.threadID
            );
          } catch (error) {
            // Fallback: send text with attachment info
            await api.sendMessage(
              resendBody + `\n📎 ${attachments.length} tệp đính kèm`,
              event.threadID
            );
          }
        }
      };

      // Download each attachment
      attachments.forEach(async (attachment, index) => {
        if (attachment.url) {
          try {
            const publicDir = path.join(process.cwd(), "public", "images");
            if (!fs.existsSync(publicDir)) {
              fs.mkdirSync(publicDir, { recursive: true });
            }

            const filePath = path.join(
              publicDir,
              `resend_${index}_${Date.now()}.jpg`
            );
            const response = await axios.get(attachment.url, {
              responseType: "arraybuffer",
              timeout: 10000,
            });

            fs.writeFileSync(filePath, Buffer.from(response.data));
            downloadedAttachments.push(fs.createReadStream(filePath));
          } catch (error) {
            console.error(`Error downloading attachment ${index}:`, error);
          }
        }
        onFinish();
      });
    } catch (error) {
      console.error("Error handling message unsend:", error);
    }
  }

  /**
   * Handle events - cache messages and handle unsends
   */
  public onEvent(api: BotAPI, event: BotEvent): void {
    // Only work if resend is enabled for this thread
    if (!ResendCommand.isResendEnabled(event.threadID)) return;

    if (event.type === "message" && event.messageID) {
      ResendCommand.cacheMessage(event);
    }

    if (event.type === "message_unsend" && event.messageID) {
      ResendCommand.handleMessageUnsend(api, event);
    }
  }

  /**
   * Execute command - handle on/off/status
   */
  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    if (!args[1]) {
      await api.sendMessage(
        "📋 **Resend Command**\n\n" +
          "🔹 `/resend on` - Bật resend cho nhóm này\n" +
          "🔹 `/resend off` - Tắt resend cho nhóm này\n" +
          "🔹 `/resend status` - Xem trạng thái resend",
        event.threadID
      );
      return;
    }

    const subCommand = args[1].toLowerCase();

    switch (subCommand) {
      case "on":
      case "enable":
        ResendCommand.setResendEnabled(event.threadID, true);
        await api.sendMessage("✅ **Resend đã được bật!**", event.threadID);
        break;

      case "off":
      case "disable":
        ResendCommand.setResendEnabled(event.threadID, false);
        ResendCommand.cachedMessages.delete(event.threadID); // Clear cache
        await api.sendMessage("❌ **Resend đã được tắt!**", event.threadID);
        break;

      case "status":
        const isEnabled = ResendCommand.isResendEnabled(event.threadID);
        const cacheCount = (
          ResendCommand.cachedMessages.get(event.threadID) || []
        ).length;

        await api.sendMessage(
          `📊 **Trạng thái Resend**\n\n` +
            `🎯 **Trạng thái**: ${isEnabled ? "✅ Đang bật" : "❌ Đang tắt"}\n` +
            `💾 **Tin nhắn đã lưu**: ${cacheCount}/${ResendCommand.maxStoredMessages}`,
          event.threadID
        );
        break;

      default:
        await api.sendMessage(
          "❌ **Lệnh không hợp lệ!**\nChỉ có thể sử dụng: `on`, `off`, `status`",
          event.threadID
        );
    }
  }
}
