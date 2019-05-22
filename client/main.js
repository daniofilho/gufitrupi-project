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
 *  - Drops items on stages and make it save when teleporting
 * 
 */