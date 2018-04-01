var canvasWidth = 960;
var canvasHeight = 500;

var is_playing = false;
var show_oddball = false;
var modeSelector;
var sizeSelector;
var speedSelector;

var max_vals = [360, 100, 100];
var allAgents = [];
var numActiveAgents = 0;

var clearButton, randomButton, playButton, stepButton, stopButton;

var backgroundImage = null;
var agentLookupWidth = 1;
var agentLookupHeight = 1;
var agentLookupTable = [0];
var haveSeenMovement = false;

function preload() {
  backgroundImage = loadImage("z_background.jpg");
atomicImage = loadImage("atomic.png");
plasma = loadImage("plasma.png");
//pop = loadSound("pop.mp3");
  // this is called for static assets your agents need
  Agent3Preload();
}

function setup() {
  // create the drawing canvas, save the canvas element
  var main_canvas = createCanvas(canvasWidth, canvasHeight);
  main_canvas.parent('canvasContainer');

  modeSelector = createSelect();
  modeSelector.option('grid');
  modeSelector.option('hexgrid');
  // modeSelector.option('vornoi');
  // modeSelector.option('freestyle');
  modeSelector.changed(gridTypeChanged);
  modeSelector.value('hexgrid');
  modeSelector.parent('selector1Container');

  sizeSelector = createSelect();
  sizeSelector.option('16');
  sizeSelector.option('32');
  sizeSelector.option('64');
  sizeSelector.option('128');
  sizeSelector.option('256');
  sizeSelector.parent('selector2Container');
  sizeSelector.value('32');
  sizeSelector.changed(sizeChangedEvent);

  speedSelector = createSelect();
  speedSelector.option('1');
  speedSelector.option('2');
  speedSelector.option('5');
  speedSelector.option('10');
  speedSelector.option('24');
  speedSelector.option('60');
  speedSelector.parent('selector3Container');
  speedSelector.value('10');
  speedSelector.changed(speedChangedEvent);

  stepButton = createButton('step');
  stepButton.mousePressed(stepButtonPressedEvent);
  stepButton.parent('playButtonContainer');

  playButton = createButton('play');
  playButton.mousePressed(playButtonPressedEvent);
  playButton.parent('playButtonContainer');

  // stopButton = createButton('stop');
  // stopButton.mousePressed(stopButtonPressedEvent);
  // stopButton.parent('playButtonContainer');

  clearButton = createButton('reset');
  clearButton.mousePressed(clearButtonPressedEvent);
  clearButton.parent('clearButtonContainer');

  randomButton = createButton('random');
  randomButton.mousePressed(randomButtonPressedEvent);
  randomButton.parent('clearButtonContainer');

  // guideCheckbox = createCheckbox('', false);
  // guideCheckbox.parent('checkContainer');
  // guideCheckbox.changed(guideChangedEvent);

  // setup lookup table from pixels
  backgroundImage.loadPixels();
  var p = backgroundImage.pixels;
  agentLookupHeight = backgroundImage.height;
  agentLookupWidth = backgroundImage.width;
  agentLookupTable = new Array(agentLookupHeight);
  for(var j=0; j<agentLookupHeight; j++) {
    agentLookupTable[j] = new Array(agentLookupWidth);
    for(var i=0; i<agentLookupWidth; i++) {
      var ix = 4 * (j * agentLookupWidth + i);
      if(p[ix] > 128 && p[ix+1] > 128 && p[ix+2] > 128) {
        // white
        agentLookupTable[j][i] = 0;
      }
      else if(p[ix] < 128 && p[ix+1] < 128 && p[ix+2] < 128) {
        // black
        agentLookupTable[j][i] = 1;
      }
      else if(p[ix] > p[ix+1]  && p[ix] > p[ix+2] ) {
        // red-ish
        agentLookupTable[j][i] = 2;
      }
      else if(p[ix+1] > p[ix]  && p[ix+1] > p[ix+2] ) {
        // green-ish
        agentLookupTable[j][i] = 3;
      }
      else {
        agentLookupTable[j][i] = 4;
      }
    }
  }

  noLoop();
  refreshGridData();
  modeChangedEvent();
  speedChangedEvent();
  playButtonPressedEvent();
}

/*
function mouseClicked() {
  if (mouseX > width/4) {
    refreshGridData();
  }
  redraw();
}
*/

