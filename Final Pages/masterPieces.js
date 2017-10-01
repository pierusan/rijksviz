var numberOfPaintings;
var runningOrder = [];
var paintingsRevealed = 0;
var mapUrl = "Data/amsterdamMapSave.svg"; // Path for Amsterdam Vectorized Map
var mapRatio = 1; // Dimensions ratio of the map
var mapWidth = 740.; // Desired width for the map
var resizingFactor = 1; // Factor used when resizing the map to fit the webpage
var numberOfPaths = 10;
var mapSvg = null; // SVG element for the map
var animationGroup = null; // Group withing the svg where the pixels will flow;
var imagesFolder = "Data/ImagesResized90/"; // Path where the images of the masterpieces are saved
var numberOfPixelsUsed = 600; // Numbe Of Pixels we will actually use from the painting web image
var batchSize = 120.;
var delayBtwBatches = 4500;
var finalImageSvg = null;
var finalPixGroup = null; // Group within the bigger svg where the pixels are gonna lie;
var imagePlaceHolder = null; // Rectangle where the pixels will end to form the painting image
var imageMaxEdge = 600; // Maximum edge length of the displayed image in our Svg
var placeHolderOffsetX = 50; // Horizontal padding of the image placeholder
var placeHolderOffsetY = 60; // Vertical padding of the image placeholder
var placeHolderWidth = 0;
var placeHolderHeight = 0;
var titlesPlaceHolder = null;
var titlesOffsetX = 40;
var titlesOffsetY = 700;
var subtitleOffsetY = 20;
var floatingPixDims = {"width": 15, "height": 15}; // Dimensions of the pixels floating in the canals
var verticalOffsetRange = 5; //Vertical
var delayBtwPix = 22; // delay between the start of every floating pixel
var pathDuration = 4000; //Duration of the move along the path
var finalMoveDuration = 2000; //Duration of the move ot the painting
var pixelFinalSize = 0;
var nbPixelInPlace = 0;
var fadingOutDuration = 2000;
var fadingOutDelay = 1000;
var imageBg = "#191919";
var imageBorder= "black";
var rectBorder = "#555555";

//Populate our array with the masterpieces data
var masterPieces = [];
masterPieces.push({"index": 0,
                    "imageWidth": 2261, "imageHeight": 2548,
                    "title": "The Milkmaid", "subtitle": "Johannes Vermeer (1632–1675), oil on canvas, c. 1660",
                    "id":"sk-a-2344",
                    "pathNumber": 1});
masterPieces.push({"index": 1,
                    "imageWidth": 2655, "imageHeight": 3000,
                    "title": "Girl in a Large Hat", "subtitle": "Cesar Boetius van Everdingen (1617–1678), oil on canvas, c. 1645–1650",
                    "id":"sk-a-5005",
                    "pathNumber": 0});
masterPieces.push({"index": 2,
                    "imageWidth": 2500, "imageHeight": 2034,
                    "title": "Night Watch", "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on canvas, 1642",
                    "id":"sk-c-5",
                    "pathNumber": 0});
masterPieces.push({"index": 3,
                    "imageWidth": 2852, "imageHeight": 2211,
                    "title": "The Merry Family", "subtitle": "Jan Havicksz Steen (c. 1625–1679), oil on canvas, 1668",
                    "id":"sk-c-229",
                    "pathNumber": 0});
masterPieces.push({"index": 4,
                    "imageWidth": 2940, "imageHeight": 1998,
                    "title": "The Massacre of the Innocents", "subtitle": "Cornelis Cornelisz van Haarlem (1562–1638), oil on canvas, 1590",
                    "id":"sk-a-128",
                    "pathNumber": 0});
masterPieces.push({"index": 5,
                    "imageWidth": 2916, "imageHeight": 2459,
                    "title": "The Threatened Swan", "subtitle": "Jan Asselijn (1610–1652), oil on canvas, c. 1650",
                    "id":"sk-a-4",
                    "pathNumber": 0});
masterPieces.push({"index": 6,
                   "imageWidth":1901, "imageHeight": 3000,
                   "title": "Portrait de Marten Soolmans",
                   "subtitle": "Rembrandt van Rijn (1606-1669), huile sur toile, 1634",
                   "id":"sk-a-5033",
                   "pathNumber": 0});
masterPieces.push({"index": 7,
                   "imageWidth": 1872, "imageHeight": 3000,
                   "title": "Portrait of Oopjen Coppit",
                   "subtitle": "Rembrandt van Rijn (1606-1669), oil on canvas, 1634",
                   "id":"sk-c-1768",
                   "pathNumber": 0});
