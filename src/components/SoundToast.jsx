import React, { useEffect, useState } from 'react';

/**
 * Toast notification for sound activation
 * Shows briefly when typewriter sound is activated
 */
export function SoundToast({ show, onHide }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onHide, 300); // Wait for fade out
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show && !visible) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 
                  flex items-center gap-2 px-4 py-2.5 
                  bg-neutral-800 text-white text-xs rounded-full
                  shadow-lg transition-all duration-300
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
      <span>Typewriter sound on</span>
    </div>
  );
}
