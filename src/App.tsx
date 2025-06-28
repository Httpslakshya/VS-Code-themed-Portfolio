import React, { useState, useEffect } from 'react';
import { 
  User, 
  Code, 
  FolderOpen, 
  Mail, 
  Briefcase,
  Award,
  Play,
  MessageCircle,
  FileText,
  Bot,
  Terminal as TerminalIcon,
  Home as HomeIcon
} from 'lucide-react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Terminal from './components/Terminal';
import DeviceWarning from './components/DeviceWarning';
import Home from './components/sections/Home';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Achievements from './components/sections/Achievements';
import Contact from './components/sections/Contact';
import Playground from './components/sections/Playground';
import Secret from './components/sections/Secret';
import Readme from './components/sections/Readme';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeviceWarning, setShowDeviceWarning] = useState(false);
  const { theme } = useTheme();

  // Check device type
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isMobileDevice = width < 1024; // Consider tablets as mobile too
      setIsMobile(isMobileDevice);
      
      // Show warning for non-desktop devices
      if (isMobileDevice && !localStorage.getItem('deviceWarningShown')) {
        setShowDeviceWarning(true);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const tabs = [
    { id: 'home', label: 'home.tsx', icon: HomeIcon },
    { id: 'about', label: 'about.tsx', icon: User },
    { id: 'skills', label: 'skills.json', icon: Code },
    { id: 'projects', label: 'projects.ts', icon: FolderOpen },
    { id: 'experience', label: 'experience.js', icon: Briefcase },
    { id: 'achievements', label: 'achievements.md', icon: Award },
    { id: 'playground', label: 'playground.js', icon: Play },
    { id: 'secret', label: 'secret.txt', icon: FileText },
    { id: 'readme', label: 'readme.md', icon: MessageCircle },
    { id: 'contact', label: 'contact.tsx', icon: Mail }
  ];

  // Mobile tabs (limited set)
  const mobileTabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'about', label: 'About', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'skills':
        return <Skills />;
      case 'projects':
        return <Projects />;
      case 'experience':
        return <Experience />;
      case 'achievements':
        return <Achievements />;
      case 'playground':
        return <Playground />;
      case 'secret':
        return <Secret />;
      case 'readme':
        return <Readme />;
      case 'contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  const themeClasses = {
    dark: 'bg-[#1e1e1e] text-white',
    light: 'bg-white text-gray-900',
    monokai: 'bg-[#272822] text-[#f8f8f2]',
    dracula: 'bg-[#282a36] text-[#f8f8f2]',
    neon: 'bg-black text-[#00ff00]'
  };

  const handleDismissWarning = () => {
    setShowDeviceWarning(false);
    localStorage.setItem('deviceWarningShown', 'true');
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses[theme]}`}>
      {/* Device Warning Modal */}
      {showDeviceWarning && (
        <DeviceWarning onDismiss={handleDismissWarning} />
      )}

      {/* Top Bar - Hidden on mobile */}
      {!isMobile && (
        <TopBar onTerminalClick={() => setIsTerminalOpen(true)} />
      )}
      
      {/* Mobile-only minimal top bar */}
      {isMobile && (
        <div className={`h-12 flex items-center justify-between px-4 border-b z-20 relative ${
          theme === 'light' ? 'bg-[#f3f3f3] border-gray-300' : 
          theme === 'monokai' ? 'bg-[#272822] border-[#3e3d32]' :
          theme === 'dracula' ? 'bg-[#282a36] border-[#44475a]' :
          theme === 'neon' ? 'bg-black border-[#00ff00]' :
          'bg-[#2d2d30] border-[#3c3c3c]'
        }`}>
          <span className={`font-medium ${
            theme === 'light' ? 'text-gray-900' : 
            theme === 'neon' ? 'text-[#00ff00]' : 'text-white'
          }`}>
            Lakshya Dharkar
          </span>
          <button
            onClick={() => setIsTerminalOpen(true)}
            className={`p-2 rounded ${
              theme === 'light' ? 'hover:bg-gray-200' : 'hover:bg-opacity-20 hover:bg-white'
            }`}
          >
            <TerminalIcon className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Sidebar - Fixed */}
        {!isMobile && (
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        )}
        
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${!isMobile ? 'ml-64 mt-8' : ''}`}>
          {/* Tab Bar - Hidden on mobile */}
          {!isMobile && (
            <TabBar
              activeTab={activeTab}
              tabs={tabs}
              onTabChange={setActiveTab}
            />
          )}
          
          {/* Content */}
          <div className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
            {renderContent()}
          </div>
          
          {/* Status Bar - Hidden on mobile */}
          {!isMobile && (
            <div className="bg-[#007ACC] text-white px-4 py-1 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>Portfolio v2.0.0</span>
                <span>UTF-8</span>
                <span>React TypeScript</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>Ln 1, Col 1</span>
                <span>Spaces: 2</span>
                <span>🚀 Ready</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation with Glassmorphism */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className={`backdrop-blur-lg bg-opacity-80 border-t px-4 py-3 ${
            theme === 'light' ? 'bg-white/80 border-gray-200' :
            theme === 'monokai' ? 'bg-[#272822]/80 border-[#3e3d32]' :
            theme === 'dracula' ? 'bg-[#282a36]/80 border-[#44475a]' :
            theme === 'neon' ? 'bg-black/80 border-[#00ff00]' :
            'bg-[#252526]/80 border-[#3c3c3c]'
          }`}>
            <div className="flex items-center justify-around">
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? theme === 'neon' ? 'bg-[#00ff00]/20 text-[#00ff00]' : 'bg-[#007ACC]/20 text-[#007ACC]'
                        : theme === 'light' ? 'text-gray-600 hover:text-gray-900' :
                          theme === 'neon' ? 'text-[#00cc00] hover:text-[#00ff00]' : 'text-[#cccccc] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Modal */}
      {isTerminalOpen && (
        <Terminal onClose={() => setIsTerminalOpen(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;