import React from 'react';
import { ClickableWord } from './ClickableWord';

/**
 * Left panel displaying the K-Drama quote inspiration
 * Shows the original Korean text, English translation, and vocabulary
 * Words are clickable to save to vocabulary
 */
export function InspirationPanel({ sentence, onSaveWord, isWordSaved }) {
  if (!sentence) return null;

  return (
    <div className="h-full flex flex-col justify-center px-8 py-12 lg:px-12 overflow-visible">
      {/* Drama source - Korean and English title */}
      <div className="mb-10">
        <span className="text-xs tracking-wide text-neutral-400">
          {sentence.dramaKorean && (
            <span className="font-medium text-neutral-500">{sentence.dramaKorean}</span>
          )}
          {sentence.dramaKorean && sentence.drama && (
            <span className="mx-2 text-neutral-300">·</span>
          )}
          <span className="uppercase tracking-widest">{sentence.drama}</span>
        </span>
      </div>

      {/* Korean quote - main inspiration with refined typography */}
      <blockquote className="mb-10">
        <p className="text-xl lg:text-2xl quote-korean text-neutral-800 font-medium">
          {sentence.korean}
        </p>
      </blockquote>

      {/* English translation - muted and smaller */}
      <div className="mb-12">
        <p className="text-sm lg:text-[15px] leading-relaxed quote-english italic">
          {sentence.english}
        </p>
      </div>

      {/* Vocabulary section with clickable words */}
      {sentence.vocabulary && sentence.vocabulary.length > 0 && (
        <div className="mt-auto relative">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-5">
            Vocabulary
          </h3>
          <ul className="space-y-3">
            {sentence.vocabulary.map((vocab, index) => (
              <li 
                key={index} 
                className="text-sm text-neutral-600 flex items-baseline gap-2"
              >
                <ClickableWord
                  word={vocab.word}
                  meaning={vocab.meaning}
                  onSave={onSaveWord}
                  isAlreadySaved={isWordSaved(vocab.word)}
                  className="font-medium text-neutral-700"
                />
                <span className="text-neutral-200">—</span>
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
