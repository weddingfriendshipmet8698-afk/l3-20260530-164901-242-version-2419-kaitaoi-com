(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterGrid = document.querySelector('.filter-grid');
  var filterInput = document.querySelector('.page-filter-input');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

  function filterCards(value) {
    if (!filterGrid) {
      return;
    }
    var query = String(value || '').toLowerCase();
    Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card')).forEach(function (card) {
      var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-region') || '').toLowerCase() + ' ' + (card.getAttribute('data-type') || '').toLowerCase();
      card.style.display = text.indexOf(query) !== -1 ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      chips.forEach(function (chip) {
        chip.classList.remove('is-active');
      });
      filterCards(filterInput.value);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var value = chip.getAttribute('data-filter') || '';
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      if (filterInput) {
        filterInput.value = value;
      }
      filterCards(value);
    });
  });

  var searchInput = document.getElementById('site-search');
  var searchResults = document.getElementById('search-results');

  function renderSearch(query) {
    if (!searchResults || typeof SEARCH_DATA === 'undefined') {
      return;
    }
    var value = String(query || '').trim().toLowerCase();
    var list = SEARCH_DATA.filter(function (item) {
      return !value || item.text.toLowerCase().indexOf(value) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = list.map(function (item) {
      return [
        '<article class="movie-card">',
        '<a class="poster-link" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="score-badge">' + item.year + '</span>',
        '</a>',
        '<div class="card-body">',
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '<p class="card-meta">' + item.year + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
        '<p class="card-desc">' + escapeHtml(item.genre || '') + '</p>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
    renderSearch(q);
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }
})();
