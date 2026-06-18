(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav-menu]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
    });
  }

  function applyFilters(form) {
    var targetSel = form.getAttribute('data-filter-target');
    var target = targetSel ? document.querySelector(targetSel) : null;
    if (!target) return;
    var cards = Array.from(target.querySelectorAll('[data-card]'));
    var empty = target.querySelector('[data-empty]');
    function run() {
      var q = (form.querySelector('[name="q"]') || {}).value || '';
      var type = (form.querySelector('[name="type"]') || {}).value || '';
      var region = (form.querySelector('[name="region"]') || {}).value || '';
      q = q.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.tags, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
        var ok = !q || hay.indexOf(q) !== -1;
        var okType = !type || type === 'all' || card.dataset.type === type;
        var okRegion = !region || region === 'all' || card.dataset.region === region;
        var show = ok && okType && okRegion;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      if (empty) empty.style.display = visible ? 'none' : 'block';
    }
    form.addEventListener('input', run);
    form.addEventListener('change', run);
    run();
  }

  function initFilters() {
    $all('[data-filter-form]').forEach(applyFilters);
  }

  function initSearchPage() {
    var box = document.querySelector('[data-search-results]');
    if (!box) return;
    var input = document.querySelector('[data-search-input]');
    var typeSel = document.querySelector('[data-search-type]');
    var regionSel = document.querySelector('[data-search-region]');
    var count = document.querySelector('[data-search-count]');
    var query = new URLSearchParams(location.search).get('q') || '';
    if (input) input.value = query;
    var data = window.SITE_MOVIES || [];
    function render(list) {
      if (count) count.textContent = list.length + ' 条结果';
      if (!list.length) {
        box.innerHTML = '<div class="no-results">没有找到匹配的影片，试试更短的关键词。</div>';
        return;
      }
      box.innerHTML = list.map(function (m, idx) {
        var c1 = m.__c1 || '#243b55';
        var c2 = m.__c2 || '#141e30';
        return '<article class="movie-card" data-card data-title="' + esc(m.title) + '" data-tags="' + esc((m.tags || []).join(' ')) + '" data-genre="' + esc(m.genre || '') + '" data-region="' + esc(m.region || '') + '" data-type="' + esc(m.type || '') + '" data-year="' + esc(String(m.year || '')) + '">' +
          '<a href="' + esc(m.slug) + '">' +
          '<div class="movie-poster" style="--c1:' + c1 + ';--c2:' + c2 + ';"><div class="poster-top"><span class="pill">#' + String(m.id).padStart(4, '0') + '</span><span class="score">' + esc(String(m.rating || '')) + '</span></div><div class="title-badge">' + esc(m.title) + '</div></div>' +
          '<div class="movie-body"><h3>' + esc(m.title) + '</h3><p>' + esc((m.one_line || '').slice(0, 68)) + '</p><div class="meta-row" style="margin-top:10px"><span class="pill">' + esc(m.region || '') + '</span><span class="pill">' + esc(m.type || '') + '</span><span class="pill">' + esc(String(m.year || '')) + '</span></div></div>' +
          '</a></article>';
      }).join('');
    }
    function esc(str) {
      return String(str).replace(/[&<>"']/g, function (c) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]); });
    }
    function run() {
      var q = (input ? input.value : query || '').trim().toLowerCase();
      var type = typeSel ? typeSel.value : '';
      var region = regionSel ? regionSel.value : '';
      var list = data.filter(function (m) {
        var hay = [m.title, m.region, m.type, m.genre, (m.tags || []).join(' '), m.one_line].join(' ').toLowerCase();
        var ok = !q || hay.indexOf(q) !== -1;
        var okType = !type || type === 'all' || m.type === type;
        var okRegion = !region || region === 'all' || m.region === region;
        return ok && okType && okRegion;
      });
      render(list);
    }
    if (input) input.addEventListener('input', run);
    if (typeSel) typeSel.addEventListener('change', run);
    if (regionSel) regionSel.addEventListener('change', run);
    run();
  }

  function initPlayer() {
    var video = document.querySelector('[data-hls-video]');
    if (!video) return;
    var source = video.getAttribute('data-src');
    var playFab = document.querySelector('[data-play-fab]');
    var status = document.querySelector('[data-player-status]');
    function setStatus(msg) { if (status) status.textContent = msg; }
    function attach() {
      if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () { setStatus('已载入清晰流媒体源'); });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) setStatus('播放源加载异常，请尝试刷新页面');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('浏览器原生支持 HLS');
      } else {
        setStatus('当前浏览器不直接支持 HLS，已保留播放源');
      }
    }
    attach();
    if (playFab) {
      playFab.addEventListener('click', function () {
        video.play().catch(function () {});
        setStatus('正在播放');
      });
    }
    var playNow = document.querySelector('[data-play-now]');
    if (playNow) {
      playNow.addEventListener('click', function () {
        video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { video.play().catch(function () {}); }, 300);
      });
    }
  }

  function initCopyLink() {
    $all('[data-copy-link]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(location.href);
          btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = '复制链接'; }, 1200);
        } catch (e) {
          btn.textContent = '复制失败';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initFilters();
    initSearchPage();
    initPlayer();
    initCopyLink();
  });
})();
