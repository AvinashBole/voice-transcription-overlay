# Voice Transcription Overlay

A system-wide floating overlay app that uses OpenAI's Whisper to transcribe audio files. The app can be triggered from anywhere using a global shortcut.

## Features

- Global shortcut (Cmd+Shift+V on macOS) to show floating window
- Uses OpenAI's Whisper (turbo model) for accurate transcription
- Copies transcribed text to clipboard automatically
- Draggable, transparent overlay window
- Always-on-top functionality

## Prerequisites

- Node.js and npm
- OpenAI Whisper installed in a Python virtual environment at `/Users/avinbole/claude-computer-use-macos/venv/bin/whisper`
- macOS (for afrecord functionality)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voice-transcription-overlay.git
cd voice-transcription-overlay
```

2. Install dependencies:
```bash
npm install
```

3. Start the app:
```bash
npm start
```

## Usage

1. Press Cmd+Shift+V (macOS) to show the floating window
2. Click "Start Transcription" to process the audio file
3. The transcribed text will be automatically copied to your clipboard
4. Paste anywhere using Cmd+V

## Development

The app is built with:
- Electron for the desktop application
- OpenAI Whisper for audio transcription

Main files:
- `main.js`: Electron main process
- `index.html`: UI implementation
- `package.json`: Project configuration and dependencies

## License

MIT
