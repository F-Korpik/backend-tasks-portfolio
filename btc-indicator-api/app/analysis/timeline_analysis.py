from datetime import datetime
import pandas as pd
import json

DATA = None

def prepare_data(raw_data):
    data = [
        (
            datetime.strptime(date, "%Y-%m-%d") if isinstance(date, str) else date,
            float(price),
        )
        for date, price in raw_data
    ]

    global DATA
    DATA = data
    return data


def walking_average(data, window_size):
    dates = [row[0] for row in data]
    prices = [float(row[1]) for row in data]

    df = pd.DataFrame({"price": prices})
    df["moving_average"] = df["price"].rolling(window=window_size, min_periods=1).mean()
    df["moving_average"] = df["moving_average"].round(2)

    wa = dict(zip(dates, df["moving_average"]))
    return wa


halvings = [
    datetime(2012, 11, 28),
    datetime(2016, 7, 9),
    datetime(2020, 5, 11),
    datetime(2024, 4, 20),
]


def find_bessa_hossa(data):

    rm_200 = walking_average(data, 200)
    rm_30 = walking_average(data, 30)

    return rm_200, rm_30

def halving_cycle_high_low(raw_data, rm_200_file: str = "app/data/rm_200_data.json", rm_30_file: str = "app/data/rm_30_data.json"):
    data = prepare_data(raw_data)

    rm_200, rm_30 = find_bessa_hossa(data)

    prices_by_halvings = {}
    min_dates = []
    max_dates = []

    # początek pierwszej sekcji = najwcześniejsza data w danych
    start_points = [min(data, key=lambda x: x[0])[0]] + halvings

    # pary (start, stop)
    for i, start in enumerate(start_points):
        end = halvings[i] if i < len(halvings) else datetime.now()
        section = {}

        for date, price in data:
            if start <= date < end:
                section[date] = price

        prices_by_halvings[start] = section

    for halving_date, section in prices_by_halvings.items():
        if section:
            min_date = min(section, key=section.get)
            max_date = max(section, key=section.get)

            min_dates.append((min_date, section[min_date]))
            max_dates.append((max_date, section[max_date]))


    print("Minima:", min_dates)
    print("Maksima:", max_dates)

    rm_200 = {dt.strftime("%Y-%m-%d"): val for dt, val in rm_200.items()}
    with open(rm_200_file, "w") as f:
        json.dump(rm_200, f, indent=2)

    rm_30 = {dt.strftime("%Y-%m-%d"): val for dt, val in rm_30.items()}
    with open(rm_30_file, "w") as f:
        json.dump(rm_30, f, indent=2)



    print(f"✅ Dane średnich kroczących zapisano do {rm_200_file} i {rm_30_file}")


    return rm_200, rm_30