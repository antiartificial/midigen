// --- SYNTHWAVE & ITALIAN DISCO STYLE ---
export const generateSynthwaveDiscoBassline = (bars) => {
  const notes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'];
  const rhythm = [
    '4n', '4n', '8n', '8n', '4n', '4n',
    '8n', '8n', '8n', '8n', '4n', '4n'
  ];
  
  const bassline = [];
  for (let i = 0; i < bars * 4; i++) {
    // Disco typically has strong bass on 1 and 3
    if (i % 4 === 0 || i % 4 === 2) {
      bassline.push({
        note: notes[Math.floor(Math.random() * 3)],
        duration: '4n',
        time: i * 0.5 // Each quarter note is 0.5 seconds at 120 BPM
      });
    } else if (Math.random() > 0.3) {
      bassline.push({
        note: notes[Math.floor(Math.random() * notes.length)],
        duration: rhythm[Math.floor(Math.random() * rhythm.length)],
        time: i * 0.5
      });
    }
  }
  
  return {
    name: "Disco Bassline",
    notes: bassline,
    type: "bass"
  };
};

export const generateSynthwaveDiscoArpeggio = (bars) => {
  const notes = ['E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
  const arpeggio = [];
  
  // Create a synthwave style arpeggio pattern
  for (let i = 0; i < bars * 4; i++) {
    for (let j = 0; j < 4; j++) { // 16th notes
      if (Math.random() > 0.3) {
        arpeggio.push({
          note: notes[Math.floor(Math.random() * notes.length)],
          duration: '16n',
          time: (i * 0.5) + (j * 0.125) // Quarter note = 0.5s, 16th note = 0.125s
        });
      }
    }
  }
  
  return {
    name: "Synthwave Arpeggio",
    notes: arpeggio,
    type: "arpeggio"
  };
};

export const generateSynthwaveDiscoLead = (bars) => {
  const scaleNotes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'];
  const lead = [];
  
  // Italian disco lead melody style
  for (let i = 0; i < bars * 4; i++) {
    // Create more space in the lead melody
    if (Math.random() > 0.4) {
      const noteDuration = ['2n', '4n', '4n.'][Math.floor(Math.random() * 3)];
      lead.push({
        note: scaleNotes[Math.floor(Math.random() * scaleNotes.length)],
        duration: noteDuration,
        time: i * 0.5
      });
      
      // Skip ahead based on the duration
      if (noteDuration === '2n') {
        i += 1; // Skip an extra quarter note
      } else if (noteDuration === '4n.') {
        // Skip a bit less for dotted quarter
      }
    }
  }
  
  return {
    name: "Italian Disco Lead",
    notes: lead,
    type: "lead"
  };
};