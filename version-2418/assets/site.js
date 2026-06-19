
(function () {
  const body = document.body;

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function debounce(fn, delay = 180) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function setNavActive() {
    const path = location.pathname.replace(/\/+$/, "");
    qsa(".site-nav a[data-nav]").forEach((link) => {
      const nav = link.getAttribute("data-nav");
      const active = (nav === "home" && (path.endsWith("/index.html") || path === "" || path === "/"))
        || (nav === "search" && path.endsWith("/search.html"))
        || (nav === "ranking" && path.endsWith("/ranking.html"))
        || (nav === "all" && path.endsWith("/all.html"))
        || (nav === "category" && /\/category\/\d+\.html$/.test(path));
      link.classList.toggle("active", active);
    });
  }

  function setupMobileNav() {
    const toggle = qs("[data-nav-toggle]");
    const nav = qs("[data-site-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(expanded));
    });
  }

  function setupBackToTop() {
    const btn = qs("[data-back-to-top]");
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle("show", window.scrollY > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setupHeroCarousel() {
    const rail = qs("[data-hero-rail]");
    const prev = qs("[data-hero-prev]");
    const next = qs("[data-hero-next]");
    if (!rail || !prev || !next) return;

    const step = () => Math.max(rail.clientWidth * 0.92, 280);

    prev.addEventListener("click", () => {
      rail.scrollBy({ left: -step(), behavior: "smooth" });
    });

    next.addEventListener("click", () => {
      rail.scrollBy({ left: step(), behavior: "smooth" });
    });

    let timer = window.setInterval(() => {
      const max = rail.scrollWidth - rail.clientWidth - 4;
      const left = rail.scrollLeft + step();
      if (left >= max) {
        rail.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        rail.scrollBy({ left: step(), behavior: "smooth" });
      }
    }, 5200);

    rail.addEventListener("mouseenter", () => {
      clearInterval(timer);
    });
    rail.addEventListener("mouseleave", () => {
      timer = window.setInterval(() => {
        const max = rail.scrollWidth - rail.clientWidth - 4;
        const left = rail.scrollLeft + step();
        if (left >= max) {
          rail.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          rail.scrollBy({ left: step(), behavior: "smooth" });
        }
      }, 5200);
    });
  }

  function cardTemplate(movie, idx, relDepth = 0) {
    const prefix = "../".repeat(relDepth);
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <a href="${prefix}${movie.href}" aria-label="${movie.title}">
        <div class="poster-wrap">
          <img loading="lazy" src="${prefix}${movie.poster}" alt="${movie.title}">
        </div>
        <div class="body">
          <h3>${movie.title}</h3>
          <div class="inline-meta">
            <span class="meta-pill">${movie.year}</span>
            <span class="meta-pill">${movie.type}</span>
          </div>
          <p>${movie.genre}</p>
          <div class="foot">
            <span class="small-link">查看详情</span>
            <span class="chip">${movie.bucket}</span>
          </div>
        </div>
      </a>
    `;
    return article;
  }

  function renderSearchResults(list, mount, relDepth = 0) {
    mount.innerHTML = "";
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "panel";
      empty.innerHTML = `
        <h3>没有找到匹配结果</h3>
        <p>请尝试更换关键词、年份或类型筛选。</p>
      `;
      mount.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((movie, idx) => {
      frag.appendChild(cardTemplate(movie, idx, relDepth));
    });
    mount.appendChild(frag);
  }

  function matchesMovie(movie, query, type, region, year) {
    if (type && type !== "全部" && movie.type !== type) return false;
    if (region && region !== "全部" && movie.region !== region) return false;
    if (year && year !== "全部" && movie.year !== year) return false;
    if (!query) return true;
    const hay = [
      movie.title,
      movie.type,
      movie.region,
      movie.genre,
      movie.bucket,
      movie.tags || "",
      movie.summary || "",
      movie.oneLine || ""
    ].join(" ").toLowerCase();
    return query.toLowerCase().split(/\s+/).filter(Boolean).every((term) => hay.includes(term));
  }

  function uniqueValues(items, key) {
    return [...new Set(items.map((item) => item[key]))];
  }

  function setupSearchPage() {
    if (!window.MOVIE_CATALOG) return;
    const form = qs("[data-search-form]");
    const input = qs("[data-search-input]");
    const type = qs("[data-filter-type]");
    const region = qs("[data-filter-region]");
    const year = qs("[data-filter-year]");
    const count = qs("[data-result-count]");
    const mount = qs("[data-search-results]");
    if (!form || !input || !mount) return;

    const items = window.MOVIE_CATALOG.slice();

    const baseType = type ? type.value : "全部";
    const baseRegion = region ? region.value : "全部";
    const baseYear = year ? year.value : "全部";

    function apply() {
      const q = input.value.trim();
      const t = type ? type.value : baseType;
      const r = region ? region.value : baseRegion;
      const y = year ? year.value : baseYear;

      const list = items.filter((movie) => matchesMovie(movie, q, t, r, y));
      const limited = q || t !== "全部" || r !== "全部" || y !== "全部"
        ? list.slice(0, 500)
        : list.slice(0, 120);

      renderSearchResults(limited, mount, 0);
      if (count) {
        count.textContent = `${list.length} 部影片`;
      }
    }

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("q")) input.value = params.get("q");
      if (params.get("type") && type) type.value = params.get("type");
      if (params.get("region") && region) region.value = params.get("region");
      if (params.get("year") && year) year.value = params.get("year");
    }

    const onInput = debounce(apply, 120);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      apply();
      history.replaceState({}, "", `${location.pathname}?${new URLSearchParams({
        q: input.value.trim(),
        type: type ? type.value : "全部",
        region: region ? region.value : "全部",
        year: year ? year.value : "全部",
      }).toString()}`);
    });

    input.addEventListener("input", onInput);
    if (type) type.addEventListener("change", apply);
    if (region) region.addEventListener("change", apply);
    if (year) year.addEventListener("change", apply);

    apply();
  }

  function setupRevealBlocks() {
    qsa("[data-toggle]").forEach((btn) => {
      const targetId = btn.getAttribute("data-toggle");
      const target = document.getElementById(targetId);
      if (!target) return;
      btn.addEventListener("click", () => {
        const hidden = target.hasAttribute("hidden");
        if (hidden) target.removeAttribute("hidden");
        else target.setAttribute("hidden", "");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setNavActive();
    setupMobileNav();
    setupBackToTop();
    setupHeroCarousel();
    setupSearchPage();
    setupRevealBlocks();
  });
})();
