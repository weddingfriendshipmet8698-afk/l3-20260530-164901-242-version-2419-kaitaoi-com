(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initViewSwitch() {
        var list = document.querySelector("[data-movie-list]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-view]"));

        if (!list || buttons.length === 0) {
            return;
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var view = button.getAttribute("data-view");
                list.classList.toggle("is-grid", view === "grid");

                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
            });
        });
    }

    function initSort() {
        var list = document.querySelector("[data-movie-list]");
        var select = document.querySelector("[data-sort-movies]");

        if (!list || !select) {
            return;
        }

        select.addEventListener("change", function () {
            var mode = select.value;
            var cards = Array.prototype.slice.call(list.children);

            cards.sort(function (left, right) {
                if (mode === "title") {
                    return left.dataset.title.localeCompare(right.dataset.title, "zh-Hans-CN");
                }

                if (mode === "year") {
                    return String(right.dataset.year).localeCompare(String(left.dataset.year));
                }

                return 0;
            });

            cards.forEach(function (card) {
                list.appendChild(card);
            });
        });
    }

    function createSearchCard(movie) {
        return [
            '<article class="movie-card">',
            '  <a class="poster-wrap" href="' + movie.url + '">',
            '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
            '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
            '    <span class="poster-play">▶</span>',
            '  </a>',
            '  <div class="movie-card-body">',
            '    <a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
            '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '    <div class="movie-meta">',
            '      <span>' + escapeHtml(movie.region) + '</span>',
            '      <span>' + escapeHtml(movie.type) + '</span>',
            '    </div>',
            '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
            '  </div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var region = document.querySelector("[data-search-region]");
        var results = document.querySelector("[data-search-results]");
        var count = document.querySelector("[data-search-count]");
        var movies = window.SEARCH_MOVIES || [];

        if (!input || !region || !results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q");

        if (queryValue) {
            input.value = queryValue;
        }

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var selectedRegion = region.value;
            var filtered = movies.filter(function (movie) {
                var searchable = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase();
                var keywordMatched = keyword === "" || searchable.indexOf(keyword) !== -1;
                var regionMatched = selectedRegion === "" || movie.region.indexOf(selectedRegion) !== -1;
                return keywordMatched && regionMatched;
            }).slice(0, 96);

            if (count) {
                count.textContent = "显示 " + filtered.length + " 条结果";
            }

            if (filtered.length === 0) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
                return;
            }

            results.innerHTML = filtered.map(createSearchCard).join("");
        }

        input.addEventListener("input", render);
        region.addEventListener("change", render);
        render();
    }

    ready(function () {
        initMenu();
        initHero();
        initViewSwitch();
        initSort();
        initSearch();
    });
}());
