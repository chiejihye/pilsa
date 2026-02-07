import React from 'react';

/**
 * Subtle sound toggle button with unlock state indicator
 */
export function SoundToggle({ isEnabled, isUnlocked, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="absolute top-3 right-3 md:top-4 md:right-4 z-20
                 p-2 rounded-full 
                 transition-all duration-200
                 hover:bg-neutral-100 active:scale-95"
      style={{
        opacity: isEnabled ? 0.7 : 0.3,
      }}
      title={isEnabled ? 'Sound On (tap to mute)' : 'Sound Off (tap to enable)'}
      aria-label={isEnabled ? 'Mute typing sounds' : 'Enable typing sounds'}
    >
      {isEnabled ? (
        // Speaker with sound waves
        <svg 
          className="w-4 h-4 md:w-5 md:h-5 text-neutral-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" 
          />
          {/* Small dot to show unlock status */}
          {isUnlocked && (
            <circle cx="20" cy="4" r="2" fill="#22c55e" />
          )}
        </svg>
      ) : (
        // Muted speaker
        <svg 
          className="w-4 h-4 md:w-5 md:h-5 text-neutral-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M17 9l-6 6M11 9l6 6" 
          />
        </svg>
      )}
    </button>
  );
}
