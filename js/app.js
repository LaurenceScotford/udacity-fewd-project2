// Game parameters
const DEBUG = false;              // Set to true to enable development features
const NUM_STARS = 3;              // The max number of stars awarded
const NUM_TILESETS = 2;           // The number of tilesets in the grid
const NUM_TILES = 8;              // The number of tiles in a tileset
const TICK_LENGTH = 1000;         // Tghe frequency with which the clock is updated (every 1 second)
const DELAY_AFTER_REVEAL = 1000;  // The time for which tiles are shown before the grid/model are updated (1 second)
const TILESETS = [
  {name: 'Food and Drink',
   images: ['cake', 'free_breakfast', 'restaurant', 'local_bar', 'local_dining', 'fastfood', 'local_pizza', 'local_drink']},
  {name: 'Transport',
   images: ['directions_bike', 'directions_boat', 'directions_bus', 'directions_car', 'flight', 'local_shipping', 'tram', 'train']},
  {name: 'Emoticons',
   images: ['mood', 'mood_bad', 'sentiment_dissatisfied', 'sentiment_satisfied', 'sentiment_very_dissatisfied', 'thumb_down', 'thumb_up', 'favorite']},
];

// Data model
let mgModel = {
  moves: 0,           // The neumber of moves made by the player
  time: 0,            // The current elapsed time
  stars: 0,           // The number of stars to be awarded
  matches: 0,         // The number of matches found by the player
  revealed: [],       // An array holding the tiles that are currently revealed
  tiles: [],          // An array holding the game tiles
  startTime: 0,       // The time at which the game was started
  timer: null,        // Handle for the timer handler
  trackEvents: false, // True if click events are currenly being tracked
  tileset: 0,         // Tileset in use
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

  mgModel.revealed = [];

  // Create a random set of tiles
  mgModel.tiles = [];
  shuffle(mgModel.tiles);

  // Take a reference for the timer and start the timer (fires once every second)
  mgModel.startTime = Date.now();
  mgModel.timer = window.setInterval(timerTick, TICK_LENGTH);
  mgModel.trackEvents = true;

  // Draw initial game state
  drawGameInfo();
  drawGrid();
}

/**
 * @description Creates an array of tile values shuffled into a random order
 * @param {Array} outputArray A reference to the array in which the shuffled values are to be stored
 */
function shuffle(outputArray) {
  // Create a temp array containing two sets of tile references
  let tilesTemp = [];

  for (let tileSet = 0; tileSet < NUM_TILESETS; tileSet++) {
    for (let tileNum = 0; tileNum < NUM_TILES; tileNum++) {
      tilesTemp.push({tile: tileNum, state: 'unmatched'});
    }
  }

  console.log('\n');    // DEVELOPMENT FEATURE
  let consoleOut = '';  // DEVELOPMENT FEATURE

  while (tilesTemp.length > 0) {
    let cellInfo = tilesTemp.splice(Math.floor(Math.random() * tilesTemp.length), 1);
    outputArray.push(cellInfo);

    if (DEBUG) {
      // DEVELOPMENT FEATURE
      consoleOut =  `${consoleOut}${cellInfo[0].tile} `;
      if (tilesTemp.length % 4 === 0) {
        console.log(consoleOut);
        consoleOut = '';
      }
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
  if (tileClicked.state === 'unmatched') {
    mgModel.moves++;
    checkStars();
    tileClicked.state = 'revealed';
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
    mgModel.revealed[0].state = 'matched';
    mgModel.revealed[1].state = 'matched';

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
    mgModel.revealed[0].state = 'unmatched';
    mgModel.revealed[1].state = 'unmatched';
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
  // Update the win text on the modal dialogue to reflect final star rating and time
  document.querySelector('#final-stars').innerHTML = drawStars();
  document.querySelector('#final-time').innerHTML = formatTime(mgModel.time);

  // Stop the timer and stop trapping click events
  window.clearInterval(mgModel.timer);
  mgModel.trackEvents = false;

  // Show the game won panel
  document.querySelector('#mask').classList.replace('hidden-mask','visible-mask');
  document.querySelector('#modal-dialog').classList.replace('hidden-panel','visible-panel');
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
  // Update the name and icon for the set selection on the model dialogue
  updateSetSelection();
  // Set up event handlers for the controls on the modal dialogue
  document.querySelector('#prev-set').addEventListener('click', changeSet);
  document.querySelector('#next-set').addEventListener('click', changeSet);
  document.querySelector('#start-game-btn').addEventListener('click', function() {
    // Hide the instructions pabel
    document.querySelector('#modal-dialog').classList.replace('visible-panel','hidden-panel');
    document.querySelector('#mask').classList.replace('visible-mask','hidden-mask');
    // Swap the instructions text for the results texture
    document.querySelector('#modal-text-start').classList.replace('visible-section', 'hidden-section');
    document.querySelector('#modal-text-result').classList.replace('hidden-section', 'visible-section');
    startGame();
  });
  document.querySelector('main').addEventListener('click', playerInput);
}

/**
 * @description Updates the current set name and icon in the set selector on the modal dialogue
 */
function updateSetSelection() {
  document.querySelector('#set-name').innerHTML = TILESETS[mgModel.tileset].name;
  document.querySelector('#set-icon').innerHTML = TILESETS[mgModel.tileset].images[0];
}

/**
 * @description Event handler called when one of the buttons to change the set is clicked
 * @param {Object} event Event structure sent to the handler
 */
function changeSet(event) {
  if (event.target.id === 'prev-set') {
    mgModel.tileset = (mgModel.tileset === 0 ? TILESETS.length - 1 : mgModel.tileset - 1);
  } else {
    mgModel.tileset = (mgModel.tileset === TILESETS.length - 1 ? 0 : mgModel.tileset + 1);
  }
  updateSetSelection();
}

/**
 * @description Handler called when the player clicks within the grid
 * @param {Object} event Event structure sent to the handler
 */
function playerInput(event) {
  // if we are currently tracking events and the click is inside one of the grid cells, select that cell
  if (mgModel.trackEvents && event.target.id.substring(0,4) === 'grid') {
    mgModel.trackEvents = false;   // Switch off event tracking until all processing and grid animation is finished
    tileSelect(parseInt(event.target.id.substring(4,6)));
  }
}

/**
 * @description Updates the info panel in the GUI (time elapsed, number of moves, number of stars)
 */
function drawGameInfo() {
  let formattedTime = formatTime(mgModel.time);
  document.querySelector('#time').innerHTML = `Time: ${formattedTime}`;
  document.querySelector('#moves').innerHTML = `Moves: ${mgModel.moves}`;
  document.querySelector('#stars').innerHTML = drawStars();
}

/**
 * @description Draws the current number of stars awarded to the player on the UI
 * @returns {String} An html string with the names of the correct glyphs to show the stars
 */
function drawStars() {
  let starHTML = '';
  for (let star = 0; star < NUM_STARS; star++) {
    if (star < mgModel.stars) {
      starHTML += 'star ';
    } else {
      starHTML += 'star_border ';
    }
  }
  return starHTML;
}

/**
 * @description Updates the grid on screen
 */
function drawGrid() {
  let gridItem = 0;
  for (let cell of mgModel.tiles) {
    let currentCell = document.querySelector(`#grid${gridItem}`);
    currentCell.innerHTML = (cell[0].state === 'unmatched' ? 'texture' : TILESETS[mgModel.tileset].images[cell[0].tile]);
    currentCell.classList.remove('selected-cell');
    if (cell[0].state === 'revealed') {
      currentCell.classList.add('selected-cell');
    }
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
  return (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
}
