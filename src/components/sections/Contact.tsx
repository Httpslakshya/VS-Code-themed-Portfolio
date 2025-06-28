import React from 'react';
import { Mail, Github, Instagram, ExternalLink, MessageCircle, Send, Linkedin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Contact: React.FC = () => {
  const { theme } = useTheme();

  const contactMethods = [
    {
      platform: "GitHub",
      handle: "@Httpslakshya",
      url: "https://github.com/Httpslakshya",
      icon: Github,
      color: "#333",
      description: "Check out my code and projects"
    },
    {
      platform: "LinkedIn",
      handle: "Lakshya Dharkar",
      url: "https://www.linkedin.com/in/lakshya-dharkar-571004294/",
      icon: Linkedin,
      color: "#0077B5",
      description: "Professional network and experience"
    },
    {
      platform: "Instagram",
      handle: "@sm.lakshya_404",
      url: "https://instagram.com/sm.lakshya_404",
      icon: Instagram,
      color: "#E4405F",
      description: "Creative content and lifestyle"
    },
    {
      platform: "Email",
      handle: "lakshyadharkar@gmail.com",
      url: "mailto:lakshyadharkar@gmail.com",
      icon: Mail,
      color: "#007ACC",
      description: "For professional inquiries"
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
          accent: 'text-blue-600',
          input: 'bg-white border-gray-300 text-gray-900'
        };
      case 'monokai':
        return {
          bg: 'bg-[#272822]',
          cardBg: 'bg-[#3e3d32]',
          border: 'border-[#75715e]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#a6e22e]',
          accent: 'text-[#66d9ef]',
          input: 'bg-[#272822] border-[#75715e] text-[#f8f8f2]'
        };
      case 'dracula':
        return {
          bg: 'bg-[#282a36]',
          cardBg: 'bg-[#44475a]',
          border: 'border-[#6272a4]',
          text: 'text-[#f8f8f2]',
          textSecondary: 'text-[#8be9fd]',
          accent: 'text-[#bd93f9]',
          input: 'bg-[#282a36] border-[#6272a4] text-[#f8f8f2]'
        };
      case 'neon':
        return {
          bg: 'bg-black',
          cardBg: 'bg-[#001100]',
          border: 'border-[#00ff00]',
          text: 'text-[#00ff00]',
          textSecondary: 'text-[#00cc00]',
          accent: 'text-[#00ffff]',
          input: 'bg-black border-[#00ff00] text-[#00ff00]'
        };
      case 'anime':
        return {
          bg: 'bg-gradient-to-br from-pink-50 to-purple-100',
          cardBg: 'bg-gradient-to-r from-pink-100 to-purple-100',
          border: 'border-pink-300',
          text: 'text-purple-900',
          textSecondary: 'text-pink-600',
          accent: 'text-purple-600',
          input: 'bg-pink-50 border-pink-300 text-purple-900'
        };
      default:
        return {
          bg: 'bg-[#1e1e1e]',
          cardBg: 'bg-[#0d1117]',
          border: 'border-[#30363d]',
          text: 'text-white',
          textSecondary: 'text-[#cccccc]',
          accent: 'text-[#007ACC]',
          input: 'bg-[#0d1117] border-[#30363d] text-white'
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
            {theme === 'anime' ? 'summon' : 'contact'}
          </span>
          <span className={themeClasses.text}>=</span>
          <span className={themeClasses.text}>&#123;</span>
        </div>
      </div>

      {/* Introduction */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-8`}>
        <div className="mb-4">
          <span className="text-[#8b949e]">
            // {theme === 'anime' 
              ? "Let's team up and create something legendary together! 🌸" 
              : "Let's connect and build something amazing together!"
            }
          </span>
        </div>
        
        <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
          {theme === 'anime' 
            ? "Ready to join forces? 🗡️" 
            : "Ready to collaborate? 🚀"
          }
        </h2>
        
        <p className={`${themeClasses.textSecondary} leading-relaxed mb-4`}>
          {theme === 'anime' 
            ? "I'm always open to discussing new quests, epic projects, or just chatting about technology, web jutsu, or the latest in AI/ML magic. Whether it's a freelance mission, full-time adventure, or collaboration idea, I'd love to hear from you!"
            : "I'm always open to discussing new opportunities, interesting projects, or just chatting about technology, web development, or the latest in AI/ML. Whether it's a freelance project, full-time opportunity, or collaboration idea, I'd love to hear from you!"
          }
        </p>

        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400">
            {theme === 'anime' 
              ? "Currently available for new adventures" 
              : "Currently available for new projects"
            }
          </span>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="mb-8">
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' ? "Summoning channels" : "How to reach me"}
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>platforms:</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <a
                key={index}
                href={method.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 hover:border-[#007ACC] transition-all duration-300 hover:scale-105 group ${
                  theme === 'anime' ? 'hover:shadow-lg hover:shadow-pink-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${method.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: method.color }} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${themeClasses.text}`}>{method.platform}</h4>
                    <p className={`text-sm ${themeClasses.accent}`}>{method.handle}</p>
                  </div>
                  <ExternalLink className={`w-4 h-4 ${themeClasses.textSecondary} ml-auto opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
                <p className={`${themeClasses.textSecondary} text-sm`}>{method.description}</p>
              </a>
            );
          })}
        </div>
      </div>

      {/* Quick Message */}
      <div className="mb-8">
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' ? "Send a scroll message" : "Quick message form"}
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>send_message:</h3>
        </div>

        <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  {theme === 'anime' ? 'Your Name 🌸' : 'Your Name'}
                </label>
                <input
                  type="text"
                  className={`w-full rounded-lg px-4 py-2 ${themeClasses.input} focus:border-[#007ACC] focus:outline-none transition-colors`}
                  placeholder={theme === 'anime' ? 'Enter your shinobi name' : 'Enter your name'}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  {theme === 'anime' ? 'Contact Scroll 📮' : 'Email Address'}
                </label>
                <input
                  type="email"
                  className={`w-full rounded-lg px-4 py-2 ${themeClasses.input} focus:border-[#007ACC] focus:outline-none transition-colors`}
                  placeholder={theme === 'anime' ? 'your.scroll@dojo.com' : 'your.email@example.com'}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                {theme === 'anime' ? 'Your Message 🗞️' : 'Message'}
              </label>
              <textarea
                rows={5}
                className={`w-full rounded-lg px-4 py-2 ${themeClasses.input} focus:border-[#007ACC] focus:outline-none transition-colors resize-none`}
                placeholder={theme === 'anime' 
                  ? 'Tell me about your quest or just say konnichiwa!' 
                  : 'Tell me about your project or just say hi!'
                }
              ></textarea>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#007ACC] hover:bg-[#005a9e] text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              <Send className="w-4 h-4" />
              <span>{theme === 'anime' ? 'Send Scroll 🌸' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="mb-8">
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' 
              ? "Fun facts about teaming up with me" 
              : "Fun facts about working with me"
            }
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>fun_facts:</h3>
        </div>

        <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MessageCircle className={`w-5 h-5 ${themeClasses.accent}`} />
                <span className={themeClasses.textSecondary}>
                  {theme === 'anime' 
                    ? "Lightning-fast response time (usually within 24 hours) ⚡" 
                    : "Fast response time (usually within 24 hours)"
                  }
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Github className={`w-5 h-5 ${themeClasses.accent}`} />
                <span className={themeClasses.textSecondary}>
                  {theme === 'anime' 
                    ? "All missions include clean, documented code scrolls 📜" 
                    : "All projects include clean, documented code"
                  }
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <ExternalLink className={`w-5 h-5 ${themeClasses.accent}`} />
                <span className={themeClasses.textSecondary}>
                  {theme === 'anime' 
                    ? "Experienced with remote collaboration jutsu 🌐" 
                    : "Experienced with remote collaboration"
                  }
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className={`w-5 h-5 ${themeClasses.accent}`} />
                <span className={themeClasses.textSecondary}>
                  {theme === 'anime' 
                    ? "Available for both short quests and long adventures 🗡️" 
                    : "Available for both short and long-term projects"
                  }
                </span>
              </div>
            </div>
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

export default Contact;