(function () {
  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-button]');
    var started = false;
    var hls;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', attach);
    }
    if (button) {
      button.addEventListener('click', attach);
    }
    video.addEventListener('click', function () {
      if (!started) {
        attach();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
}());
