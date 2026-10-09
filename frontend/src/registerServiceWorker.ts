export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.MODE !== 'test') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update();
          console.log('[AetherEdge PWA] Service Worker registered and updated:', reg.scope);
        })
        .catch((err) => {
          console.warn('[AetherEdge PWA] Service Worker registration failed:', err);
        });
    });
  }
}
