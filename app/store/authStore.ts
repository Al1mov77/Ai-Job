"use client";
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { extractUserFromJWT } from "@/lib/jwt";
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  AuthError,
} from "@/app/types/auth";


interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: AuthError | null;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => void;
  clearError: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/Auth/login",
        credentials
      );

      const { token, refreshToken } = response.data;
      const user = extractUserFromJWT(token);

      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));



      set({
        user,
        accessToken: token,
        refreshToken,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      set({
        error: { message: errorMessage },
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/Auth/register", data);
      set({ isLoading: false });
      return response.data;
    } catch (err: any) {
      console.error("Register error details:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      const errorMessage =
        err.response?.data?.message || err.message || "Registration failed";
      set({
        error: { message: errorMessage },
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = get().refreshToken;
      if (refreshToken) {
        await axiosInstance.post("/Auth/logout", { refreshToken });
      }
    } catch (err) {} finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");



      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
      });
    }
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;

    const currentToken = get().accessToken;
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (accessToken && refreshToken && userStr) {
      if (currentToken === accessToken) return;
      try {
        const user = JSON.parse(userStr);

        set({ user, accessToken, refreshToken });
      } catch (err) {
        console.error("Error loading auth from storage:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

      }
    }
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().accessToken,
}));
