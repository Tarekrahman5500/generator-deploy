/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "./CustomTranslate.css";
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}
const CustomTranslate = () => {
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    // 1. Setup the Google Init Function
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,fr,it",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // 2. Load the script
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    const googleCombo = document.querySelector(
      ".goog-te-combo"
    ) as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event("change")); // Trigger the translation
      setCurrentLang(langCode);
    }
  };

  return (
    <div className="flex items-center gap-4 notranslate">
      {/* 1. THE HIDDEN GOOGLE ELEMENT */}
      <div id="google_translate_element" style={{ display: "none" }} />

      {/* 2. YOUR BEAUTIFUL CUSTOM DROPDOWN */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-[#163859] transition-all bg-white dark:bg-[#182129]">
          <Globe className="h-4 w-4 text-[#163859]" />

          {/* Add the 'notranslate' class here */}
          <span className="text-xs font-black uppercase tracking-widest notranslate">
            {currentLang}
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40 p-2 notranslate">
          {[
            { code: "en", label: "English" },
            { code: "fr", label: "Français" },
            { code: "it", label: "Italiano" },
          ].map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="flex justify-between items-center cursor-pointer font-bold text-xs uppercase"
            >
              {lang.label}
              {currentLang === lang.code && (
                <Check className="h-3 w-3 text-[#163859]" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CustomTranslate;
