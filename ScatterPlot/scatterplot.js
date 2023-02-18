//Define Graph setting
var heightGraph = 400;

//Create  Variables 
var counterClick = 0;
var counterColors = 0;
let mappingColorUser = {};
var counter_countryswipes = 0;
var counter_countryconversationCount = 0;

//Set Possibilities
let dates = ["2020-01-01", "2019-12-31", "2021-01-01", "2022-01-01"]
let userColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];


//Set Selections
var selectedCountry = "Belgium";
var selectedDate = "2020-01-01";
var name_file = "Belgiumonly";

//Load Data
d3.json("../docs/data/" + name_file + ".json", d => {
}).then(data => {
  //Calculate the stats of that country on that date
  //TODO: Whole time
  calculateStats_ByCountry(data, selectedCountry, selectedDate);
  //Filter the data by country and Date
  var filterData = filterData_ByCountry(data, selectedCountry);
  //Create Scatterplot with filtered data
  createScatterPlot(filterData);
  createTimeLine(filterData);
})

//Create SVG
let svg = d3.select("#plotSVG")
  .style("overflow", "visible") // some tooltips stray outside the SVG border
  .append("g")
  .attr("transform", "translate(50,50)")

 

/**
 * Function to Filter the data from the json file by Country (and date)
 * @param {*} data_array 
 * @param {*} givenCountry 
 * @param {*} givenDate 
 * @returns 
 */
function filterData_ByCountry(data_array, givenCountry) {
  var filtered_data = [{}];
  var counter_newDataArray = 0;
  for (i = 0; i < data_array.length; i++) {
    //Create a new Array with only the data from that country
    if (data_array[i].country == givenCountry) {
      //  if (data_array[i].messagesSent > 1) {
      //   if (data_array[i].appOpens > 1) {
      // if (data_array[i].date == givenDate) {
      filtered_data[counter_newDataArray] = data_array[i];
      counter_newDataArray++;
      //   }
      //  }
      //   }
    }
  }
  return filtered_data;
}


/**
 * Calculate the stats for country
 * @param {*} data_array 
 * @param {*} givenCountry 
 * @param {*} givenDate 
 */
function calculateStats_ByCountry(data_array, givenCountry, givenDate) {
  for (i = 0; i < data_array.length; i++) {
    if (data_array[i].country == givenCountry) {
      if (data_array[i].date == givenDate) {
        counter_countryswipes = counter_countryswipes + data_array[i].swipeLike + data_array[i].swipePass;
        counter_countryconversationCount = counter_countryconversationCount + data_array[i].messagesReceived + data_array[i].messagesSent;
      }
    }
  }

}

/**
 * Add the stats of the selected country to the screen. 
 * @param {*} numberSwipes 
 * @param {*} numberconversationCount 
 */
function addCountryStats(numberSwipes, numberconversationCount) {
  const element_text_swipes = document.createElement("p");
  const node_swipes = document.createTextNode("Swipes: " + numberSwipes);
  element_text_swipes.appendChild(node_swipes);
  document.getElementById("country-stats").appendChild(element_text_swipes);


  const element_text_conversationCount = document.createElement("p");
  const node_conversationCount = document.createTextNode("Messages: " + numberconversationCount);
  element_text_conversationCount.appendChild(node_conversationCount);
  document.getElementById("country-stats").appendChild(element_text_conversationCount);
}


