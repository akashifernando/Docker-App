import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import React, { useState,useEffect } from 'react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Tasks from './pages/Tasks';

import './App.css';

function App() {
  //state to track logged in user
const [currentUser, setCurrentUser] = useState(null);
 //state to track authenication
const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore login on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);
const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    // Store user in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));//saves data in browser persists even afte refresh
  };
 if (!isAuthenticated) {
  return <Login onLogin={handleLogin} />;
}
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

return (
  <Router>
   <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <div className="flex flex-col flex-1">
          <Header currentUser={currentUser} onLogout={handleLogout} />
          
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard currentUser={currentUser} />} />
              <Route path="/dashboard" element={<Dashboard currentUser={currentUser} />} />
               <Route path="/tasks" element={<Tasks currentUser={currentUser} />} />
            </Routes> 
          </main>
        </div>
      </div>
  </Router>
);

}

export default App;

 
// React Router for navigation and useState to manage login state.
//  If the user isn’t authenticated, show the login page. 
// Once logged in, render the layout with Sidebar, Header, and route-based pages like Dashboard and Tasks. 
// also store user data in localStorage so it persists across refreshes