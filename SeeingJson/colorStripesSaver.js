var hagueDataUrl = "Data/hague.json";
var imagesFolder = "Data/Images/"
var colorsDataUrl = "Data/colorsHague.json";
var LENGTH_COLOR_BARS = 600;

var paintersData = [];
var colorsData = [];
var nbProcessed = 0;

function downloadJson(){
  saveData(colorsData, "colorsHague.json");
}

var saveData = (function () {
var a = document.createElement("a");
document.body.appendChild(a);
a.style = "display: none";
return function (data, fileName) {
    var json = JSON.stringify(data),
        blob = new Blob([json], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    };
}());

RunAll();

d3.json(colorsDataUrl, function (json) {
  console.log("COLORS DATA");
  console.log(json);
});
/*
   Gather data and display.
*/
function RunAll(){
  d3.json(hagueDataUrl, function (json) {
    console.log("LOCAL DATA");
    console.log(json);
    json.hague.firstGeneration[12][0].artObject.label.title = "View near the Geest Bridge";
    var myData = json.hague["secondGeneration"];
    for (var i = 0; i < json.hague["firstGeneration"].length; i++){
      myData.push(json.hague["firstGeneration"][i]);
    }
    for (var i = 0; i < json.hague["forerunners"].length; i++){
      myData.push(json.hague["forerunners"][i]);
    }
    console.log(myData);
    paintersData = myData;
  });

}



/*
   Check data all filled in for all artist arrays in the paintersData array and DISPLAY! (Step 5).
*/
function loadHagueColors(){

   // when all data is pulled, put all paintings and their data in 1 array
   var allPaintings = [];
   for (var i = 0; i < paintersData.length; i++) {
      var eachPainter = paintersData[i];
      for (var j = 0; j < eachPainter.length; j++) {
         allPaintings.push(eachPainter[j]);
      }
   }
   // sort paintings by date
   allPaintings.sort(function(a,b) {
      return a.artObject.dating.sortingDate - b.artObject.dating.sortingDate;
   });
   // create color display for each painting
   for (var i = 0; i < allPaintings.length; i++) {
      LoadPaintingColorInfo(allPaintings[i]);
   }

}


/*
    Creates image, div containers, and then runs methods to create full display for 1 painting (Step 6).
    @param Data for 1 painting.
*/
function LoadPaintingColorInfo(paintingData){
   var painting = paintingData.artObject;
   if (!painting.hasImage){
      return;
   }
   if (painting.hasImage && painting.copyrightHolder == null){
      if (painting.webImage != null) {
         var img = new Image();
         var context = document.getElementById('canvas').getContext('2d');
         //img.src = painting.webImage.url + '?' + new Date().getTime();
         img.src = imagesFolder+painting.objectNumber.toLowerCase()+".jpg" + '?' + new Date().getTime();
         // fixes this issue: "Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data."
         img.setAttribute('crossOrigin', '');
         // get actual width and height of image (= # of pixels)
         var imgWidth = painting.webImage.width;
         var imgHeight = painting.webImage.height;
         // get painting image data and create color bar
         img.onload = function() {
            var imagePixelData = GetImagePixelData(context, img, imgWidth, imgHeight);
            nbProcessed++;
            console.log(nbProcessed);
            var thatColor = {};
            thatColor["id"] = painting.objectNumber.toLowerCase();
            thatColor["colors"] = imagePixelData;
            colorsData.push(thatColor);
            //DisplayColors(imagePixelData, id, painting.title, painting.principalMaker, painting.dating.sortingDate, imagesFolder+painting.objectNumber.toLowerCase()+".jpg");
         };
      }
   }
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
    var x = Math.floor(1 / (Math.sqrt(LENGTH_COLOR_BARS/(totalPixels))));
    // go through in both x and y directions and grab evenly spaced pixels to cover the entire painting equally
    for (i = 0; i < imgWidth; i+=x) {
        for (j = 0; j < imgHeight; j+=x) {
            var eachPixelData = context.getImageData(i, j, 1, 1).data;
            // TODO: this converts to hex from rgb just to convert back later?? necessary? fix
            var hex = "#" + ("000000" + RGBtoHex(eachPixelData[0], eachPixelData[1], eachPixelData[2])).slice(-6);
            colorsArray.push(hex);
        }
    }
    var sortedArray = CreateSortedArray(colorsArray, 'hue');
    // sort  subsections by saturation
    //var sortedArray = SortColorSubsections(sortedArray, 150);
    // standard number of pixels
    var sortedArray = RemoveExtraPixels(sortedArray, LENGTH_COLOR_BARS);
    return sortedArray;
}


/*
    Sort subsections of pixel arrays using an additional dimension (saturation).
    @param sorted array to further "sub-sort."
    @param int number of pixels in each sorted subsection.
    @return Array of pixels subsorted by saturation.
*/
function SortColorSubsections(arrayToSubsort, additionalSortInterval) {
    for (i = 0; i < arrayToSubsort.length; i+=additionalSortInterval) {
        // inclusive, not inclusive
        var subsection = arrayToSubsort.slice(i, i+additionalSortInterval);
        SortColorsBySat(subsection);
        // remove because saturation looks better than value
        // SortColorsByVal(subsection);
        var subsectionBefore = arrayToSubsort.slice(0, i);
        var subsectionAfter = arrayToSubsort.slice(i+additionalSortInterval, arrayToSubsort.length);
        var first = subsectionBefore.concat(subsection);
        var arrayToSubsort = first.concat(subsectionAfter);
    }
    return arrayToSubsort;
}


/*
    Randomly remove pixels to make color bar standard length.
    @param sorted array that is too long.
    @param int number of pixels in each sorted subsection.
    @return Array of pixels set to standard length.
*/
function RemoveExtraPixels(arrayToShorten, colorBarNumPixels) {
    if (arrayToShorten.length > colorBarNumPixels){
        var difference = arrayToShorten.length - colorBarNumPixels;
        for (i = 0; i < difference; i++) {
            // splice parameters: index to remove (randomly generated), number of things to remove
            arrayToShorten.splice(Math.floor(Math.random()*arrayToShorten.length), 1);
        }
    }
    return arrayToShorten;
}


/*
    Write HTML to display 1 bar of color for each painting.
    @param Array of all Color objects for the current painting image.
    @param Painting number unique to API.
    @param Title for painting
    @param Artist of painting
    @param URL for painting image (data to make popup when clicked)
    Organized: #colorBarsContainer > .colorBars > .colorStrips
*/
function DisplayColors(colors, paintingIdentifier, imageTitle, imageArtist, imageDate, imageURL) {
   var artistClass = imageArtist.split('').join('_');
    // set data needed to add image to div later if user clicks bar
    $("#colorBarsContainer" + '>#bar' + paintingIdentifier).data('imageTitle', imageTitle);
    $("#colorBarsContainer" + '>#bar' + paintingIdentifier).data('imageArtist', imageArtist);
    $("#colorBarsContainer" + '>#bar' + paintingIdentifier).data('imageDate', imageDate);
    $("#colorBarsContainer" + '>#bar' + paintingIdentifier).data('imageURL', imageURL);
    // add a date
    $("#colorBarsContainer" + '>#bar' + paintingIdentifier).append('<div class="dates labels_small" id="date' + paintingIdentifier + '_' + i +'"><div id="dateLabel">' + imageDate + '</div></div>');
    // go through each color in the array
    for (i = 0; i < colors.length; i++){
        // add a color strip
        $("#colorBarsContainer" + '>#bar' + paintingIdentifier).append('<div class="colorStrips" id=color' + paintingIdentifier + "_" + i +'></div>');
        // set color of strip
        $("#colorBarsContainer" + '>#bar' + paintingIdentifier + '>#color' + paintingIdentifier + "_" + i).css({'background-color':colors[i].hex});
    }

    d3.select("#colorBarsContainer" + '>#bar' + paintingIdentifier)
      .on("mouseenter", function() {
        //Handle the change in color for the date of the painting
        d3.select(this).select(".labels_small")
                       .select("#dateLabel")
                       .style("color", "#E50099");

        var title = null;
        var subtitle = null;

        var newIdentifier = paintingIdentifier.split('_').join('-').toLowerCase();

        var d3Image = d3.select("#comprehensive")
                         .selectAll("image")
                         .filter(function(d){
                          if (d.artObject.objectNumber.toLowerCase() == newIdentifier){
                            //console.log(d.artObject);
                            if (d.artObject.label.title!=null){
                              title = d.artObject.label.title;
                              subtitle = d.artObject.label.makerLine;
                            }
                            else{
                              title = d.artObject.title;
                              subtitle = d.artObject.principalOrFirstMaker+" ("+d.artObject.dating.yearEarly+"-"+d.artObject.dating.yearLate+"), "+d.artObject.physicalMedium;
                            }
                            return true;
                          }
                          else{
                            return false;
                          }
                         })
                         ;

        d3.select("#paintingTitle").html(title);
        d3.select("#paintingArtist").html(subtitle);
        d3.select("#paintingTitle").style("color", "white");
        d3.select("#paintingArtist").style("color", "white");

        d3.select(d3Image.node().parentNode).select("rect")
                                             .style("width", "0");

       d3.select(d3Image.node().parentNode).select("image")
                                           .style("opacity", 1);


        var d3Mult = d3.selectAll(".smallMultSVGs")
                        .selectAll("image")
                         .filter(function(d){
                          if (d.artObject.objectNumber.toLowerCase() == newIdentifier){
                            return true;
                          }
                          else{
                            return false;
                          }
                         });

        d3.select(d3Mult.node().parentNode).select("rect")
                                             .style("stroke", "#E50099");
        d3.select(d3Mult.node().parentNode.parentNode.parentNode.parentNode)
                                              .select(".labels_small")
                                              .select("label")
                                             .style("color", "#E50099");



    })
      .on("mouseleave", function() {
        d3.select("#paintingTitle").style("color", "black");
        d3.select("#paintingArtist").style("color", "black");

        d3.select(this).select(".labels_small")
                       .select("#dateLabel")
                       .style("color", "white");

        var newIdentifier = paintingIdentifier.split('_').join('-').toLowerCase();

        var d3Image = d3.select("#comprehensive")
                         .selectAll("image")
                         .filter(function(d){
                          if (d.artObject.objectNumber.toLowerCase() == newIdentifier){
                            return true;
                          }
                          else{
                            return false;
                          }
                         })
                         ;

        d3.select(d3Image.node().parentNode).select("rect")
                                             .style("width", function(d){
                                                d.savedWidth;
                                           });

       d3.select(d3Image.node().parentNode).select("image")
                                           .style("opacity", 0.004);


        var d3Mult = d3.selectAll(".smallMultSVGs")
                        .selectAll("image")
                         .filter(function(d){
                          if (d.artObject.objectNumber.toLowerCase() == newIdentifier){
                            return true;
                          }
                          else{
                            return false;
                          }
                         });

        d3.select(d3Mult.node().parentNode).select("rect")
                                             .style("stroke", "white");
        d3.select(d3Mult.node().parentNode.parentNode.parentNode.parentNode)
                                              .select(".labels_small")
                                              .select("label")
                                             .style("color", "white");

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



// PIERRE'S CODE FOR MAIN DIMENSIONS: COMPREHENSIVE VIEW

function getDimByType(dimArray,dimType) {
  return dimArray.filter(
      function(element){ return element.type == dimType; }
  );
}
