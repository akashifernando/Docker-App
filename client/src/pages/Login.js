import React, { useState } from 'react';
import logoImage from '../logo.png';
import { userLogin, userSignup } from '../services/api';

const Login = ({ onLogin }) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);



  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userLogin({ username, password });

      // Check for success using our new wrapper logic
      // e.g., response.data.success or response.data.data.token

      const responseBody = response.data;

      if (responseBody.success && responseBody.data && responseBody.data.token) {
        const { token } = responseBody.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        if (onLogin) onLogin({ username, token });
      } else {
        // Fallback if structure is slightly different or check success flag
        alert(responseBody.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userSignup({ username, password });
      const responseBody = response.data;

      if (responseBody.success) {
        alert('Registration successful! You can now log in.');
        setShowSignUp(false);
      } else {
        alert(responseBody.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      alert(`Registration Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleSignIn = () => {
    console.log('Google Sign In clicked');
  };

  const handleAppleSignIn = () => {
    console.log('Apple Sign In clicked');
  };

  return (
    <div className="flex min-h-screen font-sans bg-white">
      {/* Left side - Logo */}
      <div className="flex items-center justify-center flex-1 p-8 bg-white">
        <img src={logoImage} alt="Logo" className="max-w-full max-h-[500px] object-contain" />
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center flex-1 px-6 bg-gradient-to-br from-blue-200 to-blue-300">
        <div className="w-full max-w-md p-8 shadow-xl rounded-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-gray-700">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={showSignUp ? handleSignUpSubmit : handleLoginSubmit} className="space-y-6">
            {/* Username (was Email) */}
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                {!showSignUp && (
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Remember Me */}
            {!showSignUp && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">Remember for 30 days</label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 text-sm font-medium text-blue-600 bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : showSignUp ? 'Sign Up' : 'Login'}
            </button>

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowSignUp(!showSignUp)}
              className="w-full px-4 py-3 text-sm font-medium text-white border border-white rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              {showSignUp ? 'Back to Login' : 'Sign Up'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-400"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-700 bg-blue-300">OR</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={handleGoogleSignIn} className="flex items-center justify-center w-full px-4 py-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">Sign in with Google</span>
              </button>
              <button type="button" onClick={handleAppleSignIn} className="flex items-center justify-center w-full px-4 py-3 bg-white rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">Sign in with Apple</span>
              </button>
            </div>

            {/* Bottom Link */}
            <div className="text-center">
              <span className="text-sm text-gray-700">
                Don't have an account?{' '}
                <button type="button" onClick={() => setShowSignUp(!showSignUp)} className="font-medium text-blue-600 hover:text-blue-500">
                  {showSignUp ? 'Login' : 'Sign Up'}
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
