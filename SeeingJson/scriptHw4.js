/** Global var to store all match data for the 2014 Fifa cup */
var teamData;

/** Global var for list of all elements that will populate the table.*/
var tableElements;


/** Variables to be used when sizing the svgs in the table cells.*/
var cellWidth = 70,
    cellHeight = 20,
    cellBuffer = 15,
    barHeight = 20;

/**Set variables for commonly accessed data columns*/
var goalsMadeHeader = 'Goals Made',
    goalsConcededHeader = 'Goals Conceded';

/** Setup the scales*/
var goalScale = d3.scaleLinear()
    .range([cellBuffer, 2 * cellWidth - cellBuffer]);

/**Used for games/wins/losses*/
var gameScale = d3.scaleLinear()
    .range([0, cellWidth - cellBuffer]);

/**Color scales*/
/**For aggregate columns*/
var aggregateColorScale = d3.scaleLinear()
    .range(['#ece2f0', '#016450']);

/**For goal Column*/
var goalColorScale = d3.scaleQuantize()
    .range(['#cb181d', '#034e7b']);

/**json Object to convert between rounds/results and ranking value*/
var rank = {
    "Winner": 7,
    "Runner-Up": 6,
    'Third Place': 5,
    'Fourth Place': 4,
    'Semi Finals': 3,
    'Quarter Finals': 2,
    'Round of Sixteen': 1,
    'Group': 0
};

d3.json('data/fifa-matches.json',function(error,data){
    teamData = data;
    createTable();
    updateTable();
})

/**
 * Loads in the tree information from fifa-tree.csv and calls createTree(csvData) to render the tree.
 *
 */
d3.csv("data/fifa-tree.csv", function (error, csvData) {

    //Create a unique "id" field for each game
    csvData.forEach(function (d, i) {
        d.id = d.Team + d.Opponent + i;
    });

    createTree(csvData);
});

/**
 * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
 * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
 *
 */
function createTable() {

  //Assign the domain for the scales created for the visualization
  //For the "goalColorScale", we will give as a parameter Goals made - goals conceded
  goalScale.domain([0, Math.max(d3.max(teamData, function(d) { return d.value["Goals Made"]; } ) , d3.max(teamData, function(d) { return d.value["Goals Conceded"]; } ) )]);
  goalColorScale.domain([-1 * Math.max(d3.max(teamData, function(d) { return d.value["Goals Made"]; } ) , d3.max(teamData, function(d) { return d.value["Goals Conceded"]; } ) ),
                        Math.max(d3.max(teamData, function(d) { return d.value["Goals Made"]; } ) , d3.max(teamData, function(d) { return d.value["Goals Conceded"]; } ) )]);
  gameScale.domain([0,d3.max(teamData, function(d) {return d.value["TotalGames"]; })]);
  aggregateColorScale.domain([0,d3.max(teamData, function(d) {return d.value["TotalGames"]; })]);

  //Create an axis for the Goals
  var goalAxis = d3.axisTop();
  goalAxis.scale(goalScale);

  //Add the goal axis to the right cell
  var axisOffset = cellHeight - 3;
  d3.select("#goalHeader")
    .attr("width", 2 * cellWidth + cellBuffer)
    .attr("height", cellHeight + cellBuffer)
    .append("svg")
      .attr("x", cellBuffer / 2)
      .attr("y", cellBuffer / 2)
      .attr("width", 2 * cellWidth)
      .attr("height", cellHeight)
      .append("g")
        .attr("transform", "translate(0,"+axisOffset+")")
        .call(goalAxis);

  //Set up the dimensions of the rest of the table
  d3.select(document.getElementById("goalHeader").parentNode)
    .append("td");
  for (var i = 0; i < 3; i++){
    d3.select(document.getElementById("goalHeader").parentNode)
      .append("td")
        .attr("width", cellWidth + cellBuffer);
  }

  //Populate the tableElements variable with data
  tableElements = teamData;

// ******* TODO: PART V (Extra Credit) *******

}



/**
 * Updates the table contents with a row for each element in the global variable tableElements.
 *
 */
