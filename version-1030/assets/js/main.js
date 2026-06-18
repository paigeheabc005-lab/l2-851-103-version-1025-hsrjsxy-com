(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function setupLocalFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-local-search]', scope);
      var cards = qsa('[data-card]', scope);
      var chips = qsa('[data-filter-field]', scope);
      var filter = { field: 'all', value: 'all' };

      function update() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
          var matchesText = !query || text.indexOf(query) !== -1;
          var matchesFilter = true;
          if (filter.field !== 'all') {
            matchesFilter = (card.getAttribute('data-' + filter.field) || '') === filter.value;
          }
          card.hidden = !(matchesText && matchesFilter);
        });
      }

      if (input) {
        input.addEventListener('input', update);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          filter.field = chip.getAttribute('data-filter-field') || 'all';
          filter.value = chip.getAttribute('data-filter-value') || 'all';
          update();
        });
      });

      update();
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchResults(items) {
    var target = qs('#searchResults');
    if (!target) {
      return;
    }
    if (!items.length) {
      target.innerHTML = '<div class="empty-result">没有找到匹配内容</div>';
      return;
    }
    target.innerHTML = items.slice(0, 80).map(function (item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="./' + escapeHtml(item.file) + '">' +
        '<div class="poster-wrap">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="score-pill">' + escapeHtml(item.score) + '</span>' +
        '</div>' +
        '<div class="movie-card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.desc) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
        '</a>';
    }).join('');
  }

  function setupGlobalSearch() {
    var input = qs('#globalSearchInput');
    var button = qs('#globalSearchButton');
    var index = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !button || !index.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var current = params.get('q') || '';
    input.value = current;

    function run() {
      var query = input.value.trim().toLowerCase();
      var result;
      if (!query) {
        result = index.slice(0, 48);
      } else {
        result = index.filter(function (item) {
          return item.text.toLowerCase().indexOf(query) !== -1;
        });
      }
      renderSearchResults(result);
    }

    button.addEventListener('click', run);
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        run();
      }
    });
    run();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
  });
}());
