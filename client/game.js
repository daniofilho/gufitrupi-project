window.onload = function() {
	
	// # Init
    var gameProps = new gameProperties();
    
		var canvasStatic = document.getElementById('canvas_static');
		var contextStatic = canvasStatic.getContext('2d');
		
		var canvasAnimated = document.getElementById('canvas_animated');
		var contextAnimated = canvasAnimated.getContext('2d');

		//var canvas_shadow = document.getElementById('canvas_shadow');
		//var context_shadow = canvas_shadow.getContext('2d');
    
		canvasAnimated.width = canvasStatic.width = gameProps.getProp('canvasWidth');
		canvasAnimated.height = canvasStatic.height = gameProps.getProp('canvasHeight');
	
		// # Get mouse X, Y position - DEBUG ONLY
			/*var mousePosition = new MousePosition(canvas_shadow, false); //canvas, debug?
				mousePosition.init();*/


	// # Scenario
		
		var scenario = new scenarioWelcome(contextStatic, canvasStatic, gameProps );

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
		//var render_shadow = new Render(context_shadow, canvas_shadow, "easy", player); //Render with shadow effect - DEACTIVATED
			
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
		});


	// # The Game Loop
			
		function updateGame(mod) {

			// # Movements 
			
				var tempX = player.getX();
				var tempY = player.getY();
				
				if (37 in keysDown) { //left
					
					player.movLeft(mod);// Walk - PRECISO REFAZER ESSE MOVIMENTO
				
					if ( collision.check(player) == true ) // If collide,  walk back
						player.setX(tempX);
			
				}
				
				if (38 in keysDown) { //Up  
					
					player.movUp(mod);
					
					if ( collision.check(player) == true ) 	
						player.setY(tempY);
				
				}
				
				if (39 in keysDown) { //right
					
					player.movRight(mod);
					
					if ( collision.check(player) == true )  
						player.setX(tempX);
				
				}
				
				if (40 in keysDown) { // down
					
					player.movDown(mod);
					
					if ( collision.check(player) == true ) 
						player.setY(tempY);
					
				}
		    
		};


	// # "Thread" tha runs the game

		function runGame() {

			updateGame( gameProps.getProp('deltaTime') ); // Delta time, controls de FPS
		    
		  renderAnimated.start( gameProps.getProp('deltaTime') ); 
			//render_shadow.start( Date.now() - time ); 

			// Runs only when the browser is in focus
			requestAnimationFrame(runGame); 	
		
		};
	

	// # Starts the game
		
		renderStatic.start( gameProps.getProp('deltaTime') );  // Render the static layers only once
		
		runGame();	// GO GO GO
	
}