var numGridRows;
var numGridCols;
var gridValues; // row, col order
var gridOffsetX, gridOffsetY;
var gridSpacingX, gridSpacingY;
// Generate data for putting glyphs in a grid

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getNewAgent() {
  a = new Agent3();
  return a;
}

function lookupAgentType(x, y, size) {
  s2 = size/2;
  x += s2;
  y += s2;
  if(x < 0 || y < 0 || x >= canvasWidth || y >= canvasHeight) {
    print("ERROR");
    return 0;
  }
  var ix = int(map(x, 0, canvasWidth, 0, agentLookupWidth));
  var iy = int(map(y, 0, canvasHeight, 0, agentLookupHeight));
  return agentLookupTable[iy][ix];
}

function refreshGridData() {
  var mode = modeSelector.value();
  var glyphSize = parseInt(sizeSelector.value(), 10);

  if (mode == "hexgrid") {
    if(glyphSize == 16) {
      numGridCols = 58;
      numGridRows = 33;
      gridOffsetX = 20;
      gridSpacingX = 16;
      gridOffsetY = 1;
      gridSpacingY = 15;
    }
    if(glyphSize == 32) {
      numGridCols = 30;
      numGridRows = 17;
      gridOffsetX = 10;
      gridSpacingX = 31;
      gridOffsetY = 2;
      gridSpacingY = 29;
    }
    else if(glyphSize == 64) {
      numGridCols = 13;
      numGridRows = 7;
      gridOffsetX = 35;
      gridSpacingX = 66;
      gridOffsetY = 35;
      gridSpacingY = 59;
    }
    else if(glyphSize == 128) {
      numGridCols = 7;
      numGridRows = 4;
      gridOffsetX = 10;
      gridSpacingX = 132;
      gridOffsetY = 0;
      gridSpacingY = 118;
    }
    else if(glyphSize == 256) {
      numGridCols = 3;
      numGridRows = 2;
      gridOffsetX = 96;
      gridSpacingX = 262;
      gridOffsetY = 0;
      gridSpacingY = 234;
    }
  }
  else if(glyphSize == 128) {
    numGridCols = 7;
    numGridRows = 3;
    gridOffsetX = 10;
    gridSpacingX = 136;
    gridOffsetY = 20;
    gridSpacingY = 166;
  }
  else if(glyphSize == 256) {
    numGridCols = 3;
    numGridRows = 1;
    gridOffsetX = 20;
    gridSpacingX = 320;
    gridOffsetY = 100;
    gridSpacingY = 500;
  }
  else if(glyphSize == 64) {
    numGridCols = 14;
    numGridRows = 7;
    gridOffsetX = 3;
    gridSpacingX = 68;
    gridOffsetY = 6;
    gridSpacingY = 71;
  }
  else if(glyphSize == 32) {
    numGridCols = 24;
    numGridRows = 13;
    gridOffsetX = 4;
    gridSpacingX = 40;
    gridOffsetY = 4;
    gridSpacingY = 38;
  }
  else if(glyphSize == 16) {
    numGridCols = 48;
    numGridRows = 25;
    gridOffsetX = 1;
    gridSpacingX = 20;
    gridOffsetY = 1;
    gridSpacingY = 20;
  }

  // this updates the grid to account for center spacing
  gridOffsetX += glyphSize/2;
  gridOffsetY += glyphSize/2;

  // determine active agents and reset
  numActiveAgents = 0;
  var hexOffset = (mode == "hexgrid");
  gridValues = new Array(numGridRows);
  for (var i=0; i<numGridRows; i++) {
    var tweakedNumGridCols = numGridCols;
    if (hexOffset && i%2 == 1) {
      tweakedNumGridCols = numGridCols - 1;
    }
    gridValues[i] = new Array(tweakedNumGridCols);
    for (var j=0; j<tweakedNumGridCols; j++) {
      if(numActiveAgents >= allAgents.length) {
        allAgents.push(getNewAgent());
      }
      gridValues[i][j] = allAgents[numActiveAgents];
      numActiveAgents = numActiveAgents + 1;
    }
  }

  // assign positions
  for (var i=0; i<numGridRows; i++) {
    var tweakedNumGridCols = numGridCols;
    var offsetX = 0;
    if (hexOffset && i%2 == 1) {
      offsetX = gridSpacingX / 2;
      tweakedNumGridCols = numGridCols - 1;
    }
    for (var j=0; j<tweakedNumGridCols; j++) {
      gridValues[i][j]._x = gridOffsetX + j * gridSpacingX + offsetX;
      gridValues[i][j]._y = gridOffsetY + i * gridSpacingY;
      gridValues[i][j]._type = lookupAgentType(gridValues[i][j]._x, gridValues[i][j]._y, glyphSize);
      if(gridValues[i][j]._type > 1) {
        gridValues[i][j]._static = false;
        gridValues[i][j]._size = glyphSize/4;
      }
      else {
        gridValues[i][j]._static = true;
        gridValues[i][j]._size = glyphSize/2;
      }
    }
  }

  // setup
  for (var i=0; i<numActiveAgents; i++) {
    var agent = allAgents[i];
    agent.setup(0, agent._type);
  }
  // compute neighbors
  computeNeighbors(glyphSize);
}

