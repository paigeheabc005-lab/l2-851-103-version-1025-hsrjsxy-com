(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
        ].join(' ').toLowerCase();
    }

    function setupSearch() {
        document.querySelectorAll('.search-scope').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var clear = scope.querySelector('[data-clear-search]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-card'));
            var filterBar = scope.querySelector('[data-filter-bar]');
            var activeFilter = 'all';
            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
                    var category = card.getAttribute('data-category') || '';
                    var matchFilter = activeFilter === 'all' || category === activeFilter;
                    card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (clear && input) {
                clear.addEventListener('click', function () {
                    input.value = '';
                    input.focus();
                    apply();
                });
            }
            if (filterBar) {
                filterBar.querySelectorAll('[data-filter]').forEach(function (button) {
                    button.addEventListener('click', function () {
                        activeFilter = button.getAttribute('data-filter') || 'all';
                        filterBar.querySelectorAll('[data-filter]').forEach(function (other) {
                            other.classList.toggle('is-active', other === button);
                        });
                        apply();
                    });
                });
            }
        });
    }

    function setupPlayers() {
        document.querySelectorAll('.js-player').forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-layer');
            var stream = player.getAttribute('data-stream');
            var hls = null;
            var loaded = false;
            function load() {
                if (loaded || !video || !stream) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    player.classList.add('is-started');
                }
            }
            function play() {
                load();
                player.classList.add('is-started');
                if (video) {
                    var action = video.play();
                    if (action && typeof action.catch === 'function') {
                        action.catch(function () {});
                    }
                }
            }
            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-started');
                });
                video.addEventListener('error', function () {
                    player.classList.add('is-started');
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
