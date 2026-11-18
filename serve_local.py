"""Preview the Drop folder locally with the same Excel contact handler."""
import os
import sqlite3
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

from api.contact import handler as ContactHandler

ROOT = Path(__file__).resolve().parent


class Preview(SimpleHTTPRequestHandler, ContactHandler):
    def store_message(self, values):
        if all(os.getenv(key) for key in ("MS_CLIENT_ID", "MS_REFRESH_TOKEN")):
            return super().store_message(values)
        try:
            with sqlite3.connect(ROOT / "contacts.sqlite3") as db:
                db.execute("CREATE TABLE IF NOT EXISTS messages (received_utc TEXT, name TEXT, email TEXT, message TEXT)")
                db.execute("INSERT INTO messages VALUES (?, ?, ?, ?)", values)
        except sqlite3.Error as error:
            raise OSError("Unable to save message") from error

    def do_POST(self):
        if urlsplit(self.path).path != "/api/contact":
            return self.send_error(404)
        return ContactHandler.do_POST(self)

    def do_GET(self):
        if urlsplit(self.path).path == "/api/contact":
            return self.reply(204)
        if urlsplit(self.path).path in {"/", "/index.html"}:
            data = (ROOT / "Drop/index.html").read_text(encoding="utf-8")
            if all(os.getenv(k) for k in ("MS_CLIENT_ID", "MS_REFRESH_TOKEN")):
                data = data.replace('<html lang="en">', '<html lang="en" data-excel-contact="enabled">', 1)
            body = data.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


if __name__ == "__main__":
    if not (ROOT / "Drop/index.html").is_file():
        raise SystemExit("Extract the whole ZIP first. Keep the Drop folder beside stat.bat.")
    config = ROOT / ".env.local"
    if config.exists():
        for line in config.read_text(encoding="utf-8-sig").splitlines():
            key, _, value = line.partition("=")
            if key in ("MS_CLIENT_ID", "MS_REFRESH_TOKEN"):
                os.environ.setdefault(key, value.strip())
    with ThreadingHTTPServer(("127.0.0.1", 0), partial(Preview, directory=str(ROOT / "Drop"))) as server:
        url = f"http://127.0.0.1:{server.server_port}/"
        print(f"Portfolio running at {url}\nPress Ctrl+C to stop.", flush=True)
        webbrowser.open(url)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
