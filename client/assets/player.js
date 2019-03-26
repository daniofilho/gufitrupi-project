class Player {

	constructor(x0, y0, gameProps, playerNumber) {
    // # Sprite
      if( playerNumber == 1 ) {
        this.playerSprite = document.getElementById('sprite_player_one');
      }
      if( playerNumber == 2 ) {
        this.playerSprite = document.getElementById('sprite_player_two');
      }
      
      this.spriteProps = {
        sprite_width: 20, // Player size inside sprite
        sprite_height: 40
      }
      this.step = [];
      this.defaultStep = 1;
      this.initialStep = 3;
      this.stepCount = this.defaultStep;
      this.maxSteps = 8;

      // Controls the player FPS Animation
      this.fpsInterval = 1000 / 12; // 1000 / FPS
      this.deltaTime = Date.now();

      this.hideSprite = false;
    
    // # Position
      this.x = x0;
      this.y = y0;
      
      this.x0 = x0; // initial position
      this.y0 = y0;

      this.chunkSize = gameProps.getProp('chunkSize');

    // # Properties
      this.width = this.chunkSize; //px
      this.height = this.chunkSize * 2; //px
      this.speed0 = 6;
      this.speed = this.chunkSize / this.speed0;

      this.lifes = 6;
      
      this.isCollidable = true;

      this.isMoving = false;

      this.name = "Player " + playerNumber;
      this.playerNumber = playerNumber;
      
      this.hasCollisionEvent = false;
      this.stopOnCollision = true;

      this.run();
  }
        
  // # Sprites state for player direction
    
    lookDown(){
      this.spriteProps.direction = 'down';
      
      // Steps
      this.step[1] = { x: 0, y: 0 };
      this.step[2] = { x: 20, y: 0 };
      this.step[3] = { x: 40, y: 0 };
      this.step[4] = { x: 60, y: 0 };
      this.step[5] = { x: 80, y: 0 };
      this.step[6] = { x: 100, y: 0 };
      this.step[7] = { x: 120, y: 0 };
      this.step[8] = { x: 140, y: 0 };
      
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;

    }
    
    lookUp(){
      this.spriteProps.direction = 'up';
      
      this.step[1] = { x: 0, y: 40 };
      this.step[2] = { x: 0, y: 40 };
      this.step[3] = { x: 40, y: 40 };
      this.step[4] = { x: 60, y: 40 };
      this.step[5] = { x: 80, y: 40 };
      this.step[6] = { x: 100, y: 40 };
      this.step[7] = { x: 120, y: 40 };
      this.step[8] = { x: 140, y: 40 };
      
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;
    }
    
    lookRight(){
      this.spriteProps.direction = 'right';
      
      this.step[1] = { x: 0, y: 80 };
      this.step[2] = { x: 20, y: 80 };
      this.step[3] = { x: 40, y: 80 };
      this.step[4] = { x: 60, y: 80 };
      this.step[5] = { x: 80, y: 80 };
      this.step[6] = { x: 100, y: 80 };
      this.step[7] = { x: 120, y: 80 };
      this.step[8] = { x: 140, y: 80 };
      
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;
    }
        
		lookLeft(){
      this.spriteProps.direction = 'left';
          
      this.step[1] = { x: 0, y: 120 };
      this.step[2] = { x: 20, y: 120 };
      this.step[3] = { x: 40, y: 120 };
      this.step[4] = { x: 60, y: 120 };
      this.step[5] = { x: 80, y: 120 };
      this.step[6] = { x: 100, y: 120 };
      this.step[7] = { x: 120, y: 120 };
      this.step[8] = { x: 140, y: 120 };
      
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;
    }

  // # Controls the player FPS Movement independent of game FPS
    canRenderNextFrame() {
      let now = Date.now();
			let elapsed = now - this.deltaTime;
      if (elapsed > this.fpsInterval) {
	      this.deltaTime = now - (elapsed % this.fpsInterval);
        return true;
			} else {
        return false;
      }
    }  
    
	// # Player Movement
		
		movLeft() { 
      this.increaseStep();
      this.setLookDirection( this.lookLeft() );
      this.setX( this.getX() - this.getSpeed()); 
    };
			
		movRight() { 
      this.increaseStep();
      this.setLookDirection( this.lookRight() );
      this.setX( this.getX() + this.getSpeed() ); 
    };
			
		movUp() { 
      this.increaseStep();
      this.setLookDirection( this.lookUp() );
      this.setY( this.getY() - this.getSpeed() ); 
    };
			
		movDown() {  
      this.increaseStep();
      this.setLookDirection( this.lookDown() );
      this.setY( this.getY() + this.getSpeed() ); 
    };

    handleMovement( keysDown ) {
      
      if ( this.hideSprite ) return;

      // Player 1 Controls
      if( this.playerNumber == 1 ) {
        if (37 in keysDown) // Left
          this.movLeft();
          
        if (38 in keysDown) // Up  
          this.movUp();
          
        if (39 in keysDown) // Right
          this.movRight();

        if (40 in keysDown) // Down
          this.movDown();
      }
      
      // Player 2 Controls
      if( this.playerNumber == 2 ) {
        if (65 in keysDown) // Left
          this.movLeft();
          
        if (87 in keysDown) // Up  
          this.movUp();
          
        if (68 in keysDown) // Right
          this.movRight();

        if (83 in keysDown) // Down
          this.movDown();
      }
      

    }
		
	// # Sets
		
		setX(x) { this.x = x; }
		setY(y) { this.y = y; }
			
		setHeight(height) { this.height = height; }
		setWidth(width) { this.width = width; }
			
		setSpeed(speed) { this.speed = this.chunkSize / speed; }

		setLookDirection(lookDirection) { this.lookDirection = lookDirection; }
		triggerLookDirection(direction) { 
      this.spriteProps.direction = direction;
      this.resetStep();
    }

		resetPosition() {
			this.setX( this.x0 );
		  this.setY( this.y0 );
    }
		
	// # Gets
    
    getLifes() { return this.lifes; }
  
	  getX() { return this.x; }
		getY() { return this.y; }
			
	  getWidth() { return this.width; }
    getHeight() { return this.height; }
      
    //The collision will be just half of the player height
    getCollisionHeight() { return this.height / 2; }
    getCollisionWidth() { return this.width; }
    getCollisionX() {  return this.x; }
    getCollisionY() {  return this.y + this.getCollisionHeight(); }

    getCenterX() { return this.getCollisionX() + this.getCollisionWidth(); }
    getCenterY() { return this.getCollisionY() + this.getCollisionHeight(); }
			
		getColor() { return this.color; }
		getSpeed() { return this.speed; }
      
    getSpriteProps() { return this.spriteProps; }
      
    increaseStep() {
      if(this.canRenderNextFrame()) {
        this.stepCount++;
        if( this.stepCount > this.maxSteps ) {
          this.stepCount = this.initialStep;
        }
      }
    }
    resetStep() {
      this.stepCount = this.defaultStep;
      switch ( this.spriteProps.direction ) {
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
		hidePlayer() { this.hideSprite = true; }
    showPlayer() { this.hideSprite = false; }
    
	// # Player Render
				
	  render(ctx) {
      
      if ( this.hideSprite ) return;

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
        this.playerSprite,  
        this.spriteProps.clip_x, this.spriteProps.clip_y, 
        this.spriteProps.sprite_width, this.spriteProps.sprite_height, 
        props.x, props.y, props.w, props.h
      );	
      // DEBUG COLLISION
      if( window.debug ) {
        ctx.fillStyle = "rgba(0,0,255, 0.4)";
        ctx.fillRect( props.x, this.getCollisionY(), props.w, this.getCollisionHeight() );
      }
		};
  
  // # Collision
    
    // Has a collision Event?
    triggersCollisionEvent() { return this.hasCollisionEvent; }

    // Will it Stop the other object if collides?
    stopIfCollision() { return this.stopOnCollision; }

		noCollision() {
			// What happens if the player is not colliding?
			this.setSpeed(this.speed0); // Reset speed
    }
      
    collision(object) {
      return this.isCollidable;
    };

  run() {
    this.lookDirection = this.lookDown();
  }
		
}//class

module.exports = Player;
