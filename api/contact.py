"""Vercel Python function for the portfolio's private Excel inbox."""
import json
import os
import re
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def append_row(values):
    fields = {
        "client_id": os.environ["MS_CLIENT_ID"],
        "refresh_token": os.environ["MS_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    with urlopen(Request(token_url, data=urlencode(fields).encode()), timeout=8) as response:
        token = json.load(response)["access_token"]
    url = ("https://graph.microsoft.com/v1.0/me/drive/root:/PortfolioContacts.xlsx:"
           "/workbook/tables/Contacts/rows/add")
    req = Request(url, data=json.dumps({"values": [values]}).encode(),
                  headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urlopen(req, timeout=15) as response:
        if response.status not in (200, 201):
            raise OSError("Unexpected Excel response")


def safe_text(value):
    return "'" + value if value.startswith(("=", "+", "-", "@")) else value


class handler(BaseHTTPRequestHandler):
    def reply(self, status):
        self.send_response(status)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def store_message(self, values):
        append_row(values)

    def do_GET(self):
        self.reply(204 if all(os.getenv(key) for key in ("MS_CLIENT_ID", "MS_REFRESH_TOKEN")) else 503)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 24000:
                return self.reply(413)
            if self.headers.get_content_type() != "application/json":
                return self.reply(415)
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict) or data.get("website"):
                return self.reply(400)
            values = []
            for key, limit in (("name", 100), ("email", 254), ("message", 3000)):
                value = data.get(key)
                if not isinstance(value, str) or not 0 < len(value.strip()) <= limit:
                    return self.reply(400)
                values.append(value.strip())
            if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", values[1]):
                return self.reply(400)
        except (ValueError, UnicodeError):
            return self.reply(400)
        try:
            self.store_message([datetime.now(timezone.utc).isoformat(), *map(safe_text, values)])
        except (KeyError, ValueError, OSError):
            return self.reply(503)
        self.reply(201)
