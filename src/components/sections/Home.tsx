import React from 'react';
import { Download, Code, Zap, Plus, Diamond } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Home: React.FC = () => {
  const { theme } = useTheme();

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          textSecondary: 'text-gray-600',
          accent: 'text-blue-600',
          heroGradient: 'from-blue-50 to-indigo-100',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'text-white'
        };
      case 'monokai':
        return {
          bg: 'bg-[#272822]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#a6e22e]',
          accent: 'text-[#66d9ef]',
          heroGradient: 'from-[#272822] to-[#3e3d32]',
          buttonBg: 'bg-[#a6e22e] hover:bg-[#8bc34a]',
          buttonText: 'text-[#272822]'
        };
      case 'dracula':
        return {
          bg: 'bg-[#282a36]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#8be9fd]',
          accent: 'text-[#bd93f9]',
          heroGradient: 'from-[#282a36] to-[#44475a]',
          buttonBg: 'bg-[#bd93f9] hover:bg-[#9c7dd9]',
          buttonText: 'text-[#282a36]'
        };
      case 'neon':
        return {
          bg: 'bg-black',
          text: 'text-[#00ff00]',
          textSecondary: 'text-[#00cc00]',
          accent: 'text-[#00ffff]',
          heroGradient: 'from-black to-[#001100]',
          buttonBg: 'bg-[#00ff00] hover:bg-[#00cc00]',
          buttonText: 'text-black'
        };
      default:
        return {
          bg: 'bg-[#1e1e1e]',
          text: 'text-white',
          textSecondary: 'text-[#cccccc]',
          accent: 'text-[#007ACC]',
          heroGradient: 'from-[#1e1e1e] to-[#0d1117]',
          buttonBg: 'bg-[#007ACC] hover:bg-[#005a9e]',
          buttonText: 'text-white'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleDownloadResume = () => {
    // Create a temporary link to download resume
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Lakshya_Dharkar_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} relative overflow-hidden`}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Plus Icons */}
        <Plus className="absolute top-20 left-20 w-6 h-6 text-blue-400 opacity-30 animate-pulse" />
        <Plus className="absolute top-40 right-32 w-4 h-4 text-blue-500 opacity-40" />
        <Plus className="absolute bottom-32 left-16 w-5 h-5 text-blue-300 opacity-35" />
        <Plus className="absolute top-60 left-1/3 w-3 h-3 text-blue-600 opacity-25" />
        
        {/* Lightning Bolts */}
        <Zap className="absolute top-32 right-20 w-8 h-8 text-blue-400 opacity-30 animate-pulse" />
        <Zap className="absolute bottom-40 right-40 w-6 h-6 text-blue-500 opacity-35" />
        <Zap className="absolute top-80 left-40 w-5 h-5 text-blue-300 opacity-40" />
        
        {/* Diamond Shapes */}
        <Diamond className="absolute top-96 right-16 w-4 h-4 text-blue-400 opacity-30" />
        <Diamond className="absolute bottom-20 left-1/4 w-6 h-6 text-blue-500 opacity-25" />
        
        {/* Code Icons */}
        <Code className="absolute top-52 right-1/3 w-5 h-5 text-blue-400 opacity-30" />
        <Code className="absolute bottom-60 right-20 w-4 h-4 text-blue-300 opacity-35" />
        
        {/* AI Badge */}
        <div className="absolute top-32 right-80 bg-blue-500/20 border border-blue-400/30 rounded-lg px-3 py-1 text-blue-400 text-sm font-bold opacity-40">
          AI
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="container mx-auto px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Name and Title */}
              <div className="space-y-4">
                <h1 className={`text-6xl xl:text-7xl font-bold ${themeClasses.text} leading-tight whitespace-nowrap`}>
                  <span className={`${themeClasses.accent} relative`}>
                    <span className={`${theme === 'neon' ? 'animate-pulse' : ''}`}>
                      Lakshya Dharkar
                    </span>
                    {theme === 'neon' && (
                      <div className="absolute inset-0 text-[#00ff00] blur-sm animate-pulse">
                        Lakshya Dharkar
                      </div>
                    )}
                  </span>
                </h1>
                
                <div className={`text-2xl xl:text-3xl ${themeClasses.textSecondary} font-medium`}>
                  Full Stack Developer
                </div>
              </div>

              {/* Description */}
              <div className={`text-lg ${themeClasses.textSecondary} leading-relaxed max-w-2xl`}>
                <p>
                  Passionate about creating innovative web applications with cutting-edge technology. 
                  Currently pursuing BTech in Computer Science while building production-ready solutions 
                  that solve real-world problems.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadResume}
                  className={`group flex items-center justify-center space-x-3 px-8 py-4 ${themeClasses.buttonBg} ${themeClasses.buttonText} rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    theme === 'neon' ? 'hover:shadow-[#00ff00]/20' : 'hover:shadow-blue-500/20'
                  }`}
                >
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                  <span>Download Resume</span>
                </button>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={themeClasses.textSecondary}>Available for opportunities</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-600/30">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${themeClasses.accent}`}>5+</div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>Projects</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${themeClasses.accent}`}>10+</div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>Technologies</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${themeClasses.accent}`}>3+</div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>Years Learning</div>
                </div>
              </div>
            </div>

            {/* Right Content - Photo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glowing Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.heroGradient} rounded-2xl blur-3xl opacity-30 scale-110`}></div>
                
                {/* Photo Container */}
                <div className={`relative bg-gradient-to-br ${themeClasses.heroGradient} p-1 rounded-2xl ${
                  theme === 'neon' ? 'shadow-lg shadow-[#00ff00]/20' : 'shadow-2xl shadow-blue-500/20'
                }`}>
                  <div className="bg-gray-900 rounded-xl overflow-hidden">
                    <img
                      src="/IMG_20250628_182906.jpg"
                      alt="Lakshya Dharkar"
                      className="w-80 h-96 lg:w-96 lg:h-[500px] object-cover object-center"
                    />
                  </div>
                </div>

                {/* Floating Elements around photo */}
                <div className="absolute -top-4 -right-4 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg px-3 py-2 text-blue-400 text-sm font-bold">
                  React
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-3 py-2 text-green-400 text-sm font-bold">
                  TypeScript
                </div>
                <div className="absolute top-1/2 -left-8 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg px-3 py-2 text-purple-400 text-sm font-bold">
                  AI/ML
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden flex flex-col items-center justify-center min-h-screen space-y-8 text-center px-4">
            {/* Photo */}
            <div className="relative">
              {/* Glowing Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.heroGradient} rounded-2xl blur-2xl opacity-30 scale-110`}></div>
              
              {/* Photo Container */}
              <div className={`relative bg-gradient-to-br ${themeClasses.heroGradient} p-1 rounded-2xl ${
                theme === 'neon' ? 'shadow-lg shadow-[#00ff00]/20' : 'shadow-2xl shadow-blue-500/20'
              }`}>
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <img
                    src="/IMG_20250628_182906.jpg"
                    alt="Lakshya Dharkar"
                    className="w-64 h-80 sm:w-72 sm:h-96 object-cover object-center"
                  />
                </div>
              </div>

              {/* Floating Elements around photo */}
              <div className="absolute -top-2 -right-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg px-2 py-1 text-blue-400 text-xs font-bold">
                React
              </div>
              <div className="absolute -bottom-2 -left-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-2 py-1 text-green-400 text-xs font-bold">
                TypeScript
              </div>
            </div>

            {/* Name and Title */}
            <div className="space-y-3">
              <h1 className={`text-4xl sm:text-5xl font-bold ${themeClasses.accent} leading-tight whitespace-nowrap`}>
                <span className={`${theme === 'neon' ? 'animate-pulse' : ''}`}>
                  Lakshya Dharkar
                </span>
                {theme === 'neon' && (
                  <div className="absolute inset-0 text-[#00ff00] blur-sm animate-pulse">
                    Lakshya Dharkar
                  </div>
                )}
              </h1>
              
              <div className={`text-lg sm:text-xl ${themeClasses.textSecondary} font-medium`}>
                Full Stack Developer
              </div>
            </div>

            {/* Description - Hidden on very small screens */}
            <div className={`hidden sm:block text-base ${themeClasses.textSecondary} leading-relaxed max-w-md`}>
              <p>
                Passionate about creating innovative web applications with cutting-edge technology. 
                Building production-ready solutions that solve real-world problems.
              </p>
            </div>

            {/* CTA Button */}
            <div className="w-full max-w-sm space-y-4">
              <button
                onClick={handleDownloadResume}
                className={`group flex items-center justify-center space-x-3 w-full px-6 py-3 ${themeClasses.buttonBg} ${themeClasses.buttonText} rounded-lg font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  theme === 'neon' ? 'hover:shadow-[#00ff00]/20' : 'hover:shadow-blue-500/20'
                }`}
              >
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                <span>Download Resume</span>
              </button>
              
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={themeClasses.textSecondary}>Available for opportunities</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm pt-6 border-t border-gray-600/30">
              <div className="text-center">
                <div className={`text-xl font-bold ${themeClasses.accent}`}>5+</div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>Projects</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${themeClasses.accent}`}>10+</div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>Technologies</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${themeClasses.accent}`}>3+</div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>Years Learning</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className={`w-6 h-10 border-2 ${themeClasses.accent} rounded-full flex justify-center`}>
          <div className={`w-1 h-3 ${themeClasses.accent} rounded-full mt-2 animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
};

export default Home;