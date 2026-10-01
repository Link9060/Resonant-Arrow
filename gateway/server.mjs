import express from 'express';
import {canonicalCenterPath,gatewayRedirect} from './center-routes.mjs';
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
  setHeaders(res, filePath) {
    const name = path.basename(filePath);
    if (
      name === 'index.html' ||
      name === 'gateway-auth.js' ||
      name === 'gateway-callback.js' ||
      name === 'gateway-signout.js' ||
      name === 'arrow-auth-guard.js'
    ) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
}));

app.use((req,res,next)=>{const canonical=canonicalCenterPath(req.path);if(canonical)return res.redirect(308,canonical+req.url.slice(req.path.length));next();});

function proxy(target, pathRewrite, center, upstreamPrefix = '') {
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
      proxyRes(response, req) {
        if(response.headers.location) response.headers.location=gatewayRedirect(response.headers.location,target,pathRewrite(req.url,req),center,upstreamPrefix);
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

// Browser-visible center prefixes belong to the gateway. Dedicated upstreams
// serve their exported files from /, while the generated HTML/assets still
// reference the public base path (e.g. /orbit/_next/...). Strip exactly one
// center prefix when proxying upstream.
const stripPrefix = (prefix) => (_path, req) => {
  const rewritten = req.originalUrl.replace(new RegExp('^/' + prefix + '(?=/|\\?|$)'), '');
  return rewritten || '/';
};

app.use('/orbit', proxy(ORBIT, stripPrefix('orbit'), 'orbit'));
app.use('/relay', proxy(RELAY, stripPrefix('relay'), 'relay'));
app.use('/waypoint', proxy(WAYPOINT, stripPrefix('waypoint'), 'waypoint'));

// Atlas currently publishes from Resonant-Field GitHub Pages.
app.use('/atlas', proxy(ATLAS, (_path, req) =>
  req.originalUrl.replace(/^\/atlas(?=\/|\?|$)/, '/Resonant-Field'), 'atlas', '/Resonant-Field'
));

// RAVIN remains a live server. Strip /ravin so its existing /api endpoints stay intact.
app.use('/ravin', proxy(RAVIN, stripPrefix('ravin'), 'ravin'));

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
