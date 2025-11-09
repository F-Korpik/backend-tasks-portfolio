import json
from pathlib import Path

from app.analysis.timeline_analysis import halving_cycle_high_low
from app.data.csv_to_json import csv_to_json
from app.data.update_price_info import update_price_info
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()
DATA = None

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

URL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"

btc_price_data_file = Path("app/data/btc_price_history.json")
rm_200_file = Path("app/data/rm_200_data.json")
rm_30_file = Path("app/data/rm_30_data.json")



@app.get("/", response_class=HTMLResponse)
async def read_chart(request: Request):
    update_price_info(URL, "usd")


    with btc_price_data_file.open() as btc_prices_f:
        data = json.load(btc_prices_f)

    data.reverse()
    global DATA
    DATA = data

    dates = [row[0] for row in data]
    prices = [float(row[1]) for row in data]

    with rm_200_file.open() as rm_200_f:
        rm_200_data = json.load(rm_200_f)

    rm_200 = list(rm_200_data.values())

    with rm_30_file.open() as rm_30_f:
        rm_30_data = json.load(rm_30_f)

    rm_30 = list(rm_30_data.values())


    while len(rm_200) < len(prices):
        rm_200.append(rm_200[-1]) # wyjebać to i dodać automatyczną aktualizację średnich kroczących

    while len(rm_30) < len(prices):
        rm_30.append(rm_30[-1]) # wyjebać to i dodać automatyczną aktualizację średnich kroczących


    return templates.TemplateResponse("chart.html", {
        "request": request,
        "dates": dates,
        "prices": prices,
        "rm_200": rm_200,
        "rm_30": rm_30
    })


@app.get("/csv_to_json")
def convert_csv_to_json():
    csv_to_json("app/data/btc_price_history.csv", "app/data/btc_price_history.json")

@app.get("/update_minmax_data")
def update_minmax_data():
    rm_200, rm_30 = halving_cycle_high_low(DATA)


if __name__ == "__main__":
    # csv_to_json("data/btc_price_history.csv", "data/btc_price_history.json")
    # update_price_info(URL, "usd")

    pass
