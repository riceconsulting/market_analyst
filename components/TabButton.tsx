import React from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => {
  const baseClasses = "flex items-center justify-center px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 focus-visible:ring-offset-slate-100 transition-colors duration-200";
  const activeClasses = "bg-white text-sky-700 shadow-sm";
  const inactiveClasses = "text-slate-500 hover:text-sky-700";

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