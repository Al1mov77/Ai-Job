"use client";

import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

export interface Conversation {
  id: number;
  user1Id: number;
  user2Id: number;
  createdAt: string;
  unreadCount?: number;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  otherUser?: {
    id: number;
    fullName: string;
    role: string;
    photoUrl?: string;
  };
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
}

interface MessageStore {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;

  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  startConversation: (otherUserId: number) => Promise<Conversation | null>;
  fetchMessages: (conversationId: number) => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/Conversation");
      const conversations = res.data?.data || [];
      
      // For each conversation, we ideally want the other user's info.
      // If the API doesn't provide it directly in the list, we might need a separate call
      // but for now we'll assume basic info exists or will be fetched.
      
      set({ conversations, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      set({ isLoading: false });
    }
  },

  selectConversation: async (conversation: Conversation) => {
    set({ activeConversation: conversation, isLoadingMessages: true });
    try {
      const res = await axiosInstance.get(`/Message/by-conversation/${conversation.id}`);
      set({ messages: res.data?.data || [], isLoadingMessages: false });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      set({ isLoadingMessages: false });
    }
  },

  fetchMessages: async (conversationId: number) => {
    try {
      const res = await axiosInstance.get(`/Message/by-conversation/${conversationId}`);
      const newMessages = res.data?.data || [];
      
      // Only update if count changed or content changed to avoid jitter
      if (newMessages.length !== get().messages.length) {
        set({ messages: newMessages });
      }
    } catch (err) {
      console.error("Failed to fetch messages in background:", err);
    }
  },

  sendMessage: async (content: string) => {
    const active = get().activeConversation;
    if (!active) return;

    try {
      const res = await axiosInstance.post("/Message", {
        conversationId: active.id,
        content,
      });
      
      const newMessage = res.data?.data;
      if (newMessage) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      throw err;
    }
  },

  startConversation: async (otherUserId: number) => {
    try {
      const res = await axiosInstance.post("/Conversation", { otherUserId });
      const newConv = res.data?.data;
      if (newConv) {
        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversation: newConv,
        }));
        return newConv;
      }
      return null;
    } catch (err) {
      console.error("Failed to start conversation:", err);
      return null;
    }
  },
}));
