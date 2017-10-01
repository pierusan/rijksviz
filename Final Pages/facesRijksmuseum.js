/*Initial Data*/
var kairosData = null; // Placeholder for Facial Recognition data of Kairos API
var collectionData = []; // Arrat containing museums paintings information
var kairosDataPath = "Data/allKairos2.json";
var collectionDataPath = "Data/collection.json";

/*Cleaned Data*/
var paintingsWithFaces = []; // Array of painting info (only painting containing faces)
var facesData = []; // Array of faces info
var facesCount = 0; // Number of faces in the array

/*Initialization of the Page*/
var loadingRefreshDelay = 200; // Waiting intervals while json files haven't loaded (in ms)
var initialFaceId = 160; // The Id of the face which will be shown by default on the page

/*Friends Tab Parameters*/
var ratioAroundHead = 1.8; // Ratio between face width on page and face with as found by Kairos API
var facesInTab = 30; // Number of "Friends" in the Friends tab
var nbOfFriendsPerLine = 4; // Number of faces in one line of the Friends Tab
var relativePaddingX= 0.1; // Relative padding of each picture (between 0 and 1)


//Load Face Detection Data gathered through Kairos API
d3.json(kairosDataPath, function(json){
  kairosData = json;
  /*
  console.log("Kairos Data: ");
  console.log(kairosData);
  */
});


//Load the Museum's Painting Collection Data
d3.json(collectionDataPath, function(json){
  collectionData = json;
  /*
  console.log("Collection Data: ");
  console.log(collectionData);
  */
});

//Display page when DOM is ready
$(document).ready(function() {
  WaitAndDisplayPage();
});


/**
 * Wait for data to load before displaying the page
 */
function WaitAndDisplayPage(){

  //Retry loading if collection and kairos data have not loaded yet
  if (collectionData.collection == null || kairosData.paintings == null){
    setTimeout(WaitAndDisplayPage, loadingRefreshDelay);
    return;
  }

  CleanData();

  UpdatePageWithFace(initialFaceId);
}


/**
 * Populate paintinWithFaces array, only storing paintings containing faces
 * Populate facesData array, storing faces information corresponding to these paintings
 */
function CleanData(){

  //Iterate through all paintings which contain faces
  for (var i = 0; i < kairosData.paintings.length; i++){
    if ((kairosData.paintings[i].images) != null){

      //Store painting info along with faces info into paintingWithFaces
      var painting = getCollectionPaintingById(kairosData.paintings[i].paintingId);
      painting["faces"] = kairosData.paintings[i].images[0].faces;
      painting["facesIds"] = [];
      paintingsWithFaces.push(painting);

      //Store each face as a separate element of facesData
      for (var j = 0; j < kairosData.paintings[i].images[0].faces.length; j++){
        var face = kairosData.paintings[i].images[0].faces[j];
        face["paintingId"] = kairosData.paintings[i].paintingId;
        face["webImage"] = painting.artObject.webImage;
        painting["facesIds"].push(facesCount);
        face["faceId"] = facesCount++;
        facesData.push(face);
      }
    }
  }

  /*
  console.log("Paintings With Faces Data:");
  console.log(paintingsWithFaces);
  console.log("Faces Data:");
  console.log(facesData);
  */
}


/**
 * Update social media page with a new face
 * @param {Number} faceId - the index (in the facesData array) of the main face to display
 */
function UpdatePageWithFace(faceId){

  ResetPage();


  var mainFace = getFacesInfo(faceId)[0];
  var otherFaces = getFacesInfo(faceId)[1];
  var randomFaces = getRandomFaces(getFacesInfo(faceId)[2], facesInTab);

  var painting = getPaintingById(getFaceById(faceId).paintingId).artObject;
  var onDisplay = getPaintingById(getFaceById(faceId).paintingId).onDisplay;

  //Update elements of the page one by one
  updateProfilePicture(mainFace, painting);
  updateFriends(otherFaces, painting, randomFaces);
  updateProfileContent(painting, onDisplay, mainFace);
  updateMaker(painting);
  updatePhotos(painting);
}

