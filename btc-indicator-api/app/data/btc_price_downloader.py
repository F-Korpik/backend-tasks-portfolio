import requests
import json
from datetime import datetime, timedelta

def download_btc_price_history(url, currency: str = "usd", output_file: str = "data/btc_price_history.json") -> None:
    now = datetime.now()
    start_of_day = datetime(now.year, now.month, now.day)

    params = {
        "vs_currency": currency,
        "from": int((start_of_day - timedelta(days=30)).timestamp()),
        "to": int(now.timestamp()),
    }

    response = requests.get(url, params=params)
    if response.status_code != 200: raise RuntimeError(f"❌ Błąd pobierania danych: {response.status_code} {response.text}")

    data = response.json()

    with open(output_file, "w") as f:
        json.dump(data["prices"], f, indent=2)

    print(f"✅ Dane z zapisane do: {output_file}")
