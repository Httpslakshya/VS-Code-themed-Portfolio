import React from 'react';
import { Github } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Tab[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, tabs }) => {
  const { theme } = useTheme();

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-[#f3f3f3]',
          border: 'border-gray-300',
          text: 'text-gray-900',
          textSecondary: 'text-gray-600',
          hover: 'hover:bg-gray-200',
          active: 'bg-gray-200 border-l-2 border-blue-600'
        };
      case 'monokai':
        return {
          bg: 'bg-[#272822]',
          border: 'border-[#3e3d32]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#75715e]',
          hover: 'hover:bg-[#3e3d32]',
          active: 'bg-[#3e3d32] border-l-2 border-[#a6e22e]'
        };
      case 'dracula':
        return {
          bg: 'bg-[#282a36]',
          border: 'border-[#44475a]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#6272a4]',
          hover: 'hover:bg-[#44475a]',
          active: 'bg-[#44475a] border-l-2 border-[#bd93f9]'
        };
      case 'neon':
        return {
          bg: 'bg-black',
          border: 'border-[#00ff00]',
          text: 'text-[#00ff00]',
          textSecondary: 'text-[#008000]',
          hover: 'hover:bg-[#001100]',
          active: 'bg-[#001100] border-l-2 border-[#00ff00]'
        };
      case 'anime':
        return {
          bg: 'bg-gradient-to-b from-pink-100 to-purple-100',
          border: 'border-pink-300',
          text: 'text-purple-900',
          textSecondary: 'text-pink-600',
          hover: 'hover:bg-pink-200',
          active: 'bg-pink-200 border-l-2 border-purple-500'
        };
      default:
        return {
          bg: 'bg-[#252526]',
          border: 'border-[#3c3c3c]',
          text: 'text-white',
          textSecondary: 'text-[#cccccc]',
          hover: 'hover:bg-[#2a2d2e]',
          active: 'bg-[#37373d] border-l-2 border-[#007ACC]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const getTabLabel = (tab: Tab) => {
    if (theme === 'anime') {
      switch (tab.id) {
        case 'about': return 'backstory.tsx';
        case 'projects': return 'missions.tsx';
        case 'skills': return 'power-level.tsx';
        case 'contact': return 'summon.tsx';
        case 'playground': return 'dojo.tsx';
        default: return tab.label;
      }
    }
    return tab.label;
  };

  return (
    <div className={`fixed left-0 top-8 bottom-0 w-64 ${themeClasses.bg} border-r ${themeClasses.border} flex flex-col z-30`}>
      {/* Header */}
      <div className={`p-4 border-b ${themeClasses.border}`}>
        <div className="flex items-center space-x-2">
          <Github className="w-5 h-5 text-[#007ACC]" />
          <span className={`${themeClasses.text} font-medium ${theme === 'anime' ? 'font-zen' : ''}`}>
            {theme === 'anime' ? '🌸 LAKSHYA-SAMA' : 'LAKSHYA DHARKAR'}
          </span>
        </div>
        <p className={`${themeClasses.textSecondary} text-sm mt-1`}>
          {theme === 'anime' ? 'Code Shinobi 🥷' : 'Fullstack Developer'}
        </p>
      </div>

      {/* Explorer */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="mb-3">
          <div className={`flex items-center space-x-2 ${themeClasses.textSecondary} text-xs uppercase tracking-wide mb-2`}>
            <span>{theme === 'anime' ? '🗂️ Scrolls' : 'Explorer'}</span>
          </div>
        </div>

        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-left transition-all duration-200 ${
                  isActive
                    ? `${themeClasses.active} ${themeClasses.text}`
                    : `${themeClasses.textSecondary} ${themeClasses.hover} hover:${themeClasses.text}`
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#007ACC]' : ''}`} />
                <span className={`text-sm font-mono ${theme === 'anime' ? 'font-zen' : ''}`}>
                  {getTabLabel(tab)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${themeClasses.border}`}>
        <div className={`flex items-center justify-between ${themeClasses.textSecondary} text-xs`}>
          <span>{theme === 'anime' ? 'Chakra v2.0.0' : 'Version 2.0.0'}</span>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{theme === 'anime' ? 'Powered Up' : 'Online'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;