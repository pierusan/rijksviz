// Kairos SDK parameters
var kairos = new Kairos("07085ed9", "898a579671ad835e6888fb3c4805b435");

//Local folder where the Face Detection Json are stored
var folderPath = "KairosJson2/";

//Associate fileName with painting IDs
var fileToIdDict = {};
var filesWithCopyright = [];

//JSON which will be created if no face has been recognized
var errorJson = '{"Errors":[{"Message":"no faces found in the image","ErrCode":5002}]}';

//Parameters for the display of image and faces bounding box
var resizingFactor = 3;
var lineW = 2;
var strkClMen = '#139C8A';
var strkClWomen = '#ffb6c1';

var nbWithoutImages = 0;

var columnWidth = 12;
var maxWidthHeight = 1068;

var countK = 0;
var countD = 0;
var countE = 0;
var countG = 0;

//Called to create Json files for the paintings without faces
function fillEmptyFaces(){
  //console.log("Fill Empty Faces!");
  for (var key in fileToIdDict) {
    //console.log("key");
    //console.log(fileToIdDict[key]);

    var http = new XMLHttpRequest();
    http.open('HEAD', folderPath+""+fileToIdDict[key]+".json", false);
    http.send();

    if (http.status == 404){
      //console.log(fileToIdDict[key]);
      countE++;
      downloadText( errorJson, fileToIdDict[key]+".json");
    }
  }

  for (i = 0; i < filesWithCopyright.length; i++){
    countE++;
    downloadText( errorJson, filesWithCopyright[i]+".json");
  }

  console.log("Empty: "+countE);
}

function advSearch(){
  countK = 0;
  countD = 0;
  countE = 0;
  countG = 0;
  fileToIdDict = {};
  filesWithCopyright = [];

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
    lineW = 1;
  }
  else if (imagesPerColumnID == "12") {
    maxWidthHeight = 89;
    columnWidth = 1;
    lineW = 1;
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

    countG = piecesData.count;

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

    var paintingImURL = "Data/Copyright.PNG";
    var w = 415;
    var h = 414;

    if (paintingData.artObject.hasImage && paintingData.artObject.copyrightHolder == null){
      if (paintingData.artObject.webImage != null){

        /**
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
        **/

        paintingImURL = paintingData.artObject.webImage.url;
        w = paintingData.artObject.webImage.width;
        h = paintingData.artObject.webImage.height;

      }
      else{
        console.log(paintingData.artObject.objectNumber+" has no copyright but also no image");
        return;
      }
    }
    else{
      /**
      imageCol.append("img")
              .attr("src", "Data/Copyright.PNG")
              .attr("alt", paintingData.artObject.title)
              .style("width", maxWidthHeight+"px");
      **/


    }

    var ptingID = objNumber.toLowerCase();

    //Path for the json Face Detection
    var http = new XMLHttpRequest();
    http.open('HEAD', folderPath+""+ptingID+".json", false);
    http.send();
    //console.log(http.status!=404);

    //If the face detection data hasn't been store on local file yet, make a call to Kairos API
    if (http.status == 404){
          if (paintingData.artObject.hasImage && paintingData.artObject.copyrightHolder == null){
            console.log("Pushing the key: "+paintingData.artObject.webImage.url.split(".com/")[1]);
            console.log("Pushing the paintingID: "+ptingID);

            //Store the Kairos query in our array
            fileToIdDict[paintingData.artObject.webImage.url.split(".com/")[1]] = ptingID;

            getKairosJson(paintingData.artObject.webImage.url);
          }
          else{
            filesWithCopyright.push(ptingID);
          }
    }
    else{
      //TODO: Handle the display here
      countD++;
      console.log("displayed: "+countD+"  out of: "+countG);
      displayKairos(folderPath+""+ptingID+".json", imageCol, paintingImURL, w, h);
      //console.log("done displaying");
    }

  });
}

//Display Faces Bounding Boxes from the stored JSON file
function displayKairos(jsonURL, imageCol, paintingImageURL, w, h){
  //console.log("Displaying Face detection from file: "+jsonURL);
  d3.json(jsonURL,function (error, kairJson) {
    if (error) throw error;
    //console.log(kairJson);

    var canv = imageCol.append("canvas")
                           .attr("width", maxWidthHeight)
                           .attr("height", maxWidthHeight)
                           .attr("id", paintingImageURL);

    var context = canv.node().getContext('2d');
    var imageObj = new Image();

    var resFactor = 0;

    if (w > h){
      resFactor = w / maxWidthHeight;
    }
    else{
      resFactor = h / maxWidthHeight;
    }

    //Callback when image is loaded
    imageObj.onload = function()
    {
      //Draw image
      context.drawImage(imageObj, 0, 0, imageObj.width / resFactor, imageObj.height / resFactor);
      //Then draw faces
      if (kairJson.images!=null){
        for (j = 0; j < kairJson.images[0].faces.length; j++){
          drawFace(kairJson.images[0].faces[j], context, resFactor);
        }
      }
    }

    imageObj.src = paintingImageURL;
  });

}

