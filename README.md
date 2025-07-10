# 🧠 U KNOW ME - Personality Quiz App

A modern, interactive personality quiz application built with React, Vite, Tailwind CSS, and Firebase. Create, share, and take personality quizzes with real-time results and analytics.

## ✨ Features

### 🎯 Quiz Creation
- **Multi-step quiz builder** with auto-save functionality
- **Unlimited questions** with multiple choice options
- **Real-time preview** of quiz content
- **Auto-save progress** - never lose your work
- **One-click quiz code copying**

### 👥 Quiz Taking
- **Join quizzes** using unique quiz codes
- **Beautiful, responsive interface**
- **Real-time scoring** and results
- **Performance analytics** with emoji indicators

### 👑 Creator Space
- **Dashboard** for managing all your quizzes
- **Results analytics** with detailed insights
- **Quiz editing** and management tools
- **Account management** with secure access

### 🔧 Developer Features
- **Admin panel** for platform management
- **Telegram notifications** for new accounts and activities
- **User analytics** and insights
- **Creator account management**

### 🔔 Notifications
- **Telegram integration** for real-time alerts
- **New account notifications** with credentials
- **Quiz creation alerts**
- **Quiz completion notifications**

## 🚀 Live Demo

**Live App:** [https://u-know-me-d8a51.web.app](https://u-know-me-d8a51.web.app)

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Firestore + Auth)
- **Deployment:** Firebase Hosting
- **Notifications:** Telegram Bot API

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Telegram bot (optional, for notifications)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/u-know-me.git
   cd u-know-me
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication (optional)
   - Get your Firebase config

4. **Configure Firebase**
   - Update `src/firebase/config.ts` with your Firebase credentials
   - Initialize Firebase in your project

5. **Telegram Setup (Optional)**
   - Create a bot with @BotFather
   - Update `src/config/telegram.ts` with your bot token and chat ID

6. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

## 🎮 Usage

### Creating a Quiz
1. Go to Creator Space
2. Click "Create New Quiz"
3. Enter your name
4. Add questions and options
5. Set correct answers
6. Publish and share the quiz code

### Taking a Quiz
1. Click "Join Quiz"
2. Enter the quiz code
3. Answer all questions
4. View your results and performance

### Managing Quizzes
1. Access Creator Space
2. View all your quizzes
3. Check results and analytics
4. Edit or delete quizzes as needed

## 🔧 Configuration

### Telegram Notifications
Update `src/config/telegram.ts`:
```typescript
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: 'your_bot_token',
  CHAT_ID: 'your_chat_id',
  ENABLED: true,
  NOTIFICATIONS: {
    QUIZ_CREATED: true,
    QUIZ_JOINED: true,
    QUIZ_COMPLETED: true,
    NEW_ACCOUNT: true,
  }
};
```

### Firebase Configuration
Update `src/firebase/config.ts` with your Firebase project settings.

## 🚀 Deployment

### Firebase Hosting
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CreateQuiz.tsx   # Quiz creation interface
│   ├── JoinQuiz.tsx     # Quiz joining interface
│   ├── QuizScreen.tsx   # Quiz taking interface
│   ├── ResultsScreen.tsx # Results display
│   ├── CreatorSpace.tsx # Creator dashboard
│   ├── DeveloperPanel.tsx # Admin panel
│   └── ...
├── config/              # Configuration files
│   └── telegram.ts      # Telegram bot config
├── services/            # Service layer
│   └── telegramService.ts # Telegram notifications
├── firebase/            # Firebase configuration
│   └── config.ts        # Firebase setup
└── ...
```

## 🔐 Security Features

- **Creator authentication** with localStorage
- **Secure quiz access** via unique codes
- **Developer panel** with password protection
- **Telegram notifications** for security monitoring

## 🎨 Customization

### Styling
The app uses Tailwind CSS for styling. Customize colors and themes in `src/index.css`.

### Components
All components are modular and can be easily customized or extended.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** for the amazing framework
- **Vite** for the fast build tool
- **Tailwind CSS** for the beautiful styling
- **Firebase** for the backend services
- **Telegram** for the notification system

## 📞 Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ by the U KNOW ME team**
