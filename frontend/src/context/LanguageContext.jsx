import { createContext, useContext, useState, useEffect } from "react";
import { translations, getTranslation } from "../utils/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('votewise-language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('votewise-language', language);
  }, [language]);

  const t = (key) => getTranslation(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang must be used within a LanguageProvider");
  }
  return context;
};
