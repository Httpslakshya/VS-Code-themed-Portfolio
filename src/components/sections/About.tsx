import React, { useState, useEffect } from 'react';
import { Code, Heart, Zap, Target } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const About: React.FC = () => {
  const { theme } = useTheme();
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [cycleIndex, setCycleIndex] = useState(0);

  const texts = [
    "BTech CS student at Swami Vivekanand College of Engineering",
    "Ready to build your next amazing project",
    "Passionate about creating innovative solutions"
  ];

  useEffect(() => {
    if (!isTyping) return;

    const currentFullText = texts[cycleIndex];
    
    if (currentIndex < currentFullText.length) {
      const timer = setTimeout(() => {
        setCurrentText(currentFullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Finished typing current text, wait then start next
      const timer = setTimeout(() => {
        setCurrentIndex(0);
        setCurrentText('');
        setCycleIndex((prev) => (prev + 1) % texts.length);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, cycleIndex, isTyping]);

  const highlights = [
    {
      icon: Code,
      title: "Web Development",
      description: "Passionate about creating smooth UI/UX with animations and scroll effects"
    },
    {
      icon: Heart,
      title: "Tech Enthusiast",
      description: "Love exploring new technologies and building innovative solutions"
    },
    {
      icon: Zap,
      title: "AI/ML Explorer",
      description: "Actively learning and implementing AI/ML solutions"
    },
    {
      icon: Target,
      title: "Problem Solver",
      description: "Working on side projects and hackathon ideas"
    }
  ];

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
    <div className={`p-6 ${themeClasses.text} font-mono`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-[#569cd6]">const</span>
          <span className="text-[#9cdcfe]">developer</span>
          <span className={themeClasses.text}>=</span>
          <span className="text-[#ce9178]">"Lakshya Dharkar"</span>
          <span className={themeClasses.text}>;</span>
        </div>
        
        <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
          <h1 className={`text-3xl font-bold mb-2 ${themeClasses.text}`}>
            Hi, I'm <span className={themeClasses.accent}>Lakshya Dharkar</span> 👋
          </h1>
          <div className="h-8 flex items-center">
            <p className={`text-lg ${themeClasses.textSecondary}`}>
              {currentText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
          <p className={`${themeClasses.textSecondary} leading-relaxed mt-4`}>
            A passionate fullstack developer who loves building web applications with smooth animations 
            and exceptional user experiences. When I'm not coding, you'll find me exploring the latest 
            in AI/ML technology and working on innovative projects.
          </p>
        </div>
      </div>

      {/* Code Block Style */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <div className="text-sm mb-4">
          <span className="text-[#8b949e]">// Current Status</span>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-[#569cd6]">education</span>
            <span className={themeClasses.text}>: </span>
            <span className="text-[#ce9178]">"BTech Computer Science Engineering"</span>
            <span className={themeClasses.text}>,</span>
          </div>
          <div>
            <span className="text-[#569cd6]">college</span>
            <span className={themeClasses.text}>: </span>
            <span className="text-[#ce9178]">"Swami Vivekanand College of Engineering"</span>
            <span className={themeClasses.text}>,</span>
          </div>
          <div>
            <span className="text-[#569cd6]">focus</span>
            <span className={themeClasses.text}>: [</span>
            <span className="text-[#ce9178]">"Web Development"</span>
            <span className={themeClasses.text}>, </span>
            <span className="text-[#ce9178]">"AI/ML"</span>
            <span className={themeClasses.text}>, </span>
            <span className="text-[#ce9178]">"DSA"</span>
            <span className={themeClasses.text}>],</span>
          </div>
          <div>
            <span className="text-[#569cd6]">currently</span>
            <span className={themeClasses.text}>: </span>
            <span className="text-[#ce9178]">"Building side projects & hackathon ideas"</span>
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4 hover:border-[#007ACC] transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                theme === 'neon' ? 'hover:shadow-[#00ff00]/20' : 'hover:shadow-blue-500/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-6 h-6 text-[#007ACC] mt-1 flex-shrink-0" />
                <div>
                  <h3 className={`font-semibold ${themeClasses.text} mb-2`}>{item.title}</h3>
                  <p className={`${themeClasses.textSecondary} text-sm`}>{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default About;