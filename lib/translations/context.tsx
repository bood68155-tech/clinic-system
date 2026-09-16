"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import ar from "./ar";
import en from "./en";
import type { Translations } from "./ar";

type Lang = "ar" | "en";
type Ctx = { lang: Lang; t: Translations; toggle: () => void };

const LanguageContext = createContext<Ctx>({
  lang: "ar",
  t: ar,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("clinic-lang") as Lang | null;
    if (saved === "en" || saved === "ar") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("clinic-lang", lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  return (
    <LanguageContext.Provider value={{ lang, t: lang === "ar" ? ar : en, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}