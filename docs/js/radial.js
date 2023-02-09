// Set the time format
//const parseTime = d3.timeParse("%Y");

var formatDateIntoMonth = d3.timeFormat("%m/%y");
var formatDate = d3.timeFormat("%b %Y");
var formatDateForData = d3.timeFormat("%Y-%m-%d")
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 50, right: 50, bottom: 50, left: 50},height = 1000;
const width = 1600;


// Load the dataset and formatting variables
d3.json("data/allDates_ByCountry.json", d => {
  return {
    date:d[i].date,
    country:d[i].country,
    users: d[i].activeUsers,
    appOpens: d[i].appOpens,
    swipes : d[i].swipes,
    messages : d[i].messages
  }
}).then(data => {
  // We need to make sure that the data are sorted correctly by date and then by average app opens
  data = data.sort((a, b) => d3.ascending(a.date, b.date)|| d3.descending(a.appOpens/(Math.max(a.activeUsers,1)),b.appOpens/(Math.max(b.activeUsers,1))));

  createTimeLine(data);
})

function createTimeLine(data){
    var startDate = new Date(data[0].date),
    endDate = new Date(data[data.length-1].date);
    //console.log(startDate, endDate)

  var timelineMargin = { top: 50, right: 50, bottom: 0, left: 50 },
    timelineWidth = 960 - timelineMargin.left - timelineMargin.right,
    timelineHeight = 500 - timelineMargin.top - timelineMargin.bottom;

  var svg = d3.select("#timeLine")
    .append("svg")
    .attr("width", timelineWidth + timelineMargin.left + timelineMargin.right)
    .attr("height", timelineHeight + timelineMargin.top + timelineMargin.bottom);

  ////////// slider //////////

  var moving = false;
  var currentValue = 0;
  var targetValue = timelineWidth;

  var playButton = d3.select("#play-button");

  var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

  var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + timelineMargin.left + "," + timelineHeight / 5 + ")");

  slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function () { slider.interrupt(); })
      .on("start drag", function (e) {
        currentValue = e.x;
        updateSlider(x.invert(currentValue));
      })
    );

  slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
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
    .attr("transform", "translate(0," + (-25) + ")")

    playButton
      .on("click", function () {
        var button = d3.select(this);
        if (button.text() == "Pause") {
          moving = false;
          clearInterval(timer);
          // timer = 0;
          button.text("Play");
        } else {
          moving = true;
          timer = setInterval(step, 100);
          button.text("Pause");
        }
        console.log("Slider moving: " + moving);
      });

  function step() {
    updateSlider(x.invert(currentValue));
    currentValue = currentValue + (targetValue / 151);
    if (currentValue > targetValue) {
      moving = false;
      currentValue = 0;
      clearInterval(timer);
      // timer = 0;
      playButton.text("Play");
      console.log("Slider moving: " + moving);
    }
  }

  function updateSlider(h) {
    // update position and text of label according to slider scale
    handle.attr("cx", x(h));
    label
      .attr("x", x(h))
      .text(formatDate(h));

    // filter data set and redraw plot
    console.log(formatDateForData(h))
    d3.select('#radial').select('svg').remove()
    let newData = data.filter(data => data.date == formatDateForData(h)).filter(function(d){ return d.activeUsers != 0 });
    update(newData);
  }

}

  //Add event listener to the date slider
  d3.select("#timeLine").on("change", function(e) {
    // Get the date selected
    console.log(`date = ${this.value} `);
    // Update the chart
    updateSlider();
  });

  function rotated(i, newData){
    var rotated_i = parseInt(i) -1;
    if(rotated_i >= newData.length){
        rotated_i = i - newData.length;
    }
    else if(rotated_i < 0) {
        rotated_i = newData.length - 1 + parseInt(i);
    }
    return rotated_i
}

function to_radian(i, newData){
    return i * 2 * Math.PI / newData.length;
}

function get_xy(value, index, radius, max, newData){
  var center_y = ((radius*2)+100) / 2-100;
  var center_x = width / 2;
    var length = radius * value / max;
    y = center_y - length * Math.cos(to_radian(rotated(index, newData), newData));
    x = center_x + length * Math.sin(to_radian(rotated(index, newData), newData));
    return [x, y];
}

function get_anchor(i, newData){
    if(rotated(i, newData) == 0 | rotated(i, newData) == newData.length / 2){
        return 'middle';
    }
    else if(rotated(i, newData) < newData.length / 2){
        return 'start';
    }
    else{
        return 'end';
    }
}

