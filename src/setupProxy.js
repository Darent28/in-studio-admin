const { createProxyMiddleware } = require('http-proxy-middleware');
const net = require('net');

const LOCAL_TARGET = 'http://localhost:8080';
const HOSTED_TARGET = process.env.REACT_APP_PROXY_TARGET;
const LOCAL_HOST = 'localhost';
const LOCAL_PORT = 8080;
const PROBE_TIMEOUT_MS = 300;
const PROBE_INTERVAL_MS = 3000;

let useLocal = false;

function setUseLocal(next) {
  if (next !== useLocal) {
    useLocal = next;
    console.log(`[setupProxy] Proxying /api to ${useLocal ? `LOCAL (${LOCAL_TARGET})` : `HOSTED (${HOSTED_TARGET})`}`);
  }
}

function probeLocal() {
  const socket = net.connect({ host: LOCAL_HOST, port: LOCAL_PORT, timeout: PROBE_TIMEOUT_MS });
  socket.once('connect', () => { setUseLocal(true); socket.destroy(); });
  socket.once('timeout', () => { setUseLocal(false); socket.destroy(); });
  socket.once('error', () => setUseLocal(false));
}

probeLocal();
setInterval(probeLocal, PROBE_INTERVAL_MS);

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: HOSTED_TARGET,
      changeOrigin: true,
      router: () => (useLocal ? LOCAL_TARGET : HOSTED_TARGET),
      onError: () => {
        // Local backend dropped mid-session — fall back immediately instead
        // of waiting for the next periodic probe.
        setUseLocal(false);
      },
    })
  );
};
