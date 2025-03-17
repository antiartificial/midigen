import { useRef, useEffect } from 'react';
import { noteToFrequency } from '../utils/audioUtils';

const useAudioContext = () => {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  
  // Initialize Web Audio API
  useEffect(() => {
    // Create audio context on first interaction
    const setupAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };
    
    // Set up event listener for user interaction
    document.addEventListener('click', setupAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', setupAudio);
      // Clean up oscillators
      Object.values(oscillatorsRef.current).forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore errors if oscillator is already stopped
        }
      });
      // Close audio context if it exists
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Play a note
  const playNote = (note, time, duration, velocity = 0.8) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const startTime = audioContextRef.current.currentTime + time;
    const endTime = startTime + duration;
    
    // Create oscillator
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    // Set oscillator type based on the note type
    if (note.includes('1') || note.includes('2')) {
      oscillator.type = 'sine'; // Bass sounds
    } else if (note.includes('3')) {
      oscillator.type = 'triangle'; // Mid-range sounds
    } else {
      oscillator.type = 'sawtooth'; // Higher sounds
    }
    
    // Set frequency based on note
    oscillator.frequency.value = noteToFrequency(note);
    
    // Set volume based on velocity
    gainNode.gain.value = velocity * 0.3; // Reduce overall volume
    
    // Apply envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.3, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, endTime);
    
    // Connect and start
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start(startTime);
    oscillator.stop(endTime);
    
    // Store oscillator reference for cleanup
    const id = Math.random().toString(36);
    oscillatorsRef.current[id] = oscillator;
    
    // Remove reference after oscillator stops
    setTimeout(() => {
      delete oscillatorsRef.current[id];
    }, (endTime - audioContextRef.current.currentTime) * 1000);
    
    return oscillator;
  };
  
  // Stop all playing melodies
  const stopAllOscillators = () => {
    // Clean up oscillators
    Object.values(oscillatorsRef.current).forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors if oscillator is already stopped
      }
    });
    oscillatorsRef.current = {};
  };
  
  return {
    playNote,
    stopAllOscillators,
    getAudioContext: () => audioContextRef.current
  };
};

export default useAudioContext;