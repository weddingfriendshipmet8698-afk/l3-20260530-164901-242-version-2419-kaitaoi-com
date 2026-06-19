(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initScrollers() {
    selectAll('[data-scroll-wrap]').forEach(function (wrap) {
      var scroller = wrap.querySelector('[data-scroller]');
      var prev = wrap.querySelector('[data-scroll-prev]');
      var next = wrap.querySelector('[data-scroll-next]');
      if (!scroller) return;
      if (prev) {
        prev.addEventListener('click', function () {
          scroller.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          scroller.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function initCardFilters() {
    selectAll('[data-card-area]').forEach(function (area) {
      var input = area.querySelector('[data-page-filter]');
      var select = area.querySelector('[data-sort-select]');
      var grid = area.querySelector('[data-card-grid]');
      var empty = area.querySelector('[data-empty-state]');
      var layoutButtons = selectAll('[data-layout]', area);
      if (!grid) return;

      function cards() {
        return selectAll('.movie-card', grid);
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        cards().forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var match = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('hidden-card', !match);
          if (match) visible += 1;
        });
        if (empty) empty.classList.toggle('is-show', visible === 0);
      }

      function applySort() {
        if (!select) return;
        var mode = select.value;
        var sorted = cards().sort(function (a, b) {
          if (mode === 'title') {
            return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
          }
          if (mode === 'hot') {
            return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
          }
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (input) input.addEventListener('input', applyFilter);
      if (select) select.addEventListener('change', function () {
        applySort();
        applyFilter();
      });

      layoutButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var layout = button.getAttribute('data-layout');
          layoutButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          grid.classList.toggle('is-list', layout === 'list');
        });
      });

      applySort();
      applyFilter();
    });
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    if (!form || !input) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      input.dispatchEvent(new Event('input'));
      var nextUrl = './search.html';
      if (input.value.trim()) nextUrl += '?q=' + encodeURIComponent(input.value.trim());
      window.history.replaceState(null, '', nextUrl);
    });
  }

  function initShareButtons() {
    selectAll('[data-share]').forEach(function (button) {
      button.addEventListener('click', function () {
        var title = document.title;
        var text = button.getAttribute('data-share') || title;
        if (navigator.share) {
          navigator.share({ title: title, text: text, url: window.location.href });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initScrollers();
    initCardFilters();
    initSearchPage();
    initShareButtons();
  });
})();

function initPlayer(src) {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('[data-player-video]');
  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-player-play]'));
  var soundButton = document.querySelector('[data-player-sound]');
  var fullButton = document.querySelector('[data-player-full]');
  var loaded = false;
  var hls = null;

  if (!shell || !video || !src) return;

  function attach() {
    if (loaded) return;
    loaded = true;
    var HlsClass = window.Hls;
    if (HlsClass && HlsClass.isSupported()) {
      hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      if (HlsClass.Events && HlsClass.ErrorTypes) {
        hls.on(HlsClass.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) return;
          if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      video.src = src;
    }
  }

  function playOrPause() {
    attach();
    if (video.paused) {
      var result = video.play();
      if (result && typeof result.catch === 'function') result.catch(function () {});
    } else {
      video.pause();
    }
  }

  playButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      playOrPause();
    });
  });
  video.addEventListener('click', playOrPause);
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
  });
  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });

  if (soundButton) {
    soundButton.addEventListener('click', function () {
      video.muted = !video.muted;
    });
  }

  if (fullButton) {
    fullButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (shell.requestFullscreen) {
        shell.requestFullscreen();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) hls.destroy();
  });
}
