import React, { useRef, useEffect, useState } from 'react';
import { BlinkingCursor } from './BlinkingCursor';
import { useTypewriterSound } from '../hooks/useTypewriterSound';

/**
 * Right panel - the writing zone
 * Click anywhere to start typing with an invisible input and blinking cursor
 */
export function WritingZone({ text, onTextChange, onFinishSession, hasText }) {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const { playKeySound, playSpaceSound, playEnterSound, initializeAudio } = useTypewriterSound();

  // Handle click on the writing zone to focus
  const handleZoneClick = (e) => {
    // Don't focus if clicking the save button
    if (e.target.closest('button')) return;
    
    initializeAudio(); // Initialize audio on first interaction
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle key presses for sound effects
  const handleKeyDown = (e) => {
    // Play appropriate sound based on key
    if (e.key === 'Enter') {
      playEnterSound();
    } else if (e.key === ' ') {
      playSpaceSound();
    } else if (e.key.length === 1 || e.key === 'Backspace') {
      playKeySound();
    }
  };

  // Handle text changes
  const handleChange = (e) => {
    onTextChange(e.target.value);
  };

  // Auto-focus on mount for immediate typing experience
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div 
      className="h-full dot-grid cursor-text relative"
      onClick={handleZoneClick}
    >
      {/* Writing container */}
      <div className="h-full w-full p-8 lg:p-12 flex flex-col overflow-hidden">
        {/* Text display area with cursor */}
        <div className="flex-1 relative">
          {/* Rendered text with cursor */}
          <div 
            className="absolute inset-0 text-lg lg:text-xl leading-relaxed text-neutral-800 whitespace-pre-wrap break-words pointer-events-none overflow-y-auto hide-scrollbar pr-4"
            aria-hidden="true"
          >
            {text}
            <BlinkingCursor visible={isFocused} />
          </div>

          {/* Hidden textarea for actual input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="invisible-input absolute inset-0 w-full h-full text-lg lg:text-xl leading-relaxed text-transparent resize-none overflow-hidden"
            placeholder=""
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>

      {/* Subtle hint at bottom */}
      {!text && !isFocused && (
        <div className="absolute bottom-8 left-8 lg:left-12 pointer-events-none">
          <p className="text-sm text-neutral-300 italic">
            Click anywhere to begin writing...
          </p>
        </div>
      )}

      {/* Finish & Save button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (hasText) {
            onFinishSession();
          }
        }}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: hasText ? '#262626' : '#a3a3a3',
          color: 'white',
          borderRadius: '9999px',
          border: 'none',
          cursor: hasText ? 'pointer' : 'default',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s',
          opacity: hasText ? 1 : 0.5,
        }}
        title={hasText ? "Finish & Save" : "Type something first"}
      >
        {/* Checkmark icon */}
        <svg 
          style={{ width: '20px', height: '20px' }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Save</span>
      </button>

      {/* Subtle left border */}
      <div className="absolute top-0 left-0 w-[1px] h-full bg-neutral-200" />
    </div>
  );
}
