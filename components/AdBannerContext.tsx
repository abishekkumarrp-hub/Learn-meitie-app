import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { getWordsLearned, isQuizCompleted } from "@/lib/storage";

interface AdBannerContextType {
  isAdVisible: boolean;
  showAdBanner: () => void;
  hideAdBanner: () => void;
  checkAndShowAd: () => Promise<void>;
}

const AdBannerContext = createContext<AdBannerContextType | undefined>(undefined);

interface AdBannerProviderProps {
  children: ReactNode;
}

export function AdBannerProvider({ children }: AdBannerProviderProps) {
  const [isAdVisible, setIsAdVisible] = useState(false);

  const showAdBanner = useCallback(() => {
    setIsAdVisible(true);
  }, []);

  const hideAdBanner = useCallback(() => {
    setIsAdVisible(false);
  }, []);

  const checkAndShowAd = useCallback(async () => {
    try {
      const [wordsLearned, quizCompleted] = await Promise.all([
        getWordsLearned(),
        isQuizCompleted("beginner"),
      ]);

      if (wordsLearned.length >= 3 || quizCompleted) {
        setIsAdVisible(true);
      }
    } catch {
      // Silently fail - don't show ad if there's an error
    }
  }, []);

  return (
    <AdBannerContext.Provider
      value={{
        isAdVisible,
        showAdBanner,
        hideAdBanner,
        checkAndShowAd,
      }}
    >
      {children}
    </AdBannerContext.Provider>
  );
}

export function useAdBanner(): AdBannerContextType {
  const context = useContext(AdBannerContext);
  if (context === undefined) {
    throw new Error("useAdBanner must be used within an AdBannerProvider");
  }
  return context;
}