masterPieces.push({"index": 8,
                   "imageWidth": 2032, "imageHeight": 2500,
                   "title": "The Merry Fiddler",
                   "subtitle": "Gerard van Honthorst (1592–1656), oil on canvas, 1623",
                   "id":"sk-a-180",
                   "pathNumber": 0});
masterPieces.push({"index": 9,
                   "imageWidth": 2535, "imageHeight": 2622,
                   "title": "Girl in a White Kimono",
                   "subtitle": "George Hendrik Breitner (1857-1923), oil on canvas, 1894",
                   "id":"sk-a-3584",
                   "pathNumber": 0});
masterPieces.push({"index": 10,
                   "imageWidth": 1904, "imageHeight": 2424,
                   "title": "Floral Still Life",
                   "subtitle": "Hans Bollongier (c. 1598–1672), oil on panel, 1639",
                   "id":"sk-a-799",
                   "pathNumber": 0});
masterPieces.push({"index": 11,
                   "imageWidth": 1767, "imageHeight": 2748,
                   "title": "In the Month of July",
                   "subtitle": "Paul Joseph Constantin Gabriël (1828–1903), oil on canvas, c. 1889",
                   "id":"sk-a-1505",
                   "pathNumber": 0});
masterPieces.push({"index": 12,
                   "imageWidth": 2880, "imageHeight": 1897,
                   "title": "The Singel Bridge at the Paleisstraat in Amsterdam",
                   "subtitle": "George Hendrik Breitner (1857–1923), oil on canvas, 1896",
                   "id":"sk-a-3580",
                   "pathNumber": 0});
masterPieces.push({"index": 13,
                   "imageWidth": 2096, "imageHeight": 2500,
                   "title": "The Burgomaster of Delft and his Daughter",
                   "subtitle": "Jan Havicksz Steen (c. 1625–1679), oil on canvas, 1655",
                   "id":"sk-a-4981",
                   "pathNumber": 0});
masterPieces.push({"index": 14,
                   "imageWidth": 2097, "imageHeight": 2700,
                   "title": "Portrait of Jacob Cornelisz van Oostsanen",
                   "subtitle": "workshop of Jacob Cornelisz van Oostsanen, alias Jacob War van Amsterdam (c. 1472/77– in or before 1533), Amsterdam, 1533?, oil on panel",
                   "id":"sk-a-1405",
                   "pathNumber": 0});
masterPieces.push({"index": 15,
                   "imageWidth": 2833, "imageHeight": 2465,
                   "title": "Mary Magdalene",
                   "subtitle": "Jan van Scorel (1495–1562), Haarlem?, c. 1530, oil on panel",
                   "id":"sk-a-372",
                   "pathNumber": 0});
masterPieces.push({"index": 16,
                   "imageWidth": 2500, "imageHeight": 1655,
                   "title": "The Battle of Waterloo",
                   "subtitle": "Jan Willem Pieneman (1779-1853), oil on canvas, 1824",
                   "id":"sk-a-1115",
                   "pathNumber": 0});
masterPieces.push({"index": 17,
                   "imageWidth": 1812, "imageHeight": 2500,
                   "title": "William I, Prince of Oranje",
                   "subtitle": "Adriaen Thomasz Key (c. 1544–1589), oil on panel, c. 1579",
                   "id":"sk-a-3148",
                   "pathNumber": 0});
masterPieces.push({"index": 18,
                   "imageWidth": 1791, "imageHeight": 2500,
                   "title": "Portrait of Alida Christina Assink",
                   "subtitle": "Jan Adam Kruseman (1804–1862), oil on canvas, 1833",
                   "id":"sk-c-1672",
                   "pathNumber": 0});
masterPieces.push({"index": 19,
                   "imageWidth": 2181, "imageHeight": 2682,
                   "title": "The Little Street",
                   "subtitle": "Johannes Vermeer (1632-1675), oil on canvas, c. 1660",
                   "id":"sk-a-2860",
                   "pathNumber": 0});
masterPieces.push({"index": 20,
                   "imageWidth": 2181, "imageHeight": 2682,
                   "title": "The Little Street",
                   "subtitle": "Johannes Vermeer (1632-1675), oil on canvas, c. 1660",
                   "id":"sk-a-2860",
                   "pathNumber": 0});
