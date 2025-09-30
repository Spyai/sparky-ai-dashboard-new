import React, { useState } from 'react';
import { MessageCircle, Send, Bot, User, X } from 'lucide-react';
import { chatWithGeminiAdvanced } from '../../lib/gemini';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface AIChatProps {
  farmContext?: {
    fieldId?: string;
    crop?: string;
    location?: string;
    fieldArea?: number;
    ndvi?: string;
    evi?: string;
    lai?: string;
  };
}

const AIChat: React.FC<AIChatProps> = ({ farmContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Hello! I'm your AI farming assistant powered by Gemini AI. Ask me anything about your crops, irrigation, fertilizers, pest management, or any farming advice based on your current field data!",
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.message
      }));

      const aiResponseText = await chatWithGeminiAdvanced(message, farmContext, conversationHistory);
      
      const aiResponseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiResponseMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: "I apologize, but I'm having trouble connecting to my AI services right now. Please try again in a moment, or feel free to ask your question again.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-400" />
              <div>
                <h3 className="text-white font-medium">AI Assistant</h3>
                <p className="text-zinc-400 text-xs">Powered by Gemini AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-800 text-zinc-200'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white animate-pulse" />
                </div>
                <div className="bg-zinc-800 text-zinc-200 p-3 rounded-lg max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-xs text-zinc-400 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything about farming..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="p-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Context Indicator */}
      {isOpen && farmContext && (
        <div className="fixed bottom-6 right-6 w-80 -mt-2 bg-zinc-800 border border-zinc-700 rounded-t-lg p-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>
              Context: {farmContext.crop || 'Unknown crop'} • 
              {farmContext.fieldArea ? ` ${(farmContext.fieldArea / 10000).toFixed(1)}ha` : ''} • 
              NDVI: {farmContext.ndvi || 'N/A'}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;