//Local folder where the Face Detection Json are stored
var kairosDataPath = "Data/allKairos.json";
var kairosData = null;

var aggregateData = [];

var nbWithoutDim = 0;

var cnt = -1;

var xAxisHeight = 30;
var yAxisWidth = 30;

d3.json(kairosDataPath, function(json){
  kairosData = json;
  console.log("Kairos Data: ");
  console.log(kairosData);
});

var progressBar = document.getElementById("myBar");

function getDimByType(dimArray,dimType) {
  return dimArray.filter(
      function(element){ return element.type == dimType; }
  );
}

function DisplayPaintingsDimensions(){
  console.log("Aggregate = "+aggregateData.length+" & Count = "+ cnt);
  if (cnt > 0){
    var ratio = aggregateData.length / cnt * 100;
    progressBar.style.width = ratio + '%';
  }
  while(aggregateData.length != cnt){
    setTimeout(DisplayPaintingsDimensions,500); // run donothing after 0.5 seconds
    return;
  }
  console.log("Aggregating Data:");
  console.log(aggregateData);

  var paintingsToRemove = ["SK-C-1706", "SK-A-1115"];
  var indexesToRemove = [];

  for (var i = 0; i < aggregateData.length; i++){
    for (var j = 0; j < paintingsToRemove.length; j++){
      if (aggregateData[i].artObject.objectNumber == paintingsToRemove[j]){
        indexesToRemove.push(i);
      }
    }
  }
  console.log(indexesToRemove.length);
  for (var i = 0; i < indexesToRemove.length; i++){
    aggregateData.splice(indexesToRemove[i] - i, 1);
  }
  console.log(aggregateData);

  aggregateData.sort(function(a,b) {

    var heightA = 0;
    var widthA = 0;
    var heightB = 0;
    var widthB = 0;

    if (getDimByType(a.artObject.dimensions, "height")[0] != null){
      heightA = parseInt( getDimByType(a.artObject.dimensions, "height")[0].value );
    }
    else if (getDimByType(a.artObject.dimensions, "length")[0] != null){
      heightA = parseInt( getDimByType(a.artObject.dimensions, "length")[0].value );
    }
    if (getDimByType(b.artObject.dimensions, "height")[0] != null){
      heightB = parseInt( getDimByType(b.artObject.dimensions, "height")[0].value );
    }
    else if (getDimByType(b.artObject.dimensions, "length")[0] != null){
      heightB = parseInt( getDimByType(b.artObject.dimensions, "length")[0].value );
    }
    if (getDimByType(a.artObject.dimensions, "width")[0] != null){
      widthA = parseInt( getDimByType(a.artObject.dimensions, "width")[0].value );
    }
    if (getDimByType(b.artObject.dimensions, "width")[0] != null){
      widthB = parseInt( getDimByType(b.artObject.dimensions, "width")[0].value );
    }

    return Math.max(
                    heightB,
                    widthB
                  )
           -
           Math.max(
                    heightA,
                    widthA
                   );
  });

  var svgBounds = d3.select("#facesSVG").node().getBoundingClientRect();

/**
  for (var key in aggregateData){
    if (aggregateData[key].artObject.dimensions != null){
      if (getDimByType(aggregateData[key].artObject.dimensions, "height")[0]!=null){
        console.log(aggregateData[key].artObject);
        console.log(parseInt( getDimByType(aggregateData[key].artObject.dimensions, "height")[0].value  ));
      }
      else if (getDimByType(aggregateData[key].artObject.dimensions, "length")[0]!=null){
        console.log(aggregateData[key].artObject);
        console.log(parseInt( getDimByType(aggregateData[key].artObject.dimensions, "length")[0].value  ));
      }
    }
    else{
      console.log("NO DIMENSIONS");
    }
  }

  for (var key in aggregateData){
    if (aggregateData[key].artObject.dimensions != null){
      if (getDimByType(aggregateData[key].artObject.dimensions, "width")[0]!=null){
        console.log(aggregateData[key].artObject);
        console.log(parseInt( getDimByType(aggregateData[key].artObject.dimensions, "width")[0].value  ));
      }
    }
    else{
      console.log("NO DIMENSIONS");
    }
  }
**/

  var maxHeight = d3.max(aggregateData, function(d){
    if (d.artObject.dimensions != null){
      if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
        return parseInt( getDimByType(d.artObject.dimensions, "height")[0].value  );
      }
      else if (getDimByType(d.artObject.dimensions, "length")[0]!=null){
        return parseInt( getDimByType(d.artObject.dimensions, "length")[0].value  );
      }
    }
    return 0;
  });
  var maxWidth = d3.max(aggregateData, function(d){
    if (d.artObject.dimensions != null){
      if (getDimByType(d.artObject.dimensions, "width")[0]!=null){
        return parseInt( getDimByType(d.artObject.dimensions, "width")[0].value  );
      }
    }
    return 0;
  });

  console.log(maxHeight);
  console.log(maxWidth);

  console.log("Previous width: "+svgBounds.width);
  if (maxHeight > maxWidth){
    var newWidth = ((svgBounds.height -  xAxisHeight) * maxWidth / maxHeight) + yAxisWidth;
    d3.select("#facesSVG")
      .attr("width",newWidth);
  }
  else{
    var newHeight = ((svgBounds.width - yAxisWidth) * maxHeight / maxWidth) + xAxisHeight;
    d3.select("#facesSVG")
      .attr("height",newHeight);
  }

  svgBounds = d3.select("#facesSVG").node().getBoundingClientRect();
  //console.log("New width: "+svgBounds.width);

  var xScale = d3.scaleLinear()
          .domain([0, maxWidth])
          .range([yAxisWidth, svgBounds.width]);

  var yScale =d3.scaleLinear()
            .domain([maxHeight, 0])
            .range([0, svgBounds.height - xAxisHeight]);

