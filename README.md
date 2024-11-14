# Voice Transcription Overlay

A system-wide floating overlay app that uses OpenAI's Whisper to transcribe voice input in real-time. The app can be triggered from anywhere using a global shortcut.

## Features

- Global shortcut (Cmd+Shift+V on macOS) to show floating window
- Real-time voice recording with visual feedback
- Uses OpenAI's Whisper (turbo model) for accurate transcription
- Copies transcribed text to clipboard automatically
- Draggable, transparent overlay window
- Always-on-top functionality

## Prerequisites

1. Node.js and npm installed on your system
2. SoX (Sound eXchange) for audio recording:
   ```bash
   brew install sox
   ```
3. OpenAI Whisper installed on your system
4. macOS

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voice-transcription-overlay.git
cd voice-transcription-overlay
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the App

1. Start the Electron app:
```bash
npm start
```

The app will run in the background. You won't see a window initially, but you can:
- Press Cmd+Shift+V to show the floating overlay window
- Click "Start Recording" to begin voice recording
- Click "Stop Recording" when done
- The transcribed text will be automatically copied to your clipboard
- Press Cmd+V to paste the transcribed text anywhere

## Usage Tips

1. Position the overlay window by dragging it anywhere on the screen
2. The window will automatically hide after successful transcription
3. You can close the window at any time using the × button
4. The timer shows your current recording duration
5. Status messages will keep you informed of the current process

## Development

The app is built with:
- Electron for the desktop application
- OpenAI Whisper for audio transcription
- SoX (Sound eXchange) for audio capture

Main files:
- `main.js`: Electron main process, handles recording and transcription
- `index.html`: UI implementation and renderer process
- `package.json`: Project configuration and dependencies

## Troubleshooting

If you encounter issues:
1. Ensure SoX is properly installed: `brew install sox`
2. Ensure Whisper is properly installed on your system
3. Verify your system has permission to access the microphone
4. Make sure the Whisper model path in main.js matches your installation

## License

MIT
