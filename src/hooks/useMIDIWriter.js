import { useEffect } from 'react';
import usePreloadedScripts from './usePreloadedScripts';

// Hook for loading and using MidiWriter.js
const useMIDIWriter = () => {
  // Define scripts to load with fallbacks
  const scripts = [
    {
      src: 'https://cdn.jsdelivr.net/npm/midi-writer-js@2.1.4/browser/midi-writer-js.min.js',
      fallbackSrc: '/midi-writer-js.min.js', // Local fallback
      global: 'MidiWriter'
    }
  ];
  
  // Use the preloaded scripts hook
  const loadedScripts = usePreloadedScripts(scripts);
  
  // Log when MidiWriter is available
  useEffect(() => {
    if (loadedScripts.MidiWriter) {
      console.log('MidiWriter.js is ready to use');
    }
  }, [loadedScripts.MidiWriter]);
  
  return {
    isLoaded: () => !!loadedScripts.MidiWriter
  };
};

export default useMIDIWriter;