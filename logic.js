// TODO: Allow masses to be high by making the output be two vertical lines.

var numSlits = 2;
var particleType = "Photon";
var isLineGraphed = false;

const massOfParticles = {
  Electron: 9.1093837e-31,
  Proton: 1.67262192e-27,
};

window.onload = function () {
  var particleForm = document.getElementById("particleForm");
  var atomicMassForm = document.getElementById("atomicMassForm");
  var photonForm = document.getElementById("photonForm");
  var massForm = document.getElementById("massForm");

  function makeFormsInvisible() {
    atomicMassForm.style.display = "none";
    photonForm.style.display = "none";
    massForm.style.display = "none";
  }

  document.getElementById("particle").addEventListener("input", function (e) {
    makeFormsInvisible();
    var particle = e.target.value;
    if (particle == "Photon") {
      particleType = "Photon";
      photonForm.style.display = "block";
    } else if (particle == "Electron" || particle == "Proton") {
      particleType = particle;
      atomicMassForm.style.display = "block";
    } else if (particle == "Mass") {
      particleType = particle;
      massForm.style.display = "block";
    }
  });
  document.getElementById("xAxis").addEventListener("input", function (e) {
    if (e.target.value > 0) {
      graphPhoton();
      eraseGraphs();
    } else {
      eraseGraphs();
    }
  });

  function makeSlitsInvisible() {
    let elements = [
      ...document.querySelectorAll(".for2Slit"),
      ...document.querySelectorAll(".forNSlit"),
    ];

    elements.forEach(function (element) {
      element.classList.add("hidden");
    });
  }

  function makeSlitsVisible(elements) {
    elements.forEach(function (element) {
      element.classList.remove("hidden");
    });
  }

  document.getElementById("slit").addEventListener("input", function (e) {
    makeSlitsInvisible();
    if (e.target.value == "1") {
      numSlits = 1;
    } else if (e.target.value == "2") {
      makeSlitsVisible(document.querySelectorAll(".for2Slit"));
      numSlits = 2;
    } else if (e.target.value == "n") {
      makeSlitsVisible(document.querySelectorAll(".forNSlit"));
      numSlits = 0;
    }
  });

  window.addEventListener(
    "error",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
    },
    false
  );

  // Execute a function when the user presses a key on the keyboard
  document.addEventListener("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("intensityGraphButton").click();
    }
  });
};

var isGraphed = false;

function getDistanceBetweenSlits() {
  if (numSlits == 1) {
    return 0;
  } else if (numSlits == 2) {
    let d = Number(document.getElementById("slitDistance").value);
    if (typeof d !== "number" || d <= 0) {
      throw "Distance between slits must be greater than zero.";
    }
    return d * 1e-6;
  } else if (numSlits == 0) {
    // n-slits

    let linesPermm = Number(document.getElementById("lines/mm").value);
    if (typeof linesPermm !== "number" || linesPermm <= 0) {
      throw "Lines/mm must be greater than zero.";
    }

    let d = (1 / linesPermm) * 1e-3;

    return d;
  }
}

