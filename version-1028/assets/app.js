(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-off");
      }, { once: true });
    });
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupGlobalSearch() {
    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-target]"));
      if (slides.length <= 1) {
        return;
      }
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle("is-active", position === current);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === current);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(Number(dot.dataset.slideTarget || 0));
          start();
        });
      });

      start();
    });
  }

  function setupCardFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-item"));
    var input = document.querySelector("[data-card-search]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var activeFilter = { group: "all", value: "all" };

    if (!cards.length) {
      return;
    }

    function matchesButton(card) {
      if (activeFilter.group === "all" || activeFilter.value === "all") {
        return true;
      }
      var direct = card.dataset[activeFilter.group] || "";
      var text = card.dataset.searchText || "";
      return direct.indexOf(activeFilter.value) !== -1 || text.indexOf(activeFilter.value.toLowerCase()) !== -1;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = card.dataset.searchText || "";
        var ok = matchesButton(card) && (!query || text.indexOf(query) !== -1);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeFilter.group = button.dataset.filterGroup || "all";
        activeFilter.value = button.dataset.filterValue || "all";
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll("[data-video-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-player-start]");
      var source = player.dataset.source;
      var initialized = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function start() {
        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                hlsInstance.destroy();
                video.src = source;
                playVideo();
              }
            });
          } else {
            video.src = source;
            playVideo();
          }
          initialized = true;
        } else {
          playVideo();
        }
        player.classList.add("is-playing");
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      video.addEventListener("click", function () {
        if (!initialized) {
          start();
        }
      });
    });
  }

  onReady(function () {
    setupImages();
    setupMenu();
    setupGlobalSearch();
    setupHero();
    setupCardFilters();
    setupPlayers();
  });
})();
