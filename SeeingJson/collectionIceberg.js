/**
//Load the Face Detection Data
var kairosDataPath = "Data/allKairos2.json";
var kairosData = null;
d3.json(kairosDataPath, function(json){
  kairosData = json;
  console.log("Kairos Data: ");
  console.log(kairosData);
});
**/

//Load the On Display Data
var collectionDataPath = "Data/collection.json";
var collectionData = null;
var nbWithoutDisplay = 0;
d3.json(collectionDataPath, function(json){
  collectionData = json;
  console.log("On Display Data: ");
  console.log(collectionData);
});


// URL for the API Search
var searchUrl = "https://www.rijksmuseum.nl/api/en/collection?key=rgAMNabw&format=json&ps=100&type=painting&imgonly=True&ondisplay=False";
//var searchUrl = "https://www.rijksmuseum.nl/api/en/collection?key=rgAMNabw&format=json&ps=100&type=painting&imgonly=True&ondisplay=False&title=Portrait&credits=Loan";
// Number of elements in the collection
var cnt = 4299;
//Progress Bar html element
var progressBar = document.getElementsByClassName("myBar")[0];

//Placeholder for the Collection Data
var collectionData = [];

//Parameters for the thumbnails
var maxWidthHeight = 300;

var xAxisHeight = 30;
var circleAxisRadius = 1;
var offsetLeft = 60;
var offsetRight = 30;
var paddingInner = 0.1;
var paddingOuter = 0.005;
var offsetInColumn = 1.03;

//Search the whole collection and display the iceberg at the end
//advSearch(searchUrl);

DisplayIceberg();

