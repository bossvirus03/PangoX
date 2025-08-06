// Vietnamese language file
export const vi = {
  // Command names and descriptions
  commands: {
    help: {
      name: "help",
      description: "Hiển thị menu trợ giúp",
      usage: "/help",
      aliases: ["h", "menu", "trogiup"],
    },
    ping: {
      name: "ping",
      description: "Test phản hồi bot",
      usage: "/ping",
      aliases: ["p", "test"],
    },
    stop: {
      name: "stop",
      description: "Dừng bot",
      usage: "/stop",
      aliases: ["quit", "exit", "dung"],
    },
    time: {
      name: "time",
      description: "Xem thời gian hiện tại",
      usage: "/time",
      aliases: ["now", "date", "gio"],
    },
    echo: {
      name: "echo",
      description: "Lặp lại tin nhắn",
      usage: "/echo <tin nhắn>",
      aliases: ["repeat", "say"],
    },
    weather: {
      name: "weather",
      description: "Xem thông tin thời tiết của một địa điểm",
      usage: "/weather <địa điểm>",
      aliases: ["wt", "thoitiet"],
    },
    resend: {
      name: "resend",
      description: "Quản lý tính năng tự động gửi lại tin nhắn đã gỡ",
      usage: "/resend [on|off|status|stats] hoặc /resend [số lượng]",
      aliases: ["rs", "ungỡ"],
    },
    language: {
      name: "language",
      description: "Đổi ngôn ngữ bot",
      usage: "/language <en|vi>",
      aliases: ["lang", "ngonngu"],
    },
  },

  // Messages
  messages: {
    // Help command
    help: {
      title: "🤖 Menu Lệnh Bot",
      eventCommands: "📋 Lệnh Sự Kiện:",
      scheduleCommands: "⏰ Lệnh Tự Động:",
      usage: "💡 Sử dụng /{command_name} để thực hiện lệnh!",
      registryNotAvailable:
        "❌ Danh sách lệnh không khả dụng. Vui lòng thử lại sau.",
      commandNotFound:
        "❌ Không tìm thấy lệnh '{command}'. Sử dụng /help để xem tất cả lệnh.",
      commandDetails: "📖 Chi tiết lệnh: {command}",
      commandUsage: "🔧 Cách sử dụng: {usage}",
      commandAliases: "🔄 Các tên gọi khác: {aliases}",
      commandDescription: "📝 Mô tả: {description}",
      helpUsage: "💡 Sử dụng /help [tên_lệnh] để xem chi tiết lệnh cụ thể",
    },

    // Ping command
    ping: {
      response: "🏓 Pong! Bot đang hoạt động bình thường.",
    },

    // Stop command
    stop: {
      response: "👋 Bot đang dừng lại... Tạm biệt!",
    },

    // Time command
    time: {
      current: "🕒 Thời gian hiện tại:",
    },

    // Echo command
    echo: {
      noText: "❌ Vui lòng nhập text để echo!",
      usage: "❌ {usage}\nVí dụ: /echo Xin chào thế giới",
      response: "🔊 {text}",
    },

    // Config command
    config: {
      noPermission: "❌ Bạn không có quyền sử dụng lệnh này!",
      reloadSuccess: "✅ Config đã được reload thành công!",
      reloadError: "❌ Lỗi khi reload config!",
      updateSuccess: "✅ Config đã được cập nhật: {key} = {value}",
      updateError: "❌ Lỗi khi cập nhật config!",
      keyNotFound: "❌ Không tìm thấy key config: {key}",
      invalidValue: "❌ Giá trị không hợp lệ! Kiểm tra format JSON.",
    },

    // Weather command
    weather: {
      noLocation: "❌ Vui lòng nhập tên địa điểm!\nVí dụ: /weather Hà Nội",
      loading: "🔍 Đang tìm kiếm thông tin thời tiết cho {location}...",
      notFound:
        "❌ Không tìm thấy thông tin thời tiết cho '{location}'. Vui lòng kiểm tra lại tên địa điểm.",
      result: `{emoji} **Thời tiết tại {location}, {country}**

🌡️ **Nhiệt độ**: {temp}°C (cảm giác như {feelsLike}°C)
🌤️ **Tình trạng**: {description}
💧 **Độ ẩm**: {humidity}%
📊 **Áp suất**: {pressure} hPa
💨 **Gió**: {windSpeed} km/h hướng {windDirection}
👁️ **Tầm nhìn**: {visibility} km

🌅 **Mặt trời mọc**: {sunrise}
🌇 **Mặt trời lặn**: {sunset}

⏰ *Cập nhật lúc: {time}*`,
    },

    // Resend command
    resend: {
      globalDisabled: "❌ Tính năng resend bị tắt ở cấp độ toàn cầu.",
      adminOnly: "❌ Chỉ admin mới có thể sử dụng tính năng này.",
      threadEnabled:
        "✅ Đã bật tính năng resend cho nhóm này. Các tin nhắn bị gỡ sẽ tự động được gửi lại.",
      threadDisabled:
        "❌ Tính năng resend đã bị tắt cho nhóm này.\n💡 Sử dụng '/resend on' để bật.",
      noDeletedMessages: "📭 Chưa có tin nhắn nào bị gỡ trong nhóm này.",
      noMessagesFromUser: "📭 Không tìm thấy tin nhắn đã gỡ của user '{user}'.",
      header: "🗂️ **{count} tin nhắn gần đây đã bị gỡ** (tổng cộng: {total})",
      mediaOnly: "[Media/Sticker/File]",
      attachments: "tệp đính kèm",
      usage:
        "\n💡 Cách dùng:\n• /resend on - Bật tự động resend\n• /resend off - Tắt tự động resend\n• /resend status - Xem trạng thái\n• /resend 10 - Xem 10 tin nhắn gần nhất",
      status: {
        header: "📊 **Trạng thái Resend**",
        global: "🌐 Toàn cầu: {status}",
        thread: "💬 Nhóm này: {status}",
        cached: "💾 Đã lưu: {count} tin nhắn",
      },
      stats: {
        header: "📈 **Thống kê Resend**",
        threads: "💬 Nhóm: {total} tổng cộng ({enabled} bật, {disabled} tắt)",
        messages: "💾 Tin nhắn: {total} trong {threads} nhóm",
      },
      timeAgo: {
        seconds: "{time} giây trước",
        minutes: "{time} phút trước",
        hours: "{time} giờ trước",
        days: "{time} ngày trước",
      },
    },

    // Cooldown system
    cooldown: {
      active:
        "⏱️ Bạn đang trong thời gian chờ! Vui lòng đợi {seconds} giây nữa trước khi sử dụng lệnh khác.",
      global:
        "⏱️ Hệ thống đang trong thời gian chờ toàn cục! Vui lòng đợi {seconds} giây.",
    },

    // General
    general: {
      error: "❌ Đã xảy ra lỗi khi xử lý lệnh.",
      loginSuccess: "✅ Đăng nhập Facebook thành công!",
      loginFailed: "❌ Đăng nhập Facebook thất bại:",
      botStarted: "🎉 Facebook Bot đã khởi động thành công!",
      testMessageSent: "✅ Tin nhắn test đã được gửi thành công",
      testMessageFailed: "❌ Không thể gửi tin nhắn test:",
      listeningMessages: "👂 Bắt đầu lắng nghe tin nhắn...",
    },

    // Schedule commands
    schedule: {
      dailyGreeting: "🌅 Chào buổi sáng! Chúc bạn một ngày tốt lành!",
      hourlyStatus: "⏰ Bot đang hoạt động bình thường lúc {time}",
      weeklyReport:
        "📊 Báo cáo tuần: Bot đã hoạt động {days} ngày trong tuần này.",
    },
  },
};
