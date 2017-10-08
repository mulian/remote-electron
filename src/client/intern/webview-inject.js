function getVideo() {
  return document.getElementsByTagName('video')[0];
}
function initListener() {
  vid.addEventListener('timeupdate',function(e) { console.log('time:'+e.target.currentTime); })
  vid.addEventListener('loadeddata', function(e) { console.log('duration:'+e.target.duration); }, false);
  vid.addEventListener('volumechange', function(e) { console.log('volume:'+e.target.volume) }, false);
}

window.vid = getVideo();

initListener();

window.mediaControll = {
  start: function() {
    vid.paused?vid.play():vid.pause();
  },
  fullScreen: function() {
    window.location.host=='www.youtube.com'?document.getElementsByClassName('ytp-fullscreen-button')[0].click():vid.webkitRequestFullScreen()
  },
  exitFullScreen: function() {
    window.location.host=='www.youtube.com'?document.getElementsByClassName('ytp-fullscreen-button')[0].click():document.getElementsByTagName('video')[0].webkitExitFullScreen()
  },
  mute: function() {
    if(vid.muted) vid.muted=false; else vid.muted=true;
  },
  setTime: function(time) {
    vid.currentTime=time;
  },
  addTime: function(time) {
    mediaControll.setTime(vid.currentTime+time);
  },
  skipAdYT: function() {
    document.getElementsByClassName('videoAdUiSkipButton')[0].click()
  },
  volume: function(vol) {
    if(vol>=0 && vol<=1) vid.volume=vol;
  },
  volumeAdd: function(vol) {
    mediaControll.volume(vid.volume+vol);
  }
}
