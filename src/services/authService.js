import http from '../libraries/http';

export const authAPI = {
  // Register user
  register: async (userData) => {
    try {
      const response = await http.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('AuthService: Attempting login with:', credentials);
      const response = await http.post('/api/auth/login', credentials);
      console.log('AuthService: Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Login error:', error);
      // Re-throw the error so it can be handled properly in the component
      if (error.response) {
        // Backend returned an error response
        console.error('AuthService: Error response data:', error.response.data);
        console.error('AuthService: Error response status:', error.response.status);
        throw error;
      } else {
        // Network error or other issues
        console.error('AuthService: Network or other error');
        throw { message: 'Network error', originalError: error };
      }
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await http.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

export default authAPI;