masterPieces.push({"index": 21,
                   "imageWidth": 2502, "imageHeight": 3000,
                   "title": "Woman Reading a Letter",
                   "subtitle": "Johannes Vermeer (1632–1675), oil on canvas, c. 1663",
                   "id":"sk-c-251",
                   "pathNumber": 0});
masterPieces.push({"index": 22,
                   "imageWidth": 2481, "imageHeight": 2508,
                   "title": "The Square Man",
                   "subtitle": "Karel Appel (1921–2006), oil on canvas, 1951",
                   "id":"sk-a-5002",
                   "pathNumber": 0});
masterPieces.push({"index": 23,
                   "imageWidth": 2946, "imageHeight": 1656,
                   "title": "The Fête champêtre",
                   "subtitle": "Dirck Hals (1591–1656), oil on panel, 1627",
                   "id":"sk-a-1796",
                   "pathNumber": 0});
masterPieces.push({"index": 24,
                   "imageWidth": 2500, "imageHeight": 1308,
                   "title": "Fishing for Souls",
                   "subtitle": "Adriaen Pietersz van de Venne (c. 1589–1662), oil on panel, 1614",
                   "id":"sk-a-447",
                   "pathNumber": 0});
masterPieces.push({"index": 25,
                   "imageWidth": 2500, "imageHeight": 1551,
                   "title": "View of Olinda, Brazil",
                   "subtitle": "Frans Post (1612–1680), oil on canvas, 1662",
                   "id":"sk-a-742",
                   "pathNumber": 0});
masterPieces.push({"index": 26,
                   "imageWidth": 2928, "imageHeight": 1691,
                   "title": "Winter Landscape with Ice Skaters",
                   "subtitle": "Hendrick Avercamp (1585–1634), oil on panel, c. 1608",
                   "id":"sk-a-1718",
                   "pathNumber": 0});
masterPieces.push({"index": 27,
                   "imageWidth": 2031, "imageHeight": 2676,
                   "title": "Portrait of a Woman",
                   "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on panel, 1639",
                   "id":"sk-c-597",
                   "pathNumber": 0});
masterPieces.push({"index": 28,
                   "imageWidth": 2190, "imageHeight": 2699,
                   "title": "Portrait of a Girl Dressed in Blue",
                   "subtitle": "Johannes Cornelisz Verspronck (c. 1600–1662), oil on canvas, 1641",
                   "id":"sk-a-3064",
                   "pathNumber": 0});
masterPieces.push({"index": 29,
                   "imageWidth": 2500, "imageHeight": 1034,
                   "title": "Banquet at the Crossbowmen’s Guild in Celebration of the Treaty of Münster",
                   "subtitle": "Bartholomeus van der Helst (1613–1670), oil on canvas, 1648",
                   "id":"sk-c-2",
                   "pathNumber": 0});
masterPieces.push({"index": 30,
                   "imageWidth": 2593, "imageHeight": 2514,
                   "title": "The Paternal Admonition",
                   "subtitle": "Gerard ter Borch (1617–1681), oil on canvas, c. 1654",
                   "id":"sk-a-404",
                   "pathNumber": 0});
masterPieces.push({"index": 31,
                   "imageWidth": 2254, "imageHeight": 2646,
                   "title": "The Merry Drinker",
                   "subtitle": "Frans Hals (c. 1582–1666), oil on canvas, c. 1628–1630",
                   "id":"sk-a-135",
                   "pathNumber": 0});
masterPieces.push({"index": 32,
                   "imageWidth": 2287, "imageHeight": 2724,
                   "title": "Self Portrait as the Apostle Paul",
                   "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on canvas, 1661",
                   "id":"sk-a-4050",
                   "pathNumber": 0});
masterPieces.push({"index": 33,
                   "imageWidth": 2500, "imageHeight": 1937,
                   "title": "Still Life with a Gilt Cup",
                   "subtitle": "Willem Claesz Heda (1594–1680), oil on panel, 1635",
                   "id":"sk-a-4830",
                   "pathNumber": 0});
masterPieces.push({"index": 34,
                   "imageWidth": 2988, "imageHeight": 2531,
                   "title": "Portrait of a Couple",
                   "subtitle": "Frans Hals (c. 1582–1666), oil on canvas, c. 1622",
                   "id":"sk-a-133",
                   "pathNumber": 0});
masterPieces.push({"index": 35,
                   "imageWidth": 2012, "imageHeight": 2500,
                   "title": "Piano Practice Interrupted",
                   "subtitle": "Willem Bartel van der Kooi (1768-1836), oil on canvas, 1813",
                   "id":"sk-a-1065",
                   "pathNumber": 0});
