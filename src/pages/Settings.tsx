import React, { useState, useEffect } from 'react';
import { User, Globe, Bell, Shield, Info, Save, Phone, Mail, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import { APIUsageDashboard } from '../components/Dashboard/APIUsageDashboard';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'notifications' | 'privacy' | 'api' | 'about'>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: user?.phone || '',
  });
  const [notifications, setNotifications] = useState({
    weatherAlerts: true,
    cropHealthAlerts: true,
    activityReminders: true,
    marketPrices: false,
    systemUpdates: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }

    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      localStorage.setItem('notificationSettings', JSON.stringify(notifications));
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (_error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setMessage({ type: 'success', text: 'Language changed successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('profile')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {t('phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400 placeholder-zinc-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Phone number cannot be changed</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-700">
              <h4 className="text-md font-medium text-white mb-3">Account Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={signOut}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-left"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('language')}</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Choose your preferred language for the application interface.
              </p>
              
              <div className="space-y-3">
                {[
                  { code: 'en', name: 'English', nativeName: 'English' },
                  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
                  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full p-4 rounded-lg border transition-colors text-left ${
                      language === lang.code
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lang.name}</p>
                        <p className="text-sm opacity-75">{lang.nativeName}</p>
                      </div>
                      {language === lang.code && (
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('notifications')}</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Manage your notification preferences to stay informed about important updates.
              </p>
              
              <div className="space-y-4">
                {[
                  { key: 'weatherAlerts', label: 'Weather Alerts', description: 'Get notified about weather changes that may affect your crops' },
                  { key: 'cropHealthAlerts', label: 'Crop Health Alerts', description: 'Receive alerts when crop health indices change significantly' },
                  { key: 'activityReminders', label: 'Activity Reminders', description: 'Get reminded about scheduled farm activities' },
                  { key: 'marketPrices', label: 'Market Price Updates', description: 'Stay updated with current market prices for your crops' },
                  { key: 'systemUpdates', label: 'System Updates', description: 'Get notified about new features and system updates' },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-start justify-between p-4 bg-zinc-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{label}</h4>
                      <p className="text-zinc-400 text-sm mt-1">{description}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}
                      className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key as keyof typeof notifications] ? 'bg-blue-500' : 'bg-zinc-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('privacy')}</h3>
              <div className="space-y-6">
                <div className="bg-zinc-800 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-3">Data Collection</h4>
                  <p className="text-zinc-400 text-sm mb-4">
                    We collect data to provide you with personalized farming insights and recommendations. 
                    This includes farm location, crop health data, and activity logs.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Location Data</span>
                      <span className="text-green-400 text-sm">Required</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Crop Health Data</span>
                      <span className="text-green-400 text-sm">Required</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Usage Analytics</span>
                      <span className="text-blue-400 text-sm">Optional</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-3">Data Sharing</h4>
                  <p className="text-zinc-400 text-sm mb-4">
                    Your data is never shared with third parties without your explicit consent. 
                    We use aggregated, anonymized data to improve our AI models.
                  </p>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    View Privacy Policy
                  </button>
                </div>

                <div className="bg-zinc-800 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-3">Data Export & Deletion</h4>
                  <p className="text-zinc-400 text-sm mb-4">
                    You have the right to export or delete your data at any time.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                      Export My Data
                    </button>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">AI API Usage</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Monitor and manage your AI API usage to control costs and optimize performance.
              </p>
              <APIUsageDashboard />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">{t('about')}</h3>
              <div className="space-y-6">
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-xl">Sparky AI</h4>
                      <p className="text-zinc-400">Version 1.0.0</p>
                    </div>
                  </div>
                  <p className="text-zinc-300 mb-4">
                    Empowering farmers with AI-driven insights for modern agriculture. 
                    Our platform combines satellite imagery, weather data, and machine learning 
                    to provide actionable recommendations for optimal crop management.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-zinc-400">Last Updated:</span>
                      <span className="text-white ml-2">January 2025</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Build:</span>
                      <span className="text-white ml-2">2025.01.15</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-3">Features</h4>
                  <ul className="space-y-2 text-zinc-300 text-sm">
                    <li>• Real-time crop health monitoring using satellite imagery</li>
                    <li>• AI-powered farming recommendations</li>
                    <li>• Weather forecasting and alerts</li>
                    <li>• Activity scheduling and management</li>
                    <li>• Comprehensive reporting and analytics</li>
                    <li>• Multi-language support</li>
                  </ul>
                </div>

                <div className="bg-zinc-800 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-3">Support</h4>
                  <p className="text-zinc-400 text-sm mb-4">
                    Need help? Our support team is here to assist you.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">support@sparkyai.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-3">Legal</h4>
                  <div className="space-y-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Terms of Service</button>
                    <button className="text-blue-400 hover:text-blue-300 text-sm block">Privacy Policy</button>
                    <button className="text-blue-400 hover:text-blue-300 text-sm block">License Agreement</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">{t('Settings')}</h1>
              {(activeTab === 'profile' || activeTab === 'notifications') && (
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : t('save')}
                </button>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-900/20 border-green-800 text-green-400' 
                  : 'bg-red-900/20 border-red-800 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <nav className="space-y-2">
                    {[
                      { key: 'profile', label: t('profile'), icon: User },
                      { key: 'language', label: t('language'), icon: Globe },
                      { key: 'notifications', label: t('notifications'), icon: Bell },
                      { key: 'privacy', label: t('privacy'), icon: Shield },
                      { key: 'api', label: 'API Usage', icon: BarChart3 },
                      { key: 'about', label: t('about'), icon: Info },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key as 'profile' | 'language' | 'notifications' | 'privacy' | 'api' | 'about')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          activeTab === key
                            ? 'bg-blue-500 text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3">
                <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;