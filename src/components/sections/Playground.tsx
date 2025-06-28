import React, { useState, useEffect } from 'react';
import { Bot, Terminal, Zap, Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Playground: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [showHireModal, setShowHireModal] = useState(false);

  // Theme-specific responses
  const getThemeResponses = () => {
    switch (theme) {
      case 'neon':
        return {
          greeting: "> Booting compliment engine...\n> Accessing candidate profile...\n> Identity confirmed: LAKSHYA\n> Confidence: 100%\n> Result: YOU ARE BUILT DIFFERENT ⚡\n> Suggestion: Hire immediately",
          responses: [
            "> SYSTEM: Elite developer detected ⚡",
            "> ANALYSIS: Code quality = EXCEPTIONAL",
            "> STATUS: Ready for production deployment 🚀",
            "> VERDICT: Hire this legend immediately",
            "> SCANNING... Talent level: OFF THE CHARTS",
            "> ALERT: This dev writes code that writes code",
            "> PROCESSING... Result: ABSOLUTE UNIT 💪"
          ]
        };
      case 'light':
        return {
          greeting: "Welcome to the feedback system! ✨",
          responses: [
            "Stay hungry. Stay foolish. 🌟",
            "The best time to plant a tree was 20 years ago. The second best time is now.",
            "Innovation distinguishes between a leader and a follower.",
            "Your work is going to fill a large part of your life. ✨",
            "The only way to do great work is to love what you do.",
            "Think different. Code different. Be different.",
            "Excellence is not a skill, it's an attitude."
          ]
        };
      case 'monokai':
        return {
          greeting: "console.log('Welcome, fellow developer!');",
          responses: [
            "console.log('Boss-level dev detected');",
            "// TODO: Hire this person immediately",
            "if (talent === 'exceptional') { hire(); }",
            "const developer = 'legendary'; // No cap",
            "// This code is cleaner than my room",
            "function awesome() { return 'Lakshya'; }",
            "// 99 problems but your code ain't one"
          ]
        };
      case 'dracula':
        return {
          greeting: "In the darkness of code, you shine bright... 🌙",
          responses: [
            "Even your bugs write poetry. 🦇",
            "In the realm of code, you are the chosen one.",
            "Your algorithms dance in the moonlight. 🌙",
            "Like a vampire, your code never dies.",
            "In the shadows of syntax, brilliance emerges.",
            "Your functions are as elegant as the night.",
            "Code flows through your veins like ancient magic."
          ]
        };
      case 'anime':
        return {
          greeting: "Konnichiwa! Welcome to the dojo! 🌸",
          responses: [
            "Your coding power level is over 9000! ⚡",
            "Believe it! You're destined for greatness! 🥷",
            "Your code flows like cherry blossoms in the wind 🌸",
            "Even the strongest shinobi would be impressed! ⚔️",
            "Your programming jutsu is legendary! 🔥",
            "You have the heart of a true code warrior! 💪",
            "Sugoi! Your skills are absolutely amazing! ✨"
          ]
        };
      default:
        return {
          greeting: "You're built for greatness 🚀",
          responses: [
            "You're absolutely crushing it! 🔥",
            "I'd hire you in a heartbeat! 💼",
            "Your potential is limitless! ⚡",
            "You're going to build something amazing! ✨",
            "Your dedication is inspiring! 💪",
            "You're a natural problem solver! 🧩",
            "The tech world needs more people like you! 🌍"
          ]
        };
    }
  };

  const specialCommands: { [key: string]: string } = {
    'konami': "🎮 KONAMI CODE ACTIVATED! You've unlocked the secret developer mode! All themes are now available with special effects!",
    'sudo hire lakshya': "> Permission granted ✅\n> Offer letter downloaded...\n> Welcome to the team! 🎉",
    'hire me': "📧 Contact: lakshyadharkar@gmail.com\n💼 LinkedIn: linkedin.com/in/lakshya-dharkar-571004294\n🐙 GitHub: github.com/Httpslakshya\n\nLet's build something amazing together! 🚀",
    'help': "Available commands:\n- konami (secret)\n- sudo hire lakshya\n- hire me\n- contact\n- skills\n- projects\n- anime (activate anime mode)",
    'contact': "📧 lakshyadharkar@gmail.com\n📱 Instagram: @sm.lakshya_404\n💼 LinkedIn: linkedin.com/in/lakshya-dharkar-571004294\n🐙 GitHub: github.com/Httpslakshya",
    'skills': "🚀 JavaScript, React, TypeScript, Java, C++, Python, Flask, UI/UX\n💻 Always learning and building cool stuff!",
    'projects': "🔥 Check out MediStock, StreamWise AI, TrueCatch, and more!\n💡 Each project solves real-world problems.",
    'anime': () => {
      setTheme('anime');
      return "🗡️ Entering Anime Mode...\n🌸 Summoning sakura particles...\n💥 Chakra unlocked. You're now coding like a shinobi.";
    }
  };

  const typeResponse = (text: string) => {
    setIsTyping(true);
    setOutput('');
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setOutput(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, theme === 'neon' ? 50 : 30);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const lowerInput = input.toLowerCase().trim();
    const themeResponses = getThemeResponses();
    
    // Add to terminal history for neon theme
    if (theme === 'neon') {
      setTerminalHistory(prev => [...prev, `> ${input}`]);
    }

    // Check for special commands
    const specialResponse = specialCommands[lowerInput];
    if (specialResponse) {
      if (typeof specialResponse === 'function') {
        typeResponse(specialResponse());
      } else {
        typeResponse(specialResponse);
      }
    } else {
      // Random response based on theme
      const randomResponse = themeResponses.responses[Math.floor(Math.random() * themeResponses.responses.length)];
      typeResponse(randomResponse);
    }
    
    setInput('');
  };

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
          cardBg: 'bg-black',
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

  // Neon theme terminal simulation
  if (theme === 'neon') {
    return (
      <div className="p-6 bg-black text-[#00ff00] font-mono min-h-screen">
        {/* Terminal Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Terminal className="w-6 h-6 text-[#00ff00]" />
            <span className="text-[#00ff00]">HACKER_TERMINAL_v2.0.0</span>
          </div>
          <div className="border border-[#00ff00] rounded-lg p-4 bg-black">
            <div className="text-[#00ff00] text-sm">
              <div className="mb-2">╔══════════════════════════════════════╗</div>
              <div className="mb-2">║     LAKSHYA DHARKAR - DEV PORTAL     ║</div>
              <div className="mb-2">║        PLAYGROUND ACTIVATED          ║</div>
              <div className="mb-2">╚══════════════════════════════════════╝</div>
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="mb-6 min-h-[300px] border border-[#00ff00] rounded-lg p-4 bg-black font-mono">
          <div className="text-[#00ff00]">
            <div className="mb-2">{'>'} Booting compliment engine...</div>
            <div className="mb-2">{'>'} Accessing candidate profile...</div>
            <div className="mb-2">{'>'} Identity confirmed: LAKSHYA</div>
            <div className="mb-2">{'>'} Confidence: 100%</div>
            <div className="mb-4">{'>'} Result: YOU ARE BUILT DIFFERENT ⚡</div>
            
            {/* Terminal History */}
            {terminalHistory.map((line, index) => (
              <div key={index} className="mb-1">{line}</div>
            ))}
            
            {/* Current Output */}
            {output && (
              <div className="mb-2 text-[#00ff00]">
                <pre className="whitespace-pre-wrap">{output}</pre>
                {isTyping && <span className="animate-pulse">▊</span>}
              </div>
            )}
          </div>
        </div>

        {/* Terminal Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-[#00ff00]">root@lakshya:~$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="flex-1 bg-black border border-[#00ff00] text-[#00ff00] px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-[#00ff00] placeholder-[#008000]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00ff00] text-black font-bold hover:bg-[#00cc00] transition-colors"
            >
              EXEC
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowHireModal(true)}
            className="border border-[#00ff00] text-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black transition-colors"
          >
            HIRE_ME.exe
          </button>
          <a
            href="https://github.com/Httpslakshya"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#00ff00] text-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black transition-colors text-center"
          >
            GITHUB.link
          </a>
          <a
            href="https://www.linkedin.com/in/lakshya-dharkar-571004294/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#00ff00] text-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black transition-colors text-center"
          >
            LINKEDIN.url
          </a>
          <a
            href="https://instagram.com/sm.lakshya_404"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#00ff00] text-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black transition-colors text-center"
          >
            INSTA.social
          </a>
        </div>
      </div>
    );
  }

  // Regular theme interface
  return (
    <div className={`p-6 ${themeClasses.text} font-mono ${theme === 'anime' ? 'font-zen' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-[#569cd6]">const</span>
          <span className="text-[#9cdcfe]">
            {theme === 'anime' ? 'dojo' : 'playground'}
          </span>
          <span className={themeClasses.text}>=</span>
          <span className={themeClasses.text}>&#123;</span>
        </div>
        <div className="mb-6">
          <span className="text-[#8b949e]">
            // {theme === 'anime' 
              ? "AI-Powered Motivation Dojo 🌸" 
              : "AI-Powered Feedback System"
            }
          </span>
          <h3 className={`text-xl font-semibold ${themeClasses.accent} mt-2`}>
            {theme === 'light' ? 'Motivational Quotes' : 
             theme === 'monokai' ? 'Developer Console' :
             theme === 'dracula' ? 'Dark Poetry Generator' :
             theme === 'anime' ? 'Sensei\'s Wisdom 🥷' :
             'Interactive Feedback AI'}
          </h3>
        </div>
      </div>

      {/* Main Interface */}
      <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 mb-6`}>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                theme === 'light' ? 'Ask for motivation...' :
                theme === 'monokai' ? 'console.log("your message");' :
                theme === 'dracula' ? 'Whisper to the shadows...' :
                theme === 'anime' ? 'Ask sensei for wisdom... 🌸' :
                'Type anything here...'
              }
              className={`flex-1 px-4 py-3 rounded-lg border ${themeClasses.input} font-mono focus:outline-none focus:ring-2 focus:ring-[#007ACC]`}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#007ACC] hover:bg-[#005a9e] text-white rounded-lg transition-colors duration-300 font-medium"
            >
              {theme === 'monokai' ? 'Execute' : 
               theme === 'anime' ? 'Ask Sensei 🌸' : 'Send'}
            </button>
          </div>
        </form>

        {/* Response Area */}
        <div className={`min-h-[100px] p-4 rounded-lg border ${themeClasses.border} ${themeClasses.cardBg}`}>
          {output ? (
            <div className="flex items-start space-x-3">
              <Bot className={`w-6 h-6 ${themeClasses.accent} mt-1 flex-shrink-0`} />
              <div>
                <pre className={`${themeClasses.text} whitespace-pre-wrap font-mono`}>
                  {output}
                  {isTyping && <span className="animate-pulse">|</span>}
                </pre>
              </div>
            </div>
          ) : (
            <div className={`${themeClasses.textSecondary} italic flex items-center justify-center h-full`}>
              {getThemeResponses().greeting}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setShowHireModal(true)}
          className={`flex items-center justify-center space-x-2 p-3 border ${themeClasses.border} rounded-lg hover:border-[#007ACC] transition-colors`}
        >
          <Mail className="w-4 h-4" />
          <span>{theme === 'anime' ? 'Summon Me 🌸' : 'Hire Me'}</span>
        </button>
        <a
          href="https://github.com/Httpslakshya"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center space-x-2 p-3 border ${themeClasses.border} rounded-lg hover:border-[#007ACC] transition-colors`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub</span>
        </a>
        <a
          href="https://www.linkedin.com/in/lakshya-dharkar-571004294/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center space-x-2 p-3 border ${themeClasses.border} rounded-lg hover:border-[#007ACC] transition-colors`}
        >
          <Linkedin className="w-4 h-4" />
          <span>LinkedIn</span>
        </a>
        <a
          href="https://instagram.com/sm.lakshya_404"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center space-x-2 p-3 border ${themeClasses.border} rounded-lg hover:border-[#007ACC] transition-colors`}
        >
          <Instagram className="w-4 h-4" />
          <span>Instagram</span>
        </a>
      </div>

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeClasses.cardBg} border ${themeClasses.border} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>
              {theme === 'anime' ? "Let's Team Up! 🌸" : "Let's Connect! 🚀"}
            </h3>
            <div className="space-y-3">
              <div className={`${themeClasses.textSecondary}`}>
                <strong>Email:</strong> lakshyadharkar@gmail.com
              </div>
              <div className={`${themeClasses.textSecondary}`}>
                <strong>LinkedIn:</strong> linkedin.com/in/lakshya-dharkar-571004294
              </div>
              <div className={`${themeClasses.textSecondary}`}>
                <strong>GitHub:</strong> github.com/Httpslakshya
              </div>
            </div>
            <button
              onClick={() => setShowHireModal(false)}
              className="mt-4 px-4 py-2 bg-[#007ACC] text-white rounded-lg hover:bg-[#005a9e] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Closing bracket */}
      <div className="mt-8">
        <span className={themeClasses.text}>&#125;</span>
        <span className="text-[#8b949e]">;</span>
      </div>
    </div>
  );
};

export default Playground;