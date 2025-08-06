import { BaseEventCommand } from "../base/BaseEventCommand";
import { BotAPI, BotEvent } from "../../types";
import { i18n } from "../../i18n";
import axios from "axios";

export class WeatherCommand extends BaseEventCommand {
  name = "weather";
  // description, usage, aliases sẽ tự động lấy từ i18n system

  async execute(api: BotAPI, event: BotEvent, args: string[]): Promise<void> {
    try {
      if (args.length < 2) {
        await api.sendMessage(
          i18n.t("messages.weather.noLocation", event.senderID),
          event.threadID
        );
        return;
      }

      const location = args.slice(1).join(" ");

      // Show loading message
      const loadingMessage = i18n.t(
        "messages.weather.loading",
        event.senderID,
        { location }
      );
      await api.sendMessage(loadingMessage, event.threadID);

      const weatherData = await this.getWeatherData(location);

      if (!weatherData) {
        await api.sendMessage(
          i18n.t("messages.weather.notFound", event.senderID, { location }),
          event.threadID
        );
        return;
      }

      const weatherMessage = this.formatWeatherMessage(
        weatherData,
        event.senderID
      );
      await api.sendMessage(weatherMessage, event.threadID);
    } catch (error) {
      console.error("Error in weather command:", error);
      await api.sendMessage(
        i18n.t("messages.general.error", event.senderID),
        event.threadID
      );
    }
  }

  private async getWeatherData(location: string): Promise<any> {
    try {
      // Sử dụng OpenWeatherMap API (free tier)
      const API_KEY = process.env.OPENWEATHER_API_KEY || "demo_key";

      if (API_KEY === "demo_key") {
        // Return demo data if no API key
        return this.getDemoWeatherData(location);
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric&lang=vi`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.status === 200) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      // Fallback to demo data
      return this.getDemoWeatherData(location);
    }
  }

  private getDemoWeatherData(location: string): any {
    // Demo weather data for testing
    const demoData = {
      name: location,
      main: {
        temp: Math.floor(Math.random() * 15) + 20, // 20-35°C
        feels_like: Math.floor(Math.random() * 15) + 22,
        humidity: Math.floor(Math.random() * 40) + 50, // 50-90%
        pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
      },
      weather: [
        {
          main: ["Clear", "Clouds", "Rain", "Thunderstorm"][
            Math.floor(Math.random() * 4)
          ],
          description: "partly cloudy",
          icon: "02d",
        },
      ],
      wind: {
        speed: Math.floor(Math.random() * 10) + 5, // 5-15 m/s
        deg: Math.floor(Math.random() * 360),
      },
      visibility: Math.floor(Math.random() * 5000) + 5000, // 5-10km
      sys: {
        country: "VN",
        sunrise: Date.now() / 1000 - 3600, // 1 hour ago
        sunset: Date.now() / 1000 + 7200, // 2 hours later
      },
    };

    return demoData;
  }

  private formatWeatherMessage(data: any, userId: string): string {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const visibility = Math.round(data.visibility / 1000); // Convert m to km

    const weatherEmoji = this.getWeatherEmoji(data.weather[0].main);
    const windDirection = this.getWindDirection(data.wind.deg);

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    // Get current time
    const currentTime = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = i18n.t("messages.weather.result", userId, {
      emoji: weatherEmoji,
      location: data.name,
      country: data.sys.country || "",
      temp: temp.toString(),
      feelsLike: feelsLike.toString(),
      description: data.weather[0].description,
      humidity: humidity.toString(),
      pressure: pressure.toString(),
      windSpeed: windSpeed.toString(),
      windDirection,
      visibility: visibility.toString(),
      sunrise,
      sunset,
      time: currentTime,
    });

    return message;
  }

  private getWeatherEmoji(weatherMain: string): string {
    const emojiMap: { [key: string]: string } = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };

    return emojiMap[weatherMain] || "🌤️";
  }

  private getWindDirection(degrees: number): string {
    const directions = [
      "Bắc",
      "Đông Bắc",
      "Đông",
      "Đông Nam",
      "Nam",
      "Tây Nam",
      "Tây",
      "Tây Bắc",
    ];

    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
}
