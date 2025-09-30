import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Settings,
  LogOut,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('dashboard'), path: '/' },
    { icon: Calendar, label: t('scheduler'), path: '/scheduler' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="mobile-sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64 h-screen 
          border-r bg-zinc-900 border-zinc-800 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Header with close button for mobile */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img src="https://www.sparkyai.in/lovable-uploads/5422e3a0-c113-4836-83dc-61eb88a401d4.png" style={{ height: '50px' }} alt="" />
            <h1 className="text-xl font-bold text-white">Sparky AI</h1>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={signOut}
            className="flex items-center w-full gap-3 px-3 py-2 transition-colors rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;