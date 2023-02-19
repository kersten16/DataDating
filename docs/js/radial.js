// Set the time format
//const parseTime = d3.timeParse("%Y");
//d3.select("#scatter").style("display","none");
let SAVED_DATE=new Date(window.location.href.split("/?date=")[1]);
console.log(SAVED_DATE)
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
d3.json("data/allUsers_ByDate.json", d => {
}).then(userData => {
  userData = userData.sort((a, b) => d3.ascending(a.date, b.date));
 
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
      //a.appOpens/(Math.max(a.activeUsers,1)),b.appOpens/(Math.max(b.activeUsers,1))));
    createVisual(datingData, userData);
    //createTimeLine(data);
  });

});
  /***********************************CREATE TIMELINE **************************************/
  function createVisual(datingData, userData){
    function createTimeLine(){
      var timeLineLabel;
      var startDate = new Date(datingData[0].date),
      endDate = new Date(datingData[datingData.length-1].date);
      const totalDays=(endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
      if(SAVED_DATE=="Invalid Date"){SAVED_DATE=startDate;}

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
        .attr("fill", "lightgrey")
        .text(function (d) { return formatDateIntoMonth(d); });

      var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("cx", timeX(SAVED_DATE))
        .attr("r", 9);

      timeLineLabel = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(formatDate(SAVED_DATE))
        .attr("fill", "lightgrey")
        .attr("transform", "translate(0," + (-15) + ")")
        .attr("x", timeX(SAVED_DATE))

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
          updateRadial();
        
      }

      return(timeLineLabel);
    }
      
  /***************************************CREATE RADIAL GRAPH*********************************************/
  const covidColours=['#e31010','#ff5f03','#f5a105','#f2ed85','lightgrey']
  const userColors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];

  
  //Create scatterplot Variables 
  var counterClick = 0;
  var counterColors = 0;
  var user_counter = 0;
  var counter_country_swipeLike = 0;
  var counter_country_swipePass = 0;
  var counter_country_messagesSent = 0;
  var counter_country_messagesReceived = 0;
  var counter_country_appOpens = 0;
  //var selection_date = "Kein";
  var isClickedOnTimeline = false;
  var timeLineLabel2;
  let mappingColorUser = {};
  var xScale;
  var yScale;

  function createLegend(svg){
    var msgIconPath= "https://kersten16.github.io/InfoVis/docs/icons/message.png";
    var swipeIconPath = "https://kersten16.github.io/InfoVis/docs/icons/thumbs-up.png";

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
      .attr("height", 250)
      .style("fill", "#1c2045")
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
          .style("stroke", function(d){ return covidColours[keys.indexOf(d)];})
          .style("stroke-width", 3)
          .style("fill-opacity",0);

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

      svg.append('svg:image')
        .attr("x", 978)
        .attr("y", -8)
        .attr('height', 25)
        .attr('width', 25)
        .attr('href', swipeIconPath);

        svg.append('svg:image')
        .attr("x", 978)
        .attr("y", 20)
        .attr('height', 25)
        .attr('width', 25)
        .attr('href',  msgIconPath);

        svg.append("text")
        .attr("x", 1010)
        .attr("y", 5) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("fill", "white")
        .style('font-size', '20px')
        .text("10 swipes")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
        svg.append("text")
        .attr("x", 1010)
        .attr("y", 30) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("fill", "white")
        .style('font-size', '20px')
        .text("10 messages")
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
    let check = rotated(i);
    let middleVal=[Math.floor(uniqueListOfCountries.length / 2),Math.floor(uniqueListOfCountries.length / 2)-1,Math.ceil(uniqueListOfCountries.length / 2),Math.ceil(uniqueListOfCountries.length / 2)+1]
      if(check == 0 | middleVal.includes(check)){
          return 'middle';
      }
      else if(check < uniqueListOfCountries.length / 2){
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
    var timeLineLabel =createTimeLine();
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
          .style('fill', 'lightgrey')
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
              .style('fill', 'darkgrey')
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
          .style('fill',function(){
            if(i==0){ return "lightgrey";}
            return "white";
          })
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
    updateRadial();
    //plotDataCircles(filteredDatingData);
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
          if(d.date==currentDate) return '#0aad7d';
          else return 'darkgrey';
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
          if(d.date==currentDate) return '#0aad7d';
          else return 'darkgrey';
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
       /* if(scatterPlotOpen){
          d3.select("#scatter").style("display","none");
          d3.select("#scatter").select("#timeLineScatter").selectAll("*").remove();
          d3.select("#scatter").select("#yAxis").remove();
          d3.select("#scatter").select("#xAxis").remove();
          scatterPlotOpen=false;
          return;
        }else{
          scatterPlotOpen=true;
        
          
          //  openScatterplot(d3.select(this).select('title').text().split(':')[0],new Date(currentDate));
        }*/
        window.location.href = window.location.href.split("/docs")[0]+"/ScatterPlot/index.html?country="+d3.select(this).select('title').text().split(':')[0]+"&date="+currentDate;
         
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
          if(scatterPlotOpen){return;}
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
      var coord = get_xy(max+shift*2.5, uniqueListOfCountries.indexOf(item['country']), radius, max);
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
      const scaleSize = d3.scaleLinear().domain([2,6]).range([2,6]).clamp(true);
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
  
  function openScatterplot(selectedCountry, selectedDate){
      // $("#radial").addClass("disabledbutton");
      d3.select("#scatter").style("display","block");
      var h1Tag = document.getElementById('plotTitle');
      h1Tag.innerHTML = selectedCountry;
      //document.getElementById('scatter').prepend(h1Tag);
      let measureColors={};
      for(i = 1; i<= uniqueListOfMeasures.length; i++){
        measureColors[uniqueListOfMeasures[i-1]]=["rgb(",(245-i*20),",",(30+245%(i*7)),",",(i*(i+3)),")"].join("");
      }
    //Define Graph setting
    var heightGraph = 700;

    var filterData = userData.filter(data => data.country == selectedCountry);

    let xVar = document.getElementById("select-x-var").value;
    let yVar = document.getElementById("select-y-var").value;
    timeLineLabel2 =createTimeLine("Scatter", selectedDate);

    xScale = d3.scaleLinear()
    .domain([0, d3.max(filterData, d => d[xVar])])   // my x-variable has a max of 2500
    .range([0, 1700]);   // my x-axis is 600px wide

    yScale = d3.scaleLinear()
    .domain([0, d3.max(filterData, d => d[yVar])])   // my y-variable has a max of 1200
    .range([heightGraph, 0]);   // my y-axis is 400px high
  // (the max and min are reversed because the 
  // SVG y-value is measured from the top)

    createScatterPlot(datingData, filterData, selectedDate);
    

  /**
   * Function to Filter the data from the json file by Country (and date)
   * @param {*} data_array 
   * @param {*} givenCountry 
   * @param {*} givenDate 
   * @returns 
   */
  // function filterData_ByCountry(data_array, givenCountry) {
  //   var filtered_data = [{}];
  //   var counter_newDataArray = 0;
  //   for (i = 0; i < data_array.length; i++) {
  //     //Create a new Array with only the data from that country
  //     if (data_array[i].country == givenCountry) {
  //       //   if(data_array[i].swipePass==3279)console.log("Yes erkannt")
  //       //  if (data_array[i].messagesSent > 1) {
  //       //   if (data_array[i].appOpens > 1) {
  //       // if (data_array[i].date == givenDate) {
  //       filtered_data[counter_newDataArray] = data_array[i];
  //       counter_newDataArray++;
  //       //   }
  //       //  }
  //       //   }
  //     }
  //   }
  //   //  console.log(filtered_data);
  //   return filtered_data;
  // }



  function createScatterPlot(datingData, filteredData, selectedDate) {
    //Create SVG
    let svg = d3.select("#plotSVG")
    .style("overflow", "visible") // some tooltips stray outside the SVG border
    .append("g")
    .attr("transform", "translate(50,50)");
  
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
        .tickSizeOuter(0))
    //console.log(filteredData.filter(data=> data.date<= selectedDate), selectedDate, filteredData[0]["date"]);
    plotScatterCircles(datingData, filteredData.filter(d=> new Date(d.date)<= selectedDate), selectedDate);


    document.getElementById("select-x-var").addEventListener("change", (e) => {

      // update the x-variable based on the user selection
      xVar = e.target.value


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


      // transition each circle element
      svg.selectAll(".bubble")
        .transition()
        .duration(1000)
        .attr("cx", (d) => xScale(d[xVar]))

      // transition each tooltip
      svg.selectAll(".bubble-tip")
        .transition()
        .duration(1000)
        .attr("transform", d => "translate(" + 700 + ", " + 200 + ")")
      // .attr("transform", d => "translate(" + (xScale(d[xVar]) + 20) + ", " + yScale(d[yVar]) + ")")
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
        .attr("transform", d => "translate(" + 700 + ", " + 200 + ")")
      //  .attr("transform", d => "translate(" + (xScale(d[xVar]) + 20) + ", " + yScale(d[yVar]) + ")")



    })
    calculateStats_ByCountry(filteredData.filter(d=> new Date(d.date)<= selectedDate));
    editCountryStats(selectedDate);
  }

  }
  function colorBubblesGrey() {
    //svg.selectAll(".bubble").attr("fill", d => "#e6e6e6")//grey
    svg.selectAll(".bubble").attr("fill-opacity", 0.4)
  }
/**
   * Calculate the stats for country
   * @param {*} data_array 
   * @param {*} givenCountry 
   * @param {*} givenDate 
   */
function calculateStats_ByCountry(data_array) {
  var listOfUsers = data_array.map(d => d.userID);
  uniqueUsers = [...new Set(listOfUsers).values()];
  user_counter=uniqueUsers.length;
  counter_country_swipeLike = 0
  counter_country_swipePass = 0
  counter_country_messagesSent = 0
  counter_country_messagesReceived = 0
  counter_country_appOpens = 0;

  for (i = 0; i < data_array.length; i++) {
      counter_country_swipeLike = counter_country_swipeLike + data_array[i].swipeLike;
      counter_country_swipePass = counter_country_swipePass + data_array[i].swipePass;
      counter_country_messagesSent = counter_country_messagesSent + data_array[i].messagesSent;
      counter_country_messagesReceived = counter_country_messagesReceived + data_array[i].messagesReceived;
      counter_country_appOpens = counter_country_appOpens + data_array[i].appOpens;

  }
}
  

/**
 * Add the stats of the selected country to the screen. 
 * @param {*} numberSwipes 
 * @param {*} numberconversationCount 
 */
function editCountryStats(selectedDate) {
  document.getElementById("statsCountryTitle").innerHTML = "Total for Country: "+user_counter+" users";
  if (selectedDate != "Kein") document.getElementById("stats-subtitle").innerHTML = "2017-01-01 to " + formatDateForData(selectedDate);
  document.getElementById("swipeLike").innerHTML = "Likes: " + counter_country_swipeLike;
  document.getElementById("swipePass").innerHTML = "Passes: " + counter_country_swipePass;
  document.getElementById("messagesSent").innerHTML = "Messages Sent: " + counter_country_messagesSent;
  document.getElementById("messagesReceived").innerHTML = "Messages Received: " + counter_country_messagesReceived;
  document.getElementById("appOpens").innerHTML = "App Opens: " + counter_country_appOpens;


}

  function plotScatterCircles(datingData, filteredData, selectedDate) {
    var heightGraph = 700;
    xVar = document.getElementById("select-x-var").value;
    yVar = document.getElementById("select-y-var").value;
    console.log(xVar, yVar)
    let svg = d3.select("#plotSVG")
      .style("overflow", "visible") // some tooltips stray outside the SVG border
      .append("g")
      .attr("transform", "translate(50,50)")

  svg.selectAll(".bubble")
    .enter()
    .data(filteredData)    // bind each element of the data array to one SVG circle
    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d[xVar]))   // set the x position based on the number of conversationCount
    .attr("cy", d => yScale(d[yVar]))   // set the y position based on the number of swipes
    .attr("r", d => Math.sqrt(d.appOpens))  // set the radius based on the article reading time
    .attr("fill", d => {
      if (!mappingColorUser.hasOwnProperty(d.userID)) {
        mappingColorUser[d.userID] = userColors[counterColors++]
      }
      return mappingColorUser[d.userID];
    }
    )
    .attr("fill-opacity", d => {
      if (d.date == selectedDate) {
        return 1;
      } else {
        return 0.4;
      }
    })
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
    .attr("transform", d => "translate(" + 700 + ", " + 200 + ")")
    .style("display", "none")
    .append("rect")     // this is the background to the tooltip
    .attr("x", -5)
    .attr("y", -20)
    .attr("rx", 5)
    .attr("fill", "white")
    .attr("fill-opacity", 0.9)
    .attr("width", 180)
    .attr("height", 100)

  svg.selectAll(".bubble-tip")
    .append("text")
    .text(d => "user: " + d.userID)
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => mappingColorUser[d.userID])





  }

  function updateScatter() {
    colorBubblesGrey();
    selectedDate = formatDateForData(new Date(timeLineLabel2.text()));
    // filteredDatingData = datingData.filter(data => data.date <= date);
    filteredUserData = userData.filter(data => data.date <= selectedDate);
    d3.selectAll('.bubble').remove();
    plotScatterCircles(datingData, filteredUserData);
    if (!isClickedOnTimeline) {
      mappingColorUser = {}
      counterColors = 0;
      isClickedOnTimeline = true;
    }
    calculateStats_ByCountry(filteredUserData);
    editCountryStats(new Date(timeLineLabel2.text()));
  }
}

  