masterPieces.push({"index": 36,
                   "imageWidth": 2500, "imageHeight": 1645,
                   "title": "Interior of the Sint-Odulphuskerk in Assendelft",
                   "subtitle": "Pieter Jansz Saenredam (1597–1665), oil on panel, 1649",
                   "id":"sk-c-217",
                   "pathNumber": 0});
masterPieces.push({"index": 37,
                   "imageWidth": 2500, "imageHeight": 1846,
                   "title": "Still Life with Cheese",
                   "subtitle": "Floris Claesz van Dijck (1575–1651), oil on panel, c. 1615",
                   "id":"sk-a-4821",
                   "pathNumber": 0});
masterPieces.push({"index": 38,
                   "imageWidth": 2500, "imageHeight": 1402,
                   "title": "River Landscape with Riders",
                   "subtitle": "Aelbert Cuyp (1620–1691), oil on canvas, 1653–1657",
                   "id":"sk-a-4118",
                   "pathNumber": 0});
masterPieces.push({"index": 39,
                   "imageWidth": 2500, "imageHeight": 2177,
                   "title": "A Mother’s Duty",
                   "subtitle": "Pieter de Hooch (1629–c. 1683), oil on canvas, c. 1658–1660",
                   "id":"sk-c-149",
                   "pathNumber": 0});
masterPieces.push({"index": 40,
                   "imageWidth": 2880, "imageHeight": 2376,
                   "title": "The Windmill at Wijk bij Duurstede",
                   "subtitle": "Jacob Isaacksz van Ruisdael (c. 1628–1682), oil on canvas, c. 1668–1670",
                   "id":"sk-c-211",
                   "pathNumber": 0});
masterPieces.push({"index": 41,
                   "imageWidth": 2500, "imageHeight": 1817,
                   "title": "The Jewish Bride",
                   "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on canvas, c. 1665",
                   "id":"sk-c-216",
                   "pathNumber": 0});
masterPieces.push({"index": 42,
                   "imageWidth": 2034, "imageHeight": 2562,
                   "title": "Self-portrait",
                   "subtitle": "Vincent van Gogh (1853–1890), oil on cardboard, 1887",
                   "id":"sk-a-3262",
                   "pathNumber": 0});
masterPieces.push({"index": 43,
                   "imageWidth": 3000, "imageHeight": 1975,
                   "title": "The Syndics",
                   "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on canvas, 1662",
                   "id":"sk-c-6",
                   "pathNumber": 0});
masterPieces.push({"index": 44,
                   "imageWidth": 3000, "imageHeight": 1975,
                   "title": "The Holy Kinship",
                   "subtitle": "workshop of Geertgen tot Sint-Jans (c. 1455/65-1485/95), Haarlem, c. 1495, oil on panel",
                   "id":"sk-a-500",
                   "pathNumber": 0});
masterPieces.push({"index": 45,
                   "imageWidth": 2852, "imageHeight": 2228,
                   "title": "Italian Landscape with a Draughtsman",
                   "subtitle": "Jan Both (1618–1652), oil on canvas, c. 1650–1652",
                   "id":"sk-c-109",
                   "pathNumber": 0});
masterPieces.push({"index": 46,
                   "imageWidth": 1878, "imageHeight": 2500,
                   "title": "Portrait of Gerard Andriesz Bicker",
                   "subtitle": "Bartholomeus van der Helst (1613–1670), oil on panel, c. 1642",
                   "id":"sk-a-147",
                   "pathNumber": 0});
masterPieces.push({"index": 47,
                   "imageWidth": 2145, "imageHeight": 2636,
                   "title": "The Sick Child",
                   "subtitle": "Gabriel Metsu (1629–1667), oil on canvas, c. 1664–1666",
                   "id":"sk-a-3059",
                   "pathNumber": 0});
masterPieces.push({"index": 48,
                   "imageWidth": 2072, "imageHeight": 2564,
                   "title": "Still Life with Asparagus",
                   "subtitle": "Adriaen Coorte (active c. 1683–1707), oil on paper, laid down on panel, 1697",
                   "id":"sk-a-2099",
                   "pathNumber": 0});
masterPieces.push({"index": 49,
                   "imageWidth": 2904, "imageHeight": 2092,
                   "title": "View of the Golden Bend in the Herengracht",
                   "subtitle": "Gerrit Adriaensz Berckheyde (1658-1698), oil on panel, 1671-1672",
                   "id":"sk-a-5003",
                   "pathNumber": 0});
