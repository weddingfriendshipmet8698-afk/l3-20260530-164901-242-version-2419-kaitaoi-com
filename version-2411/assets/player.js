import { H as Hls } from './hls.js';

const players = Array.from(document.querySelectorAll('.movie-player'));

players.forEach(function(player) {
  const video = player.querySelector('video');
  const cover = player.querySelector('.player-cover');
  const stream = player.dataset.stream;
  let started = false;
  let hls = null;

  function attachStream() {
    if (!video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function startPlayback() {
    if (!video || started) {
      return;
    }

    started = true;
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  player.addEventListener('click', function(event) {
    if (event.target === player || event.target === video) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function() {
    if (hls) {
      hls.destroy();
    }
  });
});
