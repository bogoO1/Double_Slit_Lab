window.onload = function () {
  var particleForm = document.getElementById("particleForm");
  var massForm = document.getElementById("massForm");
  var photonForm = document.getElementById("photonForm");

  particleForm.addEventListener("input", function (e) {
    var particle = e.target.value;
    if (particle == "Photon") {
      massForm.style.display = "none";
      photonForm.style.display = "block";
    } else if (particle == "Electron" || particle == "Proton") {
      massForm.style.display = "block";
      photonForm.style.display = "none";
    }
  });
  document.getElementById("xAxis").addEventListener("input", function (e) {
    if (e.target.value > 0) {
      graphPhoton();
      eraseGraphs();
      draw100();
    } else {
      eraseGraphs();
    }
  });
};

var isGraphed = false;

function getInputVariables() {
  let lambda = Number(document.getElementById("wavelength").value);
  let d = Number(document.getElementById("slitDistance").value);
  let a = Number(document.getElementById("slitWidth").value);
  let L = Number(document.getElementById("screenDistance").value);
  let I = Number(document.getElementById("intensity").value);
  let xAxisWidth = Number(document.getElementById("xAxis").value);
  // check if undefined or nill
  if (
    typeof lambda !== "number" ||
    typeof d !== "number" ||
    typeof a !== "number" ||
    typeof L !== "number" ||
    typeof I !== "number" ||
    typeof xAxisWidth !== "number"
  ) {
    sys.exit("Inputs must all be numbers");
  }

  if (xAxisWidth <= 0) {
    sys.exit("x-Axis width must be greater than zero");
  }

  lambda *= 1e-9;
  d *= 1e-6;
  a *= 1e-9;
  L *= 1;
  I *= 1;
  xAxisWidth *= 1;

  return [lambda, d, a, L, I, xAxisWidth];
}

function graphPhoton() {
  let [lambda, d, a, L, I, xAxisWidth] = getInputVariables();

  var svg = d3.select("#intensityGraph");

  svg.selectAll("*").remove();

  // Set the width of the SVG to the width of the screen
  const screenWidth = window.innerWidth;
  svg.attr("width", screenWidth);

  const screenHeight = (window.innerWidth * 2) / 3;
  svg.attr("height", screenHeight);

  // Select the SVG element

  // Define the width and height of the SVG
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  // Define the range and domain for x and y scales
  const xScale = d3
    .scaleLinear()
    .domain([-xAxisWidth, xAxisWidth])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 4.05 * I])
    .range([height - 25, 0]); // Adjust the range for the yScale

  // Generate the sine wave data
  const sineData = d3
    .range(-xAxisWidth, xAxisWidth, (2 * xAxisWidth) / 10_000)
    .map(function (x) {
      let theta = Math.atan(x / L);
      let beta = (Math.PI * a * Math.sin(theta)) / lambda;
      let singleSlitIntensity = 4 * I * Math.pow(Math.sin(beta) / beta, 2);

      let doubleSlitIntensity =
        singleSlitIntensity *
        Math.pow(Math.cos((Math.PI * d * x) / (lambda * L)), 2);
      return { x: x, y: doubleSlitIntensity };
    });

  // Create a line generator
  const line = d3
    .line()
    .defined(function (d) {
      return !isNaN(d.y);
    })
    .x(function (d) {
      return xScale(d.x);
    })
    .y(function (d) {
      return yScale(d.y);
    });

  // Create x axis
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(15)
    .tickSizeOuter(0)
    .tickSize(-height);

  // Append x axis to the SVG
  svg
    .append("g")
    .attr("transform", "translate(" + "0" + "," + (height - 25) + ")")
    .call(xAxis)
    .selectAll("line")
    .attr("stroke", "lightgray"); // Set grid line color;

  // Create y axis
  const yAxis = d3.axisLeft(yScale).ticks(15).tickSizeOuter(0).tickSize(-width);

  // Append y axis to the SVG
  svg
    .append("g")
    .attr("transform", "translate(" + xScale(0) + ",0)") // Translate y-axis to the center
    .call(yAxis)
    .selectAll("line")
    .attr("stroke", "lightgray")
    .attr("transform", "translate(" + -width / 2 + ",0)"); // Translate y-axis to the center; // Set grid line color

  // Append the path to the SVG
  svg
    .append("path")
    .datum(sineData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Title
  svg
    .append("text")
    .attr("x", width / 2 + 100)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .style("font-family", "Helvetica")
    .style("font-size", 20)
    .text("Double Slit Intensity");

  // X label
  svg
    .append("text")
    .attr("x", width / 2 + 100)
    .attr("y", height - 15 + 150)
    .attr("text-anchor", "middle")
    .style("font-family", "Helvetica")
    .style("font-size", 12)
    .text("y[m]");

  // Y label
  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(60," + height + ")rotate(-90)")
    .style("font-family", "Helvetica")
    .style("font-size", 12)
    .text("Intensity[W/m^2]");
}

