import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  const baseClasses = "flex items-center justify-center px-3 sm:px-5 py-2 text-sm font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand focus-visible:ring-offset-slate-100 dark:focus-visible:ring-offset-gray-800 transition-all duration-300 ease-in-out";
  const activeClasses = "bg-surface-light text-text-primary-light shadow-md dark:bg-surface-dark dark:text-text-primary-dark";
  const inactiveClasses = "text-text-secondary-light hover:bg-surface-light/50 hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:bg-surface-dark/50 dark:hover:text-text-primary-dark";

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