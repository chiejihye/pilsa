import React, { useState, useRef } from 'react';
import { MicroPopover } from './MicroPopover';

/**
 * A clickable word component with subtle hover effect
 * Shows a micro-popover for saving to vocabulary
 */
export function ClickableWord({ 
  word, 
  meaning, 
  onSave, 
  isAlreadySaved,
  className = '' 
}) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const wordRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect();
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
    
    setShowPopover(true);
  };

  return (
    <>
      <button
        ref={wordRef}
        onClick={handleClick}
        className={`
          vocab-word inline-block
          focus:outline-none
          ${isAlreadySaved ? 'opacity-50' : ''}
          ${className}
        `}
      >
        {word}
      </button>

      {showPopover && (
        <MicroPopover
          word={word}
          meaning={meaning}
          position={popoverPosition}
          onSave={onSave}
          onClose={() => setShowPopover(false)}
          isAlreadySaved={isAlreadySaved}
        />
      )}
    </>
  );
}
