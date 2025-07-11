from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
from pathlib import Path

from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="app/templates")

from app.data.btc_price_downloader import download_btc_price_history


app = FastAPI()

URL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"


@app.get("/", response_class=HTMLResponse)
async def read_chart(request: Request):
    file_path = Path("app/data/btc_price_history.json")
    with file_path.open() as f:
        data = json.load(f)

    labels = [int(pair[0]) for pair in data]
    values = [pair[1] for pair in data]

    return templates.TemplateResponse("chart.html", {
        "request": request,
        "labels": labels,
        "values": values
    })


if __name__ == "__main__":

    download_btc_price_history(URL, "usd" )

