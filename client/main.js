const Game = require('./engine/Game');

window.onload = function() {

  // # Adjust menu to fit on screen -https://stackoverflow.com/questions/31237634/auto-scale-contents-based-on-width-and-height-of-an-iframe
   /* var mainMenu = document.getElementById('mainMenu'),
    iframedoc = mainMenu.contentDocument || mainMenu.contentWindow.document;
    iframedoc.body.innerHTML = source, iframeinitialwidth = $('iframe').width();*/

  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
  
}

/*

    TODO:

    - make enemy stop moving for a while when hits a player
    - fit menu on screen automatically
    - enemy death animation
    - check if player collides before enemy pushes it


*/