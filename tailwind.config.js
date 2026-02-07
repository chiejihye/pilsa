/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#FAF9F6',
        'bone-dark': '#F5F4F1',
      },
      width: {
        '3/10': '30%',
        '7/10': '70%',
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', '"Playfair Display"', 'serif'],
      },
      height: {
        'dvh': '100dvh',
      },
      backdropBlur: {
        'md': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-in': 'slideInFromLeft 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        'pop-in': 'popIn 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInFromLeft: {
          from: { transform: 'translateX(-100%)', opacity: '0.8' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        popIn: {
          from: { opacity: '0', transform: 'translate(-50%, -100%) scale(0.95)' },
          to: { opacity: '1', transform: 'translate(-50%, -100%) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
