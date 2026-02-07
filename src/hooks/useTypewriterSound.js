import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Advanced typewriter sound engine with mobile browser support
 * Requires user gesture to unlock audio on iOS/Android
 */
export function useTypewriterSound() {
  const audioContextRef = useRef(null);
  const isUnlockedRef = useRef(false);
  const lastKeyTimeRef = useRef(0);
  const typingSpeedRef = useRef(0);
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  /**
   * Unlock audio context - must be called from user gesture
   * Creates a silent sound to unlock iOS/Android audio
   */
  const unlockAudio = useCallback(() => {
    if (isUnlockedRef.current) return true;

    try {
      // Create or resume AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Resume if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // iOS requires playing a sound within the user gesture
      // Create a silent oscillator to unlock
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      gainNode.gain.value = 0; // Silent
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.001);

      isUnlockedRef.current = true;
      setIsUnlocked(true);
      
      return true;
    } catch (error) {
      console.warn('Failed to unlock audio:', error);
      return false;
    }
  }, []);

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
      volumeMultiplier: 1 - (speed / 20),
      pitchMultiplier: 1 + (speed / 30),
      durationMultiplier: 1 - (speed / 25)
    };
  }, []);

  /**
   * Create a white noise buffer
   */
  const createNoiseBuffer = useCallback((duration) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return null;

    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }, []);

  /**
   * Play typewriter key sound
   */
  const playKeySound = useCallback(() => {
    if (!isEnabled || !isUnlockedRef.current) return;

    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') return;

    try {
      const now = audioContext.currentTime;
      const modifier = getTypingModifier();
      
      const pitchVariation = (0.9 + Math.random() * 0.2) * modifier.pitchMultiplier;
      const volumeVariation = (0.7 + Math.random() * 0.6) * modifier.volumeMultiplier;
      const timingOffset = Math.random() * 0.003;
      const duration = 0.06 * modifier.durationMultiplier;

      // Primary mechanical thud
      const noiseBuffer = createNoiseBuffer(duration + 0.02);
      if (!noiseBuffer) return;

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const lowPassFilter = audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 700 * pitchVariation;
      lowPassFilter.Q.value = 1.2;

      const highPassFilter = audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 80;
      highPassFilter.Q.value = 0.5;

      const noiseGain = audioContext.createGain();
      const baseVolume = 0.12 * volumeVariation;
      noiseGain.gain.setValueAtTime(0, now + timingOffset);
      noiseGain.gain.linearRampToValueAtTime(baseVolume, now + timingOffset + 0.002);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + timingOffset + duration);

      noiseSource.connect(lowPassFilter);
      lowPassFilter.connect(highPassFilter);
      highPassFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      // Click transient
      const clickBuffer = createNoiseBuffer(0.012);
      if (clickBuffer) {
        const clickSource = audioContext.createBufferSource();
        clickSource.buffer = clickBuffer;

        const clickFilter = audioContext.createBiquadFilter();
        clickFilter.type = 'bandpass';
        clickFilter.frequency.value = 2200 * pitchVariation;
        clickFilter.Q.value = 1.8;

        const clickGain = audioContext.createGain();
        const clickVolume = 0.06 * volumeVariation;
        clickGain.gain.setValueAtTime(0, now + timingOffset);
        clickGain.gain.linearRampToValueAtTime(clickVolume, now + timingOffset + 0.001);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + timingOffset + 0.01);

        clickSource.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(audioContext.destination);

        clickSource.start(now + timingOffset);
        clickSource.stop(now + timingOffset + 0.012);
      }

      // Body resonance
      const resonance = audioContext.createOscillator();
      resonance.type = 'sine';
      resonance.frequency.value = 100 * pitchVariation;

      const resonanceGain = audioContext.createGain();
      const resVolume = 0.02 * volumeVariation;
      resonanceGain.gain.setValueAtTime(0, now + timingOffset);
      resonanceGain.gain.linearRampToValueAtTime(resVolume, now + timingOffset + 0.002);
      resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + timingOffset + 0.03);

      resonance.connect(resonanceGain);
      resonanceGain.connect(audioContext.destination);

      noiseSource.start(now + timingOffset);
      noiseSource.stop(now + timingOffset + duration + 0.02);
      resonance.start(now + timingOffset);
      resonance.stop(now + timingOffset + 0.03);

    } catch (error) {
      // Silently fail
    }
  }, [isEnabled, createNoiseBuffer, getTypingModifier]);

  /**
   * Play space bar sound
   */
  const playSpaceSound = useCallback(() => {
    if (!isEnabled || !isUnlockedRef.current) return;

    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') return;

    try {
      const now = audioContext.currentTime;
      const modifier = getTypingModifier();
      const volumeVariation = (0.8 + Math.random() * 0.4) * modifier.volumeMultiplier;

      const noiseBuffer = createNoiseBuffer(0.08);
      if (!noiseBuffer) return;

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const lowPassFilter = audioContext.createBiquadFilter();
      lowPassFilter.type = 'lowpass';
      lowPassFilter.frequency.value = 450;
      lowPassFilter.Q.value = 0.7;

      const highPassFilter = audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 50;

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.08 * volumeVariation, now + 0.004);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      noiseSource.connect(lowPassFilter);
      lowPassFilter.connect(highPassFilter);
      highPassFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.08);

    } catch (error) {
      // Silently fail
    }
  }, [isEnabled, createNoiseBuffer, getTypingModifier]);

  /**
   * Play Enter key sound
   */
  const playEnterSound = useCallback(() => {
    if (!isEnabled || !isUnlockedRef.current) return;

    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== 'running') return;

    try {
      const now = audioContext.currentTime;

      // Initial lever click
      const clickBuffer = createNoiseBuffer(0.018);
      if (clickBuffer) {
        const clickSource = audioContext.createBufferSource();
        clickSource.buffer = clickBuffer;

        const clickFilter = audioContext.createBiquadFilter();
        clickFilter.type = 'bandpass';
        clickFilter.frequency.value = 1600;
        clickFilter.Q.value = 1.2;

        const clickGain = audioContext.createGain();
        clickGain.gain.setValueAtTime(0, now);
        clickGain.gain.linearRampToValueAtTime(0.1, now + 0.002);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        clickSource.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(audioContext.destination);

        clickSource.start(now);
        clickSource.stop(now + 0.018);
      }

      // Carriage slide
      const slideBuffer = createNoiseBuffer(0.12);
      if (slideBuffer) {
        const slideSource = audioContext.createBufferSource();
        slideSource.buffer = slideBuffer;

        const slideFilter = audioContext.createBiquadFilter();
        slideFilter.type = 'lowpass';
        slideFilter.frequency.setValueAtTime(500, now + 0.015);
        slideFilter.frequency.linearRampToValueAtTime(250, now + 0.1);
        slideFilter.Q.value = 0.4;

        const slideGain = audioContext.createGain();
        slideGain.gain.setValueAtTime(0, now + 0.012);
        slideGain.gain.linearRampToValueAtTime(0.06, now + 0.025);
        slideGain.gain.linearRampToValueAtTime(0.04, now + 0.08);
        slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        slideSource.connect(slideFilter);
        slideFilter.connect(slideGain);
        slideGain.connect(audioContext.destination);

        slideSource.start(now + 0.012);
        slideSource.stop(now + 0.12);
      }

      // Final stop clunk
      const clunkBuffer = createNoiseBuffer(0.035);
      if (clunkBuffer) {
        const clunkSource = audioContext.createBufferSource();
        clunkSource.buffer = clunkBuffer;

        const clunkFilter = audioContext.createBiquadFilter();
        clunkFilter.type = 'lowpass';
        clunkFilter.frequency.value = 350;
        clunkFilter.Q.value = 1.5;

        const clunkGain = audioContext.createGain();
        clunkGain.gain.setValueAtTime(0, now + 0.1);
        clunkGain.gain.linearRampToValueAtTime(0.12, now + 0.105);
        clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.135);

        clunkSource.connect(clunkFilter);
        clunkFilter.connect(clunkGain);
        clunkGain.connect(audioContext.destination);

        clunkSource.start(now + 0.1);
        clunkSource.stop(now + 0.135);
      }

    } catch (error) {
      // Silently fail
    }
  }, [isEnabled, createNoiseBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
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
