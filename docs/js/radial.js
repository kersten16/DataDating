// Set the time format
//const parseTime = d3.timeParse("%Y");

var formatDateIntoMonth = d3.timeFormat("%m/%y");
var formatDate = d3.timeFormat("%b %d %Y");
var formatDateForData = d3.timeFormat("%Y-%m-%d")
var parseDate = d3.timeParse("%m/%d/%y");

var margin = {top: 50, right: 50, bottom: 50, left: 50},height = 1600;
const width = 1600;
let uniqueListOfCountries= [];

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
}).then(datingData => {
  // We need to make sure that the data are sorted correctly by date and then by average app opens
  datingData = datingData.sort((a, b) => d3.ascending(a.date, b.date)|| d3.ascending(a.country, b.country));
  var listOfCountries = datingData.map(d => d.country);
  uniqueListOfCountries = [...new Set(listOfCountries).values()];
    //a.appOpens/(Math.max(a.activeUsers,1)),b.appOpens/(Math.max(b.activeUsers,1))));
  createVisual(datingData);
  //createTimeLine(data);
})
/***********************************CREATE TIMELINE **************************************/
function createVisual(data){
    var startDate = new Date(data[0].date),
    endDate = new Date(data[data.length-1].date);
    const totalDays=(endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    //console.log(startDate, endDate)

  var timelineMargin = { top: 50, right: 50, bottom: 0, left: 50 },
    timelineWidth = 2*width/3 - timelineMargin.left - timelineMargin.right,
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

  var playButton = d3.select("#play-button");
  playButton.attr('class', 'position-absolute top-100 start-50');

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
          timer = setInterval(step, 1000);
          button.text("Pause");
        }
      });

  function step() {
    updateSlider(timeX.invert(currentValue));
    currentValue = currentValue + (targetValue /totalDays );
    if (currentValue > targetValue) {
      moving = false;
      currentValue = 0;
      clearInterval(timer);
      // timer = 0;
      playButton.text("Play");
    }
  }

  function updateSlider(h) {
    // update position and text of label according to slider scale
    handle.attr("cx", timeX(h));
    label
      .attr("x", timeX(h))
      .text(formatDate(h));
    // filter data set and redraw plot
    //console.log(formatDateForData(h))
    //d3.select('#radial').select('svg').remove()
    updateRadial();
  }
/***************************************CREATE RADIAL GRAPH*********************************************/

  function rotated(i){
    var rotated_i = parseInt(i) -1;
    if(rotated_i >= uniqueListOfCountries.length){
        rotated_i = i - uniqueListOfCountries.length;
    }
    else if(rotated_i < 0) {
        rotated_i = uniqueListOfCountries.length - 1 + parseInt(i);
    }
    return rotated_i
}

function to_radian(i){
    return i * 2 * Math.PI / uniqueListOfCountries.length;
}

function get_xy(value, index, radius, max){
  var center_y = radius;
  var center_x = radius/2;
    var length = radius * value / max;
    y = center_y - length * Math.cos(to_radian(rotated(index)));
    x = center_x + length * Math.sin(to_radian(rotated(index)));
    return [x, y];
}

function get_anchor(i){
    if(rotated(i) == 0 | rotated(i) == uniqueListOfCountries.length / 2){
        return 'middle';
    }
    else if(rotated(i) < uniqueListOfCountries.length / 2){
        return 'start';
    }
    else{
        return 'end';
    }
}

function get_dy(index){
  var dy = -3 * Math.cos(to_radian(rotated(index)));
  dy += 3;
  if(rotated(index) == 0){
    dy -= 4;
  }
  return dy;
}

/************************** MAKE RADIAL CHART *******************************/
  var max= 300;
  var ticks= (max/10)+1
  var radius = 600;
  var shift = max / ticks;
  var startDate=(data[0]["date"]);
  let newData = data.filter(data => data.date == startDate);
  var svg = d3.select('#radial').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('transform', 'translate(' + -250+ ',0)')
  .append('g')
  .attr('transform', 'translate(' + (radius-150)+ ',' + 100 + ')');
  

  for(i in uniqueListOfCountries){
    
    var country = uniqueListOfCountries[i];
    var start = get_xy(max / ticks, i, radius, max); //create a donut
    var end = get_xy(max+shift, i, radius, max);

    svg.append('line')
        .attr('x1', start[0])
        .attr('y1', start[1])
        .attr('x2', end[0])
        .attr('y2', end[1])
        .style('stroke', 'lightgrey')
        .style('stroke-width', 0.5);


    var plabel = get_xy((max+shift) * 1.1, i, radius,max);

    svg.append('text')
        .attr('x', plabel[0])
        .attr('y', plabel[1])
        .attr('dy', function(){return get_dy(i)})
        .attr('text-anchor', get_anchor(i))
        .attr('class', 'label')
        .text(country)
        .style('font-size', '20px');
  }
  plotDataCircles(newData);
  for(item of newData.filter(newData => newData.date==date)){
    createCloudChart(item);
  }

  
