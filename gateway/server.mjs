import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 10000);

const ORBIT = process.env.ARROW_ORBIT_UPSTREAM || 'https://enterarrow-orbit.onrender.com';
const RELAY = process.env.ARROW_RELAY_UPSTREAM || 'https://enterarrow-relay.onrender.com';
const WAYPOINT = process.env.ARROW_WAYPOINT_UPSTREAM || 'https://enterarrow-waypoint.onrender.com';
const ATLAS = process.env.ARROW_ATLAS_UPSTREAM || 'https://link9060.github.io';
const RAVIN = process.env.ARROW_RAVIN_UPSTREAM || 'https://ravin-hyeq.onrender.com';

app.disable('x-powered-by');
app.use((req,res,next)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(self), geolocation=()');
  next();
});

app.use(express.static(path.join(__dirname,'public'), {
  extensions:['html'],
  maxAge:'5m',
  etag:true,
}));

function proxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin:true,
    xfwd:true,
    ws:true,
    pathRewrite,
    on: {
      proxyReq(proxyReq, req) {
        proxyReq.setHeader('x-arrow-gateway','enterarrow.com');
        proxyReq.setHeader('x-forwarded-host',req.headers.host || 'enterarrow.com');
      },
      error(error, req, res) {
        console.error('[ARROW gateway proxy]', req.url, error?.message || error);
        if (!res.headersSent) {
          res.writeHead(502, {'content-type':'text/plain; charset=utf-8'});
        }
        res.end('ARROW center is temporarily unavailable.');
      },
    },
  });
}

// The path-aware Next exports already include their public base path, so preserve it.
app.use('/orbit', proxy(ORBIT));
app.use('/relay', proxy(RELAY));
app.use('/waypoint', proxy(WAYPOINT));

// Atlas currently publishes from Resonant-Field GitHub Pages.
app.use('/atlas', proxy(ATLAS, (p) => '/Resonant-Field' + (p === '/' ? '/' : p)));

// RAVIN remains a live server. Strip /ravin so its existing /api endpoints stay intact.
app.use('/ravin', proxy(RAVIN, (p) => p || '/'));

// Friendly path normalization.
for (const center of ['orbit','relay','ravin','atlas','waypoint']) {
  app.get('/'+center, (_req,res)=>res.redirect(308,'/'+center+'/'));
}

app.get('/health', (_req,res)=>res.json({
  ok:true,
  service:'ARROW Gateway',
  centers:['orbit','relay','ravin','atlas','waypoint'],
}));

app.use((_req,res)=>{
  res.status(404).sendFile(path.join(__dirname,'public','404.html'));
});

app.listen(port, '0.0.0.0', ()=>{
  console.log(`ARROW gateway listening on :${port}`);
});
