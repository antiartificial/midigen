// --- METAL STYLE ---
export const generateMetalRiff = (bars) => {
  // Power chord-focused notes for metal
  const notes = ['E2', 'A2', 'D3', 'G2', 'B2', 'E3'];
  const powerChords = [
    ['E2', 'B2', 'E3'], // E5
    ['A2', 'E3', 'A3'], // A5
    ['D2', 'A2', 'D3'], // D5
    ['G2', 'D3', 'G3'], // G5
    ['B2', 'F#3', 'B3'], // B5
  ];
  
  const rhythm = ['8n', '8n', '8n', '8n', '4n', '4n.', '8n'];
  
  const riff = [];
  
  // Generate metal riff with palm-muted patterns and power chords
  for (let i = 0; i < bars * 4; i++) {
    // Typical metal rhythm patterns
    if (i % 8 === 0 || i % 8 === 4) { // Emphasize downbeats
      // Power chord on strong beats
      const chord = powerChords[Math.floor(Math.random() * powerChords.length)];
      chord.forEach(note => {
        riff.push({
          note: note,
          duration: '4n',
          time: i * 0.5,
          velocity: 0.9 // Louder for emphasis
        });
      });
    } else if (Math.random() > 0.4) {
      // Palm-muted single notes between power chords
      riff.push({
        note: notes[Math.floor(Math.random() * notes.length)],
        duration: rhythm[Math.floor(Math.random() * rhythm.length)],
        time: i * 0.5,
        velocity: 0.7
      });
    }
  }
  
  return {
    name: "Metal Rhythm Guitar",
    notes: riff,
    type: "riff"
  };
};

export const generateMetalLead = (bars) => {
  // Minor pentatonic scale (typical for metal solos)
  const scaleNotes = ['E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'G5', 'A5'];
  const lead = [];
  
  // Create more sporadic, intense lead patterns
  for (let i = 0; i < bars * 4; i++) {
    // Fast runs
    if (i % 4 === 0 && Math.random() > 0.6) {
      // Create a fast run of 4-8 notes
      const runLength = Math.floor(Math.random() * 4) + 4;
      for (let j = 0; j < runLength; j++) {
        lead.push({
          note: scaleNotes[Math.floor(Math.random() * scaleNotes.length)],
          duration: '16n',
          time: i * 0.5 + (j * 0.125),
          velocity: 0.8
        });
      }
      i += 1; // Skip ahead a bit after a run
    } else if (Math.random() > 0.7) {
      // Sustained bend-like notes
      lead.push({
        note: scaleNotes[Math.floor(Math.random() * scaleNotes.length)],
        duration: '2n',
        time: i * 0.5,
        velocity: 0.85
      });
      i += 1; // Skip ahead for sustained note
    } else if (Math.random() > 0.5) {
      // Regular notes
      lead.push({
        note: scaleNotes[Math.floor(Math.random() * scaleNotes.length)],
        duration: '8n',
        time: i * 0.5,
        velocity: 0.8
      });
    }
  }
  
  return {
    name: "Metal Lead Guitar",
    notes: lead,
    type: "lead"
  };
};

export const generateMetalDrums = (bars) => {
  const drumSounds = {
    kick: 'C1',
    snare: 'E1',
    hihat: 'G#1', 
    crash: 'A#1',
    ride: 'D#2',
    tom1: 'F1',
    tom2: 'G1'
  };
  
  const drums = [];
  
  // Create a metal drum pattern
  for (let i = 0; i < bars * 4; i++) {
    // Kick drum - double bass patterns
    if (i % 2 === 0) { // Downbeats
      drums.push({
        note: drumSounds.kick,
        duration: '8n',
        time: i * 0.5,
        velocity: 0.9
      });
      
      // Double bass on even measures
      if (i % 8 < 4 && Math.random() > 0.3) {
        drums.push({
          note: drumSounds.kick,
          duration: '8n',
          time: i * 0.5 + 0.25, // Quarter note = 0.5s, 8th note = 0.25s
          velocity: 0.85
        });
      }
    }
    
    // Snare on 2 and 4
    if (i % 4 === 1 || i % 4 === 3) {
      drums.push({
        note: drumSounds.snare,
        duration: '4n',
        time: i * 0.5,
        velocity: 0.8
      });
    }
    
    // Hi-hat or ride
    for (let j = 0; j < 2; j++) { // 8th notes
      drums.push({
        note: i % 8 < 4 ? drumSounds.hihat : drumSounds.ride,
        duration: '8n',
        time: i * 0.5 + (j * 0.25),
        velocity: 0.6 + (j === 0 ? 0.1 : 0) // Accent on downbeats
      });
    }
    
    // Crash on first beat of phrases
    if (i % 8 === 0) {
      drums.push({
        note: drumSounds.crash,
        duration: '2n',
        time: i * 0.5,
        velocity: 0.9
      });
    }
    
    // Fill at the end of phrases
    if ((i + 1) % 16 === 0) {
      // Add tom fills
      for (let j = 0; j < 4; j++) { // Fill with tom hits
          drums.push({
            note: Math.random() > 0.5 ? drumSounds.tom1 : drumSounds.tom2,
            duration: '16n',
            time: i * 0.5 + (j * 0.125),
            velocity: 0.8
          });
      }
    }
  }
  
  return {
    name: "Metal Drums",
    notes: drums,
    type: "drums"
  };
};