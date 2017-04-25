//Local folder where the Face Detection Json are stored
var kairosDataPath = "Data/allKairos.json";
var kairosData = null;

var nbWithoutDim = 0;

var xAxisHeight = 30;
var yAxisWidth = 30;

var initSvgWidth = 300;
var initSvgHeight = 240;

var dimTotH = 160;
var dimTotW = 200;

d3.json(kairosDataPath, function(json){
  kairosData = json;
  console.log("Kairos Data: ");
  console.log(kairosData);
});

var paintersData = [];
var cnt = [];
var painters = [//Wikipedia Forerunners
                "Johannes+Warnardus+Bilders",
                "Barend+Cornelis+Koekkoek",
                "Andreas+Schelfhout",
                "Hendrikus+van+de+Sande+Bakhuyzen",
                "Bartholomeus+Johannes+van+Hove",
                //"Hubertus+van+Hove",
                //"Jacob+Jan+van+der+Maaten",
                "Charles+Rochussen",
                //"Pieter+Frederik+van+Os",
                "Antonie+Waldorp",

                //Wikipedia First Generation
                "David+Adolph+Constant+Artz",
                "Gerard+Bilders",
                "Johannes+Bosboom",
                "Johannes+Hubertus+Leonardus+de+Haas",
                "Paul%20Joseph%20Constantin%20Gabriël",
                "Jozef+Israëls",
                "Jacob+Maris",
                "Matthijs+Maris",
                "Willem+Maris",
                "Anton+Mauve",
                "Hendrik+Willem+Mesdag",
                //"Taco+Mesdag",
                //"Sientje+Mesdag-van+Houten",
                "Willem+Roelofs+(I)",
                "Johan+Hendrik+Weissenbruch"

                //Wikipedia Second Generation
                ];

searchHague();

function searchHague(){
    for (var i = 0; i < painters.length; i++){
      d3.select("#piecesDiv")
        .append("svg")
        .attr("id", "dimSVG"+i);
      paintersData.push([]);
      cnt.push(-1);
      advSearch("", "painting", ""+painters[i], "True", "", "", "False", "", "", "", paintersData[i], i);
    }
}

function getDimByType(dimArray,dimType) {
  return dimArray.filter(
      function(element){ return element.type == dimType; }
  );
}