masterPieces.push({"index": 50,
                   "imageWidth": 2022, "imageHeight": 2556,
                   "title": "Portrait of a Member of the Van der Mersch Family",
                   "subtitle": "Cornelis Troost (1696-1750), oil on panel, 1736",
                   "id":"sk-a-3948",
                   "pathNumber": 0});
masterPieces.push({"index": 51,
                   "imageWidth": 2500, "imageHeight": 1846,
                   "title": "The First Day of School",
                   "subtitle": "Jean Baptiste Vanmour (1671-1737), oil on canvas, c. 1720-1737",
                   "id":"sk-a-2005",
                   "pathNumber": 0});
masterPieces.push({"index": 52,
                   "imageWidth": 2903, "imageHeight": 1483,
                   "title": "Children of the Sea",
                   "subtitle": "Jozef Israëls (1824–1911), oil on canvas, 1872",
                   "id":"sk-a-2382",
                   "pathNumber": 0});
masterPieces.push({"index": 53,
                   "imageWidth": 2500, "imageHeight": 1808,
                   "title": "Italian Landscape with Umbrella Pines",
                   "subtitle": "Hendrik Voogd (1768-1839), Rome, 1807, oil on canvas",
                   "id":"sk-a-4688",
                   "pathNumber": 0});
masterPieces.push({"index": 54,
                   "imageWidth": 2118, "imageHeight": 2598,
                   "title": "Self-portrait",
                   "subtitle": "Rembrandt Harmensz van Rijn (1606–1669), oil on panel, c. 1628",
                   "id":"sk-a-4691",
                   "pathNumber": 0});
masterPieces.push({"index": 55,
                   "imageWidth": 2131, "imageHeight": 2708,
                   "title": "Portrait of Don Ramón Satué",
                   "subtitle": "Francisco José de Goya y Lucientes (1746-1828), oil on canvas, 1823",
                   "id":"sk-a-2963",
                   "pathNumber": 0});
masterPieces.push({"index": 56,
                   "imageWidth": 2143, "imageHeight": 1520,
                   "title": "Portraits of Giuliano and Francesco Giamberti da Sangallo",
                   "subtitle": "Piero di Cosimo (1462–1522), Florence, 1482–1485, oil on panel",
                   "id":"sk-c-1367",
                   "pathNumber": 0});
masterPieces.push({"index": 57,
                   "imageWidth": 2500, "imageHeight": 1717,
                   "title": "The Well-stocked Kitchen",
                   "subtitle": "Joachim Beuckelaer (c. 1533?–1575), Antwerp, 1566, oil on panel",
                   "id":"sk-a-1451",
                   "pathNumber": 0});


/*
Other paintings with weird background:
sk-a-3011
sk-a-3841
sk-a-1365
sk-a-2815
*/

$(document).ready(function() {
   /* HEADER LEFT: TITLE & DESCRIPTION DROP DOWN */
   // start hidden
   $(".caret_closed").hide();
   $(".pageDescription").hide();
   // hide description drop down
   $(".caret_expanded").click(function() {
      $(".caret_expanded").hide();
      $(".caret_closed").show();
      $(".pageDescription").slideToggle("slow", function() {});
      $(".information").css("color", "white");
   });
   // drop down
   $(".caret_closed" ).click(function() {
      $(".caret_closed").hide();
      $(".caret_expanded").show();
      $(".pageDescription").slideToggle("slow", function() {});
   });


   /* HEADER RIGHT: HAMBURGER NAVIGATION MENU */
   // start hidden
   $(".cross").hide();
   $(".menu").hide();
   // drop down
   $(".hamburger" ).click(function() {
      $('.hamburger').fadeOut(300, function(){
         $('.cross').fadeIn(300);
         $(".menu").slideToggle("slow", function() {});
      });
   });
   // hide again
   $(".cross").click(function() {
      $(".menu").slideToggle("slow", function() {
         $(".cross").hide();
         $(".hamburger").show();
      });
   });

  //Search the whole collection and display the iceberg at the end
  //advSearch(searchUrl);

});


//Add the local path as image URL
for (var i = 0; i < masterPieces.length; i++){
  masterPieces[i].imageUrl = imagesFolder+masterPieces[i].id+".jpg";
}
console.log(masterPieces);


assignRunningOrder();
//createButtons();
loadMap();
//displayMasterPiece(0);


function assignRunningOrder(){
  numberOfPaintings = d3.max(masterPieces, function (d) {return d.index;}) + 1;
  runningOrder = randomPermutation(numberOfPaintings);
}

