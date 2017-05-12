queue()
.defer(d3.xml, "path1.svg", "Data/amsterdamPaths")
.await(ready);

function ready(error, xml) {

  console.log(xml)

  //Adding our svg file to HTML document
  //var importedNode = document.importNode(xml.documentElement, true);
  //d3.select("#amsterdamMap").node().appendChild(importedNode);

var svg = d3.select("#amsterdamSVG");

  var path = svg.select("#LineToFollow"),
  startPoint = pathStartPoint(path);

  var marker = svg.append("circle");
  marker.attr("r", 7)
    .attr("transform", "translate(" + startPoint + ")");

  transition();

  //Get path start point for placing marker
  function pathStartPoint(path) {
    console.log(path);
    console.log(path.attr("d"));
    var d = path.attr("d"),
    dsplitted = d.split("c");
    return dsplitted[1].split(",");
  }

  function transition() {
    marker.transition()
        .duration(7500)
        .attrTween("transform", translateAlong(path.node()))
        .each("end", transition);// infinite loop
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

}
