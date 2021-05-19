import { app, BrowserWindow, globalShortcut, screen, Tray, Menu } from 'electron'
import {
  BrowserWindowConstructorOptions,
  HandlerDetails,
} from 'electron/renderer'
const { ipcMain } = require('electron')
const path = require('path');
declare const MAIN_WINDOW_WEBPACK_ENTRY: any

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

// Global var definitions
let sentinelWindow;
let tray;

// "State" to manage blur handling and avoid toggling conflicts
let toggleInProgress = false;

// Create window for creating sentinel and children BrowserWindows
const createSentinelWindow = (): void => {
  // Sentinel Window to handle the children windows
    sentinelWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        minWidth: 0,
        minHeight: 0,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
          nativeWindowOpen: true,
        },
        show: false,
  })

  // Load index.html entrypoint defined by webpack
  sentinelWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  
  // Open the DevTools.
  //sentinelWindow.webContents.openDevTools()

  // Handle instantiation of child browserwindows
  // Properties of these windows defined here
  sentinelWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {

    const display = screen.getPrimaryDisplay()
    const maxiSize = display.workAreaSize
    switch (details.frameName) {
      case ('SETTINGS'):
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 900,
            height: 500, 
            frame: false,
            show: false,
            parent: sentinelWindow,
            title: 'SETTINGS'
          },
        }
      case ('COMMAND'):
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            frame: false,
            height: maxiSize.height,
            width: maxiSize.width,
            parent: sentinelWindow,
            transparent: true,
            show: true,
            title: 'COMMAND',
            movable: true,
            resizable: false,
            ///backgroundColor: "#DDDDDD",
          },
        }
    }
  })

  // Tray Created
  createTray()
  
}

// Build the tray and context menus
const createTray = () => {
  // Handle Tray and Menus
  let logoPath = path.join(app.getAppPath(), '/src/content/smallTrayLogo.png')
  tray = new Tray(logoPath)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Settings', type: 'normal', click: () => windowDisplayHandler(false, 'SETTINGS')},
    { label: 'Commander', type: 'normal', click: () => windowDisplayHandler(false, 'COMMAND') },
  ])
  tray.setToolTip('Ability')
  tray.setContextMenu(contextMenu)
}

/// -------------------------- APP EVENT HANDLERS -------------------- ///

// Setup when app launches
app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+T', () => {
    keyboardShortcutHandler()
  })
  
}).then(createSentinelWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createSentinelWindow()
  }
})

/// CURRENTLY NOT PLANNING TO IMPLEMENT THIS 

// Hide all windows when we lose focus (only relevant for command line when they are using two monitors)
/* app.on('browser-window-blur', (event, window) => {
  const childWindows = sentinelWindow.getChildWindows()

  if (!toggleInProgress) {
    for (let window of childWindows) {
      window.hide()
    }

    sentinelWindow.webContents.send('clear-command-line')
  }
}) */



/// ------------------------- IPC LISTENERS ------------------------ ///

// Handles toggling between the various child BrowserWindows
ipcMain.on('toggle-event', (event, payload) => {
  
  windowDisplayHandler(false, payload[1])
  
})

// Fired by react after a slight delay to avoid race condition with blur handling
ipcMain.on('resolve-toggle-event', () => {
  toggleInProgress=false
})

// Handles resizing; this is finicky right now 
// and we need to get the view css working right to finalize
/* ipcMain.on('settings-resize', (event, payload) => {
  const childWindows = sentinelWindow.getChildWindows()
  var commandWindow = childWindows.find(window => {
    return window.title === 'COMMAND'
  })

  // some approximate calculation for resizing based on # autocompletes shown
  const newHeight = 85 + payload[0]*55 
  
  //commandWindow.setSize(680, newHeight)
}) */

ipcMain.on('command-line-native-blur', () => {  
  windowDisplayHandler(true) 
})



/// ----------------------------- OTHER METHODS ------------------- ///

// Handles global key shortcuts (incomplete, will add parametrized behavior)
function keyboardShortcutHandler() {
  windowDisplayHandler(false, 'COMMAND')

}


// Handles hiding and showing 
function windowDisplayHandler(hideAll: boolean, toShow?: string) {

  const childWindows = sentinelWindow.getChildWindows()

  if (hideAll) {
    for (let window of childWindows) {
      window.hide()
    }
  } else {
    for (let window of childWindows) {
      if (window.title === toShow) {
        window.show()
      } else {
        window.hide()
      }
    }
  }
}