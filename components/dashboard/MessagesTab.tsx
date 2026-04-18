"use client";

import { useState, useEffect, useRef } from "react";
import { useMessageStore, Conversation, Message } from "@/app/store/messageStore";
import { useAuthStore } from "@/app/store/authStore";
import { axiosInstance } from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function MessagesTab() {
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isLoadingMessages,
    fetchConversations,
    selectConversation,
    sendMessage,
    fetchMessages,
    startConversation,
  } = useMessageStore();

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchUsers();

    // Polling for new messages every 5 seconds if a chat is active
    const interval = setInterval(() => {
      if (activeConversation) {
        fetchMessages(activeConversation.id);
      }
      fetchConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/User/directory");
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const getUserInfo = (otherUserId: number) => {
    return users.find(u => u.id === otherUserId) || { fullName: `User #${otherUserId}`, role: "Member" };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(messageText);
      setMessageText("");
    } catch (err) {
      toast.error("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleStartNewChat = async (userId: number) => {
    const existing = conversations.find(c => c.user1Id === userId || c.user2Id === userId);
    if (existing) {
      selectConversation(existing);
    } else {
      const newConv = await startConversation(userId);
      if (newConv) {
        selectConversation(newConv);
      }
    }
    setShowUserSearch(false);
  };

  const filteredConversations = conversations.filter(c => {
    const otherId = c.user1Id === Number(user?.id) ? c.user2Id : c.user1Id;
    const info = getUserInfo(otherId);
    return info.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = users.filter(u => 
    u.id !== Number(user?.id) && 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherUser = (conv: Conversation) => {
    const otherId = conv.user1Id === Number(user?.id) ? conv.user2Id : conv.user1Id;
    return getUserInfo(otherId);
  };

  const activeUser = activeConversation ? getOtherUser(activeConversation) : null;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#05070a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Conversations List */}
      <div className="w-20 md:w-80 border-r border-white/5 flex flex-col bg-[#0a0e14] transition-all duration-300">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold hidden md:block">Messages</h2>
            <button 
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition mx-auto md:mx-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="relative hidden lg:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 transition"
              placeholder={showUserSearch ? "Search users..." : "Search conversations..."}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {showUserSearch ? (
            <div className="p-2 space-y-1">
              <p className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Start New Chat</p>
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleStartNewChat(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 flex-shrink-0">
                    {u.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 hidden md:block">
                    <p className="text-sm font-semibold truncate group-hover:text-blue-400 transition">{u.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map(conv => {
                const other = getOtherUser(conv);
                const isActive = activeConversation?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition text-left group ${
                      isActive ? "bg-blue-500/10 border-blue-500/20" : "hover:bg-white/5 border-transparent"
                    } border`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold relative flex-shrink-0 ${
                      isActive ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400"
                    }`}>
                      {other.fullName.charAt(0)}
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-[#0a0e14]">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 hidden md:block">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm font-bold truncate ${isActive ? "text-blue-400" : "text-gray-200"}`}>{other.fullName}</p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-gray-500">{new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.lastMessagePreview || "No messages yet"}</p>
                    </div>
                  </button>
                );
              })}
              {filteredConversations.length === 0 && !isLoading && (
                <div className="text-center py-10 px-6">
                  <p className="text-sm text-gray-500 italic">No conversations found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Window */}
      <div className="flex-1 flex flex-col bg-[#05070a] relative">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0e14]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">
                  {activeUser?.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">{activeUser?.fullName}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition hidden sm:flex"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                <button className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition hidden sm:flex"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.03),transparent_50%)]"
            >
              <div className="flex justify-center mb-8">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Today</span>
              </div>

              {messages.map((msg, i) => {
                const isMine = msg.senderId === Number(user?.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id} 
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] group`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-lg ${
                        isMine 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none"
                      }`}>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMine && <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isLoadingMessages && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs">Fetching messages...</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#0a0e14]/50 border-t border-white/5">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button type="button" className="p-2 text-gray-500 hover:text-white transition hidden sm:block"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-9-1a9 9 0 1118 0 9 9 0 01-18 0z" /></svg></button>
                <button type="button" className="p-2 text-gray-500 hover:text-white transition hidden sm:block"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                <div className="flex-1 relative">
                  <input 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-blue-500 transition"
                    placeholder="Type your message here..."
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-amber-500 hidden sm:block">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 01-18 0z" /></svg>
                  </button>
                </div>
                <button 
                  disabled={isSending || !messageText.trim()}
                  className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Conversations</h2>
            <p className="text-gray-500 max-w-sm">Select a colleague to view your chat history or start a new discussion.</p>
            <button 
              onClick={() => setShowUserSearch(true)}
              className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition shadow-xl"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      ` }} />
    </div>
  );
}
