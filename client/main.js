const Game = require('./engine/core/Game');
console.clear();
window.onload = function() {
  
  // # Triggers new game only when click on button - needed some interaction to activate the sound
  let startGameButton = document.getElementById('start-game-button');
  startGameButton.addEventListener('click', function() {
    runGame();
  }, false);

  // Debug
  if( window.autoload ) {
    runGame();
  }

  // # Start the game
  function runGame() {
    
    document.getElementById('first-screen').style.display = "none";

    let game = new Game();
    window.game = game;
    game.run();

  }
 
}