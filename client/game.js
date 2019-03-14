
	
	// # Init
	
		var canvas_static = document.getElementById('canvas_static');
		var contexto_estatico = canvas_static.getContext('2d');
		
		var canvas_animated = document.getElementById('canvas_animated');
		var contexto_animado = canvas_animated.getContext('2d');
		
		var canvas_shadow = document.getElementById('canvas_shadow');
		var contexto_sombra = canvas_shadow.getContext('2d');
		
		canvas_animated.width = canvas_static.width = canvas_shadow.width = 800;
		canvas_animated.height = canvas_static.height = canvas_shadow.height = 600;
	
		var time = Date.now();
		

		// # Get mouse X, Y position - DEBUG ONLY
			var mousePosition = new MousePosition(canvas_shadow, false); //canvas, debug?
				mousePosition.init();

	// # Players

		var player = new Player(300, 420); //posição x e y

	// # Scenario
		
		// Como podemos mudar o cenário posteriormente?
		var scenario = new scenarioWelcome(contexto_estatico, canvas_static, player );
			

	// # Collision detection class
	
		var collision = new Collision(canvas_animated.width, canvas_animated.height );
		
		// Add the objects to the collision vector
		collision.addArrayItem( scenario.getRenderItems() );
		collision.addArrayItem( scenario.getRenderItemsAnimated() );

		
	// # Render
		
		var render_static = new Render(contexto_estatico, canvas_static); // Render executed only once
		var render_animated = new Render(contexto_animado, canvas_animated); //Render with animated objects only
		//var render_shadow = new Render(contexto_sombra, canvas_shadow, "easy", player); //Render with shadow effect - DEACTIVATED
			
		// Add items to be rendered
		
		render_static.setScenario(scenario); // set the scenario
		render_static.addArrayItem(scenario.getRenderItems()); // Get all items from the scenario that needs to be rendered

		render_animated.addArrayItem( scenario.getRenderItemsAnimated() ); // Get all animated items from the scenario that needs to be rendered
		render_animated.addItem( player ); // Adds the player to the animation render

			

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
			

			// # Movements - - - - - - - 
			
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

			updateGame( (Date.now() - time) / 1000 ); // Delta time, controls de FPS
		    
		    render_animated.start( Date.now() - time ); 
			//render_shadow.start( Date.now() - time ); 
			
		    time = Date.now();
		
			// Runs only when the browser is in focus
			requestAnimationFrame(runGame); 	
			
			console.log('running');
		};
	
	// # Starts the game
		
		render_static.start( Date.now() - time );  // Render the static layers only once
		
		runGame();	// GO GO GO
	
