import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTypewriterSound } from '../hooks/useTypewriterSound';

/**
 * Right panel - the writing zone
 * Features:
 * - Precise cursor tracking synchronized with text flow
 * - Korean IME (composition) handling
 * - Invisible textarea with custom blinking cursor
 */
export function WritingZone({ text, onTextChange, onFinishSession, hasText }) {
  const textareaRef = useRef(null);
  const textDisplayRef = useRef(null);
  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  const { playKeySound, playSpaceSound, playEnterSound, initializeAudio } = useTypewriterSound();

  /**
   * Calculate cursor position based on text content
   * Uses a hidden span to measure text width
   */
  const updateCursorPosition = useCallback(() => {
    if (!textDisplayRef.current || !containerRef.current) return;

    const displayEl = textDisplayRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Create a temporary span to measure text
    const measureSpan = document.createElement('span');
    measureSpan.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      letter-spacing: inherit;
      width: ${displayEl.clientWidth}px;
    `;
    measureSpan.textContent = text || '';
    displayEl.appendChild(measureSpan);

    // Get the position of the last character
    const range = document.createRange();
    if (measureSpan.firstChild) {
      range.setStart(measureSpan.firstChild, text.length);
      range.setEnd(measureSpan.firstChild, text.length);
    } else {
      range.selectNodeContents(measureSpan);
    }
    
    const rects = range.getClientRects();
    const lastRect = rects[rects.length - 1];
    
    if (lastRect) {
      const displayRect = displayEl.getBoundingClientRect();
      setCursorPosition({
        x: lastRect.right - displayRect.left,
        y: lastRect.top - displayRect.top
      });
    } else {
      // Empty text - position at start
      setCursorPosition({ x: 0, y: 0 });
    }

    displayEl.removeChild(measureSpan);
  }, [text]);

  // Update cursor position when text changes
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timeoutId = requestAnimationFrame(() => {
      updateCursorPosition();
    });
    return () => cancelAnimationFrame(timeoutId);
  }, [text, updateCursorPosition]);

  // Update cursor position on resize
  useEffect(() => {
    const handleResize = () => updateCursorPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCursorPosition]);

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
    // Don't play sounds during IME composition
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
    // Don't trigger sounds during composition
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    // Play a single sound when composition completes
    if (e.data && e.data.length > 0) {
      playKeySound();
    }
  };

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full dot-grid cursor-text relative"
      onClick={handleZoneClick}
    >
      {/* Writing container */}
      <div className="h-full w-full p-8 lg:p-12 flex flex-col overflow-hidden">
        {/* Text display area with cursor */}
        <div className="flex-1 relative overflow-y-auto hide-scrollbar">
          {/* Text display container */}
          <div 
            ref={textDisplayRef}
            className="relative text-lg lg:text-xl leading-relaxed text-neutral-800 
                       whitespace-pre-wrap break-words pr-4 min-h-full"
            aria-hidden="true"
          >
            {/* Rendered text */}
            <span>{text}</span>
            
            {/* Custom blinking cursor - positioned inline */}
            {isFocused && (
              <span 
                ref={cursorRef}
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
            style={{ caretColor: 'transparent' }}
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
