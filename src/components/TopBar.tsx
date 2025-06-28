import React, { useState } from 'react';
import { ChevronDown, Palette, Terminal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TopBarProps {
  onTerminalClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onTerminalClick }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { label: 'File', items: ['New File', 'Open File', 'Save', 'Save As'] },
    { label: 'Edit', items: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste'] },
    { label: 'Selection', items: ['Select All', 'Select Line', 'Select Word'] },
    { label: 'View', items: ['Command Palette', 'Open View', 'Explorer', 'Search'] },
    { label: 'Go', items: ['Go to File', 'Go to Line', 'Go to Symbol'] },
    { label: 'Run', items: ['Start Debugging', 'Run Without Debugging', 'Stop'] },
    { 
      label: 'Terminal', 
      items: ['New Terminal', 'Split Terminal', 'Kill Terminal'],
      onClick: onTerminalClick
    },
    { label: 'Help', items: ['Welcome', 'Documentation', 'Keyboard Shortcuts'] }
  ];

  const themes = [
    { id: 'dark', name: 'Dark (Default)', color: '#1e1e1e' },
    { id: 'light', name: 'Light', color: '#ffffff' },
    { id: 'monokai', name: 'Monokai', color: '#272822' },
    { id: 'dracula', name: 'Dracula', color: '#282a36' },
    { id: 'neon', name: 'Neon', color: '#000000' }
  ];

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-[#f3f3f3] text-gray-900 border-gray-300';
      case 'monokai':
        return 'bg-[#272822] text-[#f8f8f2] border-[#3e3d32]';
      case 'dracula':
        return 'bg-[#282a36] text-[#f8f8f2] border-[#44475a]';
      case 'neon':
        return 'bg-black text-[#00ff00] border-[#00ff00]';
      default:
        return 'bg-[#2d2d30] text-white border-[#3c3c3c]';
    }
  };

  const handleMenuClick = (menu: any) => {
    if (menu.onClick) {
      menu.onClick();
      setActiveMenu(null);
    } else {
      setActiveMenu(activeMenu === menu.label ? null : menu.label);
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 h-8 flex items-center px-2 border-b text-sm z-40 ${getThemeClasses()}`}>
      <div className="flex items-center space-x-1">
        {menuItems.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              className={`px-2 py-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors ${
                activeMenu === menu.label ? 'bg-opacity-20 bg-white' : ''
              }`}
              onClick={() => handleMenuClick(menu)}
            >
              {menu.label}
            </button>
            
            {activeMenu === menu.label && !menu.onClick && (
              <div className={`absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg z-50 ${
                theme === 'light' 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-[#2d2d30] border border-[#3c3c3c]'
              }`}>
                <div className="py-1">
                  {menu.items.map((item) => (
                    <button
                      key={item}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        theme === 'light'
                          ? 'hover:bg-gray-100 text-gray-900'
                          : 'hover:bg-[#37373d] text-white'
                      }`}
                      onClick={() => setActiveMenu(null)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Theme Switcher */}
      <div className="ml-auto relative">
        <button
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors"
          onClick={() => setActiveMenu(activeMenu === 'themes' ? null : 'themes')}
        >
          <Palette className="w-4 h-4" />
          <span>Theme</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {activeMenu === 'themes' && (
          <div className={`absolute top-full right-0 mt-1 w-48 rounded-md shadow-lg z-50 ${
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-[#2d2d30] border border-[#3c3c3c]'
          }`}>
            <div className="py-1">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
                    theme === themeOption.id 
                      ? 'bg-[#007ACC] text-white' 
                      : theme === 'light'
                        ? 'hover:bg-gray-100 text-gray-900'
                        : 'hover:bg-[#37373d] text-white'
                  }`}
                  onClick={() => {
                    setTheme(themeOption.id as any);
                    setActiveMenu(null);
                  }}
                >
                  <div
                    className="w-4 h-4 rounded mr-3 border border-gray-400"
                    style={{ backgroundColor: themeOption.color }}
                  ></div>
                  {themeOption.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;