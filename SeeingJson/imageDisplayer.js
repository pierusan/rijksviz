function paintingSearch(){

  d3.select("#imageDiv").selectAll("*").remove();

  var paintingID = document.getElementById("paintSearchID2").value;
  if (document.getElementById("paintSearchID").value != ""){
    paintingID = document.getElementById("paintSearchID").value;
  }

  /** Global var to store all match data for the 2014 Fifa cup */
  var paintingData;

  var url = "https://www.rijksmuseum.nl/api/en/collection/"+paintingID+"?key=rgAMNabw&format=json";
  d3.select("#subTitle")
    .html("URL: "+url);

  d3.json(url, function (json) {
      console.log("Loading json:");
      console.log(json);
      paintingData = json;
      var imageTitle = d3.select("#imageDiv")
                        .append("div")
                        .classed("row", true);
      var imageRow = d3.select("#imageDiv")
                        .append("div")
                        .classed("row", true);

      //ADD TITLE
      imageTitle.append("h3")
                  .html(paintingData.artObject.label.title);
      imageTitle.append("h4")
                  .html(paintingData.artObject.label.makerLine)
                  .style("padding-bottom", "30px");


      //IMAGE AND COLORS
      var imageCol = imageRow.append("div")
                    .classed("col-md-6", "true");

      var w = imageCol.node().getBoundingClientRect().width - 20;

      if (paintingData.artObject.hasImage && paintingData.artObject.copyrightHolder == null){
        //add image
        imageCol.append("img")
                .attr("src", paintingData.artObject.webImage.url)
                .attr("alt", paintingData.artObject.title)
                .style("width", w+"px");

        //add image data
        imageCol.append("div")
                  .append("p")
                  .style("overflow-wrap", "break-word")
                  .html(
                    "<b>Resolution: "+ paintingData.artObject.webImage.width+" x "+paintingData.artObject.webImage.height+"</b>"+
                    " Offset%X: "+ paintingData.artObject.webImage.offsetPercentageX+", Offset%Y: "+ paintingData.artObject.webImage.offsetPercentageY);
      }
      else{
        imageCol.append("img")
                .attr("src", "Data/Copyright.PNG")
                .attr("alt", paintingData.artObject.title)
                .style("width", w+"px");
      }
      //add colors
      var imageColors1 = imageCol.append("div")
                        .classed("row", "true")
                          .append("div")
                          .classed("col-md-6", "true");

      var rectOffsetX = 20;
      var nbRectX = 4;
      var rectOffsetY = 20;
      var rectWidth = (imageColors1.node().getBoundingClientRect().width - rectOffsetX * (nbRectX + 1)) / nbRectX;

      imageColors1.append("h3")
                  .html("Colors");

      var svg1 = imageColors1.append("svg")
                             .attr("width", imageColors1.node().getBoundingClientRect().width)
                             .attr("height", (rectWidth + rectOffsetY) * (Math.floor(paintingData.artObject.colors.length/ nbRectX) + 1));

      for (i=0; i < paintingData.artObject.colors.length; i++){
        svg1.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectWidth)
            .attr("x", rectOffsetX + (i % nbRectX) * (rectWidth +rectOffsetX))
            .attr("y", Math.floor(i / nbRectX) * (rectOffsetY + rectWidth) )
            .style("fill", paintingData.artObject.colors[i]);
      }

      var imageColors2 = imageCol.select(".row")
                          .append("div")
                          .classed("col-md-6", "true");

      imageColors2.append("h3")
                  .html("Colors w/ Normalization");

      var svg2 = imageColors2.append("svg")
                             .attr("width", imageColors2.node().getBoundingClientRect().width)
                             .attr("height", (rectWidth + rectOffsetY) * (Math.floor(paintingData.artObject.colorsWithNormalization.length/ nbRectX) + 1));

      for (i=0; i < paintingData.artObject.colorsWithNormalization.length; i++){
        svg2.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectWidth)
            .attr("x", rectOffsetX + (i % nbRectX) * (rectWidth +rectOffsetX))
            .attr("y", Math.floor(i / nbRectX) * (rectOffsetY + rectWidth) )
            .style("fill", paintingData.artObject.colorsWithNormalization[i].normalizedHex)
      }

      var imageColors3 = imageCol.append("div")
                          .classed("row", "true")
                          .attr("id", "row3")
                          .append("div")
                          .classed("col-md-6", "true");


      imageColors3.append("h3")
                  .html("Normalized 32 Colors");

      var svg3 = imageColors3.append("svg")
                             .attr("width", imageColors3.node().getBoundingClientRect().width)
                             .attr("height", (rectWidth + rectOffsetY) * (Math.floor(paintingData.artObject.normalized32Colors.length/ nbRectX) + 1));

      for (i=0; i < paintingData.artObject.normalized32Colors.length; i++){
        svg3.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectWidth)
            .attr("x", rectOffsetX + (i % nbRectX) * (rectWidth +rectOffsetX))
            .attr("y", Math.floor(i / nbRectX) * (rectOffsetY + rectWidth) )
            .style("fill", paintingData.artObject.normalized32Colors[i])
      }

      var imageColors4 = imageCol.select("#row3")
                          .append("div")
                          .classed("col-md-6", "true");

      imageColors4.append("h3")
                  .html("Normalized Colors");

      var svg4 = imageColors4.append("svg")
                             .attr("width", imageColors4.node().getBoundingClientRect().width)
                             .attr("height", (rectWidth + rectOffsetY) * (Math.floor(paintingData.artObject.normalizedColors.length/ nbRectX) + 1));

      for (i=0; i < paintingData.artObject.normalizedColors.length; i++){
        svg4.append("rect")
            .attr("width", rectWidth)
            .attr("height", rectWidth)
            .attr("x", rectOffsetX + (i % nbRectX) * (rectWidth +rectOffsetX))
            .attr("y", Math.floor(i / nbRectX) * (rectOffsetY + rectWidth) )
            .style("fill", paintingData.artObject.normalizedColors[i])
      }

      var imagePainter = imageRow.append("div")
                                 .classed("col-md-3", "true");

      imagePainter.append("h3")
                  .html("<b>Painter</b>")
                  .style("padding-bottom", "25px");
      imagePainter.append("h4")
                  .html("Name");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.principalMakers[0].name);
      imagePainter.append("h4")
                  .html("Birth");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.principalMakers[0].dateOfBirth +"<br>"+
                        paintingData.artObject.principalMakers[0].placeOfBirth);
      imagePainter.append("h4")
                  .html("Death");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.principalMakers[0].dateOfDeath+"<br>"+
                        paintingData.artObject.principalMakers[0].placeOfDeath);
      imagePainter.append("h4")
                  .html("Nationality");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.principalMakers[0].nationality);
      string = "";
      array = paintingData.artObject.principalMakers[0].productionPlaces;
      for (i = 0; i < array .length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];
      imagePainter.append("h4")
                  .html("Production Places");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);
      string = "";
      array = paintingData.artObject.principalMakers[0].occupation;
      for (i = 0; i < array .length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];
      imagePainter.append("h4")
                  .html("Occupations");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);
      string = "";
      array = paintingData.artObject.principalMakers[0].roles;
      for (i = 0; i < array .length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];
      imagePainter.append("h4")
                  .html("Roles");
      imagePainter.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      var imageDetails = imageRow.append("div")
                                .classed("col-md-3", "true");

      imageDetails.append("h3")
                  .html("<b>Painting</b>")
                  .style("padding-bottom", "25px");

      var string;
      var array;

      //TYPE
      string = "";
      array = paintingData.artObject.objectTypes;
      for (i = 0; i < array.length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];
      imageDetails.append("h4")
                  .html("Types");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      //DATE
      imageDetails.append("h4")
                  .html("Date");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.dating.yearEarly + " - "+ paintingData.artObject.dating.yearLate);

      //MATERIALS
      string = "";
      array = paintingData.artObject.materials;
      for (i = 0; i < array.length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];

      imageDetails.append("h4")
                  .html("Materials");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      //MEDIUM
      imageDetails.append("h4")
                  .html("Physical Medium");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.physicalMedium);

      //DIMENSIONS
      string = "";
      array = paintingData.artObject.dimensions;
      for (i = 0; i < array.length; i++){
        string += array[i].type +": "+array[i].value+" "+array[i].unit + "<br>";
      }
      imageDetails.append("h4")
                  .html("Dimensions");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      //PRODUCTION PLACE
      string = "";
      array = paintingData.artObject.productionPlaces;
      for (i = 0; i < array.length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];

      imageDetails.append("h4")
                  .html("Production Places");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      //ACQUISITION
      var paintingDate = new Date(paintingData.artObject.acquisition.date);
      var monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];
      imageDetails.append("h4")
                  .html("Acquisition");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(paintingData.artObject.acquisition.creditLine + "<br>"
                        + monthNames[paintingDate.getMonth()] + " " + paintingDate.getFullYear() + "<br>"
                        + paintingData.artObject.acquisition.method + "<br> ");

        //TITLES
        string = paintingData.artObject.title + "<br>";
        array = paintingData.artObject.titles;
        for (i = 0; i < array .length - 1; i++){
          string += "- " + array[i] + "<br>";
        }
        string += "- " + array[array .length - 1];
        imageDetails.append("h4")
                    .html("Titles");
        imageDetails.append("p")
                    .style("padding-bottom", "20px")
                    .html(string);

      //TAGS
      string = "";
      array = paintingData.artObject.classification.iconClassDescription;
      for (i = 0; i < array .length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];
      imageDetails.append("h4")
                  .html("Tags");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      //PERSONS
      string = "";
      array = paintingData.artObject.historicalPersons;
      for (i = 0; i < array .length - 1; i++){
        string += "- " + array[i] + "<br>";
      }
      string += "- " + array[array .length - 1];
      imageDetails.append("h4")
                  .html("Historical Persons");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);

      //CHECK FOR OTHER INTERESTING DATA
      var otherDataAvailable = 0;
      //string = "- Number of docs: "+paintingData.artObject.documentation.length + "<br>- Object Collection NB: "+paintingData.artObject.objectCollection.length+"<br>";
      string = "- Number of docs: "+paintingData.artObject.documentation.length + "<br>";
      if (paintingData.artObject.plaqueDescriptionEnglish != null){
        otherDataAvailable++;
        string+= "- Plaque in English <br>"
      }
      if (paintingData.artObject.artistRole != null){
        otherDataAvailable++;
        string+= "- ArtistRole <br>"
      }
      if (paintingData.artObject.associations.length != 0){
        otherDataAvailable++;
        string+= "- Associations <br>"
      }
      if (paintingData.artObject.catRefRPK.length != 0){
        otherDataAvailable++;
        string+= "- Cat Ref RPK <br>"
      }
      if (paintingData.artObject.dating.earlyPrecision != null || paintingData.artObject.dating.latePrecision != null){
        otherDataAvailable++;
        string+= "- Date Precisions <br>"
      }
      if (paintingData.artObject.copyrightHolder != null){
        otherDataAvailable++;
        string+= "- CopyrightHolder <br>"
      }
      if (paintingData.artObject.classification.events.length != 0){
        otherDataAvailable++;
        string+= "- Classification Events <br>"
      }
      if (paintingData.artObject.classification.motifs.length != 0){
        otherDataAvailable++;
        string+= "- Classification Motifs <br>"
      }
      if (paintingData.artObject.classification.periods.length != 0){
        otherDataAvailable++;
        string+= "- Classification Periods <br>"
      }
      if (paintingData.artObject.classification.people.length != paintingData.artObject.historicalPersons.length){
        otherDataAvailable++;
        string+= "- Different number of people btw classification and historicalPersons <br>"
      }
      if (paintingData.artObject.classification.places.length != paintingData.artObject.productionPlaces.length){
        otherDataAvailable++;
        string+= "- Different number of places btw classification and productionPlaces <br>"
      }
      if (paintingData.artObject.exhibitions.length != 0){
        otherDataAvailable++;
        string+= "- Exhibitions <br>"
      }
      if (paintingData.artObject.inscriptions.length != 0){
        otherDataAvailable++;
        string+= "- Inscriptions <br>"
      }
      if (paintingData.artObject.label.notes != null){
        otherDataAvailable++;
        string+= "- Label Notes <br>"
      }
      if (paintingData.artObject.labelText != null){
        otherDataAvailable++;
        string+= "- Label Text <br>"
      }
      if (paintingData.artObject.makers.length != 0){
        otherDataAvailable++;
        string+= "- Makers <br>"
      }
      if (paintingData.artObject.physicalProperties.length != 0){
        otherDataAvailable++;
        string+= "- Physical Properties <br>"
      }
      if (paintingData.artObject.techniques.length != 0){
        otherDataAvailable++;
        string+= "- Techniques <br>"
      }
      if (paintingData.artObject.principalMakers.length != 1){
        otherDataAvailable++;
        string+= "- More than 1 Maker <br>"
      }
      if (paintingData.artObject.principalMakers[0].biography != null){
        otherDataAvailable++;
        string+= "- Painter Biography Available!! <br>"
      }
      if (paintingData.artObject.principalMakers[0].qualification != null){
        otherDataAvailable++;
        string+= "- Painter Qualification Available!! <br>"
      }

      imageDetails.append("h4")
                  .html("Other Stuff");
      imageDetails.append("p")
                  .style("padding-bottom", "20px")
                  .html(string);
      if (otherDataAvailable){
        d3.select("#subTitle")
          .style("color", "Red");
      }
      else{
        d3.select("#subTitle")
          .style("color", "Green");
      }

  });

}
