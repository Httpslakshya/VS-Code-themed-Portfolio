import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Skills: React.FC = () => {
  const { theme } = useTheme();

  const skillCategories = [
    {
      category: "Languages",
      skills: [
        { name: "JavaScript", level: 90, color: "#f7df1e" },
        { name: "Java", level: 85, color: "#f89820" },
        { name: "C++", level: 80, color: "#00599c" },
        { name: "C", level: 75, color: "#a8b9cc" },
        { name: "Python", level: 70, color: "#3776ab" }
      ]
    },
    {
      category: "Frontend",
      skills: [
        { name: "React", level: 90, color: "#61dbfb" },
        { name: "HTML/CSS", level: 95, color: "#e34c26" },
        { name: "Tailwind CSS", level: 88, color: "#38bdf8" },
        { name: "JavaScript", level: 90, color: "#f7df1e" }
      ]
    },
    {
      category: "Backend & Design",
      skills: [
        { name: "Flask", level: 65, color: "#000000" },
        { name: "Node.js", level: 70, color: "#339933" },
        { name: "UI/UX (Figma)", level: 50, color: "#f24e1e" },
        { name: "MongoDB", level: 55, color: "#47a248" }
      ]
    },
    {
      category: "Tools & Technologies",
      skills: [
        { name: "Git & GitHub", level: 85, color: "#f05032" },
        { name: "VS Code", level: 95, color: "#007acc" },
        { name: "Postman", level: 80, color: "#ff6c37" },
        { name: "Eclipse", level: 70, color: "#2c2255" }
      ]
    },
    {
      category: "Currently Learning",
      skills: [
        { name: "Data Structures & Algorithms", level: 65, color: "#4caf50" },
        { name: "AI/ML", level: 60, color: "#ff9800" },
        { name: "TypeScript", level: 75, color: "#3178c6" },
        { name: "Next.js", level: 55, color: "#000000" }
      ]
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
          <span className="text-[#9cdcfe]">
            {theme === 'anime' ? 'powerLevel' : 'skills'}
          </span>
          <span className={themeClasses.text}>=</span>
          <span className={themeClasses.text}>&#123;</span>
        </div>
      </div>

      {/* Skills Categories */}
      <div className="space-y-8">
        {skillCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
            <div className="mb-6">
              <span className="text-[#8b949e]">
                // {theme === 'anime' ? `${category.category} Jutsu` : category.category}
              </span>
              <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>
                {category.category.toLowerCase().replace(/\s+/g, '_')}:
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className={`bg-opacity-50 ${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${themeClasses.text} font-medium`}>{skill.name}</span>
                    <span className={`${themeClasses.textSecondary} text-sm`}>
                      {theme === 'anime' ? `${skill.level}% ⚡` : `${skill.level}%`}
                    </span>
                  </div>
                  
                  <div className={`w-full bg-opacity-30 ${themeClasses.cardBg} rounded-full h-2`}>
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: skill.color
                      }}
                    ></div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: skill.color }}
                    ></div>
                    <span className="text-[#8b949e] text-xs">
                      {skill.level >= 80 
                        ? (theme === 'anime' ? 'Master 🥷' : 'Expert')
                        : skill.level >= 60 
                        ? (theme === 'anime' ? 'Chunin 🎯' : 'Intermediate')
                        : (theme === 'anime' ? 'Genin 📚' : 'Learning')
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Closing bracket */}
      <div className="mt-8">
        <span className={themeClasses.text}>&#125;</span>
        <span className="text-[#8b949e]">;</span>
      </div>
    </div>
  );
};

export default Skills;