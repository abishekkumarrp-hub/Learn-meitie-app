import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_NAME: "user_name",
  WORDS_LEARNED: "words_learned",
  ALPHABET_VIEWED: "alphabet_viewed",
  QUIZ_COMPLETED: "quiz_completed",
  QUIZ_SCORES: "quiz_scores",
  SESSION_COUNT: "session_count",
  REVIEW_SHOWN: "review_shown",
  CURRENT_WORD_INDEX: "current_word_index",
};

export async function getUserName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.USER_NAME);
  } catch {
    return null;
  }
}

export async function setUserName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_NAME, name);
  } catch {
    console.error("Failed to save user name");
  }
}

export async function getWordsLearned(): Promise<number[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORDS_LEARNED);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addWordLearned(wordId: number): Promise<void> {
  try {
    const words = await getWordsLearned();
    if (!words.includes(wordId)) {
      words.push(wordId);
      await AsyncStorage.setItem(KEYS.WORDS_LEARNED, JSON.stringify(words));
    }
  } catch {
    console.error("Failed to save word learned");
  }
}

export async function getAlphabetViewed(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ALPHABET_VIEWED);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addAlphabetViewed(character: string): Promise<void> {
  try {
    const viewed = await getAlphabetViewed();
    if (!viewed.includes(character)) {
      viewed.push(character);
      await AsyncStorage.setItem(KEYS.ALPHABET_VIEWED, JSON.stringify(viewed));
    }
  } catch {
    console.error("Failed to save alphabet viewed");
  }
}

export async function isQuizCompleted(level: string): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(KEYS.QUIZ_COMPLETED);
    const completed = data ? JSON.parse(data) : {};
    return !!completed[level];
  } catch {
    return false;
  }
}

export async function setQuizCompleted(level: string, score: number): Promise<void> {
  try {
    const completedData = await AsyncStorage.getItem(KEYS.QUIZ_COMPLETED);
    const completed = completedData ? JSON.parse(completedData) : {};
    completed[level] = true;
    await AsyncStorage.setItem(KEYS.QUIZ_COMPLETED, JSON.stringify(completed));

    const scoresData = await AsyncStorage.getItem(KEYS.QUIZ_SCORES);
    const scores = scoresData ? JSON.parse(scoresData) : {};
    scores[level] = score;
    await AsyncStorage.setItem(KEYS.QUIZ_SCORES, JSON.stringify(scores));
  } catch {
    console.error("Failed to save quiz completion");
  }
}

export async function getQuizScore(level: string): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.QUIZ_SCORES);
    const scores = data ? JSON.parse(data) : {};
    return scores[level] ?? null;
  } catch {
    return null;
  }
}

export async function incrementSessionCount(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SESSION_COUNT);
    const count = data ? parseInt(data, 10) + 1 : 1;
    await AsyncStorage.setItem(KEYS.SESSION_COUNT, count.toString());
    return count;
  } catch {
    return 1;
  }
}

export async function getSessionCount(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SESSION_COUNT);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

export async function isReviewShown(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(KEYS.REVIEW_SHOWN);
    return data === "true";
  } catch {
    return false;
  }
}

export async function setReviewShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.REVIEW_SHOWN, "true");
  } catch {
    console.error("Failed to save review shown");
  }
}

export async function getCurrentWordIndex(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_WORD_INDEX);
    return data ? parseInt(data, 10) : 0;
  } catch {
    return 0;
  }
}

export async function setCurrentWordIndex(index: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_WORD_INDEX, index.toString());
  } catch {
    console.error("Failed to save word index");
  }
}

export async function clearAllProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.WORDS_LEARNED,
      KEYS.ALPHABET_VIEWED,
      KEYS.QUIZ_COMPLETED,
      KEYS.QUIZ_SCORES,
      KEYS.CURRENT_WORD_INDEX,
    ]);
  } catch {
    console.error("Failed to clear progress");
  }
}

export async function getProgress(): Promise<{
  wordsLearned: number;
  alphabetViewed: number;
  quizCompleted: boolean;
}> {
  const [wordsLearned, alphabetViewed, quizCompleted] = await Promise.all([
    getWordsLearned(),
    getAlphabetViewed(),
    isQuizCompleted("beginner"),
  ]);

  return {
    wordsLearned: wordsLearned.length,
    alphabetViewed: alphabetViewed.length,
    quizCompleted,
  };
}
