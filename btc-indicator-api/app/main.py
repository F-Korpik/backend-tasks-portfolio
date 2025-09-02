import json
from pathlib import Path

from app.data.csv_to_json import csv_to_json
from app.data.update_price_info import update_price_info
from app.analysis.timeline_analysis import halving_cycle_high_low

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
DATA = None

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

URL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"






@app.get("/", response_class=HTMLResponse)
async def read_chart(request: Request):
    update_price_info(URL, "usd")

    file_path = Path("app/data/btc_price_history.json")
    with file_path.open() as f:
        data = json.load(f)

    data.reverse()
    global DATA
    DATA = data

    dates = [row[0] for row in data]
    prices = [float(row[1]) for row in data]

    # halving_cycle_high_low(data)

    return templates.TemplateResponse("chart.html", {
        "request": request,
        "dates": dates,
        "prices": prices
    })


@app.get("/csv_to_json")
def convert_csv_to_json():
    csv_to_json("app/data/btc_price_history.csv", "app/data/btc_price_history.json")

@app.get("/update_minmax_data")
def update_minmax_data():
    halving_cycle_high_low(DATA)


if __name__ == "__main__":
    # csv_to_json("data/btc_price_history.csv", "data/btc_price_history.json")
    # update_price_info(URL, "usd")

    pass
