import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon, Github, Linkedin, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TerminalProps {
  onClose: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ command: string; output: React.ReactNode }>>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input when terminal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Welcome message
    setHistory([{
      command: '',
      output: (
        <div className="mb-4">
          <div className="text-[#007ACC] font-bold mb-2">
            Welcome to Lakshya's Terminal v2.0.0
          </div>
          <div className="text-sm opacity-80">Type 'help' to see available commands</div>
        </div>
      )
    }]);
  }, [theme]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const commands = {
    help: () => (
      <div className="space-y-2">
        <div className="text-[#007ACC] font-semibold">Available commands:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
          <div><span className="text-green-400">about</span> - Show developer info</div>
          <div><span className="text-green-400">skills</span> - List technical skills</div>
          <div><span className="text-green-400">projects</span> - Display project portfolio</div>
          <div><span className="text-green-400">contact</span> - Get contact information</div>
          <div><span className="text-green-400">theme</span> - Show current theme info</div>
          <div><span className="text-green-400">clear</span> - Clear terminal</div>
          <div><span className="text-green-400">github</span> - Open GitHub profile</div>
          <div><span className="text-green-400">linkedin</span> - Open LinkedIn profile</div>
          <div><span className="text-green-400">fun</span> - Show easter eggs & fun facts</div>
        </div>
      </div>
    ),

    about: () => (
      <div className="space-y-2">
        <div className="text-[#007ACC] font-semibold">Developer Information:</div>
        <div>Name: Lakshya Dharkar</div>
        <div>Role: Fullstack Developer</div>
        <div>Education: BTech Computer Science Engineering</div>
        <div>College: Swami Vivekanand College of Engineering</div>
        <div>Focus: Web Development, AI/ML, DSA</div>
        <div>Status: <span className="text-green-400">Available for opportunities</span></div>
      </div>
    ),

    skills: () => (
      <div className="space-y-2">
        <div className="text-[#007ACC] font-semibold">Technical Skills:</div>
        <div><span className="text-yellow-400">Languages:</span> JavaScript, Java, C++, C, Python</div>
        <div><span className="text-yellow-400">Frontend:</span> React, HTML/CSS, Tailwind CSS</div>
        <div><span className="text-yellow-400">Backend:</span> Flask, Node.js</div>
        <div><span className="text-yellow-400">Design:</span> UI/UX (Figma 50%)</div>
        <div><span className="text-yellow-400">Tools:</span> Git & GitHub, VS Code, Postman</div>
        <div><span className="text-yellow-400">Learning:</span> Data Structures & Algorithms, AI/ML</div>
      </div>
    ),

    projects: () => (
      <div className="space-y-3">
        <div className="text-[#007ACC] font-semibold">Project Portfolio:</div>
        <div className="space-y-2">
          <div>
            <div className="text-green-400 font-medium">VS Code Portfolio</div>
            <div className="text-sm opacity-80">Interactive developer portfolio with VS Code theme</div>
            <div className="text-xs">Tech: React, TypeScript, Tailwind CSS</div>
          </div>
          <div>
            <div className="text-green-400 font-medium">MediStock</div>
            <div className="text-sm opacity-80">Medicine management system with account-based access</div>
            <div className="text-xs">Tech: React, JavaScript, CSS</div>
          </div>
          <div>
            <div className="text-green-400 font-medium">StreamWise AI</div>
            <div className="text-sm opacity-80">OTT recommendation platform powered by AI</div>
            <div className="text-xs">Tech: React, AI/ML, JavaScript</div>
          </div>
          <div>
            <div className="text-green-400 font-medium">TrueCatch</div>
            <div className="text-sm opacity-80">Platform for independent journalists using Story Protocol</div>
            <div className="text-xs">Tech: React, Blockchain, Story Protocol</div>
          </div>
        </div>
      </div>
    ),

    contact: () => (
      <div className="space-y-2">
        <div className="text-[#007ACC] font-semibold">Contact Information:</div>
        <div>📧 Email: lakshyadharkar@gmail.com</div>
        <div>💼 LinkedIn: linkedin.com/in/lakshya-dharkar-571004294</div>
        <div>🐙 GitHub: github.com/Httpslakshya</div>
        <div>📱 Instagram: @sm.lakshya_404</div>
        <div className="text-green-400 mt-2">Ready for new opportunities!</div>
      </div>
    ),

    theme: () => (
      <div className="space-y-2">
        <div className="text-[#007ACC] font-semibold">Current Theme Information:</div>
        <div>Active Theme: <span className="text-green-400 capitalize">{theme}</span></div>
        <div>Available Themes: Dark, Light, Monokai, Dracula, Neon</div>
        <div className="text-sm opacity-80">Switch themes using the top bar menu</div>
      </div>
    ),

    fun: () => (
      <div className="space-y-2">
        <div className="text-[#007ACC] font-semibold">🎉 Easter Eggs & Fun Facts!</div>
        <div>🚀 Fun Fact: I once debugged a problem for 3 hours only to realize I forgot a semicolon!</div>
        <div>🎮 Secret: I'm secretly hoping someone will hire me after seeing this portfolio 😉</div>
        <div>☕ Coffee Count: This portfolio was built with approximately 47 cups of coffee</div>
        <div>🌙 Night Owl: Most of my best code is written between 11 PM and 3 AM</div>
        <div>🎨 Design Inspiration: VS Code is my second home, so why not make my portfolio feel like it?</div>
        <div>🔮 Future Goal: To build an AI that can debug my code while I sleep</div>
        <div>📺 Favorite Anime: Attack on Titan, Death Note, Code Geass, One Piece</div>
      </div>
    ),

    github: () => {
      window.open('https://github.com/Httpslakshya', '_blank');
      return <div className="text-green-400">Opening GitHub profile...</div>;
    },

    linkedin: () => {
      window.open('https://www.linkedin.com/in/lakshya-dharkar-571004294/', '_blank');
      return <div className="text-green-400">Opening LinkedIn profile...</div>;
    },

    clear: () => {
      setHistory([]);
      return null;
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (trimmedCmd === 'clear') {
      setHistory([]);
      return;
    }

    const output = commands[trimmedCmd as keyof typeof commands] 
      ? commands[trimmedCmd as keyof typeof commands]()
      : <div className="text-red-400">Command not found: {cmd}. Type 'help' for available commands.</div>;

    if (output !== null) {
      setHistory(prev => [...prev, { command: cmd, output }]);
    }
    setCommandHistory(prev => [...prev, cmd]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          border: 'border-gray-300',
          input: 'bg-gray-50 border-gray-300 text-gray-900'
        };
      case 'monokai':
        return {
          bg: 'bg-[#272822]',
          text: 'text-[#f8f8f2]',
          border: 'border-[#75715e]',
          input: 'bg-[#3e3d32] border-[#75715e] text-[#f8f8f2]'
        };
      case 'dracula':
        return {
          bg: 'bg-[#282a36]',
          text: 'text-[#f8f8f2]',
          border: 'border-[#6272a4]',
          input: 'bg-[#44475a] border-[#6272a4] text-[#f8f8f2]'
        };
      case 'neon':
        return {
          bg: 'bg-black',
          text: 'text-[#00ff00]',
          border: 'border-[#00ff00]',
          input: 'bg-black border-[#00ff00] text-[#00ff00]'
        };
      default:
        return {
          bg: 'bg-[#1e1e1e]',
          text: 'text-white',
          border: 'border-[#30363d]',
          input: 'bg-[#0d1117] border-[#30363d] text-white'
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-4xl h-[80vh] rounded-lg border ${themeClasses.border} ${themeClasses.bg} ${themeClasses.text} flex flex-col shadow-2xl`}>
        {/* Terminal Header */}
        <div className={`flex items-center justify-between p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-5 h-5 text-[#007ACC]" />
            <span className="font-medium">Terminal</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Content */}
        <div 
          ref={terminalRef}
          className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2"
        >
          {history.map((entry, index) => (
            <div key={index}>
              {entry.command && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">lakshya@portfolio:~$</span>
                  <span>{entry.command}</span>
                </div>
              )}
              {entry.output && <div className="ml-4 mb-2">{entry.output}</div>}
            </div>
          ))}
        </div>

        {/* Terminal Input */}
        <form onSubmit={handleSubmit} className={`p-4 border-t ${themeClasses.border}`}>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-green-400">lakshya@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent border-none outline-none font-mono ${themeClasses.text}`}
              placeholder="Type a command..."
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Terminal;