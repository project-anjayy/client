import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import http from '../libraries/http';

const AiChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! 👋 Selamat datang di AI Sports Recommendation!\n\nSaya akan membantu Anda menemukan event olahraga yang perfect untuk Anda!\n\nApa jenis olahraga yang ingin Anda ikuti? Tulis saja dengan bebas, misalnya:\n• "Saya mau main bola"\n• "Pengen basket"\n• "Cari event lari"\n• "Mau coba yoga"\n\nAyo mulai! 🏃‍♂️⚽🏀'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [conversationState, setConversationState] = useState('initial');
  const [detectedSport, setDetectedSport] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history array - only user messages
      const history = newMessages
        .filter(msg => msg.role === 'user')
        .map(msg => ({
          role: 'user',
          content: msg.content
        }));
      
      console.log('Sending AI chat request:', {
        endpoint: 'POST /api/ai-chat/chat',
        history: history
      });
      
      const response = await http.post('/api/ai-chat/chat', {
        history: history
      });

      console.log('AI Chat Response:', response.data);

      if (response.data.status === 'success' || response.data.status === 'ask') {
        const aiMessage = {
          role: 'assistant',
          content: response.data.ai_reply
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setRecommendedEvents(response.data.events || []);
        
        // Update conversation state
        if (response.data.conversation_state) {
          setConversationState(response.data.conversation_state);
        }
        if (response.data.detected_sport) {
          setDetectedSport(response.data.detected_sport);
        }
        if (response.data.detected_location) {
          setDetectedLocation(response.data.detected_location);
        }
      } else {
        throw new Error(response.data.message || 'AI request failed');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      let errorMessage = 'Maaf, terjadi kesalahan pada AI Chat.';
      
      if (error.response?.status === 500) {
        errorMessage = '🚨 AI Error: Server mengalami masalah internal.';
      } else if (error.response?.status === 401) {
        errorMessage = '🔒 Sesi Anda telah berakhir. Silakan login ulang.';
      } else if (error.response?.status === 400) {
        errorMessage = '⚠️ Request Error: Format request tidak valid.';
      } else if (error.response?.data?.message) {
        errorMessage = `🤖 AI Error: ${error.response.data.message}`;
      }
      
      const errorMessageObj = {
        role: 'assistant',
        content: errorMessage
      };
      setMessages(prev => [...prev, errorMessageObj]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinEvent = (eventId) => {
    navigate(`/browse-events?highlight=${eventId}`);
  };

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🤖 AI Sports Recommendation
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Dapatkan rekomendasi event olahraga yang sesuai dengan minat Anda!
            </p>
            
            {/* Conversation State Indicator */}
            {conversationState !== 'initial' && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/30 rounded-xl text-sm text-blue-300">
                {detectedSport && (
                  <span className="flex items-center gap-1">
                    🏃‍♂️ {detectedSport}
                  </span>
                )}
                {detectedLocation && (
                  <span className="flex items-center gap-1">
                    📍 {detectedLocation}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 flex flex-col h-96 sm:h-[500px] overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-700/50 text-white border border-gray-600'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700/50 border border-gray-600 text-white/80 px-4 py-3 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <p className="text-sm">AI sedang mengetik...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tulis jenis olahraga yang Anda inginkan..."
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-gray-700/70 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Events */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  📅 Event Rekomendasi
                </h3>
                
                {recommendedEvents.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                      <div className="text-4xl mb-4">🎯</div>
                      <p className="text-sm mb-2">
                        Belum ada rekomendasi event.
                      </p>
                      <p className="text-xs text-gray-500">
                        💡 Ceritakan olahraga apa yang ingin Anda mainkan!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-gray-700/30 border border-gray-600 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                        onClick={() => handleJoinEvent(event.id)}
                      >
                        <h4 className="font-semibold text-white text-sm mb-2">
                          {event.title}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p className="flex items-center gap-2">
                            📍 {event.location}
                          </p>
                          <p className="flex items-center gap-2">
                            🏷️ {event.category}
                          </p>
                          <p className="flex items-center gap-2">
                            🕒 {formatDate(event.time)}
                          </p>
                          <p className="flex items-center gap-2">
                            👥 {event.available_slots}/{event.total_slots} slot tersedia
                          </p>
                          {event.duration && (
                            <p className="flex items-center gap-2">
                              ⏱️ {event.duration} menit
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <span className="text-xs text-blue-400 hover:text-blue-300">
                            Klik untuk lihat detail →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-900/20 border border-blue-700/30 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              💡 Cara menggunakan AI Chat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="text-blue-300 font-semibold mb-2">✨ Input Bebas</h4>
                <ul className="space-y-1 text-xs">
                  <li>• "Saya mau main bola"</li>
                  <li>• "Pengen basket"</li>
                  <li>• "Cari event lari"</li>
                  <li>• "Mau coba yoga"</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-300 font-semibold mb-2">🎯 AI akan</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Mengenali jenis olahraga</li>
                  <li>• Bertanya lokasi jika perlu</li>
                  <li>• Memberikan rekomendasi</li>
                  <li>• Menampilkan event terdekat</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default AiChatPage;
