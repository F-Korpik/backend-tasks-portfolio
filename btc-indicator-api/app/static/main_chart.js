const margin = { top: 70, bottom: 50, right: 60, left: 80 };
const width = 1600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("/static/btc.csv").then(data => {
    console.log(data);  // debugowanie

    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
        d.Date = parseDate(d.Date);
        d.Price = +d["Price in USD"];
    });

    x.domain(d3.extent(data, d => d.Date));
    y.domain([0, d3.max(data, d => d.Price)]);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Y axis (po prawej)
    svg.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(y).tickFormat(d => {
            if (isNaN(d)) return "";
            return `$${d.toFixed(2)}`;
        }));

    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Price));

    const area = d3.area()
        .x(d => x(d.Date))
        .y0(height)
        .y1(d => y(d.Price));

    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area)
        .style("fill", "#85bb65")
        .style("opacity", .5);

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#85bb65")
        .attr("stroke-width", 1.5)
        .attr("d", line);
});