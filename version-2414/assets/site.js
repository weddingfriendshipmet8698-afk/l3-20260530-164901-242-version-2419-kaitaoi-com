
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function openMenu(button, nav) {
    const expanded = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function initMobileNav() {
    const button = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) return;

    button.addEventListener('click', function () {
      openMenu(button, nav);
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || button.contains(event.target)) return;
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });

    qsa(nav, 'a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function playVideo(video, source) {
    if (!video || !source) return;
    if (video.dataset.hlsInitialized !== 'true') {
      video.dataset.hlsInitialized = 'true';
    }

    if (window.Hls && window.Hls.isSupported() && /\.m3u8(\?|$)/i.test(source)) {
      if (video._hls) {
        try {
          video._hls.destroy();
        } catch (err) {}
      }
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      video._hls = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        const promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
      return;
    }

    video.src = source;
    const promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  function initPlayer() {
    qsa(document, '[data-player]').forEach(function (root) {
      const video = qs(root, 'video');
      const overlayBtn = qs(root, '[data-play]');
      const sourceButtons = qsa(root, '[data-source]');
      const defaultHls = root.getAttribute('data-hls');
      const defaultMp4 = root.getAttribute('data-mp4');

      function setActive(btn) {
        sourceButtons.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
      }

      function startByButton(btn) {
        const type = btn.getAttribute('data-source');
        const source = type === 'mp4' ? (defaultMp4 || btn.getAttribute('data-src')) : (defaultHls || btn.getAttribute('data-src'));
        if (!source) return;
        setActive(btn);
        playVideo(video, source);
      }

      if (overlayBtn && defaultHls) {
        overlayBtn.addEventListener('click', function () {
          const btn = sourceButtons.find(function (b) {
            return b.getAttribute('data-source') === 'hls';
          }) || sourceButtons[0];
          if (btn) {
            startByButton(btn);
          } else {
            playVideo(video, defaultHls);
          }
        });
      }

      sourceButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          startByButton(btn);
        });
      });

      if (defaultHls) {
        const btn = sourceButtons.find(function (b) {
          return b.getAttribute('data-source') === 'hls';
        });
        if (btn) {
          setActive(btn);
          playVideo(video, defaultHls);
        } else {
          playVideo(video, defaultHls);
        }
      } else if (defaultMp4) {
        const btn = sourceButtons.find(function (b) {
          return b.getAttribute('data-source') === 'mp4';
        });
        if (btn) {
          setActive(btn);
          playVideo(video, defaultMp4);
        } else {
          playVideo(video, defaultMp4);
        }
      }
    });
  }

  function cardMatches(card, query, selects) {
    if (!query && !selects.length) return true;
    const text = (card.dataset.search || card.textContent || '').toLowerCase();
    if (query && text.indexOf(query) === -1) return false;
    for (const select of selects) {
      const key = select.getAttribute('data-filter-key');
      const value = select.value;
      if (!value || value === 'all') continue;
      const dataValue = (card.dataset[key] || '').toLowerCase();
      if (!dataValue.includes(value.toLowerCase())) return false;
    }
    return true;
  }

  function applyLocalFilter(panel) {
    const input = qs(panel, '[data-filter-input]');
    const selects = qsa(panel, 'select[data-filter-key]');
    const cards = qsa(panel, '[data-filter-card]');
    if (!input && !selects.length) return;

    function run() {
      const query = input ? input.value.trim().toLowerCase() : '';
      let shown = 0;
      cards.forEach(function (card) {
        const ok = cardMatches(card, query, selects);
        card.classList.toggle('hidden', !ok);
        if (ok) shown += 1;
      });
      const counter = qs(panel, '[data-filter-count]');
      if (counter) counter.textContent = String(shown);
      const empty = qs(panel, '[data-empty]');
      if (empty) empty.classList.toggle('hidden', shown !== 0);
    }

    if (input) input.addEventListener('input', run);
    selects.forEach(function (select) {
      select.addEventListener('change', run);
    });
    run();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderMovieCard(item) {
    const tags = (item.tags || []).slice(0, 3).map(function (t) {
      return `<span class="chip">${escapeHtml(t)}</span>`;
    }).join('');
    return `
      <article class="movie-card" data-filter-card data-search="${escapeHtml([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' ')].join(' '))}" data-region="${escapeHtml(item.region || '')}" data-type="${escapeHtml(item.type || '')}" data-year="${escapeHtml(item.year || '')}">
        <a class="movie-card__link" href="${escapeHtml(item.href)}">
          <div class="poster">
            <img src="${escapeHtml(item.poster)}" alt="${escapeHtml(item.title)} 海报">
            <div class="poster__overlay"></div>
            <span class="poster__tag">${escapeHtml(item.categoryName || '')}</span>
          </div>
          <div class="movie-card__body">
            <h3 class="movie-card__title">${escapeHtml(item.title)}</h3>
            <p class="movie-card__meta">${escapeHtml(item.region || '')} · ${escapeHtml(item.type || '')} · ${escapeHtml(item.year || '')}</p>
            <p class="movie-card__summary">${escapeHtml(item.oneLine || '')}</p>
            <div class="movie-tags">${tags}</div>
          </div>
        </a>
      </article>
    `;
  }

  function initSearchPage() {
    const root = document.querySelector('[data-search-page]');
    if (!root || !window.MOVIE_INDEX) return;

    const input = qs(root, '[data-search-input]');
    const region = qs(root, '[data-search-region]');
    const type = qs(root, '[data-search-type]');
    const year = qs(root, '[data-search-year]');
    const results = qs(root, '[data-search-results]');
    const count = qs(root, '[data-search-count]');

    const data = window.MOVIE_INDEX.slice();

    function matches(item, q, regionVal, typeVal, yearVal) {
      const blob = [
        item.title, item.region, item.type, item.year, item.genre,
        (item.tags || []).join(' '), item.oneLine, item.categoryName
      ].join(' ').toLowerCase();
      if (q && blob.indexOf(q) === -1) return false;
      if (regionVal && regionVal !== 'all' && String(item.region || '').indexOf(regionVal) === -1) return false;
      if (typeVal && typeVal !== 'all' && String(item.type || '').indexOf(typeVal) === -1) return false;
      if (yearVal && yearVal !== 'all' && String(item.year || '') !== yearVal) return false;
      return true;
    }

    function run() {
      const q = input ? input.value.trim().toLowerCase() : '';
      const regionVal = region ? region.value : 'all';
      const typeVal = type ? type.value : 'all';
      const yearVal = year ? year.value : 'all';

      const list = data.filter(function (item) {
        return matches(item, q, regionVal, typeVal, yearVal);
      }).slice(0, 120);

      if (count) count.textContent = String(list.length);
      if (!results) return;
      results.innerHTML = list.length ? list.map(renderMovieCard).join('') : '<div class="empty-state">没有找到匹配结果，试试更换关键词或清空筛选。</div>';
    }

    [input, region, type, year].forEach(function (el) {
      if (el) el.addEventListener('input', run);
      if (el) el.addEventListener('change', run);
    });

    run();
  }

  function initCardFilters() {
    qsa(document, '[data-filter-panel]').forEach(applyLocalFilter);
  }

  ready(function () {
    initMobileNav();
    initPlayer();
    initCardFilters();
    initSearchPage();
  });
})();
