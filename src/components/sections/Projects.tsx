import React from 'react';
import { ExternalLink, Github, Zap, Shield, Brain, ShoppingBag, Shirt, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Projects: React.FC = () => {
  const { theme } = useTheme();

  const projects = [
    {
      id: 1,
      name: "VS Code Portfolio",
      description: "Interactive developer portfolio with VS Code theme and terminal",
      icon: Monitor,
      status: "Completed",
      tech: ["React", "TypeScript", "Tailwind CSS", "Lucide Icons"],
      features: [
        "VS Code inspired design with multiple themes",
        "Interactive JavaScript playground",
        "Functional terminal with commands",
        "Fully responsive with mobile optimization",
        "Glassmorphism effects and smooth animations"
      ],
      github: "https://github.com/Httpslakshya",
      live: window.location.href,
      color: "#007ACC"
    },
    {
      id: 2,
      name: "MediStock",
      description: "Medicine management system with account-based access",
      icon: Shield,
      status: "Completed",
      tech: ["React", "JavaScript", "CSS"],
      features: [
        "Add & view medicines with expiry & stock tracking",
        "Recommend medicines based on user symptoms",
        "Search and show medicine info (uses, pros/cons)",
        "Account-based access control"
      ],
      github: "https://github.com/Httpslakshya/MediStock",
      live: "https://github.com/Httpslakshya/MediStock",
      color: "#10b981"
    },
    {
      id: 3,
      name: "StreamWise AI",
      description: "OTT movie/series recommendation platform powered by AI",
      icon: Brain,
      status: "In Progress",
      tech: ["React", "AI/ML", "JavaScript"],
      features: [
        "AI-powered recommendation engine",
        "Filters based on user mood and scenario",
        "Available subscription integration",
        "Chatbot-based recommendation system"
      ],
      github: "https://github.com/Httpslakshya",
      live: "https://github.com/Httpslakshya",
      color: "#8b5cf6"
    },
    {
      id: 4,
      name: "TrueCatch",
      description: "Platform for independent journalists using Story Protocol",
      icon: Shield,
      status: "Completed",
      tech: ["React", "Blockchain", "Story Protocol"],
      features: [
        "Content registration and monetization",
        "Intellectual property protection",
        "Licensing & royalty system",
        "Independent journalist support"
      ],
      github: "https://github.com/Httpslakshya/TrueCatch",
      live: "https://github.com/Httpslakshya/TrueCatch",
      color: "#f59e0b"
    },
    {
      id: 5,
      name: "Bloatware",
      description: "E-commerce site for audio products",
      icon: ShoppingBag,
      status: "Completed",
      tech: ["React", "JavaScript", "CSS"],
      features: [
        "Product showcase with pricing",
        "Category-based filtering",
        "Shopping cart functionality",
        "Responsive design"
      ],
      github: "https://github.com/Httpslakshya",
      live: "https://github.com/Httpslakshya",
      color: "#ef4444"
    },
    {
      id: 6,
      name: "Bandit Clothing",
      description: "Fashion brand website for client",
      icon: Shirt,
      status: "Completed",
      tech: ["React", "CSS", "JavaScript"],
      features: [
        "T-shirts, hoodies, jeans showcase",
        "Stylish layout and product display",
        "Client-focused design",
        "Modern fashion brand aesthetics"
      ],
      github: "https://github.com/Httpslakshya",
      live: "https://github.com/Httpslakshya",
      color: "#06b6d4"
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
            {theme === 'anime' ? 'missions' : 'projects'}
          </span>
          <span className={themeClasses.text}>=</span>
          <span className={themeClasses.text}>[</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => {
          const Icon = project.icon;
          return (
            <div
              key={project.id}
              className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 hover:border-[#007ACC] transition-all duration-300 hover:scale-[1.02] ${
                theme === 'anime' ? 'hover:shadow-lg hover:shadow-pink-200' : ''
              }`}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: project.color }} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                      {theme === 'anime' && project.name === 'VS Code Portfolio' 
                        ? '🌸 Dojo Portfolio' 
                        : project.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'In Progress'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {theme === 'anime' 
                        ? (project.status === 'In Progress' ? 'Quest Active ⚔️' : 'Mission Complete ✅')
                        : project.status
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 hover:bg-opacity-20 hover:bg-white rounded-lg transition-colors`}
                    title="View on GitHub"
                  >
                    <Github className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                  </a>
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 hover:bg-opacity-20 hover:bg-white rounded-lg transition-colors`}
                    title="Live Demo"
                  >
                    <ExternalLink className={`w-4 h-4 ${themeClasses.textSecondary}`} />
                  </a>
                </div>
              </div>

              {/* Description */}
              <p className={`${themeClasses.textSecondary} mb-4`}>{project.description}</p>

              {/* Features */}
              <div className="mb-4">
                <h4 className={`text-sm font-semibold ${themeClasses.accent} mb-2`}>
                  {theme === 'anime' ? '🎯 Special Abilities:' : 'Key Features:'}
                </h4>
                <ul className="space-y-1">
                  {project.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={`text-sm ${themeClasses.textSecondary} flex items-center space-x-2`}>
                      <Zap className={`w-3 h-3 ${themeClasses.accent} flex-shrink-0`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className={`px-2 py-1 bg-opacity-50 ${themeClasses.cardBg} ${themeClasses.accent} text-xs rounded-full border ${themeClasses.border}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing bracket */}
      <div className="mt-8">
        <span className={themeClasses.text}>];</span>
      </div>
    </div>
  );
};

export default Projects;