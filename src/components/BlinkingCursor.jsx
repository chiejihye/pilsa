import React from 'react';

/**
 * A thin, blinking vertical cursor component
 * Provides a focused writing experience with smooth transitions
 */
export function BlinkingCursor({ visible = true }) {
  if (!visible) return null;

  return (
    <span 
      className="cursor-blink smooth-caret inline-block w-[1.5px] h-[1.1em] 
                 bg-neutral-700 ml-[1px] align-middle rounded-full"
      style={{
        boxShadow: '0 0 4px rgba(0,0,0,0.1)'
      }}
      aria-hidden="true"
    />
  );
}
