import React, { useState, useCallback } from 'react';
import MelodyItem from './MelodyItem';
import useAudioContext from '../hooks/useAudioContext';
import { durationToSeconds, notesToMIDI } from '../utils/audioUtils';
import { 
  generateSynthwaveDiscoBassline, 
  generateSynthwaveDiscoArpeggio, 
  generateSynthwaveDiscoLead,
  generateMetalRiff,
  generateMetalLead,
  generateMetalDrums 
} from '../utils/generators';

const MIDIGenerator = () => {
  const [melodies, setMelodies] = useState([]);
  const [playingMelodies, setPlayingMelodies] = useState({});
  const [barLength, setBarLength] = useState(16);
  const [selectedMelodies, setSelectedMelodies] = useState({});
  const [selectedStyle, setSelectedStyle] = useState("synthwave-disco");
  
  const { playNote, stopAllOscillators } = useAudioContext();
  
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
    stopAllOscillators();
    setPlayingMelodies({});
  };
  
  // Download as MIDI
  const downloadMIDI = useCallback((melody) => {
    try {
      const midiData = notesToMIDI(melody);
      if (midiData === '#') {
        return;
      }
      
      const link = document.createElement('a');
      link.href = midiData;
      link.download = `${melody.name.replace(/\s+/g, '_')}.mid`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error creating MIDI:', error);
      alert('There was an error creating the MIDI file. Please try again.');
    }
  }, []);
  
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
      
      {melodies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Melodies</h2>
          
          <div className="flex items-center space-x-4 mb-2">
            <button 
              onClick={selectAllMelodies}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Select All
            </button>
            <button 
              onClick={deselectAllMelodies}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Deselect All
            </button>
          </div>
          
          {melodies.map((melody, index) => (
            <MelodyItem
              key={index}
              melody={melody}
              index={index}
              barLength={barLength}
              isPlaying={!!playingMelodies[index]}
              isSelected={!!selectedMelodies[index]}
              onToggleSelect={() => toggleMelodySelection(index)}
              onPlay={() => playSingleMelody(index)}
              onDownload={() => downloadMIDI(melody)}
            />
          ))}
          
          <div className="mt-6 text-sm text-gray-600">
            <p>Note: This is a simplified MIDI generator. For professional production, you might want to use a more sophisticated MIDI tool or DAW.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MIDIGenerator;