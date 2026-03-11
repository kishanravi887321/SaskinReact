import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2,
  GripHorizontal, RefreshCw,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { useAuth } from '../hooks/useAuth';
import { chatbotGetRequest, apiRequest, API_ENDPOINTS } from '../lib/api';

export default function Chatbot() {
  const { isAuthenticated, accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mode, setMode] = useState('get');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your AI assistant. Ask me anything about interview preparation!' },
  ]);
  const [feedMessages, setFeedMessages] = useState([
    { role: 'bot', text: 'Feed mode: I can help you with your specific interview data and history.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, feedMessages]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized, mode]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');

    if (mode === 'get') {
      setMessages((prev) => [...prev, { role: 'user', text }]);
      setLoading(true);
      try {
        const data = await chatbotGetRequest(text);
        const response = data?.response || data?.message || 'I didn\'t get a response. Please try again.';
        setMessages((prev) => [...prev, { role: 'bot', text: response }]);
      } catch {
        setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
      } finally {
        setLoading(false);
      }
    } else {
      setFeedMessages((prev) => [...prev, { role: 'user', text }]);
      setLoading(true);
      try {
        const data = await apiRequest(API_ENDPOINTS.CHATBOT.FEED, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ message: text }),
        });
        const response = data?.response || data?.message || 'Processing complete.';
        setFeedMessages((prev) => [...prev, { role: 'bot', text: response }]);
      } catch {
        setFeedMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, something went wrong.' }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragStart = useCallback((e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
  }, [position]);

  const handleDrag = useCallback((e) => {
    if (!dragging) return;
    setPosition({
      x: dragStart.current.px + (e.clientX - dragStart.current.x),
      y: dragStart.current.py + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleDragEnd = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [dragging, handleDrag, handleDragEnd]);

  const currentMessages = mode === 'get' ? messages : feedMessages;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-white/10 bg-gray-950 shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] cursor-move select-none bg-gray-950"
              onMouseDown={handleDragStart}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">AI Assistant</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(!minimized)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                  {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Tabs */}
                <div className="px-3 pt-2">
                  <Tabs value={mode} onValueChange={setMode}>
                    <TabsList className="w-full">
                      <TabsTrigger value="get" className="flex-1 text-xs">General</TabsTrigger>
                      <TabsTrigger value="feed" className="flex-1 text-xs">My Data</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[280px] max-h-[340px]">
                  {currentMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-500/20 text-white/90 rounded-br-sm'
                          : 'bg-white/[0.04] text-white/70 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="px-3 py-2 rounded-xl bg-white/[0.04] text-white/40 text-sm flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/[0.06]">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={mode === 'get' ? 'Ask me anything...' : 'Ask about your data...'}
                      className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-colors"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