function DisplayPaintingsDimensions(aggregateData, index, progressBar){
  //console.log("Aggregate = "+aggregateData.length+" & Count = "+ cnt[index]);
  if (cnt[index] > 0){
    var ratio = aggregateData.length / cnt[index] * 100;
    progressBar.style("width",ratio + '%');
  }
  while(aggregateData.length != cnt[index]){
    setTimeout(function() {
                  DisplayPaintingsDimensions(aggregateData, index, progressBar);
              },500); // run donothing after 0.5 seconds
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
  console.log("Number of indexes Removed: "+indexesToRemove.length);
  for (var i = 0; i < indexesToRemove.length; i++){
    aggregateData.splice(indexesToRemove[i] - i, 1);
  }

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


  var thisSvg = d3.select("#dimSVG"+index)
                  .attr("width", initSvgWidth)
                  .attr("height", initSvgHeight)
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("id", "svg"+index);

  var thisXaxis = thisSvg.append("g");
  var thisYaxis = thisSvg.append("g");
  var thisDimPlaceholder = thisSvg.append("g");

  var svgW = initSvgWidth;
  var svgH = initSvgHeight;

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

  console.log("Max Height: "+maxHeight);
  console.log("Max Width: "+maxWidth);

  if (dimTotH > dimTotW){
    svgW = ((svgH -  xAxisHeight) * dimTotW / dimTotH) + yAxisWidth;
    thisSvg.attr("width",svgW);
  }
  else{
    var svgH = ((svgW - yAxisWidth) * dimTotH / dimTotW) + xAxisHeight;
    thisSvg.attr("height",svgH);
  }

  var xScale = d3.scaleLinear()
          .domain([0, dimTotW])
          .range([yAxisWidth, svgW]);

  var yScale =d3.scaleLinear()
            .domain([dimTotH, 0])
            .range([0, svgH - xAxisHeight]);

  var xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(10);

  var yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(10);

  posX = svgH - xAxisHeight;
  posY = yAxisWidth;

  var axiX = thisXaxis.attr("transform", "translate(" + 0 + "," + posX+ ")")
                .call(xAxis);
  var axiY = thisYaxis.attr("transform", "translate(" + posY + "," + 0+ ")")
                .call(yAxis);

  var groupes = thisDimPlaceholder.selectAll("g")
      .data(aggregateData)
      .enter()
      .append("g");

  var images = groupes.selectAll("image")
                      .data(function(d){
                        var dat = [];
                        dat.push(d);
                        return dat;
                      })
                      .enter()
                      .append("svg:image")
                        .attr("width", function(d, i){
                          var resWidth =  0;
                          if (d.artObject.dimensions != null){
                            if (getDimByType(d.artObject.dimensions, "height")[0]!=null){
                              var otherWidth = 0;
                              if (d.artObject.webImage != null){
                                otherWidth = parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ) * d.artObject.webImage.width / d.artObject.webImage.height;
                              }
                              resWidth = xScale(otherWidth) - xScale(0);
                            }
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
                          return 0;
                        })
                        .attr("xlink:href", function(d){
                          if (d.artObject.webImage == null){
                            return null;
                          }
                          return d.artObject.webImage.url;
                        });


   var rects = groupes.selectAll("rect")
                       .data(function(d, i){
                         if (i < 250){
                           d.opToUse = 0.004;
                         }
                         else{
                           d.opToUse = 0;
                         }
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
                               var otherWidth = 0;
                               if (d.artObject.webImage != null){
                                 otherWidth = parseInt( getDimByType(d.artObject.dimensions, "height")[0].value ) * d.artObject.webImage.width / d.artObject.webImage.height;
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
                           if (cnt[index] < 250){
                              return 1 / cnt[index];
                           }
                           else{
                             console.log(d.opToUse);
                             return d.opToUse;
                           };
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

    console.log(cnt[index]);
    console.log(1 / cnt[index]);
}

function advSearch(queryID, typeID, invMakerID, imgOnlyID, datingPeriodID, titleID, onDisplayID, sortID, acqID, colorID, aggregateData, index){
  var progressBar = d3.select("#myProgress")
    .append("div")
    .classed("myBar", "true")
    .attr("id", "myBar"+index)
    .style("width", 0 + '%');

  aggregateData = [];

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

  d3.json(piecesUrl, function (json) {
    console.log("Loading Pieces JSON");
    console.log(json);
    piecesData = json;

    /**
    d3.select("#subTitle")
      .html("URL: "+piecesUrl);
   **/

    cnt[index] = piecesData.count;

    /**
    d3.select("#count")
      .html("Count: "+piecesData.count);
    **/

    //Sort through the number of pages
    for ( j = 1; j < Math.floor( (parseInt(piecesData.count) - 1) / nbInOnePage) +2; j++){
      var pageUrl = piecesUrl+"&p="+j;
      SearchPage(pageUrl, j, nbInOnePage, piecesDiv, aggregateData);
    }

  });

  DisplayPaintingsDimensions(aggregateData, index, progressBar);

}

function SearchPage(pageUrl, pageNb, nbInOnePage, piecesDiv, aggregateData){

  d3.json(pageUrl, function (json2) {
    console.log("Going through page "+pageNb);
    var pageData = json2;

    for (var i = 0; i < parseInt(pageData.artObjects.length); i++){
      // creating unique identfier for each painting (image + info)
      var realNb = nbInOnePage * (pageNb-1) + i;

      SearchPainting(pageData.artObjects[i].objectNumber, realNb, aggregateData);
    }
  });
}

function SearchPainting(objNumber, nb, aggregateData){
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
