var nbWithoutImages = 0;
var thumbnailWidth = 89;

function advSearch(){

  d3.select("#piecesDiv").selectAll("*").remove();

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

/**
  console.log(queryID);
  console.log(queryID == "");
  console.log(typeID);
  console.log(typeID == "");
  console.log(invMakerID);
  console.log(invMakerID == "");
**/

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

    d3.select("#count")
      .html("Count: "+piecesData.count);

    var piecesDiv = d3.select("#piecesDiv");

    console.log("Before FOR loop");
    for (j = 0; j < piecesData.count; j++){
      if (j%12 == 0){
        console.log("Adding a Row");
        piecesDiv.append("row")
                  .classed("row", true)
                  .classed("small-padding", true);
      }
      d3.selectAll("#piecesDiv")
                .each(function(d, i){
                  console.log("in the ")
                  var lastRow = this.lastChild;
                  d3.select(lastRow).append("div")
                         .classed("col-md-1", true)
                         .attr("id","imageDiv"+j);
                })
    }
    console.log("After FOR loop");

    //Sort through the number of pages
    for ( j = 1; j < Math.floor( (parseInt(piecesData.count) - 1) / nbInOnePage) +2; j++){
      var pageUrl = piecesUrl+"&p="+j;
      DisplayPage(pageUrl, j, nbInOnePage, piecesDiv);
    }

  });

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
    paintingData = json;

    if (!paintingData.artObject.hasImage){
      return;
    }
    var imageCol = d3.select("#imageDiv"+nb);

    if (paintingData.artObject.hasImage && paintingData.artObject.copyrightHolder == null){
      if (paintingData.artObject.webImage != null){
        //add image
        imageCol.append("img")
                // kate !!!
                .attr("src", paintingData.artObject.webImage.url)
                .attr("alt", paintingData.artObject.title)
                .style("width", thumbnailWidth+"px");

        /**
        //add image data
        imageCol.append("div")
                  .append("p")
                  .style("overflow-wrap", "break-word")
                  .html(
                    "<b>Resolution: "+ paintingData.artObject.webImage.width+" x "+paintingData.artObject.webImage.height+"</b>"+
                    " Offset%X: "+ paintingData.artObject.webImage.offsetPercentageX+", Offset%Y: "+ paintingData.artObject.webImage.offsetPercentageY);
        **/
      }
      else{
        console.log(paintingData.artObject.objectNumber+" has no copyright but also no image");
      }
    }
    else{
      imageCol.append("img")
              .attr("src", "Data/Copyright.PNG")
              .attr("alt", paintingData.artObject.title)
              .style("width", thumbnailWidth+"px");
    }


  });
}
