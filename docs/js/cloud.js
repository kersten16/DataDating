
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
  //In theory would call this function each loop of country in main.js
  createCloudChart(data);
})

function createCloudChart(data){
  let newData = data.filter(data => data.date == "2019-02-15").filter(function(d){ return d.activeUsers != 0 });
  console.log(newData[3]);
  // specify svg width and height;
  const width = Math.ceil(5*((newData[3]['swipes']+newData[3]['messages'])/10)), height = Math.ceil(5*((newData[3]['swipes']+newData[3]['messages'])/10));
  const listenTo = Math.min(width, height);
  // create svg and g DOM elements;
  let svg = d3.select('#cloud').append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('width', listenTo)
    .attr('height', listenTo)
    .append('g')
    // move 0,0 to the center
    .attr('transform', `translate(${width >>1}, ${height>>1})`);

  var images = [], numSwipes = Math.floor(newData[3]['swipes']/10), swipeRem=Math.ceil(newData[3]['swipes']%10), numMsg = Math.floor(newData[3]['messages']/10), msgRem=Math.ceil(newData[3]['messages']%10),maxImages = numSwipes+numMsg, padding=3;
  var msgIconPath= "https://kersten16.github.io/InfoVis/docs/icons/message.png";
  var swipeIconPath = "https://kersten16.github.io/InfoVis/docs/icons/thumbs-up.png";
  console.log(numMsg, numSwipes, swipeRem,msgRem);
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
      console.log("should be");
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
  const scaleSize = d3.scaleLinear().domain([1, 10]).range([1, 10]).clamp(true);
  // append the rects
  let vizImages = svg.selectAll('.image-cloud-image')
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
    .force('cramp', d3.forceManyBody().strength(listenTo / 100))
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
      var iterations = 1

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