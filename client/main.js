const Game = require('./engine/Game');
console.clear();
window.onload = function() {
  
  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
 
}

/**
 * 
 * TODO
 * 
 * - Remove objects grabbed from player when teleport
 * - Make players loose life when hitted by throwing object
 * 
 */