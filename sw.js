const version = "0.1.14";
const CACHE = 'cache-only';

function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}

function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll([
            './',
            './game.js',
            './gamepad.js',
            './game.css',
            './images/15-front.png',
            './images/reload.svg'
        ]);
    });
}

self.addEventListener('install', function (evt) {
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function (evt) {
    evt.respondWith(fromCache(evt.request).catch(function () {
        return fetch(evt.request);
    }));
});
