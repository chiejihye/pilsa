import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTypewriterSound } from '../hooks/useTypewriterSound';

/**
 * Right panel - the writing zone
 * Features:
 * - Precise cursor tracking synchronized with text flow
 * - Korean IME (composition) handling
 * - Responsive padding and font sizes
 * - Keyboard avoidance on mobile
 */
export function WritingZone({ text, onTextChange, onFinishSession, hasText }) {
  const textareaRef = useRef(null);
  const textDisplayRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  
  const { playKeySound, playSpaceSound, playEnterSound, initializeAudio } = useTypewriterSound();

  // Handle click on the writing zone to focus
  const handleZoneClick = (e) => {
    if (e.target.closest('button')) return;
    
    initializeAudio();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle key presses for sound effects (avoid during composition)
  const handleKeyDown = (e) => {
    if (isComposing) return;
    
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

  // Korean IME Composition handlers
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionUpdate = () => {
    // Cursor stays at end during composition
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    if (e.data && e.data.length > 0) {
      playKeySound();
    }
  };

  // Auto-focus on mount (desktop only)
  useEffect(() => {
    // Only auto-focus on desktop to avoid keyboard popup on mobile
    const isDesktop = window.innerWidth >= 768;
    if (textareaRef.current && isDesktop) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full dot-grid cursor-text relative"
      onClick={handleZoneClick}
    >
      {/* Writing container - responsive padding */}
      <div className="h-full w-full p-6 md:p-8 lg:p-12 flex flex-col overflow-hidden">
        {/* Text display area with cursor */}
        <div className="flex-1 relative overflow-y-auto hide-scrollbar">
          {/* Text display container - responsive font size */}
          <div 
            ref={textDisplayRef}
            className="relative text-base md:text-lg lg:text-xl leading-relaxed text-neutral-800 
                       whitespace-pre-wrap break-words pr-2 md:pr-4 min-h-full"
            aria-hidden="true"
          >
            {/* Rendered text */}
            <span>{text}</span>
            
            {/* Custom blinking cursor */}
            {isFocused && (
              <span 
                className="inline-block w-[1.5px] h-[1.1em] bg-neutral-700 
                           align-middle rounded-full ml-[1px]"
                style={{
                  animation: 'blink-smooth 1.2s ease-in-out infinite',
                  boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                  opacity: isComposing ? 0.5 : 1,
                }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Hidden textarea for actual input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onCompositionStart={handleCompositionStart}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            className="absolute inset-0 w-full h-full opacity-0 resize-none cursor-text"
            style={{ caretColor: 'transparent', fontSize: '16px' }} /* 16px prevents iOS zoom */
            placeholder=""
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>

      {/* Subtle hint at bottom - responsive positioning */}
      {!text && !isFocused && (
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 lg:left-12 pointer-events-none">
          <p className="text-xs md:text-sm text-neutral-300 italic">
            Tap to begin writing...
          </p>
        </div>
      )}

      {/* Finish & Save button - responsive positioning */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (hasText) {
            onFinishSession();
          }
        }}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50
                   flex items-center gap-1.5 md:gap-2 
                   px-3 py-2.5 md:px-5 md:py-3
                   rounded-full border-none
                   shadow-lg transition-all duration-200"
        style={{
          backgroundColor: hasText ? '#262626' : '#a3a3a3',
          color: 'white',
          cursor: hasText ? 'pointer' : 'default',
          opacity: hasText ? 1 : 0.5,
        }}
        title={hasText ? "Finish & Save" : "Type something first"}
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
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        <span className="text-xs md:text-sm font-medium">Save</span>
      </button>

      {/* Subtle left border - hidden on mobile when stacked */}
      <div className="hidden landscape:block md:block absolute top-0 left-0 w-[1px] h-full bg-neutral-200" />
    </div>
  );
}
