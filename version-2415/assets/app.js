(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-form]");
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var scope = panel.nextElementSibling;
      while (scope && !scope.classList.contains("filter-scope")) {
        scope = scope.nextElementSibling;
      }
      if (!scope) {
        scope = document;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = ((card.dataset.title || "") + " " + (card.dataset.keywords || "")).toLowerCase();
          var cardYear = card.dataset.year || "";
          var cardType = card.dataset.type || "";
          var okText = !q || text.indexOf(q) !== -1;
          var okYear = !y || (y === "2020" ? Number(cardYear) <= 2020 : cardYear === y);
          var okType = !t || cardType.indexOf(t) !== -1;
          card.classList.toggle("is-hidden", !(okText && okYear && okType));
        });
      }
      [input, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  var hlsLoading;

  function ensureHls() {
    if (window.Hls) {
      return Promise.resolve();
    }
    if (hlsLoading) {
      return hlsLoading;
    }
    hlsLoading = new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
      script.async = true;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        resolve();
      };
      document.head.appendChild(script);
    });
    return hlsLoading;
  }

  function attachStream(video, stream) {
    if (!video || !stream) {
      return Promise.resolve();
    }
    if (video.dataset.ready === "1") {
      return Promise.resolve();
    }
    video.dataset.ready = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return Promise.resolve();
    }
    return ensureHls().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    });
  }

  function setupPlayers() {
    var shells = document.querySelectorAll("[data-player]");
    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-stream]");
      var cover = shell.querySelector(".player-cover");
      if (!video) {
        return;
      }
      function play() {
        shell.classList.add("is-playing");
        attachStream(video, video.dataset.stream).then(function () {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        });
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!video.dataset.ready) {
          play();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupFilters();
    setupPlayers();
  });
})();
