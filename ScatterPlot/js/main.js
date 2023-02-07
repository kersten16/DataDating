
var selectedCountry = "Belgium";
d3.json("data/testdata_app.json", d => {
  /*  return {
      date: d[i].date,
      country: d[i].country,
      swipe_passes: d[i].swipe_passes,
      swipe_likes: d[i].swipe_likes,
      messages: d[i].messages,
      appOpens: d[i].appOpens
    }*/
}).then(data => {


  var filterData = filterJSON(data, selectedCountry);

  createScatterPlot(filterData);
})


var heightGraph = 400;

function filterJSON(array, value) {
  var result = [{}];
  var counter = 0;
  // for (var explosionIndex in json) {
  for (i = 0; i < array.length; i++) {

    if (array[i].country == value) {
      result[counter] = array[i];
      counter++;
    }
  }

  return result;
}

let element_ddCountry = document.getElementById("select-country");
function changeTitle() {

  let element_title = document.getElementById("titleCountry");

  selectedCountry = element_ddCountry.value;
  element_title.textContent = selectedCountry;

  const element = document.querySelectorAll(".bubble");
  for (var i = 0; i < element.length; i++) {
    d3.select(element[i]).remove();
  }

  d3.json("data/testdata_app.json", d => {

  }).then(data => {


    filterData = filterJSON(data, selectedCountry);

    createScatterPlot(filterData);
  })


}

