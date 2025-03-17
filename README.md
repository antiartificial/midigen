# MIDI Generator App

A web application for generating MIDI melodies in different musical styles.

## Features

- Generate melodies in different musical styles (80s Synthwave & Italian Disco, Metal)
- Customize the length of melodies (8, 16, 32 bars)
- Select and play individual melodies or combinations
- Download melodies as MIDI files
- Visual representation of generated melodies

## Available Styles

1. **80s Synthwave & Italian Disco**
   - Disco Bassline
   - Synthwave Arpeggio
   - Italian Disco Lead

2. **Metal**
   - Metal Rhythm Guitar (with power chords)
   - Metal Lead Guitar
   - Metal Drums

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine

### Installation

1. Navigate to the project directory:
   ```
   cd midigen
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How to Use

1. Select a musical style and bar length
2. Click "Generate Melodies" to create new melodies
3. Use the checkboxes to select which melodies you want to play
4. Click "Play Selected" to hear them together, or use individual Play buttons
5. Click "Download MIDI" to save any melody as a MIDI file

## Technologies Used

- React.js
- Tone.js (for audio synthesis and playback)
- TailwindCSS (for styling)

## Future Enhancements

- Add more musical styles
- Improve MIDI export functionality
- Add ability to edit melodies
- Implement more sophisticated sound synthesis
- Add chord progression controls