function computeNeighbors(glyphSize) {
  var mode = modeSelector.value();
  var hexOffset = (mode == "hexgrid");

  for (var i=0; i<numActiveAgents; i++) {
    allAgents[i]._neighbors = []
  }

  var dist_thresh = 2.0;
  if(hexOffset) {
    dist_thresh = 1.4;
  }
  for (var i=0; i<numActiveAgents; i++) {
    var agent = allAgents[i];
    // agent.setup(0, agent._type);
    for (var j=i+1; j<numActiveAgents; j++) {
      var other = allAgents[j]
      var d = dist(agent._x, agent._y, other._x, other._y) / glyphSize
      if (d < dist_thresh) {
        var o1 = {
          'distance': d,
          'agent': other,
          'radius': other._size,
          'x': other._x - agent._x,
          'y': other._y - agent._y,
          'pos': createVector(other._x - agent._x, other._y - agent._y)
        }
        agent._neighbors.push(o1)
        var o2 = {
          'distance': d,
          'agent': agent,
          'radius': agent._size,
          'x': agent._x - other._x,
          'y': agent._y - other._y,
          'pos': createVector(agent._x - other._x, agent._y - other._y)
        }
        other._neighbors.push(o2)
      }
    }
  }  
}

function speedChangedEvent() {
  var speed = parseInt(speedSelector.value(), 10);
  frameRate(speed)
}

function sizeChangedEvent() {
  var mode = modeSelector.value();
  refreshGridData();
  redraw();
}

function guideChangedEvent() {
  show_oddball = guideCheckbox.checked();
  redraw();
}

function modeChangedEvent() {
  var mode = modeSelector.value();

  if (is_playing) {
    playButton.elt.textContent = "pause";
    stepButton.attribute('disabled','');
    // stopButton.removeAttribute('disabled');
  }
  else {
    playButton.elt.textContent = "play";
    stepButton.removeAttribute('disabled');
    // stopButton.attribute('disabled','');
  }

  if (mode === "drive") {
    // disable the button
    // button.attribute('disabled','');

    // enable the size selector
    sizeSelector.removeAttribute('disabled');
  }
  else {
    // enable the button
    // button.removeAttribute('disabled');

    // enable the size selector
    // sizeSelector.removeAttribute('disabled');

    // refresh data
    // refreshGridData();
  }
  if (mode === "hexgrid") {
    // refresh data
    // refreshGridData();
  }

  redraw();
}

function gridTypeChanged() {
  modeChangedEvent();
  refreshGridData();
  redraw();
}

function clearButtonPressedEvent() {
  refreshGridData();
  for(var i=0; i<numActiveAgents; i++) {
    var agent = allAgents[i];
    agent.setup(0, agent._type);
  }
  redraw();
}

function randomButtonPressedEvent() {
  // refreshGridData();
  for(var i=0; i<numActiveAgents; i++) {
    var agent = allAgents[i];
    agent.setup(random(100), agent._type);
  }
  redraw();
}

function playButtonPressedEvent() {
  if(is_playing) {
    is_playing = false
    noLoop();
  }
  else {
    is_playing = true;
    loop();
  }
  modeChangedEvent()
  // refreshGridData();
  redraw();
}

function stepButtonPressedEvent() {
  is_playing = true;
  // refreshGridData();
  redraw();
  is_playing = false;
}

function stopButtonPressedEvent() {
  // refreshGridData();
  redraw();
}

var colorBack = "rgb(232, 232, 232)"