/**
 * Categorize faces as target face, other face in the painting, or other face in the collection
 * @param {Number} faceId - the index (in the facesData array) of the main face to display
 * @return {Object[]} an array of size 2 wher:
 *                     - the first element contains info about the face
 *                     - the second element contains the info about the other faces in the painting
 *                     - the rest of the faces info of the collection
 */
function getFacesInfo(faceId){

  //Get all the indexes of faces contained within the painting where the main face is
  var indexesInPainting = getPaintingById(getFaceById(faceId).paintingId).facesIds.slice(0);
  indexesInPainting.sort(function(a, b) {
    return b - a;
  });

  var facesDataCopy = facesData.slice(0);
  var mainFace = null;
  var otherFaces = [];
  for (var i = 0; i < indexesInPainting.length; i++){
    if (indexesInPainting[i] == faceId){
      mainFace = facesDataCopy.splice(indexesInPainting[i], 1)[0];
    }
    else{
      otherFaces.push(facesDataCopy.splice(indexesInPainting[i], 1)[0]);
    }
  }

  return [mainFace, otherFaces, facesDataCopy];
}

/**
 * Return an array with random faces
 * @param {Object[]} facesDataCopy - a copy of the faces data array
 * @param {Number} length - length of the array to return
 * @return {Object[]} an array containing random faces objects (of length length)
 */
function getRandomFaces(facesDataCopy, length){
  var randomFacesArray = [];
  for (var i = 0; i < length; i++){
    var randomIndex = Math.floor(Math.random() * facesDataCopy.length);
    randomFacesArray.push(facesDataCopy.splice(randomIndex, 1)[0])
  }
  return randomFacesArray;
}

/**
 * Resets all elements within the page
 */
function ResetPage(){
  d3.select("#closeFriendsSvgs").selectAll("*").remove();
  d3.select("#distantRelationsSvgs").selectAll("*").remove();
  d3.select("#profilePicSvg").selectAll("*").remove();
}

/**
 * Update the profile picture on the page
 * @param {Object} mainFace - Information about the main face displayed
 * @param {Number} painting - Information about the painting
 */
function updateProfilePicture(mainFace, painting){
  var faceWidth = $("#profilePicSvg").width() / ratioAroundHead;
  var faceSVG = d3.select("#profilePicSvg")
                    .attr("x", "0")
                    .attr("y", "0")
                    .classed("clip-circle", "true");

  fillSvgWithFace(faceSVG, faceWidth, mainFace, painting.webImage, false);
}


/**
 * Updates the information relative to the face on the page
 * @param {Object} painting - Information about the painting
 * @param {Boolean} onDisplay - Boolean stating whether the painting is displayed at the museum
 * @param {Number} mainFace - Information about the main face displayed
 */
function updateProfileContent(painting, onDisplay, mainFace){
    //Gather information about the face
    var ethnicity = getEstimatedEthnicity(mainFace);
    var gender = getEstimatedGender(mainFace);
    var h = getFaceHeight(mainFace, painting);
    var w = getFaceWidth(mainFace, painting);
    var isLeftInBackRoom = (onDisplay)?"No":"Yes";

    //Assign this information to the HTML
    d3.select("#birthday").html(painting.dating.year);
    d3.select("#skin").html(painting.physicalMedium);
    d3.select("#ethnicity").html(ethnicity);
    d3.select("#gender").html(gender);
    d3.select("#onDisplay").html(isLeftInBackRoom);
    d3.select("#faceHeight").html(h.toFixed(1)+" cm");
    d3.select("#faceWidth").html(w.toFixed(1)+" cm");
}


/**
 * Update the painting's maker information
 * @param {Object} painting - Information about the painting
 */
function updateMaker(painting){
    d3.select("#makerName").html(painting.principalOrFirstMaker);
    d3.select("#makerBirthDate").html(painting.principalMakers[0].dateOfBirth);
    d3.select("#makerDeathDate").html(painting.principalMakers[0].dateOfDeath);
    d3.select("#makerBirthPlace").html(painting.principalMakers[0].placeOfBirth);
    d3.select("#makerDeathPlace").html(painting.principalMakers[0].placeOfDeath);
    d3.select("#makerNationality").html(painting.principalMakers[0].nationality);
}

