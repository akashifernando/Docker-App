import React from 'react';
import { Search, Bell, User } from './Icons';

const Header = ({ currentUser,onLogout}) => {
  return (
    <header className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="w-[1195px] space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 leading-5 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search Here"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 rounded-lg hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Bell className="w-6 h-6" />
            <span className="absolute block w-2 h-2 bg-red-400 rounded-full top-1 right-1"></span>
          </button>
          

          {/* User Menu */}
          <div className="relative">
            <button className="flex items-center p-2 space-x-3 text-gray-700 rounded-lg hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <div className="p-1 bg-gray-300 rounded-full">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium">{currentUser?.name || 'User'}</div>
                <p className="text-xs text-gray-500 truncate">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                
              </div>
              <button
                      onClick={onLogout}
                      className="p-1 text-gray-400 transition-colors rounded-md hover:text-gray-600 hover:bg-gray-100"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;