function randomPermutation(maxValue){
  // first generate number sequence
    var permArray = new Array(maxValue);
    for(var i = 0; i < maxValue; i++){
        permArray[i] = i;
    }
    // draw out of the number sequence
    for (var i = (maxValue - 1); i >= 0; --i){
        var randPos = Math.floor(i * Math.random());
        var tmpStore = permArray[i];
        permArray[i] = permArray[randPos];
        permArray[randPos] = tmpStore;
    }
    return permArray;
}

function displayRandomMasterPiece(){
  document.getElementById("nextPainting").disabled = true;
  resetPage();
  loadPixels(runningOrder[paintingsRevealed]);
  animateMasterPiece(runningOrder[paintingsRevealed]);
  //loadPixels(42);
  //animateMasterPiece(42);
  paintingsRevealed++;
  paintingsRevealed = paintingsRevealed % numberOfPaintings;
}

function displayMasterPiece(index){
  resetPage();
  loadPixels(index);
  animateMasterPiece(index);
}

function createButtons(){
  d3.select("#masterpieceSelection")
    .selectAll("button")
    .data(masterPieces)
    .enter()
    .append("button")
    .attr("onclick", function(d){
      return "displayMasterPiece("+d.index+")";
    })
    .html(function(d){
      return d.index;
    });
}

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

  //Create the SVG that will contain the final image of the painting
  createImageContainer();

  //Create the Text placeholders
  createTitlesContainer();

  //Create Animation Group in the Svg where the flowing pixels will lie
  animationGroup = mapSvg.append("g")
                          .attr("id", "animationGroup");

  //Create Animation Group in the Svg where the final pixels making the image will lie
  finalPixGroup = d3.select("#svgContainer")
                    .append("g")
                    .attr("id", "finalPixGroup");
}

function resizeMap(scaleFactor){
  mapSvg.attr("width", mapWidth)
        .attr("height", mapWidth / mapRatio);
}

function createImageContainer(){
  placeHolderWidth = parseInt(d3.select("#svgContainer").attr("width")) - mapWidth - 2 * placeHolderOffsetX;
  placeHolderHeight = parseInt(d3.select("#svgContainer").attr("height")) - 2 * placeHolderOffsetY;

  finalImageSvg = d3.select("#svgContainer")
                    .append("svg")
                    .attr("x", mapWidth + placeHolderOffsetX)
                    .attr("y", placeHolderOffsetY)
                    .attr("width", placeHolderWidth + 2 * placeHolderOffsetX)
                    .attr("height", placeHolderHeight);

  imagePlaceHolder = finalImageSvg.append("rect")
                                  .attr("x", 1)
                                  .attr("y", 1)
                                  .attr("width", placeHolderWidth - 2)
                                  .attr("height", placeHolderHeight - 2)
                                  .style("fill", imageBg)
                                  .style("stroke", imageBorder)
                                  .style("opacity", 0);
}

function createTitlesContainer(){
  var titlesX = mapWidth + titlesOffsetX;
  var titlesY = 20;

  titlesPlaceHolder = d3.select("#svgContainer")
                        .append("g")
                        .attr("transform","translate("+titlesX+", "+titlesY+")");

  titlesPlaceHolder.append("text")
                   .attr("x", 0)
                   .attr("y", 0)
                   .classed("h2", true)
                   .style('fill', 'white')
                   .attr("id","masterPieceTitle");

  titlesPlaceHolder.append("text")
                   .attr("x", 0)
                   .attr("y", subtitleOffsetY)
                   .classed("h3", true)
                   .style('fill', 'white')
                   .attr("id","masterPieceSubtitle");
}

function resetPage(){
  imagePlaceHolder.style("opacity", 0);
  finalImageSvg.select("image")
               .remove();
  animationGroup.selectAll("*")
                .remove();
  finalPixGroup.selectAll("*")
               .remove();
  titlesPlaceHolder.style("opacity", 0);

  nbPixelInPlace = 0;
}

function loadPixels(pieceIndex){
  //Load the image and store the pixels in the global masterPieces data array
  if (masterPieces[pieceIndex].colorsArray == null){
    loadImage(masterPieces[pieceIndex].imageUrl, masterPieces[pieceIndex].imageWidth, masterPieces[pieceIndex].imageHeight, pieceIndex);
  }
}

