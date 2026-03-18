// キャッシュ名にバージョンを含める（更新時に重要）
const CACHE_NAME = '20260318 20:31';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

navigator.serviceWorker.register('/sw.js').then(reg => {
  // 起動時に明示的にアップデートを確認
  reg.update(); 
  
  reg.onupdatefound = () => {
    const newWorker = reg.installing;
    newWorker.onstatechange = () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // ここで「新しいバージョンがあります。再起動しますか？」等のUIを出す
        if (confirm('新しいバージョンが利用可能です。更新しますか？')) {
          location.reload();
        }
      }
    };
  };
});

self.addEventListener('install', (event) => {
  // 待機状態をスキップして、すぐに有効化させる
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  // 古いキャッシュを削除し、すぐに全クライアント（タブ）を制御下に置く
  event.waitUntil(clients.claim());
});