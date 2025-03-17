# MIDI Generator Directory Structure

The project has been split into the following structure to improve maintainability and readability:

```
midigen/
├── src/
│   ├── components/
│   │   ├── MIDIGenerator.js    # Main component
│   │   └── MelodyItem.js       # Component for displaying each melody
│   │
│   ├── hooks/
│   │   ├── useAudioContext.js  # Hook for audio-related functionality
│   │   └── useMIDIWriter.js    # Hook for MIDI file creation
│   │
│   ├── utils/
│   │   ├── audioUtils.js       # Utility functions for audio processing
│   │   └── generators/         # Melody generator functions
│   │       ├── index.js                  # Exports all generators
│   │       ├── synthwaveDiscoGenerators.js # Synthwave/Disco style generators
│   │       └── metalGenerators.js        # Metal style generators
│   │
│   ├── App.js                  # Main App component
│   ├── App.css                 # App styles
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
└── README.md                   # Project documentation
```

## Key Files and Their Responsibilities

### Components
- **MIDIGenerator.js**: The main component that handles the UI and coordinates melody generation, playback, and MIDI export
- **MelodyItem.js**: Reusable component for displaying individual melodies with play/stop, checkbox, and visualization

### Hooks
- **useAudioContext.js**: Custom hook that manages Web Audio API context, oscillators, and provides methods for playing notes
- **useMIDIWriter.js**: Manages loading and using the MidiWriter.js library

### Utilities
- **audioUtils.js**: Contains functions for converting notes to frequencies, note durations to seconds, and melodies to MIDI format
- **generators/**: Folder containing melody generator functions organized by musical style

## How to Run
1. Navigate to the project directory
2. Run `npm install` to install dependencies
3. Run `npm start` to launch the development server
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Adding New Styles
To add a new musical style:
1. Create a new file in `src/utils/generators/` (e.g., `jazzGenerators.js`)
2. Export it from `src/utils/generators/index.js`
3. Add the style option to the dropdown in `MIDIGenerator.js`
4. Add the melody generation logic for the new style