function updateTable() {

  //Integers for the data values in the table
  var aggregate = 0, game = 1;
  var bars = 0, goals = 1, greenText = 2, blackText = 3;


  var tableBody = d3.select("#matchTable tbody");

  //Remove the previous table
  tableBody.selectAll("tr").remove();

  //Create the different rows of the array
  var tr = tableBody.selectAll("tr")
              .data(tableElements)
              .enter()
              .append("tr")
                .attr("height", cellHeight)
                .on("click", function(d,i){
                  updateList(i);
                  updateTable();
                })
                .on("mouseenter", function(d){
                  updateTree(d);
                })
                .on("mouseleave", function(d){
                  clearTree();
                });

  //Create the individual cells and attach data to them based on whether they are games or not
  var td = tr.classed("aggregateRow", function(d){
              return d.value["Opponent"]?false:true;
            })
            .selectAll("td").data(
            function(d, i) {
              if (!d.value["Opponent"]){
                return [
                  {type: aggregate, vis: greenText, value: d.key},
                  {type: aggregate, vis: goals, value: {conceded: d.value["Goals Conceded"], made: d.value["Goals Made"]}},
                  {type: aggregate, vis: blackText, value: d.value["Result"]["label"]},
                  {type: aggregate, vis: bars, value: d.value["Wins"]},
                  {type: aggregate, vis: bars, value: d.value["Losses"]},
                  {type: aggregate, vis: bars, value: d.value["TotalGames"]}
                ];
              }
              else{
                return [
                  {type: game, vis: greenText, value: "x"+d.key},
                  {type: game, vis: goals, value: {conceded: d.value["Goals Conceded"], made: d.value["Goals Made"]}},
                  {type: game, vis: blackText, value: d.value["Result"]["label"]},
                  {type: game, vis: bars, value: 0},
                  {type: game, vis: bars, value: 0},
                  {type: game, vis: bars, value: 0}
                ];
              }
            }

          )
          .enter()
          .append("td");

  //Create the svgs for each cell containing bars
  var barGroup = td.filter(function (d) {
                    return d.vis == bars;
                    })
                    .append("svg")
                      .attr("x", cellBuffer / 2)
                      .attr("y", 0)
                      .attr("width", cellWidth)
                      .attr("height", cellHeight);

  //Create the bars
  barGroup.append("rect")
            .attr("height", cellHeight)
            .attr("width", function(d) {return gameScale(d.value); } )
            .style("fill", function(d) {return aggregateColorScale(d.value);} );

  //Create the labels for the bars
  barGroup.append("text")
            .attr("y", cellHeight / 2)
            .attr("x", function(d){
              return gameScale(d.value);
            })
            .attr("dx", "-1px")
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .classed("label", true)
            .text(function(d){
              return d.value;
            });

  //Create the svgs for each cell representing the goals
  var goalGroup = td.filter(function (d) {
                    return d.vis == goals;
                    })
                    .append("svg")
                      .attr("x", cellBuffer / 2)
                      .attr("y", 0)
                      .attr("width", 2 * cellWidth)
                      .attr("height", cellHeight);

  //Create the goals bar
  goalGroup.append("rect")
              .attr("x", function(d) {return goalScale(Math.min(d.value.made, d.value.conceded));} )
              .attr("width", function(d) {return Math.abs (goalScale(d.value.made) - goalScale(d.value.conceded) );})
              .attr("height", function(d){return d.type==aggregate?"12":"6"})
              .attr("y", function(d){return d.type==aggregate?cellHeight/2-6:cellHeight/2-3})
              .style("fill", function(d){
                return goalColorScale(d.value.made - d.value.conceded);
              })
              .classed("goalBar", true);

  //Create the "goals made" circle
  goalGroup.append("circle")
              .attr("cx", function(d) {return goalScale(d.value.made)} )
              .attr("cy", cellHeight / 2)
              .classed("goalCircle", true)
              .style("fill", function(d){
                  if (d.type==aggregate){
                    return (d.value.made-d.value.conceded != 0)?goalColorScale(1):"gray";
                  }
                  else{
                    return "white";
                  }
                }
              )
              .style("stroke", function(d){
                  if (d.type==aggregate){
                    return (d.value.made-d.value.conceded != 0)?goalColorScale(1):"gray";
                  }
                  else{
                    return (d.value.conceded-d.value.made != 0)?goalColorScale(1):"gray";
                  }
                }
              );

  //Create the "goals conceded" circle
  goalGroup.append("circle")
              .attr("cx", function(d) {return goalScale(d.value.conceded)} )
              .attr("cy", cellHeight / 2)
              .classed("goalCircle", true)
              .style("fill", function(d){
                  if (d.type==aggregate){
                    return (d.value.made-d.value.conceded != 0)?goalColorScale(-1):"gray";
                  }
                  else{
                    return "white";
                  }
                }
              )
              .style("stroke", function(d){
                  if (d.type==aggregate){
                    return (d.value.made-d.value.conceded != 0)?goalColorScale(-1):"gray";
                  }
                  else{
                    return (d.value.conceded-d.value.made != 0)?goalColorScale(-1):"gray";
                  }
                }
              );

  //Populate the left column
  var greenTextGroup = td.filter(function (d) {
                      return d.vis == greenText;
                    })
                    .classed("aggregate", function(d){return d.type==aggregate?true:false;})
                    .classed("game", function(d){return d.type==game?true:false;})
                    .text(function(d){ return d.value;})
                    .style("border-left-color", "white")
                    .style("text-align", "right");

  //Populate the results column
  var blackTextGroup = td.filter(function (d) {
                              return d.vis == blackText;
                            })
                            .style("white-space", "nowrap")
                            .text(function(d){ return d.value;}
                          );
};


/**
 * Collapses all expanded countries, leaving only rows for aggregate values per country.
 *
 */
function collapseList() {
  //Remove all the game elements from the list
  for (var i = tableElements.length - 1; i >= 0; i--){
    if (tableElements[i].value["Opponent"]){
      tableElements.splice(i,1);
    }
  }

}