function animateMasterPiece(pieceIndex){
  //Wait for the Pixels to be grabbed
  while (masterPieces[pieceIndex].colorsArray == null){
    //console.log("NOT LOADED YET");
    setTimeout(function(){
      animateMasterPiece(pieceIndex);
    },500);
    return;
  }
  //console.log(masterPieces[pieceIndex].colorsArray);

  var placeholderSize = changePlaceHolderSize(masterPieces[pieceIndex].imageWidth, masterPieces[pieceIndex].imageHeight);
  pixelFinalSize = getPixSize(pieceIndex, placeholderSize);
  var pixels = createPix(pieceIndex);
  animatePix(pixels, masterPieces[pieceIndex].pathNumber);
  //console.log(placeholderSize);
  revealPainting(pixels.size(), pieceIndex, placeholderSize);
}

function changePlaceHolderSize(w, h){
  imagePlaceHolder.transition().duration(1000).style("opacity", 1);
  if (w > h){
    imagePlaceHolder.attr("width", imageMaxEdge)
                     .attr("height", imageMaxEdge * h / w);
    return {"width": imageMaxEdge, "height": imageMaxEdge * h / w};
  }
  else{
    imagePlaceHolder.attr("height", imageMaxEdge)
                     .attr("width", imageMaxEdge * w / h);
    return {"height": imageMaxEdge, "width": imageMaxEdge * w / h};
  }

}

/*
  Returns the dimensions of the rectangles representing the "pixels"
*/
function getPixSize(pieceIndex, placeholderSize){
  var nbOfColumns = d3.max(masterPieces[pieceIndex].colorsArray, function (d) {return d.column;}) + 1;
  var nbOfRows = d3.max(masterPieces[pieceIndex].colorsArray, function (d) {return d.row;}) + 1;
  return {"width": placeholderSize.width / nbOfColumns * 1.0, "height": placeholderSize.height / nbOfRows * 1.0};
}

function createPix(pieceIndex){
  //Add the random offset
  addDataForPixels(pieceIndex);

  //Create the rectangles for the floating pixels;
  var floatingPixels = animationGroup.selectAll("rect")
                                      .data(masterPieces[pieceIndex].colorsArray)
                                      .enter()
                                      .append("rect")
                                        .attr("width", floatingPixDims.width)
                                        .attr("height", floatingPixDims.height)
                                        .attr("x", 0)
                                        .attr("y", 0)
                                        .attr("id", function(d,i){
                                          return "pixel"+i;
                                        })
                                        .style("fill", function(d){
                                          return d.hex;
                                        })
                                        .style("stroke", rectBorder)
                                        .style("opacity", 0);

  //Create the rectangles for the final pixels
  finalPixGroup.selectAll("rect")
                .data(masterPieces[pieceIndex].colorsArray)
                .enter()
                .append("rect")
                  .attr("width", floatingPixDims.width)
                  .attr("height", floatingPixDims.height)
                  .attr("x", 0)
                  .attr("y", 0)
                  .attr("id", function(d,i){
                    return "finalPixel"+i;
                  })
                  .style("fill", function(d){
                    return d.hex;
                  })
                  .style("opacity", 0);

   return floatingPixels;
}

function addDataForPixels(pieceIndex){
  var randomPath = [];
  for (var j = 0; j < Math.floor( (masterPieces[pieceIndex].colorsArray.length - 1) / batchSize) + 1; j++){
    randomPath.push(Math.floor(Math.random() * numberOfPaths));
  }

  //console.log(randomPath);

  for (var i = 0; i < masterPieces[pieceIndex].colorsArray.length; i++){
      //Add random offset between -1 and +1
      masterPieces[pieceIndex].colorsArray[i].offset = Math.random() * 2 - 1;

      //Add delay based on the the index in the array
      masterPieces[pieceIndex].colorsArray[i].delay = i * delayBtwPix + Math.floor(i / batchSize) * delayBtwBatches;

      //Add a path followed by the pixels
      masterPieces[pieceIndex].colorsArray[i].pathNumber = randomPath[Math.floor(i / batchSize)];
  }
}

function animatePix(pixels, pathNumber){
  pixels.transition()
             .delay(function(d){
               //console.log(d.delay);
               return d.delay;
             })
             .style("opacity", 0)
             .on("end", function(d){
               var path = d3.select("#path"+d.pathNumber);
               var startPoint = pathStartPoint(path);
               d3.select(this)
                  .attr("x",0)
                  .attr("y",function(d){
                    return verticalOffsetRange * d.offset;
                  })
                  .attr("transform", "translate(" + startPoint + ")")
                  .style("opacity", 1);
               transitionAlongPath(d3.select(this), path);
             });
}

