(function(){
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  function initMobileNav(){
    const btn = $('[data-menu-btn]');
    const nav = $('[data-nav]');
    if(!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  function initHeroSlider(){
    const slides = $$('.js-hero-slide');
    const dots = $$('.js-hero-dot');
    if(!slides.length) return;
    let idx = slides.findIndex(s => s.classList.contains('active'));
    if(idx < 0) idx = 0;
    const show = (next) => {
      idx = (next + slides.length) % slides.length;
      slides.forEach((el, i) => el.classList.toggle('active', i === idx));
      dots.forEach((el, i) => el.classList.toggle('active', i === idx));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    const prev = $('[data-hero-prev]');
    const next = $('[data-hero-next]');
    if(prev) prev.addEventListener('click', () => show(idx - 1));
    if(next) next.addEventListener('click', () => show(idx + 1));
    setInterval(() => show(idx + 1), 5200);
  }

  function applyFilter(container, query, category){
    if(!container) return;
    const cards = $$('.js-item-card', container);
    let visible = 0;
    cards.forEach(card => {
      const text = (card.dataset.search || '') + ' ' + (card.dataset.tags || '') + ' ' + (card.dataset.genre || '') + ' ' + (card.dataset.year || '');
      const okQuery = !query || text.toLowerCase().includes(query.toLowerCase());
      const okCategory = !category || category === 'all' || card.dataset.bucket === category;
      const show = okQuery && okCategory;
      card.classList.toggle('hide', !show);
      if(show) visible += 1;
    });
    const empty = $('[data-empty]', container);
    if(empty) empty.classList.toggle('hide', visible !== 0);
  }

  function initFiltering(){
    $$('[data-filter-container]').forEach(container => {
      const input = $('[data-search-input]', container);
      const chips = $$('[data-filter-chip]', container);
      let active = (chips.find(c => c.classList.contains('active')) || {}).dataset?.filterChip || 'all';
      const rerun = () => applyFilter(container, input ? input.value.trim() : '', active);
      if(input) input.addEventListener('input', rerun);
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          active = chip.dataset.filterChip || 'all';
          chips.forEach(c => c.classList.toggle('active', c === chip));
          rerun();
        });
      });
      rerun();
    });
  }

  function initDetailPlayer(){
    const video = $('#moviePlayer');
    if(!video) return;
    const mp4 = video.dataset.mp4;
    const m3u8 = video.dataset.m3u8;
    const title = video.dataset.title || '影片';
    const playBtn = $('[data-play-btn]');
    const lineButtons = $$('[data-line-src]');
    let current = 'mp4';

    function setSource(kind){
      current = kind;
      lineButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lineSrc === kind));
      if(kind === 'm3u8' && m3u8){
        if(window.Hls && window.Hls.isSupported()){
          if(video._hls){ try{video._hls.destroy();}catch(e){} }
          const hls = new window.Hls();
          video._hls = hls;
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(()=>{}));
          return;
        }
        video.src = m3u8;
        return;
      }
      video.src = mp4;
    }

    if(playBtn) playBtn.addEventListener('click', () => video.play().catch(()=>{}));
    lineButtons.forEach(btn => btn.addEventListener('click', () => setSource(btn.dataset.lineSrc || 'mp4')));
    setSource('mp4');
    video.addEventListener('play', () => {
      if(playBtn) playBtn.textContent = '暂停';
    });
    video.addEventListener('pause', () => {
      if(playBtn) playBtn.textContent = '播放';
    });
    video.addEventListener('ended', () => {
      if(playBtn) playBtn.textContent = '重播';
    });
  }

  function initBackToTop(){
    const btn = $('[data-backtop]');
    if(!btn) return;
    const onScroll = () => btn.classList.toggle('hide', window.scrollY < 500);
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initHeroSlider();
    initFiltering();
    initDetailPlayer();
    initBackToTop();
  });
})();
