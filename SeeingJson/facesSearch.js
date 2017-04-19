// Kairos SDK parameters
var kairos = new Kairos("07085ed9", "898a579671ad835e6888fb3c4805b435");

//Local folder where the Face Detection Json are stored
var folderPath = "KairosJson/";

//Parameters for the display of image and faces bounding box
var lineW = 2;
var strkClMen = '#139C8A';
var strkClWomen = '#ffb6c1';

var nbWithoutImages = 0;

var columnWidth = 12;
var maxWidthHeight = 1068;

function advSearch(){

  var imagesPerColumnID = document.getElementById("imagesPerColumn").value;
  if (imagesPerColumnID == "1"){
    maxWidthHeight = 1068;
    columnWidth = 12;
  }
  else if (imagesPerColumnID == "2") {
    maxWidthHeight = 534;
    columnWidth = 6;
  }
  else if (imagesPerColumnID == "3") {
    maxWidthHeight = 356;
    columnWidth = 4;
  }
  else if (imagesPerColumnID == "4") {
    maxWidthHeight = 267;
    columnWidth = 3;
  }
  else if (imagesPerColumnID == "6") {
    maxWidthHeight = 178;
    columnWidth = 2;
  }
  else if (imagesPerColumnID == "12") {
    maxWidthHeight = 89;
    columnWidth = 1;
  }

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

    var modulo = 12 / columnWidth;

    for (j = 0; j < piecesData.count; j++){
      if (j%modulo == 0){
        piecesDiv.append("row")
                  .classed("row", true)
                  .classed("small-padding", true);
      }
      d3.selectAll("#piecesDiv")
                .each(function(d, i){
                  var lastRow = this.lastChild;
                  d3.select(lastRow).append("div")
                         .classed("col-md-"+columnWidth, true)
                         .attr("id","imageDiv"+j);
                })
    }

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
        var im = imageCol.append("img")
                // kate !!!
                .attr("src", paintingData.artObject.webImage.url)
                .attr("alt", paintingData.artObject.title);

        if (paintingData.artObject.webImage.width > paintingData.artObject.webImage.height){
          im.style("width", maxWidthHeight+"px");
        }
        else{
          im.style("height", maxWidthHeight+"px");
        }

      }
      else{
        console.log(paintingData.artObject.objectNumber+" has no copyright but also no image");
      }
    }
    else{
      imageCol.append("img")
              .attr("src", "Data/Copyright.PNG")
              .attr("alt", paintingData.artObject.title)
              .style("width", maxWidthHeight+"px");
    }

    ptingId = objNumber.toLowerCase();

    //Path for the json Face Detection
    var http = new XMLHttpRequest();
    http.open('HEAD', folderPath+""+ptingID+".json", false);
    http.send();
    //console.log(http.status!=404);

    //If the face detection data hasn't been store on local file yet, make a call to Kairos API
    if (http.status == 404){
          if (paintingData.artObject.hasImage && paintingData.artObject.copyrightHolder == null){
            getKairosJson(paintingData.artObject.webImage.url);
          }
    }

  });
}

//Download the KairosJSON to local file
function downloadText(text, filename){
  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
  a.setAttribute('download', filename);
  a.click()
}

//Function called when the Kairos API has found an answer
function myKairosCallback(response){
  console.log("Kairos Data: ");
  console.log(response);

  //Download the resulting Json
  downloadText( response.responseText, paintingID+".json");

  //Display the face recognition and the image on the screen
  displayKairos(folderPath+""+paintingID+".json");
}

function getKairosJson(imageUrl){
  //console.log("Into Load Kairos!");
  //console.log("Image URL: "+imageUrl);

  //Clean the image URL to fit Kairos API
  var image_data = String(imageUrl);
  image_data = image_data.replace("data:image/jpeg;base64,", "");
  image_data = image_data.replace("data:image/jpg;base64,", "");
  image_data = image_data.replace("data:image/png;base64,", "");
  image_data = image_data.replace("data:image/gif;base64,", "");
  image_data = image_data.replace("data:image/bmp;base64,", "");

  var options = { "selector" : "FULL"};

  //Call to the Kairos API
  kairos.detect(image_data, myKairosCallback, options);

}
