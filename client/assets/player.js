// Player

	function Player(x0, y0) {
		
		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
				this.x0 = x0; // initial position
				this.y0 = y0;
		
			// # Properties
				this.width = 25; //px
				this.height = 25; //px
				this.speed0 = 200; // pixels per frame
				this.speed = this.speed0;
				
				this.color0 = '#FFF';
				this.color = this.color0; 
			
		// - - - Player Movement - - -
		
			this.movLeft = function(mod) { 
				this.setX( this.getX() - this.getSpeed() * mod); 
			};
			
			this.movRight = function(mod) { 
				this.setX( this.getX() + this.getSpeed() * mod); 
			};
			
			this.movUp = function(mod) { 
				this.setY( this.getY() - this.getSpeed() * mod); 
			};
			
			this.movDown = function(mod) {  
				this.setY( this.getY() + this.getSpeed() * mod); 
			};
		
		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight = function (height) { this.height = height; }
			this.setWidth = function (width) { this.width = width; }
			
			this.setColor = function (color) { this.color = color; }
			this.setSpeed = function (speed) { this.speed = speed; }

			
			// Reset player position - !!! Provavelmente não usarei dessa forma mais, a posição inicial vai depender do cenário
			
				this.resetPosition = function() {
					
					this.setX( this.x0 );
					this.setY( this.y0 );

				}
		
		// - - - Gets - - -
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
			this.getHeight = function() { return this.height; }
			
			this.getColor = function() { return this.color; }
			this.getSpeed = function() { return this.speed; }
			
		
			
		// - - - Player Render - - - 
				
			this.render = function(context) {
				
				// What to do every frame in terms of render? Draw the player
				
				context.fillStyle = this.getColor();
				context.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
			};
			
			this.noCollision = function() {
				
				// What happens if the player is not colliding?
				
				this.setSpeed(this.speed0); // Reset speed
				this.setColor(this.color0);
			}
		
	}//class
	
