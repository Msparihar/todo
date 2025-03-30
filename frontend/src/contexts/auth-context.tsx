import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, login as loginApi, register as registerApi, LoginData, RegisterData, getCookie, deleteCookie, AuthResponse } from '../lib/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount and token changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie('accessToken');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // For now, we consider having a token as being authenticated
        // In a real app, you'd validate the token with the server
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error validating token:', error);
        deleteCookie('accessToken');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up a timer to periodically check auth status
    const intervalId = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, []);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log("AuthContext: login attempt with", data.username);
      const response = await loginApi(data);

      // loginApi already sets the cookie and axios header
      console.log('Login successful, token received:', response.access_token ? 'Yes' : 'No');

      setIsAuthenticated(true);
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error('Login error in auth context:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const user = await registerApi(data);
      setUser(user);
      await login({ username: data.email, password: data.password });
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    deleteCookie('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
