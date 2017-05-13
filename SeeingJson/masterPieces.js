var mapUrl = "Data/amsterdamPaths/mapAndPaths.svg"; // Path for Amsterdam Vectorized Map
var numberPaths = 1; // Number of paths in the map (from 0 to n-1)
var mapRatio = 1; // Dimensions ratio of the map
var mapWidth = 1000.; // Desired width for the map
var resizingFactor = 1; // Factor used when resizing the map to fit the webpage
var mapSvg = null; // SVG element for the map
var animationGroup = null; // Group withing the svg where the pixels will flow;
var imagesFolder = "Data/Images/"; // Path where the images of the masterpieces are saved
var numberOfPixelsUsed = 5000; // Numbe Of Pixels we will actually use from the painting web image
var imageMaxEdge = 300; // Maximum edge length of the displayed image in our Svg
var imagePlaceHolder = null; // Rectangle where the pixels will end to form the painting image
var placeHolderOffsetX = 50;
var placeHolderOffsetY = 60;

//Populate our array with the masterpieces data
var masterPieces = [];
masterPieces.push({"index": 0,
                    "imageUrl": "http://lh3.googleusercontent.com/-pGNtXiSwRShKc9U6djlF7JB3cWtqONNmpnQ7U_ieUjn7iwIP4ziNGt7LGFxfN0IqGzoLlEeIKNoERm6qTQuId9GdUo=s0",
                    "imageWidth": 2261, "imageHeight": 2548,
                    "title": "The Milkmaid", "subtitle": "Johannes Vermeer (1632–1675), oil on canvas, c. 1660", "id":"sk-a-2344"});
masterPieces.push({"index": 1,
                    "imageUrl": "http://lh3.googleusercontent.com/7SCpHk2od2XtCFtdEi9fUT91F7CwawoLPWH5Jlrkksv79_JST7-dBpvuBWqjr65LQc8z_8O2lxQvQJFlfE763Da6REE=s0",
                    "imageWidth": 2655, "imageHeight": 3000,
                    "title": "Girl in a Large Hat", "subtitle": "Cesar Boetius van Everdingen (1617–1678), oil on canvas, c. 1645–1650", "id":"sk-a-5005"});
masterPieces.push({"index": 2,
                    "imageUrl": "http://lh3.googleusercontent.com/vvYcfHYldmNr8EpSdnyi3af9BYiFB9ev8Hxm5taOXbKzPyr1-blKkxZ28HZ71kQdayor8WWjQaDb2QPEY3XJ4VLgGOo=s0",
                    "imageWidth": 2500, "imageHeight": 2034,
                    "title": "Night Watch", "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on canvas, 1642", "id":"sk-c-5"})
masterPieces.push({"index": 3,
                    "imageUrl": "http://lh3.googleusercontent.com/7JF0tll1eAfY8XgFHJ6Iq_e1xux4xgcT8_LxMfVbZdRMC5CX5KsXLH1DLlMEfuTfKX8kehtmhJyzJSBFEBDPFmeB6Y8=s0",
                    "imageWidth": 2852, "imageHeight": 2211,
                    "title": "The Merry Family", "subtitle": "Jan Havicksz Steen (c. 1625–1679), oil on canvas, 1668", "id":"sk-c-229"})
masterPieces.push({"index": 4,
                    "imageUrl": "http://lh5.ggpht.com/JH0svNh0Pkov_W97MDHw8v2-qKS8AdixVJ-CiPL_xBECNdEyTBkicMvZBsqgW6GQ0TB9moKnfGUYacWQS32rqeoEjA4=s0",
                    "imageWidth": 2940, "imageHeight": 1998,
                    "title": "The Massacre of the Innocents", "subtitle": "Cornelis Cornelisz van Haarlem (1562–1638), oil on canvas, 1590", "id":"sk-a-128"})