function highlightGlyph(glyphSize) {
  halfSize = glyphSize / 2.0;
  stroke(0, 0, 255, 128);
  noFill();
  strokeWeight(4);
  ellipse(halfSize, halfSize, glyphSize+4);
  fill(0);
  strokeWeight(1);
}

function drawGrid() {
  var glyphSize = parseInt(sizeSelector.value(), 10);
  background(255);
  for (var i=0; i<numActiveAgents; i++) {
    resetMatrix();
    agent = allAgents[i];
    translate(agent._x, agent._y);
    agent.draw(agent._size);
    resetMatrix();
    if (show_oddball) {
      translate(agent._x, agent._y);
      highlightGlyph(glyphSize)
    }
  }
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function stepGrid() {
  var glyphSize = parseInt(sizeSelector.value(), 10);
  var radius = glyphSize / 2;
  var min_x = int(0);
  var min_y = int(0);
  var max_x = int(canvasWidth - radius) - 1;
  var max_y = int(canvasHeight - radius) - 1;

  var updatedAgents = new Array(numActiveAgents);
  for (var i=0; i<numActiveAgents; i++) {
    // make a shallow copy of the agent
    agent = allAgents[i];
    var clone = Object.assign({}, agent);
    agent._new_me = clone;
    var movement = clone.step(clone._neighbors, clone._size);
    if(typeof movement !== 'undefined') {
      haveSeenMovement = true;
      var new_x = clone._x + movement.x;
      var new_y = clone._y + movement.y;
      clone._x = clamp(new_x, min_x, max_x);
      clone._y = clamp(new_y, min_y, max_y);
    }
    updatedAgents[i] = clone;
  }

  for (var i=0; i<numActiveAgents; i++) {
    allAgents[i] = updatedAgents[i];
  }

  if(haveSeenMovement) {
    // copy new version of neighbors
    computeNeighbors(glyphSize);
  }
  else {
    for (var i=0; i<numActiveAgents; i++) {
      agent = allAgents[i];
      var old_neighbors = agent._neighbors;
      for(var j=0; j<old_neighbors.length; j++) {
        if ('_new_me' in old_neighbors[j].agent) {
          agent._neighbors[j].agent = agent._neighbors[j].agent._new_me;
        }
      }
    }
    // weakly check optimization assertion (not a memory leak)
    for (var i=0; i<numActiveAgents; i++) {
      if ('_new_me' in allAgents[i]) {
        print("you flubbed the _new_me setup");
      }
    }
  }
}

function activateGrid(x, y) {
  var glyphSize = parseInt(sizeSelector.value(), 10);
  for (var i=0; i<numActiveAgents; i++) {
    agent = allAgents[i];
    if( (agent._x <= x) && (agent._x + glyphSize > x) &&
        (agent._y <= y) && (agent._y + glyphSize > y) ) {
      agent.activate();
    }
  }
}

function mouseClicked () {
  activateGrid(mouseX, mouseY);
  drawGrid();
}

function draw () {
  var mode = modeSelector.value();

  // first do all steps
  if (is_playing) {
    stepGrid();
  }
  // then do activate
  activateGrid(mouseX, mouseY);
  // the do all draws
  drawGrid();
  resetMatrix();
}

function keyTyped() {
  if (key == '!') {
    saveBlocksImages();
  }
  else if (key == '@') {
    saveBlocksImages(true);
  }
  else if (key == ' ') {
    playButtonPressedEvent();
  }
  else if (key == 's') {
    var old_value = guideCheckbox.checked();
    guideCheckbox.checked(!old_value);
    guideChangedEvent();
  }
  else if (key == '1') {
    sizeSelector.value('16');
    sizeChangedEvent()
  }
  else if (key == '2') {
    sizeSelector.value('32');
    sizeChangedEvent()
  }
  else if (key == '3') {
    sizeSelector.value('64');
    sizeChangedEvent()
  }
  else if (key == '4') {
    sizeSelector.value('128');
    sizeChangedEvent()
  }
  else if (key == '5') {
    sizeSelector.value('256');
    sizeChangedEvent()
  }
  else if (key == 'd') {
    modeSelector.value('drive');
    modeChangedEvent()
  }
  else if (key == 'g') {
    modeSelector.value('grid');
    gridTypeChanged()
  }
  else if (key == 'r') {
    modeSelector.value('random');
    modeChangedEvent()
  }
  else if (key == 'h') {
    modeSelector.value('hexgrid');
    gridTypeChanged()
  }
}

function keyPressed() {
}
