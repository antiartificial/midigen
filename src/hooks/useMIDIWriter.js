import { useEffect } from 'react';

// Hook for loading and using MidiWriter.js
const useMIDIWriter = () => {
  useEffect(() => {
    // Load the MidiWriter script if it's not already loaded
    if (!window.MidiWriter) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/midi-writer-js@2.1.4/browser/midi-writer-js.min.js';
      script.async = true;
      script.onload = () => {
        console.log('MidiWriter.js loaded successfully');
      };
      document.body.appendChild(script);
    }
    
    // No cleanup needed as we want the script to stay loaded
  }, []);
  
  return {
    isLoaded: () => !!window.MidiWriter
  };
};

export default useMIDIWriter;