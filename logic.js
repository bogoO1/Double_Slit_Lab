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
};

function graphPhoton() {
  let lambda = Number(document.getElementById("wavelength").value);
  let d = Number(document.getElementById("slitDistance").value);
  let a = Number(document.getElementById("slitWidth").value);
  let L = Number(document.getElementById("screenDistance").value);
  let I = Number(document.getElementById("intensity").value);
  // check if undefined or nill
  if (
    typeof lambda !== "number" ||
    typeof d !== "number" ||
    typeof a !== "number" ||
    typeof L !== "number" ||
    typeof I !== "number"
  ) {
    return;
  }

  lambda *= 1e-9;
  d *= 1e-6;
  a *= 1e-9;
  L *= 1;
  I *= 1;

  const svg = d3.select("#intensityGraph");

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
  const xScale = d3.scaleLinear().domain([-L, L]).range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 4.05 * I])
    .range([height - 25, 0]); // Adjust the range for the yScale

  // Generate the sine wave data
  const sineData = d3.range(-L, L, 0.00001).map(function (x) {
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

  console.log("GRAPHED");
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
