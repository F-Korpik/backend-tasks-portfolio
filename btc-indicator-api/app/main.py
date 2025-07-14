from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
from pathlib import Path


from app.data.update_price_info import update_price_info
from app.data.csv_to_json import csv_to_json

app = FastAPI()

templates = Jinja2Templates(directory="app/templates")

URL = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"


@app.get("/", response_class=HTMLResponse)
async def read_chart(request: Request):
    update_price_info(URL, "usd")

    file_path = Path("app/data/btc_price_history.json")
    with file_path.open() as f:
        data = json.load(f)

    data.reverse()

    labels = [row[0] for row in data]
    values = [float(row[1]) for row in data]

    return templates.TemplateResponse("chart.html", {
        "request": request,
        "labels": labels,
        "values": values
    })

@app.get("/csv_to_json")
def convert_csv_to_json():
    csv_to_json("app/data/btc_price_history.csv", "app/data/btc_price_history.json")


if __name__ == "__main__":
    # csv_to_json("data/btc_price_history.csv", "data/btc_price_history.json")
    # update_price_info(URL, "usd")

    pass