function addCountry() {
  let text = document.getElementById("titleCountry");
  text.textContent = selectedCountry;
  const opt1 = document.createElement("option");
  opt1.value = "Dyn Country 3";
  opt1.text = "Dyn Country 3";

  element_ddCountry.add(opt1, null);
}
function createScatterPlot(allTestData) {



  let svg = d3.select("#plotSVG")
    .style("overflow", "visible") // some tooltips stray outside the SVG border
    .append("g")
    .attr("transform", "translate(50,50)")

  let xScale = d3.scaleLinear()
    .domain([0, 250])   // my x-variable has a max of 2500
    .range([0, 600]);   // my x-axis is 600px wide

  let yScale = d3.scaleLinear()
    .domain([0, 120])   // my y-variable has a max of 1200
    .range([heightGraph, 0]);   // my y-axis is 400px high
  // (the max and min are reversed because the 
  // SVG y-value is measured from the top)



  let categoryColors = {
    "No Measure": "#11111",
    "Measure 1": "#1f77b4",
    "Measure 2": "#8c564b",
    "Measure 3": "#235643",

  }

  svg.append("g")       // the axis will be contained in an SVG group element
    .attr("id", "yAxis")
    .call(d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d3.format("d"))
      .tickSizeOuter(0)
    )

  svg.append("g")
    .attr("transform", "translate(0," + heightGraph + ")")    // translate x-axis to bottom of chart
    .attr("id", "xAxis")
    .call(d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.format("d"))
      .tickSizeOuter(0)
    )

  svg.selectAll(".bubble")
    .data(allTestData)    // bind each element of the data array to one SVG circle

    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.messages))   // set the x position based on the number of messages
    .attr("cy", d => yScale(d.swipe_passes + d.swipe_likes))   // set the y position based on the number of swipes
    .attr("r", d => Math.sqrt(d.appOpens) * 3)  // set the radius based on the article reading time
    .attr("stroke", d => categoryColors[d.category])
    .attr("fill", d => categoryColors[d.category])
    .attr("fill-opacity", 0.5)
    .on("mouseover", (e, d) => {    // event listener to show tooltip on hover
      d3.select("#bubble-tip-" + d.userid)  // i'm using the publish time as a unique ID
        .style("display", "block");
    })
    .on("mouseout", (e, d) => {    // event listener to hide tooltip after hover
      if (!d.toolTipVisible) {
        d3.select("#bubble-tip-" + d.userid)
          .style("display", "none");
      }
    })
    .on("click", (e, d) => {    // event listener to make tooltip remain visible on click
      if (!d.toolTipVisible) {
        d3.select("#bubble-tip-" + d.userid)
          .style("display", "block");
        d.toolTipVisible = true;
      }
      else {
        d3.select("#bubble-tip-" + d.userid)
          .style("display", "none");
        d.toolTipVisible = false;
      }
    });


  svg.selectAll(".bubble-tip")
    .data(allTestData)
    .join("g")
    .attr("class", "bubble-tip")
    .attr("id", (d) => "bubble-tip-" + d.userid)
    .attr("transform", d => "translate(" + (xScale(d.messages) + 20) + ", " + yScale(d.swipe_likes + d.swipe_passes) + ")")
    .style("display", "none")
    .append("rect")     // this is the background to the tooltip
    .attr("x", -5)
    .attr("y", -20)
    .attr("rx", 5)
    .attr("fill", "white")
    .attr("fill-opacity", 0.9)
    .attr("width", 180)
    .attr("height", 100)

  // SVG does not wrap text
  // so I add a new text element for each line (4 words)
  svg.selectAll(".bubble-tip")
    .append("text")
    .text(d => d.country)
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => categoryColors[d.category])


  svg.selectAll(".bubble-tip")
    .append("text")
    .classed("bubble-tip-yText", true)
    .text(d => "(" + d.swipe_likes + " swipes)")
    .attr("y", d => (20))
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => categoryColors[d.category])

  let xVar = document.getElementById("select-x-var").value;
  let yVar = "swipe_likes";
  document.getElementById("select-x-var").addEventListener("change", (e) => {

    // update the x-variable based on the user selection
    xVar = e.target.value

    if (xVar === "userid") {

      xScale = d3.scaleTime()
        .domain([d3.min(allTestData, d => d[xVar]), d3.max(allTestData, d => d[xVar])])
        .range([0, 600]);

      d3.select("#xAxis")
        .call(d3.axisBottom(xScale)
          .tickFormat(d3.timeFormat("%b %d")))
      //see here for time formatting options: 
      // https://github.com/d3/d3-time-format
    }
    else if (xVar === "category") {

      xScale = d3.scaleBand()
        .domain(Object.keys(categoryColors))
        .range([0, 600])
        .padding(1) // space them out so the bubble appears in the centre

      svg.select("#xAxis")
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text")
        // offset the category names to fit them in horizontally
        .attr("transform", (d, i) => `translate(0, ${(i % 2) * 20})`)
        .style("fill", d => categoryColors[d])
    }
    else {
      // rescale the x-axis
      xScale = d3.scaleLinear()
        .domain([0, d3.max(allTestData, d => d[xVar])])
        .range([0, 600]);

      // redraw the x-axis
      svg.select("#xAxis")
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
        )

    }
    // transition each circle element
    svg.selectAll(".bubble")
      .transition()
      .duration(1000)
      .attr("cx", (d) => xScale(d[xVar]))

    // transition each tooltip
    svg.selectAll(".bubble-tip")
      .transition()
      .duration(1000)
      .attr("transform", d => "translate(" + (xScale(d[xVar]) + 20) + ", " + yScale(d[yVar]) + ")")
  })

  document.getElementById("select-y-var").addEventListener("change", (e) => {

    // update the x-variable based on the user selection
    yVar = e.target.value

    // rescale the x-axis
    yScale = d3.scaleLinear()
      .domain([0, d3.max(allTestData, d => d[yVar])])
      .range([heightGraph, 0]);

    // redraw the x-axis
    svg.select("#yAxis")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)
      )

    // transition each circle element and tooltip
    svg.selectAll(".bubble")
      .transition()
      .duration(1000)
      .attr("cy", (d) => yScale(d[yVar]))

    svg.selectAll(".bubble-tip-yText")
      .text(d => "(" + d[yVar] + " " + yVar + ")")

    svg.selectAll(".bubble-tip")
      .attr("transform", d => "translate(" + (xScale(d[xVar]) + 20) + ", " + yScale(d[yVar]) + ")")
  })
}
