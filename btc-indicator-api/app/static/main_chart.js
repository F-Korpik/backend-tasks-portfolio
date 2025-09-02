const margin = { top: 70, bottom: 50, right: 60, left: 80 };
const width = 1600 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const dates = window.dates;
const prices = window.prices;

// Create the SVG element and append it to the chart container
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Tooltipy (divy)
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")

const tooltipRawDate = d3.select("body")
  .append("div")
  .attr("class", "tooltip")

// Gradient
const gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("x2", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

gradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 1);

gradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#85bb65")
  .attr("stop-opacity", 0);

// Tworzymy tablicę obiektów { Date, Price }
const data = dates.map((d, i) => ({
    Date: new Date(d),
    Price: prices[i]
}));

// Set the domains for the x and y scales
x.domain(d3.extent(data, d => d.Date));
y.domain([0, d3.max(data, d => d.Price)]);

// Oś X
svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .style("font-size", "14px")
    .call(d3.axisBottom(x)
      .tickValues(x.ticks(d3.timeYear.every(1)))
      .tickFormat(d3.timeFormat("%Y")))
    .selectAll(".tick line")
    .style("stroke-opacity", 1)
  svg.selectAll(".tick text")
    .attr("fill", "#777");

  // Add the y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width},0)`)
    .style("font-size", "14px")
    .call(d3.axisRight(y)
      .ticks(10)
      .tickFormat(d => {
        if (isNaN(d)) return "";
        return `$${d.toFixed(2)}`;
      }))
    .selectAll(".tick text")
    .style("fill", "#777");

// Set up the line generator
const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.Price));

// Create an area generator
const area = d3.area()
    .x(d => x(d.Date))
    .y0(height)
    .y1(d => y(d.Price));

// Add the area path
svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", "url(#gradient)")
    .style("opacity", .5);

// Add the line path
svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "#85bb65")
    .attr("stroke-width", 1.5)
    .attr("d", line);

// Add an interactive circle
const circle = svg.append("circle")
  .attr("r", 0)
  .attr("fill", "red")
  .style("stroke", "white")
  .attr("opacity", 0.7)
  .style("pointer-events", "none");

// Add red lines extending from the circle to the date and value
const tooltipLineX = svg.append("line")
  .attr("class", "tooltip-line")
  .attr("id", "tooltip-line-x")
  .attr("stroke", "red")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

const tooltipLineY = svg.append("line")
  .attr("class", "tooltip-line")
  .attr("id", "tooltip-line-y")
  .attr("stroke", "red")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "2,2");

// Prostokąt nasłuchujący ruch myszy
const listeningRect = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all");

listeningRect.on("mousemove", function(event) {
  const [xCoord] = d3.pointer(event, this);
  const bisectDate = d3.bisector(d => d.Date).left;
  const x0 = x.invert(xCoord);
  const i = bisectDate(data, x0, 1);
  const d0 = data[i - 1];
  const d1 = data[i];
  const d = (!d1 || (x0 - d0.Date < d1.Date - x0)) ? d0 : d1;
  if (!d) return;

  const xPos = x(d.Date);
  const yPos = y(d.Price);

  // Aktualizacja pozycji kółka
  circle.attr("cx", xPos).attr("cy", yPos)
        .transition().duration(50).attr("r", 5);

  // Linie pomocnicze
  tooltipLineX.style("display", "block")
    .attr("x1", xPos).attr("x2", xPos)
    .attr("y1", 0).attr("y2", height);

  tooltipLineY.style("display", "block")
    .attr("y1", yPos).attr("y2", yPos)
    .attr("x1", 0).attr("x2", width);

  // Tooltipy
  tooltip.style("display", "block")
    .style("left", `${width + margin.left + 30}px`)
    .style("top", `${yPos + margin.top}px`)
    .html(`$${d.Price.toFixed(2)}`);

  tooltipRawDate.style("display", "block")
    .style("left", `${xPos + margin.left}px`)
    .style("top", `${height + margin.top + 10}px`)
    .html(d.Date.toISOString().slice(0, 10));
});

listeningRect.on("mouseleave", () => {
  circle.transition().duration(50).attr("r", 0);
  tooltip.style("display", "none");
  tooltipRawDate.style("display", "none");
  tooltipLineX.style("display", "none");
  tooltipLineY.style("display", "none");
});

// Define the slider
const sliderRange = d3
    .sliderBottom()
    .min(d3.min(data, d => d.Date))
    .max(d3.max(data, d => d.Date))
    .width(1435)
    .tickFormat(d3.timeFormat('%Y-%m-%d'))
    .ticks(3)
    .default([d3.min(data, d => d.Date), d3.max(data, d => d.Date)])
    .fill('#85bb65');


  sliderRange.on('onchange', val => {
    // Set new domain for x scale
    x.domain(val);

    // Filter data based on slider values
    const filteredData = data.filter(d => d.Date >= val[0] && d.Date <= val[1]);

    // Update the line and area to new domain
    svg.select(".line").attr("d", line(filteredData));
    svg.select(".area").attr("d", area(filteredData));
    // Set new domain for y scale based on new data
    y.domain([0, d3.max(filteredData, d => d.Price)]);


    // Update the x-axis with new domain
    svg.select(".x-axis")
      .transition()
      .duration(300) // transition duration in ms
      .call(d3.axisBottom(x)
        .tickValues(x.ticks(d3.timeYear.every(1)))
        .tickFormat(d3.timeFormat("%Y")));

    // Update the y-axis with new domain
    svg.select(".y-axis")
      .transition()
      .duration(300) // transition duration in ms
      .call(d3.axisRight(y)
        .ticks(10)
        .tickFormat(d => {
          if (d <= 0) return "";
          return `$${d.toFixed(2)}`;
        }));

  });

  // Add the slider to the DOM
  const gRange = d3
    .select('#slider-range')
    .append('svg')
    .attr('width', 1800)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(90,30)');

  gRange.call(sliderRange);

// Tytuł wykresu
svg.append("text")
  .attr("class", "chart-title")
  .attr("x", -margin.left + 10)
  .attr("y", -margin.top / 2)
  .style("font-size", "20px")
  .style("font-weight", "bold")
  .style("font-family", "sans-serif")
  .text("BTC price chart");

// Źródło danych
svg.append("text")
  .attr("class", "source-credit")
  .attr("x", width - 110)
  .attr("y", height + margin.bottom - 7)
  .style("font-size", "12px")
  .style("font-family", "sans-serif")
  .text("Source: Coin Geko");
