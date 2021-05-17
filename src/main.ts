import { app, BrowserWindow, globalShortcut } from 'electron'
import {
  BrowserWindowConstructorOptions,
  HandlerDetails,
} from 'electron/renderer'
const { ipcMain } = require('electron')

declare const MAIN_WINDOW_WEBPACK_ENTRY: any

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit()
}

let sentinelWindow;
const createWindow = (): void => {
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

  // and load the index.html of the app.
  sentinelWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  sentinelWindow.webContents.openDevTools()

  sentinelWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    switch (details.frameName) {
      case ('SETTINGS'):
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 900,
            height: 500, 
            frame: true,
            show: false,
            parent: sentinelWindow,
            title: 'SETTINGS'
          },
        }
      case ('COMMAND'):
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            transparent: true,
            ///backgroundColor: "#DDDDDD",
            frame: false,
            width: 660,
            height: 85,
            parent: sentinelWindow,
            show: false,
            title: 'COMMAND',
            center:true,
            movable: true,
            resizable: false
          },
        }
    }
  })
}

function keyboardShortcutHandler() {
  const childWindows = sentinelWindow.getChildWindows()
  var commandWindow = childWindows.find(window => {
    return window.title === 'COMMAND'
  })

  var settingsWindow = childWindows.find(window => {
    return window.title === 'SETTINGS'
  })

  commandWindow.show()
  settingsWindow.hide()

}

// Setup when app launches
app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+T', () => {
    keyboardShortcutHandler()
  })
  
}).then(createWindow)

// Hide all windows when we lose focus
/* app.on('browser-window-blur', (event, window) => {
  console.log(event, window)
  const childWindows = sentinelWindow.getChildWindows()

  for (let window of childWindows) {
    window.hide()
  }

}) */


/// IPC LISTENERS

// Handles toggling between the various child BrowserWindows
ipcMain.on('toggle-event', (event, payload) => {
  const childWindows = sentinelWindow.getChildWindows()

  var windowToDisable = childWindows.find(window => {
    return window.title === payload[0]
  })

  var windowToEnable = childWindows.find(window => {
    return window.title === payload[1]
  })
  
  
  windowToDisable.hide()
  windowToEnable.show()
})

// Handles resizing; this is finicky right now 
// and we need to get the view css working right to finalize
ipcMain.on('settings-resize', (event, payload) => {
  const childWindows = sentinelWindow.getChildWindows()
  var commandWindow = childWindows.find(window => {
    return window.title === 'COMMAND'
  })

  // some approximate calculation for resizing based on # autocompletes shown
  const newHeight = 85 + payload[0]*55 
  
  commandWindow.setSize(680, newHeight)
})

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
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
