import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Advanced typewriter sound engine with robust mobile browser support
 */
export function useTypewriterSound() {
  const audioContextRef = useRef(null);
  const isUnlockedRef = useRef(false);
  const lastKeyTimeRef = useRef(0);
  const typingSpeedRef = useRef(0);
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  /**
   * Get or create audio context - creates fresh if closed
   */
  const getAudioContext = useCallback(() => {
    // Create new if doesn't exist or was closed
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          console.error('Web Audio API not supported');
          return null;
        }
        audioContextRef.current = new AudioContextClass();
        console.log('Created new AudioContext, state:', audioContextRef.current.state);
      } catch (e) {
        console.error('Failed to create AudioContext:', e);
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a short click sound - used for unlock test
   */
  const playTestClick = useCallback((ctx) => {
    try {
      const now = ctx.currentTime;
      
      // Simple click oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
      
      console.log('Test click played');
    } catch (e) {
      console.error('Test click failed:', e);
    }
  }, []);

  /**
   * Unlock audio context - MUST be called from user gesture (touch/click)
   */
  const unlockAudio = useCallback(async () => {
    console.log('unlockAudio called, current state:', isUnlockedRef.current);
    
    if (isUnlockedRef.current) {
      // Already unlocked, but let's verify context is still running
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }
      return true;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      console.error('No audio context available');
      return false;
    }

    console.log('AudioContext state before unlock:', audioContext.state);

    try {
      // Resume if suspended
      if (audioContext.state === 'suspended') {
        console.log('Resuming suspended context...');
        await audioContext.resume();
        console.log('Context resumed, new state:', audioContext.state);
      }

      // Play silent buffer (required for iOS Safari)
      const silentBuffer = audioContext.createBuffer(1, 1, 22050);
      const silentSource = audioContext.createBufferSource();
      silentSource.buffer = silentBuffer;
      silentSource.connect(audioContext.destination);
      silentSource.start(0);

      // Wait a tiny bit then check state
      await new Promise(resolve => setTimeout(resolve, 50));

      if (audioContext.state === 'running') {
        // Play audible test click to confirm it works
        playTestClick(audioContext);
        
        isUnlockedRef.current = true;
        setIsUnlocked(true);
        console.log('Audio unlocked successfully!');
        return true;
      } else {
        console.warn('Context not running after unlock attempt:', audioContext.state);
        // Try resume again
        await audioContext.resume();
        if (audioContext.state === 'running') {
          playTestClick(audioContext);
          isUnlockedRef.current = true;
          setIsUnlocked(true);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to unlock audio:', error);
      return false;
    }
  }, [getAudioContext, playTestClick]);

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
   * Ensure audio context is ready before playing
   */
  const ensureContextReady = useCallback(async () => {
    if (!isEnabled) return false;
    
    const ctx = audioContextRef.current;
    if (!ctx) return false;
    
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        return false;
      }
    }
    
    return ctx.state === 'running';
  }, [isEnabled]);

  /**
   * Play typewriter key sound
   */
  const playKeySound = useCallback(async () => {
    if (!isEnabled || !isUnlockedRef.current) return;
    
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    // Ensure context is running
    if (audioContext.state !== 'running') {
      await audioContext.resume().catch(() => {});
      if (audioContext.state !== 'running') return;
    }

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
      const baseVolume = 0.25 * volumeVariation; // Increased volume
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
      clickGain.gain.setValueAtTime(0.08 * volumeVariation, now); // Increased
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      clickOsc.connect(clickGain);
      clickGain.connect(audioContext.destination);

      clickOsc.start(now);
      clickOsc.stop(now + 0.01);

    } catch (error) {
      console.warn('playKeySound error:', error);
    }
  }, [isEnabled, createNoiseBuffer, getTypingModifier]);

  /**
   * Play space bar sound
   */
  const playSpaceSound = useCallback(async () => {
    if (!isEnabled || !isUnlockedRef.current) return;
    
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    if (audioContext.state !== 'running') {
      await audioContext.resume().catch(() => {});
      if (audioContext.state !== 'running') return;
    }

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
      noiseGain.gain.linearRampToValueAtTime(0.15 * volumeVariation, now + 0.005); // Increased
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noiseSource.connect(lowPassFilter);
      lowPassFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.06);

    } catch (error) {
      console.warn('playSpaceSound error:', error);
    }
  }, [isEnabled, createNoiseBuffer, getTypingModifier]);

  /**
   * Play Enter key sound
   */
  const playEnterSound = useCallback(async () => {
    if (!isEnabled || !isUnlockedRef.current) return;
    
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    if (audioContext.state !== 'running') {
      await audioContext.resume().catch(() => {});
      if (audioContext.state !== 'running') return;
    }

    try {
      const now = audioContext.currentTime;

      // Click
      const clickOsc = audioContext.createOscillator();
      clickOsc.type = 'square';
      clickOsc.frequency.value = 1500;

      const clickGain = audioContext.createGain();
      clickGain.gain.setValueAtTime(0.12, now); // Increased
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
        slideGain.gain.linearRampToValueAtTime(0.1, now + 0.02); // Increased
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
      thudGain.gain.linearRampToValueAtTime(0.15, now + 0.085); // Increased
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      thudOsc.connect(thudGain);
      thudGain.connect(audioContext.destination);

      thudOsc.start(now + 0.08);
      thudOsc.stop(now + 0.12);

    } catch (error) {
      console.warn('playEnterSound error:', error);
    }
  }, [isEnabled, createNoiseBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
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
