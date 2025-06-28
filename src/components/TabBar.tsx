import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface TabBarProps {
  activeTab: string;
  tabs: Tab[];
  onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, tabs, onTabChange }) => {
  const { theme } = useTheme();
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-[#f3f3f3]',
          activeBg: 'bg-white',
          border: 'border-gray-300',
          text: 'text-gray-900',
          textSecondary: 'text-gray-600'
        };
      case 'monokai':
        return {
          bg: 'bg-[#272822]',
          activeBg: 'bg-[#3e3d32]',
          border: 'border-[#3e3d32]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#75715e]'
        };
      case 'dracula':
        return {
          bg: 'bg-[#282a36]',
          activeBg: 'bg-[#44475a]',
          border: 'border-[#44475a]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#6272a4]'
        };
      case 'neon':
        return {
          bg: 'bg-black',
          activeBg: 'bg-[#001100]',
          border: 'border-[#00ff00]',
          text: 'text-[#00ff00]',
          textSecondary: 'text-[#008000]'
        };
      default:
        return {
          bg: 'bg-[#2d2d30]',
          activeBg: 'bg-[#1e1e1e]',
          border: 'border-[#3c3c3c]',
          text: 'text-white',
          textSecondary: 'text-[#cccccc]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`${themeClasses.bg} border-b ${themeClasses.border} flex overflow-x-auto`}>
      {activeTabData && (
        <div className={`flex items-center ${themeClasses.activeBg} border-r ${themeClasses.border} px-4 py-2 min-w-0`}>
          <activeTabData.icon className="w-4 h-4 text-[#007ACC] mr-2 flex-shrink-0" />
          <span className={`${themeClasses.text} text-sm font-mono truncate`}>{activeTabData.label}</span>
          <button className={`ml-2 p-1 hover:bg-opacity-20 hover:bg-white rounded`}>
            <X className={`w-3 h-3 ${themeClasses.textSecondary}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TabBar;