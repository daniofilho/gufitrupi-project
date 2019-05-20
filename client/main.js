const Game = require('./engine/core/Game');
console.clear();
window.onload = function() {
  
  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
 
}

/**
 * 
 * TODO:
 * 
 *  - Make objects grab by player
 *  - Drops items on stages and make it save when teleporting
 *  - Doors and Keys state not saving when u enter a stage previusly saved - maybe dont add items with same name on render layers ? 
 */