/**
 * Update the photos tab (picture of the paiting)
 * @param {Object} painting - Information about the painting
 */
function updatePhotos(painting){
  $("#paintingImg").attr("src", painting.webImage.url);
  if (painting.label.title != null){
    d3.select("#paintingTitle").html(painting.label.title);
  }
  else{
      d3.select("#paintingTitle").html(painting.title);
  }
}

/**
 * Update the friends tab
 * @param {Object[]} otherFaces - Information about the other faces of the painting (different from the face on top of the page)
 * @param {Object} painting - Information about the main painting
 * @param {Object[]} painting - Information about a set of randomly selected faces to include in the Friends tab
 */
function updateFriends(otherFaces, painting, randomFacesArray){

  /*First take care of the other faces present in the painting*/
  var otherFacesDivId = "#closeFriendsDiv";
  var otherFacesSvgId = "#closeFriendsSvgs";
  if (otherFaces.length == 0){
    $(otherFacesDivId).hide();
  }
  else{
    $(otherFacesDivId).show();
    var idArrays = fillSvgWithSvgs(otherFacesSvgId, otherFaces, nbOfFriendsPerLine, relativePaddingX, "closeFriend");
    for (var i = 0; i < idArrays.length; i++){
      var faceW = $("#"+idArrays[i]).width() / ratioAroundHead;
      fillSvgWithFace(d3.select("#"+idArrays[i]), faceW, otherFaces[i], painting.webImage, true);
    }
  }

  /*Then take care of the random faces to browse in the Friends tab*/
  relationsSvgId = "#distantRelationsSvgs";
  var otherIdArray = fillSvgWithSvgs(relationsSvgId, randomFacesArray.slice(0,facesInTab), nbOfFriendsPerLine, relativePaddingX, "distantFriend");
  for (var i = 0; i < otherIdArray.length; i++){
    var faceW = $("#"+otherIdArray[i]).width() / ratioAroundHead;
    fillSvgWithFace(d3.select("#"+otherIdArray[i]), faceW, randomFacesArray[i], getPaintingById(randomFacesArray[i].paintingId).artObject.webImage, true);
  }
}

/**
 * Fill an SVG element with multiple SVG elements
 * @param {String} svgId - the DOM id of the svg to fill
 * @param {Object[]} facesData - array containing the faces data
 * @param {Number} nbPerLine - The number of SVGs to create per line
 * @param {Number} relativePadding - The padding of each svg (in %)
 * @param {String} idPrefix - The prefix of the id in the DOM
 */
function fillSvgWithSvgs(svgId, facesData, nbPerLine, relativePadding, idPrefix){
  /*Dimensions of the parent SVG*/
  var parentSvgWidth = $(svgId).width() * 0.95; // Reduce width to fit canvas
  var parentSvgHeight = 0; // Initialize at 0  & compute desired height as parent gets filled with faces

  /*Information about the children SVGs*/
  var childrenSvgWidth = parentSvgWidth / nbPerLine; //width of the children svgs
  var idArrays = []; //id of the children svgs

  var svgsD3 = d3.select(svgId)
                 .selectAll("svg")
                 .data(facesData)
                 .enter()
                 .append("svg")
                 .attr("width", childrenSvgWidth)
                 .attr("height", childrenSvgWidth)
                 .attr("x", function(d, i){
                   var inCol = i % nbPerLine;
                   return Math.floor(inCol * childrenSvgWidth + relativePadding * childrenSvgWidth);
                 })
                 .attr("y", function(d, i){
                  var inRow = Math.floor(i / nbPerLine);
                  if (i == facesData.length - 1){
                    parentSvgHeight = Math.floor((inRow + 1) * childrenSvgWidth);
                  }
                  return Math.floor(inRow * childrenSvgWidth + relativePadding * childrenSvgWidth);
                })
                .attr("id", function(d, i){
                  idArrays[i] = idPrefix+i;
                  return idArrays[i];
                });

   //Change height of the parent svg
   d3.select(svgId).attr("height", parentSvgHeight + childrenSvgWidth);

   return idArrays;
}


