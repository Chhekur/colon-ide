const electron = require('electron')
global.autoUpdater = require("electron-updater").autoUpdater;
const log = require('electron-log');
const dialog = require('electron').dialog;
const ProgressBar = require('electron-progressbar');

let updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false
let progr = 0
let progressBar;
global.isUpdatCallFromMenu = false;
// console.log(electron)
// Module to control application life.
global.app = electron.app

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.mainWindow
function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 800, height: 600})
	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/views/editor.html'),
		protocol: 'file:',
		slashes: true
	}))
	// Open the DevTools.
	mainWindow.webContents.openDevTools()
	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
  require('./menu/menu.js');
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
	let promise = new Promise(function(resolve,reject){
		createWindow();
		setTimeout(function(){
			resolve();
		},500);
	}).then(function(){
		if(process.argv[1] != undefined){
			// dialog.showMessageBox({
		 //      	title:'argv',
		 //      	message:process.argv[1].toString()
		 //      });
		 //      console.log(process.argv);
      		require('./menu/functions.js').openDoubleClickFile(process.argv[1]);
      	}
  	});
    // autoUpdater.checkForUpdatesAndNotify();
      autoUpdater.checkForUpdates();
      
})
// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})


// auto update


// autoUpdater.on('checking-for-update', () => {
//   console.log('Checking for update...');
// })
// autoUpdater.on('update-available', (info) => {
//   console.log('Update available.');
// })
// autoUpdater.on('update-not-available', (info) => {
//   console.log('Update not available.');
// })
// autoUpdater.on('error', (err) => {
//   console.log('Error in auto-updater. ' + err);
// })

// progress bar
function progress(progressBar){
  progressBar
      .on('completed', function() {
        console.info(`completed...`);
        progressBar.detail = 'Task completed. Exiting...';
      })
      .on('aborted', function(value) {
        console.info(`aborted... ${value}`);
      })
      .on('progress', function(value) {
        progressBar.detail = `Value ${value} out of ${progressBar.getOptions().maxValue}...`;
      });
      if(!progressBar.isCompleted()){
        progressBar.value = progr;
      }
  }



// auto updates


autoUpdater.on('error', (error) => {
  console.log(error)
  // dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();
        progressBar = new ProgressBar({
        indeterminate: false,
        text: 'Preparing data...',
        detail: 'Wait...'
      });
    }
  })
})

autoUpdater.on('update-not-available', () => {
  if(isUpdatCallFromMenu){
    dialog.showMessageBox({
      title: 'No Updates',
      message: 'Current version is up-to-date.'
    })
  }
  // updater.enabled = true
  // updater = null
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

autoUpdater.on('download-progress', (progressObj) => {
    progr = progressObj.percent;
    progress(progressBar);
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
});

