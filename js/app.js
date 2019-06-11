// Game parameters
const NUM_STARS = 3;              // The max number of stars awarded
const NUM_TILESETS = 2;           // The number of tilesets in the grid
const NUM_TILES = 8;              // The number of tiles in a tileset
const TICK_LENGTH = 1000;         // Tghe frequency with which the clock is updated (every 1 second)
const DELAY_AFTER_REVEAL = 1000;  // The time for which tiles are shown before the grid/model are updated (1 second)

// Data model
var mgModel = {
  moves: 0,           // The neumber of moves made by the player
  time: 0,            // The current elapsed time
  stars: 0,           // The number of stars to be awarded
  matches: 0,         // The number of matches found by the player
  revealed: [],       // An array holding the tiles that are currently revealed
  tiles: [],          // An array holding the game tiles
  startTime: 0,       // The time at which the game was started
  timer: null,        // Handle for the timer handler
  trackEvents: false  // True if click events are currenly being tracked
};

// Game logic and data model functions

/**
 * @description Starts a game
 */
function startGame() {
  mgModel.moves = 0;
  mgModel.time = 0;
  mgModel.stars = NUM_STARS;
  mgModel.matches = 0;

  mgModel.revealed = new Array();

  // Use this array to create a random set of tiles
  mgModel.tiles = new Array();
  shuffle(mgModel.tiles);

  drawGameInfo();
  drawGrid();

  // Take a reference for the timer and start the timer (fires once every second)
  mgModel.startTime = Date.now();
  mgModel.timer = window.setInterval(timerTick, TICK_LENGTH);
  mgModel.trackEvents = true;
}

/**
 * @description Creates an array of tile values shuffled into a random order
 * @param {Array} outputArray A reference to the array in which the shuffled values are to be stored
 */
function shuffle(outputArray) {
  // Create a temp array containing two sets of tile references
  let tilesTemp = new Array();

  for (let tileSet = 0; tileSet < NUM_TILESETS; tileSet++) {
    for (let tileNum = 0; tileNum < NUM_TILES; tileNum++) {
      tilesTemp.push({tile: tileNum, state: "unmatched"});
    }
  }

  // Select items at random from the ordered array and place them into outputArray
  let consoleOut = "";  // DEVELOPMENT FEATURE
  while (tilesTemp.length > 0) {
    let cellInfo = tilesTemp.splice(Math.floor(Math.random() * tilesTemp.length), 1);
    outputArray.push(cellInfo);

    // DEVELOPMENT FEATURE
    consoleOut =  `${consoleOut}${cellInfo[0].tile} `;
    if (tilesTemp.length % 4 === 0) {
      console.log(consoleOut);
      consoleOut = "";
    }
  }
}

/**
 * @description Selects a tile on the grid. If it's not currently matched or revealed, it will be
 *              revealed. If two tiles are revealed, we'll then check for a match
 * @param {Number} millisecs The elapsed time in milliseconds
 * @returns {String} The elapsed time in miutes and seconds in the form MM:SS
 */
function tileSelect(tileNum) {
  let tileClicked = mgModel.tiles[tileNum][0];
  // Only reveal tiles that are not currently matched or revealed
  if (tileClicked.state === "unmatched") {
    mgModel.moves++;
    checkStars();
    tileClicked.state = "revealed";
    mgModel.revealed.push(tileClicked);
    drawGameInfo();
    drawGrid();

    // If two tiles have now been revealed, check for a match
    if (mgModel.revealed.length === 2) {
      checkMatch();
    } else {
      mgModel.trackEvents = true;
    }
  } else {
    // The learner has clicked on a tile that is already matched or revealed so just start tracking events again
    mgModel.trackEvents = true;
  }
}

/**
 * @description Checks if a match has been found and updates model to indicate this
 */
function checkMatch() {
  let matched = false;

  // Update the model if the tiles match
  if (mgModel.revealed[0].tile === mgModel.revealed[1].tile) {
    mgModel.revealed[0].state = "matched";
    mgModel.revealed[1].state = "matched";

    mgModel.matches += 2;
    matched = true;
  }

  // Set a short delay before grid is updated so player has time to register their second selection
  window.setTimeout(this.updateGrid, DELAY_AFTER_REVEAL, matched);
}