function getInputVariables() {
  // v cannot be greater than c.
  let a = Number(document.getElementById("slitWidth").value);
  let L = Number(document.getElementById("screenDistance").value);
  let xAxisWidth = Number(document.getElementById("xAxis").value);

  if (
    typeof a !== "number" ||
    typeof L !== "number" ||
    typeof xAxisWidth !== "number"
  ) {
    throw "Inputs must all be numbers";
  }

  if (a <= 0) {
    throw "Slit width must be greater than zero.";
  }

  if (L <= 0) {
    throw "Distance to screen must be greater than zero.";
  }

  if (xAxisWidth <= 0) {
    throw "X-Axis Max must be greater than zero.";
  }

  a *= 1e-9;
  L *= 1;
  xAxisWidth *= 1;
  // TODO: Test with scientific number inputs also allow enter to graph the function
  if (photonForm.style.display == "none") {
    // Particle has mass
    if (particleType == "Mass") {
      var mass = Number(document.getElementById("mass").value);
      var velocity = Number(document.getElementById("velocity").value);
      var energy = 1;
    } else {
      // atomic mass
      var mass = massOfParticles[particleType];
      var energy = Number(document.getElementById("energy").value);
      var velocity = 1;
    }

    let d = Number(document.getElementById("slitDistance").value);
    // check if undefined or nill
    if (
      typeof d !== "number" ||
      typeof energy !== "number" ||
      typeof mass !== "number" ||
      typeof velocity !== "number"
    ) {
      throw "Inputs must all be numbers";
    }

    if (energy <= 0) {
      throw "Energy must be greater than zero";
    }

    if (d <= 0) {
      throw "Distance between slits must be greater than zero.";
    }

    if (mass <= 0) {
      throw "Mass must be greater than zero.";
    }

    d *= 1e-6;
    energy *= 1;

    const c = 299_792_458;

    if (particleType == "Mass") {
      let gamma = 1 / Math.sqrt(1 - (velocity / c) ** 2);

      energy = gamma * Math.pow(mass * Math.pow(c, 2), 2);

      var lambda = 6.262e-34 / (mass * velocity);
    } else {
      let momentum = Math.sqrt(
        (Math.pow(energy, 2) - Math.pow(mass * Math.pow(c, 2), 2)) /
          Math.pow(c, 2)
      );

      var lambda = 4.136e-15 / momentum;
    }

    d = getDistanceBetweenSlits();

    return [lambda, d, a, L, 1, xAxisWidth];
  } else {
    // Photon
    let lambda = Number(document.getElementById("wavelength").value);
    let d = Number(document.getElementById("slitDistance").value);
    let I = Number(document.getElementById("intensity").value);
    // check if undefined or nill
    if (
      typeof lambda !== "number" ||
      typeof d !== "number" ||
      typeof I !== "number" ||
      typeof xAxisWidth !== "number"
    ) {
      throw "Inputs must all be numbers";
    }

    if (I <= 0) {
      throw "Intensity must be greater than zero";
    }

    if (lambda <= 0) {
      throw "Wavelength must be greater than zero";
    }

    if (d <= 0) {
      throw "Distance between slits must be greater than zero";
    }

    lambda *= 1e-9;
    d *= 1e-6;
    I *= 1;

    d = getDistanceBetweenSlits();

    return [lambda, d, a, L, I, xAxisWidth];
  }
}

