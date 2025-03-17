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

// Convert notes to MIDI format
export const notesToMIDI = (melody) => {
  // Function to convert note name to MIDI note number
  const noteToMIDINumber = (note) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    return notes.indexOf(noteName) + (octave + 1) * 12;
  };
  
  try {
    if (!window.MidiWriter) {
      throw new Error('MidiWriter not loaded yet');
    }
    
    // Create a MIDI writer track
    const track = new window.MidiWriter.Track();
    
    // Set track name and instrument
    track.addEvent(
      new window.MidiWriter.MetaEvent({
        data: [
          {
            delta: 0,
            type: 0x03, // Track name
            data: melody.name
          }
        ]
      })
    );
    
    // Choose an appropriate instrument based on melody type
    let instrument = 1; // Default: Acoustic Grand Piano
    
    if (melody.type === 'bass') {
      instrument = 35; // Electric Bass
    } else if (melody.type === 'arpeggio') {
      instrument = 81; // Synth Lead
    } else if (melody.type === 'lead') {
      instrument = 82; // Synth Calliope
    } else if (melody.type === 'riff') {
      instrument = 30; // Distortion Guitar
    } else if (melody.type === 'drums') {
      // For drums, we'll use MIDI channel 10 (index 9) and specific note numbers
      instrument = 0;
    }
    
    track.addEvent(new window.MidiWriter.ProgramChangeEvent({instrument: instrument}));
    
    // Set tempo (120 BPM)
    track.setTempo(120);
    
    // Convert all notes to their MIDI equivalents
    const midiNotes = melody.notes.map(note => {
      // Convert duration string to MIDI duration
      let duration = '4';
      switch(note.duration) {
        case '2n': duration = '2'; break;
        case '4n': duration = '4'; break;
        case '4n.': duration = 'd4'; break; // dotted quarter
        case '8n': duration = '8'; break;
        case '16n': duration = '16'; break;
        default: duration = '4';
      }
      
      // Convert time to ticks
      const ticks = Math.round(note.time * 128); // 128 ticks per quarter note at 120 BPM
      
      // Use percussion channel (10) for drums
      const channel = melody.type === 'drums' ? 10 : 1;
      
      return {
        pitch: noteToMIDINumber(note.note),
        duration: duration,
        tick: ticks,
        velocity: note.velocity ? Math.floor(note.velocity * 100) : 80,
        channel: channel
      };
    });
    
    // Sort notes by tick (start time)
    midiNotes.sort((a, b) => a.tick - b.tick);
    
    // Add each note to the track
    let currentTick = 0;
    
    midiNotes.forEach(note => {
      const delta = note.tick - currentTick;
      currentTick = note.tick;
      
      track.addEvent(new window.MidiWriter.NoteEvent({
        pitch: note.pitch,
        duration: note.duration,
        wait: delta > 0 ? 'T' + delta : 0, // Use delta time if positive
        velocity: note.velocity,
        channel: note.channel
      }));
    });
    
    // Create a Type 1 MIDI file with one track
    const write = new window.MidiWriter.Writer([track]);
    
    // Return as data URI
    return write.dataUri();
  } catch (error) {
    console.error('Error creating MIDI file:', error);
    
    // Fallback to placeholder if MidiWriter isn't loaded
    alert('MIDI library not loaded yet. Please try again in a few seconds.');
    return '#';
  }
};