masterPieces.push({"index": 5,
                    "imageUrl": "http://lh3.googleusercontent.com/tm1DbZrAP0uBM-OJhLwvKir1Le5LglRF_bvbaNi6m-F_pIyttsWQz040soRY9pWA9PgNEYFA_fBkg_keYixRXCAjz9Q=s0",
                    "imageWidth": 2459, "imageHeight": 2916,
                    "title": "The Threatened Swan", "subtitle": "Jan Asselijn (1610–1652), oil on canvas, c. 1650", "id":"sk-a-4"})

//ONLY DO THIS IF THE IMAGES HAVE BEEN SAVED
//Change the Url to the local path
for (var i = 0; i < masterPieces.length; i++){
  masterPieces[i].imageUrl = imagesFolder+masterPieces[i].id+".jpg";
}
console.log(masterPieces);

loadMap();
createImageContainer();
var index = 0;
loadPixels(index);
animateMasterPiece(index);

function loadMap() {
  //Load Map
  xhr = new XMLHttpRequest();
  xhr.open("GET",mapUrl,false);
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");

  //Embed Map in Webpage
  mapSvg = d3.select(d3.select("#svgContainer")
            .node()
            .appendChild(xhr.responseXML.documentElement));

  //Resize the map
  resizingFactor = mapWidth / mapSvg.node().getBoundingClientRect().width;
  mapRatio = mapSvg.node().getBoundingClientRect().width / mapSvg.node().getBoundingClientRect().height;
  resizeMap(resizingFactor);

  //Hide paths drawn in Illustrator
  for (var i = 0; i < numberPaths; i++){
    d3.select("#path"+i)
      .style("stroke-opacity", "0");
  }

  //Create Animation Group in the Svg where the flowing pixels will lie
  animationGroup = mapSvg.append("g")
                          .attr("id", "animationGroup");
}

function resizeMap(scaleFactor){
  mapSvg.attr("width", mapWidth)
        .attr("height", mapWidth / mapRatio);
}

function createImageContainer(){
  imagePlaceHolder = d3.select("#svgContainer")
                          .append("rect")
                          .attr("x", mapWidth + placeHolderOffsetX)
                          .attr("y", placeHolderOffsetY)
                          .attr("width", 1400 - mapWidth)
                          .attr("height", 500)
                          .style("fill", "#eeeeee");
}

function loadPixels(pieceIndex){
  //Load the image and store the pixels in the global masterPieces data array
  if (masterPieces[pieceIndex].colorsArray == null){
    loadImage(masterPieces[pieceIndex].imageUrl, masterPieces[pieceIndex].imageWidth, masterPieces[pieceIndex].imageHeight, pieceIndex);
  }
}

function animateMasterPiece(pieceIndex){
  //Wait for the Pixels to be grabbed
  while (masterPieces[index].colorsArray == null){
    console.log("NOT LOADED YET");
    setTimeout(function(){
      animateMasterPiece(pieceIndex);
    },500);
    return;
  }
  console.log(masterPieces[index].colorsArray);

  changePlaceHolderSize(masterPieces[index].imageWidth, masterPieces[index].imageHeight);
  var pixDim = getPixSquareEdge(index);
  var pix = createPix(index, pixDim);
  animatePixOnMap();
  animatePixToImage();

  /*
  //Animate the circles
  for (var i = 0; i < numberPaths; i++){
    animateCircle("#path"+i);
  }
  */
}

function changePlaceHolderSize(w, h){
  if (w > h){
    imagePlaceHolder.attr("width", imageMaxEdge)
                     .attr("height", imageMaxEdge * h / w);
  }
  else{
    imagePlaceHolder.attr("height", imageMaxEdge)
                     .attr("width", imageMaxEdge * w / h);
  }
}

function createPix(pieceIndex){
  animationGroup.selectAll("rect")
                .data(masterPieces[pieceIndex])
                .enter()
                .append(rect)

}

function animatePixOnMap(){

}

