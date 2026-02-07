import React from 'react';

/**
 * Subtle sound on/off toggle button
 */
export function SoundToggle({ isEnabled, isUnlocked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-3 right-3 md:top-4 md:right-4 z-30 
                  p-2 md:p-2.5 rounded-xl transition-all duration-200
                  ${isEnabled && isUnlocked
                    ? 'text-neutral-500 hover:text-neutral-700 hover:bg-white/50' 
                    : 'text-neutral-300 hover:text-neutral-500 hover:bg-white/50'
                  }`}
      aria-label={isEnabled ? 'Turn sound off' : 'Turn sound on'}
      title={isEnabled ? 'Sound on' : 'Sound off'}
    >
      {isEnabled && isUnlocked ? (
        // Sound on icon
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        // Sound off icon
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </button>
  );
}
