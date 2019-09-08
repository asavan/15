const version = "0.1.9";
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
    console.log('The service worker is being installed.');
    evt.waitUntil(precache());
});

self.addEventListener('fetch', function (evt) {
    console.log('The service worker is serving the asset.');
    evt.respondWith(fromCache(evt.request).catch(function () {
        return fetch(evt.request);
    }));
});
