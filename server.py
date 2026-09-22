#!/usr/bin/env python3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "4188"))

CSP = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "form-action 'self'; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "script-src 'self'; "
    "style-src 'self'; "
    "font-src 'self'; "
    "img-src 'self' data:; "
    "connect-src 'self'; "
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

    def end_headers(self):
        path = urlparse(self.path).path
        suffix = Path(path).suffix.lower()

        if path in {"/", "/index.html"} or suffix in {".html", ""}:
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
