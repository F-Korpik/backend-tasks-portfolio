from datetime import datetime


halvings = [
    datetime(2012, 11, 28),
    datetime(2016, 7, 9),
    datetime(2020, 5, 11),
    datetime(2024, 4, 20),
]


def halving_cycle_high_low(data):
    data = [
        (
            datetime.strptime(date, "%Y-%m-%d") if isinstance(date, str) else date,
            float(price),
        )
        for date, price in data
    ]

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


    return prices_by_halvings