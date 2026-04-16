"use client";
import { create } from "zustand";

export type Language = "en" | "ru" | "tj";

interface LanguageStore {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  currentLanguage: "en",
  setLanguage: (lang: Language) => {
    localStorage.setItem("appLanguage", lang);
    set({ currentLanguage: lang });
  },
  loadLanguage: () => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("appLanguage") as Language;
      if (savedLang && ["en", "ru", "tj"].includes(savedLang)) {
        set({ currentLanguage: savedLang });
      }
    }
  },
}));