/**
  console.log("Origin: "+xScale(0)+", "+yScale(0));
   var x82x82 = xScale(82) - xScale(0);
   var y82x82 = yScale(82) - yScale(0);
  //console.log("2x2: "+xScale(2)+", "+yScale(2));
  console.log("82x82: "+x82x82+", "+y82x82);
**/

  var xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(20);

  var yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(20);

  posX = svgBounds.height - xAxisHeight;
  posY = yAxisWidth;

  var axiX = d3.select("#xAxis")
                .attr("transform", "translate(" + 0 + "," + posX+ ")")
                .call(xAxis);
  var axiY = d3.select("#yAxis")
                .attr("transform", "translate(" + posY + "," + 0+ ")")
                .call(yAxis);

  var groupes = d3.select("#paintings")
      .selectAll("g")
      .data(aggregateData)
      .enter()
      .append("g");

  var images = groupes.selectAll("image")
                      .data(function(d){
                        //console.log(d);
                        var dat = [];
                        dat.push(d);
                        return dat;
                      })
                      .enter()
                      .append("svg:image")
                        .attr("width", function(d, i){
                          console.log(d);
                          var resWidth =  0;
                          if (d.artObject.dimensions != null){
                            if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                              if (d.artObject.webImage != null){
                                var otherWidth = parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ) * d.artObject.webImage.width / d.artObject.webImage.height;
                              }
                              resWidth = xScale(otherWidth) - xScale(0);
                            }
                          }
                          if (resWidth > maxWidth * 0.95){
                            //console.log(d);
                            //console.log("WIDTH!");
                          }
                          return resWidth;
                        })
                        .attr("height", function(d, i){
                          var resHeight = 0;
                          if (d.artObject.dimensions != null){
                            if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                              resHeight =  yScale(0) - yScale(parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ));
                            }
                            else if (getDimByType(d.artObject.dimensions, "length")[0]!=null){
                              resHeight = yScale(0) - yScale(parseInt( getDimByType(d.artObject.dimensions, "length")[0].value ));
                            }
                          }
                          else(nbWithoutDim++);
                          if (resHeight > maxHeight * 0.95){
                            //console.log("HEIGHT!");
                            //console.log(d);
                          }
                          if (i==8){
                            console.log(d);
                          }
                          return resHeight;
                        })
                        .attr("x", yAxisWidth)
                        .attr("y", function(d){
                          //console.log(d);
                          if (d.artObject.dimensions != null){
                            if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                              //console.log(svgBounds.height - xAxisHeight - yScale(parseInt( getDimByType(d.artObject.dimensions, "height")[0].value )));
                              return yScale(parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ));
                            }
                            else if (getDimByType(d.artObject.dimensions, "length")[0]!=null){
                              //console.log(svgBounds.height - xAxisHeight - yScale(parseInt( getDimByType(d.artObject.dimensions, "length")[0].value )));
                              return yScale(parseInt( getDimByType(d.artObject.dimensions, "length")[0].value ));
                            }
                          }
                          else(nbWithoutDim++);
                          //console.log(svgBounds.height - xAxisHeight - yScale(0));
                          return yScale(0);
                        })
                        .style("opacity", function(d){
                          return 0;
                        })
                        //.attr("xlink:href", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Cat---Black---Moertel---%28Gentry%29.jpg/1024px-Cat---Black---Moertel---%28Gentry%29.jpg");
                        //.attr("xlink:href", "http://vignette4.wikia.nocookie.net/zigochen/images/1/14/Black-screen_2511_1.jpg/revision/latest?cb=20121106043000");
                        .attr("xlink:href", function(d){
                          if (d.artObject.webImage == null){
                            return "Data/Copyright.PNG";
                          }
                          return d.artObject.webImage.url;
                        });


   var rects = groupes.selectAll("rect")
                       .data(function(d){
                         //console.log(d);
                         var dat = [];
                         dat.push(d);
                         return dat;
                       })
                       .enter()
                       .append("rect")
                         .attr("width", function(d, i){
                           var resWidth =  0;
                           if (d.artObject.dimensions != null){
                             if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                               if (d.artObject.webImage != null){
                                 var otherWidth = parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ) * d.artObject.webImage.width / d.artObject.webImage.height;
                               }
                               resWidth = xScale(otherWidth) - xScale(0);
                             }
                           }
                           d.savedWidth = resWidth;
                           return resWidth;
                         })
                         .attr("height", function(d, i){
                           var resHeight = 0;
                           if (d.artObject.dimensions != null){
                             if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                               resHeight =  yScale(0) - yScale(parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ));
                             }
                             else if (getDimByType(d.artObject.dimensions, "length")[0]!=null){
                               resHeight = yScale(0) - yScale(parseInt( getDimByType(d.artObject.dimensions, "length")[0].value ));
                             }
                           }
                           else(nbWithoutDim++);
                           return resHeight;
                         })
                         .attr("x", yAxisWidth)
                         .attr("y", function(d){
                           if (d.artObject.dimensions != null){
                             if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                               return yScale(parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ));
                             }
                             else if (getDimByType(d.artObject.dimensions, "length")[0]!=null){
                               return yScale(parseInt( getDimByType(d.artObject.dimensions, "length")[0].value ));
                             }
                           }
                           else(nbWithoutDim++);
                           return yScale(0);
                         })
                         .style("opacity", function(d){
                           return 1 / cnt;
                         })
                         .style("fill", "black");


    groupes.on("mouseover", function() { d3.select(this)
                                           .select("rect")
                                           .style("width", "0");
                                        d3.select(this)
                                            .select("image")
                                            .style("opacity", 1);
                                        })
            .on("mouseout", function() { d3.select(this)
                                             .select("rect")
                                             .style("width", function(d){
                                                d.savedWidth;
                                        });
                                         d3.select(this)
                                             .select("image")
                                             .style("opacity", 0);
                          });



}

function advSearch(){
  progressBar.style.width = 0 + '%';

  d3.select("#paintings").selectAll("*").remove();
  d3.select("#xAxis").selectAll("*").remove();
  d3.select("#yAxis").selectAll("*").remove();
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
      SearchPage(pageUrl, j, nbInOnePage, piecesDiv);
    }

  });

  DisplayPaintingsDimensions();

}

function SearchPage(pageUrl, pageNb, nbInOnePage, piecesDiv){

  d3.json(pageUrl, function (json2) {
    console.log("Going through page "+pageNb);
    var pageData = json2;

    for (var i = 0; i < parseInt(pageData.artObjects.length); i++){
      // creating unique identfier for each painting (image + info)
      var realNb = nbInOnePage * (pageNb-1) + i;

      SearchPainting(pageData.artObjects[i].objectNumber, realNb);
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
