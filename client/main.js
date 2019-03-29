const Game = require('./engine/Game');

window.onload = function() {

  let game = new Game();

  game.run();

}