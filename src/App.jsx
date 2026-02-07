import React, { useState, useEffect } from 'react';
import { InspirationPanel } from './components/InspirationPanel';
import { WritingZone } from './components/WritingZone';
import { ArchiveOverlay } from './components/ArchiveOverlay';
import { useDraftStorage } from './hooks/useLocalStorage';
import { useVocabulary } from './hooks/useVocabulary';
import { useArchive } from './hooks/useArchive';
import { getTodaysSentence, getRandomSentence } from './data/sentences';

/**
 * Main App component
 * Responsive layout with proper dividers and viewport handling
 */
function App() {
  const [sentence, setSentence] = useState(null);
  const [text, setText] = useDraftStorage('pilsa_draft', '');
  const { vocabulary, addWord, removeWord, isWordSaved } = useVocabulary();
  const { archive, saveTranscription, removeEntry } = useArchive();
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    const todaysSentence = getTodaysSentence();
    setSentence(todaysSentence);
  }, []);

  const handleSaveWord = (word, meaning) => {
    addWord(word, meaning, sentence?.drama || '');
  };

  const handleFinishSession = () => {
    if (!sentence || !text.trim()) return;
    saveTranscription(
      sentence.id,
      sentence.drama,
      sentence.dramaKorean,
      sentence.korean,
      sentence.english,
      text
    );
    setText('');
    const newSentence = getRandomSentence();
    setSentence(newSentence);
  };

  return (
    <div className="h-dvh w-screen bg-bone overflow-hidden">
      {/* Archive button */}
      <button
        onClick={() => setIsArchiveOpen(true)}
        className="fixed top-3 left-3 md:top-4 md:left-4 z-30 p-2 md:p-2.5 
                   text-neutral-300 hover:text-neutral-600 hover:bg-white/50
                   rounded-xl transition-all duration-200"
        aria-label="Open archive"
      >
        <svg 
          className="w-4 h-4 md:w-5 md:h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
          />
        </svg>
      </button>

      {/* Stats indicator - hidden on mobile */}
      {(archive.length > 0 || vocabulary.length > 0) && (
        <div className="hidden md:flex fixed top-5 left-14 z-30 items-center gap-3 text-[11px] text-neutral-300">
          {archive.length > 0 && (
            <span>{archive.length} saved</span>
          )}
          {vocabulary.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              {vocabulary.length} words
            </span>
          )}
        </div>
      )}

      {/* Responsive Layout */}
      <div className="flex flex-col landscape:flex-row md:flex-row h-full">
        {/* Inspiration Panel */}
        <div className="h-[38%] landscape:h-full md:h-full 
                        w-full landscape:w-3/10 md:w-3/10 
                        bg-bone 
                        overflow-hidden
                        border-b-2 border-stone-100 landscape:border-b-0 md:border-b-0
                        landscape:border-r md:border-r landscape:border-stone-200 md:border-stone-200">
          <InspirationPanel 
            sentence={sentence}
            onSaveWord={handleSaveWord}
            isWordSaved={isWordSaved}
          />
        </div>

        {/* Writing Zone - slightly different background on mobile for visual separation */}
        <div className="h-[62%] landscape:h-full md:h-full 
                        w-full landscape:w-7/10 md:w-7/10 
                        bg-[#F8F7F4] landscape:bg-bone md:bg-bone
                        relative">
          <WritingZone 
            text={text} 
            onTextChange={setText}
            onFinishSession={handleFinishSession}
            hasText={text.trim().length > 0}
          />
        </div>
      </div>

      {/* Archive Overlay */}
      <ArchiveOverlay
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        archive={archive}
        vocabulary={vocabulary}
        onRemoveEntry={removeEntry}
        onRemoveWord={removeWord}
      />
    </div>
  );
}

export default App;
