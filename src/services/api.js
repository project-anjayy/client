import http from '../libraries/http';

// Events API
export const eventsAPI = {
  // Get all events
  getEvents: () => http.get('/api/events'),
  
  // Get event by ID
  getEvent: (id) => http.get(`/api/events/${id}`),
  
  // Create new event
  createEvent: (eventData) => http.post('/api/events', eventData),
  
  // Update event
  updateEvent: (id, eventData) => http.put(`/api/events/${id}`, eventData),
  
  // Delete event
  deleteEvent: (id) => http.delete(`/api/events/${id}`),
  
  // Get user's events (joined events)
  getMyEvents: () => http.get('/api/events/my-events'),
  
  // Join event (RSVP)
  joinEvent: (id) => http.post(`/api/events/${id}/rsvp`),
  
  // Leave event (Cancel RSVP)
  leaveEvent: (id) => http.delete(`/api/events/${id}/rsvp`),
  
  // Get event feedback
  getEventFeedback: (id) => http.get(`/api/events/${id}/feedback`),
  
  // Submit event feedback
  submitFeedback: (id, feedback) => http.post(`/api/events/${id}/feedback`, feedback),
  
  // AI Chat recommendation
  getChatRecommendation: (message) => http.post('/api/events/recommend/chat', { message })
};

// Auth API
export const authAPI = {
  // Login
  login: (credentials) => http.post('/api/auth/login', credentials),
  
  // Register
  register: (userData) => http.post('/api/auth/register', userData),
  
  // Get user profile
  getProfile: () => http.get('/api/auth/profile')
};

// Export default for backward compatibility
export default {
  events: eventsAPI,
  auth: authAPI
};