/**
 * Fill an SVG element with a face
 * @param {Object} svgD3 - the svg element (as a D3 selection) to fill with a face
 * @param {Number} faceW - The width of the face
 * @param {Object} webImage - The element containing the details of the image
 * @param {Boolean} clickable - Whether we want the SVG to be clickable or not
 */
function fillSvgWithFace(svgD3, faceW, face, webImage, clickable){

  if (clickable){
    svgD3.classed("brightness", "true");
  }

  svgD3.append("svg:image")
         .attr("x", function(){
           var offsetLeft = face.topLeftX * faceW / face.width -  faceW * (ratioAroundHead - 1) / 2;
           return -1 * offsetLeft;
         })
         .attr("y", function(){
           var offsetTop = face.topLeftY * faceW  / face.width - face.height / face.width * faceW * (ratioAroundHead - 1) / 2;
           return -1 * offsetTop;
         })
         .attr("width", function(){
           return webImage.width * faceW  / face.width;
         })
         .attr("height", function(){
           return webImage.height * faceW / face.width;
         })
         .style("fill", "#000000")
         .attr("xlink:href", function(){
            if (webImage == null){
              return "Data/Copyright.PNG";
            }
            return webImage.url;
          })
          .on('click', function(){
            if (clickable){
              UpdatePageWithFace(face.faceId);
            }
          });
}

/**
 * Retrieve a specific painting element from the collection data array based on its ID
 * @param {Number} ptingId
 */
function getCollectionPaintingById(ptingId) {
  return collectionData.collection.filter(
      function(element){ return element.paintingId == ptingId }
  )[0];
}

/**
 * Retrieve a specific painting element, based on its ID, from the set of paintings containing faces
 * @param {Number} ptingId
 */
function getPaintingById(ptingId) {
  return paintingsWithFaces.filter(
      function(element){ return element.paintingId == ptingId }
  )[0];
}

/**
 * Retrieve a specific face element from the faces data array based on its ID
 * @param {Number} faceId
 */
function getFaceById(faceId) {
  return facesData.filter(
      function(element){ return element.faceId == faceId }
  )[0];
}

/**
 * Returns the estimated ethnicity of the face as computed by the Kairos API
 * @param {Object} face - Information about the face
 * @return {String} the estimated ethnicity
 */
function getEstimatedEthnicity(face){
    var eth = null;
    var maxEth = Math.max(face.attributes.asian, face.attributes.black, face.attributes.hispanic, face.attributes.other, face.attributes.white);
    if (maxEth == face.attributes.asian){
      eth = "Asian";
    }
    else if (maxEth == face.attributes.black){
      eth = "Black";
    }
    else if (maxEth == face.attributes.hispanic){
      eth = "Hispanic";
    }
    else if (maxEth == face.attributes.other){
      eth = "Other";
    }
    else{
      eth = "White";
    }
    return eth;
}

/**
 * Returns the estimated gender of the face as computed by Kairos API
 * @param {Object} face - Information about the face
 * @return {String} the estimated gender
 */
function getEstimatedGender(face){
  var gender = null;
  if (face.attributes.gender.type = "F"){
    gender = "Female";
  }
  else {
    gender = "Male";
  }
  return gender;
}

/**
 * Returns the height of the face on the painting (in centimeters)
 * @param {Object} face - Information about the face
 * @param {Object} painting - Information about the painting
 * @return {String} the face height in cm
 */
 function getFaceHeight(face, painting){
   return face.height / painting.webImage.height * painting.dimensions[0].value;
 }

 /**
  * Returns the width of the face on the painting (in centimeters)
  * @param {Object} face - Information about the face
  * @param {Object} painting - Information about the painting
  * @return {String} the face width in cm
  */
  function getFaceWidth(face, painting){
    return face.width / painting.webImage.width * painting.dimensions[1].value;
  }
