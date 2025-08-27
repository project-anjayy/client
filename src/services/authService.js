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
      const response = await http.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Re-throw the error so it can be handled properly in the component
      if (error.response) {
        // Backend returned an error response
        throw error;
      } else {
        // Network error or other issues
        throw { message: 'Network error' };
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
