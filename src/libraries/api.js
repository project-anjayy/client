import http from './http';

// Auth API calls
export const authAPI = {
  register: (userData) => http.post('/api/auth/register', userData),
  login: (credentials) => http.post('/api/auth/login', credentials),
  getProfile: () => http.get('/api/auth/profile'),
};

// Events API calls
export const eventsAPI = {
  getEvents: (params) => http.get('/api/events', { params }),
  getEvent: (id) => http.get(`/api/events/${id}`),
  createEvent: (eventData) => http.post('/api/events', eventData),
  updateEvent: (id, eventData) => http.put(`/api/events/${id}`, eventData),
  deleteEvent: (id) => http.delete(`/api/events/${id}`),
};

// RSVP API calls
export const rsvpAPI = {
  joinEvent: (eventId) => http.post(`/api/events/${eventId}/rsvp`),
  cancelRSVP: (eventId) => http.delete(`/api/events/${eventId}/rsvp`),
};

// Feedback API calls
export const feedbackAPI = {
  getFeedbacks: (eventId) => http.get(`/api/events/${eventId}/feedback`),
  submitFeedback: (eventId, feedbackData) => http.post(`/api/events/${eventId}/feedback`, feedbackData),
  getEventRating: (eventId) => http.get(`/api/events/${eventId}/rating`),
};

// AI Chat API calls
export const aiAPI = {
  getRecommendations: (history) => http.post('/api/events/recommend/chat', { history }),
};