function graphPhoton() {
  try {
    var [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  } catch (err) {
    console.error(err);
    alert(err);
    throw "";
  }

  document.querySelector("#intensityGraph").classList.remove("hidden");

  var svg = d3.select("#intensityGraph");

  svg.selectAll("*").remove();

  // Set the width of the SVG to the width of the screen
  const screenWidth = window.innerWidth;
  svg.attr("width", screenWidth);

  const screenHeight = window.innerHeight * 0.5;
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
  const data = d3
    .range(-xAxisWidth, xAxisWidth, (2 * xAxisWidth) / 100_000)
    .map(function (x) {
      return { x: x, y: getIntensityValue(x, lambda, d, a, L, I, xAxisWidth) };
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
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // X label
  svg
    .append("text")
    .attr("x", width - width / 10)
    .attr("y", height - 40)
    .attr("text-anchor", "middle")
    .style("font-family", "Helvetica")
    .style("font-size", 12)
    .text("y[m]");
}

// Returns the index of where the value should belong, biased to the right.
function binarySearch(array, value, l, r) {
  let m = Math.floor((r + l) / 2);
  if (array[m] === value) {
    // if multiple of the same values exist, then grab value farthest to the left because the difference between the other values is zero.
    while (array[m] === array[m - 1]) {
      m--;
    }
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

function createScatterPlot(plot) {
  try {
    var [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  } catch (err) {
    console.error(err);
    alert(err);
    throw "";
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight * 0.5;

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
    .select("#" + plot)
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
}

var scatterPlotData = [];
function drawDot(functionArray, arraySum, points) {
  if (isGraphed == false) {
    createScatterPlot("scatterPlot");
  }
  isGraphed = true;

  try {
    var [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  } catch (err) {
    console.error(err);
    alert(err);
    throw "";
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight * 0.5;

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
    .attr("r", screenWidth / 600)
    .style("fill", "Red")
    .style("opacity", 0.75);
}

function getIntensityValue(x, lambda, d, a, L, I, xAxisWidth) {
  let theta = Math.atan(x / L);
  let beta = (Math.PI * a * Math.sin(theta)) / lambda;
  let singleSlitIntensity = 4 * I * Math.pow(Math.sin(beta) / beta, 2);

  if (numSlits == 1) {
    return singleSlitIntensity;
  }

  let doubleSlitIntensity =
    singleSlitIntensity *
    Math.pow(Math.cos((Math.PI * d * x) / (lambda * L)), 2);

  return doubleSlitIntensity;
}

function getFunctionArray() {
  try {
    var [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  } catch (err) {
    console.error(err);
    alert(err);
    throw "";
  }

  const range = 100_000;

  const functionArray = d3.range(0, range, 1).map(function (x) {
    x = x * ((2 * xAxisWidth) / range) - xAxisWidth;

    if (x === 0) {
      return 4 * I;
    }

    return getIntensityValue(x, lambda, d, a, L, I, xAxisWidth);
  });

  for (let i = 1; i < functionArray.length; i++) {
    functionArray[i] += functionArray[i - 1];
  }

  return functionArray;
}

function drawDots(numDots) {
  document.querySelector("#scatterPlot").classList.remove("hidden");

  const functionArray = getFunctionArray();

  if (functionArray == false) return;

  drawDot(functionArray, functionArray[functionArray.length - 1], numDots);
}
var linePlotData = [];
function drawShadedGraph() {
  document.querySelector("#linePlot").classList.remove("hidden");
  document.querySelector(".SVG").classList.remove("hidden");

  const functionArray = getFunctionArray();

  if (functionArray == false) return;

  // if (isLineGraphed == true) {
  //   return;
  // }
  isLineGraphed = true;

  linePlotData = [];
  createScatterPlot("linePlot");
  const svg2 = d3.select("#linePlot");
  svg2.selectAll("*").remove();

  try {
    var [lambda, d, a, L, I, xAxisWidth] = getInputVariables();
  } catch (err) {
    console.error(err);
    alert(err);
    throw "";
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight * 0.5;

  var svg = d3.select("#linePlot");
  var margin = { top: 25, right: 25, bottom: 25, left: 25 },
    width = screenWidth - margin.left - margin.right,
    height = screenHeight - margin.top - margin.bottom;

  var divisionsPerPixel = 2;

  let accuracyInput = Number(
    document.getElementById("divisionsPerPixel").value
  );

  document
    .getElementById("linePlot")
    .setAttribute("width", screenWidth * accuracyInput + "px");

  if (typeof accuracyInput !== "number" || accuracyInput < 1) {
    throw "Accuracy must be a number greater than 1.";
  }

  var newData = [];

  var scaledxAxisWidth = xAxisWidth;

  for (
    let i = -scaledxAxisWidth;
    i < scaledxAxisWidth;
    i += (2 * scaledxAxisWidth) / (width * accuracyInput * divisionsPerPixel)
  ) {
    newData.push([
      i,
      getIntensityValue(i, lambda, d, a, L, I, scaledxAxisWidth),
    ]);
  }
  // Update your existing data array with the new data
  linePlotData = linePlotData.concat(newData); // Concatenate the new data with the existing data array

  // Append new data points to the scatter plot

  var xScaleScaled = d3
    .scaleLinear()
    .domain([-scaledxAxisWidth, scaledxAxisWidth])
    .range([0, width * accuracyInput]);

  widthOfLine = 1 / divisionsPerPixel;

  svg
    .append("g")
    .selectAll("circle")
    .data(linePlotData)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xScaleScaled(d[0]);
    })
    .attr("y", function (d) {
      return 0;
    })
    .attr("width", widthOfLine)
    .attr("height", height)
    .style("fill", "Red")
    .style("opacity", function (d) {
      return d[1] / (4 * I);
    });
}

function eraseGraphs() {
  const svg = d3.select("#scatterPlot");
  const svg2 = d3.select("#linePlot");
  const svg3 = d3.select("#intensityGraph");

  svg.selectAll("*").remove();
  svg2.selectAll("*").remove();
  svg3.selectAll("*").remove();

  document.querySelector("#scatterPlot").classList.add("hidden");
  document.querySelector("#linePlot").classList.add("hidden");
  document.querySelector("#intensityGraph").classList.add("hidden");
  document.querySelector(".SVG").classList.add("hidden");

  scatterPlotData = [];
  linePlotData = [];
  isGraphed = false;
  isLineGraphed = false;
}

function toggleSettings() {
  var settings = document.getElementById("settings");
  settings.classList.toggle("show");
}

function saveSettings() {
  // Add code to save settings here
  alert("Settings saved!");
}
