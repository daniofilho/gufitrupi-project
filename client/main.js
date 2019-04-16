const Game = require('./engine/Game');

window.onload = function() {

  // # Adjust menu to fit on screen -https://stackoverflow.com/questions/31237634/auto-scale-contents-based-on-width-and-height-of-an-iframe
    adjustPageSize();

  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
  
}

function adjustPageSize() {

  var basePage = {
    width: 800,
    height: 600,
    scale: 1,
    scaleX: 1,
    scaleY: 1
  };
  
  page = document.getElementById('screen');
  
  maxWidth = document.documentElement.clientWidth;
  maxHeight = document.documentElement.clientHeight;

  var scaleX = 1, scaleY = 1;                      
  scaleX = maxWidth / basePage.width;
  scaleY = maxHeight / basePage.height;
  basePage.scaleX = scaleX;
  basePage.scaleY = scaleY;
  basePage.scale = (scaleX > scaleY) ? scaleY : scaleX;

  var newLeftPos = Math.abs(Math.floor(((basePage.width * basePage.scale) - maxWidth)/2));
  var newTopPos = Math.abs(Math.floor(((basePage.height * basePage.scale) - maxHeight)/2));

  page.style.transform = 'scale(' + basePage.scale + ')';
  //page.attr('style', '-webkit-transform:scale(' + basePage.scale + ');left:' + newLeftPos + 'px;top:' + newTopPos + 'px;');
}

/*

    TODO:

    - fit menu on screen automatically
    - enemy death animation

*/