
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('missing');
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function initFilters() {
    var input = document.querySelector('[data-search-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var empty = document.querySelector('[data-empty-state]');
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }

    function apply() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        var matchType = !typeValue || normalize(card.dataset.type) === typeValue;
        var visible = matchKeyword && matchRegion && matchType;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    [input, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initSearchForms() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setVideoSource(video, src) {
    if (!src) {
      return;
    }
    video.src = src;
    video.load();
  }

  function initPlayers() {
    document.querySelectorAll('[data-video-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('[data-play-overlay]');
      var source = shell.getAttribute('data-src');
      var localHls = shell.getAttribute('data-local-hls');
      var fallback = shell.getAttribute('data-fallback');
      var hls = null;
      var fallbackUsed = false;
      if (!video) {
        return;
      }

      function useFallback() {
        if (fallbackUsed) {
          return;
        }
        fallbackUsed = true;
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
        setVideoSource(video, fallback || localHls || source);
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source || localHls);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (!fallbackUsed && localHls && source !== localHls) {
              fallbackUsed = true;
              hls.loadSource(localHls);
              return;
            }
            useFallback();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        setVideoSource(video, source || localHls);
      } else {
        setVideoSource(video, fallback || localHls || source);
      }

      function play() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
        if (overlay) {
          overlay.classList.add('hidden');
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('hidden');
        }
      });
    });
  }

  ready(function () {
    initImages();
    initMobileMenu();
    initHero();
    initSearchForms();
    initFilters();
    initPlayers();
  });
})();
