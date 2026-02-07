import React, { useRef, useEffect, useState } from 'react';
import { useTypewriterSound } from '../hooks/useTypewriterSound';
import { SoundToast } from './SoundToast';
import { SoundToggle } from './SoundToggle';

/**
 * Writing zone with mobile audio support
 */
export function WritingZone({ text, onTextChange, onFinishSession, hasText }) {
  const textareaRef = useRef(null);
  const textDisplayRef = useRef(null);
  const containerRef = useRef(null);
  const prevTextLengthRef = useRef(text.length);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showSoundToast, setShowSoundToast] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [showSoundPrompt, setShowSoundPrompt] = useState(true);
  
  const { 
    playKeySound, 
    playSpaceSound, 
    playEnterSound, 
    unlockAudio,
    toggleSound,
    isEnabled,
    isUnlocked
  } = useTypewriterSound();

  // Handle tap/click to unlock audio and focus
  const handleZoneClick = async (e) => {
    if (e.target.closest('button')) return;
    
    // Unlock audio on tap
    const wasUnlocked = await unlockAudio();
    
    // Show toast on first successful unlock
    if (wasUnlocked && !hasShownToast && isEnabled) {
      setShowSoundToast(true);
      setHasShownToast(true);
      setShowSoundPrompt(false);
    }
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle touch start for mobile - ensures audio unlock happens on touch
  const handleTouchStart = async () => {
    if (!isUnlocked) {
      const success = await unlockAudio();
      if (success && !hasShownToast && isEnabled) {
        setShowSoundToast(true);
        setHasShownToast(true);
        setShowSoundPrompt(false);
      }
    }
  };

  // Desktop: play sound on keydown
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

  // Handle text change - also play sound here for mobile compatibility
  const handleChange = (e) => {
    const newText = e.target.value;
    const prevLength = prevTextLengthRef.current;
    const newLength = newText.length;
    
    // Play sound based on what changed (for mobile where keydown may not fire)
    if (!isComposing && newLength !== prevLength) {
      // Check if it's a newline
      if (newText.endsWith('\n') && !text.endsWith('\n')) {
        // Enter was pressed - but keydown should handle this on desktop
        // Only play if we're on mobile (detect by checking if keydown didn't fire)
      } else if (newLength > prevLength) {
        // Character added
        const addedChar = newText.slice(-1);
        if (addedChar === ' ') {
          // Space - keydown should handle, but mobile backup
        } else if (addedChar === '\n') {
          // Enter
        } else {
          // Regular character - mobile backup
          // Note: On desktop, keydown handles this. On mobile, this is the backup.
        }
      }
    }
    
    prevTextLengthRef.current = newLength;
    onTextChange(newText);
  };

  // Use beforeinput for better mobile support
  const handleBeforeInput = (e) => {
    if (isComposing) return;
    
    // Mobile browsers fire beforeinput reliably
    if (e.inputType === 'insertText' || e.inputType === 'insertCompositionText') {
      if (e.data === ' ') {
        playSpaceSound();
      } else if (e.data && e.data.length > 0) {
        playKeySound();
      }
    } else if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
      playEnterSound();
    } else if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
      playKeySound();
    }
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

  const handleToggleSound = async () => {
    const success = await unlockAudio();
    toggleSound();
    setShowSoundPrompt(false);
    if (success && !hasShownToast) {
      setHasShownToast(true);
    }
  };

  const handleFocus = async () => {
    setIsFocused(true);
    // Also try to unlock on focus (keyboard open)
    if (!isUnlocked) {
      await unlockAudio();
    }
  };

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (textareaRef.current && isDesktop) {
      textareaRef.current.focus();
    }
  }, []);

  // Hide prompt after unlocked
  useEffect(() => {
    if (isUnlocked) {
      setShowSoundPrompt(false);
    }
  }, [isUnlocked]);

  return (
    <div 
      ref={containerRef}
      className="h-full dot-grid cursor-text relative overflow-hidden"
      onClick={handleZoneClick}
      onTouchStart={handleTouchStart}
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

      {/* Mobile sound prompt - shows until first tap */}
      {showSoundPrompt && !isUnlocked && (
        <div className="absolute top-3 right-12 md:hidden z-20 
                        text-[10px] text-neutral-400 
                        bg-white/80 px-2 py-1 rounded-full
                        animate-pulse">
          Tap for sound
        </div>
      )}

      {/* Writing container */}
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
            onBeforeInput={handleBeforeInput}
            onFocus={handleFocus}
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

      {/* Save button */}
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

      {/* Vertical divider line */}
      <div className="hidden landscape:block md:block absolute top-0 left-0 w-[1px] h-full bg-stone-200" />
    </div>
  );
}