/**********************************HANDLE DATA UPDATES************************************/
  function plotDataCircles(newData){
    var max= 300;
    var radius = 600;
    var currentDate = formatDateForData(new Date(label.text()));
    var locations = svg.selectAll(".location")
      .data(newData);

    locations
      .attr('fill', function(d){
        if(d.date==currentDate) return 'green';
        else return 'lightgrey';
      })
      .attr('r', function(d){
        if(d.date==currentDate) return 10;
        else return 4;
      })
      .attr('opacity',function(d){
        if(d.date==currentDate) return 0.75;
        else return 0.5;});
      

    // if filtered dataset has more circles than already existing, transition new ones in
    locations.enter()
      .append("circle")
      .attr("class", "location")
      .attr('cx', function (d) { return get_xy(d.appOpens/Math.max(d.activeUsers,1)+shift,uniqueListOfCountries.indexOf(d.country),radius,max)[0];})
      .attr('cy', function (d) { return get_xy(d.appOpens/Math.max(d.activeUsers,1)+shift,uniqueListOfCountries.indexOf(d.country),radius,max)[1];})
      .attr('r', 8)
      .attr('fill', function(d){
        if(d.date==currentDate) return 'green';
        else return 'lightgrey';
      })
      //.append('title').text(d => d.country + ": "+d.date+ "\n"+d.appOpens/Math.max(d.activeUsers,1))
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      //.on("click", openScatterplot)
      .transition()
      .duration(200)
      .attr('r', 15)
      .transition()
      .attr('r', function(d){
        if(d.date==currentDate) return 10;
        else return 4;
      })
      .attr('opacity',function(d){
        if(d.date==currentDate) return 0.75;
        else return 0.5;})
      .on("end", function(){
        d3.select(this).append('title').text(d => d.country + ": "+d.date+ "\n"+d.appOpens/Math.max(d.activeUsers,1));
      });

    // if filtered dataset has less circles than already existing, remove
    locations.exit()
    .remove();
    

    function mouseover () {
      const avgUsers = d3.select(this).node();
      // if(d3.select(this).data==formatDateForData(currentDate)){

      // }
        d3.select(this)
          .raise();
          

        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 2)
          .attr('opacity', 1);  
       };
     
       function mouseout () {
        var currentDate = formatDateForData(new Date(label.text()));
        //const avgUsers = d3.select(this).node();
          if(!d3.select(this).select('title').text().includes(currentDate)){
            d3.select(this)
              .lower();
            }

         d3.select(this)
           .attr("stroke", null)
           .attr('opacity',function(d){
            if(d.date==currentDate) return 0.75;
            else return 0.5;});

       };
 
  }

  function updateRadial() {
    const date = formatDateForData(new Date(label.text()));
    newData = data.filter(data => data.date <= date);
    d3.selectAll('.cloud').remove();
    plotDataCircles(newData);
    for(item of newData.filter(newData => newData.date==date)){
      createCloudChart(item);
    }
  }

  function createCloudChart(item){
    // let newData = data.filter(data => data.date == "2019-02-15").filter(function(d){ return d.activeUsers != 0 });
    // specify svg width and height;
    const cloudWidth = Math.ceil(((item['swipes']+item['messages'])/10)), cloudHeight = Math.ceil(((item['swipes']+item['messages'])/10));
    const listenTo = Math.min(cloudWidth, cloudHeight);
    // create svg and g DOM elements;
    //let coord=get_xy(item['appOpens']/Math.max(item['activeUsers'],1)+shift,uniqueListOfCountries.indexOf(item['country']),radius,max);
    var coord = get_xy(max+shift*3, uniqueListOfCountries.indexOf(item['country']), radius, max);
    let cloud = svg
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('width', listenTo)
      .attr('height', listenTo)
      .append('g')
      .attr('class', 'cloud')
      .attr('transform', `translate(${coord[0]}, ${coord[1]})`);

    var images = [], numSwipes = Math.floor(item['swipes']/10), swipeRem=Math.ceil(item['swipes']%10), numMsg = Math.floor(item['messages']/10), msgRem=Math.ceil(item['messages']%10),maxImages = numSwipes+numMsg, padding=1;
    var msgIconPath= "https://kersten16.github.io/InfoVis/docs/icons/message.png";
    var swipeIconPath = "https://kersten16.github.io/InfoVis/docs/icons/thumbs-up.png";
    //console.log(numMsg, numSwipes, swipeRem,msgRem);
    for(let i = 0; i< maxImages; i++){
      //const weight = 10;
      
      if(numSwipes>0){
        images.push({
          url:swipeIconPath,
          weight:10
        });
        //console.log(swipeIconPath);
        numSwipes-=1;
      }
      else if(numMsg>0){
        //console.log("should be");
        images.push({
          url:msgIconPath,
          weight:10
        });
        numMsg-=1;
      } 
    }
    if(swipeRem>0){
      images.push({
        url:swipeIconPath,
        weight:swipeRem
      });
    }
    if(msgRem>0){
      images.push({
        url:msgIconPath,
        weight:msgRem
      });
    }
  
    //images.sort((a, b) => b.weight - a.weight);
  
  
    // function to scale the images
    const scaleSize = d3.scaleLinear().domain([1,4 ]).range([1, 4]).clamp(true);
    // append the icons
    let vizImages = cloud.selectAll('.image-cloud-image')
      .data(images)
      .enter()
      .append('svg:image')
      .attr('class', '.image-cloud-image')
      .attr('height', d => scaleSize(d.weight))
      .attr('width', d => scaleSize(d.weight))
      .attr('id', d => d.url)
      .attr('href',  d => d.url);
      vizImages.exit().remove();

    
      // create the collection of forces
const simulation = d3.forceSimulation()
// set the nodes for the simulation to be our images
.nodes(images)
// set the function that will update the view on each 'tick'
.on('tick', ticked)
.force('center', d3.forceCenter())
.force('cramp', d3.forceManyBody().strength(5))
// collition force for rects
.force('collide', rectCollide().size(d=> {
const s = scaleSize(d.weight);
return [s + padding, s + padding];
}));

// update the position to new x and y
function ticked() {
vizImages.attr('x', d => d.x).attr('y', d=> d.y);
}

// Rect collition algorithm. i don't know exactly how it works
// https://bl.ocks.org/cmgiven/547658968d365bcc324f3e62e175709b
function rectCollide() {
  var nodes, sizes, masses
  var size = constant([0, 0])
  var strength = 1
  var iterations = 3

  function force() {
      var node, size, mass, xi, yi
      var i = -1
      while (++i < iterations) { iterate() }

      function iterate() {
          var j = -1
          var tree = d3.quadtree(nodes, xCenter, yCenter).visitAfter(prepare)

          while (++j < nodes.length) {
              node = nodes[j]
              size = sizes[j]
              mass = masses[j]
              xi = xCenter(node)
              yi = yCenter(node)

              tree.visit(apply)
          }
      }

      function apply(quad, x0, y0, x1, y1) {
          var data = quad.data
          var xSize = (size[0] + quad.size[0]) / 2
          var ySize = (size[1] + quad.size[1]) / 2
          if (data) {
              if (data.index <= node.index) { return }

              var x = xi - xCenter(data)
              var y = yi - yCenter(data)
              var xd = Math.abs(x) - xSize
              var yd = Math.abs(y) - ySize

              if (xd < 0 && yd < 0) {
                  var l = Math.sqrt(x * x + y * y)
                  var m = masses[data.index] / (mass + masses[data.index])

                  if (Math.abs(xd) < Math.abs(yd)) {
                      node.vx -= (x *= xd / l * strength) * m
                      data.vx += x * (1 - m)
                  } else {
                      node.vy -= (y *= yd / l * strength) * m
                      data.vy += y * (1 - m)
                  }
              }
          }

          return x0 > xi + xSize || y0 > yi + ySize ||
                 x1 < xi - xSize || y1 < yi - ySize
      }

      function prepare(quad) {
          if (quad.data) {
              quad.size = sizes[quad.data.index]
          } else {
              quad.size = [0, 0]
              var i = -1
              while (++i < 4) {
                  if (quad[i] && quad[i].size) {
                      quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
                      quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
                  }
              }
          }
      }
  }

  function xCenter(d) { return d.x + d.vx + sizes[d.index][0] / 2 }
  function yCenter(d) { return d.y + d.vy + sizes[d.index][1] / 2 }

  force.initialize = function (_) {
      sizes = (nodes = _).map(size)
      masses = sizes.map(function (d) { return d[0] * d[1] })
  }

  force.size = function (_) {
      return (arguments.length
           ? (size = typeof _ === 'function' ? _ : constant(_), force)
           : size)
  }

  force.strength = function (_) {
      return (arguments.length ? (strength = +_, force) : strength)
  }

  force.iterations = function (_) {
      return (arguments.length ? (iterations = +_, force) : iterations)
  }

  return force
}
function constant(_) {
  return function () { return _ }
}
      
            
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
