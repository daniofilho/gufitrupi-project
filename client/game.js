const gameProperties = require('./gameProperties');
const scenarioPrototype = require('./assets/scenario/Prototype/scenarioPrototype');
const Player = require('./assets/player');
const Collision = require('./engine/collision');
const Render = require('./engine/render');

window.onload = function() {
	
	// # Init
		
		var fpsInterval, now, deltaTime, elapsed;
    var gameProps = new gameProperties();
    
		var canvasStatic = document.getElementById('canvas_static');
		var contextStatic = canvasStatic.getContext('2d');
		
		var canvasAnimated = document.getElementById('canvas_animated');
		var contextAnimated = canvasAnimated.getContext('2d');
    
		canvasAnimated.width = canvasStatic.width = gameProps.getProp('canvasWidth');
		canvasAnimated.height = canvasStatic.height = gameProps.getProp('canvasHeight');

	// # Scenario
		
		var scenario = new scenarioPrototype(contextStatic, canvasStatic, gameProps );

	// # Players

		var player = new Player( scenario.getPlayerStartX(), scenario.getPlayerStartY(), gameProps, contextAnimated ); //posição x e y

	// # Collision detection class
	
		var collision = new Collision(canvasAnimated.width, canvasAnimated.height );
		
		// Add the objects to the collision vector
		collision.addArrayItem( scenario.getRenderItems() );
		collision.addArrayItem( scenario.getRenderItemsAnimated() );

		
	// # Render
		
		var renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
		var renderAnimated = new Render(contextAnimated, canvasAnimated); //Render with animated objects only
			
		// Add items to be rendered
		
		renderStatic.setScenario(scenario); // set the scenario
		renderStatic.addArrayItem(scenario.getRenderItems()); // Get all items from the scenario that needs to be rendered
		
		renderAnimated.addArrayItem( scenario.getRenderItemsAnimated() ); // Get all animated items from the scenario that needs to be rendered
		renderAnimated.addItem( player ); // Adds the player to the animation render


	// # Keyboard Events
	
		var keysDown = {};
		window.addEventListener('keydown', function(e) {
		  keysDown[e.keyCode] = true;
		});
		window.addEventListener('keyup', function(e) {
			delete keysDown[e.keyCode];
			player.resetStep();
		});


	// # The Game Loop
			
		function updateGame(mod) {

			// # Movements 
      player.handleMovement( keysDown );
      
      // # Check if player is colliding
      collision.check(player);
		    
		};


	// # "Thread" tha runs the game
		function runGame(fps) {
			fpsInterval = 1000 / fps;
			deltaTime = Date.now();
			startTime = deltaTime;
			gameLoop();
		}
		
		function gameLoop() {

			// Runs only when the browser is in focus
			// Request another frame
			requestAnimationFrame(gameLoop);

			// calc elapsed time since last loop
			now = Date.now();
			elapsed = now - deltaTime;
	
			// if enough time has elapsed, draw the next frame
			if (elapsed > fpsInterval) {
	
				// Get ready for next frame by setting then=now, but also adjust for your
				// specified fpsInterval not being a multiple of RAF's interval (16.7ms)
				deltaTime = now - (elapsed % fpsInterval);
	
				updateGame( deltaTime );
		    
				renderAnimated.start( deltaTime ); 
	
			}
			
		};
	
	// # Starts the game
		
		renderStatic.start( deltaTime );  // Render the static layers only once
		
		runGame( gameProps.getProp('fps') );	// GO GO GO
	
}