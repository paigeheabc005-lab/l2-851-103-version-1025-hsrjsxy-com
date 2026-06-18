(function(){
function setup(box){
var video=box.querySelector('video');
var button=box.querySelector('.play-trigger');
if(!video||!button)return;
var ready=false;
function attach(){
if(ready)return;
var src=video.getAttribute('data-stream');
if(!src)return;
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({maxBufferLength:30,enableWorker:true});hls.loadSource(src);hls.attachMedia(video);box._hls=hls}else{video.src=src}
ready=true;
}
function start(){attach();box.classList.add('is-active');button.style.display='none';var p=video.play();if(p&&p.catch){p.catch(function(){button.style.display='grid'})}}
button.addEventListener('click',start);
box.addEventListener('click',function(e){if(e.target===video&&video.paused)start()});
video.addEventListener('play',function(){box.classList.add('is-active');button.style.display='none'});
video.addEventListener('pause',function(){if(video.currentTime<0.2){button.style.display='grid'}});
}
document.querySelectorAll('[data-player]').forEach(setup);
})();