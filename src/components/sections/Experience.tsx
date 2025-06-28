import React from 'react';
import { Calendar, MapPin, Code, Trophy } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Experience: React.FC = () => {
  const { theme } = useTheme();

  const experiences = [
    {
      type: "education",
      title: "Bachelor of Technology - Computer Science",
      organization: "Swami Vivekanand College of Engineering",
      location: "India",
      period: "2022 - Present",
      description: "Currently pursuing BTech in Computer Science with focus on software development, data structures, and algorithms.",
      highlights: [
        "Learning advanced programming concepts",
        "Working on practical projects",
        "Participating in hackathons and coding competitions"
      ]
    },
    {
      type: "project",
      title: "Freelance Web Developer",
      organization: "Independent Projects",
      location: "Remote",
      period: "2023 - Present",
      description: "Building web applications and websites for clients, focusing on modern UI/UX and responsive design.",
      highlights: [
        "Developed e-commerce platforms",
        "Created brand websites",
        "Implemented AI-powered features"
      ]
    }
  ];

  const achievements = [
    "Built 5+ production-ready web applications",
    "Proficient in React ecosystem and modern JavaScript",
    "Experience with AI/ML integration in web apps",
    "Active in open-source development",
    "Passionate about clean code and user experience"
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
          <span className="text-[#9cdcfe]">experience</span>
          <span className={themeClasses.text}>=</span>
          <span className={themeClasses.text}>&#123;</span>
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="mb-8">
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' ? 'Journey of a Code Shinobi' : 'Professional Journey'}
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>timeline:</h3>
        </div>

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    exp.type === 'education' ? 'bg-blue-500/20' : 'bg-green-500/20'
                  }`}>
                    <Code className={`w-5 h-5 ${
                      exp.type === 'education' ? 'text-blue-400' : 'text-green-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${themeClasses.text}`}>{exp.title}</h4>
                    <p className={themeClasses.accent}>{exp.organization}</p>
                  </div>
                </div>
                
                <div className={`text-right text-sm ${themeClasses.textSecondary}`}>
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>{exp.period}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{exp.location}</span>
                  </div>
                </div>
              </div>

              <p className={`${themeClasses.textSecondary} mb-4`}>{exp.description}</p>

              <div>
                <h5 className={`text-sm font-semibold ${themeClasses.accent} mb-2`}>
                  {theme === 'anime' ? 'Key Training:' : 'Key Highlights:'}
                </h5>
                <ul className="space-y-1">
                  {exp.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex} className={`text-sm ${themeClasses.textSecondary} flex items-center space-x-2`}>
                      <div className={`w-1 h-1 ${themeClasses.accent} rounded-full`}></div>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' ? 'Legendary Achievements' : 'Key Achievements'}
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>achievements:</h3>
        </div>

        <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span className={`${themeClasses.textSecondary} text-sm`}>{achievement}</span>
              </div>
            ))}
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

export default Experience;