// Service worker exclusivo da Área de Trabalho.
// Escopo limitado a /area-de-trabalho/: não intercepta nenhum outro app do mesmo domínio.
const CACHE = 'eguilherme88-area-de-trabalho-v1';
const SCOPE = new URL('./', self.location).pathname; // "/area-de-trabalho/"
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  // Apaga só caches antigos DESTE app (mesmo prefixo); nunca toca nos de outros apps.
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('eguilherme88-area-de-trabalho-') && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  // Rede primeiro (sempre a versão mais nova); cache só quando estiver offline.
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
