!function(e){var n={};function t(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,t),i.l=!0,i.exports}t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var i in e)t.d(r,i,function(n){return e[n]}.bind(null,i));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n){const t="cache-only0.1.15";function r(e){return caches.open(t).then((function(n){return n.match(e,{ignoreSearch:!0}).then((function(e){return e||Promise.reject("request-not-in-cache")}))}))}function i(){const e=[{'revision':'60021f43c705581dd3929b3c2f7c6d1d','url':'1.c9da14176dab8b9e6de6.min.js'},{'revision':'314511beb135e79364ae775f8be4352c','url':'images/15-front.png'},{'revision':'1f5c699980c03253bf4c598155851e47','url':'images/15.png'},{'revision':'941c0ef0df1ef916536fa17e14e5a4e7','url':'images/15.svg'},{'revision':'72af9c14908626134dc66e231d10deb5','url':'images/15_192.png'},{'revision':'cbe79efd6d6d583ab60fe81af91c8d72','url':'images/15_512.png'},{'revision':'c315b7be1b4e86271dc106b355755900','url':'images/reload.svg'},{'revision':'b19aaafb35bcc9c45875cdd82017a54a','url':'main.819858e86680c098ac52.min.js'},{'revision':'b22c45049b9bf94986447d293f3e9fa8','url':'manifest.json'}].map(e=>e.url);return caches.open(t).then((function(n){return n.addAll(["./",...e])}))}self.addEventListener("install",(function(e){e.waitUntil(i())})),self.addEventListener("install",(function(e){e.waitUntil(i().then((function(){return self.skipWaiting()})))})),self.addEventListener("fetch",(function(e){var n;e.respondWith((n=e.request,fetch(n).then((function(e){return e.ok?e:r(n)})).catch((function(){return r(n)}))))})),self.addEventListener("activate",(function(e){e.waitUntil(caches.keys().then((function(e){return Promise.all(e.map((function(e){if(e!==t)return caches.delete(e)})))})).then((function(){return self.clients.claim()})))}))}]);