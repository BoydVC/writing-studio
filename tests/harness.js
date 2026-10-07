// Reads [[fn, ...args], ...] JSON on stdin, runs each against web/metrics.js, prints results as JSON.
const M = require('../web/metrics.js');
let buf = ''; process.stdin.on('data', d => buf += d).on('end', () => {
  const out = JSON.parse(buf).map(([fn, ...args]) => { try { return { ok: true, v: M[fn](...args) }; } catch (e) { return { ok: false, err: String(e) }; } });
  process.stdout.write(JSON.stringify(out));
});