function DisplayIceberg(){
  d3.select("#icebergBack").style("color", "black");
  if (collectionData.collection == null){
    setTimeout(DisplayIceberg,500);
    return;
  }
  console.log("Aggregate = "+collectionData.collection.length+" & Count = "+ cnt);
  if (cnt > 0){
    var ratio = collectionData.collection.length / cnt * 100;
    progressBar.style.width = ratio + '%';
  }
  while(collectionData.collection.length != cnt){
    setTimeout(DisplayIceberg,500); // run donothing after 0.5 seconds
    return;
  }

  //Print the data of the whole collection
  console.log("Collection Data:");
  console.log(collectionData);

  //Sort the data by time
  collectionData.collection.sort(function(a,b){
    return parseInt(a.artObject.dating.yearLate) - parseInt(b.artObject.dating.yearLate);
  });

  //Bounds of the Svg specified in the HTML
  var svgBounds = d3.select("#icebergSVG").node().getBoundingClientRect();

  //var minDecade = d3.min(collectionData.collection, function(d){return parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10; });
  //var maxDecade = d3.max(collectionData.collection, function(d){return parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10; });

  var minHalfDecade = d3.min(collectionData.collection, function(d){return halfD(d); });
  var maxHalfDecade = d3.max(collectionData.collection, function(d){return halfD(d); });

  console.log(minHalfDecade);
  console.log(maxHalfDecade);

  minHalfDecade = 1584;
  maxHalfDecade = 1960;

  var dom = [];
  for (var i = minHalfDecade; i <= maxHalfDecade; i+=2){
    dom.push(i);
  }

  console.log(minHalfDecade);
  console.log(maxHalfDecade);

  var barsHeight = svgBounds.height - xAxisHeight;

  var xScale = d3.scaleBand()
          .domain(dom)
          .range([offsetLeft, svgBounds.width - offsetRight]);



  xScale.paddingInner(paddingInner)
      .paddingOuter(paddingOuter);


  console.log("xScale Domain: ");
  console.log(xScale.domain());

  var xAxis = d3.axisTop()
                .scale(xScale)
                .tickFormat(function(d) {
                  var dec = Math.floor(d / 10);
                  if (dec%5 == 0 && d%10 < 2){
                    return dec * 10;
                  }
                  else{
                    return "";
                  }
                }
              );

  var axi = d3.select("#xAxis")
                .call(customXAxis);

  function customXAxis(g) {
    var s = g.selection ? g.selection() : g;
    g.call(xAxis);
    s.select(".domain").remove();
    s.selectAll(".tick")
      .each(function(){
        //console.log(d3.select(this).select("text").text());
        if (d3.select(this).select("text").text() != ""){
          d3.select(this).select("line").remove();
        }
        else {
          d3.select(this).select("text").attr('fill', 'white');
          var cx = d3.select(this).select("line").attr("x1");
          var cy = parseInt(d3.select(this).select("line").attr("y2")) / 2;
          d3.select(this).select("line").remove();
          /**
          d3.select(this)
              .append("circle")
              .attr("cx", cx)
              .attr("cy", cy)
              .attr("r", circleAxisRadius)
              .style("fill", "black");
          **/
        }
      });
    s.selectAll(".tick text").attr("dy", +10);
    //if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
  }

/**
  console.log("xAxis number of Ticks: ");
**/

  var heightOfColumnTop = {};
  for (var i = 0; i < xScale.domain().length ; i++){
    heightOfColumnTop[xScale.domain()[i]] = 0;
  }

  var heightOfColumnBottom = {};
  for (var i = 0; i < xScale.domain().length ; i++){
    heightOfColumnBottom[xScale.domain()[i]] = 0;
  }

  console.log(heightOfColumnTop);

  var imagesTop = d3.select("#icebergTop")
      .selectAll("image")
      .data(collectionData.collection.filter(function(d){
        return d.onDisplay == "True" && parseInt(d.artObject.dating.yearLate) > minHalfDecade && parseInt(d.artObject.dating.yearLate) < maxHalfDecade;
      }))
      .enter()
      .append("svg:image")
        .attr("width", function(d){
          return xScale.bandwidth();
        })
        .attr("x", function(d){return xScale(halfD(d));})
        .attr("y", function(d){
          halfDecade = halfD(d);
          //console.log(halfDecade);
          var test = heightOfColumnTop[halfDecade];
          //console.log(test);
          if (d.artObject.webImage != null){
            heightOfColumnTop[halfDecade] = heightOfColumnTop[halfDecade] + (offsetInColumn * d.artObject.webImage.height * xScale.bandwidth() / d.artObject.webImage.width);
          }
          return test;
        })
        .attr("xlink:href", function(d){
          if (d.artObject.webImage == null){
            return null;
            //return "Data/Copyright.PNG";
          }
          return d.artObject.webImage.url;
        });

  var imagesBottom = d3.select("#icebergBottom")
    .selectAll("image")
    .data(collectionData.collection.filter(function(d){
      return d.onDisplay == "False" && d.artObject.dating.yearLate > minHalfDecade && d.artObject.dating.yearLate < maxHalfDecade;
    }))
    .enter()
    .append("svg:image")
      .attr("width", function(d){
        return xScale.bandwidth();
      })
      .attr("x", function(d){return xScale(halfD(d));})
      .attr("y", function(d){
        halfDecade = halfD(d);
        test = heightOfColumnBottom[halfDecade]
        if (d.artObject.webImage != null){
          heightOfColumnBottom[halfDecade] = heightOfColumnBottom[halfDecade] + (offsetInColumn * d.artObject.webImage.height * xScale.bandwidth() / d.artObject.webImage.width);
        }
        return test;
      })
      .attr("xlink:href", function(d){
        if (d.artObject.webImage == null){
          return null;
          //return "Data/Copyright.PNG";
        }
        return d.artObject.webImage.url;
      });


    var columnMaxTop = 0;
    for (var key in heightOfColumnTop){
      if (heightOfColumnTop[key] > columnMaxTop){
        columnMaxTop = heightOfColumnTop[key];
      }
    }

    var columnMaxBottom = 0;
    for (var key in heightOfColumnBottom){
      if (heightOfColumnBottom[key] > columnMaxBottom){
        columnMaxBottom = heightOfColumnBottom[key];
      }
    }

var tmp = columnMaxTop + 30;

  d3.select("#icebergTop")
    .attr("transform", "translate(" + 0 + "," + columnMaxTop + ") scale(1,-1)");

  var offset = columnMaxTop + xAxisHeight * 0.9;
  d3.select("#xAxis")
    .attr("transform", "translate(" + 0 + "," + offset + ")");

  offset = columnMaxTop + xAxisHeight * 1.5;
  d3.select("#icebergBottom")
    .attr("transform", "translate(" + 0 + "," + offset + ")");

  //console.log(columnMaxTop);
  d3.select("#icebergSVG")
    .attr("height", columnMaxTop + xAxisHeight + columnMaxBottom+30);
}

