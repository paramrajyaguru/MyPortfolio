"""Read messages collected by the local portfolio."""
from pathlib import Path
import sqlite3

database = Path(__file__).with_name("contacts.sqlite3")
if not database.exists():
    print("Your inbox is empty.")
else:
    with sqlite3.connect(database) as connection:
        for received, name, email, message in connection.execute(
            "SELECT received_utc, name, email, message FROM messages ORDER BY rowid DESC"
        ):
            print(f"{received} | {name} <{email}>\n{message}\n")
