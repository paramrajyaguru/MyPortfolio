"""Run locally to authorize the Excel connection. The secret stays in .env.local."""
import json
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import urlopen

base = "https://login.microsoftonline.com/common/oauth2/v2.0/"
client = input("Microsoft app client ID: ").strip()
def post(path, fields):
    with urlopen(base + path, data=urlencode(dict(fields, client_id=client)).encode(), timeout=15) as response:
        return json.load(response)

device = post("devicecode", {"scope": "https://graph.microsoft.com/Files.ReadWrite offline_access"})
print(device["message"])
interval = device["interval"]
while True:
    time.sleep(interval)
    try:
        result = post("token", {"grant_type": "urn:ietf:params:oauth:grant-type:device_code", "device_code": device["device_code"]})
        break
    except HTTPError as exc:
        reason = json.load(exc).get("error")
        if reason == "slow_down":
            interval += 5
        elif reason != "authorization_pending":
            raise SystemExit("Microsoft authorization ended: " + str(reason))
p = Path(".env.local")
with p.open("x") as f:
    p.chmod(0o600)
    f.write("MS_CLIENT_ID=" + client + "\nMS_REFRESH_TOKEN=" + result["refresh_token"] + "\n")
print("Created .env.local. Set both values privately in your Vercel project.")
