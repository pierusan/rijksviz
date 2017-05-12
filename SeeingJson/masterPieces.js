var mapUrl = "Data/amsterdamPaths/mapAndPaths.svg";
var mapSvg = null;
var numberPaths = 1;
var resizingFactor = 1;
var mapWidth = 1000.;
var mapRatio = 1;
var animationGroup = null;

loadMap();
animatePixels();


function loadMap() {
  //Load Map
  xhr = new XMLHttpRequest();
  xhr.open("GET",mapUrl,false);
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");

  //Embed Map in Webpage
  mapSvg = d3.select(d3.select("#amsterdamMap")
            .node()
            .appendChild(xhr.responseXML.documentElement));

  //Resize the map
  resizingFactor = mapWidth / mapSvg.node().getBoundingClientRect().width;
  mapRatio = mapSvg.node().getBoundingClientRect().width / mapSvg.node().getBoundingClientRect().height;
  resizeMap(resizingFactor);

  //Hide paths
  for (var i = 0; i < numberPaths; i++){
    d3.select("#path"+i)
      .style("stroke-opacity", "0");
  }
}

function resizeMap(scaleFactor){
  mapSvg.attr("width", mapWidth)
        .attr("height", mapWidth / mapRatio);
}

function animatePixels(){
  //Create Animation Group in the Svg
  animationGroup = mapSvg.append("g")
                          .attr("id", "animationGroup");

  //Animate the circles
  for (var i = 0; i < numberPaths; i++){
    animateCircle("#path"+i);
  }
}

function animateCircle(pathId){
  var path = d3.select(pathId),
  startPoint = pathStartPoint(path);

  var marker = animationGroup.append("circle");
  marker.attr("r", 7)
      .attr("transform", "translate(" + startPoint + ")");

  transition(marker, path);
}


//Get path start point for placing marker
function pathStartPoint(path) {
  var d = path.attr("d"),
  dsplitted = d.split("c");
  return dsplitted[1].split(",")[0];
}

function transition(marker, path) {
  marker.transition()
      .duration(30000)
      .attrTween("transform", translateAlong(path.node()))
      .on("end", function(){
        transition(marker, path);
      });// infinite loop
}

function translateAlong(path) {
  var l = path.getTotalLength();
  return function(i) {
    return function(t) {
      var p = path.getPointAtLength(t * l);
      return "translate(" + p.x + "," + p.y + ")";//Move marker
    }
  }
}

function animationEnd(){
  console.log("end");
}
