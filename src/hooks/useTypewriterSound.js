import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Advanced typewriter sound engine with robust mobile browser support
 */
export function useTypewriterSound() {
  const audioContextRef = useRef(null);
  const isUnlockedRef = useRef(false);
  const lastKeyTimeRef = useRef(0);
  const typingSpeedRef = useRef(0);
  const testBufferRef = useRef(null);
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  /**
   * Get or create audio context
   */
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      } catch (e) {
        console.warn('Failed to create AudioContext:', e);
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  /**
   * Unlock audio context - MUST be called from user gesture (touch/click)
   */
  const unlockAudio = useCallback(async () => {
    if (isUnlockedRef.current) {
      return true;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      return false;
    }

    try {
      // Resume if suspended (required for iOS)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create and play a short silent buffer (iOS requires this)
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);

      // Also create a test oscillator (some browsers need this)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.001; // Nearly silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.01);

      // Pre-create a noise buffer for faster playback later
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      testBufferRef.current = noiseBuffer;

      isUnlockedRef.current = true;
      setIsUnlocked(true);
      
      console.log('Audio unlocked successfully, state:', audioContext.state);
      return true;
    } catch (error) {
      console.warn('Failed to unlock audio:', error);
      return false;
    }
  }, [getAudioContext]);

  /**
   * Toggle sound on/off
   */
  const toggleSound = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  /**
   * Calculate typing speed modifier
   */
  const getTypingModifier = useCallback(() => {
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    if (timeSinceLastKey > 0 && timeSinceLastKey < 2000) {
      const instantSpeed = 1000 / timeSinceLastKey;
      typingSpeedRef.current = typingSpeedRef.current * 0.7 + instantSpeed * 0.3;
    } else {
      typingSpeedRef.current = 0;
    }

    const speed = Math.min(typingSpeedRef.current, 12);
    
    return {
      volumeMultiplier: Math.max(0.3, 1 - (speed / 20)),
      pitchMultiplier: 1 + (speed / 30),
      durationMultiplier: Math.max(0.5, 1 - (speed / 25))
    };
  }, []);

  /**
   * Create a white noise buffer
   */
  const createNoiseBuffer = useCallback((duration) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return null;

    const bufferSize = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }, []);

  /**
   * Check if audio is ready to play
   */
  const isAudioReady = useCallback(() => {
    if (!isEnabled) return false;
    if (!isUnlockedRef.current) return false;
    const ctx = audioContextRef.current;
    if (!ctx) return false;
    if (ctx.state !== 'running') {
      // Try to resume
      ctx.resume().catch(() => {});
      return false;
    }
    return true;
  }, [isEnabled]);

  /**
   * Play typewriter key sound
   */
  const playKeySound = useCallback(() => {
    if (!isAudioReady()) return;

    const audioContext = audioContextRef.current;

    try {
      const now = audioContext.currentTime;
      const modifier = getTypingModifier();
      
      const pitchVariation = (0.9 + Math.random() * 0.2) * modifier.pitchMultiplier;
      const volumeVariation = (0.7 + Math.random() * 0.6) * modifier.volumeMultiplier;
      const duration = 0.05 * modifier.durationMultiplier;

      // Main thud sound
      const noiseBuffer = createNoiseBuffer(duration + 0.02);
      if (!noiseBuffer) return;

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const lowPassFilter = audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 800 * pitchVariation;
      lowPassFilter.Q.value = 1;

      const highPassFilter = audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 100;

      const noiseGain = audioContext.createGain();
      const baseVolume = 0.15 * volumeVariation;
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(baseVolume, now + 0.003);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(lowPassFilter);
      lowPassFilter.connect(highPassFilter);
      highPassFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.02);

      // Click transient
      const clickOsc = audioContext.createOscillator();
      clickOsc.type = 'square';
      clickOsc.frequency.value = 2000 * pitchVariation;

      const clickGain = audioContext.createGain();
      clickGain.gain.setValueAtTime(0.05 * volumeVariation, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.01);

    } catch (error) {
      console.warn('Sound error:', error);
    }
  }, [isAudioReady, createNoiseBuffer, getTypingModifier]);

  /**
   * Play space bar sound
   */
  const playSpaceSound = useCallback(() => {
    if (!isAudioReady()) return;

    const audioContext = audioContextRef.current;

    try {
      const now = audioContext.currentTime;
      const modifier = getTypingModifier();
      const volumeVariation = (0.8 + Math.random() * 0.4) * modifier.volumeMultiplier;

      const noiseBuffer = createNoiseBuffer(0.06);
      if (!noiseBuffer) return;

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const lowPassFilter = audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 500;

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.1 * volumeVariation, now + 0.005);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noiseSource.connect(lowPassFilter);
      lowPassFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.06);

    } catch (error) {
      console.warn('Sound error:', error);
    }
  }, [isAudioReady, createNoiseBuffer, getTypingModifier]);

  /**
   * Play Enter key sound
   */
  const playEnterSound = useCallback(() => {
    if (!isAudioReady()) return;

    const audioContext = audioContextRef.current;

    try {
      const now = audioContext.currentTime;

      // Click
      const clickOsc = audioContext.createOscillator();
      clickOsc.type = 'square';
      clickOsc.frequency.value = 1500;

      const clickGain = audioContext.createGain();
      clickGain.gain.setValueAtTime(0.08, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

      // Slide sound
      const slideBuffer = createNoiseBuffer(0.1);
      if (slideBuffer) {
        const slideSource = audioContext.createBufferSource();
        slideSource.buffer = slideBuffer;

        const slideFilter = audioContext.createBiquadFilter();
        slideFilter.type = 'lowpass';
        slideFilter.frequency.setValueAtTime(400, now + 0.01);
        slideFilter.frequency.linearRampToValueAtTime(200, now + 0.08);

        const slideGain = audioContext.createGain();
        slideGain.gain.setValueAtTime(0.001, now + 0.01);
        slideGain.gain.linearRampToValueAtTime(0.06, now + 0.02);
        slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        slideSource.connect(slideFilter);
        slideFilter.connect(slideGain);
        slideGain.connect(audioContext.destination);

        slideSource.start(now + 0.01);
        slideSource.stop(now + 0.1);
      }

      // Final thud
      const thudOsc = audioContext.createOscillator();
      thudOsc.type = 'sine';
      thudOsc.frequency.value = 100;

      const thudGain = audioContext.createGain();
      thudGain.gain.setValueAtTime(0.001, now + 0.08);
      thudGain.gain.linearRampToValueAtTime(0.1, now + 0.085);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      thudOsc.connect(thudGain);
      thudGain.connect(audioContext.destination);

      thudOsc.start(now + 0.08);
      thudOsc.stop(now + 0.12);

    } catch (error) {
      console.warn('Sound error:', error);
    }
  }, [isAudioReady, createNoiseBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    playKeySound,
    playSpaceSound,
    playEnterSound,
    unlockAudio,
    toggleSound,
    isEnabled,
    isUnlocked
  };
}