/**
 * Updates the global tableElements variable, with a row for each row to be rendered in the table.
 *
 */
function updateList(i) {
  //A game was clicked --> do nothing
  if (tableElements[i].value["Opponent"]){
  }
  //The next element is a game --> Remove the next game lines
  else if (i < tableElements.length - 1 && tableElements[i+1].value["Opponent"]) {
    while (i != tableElements.length - 1 && tableElements[i+1].value["Opponent"]){
      tableElements.splice(i + 1, 1);
    }
  }
  //The next element is not a game --> Add the games for the clicked team
  else{
    for (var j = tableElements[i].value["games"].length - 1; j >= 0 ; j--){
      tableElements.splice(i + 1, 0, tableElements[i].value["games"][j]);
    }
  }
}

/**
 * Creates a node/edge structure and renders a tree layout based on the input data
 *
 * @param treeData an array of objects that contain parent/child information.
 */
function createTree(treeData) {

  var treeGroup = d3.select("#tree");

  //Create the node parent relationships
  var root = d3.stratify()
              .id(function(d, i) {return i})
              .parentId(function(d, i) {return d["ParentGame"]})
              (treeData);

  //Create our tree function
  var tree = d3.tree(root).size([780,340]);

  //Position the nodes on screen
  var node = treeGroup.selectAll(".node")
                      .data(tree(root).descendants())
                      .enter()
                      .append("g")
                        .classed("node", true)
                        .classed("winner", function(d) {
                          return d.data["Wins"]=="1"?true:false;
                        })
                        .attr("transform", function(d) {
                            var offsetedX = d.y + 70;
                            return "translate("+offsetedX+","+d.x+")";
                          }
                        );

  //Add a circle onto each node
  node.append("circle")
      .attr("r", 7);

  //Add text next to each node
  node.append("text")
      .attr("dy", 3)
      .attr("x", function(d) {return d.children ? -8 : 8;})
      .style("text-anchor", function(d) {return d.children ? "end" : "start";})
      .text(function(d){
        return d.data["Team"];
      });

  //Display the links
  var link = treeGroup.selectAll(".link")
                      .data(tree(root).descendants().slice(1))
                      .enter()
                      .append("path")
                        .attr("class", "link")
                        .attr("d", function(d) {
                          return "M" + (d.y + 70) + "," + d.x
                              + "C" + (d.y + d.parent.y + 140) / 2 + "," + d.x
                              + " " + (d.y + d.parent.y + 140) / 2 + "," + d.parent.x
                              + " " + (d.parent.y + 70) + "," + d.parent.x;
                        });

};

/**
 * Updates the highlighting in the tree based on the selected team.
 * Highlights the appropriate team nodes and labels.
 *
 * @param team a string specifying which team was selected in the table.
 */
function updateTree(row) {

  clearTree();

  if (!row.value["Opponent"]){
    //Change the CSS class of the links of the Team we are mentioning
    d3.select("#tree")
        .selectAll(".link")
        .classed("selected", function(d){
          return (d.data["Team"] == row.key && d.parent.data["Team"] == row.key) ? true : false;
        });

    //Do the same for the associated labels
    d3.select("#tree")
         .selectAll(".node text")
         .classed("selectedLabel", function(d){
            return (d.data["Team"]==row.key) ? true: false;
          }
        );
  }
  else{
    //Change the CSS class of the links of the game selected
    d3.select("#tree")
        .selectAll(".link")
        .classed("selected", function(d){
          return ( (d.parent.children[0].data["Team"] == row.key && d.parent.children[1].data["Team"] == row.value["Opponent"])
                    ||
                    (d.parent.children[0].data["Team"] == row.value["Opponent"] && d.parent.children[1].data["Team"] == row.key) )
                    ? true : false;
        });

    //Do the same for the associated labels
    d3.select("#tree")
         .selectAll(".node text")
         .classed("selectedLabel", function(d){
             var shouldBeSelected = false;
             if (d.parent){
                if ( (d.parent.children[0].data["Team"] == row.key && d.parent.children[1].data["Team"] == row.value["Opponent"])
                          ||
                      (d.parent.children[0].data["Team"] == row.value["Opponent"] && d.parent.children[1].data["Team"] == row.key) )
                {
                        shouldBeSelected = true;
                }
             }
             if (d.children){
                if ( (d.children[0].data["Team"] == row.key && d.children[1].data["Team"] == row.value["Opponent"])
                          ||
                      (d.children[0].data["Team"] == row.value["Opponent"] && d.children[1].data["Team"] == row.key) )
                {
                        shouldBeSelected = true;
                }
             }
             return shouldBeSelected;
          }
        );
  }
}

/**
 * Removes all highlighting from the tree.
 */
function clearTree() {

  d3.select("#tree")
       .selectAll(".link")
       .classed("selected", false);

 d3.select("#tree")
      .selectAll(".node text")
      .classed("selectedLabel", false);

}
