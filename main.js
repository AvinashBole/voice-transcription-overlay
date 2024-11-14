const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let recordProcess = null;
let currentRecordingFile = null;

// Debug directory in the user's home
const debugDir = path.join(os.homedir(), 'voiceapp-debug');
if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir);
}

function debugLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync(path.join(debugDir, 'debug.log'), logMessage);
    console.log(logMessage);
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.hide();

    globalShortcut.register('CommandOrControl+Shift+V', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            const { screen } = require('electron');
            const cursor = screen.getCursorScreenPoint();
            mainWindow.setPosition(cursor.x + 20, cursor.y + 20);
            mainWindow.show();
        }
    });

    debugLog('Window created and shortcuts registered');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle window hiding
ipcMain.on('hide-window', () => {
    mainWindow.hide();
});

// Handle start recording
ipcMain.on('start-recording', (event) => {
    // Create a debug recording file with timestamp
    const timestamp = Date.now();
    currentRecordingFile = path.join(debugDir, `recording-${timestamp}.wav`);
    debugLog(`Starting recording to file: ${currentRecordingFile}`);
    
    recordProcess = spawn('/opt/homebrew/Cellar/sox/14.4.2_5/bin/rec', [
        currentRecordingFile,  // Output file
        'rate', '16000',      // Sample rate
        'channels', '1',      // Mono audio
        'silence', '1', '0.1', '3%', '1', '3.0', '3%'  // Stop on silence
    ]);

    event.sender.send('recording-started');

    recordProcess.stdout.on('data', (data) => {
        debugLog(`rec stdout: ${data}`);
    });

    recordProcess.stderr.on('data', (data) => {
        debugLog(`rec stderr: ${data}`);
    });

    recordProcess.on('error', (error) => {
        debugLog(`Recording error: ${error.message}`);
        event.sender.send('recording-error', error.message);
    });

    recordProcess.on('exit', (code, signal) => {
        debugLog(`Recording process exited with code ${code} and signal ${signal}`);
    });
});

// Handle stop recording and transcribe
ipcMain.on('stop-recording', (event) => {
    if (recordProcess && currentRecordingFile) {
        debugLog('Stopping recording process');
        recordProcess.kill();
        
        debugLog(`Recording saved to: ${currentRecordingFile}`);
        
        // Check if the file exists and get its size
        fs.stat(currentRecordingFile, (err, stats) => {
            if (err) {
                debugLog(`Error checking recording file: ${err.message}`);
                event.sender.send('transcription-error', 'Recording file not found');
                return;
            }
            debugLog(`Recording file size: ${stats.size} bytes`);
            
            // Wait a bit for the file to be fully written
            setTimeout(() => {
                const whisperPath = '/Users/avinbole/claude-computer-use-macos/venv/bin/whisper';
                const command = `${whisperPath} "${currentRecordingFile}" --model turbo`;

                debugLog(`Starting transcription with command: ${command}`);
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        debugLog(`Transcription error: ${error.message}`);
                        debugLog(`Stderr: ${stderr}`);
                        event.sender.send('transcription-error', error.message);
                        return;
                    }
                    
                    debugLog(`Transcription stdout: ${stdout}`);
                    if (stderr) debugLog(`Transcription stderr: ${stderr}`);
                    
                    // Read the generated txt file
                    const txtFile = currentRecordingFile.replace('.wav', '.txt');
                    debugLog(`Reading transcription from: ${txtFile}`);
                    
                    fs.readFile(txtFile, 'utf8', (err, data) => {
                        if (err) {
                            debugLog(`Error reading transcription: ${err.message}`);
                            event.sender.send('transcription-error', err.message);
                        } else {
                            const transcription = data.trim();
                            debugLog(`Transcription result: "${transcription}"`);
                            event.sender.send('transcription-complete', transcription);
                        }
                        
                        // Keep the debug files for inspection
                        debugLog('Transcription process complete');
                    });
                });
            }, 1000);
        });

        recordProcess = null;
        currentRecordingFile = null;
    }
});

// Clean up shortcuts when quitting
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (recordProcess) {
        recordProcess.kill();
    }
    debugLog('Application shutting down');
});
