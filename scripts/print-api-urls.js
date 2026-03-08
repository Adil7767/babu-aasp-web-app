#!/usr/bin/env node
import os from 'os';

const port = process.env.PORT || 3000;
const versionPath = process.env.NEXT_PUBLIC_API_VERSION_PATH || '/v1';

function getNetworkUrl() {
  const ifaces = os.networkInterfaces();
  for (const addrs of Object.values(ifaces)) {
    if (!addrs) continue;
    const addr = addrs.find((a) => a.family === 'IPv4' && !a.internal);
    if (addr) return `http://${addr.address}:${port}`;
  }
  return `http://localhost:${port}`;
}

const networkUrl = getNetworkUrl();
const localUrl = `http://localhost:${port}`;

console.log('\n  API URLs (use for mobile EXPO_PUBLIC_API_URL):');
console.log('  - Local:   ', localUrl);
console.log('  - Network: ', networkUrl);
console.log('  - Endpoint example:', `${networkUrl}${versionPath}/api/auth/login`);
console.log('  - Swagger docs:    ', `${networkUrl}${versionPath}/docs`);
console.log('');
