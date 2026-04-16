"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLanguageStore, Language } from "@/app/store/languageStore";

const langs: { id: Language; label: string; flag: string }[] = [
  { id: "en", label: "EN", flag: "🇺🇸" },
  { id: "ru", label: "RU", flag: "🇷🇺" },
  { id: "tj", label: "TJ", flag: "🇹🇯" },
];

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, loadLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const current = langs.find((l) => l.id === currentLanguage) || langs[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold"
      >
        <span>{current.flag}</span>
        <span className="text-gray-300">{current.label}</span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-28 bg-[#0a0e14] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="py-1">
                {langs.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold transition-colors ${
                      currentLanguage === lang.id
                        ? "bg-blue-600/10 text-blue-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
