import { melodyToMIDI } from './midiUtils';

// Convert note to frequency
export const noteToFrequency = (note) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = parseInt(note.slice(-1));
  const noteName = note.slice(0, -1);
  const noteIndex = notes.indexOf(noteName);
  
  // A4 is 440 Hz
  return 440 * Math.pow(2, (noteIndex - 9) / 12 + (octave - 4));
};

// Duration name to seconds
export const durationToSeconds = (duration) => {
  // Assume 120 BPM
  switch (duration) {
    case '2n': return 1.0; // Half note
    case '4n': return 0.5; // Quarter note
    case '4n.': return 0.75; // Dotted quarter note
    case '8n': return 0.25; // Eighth note
    case '16n': return 0.125; // Sixteenth note
    default: return 0.5; // Default to quarter note
  }
};

// Convert notes to MIDI format compatible with FL Studio
export const notesToMIDI = (melody) => {
  try {
    // Use our custom MIDI generator that follows the standard specification
    return melodyToMIDI(melody);
  } catch (error) {
    console.error('Error creating MIDI file:', error);
    
    // Fallback to placeholder if there's an error
    alert('An error occurred while creating the MIDI file. Please try again.');
    return '#';
  }
};