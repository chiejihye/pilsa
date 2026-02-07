import React from 'react';
import { ClickableWord } from './ClickableWord';

/**
 * Inspiration panel with responsive typography using clamp()
 * Horizontal scrolling vocabulary on mobile
 */
export function InspirationPanel({ sentence, onSaveWord, isWordSaved }) {
  if (!sentence) return null;

  return (
    <div className="h-full flex flex-col 
                    px-5 py-4 md:px-8 md:py-8 lg:px-12 lg:py-12
                    overflow-hidden">
      {/* Drama source - Korean and English title */}
      <div className="mb-3 md:mb-6 mt-10 md:mt-0 flex-shrink-0">
        <span className="text-[10px] md:text-xs tracking-wide text-neutral-400 block truncate">
          {sentence.dramaKorean && (
            <span className="font-medium text-neutral-500">{sentence.dramaKorean}</span>
          )}
          {sentence.dramaKorean && sentence.drama && (
            <span className="mx-1.5 text-neutral-300">·</span>
          )}
          <span className="uppercase tracking-widest">{sentence.drama}</span>
        </span>
      </div>

      {/* Korean quote - responsive font size using clamp */}
      <blockquote className="mb-3 md:mb-6 flex-shrink-0">
        <p 
          className="quote-korean text-neutral-800 font-medium leading-[1.7]"
          style={{
            fontSize: 'clamp(1rem, 2.5vw + 0.5rem, 1.5rem)',
          }}
        >
          {sentence.korean}
        </p>
      </blockquote>

      {/* English translation - muted subtitle */}
      <div className="mb-4 md:mb-8 flex-shrink-0">
        <p 
          className="text-[12px] md:text-[13px] leading-relaxed italic opacity-50"
          style={{ color: '#78716C' }}
        >
          {sentence.english}
        </p>
      </div>

      {/* Vocabulary section - horizontal scroll on mobile, vertical on desktop */}
      {sentence.vocabulary && sentence.vocabulary.length > 0 && (
        <div className="mt-auto flex-shrink-0">
          <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 md:mb-4">
            Vocabulary
          </h3>
          
          {/* Mobile: Horizontal scrolling flex */}
          <div className="md:hidden overflow-x-auto hide-scrollbar -mx-5 px-5">
            <div className="flex gap-2 pb-2">
              {sentence.vocabulary.map((vocab, index) => (
                <div key={index} className="flex-shrink-0">
                  <ClickableWord
                    word={vocab.word}
                    meaning={vocab.meaning}
                    onSave={onSaveWord}
                    isAlreadySaved={isWordSaved(vocab.word)}
                    className="font-medium text-neutral-700 text-xs whitespace-nowrap"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Vertical list */}
          <ul className="hidden md:block space-y-3">
            {sentence.vocabulary.map((vocab, index) => (
              <li 
                key={index} 
                className="text-sm text-neutral-600 flex items-center gap-3"
              >
                <ClickableWord
                  word={vocab.word}
                  meaning={vocab.meaning}
                  onSave={onSaveWord}
                  isAlreadySaved={isWordSaved(vocab.word)}
                  className="font-medium text-neutral-700"
                />
                <span className="text-neutral-500 text-[13px]">
                  {vocab.meaning}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
