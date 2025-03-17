/**
 * MIDI Utilities for creating standard-compliant MIDI files
 * Based on the standard MIDI file format specification:
 * https://www.music.mcgill.ca/~ich/classes/mumt306/StandardMIDIfileformat.html
 */

// MIDI Status Bytes
const NOTE_OFF = 0x80;
const NOTE_ON = 0x90;
const PROGRAM_CHANGE = 0xC0;

// Meta Event Types
const META_EVENT = 0xFF;
const META_TRACK_NAME = 0x03;
const META_TEMPO = 0x51;
const META_END_OF_TRACK = 0x2F;

/**
 * Convert a number to a variable-length quantity (VLQ) used in MIDI files
 * @param {Number} num - Number to convert
 * @returns {Array} - Array of bytes representing the VLQ
 */
function numberToVLQ(num) {
  if (num < 0) {
    throw new Error("Cannot convert negative numbers to VLQ");
  }

  if (num < 128) {
    return [num];
  }

  const bytes = [];
  let value = num;

  // Extract 7-bit values from the least significant to most significant
  while (value > 0) {
    // Take the 7 least significant bits and add to the beginning of the array
    bytes.unshift(value & 0x7F);
    // Shift right by 7 bits
    value = value >> 7;
  }

  // Set the continuation bit (bit 7) for all except the last byte
  for (let i = 0; i < bytes.length - 1; i++) {
    bytes[i] |= 0x80;
  }

  return bytes;
}

/**
 * Create a MIDI header chunk
 * @param {Number} format - MIDI file format (0, 1, or 2)
 * @param {Number} numTracks - Number of tracks in the file
 * @param {Number} division - Time division (ticks per quarter note)
 * @returns {Uint8Array} - MIDI header chunk
 */
function createHeaderChunk(format, numTracks, division) {
  const chunk = new Uint8Array(14);
  const headerText = "MThd";
  
  // Write "MThd" header
  chunk[0] = headerText.charCodeAt(0);
  chunk[1] = headerText.charCodeAt(1);
  chunk[2] = headerText.charCodeAt(2);
  chunk[3] = headerText.charCodeAt(3);
  
  // Write chunk length (always 6 for header)
  chunk[4] = 0x00;
  chunk[5] = 0x00;
  chunk[6] = 0x00;
  chunk[7] = 0x06;
  
  // Write format (0, 1, or 2)
  chunk[8] = 0x00;
  chunk[9] = format;
  
  // Write number of tracks
  chunk[10] = (numTracks >> 8) & 0xFF;
  chunk[11] = numTracks & 0xFF;
  
  // Write division (ticks per quarter note)
  chunk[12] = (division >> 8) & 0xFF;
  chunk[13] = division & 0xFF;
  
  return chunk;
}

/**
 * Create a MIDI track chunk
 * @param {Array} events - Array of MIDI events
 * @returns {Uint8Array} - MIDI track chunk
 */
function createTrackChunk(events) {
  // First, calculate the size of the track data
  let trackDataSize = 0;
  
  for (const event of events) {
    // Add delta time VLQ size
    trackDataSize += numberToVLQ(event.deltaTime).length;
    
    // Add event data size
    trackDataSize += event.data.length;
  }
  
  // Create the track chunk with appropriate size
  const chunkData = new Uint8Array(8 + trackDataSize);
  const trackText = "MTrk";
  
  // Write "MTrk" header
  chunkData[0] = trackText.charCodeAt(0);
  chunkData[1] = trackText.charCodeAt(1);
  chunkData[2] = trackText.charCodeAt(2);
  chunkData[3] = trackText.charCodeAt(3);
  
  // Write chunk length (size of the track data)
  chunkData[4] = (trackDataSize >> 24) & 0xFF;
  chunkData[5] = (trackDataSize >> 16) & 0xFF;
  chunkData[6] = (trackDataSize >> 8) & 0xFF;
  chunkData[7] = trackDataSize & 0xFF;
  
  // Write track data
  let offset = 8;
  
  for (const event of events) {
    // Write delta time
    const deltaTimeBytes = numberToVLQ(event.deltaTime);
    for (const byte of deltaTimeBytes) {
      chunkData[offset++] = byte;
    }
    
    // Write event data
    for (const byte of event.data) {
      chunkData[offset++] = byte;
    }
  }
  
  return chunkData;
}

/**
 * Convert a melody to a standard MIDI file
 * @param {Object} melody - Melody object with notes
 * @returns {String} - Data URI containing the MIDI file
 */
