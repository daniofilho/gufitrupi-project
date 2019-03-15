// Player

	function Player(x0, y0, gameProps, ctx) {
		
		// - - - Init - - -

			this.ctx = ctx;

			// # Sprites state for player direction

				this.lookDown = function(){
					let spriteImg = new Image();
					spriteImg.src = './assets/scenario/welcome/img/water.jpg';
					return this.ctx.drawImage(spriteImg,  this.width, this.height);
				}
				this.lookUp = function(){
					let spriteImg = new Image();
					spriteImg.src = '/assets/scenario/welcome/img/water.jpg';
					return this.ctx.drawImage(spriteImg, this.width, this.height);
				}
				this.lookRight = function(){
					let spriteImg = new Image();
					spriteImg.src = './assets/scenario/welcome/img/water.jpg';
					return this.ctx.drawImage(spriteImg, this.width, this.height);
				}
				this.lookLeft = function(){
					let spriteImg = new Image();
					spriteImg.src = './assets/scenario/welcome/img/water.jpg';
					return this.ctx.drawImage(spriteImg, this.width, this.height);
				}
		
			// # Position
				this.x = x0;
				this.y = y0;
				
				this.x0 = x0; // initial position
				this.y0 = y0;

				this.chunkSize = gameProps.getProp('chunkSize');

				this.lookDirection = this.lookDown();
		
			// # Properties
				this.width = this.chunkSize; //px
				this.height = this.chunkSize * 2; //px
				this.speed0 = 10;
				this.speed = this.chunkSize / this.speed0;
			
		// - - - Player Movement - - -
		
			this.movLeft = function(mod) { 
				this.setLookDirection( this.lookLeft() );
				this.setX( this.getX() - this.getSpeed()); 
			};
			
			this.movRight = function(mod) { 
				this.setLookDirection( this.lookRight() );
				this.setX( this.getX() + this.getSpeed() ); 
			};
			
			this.movUp = function(mod) { 
				this.setLookDirection( this.lookUp() );
				this.setY( this.getY() - this.getSpeed() ); 
			};
			
			this.movDown = function(mod) {  
				this.setLookDirection( this.lookDown() );
				this.setY( this.getY() + this.getSpeed() ); 
			};
		
		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight = function (height) { this.height = height; }
			this.setWidth = function (width) { this.width = width; }
			
			this.setSpeed = function (speed) { this.speed = this.chunkSize / speed; }

			this.setLookDirection = function(lookDirection) { this.lookDirection = lookDirection; }

			
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
				context.fillStyle = this.lookDirection;
				context.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
			};
			
			this.noCollision = function() {
				
				// What happens if the player is not colliding?
				this.setSpeed(this.speed0); // Reset speed
			}
		
	}//class
	
