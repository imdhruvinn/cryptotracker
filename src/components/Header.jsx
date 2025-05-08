import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 shadow-lg py-4 px-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg 
            className="h-8 w-8 text-yellow-500 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-4H8v2h3v2h2v-2h3v-3h-6V9h6V6h-3V4h-2v2H8v3h6v3h-3v2z"/>
          </svg>
          <h1 className="text-2xl font-bold">Crypto Tracker</h1>
        </div>
        <div className="text-sm bg-gray-700 px-3 py-1 rounded-full flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 