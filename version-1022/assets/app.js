
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === active);
        });
      }

      function restart() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    filterPanels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('[data-search-input]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var region = panel.querySelector('[data-filter-region]');
      var category = panel.querySelector('[data-filter-category]');
      var grid = scope.querySelector('[data-grid]') || document.querySelector('[data-grid]');
      if (!grid) return;
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        var regionValue = region ? region.value : '';
        var categoryValue = category ? category.value : '';

        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
          var matched = true;
          if (query && text.indexOf(query) === -1) matched = false;
          if (yearValue && card.dataset.year !== yearValue) matched = false;
          if (typeValue && card.dataset.type !== typeValue) matched = false;
          if (regionValue && card.dataset.region !== regionValue) matched = false;
          if (categoryValue && card.dataset.category !== categoryValue) matched = false;
          card.classList.toggle('hidden', !matched);
        });
      }

      [input, year, type, region, category].forEach(function (control) {
        if (!control) return;
        control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (root) {
      var video = root.querySelector('video');
      var overlay = root.querySelector('.play-overlay');
      var url = root.getAttribute('data-stream');
      var started = false;
      var hls = null;

      function attach() {
        if (!video || !url || started) return;
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        root.classList.add('is-playing');
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!started) play();
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) hls.destroy();
      });
    });
  });
})();