function animatePixToImage(){

}

function animateCircle(pathId){
  var path = d3.select(pathId),
  startPoint = pathStartPoint(path);

  var marker = animationGroup.append("circle");
  marker.attr("r", 7)
      .attr("transform", "translate(" + startPoint + ")");

  transition(marker, path);
}


//Get path start point for placing marker
function pathStartPoint(path) {
  var d = path.attr("d"),
  dsplitted = d.split("c");
  return dsplitted[1].split(",")[0];
}

function transition(marker, path) {
  marker.transition()
      .duration(30000)
      .attrTween("transform", translateAlong(path.node()))
      .on("end", function(){
        animationEnd();
      });// infinite loop
}

function translateAlong(path) {
  var l = path.getTotalLength();
  return function(i) {
    return function(t) {
      var p = path.getPointAtLength(t * l);
      return "translate(" + p.x + "," + p.y + ")";//Move marker
    }
  }
}

function animationEnd(){
  console.log("end");
  //loadImage(masterPieces[0].imageUrl, masterPieces[0].imageWidth, masterPieces[0].imageHeight);
}


function loadImage(imageUrl, imageWidth, imageHeight, pieceIndex){
  var img = new Image();
  var context = document.getElementById('canvas').getContext('2d');
  //img.src = imageUrl + '?' + new Date().getTime();
  img.src = imageUrl;
  // fixes this issue: "Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data."
  img.setAttribute('crossOrigin', '');
  // get painting image data and create color bar
  img.onload = function() {
     var imagePixelData = GetImagePixelData(context, img, imageWidth, imageHeight);
     console.log("Image Loaded!");
     masterPieces[pieceIndex].colorsArray = imagePixelData;
     //DisplayColors(imagePixelData, id, painting.title, painting.principalMaker, painting.dating.year, painting.webImage.url);
  };
}

/*
    Get array of evenly spaced pixels across 1 painting image.
    @param Canvas context.
    @param Image object.
    @param int of painting image width.
    @param int of painting image height.
    @return Array of final pixels to display.
*/
function GetImagePixelData(context, img, imgWidth, imgHeight){
    // to fill with the hex values of image's pixels
    var colorsArray = [];
    // TODO: seems like you have to set accurate canvas dimensions and drawImage to access image data? but don't want to see it so set display: none in HTML. necessary? fix
    context.canvas.width  = imgWidth;
    context.canvas.height = imgHeight;
    context.drawImage(img, 0, 0, imgWidth, imgHeight);
    // math to find interval to space out "pixel-grabbing" in both x and y directions
    // basically determines which x to make a rectangle with the same width/height ratio as the original painting image BUT also with the # of pixels set in LENGTH_COLOR_BARS
    // note: Math.floor loses precision but not the worst
    var totalPixels = imgWidth * imgHeight;
    var x = Math.floor(Math.sqrt(totalPixels/numberOfPixelsUsed));
    //x = 1
    // go through in both x and y directions and grab evenly spaced pixels to cover the entire painting equally
    var cpt = 0;
    for (i = 0; i < imgWidth; i+=x) {
        colorsArray.push([]);
        for (j = 0; j < imgHeight; j+=x) {
            var eachPixelData = context.getImageData(i, j, 1, 1).data;
            // TODO: this converts to hex from rgb just to convert back later?? necessary? fix
            var hex = "#" + ("000000" + RGBtoHex(eachPixelData[0], eachPixelData[1], eachPixelData[2])).slice(-6);
            colorsArray[cpt].push(hex);
        }
        cpt++;
    }
    //var sortedArray = CreateSortedArray(colorsArray, 'hue');
    /*
    // sort  subsections by saturation
    //var sortedArray = SortColorSubsections(sortedArray, 150);
    // standard number of pixels
    var sortedArray = RemoveExtraPixels(sortedArray, LENGTH_COLOR_BARS);
    */
    //return sortedArray;
    return colorsArray;
}


/*
    Creates a new array of Color objects.
    @param Array of all colors as hex values.
    @param String designating whether to sort by hue, saturation, value, or chroma (1st 3 letters of word).
    @return A new array of all colors as Color objects.
*/
function CreateSortedArray(hexArray, sortType) {
    // pierre's idea about separating out the darks and adding them to the bottom
    // var colorArrayLight = NewColorArray(hexArray, .4, 1);
    // var colorArrayDark = NewColorArray(hexArray, 0, .4);
    var colorArray = NewColorArray(hexArray, 0, 1);
    switch (sortType) {
        case "hue":
            SortColorsByHue(colorArray);
            break;
        case "sat":
            SortColorsBySat(colorArray);
            break;
        case "val":
            SortColorsByVal(colorArray);
            break;
        case "chr":
            SortColorsByChr(colorArray);
            break;
    }
    return colorArray;
}
SortColorsByHue = function (colors) {
    return colors.sort(function (a, b) {
        return a.hue - b.hue;
    });
};
SortColorsBySat = function (colors) {
    return colors.sort(function (a, b) {
        return a.sat - b.sat;
    });
};
SortColorsByVal = function (colors) {
    return colors.sort(function (a, b) {
        return a.val - b.val;
    });
};
SortColorsByChr = function (colors) {
    return colors.sort(function (a, b) {
        return a.chroma - b.chroma;
    });
};


/*
    Creates the hex value given the 3 RGB values.
    Pulled from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
*/
function RGBtoHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}


/*
    Creates a new array of Color objects.
    @param Array of all colors as hex values.
    @param int for minimum value where 0 is the standard. Do not include colors with hex values below this. (Note: the lower the int, the darker.)
    @param int for maximum value where 1 is the standard. Do not include colors with hex values above this.
    @return A new array of all colors as Color objects.
*/
function NewColorArray(hexArray, valMin, valMax) {
    //define a Color class for the color objects
    var Color = function Color(hexVal) { this.hex = hexVal; };
    var colors = [];
    $.each(hexArray, function (i, hex) {
        var color = new Color(hex);
        ConstructColor(color);
        // eliminate colors if outside the bounds of parameters
        if (color.val >= valMin && color.val <= valMax){
            colors.push(color);
        }
    });
    return colors;
};


/*
    Creates a Color object.
    Pulled from @chedda86: https://era86.github.io/2011/11/15/grouping-html-hex-colors-by-hue-in.html
*/
ConstructColor = function(colorObj){
    console.log(colorObj);
    var hex = colorObj.hex.substring(1);

    // Get RGB values
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;

    // Get max/min values for Chroma
    var max = Math.max.apply(Math, [r, g, b]);
    var min = Math.min.apply(Math, [r, g, b]);

    // Variables for HSV value of hex color
    var chr = max - min;
    var hue = 0;
    var val = max;
    var sat = 0;

    if (val > 0) {
        // Calculate Saturation only if Value isn't 0
        sat = chr / val;
        if (sat > 0) {
            if (r == max) {
                hue = 60 * (((g - min) - (b - min)) / chr);
                if (hue < 0) {
                    hue += 360;
                }
            } else if (g == max) {
                hue = 120 + 60 * (((b - min) - (r - min)) / chr);
            } else if (b == max) {
                hue = 240 + 60 * (((r - min) - (g - min)) / chr);
            }
        }
    }
    colorObj.chroma = chr;
    colorObj.hue = hue;
    colorObj.sat = sat;
    colorObj.val = val;
    colorObj.luma = 0.3 * r + 0.59 * g + 0.11 * b;
    colorObj.red = parseInt(hex.substring(0, 2), 16);
    colorObj.green = parseInt(hex.substring(2, 4), 16);
    colorObj.blue = parseInt(hex.substring(4, 6), 16);
    return colorObj;
};
