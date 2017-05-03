//Load the Face Detection Data
var kairosDataPath = "Data/allKairos2.json";
var kairosData = null;
d3.json(kairosDataPath, function(json){
  kairosData = json;
  console.log("Kairos Data: ");
  console.log(kairosData);
});


//Load the On Display Data
var collectionDataPath = "Data/collection.json";
var collectionData = [];
var nbWithoutDisplay = 0;
d3.json(collectionDataPath, function(json){
  collectionData = json;
  console.log("Collection Data: ");
  console.log(collectionData);
});


// URL for the API Search
//var searchUrl = "https://www.rijksmuseum.nl/api/en/collection?key=rgAMNabw&format=json&ps=100&type=painting&imgonly=True&ondisplay=False";
var searchUrl = "https://www.rijksmuseum.nl/api/en/collection?key=rgAMNabw&format=json&ps=100&type=painting&imgonly=True&ondisplay=False&title=Portrait&credits=Loan";
// Number of elements in the collection
var collectionCnt = 4299;

//Placeholder for the data which interests us
var paintingsWithFaces = [];
var facesCount = 0;
var facesData = [];

//Parameters for the thumbnails
var maxWidthHeight = 300;


//Search the whole collection and display the iceberg at the end
//advSearch(searchUrl);

StartFacebook();

function StartFacebook(){
  if (collectionData.collection == null){
    setTimeout(StartFacebook,500);
    return;
  }
  console.log("Aggregate = "+collectionData.collection.length+" & Count = "+ collectionCnt);
  while(collectionData.collection.length != collectionCnt){
    setTimeout(StartFacebook,500);
    return;
  }

  for (var i = 0; i < kairosData.paintings.length; i++){
    if ((kairosData.paintings[i].images) != null){
      //Update the paintingsWithFaces array
      var painting = getCollectionPaintingById(kairosData.paintings[i].paintingId)[0];
      painting["faces"] = kairosData.paintings[i].images[0].faces;
      painting["facesIds"] = [];
      paintingsWithFaces.push(painting);

      //Update the Faces array
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

  //Print the data of the whole collection
  console.log("Paintings With Faces Data:");
  console.log(paintingsWithFaces);

  //Print the data of the whole collection
  console.log("Faces Data:");
  console.log(facesData);

  updateFacebookPage(2);
}

function updateFacebookPage(faceId){
  var tempFacesArray = facesData.slice(0);

  var indexesInPainting = getPaintingById(getFaceById(faceId)[0].paintingId)[0].facesIds.slice(0);
  indexesInPainting.sort(function(a, b) {
    return b - a;
  });

  var totNumberFaces = tempFacesArray.length;
  var nbFacesRemoved = 0;
  var mainFace = null;
  var otherFaces = [];
  for (var i = 0; i < indexesInPainting.length; i++){
    if (indexesInPainting[i] == faceId){
      mainFace = tempFacesArray.splice(indexesInPainting[i], 1)[0];
    }
    else{
      otherFaces.push(tempFacesArray.splice(indexesInPainting[i], 1)[0]);
    }
    nbFacesRemoved++;
  }

  console.log(mainFace);
  console.log(otherFaces);
  console.log(getPaintingById(getFaceById(faceId)[0].paintingId)[0]);
  console.log("Number of faces removed: "+nbFacesRemoved);

  var randomFacesArray = [];
  while (nbFacesRemoved != totNumberFaces){
    var randomIndex = Math.floor(Math.random() * tempFacesArray.length);
    randomFacesArray.push(tempFacesArray.splice(randomIndex, 1)[0])
    nbFacesRemoved ++;
  }
  console.log(randomFacesArray);

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
    collectionCnt = json.count;
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

function getCollectionPaintingById(ptingId) {
  return collectionData.collection.filter(
      function(element){ return element.paintingId == ptingId }
  );
}

function getPaintingById(ptingId) {
  return paintingsWithFaces.filter(
      function(element){ return element.paintingId == ptingId }
  );
}

function getFaceById(faceId) {
  return facesData.filter(
      function(element){ return element.faceId == faceId }
  );
}
