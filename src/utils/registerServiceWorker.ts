export default function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('ServiceWorker registrado con éxito: ', registration.scope);
        })
        .catch((error) => {
          console.log('Fallo en el registro del ServiceWorker: ', error);
        });
    });
  }
}