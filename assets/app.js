
(function () {
  const movies = window.SITE_MOVIES || [];
  const movieById = new Map(movies.map((m) => [m.id4, m]));

  function normalize(s) {
    return String(s || '').toLowerCase();
  }

  function setCover(el, url) {
    if (!el) return;
    el.style.backgroundImage = `url("${url}")`;
  }

  function toggleMobileNav() {
    const btn = document.querySelector('[data-nav-toggle]');
    const panel = document.querySelector('[data-mobile-nav]');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
    });
  }

  function initFeaturedSlider() {
    const root = document.querySelector('[data-hero-slider]');
    if (!root) return;

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const indicators = Array.from(root.querySelectorAll('[data-hero-indicator]'));
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    if (!slides.length) return;

    let idx = 0;
    let timer = null;

    function show(nextIndex) {
      idx = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== idx;
        slide.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      indicators.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    }

    function start() {
      stop();
      timer = setInterval(() => show(idx + 1), 7000);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    indicators.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
    if (prev) prev.addEventListener('click', () => { show(idx - 1); start(); });
    if (next) next.addEventListener('click', () => { show(idx + 1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearchPage() {
    const root = document.querySelector('[data-search-page]');
    if (!root) return;

    const input = root.querySelector('[data-search-input]');
    const typeSelect = root.querySelector('[data-filter-type]');
    const regionSelect = root.querySelector('[data-filter-region]');
    const yearSelect = root.querySelector('[data-filter-year]');
    const bucketButtons = Array.from(root.querySelectorAll('[data-bucket-btn]'));
    const resultList = root.querySelector('[data-search-results]');
    const resultCount = root.querySelector('[data-results-count]');

    let bucket = 'all';

    function buildCard(m) {
      return `
        <a class="movie-card" href="/${m.detail_path}" title="${m.title}">
          <div class="movie-poster">
            <img src="${m.poster}" alt="${m.title}">
            <div class="poster-badge-row">
              <span class="poster-badge">${m.type}</span>
              <span class="poster-badge">${m.year}</span>
            </div>
          </div>
          <div class="movie-body">
            <h3 class="movie-title">${m.title}</h3>
            <div class="movie-meta">${m.region} · ${m.genre}</div>
            <div class="movie-excerpt">${m.one_line}</div>
            <div class="movie-footer">
              <span class="score">★ ${m.score}</span>
              <span class="more-link">详情</span>
            </div>
          </div>
        </a>`;
    }

    function apply() {
      const q = normalize(input ? input.value : '');
      const t = typeSelect ? typeSelect.value : 'all';
      const r = regionSelect ? regionSelect.value : 'all';
      const y = yearSelect ? yearSelect.value : 'all';
      const filtered = movies.filter((m) => {
        if (bucket !== 'all' && m.bucket !== bucket) return false;
        if (t !== 'all' && m.type !== t) return false;
        if (r !== 'all' && m.region !== r) return false;
        if (y !== 'all' && String(m.year) !== y) return false;
        if (q) {
          const hay = normalize([m.title, m.region, m.type, m.year, m.genre, m.tags, m.one_line, m.summary, m.review].join(' '));
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      resultCount.textContent = `共找到 ${filtered.length} 部影片`;
      resultList.innerHTML = filtered.slice(0, 300).map(buildCard).join('') || '<div class="notice">没有找到符合条件的内容，请尝试其他关键词。</div>';
    }

    bucketButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        bucket = btn.dataset.bucketBtn || 'all';
        bucketButtons.forEach((x) => x.classList.toggle('active', x === btn));
        apply();
      });
    });
    [input, typeSelect, regionSelect, yearSelect].forEach((el) => el && el.addEventListener('input', apply));
    apply();
  }

  function initHomeSearch() {
    const form = document.querySelector('[data-home-search]');
    if (!form) return;
    const input = form.querySelector('input');
    const path = '/search.html';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = encodeURIComponent((input && input.value || '').trim());
      window.location.href = q ? `${path}?q=${q}` : path;
    });
  }

  function initDetailPlayer() {
    const root = document.querySelector('[data-player]');
    if (!root) return;
    const video = root.querySelector('video');
    const sourceBtns = Array.from(root.querySelectorAll('[data-source-btn]'));
    const sources = JSON.parse(root.getAttribute('data-sources') || '[]');
    const poster = root.getAttribute('data-poster') || '';
    if (!video || !sources.length) return;

    const hlsUrl = sources.find((s) => /\.m3u8(\?|$)/.test(s.url));
    let hls = null;

    function stopHls() {
      if (hls) {
        try { hls.destroy(); } catch (e) {}
        hls = null;
      }
    }

    function loadSource(index) {
      const src = sources[index] || sources[0];
      sourceBtns.forEach((btn, i) => btn.classList.toggle('active', i === index));
      stopHls();
      video.removeAttribute('src');
      video.load();
      video.poster = poster;

      if (src.type === 'm3u8' && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src.url);
        hls.attachMedia(video);
      } else {
        video.src = src.url;
      }
    }

    sourceBtns.forEach((btn, index) => btn.addEventListener('click', () => loadSource(index)));
    loadSource(0);
  }

  function initRelatedJump() {
    const links = document.querySelectorAll('[data-related-link]');
    links.forEach((a) => a.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })));
  }

  function initSearchQueryPrefill() {
    const root = document.querySelector('[data-search-page]');
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const input = root.querySelector('[data-search-input]');
    if (q && input) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    toggleMobileNav();
    initFeaturedSlider();
    initHomeSearch();
    initSearchPage();
    initSearchQueryPrefill();
    initDetailPlayer();
    initRelatedJump();

    document.querySelectorAll('[data-cover-src]').forEach((node) => {
      const src = node.getAttribute('data-cover-src');
      if (src) setCover(node, src);
    });
  });
})();
