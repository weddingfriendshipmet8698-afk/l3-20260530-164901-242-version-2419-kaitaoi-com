(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var root = document.body.getAttribute("data-root") || "./";
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var headerInput = document.querySelector(".global-search-input");
    var headerButton = document.querySelector(".global-search-button");

    function submitHeaderSearch() {
      if (!headerInput) {
        return;
      }
      var value = headerInput.value.trim();
      var target = root + "library.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    }

    if (headerInput) {
      headerInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          submitHeaderSearch();
        }
      });
    }

    if (headerButton) {
      headerButton.addEventListener("click", submitHeaderSearch);
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-arrow.prev");
    var next = document.querySelector(".hero-arrow.next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide") || 0));
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    if (slides.length) {
      showSlide(0);
      startHero();
    }

    var pageInput = document.querySelector("[data-page-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector(".empty-state");

    function getCardText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-type"),
        card.getAttribute("data-region"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function applyUrlQuery() {
      if (!pageInput) {
        return;
      }
      var query = new URLSearchParams(window.location.search).get("q");
      if (query) {
        pageInput.value = query;
      }
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }
      var text = pageInput ? pageInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var category = categoryFilter ? categoryFilter.value : "";
      var shown = 0;

      cards.forEach(function (card) {
        var cardYear = Number(card.getAttribute("data-year") || 0);
        var yearMatch = true;
        var categoryMatch = true;
        var textMatch = true;

        if (year === "older") {
          yearMatch = cardYear < 2020;
        } else if (year) {
          yearMatch = String(cardYear) === year;
        }

        if (category) {
          categoryMatch = card.textContent.indexOf(category) !== -1;
        }

        if (text) {
          textMatch = getCardText(card).indexOf(text) !== -1;
        }

        var visible = yearMatch && categoryMatch && textMatch;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = shown ? "none" : "block";
      }
    }

    applyUrlQuery();

    [pageInput, yearFilter, categoryFilter].forEach(function (element) {
      if (element) {
        element.addEventListener("input", filterCards);
        element.addEventListener("change", filterCards);
      }
    });

    filterCards();
  });
})();
