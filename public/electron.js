const { app, BrowserWindow, ipcMain, Menu, Tray, Notification } = require('electron');
const path = require("path")
const isDev = require("electron-is-dev")
const storage = require('electron-json-storage');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const Store = require('./store.js')
const isMac = process.platform === 'darwin'

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 1280, height: 800 },
    closeNotification: { notified: false }
  }
});

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
          { role: 'close' }
        ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Community Discussions',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://discord.gg/c8buYRK')
        }
      }
    ]
  }
];

let win
let tray = null

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

function createWindow() {
  let { width, height } = store.get('windowBounds');
  // Create the browser window.
  win = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
    },
    icon: path.join(__dirname, 'media/app-icons/icon_old.png')
  })

  // and load the index.html of the app.
  win.loadURL(
    isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`
  )

  win.on('closed', () => {
    win = null;
  });

  /** Open the DevTools.*/
  // win.webContents.openDevTools()

  win.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = win.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
  });

  let appCloseNotification = new Notification({
    title: "Optionlytics",
    body: "App is still running.",
    icon: path.join(__dirname, 'media/app-icons/icon_old.png')
  })

  win.on('close', (event) => {
    //When clicking the app close, the app is not closing, but hide, and working in the tray
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }

    //When app close, displaying window notification only once at first close
    let { notified } = store.get('closeNotification');
    if (!notified) {
      appCloseNotification.show();
      store.set('closeNotification', { notified: true })
    }
  })

  /**Tray actions of the app */
  tray = new Tray(path.join(__dirname, 'media/app-icons/icon_old.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Optionlytics', click: function () {
        win.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Optionlytics', click: function () {
        app.isQuiting = true;
        app.quit();
      }
    }
  ])
  tray.setToolTip('Optionlytics Desktop App')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    win.show();
  });
  /**End of the Tray actions */

  /**Custom Menu */
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  /**End of the Custom Menu */

  // if (!isDev) {
  //   autoUpdaterCheckForUpdate();
  // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore();
      if (tray !== null) win.show();
      setImmediate(function() {
        win.focus();
      });
    }
  })
  app.whenReady().then(createWindow);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  if (tray !== null) tray.destroy()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/**Automatically app start when system startup  */
// const appFolder = path.dirname(process.execPath)
// const updateExe = path.resolve(appFolder, '..', 'Update.exe')
// const exeName = path.basename(process.execPath)
// app.setLoginItemSettings({
//   openAtLogin: true,
//   openAsHidden: false,
//   path: process.execPath,
//   args: [
//     '--processStart', `"${exeName}"`,
//     '--process-start-args', `"--hidden"`
//   ]
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**IpcMain Process */
ipcMain.on('fetch-text-from-storage', (event, key) => {
  //Grab text from storage
  storage.getMany(key, function (error, data) {
    if (error) {
      win.send('handle-fetch-text-from-storage', {
        success: false,
        message: 'Text not returned',
        info: ''
      })
    };

    win.send('handle-fetch-text-from-storage', {
      success: true,
      message: 'Text returned',
      info: data,
    })
  });
})

ipcMain.on('save-text-in-storage', (event, key, arg) => {
  storage.set(key, arg, function (error) {
    if (error) {
      win.send('handle-save-text-in-storage', {
        success: false,
        message: 'Text not saved',
        saveinfo: ''
      })
    };
  });

  //Save text in storage
  win.send('handle-save-text-in-storage', {
    success: true,
    message: 'Saved',
    saveinfo: arg
  });

  if(key === 'accountinfo'){
    win.send('accountinfo', arg)
  }

  if(key === 'bybitHistory'){
    win.send('bybitHistory', arg)
  }

  if(key === 'binanceHistory'){
    win.send('binanceHistory', arg)
  }
})

ipcMain.on('fetch-bybit-history', (event, data) => {
  storage.get('bybitHistory', function (error, data) {
    win.send('bybitHistory', data)
  })
})

ipcMain.on('fetch-binance-history', (event, data) => {
  storage.get('binanceHistory', function (error, data) {
    win.send('binanceHistory', data)
  })
})

ipcMain.on('fetch-version-info', (event, data) => {
  /**Send version info */
  let appVersion = app.getVersion();
  win.send('handle-version-info', appVersion);
  /**End of version info */
})


//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });

// function autoUpdaterCheckForUpdate(){
//   autoUpdater.checkForUpdates();
//   setTimeout(autoUpdaterCheckForUpdate, 1000*60*10)
// }

// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...');
// });
// autoUpdater.on('update-available', (info) => {
//   sendStatusToWindow('Update available.');
//   win.webContents.send('new-version-available', info.version)
// });
// autoUpdater.on('update-not-available', (info) => {
//   sendStatusToWindow('Update not available.');
// });
// autoUpdater.on('error', (err) => {
//   sendStatusToWindow('Error in auto-updater. ' + err);
// });
// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + progressObj.percent.toFixed(2) + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   sendStatusToWindow(log_message);
// });
// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   sendStatusToWindow('Update downloaded');
//   win.webContents.send('new-version-update-downloaded', 'Update downloaded')
// });

// ipcMain.on('new-version-install', (event, data) => {
//   autoUpdater.quitAndInstall();
//   app.exit();
// });