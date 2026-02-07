import React, { useState, useEffect } from 'react';
import { sentences } from '../data/sentences';

// Helper to get Korean drama title from sentences data
const getKoreanTitle = (englishTitle) => {
  const found = sentences.find(s => s.drama === englishTitle);
  return found?.dramaKorean || null;
};

/**
 * Archive overlay with card-based layout and glassmorphism
 * Displays saved transcriptions and vocabulary
 */
export function ArchiveOverlay({ 
  isOpen, 
  onClose, 
  archive, 
  vocabulary,
  onRemoveEntry,
  onRemoveWord
}) {
  const [activeTab, setActiveTab] = useState('transcriptions');
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 fade-in"
        onClick={onClose}
      />

      {/* Sidebar panel with glassmorphism */}
      <div 
        className="fixed inset-y-0 left-0 w-full max-w-md z-50 slide-in-left
                   bg-bone/80 backdrop-blur-md border-r border-neutral-200/50
                   flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-base font-medium text-neutral-700 tracking-tight">Archive</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 
                       hover:bg-neutral-100/50 rounded-lg transition-all"
            aria-label="Close archive"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 p-1 bg-neutral-100/50 rounded-lg">
          <button
            onClick={() => setActiveTab('transcriptions')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all
              ${activeTab === 'transcriptions' 
                ? 'bg-white text-neutral-800 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
              }`}
          >
            Transcriptions
            <span className="ml-1.5 text-neutral-400">
              {archive.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all
              ${activeTab === 'vocabulary' 
                ? 'bg-white text-neutral-800 shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
              }`}
          >
            Vocabulary
            <span className="ml-1.5 text-neutral-400">
              {vocabulary.length}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-5">
          {activeTab === 'transcriptions' ? (
            <div className="space-y-4">
              {archive.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 
                                  flex items-center justify-center">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-400">No transcriptions yet</p>
                  <p className="text-xs text-neutral-300 mt-1">Complete a session to save it here</p>
                </div>
              ) : (
                archive.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="group relative p-4 rounded-xl 
                               bg-white/70 border border-neutral-100
                               dot-grid-mini
                               hover:bg-white/90 hover:shadow-sm
                               transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => onRemoveEntry(entry.id)}
                      className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100
                                 text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100
                                 rounded-md transition-all"
                      aria-label="Remove entry"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Drama title - Korean and English */}
                    <div className="mb-2 pr-8">
                      {(() => {
                        const koreanTitle = entry.dramaKorean || getKoreanTitle(entry.drama);
                        return (
                          <span className="text-[10px] tracking-wide text-neutral-400">
                            {koreanTitle && (
                              <span className="font-medium text-neutral-500">{koreanTitle}</span>
                            )}
                            {koreanTitle && entry.drama && (
                              <span className="mx-1.5">·</span>
                            )}
                            <span className="uppercase tracking-widest">{entry.drama}</span>
                          </span>
                        );
                      })()}
                    </div>

                    {/* Korean quote preview */}
                    <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3 mb-2">
                      {entry.korean}
                    </p>

                    {/* English translation */}
                    <p className="text-xs quote-english italic line-clamp-2">
                      {entry.english}
                    </p>

                    {/* Date */}
                    <p className="text-[10px] text-neutral-300 mt-3">
                      {formatDate(entry.completedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {vocabulary.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 
                                  flex items-center justify-center">
                    <svg className="w-6 h-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-400">No vocabulary saved</p>
                  <p className="text-xs text-neutral-300 mt-1">Click on words to save them</p>
                </div>
              ) : (
                vocabulary.map((vocab, index) => (
                  <div 
                    key={vocab.id}
                    className="group flex items-center justify-between p-3 rounded-lg
                               bg-white/50 border border-neutral-100
                               hover:bg-white/80 transition-all"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-neutral-700 text-sm">
                        {vocab.word}
                      </span>
                      <span className="text-neutral-200">—</span>
                      <span className="text-neutral-500 text-xs">
                        {vocab.meaning}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemoveWord(vocab.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100
                                 text-neutral-300 hover:text-neutral-500
                                 transition-all"
                      aria-label="Remove word"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
