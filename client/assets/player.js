// Player

	function Player(x0, y0, gameProps) {
		
		// - - - Init - - -
			
    // # Sprite
				//let playerSprite = new Image();
        //playerSprite.src = './assets/sprites/player_one.png';
        let playerSprite = document.getElementById('sprite_player_one'); // Pegar esse id da instancia!!
        
        // http://getspritexy.com/ <= Para mapear os sprites!
        let spriteProps = {
          sprite_width: 20, // Player size inside sprite
          sprite_height: 40
        }
        let step = [];
        let defaultStep = 1;
        let initialStep = 1;
        let stepCount = initialStep;
        let maxSteps = 8;
        
        // Sprites state for player direction
				this.lookDown = function(){
          spriteProps.direction = 'down';
          
          // Steps
          step[1] = { x: 0, y: 0 };
          step[2] = { x: 20, y: 0 };
          step[3] = { x: 40, y: 0 };
          step[4] = { x: 60, y: 0 };
          step[5] = { x: 80, y: 0 };
          step[6] = { x: 100, y: 0 };
          step[7] = { x: 120, y: 0 };
          step[8] = { x: 140, y: 0 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;

				}
				this.lookUp = function(){
          spriteProps.direction = 'up';
          
          // Steps
          step[1] = { x: 0, y: 40 };
          step[2] = { x: 0, y: 40 };
          step[3] = { x: 40, y: 40 };
          step[4] = { x: 60, y: 40 };
          step[5] = { x: 80, y: 40 };
          step[6] = { x: 100, y: 40 };
          step[7] = { x: 120, y: 40 };
          step[8] = { x: 140, y: 40 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;
				}
				this.lookRight = function(){
          spriteProps.direction = 'right';
          
          // Steps
          step[1] = { x: 0, y: 80 };
          step[2] = { x: 20, y: 80 };
          step[3] = { x: 40, y: 80 };
          step[4] = { x: 60, y: 80 };
          step[5] = { x: 80, y: 80 };
          step[6] = { x: 100, y: 80 };
          step[7] = { x: 120, y: 80 };
          step[8] = { x: 140, y: 80 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;
				}
				this.lookLeft = function(){
          spriteProps.direction = 'left';
          
          // Step 1
          step[1] = { x: 0, y: 120 };
          step[2] = { x: 20, y: 120 };
          step[3] = { x: 40, y: 120 };
          step[4] = { x: 60, y: 120 };
          step[5] = { x: 80, y: 120 };
          step[6] = { x: 100, y: 120 };
          step[7] = { x: 120, y: 120 };
          step[8] = { x: 140, y: 120 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;
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
				this.height = this.chunkSize * 3; //px
				this.speed0 = 3;
				this.speed = this.chunkSize / this.speed0;

			
			
		// - - - Player Movement - - -
		
			this.movLeft = function() { 
        this.increaseStep();
				this.setLookDirection( this.lookLeft() );
				this.setX( this.getX() - this.getSpeed()); 
			};
			
			this.movRight = function() { 
        this.increaseStep();
				this.setLookDirection( this.lookRight() );
				this.setX( this.getX() + this.getSpeed() ); 
			};
			
			this.movUp = function() { 
        this.increaseStep();
				this.setLookDirection( this.lookUp() );
				this.setY( this.getY() - this.getSpeed() ); 
			};
			
			this.movDown = function() {  
        this.increaseStep();
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
			this.setLookDirectionVal = function(string) { this.lookDirectionVar = string; }

			
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
      
      //The collision will be just half of the player height
      this.getCollisionHeight = function() { return this.height / 2; }
      this.getCollisionY = function() { return this.y + this.getCollisionHeight(); }
			
			this.getColor = function() { return this.color; }
			this.getSpeed = function() { return this.speed; }
      
      this.getSpriteProps = function() { return spriteProps; }
      
      this.increaseStep = function() {
        stepCount++;
        if( stepCount > maxSteps ) {
          stepCount = initialStep;
        }
      }
      this.resetStep = function() {
        stepCount = defaultStep;
        switch ( spriteProps.direction ) {
          case 'left': 
            this.setLookDirection( this.lookLeft() );
            break;
          case 'right': 
            this.setLookDirection( this.lookRight() );
            break;
          case 'up': 
            this.setLookDirection( this.lookUp() );
            break;
          case 'down': 
            this.setLookDirection( this.lookDown() );
            break;
        }
      }
		
			
		// - - - Player Render - - - 
				
			this.render = function(ctx) {
        
        // What to do every frame in terms of render? Draw the player
				let props = {
					x: this.getX(),
					y: this.getY(),
					w: this.getWidth(),
					h: this.getHeight()
				} 
				/*playerSprite.onload = function() { // onload não quer carregar no player..pq ??
					ctx.drawImage(playerSprite, props.x, props.y, props.w, props.h);	
        }	*/
        //drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        // # https://www.w3schools.com/tags/canvas_drawimage.asp
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          playerSprite,  
          spriteProps.clip_x, spriteProps.clip_y, 
          spriteProps.sprite_width, spriteProps.sprite_height, 
          props.x, props.y, props.w, props.h
        );	
        // DEBUG COLLISION
        //ctx.fillStyle = "rgba(0,100,0, 0.5)";
        //ctx.fillRect( props.x, props.y + (props.h / 2), props.w, props.h / 2);
			};
			
			this.noCollision = function() {
				// What happens if the player is not colliding?
				this.setSpeed(this.speed0); // Reset speed
			}
		
	}//class
	
