const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy solo per le API del backend, non per i file statici
  app.use(
    '/surveys',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );

  // Se hai altri endpoint API, aggiungili qui
  // app.use(
  //   '/api',
  //   createProxyMiddleware({
  //     target: 'http://localhost:8000',
  //     changeOrigin: true,
  //   })
  // );
};
