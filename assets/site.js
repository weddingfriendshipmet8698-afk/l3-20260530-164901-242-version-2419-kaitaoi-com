(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = $('.menu-toggle');
    var panel = $('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var grids = $all('.searchable-grid');
    if (!grids.length) {
      return;
    }
    var input = $('.local-filter');
    var typeFilter = $('.type-filter');
    var regionFilter = $('.region-filter');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function apply() {
      var query = normalize(input && input.value);
      var type = normalize(typeFilter && typeFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      grids.forEach(function (grid) {
        $all('.movie-card', grid).forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.category
          ].join(' '));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
          var matchRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
          card.classList.toggle('hidden-card', !(matchQuery && matchType && matchRegion));
        });
      });
    }

    [input, typeFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayer() {
    $all('.video-shell').forEach(function (shell) {
      var video = $('video', shell);
      var button = $('.play-overlay', shell);
      if (!video || !button) {
        return;
      }

      function begin() {
        var url = video.dataset.playUrl;
        shell.classList.add('is-playing');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = url;
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hls) {
            video._hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video._hls.loadSource(url);
            video._hls.attachMedia(video);
            video._hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.play().catch(function () {});
          }
          return;
        }
        if (!video.src) {
          video.src = url;
        }
        video.play().catch(function () {});
      }

      button.addEventListener('click', begin);
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
