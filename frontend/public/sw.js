self.addEventListener('install', (event) => {
  console.log('PWA Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Add caching logic here if needed
});
