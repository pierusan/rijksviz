// Kairos SDK parameters
var kairos = new Kairos("07085ed9", "898a579671ad835e6888fb3c4805b435");

//Id of the painting to search for
var paintingID = null;

//Url of the painting that was searched for
var paintingImageURL = null;

//Local folder where the Face Detection Json are stored
var folderPath = "KairosJson/";

//Associate fileName with painting IDs
var fileToIdDict = {};

//JSON which will be created if no face has been recognized
var errorJson = '{"Errors":[{"Message":"no faces found in the image","ErrCode":5002}]}';

//Parameters for the display of image and faces bounding box
var resizingFactor = 3;
var lineW = 2;
var strkClMen = '#139C8A';
var strkClWomen = '#ffb6c1';

//Called to create Json files for the paintings without faces
function fillEmptyFaces(){
  for (var key in fileToIdDict) {
    var http = new XMLHttpRequest();
    http.open('HEAD', folderPath+""+fileToIdDict[key]+".json", false);
    http.send();

    if (http.status == 404){
      //console.log(fileToIdDict[key]);
      downloadText( errorJson, fileToIdDict[key]+".json");
    }
  }
}

//Search for the painting
function paintingSearch(){

  //Get the paintingID from the input on the HTML page
  paintingID = document.getElementById("paintSearchID2").value;
  if (document.getElementById("paintSearchID").value != ""){
    paintingID = document.getElementById("paintSearchID").value;
  }

  //console.log("Into SearchPainting!");
  //console.log("ID: "+paintingID);
  paintingID = paintingID.toLowerCase();
  console.log("Lowercase ID searched: "+paintingID);

  //Callt the Rijksmuseum API
  var url = "https://www.rijksmuseum.nl/api/en/collection/"+paintingID+"?key=rgAMNabw&format=json";
  d3.json(url, function (json) {
      console.log("Loading json:");
      console.log(json);
      paintingData = json;

      //Store the URL of the painting
      paintingImageURL = paintingData.artObject.webImage.url;

      //Path for the json Face Detection
      var http = new XMLHttpRequest();
      http.open('HEAD', folderPath+""+paintingID+".json", false);
      http.send();
      //console.log(http.status!=404);

      //If the face detection data hasn't been store on local file yet, make a call to Kairos API
      if (http.status == 404){
            if (paintingData.artObject.hasImage && paintingData.artObject.copyrightHolder == null){
              console.log("Pushing the key: "+paintingData.artObject.webImage.url.split(".com/")[1]);
              console.log("Pushing the paintingID: "+paintingID);

              //Store the Kairos query in our array
              fileToIdDict[paintingData.artObject.webImage.url.split(".com/")[1]] = paintingID;

              getKairosJson(paintingData.artObject.webImage.url);
            }
      }
      else{
        displayKairos(folderPath+""+paintingID+".json");
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
  if (JSON.parse(response.responseText).images !=null){
    downloadText( response.responseText, fileToIdDict[JSON.parse(response.responseText).images[0].file]+".json");
  }

  //Display the face recognition and the image on the screen
  //displayKairos(folderPath+""+fileToIdDict[JSON.parse(response.responseText).image[0].file]+".json");
}

function getKairosJson(imageUrl){
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

//Display Faces Bounding Boxes from the stored JSON file
function displayKairos(jsonURL){
  console.log("Displaying Face detection from file: "+jsonURL);
  d3.json(jsonURL,function (error, kairJson) {
    if (error) throw error;
    console.log(kairJson);

    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    var imageObj = new Image();

    //Callback when image is loaded
    imageObj.onload = function()
    {
      //Draw image
      context.drawImage(imageObj, 0, 0, imageObj.width / resizingFactor, imageObj.height / resizingFactor);
      //Then draw faces
      if (kairJson.images!=null){
        for (j = 0; j < kairJson.images[0].faces.length; j++){
          drawFace(kairJson.images[0].faces[j], context, resizingFactor);
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
