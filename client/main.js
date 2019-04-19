const Game = require('./engine/Game');

window.onload = function() {
  
  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
 
}