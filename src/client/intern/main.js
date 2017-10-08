// In renderer process (web page).
const { ipcRenderer } = require('electron')
const fs = require('fs')
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
ipcRenderer.send('welcome')

const webviewInject = fs.readFileSync(__dirname+'/webview-inject.js',{encoding:'utf8'})

ipcRenderer.on('set-page', (event, url) => {
  document.getElementById('page').src = url;
  console.log(url);
})

ipcRenderer.on('getDuration', (event) => {
  webview.executeJavaScript("console.log('duration:'+document.getElementsByTagName('video')[0].duration);")
})
ipcRenderer.on('getVolume', (event) => {
  webview.executeJavaScript("console.log('volume:'+document.getElementsByTagName('video')[0].volume)")
})


ipcRenderer.on('media', (event, type, arg0) => {
  // console.log("mediaControll."+type+"("+arg0+")");
  document.getElementById('page').executeJavaScript("mediaControll."+type+"("+arg0+")",true);
})
ipcRenderer.send('get-page')

function resizeBody() {
  document.getElementsByTagName('body')[0].style.height = (window.innerHeight - 3) + 'px';
}
let webview

function init() {
  resizeBody();

  webview = document.querySelector('webview')
  webview.addEventListener('console-message', (e) => {
    // console.log('Guest page logged a message:', e.message)
  })
  startWebViewConn();
}





function startWebViewConn() {
  let regTime = /time\:(.*)/
  let regDuration = /duration\:(.*)/
  let regVolume = /volume\:(.*)/

  webview.addEventListener('console-message', (e) => {
    // console.log(e.message);
    const channel = "media-info"
    if (regTime.test(e.message)) ipcRenderer.send(channel, {
      type: 'time',
      value: regTime.exec(e.message)[1]
    })
    else if (regDuration.test(e.message)) ipcRenderer.send(channel, {
      type: 'duration',
      value: regDuration.exec(e.message)[1]
    })
    else if (regVolume.test(e.message)) ipcRenderer.send(channel, {
      type: 'volume',
      value: regVolume.exec(e.message)[1]
    })
    // console.log('Time!', reg.exec(e.message)[1]);
  })
  webview.addEventListener('dom-ready', function(e) {
    webview.executeJavaScript(webviewInject,true);
  });
}
