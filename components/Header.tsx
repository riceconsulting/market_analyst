import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-slate-900/10 sticky top-0 z-30 w-full dark:bg-slate-900/70 dark:border-slate-50/[0.06] animate-slide-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and Branding */}
          <a 
            href="https://riceai.net" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-shrink-0 flex items-center space-x-3 group"
          >
            <img 
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AGB2yyJJKXfD527r/rice-ai-consulting-2-AoPWxvnWOju2GwOz.png" 
              alt="RICE AI Logo" 
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col leading-tight">
                <h1 className="font-bold text-xl sm:text-2xl tracking-tight text-slate-800 dark:text-slate-100">
                    RICE AI
                </h1>
                <p className="font-sans text-xs sm:text-sm text-sky-700 dark:text-sky-400 tracking-wide opacity-90">
                    Market Analyst
                </p>
            </div>
          </a>
          
          {/* Right side: Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;