#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
from urllib.parse import urlparse
import json

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "4188"))

CSP = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "script-src 'self' https://static.cloudflareinsights.com; "
    "style-src 'self'; "
    "font-src 'self'; "
    "img-src 'self' data:; "
    "connect-src 'self' https://cloudflareinsights.com; "
    "media-src 'self'; "
    "manifest-src 'self'; "
    "worker-src 'none'; "
    "upgrade-insecure-requests"
)

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".ttf": "font/ttf",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _health_payload(self):
        return json.dumps({
            "status": "ok",
            "service": "tacos-sinaloa",
            "release": "v6.9.1"
        }, separators=(",", ":")).encode("utf-8")

    def _send_health(self, include_body=True):
        payload = self._health_payload()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if include_body:
            self.wfile.write(payload)

    def do_GET(self):
        if urlparse(self.path).path == "/healthz":
            self._send_health(include_body=True)
            return
        super().do_GET()

    def do_HEAD(self):
        if urlparse(self.path).path == "/healthz":
            self._send_health(include_body=False)
            return
        super().do_HEAD()

    def end_headers(self):
        path = urlparse(self.path).path
        suffix = Path(path).suffix.lower()

        if path == "/healthz":
            pass
        elif path in {"/", "/index.html"} or suffix in {".html", ""}:
            self.send_header("Cache-Control", "no-cache, max-age=0, must-revalidate")
        elif suffix in {".css", ".js", ".json", ".xml", ".txt", ".webmanifest"}:
            self.send_header("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")
        elif suffix in {".jpg", ".jpeg", ".png", ".svg", ".ico", ".ttf", ".woff", ".woff2"}:
            self.send_header("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400")

        self.send_header("Content-Security-Policy", CSP)
        self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
        )
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f'{self.address_string()} - {fmt % args}', flush=True)

if __name__ == "__main__":
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
