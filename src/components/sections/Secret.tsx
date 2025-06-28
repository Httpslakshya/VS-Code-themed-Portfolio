import React from 'react';
import { FileText, Zap, Code, Heart, Gamepad2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Secret: React.FC = () => {
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
          bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-red-900',
          cardBg: 'bg-gradient-to-r from-red-900/30 to-purple-900/30',
          border: 'border-orange-400',
          text: 'text-orange-200',
          textSecondary: 'text-red-300',
          accent: 'text-yellow-400'
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
    <div className={`p-6 ${themeClasses.text} font-mono ${theme === 'anime' ? 'font-creepster' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className={`w-6 h-6 ${theme === 'anime' ? 'text-orange-400' : 'text-[#007ACC]'}`} />
          <span className="text-[#569cd6]">secret.txt</span>
        </div>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-2`}>
            {theme === 'anime' 
              ? '🔐 Hidden Scroll - Shinobi Secrets ⚔️' 
              : '🔐 Secret File - Easter Eggs & Fun Facts'
            }
          </h1>
          <p className={`${themeClasses.accent} text-lg`}>
            {theme === 'anime' 
              ? '🎉 Congratulations, shinobi! You found the hidden scroll!' 
              : '🎉 Congratulations! You found the secret file!'
            }
          </p>
        </div>
      </div>

      {/* Hidden Features */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Gamepad2 className="w-5 h-5 text-purple-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🕹️ Hidden Jutsu' : '🕹️ Hidden Features'}
          </h2>
        </div>
        <ul className={`space-y-2 ${themeClasses.textSecondary}`}>
          <li>• Try typing "anime" in the terminal to activate Shinobi Mode ⚔️</li>
          <li>• Switch to Neon theme for the ultimate hacker experience</li>
          <li>• Type "sudo hire lakshya" in Neon theme for a surprise</li>
          <li>• Each theme has unique responses in the playground</li>
          <li>• Try "konami" command for a special easter egg</li>
          <li>• Anime mode is only accessible through terminal commands!</li>
        </ul>
      </div>

      {/* Fun Facts */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Code className="w-5 h-5 text-blue-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🎨 Dojo Creation Facts' : '🎨 Fun Facts About This Portfolio'}
          </h2>
        </div>
        <ul className={`space-y-2 ${themeClasses.textSecondary}`}>
          <li>• Built with 1000+ lines of custom TypeScript</li>
          <li>• Features 6 different themes including secret Anime Mode</li>
          <li>• Fully responsive design that works on any device</li>
          <li>• Interactive elements with real-time feedback</li>
          <li>• Each theme has unique personality and responses</li>
          <li>• Anime mode includes special fonts and epic color schemes</li>
          <li>• Terminal activation system with animated sequences</li>
        </ul>
      </div>

      {/* Developer Jokes */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🎯 Shinobi Wisdom' : '🎯 Developer Jokes'}
          </h2>
        </div>
        <div className={`space-y-4 ${themeClasses.textSecondary}`}>
          <div className="p-3 bg-opacity-50 bg-gray-500 rounded">
            <p>• Why do programmers prefer dark mode? Because light attracts bugs!</p>
          </div>
          <div className="p-3 bg-opacity-50 bg-gray-500 rounded">
            <p>• There are only 10 types of people: those who understand binary and those who don't</p>
          </div>
          <div className="p-3 bg-opacity-50 bg-gray-500 rounded">
            <p>• 99 little bugs in the code, take one down, patch it around... 127 little bugs in the code</p>
          </div>
          {theme === 'anime' && (
            <div className="p-3 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded border border-orange-400">
              <p>• "The code that burns twice as bright burns half as long" - Blade Runner (Developer Edition) ⚔️</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Links */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {theme === 'anime' ? '🔗 Personal Scrolls' : '🔗 Hidden Links'}
          </h2>
        </div>
        <div className={`space-y-3 ${themeClasses.textSecondary}`}>
          <div>
            <strong className={themeClasses.text}>Favorite Anime:</strong> Attack on Titan, Death Note, Code Geass, One Piece
          </div>
          <div>
            <strong className={themeClasses.text}>Dream Stack:</strong> Next.js + TypeScript + Tailwind + Prisma
          </div>
          <div>
            <strong className={themeClasses.text}>Currently Learning:</strong> Three.js, WebGL, and AI/ML with TensorFlow
          </div>
          <div>
            <strong className={themeClasses.text}>Secret Hobby:</strong> Creating pixel art and 8-bit music
          </div>
          {theme === 'anime' && (
            <div>
              <strong className={themeClasses.text}>Ninja Way:</strong> "Believe it! Code never gives up!" 🥷
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 text-center`}>
        <div className="text-4xl mb-4">
          {theme === 'anime' ? '⚔️' : '🎊'}
        </div>
        <h3 className={`text-xl font-bold ${themeClasses.accent} mb-2`}>
          {theme === 'anime' 
            ? 'Arigato for exploring, shinobi!' 
            : 'Thanks for exploring!'
          }
        </h3>
        <p className={`${themeClasses.textSecondary} mb-4`}>
          {theme === 'anime' 
            ? "You've discovered all the hidden jutsu. You're clearly a detail-oriented ninja!" 
            : "You've discovered all the hidden secrets. You're clearly someone who pays attention to detail!"
          }
        </p>
        <div className={`${themeClasses.text} font-mono text-sm`}>
          <span className="text-[#569cd6]">console.log</span>
          <span>(</span>
          <span className="text-[#ce9178]">
            {theme === 'anime' 
              ? '"Made with ❤️ by Lakshya "The Code Shinobi" ⚔️"' 
              : '"Made with ❤️ by Lakshya"'
            }
          </span>
          <span>);</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {theme === 'anime' ? '⚔️ shinobi.js' : '⚡ portfolio.js'}
        </div>
      </div>
    </div>
  );
};

export default Secret;