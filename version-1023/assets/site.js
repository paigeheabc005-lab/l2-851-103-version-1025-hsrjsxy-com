
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setActiveNav() {
    const page = document.body.dataset.page;
    qsa('[data-nav-link]').forEach((link) => {
      if (link.dataset.navLink === page) {
        link.classList.add('active');
      }
    });
  }

  function initMenu() {
    const toggle = qs('[data-menu-toggle]');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('nav-open')) return;
      const nav = qs('.nav-wrap');
      if (nav && !nav.contains(e.target) && e.target !== toggle) {
        document.body.classList.remove('nav-open');
      }
    });
  }

  function initSearch() {
    const input = qs('[data-filter-input]');
    if (!input) return;
    const cards = qsa('[data-card]');
    const counter = qs('[data-match-count]');
    const sortSel = qs('[data-sort-select]');
    const query = getParam('q');
    if (query) input.value = query;

    function apply() {
      const q = (input.value || '').trim().toLowerCase();
      const sortValue = sortSel ? sortSel.value : 'default';
      const list = cards.slice();

      list.sort((a, b) => {
        if (sortValue === 'year-desc') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (sortValue === 'year-asc') {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        }
        if (sortValue === 'title') {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        }
        return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
      });

      const parent = list[0] && list[0].parentElement;
      if (parent) {
        list.forEach((card) => parent.appendChild(card));
      }

      let matched = 0;
      cards.forEach((card) => {
        const hay = [card.dataset.title, card.dataset.tags, card.dataset.type, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
        const show = !q || hay.includes(q);
        card.classList.toggle('hidden', !show);
        if (show) matched += 1;
      });
      if (counter) counter.textContent = matched;
    }

    input.addEventListener('input', apply);
    if (sortSel) sortSel.addEventListener('change', apply);
    apply();
  }

  function initCarousel() {
    const carousel = qs('[data-carousel]');
    if (!carousel) return;
    const track = qs('[data-carousel-track]', carousel);
    const slides = track ? qsa('[data-slide]', track) : [];
    const prev = qs('[data-carousel-prev]', carousel);
    const next = qs('[data-carousel-next]', carousel);
    if (!track || slides.length < 2) return;

    let index = 0;
    const total = slides.length;
    function render() {
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
    }
    function go(step) {
      index = (index + step + total) % total;
      render();
    }
    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));
    render();
    setInterval(() => go(1), 6500);
  }

  function initPlayer() {
    const video = qs('[data-player]');
    if (!video) return;
    const mp4 = video.dataset.mp4 || '';
    const hls = video.dataset.hls || '';
    const sourceBtns = qsa('[data-source-btn]');

    function setSource(kind) {
      sourceBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.sourceBtn === kind));
      if (kind === 'hls' && hls && window.Hls && window.Hls.isSupported()) {
        if (video._hls) {
          video._hls.destroy();
        }
        const hlsInst = new window.Hls();
        hlsInst.loadSource(hls);
        hlsInst.attachMedia(video);
        video._hls = hlsInst;
        return;
      }
      if (video._hls) {
        video._hls.destroy();
        video._hls = null;
      }
      video.src = kind === 'hls' ? (hls || mp4) : mp4;
      video.load();
    }

    sourceBtns.forEach((btn) => {
      btn.addEventListener('click', () => setSource(btn.dataset.sourceBtn));
    });

    if (hls && window.Hls && window.Hls.isSupported()) {
      setSource('hls');
    } else {
      setSource('mp4');
    }

    const playBtn = qs('[data-play-btn]');
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        try {
          await video.play();
        } catch (err) {}
      });
    }
  }

  function initScrollTop() {
    const btn = qs('[data-top-btn]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('hidden', window.scrollY < 600);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    initMenu();
    initSearch();
    initCarousel();
    initPlayer();
    initScrollTop();
  });
})();
