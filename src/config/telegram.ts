// Telegram Bot Configuration
// Replace these values with your actual Telegram bot credentials

export const TELEGRAM_CONFIG = {
  // Your Telegram bot token (get from @BotFather)
  BOT_TOKEN: '8177357014:AAGwfcsiRmtv51I-mSobCmnHT0ZS8I49AKI',
  
  // Your chat ID where notifications will be sent
  // You can get this by messaging your bot and checking: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  CHAT_ID: '652404532',
  
  // Enable/disable notifications
  ENABLED: true,
  
  // Notification types to send
  NOTIFICATIONS: {
    QUIZ_CREATED: true,
    QUIZ_JOINED: true,
    QUIZ_COMPLETED: true,
    NEW_ACCOUNT: true,
    USER_LOGIN: true,
  }
};

// Instructions for setup:
// 1. Create a bot with @BotFather on Telegram
// 2. Get your bot token from @BotFather
// 3. Start a chat with your bot
// 4. Send a message to your bot
// 5. Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
// 6. Find your chat_id in the response
// 7. Replace the values above with your actual credentials 