// Returns the index of where the value should belong, biased to the right.
function binarySearch(array, value, l, r) {
  let m = Math.floor((r + l) / 2);
  if (array[m] === value) {
    return m;
  }

  if (r - l == 0) {
    return value < array[m] ? m : m + 1;
  }

  if (r - l == 1) {
    return r;
  }

  if (array[m] >= value) {
    r = m - 1;
    return binarySearch(array, value, l, r);
  } else if (array[m] <= value) {
    l = m + 1;
    return binarySearch(array, value, l, r);
  }
}

// TODO: Make zoom variable function
// TODO: Graph on the same graph
var xScale;
var yScale;

function createScatterPlot() {
  let [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  const screenWidth = window.innerWidth;
  const screenHeight = (window.innerWidth * 2) / 3;

  // var svg = d3.select("#scatterPlot"),
  //   margin = 20;

  // // Set the width of the SVG to the width of the screen
  // // const screenWidth = window.innerWidth;
  // svg.attr("width", screenWidth - margin);

  // // const screenHeight = (window.innerWidth * 2) / 3;
  // svg.attr("height", screenHeight - margin);

  // Define the width and height of the SVG
  // const width = +svg.attr("width");
  // const height = +svg.attr("height");

  var margin = { top: 25, right: 25, bottom: 25, left: 25 },
    width = screenWidth - margin.left - margin.right,
    height = screenHeight - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select("#scatterPlot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.selectAll("*").remove();

  // Define the range and domain for x and y scales
  xScale = d3.scaleLinear().domain([-xAxisWidth, xAxisWidth]).range([0, width]);

  yScale = d3
    .scaleLinear()
    .domain([0, 4.05 * I])
    .range([height - 25, 0]); // Adjust the range for the yScale

  // Create x axis
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(15)
    .tickSizeOuter(0)
    .tickSize(-height);

  // Append x axis to the SVG
  svg
    .append("g")
    .attr("transform", "translate(" + "0" + "," + (height - 25) + ")")
    .call(xAxis)
    .selectAll("line")
    .attr("stroke", "lightgray"); // Set grid line color;

  // Create y axis
  const yAxis = d3.axisLeft(yScale).ticks(15).tickSizeOuter(0).tickSize(-width);

  // TODO: One of these tick lines overrides the x-axis.

  // Append SVG Object to the Page
  // svg = d3.select("#intensityGraph").append("svg").append("g");
  // .attr("transform", "translate(" + margin + "," + margin + ")");

  // Dots

  // X label
  svg
    .append("text")
    .attr("x", width / 2 + 100)
    .attr("y", height - 15 + 150)
    .attr("text-anchor", "middle")
    .style("font-family", "Helvetica")
    .style("font-size", 12)
    .text("y[m]");
}

var scatterPlotData = [];
// TODO: redo the graphing with a canvas element.
function drawDot(functionArray, arraySum, points) {
  if (isGraphed == false) {
    createScatterPlot();
  }
  isGraphed = true;

  let [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  const screenWidth = window.innerWidth;
  const screenHeight = (window.innerWidth * 2) / 3;

  var svg = d3.select("#scatterPlot");
  var margin = { top: 25, right: 25, bottom: 25, left: 25 },
    width = screenWidth - margin.left - margin.right,
    height = screenHeight - margin.top - margin.bottom;

  const numPoints = points;
  var newData = [];
  for (let i = 0; i < numPoints; i++) {
    let randomNum = Math.floor(Math.random() * arraySum) + 1;

    let index = binarySearch(
      functionArray,
      randomNum,
      0,
      functionArray.length - 1
    );

    let xPos =
      index * ((2 * xAxisWidth) / (functionArray.length - 1)) - xAxisWidth;

    // intensity is different of currend and prev index, unless index is zero.
    let intensity = functionArray[index];
    if (index > 0) {
      intensity -= functionArray[index - 1];
    }

    intensity = Math.random() * 4.0 * I;

    newData.push([xPos, intensity]);
  }

  // Update your existing data array with the new data
  scatterPlotData = scatterPlotData.concat(newData); // Concatenate the new data with the existing data array

  // Append new data points to the scatter plot
  svg
    .append("g")
    .selectAll("circle")
    .data(scatterPlotData)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d[0]);
    })
    .attr("cy", function (d) {
      return yScale(d[1]);
    })
    .attr("transform", "translate(" + "25" + "," + 25 + ")")
    .attr("r", 3)
    .style("fill", "Red")
    .style("opacity", 0.75);
}
function getFunctionArray() {
  let [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  const range = 10000;

  const functionArray = d3.range(0, range, 1).map(function (x) {
    x = x * ((2 * xAxisWidth) / range) - xAxisWidth;

    if (x === 0) {
      return 4 * I;
    }

    let theta = Math.atan(x / L);
    let beta = (Math.PI * a * Math.sin(theta)) / lambda;
    let singleSlitIntensity = 4 * I * Math.pow(Math.sin(beta) / beta, 2);

    let doubleSlitIntensity =
      singleSlitIntensity *
      Math.pow(Math.cos((Math.PI * d * x) / (lambda * L)), 2);

    return doubleSlitIntensity;
  });

  for (let i = 1; i < functionArray.length; i++) {
    functionArray[i] += functionArray[i - 1];
  }

  return functionArray;
}

function draw1() {
  const functionArray = getFunctionArray();

  if (functionArray == false) return;

  drawDot(functionArray, functionArray[functionArray.length - 1], 1);
}

function draw10() {}

function draw100() {
  const functionArray = getFunctionArray();

  if (functionArray == false) return;

  drawDot(functionArray, functionArray[functionArray.length - 1], 100);
}

function eraseGraphs() {
  const svg = d3.select("#scatterPlot");

  svg.selectAll("*").remove();
  scatterPlotData = [];
  isGraphed = false;
}

// // Set Dimensions
// const xSize = 500;
// const ySize = 500;
// const margin = 40;
// const xMax = xSize - margin * 2;
// const yMax = ySize - margin * 2;

// // Create Random Points
// const numPoints = 100;
// const data = [];
// for (let i = 0; i < numPoints; i++) {
//   data.push([Math.random() * xMax, Math.random() * yMax]);
// }

// // Append SVG Object to the Page
// const svg = d3
//   .select("#intensityGraph")
//   .append("svg")
//   .append("g")
//   .attr("transform", "translate(" + margin + "," + margin + ")");

// // X Axis
// const x = d3.scaleLinear().domain([0, 500]).range([0, xMax]);

// svg
//   .append("g")
//   .attr("transform", "translate(0," + yMax + ")")
//   .call(d3.axisBottom(x));

// // Y Axis
// const y = d3.scaleLinear().domain([0, 500]).range([yMax, 0]);

// svg.append("g").call(d3.axisLeft(y));

// // Dots
// svg
//   .append("g")
//   .selectAll("dot")
//   .data(data)
//   .enter()
//   .append("circle")
//   .attr("cx", function (d) {
//     return d[0];
//   })
//   .attr("cy", function (d) {
//     return d[1];
//   })
//   .attr("r", 3)
//   .style("fill", "Red");
