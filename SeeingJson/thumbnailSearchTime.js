//Local folder where the Face Detection Json are stored
var kairosDataPath = "Data/allKairos.json";
var kairosData = null;

var aggregateData = [];

var maxWidthHeight = 300;

var cnt = -1;

var xAxisHeight = 30;

d3.json(kairosDataPath, function(json){
  kairosData = json;
  console.log("Kairos Data: ");
  console.log(kairosData);
});

var progressBar = document.getElementsByClassName("myBar")[0];

function DisplayAggregateDataImagesDate(){
  console.log("Aggregate = "+aggregateData.length+" & Count = "+ cnt);
  if (cnt > 0){
    var ratio = aggregateData.length / cnt * 100;
    progressBar.style.width = ratio + '%';
  }
  while(aggregateData.length != cnt){
    setTimeout(DisplayAggregateDataImagesDate,500); // run donothing after 0.5 seconds
    return;
  }
  console.log("Aggregating Data:");
  console.log(aggregateData);

  aggregateData.sort(function(a,b){
    return parseInt(a.artObject.dating.yearLate) - parseInt(b.artObject.dating.yearLate);
  });

  var svgBounds = d3.select("#facesSVG").node().getBoundingClientRect();

  var minDate = d3.min(aggregateData, function(d){return parseInt(d.artObject.dating.yearLate) });
  var maxDate = d3.max(aggregateData, function(d){return parseInt(d.artObject.dating.yearLate) });

  console.log(minDate);
  console.log(maxDate);

  var barsHeight = svgBounds.height - xAxisHeight;

  var xScale = d3.scaleBand()
          .domain(aggregateData.map( function(d){
              return parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10;
            })
          )
          .range([0, svgBounds.width - 10]);

  xScale.paddingInner(0.1)
       .paddingOuter(0.05);


  console.log("xScale Domain: ");
  console.log(xScale.domain());

  var xAxis = d3.axisTop()
                .scale(xScale)
                .tickValues(xScale.domain().filter(function(d, i) {
                  if (xScale.domain().length > 20){
                    return !(i % 3);
                  }
                  else{
                    return false;
                  }
                }));

  var axi = d3.select("#xAxis")
                .attr("transform", "translate(" + 0 + "," + xAxisHeight * 0.9 + ")")
                .call(xAxis);
/**
  console.log("xAxis number of Ticks: ");
**/

  var heightOfColumn = {};
  for (var i = 0; i < xScale.domain().length ; i++){
    heightOfColumn[xScale.domain()[i]] = 0;
  }

  console.log("height Of Columns: ");
  console.log(heightOfColumn);

  var images = d3.select("#thumbnails")
      .attr("transform", "translate(" + 0 + "," + xAxisHeight + ")")
      .selectAll("image")
      .data(aggregateData)
      .enter()
      .append("svg:image")
        .attr("width", function(d){
          return xScale.bandwidth();
        })
        .attr("x", function(d){return xScale(parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10);})
        .attr("y", function(d){
          decade = parseInt(d.artObject.dating.yearLate) - parseInt(d.artObject.dating.yearLate)%10;
          console.log(heightOfColumn[decade]);
          test = heightOfColumn[decade]
          if (d.artObject.webImage != null){
            heightOfColumn[decade] = heightOfColumn[decade] + (1.03 * d.artObject.webImage.height * xScale.bandwidth() / d.artObject.webImage.width);
          }
          return test;
        })
        .attr("xlink:href", function(d){
          if (d.artObject.webImage == null){
            return "Data/Copyright.PNG";
          }
          return d.artObject.webImage.url;
        });

  var columnMax = 0;
  for (var key in heightOfColumn){
    if (heightOfColumn[key] > columnMax){
      columnMax = heightOfColumn[key];
    }
  }

  console.log(columnMax);
  d3.select("#facesSVG")
    .attr("height", columnMax + xAxisHeight);
}

function advSearch(){
  progressBar.style.width = 0 + '%';

  d3.select("#thumbnails").selectAll("*").remove();
  aggregateData = [];

  // get value of search input boxes
  var queryID = document.getElementById("queryID").value;
  var typeID = document.getElementById("typeID").value;
  var invMakerID = document.getElementById("invMakerID").value;
  var imgOnlyID = document.getElementById("imgOnlyID").value;
  var datingPeriodID = document.getElementById("datingPeriodID").value;
  var titleID = document.getElementById("titleID").value;
  var onDisplayID = document.getElementById("onDisplayID").value;
  var sortID = document.getElementById("sortID").value;
  var acqID = document.getElementById("acqID").value;
  var colorID = document.getElementById("colorID").value;

  // JSON
  var piecesData;

  // make URL with input text
  var nbInOnePage = 100;
  var piecesUrl = "https://www.rijksmuseum.nl/api/en/collection?key=rgAMNabw&format=json&ps="+nbInOnePage;

  if (queryID != ""){
    piecesUrl += "&q="+queryID;
  }

  if (typeID != ""){
    piecesUrl += "&type="+typeID;
  }

  if (invMakerID != ""){
    piecesUrl += "&involvedMaker="+invMakerID;
  }

  if (imgOnlyID != ""){
    piecesUrl += "&imgonly="+imgOnlyID;
  }

  if (datingPeriodID != ""){
    piecesUrl += "&f.dating.period="+datingPeriodID;
  }

  if (titleID != ""){
    piecesUrl += "&title="+titleID;
  }
  if (onDisplayID != ""){
    piecesUrl += "&ondisplay="+onDisplayID;
  }
  if (sortID != ""){
    piecesUrl += "&s="+sortID;
  }
  if (acqID != ""){
    piecesUrl += "&credits="+acqID;
  }
  if (colorID != ""){
    piecesUrl += "&f.normalized32Colors.hex=%23"+colorID;
  }

  d3.select("#subTitle")
    .html("URL: "+piecesUrl);


  d3.json(piecesUrl, function (json) {
    console.log("Loading Pieces JSON");
    console.log(json);
    piecesData = json;

    d3.select("#subTitle")
      .html("URL: "+piecesUrl);

    cnt = piecesData.count;

    d3.select("#count")
      .html("Count: "+piecesData.count);

    //Sort through the number of pages
    for ( j = 1; j < Math.floor( (parseInt(piecesData.count) - 1) / nbInOnePage) +2; j++){
      var pageUrl = piecesUrl+"&p="+j;
      DisplayPage(pageUrl, j, nbInOnePage, piecesDiv);
    }

  });

  DisplayAggregateDataImagesDate();

}

function DisplayPage(pageUrl, pageNb, nbInOnePage, piecesDiv){

  d3.json(pageUrl, function (json2) {
    console.log("Going through page "+pageNb);
    var pageData = json2;

    for (var i = 0; i < parseInt(pageData.artObjects.length); i++){
      // creating unique identfier for each painting (image + info)
      var realNb = nbInOnePage * (pageNb-1) + i;

      DisplayPaintingThumbnail(pageData.artObjects[i].objectNumber, realNb);
    }
  });
}

function DisplayPaintingThumbnail(objNumber, nb){
  var url = "https://www.rijksmuseum.nl/api/en/collection/"+objNumber+"?key=rgAMNabw&format=json";

  d3.json(url, function (json) {
    var paintingData = json;

    if (!paintingData.artObject.hasImage){
      return;
    }

    var ptingID = objNumber.toLowerCase();

    paintingData["kairos"] = getFacesById(ptingID);
    aggregateData.push(paintingData);
  });
}

function getFacesById(ptingId) {
  return kairosData.paintings.filter(
      function(element){ return element.paintingId == ptingId }
  );
}