//Draw face on Canvas on top of the image
function drawFace(face, context, factor)
{
      // draw face box
      context.beginPath();
      context.rect(face.topLeftX / factor, face.topLeftY / factor, face.width / factor, face.height / factor);
      context.lineWidth = lineW;
      if (face.attributes.gender.type == "M"){
        context.strokeStyle = strkClMen;
      }
      else{
        context.strokeStyle = strkClWomen;
      }
      context.stroke();

      // draw left eye
      context.beginPath();
      context.moveTo(face.leftEyeCornerLeftX / factor, face.leftEyeCornerLeftY / factor);
      context.lineTo(face.leftEyeCornerRightX / factor, face.leftEyeCornerRightY / factor);
      context.stroke();

      context.beginPath();
      context.moveTo(face.leftEyeCenterX / factor, (face.leftEyeCenterY  / factor+ (face.height / factor / 25)));
      context.lineTo(face.leftEyeCenterX/ factor, (face.leftEyeCenterY / factor - (face.height / factor / 25)));
      context.stroke();

      // draw right eye
      context.beginPath();
      context.moveTo(face.rightEyeCornerLeftX / factor, face.rightEyeCornerLeftY / factor);
      context.lineTo(face.rightEyeCornerRightX / factor, face.rightEyeCornerRightY / factor);
      context.stroke();

      context.beginPath();
      context.moveTo(face.rightEyeCenterX / factor, (face.rightEyeCenterY / factor + (face.height / factor / 25)));
      context.lineTo(face.rightEyeCenterX / factor, (face.rightEyeCenterY / factor - (face.height / factor / 25)));
      context.stroke();

      // left eyebrow
      context.beginPath();
      context.moveTo(face.leftEyeBrowLeftX / factor, face.leftEyeBrowLeftY / factor);
      context.lineTo(face.leftEyeBrowMiddleX / factor, face.leftEyeBrowMiddleY / factor);
      context.stroke();

      context.beginPath();
      context.moveTo(face.leftEyeBrowMiddleX / factor, face.leftEyeBrowMiddleY / factor);
      context.lineTo(face.leftEyeBrowRightX / factor, face.leftEyeBrowRightY / factor);
      context.stroke();

      // right eyebrow
      context.beginPath();
      context.moveTo(face.rightEyeBrowLeftX / factor, face.rightEyeBrowLeftY / factor);
      context.lineTo(face.rightEyeBrowMiddleX / factor, face.rightEyeBrowMiddleY / factor);
      context.stroke();

      context.beginPath();
      context.moveTo(face.rightEyeBrowMiddleX / factor, face.rightEyeBrowMiddleY / factor);
      context.lineTo(face.rightEyeBrowRightX / factor, face.rightEyeBrowRightY / factor);
      context.stroke();

      // draw mouth
      context.beginPath();
      context.moveTo(face.lipCornerLeftX / factor, face.lipCornerLeftY) / factor;
      context.lineTo(face.lipLineMiddleX / factor, face.lipLineMiddleY / factor);
      context.stroke();
      context.beginPath();
      context.moveTo(face.lipLineMiddleX / factor, face.lipLineMiddleY / factor);
      context.lineTo(face.lipCornerRightX / factor, face.lipCornerRightY / factor);
      context.stroke();

      // draw nose
      context.beginPath();
      context.moveTo(face.nostrilLeftSideX / factor, face.nostrilLeftSideY / factor);
      context.lineTo(face.nostrilLeftHoleBottomX / factor, face.nostrilLeftHoleBottomY / factor);
      context.stroke();

      context.beginPath();
      context.moveTo(face.nostrilRightSideX / factor, face.nostrilRightSideY / factor);
      context.lineTo(face.nostrilRightHoleBottomX / factor, face.nostrilRightHoleBottomY / factor);
      context.stroke();
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
  //console.log("Kairos Data: ");
  //console.log(response);
  countK++;
  var prout = countG - countD;
  console.log(countK+"    to     "+prout);

  //Download the resulting Json
  if (JSON.parse(response.responseText).images !=null){
    downloadText( response.responseText, fileToIdDict[JSON.parse(response.responseText).images[0].file]+".json");
  }

  //Display the face recognition and the image on the screen
  //displayKairos(folderPath+""+fileToIdDict[JSON.parse(response.responseText).image[0].file]+".json");
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
