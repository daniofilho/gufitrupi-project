const gameProperties = require('./gameProperties');
const scenarioPrototype = require('./assets/scenario/Prototype/scenarioPrototype');
const Player = require('./assets/Player');
const Collision = require('./engine/Collision');
const Render = require('./engine/Render');
const UI = require('./engine/UI');

window.onload = function() {

  // # Init

    var fpsInterval, now, deltaTime, elapsed;
    var gameProps = new gameProperties();

    var canvasStatic = document.getElementById('canvas_static');
    var contextStatic = canvasStatic.getContext('2d');

    var canvasLayers = document.getElementById('canvas_layers');
    var contextLayers = canvasLayers.getContext('2d');
    
    var canvasUI = document.getElementById('canvas_ui');
    var contextUI = canvasUI.getContext('2d');

    canvasLayers.width = canvasStatic.width = canvasUI.width = gameProps.getProp('canvasWidth');
    canvasLayers.height = canvasStatic.height = canvasUI.height = gameProps.getProp('canvasHeight');

    var players = new Array();

  // # Scenario

    var scenario = new scenarioPrototype(contextStatic, canvasStatic, gameProps );

  // # Players

    var player = new Player( scenario.getPlayer1StartX(), scenario.getPlayer1StartY(), gameProps, 1 ); 
    players.push(player);
    var player2 = new Player( scenario.getPlayer2StartX(), scenario.getPlayer2StartY(), gameProps, 2 ); 
    players.push(player2);

    players.map( (player) => {
      scenario.addPlayer(player);
    });
  
  // # UI
    
    var _UI = new UI(player, player2, gameProps);

  // # Collision detection class

    var collision = new Collision(canvasLayers.width, canvasLayers.height );

  // # Render

    var renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
    var renderLayers = new Render(contextLayers, canvasLayers); //Render with animated objects only
    var renderUI     = new Render(contextUI, canvasUI); 

    // Add items to be rendered

    renderStatic.setScenario(scenario); // set the scenario
    
  // # Keyboard Events

    var keysDown = {};
    window.addEventListener('keydown', function(e) {
      keysDown[e.keyCode] = true;
    });
    window.addEventListener('keyup', function(e) {
      delete keysDown[e.keyCode];
      players.map( (player) => {
        player.resetStep();
      });
    });
  
  // Unpause the game when click on screen
    window.addEventListener('keypress', function(e) {
      if( e.keyCode == 13 ) { // Enter
        window.togglePause();
      }
    });

  // # The Game Loop

    function updateGame(deltaTime) {

      if( window.isPaused() ) return;
      
      renderStatic.start( deltaTime );  // Static can also change, because it is the scenario... maybe will change this names to layers
      renderUI.start( deltaTime );
      renderLayers.start( deltaTime );

      // # Add the objects to the collision vector
      collision.clearArrayItems();
      collision.addArrayItem( scenario.getRenderItems() );
      collision.addArrayItem( scenario.getLayerItems() );
      /*
      players.map( (player) => {
        collision.addItem(player);
      });*/

      // "Static" Render
      renderStatic.clearArrayItems();
      renderStatic.addArrayItem(scenario.getRenderItems()); // Get all items from the scenario that needs to be rendered

      // Layers Render
      renderLayers.clearArrayItems();
      renderLayers.addArrayItem( scenario.getLayerItems() ); // Get all animated items from the scenario that needs to be rendered
      players.map( (player) => {
        renderLayers.addItem( player ); // Adds the player to the animation render
      });

      // UI Render
      renderUI.clearArrayItems();
      renderUI.addArrayItem( _UI.getNewRenderItems());
      
      // # Movements
      players.map( (player) => {
        player.handleMovement( keysDown );
      });
      
      // # Check if player is colliding
      players.map( (player) => {
        collision.check(player);
      });

    };

    // # "Thread" tha runs the game
    function runGame(fps) {
      fpsInterval = 1000 / fps;
      deltaTime = Date.now();
      startTime = deltaTime;
      gameLoop();
    }

    function gameLoop() {

      // calc elapsed time since last loop
      now = Date.now();
      elapsed = now - deltaTime;

      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        deltaTime = now - (elapsed % fpsInterval);

        updateGame( deltaTime );

      }

      // Runs only when the browser is in focus
      // Request another frame
      requestAnimationFrame(gameLoop);

    }

  // # Starts the game
    runGame( gameProps.getProp('fps') );	// GO GO GO

}