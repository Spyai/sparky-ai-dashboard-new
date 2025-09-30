import React, { useState } from 'react';
import { Bell, User, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="flex items-center justify-between w-full h-16 px-4 border-b bg-zinc-900 border-zinc-800 sm:px-6">
      <div className="flex items-center min-w-0 gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          data-menu-button
          className="flex-shrink-0 p-2 transition-colors rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white truncate sm:text-xl">{t('dashboard')}</h2>
      </div>

      <div className="flex items-center flex-shrink-0 gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 transition-colors rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute flex items-center justify-center w-3 h-3 bg-red-500 rounded-full -top-1 -right-1">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-50 max-w-[calc(100vw-2rem)]">
              <div className="p-4 border-b border-zinc-700">
                <h3 className="font-medium text-white">Notifications</h3>
              </div>
              <div className="overflow-y-auto max-h-64">
                <div className="p-3 border-b cursor-pointer border-zinc-700 hover:bg-zinc-700">
                  <p className="text-sm text-white">Rain forecasted: Delay irrigation</p>
                  <p className="mt-1 text-xs text-zinc-400">2 hours ago</p>
                </div>
                <div className="p-3 border-b cursor-pointer border-zinc-700 hover:bg-zinc-700">
                  <p className="text-sm text-white">Use Zinc sulfate next week</p>
                  <p className="mt-1 text-xs text-zinc-400">5 hours ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center min-w-0 gap-2 sm:gap-3 text-zinc-400">
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden text-sm font-medium truncate sm:block">{user?.phone || 'User'}</span>
          <ChevronDown className="flex-shrink-0 hidden w-4 h-4 sm:block" />
        </div>
      </div>
    </header>
  );
};

export default Header;