export function melodyToMIDI(melody) {
  // Use 128 ticks per quarter note for good resolution
  const TICKS_PER_QUARTER = 128;
  
  // Create an array of MIDI events with proper delta times
  const midiEvents = [];
  
  // Add track name event (delta time 0)
  const trackNameEvent = {
    deltaTime: 0,
    data: [
      META_EVENT, 
      META_TRACK_NAME,
      ...numberToVLQ(melody.name.length),
      ...Array.from(melody.name).map(char => char.charCodeAt(0))
    ]
  };
  midiEvents.push(trackNameEvent);
  
  // Add tempo event (120 BPM = 500,000 microseconds per quarter note)
  const tempoEvent = {
    deltaTime: 0,
    data: [META_EVENT, META_TEMPO, 0x03, 0x07, 0xA1, 0x20] // 500,000 in hex
  };
  midiEvents.push(tempoEvent);
  
  // Add program change event for instrument selection
  let instrument = 0; // Default piano
  
  // Choose an appropriate instrument based on melody type
  if (melody.type === 'bass') {
    instrument = 35; // Electric Bass
  } else if (melody.type === 'arpeggio') {
    instrument = 81; // Synth Lead
  } else if (melody.type === 'lead') {
    instrument = 82; // Synth Calliope
  } else if (melody.type === 'riff') {
    instrument = 30; // Distortion Guitar
  } else if (melody.type === 'drums') {
    instrument = 0; // Standard drum kit on channel 10
  }
  
  // Determine the MIDI channel (use channel 10 for drums, channel 1 for others)
  const channel = melody.type === 'drums' ? 9 : 0; // MIDI channels are 0-15, with 9 being drums (displayed as 10)
  
  const programChangeEvent = {
    deltaTime: 0,
    data: [PROGRAM_CHANGE | channel, instrument]
  };
  midiEvents.push(programChangeEvent);
  
  // Convert notes to Note On/Off events
  const noteEvents = [];
  
  // Function to convert note name to MIDI note number
  const noteToMIDINumber = (note) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    return notes.indexOf(noteName) + (octave + 1) * 12;
  };
  
  // Convert durations to ticks
  const durationToTicks = (duration) => {
    // Convert note durations to ticks (at 128 ticks per quarter note)
    switch(duration) {
      case '2n': return TICKS_PER_QUARTER * 2; // Half note
      case '4n': return TICKS_PER_QUARTER; // Quarter note
      case '4n.': return TICKS_PER_QUARTER * 1.5; // Dotted quarter note
      case '8n': return TICKS_PER_QUARTER / 2; // Eighth note
      case '16n': return TICKS_PER_QUARTER / 4; // Sixteenth note
      default: return TICKS_PER_QUARTER; // Default to quarter note
    }
  };
  
  // Process each note
  melody.notes.forEach(note => {
    const midiNote = noteToMIDINumber(note.note);
    const durationTicks = durationToTicks(note.duration);
    const startTick = Math.round(note.time * TICKS_PER_QUARTER * 2); // Convert time in seconds to ticks
    const velocity = Math.floor((note.velocity || 0.8) * 127); // Convert velocity to MIDI range (0-127)
    
    // Add Note On event
    noteEvents.push({
      tick: startTick,
      data: [NOTE_ON | channel, midiNote, velocity]
    });
    
    // Add Note Off event
    noteEvents.push({
      tick: startTick + durationTicks,
      data: [NOTE_OFF | channel, midiNote, 0]
    });
  });
  
  // Sort note events by tick time
  noteEvents.sort((a, b) => a.tick - b.tick);
  
  // Convert absolute ticks to delta times between events
  let lastTick = 0;
  
  for (const event of noteEvents) {
    const deltaTime = event.tick - lastTick;
    lastTick = event.tick;
    
    midiEvents.push({
      deltaTime: deltaTime,
      data: event.data
    });
  }
  
  // Add End of Track event
  midiEvents.push({
    deltaTime: 0,
    data: [META_EVENT, META_END_OF_TRACK, 0x00]
  });
  
  // Create MIDI file chunks
  const headerChunk = createHeaderChunk(0, 1, TICKS_PER_QUARTER); // Format 0, 1 track, 128 ticks per quarter note
  const trackChunk = createTrackChunk(midiEvents);
  
  // Combine chunks into a single MIDI file
  const midiFile = new Uint8Array(headerChunk.length + trackChunk.length);
  midiFile.set(headerChunk, 0);
  midiFile.set(trackChunk, headerChunk.length);
  
  // Convert to base64 for data URI
  let base64String = '';
  for (let i = 0; i < midiFile.length; i++) {
    base64String += String.fromCharCode(midiFile[i]);
  }
  
  return 'data:audio/midi;base64,' + btoa(base64String);
}

/**
 * Convert a String to UTF8 bytes
 * @param {String} str - String to convert
 * @returns {Array} - Array of bytes
 */
function stringToUTF8Bytes(str) {
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) {
      utf8.push(charCode);
    } else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 
                0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(0xe0 | (charCode >> 12), 
                0x80 | ((charCode>>6) & 0x3f), 
                0x80 | (charCode & 0x3f));
    } else {
      // surrogate pair
      i++;
      charCode = ((charCode & 0x3ff)<<10) | (str.charCodeAt(i) & 0x3ff) + 0x10000;
      utf8.push(0xf0 | (charCode >>18), 
                0x80 | ((charCode>>12) & 0x3f), 
                0x80 | ((charCode>>6) & 0x3f), 
                0x80 | (charCode & 0x3f));
    }
  }
  return utf8;
}