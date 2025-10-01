import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  const baseClasses = "flex items-center justify-center px-3 sm:px-5 py-2 text-sm font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-gray-800 transition-all duration-300 ease-in-out";
  const activeClasses = "bg-white text-brand-text shadow-md dark:bg-slate-700 dark:text-brand-light";
  const inactiveClasses = "text-slate-500 hover:bg-slate-200/50 hover:text-brand-text dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-brand-light";

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
};

export default TabButton;