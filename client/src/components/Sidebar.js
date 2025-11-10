import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  Calendar,
  Activity,
  Settings
} from './Icons';
import logoImage from '../logo.png';

const Sidebar = ({ currentUser }) => {
  const location = useLocation();   //Gets current URL path
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href) => {
    // if (href === '/dashboard') {
    //   return  location.pathname === '/dashboard';
    // }
    return location.pathname === href;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-[1500px]">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
                  
           <img
               src={logoImage}
               alt="Logo"
               className="w-[44px] h-[41px] md:w-[66px] md:h-[61px] lg:w-[88px] lg:h-[82px]"
             />
          
        
      </div>

      {/* Navigation */}
       <nav className="flex-1 p-4 space-y-1">
        {navigation.map(({ name, href, icon: Icon }) => (
          <Link //navigate without reload
            key={name}
            to={href}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive(href)
                ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
//reusable layout element displays app navigation menu
//use structured array to dynamically render links icons , labels
// Link from react-router-dom for smooth navigation
// useLocation() detect the current URL and highlight the active link