function get_dy(index, newData){
  var dy = -3 * Math.cos(to_radian(rotated(index, newData), newData));
  dy += 3;
  if(rotated(index, newData) == 0){
    dy -= 4;
  }
  return dy;
}

  function update(newData) {

    var max= newData[0]['appOpens']/newData[0]['activeUsers'];
    max=max+max%5
    var ticks = max/5 +1;
    var radius = max*5;
    height= (radius*2)+200;
      
    var svg = d3.select('#radial').append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + 200 + ')');


      //   // 1.4 Get the selected date and sorting method
      // const date = d3.select("#timeLine").node().value;
      //   // 1.5. Filter and sorting the new data
      // newData= data.filter(data => data.date == date);

        
      var shift = max / ticks;
  /**scale label**/
      var value = 0;
      var plabel = get_xy(value*(ticks-1)/ticks+5, 1, radius, max, newData);
      svg.append('text')
            .attr('x', plabel[0])
            .attr('y', plabel[1])
            .attr('dx', 2)
            .attr('class', 'label')
            .style('font-weight', 'lighter')
            .style('fill', 'grey')
            .text(value);
        for(tick = 1; tick <= ticks; tick++) {
            var value = (max * tick) / (ticks-1);
            var plabel = get_xy(value*(ticks-1)/ticks+5, 1, radius, max, newData);
            //console.log(tick, value, plabel)
            svg.append('text')
                .attr('x', plabel[0])
                .attr('y', plabel[1])
                .attr('dx', 2)
                .attr('class', 'label')
                .style('font-weight', 'lighter')
                .style('fill', 'grey')
                .text(Math.ceil(value));  
        }
      /****/
        for(i in newData){
            var item = newData[i];
            /*round markers */
            for(tick = 0; tick <= ticks; tick++){
                var value = max * tick / ticks;
                var start = get_xy(value+shift, i, radius, max, newData);
                var end = get_xy(value+shift, parseInt(i) + 1,radius, max, newData);
                svg.append('line')
                    .attr('x1', start[0])
                    .attr('y1', start[1])
                    .attr('x2', end[0])
                    .attr('y2', end[1])
                    .style('stroke', 'lightgrey')
                    .style('stroke-width', 0.5);
            }
            /**/

            var highest_value = item['appOpens']/item['activeUsers'];

            var start = get_xy(max / ticks, i, radius, max, newData); //create a donut
            var end = get_xy(max+shift, i, radius, max ,newData);

            svg.append('line')
                .attr('x1', start[0])
                .attr('y1', start[1])
                .attr('x2', end[0])
                .attr('y2', end[1])
                .style('stroke', 'lightgrey')
                .style('stroke-width', 0.5);

            
            end = get_xy(highest_value+shift, i, radius, max, newData);

            svg.append('line')
                .attr('x1', start[0])
                .attr('y1', start[1])
                .attr('x2', end[0])
                .attr('y2', end[1])
                .style('stroke', 'black')
                .style('stroke-width', 1.3);

             svg.append('circle')
                .attr('cx', end[0])
                .attr('cy', end[1])
                .attr('r', '5')
                .attr('fill', 'red');

            var plabel = get_xy((max+shift) * 1.04, i, radius,max, newData);

            svg.append('text')
                .attr('x', plabel[0])
                .attr('y', plabel[1])
                .attr('dy', function(){return get_dy(i, newData)})
                .attr('text-anchor', get_anchor(i, newData))
                .attr('class', 'label')
                .text(item['country']);
          }

}
// const createBarChart = (data, colors) => {
//   // Set the dimensions and margins of the graph
//   const width = 900, height = 400;
//   const margins = {top: 10, right: 30, bottom: 80, left: 20};

//   // Filter the data from the date 2020
//   let newData = data.filter(data => data.date == "2020");

//   // Create the SVG container
//   const svg = d3.select("#bar")
//     .append("svg")
//     .attr("viewBox", [0, 0, width, height]);

//   // Define x-axis, y-axis, and color scales
//   const xScale = d3.scaleBand()
//     .domain(newData.map(d => d.country))
//     .range([margins.left, width - margins.right])
//     .padding(0.2);

//   const yScale = d3.scaleLinear()
//     .domain([0, d3.max(newData, d => d.value)])
//     .range([height - margins.bottom, margins.top]);

//   // Create the bar elements and append to the SVG group
//   let bar = svg.append("g")
//     .selectAll("rect")
// // TODO: Add geo as id to refer to the data point
//     .data(newData, d=> d.geo)
//     .join("rect")
// // TODO: Add geo as the class
// .attr("class", d=> '$(d.geo)')
//       .attr("x", d => xScale(d.country))
//       .attr("y", d => yScale(d.value))
//       .attr("height", d => yScale(0) - yScale(d.value))
//       .attr("width", xScale.bandwidth())
//       .attr("fill", d => colors(d.country));

// // TODO: 2.1 Add event listener to each bar
//   bar.on("mouseover",mouseover);

//   bar.on("mouseout", mouseout);

//   // Add the tooltip when hover on the bar
//   bar.append('title').text(d => d.country);

