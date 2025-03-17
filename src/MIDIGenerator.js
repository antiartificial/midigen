  // Render the UI
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">MIDI Generator</h1>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm font-medium mb-2">
          Bars Length:
          <select 
            value={barLength} 
            onChange={(e) => setBarLength(parseInt(e.target.value))}
            className="ml-2 p-1 border rounded"
          >
            <option value={8}>8 Bars</option>
            <option value={16}>16 Bars</option>
            <option value={32}>32 Bars</option>
          </select>
        </label>
        
        <label className="block text-sm font-medium mb-2">
          Style:
          <select 
            value={selectedStyle} 
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="ml-2 p-1 border rounded"
          >
            <option value="synthwave-disco">80s Synthwave & Italian Disco</option>
            <option value="metal">Metal</option>
          </select>
        </label>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={generateMelodies}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Generate Melodies
        </button>
        
        <button 
          onClick={playMelodies}
          className={`px-4 py-2 ${isAnyPlaying() ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded`}
        >
          {isAnyPlaying() ? 'Stop All' : 'Play Selected'}
        </button>
      </div>
import React, { useState, useEffect, useRef } from 'react';

const MIDIGenerator = () => {
  const [melodies, setMelodies] = useState([]);
  const [playingMelodies, setPlayingMelodies] = useState({});
  const [barLength, setBarLength] = useState(16);
  const [selectedMelodies, setSelectedMelodies] = useState({});
  const [selectedStyle, setSelectedStyle] = useState("synthwave-disco");
  
  // Audio context
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  
  // Load MidiWriter.js script
  useEffect(() => {
    const loadMidiWriter = async () => {
      if (!window.MidiWriter) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/midi-writer-js@2.1.4/browser/midi-writer-js.min.js';
        script.async = true;
        script.onload = () => {
          console.log('MidiWriter.js loaded successfully');
        };
        document.body.appendChild(script);
      }
    };
    
    loadMidiWriter();
  }, []);
  
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
  
  // Convert note to frequency
  const noteToFrequency = (note) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = parseInt(note.slice(-1));
    const noteName = note.slice(0, -1);
    const noteIndex = notes.indexOf(noteName);
    
    // A4 is 440 Hz
    return 440 * Math.pow(2, (noteIndex - 9) / 12 + (octave - 4));
  };
  
  // Play a note
  const playNote = (note, time, duration, velocity = 0.8) => {
    if (!audioContextRef.current) return;
    
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
  
  // Duration name to seconds
  const durationToSeconds = (duration) => {
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
  const notesToMIDI = (melody) => {
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
  
  // Style-specific melody generators
  
  // --- SYNTHWAVE & ITALIAN DISCO STYLE ---
  const generateSynthwaveDiscoBassline = (bars) => {
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
  
  const generateSynthwaveDiscoArpeggio = (bars) => {
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
  
  const generateSynthwaveDiscoLead = (bars) => {
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
  
  // --- METAL STYLE ---
  const generateMetalRiff = (bars) => {
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
  
  const generateMetalLead = (bars) => {
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
  
  const generateMetalDrums = (bars) => {
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
  
  // Check if any melody is currently playing
  const isAnyPlaying = () => Object.values(playingMelodies).some(p => p);
  
  // Toggle selection of a melody
  const toggleMelodySelection = (index) => {
    setSelectedMelodies(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // Select all melodies
  const selectAllMelodies = () => {
    const allSelected = {};
    melodies.forEach((_, index) => {
      allSelected[index] = true;
    });
    setSelectedMelodies(allSelected);
  };
  
  // Deselect all melodies
  const deselectAllMelodies = () => {
    setSelectedMelodies({});
  };
  
  // Check if any melodies are selected
  const anyMelodiesSelected = () => {
    return Object.values(selectedMelodies).some(selected => selected);
  };
  
  // Generate all melodies based on selected style
  const generateMelodies = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    let newMelodies = [];
    
    if (selectedStyle === "synthwave-disco") {
      newMelodies = [
        generateSynthwaveDiscoBassline(barLength),
        generateSynthwaveDiscoArpeggio(barLength),
        generateSynthwaveDiscoLead(barLength)
      ];
    } else if (selectedStyle === "metal") {
      newMelodies = [
        generateMetalRiff(barLength),
        generateMetalLead(barLength),
        generateMetalDrums(barLength)
      ];
    }
    
    setMelodies(newMelodies);
    
    // Select all melodies by default when generating new ones
    const allSelected = {};
    newMelodies.forEach((_, index) => {
      allSelected[index] = true;
    });
    setSelectedMelodies(allSelected);
    
    // Reset all playing states
    setPlayingMelodies({});
  };
  
  // Play selected melodies
  const playMelodies = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // If any melody is playing, stop all
    if (isAnyPlaying()) {
      stopAllMelodies();
      return;
    }
    
    // If no melodies are selected, select all of them
    if (!anyMelodiesSelected()) {
      selectAllMelodies();
    }
    
    // Mark all selected melodies as playing
    const nowPlaying = {};
    melodies.forEach((_, index) => {
      if (selectedMelodies[index]) {
        nowPlaying[index] = true;
      }
    });
    setPlayingMelodies(nowPlaying);
    
    // Play all selected melodies
    melodies.forEach((melody, index) => {
      if (selectedMelodies[index]) {
        melody.notes.forEach(note => {
          playNote(
            note.note,
            note.time,
            durationToSeconds(note.duration),
            note.velocity || 0.8
          );
        });
      }
    });
    
    // After playing, set playing back to false
    setTimeout(() => {
      setPlayingMelodies({});
    }, barLength * 4 * 500); // 500ms per beat at 120 BPM
  };
  
  // Play a single melody
  const playSingleMelody = (index) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // If this melody is already playing, stop it
    if (playingMelodies[index]) {
      stopAllMelodies();
      return;
    }
    
    // Mark this melody as playing
    setPlayingMelodies(prev => ({...prev, [index]: true}));
    
    // Play just this melody
    melodies[index].notes.forEach(note => {
      playNote(
        note.note,
        note.time,
        durationToSeconds(note.duration),
        note.velocity || 0.8
      );
    });
    
    // After playing, set playing back to false
    setTimeout(() => {
      setPlayingMelodies(prev => ({...prev, [index]: false}));
    }, barLength * 4 * 500); // 500ms per beat at 120 BPM
  };
  
  // Stop all playing melodies
  const stopAllMelodies = () => {
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
    
    setPlayingMelodies({});
  };
  
  // Download as MIDI
  const downloadMIDI = (melody) => {
    const midiData = notesToMIDI(melody);
    if (midiData === '#') {
      // MidiWriter not loaded yet
      return;
    }
    
    const link = document.createElement('a');
    link.href = midiData;
    link.download = `${melody.name.replace(/\s+/g, '_')}.mid`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };