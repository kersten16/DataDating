
var selectedCountry = "Belgium";
var selectedDate = "2020-01-01";
d3.json("../docs/data/Belgiumonly.json", d => {

}).then(data => {
  countconversationCountSwipes(data, selectedCountry, selectedDate);
  var filterData = filterJSON(data, selectedCountry, selectedDate);
  createScatterPlot(filterData);
})

var counterClick = 0;
let dates = ["2020-01-01", "2019-12-31", "2021-01-01", "2022-01-01"]
let mappingColorUser = {
}
let userColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];
var counterColors = 0;

var heightGraph = 400;

function filterJSON(array, givenCountry, givenDate) {
  var result = [{}];
  var counter = 0;
  for (i = 0; i < array.length; i++) {

    if (array[i].country == givenCountry) {
      if (array[i].messagesSent > 1) {
        if (array[i].appOpens > 1) {
        //   if (array[i].date == givenDate) {
        result[counter] = array[i];
        counter++;
      }}
    }
  }

  return result;
}
var counter_countryswipes = 0;
var counter_countryconversationCount = 0;
function countconversationCountSwipes(array, givenCountry, givenDate) {
  console.log(array.length);
  for (i = 0; i < array.length; i++) {

    if (array[i].country == givenCountry) {
      if (array[i].date == givenDate) {
        counter_countryswipes = counter_countryswipes + array[i].swipeLike + array[i].swipePass;
        counter_countryconversationCount = counter_countryconversationCount + array[i].conversationCount;
      }
    }
  }

}


function addCountryStats(numberSwipes, numberconversationCount) {
  const text_swipes = document.createElement("p");
  const node_swipes = document.createTextNode("Swipes: " + numberSwipes);
  text_swipes.appendChild(node_swipes);
  document.getElementById("country-stats").appendChild(text_swipes);


  const text_conversationCount = document.createElement("p");
  const node_conversationCount = document.createTextNode("Messages: " + numberconversationCount);
  text_conversationCount.appendChild(node_conversationCount);
  document.getElementById("country-stats").appendChild(text_conversationCount);
}


let svg = d3.select("#plotSVG")
  .style("overflow", "visible") // some tooltips stray outside the SVG border
  .append("g")
  .attr("transform", "translate(50,50)")

/*
let element_ddCountry = document.getElementById("select-country");*/
/*function changeTitle() {

  let element_title = document.getElementById("titleCountry");

  selectedCountry = element_ddCountry.value;
  element_title.textContent = selectedCountry;

  const element = document.querySelectorAll(".bubble");
  for (var i = 0; i < element.length; i++) {
    d3.select(element[i]).remove();
  }

  d3.json("../docs/data/testdata_app.json", d => {

  }).then(data => {


    filterData = filterJSON(data, selectedCountry);

    createScatterPlot(filterData);
  })


}*/
/*
function addCountry() {
  let text = document.getElementById("titleCountry");
  text.textContent = selectedCountry;
  const opt1 = document.createElement("option");
  opt1.value = "Dyn Country 3";
  opt1.text = "Dyn Country 3";

  element_ddCountry.add(opt1, null);
}*/

function createScatterPlot(allTestData) {

  let xScale = d3.scaleLinear()
    .domain([0, 250])   // my x-variable has a max of 2500
    .range([0, 600]);   // my x-axis is 600px wide

  let yScale = d3.scaleLinear()
    .domain([0, 120])   // my y-variable has a max of 1200
    .range([heightGraph, 0]);   // my y-axis is 400px high
  // (the max and min are reversed because the 
  // SVG y-value is measured from the top)



  /* let categoryColors = {
     "No Measure": "#11111",
     "Measure 1": "#1f77b4",
     "Measure 2": "#8c564b",
     "Measure 3": "#235643",
 
   }*/



  /* mappingColorUser["Measure 4"] = "#244643";
   console.log(categoryColors);*/


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
    .attr("cx", d => xScale(d.messagesSent + d.messagesReceived))   // set the x position based on the number of conversationCount
    .attr("cy", d => yScale(d.swipePass + d.swipeLike))   // set the y position based on the number of swipes
    .attr("r", d => Math.sqrt(d.appOpens))  // set the radius based on the article reading time

    .attr("fill", d => {
      // objectName["Measure 4"] = "#244643";
      if (!mappingColorUser.hasOwnProperty(d.userID)) {
        mappingColorUser[d.userID] = userColors[counterColors++]
      }
      return mappingColorUser[d.userID];
    }
    )
    .attr("stroke", d => mappingColorUser[d.userID])
    .attr("fill-opacity", 1)
    .on("mouseover", (e, d) => {    // event listener to show tooltip on hover
      d3.select("#bubble-tip-" + d.userID)  // i'm using the publish time as a unique ID
        .style("display", "block");
    })
    .on("mouseout", (e, d) => {    // event listener to hide tooltip after hover
      if (!d.toolTipVisible) {
        d3.select("#bubble-tip-" + d.userID)
          .style("display", "none");
      }
    })
    .on("click", (e, d) => {    // event listener to make tooltip remain visible on click
      if (!d.toolTipVisible) {
        d3.select("#bubble-tip-" + d.userID)
          .style("display", "block");
        d.toolTipVisible = true;
      }
      else {
        d3.select("#bubble-tip-" + d.userID)
          .style("display", "none");
        d.toolTipVisible = false;
      }
    });


  svg.selectAll(".bubble-tip")
    .data(allTestData)
    .join("g")
    .attr("class", "bubble-tip")
    .attr("id", (d) => "bubble-tip-" + d.userID)
    .attr("transform", d => "translate(" + (xScale(d.messagesSent + d.messagesReceived) + 20) + ", " + yScale(d.swipeLike + d.swipePass) + ")")
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
    .text(d => "user: " + d.userID)
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])

  svg.selectAll(".bubble-tip")
    .append("text")
    .classed("bubble-tip-yText", true)
    .text(d => "(swipes: " + (d.swipeLike + d.swipePass) + " )")
    .attr("y", d => (20))
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])

  svg.selectAll(".bubble-tip")
    .append("text")
    .classed("bubble-tip-yText", true)
    .text(d => "(conversationCount: " + (d.messagesSent + d.messagesReceived) + ")")
    .attr("y", d => (40))
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])

  let xVar = document.getElementById("select-x-var").value;
  let yVar = "swipeLike";
  document.getElementById("select-x-var").addEventListener("change", (e) => {

    // update the x-variable based on the user selection
    xVar = e.target.value

    if (xVar === "userID") {

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
        .domain(Object.keys(userColors))
        .range([0, 600])
        .padding(1) // space them out so the bubble appears in the centre

      svg.select("#xAxis")
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text")
        // offset the category names to fit them in horizontally
        .attr("transform", (d, i) => `translate(0, ${(i % 2) * 20})`)
        .style("fill", d => mappingColorUser[d.userID])
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
  addCountryStats(counter_countryswipes, counter_countryconversationCount);
}


function colorBubblesGrey() {
  //svg.selectAll(".bubble").attr("fill", d => "#e6e6e6")//grey
  svg.selectAll(".bubble").attr("fill-opacity", 0.4)
}

function functionGhost() {
  selectedDate = dates[++counterClick];
  const element = document.querySelectorAll(".bubble");
  d3.json("../docs/data/allUsers_ByDate.json", d => {

  }).then(data => {


    filterData = filterJSON(data, selectedCountry, selectedDate);

    colorBubblesGrey();
    addBubbles(filterData);
  })

}

function addBubbles(allTestData) {

  let svg2 = d3.select("#plotSVG")
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


  /*
    let categoryColors = {
      "No Measure": "#11111",
      "Measure 1": "#1f77b4",
      "Measure 2": "#8c564b",
      "Measure 3": "#235643",
  
    }*/

  svg2.append("g")       // the axis will be contained in an SVG group element
    .attr("id", "yAxis")
    .call(d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d3.format("d"))
      .tickSizeOuter(0)
    )

  svg2.append("g")
    .attr("transform", "translate(0," + heightGraph + ")")    // translate x-axis to bottom of chart
    .attr("id", "xAxis")
    .call(d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.format("d"))
      .tickSizeOuter(0)
    )


  svg2.selectAll(".bubble")
    .data(allTestData)    // bind each element of the data array to one SVG circle
    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.messagesSent + d.messagesReceived))   // set the x position based on the number of conversationCount
    .attr("cy", d => yScale(d.swipePass + d.swipeLike))   // set the y position based on the number of swipes
    .attr("r", d => Math.sqrt(d.appOpens))  // set the radius based on the article reading time
    .attr("stroke", d => {
      if (!mappingColorUser.hasOwnProperty(d.userID)) {
        mappingColorUser[d.userID] = userColors[counterColors++]

      }
      return mappingColorUser[d.userID];
    })
    .attr("fill", d => mappingColorUser[d.userID])
    .attr("fill-opacity", 1)
    .on("mouseover", (e, d) => {    // event listener to show tooltip on hover
      d3.select("#bubble-tip-" + d.userID)  // i'm using the publish time as a unique ID
        .style("display", "block");
    })
    .on("mouseout", (e, d) => {    // event listener to hide tooltip after hover
      if (!d.toolTipVisible) {
        d3.select("#bubble-tip-" + d.userID)
          .style("display", "none");
      }
    })
    .on("click", (e, d) => {    // event listener to make tooltip remain visible on click
      if (!d.toolTipVisible) {
        d3.select("#bubble-tip-" + d.userID)
          .style("display", "block");
        d.toolTipVisible = true;
      }
      else {
        d3.select("#bubble-tip-" + d.userID)
          .style("display", "none");
        d.toolTipVisible = false;
      }
    });


  svg2.selectAll(".bubble-tip")
    .data(allTestData)
    .join("g")
    .attr("class", "bubble-tip")
    .attr("id", (d) => "bubble-tip-" + d.userID)
    .attr("transform", d => "translate(" + (xScale(d.messagesSent + d.messagesReceived) + 20) + ", " + yScale(d.swipeLike + d.swipePass) + ")")
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
  svg2.selectAll(".bubble-tip")
    .append("text")
    .text(d => "user: " + d.userID)
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])

  svg2.selectAll(".bubble-tip")
    .append("text")
    .classed("bubble-tip-yText", true)
    .text(d => "(swipes: " + (d.swipeLike + d.swipePass) + " )")
    .attr("y", d => (20))
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])

  svg2.selectAll(".bubble-tip")
    .append("text")
    .classed("bubble-tip-yText", true)
    .text(d => "(conversationCount: " + (d.messagesSent + d.messagesReceived) + " )")
    .attr("y", d => (40))
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])

  let xVar = document.getElementById("select-x-var").value;
  let yVar = "swipeLike";
  document.getElementById("select-x-var").addEventListener("change", (e) => {

    // update the x-variable based on the user selection
    xVar = e.target.value

    if (xVar === "userID") {

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
        .domain(Object.keys(userColors))
        .range([0, 600])
        .padding(1) // space them out so the bubble appears in the centre

      svg2.select("#xAxis")
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text")
        // offset the category names to fit them in horizontally
        .attr("transform", (d, i) => `translate(0, ${(i % 2) * 20})`)
        .style("fill", d => mappingColorUser[d.userID])
    }
    else {
      // rescale the x-axis
      xScale = d3.scaleLinear()
        .domain([0, d3.max(allTestData, d => d[xVar])])
        .range([0, 600]);

      // redraw the x-axis
      svg2.select("#xAxis")
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d3.format("d"))
          .tickSizeOuter(0)
        )

    }
    // transition each circle element
    svg2.selectAll(".bubble")
      .transition()
      .duration(1000)
      .attr("cx", (d) => xScale(d[xVar]))

    // transition each tooltip
    svg2.selectAll(".bubble-tip")
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
    svg2.select("#yAxis")
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)
      )

    // transition each circle element and tooltip
    svg2.selectAll(".bubble")
      .transition()
      .duration(1000)
      .attr("cy", (d) => yScale(d[yVar]))

    svg2.selectAll(".bubble-tip-yText")
      .text(d => "(" + d[yVar] + " " + yVar + ")")

    svg2.selectAll(".bubble-tip")
      .attr("transform", d => "translate(" + (xScale(d[xVar]) + 20) + ", " + yScale(d[yVar]) + ")")
  })


}
