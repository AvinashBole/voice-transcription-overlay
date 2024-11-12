const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
    // Create a transparent, frameless window that can float on top
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

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Hide the window initially
    mainWindow.hide();

    // Register global shortcut (Cmd+Shift+V or Ctrl+Shift+V)
    globalShortcut.register('CommandOrControl+Shift+V', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            // Position window near cursor
            const { screen } = require('electron');
            const cursor = screen.getCursorScreenPoint();
            mainWindow.setPosition(cursor.x + 20, cursor.y + 20);
            mainWindow.show();
        }
    });
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

// Handle transcription request
ipcMain.on('start-transcription', (event) => {
    const whisperPath = '/Users/avinbole/claude-computer-use-macos/venv/bin/whisper';
    const audioFile = path.join(__dirname, 'whisper', 'testlongpassage.m4a');
    const command = `${whisperPath} "${audioFile}" --model turbo`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            event.sender.send('transcription-error', error.message);
            return;
        }
        
        // Read the generated txt file
        const txtFile = path.join(__dirname, 'testlongpassage.txt');
        const fs = require('fs');
        fs.readFile(txtFile, 'utf8', (err, data) => {
            if (err) {
                event.sender.send('transcription-error', err.message);
                return;
            }
            event.sender.send('transcription-complete', data.trim());
            
            // Clean up the txt file
            fs.unlink(txtFile, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        });
    });
});

// Clean up shortcuts when quitting
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