/**
 * @description Updates the model after a two tiles have been revealed
 * @param {Boolean} matched True if the tiles matched, false otherwise
 */
 function updateGrid(matched) {
  // If the tiles were not matched set them back to their default state
  if (!matched) {
    mgModel.revealed[0].state = "unmatched";
    mgModel.revealed[1].state = "unmatched";
  }

  // Reset the revealed Array
  mgModel.revealed.length = 0;

  // Check for a win
  if (matched && mgModel.matches === NUM_TILESETS * NUM_TILES) {
    won();
  } else {
    // Start tracking events again and redraw the grid
    mgModel.trackEvents = true;
    drawGrid();
  }
}

/**
 * @description  Called when a game is won - stops the clock and click tracking, then shows the win message
 */
function won() {
  // Stop the timer and stop trapping click events
  window.clearInterval(mgModel.timer);
  mgModel.trackEvents = false;

  // Show the game won panel
  document.querySelector("#win-panel").classList.replace("hidden-panel","visible-panel");
}

/**
 * @description Handler for the timer tick that updates the elapsed time and redraws it
 */
function timerTick() {
  // Get precise time that has elapsed since last tick
  mgModel.time = Date.now() - mgModel.startTime;
  checkStars();
  drawGameInfo();
}

/**
 * @description Checks if a threshold has been met for reducing the number of stars
 */
function checkStars() {
  if (mgModel.stars === 3 && (mgModel.moves === 24 || mgModel.time > 30000)) {
    mgModel.stars = 2;
  } else if (mgModel.stars === 2 && (mgModel.moves === 40 || mgModel.time > 60000)) {
    mgModel.stars = 1;
  }
}

// GUI functions

/**
 * @description Sets up references to UI elements and event handlers
 */
function initUI() {
  document.querySelector("#start-game-btn").addEventListener("click", function() {
    document.querySelector("#instr-panel").classList.replace("visible-panel","hidden-panel");
    startGame();
  });
  document.querySelector("#new-game-btn").addEventListener("click", function() {
    document.querySelector("#win-panel").classList.replace("visible-panel","hidden-panel");
    startGame();
  });
  document.querySelector("main").addEventListener("click", playerInput);
}

/**
 * @description Handler called when the player clicks within the grid
 * @param {Number} event Event structure sent to the handler
 */
function playerInput(event) {
  // if we are currently tracking events and the click is inside one of the grid cells, select that cell
  if (mgModel.trackEvents && event.target.id.substring(0,4) === "grid") {
    mgModel.trackEvents = false;   // Switch off event tracking until all processing and grid animation is finished
    tileSelect(parseInt(event.target.id.substring(4,6)));
  }
}

/**
 * @description Updates the info panel in the GUI (time elapsed, number of moves, number of stars)
 */
function drawGameInfo() {
  let formattedTime = formatTime(mgModel.time);
  document.querySelector("#time").innerHTML = `Time: ${formattedTime}`;
  document.querySelector("#moves").innerHTML = `Moves: ${mgModel.moves}`;
  document.querySelector("#stars").innerHTML = `Stars: ${mgModel.stars}`;
}

/**
 * @description Updates the grid on screen
 */
function drawGrid() {
  let gridItem = 0;
  for (let cell of mgModel.tiles) {
    document.querySelector(`#grid${gridItem}`).innerHTML = (cell[0].state === "unmatched" ? "X" : cell[0].tile);
    gridItem++;
  }
}

/**
 * @description Takes an elapsed time and returns it as a formatted time string
 * @param {Number} millisecs The elapsed time in milliseconds
 * @returns {String} The elapsed time in miutes and seconds in the form MM:SS
 */
function formatTime(millisecs) {
  let secs = Math.floor(millisecs / 1000);
  let mins = Math.floor(secs / 60);
  secs = secs % 60;
  // Construct a formatted string with leading zeros where required
  return (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs);
}
