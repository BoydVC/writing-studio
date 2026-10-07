"""Writing Studio server on 127.0.0.1:4257 (stdlib). Serves the offline snapshot; drafts live in the browser (localStorage), never on the server."""
import http.server, os, socketserver
HERE = os.path.dirname(os.path.abspath(__file__)); PORT = int(os.environ.get("WS_PORT", 4257))
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        p = self.path.split("?")[0]
        if p == "/healthz": return self._send(200, b'{"ok":true}', "application/json")
        f = {"/": "dist/writing-studio-snapshot.html", "/index.html": "dist/writing-studio-snapshot.html", "/metrics.js": "web/metrics.js"}.get(p)
        if not f or not os.path.exists(os.path.join(HERE, f)): return self._send(404, b"not found", "text/plain")
        self._send(200, open(os.path.join(HERE, f), "rb").read(), "text/javascript" if f.endswith(".js") else "text/html; charset=utf-8")
    def _send(self, c, b, ct):
        self.send_response(c); self.send_header("Content-Type", ct); self.send_header("Content-Length", str(len(b))); self.send_header("Cache-Control", "no-store"); self.end_headers(); self.wfile.write(b)
    def log_message(self, *a): pass
class S(socketserver.ThreadingMixIn, http.server.HTTPServer): daemon_threads = True; allow_reuse_address = True
if __name__ == "__main__":
    print(f"Writing Studio on http://127.0.0.1:{PORT}", flush=True); S(("127.0.0.1", PORT), H).serve_forever()
