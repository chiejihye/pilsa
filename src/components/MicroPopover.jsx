import React, { useEffect, useRef, useState } from 'react';

/**
 * Micro-popover for vocabulary saving
 * Positioned directly above the clicked word with subtle animation
 */
export function MicroPopover({ 
  word, 
  meaning, 
  position, 
  onSave, 
  onClose,
  isAlreadySaved 
}) {
  const popoverRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (popoverRef.current) {
      const popup = popoverRef.current;
      const rect = popup.getBoundingClientRect();
      
      let newX = position.x;
      let newY = position.y - 12;

      // Ensure popover doesn't go off the left edge
      const minX = rect.width / 2 + 16;
      if (newX < minX) {
        newX = minX;
      }
      
      // Ensure popover doesn't go off the right edge
      const maxX = window.innerWidth - rect.width / 2 - 16;
      if (newX > maxX) {
        newX = maxX;
      }

      // If popover would go above viewport, show it below the word
      if (rect.top < 16) {
        newY = position.y + 32;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 pop-in"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* Popover card - glassmorphism style */}
      <div className="glass-card border border-neutral-200/60 rounded-xl shadow-lg 
                      px-4 py-3 min-w-[160px] max-w-[240px]">
        {/* Word and meaning */}
        <div className="mb-3">
          <p className="font-medium text-neutral-800 text-sm tracking-tight">
            {word}
          </p>
          <p className="text-neutral-500 text-xs mt-1">
            {meaning}
          </p>
        </div>

        {/* Action button */}
        {isAlreadySaved ? (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Saved</span>
          </div>
        ) : (
          <button
            onClick={() => {
              onSave(word, meaning);
              onClose();
            }}
            className="flex items-center gap-1.5 w-full text-xs px-3 py-2 
                       bg-neutral-800 text-white rounded-lg
                       hover:bg-neutral-700 active:scale-[0.98]
                       transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Save to Vocab</span>
          </button>
        )}
      </div>

      {/* Arrow pointing down */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px]">
        <div className="w-3 h-3 rotate-45 bg-white/60 backdrop-blur-sm border-r border-b border-neutral-200/60" />
      </div>
    </div>
  );
}
