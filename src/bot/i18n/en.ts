// English language file
export const en = {
  // Command names and descriptions
  commands: {
    help: {
      name: "help",
      // Resend command
      resend: {
        globalDisabled: "❌ Resend feature is globally disabled.",
        adminOnly: "❌ Only admins can use this feature.",
        threadEnabled:
          "✅ Resend feature enabled for this thread. Deleted messages will be auto-resent.",
        threadDisabled:
          "❌ Resend feature is disabled for this thread.\n💡 Use '/resend on' to enable.",
        noDeletedMessages: "📭 No deleted messages found in this thread.",
        noMessagesFromUser: "📭 No deleted messages found from user '{user}'.",
        header: "🗂️ **{count} recent deleted messages** (total: {total})",
        mediaOnly: "[Media/Sticker/File]",
        attachments: "attachments",
        usage:
          "\n💡 Usage:\n• /resend on - Enable auto-resend\n• /resend off - Disable auto-resend\n• /resend status - View status\n• /resend 10 - View last 10 messages",
        status: {
          header: "📊 **Resend Status**",
          global: "🌐 Global: {status}",
          thread: "💬 This thread: {status}",
          cached: "💾 Cached: {count} messages",
        },
        stats: {
          header: "📈 **Resend Statistics**",
          threads:
            "💬 Threads: {total} total ({enabled} enabled, {disabled} disabled)",
          messages: "💾 Messages: {total} in {threads} threads",
        },
        timeAgo: {
          seconds: "{time} seconds ago",
          minutes: "{time} minutes ago",
          hours: "{time} hours ago",
          days: "{time} days ago",
        },
      },

      help: {
        name: "help",
        description: "Show help menu",
        usage: "/help",
        aliases: ["h", "menu", "assistance"],
      },
      ping: {
        name: "ping",
        description: "Test bot response",
        usage: "/ping",
        aliases: ["p", "test"],
      },
      stop: {
        name: "stop",
        description: "Stop the bot",
        usage: "/stop",
        aliases: ["quit", "exit", "shutdown"],
      },
      time: {
        name: "time",
        description: "Show current time",
        usage: "/time",
        aliases: ["now", "date", "clock"],
      },
      echo: {
        name: "echo",
        description: "Repeat a message",
        usage: "/echo <message>",
        aliases: ["repeat", "say"],
      },
      weather: {
        name: "weather",
        description: "Get weather information for a location",
        usage: "/weather <location>",
        aliases: ["wt", "forecast"],
      },
      language: {
        name: "language",
        description: "Change bot language",
        usage: "/language <en|vi>",
        aliases: ["lang", "locale"],
      },
    },

    // Messages
    messages: {
      // Help command
      help: {
        title: "🤖 Bot Commands Menu",
        eventCommands: "📋 Event Commands:",
        scheduleCommands: "⏰ Scheduled Commands:",
        usage: "💡 Use /{command_name} to execute commands!",
        registryNotAvailable:
          "❌ Command registry not available. Please try again later.",
        commandNotFound:
          "❌ Command '{command}' not found. Use /help to see all commands.",
        commandDetails: "📖 Command details: {command}",
        commandUsage: "🔧 Usage: {usage}",
        commandAliases: "🔄 Aliases: {aliases}",
        commandDescription: "📝 Description: {description}",
        helpUsage:
          "💡 Use /help [command_name] to see specific command details",
      },

      // Ping command
      ping: {
        response: "🏓 Pong! Bot is working normally.",
      },

      // Stop command
      stop: {
        response: "👋 Bot is shutting down... Goodbye!",
      },

      // Time command
      time: {
        current: "🕒 Current time:",
      },

      // Echo command
      echo: {
        noText: "❌ Please enter text to echo!",
        usage: "❌ {usage}\nExample: /echo Hello World",
        response: "🔊 {text}",
      },

      // Config command
      config: {
        noPermission: "❌ You don't have permission to use this command!",
        reloadSuccess: "✅ Config reloaded successfully!",
        reloadError: "❌ Failed to reload config!",
        updateSuccess: "✅ Config updated: {key} = {value}",
        updateError: "❌ Failed to update config!",
        keyNotFound: "❌ Config key not found: {key}",
        invalidValue: "❌ Invalid value! Check JSON format.",
      },

      // Cooldown system
      cooldown: {
        active:
          "⏱️ You're on cooldown! Please wait {seconds} second(s) before using another command.",
        global: "⏱️ Global cooldown active! Please wait {seconds} second(s).",
      },

      // Weather command
      weather: {
        noLocation:
          "❌ Please enter a location name!\nExample: /weather London",
        loading: "🔍 Searching weather information for {location}...",
        notFound:
          "❌ Weather information not found for '{location}'. Please check the location name.",
        result: `{emoji} **Weather in {location}, {country}**

🌡️ **Temperature**: {temp}°C (feels like {feelsLike}°C)
🌤️ **Condition**: {description}
💧 **Humidity**: {humidity}%
📊 **Pressure**: {pressure} hPa
💨 **Wind**: {windSpeed} km/h from {windDirection}
👁️ **Visibility**: {visibility} km

🌅 **Sunrise**: {sunrise}
🌇 **Sunset**: {sunset}

⏰ *Updated at: {time}*`,
      },

      // Resend command
      resend: {
        disabled:
          "❌ Deleted message viewing feature is currently disabled.\n💡 Admin needs to reconfigure the bot to enable this feature.",
        adminOnly: "❌ Only admins can use this feature.",
        noDeletedMessages: "📭 No deleted messages found in this group.",
        noMessagesFromUser: "📭 No deleted messages found from user '{user}'.",
        header: "🗂️ **{count} recent deleted messages** (total: {total})",
        mediaOnly: "[Media/Sticker/File]",
        attachments: "attachments",
        usage:
          "\n💡 Usage:\n• /resend - last 5 messages\n• /resend 10 - last 10 messages\n• /resend @user - messages from specific user",
        timeAgo: {
          seconds: "{time} seconds ago",
          minutes: "{time} minutes ago",
          hours: "{time} hours ago",
          days: "{time} days ago",
        },
      },

      // General
      general: {
        error: "❌ An error occurred while processing the command.",
        loginSuccess: "✅ Facebook login successful!",
        loginFailed: "❌ Facebook login failed:",
        botStarted: "🎉 Facebook Bot started successfully!",
        testMessageSent: "✅ Test message sent successfully",
        testMessageFailed: "❌ Failed to send test message:",
        listeningMessages: "👂 Starting to listen for messages...",
      },

      // Schedule commands
      schedule: {
        dailyGreeting: "🌅 Good morning! Have a great day!",
        hourlyStatus: "⏰ Bot is running normally at {time}",
        weeklyReport:
          "📊 Weekly report: Bot has been active for {days} days this week.",
      },
    },
  },
};
