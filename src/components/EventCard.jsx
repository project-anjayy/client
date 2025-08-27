import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, isJoined, onJoin, onLeave, user, showCountdown = false }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time until event
  useEffect(() => {
    if (!showCountdown || !event.time) return;

    const updateCountdown = () => {
      const eventTime = new Date(event.time);
      const now = new Date();
      const difference = eventTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
        setIsExpired(false);
      } else {
        setTimeLeft('Event Started');
        setIsExpired(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event.time, showCountdown]);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'soccer':
        return '⚽';
      case 'basketball':
        return '🏀';
      case 'running':
        return '🏃';
      default:
        return '🏆';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'soccer':
        return 'from-green-500 to-blue-500';
      case 'basketball':
        return 'from-orange-500 to-red-500';
      case 'running':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isFull = event.available_slots === 0;
  const isCreator = user?.id === event.created_by;
  const slotsPercentage = (event.available_slots / event.total_slots) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(event.category)} flex items-center justify-center text-2xl mr-3`}>
            {getCategoryIcon(event.category)}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg truncate">{event.title}</h3>
            <p className="text-white/60 text-sm capitalize">{event.category}</p>
          </div>
        </div>
        
        {isCreator && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 px-2 py-1 rounded-lg">
            <span className="text-yellow-300 text-xs font-medium">Creator</span>
          </div>
        )}
      </div>

      {/* Countdown (if enabled) */}
      {showCountdown && (
        <div className={`mb-4 p-3 rounded-xl ${isExpired ? 'bg-red-500/20 border border-red-500/30' : 'bg-blue-500/20 border border-blue-500/30'}`}>
          <div className="flex items-center justify-center">
            <span className={`text-sm font-medium ${isExpired ? 'text-red-300' : 'text-blue-300'}`}>
              {isExpired ? '⏰ Event Started' : `⏱️ ${timeLeft} left`}
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-white/70 text-sm mb-4 line-clamp-2">{event.description}</p>

      {/* Event Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-white/80 text-sm">
          <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </div>
        
        <div className="flex items-center text-white/80 text-sm">
          <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(event.time)}</span>
        </div>
      </div>

      {/* Slots Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">Available Slots</span>
          <span className="text-white font-medium text-sm">
            {event.available_slots}/{event.total_slots}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              slotsPercentage > 50 ? 'bg-green-500' : 
              slotsPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${slotsPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-2">
        {isJoined ? (
          <button
            onClick={onLeave}
            disabled={isCreator}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isCreator 
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                : 'bg-red-600/80 text-white hover:bg-red-700 border border-red-500/50 hover:border-red-400'
            }`}
          >
            {isCreator ? 'Your Event' : 'Leave Event'}
          </button>
        ) : (
          <button
            onClick={onJoin}
            disabled={isFull || isCreator}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isFull || isCreator
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border border-blue-500/50 hover:border-blue-400'
            }`}
          >
            {isFull ? 'Event Full' : isCreator ? 'Your Event' : 'Join Event'}
          </button>
        )}
        
        {/* Details Button */}
        <button 
          onClick={() => navigate(`/event/${event.id}`)}
          className="bg-white/10 border border-white/20 hover:border-white/40 text-white px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center text-green-400 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Real-time updates
        </div>
      </div>
    </div>
  );
};

export default EventCard;
