const {ipcMain} = require('electron')
const path = require('path');

const {getServerIpAddresses} = require('./server-ip')

var externApp = require('express')();
var http = require('http').Server(externApp);

const port = 3000;
let server    = http.listen(port, function(){
  let list = getServerIpAddresses();
  console.log("Extern HTTP Server listen on:");
  for(item of list) {
    console.log("  "+item.ifname+": http://"+item.address+":"+port+"/");
  }
});
let io = require('socket.io').listen(server);

let event, sockets = [];
module.exports = {
  setEvent: function(evnt) {
    event = evnt;

    for(obj of sockets) {
      if(!obj.isStarted) {
        init(obj.socket);
        obj.isStarted = true;
      }
    }
  },
}

externApp.get('/', function(req, res){
  res.sendFile(path.resolve(__dirname + '/../client/extern/index.html'));
});

function init(socket) {
  function getCurrentState() {
    event.sender.send('getDuration');
    event.sender.send('getVolume');
  }
  console.log('a user connected');
  socket.emit('connection')
  getCurrentState();

  socket.on('url-change',function(url) {
    console.log(url);
    event.sender.send('set-page', url);
  })
  socket.on('media',function(type,arg0,arg1) {
    // console.log("media",type,arg0);
    event.sender.send('media', type,arg0,arg1);
    // if(type=='fullScreen') {
    //   if(win.isFullScreen()) win.setFullScreen(false);
    //   else win.setFullScreen(true);
    // }
  })
  socket.on('widevine', function(type,path) {
    if(type=='cdm-path') app.commandLine.appendSwitch('widevine-cdm-path',path);
    else if (type=='cdm-version') app.commandLine.appendSwitch('widevine-cdm-version',version);
  })

  ipcMain.on('media-info', (event, info) => {
    socket.emit('media-info',info)
  });
}
io.on('connection', function(socket){
  let obj = {
    socket: socket,
    isStarted: false,
  }
  if(event!=undefined) {
    init(socket);
    obj.isStarted = true;
  }
  sockets.push(obj);
});
