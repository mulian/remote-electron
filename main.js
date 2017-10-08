const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// In main process.
const {ipcMain} = require('electron')

let evnt
ipcMain.on('welcome', (event, arg) => {
  // console.log(arg)  // prints "ping"
  // event.sender.send('asynchronous-reply', 'pong')
  console.log("welcome!");
  evnt = event
})

// ipcMain.on('synchronous-message', (event, arg) => {
//   console.log(arg)  // prints "ping"
//   event.returnValue = 'pong'
//   evnt = event
// })
ipcMain.on('get-page', (event, arg) => {
  evnt.sender.send('set-page', 'https://www.amazon.de/');
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

app.commandLine.appendSwitch('widevine-cdm-path', '/Applications/Google\ Chrome.app/Contents/Versions/61.0.3163.91/Google\ Chrome\ Framework.framework/Versions/A/Libraries/WidevineCdm/_platform_specific/mac_x64/widevinecdmadapter.plugin')
// The version of plugin can be got from `chrome://plugins` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '1.4.8.1008')

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800, height: 600,
    fullscreenable: true,
    webPreferences: {
      // The `plugins` have to be enabled.
      plugins: true
    }
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var externApp = require('express')();
var http = require('http').Server(externApp);

// externApp.use/routes/etc...

var server    = http.listen(3000, function(){
  console.log('listening on *:3000');
});
var io        = require('socket.io').listen(server);

externApp.get('/', function(req, res){
  res.sendFile(__dirname + '/extern.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('connection')
  evnt.sender.send('getDuration');
  evnt.sender.send('getVolume');
  socket.on('url-change',function(url) {
    console.log(url);
    evnt.sender.send('set-page', url);
  })
  socket.on('media',function(type,arg0) {
    console.log("media",type,arg0);
    // if(type=='fullScreen') {
    //   if(win.isFullScreen()) win.setFullScreen(false);
    //   else win.setFullScreen(true);
    // }
    evnt.sender.send('media', type,arg0);
  })
  socket.on('widevine-cdm-path', function(path) {
    app.commandLine.appendSwitch('widevine-cdm-path',path);
  })
  socket.on('widevine-cdm-version', function(version) {
    app.commandLine.appendSwitch('widevine-cdm-version',version);
  })

  ipcMain.on('media-time', (event, time) => {
    socket.emit('media-time',time)
  });
  ipcMain.on('media-duration', (event, duration) => {
    socket.emit('media-duration',duration)
  });
  ipcMain.on('media-volume', (event, volume) => {
    socket.emit('media-volume',volume)
  });


});
