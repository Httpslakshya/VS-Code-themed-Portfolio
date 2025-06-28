import React, { useEffect, useState } from 'react';
import { Monitor, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DeviceWarningProps {
  onDismiss: () => void;
}

const DeviceWarning: React.FC<DeviceWarningProps> = ({ onDismiss }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for exit animation
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          overlay: 'bg-black/30',
          modal: 'bg-white/95 text-gray-900 border-gray-200',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'monokai':
        return {
          overlay: 'bg-black/50',
          modal: 'bg-[#272822]/95 text-[#f8f8f2] border-[#75715e]',
          button: 'bg-[#a6e22e] hover:bg-[#8bc34a] text-[#272822]'
        };
      case 'dracula':
        return {
          overlay: 'bg-black/50',
          modal: 'bg-[#282a36]/95 text-[#f8f8f2] border-[#6272a4]',
          button: 'bg-[#bd93f9] hover:bg-[#9c7dd9] text-[#282a36]'
        };
      case 'neon':
        return {
          overlay: 'bg-black/70',
          modal: 'bg-black/95 text-[#00ff00] border-[#00ff00]',
          button: 'bg-[#00ff00] hover:bg-[#00cc00] text-black'
        };
      default:
        return {
          overlay: 'bg-black/50',
          modal: 'bg-[#1e1e1e]/95 text-white border-[#30363d]',
          button: 'bg-[#007ACC] hover:bg-[#005a9e] text-white'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeClasses.overlay} backdrop-blur-sm transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`max-w-md w-full rounded-xl border backdrop-blur-lg p-6 shadow-2xl transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      } ${themeClasses.modal}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Monitor className="w-6 h-6 text-[#007ACC]" />
            <h3 className="text-lg font-semibold">Best Experience</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-opacity-20 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-lg font-medium mb-2">
            💻 For the best experience, please open this portfolio on a laptop or desktop.
          </p>
          <p className="opacity-80">
            Mobile version is available but limited in features.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDismiss}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${themeClasses.button}`}
          >
            Continue Anyway
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs opacity-60">
            This message won't show again on this device
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceWarning;