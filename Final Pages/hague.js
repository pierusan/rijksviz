var POPUP_IMAGE_HEIGHT = 300;
var LENGTH_COLOR_BARS = 625;

var hagueDataUrl = "Data/hague.json";
var hagueEra = "firstGeneration";

var imagesFolder = "Data/Images/"

var nbWithoutDim = 0;

var xAxisHeight = 0;
var yAxisWidth = 0;

var dimTotH = 130;
var dimTotW = 200;

// TODO:
// show if on display or not
// create ALL artists filter
// hover tool tip instead of drop down

var paintersData = [];
var cnt = [];
var ready = [];

//TODO: where is Eagles on the Cliffs by Jan Fijt in 1857 coming from???
var painters = [//Wikipedia Forerunners

                // "Johannes+Warnardus+Bilders", //not the culprit for jan fijt issue
                // "Barend+Cornelis+Koekkoek", //not the culprit for jan fijt issue
                // "Andreas+Schelfhout", //not the culprit for jan fijt issue
                // "Hendrikus+van+de+Sande+Bakhuyzen",
                // "Bartholomeus+Johannes+van+Hove",
                // //"Hubertus+van+Hove",
                // //"Jacob+Jan+van+der+Maaten",
                // "Charles+Rochussen",
                // //"Pieter+Frederik+van+Os",
                // "Antonie+Waldorp",

                //Wikipedia First Generation
                "David+Adolph+Constant+Artz",
                "Gerard+Bilders",
                "Johannes+Bosboom", //not the culprit for jan fijt issue
                "Johannes+Hubertus+Leonardus+de+Haas", //not the culprit for jan fijt issue
                "Paul%20Joseph%20Constantin%20Gabriël", //not the culprit for jan fijt issue // culprit for other issue tho
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


$(document).ready(function() {
  d3.select("#paintingTitle").style("color", "black");
  d3.select("#paintingArtist").style("color", "black");

   // run code
   RunAll();

   // checkboxes to filter by artists clicked
   $(".checkboxes").click(function(){
      alert('what>');
      var artist = $(this).next('label').text();
      alert(artist);
      // user checks the box, show all of their color bars
      if (this.checked){
         $('#colorBarsContainer>.colorBars').each(function() {
            if ($(this).data('imageArtist') === artist){
               $(this).removeClass("hidden");
            }
         });
      }
      // user unchecks the box, hide all of their color bars
      else {
         $('#colorBarsContainer>.colorBars').each(function() {
            if ($(this).data('imageArtist') === artist){
               $(this).addClass("hidden");
            }
         });
         // collapse popups if present for that artist
         // $("#colorBarsContainer>.barPopups").each(function() {
         //    if ($(this).hasClass(artist.split(' ').join('').toLowerCase())){
         //       $(this).addClass('hidden');
         //       // above line doesn't work on its own bc image set to display: block, so additional hide needed
         //       $(this).hide();
         //    }
         // });
      }
   });

   // color bar clicked
   $("#colorBarsContainer").on("click", ".colorBars", function(){
      // get id number from string id
      var paintingID = this.id.substring(3);
      console.log("HELLO");
      console.log(paintingID);
      // if (!($("#barPopup" + paintingID).hasClass('hidden'))){
      //    HidePopup(paintingID);
      // }
      // else{
      //    ShowPopup($(this), paintingID);
      // }
   });

    // color bar mouse entered
   $(".colorBars").mouseenter(function(){
      // get id number from string id
      var paintingID = this.id.substring(3);
      console.log("HELLO");
      console.log(paintingID);
      // if (!($("#barPopup" + paintingID).hasClass('hidden'))){
      //    HidePopup(paintingID);
      // }
      // else{
      //    ShowPopup($(this), paintingID);
      // }
   });

});


// When the user clicks on <div>, open the popup
function learnMorePopup() {
    var popup = document.getElementById("learnHague");
    popup.classList.toggle("hidden");
}


/*
   Gather data and display.
*/
function RunAll(){
  d3.json(hagueDataUrl, function (json) {
    console.log("LOCAL DATA");
    console.log(json);
    var myData = json.hague[hagueEra];
    console.log(myData);
    paintersData = myData;
    DisplayData([]);
  });

  /*

   // set up colors
   for (var i = 0; i < painters.length; i++){
      paintersData.push([]);
      cnt.push(-1);
      ready.push(false);
      // run a search for each painter
      AdvSearch("", "painting", ""+painters[i], "True", "", "", "True", "", "", "", i);
   }
   DisplayData(ready);

   */

}


/*
   Create URL for specific search as designated in parameters (Step 1).
*/
function AdvSearch(queryID, typeID, invMakerID, imgOnlyID, datingPeriodID, titleID, onDisplayID, sortID, acqID, colorID, index){
   // progress bar
   var progressBar = d3.select("#myProgress")
      .append("div")
      .classed("myBar", "true")
      .attr("id", "myBar"+index)
      .style("width", 0 + '%');

   // make URL with provided input text
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
      cnt[index] = json.count;
      // sort through the number of pages
      for ( j = 1; j < Math.floor( (parseInt(json.count) - 1) / nbInOnePage) +2; j++){
         var pageUrl = piecesUrl+"&p="+j;
         SearchPage(pageUrl, j, nbInOnePage, index);
      }
   });

   CheckArtistDataReady(index, progressBar);
}


/*
   Go through each API page (Step 2).
*/
function SearchPage(pageUrl, pageNb, nbInOnePage, index){
   d3.json(pageUrl, function (json2) {
      var pageData = json2;

      for (var i = 0; i < parseInt(pageData.artObjects.length); i++){
         // creating unique identfier for each painting (image + info)
         var realNb = nbInOnePage * (pageNb-1) + i;
         SearchPainting(pageData.artObjects[i].objectNumber, realNb, index);
      }
   });
}


/*
   Go through each painting on current page and add to paintersData array (Step 3).
*/
function SearchPainting(objNumber, nb, index){
   var url = "https://www.rijksmuseum.nl/api/en/collection/"+objNumber+"?key=rgAMNabw&format=json";
   d3.json(url, function (json) {
      var paintingData = json;
      if (!paintingData.artObject.hasImage){
         return;
      }
      paintersData[index].push(paintingData);
   });
}


/*
   Check data all filled in for 1 artist array of paintings in the paintersData array (Step 4).
*/
function CheckArtistDataReady(index, progressBar){
   if (cnt[index] > 0){
      var ratio = paintersData[index].length / cnt[index] * 100;
      progressBar.style("width",ratio + '%');
   }
   while(paintersData[index].length != cnt[index]){
      setTimeout(function() {
                  CheckArtistDataReady(index, progressBar);
              },500); // run donothing after 0.5 seconds
      return;
   }
   ready[index] = true;
}


/*
   Check data all filled in for all artist arrays in the paintersData array and DISPLAY! (Step 5).
*/
function DisplayData(readyArray){
   var allReady = true;
   for (var i = 0; i < readyArray.length; i++){
      if (!readyArray[i]){
         allReady = false;
      }
   }
   while(!allReady){
      setTimeout(function() {
                  DisplayData(readyArray);
              },500); // run donothing after 0.5 seconds
      return;
   }
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
      DisplayPaintingColorInfo(allPaintings[i]);
   }
   // create big dimensions display
   DisplayAllPaintingsDimensions(allPaintings, "#comprehensive", "comprehensiveSVG", "", 600, 600, true, ".3", "white");
   // create small multiples display
   var artistDict = CreateArtistDict(allPaintings);
   //DisplayAllPaintingsDimensions(artistDict['Jacob Maris'], "#artistCheckboxesContainer", "smallMultSVG");
   var artistCounter = 0;
   for (var artist in artistDict) {
      // make a filter/checkbox for each painter
      artistCounter++;
      //console.log(artistCounter);
      CreateSmallMultFilters(artist, artistCounter);
      DisplayAllPaintingsDimensions(artistDict[artist], "#smallMult_" + artistCounter, "smallMultSVG_" + artistCounter, "smallMultSVGs", 100, 90, false, "2", "white");
   }
   //DisplaySmallMultDimensions();
}

/*
   Create a dictionary where each key is an artist and the value is an array of all of the painting objects.
*/
function CreateArtistDict(allPaintings){
  var artistDict = {};
  //var everyArtist = [];
  for (var i = 0; i < allPaintings.length; i++) {
    var currentArtist = allPaintings[i].artObject.principalMaker;
    // artist not previously added
    if (!artistDict[currentArtist]) {
        artistDict[currentArtist] = [];
    }
    artistDict[currentArtist].push(allPaintings[i]);
  }
  return artistDict;
}

