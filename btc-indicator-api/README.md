# BTC Indicator API

A FastAPI service that fetches current and historical Bitcoin data and calculates basic indicators like 7-day EMA and 14-day RSI.

## Features

- Fetches BTC price from public API
- Saves data to SQLite via SQLAlchemy
- Exposes `/btc/indicators` endpoint with:
  - Current price
  - 7-day average
  - 7-day EMA
  - 14-day RSI

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload