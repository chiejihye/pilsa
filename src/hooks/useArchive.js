import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing transcription archive
 * Stores completed transcriptions in localStorage
 */
export function useArchive() {
  const STORAGE_KEY = 'pilsa_archive';

  const [archive, setArchive] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever archive changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
    } catch (error) {
      console.warn('Failed to save archive:', error);
    }
  }, [archive]);

  // Save a completed transcription
  const saveTranscription = useCallback((sentenceId, drama, dramaKorean, korean, english, userTyped) => {
    const entry = {
      id: Date.now().toString(),
      sentenceId,
      drama,
      dramaKorean,
      korean,
      english,
      userTyped,
      completedAt: new Date().toISOString()
    };

    setArchive(prev => [entry, ...prev]); // Add to beginning (newest first)
    return entry;
  }, []);

  // Remove an entry from archive
  const removeEntry = useCallback((entryId) => {
    setArchive(prev => prev.filter(e => e.id !== entryId));
  }, []);

  // Get total count
  const getCount = useCallback(() => {
    return archive.length;
  }, [archive]);

  return {
    archive,
    saveTranscription,
    removeEntry,
    getCount
  };
}
