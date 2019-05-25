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
 *  - fix and adjust all players sprite
 *  - what happens when player dies? handle it
 *  - keys and doors bugged. Keys are on low layer than doors
 *  - Open github repo
 */