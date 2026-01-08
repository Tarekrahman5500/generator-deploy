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
    // Monkey patch Node.prototype.removeChild and insertBefore to fix Google Translate crash
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function (child) {
      if (child.parentNode !== this) {
        return child;
      }
      return originalRemoveChild.apply(this, arguments as any);
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        return newNode;
      }
      return originalInsertBefore.apply(this, arguments as any);
    };

    // 1. Check for existing cookie on mount to set the Tick Mark
    const googleCookie = document.cookie.split("; ").find(row => row.startsWith("googtrans="));
    if (googleCookie) {
      const lang = googleCookie.split("/").pop();
      if (lang) setCurrentLang(lang);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,fr,it", autoDisplay: false },
        "google_translate_element"
      );
    };

    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. IMPORTANT: Force Google to apply the language from the cookie after the script loads
    const applyStoredLanguage = () => {
      const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (googleCombo && googleCookie) {
        const lang = googleCookie.split("/").pop();
        if (lang && googleCombo.value !== lang) {
          googleCombo.value = lang;
          googleCombo.dispatchEvent(new Event("change"));
        }
      } else if (!googleCombo) {
        // If script isn't ready, try again in 500ms
        setTimeout(applyStoredLanguage, 500);
      }
    };

    applyStoredLanguage();
  }, []);

  const changeLanguage = (langCode: string) => {
    // Set cookie
    const target = `/en/${langCode}`;
    document.cookie = `googtrans=${target}; path=/;`;
    document.cookie = `googtrans=${target}; path=/; domain=${window.location.hostname};`;

    // update state immediately for the tick mark
    setCurrentLang(langCode);

    const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event("change"));
    }

    // Force reload to prevent the 'removeChild' crash on navigation
    window.location.reload();
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