function advSearch(piecesUrl){
  //Reset parameters
  progressBar.style.width = 0 + '%';
  d3.select("#xAxis").selectAll("*").remove();
  d3.select("#icebergTop").selectAll("*").remove();
  d3.select("#icebergBottom").selectAll("*").remove();
  collectionData = [];

  var nbInOnePage = 100;

  d3.json(piecesUrl, function (json) {
    cnt = json.count;
    console.log("Number of elements found: "+json.count);
    //Go through the number of pages
    for ( j = 1; j < Math.floor( (parseInt(json.count) - 1) / nbInOnePage) +2; j++){
      var pageUrl = searchUrl+"&p="+j;
      SearchPage(pageUrl, j, nbInOnePage);
    }

  });

  DisplayIceberg();

}

function SearchPage(pageUrl, pageNb, nbInOnePage){
  d3.json(pageUrl, function (json2) {
    console.log("Going through page "+pageNb);
    for (var i = 0; i < parseInt(json2.artObjects.length); i++){
      SearchPainting(json2.artObjects[i].objectNumber);
    }
  });
}

function SearchPainting(objNumber, nb){
  var url = "https://www.rijksmuseum.nl/api/en/collection/"+objNumber+"?key=rgAMNabw&format=json";

  d3.json(url, function (json) {
    var paintingData = json;

    if (!paintingData.artObject.hasImage){
      return;
    }

    paintingData["onDisplay"] = getOnDisplayById(objNumber.toLowerCase());
    if (paintingData["onDisplay"].length == 0){
      console.log("Pas de onDisplay Data pour: "+ objNumber.toLowerCase());
      nbWithoutDisplay++;
    }
    collectionData.push(paintingData);
  });
}

function getOnDisplayById(ptingId) {
  return collectionData.collection.filter(
      function(element){ return element.paintingId == ptingId }
  );
}


function halfD(d){
  lastDigit = 0;
  if (parseInt(d.artObject.dating.yearLate)%10 >= 2 && (d.artObject.dating.yearLate)%10 < 4){
    lastDigit = 2;
  }
  else if (parseInt(d.artObject.dating.yearLate)%10 >= 4 && (d.artObject.dating.yearLate)%10 < 6){
    lastDigit = 4;
  }
  else if (parseInt(d.artObject.dating.yearLate)%10 >= 6 && (d.artObject.dating.yearLate)%10 < 8){
    lastDigit = 6;
  }
  else if (parseInt(d.artObject.dating.yearLate)%10 >= 8){
    lastDigit = 8;
  }
  return parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10 + lastDigit;
}

/**
function halfD(d){
  lastDigit = 0;
  if (parseInt(d.artObject.dating.yearLate)%10 >= 3 && (d.artObject.dating.yearLate)%10 < 6){
    lastDigit = 2;
  }
  else if (parseInt(d.artObject.dating.yearLate)%10 >= 6 && (d.artObject.dating.yearLate)%10 < 9){
    lastDigit = 4;
  }
  else if (parseInt(d.artObject.dating.yearLate)%10 >= 9){
    lastDigit = 8;
  }
  return parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10 + lastDigit;
}
**/

function downloadSvg(){
  var svgData = $("#icebergSVG")[0].outerHTML;
  var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = "newesttree.svg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