/*
    Creates image, div containers, and then runs methods to create full display for 1 painting (Step 6).
    @param Data for 1 painting.
*/
function DisplayPaintingColorInfo(paintingData){
   var painting = paintingData.artObject;
   if (!painting.hasImage){
      return;
   }
   if (painting.hasImage && painting.copyrightHolder == null){
      if (painting.webImage != null) {
         var id = painting.objectNumber.split('-').join('_');
         // create 1 bar div if not created already (added if statement bc problems with duplicate )
         if(document.getElementById("bar" + id) == null){
            // TODO wtf fix this
            if ("SK_A_2381" == id){
               console.log(paintingData);
            }
            $("#colorBarsContainer").append('<div class="colorBars" id=bar' + id + '></div>');
            // create another div for image popup that will drop down on click
            // $("#colorBarsContainer").append('<div class="barPopups hidden" id=barPopup' + id + '></div>');
         }

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
            //DisplayColors(imagePixelData, id, painting.title, painting.principalMaker, painting.dating.sortingDate, painting.webImage.url);
            DisplayColors(imagePixelData, id, painting.title, painting.principalMaker, painting.dating.sortingDate, imagesFolder+painting.objectNumber.toLowerCase()+".jpg");
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
    $("#colorBarsContainer" + '>#bar' + paintingIdentifier).append('<div class="dates labels" id="date' + paintingIdentifier + '_' + i +'"><div id="dateLabel">' + imageDate + '</div></div>');
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
        d3.select(this).select(".labels")
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
                                              .select(".labels")
                                              .select("label")
                                             .style("color", "#E50099");



    })
      .on("mouseleave", function() {
        d3.select("#paintingTitle").style("color", "black");
        d3.select("#paintingArtist").style("color", "black");

        d3.select(this).select(".labels")
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
                                              .select(".labels")
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


/*
    Toggle! Animated display of paiting image, title, and artist when the user clicks the color bar.
    @param Jquery Object of clicked color bar div.
    @param Painting number (from 0 to # of paintings - 1).
*/
// function ShowPopup(colorBarDiv, paintingID){
//     // if there is NOT already an image in this div
//     if (!($("#barPopup" + paintingID).find('img').length)) {
//         // get data and append image
//         var imgURL = colorBarDiv.data('imageURL');
//         var imgTitle = colorBarDiv.data('imageTitle');
//         var imgArtist = colorBarDiv.data('imageArtist');
//         var imgDate = colorBarDiv.data('imageDate');
//         var artistClass = imgArtist.split(' ').join('').toLowerCase();
//         console.log(artistClass);
//         $("#barPopup" + paintingID).addClass(artistClass);
//         $("#barPopup" + paintingID).append('<div class="imageContainers" id="imageContainer' +
//             paintingID + '"><img class="images" id="image"' + paintingID + ' src=' + imgURL + ' /></div>');
//         $("#barPopup" + paintingID + ">.imageContainers>.images").attr('alt', imgTitle);
//         $("#barPopup" + paintingID + ">.imageContainers>.images").css('height', POPUP_IMAGE_HEIGHT);
//         // append text data
//         $("#barPopup" + paintingID).append('<div class="descriptionContainers" id=descriptionContainer' +
//             paintingID + '><div class="descriptions"><p class="title">' + imgTitle + '</p><p class="artist">' + imgArtist + '</p><p class="date">' + imgDate + '</p></div></div>');
//     }
//     // animate
//     $("#barPopup" + paintingID).slideDown( "slow", function() {});
//     $("#barPopup" + paintingID).removeClass('hidden');
// }


/*
   Toggle! Animated hide of paiting image, title, and artist when the user clicks the color bar.
   @param Painting number (from 0 to # of paintings - 1).
*/
// function HidePopup(paintingID){
//     $("#barPopup" + paintingID).slideUp( "slow", function() {});
//     $("#barPopup" + paintingID).addClass('hidden');
// }


/*
   Create a checkbox for each artist so users can filter.
   @param String of artist name that contains extra characters necessary for API search.
   @param int index
*/
function CreateSmallMultFilters(artistLabel, numArtist){
   // var artistLabel = artist.split('+').join(' ');
   // artistLabel = artistLabel.split('%20').join(' ');
   // $("#smallMultiplesContainer").append('</div>');
   $("#smallMultiplesContainer").append('<div class="smallMults" id="smallMult_' + numArtist + '">' +
        '<div class="checkboxContainers labels"><input type="checkbox" id="checkbox' + numArtist + '" class="checkboxes">' +
              '<label for="checkbox' + numArtist +'"><br>' + artistLabel + '</label></div></div>');
   $('#smallMultiplesContainer>.smallMults>.checkboxContainers>.checkboxes').prop('checked', true);
}



// PIERRE'S CODE FOR MAIN DIMENSIONS: COMPREHENSIVE VIEW

function getDimByType(dimArray,dimType) {
  return dimArray.filter(
      function(element){ return element.type == dimType; }
  );
}

function DisplayAllPaintingsDimensions(aggregateData, div, divID, divClass, initSvgWidth, initSvgHeight, hoverShowImageOn, strokeWidth, strokeColor){
  console.log(aggregateData);

  d3.select(div)
      .append("svg")
      .attr("id", divID)
      .attr("class", divClass);

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

  var thisSvg = d3.select("#" + divID)
                  .attr("width", initSvgWidth)
                  .attr("height", initSvgHeight)
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("id", "svg");

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
                          return 0.004;
                        })
                        .attr("xlink:href", function(d){
                          if (d.artObject.webImage == null){
                            return null;
                          }
                          return imagesFolder+d.artObject.objectNumber.toLowerCase()+".jpg";
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
                         // .style("opacity", function(d){
                         //   if (aggregateData.length < 250){
                         //      return 1 / aggregateData.length;
                         //   }
                         //   else{
                         //     console.log(d.opToUse);
                         //     return d.opToUse;
                         //   };
                         // })
                         .style("fill", "none")
                         .attr('stroke-width', strokeWidth)
                         .attr('stroke', strokeColor);



    groupes.on("mouseover", function() { if(hoverShowImageOn){
                                          var identifier = null;
                                          var title = null;
                                          var subtitle = null;

                                         d3.select(this)
                                           .select("rect")
                                           .style("width", "0");
                                         d3.select(this)
                                           .select("image")
                                           .style("opacity", function(d){
                                            identifier = d.artObject.objectNumber;
                                            if (d.artObject.label.title!=null){
                                              title = d.artObject.label.title;
                                              subtitle = d.artObject.label.makerLine;
                                            }
                                            else{
                                              title = d.artObject.title;
                                              subtitle = d.artObject.principalOrFirstMaker+" ("+d.artObject.dating.yearEarly+"-"+d.artObject.dating.yearLate+"), "+d.artObject.physicalMedium;
                                            }
                                            return 1;
                                           });

                                        d3.select("#paintingTitle").html(title);
                                        d3.select("#paintingArtist").html(subtitle);
                                        d3.select("#paintingTitle").style("color", "white");
                                        d3.select("#paintingArtist").style("color", "white");

                                        var d3Mult = d3.selectAll(".smallMultSVGs")
                                                    .selectAll("image")
                                                     .filter(function(d){
                                                      if (d.artObject.objectNumber.toLowerCase() == identifier.toLowerCase()){
                                                        return true;
                                                      }
                                                      else{
                                                        return false;
                                                      }
                                                     });

                                        d3.select(d3Mult.node().parentNode).select("rect")
                                                                             .style("stroke", "#E50099");
                                        d3.select(d3Mult.node().parentNode.parentNode.parentNode.parentNode)
                                                                              .select(".labels")
                                                                              .select("label")
                                                                             .style("color", "#E50099");

                                        var kateIdentifier = identifier.split('-').join('_');
                                        var barId = "bar"+kateIdentifier;
                                        d3.select("#"+barId)
                                          .select(".labels")
                                          .select("#dateLabel")
                                          .style("color", "#E50099");

                                        }})

            .on("mouseout", function() { var identifier = null;

                                        d3.select("#paintingTitle").style("color", "black");
                                        d3.select("#paintingArtist").style("color", "black");

                                        d3.select(this)
                                           .select("rect")
                                           .style("width", function(d){
                                                d.savedWidth;
                                           });
                                         d3.select(this)
                                           .select("image")
                                           .style("opacity", function(d){
                                            identifier = d.artObject.objectNumber;
                                            return 0.004;
                                          });

                                        var d3Mult = d3.selectAll(".smallMultSVGs")
                                                .selectAll("image")
                                                 .filter(function(d){
                                                  if (d.artObject.objectNumber.toLowerCase() == identifier.toLowerCase()){
                                                    return true;
                                                  }
                                                  else{
                                                    return false;
                                                  }
                                                 });

                                        d3.select(d3Mult.node().parentNode).select("rect")
                                                                             .style("stroke", "white");
                                        d3.select(d3Mult.node().parentNode.parentNode.parentNode.parentNode)
                                                                              .select(".labels")
                                                                              .select("label")
                                                                             .style("color", "white");

                                        var kateIdentifier = identifier.split('-').join('_');
                                        var barId = "bar"+kateIdentifier;
                                        d3.select("#"+barId)
                                          .select(".labels")
                                          .select("#dateLabel")
                                          .style("color", "white");

          });

}

// PIERRE'S CODE FOR MAIN DIMENSIONS: COMPREHENSIVE VIEW
