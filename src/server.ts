import app from "./main";
import config from "./config/config";
import { startBot } from "./bot/bot";

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}/api`);
});

startBot();
