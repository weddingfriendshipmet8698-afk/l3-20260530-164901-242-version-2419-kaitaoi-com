(function() {
  const toggle = document.querySelector('.mobile-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let active = slides.findIndex(function(slide) {
    return slide.classList.contains('is-active');
  });

  if (active < 0) {
    active = 0;
  }

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showSlide(Number(dot.dataset.heroDot || 0));
    });
  });

  const nextButton = document.querySelector('.hero-next');
  const prevButton = document.querySelector('.hero-prev');

  if (nextButton) {
    nextButton.addEventListener('click', function() {
      showSlide(active + 1);
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function() {
      showSlide(active - 1);
    });
  }

  if (slides.length > 1) {
    window.setInterval(function() {
      showSlide(active + 1);
    }, 5000);
  }

  document.querySelectorAll('[data-rail]').forEach(function(button) {
    button.addEventListener('click', function() {
      const track = document.querySelector('[data-rail-track]');
      if (!track) {
        return;
      }

      const direction = button.dataset.rail === 'left' ? -1 : 1;
      track.scrollBy({
        left: direction * 420,
        behavior: 'smooth'
      });
    });
  });

  const filterBar = document.querySelector('.filter-toolbar');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  if (filterBar && cards.length) {
    const keyword = filterBar.querySelector('[data-filter-keyword]');
    const year = filterBar.querySelector('[data-filter-year]');
    const type = filterBar.querySelector('[data-filter-type]');

    function applyFilters() {
      const word = (keyword && keyword.value || '').trim().toLowerCase();
      const selectedYear = year && year.value || '';
      const selectedType = type && type.value || '';

      cards.forEach(function(card) {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.year].join(' ').toLowerCase();
        const matchedWord = !word || haystack.indexOf(word) !== -1;
        const matchedYear = !selectedYear || card.dataset.year === selectedYear;
        const matchedType = !selectedType || (card.dataset.type || '').indexOf(selectedType) !== -1 || (card.dataset.genre || '').indexOf(selectedType) !== -1;
        card.classList.toggle('is-hidden', !(matchedWord && matchedYear && matchedType));
      });
    }

    [keyword, year, type].forEach(function(input) {
      if (input) {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
      }
    });
  }
})();