function createScatterPlot(filteredData) {



  let xScale = d3.scaleLinear()
    .domain([0, 250])   // my x-variable has a max of 2500
    .range([0, 600]);   // my x-axis is 600px wide

  let yScale = d3.scaleLinear()
    .domain([0, 120])   // my y-variable has a max of 1200
    .range([heightGraph, 0]);   // my y-axis is 400px high
  // (the max and min are reversed because the 
  // SVG y-value is measured from the top)

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
    .data(filteredData)    // bind each element of the data array to one SVG circle
    // .enter()
    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.messagesSent + d.messagesReceived))   // set the x position based on the number of conversationCount
    .attr("cy", d => yScale(d.swipePass + d.swipeLike))   // set the y position based on the number of swipes
    .attr("r", d => Math.sqrt(d.appOpens))  // set the radius based on the article reading time
    .attr("fill", d => {
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
    .data(filteredData)
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
    .text(d => "(Messages: " + (d.messagesSent + d.messagesReceived) + ")")
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
        .domain([d3.min(filteredData, d => d[xVar]), d3.max(filteredData, d => d[xVar])])
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
        .domain([0, d3.max(filteredData, d => d[xVar])])
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
      .domain([0, d3.max(filteredData, d => d[yVar])])
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
/*
function functionGhost() {
  selectedDate = dates[++counterClick];
  const element = document.querySelectorAll(".bubble");
  d3.json("../docs/data/allUsers_ByDate.json", d => {

  }).then(data => {


    filterData = filterData_ByCountry(data, selectedCountry, selectedDate);

    colorBubblesGrey();
    addBubbles(filterData);
  })

}*/

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
    .text(d => "(Messages: " + (d.messagesSent + d.messagesReceived) + " )")
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

var formatDateIntoMonth = d3.timeFormat("%m/%y");
var formatDate = d3.timeFormat("%b %d %Y");

var formatDateForData = d3.timeFormat("%Y-%m-%d");
var parseDate = d3.timeParse("%m/%d/%y");
var scatterPlotOpen = false;
let uniqueListOfCountries = [];

var margin = { top: 50, right: 50, bottom: 50, left: 20 }, height = 1600;

const width = 1600;



function createTimeLine(datingData, covidData) {
  let filteredDatingData = datingData.filter(data => data.date == startDate);
   
  var startDate = new Date(datingData[0].date),
    endDate = new Date(datingData[datingData.length - 1].date);
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  //console.log(startDate, endDate)

  var timelineMargin = { top: 50, right: 50, bottom: 0, left: 50 },
    timelineWidth = 2 * width / 3 - timelineMargin.left - timelineMargin.right,
    timelineHeight = 200 - timelineMargin.top - timelineMargin.bottom;

  var svg = d3.select("#timeLine")
    .append("svg")
    .attr("width", timelineWidth + timelineMargin.left + timelineMargin.right)
    .attr("height", timelineHeight + timelineMargin.top + timelineMargin.bottom);
  //.attr('transform', 'translate(' + (timelineMargin.left-(width)/2) + ',' + 0 + ')');
  //FIX ALIGNMENT ISSUES
  ////////// slider //////////

  var moving = false;
  var currentValue = 0;
  var targetValue = timelineWidth;
  /*
  var playButton = d3.select("#play-button");
  playButton.attr('class', 'position-absolute top-100 start-50');
  */
  var timeX = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

  var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + timelineMargin.left + "," + timelineHeight / 5 + ")");

  slider.append("line")
    .attr("class", "track")
    .attr("x1", timeX.range()[0])
    .attr("x2", timeX.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function () { slider.interrupt(); })
      .on("start drag", function (e) {
        currentValue = e.x;
        updateSlider(timeX.invert(currentValue));
      })
    );

  slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(timeX.ticks(10))
    .enter()
    .append("text")
    .attr("x", timeX)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function (d) { return formatDateIntoMonth(d); });

  var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

  var label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-15) + ")")

  /* playButton
     .on("click", function () {
       var button = d3.select(this);
       if (button.text() == "Pause") {
         moving = false;
         clearInterval(timer);
         // timer = 0;
         button.text("Play");
       } else {
         moving = true;
         timer = setInterval(step, 1000);
         button.text("Pause");
       }
     });*/

  function step() {
    updateSlider(timeX.invert(currentValue));
    currentValue = currentValue + (targetValue / totalDays);
    if (currentValue > targetValue) {
      moving = false;
      currentValue = 0;
      clearInterval(timer);
      // timer = 0;
      /*  playButton.text("Play");*/
    }
  }

  function updateSlider(h) {
    // update position and text of label according to slider scale
    handle.attr("cx", timeX(h));
    label
      .attr("x", timeX(h))
      .text(formatDate(h));
    // filter data set and redraw plot

    //d3.select('#radial').select('svg').remove()
    /* if(scatterPlotOpen){
       updateScatter();
     }else{
       updateRadial();
     }*/
    updateScatter();

  }

  function updateScatter() {
    colorBubblesGrey();
    const date = formatDateForData(new Date(label.text()));
    filteredDatingData = datingData.filter(data => data.date <= date);
    d3.selectAll('.bubble').remove();
    plotDataCircles(filteredDatingData);
  
    //   d3.selectAll(".bubble").attr("fill-opacity", 0.4);
    /*const date = formatDateForData(new Date(label.text()));
    filteredDatingData = datingData.filter(data => data.date <= date);
    // d3.selectAll('.cloud').remove();
    // for(item of filteredDatingData.filter(newData => newData.date==date)){
    //   createCloudChart(item);
    // }
    plotDataCircles(filteredDatingData);*/
    // selectedDate = dates[++counterClick];
    /*  selectedDate =  formatDateForData(new Date(label.text()));
      const element = document.querySelectorAll(".bubble");
      d3.json("../docs/data/"+name_file+".json", d => {
    
      }).then(data => {
    
    
        filterData = filterData_ByCountry(data, selectedCountry, selectedDate);
    
       
        addBubbles(filterData);
      })*/

  }
 // function addBubbles(allTestData) {
    function plotDataCircles(allTestData){

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
  
  
    /*
      let categoryColors = {
        "No Measure": "#11111",
        "Measure 1": "#1f77b4",
        "Measure 2": "#8c564b",
        "Measure 3": "#235643",
    
      }*/
  
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
    .enter()
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
      .text(d => "(Messages: " + (d.messagesSent + d.messagesReceived) + " )")
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
  
  
  
  
    colorBubblesGrey();
  /*  var max= 300;
    var radius = 600;
    var currentDate = formatDateForData(new Date(label.text()));
    var locations = svg.selectAll(".location")
      .data(filteredDatingData);

    locations
      .attr('fill', function(d){
        if(d.date==currentDate) return 'blue';
        else return 'lightgrey';
      })
      .attr('r', function(d){
        if(d.date==currentDate) return 10;
        else return 4;
      })
      .attr('opacity',function(d){
        if(d.date==currentDate) return 0.75;
        else return 0.5;})
      .attr('stroke-width',2);
      

    // if filtered dataset has more circles than already existing, transition new ones in
    locations.enter()
      .append("circle")
      .attr("class", "location")
      .attr('cx', function (d) { return get_xy(d.appOpens/Math.max(d.activeUsers,1)+shift,uniqueListOfCountries.indexOf(d.country),radius,max)[0];})
      .attr('cy', function (d) { return get_xy(d.appOpens/Math.max(d.activeUsers,1)+shift,uniqueListOfCountries.indexOf(d.country),radius,max)[1];})
      .attr('r', function(d){
        if(d.date==currentDate) return 10;
        else return 4;
      })
      .attr('fill', function(d){
        if(d.date==currentDate) return 'blue';
        else return 'lightgrey';
      })
      .attr('opacity',function(d){
        if(d.date==currentDate) return 0.75;
        else return 0.5;})
      .attr('stroke', function(d){
         if(d.daysSince>=28){
          return covidColours[-1];
       }
        return covidColours[Math.floor(d.daysSince/7)];
       })
      .attr('stroke-width',2)
      //.append('title').text(d => d.country + ": "+d.date+ "\n"+d.appOpens/Math.max(d.activeUsers,1))
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("click", clickon)
      //.transition()
      // .duration(200)
      // .attr('r', 15)
       .transition()
       .on("end", function(){
         d3.select(this).append('title').text(d => d.country + ": "+d.date+ "\n"+d.appOpens/Math.max(d.activeUsers,1));
       });

    // if filtered dataset has less circles than already existing, remove
    locations.exit()
    .remove();
    
    function clickon (){
      openScatterplot(d3.select(this).select('title').text().split(':')[0],currentDate);
    }

    function mouseover () {
      svg.selectAll(".location")
      .attr('opacity', 0.25);
        
      d3.select(this)
          .raise();
        
      d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 3)
          .attr('opacity', 1);  
      };
    
      function mouseout () {
        var currentDate = formatDateForData(new Date(label.text()));
        //const avgUsers = d3.select(this).node();
        if(!d3.select(this).select('title').text().includes(currentDate)){
          d3.select(this)
            .lower();
        }

        svg.selectAll(".location")
            .attr('opacity',function(d){
              if(d.date==currentDate) return 0.75;
              else return 0.5;})
            .attr('stroke', function(d){
               if(d.daysSince>=28){
                return covidColours[-1];
             }
              return covidColours[Math.floor(d.daysSince/7)];
             })
             .attr('stroke-width', 2);

      };
*/
  }

}