import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if no stored value exists
 * @returns {[any, function]} - The stored value and a setter function
 */
export function useLocalStorage(key, initialValue) {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Debounced save to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Hook specifically for the writing draft with debounced saving
 * @param {string} key - The localStorage key
 * @param {string} initialValue - Initial text value
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {[string, function]} - The text and setter
 */
export function useDraftStorage(key, initialValue = '', debounceMs = 500) {
  const [text, setText] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(text));
      } catch (error) {
        console.warn('Failed to save draft:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [key, text, debounceMs]);

  return [text, setText];
}
