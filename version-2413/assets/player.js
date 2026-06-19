(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var stage = document.querySelector(".video-stage");
    var video = document.querySelector(".video-player");
    var overlay = document.querySelector(".play-overlay");

    if (!stage || !video || !overlay) {
      return;
    }

    var url = video.getAttribute("src");
    var hls = null;
    var prepared = false;

    function prepare() {
      if (prepared || !url) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener("click", play);
    stage.addEventListener("click", function (event) {
      if (event.target === stage) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
