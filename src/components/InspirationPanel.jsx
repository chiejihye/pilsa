import React from 'react';
import { ClickableWord } from './ClickableWord';

/**
 * Left panel displaying the K-Drama quote inspiration
 * Responsive typography and spacing for mobile/desktop
 */
export function InspirationPanel({ sentence, onSaveWord, isWordSaved }) {
  if (!sentence) return null;

  return (
    <div className="h-full flex flex-col justify-center 
                    px-6 py-6 md:px-8 md:py-12 lg:px-12 
                    overflow-y-auto hide-scrollbar">
      {/* Drama source - Korean and English title */}
      <div className="mb-4 md:mb-10 mt-8 md:mt-0">
        <span className="text-[10px] md:text-xs tracking-wide text-neutral-400">
          {sentence.dramaKorean && (
            <span className="font-medium text-neutral-500">{sentence.dramaKorean}</span>
          )}
          {sentence.dramaKorean && sentence.drama && (
            <span className="mx-1.5 md:mx-2 text-neutral-300">·</span>
          )}
          <span className="uppercase tracking-widest">{sentence.drama}</span>
        </span>
      </div>

      {/* Korean quote - responsive font size */}
      <blockquote className="mb-4 md:mb-10">
        <p className="text-lg md:text-xl lg:text-2xl quote-korean text-neutral-800 font-medium">
          {sentence.korean}
        </p>
      </blockquote>

      {/* English translation - muted and smaller */}
      <div className="mb-6 md:mb-12">
        <p className="text-xs md:text-sm lg:text-[15px] leading-relaxed quote-english italic">
          {sentence.english}
        </p>
      </div>

      {/* Vocabulary section */}
      {sentence.vocabulary && sentence.vocabulary.length > 0 && (
        <div className="mt-auto relative">
          <h3 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-3 md:mb-5">
            Vocabulary
          </h3>
          <ul className="space-y-2 md:space-y-3">
            {sentence.vocabulary.map((vocab, index) => (
              <li 
                key={index} 
                className="text-xs md:text-sm text-neutral-600 flex items-center gap-2 md:gap-3"
              >
                <ClickableWord
                  word={vocab.word}
                  meaning={vocab.meaning}
                  onSave={onSaveWord}
                  isAlreadySaved={isWordSaved(vocab.word)}
                  className="font-medium text-neutral-700"
                />
                <span className="text-neutral-500 text-[11px] md:text-[13px]">
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
