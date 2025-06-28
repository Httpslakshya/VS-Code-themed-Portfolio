import React from 'react';
import { Award, Star, Code, Users, Zap, Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Achievements: React.FC = () => {
  const { theme } = useTheme();

  const achievements = [
    {
      category: "Projects",
      icon: Code,
      color: "#10b981",
      items: [
        "Built 5+ production-ready web applications",
        "Successfully deployed MediStock medicine management system",
        "Developed AI-powered StreamWise recommendation platform",
        "Created TrueCatch platform using Story Protocol",
        "Built e-commerce solutions (Bloatware, Bandit Clothing)"
      ]
    },
    {
      category: "Technical Skills",
      icon: Zap,
      color: "#f59e0b",
      items: [
        "Mastered React ecosystem and modern JavaScript",
        "Proficient in multiple programming languages (Java, C++, C, Python)",
        "Expertise in responsive web design with Tailwind CSS",
        "Experience with AI/ML integration in web applications",
        "Version control and collaboration with Git/GitHub"
      ]
    },
    {
      category: "Learning & Growth",
      icon: Star,
      color: "#8b5cf6",
      items: [
        "Actively learning Data Structures & Algorithms",
        "Exploring AI/ML technologies and implementations",
        "Continuous improvement in web development practices",
        "Staying updated with latest tech trends",
        "Self-motivated learning and problem-solving"
      ]
    },
    {
      category: "Personal Interests",
      icon: Heart,
      color: "#ef4444",
      items: [
        "Anime enthusiast with content creation experience",
        "Passionate about smooth UI/UX animations",
        "Active in hackathon participation and ideation",
        "Side project development and experimentation",
        "Creating engaging user experiences"
      ]
    }
  ];

  const stats = [
    { label: "Projects Completed", value: "5+", color: "#10b981" },
    { label: "Technologies Learned", value: "10+", color: "#007ACC" },
    { label: "GitHub Repositories", value: "15+", color: "#f59e0b" },
    { label: "Study Years", value: "3+", color: "#8b5cf6" }
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
          <span className="text-[#569cd6]">const</span>
          <span className="text-[#9cdcfe]">achievements</span>
          <span className={themeClasses.text}>=</span>
          <span className={themeClasses.text}>&#123;</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' ? 'Power Level Stats' : 'Quick Stats'}
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>overview:</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4 text-center`}>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className={`${themeClasses.textSecondary} text-sm`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="space-y-6">
        {achievements.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <div key={categoryIndex} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                  {theme === 'anime' && category.category === 'Projects' ? 'Completed Missions' :
                   theme === 'anime' && category.category === 'Technical Skills' ? 'Combat Abilities' :
                   theme === 'anime' && category.category === 'Learning & Growth' ? 'Training Progress' :
                   theme === 'anime' && category.category === 'Personal Interests' ? 'Special Interests' :
                   category.category}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={`flex items-start space-x-3 p-3 bg-opacity-50 ${themeClasses.cardBg} border ${themeClasses.border} rounded-lg`}>
                    <Award className={`w-4 h-4 ${themeClasses.accent} mt-0.5 flex-shrink-0`} />
                    <span className={`${themeClasses.textSecondary} text-sm`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recognition Section */}
      <div className={`mt-8 ${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
        <div className="mb-4">
          <span className="text-[#8b949e]">
            // {theme === 'anime' ? 'Future Quests & Goals' : 'Recognition & Goals'}
          </span>
          <h3 className={`text-lg font-semibold ${themeClasses.accent} mt-2`}>future_goals:</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className={`${themeClasses.text} font-medium`}>
              {theme === 'anime' ? 'Short-term Quests:' : 'Short-term Goals:'}
            </h4>
            <ul className="space-y-2">
              <li className={`${themeClasses.textSecondary} text-sm flex items-center space-x-2`}>
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Master advanced React patterns</span>
              </li>
              <li className={`${themeClasses.textSecondary} text-sm flex items-center space-x-2`}>
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Complete AI/ML specialization</span>
              </li>
              <li className={`${themeClasses.textSecondary} text-sm flex items-center space-x-2`}>
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span>Contribute to open-source projects</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className={`${themeClasses.text} font-medium`}>
              {theme === 'anime' ? 'Ultimate Vision:' : 'Long-term Vision:'}
            </h4>
            <ul className="space-y-2">
              <li className={`${themeClasses.textSecondary} text-sm flex items-center space-x-2`}>
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>Become a full-stack expert</span>
              </li>
              <li className={`${themeClasses.textSecondary} text-sm flex items-center space-x-2`}>
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>Build impactful tech products</span>
              </li>
              <li className={`${themeClasses.textSecondary} text-sm flex items-center space-x-2`}>
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>Mentor upcoming developers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Closing bracket */}
      <div className="mt-8">
        <span className={themeClasses.text}>&#125;</span>
        <span className="text-[#8b949e]">;</span>
      </div>
    </div>
  );
};

export default Achievements;