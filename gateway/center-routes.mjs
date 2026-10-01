export function canonicalCenterPath(pathname) {
  return /^\/(orbit|relay|waypoint|atlas|ravin)$/.test(pathname) ? pathname + '/' : null;
}

export function gatewayRedirect(value, upstream, requestPath, center, upstreamPrefix = '') {
  if (!value) return value;
  const target = new URL(upstream);
  const original = new URL(value, new URL(requestPath, target));
  if (original.origin !== target.origin) return value;
  let path = original.pathname;
  if (upstreamPrefix && (path === upstreamPrefix || path.startsWith(upstreamPrefix + '/'))) path = path.slice(upstreamPrefix.length) || '/';
  if (path !== '/' + center && !path.startsWith('/' + center + '/')) path = '/' + center + (path.startsWith('/') ? path : '/' + path);
  return path + original.search + original.hash;
}
