(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var box = document.querySelector('.player-box');
    if (!box) {
      return;
    }

    var video = box.querySelector('video');
    var mask = box.querySelector('.play-mask');
    var src = box.getAttribute('data-src');
    var hlsInstance = null;
    var loaded = false;

    function loadVideo() {
      if (!video || !src || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      loadVideo();
      if (mask) {
        mask.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (mask) {
      mask.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (mask) {
        mask.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