//   // Create the x and y axes and append them to the chart
//   const yAxis = d3.axisLeft(yScale);

//   const yGroup = svg.append("g")
//       .attr("transform", `translate(${margins.left},0)`)
//     .call(yAxis)
//     .call(g => g.select(".domain").remove());

//   const xAxis = d3.axisBottom(xScale);

//   const xGroup = svg.append("g")
//       .attr("transform", `translate(0,${height - margins.bottom})`)
//     .call(xAxis);

//   xGroup.selectAll("text")
//     .style("text-anchor", "end")
//     .attr("dx", "-.8em")
//     .attr("dy", ".15em")
//     .attr("transform", "rotate(-65)");

// // TODO: 1.1 Add event listener to the date slider
//   d3.select("#dateSlider").on("change", function(e) {
//     // Get the date selected
//     console.log(`date = ${this.value} `);
//     // Update the chart
//     update();
//   });

// // TODO: 1.2 Add event listener to the sort dropdown
//   d3.select("#sort").on("change", function(e) {
//     // Get the sorting option selected
//     console.log(`sort = ${this.value} `);
//     // Updte the chart
//     update();
//   });

// // TODO: 1.3 Update the bar chart based on new inputs
//   function update() {
//     // 1.4 Get the selected date and sorting method
//     const date = d3.select("#dateSlider").node().value;
//     const sort = d3.select("#sort").node().value;
//     // 1.5. Filter and sorting the new data
//     newData= data.filter(data => data.date == date);
//     switch(sort){
//       case "alphabet":
//         newData= newData.sort((a,b)=> d3.ascending(a.country,b.country));
//         break;
//       case "sortAsce":
//         newData= newData.sort((a,b)=> d3.ascending(a.value,b.value));
//         break;
//       case "sortDesc":
//         newData= newData.sort((a,b)=> d3.descending(a.country,b.country));
//         break;
//     }

//     // 1.6 Define new x and y scales

//     const xScale = d3.scaleBand()
//                   .domain(newData.map(d=>d.country))
//                   .range([margins.left, width-margins.right])
//                   .padding(0.2);

//     const yScale = d3.scaleLinear()
//                   .domain([0,d3.max(newData, d=>d.value)])
//                   .range([height-margins.bottom,margins.top]);
//     // 1.7. Define a transition.
//     const t= svg.transition().duration(1000);
//     // 1.8 Update the bar chart with enter, update, and exit pattern
//     bar = bar 
//           .data(newData, d=> d.geo)
//           .join(
//             enter =>enter.append("rect")
//             .attr("class", d=> `$(d.geo)`)
//             .attr("x", d=> xScale(d.country))
//             .attr("y", d=> yScale(d.value))
//             .attr("height", 0)
//             .attr("width", xScale.bandwidth())
//             .attr("fill", d=> colors(d.country))
//             .on("mouseover", mouseover)
//             .on("mouseout", mouseout)
//             .call(enter => enter.transition(t))
//             .attr("height", d => yScale(0)-yScale(d.value)),
//             update => update.transition(t)
//             .attr("x", d=> xScale(d.country))
//             .attr("y", d=> yScale(d.value))
//             .attr("height", d=> yScale(0)-yScale(d.value))
//             .attr( "width", xScale.bandwidth()),
//             exit => exit.transition(t)
//             .attr("y", yScale(0))
//             .attr("height", 0)
//             .remove()
//           );
//     // 1.9 Transition on the x and y axes
//     const xAxis= d3.axisBottom(xScale);
//     const yAxis = d3.axisLeft(yScale);

//     xGroup.transition(t)
//             .call(xAxis)
//             .call(g => g.selectAll(".tick"));
//     xGroup.selectAll("text")
//             .style("text-anchor","end")
//             .attr("dx", "-.8em")
//             .attr("dy", ".15em")
//             .attr("transform","rotate(-65)");
//     yGroup.transition(t)
//             .call(yAxis)
//             .selection()
//             .call(g => g.select(".domain").remove());
//   }
//   function mouseover () {
//     const geo = d3.select(this).attr('class');
//     const color = d3.select(this).attr('fill');

//     d3.select(this)
//       .attr("stroke", "#333")
//       .attr("stroke-width", 2);

//     d3.select(`path.${geo}`)
//       .style("stroke", color)
//       .style("opacity", 1);

//       d3.select(`text.${geo}`)
//         .style("visibility", "visible");
//   };

//   function mouseout () {
//     const geo = d3.select(this).attr('class');

//     d3.select(this)
//       .attr("stroke", null);

//     d3.select(`path.${geo}`)
//       .style("stroke", "lightgrey")
//       .style("opacity", 0.3);

//       d3.select(`text.${geo}`)
//         .style("visibility", "hidden");
//   };
// }
