import { MOVIES } from './movie-data.js';

const form = document.querySelector('[data-search-form]');
const results = document.querySelector('[data-search-results]');
const params = new URLSearchParams(window.location.search);

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function movieCard(movie) {
  const tags = String(movie.tags || '').split('，').filter(Boolean).slice(0, 3).map(function(tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return [
    '<article class="movie-card">',
    '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
    '    <img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
    '    <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
    '    <span class="poster-play">▶</span>',
    '  </a>',
    '  <div class="card-body">',
    '    <div class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
    '    <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
    '    <p>' + escapeHtml(movie.oneLine) + '</p>',
    '    <div class="tag-row">' + tags + '</div>',
    '  </div>',
    '</article>'
  ].join('');
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, function(char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char];
  });
}

function render() {
  if (!form || !results) {
    return;
  }

  const q = normalize(form.elements.q.value);
  const type = normalize(form.elements.type.value);
  const year = normalize(form.elements.year.value);

  const matched = MOVIES.filter(function(movie) {
    const haystack = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' '));
    const qOk = !q || haystack.indexOf(q) !== -1;
    const typeOk = !type || normalize(movie.type).indexOf(type) !== -1 || normalize(movie.genre).indexOf(type) !== -1;
    const yearOk = !year || normalize(movie.year) === year;
    return qOk && typeOk && yearOk;
  }).slice(0, 96);

  if (!matched.length) {
    results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
    return;
  }

  results.innerHTML = matched.map(movieCard).join('');
}

if (form) {
  form.elements.q.value = params.get('q') || '';
  form.elements.type.value = params.get('type') || '';
  form.elements.year.value = params.get('year') || '';
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    render();
  });
  Array.from(form.elements).forEach(function(element) {
    element.addEventListener('input', render);
    element.addEventListener('change', render);
  });
  render();
}
