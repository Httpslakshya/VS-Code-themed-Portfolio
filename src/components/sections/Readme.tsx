import React from 'react';
import { FileText, Star, Code, Zap, Heart, Github } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Readme: React.FC = () => {
  const { theme } = useTheme();

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-white',
          cardBg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          textSecondary: 'text-gray-600',
          accent: 'text-blue-600'
        };
      case 'monokai':
        return {
          bg: 'bg-[#272822]',
          cardBg: 'bg-[#3e3d32]',
          border: 'border-[#75715e]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#a6e22e]',
          accent: 'text-[#66d9ef]'
        };
      case 'dracula':
        return {
          bg: 'bg-[#282a36]',
          cardBg: 'bg-[#44475a]',
          border: 'border-[#6272a4]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#8be9fd]',
          accent: 'text-[#bd93f9]'
        };
      case 'neon':
        return {
          bg: 'bg-black',
          cardBg: 'bg-[#001100]',
          border: 'border-[#00ff00]',
          text: 'text-[#00ff00]',
          textSecondary: 'text-[#00cc00]',
          accent: 'text-[#00ffff]'
        };
      case 'anime':
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-purple-100',
          cardBg: 'bg-gradient-to-r from-pink-100 to-purple-100',
          border: 'border-pink-300',
          text: 'text-purple-900',
          textSecondary: 'text-pink-600',
          accent: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-[#1e1e1e]',
          cardBg: 'bg-[#0d1117]',
          border: 'border-[#30363d]',
          text: 'text-white',
          textSecondary: 'text-[#cccccc]',
          accent: 'text-[#007ACC]'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`p-6 ${themeClasses.text} font-mono ${theme === 'anime' ? 'font-zen' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-6 h-6 text-[#007ACC]" />
          <span className="text-[#569cd6]">readme.md</span>
        </div>
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
            {theme === 'anime' 
              ? '🌸 Lakshya-sama - Code Shinobi Portfolio' 
              : '🌟 Lakshya Dharkar - Developer Portfolio'
            }
          </h1>
          <p className={`${themeClasses.textSecondary} text-lg`}>
            {theme === 'anime' 
              ? 'Welcome to my digital dojo! This interactive experience showcases my journey as a code shinobi.' 
              : 'Welcome to my VS Code themed portfolio! This interactive experience showcases my journey as a fullstack developer.'
            }
          </p>
        </div>
      </div>

      {/* Features */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🎯 Dojo Features' : '🎯 Features'}
          </h2>
        </div>
        <ul className={`space-y-2 ${themeClasses.textSecondary}`}>
          <li>• VS Code inspired design with multiple themes including Anime Mode</li>
          <li>• File-based navigation system</li>
          <li>• Interactive playground with motivational AI</li>
          <li>• Functional terminal with custom commands</li>
          <li>• Fully responsive design</li>
          <li>• Smooth animations and typing effects</li>
          <li>• Hidden easter eggs and secret commands</li>
        </ul>
      </div>

      {/* Built With */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Code className="w-5 h-5 text-blue-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🛠️ Forged With' : '🛠️ Built With'}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'React & TypeScript',
            'Tailwind CSS',
            'Lucide Icons',
            'Custom Animations',
            'Responsive Design',
            'Theme System',
            'Interactive Components',
            'Modern JavaScript'
          ].map((tech, index) => (
            <div
              key={index}
              className={`p-2 rounded border ${themeClasses.border} text-center text-sm ${themeClasses.textSecondary}`}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* Easter Eggs */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-purple-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🚀 Hidden Jutsu' : '🚀 Easter Eggs'}
          </h2>
        </div>
        <div className={`${themeClasses.textSecondary} space-y-2`}>
          <p>Try switching themes and exploring all the files!</p>
          <p>The playground has special responses for each theme...</p>
          <div className="mt-4 p-3 bg-opacity-20 bg-yellow-500 rounded">
            <p className="text-sm">
              <strong>Pro Tip:</strong> Try typing "anime" in the terminal or playground to activate Anime Mode! 
              {theme === 'anime' ? ' 🌸 You found it!' : ' 🕹️'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '📞 Summoning Circle' : '📞 Get In Touch'}
          </h2>
        </div>
        <p className={`${themeClasses.textSecondary} mb-4`}>
          {theme === 'anime' 
            ? 'Feel free to reach out for epic collaborations or new adventures!' 
            : 'Feel free to reach out for collaborations or opportunities!'
          }
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 border ${themeClasses.border} rounded`}>
            <strong className={themeClasses.text}>Email:</strong>
            <br />
            <span className={themeClasses.textSecondary}>lakshyadharkar@gmail.com</span>
          </div>
          <div className={`p-3 border ${themeClasses.border} rounded`}>
            <strong className={themeClasses.text}>LinkedIn:</strong>
            <br />
            <span className={themeClasses.textSecondary}>linkedin.com/in/lakshya-dharkar-571004294</span>
          </div>
          <div className={`p-3 border ${themeClasses.border} rounded`}>
            <strong className={themeClasses.text}>GitHub:</strong>
            <br />
            <span className={themeClasses.textSecondary}>github.com/Httpslakshya</span>
          </div>
          <div className={`p-3 border ${themeClasses.border} rounded`}>
            <strong className={themeClasses.text}>Instagram:</strong>
            <br />
            <span className={themeClasses.textSecondary}>@sm.lakshya_404</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 text-center`}>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Github className="w-6 h-6 text-[#007ACC]" />
          <span className={`text-lg font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? 'Open Source Dojo' : 'Open Source'}
          </span>
        </div>
        <p className={`${themeClasses.textSecondary} mb-4`}>
          {theme === 'anime' 
            ? 'This dojo is built with modern web jutsu and showcases interactive design patterns.' 
            : 'This portfolio is built with modern web technologies and showcases interactive design patterns.'
          }
        </p>
        <div className={`${themeClasses.text} font-mono text-sm`}>
          <span className="text-[#8b949e]">---</span>
          <br />
          <span className="text-[#569cd6]">Made with passion by</span>
          <span className={themeClasses.accent}>
            {theme === 'anime' ? ' Lakshya-sama 🌸' : ' Lakshya Dharkar'}
          </span>
          <br />
          <span className="text-[#8b949e]">
            {theme === 'anime' 
              ? '⚡ Ready to embark on epic coding adventures together!' 
              : '⚡ Ready to build amazing things together!'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default Readme;