//Get path start point for placing marker
function pathStartPoint(path) {
  var d = path.attr("d"),
  dsplitted = d.split("c");
  return dsplitted[1].split(",")[0];
}

function transitionAlongPath(pixel, path) {
  pixel.transition()
      .duration(pathDuration)
      .ease(d3.easeLinear)
      .attrTween("transform", translateAlong(path.node()))
      .on("end", function(d,i){
        d3.select(this)
          .style("opacity", "0");


        animationEnd(d3.select(this));
      });
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

/*
  Callback function called at the end of the Animation;
*/
function animationEnd(pixel){
  animatePixToImage(pixel);
}


function animatePixToImage(pixel){
  var currentX = parseInt(pixel.attr("x")) + parseInt(pixel.attr("transform").split("(")[1].split(")")[0].split(",")[0]);
  var currentY = parseInt(pixel.attr("y")) + parseInt(pixel.attr("transform").split("(")[1].split(")")[0].split(",")[1]);
  var currentIndex = pixel.attr("id").split("pixel")[1];
  d3.select("#finalPixel"+currentIndex)
    .attr("x", currentX * mapWidth / parseInt(mapSvg.attr("viewBox").split(" ")[2]))
    .attr("y", currentY * (mapWidth / mapRatio) / parseInt(mapSvg.attr("viewBox").split(" ")[3]))
    .style("opacity", 1)
    .transition()
    .ease(d3.easeExpOut)
    .duration(finalMoveDuration)
    .attr("x", parseInt(finalImageSvg.attr("x")) + pixel.data()[0].column * pixelFinalSize.width)
    .attr("y", parseInt(finalImageSvg.attr("y")) + pixel.data()[0].row * pixelFinalSize.height)
    .attr("width", pixelFinalSize.width)
    .attr("height", pixelFinalSize.height)
    .on("end",function(){
      nbPixelInPlace++;
    });
}

function revealPainting(totalNbOfPixels, pieceIndex, placeholderSize){
  while (nbPixelInPlace != totalNbOfPixels){
    setTimeout(function(){
      revealPainting(totalNbOfPixels, pieceIndex, placeholderSize);
    },500);
    return;
  }

  imagePlaceHolder.style("opacity", 0);

  finalImageSvg.append("image")
               .attr("x", 0)
               .attr("y", 0)
               .attr("width", placeholderSize.width)
               .attr("height", placeholderSize.height)
               .attr("xlink:href", masterPieces[pieceIndex].imageUrl);

  for (var i = 0; i < totalNbOfPixels; i++){
    d3.select("#finalPixel"+i)
      .transition()
      .ease(d3.easeLinear)
      .delay(fadingOutDelay)
      .duration(fadingOutDuration)
      .style("opacity", 0);
  }

  titlesPlaceHolder.style("opacity", 1);

  d3.select("#masterPieceTitle")
    .html(masterPieces[pieceIndex].title)
    .style("opacity", 0)
    .transition()
    .ease(d3.easeLinear)
    .delay(fadingOutDelay)
    .duration(fadingOutDuration)
    .style("opacity", 1);

  d3.select("#masterPieceSubtitle")
    .style("opacity", 0)
    .html(masterPieces[pieceIndex].subtitle)
    .transition()
    .ease(d3.easeLinear)
    .delay(fadingOutDelay)
    .duration(fadingOutDuration)
    .style("opacity", 1);

  document.getElementById("nextPainting").disabled = false;
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
     //console.log("Image Loaded!");
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
    var cptI = 0;
    for (i = 0; i < imgWidth; i+=x) {
        //colorsArray.push([]);
        var cptJ = 0;
        for (j = 0; j < imgHeight; j+=x) {
            var eachPixelData = context.getImageData(i, j, 1, 1).data;
            // TODO: this converts to hex from rgb just to convert back later?? necessary? fix
            var hex = "#" + ("000000" + RGBtoHex(eachPixelData[0], eachPixelData[1], eachPixelData[2])).slice(-6);
            var Color = function Color(hexVal) { this.hex = hexVal; };
            var color = new Color(hex);
            ConstructColor(color);
            colorsArray.push({"column": cptI, "row": cptJ, "hex": color});
            cptJ++;
        }
        cptI++;
    }
    //Sort the color Array
    colorsArray.sort(function(a,b){
        return a.hex.hue - b.hex.hue;
    });
    for (var i = 0; i < colorsArray.length; i++){
      colorsArray[i].hex = colorsArray[i].hex.hex;
    }
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
