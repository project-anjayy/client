import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import http from '../libraries/http';
import { showSuccess, showError, showLoading, closeLoading } from '../utils/sweetAlert';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    time: '',
    total_slots: '',
    duration: '90' // default 90 minutes
  });
  const [loading, setLoading] = useState(false);

  // Predefined categories - must match database ENUM values
  const categories = [
    'Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Badminton',
    'Swimming', 'Running', 'Cycling', 'Boxing', 'Martial Arts',
    'Gym/Fitness', 'Yoga', 'Dance', 'Other'
  ];

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      showError('Validation Error', 'Event title is required');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      showError('Validation Error', 'Please select a category');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      showError('Validation Error', 'Location is required');
      setLoading(false);
      return;
    }

    if (!formData.time) {
      showError('Validation Error', 'Event date and time is required');
      setLoading(false);
      return;
    }

    // Check if event time is in the future
    const eventTime = new Date(formData.time);
    const now = new Date();
    if (eventTime <= now) {
      showError('Validation Error', 'Event time must be in the future');
      setLoading(false);
      return;
    }

    if (!formData.total_slots || parseInt(formData.total_slots) < 1) {
      showError('Validation Error', 'Total slots must be at least 1');
      setLoading(false);
      return;
    }

    if (!formData.duration || parseInt(formData.duration) < 1) {
      showError('Validation Error', 'Duration must be at least 1 minute');
      setLoading(false);
      return;
    }

    try {
      showLoading('Creating your event...');

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        location: formData.location.trim(),
        time: new Date(formData.time).toISOString(),
        total_slots: parseInt(formData.total_slots),
        duration: parseInt(formData.duration)
      };

      console.log('Creating event with payload:', payload);

      const response = await http.post('/api/events', payload);

      closeLoading();

      if (response.data.status === 'success') {
        await showSuccess('Event Created!', 'Your event has been created successfully.');
        navigate('/my-events');
      } else {
        showError('Creation Failed', response.data.message || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      closeLoading();

      let errorMessage = 'An unexpected error occurred';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showError('Creation Failed', errorMessage);
    }

    setLoading(false);
  };

  // Helper to get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'}}>
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '100px', paddingBottom: '50px'}}>
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Create New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Event</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Set up your sports event and invite others to join
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  placeholder="e.g., Sunday Morning Football Match"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300 resize-none"
                  placeholder="Tell people what this event is about..."
                />
              </div>

              {/* Category and Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-slate-800 text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    placeholder="e.g., Central Park, Court 1"
                    required
                  />
                </div>
              </div>

              {/* Date & Time and Duration Row */}
              {/* Time and Slots Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                    placeholder="90"
                    required
                  />
                </div>
              </div>

              {/* Total Slots */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Total Slots *
                </label>
                <input
                  type="number"
                  name="total_slots"
                  value={formData.total_slots}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
                  placeholder="e.g., 10"
                  required
                />
                <p className="text-white/60 text-sm mt-1">
                  Maximum number of participants for this event
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/browse-events')}
                  className="flex-1 bg-white/10 text-white py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-600/10 to-transparent rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full"></div>
      </div>
    </div>
  );
};

export default CreateEvent;
