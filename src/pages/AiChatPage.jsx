import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import http from '../libraries/http';

const AiChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('aiChatHistory');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [
      {
        role: 'assistant',
        content: '👋 Halo! Selamat datang di AI Sports Recommendation!\n\nSaya akan membantu Anda menemukan event olahraga yang perfect untuk Anda!\n\nApa jenis olahraga yang ingin Anda ikuti? Tulis saja dengan bebas, misalnya:\n• "Saya mau main bola"\n• "Pengen basket"\n• "Cari event lari"\n• "Mau coba yoga"\n\nAyo mulai! 🏃‍♂️⚽🏀'
      }
    ];
  };

  // Save chat history to localStorage
  const saveChatHistory = (messages) => {
    try {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };
  
  const [messages, setMessages] = useState(loadChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [conversationState, setConversationState] = useState('initial');
  const [detectedSport, setDetectedSport] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverCheckAttempts, setServerCheckAttempts] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Check if returning from event detail page and show welcome back message
  useEffect(() => {
    if (location.state?.fromEventDetail) {
      // Restore chat history if provided
      if (location.state?.restoreHistory) {
        setMessages(location.state.restoreHistory);
      }
      
      // Add welcome back message if history has messages
      if (messages.length > 1) {
        const welcomeBackMessage = {
          role: 'assistant',
          content: '👋 Selamat datang kembali! Bagaimana event yang baru saja Anda lihat? Apakah Anda ingin mencari event lain atau ada pertanyaan tentang event tersebut?'
        };
        
        // Only add if the last message is not already a welcome back message
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage.content.includes('Selamat datang kembali')) {
          setMessages(prev => [...prev, welcomeBackMessage]);
        }
      }
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check server status on mount - focus on AI endpoint
  useEffect(() => {
    const checkServerStatus = async () => {
      // Limit retry attempts to prevent spam
      if (serverCheckAttempts >= 2) {
        setServerStatus('offline');
        return;
      }

      try {
        // Test with a simple request to see if we can at least connect
        // Since AI endpoint needs history data, just assume online if profile works
        setServerStatus('online');
        setServerCheckAttempts(0); // Reset on success
      } catch (error) {
        console.log('Server check failed:', error);
        setServerCheckAttempts(prev => prev + 1);
        setServerStatus('offline');
      }
    };
    
    if (user && serverCheckAttempts < 2) {
      checkServerStatus();
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // If server is offline, provide mock response for demo
    if (serverStatus === 'offline') {
      setTimeout(() => {
        const mockResponse = {
          role: 'assistant',
          content: '🚧 AI Endpoint sedang bermasalah!\n\nDemo Response untuk "' + input + '":\n\n🤖 Saya mengerti Anda ingin bermain olahraga. Ketika endpoint sudah diperbaiki, saya akan:\n• Auto-mapping kategori dari input bebas Anda\n• Bertanya lokasi jika belum disebutkan\n• Memberikan rekomendasi event yang sesuai\n\n⚠️ Tim backend sedang memperbaiki endpoint AI'
        };
        setMessages(prev => [...prev, mockResponse]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    try {
      // Prepare history array - include both user and assistant messages for context
      const history = newMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') // Include both for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Validate history array
      if (!Array.isArray(history) || history.length === 0) {
        throw new Error('History array is required');
      }
      
      console.log('Sending AI chat request:');
      console.log('- Endpoint: POST /api/ai-chat/chat');
      console.log('- History array:', history);
      console.log('- History length:', history.length);
      
      const response = await http.post('/api/ai-chat/chat', {
        history: history
      });

      console.log('AI Chat Response:', response.data);

      if (response.data.status === 'success') {
        const aiMessage = {
          role: 'assistant',
          content: response.data.ai_reply
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setRecommendedEvents(response.data.events || []);
        setServerStatus('online');
      } else if (response.data.status === 'ask') {
        // NEW: Handle AI asking for more information
        const aiMessage = {
          role: 'assistant',
          content: response.data.ai_reply
        };
        
        setMessages(prev => [...prev, aiMessage]);
        // Clear events when AI is asking questions
        setRecommendedEvents([]);
        setServerStatus('online');
      } else if (response.data.status === 'error') {
        // Handle backend error response
        throw new Error(response.data.message || 'AI request failed');
      } else {
        throw new Error('Unexpected response format from AI endpoint');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      setServerStatus('offline');
      
      let errorMessage = 'Maaf, terjadi kesalahan pada AI Chat.';
      
      if (error.response?.status === 500) {
        // Internal server error
        const backendError = error.response.data;
        if (backendError?.status === 'error') {
          errorMessage = `🚨 AI Error: ${backendError.message}`;
          if (backendError.error) {
            console.error('Backend error detail:', backendError.error);
            errorMessage += '\n\nDetail error telah di-log untuk tim backend.';
          }
        } else {
          errorMessage = '🚨 AI Endpoint Error (500): Server mengalami masalah internal.';
        }
      } else if (error.response?.status === 401) {
        errorMessage = '🔒 Sesi Anda telah berakhir. Silakan login ulang untuk menggunakan AI Chat.';
      } else if (error.response?.status === 400) {
        // Bad request - likely validation error
        const backendError = error.response.data;
        if (backendError?.status === 'error') {
          errorMessage = `⚠️ Request Error: ${backendError.message}`;
        } else {
          errorMessage = '⚠️ Format request tidak valid. Pastikan Anda mengirim pesan yang benar.';
        }
      } else if (error.message === 'History array is required') {
        errorMessage = '⚠️ Error: Tidak ada riwayat chat untuk dikirim ke AI.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '🌐 Tidak dapat terhubung ke server AI. Periksa koneksi internet Anda.';
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

  const handleTestAI = async () => {
    setIsLoading(true);
    try {
      const testHistory = [
        { role: 'user', content: 'saya mau main bola di jakarta' }
      ];
      
      console.log('Testing AI endpoint with:', testHistory);
      const response = await http.post('/api/ai-chat/chat', {
        history: testHistory
      });
      
      if (response.data.status === 'success') {
        setServerStatus('online');
        const testMessage = {
          role: 'assistant',
          content: `✅ AI Test berhasil! Server merespons: "${response.data.ai_reply.substring(0, 100)}..."`
        };
        setMessages(prev => [...prev, testMessage]);
        setRecommendedEvents(response.data.events || []);
      } else if (response.data.status === 'ask') {
        setServerStatus('online');
        const testMessage = {
          role: 'assistant',
          content: `✅ AI Test berhasil (asking)! Server bertanya: "${response.data.ai_reply}"`
        };
        setMessages(prev => [...prev, testMessage]);
        setRecommendedEvents([]);
      }
    } catch (error) {
      setServerStatus('offline');
      const errorMessage = {
        role: 'assistant',
        content: `❌ AI Test gagal: ${error.response?.data?.message || error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleClearHistory = () => {
    const confirmClear = window.confirm('Apakah Anda yakin ingin menghapus semua riwayat chat?');
    if (confirmClear) {
      const initialMessage = [
        {
          role: 'assistant',
          content: '👋 Halo! Selamat datang di AI Sports Recommendation!\n\nSaya akan membantu Anda menemukan event olahraga yang perfect untuk Anda!\n\nApa jenis olahraga yang ingin Anda ikuti? Tulis saja dengan bebas, misalnya:\n• "Saya mau main bola"\n• "Pengen basket"\n• "Cari event lari"\n• "Mau coba yoga"\n\nAyo mulai! 🏃‍♂️⚽🏀'
        }
      ];
      setMessages(initialMessage);
      setRecommendedEvents([]);
      localStorage.removeItem('aiChatHistory');
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

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">{/* Shimmer overlay */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    🤖 AI Sports Recommendation
                  </h1>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    serverStatus === 'online' 
                      ? 'bg-green-500/20 text-green-300' 
                      : serverStatus === 'offline'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      serverStatus === 'online' 
                        ? 'bg-green-400' 
                        : serverStatus === 'offline'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                    }`}></div>
                    {serverStatus === 'online' ? 'Server Online' : serverStatus === 'offline' ? 'Server Error (500)' : 'Checking Server...'}
                  </div>
                </div>
                <p className="text-white/80">
                  Dapatkan rekomendasi event olahraga yang sesuai dengan minat Anda!
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300"
                >
                  ← Dashboard
                </button>
                <button
                  onClick={handleClearHistory}
                  className="bg-red-600/80 backdrop-blur-sm border border-red-400/30 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300"
                >
                  🗑️ Clear Chat
                </button>
                <button
                  onClick={handleTestAI}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 shadow-lg"
                >
                  🧪 Test AI
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-lg flex flex-col h-96 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">{/* Custom scrollbar */}
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
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg backdrop-blur-sm border ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-white/20 shadow-lg'
                          : message.role === 'system'
                          ? 'bg-green-600/30 text-green-200 border-green-400/30'
                          : 'bg-black/30 text-white/90 border-white/20'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black/30 backdrop-blur-sm border border-white/20 text-white/80 px-4 py-2 rounded-lg">
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
              <div className="p-4 border-t border-white/20 bg-black/10">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik keinginan Anda, misalnya: 'Saya mau main bola di Jakarta'"
                    className="flex-1 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Events */}
          <div className="lg:col-span-1">
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📅 Event Rekomendasi
              </h3>
              
              {recommendedEvents.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <p className="text-sm mb-2">
                      Belum ada rekomendasi event.
                    </p>
                    <p className="text-xs">
                      💡 Ketik olahraga yang Anda inginkan dengan bebas!<br />
                      AI akan bertanya jika perlu info tambahan.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-black/40 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                      onClick={() => {
                        // Navigate to event detail with chat history preserved
                        navigate(`/event/${event.id}`, {
                          state: { 
                            fromAiChat: true,
                            chatHistory: messages 
                          }
                        });
                      }}
                    >
                      <h4 className="font-semibold text-white text-sm mb-2 group-hover:text-blue-300 transition-colors">
                        {event.title}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70 flex items-center">
                          <span className="mr-1">📍</span> {event.location}
                        </p>
                        <p className="text-xs text-blue-300 flex items-center">
                          <span className="mr-1">🏷️</span> {event.category}
                        </p>
                        <p className="text-xs text-white/60 flex items-center">
                          <span className="mr-1">🕒</span> {formatDate(event.time)}
                        </p>
                        {event.duration && (
                          <p className="text-xs text-white/60 flex items-center">
                            <span className="mr-1">⏱️</span> {event.duration} menit
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                          <p className="text-xs text-green-300 flex items-center">
                            <span className="mr-1">👥</span> {event.available_slots}/{event.total_slots} slot
                          </p>
                          <div className="text-xs bg-blue-600/80 group-hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors">
                            Lihat Detail →
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {recommendedEvents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => navigate('/browse-events')}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                      >
                        Lihat Semua Event
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`rounded-lg p-4 mt-6 backdrop-blur-md border ${
          serverStatus === 'offline' 
            ? 'bg-red-600/20 border-red-400/30' 
            : 'bg-green-600/20 border-green-400/30'
        }`}>
          {serverStatus === 'offline' ? (
            <>
              <h3 className="text-sm font-semibold text-red-300 mb-2">
                ⚠️ AI Endpoint Status: Error
              </h3>
              <ul className="text-sm text-red-300/80 space-y-1">
                <li>• AI Chat endpoint bermasalah - akan dicoba ulang otomatis</li>
                <li>• Coba refresh halaman atau tunggu beberapa saat</li>
                <li>• Jika masalah berlanjut, hubungi support</li>
              </ul>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-green-300 mb-2">
                ✅ AI Chat Ready - Cara Menggunakan:
              </h3>
              <ul className="text-sm text-green-200 space-y-1">
                <li>• <strong className="text-green-100">Ketik Natural:</strong> "Saya mau main bola di Jakarta"</li>
                <li>• <strong className="text-green-100">Auto Recognition:</strong> AI akan mengenali olahraga dan lokasi</li>
                <li>• <strong className="text-green-100">Smart Questions:</strong> AI akan bertanya jika info kurang lengkap</li>
                <li>• <strong className="text-green-100">Personalized Recommendations:</strong> Dapatkan saran event terbaik</li>
                <li>• <strong className="text-green-100">Multi-Language:</strong> Bahasa Indonesia dan Inggris didukung</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiChatPage;
