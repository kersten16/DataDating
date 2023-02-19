// Set the time format
//const parseTime = d3.timeParse("%Y");

var formatDateIntoMonth = d3.timeFormat("%m/%y");
var formatDate = d3.timeFormat("%b %d %Y");
var formatDateForData = d3.timeFormat("%Y-%m-%d")
var parseDate = d3.timeParse("%m/%d/%y");
var scatterPlotOpen = false;
const delay = ms => new Promise(res => setTimeout(res, ms));
var margin = {top: 50, right: 50, bottom: 50, left: 50},height = 1600;
const width = 1600;
let uniqueListOfCountries= [];
let uniqueListOfMeasures = [];

// Load the dataset and formatting variables
  d3.json("data/allDates_Combined.json", d => {
    return {
      date:d[i].date,
      country:d[i].country,
      daysSince: d[i].daysSince,
      category: d[i].category,
      measure: d[i].measure,
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
    uniqueListOfCountries.unshift("Scale");
    var listOfMeasures = datingData.map(d => d.measure);
    uniqueListOfMeasures = [...new Set(listOfMeasures).values()];
    console.log(uniqueListOfMeasures);
      //a.appOpens/(Math.max(a.activeUsers,1)),b.appOpens/(Math.max(b.activeUsers,1))));
    createVisual(datingData);
    //createTimeLine(data);
  });

  /***********************************CREATE TIMELINE **************************************/
  function createVisual(datingData){
    var timeLineLabel;
    function createTimeLine(chartType, handleDate){
      var startDate = new Date(datingData[0].date),
      endDate = new Date(datingData[datingData.length-1].date);
      const totalDays=(endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
      //console.log(startDate, endDate)

      var timelineMargin = { top: 50, right: 50, bottom: 0, left: 50 },
        timelineWidth = 2*width/3 - timelineMargin.left - timelineMargin.right,
        timelineHeight = 200 - timelineMargin.top - timelineMargin.bottom;

      var svg = d3.select("#timeLine"+chartType)
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

      timeLineLabel = slider.append("text")
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
        timeLineLabel
          .attr("x", timeX(h))
          .text(formatDate(h));
        // filter data set and redraw plot

        //d3.select('#radial').select('svg').remove()
        if(scatterPlotOpen){
          updateScatter();
        }else{
          updateRadial();
        }
          
      }
      handle.attr("cx", timeX((handleDate)));
      timeLineLabel
        .attr("x", timeX((handleDate)))
        .text(formatDate((handleDate)));

    }
      
  /***************************************CREATE RADIAL GRAPH*********************************************/
  const covidColours=['#e31010','#ff5f03','#f5a105','#f2ed85','lightgrey']
  function createLegend(svg){

    var defs = svg.append( 'defs' );

    // append filter element
    var filter = defs.append( 'filter' )
                    .attr( 'id', 'blur' ) /// !!! important - define id to reference it later

    // append gaussian blur to filter
    filter.append( 'feGaussianBlur' )
          .attr( 'in', 'SourceGraphic' )
          .attr( 'stdDeviation', 5 ) // !!! important parameter - blur
          .attr( 'result', 'blur' );

      // create a list of keys
      var keys = ["<= 7 days", "8 - 14 days", "15 - 21 days", "22 - 28 days", "> 28 days"];

      svg.append("rect")
      .attr("class", "legendBG")
      .attr("x", 925)
      .attr("y", -200)
      .attr("width", 245)
      .attr("height", 200)
      .style("fill", "#373745")
      //.attr("fill-opacity",.9)
      .attr("filter", "url(#blur)");
      svg.append("text")
        .attr("x",940)
        .attr("y",-180)
        .style('font-size', '22px')
        .text("Days since last COVID")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", "white");
        svg.append("text")
        .attr("x",940)
        .attr("y",-155)
        .style('font-size', '22px')
        .text("measure announced")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", "white");
      // Add one dot in the legend for each name.
      svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
          .attr("cx", 990)
          .attr("cy", function(d,i){ return -120 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("r", 8)
          .style("fill", function(d){ return covidColours[keys.indexOf(d)];});

      // Add one dot in the legend for each name.
      svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
          .attr("x", 1010)
          .attr("y", function(d,i){ return -120 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("fill", function(d){ return covidColours[keys.indexOf(d)];})
          .style('font-size', '20px')
          .text(function(d){ return d})
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle");
  }

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
    createTimeLine("Radial", new Date(datingData[0].date));
    var max= 300;
    var ticks= (max/10)+1
    var radius = 600;
    var shift = max / ticks;
    var startDate=(datingData[0]["date"]);
    let filteredDatingData = datingData.filter(data => data.date == startDate);
    var svg = d3.select('#radial').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('transform', 'translate(' + -300+ ',' + -100 +')')
    .append('g')
    .attr('transform', 'translate(' + (radius-75)+ ',' + 200 + ')');
    
    createLegend(svg);

    var value = 0;
    var plabel = get_xy(value*(ticks-1)/ticks+5+shift, 0, radius, max);
    svg.append('text')
          .attr('x', plabel[0]-10)
          .attr('y', plabel[1])
          .attr('dx', 2)
          .attr('class', 'label')
          .style('font-weight', 'lighter')
          .style('fill', 'black')
          .text(value);
      for(tick = 1; tick <= ticks; tick++) {
          var value = (max * tick) / (ticks-1);
          var plabel = get_xy(value*(ticks-1)/ticks+5+shift, 0, radius, max);
          //console.log(tick, value, plabel)
          svg.append('text')
              .attr('x', plabel[0]-10)
              .attr('y', plabel[1])
              .attr('dx', 2)
              .attr('class', 'label')
              .style('font-weight', 'lighter')
              .style('fill', 'black')
              .text(Math.ceil(value));  
      }
    for(i in uniqueListOfCountries){
      
      var currCountry = uniqueListOfCountries[i];
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

      var textbox = svg.append('g')
                 .attr('id',currCountry)
      textbox.append('text')
          .attr('x', plabel[0])
          .attr('y', plabel[1])
          .attr('dy', function(){return get_dy(i)})
          .attr('text-anchor', get_anchor(i))
          .attr('class', 'label')
          //.attr('id',currCountry)
          .text(currCountry)
          .style('font-size', '22px')
      textbox.append('rect')
          .raise()
          .attr('class', 'textBB')
          .attr('x', function(){
            let width=this.parentNode.firstChild.getComputedTextLength()+5;
            if(get_anchor(i)=='end'){
              
              return  plabel[0] - width;
            }
            if(get_anchor(i)=='middle'){
              return  plabel[0] - width/2;
            }
            if(get_anchor(i)=='start'){
              return  plabel[0] - 5;
            }

          })
          .attr('y', function(){
            return plabel[1]-40;

          })
          .attr('persist', false)
          .attr('width', function(){return Math.max(this.parentNode.firstChild.getComputedTextLength()+10,75);})
          .attr('height', 60)
          .attr('fill-opacity', 0)
          .on("mouseover", function(e){
            //d3.selectAll('#'+e.target.parentNode.id+'_cloud').remove();
            if(this.persist || e.target.parentNode.id=="Scale"){return;}
            var date = formatDateForData(new Date(timeLineLabel.text()));
            extrafilteredDatingData = datingData.filter(data => data.date == date).filter(newData => newData.country==e.target.parentNode.id);
            return createCloudChart(extrafilteredDatingData[0]);
          } )
          .on("click",function(e){
            if(e.target.parentNode.id=="Scale"){return;}
            if(this.persist){
              this.persist=false;
              d3.select(e.target).attr('stroke', null);
              return d3.selectAll('#'+e.target.parentNode.id+'_cloud').remove();
            }
            this.persist=true;
            d3.select(e.target).attr('stroke', 'lightgrey');
            return ;
          })
          .on("mouseout", async function(e){
            //await delay(1000);
            if(!this.persist){
              return d3.selectAll('#'+e.target.parentNode.id+'_cloud').remove();
            }
            return;
          });
          
    }
    plotDataCircles(filteredDatingData);
    // for(item of filteredDatingData.filter(newData => newData.date==date)){
    //   createCloudChart(item);
    // }

    
  /**********************************HANDLE DATA UPDATES************************************/
    function plotDataCircles(filteredDatingData){
      var max= 300;
      var radius = 600;
      var currentDate = formatDateForData(new Date(timeLineLabel.text()));
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
        //console.log(new Date(currentDate));
        openScatterplot(d3.select(this).select('title').text().split(':')[0],new Date(currentDate));
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
          var currentDate = formatDateForData(new Date(timeLineLabel.text()));
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
  
    }

    function updateRadial() {
      const date = formatDateForData(new Date(timeLineLabel.text()));
      filteredDatingData = datingData.filter(data => data.date <= date);
      d3.selectAll('.cloud').remove();
      d3.selectAll('.textBB').attr('stroke',null);
      // for(item of filteredDatingData.filter(newData => newData.date==date)){
      //   createCloudChart(item);
      // }
      plotDataCircles(filteredDatingData);
    }
/*********************************** CREATE CLOUD CHART *****************************************/
    function createCloudChart(item){
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
        .attr('id', item["country"]+'_cloud')
        .attr('transform', `translate(${coord[0]}, ${coord[1]})`);

      var images = [], numSwipes = Math.floor(item['swipes']/10), swipeRem=Math.ceil(item['swipes']%10), numMsg = Math.floor(item['messages']/10), msgRem=Math.ceil(item['messages']%10),maxImages = numSwipes+numMsg, padding=1;
      var msgIconPath= "https://kersten16.github.io/InfoVis/docs/icons/message.png";
      var swipeIconPath = "https://kersten16.github.io/InfoVis/docs/icons/thumbs-up.png";
      console.log(item);

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
      .force('cramp', d3.forceManyBody().strength(3))
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
  
  function openScatterplot(country, handleDate){
    // $("#radial").addClass("disabledbutton");
    scatterPlotOpen=true;
    
    var selectedCountry = country;
    var h1Tag = document.createElement('H1');
    h1Tag.innerHTML = selectedCountry;
    document.getElementById('scatter').prepend(h1Tag);
    let measureColors={};
    for(i = 1; i<= uniqueListOfMeasures.length; i++){
      measureColors[uniqueListOfMeasures[i-1]]=["rgb(",(245-i*20),",",(30+245%(i*7)),",",(i*(i+3)),")"].join("");
    }
    d3.json("data/allUsers_ByDate.json", d => {
      /*  return {
          date: d[i].date,
          country: d[i].country,
          swipe_passes: d[i].swipe_passes,
          swipe_likes: d[i].swipe_likes,
          messages: d[i].messages,
          appOpens: d[i].appOpens
        }*/
    }).then(data => {

      var filterData = data.filter(data => data.country == country);

      createScatterPlot(filterData, handleDate);
    })

    console.log(country);
    var heightGraph = 400;

    let element_ddCountry = document.getElementById("select-country");
    function changeTitle() {

      let element_title = document.getElementById("titleCountry");

      selectedCountry = element_ddCountry.value;
      element_title.textContent = selectedCountry;

      const element = document.querySelectorAll(".bubble");
      for (var i = 0; i < element.length; i++) {
        d3.select(element[i]).remove();
      }


    }

    function addCountry() {
      let text = document.getElementById("titleCountry");
      text.textContent = selectedCountry;
      const opt1 = document.createElement("option");
      opt1.value = "Dyn Country 3";
      opt1.text = "Dyn Country 3";

      element_ddCountry.add(opt1, null);
    }

  }
  function createScatterPlot(allTestData, handleDate) {
    console.log(handleDate);
    createTimeLine("Scatter",handleDate);

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
      .attr("cx", d => xScale(d.messagesSent + d.messagesReceived))   // set the x position based on the number of messages
      .attr("cy", d => yScale(d.swipePass + d.swipeLike))   // set the y position based on the number of swipes
      .attr("r", d => Math.sqrt(d.appOpens) * 3)  // set the radius based on the article reading time
      .attr("stroke", d => measureColors[datingData.filter(data => data.date==d.date).filter(data=> data.country==d.country)[0]["measure"]])
      .attr("fill", d => measureColors[datingData.filter(data => data.date==d.date).filter(data=> data.country==d.country)[0]["measure"]])
      .attr("fill-opacity", 0.5)
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
      .attr("transform", d => "translate(" + (xScale(d.messagesSent+d.messagesReceived) + 20) + ", " + yScale(d.swipeLike + d.swipePass) + ")")
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
      .attr("fill", d => measureColors[datingData.filter(data => data.date==d.date).filter(data=> data.country==d.country)[0]["measure"]])


    svg.selectAll(".bubble-tip")
      .append("text")
      .classed("bubble-tip-yText", true)
      .text(d => "(" + d.swipeLike + " swipes)")
      .attr("y", d => (20))
      .style("font-family", "sans-serif")
      .style("font-size", 14)
      .attr("stroke", "none")
      .attr("fill", d => measureColors[datingData.filter(data => data.date==d.date).filter(data=> data.country==d.country)[0]["measure"]])

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
          .domain(Object.keys(measureColors))
          .range([0, 600])
          .padding(1) // space them out so the bubble appears in the centre

        svg.select("#xAxis")
          .call(d3.axisBottom(xScale).tickSize(0))
          .selectAll("text")
          // offset the category names to fit them in horizontally
          .attr("transform", (d, i) => `translate(0, ${(i % 2) * 20})`)
          .style("fill", d => measureColors[d])
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
  function updateScatter(){
      //refilter data for dates from slider
      //plot new data
      //Maybe look at how I did this for the radial graph (updateRadial() and plotCirlcles())
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
