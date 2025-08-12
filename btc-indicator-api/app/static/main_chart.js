const margin = { top: 70, bottom: 50, right: 60, left: 80 };
const width = 1600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const dates = window.dates;
const prices = window.prices;

// Tworzymy tablicę obiektów { date, price }
const data = dates.map((d, i) => ({
    Date: new Date(d),
    Price: prices[i]
}));

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Skale
x.domain(d3.extent(data, d => d.Date));
y.domain([0, d3.max(data, d => d.Price)]);

// Oś X
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

// Oś Y (po prawej)
svg.append("g")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(y).tickFormat(d => `$${d.toFixed(2)}`));

// Linia
const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.Price));

// Pole pod linią
const area = d3.area()
    .x(d => x(d.Date))
    .y0(height)
    .y1(d => y(d.Price));

// Rysowanie obszaru
svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", "#85bb65")
    .style("opacity", .5);

// Rysowanie linii
svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#85bb65")
    .attr("stroke-width", 1.5)
    .attr("d", line);