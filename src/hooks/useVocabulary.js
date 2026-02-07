import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing user's saved vocabulary
 * Persists to localStorage
 */
export function useVocabulary() {
  const STORAGE_KEY = 'pilsa_user_vocabulary';

  const [vocabulary, setVocabulary] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever vocabulary changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vocabulary));
    } catch (error) {
      console.warn('Failed to save vocabulary:', error);
    }
  }, [vocabulary]);

  // Add a word to vocabulary
  const addWord = useCallback((word, meaning, source = '') => {
    setVocabulary(prev => {
      // Check if word already exists
      const exists = prev.some(v => v.word === word);
      if (exists) return prev;

      return [...prev, {
        id: Date.now().toString(),
        word,
        meaning,
        source,
        savedAt: new Date().toISOString()
      }];
    });
  }, []);

  // Remove a word from vocabulary
  const removeWord = useCallback((wordId) => {
    setVocabulary(prev => prev.filter(v => v.id !== wordId));
  }, []);

  // Check if a word is already saved
  const isWordSaved = useCallback((word) => {
    return vocabulary.some(v => v.word === word);
  }, [vocabulary]);

  return {
    vocabulary,
    addWord,
    removeWord,
    isWordSaved
  };
}
