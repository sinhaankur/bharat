// serve-pmtiles-raw.mjs — a tiny static server for the RAW india-buildings.pmtiles that
// supports HTTP Range requests + CORS. This is what protomaps-leaflet needs (it range-reads
// the .pmtiles archive itself). Unlike `pmtiles serve` (which proxies Z/X/Y tiles), this hands
// out the raw file, matching the atlas reader AND how R2/WatchTower will serve it.
//   node serve-pmtiles-raw.mjs "/Volumes/Game Drive" 8090
import http from 'node:http';
import { stat, open } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.argv[2] || '/Volumes/Game Drive';
const PORT = Number(process.argv[3] || 8090);
const MIME = { '.pmtiles': 'application/octet-stream', '.json': 'application/json' };

const server = http.createServer(async (req, res) => {
  // CORS — allow any origin (private/local); expose the range headers the reader reads
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const path = normalize(join(ROOT, decodeURIComponent(req.url.split('?')[0])));
  if (!path.startsWith(normalize(ROOT))) { res.writeHead(403); return res.end('forbidden'); }

  let st;
  try { st = await stat(path); } catch { res.writeHead(404); return res.end('not found'); }
  if (st.isDirectory()) { res.writeHead(404); return res.end('is a directory'); }

  const type = MIME[extname(path)] || 'application/octet-stream';
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Type', type);

  const range = req.headers.range;
  const fh = await open(path, 'r');
  try {
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (isNaN(start) || start < 0) start = 0;
      if (isNaN(end) || end >= st.size) end = st.size - 1;
      if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') return res.end();
      fh.createReadStream({ start, end }).pipe(res).on('close', () => fh.close());
    } else {
      res.writeHead(200, { 'Content-Length': st.size });
      if (req.method === 'HEAD') { await fh.close(); return res.end(); }
      fh.createReadStream().pipe(res).on('close', () => fh.close());
    }
  } catch (e) { await fh.close(); res.writeHead(500); res.end('error'); }
});

server.listen(PORT, () => {
  console.log(`raw PMTiles server → http://localhost:${PORT}/  (root: ${ROOT}, Range+CORS on)`);
});
