import React, { useRef, useEffect, useState } from 'react';
import { useTypewriterSound } from '../hooks/useTypewriterSound';
import { SoundToast } from './SoundToast';
import { SoundToggle } from './SoundToggle';

/**
 * Writing zone with:
 * - Scrollable content area
 * - Fixed save button that doesn't overlap text
 * - Proper padding to avoid button overlap
 */
export function WritingZone({ text, onTextChange, onFinishSession, hasText }) {
  const textareaRef = useRef(null);
  const textDisplayRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showSoundToast, setShowSoundToast] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  
  const { 
    playKeySound, 
    playSpaceSound, 
    playEnterSound, 
    unlockAudio,
    toggleSound,
    isEnabled,
    isUnlocked
  } = useTypewriterSound();

  const handleZoneClick = (e) => {
    if (e.target.closest('button')) return;
    
    const wasUnlocked = unlockAudio();
    
    if (wasUnlocked && !hasShownToast && isEnabled) {
      setShowSoundToast(true);
      setHasShownToast(true);
    }
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

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

  const handleChange = (e) => {
    onTextChange(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionUpdate = () => {};

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    if (e.data && e.data.length > 0) {
      playKeySound();
    }
  };

  const handleToggleSound = () => {
    unlockAudio();
    toggleSound();
  };

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (textareaRef.current && isDesktop) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full dot-grid cursor-text relative overflow-hidden"
      onClick={handleZoneClick}
    >
      {/* Sound toggle button */}
      <SoundToggle 
        isEnabled={isEnabled} 
        isUnlocked={isUnlocked}
        onToggle={handleToggleSound} 
      />

      {/* Sound activation toast */}
      <SoundToast 
        show={showSoundToast} 
        onHide={() => setShowSoundToast(false)} 
      />

      {/* Writing container - with bottom padding to avoid save button overlap */}
      <div className="h-full w-full p-5 pb-20 md:p-8 md:pb-24 lg:p-12 lg:pb-24 flex flex-col">
        {/* Scrollable text area */}
        <div className="flex-1 relative overflow-y-auto hide-scrollbar">
          {/* Text display */}
          <div 
            ref={textDisplayRef}
            className="relative leading-relaxed text-neutral-800 
                       whitespace-pre-wrap break-words pr-2 md:pr-4 min-h-full"
            style={{
              fontSize: 'clamp(0.9rem, 1.5vw + 0.5rem, 1.25rem)',
            }}
            aria-hidden="true"
          >
            <span>{text}</span>
            
            {/* Blinking cursor */}
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

          {/* Hidden textarea */}
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
            style={{ caretColor: 'transparent', fontSize: '16px' }}
            placeholder=""
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>

      {/* Hint text */}
      {!text && !isFocused && (
        <div className="absolute bottom-20 md:bottom-24 left-5 md:left-8 lg:left-12 pointer-events-none">
          <p className="text-xs md:text-sm text-neutral-300 italic">
            Tap to begin writing...
          </p>
        </div>
      )}

      {/* Save button - fixed position, always visible above content */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasText) {
              onFinishSession();
            }
          }}
          className="flex items-center gap-1.5 md:gap-2 
                     px-3 py-2 md:px-4 md:py-2.5
                     rounded-full border-none
                     shadow-lg hover:shadow-xl
                     transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: hasText ? '#262626' : '#a3a3a3',
            color: 'white',
            cursor: hasText ? 'pointer' : 'default',
            opacity: hasText ? 1 : 0.4,
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
      </div>

      {/* Vertical divider line - only on landscape/desktop */}
      <div className="hidden landscape:block md:block absolute top-0 left-0 w-[1px] h-full bg-stone-200" />
    </div>
  );
}
