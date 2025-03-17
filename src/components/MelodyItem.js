import React from 'react';

const MelodyItem = ({ 
  melody, 
  index, 
  barLength, 
  isPlaying, 
  isSelected, 
  onToggleSelect, 
  onPlay, 
  onDownload 
}) => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`melody-${index}`}
            checked={isSelected}
            onChange={onToggleSelect}
            className="mr-3 h-4 w-4"
          />
          <h3 className="font-medium">{melody.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onPlay}
            className={`px-3 py-1 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm rounded`}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          <button 
            onClick={onDownload}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Download MIDI
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {melody.notes.length} notes, {barLength} bars
      </div>
      
      <div className="mt-2 h-16 bg-gray-100 rounded overflow-hidden relative">
        {melody.notes.map((note, i) => {
          // Simple visualization of the notes
          const noteIndex = note.note.charCodeAt(0) - 65; // A=0, B=1, etc.
          const octave = parseInt(note.note.slice(-1));
          const height = 4 + (noteIndex + (octave * 7)) % 12;
          
          return (
            <div 
              key={i}
              className={`absolute h-${height} w-2 rounded-sm ${melody.type === 'bass' ? 'bg-blue-500' : melody.type === 'arpeggio' ? 'bg-purple-500' : melody.type === 'lead' ? 'bg-pink-500' : melody.type === 'riff' ? 'bg-yellow-500' : melody.type === 'drums' ? 'bg-red-500' : 'bg-gray-500'}`}
              style={{
                left: `${(note.time / (barLength * 2)) * 100}%`, // 2 seconds per measure at 120 BPM
                bottom: '0',
                height: `${height * 6}%`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MelodyItem;