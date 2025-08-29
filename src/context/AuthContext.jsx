import React, { createContext, useContext, useState, useEffect } from 'react';
import http from '../libraries/http';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Check for stored auth data on mount
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext useEffect - Stored user data:', storedUser);
      
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext useEffect - Parsed user data:', parsedUser);
        
        setToken(storedToken);
        
        // Check if user data is incomplete (missing name)
        if (!parsedUser.name && !parsedUser.full_name) {
          console.log('AuthContext useEffect - User data incomplete, fetching profile...');
          
          try {
            // Fetch complete profile using axios
            const response = await http.get('/api/auth/profile');
            const profileData = response.data;
            
            console.log('AuthContext useEffect - Profile API Response:', profileData);
            
            if (profileData.status === 'success') {
              const completeUser = profileData.data;
              const normalizedUser = {
                ...completeUser,
                name: completeUser.full_name || completeUser.name || null,
                email: completeUser.email || null,
                id: completeUser.id || null
              };
              
              console.log('AuthContext useEffect - Complete user from profile:', normalizedUser);
              localStorage.setItem('user', JSON.stringify(normalizedUser));
              setUser(normalizedUser);
            } else {
              setUser(parsedUser);
            }
          } catch (error) {
            console.error('AuthContext useEffect - Error fetching profile:', error);
            // Use fallback with email username
            const fallbackUser = {
              ...parsedUser,
              name: parsedUser.name || parsedUser.full_name || parsedUser.email?.split('@')[0] || 'User'
            };
            setUser(fallbackUser);
          }
        } else {
          // User data is already complete
          const normalizedUser = {
            ...parsedUser,
            name: parsedUser.name || parsedUser.full_name || parsedUser.email?.split('@')[0] || 'User',
            email: parsedUser.email || null,
            id: parsedUser.id || null
          };
          
          console.log('AuthContext useEffect - Using stored complete user data:', normalizedUser);
          setUser(normalizedUser);
        }
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (userData, authToken) => {
    // Store token first for API calls
    localStorage.setItem('token', authToken);
    setToken(authToken);
    
    try {
      // Fetch complete user profile from server using axios
      const response = await http.get('/api/auth/profile');
      const profileData = response.data;
      
      console.log('AuthContext - Profile API Response:', profileData);
      
      if (profileData.status === 'success') {
        // Use complete profile data
        const completeUser = profileData.data;
        
        // Normalize user data - handle different field names
        const normalizedUser = {
          ...completeUser,
          name: completeUser.full_name || completeUser.name || null,
          email: completeUser.email || null,
          id: completeUser.id || null
        };
        
        console.log('AuthContext - Complete user data from profile:', completeUser);
        console.log('AuthContext - Normalized user data:', normalizedUser);
        
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } else {
        // Fallback to original user data if profile fetch fails
        const normalizedUser = {
          ...userData,
          name: userData.name || userData.full_name || null,
          email: userData.email || null,
          id: userData.id || null
        };
        
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('AuthContext - Error fetching profile:', error);
      // Fallback to original user data with email username as name
      const normalizedUser = {
        ...userData,
        name: userData.name || userData.full_name || userData.email?.split('@')[0] || 'User',
        email: userData.email || null,
        id: userData.id || null
      };
      
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
