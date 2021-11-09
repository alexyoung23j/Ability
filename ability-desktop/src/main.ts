import {
  app,
  BrowserWindow,
  globalShortcut,
  screen,
  Tray,
  Menu,
  session,
  nativeImage,
} from 'electron';
import {
  BrowserWindowConstructorOptions,
  HandlerDetails,
} from 'electron/renderer';
const { ipcMain } = require('electron');
import path from 'path';
import os from 'os';
import fs from 'fs';

declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// TODO: This isnt fixing anyting
ipcMain.setMaxListeners(Infinity);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// Global var definitions
let sentinelWindow;
let tray;
let currentWindow = 'COMMAND';

// Create window for creating sentinel and children BrowserWindows
const createSentinelWindow = (): void => {
  // Sentinel Window to handle the children windows
  const display = screen.getPrimaryDisplay();
  const maxiSize = display.workAreaSize;

  // These are the default settings for the command view. May end up being something different in production
  sentinelWindow = new BrowserWindow({
    frame: false,
    height: maxiSize.height,
    width: maxiSize.width,
    transparent: true,
    show: true,
    title: 'COMMAND',
    movable: false,
    hasShadow: false,
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      nativeWindowOpen: true,
    },
  });

  // Load index.html entrypoint defined by webpack
  sentinelWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  sentinelWindow.webContents.openDevTools();

  //sentinelWindow.webContents.session.clearCache(() => {});

  // Make Transition a bit smoother between window views
  sentinelWindow.on('show', () => {
    setTimeout(() => {
      sentinelWindow.setOpacity(1);
    }, 100);
  });

  sentinelWindow.on('hide', () => {
    sentinelWindow.setOpacity(0);
  });

  // Tray Created
  createTray();
};

// Build the tray and context menus
const createTray = () => {
  // Handle Tray and Menus
  let trayIcon = nativeImage.createFromPath(
    path.join(app.getAppPath(), '/src/content/png/TrayIcon.png')
  );
  tray = new Tray(trayIcon.resize({ width: 15, height: 15 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      type: 'normal',
      click: () => openSettingsView(),
    },
    {
      label: 'Commander',
      type: 'normal',
      click: () => openCommandLine(),
    },
  ]);
  tray.setContextMenu(contextMenu);
};

/// -------------------------- APP EVENT HANDLERS -------------------- ///

// Setup when app launches
// TODO: set to only run this on DEBUG mode
const reactDevToolsFolderPath = path.join(
  os.homedir(),
  '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/'
);
const reactDevToolsPath = `${reactDevToolsFolderPath}${
  fs.readdirSync(reactDevToolsFolderPath)[0]
}`;

app
  .whenReady()
  // .then(() => {
  //   session.defaultSession.webRequest.onBeforeSendHeaders(
  //     (details, callback) => {
  //       details.requestHeaders['User-Agent'] = 'Chrome';
  //       callback({ cancel: false, requestHeaders: details.requestHeaders });
  //     }
  //   );
  // })
  .then(() => {
    globalShortcut.register('CommandOrControl+E', () => {
      keyboardShortcutHandler();
    });
  })
  // Uncomment this out to add React Dev Tools       <---------------------------------------------------- React Dev Tools ---------------------------------------------------->
  .then(async () => {
    await session.defaultSession.loadExtension(reactDevToolsPath);
  })
  .then(createSentinelWindow)
  .then(() => {
    const win = BrowserWindow.getAllWindows()[0];
    const ses = win.webContents.session;
    ses.clearStorageData();
  });

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createSentinelWindow();
  }
});

app.on('browser-window-blur', () => {
  sentinelWindow.hide();
  app.hide();
});

/// ------------------------- IPC LISTENERS ------------------------ ///

// Hide the Command Line
ipcMain.on('command-line-native-blur', () => {
  windowDisplayHandler('COMMMAND', true);
  sentinelWindow.hide();
  app.hide();
});

// Close the settings window (with a button)
ipcMain.on('close-settings', () => {
  sentinelWindow.hide();
  windowDisplayHandler('COMMAND', false);
  app.hide();
});

// Update our "state" to indicate the command line is currently in the sentinelWindow
ipcMain.on('command-showing', () => {
  currentWindow = 'COMMAND';
});

// Update our "state" to indicate the settings view is currently in the sentinelWindow
ipcMain.on('settings-showing', () => {
  currentWindow = 'SETTINGS';
});

ipcMain.on('open-settings', () => {
  openSettingsView();
});

ipcMain.on('set-tray-text', (event, message) => {
  tray.setTitle(message[0]);
});

/// ----------------------------- OTHER METHODS ------------------- ///

// Handles global key shortcuts (incomplete, will add parametrized behavior)
function keyboardShortcutHandler() {
  if (currentWindow == 'SETTINGS') {
    sentinelWindow.hide();
    windowDisplayHandler('COMMAND', false);
  } else {
    if (sentinelWindow.isVisible()) {
      //sentinelWindow.webContents.send('clear-command-line', 'keyboard shortcut triggered') TODO: Fix the bug that occurs when this is going
      sentinelWindow.hide();
      app.hide();
    } else {
      sentinelWindow.show();
    }
  }
}

// Open Command Line (wrapper for future implementation needs)
function openCommandLine() {
  windowDisplayHandler('COMMAND', true);
}

// Open Settings View (wrapper for future implementation needs)
function openSettingsView() {
  windowDisplayHandler('SETTINGS', true);
}

// Handles hiding and showing
function windowDisplayHandler(toShow: string, showAfterChanges) {
  const display = screen.getPrimaryDisplay();
  const maxiSize = display.workAreaSize;

  // Show Command Line and update window settings
  if (toShow === 'COMMAND') {
    sentinelWindow.webContents.send('show-command', 'display command line');
    sentinelWindow.setSize(maxiSize.width, maxiSize.height);
    sentinelWindow.setBounds({ x: 0, y: 0 });
    sentinelWindow.setResizable(false);
    sentinelWindow.setMovable(false);
    sentinelWindow.setHasShadow(false);

    // Show Settings and update window settings
  } else if (toShow === 'SETTINGS') {
    sentinelWindow.webContents.send('show-settings', 'display settings');
    sentinelWindow.setSize(maxiSize.width / 2, maxiSize.height);
    sentinelWindow.setBounds({ x: 0, y: 0 });
    sentinelWindow.setResizable(true);
    sentinelWindow.setMovable(true);
    sentinelWindow.setHasShadow(true);
    sentinelWindow.center();
  }

  // Show the window after changes (only relevant if window hidden before change)
  if (showAfterChanges) {
    sentinelWindow.show();
  }
}
