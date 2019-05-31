(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Sprite = require('../engine/core/Sprite');

class Player {

	constructor(gameProps, playerNumber, playerProps) {
    // # Sprite
      if( playerNumber == 1 ) {
        this.playerSprite = document.getElementById('sprite_player_one');
      }
      if( playerNumber == 2 ) {
        this.playerSprite = document.getElementById('sprite_player_two');
      }

      this.sprite = new Sprite( this.playerSprite, 300, 960, 20, 40);
      
      this.spriteProps = {};
      
      this.step = [];
      this.defaultStep = 1;
      this.initialStep = 2;
      this.stepCount = this.defaultStep;
      this.maxSteps = 8;

      // Controls the player FPS Animation
      this.fpsInterval = 1000 / 12; // 1000 / FPS
      this.deltaTime = Date.now();

      this.chunkSize = gameProps.getProp('chunkSize');
    
    // # Position
      this.x = 0;
      this.y = 0;
      
      this.x0 = 0; // initial position
      this.y0 = 0;
    
    // # Properties
      this.width = this.chunkSize; //px
      this.height = this.chunkSize * 2; //px
      
      this.speed0 = 0.17;
      this.speed = this.chunkSize * this.speed0;
      
      this.name = "player_" + playerNumber;
      this.playerNumber = playerNumber;
      this.type = "player";

      this.grabing = false;
      this.walking = false;
      
    // # Events  
      
      this.isCollidable = true;
      this.isMoving = false;
      this.hideSprite = false;
      this.hasCollisionEvent = true;
      this.stopOnCollision = true;
    
      // # Collision
      this.collisionWidth = this.width * 0.8;
      this.collisionHeight = this.height * 0.3;
      this.CollisionXFormula = this.width * 0.1; // Used to set collision X when setting X 
      this.CollisionYFormula = this.height * 0.7; 
      this.collisionX = 0;//this.x0 + this.CollisionXFormula;
      this.collisionY = 0;//this.y0 + this.CollisionYFormula;

      this.collisionX0 = this.collisionX;
      this.collisionY0 = this.collisionY;

      // Grab/Pick Items Collision Box
      this.grabCollisionWidth = 0;
      this.grabCollisionHeight = 0;
      this.grabCollisionX = 0;
      this.grabCollisionY = 0;

      this.objectGrabbed = null;

      // # Life
      this.defaultLifes = 6;
      this.lifes = this.defaultLifes;
      
      this.canBeHurt = true;
      this.hurtCoolDownTime = 2000; //2s

      // Player Props if has
      if( playerProps ) {
        this.lifes = playerProps.lifes;
      }

      this.walkSound = false;
      this.useSound = false;
      this.hurtSound = false;
      this.grabSound = false;
      
      this.run();
  }

  /*
    # Sounds
  */
    initSounds() {
      // Walk
      this.walkSound = new Howl({ src: ['./sounds/player/walk.mp3'], loop: true, volume: 0.6 });
      // Use
      this.useSound = new Howl({ src: ['./sounds/player/use.mp3'] });
      // Hurt
      this.hurtSound = new Howl({ src: ['./sounds/player/hurt.mp3'], volume: 0.5 });
      // Grab
      this.grabSound = new Howl({ src: ['./sounds/player/grab.mp3'] });
    }

  /* 
      Grab/Pick Items Collision Box
  */

    checkGrabbingObjects() {
      let hasGrabObject = false;
      // Check if player has grabbed items
      let renderedItems = window.game.scenario.getStaticItems();
      for( let i in renderedItems ) {
        let item = renderedItems[i];
        if( item.grabbed && item.playerWhoGrabbed == this.playerNumber ) {
          let obj = item;
          
          obj.grabHandler(this.playerNumber);
          this.grabObject( obj );

          this.grabing = true;
          this.resetStep();
          hasGrabObject = true;

          return obj;
        }
      }
      
      if( ! hasGrabObject ) {
        this.setNotGrabbing();
      }
      return false;
    }
    checkItemOnGrabCollisionBox() {
      return window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
    }
    
    isGrabing() { return this.grabing; }
    setNotGrabbing(){
      this.removeGrabedObject();
      this.resetStep();
    }
    removeGrabedObject() { 
      this.grabing = false;
      this.objectGrabbed = false;
    }
    triggerGrab(){
      
      // Check if has a "_CanGrab" item colliding with grab hit box and "pick" item
      if( ! this.isGrabing() ) {
        let object = window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
        if( object && object.canGrab ) {
          if( object.isGrabbed() ) return; // avoid players grabbing the same object
          object.grabHandler(this.playerNumber);
          this.grabObject( object );
        } else {
          this.grabSound.play();
        }
        this.grabing = !this.grabing;
        this.resetStep();
      } else {
        if( this.objectGrabbed ) {
          // Drop if has nothing o player grab collision box
          let object = window.game.collision.justCheckAll(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
          if( !object ) {
            this.objectGrabbed.drop( this.spriteProps.direction, this.getHeight() ); // Throw away object
            this.objectGrabbed = false; // remove grabbed
            this.grabing = !this.grabing;
            this.resetStep();
          }
        } else {
          this.grabSound.play();
          this.grabing = !this.grabing;
          this.resetStep();
        }
      }

    }

    // Use items
    triggerUse() {
      // If has object in hand, use it
      if( this.objectGrabbed ) {
        this.objectGrabbed.use( this.spriteProps.direction, this.getHeight(), this );
      } else {
        // If not, try to use the one on front
        let object = window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
        if( object && object.canUse ) {
          object.useHandler( this.spriteProps.direction );
        } else {
          this.useSound.play();
        }
      }
    }

    getGrabCollisionHeight() { return this.grabCollisionHeight; }
    getGrabCollisionWidth() { return this.grabCollisionWidth; }
    getGrabCollisionX() {  return this.grabCollisionX; }
    getGrabCollisionY() {  return this.grabCollisionY; }

    // Attach an item to player
    grabObject( object ) {
      this.objectGrabbed = object;
      this.updateGrabbedObjectPosition();
    }

    // Set GrabCollision X and Y considering player look direction
    updateGrabCollisionXY() {
      switch(this.spriteProps.direction) {
        case 'down':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX;
          this.grabCollisionY = this.collisionY + this.collisionHeight;
          break;

        case  'up':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX;
          this.grabCollisionY = this.collisionY - this.grabCollisionHeight;
          break;
        
        case 'left':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX - this.grabCollisionWidth;
          this.grabCollisionY = this.collisionY;
          break;
        
        case 'right':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX + this.collisionWidth;
          this.grabCollisionY = this.collisionY;
          break;
      }

      // If has some object grabbed, update position
      if( this.objectGrabbed ) {
        this.updateGrabbedObjectPosition();
      }
    }

    updateGrabbedObjectPosition() {
      this.objectGrabbed.updateX( this.getX() );
      this.objectGrabbed.updateY( this.getY() - this.objectGrabbed.getHeight() +  ( this.getHeight() * 0.1 )  );
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
        
  /*
    Sprite / Animation
  */

    getSpriteProps() { return this.spriteProps; }

    
		hidePlayer() { this.hideSprite = true; }
    showPlayer() { this.hideSprite = false; }
    
    lookDown(){
      this.spriteProps.direction = 'down';
      
      // Steps
      if( this.isGrabing() ) {
        this.step[1] = this.sprite.getFrame( 60 );
        this.step[2] = this.sprite.getFrame( 61 );
        this.step[3] = this.sprite.getFrame( 62 );
        this.step[4] = this.sprite.getFrame( 63 );
        this.step[5] = this.sprite.getFrame( 64 );
        this.step[6] = this.sprite.getFrame( 65 );
        this.step[7] = this.sprite.getFrame( 66 );
        this.step[8] = this.sprite.getFrame( 67 );
      } else {
        this.step[1] = this.sprite.getFrame( 0 );
        this.step[2] = this.sprite.getFrame( 1 );
        this.step[3] = this.sprite.getFrame( 2 );
        this.step[4] = this.sprite.getFrame( 3 );
        this.step[5] = this.sprite.getFrame( 4 );
        this.step[6] = this.sprite.getFrame( 5 );
        this.step[7] = this.sprite.getFrame( 6 );
        this.step[8] = this.sprite.getFrame( 7 );
      }
      
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;

    }
    
    lookUp(){
      this.spriteProps.direction = 'up';
      
      if( this.isGrabing() ) {
        this.step[1] = this.sprite.getFrame( 105 );
        this.step[2] = this.sprite.getFrame( 105 );
        this.step[3] = this.sprite.getFrame( 107 );
        this.step[4] = this.sprite.getFrame( 108 );
        this.step[5] = this.sprite.getFrame( 109 );
        this.step[6] = this.sprite.getFrame( 110 );
        this.step[7] = this.sprite.getFrame( 111 );
        this.step[8] = this.sprite.getFrame( 112 );
      } else {
        this.step[1] = this.sprite.getFrame( 15 );
        this.step[2] = this.sprite.getFrame( 15 );
        this.step[3] = this.sprite.getFrame( 17 );
        this.step[4] = this.sprite.getFrame( 18 );
        this.step[5] = this.sprite.getFrame( 19 );
        this.step[6] = this.sprite.getFrame( 20 );
        this.step[7] = this.sprite.getFrame( 21 );
        this.step[8] = this.sprite.getFrame( 22 );
      }
            
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;
    }
    
    lookRight(){
      this.spriteProps.direction = 'right';
      
      if( this.isGrabing() ) {
        this.step[1] = this.sprite.getFrame( 75 );
        this.step[2] = this.sprite.getFrame( 76 );
        this.step[3] = this.sprite.getFrame( 77 );
        this.step[4] = this.sprite.getFrame( 78 );
        this.step[5] = this.sprite.getFrame( 79 );
        this.step[6] = this.sprite.getFrame( 80 );
        this.step[7] = this.sprite.getFrame( 81 );
        this.step[8] = this.sprite.getFrame( 82 );
      } else {
        this.step[1] = this.sprite.getFrame( 30 );
        this.step[2] = this.sprite.getFrame( 31 );
        this.step[3] = this.sprite.getFrame( 32 );
        this.step[4] = this.sprite.getFrame( 33 );
        this.step[5] = this.sprite.getFrame( 34 );
        this.step[6] = this.sprite.getFrame( 35 );
        this.step[7] = this.sprite.getFrame( 36 );
        this.step[8] = this.sprite.getFrame( 37 );
      }
      
      this.spriteProps.clip_x = this.step[this.stepCount].x;
      this.spriteProps.clip_y = this.step[this.stepCount].y;
    }
        
		lookLeft(){
      this.spriteProps.direction = 'left';
      
      if( this.isGrabing() ) {
        this.step[1] = this.sprite.getFrame( 90 );
        this.step[2] = this.sprite.getFrame( 91 );
        this.step[3] = this.sprite.getFrame( 92 );
        this.step[4] = this.sprite.getFrame( 93 );
        this.step[5] = this.sprite.getFrame( 94 );
        this.step[6] = this.sprite.getFrame( 95 );
        this.step[7] = this.sprite.getFrame( 96 );
        this.step[8] = this.sprite.getFrame( 97 );
      } else {
        this.step[1] = this.sprite.getFrame( 45 );
        this.step[2] = this.sprite.getFrame( 46 );
        this.step[3] = this.sprite.getFrame( 47 );
        this.step[4] = this.sprite.getFrame( 48 );
        this.step[5] = this.sprite.getFrame( 49 );
        this.step[6] = this.sprite.getFrame( 50 );
        this.step[7] = this.sprite.getFrame( 51 );
        this.step[8] = this.sprite.getFrame( 52 );
      }
      
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
    
    setLookDirection(lookDirection) { this.lookDirection = lookDirection; }
		triggerLookDirection(direction) { 
      this.spriteProps.direction = direction;
      this.resetStep();
    }
		resetPosition() {
			this.setX( this.x0 );
      this.setY( this.y0 );
      this.setCollisionX( this.collisionX0 );
      this.setCollisionY( this.collisionY0 );
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
    
  /*
    Movement
  */
    
    setStartPosition(x, y) {
      this.setX( x );
      this.setY( y );
      this.x0 = x;
      this.y0 = y;
      this.collisionX = x + this.CollisionXFormula;
      this.collisionY = y + this.CollisionYFormula;
      this.checkGrabbingObjects();
    }

    getX() { return this.x; }
    getY() { return this.y; }
    
    getSpeed() { return this.speed; }

    setX(x, setCollision) { 
      this.x = x; 
      if( setCollision ) this.setCollisionX( x + this.CollisionXFormula );
    }
    setY(y, setCollision) { 
      this.y = y; 
      if( setCollision ) this.setCollisionY( y + this.CollisionYFormula );
    }
    
    setSpeed(speed) { this.speed = this.chunkSize * speed; }
    
		movLeft() { 
      this.increaseStep();
      this.setLookDirection( this.lookLeft() );
      this.setX( this.getX() - this.getSpeed()); 
      this.setCollisionX( this.getCollisionX() - this.getSpeed()); 
      this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movRight() { 
      this.increaseStep();
      this.setLookDirection( this.lookRight() );
      this.setX( this.getX() + this.getSpeed() ); 
      this.setCollisionX( this.getCollisionX() + this.getSpeed()); 
      this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movUp() { 
      this.increaseStep();
      this.setLookDirection( this.lookUp() );
      this.setY( this.getY() - this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() - this.getSpeed() );
      this.updateGrabCollisionXY();
      this.walking = true;
    };
			
		movDown() {  
      this.increaseStep();
      this.setLookDirection( this.lookDown() );
      this.setY( this.getY() + this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() + this.getSpeed() );
      this.updateGrabCollisionXY();
      this.walking = true;
    };

    handleMovement( keysDown ) {

      // If dialog active, don't walk
      if( window.game.isDialogActive() ) return;
      
      // Player 1 Controls
      if( this.playerNumber == 1 ) {
        if (37 in keysDown) this.movLeft();  // Left
        if (38 in keysDown) this.movUp();    // Up  
        if (39 in keysDown) this.movRight(); // Right
        if (40 in keysDown) this.movDown();  // Down
      }
      
      // Player 2 Controls
      if( this.playerNumber == 2 ) {
        if (65 in keysDown) this.movLeft();  // Left  => A
        if (87 in keysDown) this.movUp();    // Up    => W
        if (68 in keysDown) this.movRight(); // Right => D
        if (83 in keysDown) this.movDown();  // Down  => S
      }

    }

    handleKeyUp(keyUp) {
      
      // If dialog active, don't walk
      if( window.game.isDialogActive() ) return;
      
      // Player 1
      if( this.playerNumber == 1 ) {
        if (keyUp == 17) this.triggerGrab();  // Grab => CTRL
        if (keyUp == 32) this.triggerUse();   // Use => Space
      }

      // Player 2
      if( this.playerNumber == 2 ) {
        if (keyUp == 70) this.triggerGrab();  // Grab => F
        if (keyUp == 69) this.triggerUse();  // Use => E
      }

      this.walking = false;
      this.walkSound.stop();
    }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
		
  /*
    Collision
  */
    setCollisionX(x) { this.collisionX = x; }
    setCollisionY(y) { this.collisionY = y; }

    //The collision will be just half of the player height
    getCollisionHeight() { return this.collisionHeight; }
    getCollisionWidth() { return this.collisionWidth; }
    getCollisionX() {  return this.collisionX; }
    getCollisionY() {  return this.collisionY; }

    getCenterX( _x ) { // May get a custom centerX, used to check a future collision
      let x = ( _x ) ? _x : this.getCollisionX();
      return x + this.getCollisionWidth() / 2; 
    }
    getCenterY( _y ) { 
      let y = ( _y ) ? _y : this.getCollisionY();
      return y + this.getCollisionHeight() / 2; 
    }
    
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
		
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

	/*
    Life / Heal / Death
  */	
    getLifes() { return this.lifes; }

    hurtPlayer( amount ) {
      if( this.canBeHurt ) {
        
        this.hurtSound.play();

        // Hurt player
        this.lifes -= amount;
        if( this.lifes < 0 ) this.lifes = 0;

        // Start cooldown
        this.canBeHurt = false;
        setTimeout( () => {
          this.canBeHurt = true;
          this.hideSprite = false;
        }, this.hurtCoolDownTime);

        // Check if player died
        this.checkPlayerDeath();
      }
    }

    healPlayer( amount ) {
      this.lifes += parseInt(amount);
      if( this.lifes > this.defaultLifes ) this.lifes = this.defaultLifes;
    }

    checkPlayerDeath() {
      if( this.lifes < 1 && !window.god_mode ) {
        window.game.gameOver(true);
      }
    }
  
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
		
    /*
      General
    */
        
      setHeight(height) { this.height = height; }
      setWidth(width) { this.width = width; }
      
      getPlayerNumber() { return this.playerNumber; }

      getColor() { return this.color; }
        
      getWidth() { return this.width; }
      getHeight() { return this.height; }
    
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
	
  /*  
    Render
  */
  		
	  render(ctx) {
      
      // Blink player if it can't be hurt
      if( ! this.canBeHurt ) {
        this.hideSprite = !this.hideSprite;
      }
      
      if ( this.hideSprite ) return;

      if( this.walking && !this.walkSound.playing() ) {
        this.walkSound.play();
      }

      // What to do every frame in terms of render? Draw the player
      let props = {
        x: this.getX(),
        y: this.getY(),
        w: this.getWidth(),
        h: this.getHeight()
      } 
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.sprite.getSprite(),  
        this.spriteProps.clip_x, this.spriteProps.clip_y, 
        this.sprite.getKeyWidth(), this.sprite.getKeyHeight(), 
        props.x, props.y, props.w, props.h
      );	

      // DEBUG COLLISION
      if( window.debug ) {
        ctx.fillStyle = "rgba(0,0,255, 0.4)";
        ctx.fillRect( this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight() );

        let text = "X: " + Math.round(this.getX()) + " Y:" + Math.round(this.getY());
        ctx.font =  "25px 'Press Start 2P'";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText( text, this.getX() - 20, this.getY() - 20);

        // Grab collision
        ctx.fillStyle = "rgba(255,0,0, 0.4)";
        ctx.fillRect( this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight() );
      }
      
		};


    run() {
      this.initSounds();
      //this.checkGrabbingObjects();
      this.lookDirection = this.lookDown();
      this.updateGrabCollisionXY();
    }
		
}//class
module.exports = Player;

},{"../engine/core/Sprite":42}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"../engine/core/Sprite":42,"dup":1}],3:[function(require,module,exports){
/*
    Prototype Scenario
*/
const _Scenario = require('../../../engine/assets/_Scenario');

const _S_center = require('./stages/stage_center');
const _S_up = require('./stages/stage_up');
const _S_right = require('./stages/stage_right');
const _S_bottom = require('./stages/stage_bottom');
const _S_left = require('./stages/stage_left');

class scenarioPrototype extends _Scenario {

  constructor(ctx, canvas, saveData){
    super(ctx, canvas, "prototype");
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;
    
    this.run();
  }

  // # Stages
  setStage(stage_id, firstStage) {
    
    this.clearArrayItems();
    
    let _stage = null;

    // Check which stage will load
    switch(stage_id) {
      default:
      case 'center':
        let s_center = new _S_center();
        _stage = s_center;
        break;
      case 'up':
        let s_up = new _S_up();
        _stage = s_up;
        break;
      case 'left':
        let s_left = new _S_left();
        _stage = s_left;
        break;
      case 'right':
        let s_right = new _S_right();
        _stage = s_right;
        break;
      case 'bottom':
        let s_bottom = new _S_bottom();
        _stage = s_bottom;
        break;
      }

      // Load the stage defined
      this.loadStage(_stage, firstStage);
  }
 
  // Set Default Stage
  run() {
    this.setStage( this.stageToLoad, true);    
	}

}//class
module.exports = scenarioPrototype;
},{"../../../engine/assets/_Scenario":37,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
// Stage 02
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Bottom extends _Stage{

  constructor() {
    super("bottom");

    let player1StartX = window.game.getChunkSize() * 0;
    let player1StartY = window.game.getChunkSize() * 0;
    
    let player2StartX = window.game.getChunkSize() * 1;
    let player2StartY = window.game.getChunkSize() * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
    }
  }
        
  // # Scenario Desgin (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
     
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};
     
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
         
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f2,   ob,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   ob,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wc_bl,      wb,   wb,   wb,   wb,   wb,   wb,   wc_br,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "top",     targetStage: 'center' };
    
    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
  }

} // class

module.exports = Prototype_Stage_Bottom;

},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Teleport":29}],5:[function(require,module,exports){
// Stage 01
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');

class Prototype_Stage_Center extends _Stage{

  constructor() {
    super("center");

    let player1StartX = window.game.getChunkSize() * 7;
    let player1StartY = window.game.getChunkSize() * 6;
    
    let player2StartX = window.game.getChunkSize() * 8;
    let player2StartY = window.game.getChunkSize() * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
      case "fire":
        return new Fire(item.type, x, y);
        break;
    }
  }
        
  // # Scenario Design (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};

    let iwc_tl = { name: "wall", type: "inner_corner_top_left"};
    let iwc_tr = { name: "wall", type: "inner_corner_top_right"};
    let iwc_bl = { name: "wall", type: "inner_corner_bottom_left"};
    let iwc_br = { name: "wall", type: "inner_corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};  

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f2,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wt,     wt,     wt,     wt,     iwc_br,     f1,   f1,   ob,   f1,   f1,   f1,   iwc_bl,   wt,     wt,     wt,     wt ],
      [ f1,     f1,     f1,     f1,     f1,         f1,   f2,   f1,   f1,   f1,   f1,   f1,       f1,     f1,     f1,     f1 ],
      [ ob,     ob,     ob,     ob,     ob,         ob,   f1,   f1,   f1,   f1,   f1,   f1,       f1,     f1,     f1,     f1 ],
      [ f1,     f1,     f1,     f1,     f1,         f1,   f1,   f1,   f1,   f1,   ob,   ob,       ob,     ob,     ob,     ob ],
      [ f1,     f2,     f1,     f1,     f1,         f1,   f1,   f1,   f1,   f1,   f1,   f2,       f1,     f1,     f1,     f1 ],
      [ wb,     wb,     wb,     wb,     iwc_tr,     f1,   f2,   f1,   f1,   f1,   f1,   iwc_tl,   wb,     wb,     wb,     wb ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Layer - Bottom
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_02 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "top",        targetStage: 'up' };
    let tp_03 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "right",      targetStage: 'right' };
    let tp_04 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "bottom",     targetStage: 'bottom' };
    let tp_05 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "left",       targetStage: 'left' };
    
    let fire = { name: "fire", type: "01"}; 

    let tbl = { name: "wall", type: "tree_bottom_left" };  
    let tbr = { name: "wall", type: "tree_bottom_right" }; 

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   tp_02,   tp_02,   false,   tp_02,   tp_02,   tp_02,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_05,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_03 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_03 ],
      [ tp_05,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_05,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_03 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   tbl,     tbr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,    false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   tp_04,   tp_04,   tp_04,   tp_04,   tp_04,   tp_04,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  scenarioDesignLayer__top() {

    let ttl = { name: "wall", type: "tree_top_left" };  
    let ttr = { name: "wall", type: "tree_top_right" };  
    let tml = { name: "wall", type: "tree_middle_left" };  
    let tmr = { name: "wall", type: "tree_middle_right" };  

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   ttl,     ttr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   tml,     tmr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__top( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
    this.scenarioDesignLayer__top();
  }

} // class
module.exports = Prototype_Stage_Center;
},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Fire":24,"../../common/Teleport":29}],6:[function(require,module,exports){
// Stage 02
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Left extends _Stage{

  constructor() {
    super("left");

    let player1StartX = window.game.getChunkSize() * 0;
    let player1StartY = window.game.getChunkSize() * 0;
    
    let player2StartX = window.game.getChunkSize() * 1;
    let player2StartY = window.game.getChunkSize() * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
    }
  }
        
  // # Scenario Desgin (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wb = { name: "wall", type: "bottom"};
     
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
         
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wc_tl, wt,    wt,    wt,     wt,    wt,     wt,     wt,     wt,     wt  ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wl,    f1,    f1,    f1,     f1,    f1,     f1,     f2,     f1,     f1  ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wl,    f1,    f1,    f1,     ob,    ob,     ob,     ob,     ob,     ob  ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wl,    f1,    f1,    f1,     f1,    f1,     f1,     f1,     f1,     f1  ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wl,    f1,    f2,    f1,     f1,    f1,     f1,     f1,     f1,     f1  ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wc_bl, wb,    wb,    wb,     wb,    wb,     wb,     wb,     wb,     wb  ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "right",     targetStage: 'center' };
    
    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_01 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_01 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_01 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
  }

} // class

module.exports = Prototype_Stage_Left;

},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Teleport":29}],7:[function(require,module,exports){
// Stage 02
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Right extends _Stage{

  constructor() {
    super("right");

    let player1StartX = window.game.getChunkSize() * 0;
    let player1StartY = window.game.getChunkSize() * 0;
    
    let player2StartX = window.game.getChunkSize() * 1;
    let player2StartY = window.game.getChunkSize() * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
    }
  }
        
  // # Scenario Desgin (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
     
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};
 
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
         
    // Floor
    let f1 = { name: "floor", type: "01"};
    
    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wt,     wt,     wt,     wt,     wt,     wt,    wt,    wt,    wt,    wc_tr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ f1,     f1,     f1,     f1,     f1,     f1,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ f1,     f1,     f1,     f1,     f1,     f1,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ ob,     ob,     ob,     ob,     ob,     ob,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ f1,     f1,     f1,     f1,     f1,     f1,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wb,     wb,     wb,     wb,     wb,     wb,    wb,    wb,    wb,    wc_br,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "left",     targetStage: 'center' };
    
    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_01,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_01,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_01,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
  }

} // class

module.exports = Prototype_Stage_Right;

},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Teleport":29}],8:[function(require,module,exports){
// Stage 02
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Up extends _Stage{

  constructor() {
    super("up");

    let player1StartX = window.game.getChunkSize() * 0;
    let player1StartY = window.game.getChunkSize() * 0;
    
    let player2StartX = window.game.getChunkSize() * 1;
    let player2StartY = window.game.getChunkSize() * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);;
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
    }
  }
        
  // # Scenario Desgin (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
         
    // Floor
    let f1 = { name: "floor", type: "01"};
    
    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,        wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,      wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wc_tl,      wt,   wt,   wt,   wt,   wt,   wt,   wc_tr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "bottom",     targetStage: 'center' };
    
    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   tp_01,   tp_01,   false,   tp_01,   tp_01,   tp_01,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
  }

} // class

module.exports = Prototype_Stage_Up

},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Teleport":29}],9:[function(require,module,exports){
module.exports={ "columns":61,
 "image":"..\/common\/sprites\/beach.png",
 "imageheight":1055,
 "imagewidth":1980,
 "margin":0,
 "name":"center",
 "spacing":0,
 "tilecount":1952,
 "tiledversion":"1.2.4",
 "tileheight":32,
 "tiles":[
        {
         "id":11,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"bottom"
                }]
        }, 
        {
         "id":16,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"corner_top_left"
                }]
        }, 
        {
         "id":17,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"corner_top_right"
                }]
        }, 
        {
         "id":24,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"tree_top_left"
                }]
        }, 
        {
         "id":25,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"tree_top_right"
                }]
        }, 
        {
         "id":72,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"top"
                }]
        }, 
        {
         "id":77,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"corner_bottom_left"
                }]
        }, 
        {
         "id":78,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"corner_bottom_right"
                }]
        }, 
        {
         "id":85,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"tree_middle_left"
                }]
        }, 
        {
         "id":86,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"tree_middle_right"
                }]
        }, 
        {
         "id":134,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"right"
                }]
        }, 
        {
         "id":135,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"left"
                }]
        }, 
        {
         "id":136,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"inner_corner_top_left"
                }]
        }, 
        {
         "id":137,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"inner_corner_top_right"
                }]
        }, 
        {
         "id":146,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"tree_bottom_left"
                }]
        }, 
        {
         "id":147,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"tree_bottom_right"
                }]
        }, 
        {
         "id":197,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"inner_corner_bottom_left"
                }]
        }, 
        {
         "id":198,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"inner_corner_bottom_right"
                }]
        }, 
        {
         "id":245,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_floor"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"sand_01"
                }]
        }, 
        {
         "id":623,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"water"
                }]
        }, 
        {
         "id":734,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_floor"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"sand_02"
                }]
        }, 
        {
         "id":1291,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"fence"
                }]
        }, 
        {
         "id":1708,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"fire"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"1"
                }]
        }, 
        {
         "id":1769,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"heal"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"banana"
                }]
        }, 
        {
         "id":1770,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"heal"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"berry"
                }]
        }, 
        {
         "id":1771,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"object_throw"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"barrel"
                }]
        }, 
        {
         "id":1773,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"object_push"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"stone"
                }]
        }, 
        {
         "id":1775,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"key"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"gray"
                }]
        }, 
        {
         "id":1776,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"key"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"purple"
                }]
        }, 
        {
         "id":1777,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"key"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"red"
                }]
        }, 
        {
         "id":1778,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"key"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"green"
                }]
        }, 
        {
         "id":1779,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"beach_wall"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"dialog"
                }]
        }],
 "tilewidth":32,
 "type":"tileset",
 "version":1.2
}
},{}],10:[function(require,module,exports){
/*
  Sandbox Scenario
*/
const _Scenario = require('../../../engine/assets/_Scenario');
const _Stage = require('../../../engine/assets/_Stage');

const jsonScenarioTileSet = require('./sandbox-tileset.json');

const jsonStageCenter = require('./stages/center.json');
const jsonStageCenterAssets = require('./stages/center-assets.json');

const jsonStageLife = require('./stages/life.json');
const jsonStageLifeAssets = require('./stages/life-assets.json');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, saveData){
    let soundSrc = "./sounds/sandbox-background.mp3";
    super(ctx, canvas, "sandbox", soundSrc);
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;

    this.run();
  }

  // # Stages
  setStage(stage_id, firstStage) {
    
    // Save items state before clear
    if( !firstStage ) {
      this.saveItemsState();
    }

    this.clearArrayItems();

    // Set Actual Stage ID
    this.setActualStageId( stage_id );
    
    let _stage = null;

    // Check which stage will load
    switch(stage_id) {
      default: 
      case 'center':
        _stage = new _Stage( stage_id, jsonStageCenter, jsonStageCenterAssets, jsonScenarioTileSet );
        break;
      case 'life':
        _stage = new _Stage( stage_id, jsonStageLife, jsonStageLifeAssets, jsonScenarioTileSet );
        break;
    }

    // Load the stage defined
    this.loadStage(_stage, firstStage);
  }
 
  // Set Default Stage
  run() {
    this.setStage( this.stageToLoad, true );    
  }

}//class
module.exports = scenarioSandbox;
},{"../../../engine/assets/_Scenario":37,"../../../engine/assets/_Stage":38,"./sandbox-tileset.json":9,"./stages/center-assets.json":11,"./stages/center.json":12,"./stages/life-assets.json":13,"./stages/life.json":14}],11:[function(require,module,exports){
module.exports={
	"teleports": [
		{
			"xIndex": 7,
			"yIndex": 0,
			"props": {  
				"target": {
					"stage": "life",
					"x": 7,
					"y": 11
				}
			}
		},
		{
			"xIndex": 0,
			"yIndex": 6,
			"props": {  
				"target": {
					"stage": "enemy",
					"x": 14,
					"y": 5
				}
			}
		},
		{
			"xIndex": 15,
			"yIndex": 6,
			"props": {  
				"target": {
					"stage": "doors",
					"x": 1,
					"y": 5
				}
			}
		}
	],
	"dialogs":[ 
		{
			"x": 12,
			"y": 9,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Welcome to Gufitrup my friend!"
				},
				{
					"hideSprite": false,
					"text": "Walk around and feel free to test this game."
				},
				{
					"hideSprite": false,
					"text": "If you find any bugs..."
				},
				{
					"hideSprite": false,
					"text": "...sorry >.< "
				},
				{
					"hideSprite": false,
					"text": "But let me know what you've found, please!"
				},
				{
					"hideSprite": false,
					"text": "Have fun :D"
				},
				{
					"hideSprite": true,
					"text": ""
				}
			]
		},
		{
			"x": 1,
			"y": 5,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Keys and Doors"
				},
				{ "hideSprite": true, "text": "" }
			]
		},
		{
			"x": 6,
			"y": 1,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Fire and Health items"
				},
				{ "hideSprite": true, "text": "" }
			]
		},
		{
			"x": 13,
			"y": 5,
			"dialog": [
				{
					"hideSprite": false,
					"text": "!! DANGER !!"
				},
				{
					"hideSprite": false,
					"text": "Enemys and Barrels"
				},
				{ "hideSprite": true, "text": "" }
			]
		},
	],
	"enemies":[ ]
}
},{}],12:[function(require,module,exports){
module.exports={ "height":14,
 "infinite":false,
 "layers":[
        {
         "data":[624, 624, 624, 624, 624, 17, 199, 246, 135, 78, 138, 246, 246, 735, 246, 135, 624, 17, 73, 18, 624, 136, 246, 735, 198, 18, 78, 138, 246, 246, 137, 79, 624, 136, 246, 198, 18, 78, 138, 246, 246, 198, 18, 78, 12, 12, 79, 624, 624, 136, 735, 246, 198, 18, 136, 246, 246, 246, 198, 73, 73, 18, 624, 624, 17, 199, 246, 246, 246, 198, 199, 246, 246, 246, 246, 246, 246, 198, 18, 624, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 198, 73, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 246, 246, 138, 246, 735, 246, 246, 246, 246, 137, 12, 138, 246, 246, 246, 246, 137, 12, 78, 138, 246, 246, 246, 246, 246, 198, 18, 78, 138, 246, 246, 137, 79, 624, 624, 78, 138, 246, 246, 246, 246, 246, 198, 73, 199, 246, 246, 198, 18, 624, 18, 624, 78, 138, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 135, 624, 198, 18, 624, 136, 246, 246, 246, 246, 246, 246, 246, 246, 735, 137, 79, 624, 246, 198, 18, 78, 138, 246, 246, 137, 12, 138, 246, 246, 137, 79, 624, 624, 735, 246, 198, 18, 78, 12, 12, 79, 624, 78, 12, 12, 79, 624, 624, 624],
         "height":14,
         "id":1,
         "name":"ground",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1780, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1780, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1780, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 147, 148, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1709, 1709, 0, 0, 0, 0, 0, 0, 0, 1292, 1292, 0, 1292, 0, 0, 0, 0, 1292, 1292, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 1780, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1772, 1772, 1772, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1772, 1772, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":2,
         "name":"objects",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":6,
         "name":"assets",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":3,
         "name":"player",
         "opacity":1,
         "properties":[
                {
                 "name":"player_1_x",
                 "type":"string",
                 "value":"10"
                }, 
                {
                 "name":"player_1_y",
                 "type":"string",
                 "value":"10"
                }, 
                {
                 "name":"player_2_x",
                 "type":"string",
                 "value":"11"
                }, 
                {
                 "name":"player_2_y",
                 "type":"string",
                 "value":"10"
                }],
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 86, 87, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 26, 25, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25],
         "height":14,
         "id":8,
         "name":"objects",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }],
 "nextlayerid":9,
 "nextobjectid":1,
 "orientation":"orthogonal",
 "renderorder":"left-up",
 "tiledversion":"1.2.4",
 "tileheight":32,
 "tilesets":[
        {
         "firstgid":1,
         "source":"..\/sandbox-tileset.json"
        }],
 "tilewidth":32,
 "type":"map",
 "version":1.2,
 "width":16
}
},{}],13:[function(require,module,exports){
module.exports={
	"teleports": [
		{
			"xIndex": 7,
			"yIndex": 13,
			"props": {  
				"target": {
					"stage": "center",
					"x": 7,
					"y": 0
				}
			}
		}
	],
	"dialogs":[ ],
	"enemies":[ ]
}
},{}],14:[function(require,module,exports){
module.exports={ "height":14,
 "infinite":false,
 "layers":[
        {
         "data":[624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 17, 73, 73, 73, 73, 18, 624, 624, 624, 624, 624, 624, 624, 624, 624, 17, 199, 246, 246, 246, 246, 198, 18, 624, 624, 624, 17, 73, 73, 73, 73, 199, 246, 246, 246, 246, 246, 246, 198, 18, 624, 17, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 198, 18, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 78, 138, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 137, 79, 624, 78, 12, 138, 246, 246, 246, 246, 246, 246, 246, 246, 246, 137, 79, 624, 624, 624, 624, 78, 138, 246, 246, 246, 246, 246, 137, 12, 12, 79, 624, 624, 624, 624, 624, 624, 78, 138, 246, 246, 246, 137, 79, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 78, 138, 246, 137, 79, 624, 624, 624, 624, 624, 624],
         "height":14,
         "id":1,
         "name":"ground",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 1770, 1770, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1709, 0, 0, 0, 0, 0, 0, 1771, 0, 0, 1709, 1292, 1292, 1292, 1292, 0, 1709, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 0, 0, 0, 0, 0, 0, 0, 1771, 0, 0, 1292, 0, 0, 0, 0, 0, 1709, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 1770, 0, 1709, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 1292, 1709, 1292, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":2,
         "name":"objects",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":4,
         "name":"assets",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":3,
         "name":"player",
         "opacity":1,
         "properties":[
                {
                 "name":"player_1_x",
                 "type":"string",
                 "value":"6"
                }, 
                {
                 "name":"player_1_y",
                 "type":"string",
                 "value":"11"
                }, 
                {
                 "name":"player_2_x",
                 "type":"string",
                 "value":"7"
                }, 
                {
                 "name":"player_2_y",
                 "type":"string",
                 "value":"11"
                }],
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }],
 "nextlayerid":5,
 "nextobjectid":1,
 "orientation":"orthogonal",
 "renderorder":"left-up",
 "tiledversion":"1.2.4",
 "tileheight":32,
 "tilesets":[
        {
         "firstgid":1,
         "source":"..\/sandbox-tileset.json"
        }],
 "tilewidth":32,
 "type":"map",
 "version":1.2,
 "width":16
}
},{}],15:[function(require,module,exports){
// Stage 01
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');
const Dialog = require('../../common/Dialog');

class Prototype_Stage_Center extends _Stage{

  constructor() {
    
    super("center");

    let player1StartX = window.game.getChunkSize() * 7;
    let player1StartY = window.game.getChunkSize() * 6;
    
    let player2StartX = window.game.getChunkSize() * 8;
    let player2StartY = window.game.getChunkSize() * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
      case "dialog":
        return new Dialog(item.type, x, y);
        break;
    }
  }
        
  // # Scenario Design (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};

    let iwc_tl = { name: "wall", type: "inner_corner_top_left"};
    let iwc_tr = { name: "wall", type: "inner_corner_top_right"};
    let iwc_bl = { name: "wall", type: "inner_corner_bottom_left"};
    let iwc_br = { name: "wall", type: "inner_corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};  
      

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wc_tl,    wt,    wt,    wt,    wt,    wt,     iwc_br,    f1,    iwc_bl,    wt,     wt,     wt,     wt,     wt,     wt,     wc_tr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f2,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f2,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ iwc_br,   f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     iwc_bl ],
      [ f1,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     f1 ],
      [ iwc_tr,   f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f2,     f1,     f1,     f1,     iwc_tl ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f2,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f2,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wc_bl,    wb,    wb,    wb,    wb,    wb,     wb,        wb,    wb,        wb,     wb,     wb,     wb,     wb,     wb,     wc_br ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Layer - Bottom
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_lf = { name: "teleport", type: "", teleportType: "relative", cameFrom: "top",        targetStage: 'life' };
    let tp_enemy = { name: "teleport", type: "", teleportType: "relative", cameFrom: "right",   targetStage: 'enemy' };
    let tp_doors = { name: "teleport", type: "", teleportType: "relative", cameFrom: "left",   targetStage: 'doors' };
    
    let tbl = { name: "wall", type: "tree_bottom_left" };  
    let tbr = { name: "wall", type: "tree_bottom_right" }; 

    
    let brd2 = { name: "dialog", type: "center_left_notice"};
    let brd3 = { name: "dialog", type: "center_top_notice"};
    let brd4 = { name: "dialog", type: "center_right_notice"};
    let brdw = { name: "dialog", type: "center_welcome"};
    
    let fc = { name: "wall", type: "fence"};

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   tp_lf,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   brd3,    false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   brd2,   false,    false,   fc,      fc,      fc,     fc,      fc,      fc,      false,   false,   false,   false,    brd4,   false ],
      [ false,   false,  false,   false,   fc,      brdw,    false,   false,   false,   fc,      false,   false,   false,   false,   false,   false ],
      [ tp_doors,false,  false,   false,   fc,      false,   false,   false,   false,   fc,      false,   false,   false,   false,   false,   tp_enemy ],
      [ false,   false,  false,   false,   fc,      false,   false,   false,   false,   fc,      false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   fc,      false,      fc,      fc,   fc,      fc,      false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   tbl,     tbr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  scenarioDesignLayer__top() {

    let ttl = { name: "wall", type: "tree_top_left" };  
    let ttr = { name: "wall", type: "tree_top_right" };  
    let tml = { name: "wall", type: "tree_middle_left" };  
    let tmr = { name: "wall", type: "tree_middle_right" };  

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   ttl,     ttr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   tml,     tmr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__top( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
    this.scenarioDesignLayer__top();
  }

} // class
module.exports = Prototype_Stage_Center;
},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Dialog":21,"../../common/Fire":24,"../../common/Teleport":29}],16:[function(require,module,exports){
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Door = require('../../common/Door');
const Key = require('../../common/Key');
const Object_Throw = require('../../common/Object_Throw');
const Object_Push = require('../../common/Object_Push');
const Dialog = require('../../common/Dialog');

class Prototype_Stage_Doors extends _Stage{

  constructor() {
    super("doors");

    let player1StartX = 0;
    let player1StartY = 0;
    
    let player2StartX = 0;
    let player2StartY = 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "door":
        return new Door(item.type, x, y, this.getStageId());
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
      case "key":
        return new Key(item.type, x, y, this.getStageId() ); 
        break;
      case "object_throw":
        return new Object_Throw(item.type, x, y, this.getStageId());
        break;
      case "object_push":
        return new Object_Push(item.type, x, y, this.getStageId());
        break;
      case "dialog":
          return new Dialog(item.type, x, y);
          break;
    }
  }
        
  // # Scenario Design (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};

    let iwc_tl = { name: "wall", type: "inner_corner_top_left"};
    let iwc_tr = { name: "wall", type: "inner_corner_top_right"};
    let iwc_bl = { name: "wall", type: "inner_corner_bottom_left"};
    let iwc_br = { name: "wall", type: "inner_corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};  

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wc_tl,    wt,    wt,    wt,    wt,    wt,     wt,        wt,    wt,        wt,     wt,     wt,     wt,     wt,     wt,     wc_tr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     iwc_bl ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     f1 ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     iwc_tl ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wc_bl,    wb,    wb,    wb,    wb,    wb,     wb,        wb,    wb,        wb,     wb,     wb,     wb,     wb,     wb,     wc_br ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Layer - Bottom
  scenarioDesignLayer__bottom() {
    
    let fire = { name: 'fire', type: '01'}; 

    let enemy = { name: 'enemy', type: '01'}; 
    let bnna = { name: 'heal', type: 'banana'}; 
    let berry = { name: 'heal', type: 'berry'}; 

    let brrl = { name: 'object_throw', type: 'barrel'}; 
    let stne = { name: 'object_push', type: 'stone'}; 

    let fnce = { name: "wall", type: "fence"};

    let tp_c = { name: 'teleport', type: '', teleportType: 'relative', cameFrom: 'right', targetStage: 'center' };

    let dgbl = { name: 'door', type: 'door_gray_bl'}; 
    let dgtl = { name: 'door', type: 'door_gray_tl'}; 
    let dgbr = { name: 'door', type: 'door_gray_br'}; 
    let dgtr = { name: 'door', type: 'door_gray_tr'}; 
    
    let dpbl = { name: 'door', type: 'door_purple_bl'}; 
    let dptl = { name: 'door', type: 'door_purple_tl'}; 
    let dpbr = { name: 'door', type: 'door_purple_br'}; 
    let dptr = { name: 'door', type: 'door_purple_tr'}; 
    
    let drbl = { name: 'door', type: 'door_red_bl'}; 
    let drtl = { name: 'door', type: 'door_red_tl'}; 
    let drbr = { name: 'door', type: 'door_red_br'}; 
    let drtr = { name: 'door', type: 'door_red_tr'}; 
    
    let dgrbl = { name: 'door', type: 'door_green_bl'}; 
    let dgrtl = { name: 'door', type: 'door_green_tl'}; 
    let dgrbr = { name: 'door', type: 'door_green_br'}; 
    let dgrtr = { name: 'door', type: 'door_green_tr'}; 

    let k_g = { name: 'key', type: 'gray'}; 
    let k_p = { name: 'key', type: 'purple'}; 
    let k_r = { name: 'key', type: 'red'}; 
    let k_gr = { name: 'key', type: 'green'}; 
    
    let gntc = { name: "dialog", type: "doors_gratz_notice"};

    let itemsBottom = [
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   fnce,    k_r,     false,   fnce,    k_g,     false,   fnce,    k_p,    false,    fnce,    false,   false ],
        [ false,   false,  gntc,    false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false ],
        [ false,   false,  false,   false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false ],
        [ false,   false,  dgtl,    dgtr,    fnce,    dptl,    dptr,    fnce,    drtl,    drtr,    fnce,    dgrtl,   dgrtr,   fnce,    false,   false ],
        [ false,   fnce,   dgbl,    dgbr,    fnce,    dpbl,    dpbr,    fnce,    drbl,    drbr,    fnce,    dgrbl,   dgrbr,   fnce,    false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_c ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,    false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   brrl,    false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ];
    // # Proccess scenario design
    itemsBottom.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  scenarioDesignLayer__top() {

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__top( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
    this.scenarioDesignLayer__top();
  }

} // class
module.exports = Prototype_Stage_Doors;
},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Dialog":21,"../../common/Door":22,"../../common/Key":26,"../../common/Object_Push":27,"../../common/Object_Throw":28,"../../common/Teleport":29}],17:[function(require,module,exports){
// Stage 01
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Heal = require('../../common/Heal');
const Enemy = require('../../common/Enemy');
const Fire = require('../../common/Fire');
const Object_Throw = require('../../common/Object_Throw');
const Object_Push = require('../../common/Object_Push');
const Key = require('../../common/Key');

class Prototype_Stage_Enemy extends _Stage{

  constructor() {
    super("enemy");

    let player1StartX = window.game.getChunkSize() * 7;
    let player1StartY = window.game.getChunkSize() * 6;
    
    let player2StartX = window.game.getChunkSize() * 8;
    let player2StartY = window.game.getChunkSize() * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
      case "enemy":
        return new Enemy(item.type, x, y);
        break;
      case "fire":
        return new Fire(item.type, x, y);
        break;
      case "heal":
        return new Heal(item.type, x, y, this.getStageId());
        break;
      case "object_throw":
        return new Object_Throw(item.type, x, y, this.getStageId());
        break;
      case "object_push":
        return new Object_Push(item.type, x, y, this.getStageId());
        break;
      case "key":
          return new Key(item.type, x, y, this.getStageId() ); 
          break;
    }
  }
        
  // # Scenario Design (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};

    let iwc_tl = { name: "wall", type: "inner_corner_top_left"};
    let iwc_tr = { name: "wall", type: "inner_corner_top_right"};
    let iwc_bl = { name: "wall", type: "inner_corner_bottom_left"};
    let iwc_br = { name: "wall", type: "inner_corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};  

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wc_tl,    wt,    wt,    wt,    wt,    wt,     wt,        wt,    wt,        wt,     wt,     wt,     wt,     wt,     wt,     wc_tr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        ob,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        ob,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ iwc_br,   f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        ob,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ f1,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ iwc_tr,   f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        ob,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        ob,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wc_bl,    wb,    wb,    wb,    wb,    wb,     wb,        wb,    wb,        wb,     wb,     wb,     wb,     wb,     wb,     wc_br ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Layer - Bottom
  scenarioDesignLayer__bottom() {
    
    let fire = { name: 'fire', type: '01'}; 

    let enemy = { name: 'enemy', type: '01'}; 
    let bnna = { name: 'heal', type: 'banana'}; 
    let berry = { name: 'heal', type: 'berry'}; 

    let brrl = { name: 'object_throw', type: 'barrel'}; 
    let stne = { name: 'object_push', type: 'stone'}; 

    let tp_c = { name: 'teleport', type: '', teleportType: 'relative', cameFrom: 'left', targetStage: 'center' };
    
    let k_gr = { name: 'key', type: 'green'}; 

    let itemsBottom = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   stne,   false,   false,   k_gr,   false,   false,   false ],
      [ false,   false,  false,   brrl,    brrl,    brrl,    false,   false,   false,   false,   enemy,   enemy,   enemy,   false,   false,   false ],
      [ false,   false,  false,   brrl,    brrl,    brrl,    false,   false,   false,   stne,   enemy,   false,   enemy,   false,   false,   false ],
      [ false,   false,  false,   brrl,    brrl,    brrl,    false,   false,   false,   false,   false,   enemy,   false,   false,   false,   false ],
      [ false,   false,  false,   brrl,    brrl,    brrl,    false,   false,   false,   stne,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   brrl,    false,   brrl,    false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_c,    false,  false,   false,   false,   false,   false,   false,   false,   stne,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   stne,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  brrl,   false,   stne,    false,   brrl,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   stne,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   brrl,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ];
    // # Proccess scenario design
    itemsBottom.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  scenarioDesignLayer__top() {

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__top( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
    this.scenarioDesignLayer__top();
  }

} // class
module.exports = Prototype_Stage_Enemy;
},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Enemy":23,"../../common/Fire":24,"../../common/Heal":25,"../../common/Key":26,"../../common/Object_Push":27,"../../common/Object_Throw":28,"../../common/Teleport":29}],18:[function(require,module,exports){
// Stage 01
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');
const Heal = require('../../common/Heal');

class Prototype_Stage_Life extends _Stage{

  constructor() {
    super("life");

    let player1StartX = window.game.getChunkSize() * 7;
    let player1StartY = window.game.getChunkSize() * 6;
    
    let player2StartX = window.game.getChunkSize() * 8;
    let player2StartY = window.game.getChunkSize() * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
      case "fire":
        return new Fire(item.type, x, y);
        break;
      case "heal":
        return new Heal(item.type, x, y, this.getStageId());
        break;
    }
  }
        
  // # Scenario Design (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};

    let iwc_tl = { name: "wall", type: "inner_corner_top_left"};
    let iwc_tr = { name: "wall", type: "inner_corner_top_right"};
    let iwc_bl = { name: "wall", type: "inner_corner_bottom_left"};
    let iwc_br = { name: "wall", type: "inner_corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};  

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wc_tl,    wt,    wt,    wt,    wt,    wt,     wt,        wt,    wt,        wt,     wt,     wt,     wt,     wt,     wt,     wc_tr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wc_bl,    wb,    wb,    wb,    wb,    wb,     iwc_tr,    f1,   iwc_tl,     wb,     wb,     wb,     wb,     wb,     wb,     wc_br ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Layer - Bottom
  scenarioDesignLayer__bottom() {
    
    let fire = { name: 'fire', type: '01'}; 
    let bnna = { name: 'heal', type: 'banana'}; 
    let berry = { name: 'heal', type: 'berry'}; 

    let tp_c = { name: 'teleport', type: '', teleportType: 'relative', cameFrom: 'bottom',        targetStage: 'center' };

    let itemsBottom = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   fire,    false,   false,   bnna,    false,   false,   false,   false ],
      [ false,   false,  false,   fire,    false,   false,   false,   fire,    false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  fire,    bnna,    fire,    false,   false,   false,   false,   fire,    false,   fire,    false,   false,   false,   false ],
      [ false,   fire,   false,   false,   false,   fire,    fire,    false,   false,   fire,    berry,   fire,    false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   fire,    fire,    fire,    false,   false,   false,   false ],
      [ false,   false,  berry,   false,   false,   false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   fire,   false,   false,   bnna,    false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   fire,   fire,    fire,    fire,    fire,    false,   false,   fire,    false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,    false,   false,   false,   fire,    false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,    false,   false,   false,   fire,    false,   false,   bnna,    false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,    false,   false,   false,   fire,    false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,    false,   false,   false,   fire,    false,   false,   berry,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   tp_c,    false,   false,   false,   false,   false,   false,   false,   false ],
    ];
    // # Proccess scenario design
    itemsBottom.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  scenarioDesignLayer__top() {

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__top( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
    this.scenarioDesignLayer__top();
  }

} // class
module.exports = Prototype_Stage_Life;
},{"../../../../engine/assets/_Stage":38,"../../common/Beach_Floor":19,"../../common/Beach_Wall":20,"../../common/Fire":24,"../../common/Heal":25,"../../common/Teleport":29}],19:[function(require,module,exports){
const _Collidable = require('../../../engine/assets/_Collidable');
const Sprite = require('../../../engine/core/Sprite');

class Beach_Floor extends _Collidable {

	constructor(type, x0, y0) {
    
    let props = {
      name: "Beach Floor",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, sprite, events);
    
  }

  // # Sprites  
  setSpriteType(type) {
      
    switch(type) {
      
      case "01":
      case "sand_01":
        this.spriteProps = this.sprite.getSpriteProps(249);
        break;
      
      case "02":
      case "sand_02":
        this.spriteProps = this.sprite.getSpriteProps(930);
        break;

    }

  }

  collision(player){ 
    player.setTeleporting(false);
    return true; 
  }

}//class
module.exports = Beach_Floor;
},{"../../../engine/assets/_Collidable":35,"../../../engine/core/Sprite":42}],20:[function(require,module,exports){
const _Collidable = require('../../../engine/assets/_Collidable');
const Sprite = require('../../../engine/core/Sprite');

class Beach_wall extends _Collidable {

	constructor(type, x0, y0) {
    
    let props = {
      name: "Beach Wall",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, sprite, events);

  }

  // # Sprites
    
  setSpriteType(type) {
    
    switch(type) {
      
      case "top":
        this.spriteProps = this.sprite.getSpriteProps(73);
        break;
      case "left":
        this.spriteProps = this.sprite.getSpriteProps(137);
        break;
      case "right":
        this.spriteProps = this.sprite.getSpriteProps(136);
        break;
      case "bottom":
        this.spriteProps = this.sprite.getSpriteProps(11);
        break;
      case "corner_top_left":
        this.spriteProps = this.sprite.getSpriteProps(16);
        break;
      case "corner_top_right":
        this.spriteProps = this.sprite.getSpriteProps(17);
        break;
      case "corner_bottom_left":
        this.spriteProps = this.sprite.getSpriteProps(78);
        break;
      case "corner_bottom_right":
        this.spriteProps = this.sprite.getSpriteProps(79);
        break;
      case "inner_corner_top_left":
        this.spriteProps = this.sprite.getSpriteProps(138);
        break;
      case "inner_corner_top_right":
        this.spriteProps = this.sprite.getSpriteProps(139);
        break;
      case "inner_corner_bottom_left":
        this.spriteProps = this.sprite.getSpriteProps(200);
        break;
      case "inner_corner_bottom_right":
        this.spriteProps = this.sprite.getSpriteProps(201);
        break;
      case "water":
        this.spriteProps = this.sprite.getSpriteProps(633);
        break;
      case "obstacle":
        this.spriteProps = this.sprite.getSpriteProps(250); 
        break;
      case "fence":
        this.spriteProps = this.sprite.getSpriteProps(1312); 
        break;
      case "tree_top_left":
        this.spriteProps = this.sprite.getSpriteProps(24);
        this.setStopOnCollision(false);
        break;
      case "tree_top_right":
        this.spriteProps = this.sprite.getSpriteProps(25);
        this.setStopOnCollision(false);
        break;
      case "tree_middle_left":
        this.spriteProps = this.sprite.getSpriteProps(210);
        this.setStopOnCollision(false);
        break;
      case "tree_middle_right":
        this.spriteProps = this.sprite.getSpriteProps(87);
        this.setStopOnCollision(false);
        break;
      case "tree_bottom_left":
        // Sprite
        this.spriteProps = this.sprite.getSpriteProps(148);
        // Collision Size
        this.setCollisionWidth( this.chunkSize * 0.3 );
        this.setCollisionX(this.x + this.chunkSize * 0.7);
        break;
      case "tree_bottom_right":
        // Sprite
        this.spriteProps = this.sprite.getSpriteProps(149);
        // Collision Size
        this.setCollisionWidth( this.chunkSize * 0.3 );
        break;
      case "dialog":
        this.spriteProps = this.sprite.getSpriteProps(1808);
        break;
    }

  }

}//class
module.exports = Beach_wall;
},{"../../../engine/assets/_Collidable":35,"../../../engine/core/Sprite":42}],21:[function(require,module,exports){
const _DialogTrigger = require('../../../engine/assets/_Dialog');
const Sprite = require('../../../engine/core/Sprite');

class Dialog extends _DialogTrigger {

	constructor(type, x0, y0, stage) {
	
	let props = {
	  name: "dialog",
	  type: type,
	  stage: stage
	}

	let position = {
	  x: x0,
	  y: y0
	}

	let dimension = {
	  width: window.game.getChunkSize(),
	  height: window.game.getChunkSize()
	}

	let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

	let events = {
	  stopOnCollision: true,
	  hasCollisionEvent: true
	}
	
	super(props, position, dimension, sprite, events, { fromSaveState: false });

	this.type = 'dialog';
  }

  // # Sprites
	
  setSpriteType(type) {
		switch(type) {
			case 'center_welcome':
				this.setDialog(
					[
						{
							hideSprite: false,
							text: "Welcome to Gufitrup my friend!"
						},
						{
							hideSprite: false,
							text: "Walk around and feel free to test this game."
						},
						{
							hideSprite: false,
							text: "If you find any bugs..."
						},
						{
							hideSprite: false,
							text: "...sorry >.< "
						},
						{
							hideSprite: false,
							text: "But let me know what you've found, please!"
						},
						{
							hideSprite: false,
							text: "Have fun :D"
						},
						{
							hideSprite: true,
							text: ""
						}
					]
				);
				break;
			case "center_left_notice":
				this.setDialog(
					[
						{
							hideSprite: false,
							text: "Keys and Doors"
						},
						{
							hideSprite: true,
							text: ""
						}
					]
				);
			break;
			case "center_top_notice":
				this.setDialog(
					[
						{
							hideSprite: false,
							text: "Fire and Health items"
						},
						{
							hideSprite: true,
							text: ""
						}
					]
				);
			break;
			case "center_right_notice":
					this.setDialog(
						[
							{
								hideSprite: false,
								text: "!! DANGER !!"
							},
							{
								hideSprite: false,
								text: "Enemys and Barrels"
							},
							{
								hideSprite: true,
								text: ""
							}
						]
					);
				break;
			case "doors_gratz_notice":
					this.setDialog(
						[
							{
								hideSprite: false,
								text: "You did it! :D"
							},
							{
								hideSprite: true,
								text: ""
							}
						]
					);
				break;
			
		}
	
  }


}//class
module.exports = Dialog;
},{"../../../engine/assets/_Dialog":36,"../../../engine/core/Sprite":42}],22:[function(require,module,exports){
const _CanCollect = require('../../../engine/assets/_CanCollect');
const Sprite = require('../../../engine/core/Sprite');

class Door extends _CanCollect {

	constructor(type, x0, y0, stage) {
    
    let props = {
      name: "door",
      type: type,
      stage: stage
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }

    let canCollectProps = {
      canRespawn: false
    }
    
    super(props, position, dimension, sprite, events, canCollectProps);

    this.type = 'door';

    this.openSound = false;

    this.handleProps();
    this.initSounds();
  }

  /*
    # Sounds
  */
  initSounds() {
    // Open
    this.openSound = new Howl({ src: ['./sounds/scenarios/door-open.mp3'], volume: 0.4 });
  }

  checkSavedItemState() {
    let savedItemsState = JSON.parse( localStorage.getItem('gufitrupi__itemsState') );  
    if( savedItemsState ) {
      let itemSavedState = savedItemsState[this.getName()];
      if( itemSavedState && itemSavedState.collected === true ){ // Check if this item is already grabbed
        this.collect();
        this.hide();
        this.setStopOnCollision(false);
      }
    }  
  }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      // Gray
      case "door_gray_bl":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1313);
        break;
      case "door_gray_tl":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1251);
        break;
      case "door_gray_br":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1314);
        break;
      case "door_gray_tr":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1252);
        break;
      // Purple
      case "door_purple_bl":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1315);
        break;
      case "door_purple_tl":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1253);
        break;
      case "door_purple_br":
        this.setCode('purple');  
        this.spriteProps = this.sprite.getSpriteProps(1316);
        break;
      case "door_purple_tr":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1254);
        break;
      // Red
      case "door_red_bl":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1317);
        break;
      case "door_red_tl":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1255);
        break;
      case "door_red_br":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1318);
        break;
      case "door_red_tr":
        this.setCode('red');  
        this.spriteProps = this.sprite.getSpriteProps(1256);
        break;
      // Green
      case "door_green_bl":
        this.setCode('green');
        this.spriteProps = this.sprite.getSpriteProps(1319);
        break;
      case "door_green_tl":
        this.setCode('green');  
        this.spriteProps = this.sprite.getSpriteProps(1257);
        break;
      case "door_green_br":
        this.setCode('green');  
        this.spriteProps = this.sprite.getSpriteProps(1320);
        break;
      case "door_green_tr":
        this.setCode('green');  
        this.spriteProps = this.sprite.getSpriteProps(1258);
        break;
    }
    this.setNeedSaveState(true);
    
  }

  // Handle props when load
  handleProps() {
    // Check if this item was saved before and change it props
    this.checkSavedItemState();
  }

  // Open door = hide all doors with same code 
  open() {
    let objs = window.game.collision.getColItens();
    for (let i in objs) {
      if( objs[i].type == 'door' ) {
        if( objs[i].getCode() == this.getCode() ) {
          this.openSound.play();
          window.game.playSuccessSound();
          objs[i].collect();
          objs[i].hide();
          objs[i].setStopOnCollision(false);
        }
      }
    }
  }

}//class
module.exports = Door;
},{"../../../engine/assets/_CanCollect":32,"../../../engine/core/Sprite":42}],23:[function(require,module,exports){
const _CanHurt = require('../../../engine/assets/_CanHurt');
const Sprite = require('../../../engine/core/Sprite');

class Enemy extends _CanHurt {

  constructor(type, x0, y0) {
    
    let props = {
      name: "enemy",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize() * 2
    }

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }
    
    let canHurtProps = {
      amount: 1
    }

    super(props, position, dimension, {}, events, canHurtProps);

    this.spriteAnimationMaxCount = 1;
    this.spriteAnimationCount = 1;
    
    this.collisionHeight = window.game.getChunkSize(); // 80% of Chunk Size
    this.collisionY = y0 + window.game.getChunkSize(); // 80% of Chunk Size

    this.collisionCount = 0;

    // Controls the sprite FPS Animation
    this.fpsInterval = 1000 / ( window.game.gameProps.fps / 2 ); // 1000 / FPS
    this.deltaTime = Date.now();

    this.sprite = new Sprite( document.getElementById('sprite_enemy'), 300, 960, 20, 40);

    this.step = new Object();
    this.defaultStep = 1;
    this.initialStep = 2;
    this.stepCount = this.defaultStep;
    this.maxSteps = 4;

    this.directionCountdown = 0;
    this.randDirection = 1;

    // # Position
    this.x = x0;
    this.y = y0;
    
    this.x0 = x0; // initial position
    this.y0 = y0;
  
    // # Properties
    this.speed0 = 0.2;
    this.speed = this.chunkSize * this.speed0;
    this.type = "enemy";
    
    // # Life
    this.defaultLifes = 2;
    this.lifes = this.defaultLifes;
    this.dead = false;
    this.stopRenderingMe = false;
    
    this.canBeHurt = true;
    this.hurtCoolDownTime = 1000; //2s

    this.playerAwareChunksDistance0 = 5;
    this.playerAwareChunksDistance = this.playerAwareChunksDistance0;
    this.playerAwareDistance = this.chunkSize * this.playerAwareChunksDistance;

    this.awareOfPlayer = false;

    this.xFromPlayerDistance = 0;
    this.YFromPlayerDistance = 0;

    this.deathSound = false;

    this.initSounds();

    this.runEnemy();
  }

  /*
    # Sounds
  */
  initSounds() {
    
    // Use
    this.deathSound = new Howl({ src: ['./sounds/enemy/death.mp3'] });

  }

  isDead() { return this.dead; }
  setDead(bool) { this.dead = bool; }

  needStopRenderingMe() { return this.stopRenderingMe; }
  setStopRenderingMe(bool) { this.stopRenderingMe = bool; }

  isAwareOfPlayer() { return this.awareOfPlayer; }
  setAwareOfPlayer(bool) { this.awareOfPlayer = bool; }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
        // Sprite
        this.setSpritePropsFrame(this.spriteAnimationCount);
        // Collision
        this.setCollisionHeight(this.collisionHeight);
        this.setCollisionY(this.collisionY);
        break;
    }
  }
  setSpritePropsFrame(spriteAnimationCount){
    switch(spriteAnimationCount) { 
      case 1:
        this.spriteProps = { 
          clip_x: 0, clip_y: 0, 
          sprite_width: this.sprite.getKeyWidth(), sprite_height: this.sprite.getKeyHeight() 
        }
        break;
    }
  }

  // # Sprites state for enemy direction
  lookDown(){
    this.spriteProps.direction = 'down';
    
    // Steps
    this.step[1] = this.sprite.getFrame(0);
    this.step[2] = this.sprite.getFrame(1);
    this.step[3] = this.sprite.getFrame(2);
    this.step[4] = this.sprite.getFrame(3);
    
    this.spriteProps.clip_x = this.step[this.stepCount].x;
    this.spriteProps.clip_y = this.step[this.stepCount].y;

  }
  
  lookUp(){
    this.spriteProps.direction = 'up';
    
    this.step[1] = this.sprite.getFrame(15);
    this.step[2] = this.sprite.getFrame(16);
    this.step[3] = this.sprite.getFrame(17);
    this.step[4] = this.sprite.getFrame(18);
    
    this.spriteProps.clip_x = this.step[this.stepCount].x;
    this.spriteProps.clip_y = this.step[this.stepCount].y;
  }
  
  lookRight(){
    this.spriteProps.direction = 'right';
    
    this.step[1] = this.sprite.getFrame(30);
    this.step[2] = this.sprite.getFrame(31);
    this.step[3] = this.sprite.getFrame(32);
    this.step[4] = this.sprite.getFrame(33);
    
    this.spriteProps.clip_x = this.step[this.stepCount].x;
    this.spriteProps.clip_y = this.step[this.stepCount].y;
  }
      
  lookLeft(){
    this.spriteProps.direction = 'left';
        
    this.step[1] = this.sprite.getFrame(34);
    this.step[2] = this.sprite.getFrame(35);
    this.step[3] = this.sprite.getFrame(36);
    this.step[4] = this.sprite.getFrame(37);
    
    this.spriteProps.clip_x = this.step[this.stepCount].x;
    this.spriteProps.clip_y = this.step[this.stepCount].y;
  }

  dying(){
    this.spriteProps.direction = 'dying';
        
    this.step[1] = this.sprite.getFrame(40);
    this.step[2] = this.sprite.getFrame(41);
    this.step[3] = this.sprite.getFrame(42);
    this.step[4] = this.sprite.getFrame(43);
    this.step[5] = this.sprite.getFrame(44);
    this.step[6] = this.sprite.getFrame(29); // empty frame
    
    this.spriteProps.clip_x = this.step[this.stepCount].x;
    this.spriteProps.clip_y = this.step[this.stepCount].y;
  }

  // # Movement
  movLeft(ignoreCollision) { 
    this.increaseStep();
    this.setLookDirection( this.lookLeft() );
    this.setX( this.getX() - this.getSpeed()); 
    this.setCollisionX( this.getCollisionX() - this.getSpeed()); 
    if( !ignoreCollision ) window.game.checkCollision( this );
  };
    
  movRight(ignoreCollision) { 
    this.increaseStep();
    this.setLookDirection( this.lookRight() );
    this.setX( this.getX() + this.getSpeed() ); 
    this.setCollisionX( this.getCollisionX() + this.getSpeed());
    if( !ignoreCollision ) window.game.checkCollision( this );
  };
    
  movUp(ignoreCollision) { 
    this.increaseStep();
    this.setLookDirection( this.lookUp() );
    this.setY( this.getY() - this.getSpeed() ); 
    this.setCollisionY( this.getCollisionY() - this.getSpeed() );
    if( !ignoreCollision ) window.game.checkCollision( this );
  };
    
  movDown(ignoreCollision) {  
    this.increaseStep();
    this.setLookDirection( this.lookDown() );
    this.setY( this.getY() + this.getSpeed() ); 
    this.setCollisionY( this.getCollisionY() + this.getSpeed() );
    if( !ignoreCollision ) window.game.checkCollision( this );
  };
  movToDeath(ignoreCollision) {
    this.increaseStep();
    this.setLookDirection( this.dying() );
    this.setX( this.getX() + this.getSpeed() ); 
    this.setCollisionX( this.getCollisionX() + this.getSpeed());
    if( !ignoreCollision ) window.game.checkCollision( this );
  }

  // # Controls the Fire FPS Movement independent of game FPS
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

  // # Sets
      
  setX(x, setCollision) { 
    this.x = x; 
    if( setCollision ) this.setCollisionX( x + this.CollisionXFormula );
  }
  setY(y, setCollision) { 
    this.y = y; 
    if( setCollision ) this.setCollisionY( y + this.CollisionYFormula );
  }

  setCollisionX(x) { this.collisionX = x; }
  setCollisionY(y) { this.collisionY = y; }
    
  setHeight(height) { this.height = height; }
  setWidth(width) { this.width = width; }
    
  setSpeed(speed) { this.speed = this.chunkSize * speed; }

  setLookDirection(lookDirection) { this.lookDirection = lookDirection; }
  triggerLookDirection(direction) { 
    this.spriteProps.direction = direction;
    this.resetStep();
  }

  resetPosition() {
    this.setX( this.x0 );
    this.setY( this.y0 );
    this.setCollisionX( this.collisionX0 );
    this.setCollisionY( this.collisionY0 );
  }

  hurt( amount ) {
    if( this.canBeHurt ) {
      
      // Hurt player
      this.lifes -= amount;
      if( this.lifes < 0 ) this.lifes = 0;

      // Start cooldown
      this.canBeHurt = false;
      setTimeout( () => {
        this.canBeHurt = true;
        this.hideSprite = false;
      }, this.hurtCoolDownTime);

      // Check if player died
      this.checkMyDeath();
    }
  }

  checkMyDeath() {
    if( this.lifes < 1 ) {
      this.setDead(true);
      this.deathSound.play();
      if( this.spriteProps.direction != "dying") this.stepCount = 1; // If it's not dying, reset animation step
      this.setSpeed(1.3); // Increase speed
      this.hasCollisionEvent = false; // Prevent enemy hurting player when in death animation
      this.maxSteps = 6;
      this.setAwareOfPlayer(false);
      this.fpsInterval = 1000 / 8;
    }
  }

// # Gets
  
  getLifes() { return this.lifes; }
  
  getX() { return this.x; }
  getY() { return this.y; }
    
  getWidth() { return this.width; }
  getHeight() { return this.height; }
    
  //The collision will be just half of the player height
  getCollisionHeight() { return this.collisionHeight; }
  getCollisionWidth() { return this.collisionWidth; }
  getCollisionX() {  return this.collisionX; }
  getCollisionY() {  return this.collisionY; }

  getCenterX( _x ) { // May get a custom centerX, used to check a future collision
    let x = ( _x ) ? _x : this.getCollisionX();
    return x + this.getCollisionWidth() / 2; 
  }
  getCenterY( _y ) { 
    let y = ( _y ) ? _y : this.getCollisionY();
    return y + this.getCollisionHeight() / 2; 
  }
    
  getColor() { return this.color; }
  getSpeed() { return this.speed; }
    
  getSpriteProps() { return this.spriteProps; }
    
  increaseStep() {
    this.stepCount++;
    if( this.stepCount > this.maxSteps ) {
      //Don't reset if it's in death animation
      if( this.spriteProps.direction == "dying" ) {
        this.stepCount = this.maxSteps;
      } else {
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
  hideMe() { this.hideSprite = true; }
  show() { this.hideSprite = false; }
  
  // # Enemy Render    
  render(ctx) {
    
    if( this.needStopRenderingMe() ) return;

    // Blink Enemy if it can't be hurt
    if( ! this.canBeHurt ) {
      this.hideSprite = !this.hideSprite;
    }
    
    if ( this.hideSprite && this.spriteProps.direction != "dying"  ) return;

    // What to do every frame in terms of render? Draw the player
    let props = {
      x: this.getX(),
      y: this.getY(),
      w: this.getWidth(),
      h: this.getHeight()
    } 
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.sprite.getSprite(),   
      this.spriteProps.clip_x, this.spriteProps.clip_y, 
      this.sprite.getKeyWidth(), this.sprite.getKeyHeight(), 
      props.x, props.y, props.w, props.h
    );	

    // Player Awareness 
    if( this.isAwareOfPlayer() ) {
      ctx.font =  "50px 'Press Start 2P'";
      ctx.fillStyle = "#CC0000";
      ctx.fillText( "!", this.getX() + ( this.chunkSize * 0.03 ), this.getY() + ( this.chunkSize * 0.3 ) ); 
    }

    // DEBUG COLLISION
    if( window.debug ) {

      ctx.fillStyle = "rgba(0,0,255, 0.4)";
      ctx.fillRect( this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight() );

      let text = "X: " + Math.round(this.getX()) + " Y:" + Math.round(this.getY());
      ctx.font =  "25px 'Press Start 2P'";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText( text, this.getX() - 20, this.getY() - 60); 

      text = "dX: " + Math.round( this.xFromPlayerDistance ) + " dY:" + Math.round( this.YFromPlayerDistance );
      ctx.font =  "25px 'Press Start 2P'";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText( text, this.getX() - 20, this.getY() - 20); 
      
    }
    
  };

// # Enemy Brain
  enemyBrain() {

    if( window.game.isGameReady() && this.canRenderNextFrame() ) {
      
      // Check Dead behavior/animation
      if( this.isDead() ) {
        
        //While not out of screen
        if( this.getX() < window.game.gameProps.canvasWidth ) {
          
          // Start moving out of screen
          this.movToDeath(true); // true = ignore collision check
          
        } else {
          // Ok, the enemy is dead, stop rendering now
          this.setStopRenderingMe(true);
        }
        
      } else { // # Not dead

        // Check if it's near enough of player to go in his direction
        let nearPlayer = false;
        window.game.players.map( (player) => {
          // Check distance between enemy and player
          this.xFromPlayerDistance = Math.abs( this.getCenterX() - player.getCenterX() );
          this.YFromPlayerDistance = Math.abs( this.getCenterY() - player.getCenterY() );
          //If both distance are below the aware distance, set this player to be the near player
          if( this.xFromPlayerDistance < this.playerAwareDistance && this.YFromPlayerDistance < this.playerAwareDistance ) {
            nearPlayer = player;
          }
        });
      
        if( nearPlayer ) {

          // # Walk in player direction
          this.setAwareOfPlayer(true);

          // positions
          let Xe = this.getCollisionX();
          let Ye = this.getCollisionY();

          let Xp = nearPlayer.getCollisionX(); 
          let Yp = nearPlayer.getCollisionY(); 

          let Xdistance = Math.abs(Xe - Xp);// Ignore if the result is a negative number
          let Ydistance = Math.abs(Ye - Yp);

          // which direction to look
          let Xdirection = "";
          let Ydirection = "";
          
          Xdirection = ( Xe >= Xp ) ? 'left' : 'right';
          Ydirection = ( Ye >= Yp ) ? 'up' : 'down';
          
          // where to go
          let goToDirection = ( Xdistance > Ydistance ) ? Xdirection : Ydirection;

          // If has collided a lot, change direction to avoid getting stuck
          if( this.collisionCount > 20 ) {
            // Stop going on that direction
            /*
            TODO: Think about it!!
            */
          }
          
          // move
          switch( goToDirection ) {
            case 'up':    this.movUp();    break;
            case 'right': this.movRight(); break;
            case 'down':  this.movDown();  break;
            case 'left':  this.movLeft();  break;
          }

        } else {

          // # far from player, so keep random movement
          
          this.setAwareOfPlayer(false);

          // Check if stoped the move event
          if( this.directionCountdown <= 0 ) {
            this.randDirection =  Math.floor(Math.random() * 7) + 1; // 1 - 4
            this.directionCountdown =  Math.floor(Math.random() * 20) + 10; // 1 - 4
            //this.resetStep();
          }
          
          // Move direction needed
          switch( this.randDirection ) {
            case 1: this.movUp();     break;
            case 2: this.movRight();  break;
            case 3: this.movDown();   break;
            case 4: this.movLeft();   break;
            case 5: // more chances to don't move
            case 6: 
            case 7: 
              this.resetStep(); break; // don't move
          }

          this.directionCountdown--;
          
        }
      
      } // if dead

    }//if game ready

    
    requestAnimationFrame( this.enemyBrain.bind(this) );
  }

// # Collision

  collision(obj){ 
    if( obj.type == "player" ) obj.hurtPlayer(this.hurtAmount); // hurt player
    this.collisionCount++;
    return true;
  } 
  
  // Has a collision Event?
  triggersCollisionEvent() { return this.hasCollisionEvent; }

  // Will it Stop the other object if collides?
  stopIfCollision() { return this.stopOnCollision; }

  runEnemy() {
    // change look direction
    this.lookDirection = this.lookDown();

    //start algoritm that moves player
    this.enemyBrain();
  }

}//class
module.exports = Enemy;
},{"../../../engine/assets/_CanHurt":33,"../../../engine/core/Sprite":42}],24:[function(require,module,exports){
const _CanHurt = require('../../../engine/assets/_CanHurt');
const Sprite = require('../../../engine/core/Sprite');

class Fire extends _CanHurt {

  constructor(type, x0, y0) {
    
    let props = {
      name: "Fire",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    let canHurtProps = {
      amount: 1
    }

    super(props, position, dimension, sprite, events, canHurtProps);

    this.spriteAnimationMaxCount = 3;
    this.spriteAnimationCount = Math.floor(Math.random() * this.spriteAnimationMaxCount) + 1; // Generate a rand initial number to randomize animation in case of multiple Fires
    
    this.collisionHeight = window.game.getChunkSize() * 0.4; // 80% of Chunk Size
    this.collisionY = y0 + ( window.game.getChunkSize() * 0.6); // 80% of Chunk Size

    // Controls the sprite FPS Animation
    let randFPS = Math.floor(Math.random() * 7) + 5; // Generate a random FPS, so multiple Fires on page don't animate the same way 
    this.fpsInterval = 1000 / randFPS; // 1000 / FPS
    this.deltaTime = Date.now();
  }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
        // Sprite
        this.setSpritePropsFrame(this.spriteAnimationCount);
        // Collision
        this.setCollisionHeight(this.collisionHeight);
        this.setCollisionY(this.collisionY);
        break;
    }
  }
  setSpritePropsFrame(spriteAnimationCount){
    switch(spriteAnimationCount) { 
      case 1:
        this.spriteProps = this.sprite.getSpriteProps(1736);
        break;
      case 2:
        this.spriteProps = this.sprite.getSpriteProps(1737);
        break;
      case 3:
        this.spriteProps = this.sprite.getSpriteProps(1738);
        break;
    }
  }

  // # Controls the Fire FPS Movement independent of game FPS
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

  beforeRender() {
    // Animate fire
    if( this.canRenderNextFrame() ) {
      this.spriteAnimationCount++;
      if( this.spriteAnimationCount > this.spriteAnimationMaxCount ) this.spriteAnimationCount = 1;
      this.setSpritePropsFrame(this.spriteAnimationCount);
    }
  }

}//class
module.exports = Fire;
},{"../../../engine/assets/_CanHurt":33,"../../../engine/core/Sprite":42}],25:[function(require,module,exports){
const _CanCollect = require('../../../engine/assets/_CanCollect');
const Sprite = require('../../../engine/core/Sprite');

class Heal extends _CanCollect {

  constructor(type, x0, y0, stage_id) {
    
    let props = {
      name: stage_id + "_potion",
      type: type,
      stage: stage_id
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    let canCollectProps = {
      canRespawn: true
    }

    super(props, position, dimension, sprite, events, canCollectProps);

    this.handleProps();
  }

  // Check if this item has some save state
  checkSavedItemState() {
    let savedItemsState = JSON.parse( localStorage.getItem('gufitrupi__itemsState') );  
    if( savedItemsState ) {
      let itemSavedState = savedItemsState[this.getName()];
      if( itemSavedState && ! this.canRespawn() && itemSavedState.collected === true ){ // Check if has saved state and can't respawn
        this.collect();
        this.hide();
      }
    }  
  }

  setHealAmout(amount) { this.healAmout = amount; }
  getHealAmount() { return this.healAmout; }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
      case 'banana':
        this.spriteProps = this.sprite.getSpriteProps(1798);
        break;
      case 'berry':
        this.spriteProps = this.sprite.getSpriteProps(1799);
        break;
    }
  }

  collision(player){ 
    if( !this.isCollected() ) {
      this.collect();
      this.hide();
      player.healPlayer( this.getHealAmount() );
    }
    return true; 
  }

  // Handle props when load
  handleProps() {
    
    // Set Props based on type
    switch( this.getType() ) { 
      default:
      case 'banana':
        this.setHealAmout(1);
        break;
      case 'berry':
        this.setNeedSaveState(true); // Make this item able to save state
        this.setHealAmout(2);
        this.setCanRespawn(false); // It can't respawn if used
        break;
    }

    // Check if this item was saved before and change it props
    this.checkSavedItemState();
  }

}//class
module.exports = Heal;
},{"../../../engine/assets/_CanCollect":32,"../../../engine/core/Sprite":42}],26:[function(require,module,exports){
const _CanThrow = require('../../../engine/assets/_CanThrow');
const Sprite = require('../../../engine/core/Sprite');

class Key extends _CanThrow {

	constructor(type, x0, y0, stage, fromSaveState) {
    
    let props = {
      name: "key",
      type: type,
      class: 'key',
      stage: stage
    }
    
    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }
    
    let canThrow = {
      canRespawn: false,
      chuncksThrowDistance: 1,
      hurtAmount: 0,
      useEvent: 'use'
    }

    super(props, position, dimension, sprite, events, canThrow, fromSaveState);

    this.setNeedSaveState(true);
    this.handleProps();
  }

  // Check if this item has some save state
  checkSavedItemState() {
    let savedItemsState = JSON.parse( localStorage.getItem('gufitrupi__itemsState') );  
    if( savedItemsState ) {

      let itemSavedState = savedItemsState[this.getName()];
      
      // Check if this item is already grabbed
      if( itemSavedState && itemSavedState.grabbed == true ){ 
        if( this.fromSavedState ) {
          // Grab the item saved
          this.grabHandler( itemSavedState.grabProps.playerWhoGrabbed ); 
        } else {
          // Ignore the item from stage
          this.hide();
        }
      }
      
      // Check if this item was used before
      if( itemSavedState && itemSavedState.collected == true ) { 
        this.collect();
        this.hide();
        this.setStopOnCollision(false);
        this.canGrab = false;
      }

      //Check if it was dropped
      if( itemSavedState && itemSavedState.dropped == true ) { 
        // Check if it's dropped on this stage
        if( itemSavedState.dropProps.droppedStage == window.game.getCurrentStage() ) {
          
          if( ! this.fromSavedState ) {
            // Ignore the item from stage
            this.hide();
            this.setStopOnCollision(false);
          }
          
        } else {
          this.hide();
          this.setStopOnCollision(false);
        }

        this.updateX( itemSavedState.dropProps.dropX );
        this.updateY( itemSavedState.dropProps.dropY );
        
        this.x0 = itemSavedState.dropProps.x0;
        this.y0 = itemSavedState.dropProps.y0;
        
        this.dropX = itemSavedState.dropProps.dropX;
        this.dropY = itemSavedState.dropProps.dropY;

        this.dropped = true;
        this.originalStage = itemSavedState.dropProps.stage;
        this.droppedStage = itemSavedState.dropProps.droppedStage;
        
      }

    }
  }

  // Handle props when load
  handleProps() {
    // Check if this item was saved before and change it props
    this.checkSavedItemState();
  }
  
  // # Sprites 
  setSpriteType(type) {
      
    switch(type) {
      case "gray":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1804);
        break;
      case "purple":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1805);
        break;
      case "red":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1806);
        break;
      case "green":
        this.setCode('green');
        this.spriteProps = this.sprite.getSpriteProps(1807);
        break;
    }
    
  }

  discardKey(player) {
    this.hide();
    this.setStopOnCollision(false);
    this.setCollect(true);
    this.setGrab(false);
    player.setNotGrabbing();
  }

  use(direction, playerHeight, player) {
    let obj = player.checkItemOnGrabCollisionBox();
    if( obj.type == 'door' ) {
      if( obj.getCode() == this.getCode() ) {
        obj.open();
        this.discardKey(player);
      }
    }
  }

}//class
module.exports = Key;
},{"../../../engine/assets/_CanThrow":34,"../../../engine/core/Sprite":42}],27:[function(require,module,exports){
const _CanBePushed = require('../../../engine/assets/_CanBePushed');
const Sprite = require('../../../engine/core/Sprite');

class Object_Push extends _CanBePushed {

	constructor(type, x0, y0) {
    
    let props = {
      name: "object",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }
    
    let canPush = {
      canRespawn: true,
      chuncksPushDistance: 15,
      hurtAmount: 2
    }

    super(props, position, dimension, sprite, events, canPush);
    
  }

  // # Sprites  
  setSpriteType(type) {
    switch(type) {
      case "stone":
        this.spriteProps = this.sprite.getSpriteProps(1802);
        break;
    }
  }

}//class
module.exports = Object_Push;
},{"../../../engine/assets/_CanBePushed":31,"../../../engine/core/Sprite":42}],28:[function(require,module,exports){
const _CanThrow = require('../../../engine/assets/_CanThrow');
const Sprite = require('../../../engine/core/Sprite');

class Object_Throw extends _CanThrow {

	constructor(type, x0, y0, stage, fromSaveState) {
    
    let props = {
      name: "object",
      type: type,
      class: 'object_throw',
      stage: stage
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }
    
    let canThrow = {
      canRespawn: true,
      chuncksThrowDistance: 5,
      hurtAmount: 2,
      useEvent: 'throw'
    }

    super(props, position, dimension, sprite, events, canThrow, fromSaveState);

    this.setNeedSaveState(true);//set to save just to check if user is grabbing it when leaving stage
    this.handleProps();
  }

  // # Sprites  
  setSpriteType(type) {
    switch(type) {
      case "barrel":
        this.spriteProps = this.sprite.getSpriteProps(1800);
        break;
    }
    this.setCode(type);
  }

  // Check if this item has some save state
  checkSavedItemState() {
    let savedItemsState = JSON.parse( localStorage.getItem('gufitrupi__itemsState') );  
    if( savedItemsState ) {
      let itemSavedState = savedItemsState[this.getName()];
      // Check if this item is already grabbed
      if( itemSavedState && itemSavedState.grabbed === true ){
        if( this.fromSavedState ) {
          // Grab the item saved
          this.grabHandler( itemSavedState.grabProps.playerWhoGrabbed ); 
        } else {
          // Ignore the item from stage
          this.hide();
        }
      }
      //Check if it was dropped
      if( itemSavedState && itemSavedState.dropped == true ) { 
        // Check if it's dropped on this stage
        if( itemSavedState.dropProps.droppedStage == window.game.getCurrentStage() ) {
          
          if( ! this.fromSavedState ) {
            // Ignore the item from stage
            this.hide();
            this.setStopOnCollision(false);
          }
          
        } else {
          this.hide();
          this.setStopOnCollision(false);
        }

        this.updateX( itemSavedState.dropProps.dropX );
        this.updateY( itemSavedState.dropProps.dropY );
        
        this.x0 = itemSavedState.dropProps.x0;
        this.y0 = itemSavedState.dropProps.y0;
        
        this.dropX = itemSavedState.dropProps.dropX;
        this.dropY = itemSavedState.dropProps.dropY;

        this.dropped = true;
        this.originalStage = itemSavedState.dropProps.stage;
        this.droppedStage = itemSavedState.dropProps.droppedStage;
        
      }
    }  
  }

  // Handle props when load
  handleProps() {
    // Check if this item was saved before and change it props
    this.checkSavedItemState();
  }

}//class
module.exports = Object_Throw;
},{"../../../engine/assets/_CanThrow":34,"../../../engine/core/Sprite":42}],29:[function(require,module,exports){
const _Collidable = require('../../../engine/assets/_Collidable');
const Sprite = require('../../../engine/core/Sprite');

class Teleport extends _Collidable {

	constructor(x, y, tpProps) {
    
    let props = {
      name: "Teleport",
      type: 'teleport'
    }

    let position = {
      x: x,
      y: y
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(false, 0, 0, 0, 0);

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    super(props, position, dimension, sprite, events);
    
    this.props = tpProps;

  }

  // # Sprites
  setSpriteType(type) {
    switch(type) {
      default:
        this.spriteProps = { 
          clip_x: 0, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
      break;
    }
  }

  // Collision Event
  collision(playerWhoActivatedTeleport, collidable) {
    
    let players = window.game.players;

    this.teleport( playerWhoActivatedTeleport );
      
    // Make everything dark
    collidable.scenario.clearArrayItems();
    window.game.loading(true);

    // Hide all players
    players.map( (player) => {
      player.hidePlayer();
    });

    // Now teleport all players to same location and direction
    let targetX = playerWhoActivatedTeleport.getX();
    let targetY = playerWhoActivatedTeleport.getY();
    let lookDirection = playerWhoActivatedTeleport.getSpriteProps().direction;
    
    players.map( (player) => {
      player.setX(targetX, true); // true = also set collision x too
      player.setY(targetY, true);
      player.triggerLookDirection(lookDirection);
      player.checkGrabbingObjects();
      player.showPlayer();
    });

    // Change stage
    collidable.scenario.setStage( 
      this.props.target.stage,
      false // firstStage ?
    );

    window.game.loading(false);
      
  }

  teleport( player ) {
    player.setX( this.props.target.x );// This is the X position of player HEADER. Remeber that collision box is on player foot
    player.setY(this.props.target.y );
  }

}//class
module.exports = Teleport;
},{"../../../engine/assets/_Collidable":35,"../../../engine/core/Sprite":42}],30:[function(require,module,exports){
/**
 *  Store Assets that needs to be on any stage, like keys or items that player grabs
 * 
 *  Declare all of this assets here
 */

const Key = require('../../assets/scenario/common/Key');
const Object_Throw = require('../../assets/scenario/common/Object_Throw');
const Beach_Wall = require('../../assets/scenario/common/Beach_Wall');
const Beach_Floor = require('../../assets/scenario/common/Beach_Floor');
const Fire = require('../../assets/scenario/common/Fire');
const Heal = require('../../assets/scenario/common/Heal');
const Teleport = require('../../assets/scenario/common/Teleport');
const Dialog = require('./_Dialog');

class GlobalAssets {

  constructor(chunkSize) { 
		this.chunkSize = chunkSize;
	}

  getAsset( _class, props, fromSaveState ) {
    let r;
    switch( _class ) {
      case 'key':
        r = new Key( props.code, props.x0, props.y0, props.stage, fromSaveState );
        break;
      case 'object_throw':
        r = new Object_Throw( props.code, props.x0, props.y0, props.stage, fromSaveState );
        break;
      case "beach_wall":
        r = new Beach_Wall( props.code, props.x0, props.y0 );
        break;
      case "beach_floor":
        r = new Beach_Floor( props.code, props.x0, props.y0 );
        break;
      case "object_throw":
        return new Object_Throw( props.code, props.x0, props.y0, props.stageID );
        break;
      case "object_push":
        return new Object_Push( props.code, props.x0, props.y0, props.stageID );
        break;
      case "fire":
        return new Fire( props.code, props.x0, props.y0 );
        break;
      case "heal":
        return new Heal( props.code, props.x0, props.y0, props.stageID );
        break;
      case "teleport":
        return new Teleport(props.xIndex, props.yIndex, props.props );
        break;
      case "dialog":
        return new Dialog(props.x, props.y, props.dialog );
        break;
    }
    return r;
  }

}//class
module.exports = GlobalAssets;
},{"../../assets/scenario/common/Beach_Floor":19,"../../assets/scenario/common/Beach_Wall":20,"../../assets/scenario/common/Fire":24,"../../assets/scenario/common/Heal":25,"../../assets/scenario/common/Key":26,"../../assets/scenario/common/Object_Throw":28,"../../assets/scenario/common/Teleport":29,"./_Dialog":36}],31:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class _CanBePushed extends _Collidable {

  constructor(props, position, dimension, sprite, events, canBePushedProps) {
    super(props, position, dimension, sprite, events);
    
    this.canUse = true;
    this._push = false;
    this._canRespawn = canBePushedProps.canRespawn;
    this.hurtAmount = canBePushedProps.hurtAmount;
    
    this.pushDistance = canBePushedProps.chuncksPushDistance * window.game.getChunkSize();
    this.pushSpeed = 0.8;
    this.pushDistanceTravelled = 0;
    this.pushMovement = false;
    this.pushDirection = false;
    
    this.targetX = 0;
    this.targetY = 0;
  }

  isPushing() { return this._push; }
  setPush(bool) { this._push = bool; }
  getPushSpeed() { return  window.game.getChunkSize() * this.pushSpeed; }
  calculatePushDirection(direction) { 
    this.pushDirection = direction;
    switch( this.pushDirection ) {
      case 'up':
        this.targetX = this.getX();  
        this.targetY = this.getY() - this.pushDistance;
        break;
      case 'down':
        this.targetX = this.getX();  
        this.targetY = this.getY() + this.pushDistance; 
        break;
      case 'right':
        this.targetX = this.getX() + this.pushDistance;  
        this.targetY = this.getY();
        break;
      case 'left':
        this.targetX = this.getX() - this.pushDistance;  
        this.targetY = this.getY();
        break;
    }
  }

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

  useHandler(direction) {
    this.push(direction);
  }

  stopObject() {
    this.setStopOnCollision(true);
    this.setPush(false);
  }

  push(direction) {
    this.setPush(true);
    this.calculatePushDirection( direction );
  }

  moveToPushDirection() {
    switch( this.pushDirection ) {
      case 'up':
        // Y
        if ( this.getY() > this.targetY ) this.updateY( this.getY() - this.getPushSpeed() );
        //Adjust if passes from target value
        if (this.getY() < this.targetY ) this.updateY( this.targetY );
        break;
      case 'left':
        // X
        if ( this.getX() > this.targetX ) this.updateX( this.getX() - this.getPushSpeed() );
        //Adjust if passes from target value
        if (this.getX() < this.targetX ) this.updateX( this.targetX );
        break;
      case 'down':
       // Y
       if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getPushSpeed() );
       //Adjust if passes from target value
       if ( this.getY() > this.targetY ) this.updateY( this.targetY );
       break;
      case 'right':
        // X
        if ( this.getX() < this.targetX ) this.updateX( this.getX() + this.getPushSpeed() );
        //Adjust if passes from target value
        if (this.getX() > this.targetX ) this.updateX( this.targetX );
        break;
    }
    this.pushDistanceTravelled += this.getPushSpeed();

    // Check collision between player, enemy and objects
    this.justCheckCollision();

  }

  justCheckCollision() {
    let obj = window.game.collision.justCheckAll(this, this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight()); 
    if ( obj && this.isPushing() ) {
      switch(obj.type) {
        case 'player':
          obj.hurtPlayer(this.hurtAmount); // hurt player
          break;
        case 'enemy':
          obj.hurt(this.hurtAmount); // hurt enemy
          break;
        default:
          if( obj.overlapX ) this.updateX( obj.overlapX );
          if( obj.overlapY ) this.updateY( obj.overlapY );
          this.stopObject();
          break;
      }
    }
  }
 
  beforeRender() {
    if( this.isPushing() ) {
      if( this.getX() != this.targetX || this.getY() != this.targetY ) {
        this.moveToPushDirection();
      } else {
        this.stopObject();
      }
    }       
  }

}//class
module.exports = _CanBePushed;
},{"./_Collidable":35}],32:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class _CanCollect extends _Collidable {

  constructor(props, position, dimension, sprite, events, canCollectProps) {
    super(props, position, dimension, sprite, events);
    
    this.collected = false;
    this._canRespawn = canCollectProps.canRespawn;
  }

  isCollected() { return this.collected; }
  collect(){ this.collected = true; }
  setCollect(bool) { this.collect = bool; }

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

}//class
module.exports = _CanCollect;
},{"./_Collidable":35}],33:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class _CanHurt extends _Collidable {

  constructor(props, position, dimension, sprite, events,canHurtProps) {
    super(props, position, dimension, sprite, events);
    this.hurtAmount = canHurtProps.amount;
  }
  
  // If it's not colliding to any teleport chunk anymore, make it ready to teleport again
  collision(obj){ 
    if( obj.type == "player" ) obj.hurtPlayer(this.hurtAmount);
    if( obj.type == "enemy" ) obj.hurt(this.hurtAmount);
    return true; 
  }

  beforeRender(ctx) {
    // debug position
    if( window.debug ) {
      let x = Math.round(this.getCollisionX());
      let y = Math.round(this.getCollisionY());
      let text = "X: " + x + " Y: " + y;
      console.log(text);
      ctx.font = "25px 'Press Start 2P'";
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText( text, this.getX() - 20 , this.getY()); 
    }
  }

}//class
module.exports = _CanHurt;
},{"./_Collidable":35}],34:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const Sprite = require('../core/Sprite');

class _CanThrow extends _Collidable {

  constructor(props, position, dimension, sprite, events, canThrowProps, fromSaveState) {
    super(props, position, dimension, sprite, events, fromSaveState);
    
    this.canGrab = true;
    this.grabbed = false;
    this.collected = false;
    this.playerWhoGrabbed = false;
    this.dropped = false;
    this.droppedStage = false;
    this.dropX = false;
    this.dropY = false;

    this._canRespawn = canThrowProps.canRespawn;
    this.hurtAmount = canThrowProps.hurtAmount;

    this.useEvent = canThrowProps.useEvent;
    
    this.throwDistance = canThrowProps.chuncksThrowDistance * window.game.getChunkSize();
    this.throwSpeed = 0.8;
    this.throwDistanceTravelled = 0;
    this.throwingMovement = false;
    this.throwDirection = false;

    this.destroyOnAnimationEnd = false;
    
    this.targetX = 0;
    this.targetY = 0;

    // Controls the sprite FPS Animation
    this.fpsInterval = 1000 / ( window.game.gameProps.fps * 2 ); // 1000 / FPS
    this.deltaTime = Date.now();

    // Destroy animation props
    this.destroying = false;
    this.destroySprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);
    this.destroyFrameCount = 1;
    this.destroyMaxFrameCount = 8;
    this.destroyInitFrame = 3;

    this.dropSound = false;
    this.breakSound = false;

    this.throwAction = "";

    this.initSounds();
  }

  initSounds() {
    // Drop
    this.dropSound = new Howl({ src: ['./sounds/scenarios/drop.mp3'] });
    // Break
    this.breakSound = new Howl({ src: ['./sounds/scenarios/item-break.mp3'] });
  }

  isCollected() { return this.collected; }
  collect(){ this.collected = true; }
  setCollect(bool) { this.collected = bool; }

  // # Controls the Fire FPS Movement independent of game FPS
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

  isDestroying() { return this.destroying; }
  setDestroying(bool) { this.destroying = bool; }
  
  setDestroyOnAnimationEnd(bool) { this.destroyOnAnimationEnd = bool; }

  isGrabbed() { return this.grabbed; }
  grab(){ 
    this.grabbed = true;
    this.dropped = false; 
  }
  setGrab(bool) { 
    this.grabbed = bool; 
    this.dropped = !bool;
  }
  setPlayerWhoGrabbed(playerNumber) { this.playerWhoGrabbed = playerNumber; }

  isThrowing() { return this.throwingMovement; }
  setThrowing(bool) { this.throwingMovement = bool; }
  getThrowSpeed() { return  window.game.getChunkSize() * this.throwSpeed; }
  calculateThrowDirection(direction, playerHeight) { 
    this.throwDirection = direction;
    switch( this.throwDirection ) {
      case 'up':
        this.targetX = this.getX();  
        this.targetY = this.getY() - this.throwDistance;
        break;
      case 'down':
        this.targetX = this.getX();  
        this.targetY = this.getY() + this.throwDistance + this.getHeight() * 2; 
        break;
      case 'right':
        this.targetX = this.getX() + this.throwDistance;  
        this.targetY = this.getY() + playerHeight;
        break;
      case 'left':
        this.targetX = this.getX() - this.throwDistance;  
        this.targetY = this.getY() + playerHeight;
        break;
    }
  }
  calculateDropDirection(direction, playerHeight) { 
    this.throwDirection = direction;
    switch( this.throwDirection ) {
      case 'up':
        this.targetX = this.getX();  
        this.targetY = this.getY() - window.game.getChunkSize();
        break;
      case 'down':
        this.targetX = this.getX();  
        this.targetY = this.getY() + window.game.getChunkSize() + this.getHeight() * 2; 
        break;
      case 'right':
        this.targetX = this.getX() + window.game.getChunkSize();  
        this.targetY = this.getY() + playerHeight;
        break;
      case 'left':
        this.targetX = this.getX() - window.game.getChunkSize();  
        this.targetY = this.getY() + playerHeight;
        break;
    }
  }

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

  grabHandler( playerNumber ) {
    this.playerWhoGrabbed = playerNumber;
    this.setGrab(true);
    this.setStopOnCollision(false); // avoid players pushing other players with items
  }

  breakObject() {

    this.setThrowing(false);
    this.setGrab(false);

    if( this.throwAction == "throw" ) this.breakSound.play();
    
    if( this.destroyOnAnimationEnd ) {
      this.setStopOnCollision(false);
      this.setDestroying(true); // Start destroy animation
    } else {
      this.setStopOnCollision(true);
    }

  }

  isDropped() { return this.dropped; }
  drop(direction, playerHeight) {

    setTimeout( () => { this.dropSound.play(); }, 300); // Delay drop sound to sync with animation
    this.throwAction = "drop";
    this.calculateDropDirection( direction, playerHeight );
    this.setDestroyOnAnimationEnd(false);
    this.setThrowing(true);
    this.setGrab(false);
    this.playerWhoGrabbed = false;
    this.dropX = this.targetX;
    this.dropY = this.targetY;
  }

  throw(direction, playerHeight, player) {
    this.throwAction = "throw";
    player.setNotGrabbing();
    this.calculateThrowDirection( direction, playerHeight );
    this.setDestroyOnAnimationEnd(true);
    this.setThrowing(true);
  }

  use(direction, playerHeight, player) {
    switch( this.useEvent ) {
      case 'throw':
        this.throw(direction, playerHeight, player);
        break;
    }
  }

  moveToThrowDirection() {
    switch( this.throwDirection ) {
      case 'up':
        // Y
        if ( this.getY() > this.targetY ) this.updateY( this.getY() - this.getThrowSpeed() );
        //Adjust if passes from target value
        if (this.getY() < this.targetY ) this.updateY( this.targetY );
        break;
      case 'left':
        // Y
        if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getThrowSpeed() / 3 ); // Slow the movement
        // X
        if ( this.getX() > this.targetX ) this.updateX( this.getX() - this.getThrowSpeed() );

        //Adjust if passes from target value
        if (this.getY() > this.targetY ) this.updateY( this.targetY );
        if (this.getX() < this.targetX ) this.updateX( this.targetX );
        break;
      case 'down':
       // Y
       if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getThrowSpeed() );
       //Adjust if passes from target value
       if ( this.getY() > this.targetY ) this.updateY( this.targetY );
       break;
      case 'right':
        // Y
        if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getThrowSpeed() / 3 );
        // X
        if ( this.getX() < this.targetX ) this.updateX( this.getX() + this.getThrowSpeed() );
         //Adjust if passes from target value
         if (this.getY() > this.targetY ) this.updateY( this.targetY );
         if (this.getX() > this.targetX ) this.updateX( this.targetX );
        break;
    }
    this.throwDistanceTravelled += this.getThrowSpeed();

    // Check collision between player and enemy only
    this.justCheckCollision();

  }

  justCheckCollision() {
    let obj = window.game.collision.justCheck(this, this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight()); 
    if ( obj  && this.isThrowing() ) {
      if( obj.type == "player" ) {
        obj.hurtPlayer(this.hurtAmount); // hurt player
        this.breakObject();
      }
      if( obj.type == "enemy" ) { 
        obj.hurt(this.hurtAmount); // hurt enemy
        this.breakObject();
      }
    }
  }
 
  beforeRender(ctx) {
    
    // Movement while throwing
    if( this.isThrowing() ) {
      if( this.getX() != this.targetX || this.getY() != this.targetY ) {
        this.moveToThrowDirection();
      } else {
        this.breakObject();
      }
    }       

    // Destroy animation
    if( this.isDestroying() ) {
      if( this.destroyFrameCount < this.destroyMaxFrameCount  ) {
        if( this.canRenderNextFrame() ) {
          this.spriteProps = this.destroySprite.getSpriteProps( this.destroyInitFrame );
          this.destroyInitFrame++;
          this.destroyFrameCount++;
        }
      } else {
        this.hideSprite = true;
        this.dropped = false;
      }
    }

  }

}//class
module.exports = _CanThrow;
},{"../core/Sprite":42,"./_Collidable":35}],35:[function(require,module,exports){
class _Collidable {

  constructor(props, position, dimension, sprite, events, fromSaveState) {
      
    // # Position
    this.x = position.x;
    this.y = position.y;

    this.x0 = position.x;
    this.y0 = position.y;
      
    // # Properties
    this.width = dimension.width; //px
    this.height = dimension.height;

    // # Collision
    this.collisionWidth = this.width;
    this.collisionHeight = this.height;
    this.collisionX = this.x;
    this.collisionY = this.y;

    this.chunkSize = window.game.getChunkSize();

    // # Events
    this.stopOnCollision = events.stopOnCollision;
    this.hasCollisionEvent = events.hasCollisionEvent;
  
    // # Sprite
    this.sprite = sprite;

    //this.stageSprite = sprite.stageSprite;
    this.hideSprite = false;

    this.spriteProps = new Array();
    
    this.name = props.stage + "_" + props.name.replace(/\s/g,'') + "_" + this.x + "x" + this.y;
    this.name = this.name.toLowerCase();
    this.originalName = props.name;
    
    this.hideSprite = false;

    this.needSaveState = false;

    this.fromSavedState = ( fromSaveState) ? true : false;

    this.type = props.type;
    this.code = '';
    this.class = props.class;
    this.originalStage = props.stage;

    this.run( props.type );
  }

  // # Code
  setCode(code) { this.code = code; }
  getCode(){ return this.code; }

  // # Sets

  updateX(x) {
    this.setX(x);
    this.setCollisionX(x);
  }
  updateY(y) {
    this.setY(y);
    this.setCollisionY(y);
  }
    
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
    
  setHeight(height) { this.height = height; }
  setWidth(width) { this.width = width; }

  setCollisionHeight(height) { this.collisionHeight = height; }
  setCollisionWidth(width) { this.collisionWidth = width; }

  setCollisionX(x) { this.collisionX = x; }
  setCollisionY(y) { this.collisionY = y; }
    
  setSpriteType(type) {
    // ! Must have in childs Class
  }

  setStopOnCollision(bool){
    this.stopOnCollision = bool;
  }

  // # Visibility
  hide() { 
    this.hideSprite = true; 
    this.hasCollisionEvent = false;
    this.stopOnCollision = false;
  }
  show() { this.hideSprite = false; }

  // #  State
  willNeedSaveState() {  return this.needSaveState; }
  setNeedSaveState(bool){ this.needSaveState = bool; }
			
	// # Gets
  
  getName() { return this.name; }

  getType() { return this.type; }
  
  getX() { return this.x; }
  getY() { return this.y; }
  
  getWidth() { return this.width; }
  getHeight() { return this.height; }

  getCollisionHeight() { return this.collisionHeight; }
  getCollisionWidth() { return this.collisionWidth; }

  getCollisionX() { return this.collisionX; }
  getCollisionY() { return this.collisionY; }

  getCenterX( _x ) { // May get a custom centerX, used to check a future collision
    let x = ( _x ) ? _x : this.getCollisionX();
    return x + this.getCollisionWidth() / 2; 
  }
  getCenterY( _y ) { 
    let y = ( _y ) ? _y : this.getCollisionY();
    return y + this.getCollisionHeight() / 2; 
  }

  // Hook to run before render
  beforeRender(ctx) {   }
		
	// # Render
  render(ctx) {
    
    this.beforeRender(ctx);

    if ( this.hideSprite ) return;
      
    let props = {
      x: this.getX(),
      y: this.getY(),
      w: this.getWidth(),
      h: this.getHeight()
    } 
    let spriteProps = this.spriteProps;
    
    if( this.sprite.getSprite() ) { // Only render texture if it was set before
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.sprite.getSprite(),  
        spriteProps.clip_x, spriteProps.clip_y, 
        spriteProps.sprite_width, spriteProps.sprite_height, 
        props.x, props.y, props.w, props.h
      );
    }
      
    //DEBUG Chunk Size
    if( window.debug ) {

      let collision_props = {
        w: this.getCollisionWidth(),
        h: this.getCollisionHeight(),
        x: this.getCollisionX(),
        y: this.getCollisionY()
      }

      ctx.fillStyle = this.stopOnCollision ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.2)";
      ctx.fillRect(collision_props.x, collision_props.y, collision_props.w, collision_props.h);
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth   = 5;
      ctx.strokeRect(collision_props.x, collision_props.y, collision_props.w, collision_props.h);

    }
  
  }
    
  // Has a collision Event?
  triggersCollisionEvent() { return this.hasCollisionEvent; }

  // Will it Stop the other object if collides?
  stopIfCollision() { return this.stopOnCollision; }

  // Collision Event
  collision(object){ return true; }

  // No Collision Event
  noCollision(object){ return true; }

  // Runs when Class starts  
  run( type ) {
    this.setSpriteType(type);
  }

}//class
module.exports = _Collidable;
},{}],36:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const Sprite = require('../core/Sprite');

class _Dialog extends _Collidable {

  constructor( x, y, dialog ) {
		
		let props = {
			name: 'dialog',
			type: 'dialog'
		}
	
		let position = {
			x: x,
			y: y
		}
	
		let dimension = {
			width: window.game.getChunkSize(),
			height: window.game.getChunkSize()
		}
	
		let events = {
			stopOnCollision: true,
			hasCollisionEvent: true
		}

		let sprite = new Sprite(false, 0, 0, 0, 0);
		
		super(props, position, dimension, sprite, events);
		this.canUse = true;
		this.dialog = dialog;
	}
	
	getDialog() { return this.dialog; }

	useHandler() { 
		window.game.setDialog(this.dialog); 
	}
  setName(name) { this.name = name; }
	
	setSpriteType(type) {  	}

}//class
module.exports = _Dialog;
},{"../core/Sprite":42,"./_Collidable":35}],37:[function(require,module,exports){
class _Scenario {

  constructor(ctx, canvas, scenario_id, soundSrc){
    this.ctx = ctx;
    this.canvas = canvas;
        
    this.renderItems = new Array();
        
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.playerStartX = 0; 
    this.playerStartY = 0; 

    this.stage = null;
    this.stageId = "";
    
    this.chunkSize = window.game.getChunkSize();

    this.scenario_id = scenario_id;
    
    this.sound = null;
    this.soundSrc = soundSrc;

    this.initSound();
  }

  initSound() {
    this.sound = new Howl({
      src: [this.soundSrc],
      loop: true,
      volume: 0.5
    });
  }
  getScenarioSound() { return this.sound; }

  // # Add Items to the render
  addStaticItem(item){
    this.renderItems.push(item);
  }
  clearArrayItems(){
    this.renderItems = new Array();
  }

  // # Gets
  getCtx() { return this.ctx; }
  getCanvas() { return this.canvas; }	

  getId() { return this.scenario_id; }
  getActualStageId() { return this.stageId; }
              
  getStaticItems() { return this.renderItems; }
  getLayerItems() { return this.renderLayerItems; }
  
  getPlayer1StartX() { return this.player1StartX; }
  getPlayer1StartY() { return this.player1StartY; }
  
  getPlayer2StartX() { return this.player2StartX; }
  getPlayer2StartY() { return this.player2StartY; }
  
  // # Sets
  setPlayer1StartX(x) { this.player1StartX = x; }
  setPlayer1StartY(y) { this.player1StartY = y; }

  setPlayer2StartX(x) { this.player2StartX = x; }
  setPlayer2StartY(y) { this.player2StartY = y; }

  setActualStageId(id){ 
    this.stageId = id; 
    window.game.setCurrentStage( id );
  }

  // # Save the State of items
  saveItemsState() {
    // Bottom Layer
    let items = window.game.collision.getColItens();
    for (let i in items) {
      this.handleItemIfNeedSave(items[i]);
    }
    window.game.saveItemsState();
  }

  handleItemIfNeedSave(item) {
    
    if(item.type == "player") { return false; }

    if( item.willNeedSaveState() ) {
      
      // Check Grabbed
      let grabbed = false;
      let grabProps = {};
      if( item.canGrab ) {
        grabbed = item.isGrabbed();
        if( grabbed ) {
          grabProps = {
            'class': item.class,
            'code': item.code,
            'x0': item.x0,
            'y0': item.y0,
            'name': item.originalName,
            'stage': item.originalStage,
            'playerWhoGrabbed': item.playerWhoGrabbed
          }
        }
      }

      // Check Dropped
      let dropped = false;
      let dropProps = {};
      if( item.canGrab ) {
        dropped = item.isDropped();
        if( dropped ) {
          dropProps = {
            'class': item.class,
            'code': item.code,
            'x0': item.x0,
            'y0': item.y0,
            'dropX': item.dropX,
            'dropY': item.dropY,
            'name': item.originalName,
            'stage': item.originalStage,
            'droppedStage': (item.droppedStage) ? item.droppedStage : this.getActualStageId() // If don't have dropped stage, means we want the actual stage.  If has, keep it
          }
        }
      }

      window.game.addItemState(
        {
          'name_id': item.getName(),
          'collected': item.isCollected(),
          'grabbed': grabbed,
          'grabProps': grabProps,
          'dropped': dropped,
          'dropProps': dropProps
        }
      );
        
    }
  }

  // Functions to load selected stage
  loadStage(stage, firstStage) {
    
    this.stage = stage;

    // Clear previous render items
    this.renderItems = new Array();
    this.renderItemsAnimated = new Array();

    // Add the Static Items
    this.stage.getStaticItems().map( (item) => { 
      item.scenario = this; // Pass this scenario class as an argument, so other functions can refer to this
      this.addStaticItem(item);
    });

    // Check if player has something grabbed and include in render
    let savedItemsState = localStorage.getItem('gufitrupi__itemsState');  
    if( savedItemsState != "{}" ) {
      savedItemsState = JSON.parse(savedItemsState);
      for( let i in savedItemsState ) {
        let item = savedItemsState[i];
        // Include grabbed item
        if( item.grabbed ) {
          let obj = window.game.globalAssets.getAsset( item.grabProps.class, item.grabProps, true ); // true = came from save state
          obj.grabHandler( item.grabProps.playerWhoGrabbed ); // start a setup on the object, so the player will check the saved state of item
          this.addStaticItem(obj);
        }
        // Include dropped item
        if( item.dropped ) {
          let obj = window.game.globalAssets.getAsset( item.dropProps.class, { code: item.dropProps.code, x0: item.dropProps.x0, y0: item.dropProps.y0, stage: item.dropProps.stage }, true );
          
          if( this.stage.getStageId() != item.dropProps.droppedStage ) {
            obj.hide();
          }

          obj.droppedStage = item.dropProps.droppedStage;
          obj.dropped = true;
          obj.updateX( item.dropProps.dropX );
          obj.updateY( item.dropProps.dropY );
          obj.dropX = item.dropProps.dropX;
          obj.dropY = item.dropProps.dropY;
          obj.x0 = item.dropProps.x0;
          obj.y0 = item.dropProps.y0;

          this.addStaticItem(obj);
        }
      };
    }

    // Only set player start at first load
    if(firstStage) {
      this.setPlayer1StartX( this.stage.getPlayer1StartX() );
      this.setPlayer1StartY( this.stage.getPlayer1StartY() );
      this.setPlayer2StartX( this.stage.getPlayer2StartX() );
      this.setPlayer2StartY( this.stage.getPlayer2StartY() );
    } else {
      window.game.players.map( (player) => {
        player.checkGrabbingObjects();
      });
    }
    
  }

  render() { }

}//class
module.exports = _Scenario;
},{}],38:[function(require,module,exports){
class _Stage {

  constructor(stageId, stageMap, stageAssets, scenarioTileSet) {
    
    this.renderItems = new Array();
    
    this.renderLayerItems = new Array();

    this.chunkSize = window.game.getChunkSize();

    this.player1StartX = 0;
    this.player1StartY = 0;
    
    this.player2StartX = 0;
    this.player2StartY = 0;

    this.stageId = stageId;

    this.jsonStageMap = stageMap;
    this.jsonStageAssets = stageAssets;
    this.jsonTileSet = scenarioTileSet;

    this.stageMap = new Array();

    this.cols = this.jsonStageMap.width;
    this.rows = this.jsonStageMap.height;

    this.coordinates = {};

    this.run();
  }

  // # Gets
  getStaticItems() { return this.renderItems; }
  getLayerItems() { return this.renderLayerItems; }
  
  getPlayer1StartX() { return this.player1StartX; }
  getPlayer1StartY() { return this.player1StartY; }
  
  getPlayer2StartX() { return this.player2StartX; }
  getPlayer2StartY() { return this.player2StartY; }

  getStageId() { return this.stageId; }
  
  // # Sets
  setPlayer1StartX(x) { this.player1StartX = x; }
  setPlayer1StartY(y) { this.player1StartY = y; }

  setPlayer2StartX(x) { this.player2StartX = x; }
  setPlayer2StartY(y) { this.player2StartY = y; }
  
  // # Add Items to the render
	addStaticItem(item){
    this.renderItems.push(item);
  }
  clearArrayItems(){
    this.renderItems = new Array();
  }

  calculateStageCoordinates() {
    let index = 0;
    for( let r=0; r<this.rows;r++ ) {
        for( let c=0; c<this.cols;c++ ) {
            this.coordinates[index] = { 
              x: this.chunkSize * c,
              y: this.chunkSize * r
            }
            index++;
        }
    }
  }
  
  // Loads JSON file
  loadJSON() {
    
    // Map each layer
    this.jsonStageMap.layers.map( (layer) => {

      // Check if it's a player layer
      if( layer.name == "player") {
        this.stageMap.push( {code: 'player'} );

        this.setPlayer1StartX( layer.properties.find( x => x.name === 'player_1_x' ).value * this.chunkSize );
        this.setPlayer1StartY( layer.properties.find( x => x.name === 'player_1_y' ).value * this.chunkSize );
      
        this.setPlayer2StartX( layer.properties.find( x => x.name === 'player_2_x' ).value * this.chunkSize );
        this.setPlayer2StartY( layer.properties.find( x => x.name === 'player_2_y' ).value * this.chunkSize );

      }

      // Check if it's the assets layer
      if( layer.name == "assets") {
        this.stageMap.push({'code': 'assets'});
      }

      let index = 0;
      // Map each item inside layer
      layer.data.map( (obj) => {
        if( obj != 0 ) { // avoid empty objects
          obj = parseInt(obj - 1); // Adjust Tiled ID: they add +1 to IDs to allow 0 as a empty tile // #https://discourse.mapeditor.org/t/wrong-ids-in-tileset/1425
          let tileset = this.jsonTileSet.tiles.find( x => x.id === obj ); // Get the index of corresponding id          
          this.stageMap.push( 
            {
              'x': this.coordinates[index].x,
              'y': this.coordinates[index].y,
              'code': obj,
              'class': tileset.properties.find( x => x.name === 'class' ).value,
              'type': tileset.properties.find( x => x.name === 'type' ).value,
              'stageID': this.stageId
            }
          );
        }      
        index++;
      });
    });
    
  }

  loadAssets() {
    // Teleports
    this.jsonStageAssets.teleports.map( (asset) => {
      let props = {
        xIndex: ( asset.xIndex * this.chunkSize ),
        yIndex: ( asset.yIndex * this.chunkSize ),
        target: {
					stage: asset.props.target.stage,
					x: ( asset.props.target.x * this.chunkSize ),
					y: ( asset.props.target.y * this.chunkSize ),
					look: asset.props.target.look
				}
      }
      this.addStaticItem(
        window.game.globalAssets.getAsset('teleport', { xIndex: props.xIndex, yIndex: props.yIndex, props: props }, false ) 
      );
    });

    // Enemies
    this.jsonStageAssets.enemies.map( (enemy) => {
    });

    // Dialogs
    this.jsonStageAssets.dialogs.map( (dialog) => {
      let props = {
        x: ( dialog.x * this.chunkSize ),
        y: ( dialog.y * this.chunkSize ),
        dialog: dialog.dialog
      }
      this.addStaticItem(
        window.game.globalAssets.getAsset('dialog', { x: props.x, y: props.y, dialog: props.dialog }, false ) 
      )
    });
  }

  loadStageItems() {
    this.stageMap.map( (obj) => {

      switch( obj.code ) {

        case 'player':
          window.game.players.map( (player) => {
            this.addStaticItem( player ); // Adds the player to the render
          });
          break;

        case 'assets':
          this.loadAssets();
          break;

        default:
          this.addStaticItem(
            window.game.globalAssets.getAsset( obj.class, { code: obj.type, x0: obj.x, y0: obj.y, stage: obj.stageID }, false ) // false = not from save state
          );
          break;
      }

    });
  }

  run () {  
    this.calculateStageCoordinates();
    this.loadJSON();
    this.loadStageItems();
  }

} // class
module.exports = _Stage;
},{}],39:[function(require,module,exports){
// Class that detects collision between player and other objects
class Collision {

	constructor(scenarioWidth, scenarioHeight, player) {
		this.colItens = new Array(); // Items to check for collision
    this.scenarioWidth = scenarioWidth;
    this.scenarioHeight = scenarioHeight;
    this.player = player;
  }

  getColItens() { return this.colItens; }
			
  // # Check if the object collides with any object in vector
  // Algorithm reference: Gustavo Silveira - https://www.youtube.com/watch?v=s7qiWLBBpJw
  check(object) {
    for (let i in this.colItens) {
      let r1 = object;
      let r2 = this.colItens[i];
      this.checkCollision(r1, r2);
    } 
  }

  // @r1: the moving object
  // @r2: the "wall"
  checkCollision(r1, r2) {

    // Don't check collision between same object
    if( r1.name == r2.name ) return;
    
    // Only checks objects that needs to be checked
    if( ! r2.triggersCollisionEvent() && ! r2.stopIfCollision() ) return false;

    // stores the distance between the objects (must be rectangle)
    var catX = r1.getCenterX() - r2.getCenterX();
    var catY = r1.getCenterY() - r2.getCenterY();

    var sumHalfWidth = ( r1.getCollisionWidth() / 2 ) + ( r2.getCollisionWidth() / 2 );
    var sumHalfHeight = ( r1.getCollisionHeight() / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
    
    if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
      
      var overlapX = sumHalfWidth - Math.abs(catX);
      var overlapY = sumHalfHeight - Math.abs(catY);

      if( r2.stopIfCollision() ) {
        if(overlapX >= overlapY ){ // Direction of collision - Up/Down
          if(catY > 0){ // Up
            r1.setY( r1.getY() + overlapY );
            r1.setCollisionY( r1.getCollisionY() + overlapY );
            if( r1.type == 'player' ) r1.updateGrabCollisionXY();
          } else {
            r1.setY( r1.getY() - overlapY );
            r1.setCollisionY( r1.getCollisionY() - overlapY );
            if( r1.type == 'player' ) r1.updateGrabCollisionXY();
          }
        } else {// Direction of collision - Left/Right
          if(catX > 0){ // Left
            r1.setX( r1.getX() + overlapX );
            r1.setCollisionX( r1.getCollisionX() + overlapX );
            if( r1.type == 'player' ) r1.updateGrabCollisionXY();
          } else {
            r1.setX( r1.getX() - overlapX );
            r1.setCollisionX( r1.getCollisionX() - overlapX );
            if( r1.type == 'player' ) r1.updateGrabCollisionXY();
          }
        }
      }

      if( window.debugCollision ) {
        console.log('Collision between', r1.name + "(" + r1.getX() + "/" + r1.getY() + ")", r2.name);
      }

      // Triggers Collision event
      r1.collision(r2, r1);
      r2.collision(r1, r2);

    } else {
      // Triggers not in collision event
      r1.noCollision(r2, r2); 
      r2.noCollision(r1, r2); 
    }

  }

  // Just check for a specific collision and return the firt object collided
  justCheck(r1, _x, _y, _w, _h) {
    for (let i in this.colItens) {
      let r2 = this.colItens[i];
      let r = this.justCheckCollision(r1, r2, _x, _y, _w, _h);
      if( r ) return r; // if has something, return and stop loop
    } 
    return false;
  }

  justCheckCollision(r1, r2, _x, _y, _w, _h) {

    // Don't check collision between same object
    if( r1.name == r2.name ) return;
    
    // Only checks objects that needs to be checked
    if( ! r2.triggersCollisionEvent() ) return false;

    // stores the distance between the objects (must be rectangle)
    var catX = ( _x + _w / 2 ) - r2.getCenterX();
    var catY = ( _y + _h / 2 ) - r2.getCenterY();
 
    var sumHalfWidth = ( _w / 2 ) + ( r2.getCollisionWidth() / 2 );
    var sumHalfHeight = ( _h / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
    
    if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
      return r2;
    } else {
      return false;  
    }

  }

  // Just check for a specific collision and return the firt object collided
  justCheckAll(r1, _x, _y, _w, _h) {
    for (let i in this.colItens) {
      let r2 = this.colItens[i];
      let r = this.justCheckCollisionAll(r1, r2, _x, _y, _w, _h);
      if( r ) return r; // if has something, return and stop loop
    } 
    return false;
  }

  justCheckCollisionAll(r1, r2, _x, _y, _w, _h) {

    // Don't check collision between same object
    if( r1.name == r2.name ) return;
    
    // Only checks objects that needs to be checked
    if( ! r2.triggersCollisionEvent() && ! r2.stopIfCollision() ) return false;

    // stores the distance between the objects (must be rectangle)
    var catX = ( _x + _w / 2 ) - r2.getCenterX();
    var catY = ( _y + _h / 2 ) - r2.getCenterY();
 
    var sumHalfWidth = ( _w / 2 ) + ( r2.getCollisionWidth() / 2 );
    var sumHalfHeight = ( _h / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
    
    if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
      
      //calculate overlap if need to stop object
      let overlapX = sumHalfWidth - Math.abs(catX);
      let overlapY = sumHalfHeight - Math.abs(catY);

      if(overlapX >= overlapY ){ // Direction of collision - Up/Down
        if(catY > 0){ // Up
          r2.overlapY = r1.getY() + overlapY;
        } else {
          r2.overlapY = r1.getY() - overlapY;
        }
      } else {// Direction of collision - Left/Right
        if(catX > 0){ // Left
          r2.overlapX = r1.getX() + overlapX;
        } else {
          r2.overlapX = r1.getX() - overlapX;
        }
      }

      return r2;
    } else {
      return false;  
    }

  }
  		
	// Add items to check for collision
	addItem(object) {
		this.colItens.push(object);
  };
  
  addArrayItem(object){
		for (let i in object){
      this.colItens.push(object[i]);
    }
  }
  
  clearArrayItems() {
    this.colItens = new Array();
  }

}// class

module.exports = Collision;
	
},{}],40:[function(require,module,exports){
const gameProperties = require('../../gameProperties');
const scenarioPrototype = require('../../assets/scenario/Prototype/scenarioPrototype');
const scenarioSandbox = require('../../assets/scenario/Sandbox/scenarioSandbox');
const Player = require('../../assets/Player');
const Collision = require('./Collision');
const Render = require('./Render');
const UI = require('../ui/UI');
const GlobalAssets = require('../assets/GlobalAssets');

class Game {

  constructor() {

    // FPS Control
    this.fpsInterval = null; 
    this.now = null;
    this.deltaTime = null; 
    this.elapsed = null;

    // Events
    this.keysDown = {};
    this.keysPress = {};

    // Pause
    this._pause = false;
    this.gameIsLoaded = false;

    // Items
    this.itemsState = new Object();

    // Game
    this.gameProps = new gameProperties();
    this.players = new Array();
    this.collision = null;
    this.defaultScenario = 'sandbox';
    this.scenario = null;
    this.UI = null;
    this.currentStageName = '';

    this.gameReady = false;

    this.multiplayer = false;

    // Renders
    this.renderStatic = null;
    this.renderLayers = null;
    this.renderUI     = null;

    this.globalAssets = new GlobalAssets( this.gameProps.chunkSize );

    // Dialog Props
    this.defaultDialog = [ { hideSprite: true, text: "" } ];
    this.dialog = this.defaultDialog;
    this.dialogActive = false;
    this.dialogIndex = 0;
    this.firstKeyUpTrigger = true;

    // Sounds
    this.menuSoundSrc = "./sounds/main-menu.mp3";
    this.menuSound = false;

    this.successSoundSrc = "./sounds/scenarios/success.mp3";
    this.successSound = false;
    
    this.gameOverSoundSrc = "./sounds/scenarios/game-over.mp3";
    this.gameOverSound = false;

    this.scenarioSound = false;

    this.initSound();
  }

  initSound() {
    this.menuSound = new Howl({
      src: [this.menuSoundSrc],
      loop: true,
      volume: 0.6
    });
    this.menuSound.play();
    this.successSound = new Howl({
      src: [this.successSoundSrc],
      volume: 0.6
    });
    this.gameOverSound = new Howl({
      src: [this.gameOverSoundSrc]
    });
  }

  playSuccessSound() {
    this.scenarioSound.volume(0.2);
    this.successSound.play();
    this.successSound.on('end', () => { this.scenarioSound.volume(0.6); });
  }

  // Gets
  isGameReady() { return this.gameReady; }
  getChunkSize() { return this.gameProps.chunkSize; }

  getCanvasWidth()  { return this.gameProps.canvasWidth;  }
  getCanvasHeight() { return this.gameProps.canvasHeight; }

  // Sets
  setGameReady(bool) { this.gameReady = bool; }

  setCurrentStage(stage){ this.currentStageName = stage; }
  getCurrentStage() { return this.currentStageName; }

  // Dialog
  isDialogActive(){ return this.dialogActive; }
  setDialogActive(bool) { this.dialogActive = bool; }
  setDialog( dialog) {
    this.dialog = dialog;
    this.setDialogActive(true);
  }
  resetDialog() {
    this.dialog = this.defaultDialog;
    this.dialogIndex = 0;
    this.setDialogActive(false);
    this.firstKeyUpTrigger = true;
  }
    
  // # Go to next dialog
	nextDialog() {
    if( this.isDialogActive() ) {
      if( this.firstKeyUpTrigger ) { // Ignore the first keyUp because it's triggering to next index right after the player activate the dialog
        this.firstKeyUpTrigger = false;
      } else {
        this.dialogIndex++;
        if( this.dialog[this.dialogIndex].hideSprite ) {
          this.resetDialog();
        }
      }
    }
	}

  // # Key up handle
	handleKeyUp(keyCode) {
    
    // Pause
    if( keyCode == 27 && this.gameIsLoaded ) { // ESQ
      this.togglePause();
    }

    // Dialog
		if (keyCode == 32 || keyCode == 69) { // Space or E
			this.nextDialog();
		} 
  
  }
  
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Default Event Listeners
  defaultEventListeners() {

    // Menu Clicks
    let menuItem = document.getElementsByClassName('menu-item');
    
    for (var i = 0; i < menuItem.length; i++) {
      let _this = this;
      menuItem[i].addEventListener('click', function() {
        _this.menuAction( this.getAttribute("data-action") );
      }, false);
    }

    // # Keyboard Events
    window.addEventListener('keydown', function(e) {
      this.keysDown[e.keyCode] = true;
    }.bind(this), false);

    window.addEventListener('keyup', function(e) {
      
      // Clear previous keys
      delete this.keysDown[e.keyCode];
      
      // Reset players look direction
      if( this.players) {
        this.players.map( (player) => {
          player.resetStep();
        });
      }
      
      // Player handle keyup
      if( this.players) {
        this.players.map( (player) => {
          player.handleKeyUp(e.keyCode);
        });
      }

      // Game Handle keyp
      this.handleKeyUp(e.keyCode);
      
    }.bind(this), false);

  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Start/Restart a Game

  refreshVariables() {

    // Clear save state
    localStorage.removeItem('gufitrupi__itemsState');

    // Renders
    this.itemsState = new Object();

    this.players = new Array();
    this.collision = null;
    this.defaultScenario = 'sandbox';
    this.scenario = null;
    this.UI = null;
    this.currentStageName = '';

    // Renders
    this.renderStatic = null;
    this.renderLayers = null;
    this.renderUI     = null;

  }

  startNewGame( saveData ) {

    this.refreshVariables();
    
    // # Init
      
      let canvasStatic = document.getElementById('canvas_static');
      let contextStatic = canvasStatic.getContext('2d');

      let canvasUI = document.getElementById('canvas_ui');
      let contextUI = canvasUI.getContext('2d');

      canvasStatic.width = canvasUI.width = this.gameProps.getProp('canvasWidth');
      canvasStatic.height = canvasUI.height = this.gameProps.getProp('canvasHeight');

    // # Players
      this.players = new Array();

      if( ! saveData ) {
        let player = new Player( this.gameProps, 1 ); 
        this.players.push(player);
        if ( this.multiplayer ) {
          let player2 = new Player( this.gameProps, 2 ); 
          this.players.push(player2);
        }
      } else {
        saveData.players.map( (player) => {
          let _player = new Player( this.gameProps, player.playerNumber, player ); 
          this.players.push( _player);
        });  
      }
    
    // # Scenario
    
      if( ! saveData ) {
        this.scenario = this.getScenario( this.defaultScenario, contextStatic, canvasStatic );
      } else {
        this.scenario = this.getScenario( saveData.scenario.scenarioId, contextStatic, canvasStatic, saveData );
      }

      this.scenarioSound = this.scenario.getScenarioSound();

      // Set player X and Y
      if( ! saveData ) {
        let i = 1;
        this.players.map( (player) => {
          switch(i){
            case 1:
              player.setStartPosition( this.scenario.getPlayer1StartX(), this.scenario.getPlayer1StartY() );
              break;
            case 2:
              player.setStartPosition( this.scenario.getPlayer2StartX(), this.scenario.getPlayer2StartY() );
              break;
          }
          i++;
        });
      } else {
        saveData.players.map( (player) => {
          switch(player.playerNumber){
            case 1:
              this.players[0].setStartPosition( player.x, player.y );
              break;
            case 2:
              this.players[0].setStartPosition( player.x, player.y );
              break;
          }
        }); 
      }
      

    // # UI
      
      this.UI = new UI( this.players, this.gameProps);

    // # Collision detection class

      this.collision = new Collision( canvasStatic.width, canvasStatic.height );

    // # Render

      this.renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
      this.renderUI     = new Render(contextUI, canvasUI); 

      // Add items to be rendered
      this.renderStatic.setScenario(this.scenario); // set the scenario
    
    // Hide Elements
      document.getElementById("mainMenu").classList.remove('show');
      this.loading(false);

    // Show Canvas
      document.getElementById('gameCanvas').classList.add('show');
    
    // Make sure the game is not paused
      this.unpause();
    
    // Scenario sound
      this.scenarioSound.play();

    // Flag 
      this.gameIsLoaded = true;
    
    // Ok, run the game now
      this.setGameReady(true);
      this.runGame( this.gameProps.getProp('fps') );	// GO GO GO

  }//newGame

    // # The Game Loop
    updateGame(deltaTime) {

      if( this.isPaused() ) return;
      
      this.renderStatic.start( deltaTime );  // Static can also change, because it is the scenario... maybe will change this names to layers
      this.renderUI.start( deltaTime );
     
      // # Add the objects to the collision vector
      this.collision.clearArrayItems();
      this.collision.addArrayItem( this.scenario.getStaticItems() );
      /*this.players.map( (player) => {
        this.collision.addArrayItem(player);
      });*/
  
      // "Static" Render - Background
      this.renderStatic.clearArrayItems();
      this.renderStatic.addArrayItem(this.scenario.getStaticItems()); // Get all items from the scenario that needs to be rendered

      // UI Render
      this.renderUI.clearArrayItems();
      this.renderUI.addArrayItem( this.UI.getNewRenderItems());
      
      // # Movements
      this.players.map( (player) => {
        player.handleMovement( this.keysDown );
      });

      // # Check if player is colliding
      this.players.map( (player) => {
        this.collision.check(player);
      });
    }

    // # "Thread" tha runs the game
    runGame(fps) {
      this.fpsInterval = 1000 / fps;
      this.deltaTime = Date.now();
      this.startTime = this.deltaTime;
      this.gameLoop();
    }
    gameLoop() {

      // calc elapsed time since last loop
      this.now = Date.now();
      this.elapsed = this.now - this.deltaTime;

      // if enough time has elapsed, draw the next frame
      if ( this.elapsed > this.fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        this.deltaTime = this.now - (this.elapsed % this.fpsInterval);

        this.updateGame( this.deltaTime );

      }

      // Runs only when the browser is in focus
      // Request another frame
      requestAnimationFrame( this.gameLoop.bind(this) );

    }

    getScenario( scenario_id, contextStatic, canvasStatic, saveData ) {

      // ItemsState
      if( saveData ) {
        localStorage.setItem( 'gufitrupi__itemsState', JSON.stringify(saveData.scenario.items) );
      } else {
        localStorage.setItem( 'gufitrupi__itemsState', JSON.stringify({}) ); // Clear previous savestate
      }

      switch(scenario_id) {
        case "prototype":
          return new scenarioPrototype(contextStatic, canvasStatic, saveData );
          break;
        case "sandbox":
          return new scenarioSandbox(contextStatic, canvasStatic, saveData );
          break;
      }

    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  
  // # Menu
  
  // @paused determine if the game came from a pause action or a new game (when page loads)
  mainMenu(paused) { 
    
    let divMenu = document.getElementById('mainMenu');

    // Set mainMenu class
    ( paused ) ? document.body.classList.add('paused') : '';
    ( paused ) ? '' : divMenu.classList.add('new-game');
    
    // Toggle Menu
    divMenu.classList.toggle('show');
    
  }
    // Handle Menu Action
    menuAction(action) {
      switch(action) {
        case 'continue':
          this.continueGame();
          break;
        case 'save':
          this.saveGame();
          break;
        case 'load':
          this.loadGame();
          break;
        case 'new':
          this.multiplayer = false;
          this.newGame(false);// false = won't load saveData
          break;
        case 'new-2-players':
          this.multiplayer = true;
          this.newGame(false);// false = won't load saveData
          break;
        case 'controls':
        case 'back-controls':
          document.getElementById('mainMenu').classList.toggle('show');
          document.getElementById('controls').classList.toggle('show');
          break;
      }
    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  
  // # New Game
  newGame(saveData) {
    
    if( this.menuSound ) {
      if( this.menuSound.playing() ) this.menuSound.stop();
    }

    this.pause();
    this.loading(true);
    setTimeout( () => {
      this.startNewGame(saveData); 
    }, 500 );
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Continue
  continueGame() {
    this.unpause();
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
 
  // # Save
  saveGame() {
    if( confirm('Salvar o jogo atual irá sobreescrever qualquer jogo salvo anteriormente. Deseja continuar?') ) {
      
      // Save items state first
      this.scenario.saveItemsState();

      let saveData = new Object();

      // Multiplayer
      saveData.multiplayer = this.multiplayer;

      // Scenario
      saveData.scenario = {
        scenarioId: this.scenario.getId(),
        stageId: this.scenario.getActualStageId(),
        items: this.getItemsState()
      }

      // Players
      saveData.players = new Array();
      this.players.map( (player) => {
        saveData.players.push({
          playerNumber: player.getPlayerNumber(),
          x: player.getX(),
          y: player.getY(),
          lifes: player.getLifes()
        });
      });
      
      // Convert to JSON
      saveData = JSON.stringify(saveData);
      
      // Save on LocalStorage
      localStorage.setItem( 'gufitrupi__save', saveData );

      alert('Jogo salvo!');
    }
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Save
  loadGame() {
    
    // # Get data from localstorage and converts to json
    let saveData = JSON.parse( localStorage.getItem('gufitrupi__save') );

    if( saveData ) {
      // Will be  multiplayer game?
      this.multiplayer = ( saveData ) ? saveData.multiplayer : false;

      // Replace items state on local storage with saved states
      localStorage.setItem( 'gufitrupi__itemsState', JSON.stringify( saveData.scenario.items ) );

      // Load Items itens
      for( let i in saveData.scenario.items ) {
        this.addItemState( saveData.scenario.items[i] );
      };

      // # Loads a new game with save data
      this.newGame(saveData); 
    } else {
      alert('Não há jogo salvo previamente.')
    }
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Pause
  isPaused() { return this._pause; }
  pause() { 
    this._pause = true; 
    this.mainMenu(true);
    
    if( this.scenario ) this.scenario.sound.pause();

    //Hide Control screen
    document.getElementById('controls').classList.remove('show');
    
  }
  unpause() { 
    document.getElementById('mainMenu').classList.remove('show');
    this._pause = false; 
    
    this.menuSound.stop();
    if( this.scenario ) this.scenario.sound.play();
  }
  togglePause() { ( this.isPaused() ) ? this.unpause() : this.pause() }
  
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Loading
  loading(bool) {
    let display = ( bool ) ? 'flex' : 'none';
    document.getElementById('loading').style.display = display;
  }
  
  // # Loading
  gameOver(bool) {
    if( bool ) this._pause = true; 
    let display = ( bool ) ? 'flex' : 'none';
    document.getElementById('game-over').style.display = display;
    if( bool && this.gameOverSound ) {
      if( this.scenario ) this.scenario.sound.stop();
      this.gameOverSound.play();
    }
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  /*
    Items State
    - This are functions that handles items states between changing of stages. This will make an item to not respawn if it was collected before
  */
  
    getItemsState() { return this.itemsState; }
    addItemState( item ) { 
      this.itemsState[item.name_id] = item;  
    }

    saveItemsState() {
      let itemsState = JSON.stringify( this.getItemsState() );
      localStorage.setItem( 'gufitrupi__itemsState', itemsState );
    }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  
  // Helpers for classes to check if an object is colliding 
  checkCollision( object ) {
    if( this.isGameReady() )
      return this.collision.check(object);
  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Run
  run() {

    // Hide Elements
    document.getElementById('mainMenu').classList.remove('show');
    document.getElementById('gameCanvas').classList.remove('show');
    this.loading(false);
    this.gameOver(false);

    // Start the event listeners
    this.defaultEventListeners();

    // Shows Menu
    this.mainMenu(false);

    // Auto load a game - debug mode
    if( window.autoload ) {
      this.loadGame();
    }

  }

}
module.exports = Game;
},{"../../assets/Player":1,"../../assets/scenario/Prototype/scenarioPrototype":3,"../../assets/scenario/Sandbox/scenarioSandbox":10,"../../gameProperties":46,"../assets/GlobalAssets":30,"../ui/UI":43,"./Collision":39,"./Render":41}],41:[function(require,module,exports){
class Render {

  constructor(ctx, canvas, player) {
    this.ctx = ctx; 
    this.scenario = "";
    this.canvas = canvas;
    this.player = player;
    this.renderItems = new Array(); 
  }
  
  getArrayItems(){ return this.renderItems; }
  
  // Add items to the vector
  addItem(object){
    this.renderItems.push(object);
  }
  addArrayItem(object){
    for (let i in object){
      this.renderItems.push(object[i]);
    }
  }
  clearArrayItems(){ 
    this.renderItems = new Array(); 
  }
  setScenario(scenario){
    this.scenario = scenario;
  }
            
  // This functions will be called constantly to render items
  start(deltaTime) {		
                
    // Clear canvas before render again
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.shadowBlur = 0;

    // Scenario
    if ( this.scenario != "") 
      this.scenario.render(this.ctx);
      
    // Render items
    for (let i in this.renderItems) {
      // Execute the render function - Include this function on every class
      this.renderItems[i].render(this.ctx, deltaTime);
    }
    
  }
    
}//class
module.exports = Render
},{}],42:[function(require,module,exports){
class Sprite {

    constructor(sprite, w, h, kW, kH) {

        // The Image Sprite
        this.sprite = sprite;

        // Size of image sprite 
        this.width = w;
        this.height = h;

        // Size of each frame square 
        this.keyWidth = kW;
        this.keyHeight = kH;

        // Rows and Collumns quantity
        this.cols = Math.ceil( this.width / this.keyWidth );
        this.rows = Math.ceil( this.height / this.keyHeight );

        // The frames
        this.frames = new Object();

        this.run();
    }

    // # Gets
    getSprite()    { return this.sprite; }
    getFrame(num)  { return this.frames[num]; }
    getKeyWidth()  { return this.keyWidth;    }
    getKeyHeight() { return this.keyHeight;   }
    getSpriteProps(num) {
        return {
            clip_x: this.getFrame(num).x, clip_y: this.getFrame(num).y, 
            sprite_width: this.getKeyWidth(), sprite_height: this.getKeyHeight() 
        }
    }

    // # Run
    run() {
        // Gen each frame based on sizes 
        let index = 0;
        for( let r=0; r<this.rows;r++ ) {
            for( let c=0; c<this.cols;c++ ) {
                this.frames[index] = { 
                    x: this.keyWidth * c,
                    y: this.keyHeight * r
                }
                index++;
            }
        }
    }

}
module.exports = Sprite;
},{}],43:[function(require,module,exports){
const UIitem = require('./_UIitem');
const Dialog = require('./_Dialog');

class UI {

  constructor(players, gameProps) {
    
    this.players = players;
    this.renderItems = new Array(); 
    this.gameProps = gameProps;
    this.chunkSize = this.gameProps.getProp('chunkSize');
    this.run();
  }
              
  // Add items to the vector
  addItem(object){
    this.renderItems.push(object);
  }
  addArrayItem(object){
    for (let i in object){
      this.renderItems.push(object[i]);
    }
  }
  clearArrayItems(){ 
    this.renderItems = new Array(); 
  }
  getRenderItems(){
    return this.renderItems;
  }

  // Clear array and rerun code to get new items
  getNewRenderItems() {
    this.clearArrayItems();
    this.run();
    return this.getRenderItems();
  }

  // Math
  fromRight(value) {
    return ( this.gameProps.getProp('screenHorizontalChunks') * this.chunkSize ) - value;
  }

  run() {

    // # Players

      // # Player 01
        if( this.players[0] ) {
          
          // # Avatar
          this.addItem( new UIitem(
            'sprite_ui', this.chunkSize,
            5, 5, // x, y,
            50, 50,   // sprite_w, sprite_h, 
            0, 0,      // clip_x, clip_y
            this.chunkSize, this.chunkSize // w, h
          ) );

          // # Life
          let _1x = 120;
          let _1y = 10;
          let _1lifes = this.players[0].getLifes();
          for( let i=0; i<_1lifes;i++ ) {
            this.addItem( new UIitem(
              'sprite_ui', this.gameProps.getProp('chunkSize'),
              _1x, _1y,
              50, 50,   
              100, 0,      
              this.chunkSize/3, this.chunkSize/3 
            ) );
            _1x += 35;

            if( i == 2 ) {
              _1x = 120;
              _1y = 60;
            }
          }

        }
        
      // - - - - - - - - - - - - - - - - - - - - 

      // # Player 02
        if( this.players[1] ) {
          // # Avatar
          this.addItem( new UIitem(
            'sprite_ui', this.gameProps.getProp('chunkSize'),
            this.fromRight( 230 ), 5, 
            50, 50,   
            50, 0,      
            this.chunkSize, this.chunkSize 
          ) );
          
          // # Life
          let _2x = this.fromRight( 50 );
          let _2y = 10;
          let _2lifes = this.players[1].getLifes();
          for( let i=0; i<_2lifes;i++ ) {
            this.addItem( new UIitem(
              'sprite_ui', this.gameProps.getProp('chunkSize'),
              _2x, _2y,
              50, 50,   
              100, 0,      
              this.chunkSize/3, this.chunkSize/3 
            ) );
            _2x -= 35;

            if( i == 2 ) {
              _2x = this.fromRight( 50 );
              _2y = 60;
            }
          }
        }

    // # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  

    /*
        Dialog Box
    */
      
      let dProps = {
        x: this.chunkSize * 1,
        y: window.game.gameProps.canvasHeight - (this.chunkSize * 1),
        w: window.game.gameProps.canvasWidth - (this.chunkSize * 2),
        h: this.chunkSize * 4,
        dialog: window.game.dialog[window.game.dialogIndex]
      }
      dProps.y = dProps.y - dProps.h;
      
      this.addItem( 
        new Dialog( dProps.x, dProps.y, dProps.w, dProps.h, dProps.dialog ) 
      );
  }
}//class
module.exports = UI
},{"./_Dialog":44,"./_UIitem":45}],44:[function(require,module,exports){
class _Dialog {

  constructor( x, y, w, h, dialog ) {
    
    this.dialog = dialog;
    
    this.text = {};

    // # Position
    this.x = x;
    this.y = y;

    this.w = w;
		this.h = h;
		
		this.cornerRadius = 20;

		this.fillColor = "rgba(255,255,255,0.8)";
		this.strokeColor = "rgba(0,0,0,0.8)";
		
		this.font = "28px 'Press Start 2P'";
    this.fontColor = "rgba(0,0,0,0.8)";

    this.textY = this.y + 90;
    this.adjustText( this.dialog.text, 48 );

  }
    
  // # Sets      
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }
          
    // # Gets            
    getX() { return this.x; }
    getY() { return this.y; }

    adjustText( str, lenght ) {
      this.text = this.splitText(str, lenght);
    }

    splitText(str, l) { //ref: https://stackoverflow.com/questions/7624713/js-splitting-a-long-string-into-strings-with-char-limit-while-avoiding-splittin
      var strs = [];
      while(str.length > l){
          var pos = str.substring(0, l).lastIndexOf(' ');
          pos = pos <= 0 ? l : pos;
          strs.push(str.substring(0, pos));
          var i = str.indexOf(' ', pos)+1;
          if(i < pos || i > pos+l)
              i = pos;
          str = str.substring(i);
      }
      strs.push(str);
      return strs;
  }

    // # Item Render
    render(ctx) {
          
      if ( this.dialog.hideSprite ) return;
			
			// Rounded Rectangle - reference: http://jsfiddle.net/robhawkes/gHCJt/
    
		  // Set faux rounded corners
      ctx.lineJoin = "round";
      ctx.lineWidth = this.cornerRadius;

			// Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
			
			// Stroke
			ctx.strokeStyle = this.strokeColor;
			ctx.strokeRect(this.x + ( this.cornerRadius/2), this.y + (this.cornerRadius/2), this.w - this.cornerRadius, this.h - this.cornerRadius );
			
			// Fill
			ctx.fillStyle = this.fillColor;
      ctx.fillRect(this.x + ( this.cornerRadius/2), this.y + (this.cornerRadius/2), this.w - this.cornerRadius, this.h - this.cornerRadius );
			
			// Font
			ctx.font = this.font;
      ctx.fillStyle = this.fontColor
      this.text.map( (text) => {
        ctx.fillText( text, this.x + 50, this.textY);
        this.textY = this.textY + 50;
      } );
			
    }
         
  }//class
  module.exports = _Dialog;
    
},{}],45:[function(require,module,exports){
class UIitem {

  constructor(itemSpriteID, chunkSize, x, y, sw, sh, cx, cy, w, h ) {
  
    // # Sprite
    this.itemSprite = document.getElementById(itemSpriteID);
    
    this.spriteProps = {
      sprite_width: sw,
      sprite_height: sh,
      clip_x: cx,
      clip_y: cy,
    }
    
    this.hideSprite = false;
    
    // # Position
    this.x = x;
    this.y = y;
    
    this.chunkSize = chunkSize;

    // # Properties
    this.width = w; //px
    this.height = h; //px
  }

  // # Sets      
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
      
  setHeight(height) { this.height = height; }
  setWidth(width) { this.width = width; }

  // # Gets            
  getX() { return this.x; }
  getY() { return this.y; }
      
  getWidth() { return this.width; }
  getHeight() { return this.height; }
   
  // # Item Render
  render(ctx) {
      
    if ( this.hideSprite ) return;

    let props = {
      x: this.getX(),
      y: this.getY(),
      w: this.getWidth(),
      h: this.getHeight()
    } 
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.itemSprite,  
      this.spriteProps.clip_x, this.spriteProps.clip_y, 
      this.spriteProps.sprite_width, this.spriteProps.sprite_height, 
      props.x, props.y, props.w, props.h
    );
    
  }
     
}//class

module.exports = UIitem;

},{}],46:[function(require,module,exports){
// Game Properties class to define configurations
class gameProperties {

  constructor() {
    
    // Canvas size based on "chunks" 
    
    this.chunkSize = 100; //px - resolution
    
    this.screenHorizontalChunks = 16;
    this.screenVerticalChunks = 14;
    
    this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
    this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);// Canvas size based on "chunks" 
    
    this.fps = 24;
  }

  getProp(prop) {
    return this[prop];
  }

}
module.exports = gameProperties;

// Global values

  // Debug
  window.debug = false; // Show debug squares
  window.debugCollision = false; // Show when objects collide
  window.autoload = true; // auto load a saved game
  window.god_mode = false; // Players won't die
},{}],47:[function(require,module,exports){
const Game = require('./engine/core/Game');
console.clear();
window.onload = function() {
  
  // # Triggers new game only when click on button - needed some interaction to activate the sound
  let startGameButton = document.getElementById('start-game-button');
  startGameButton.addEventListener('click', function() {
    runGame();
  }, false);

  // Debug
  if( window.autoload ) {
    runGame();
  }

  // # Start the game
  function runGame() {
    
    document.getElementById('first-screen').style.display = "none";

    let game = new Game();
    window.game = game;
    game.run();

  }
 
}
},{"./engine/core/Game":40}]},{},[2,3,4,5,6,7,8,10,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,46,47])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zYW5kYm94LXRpbGVzZXQuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL2NlbnRlci1hc3NldHMuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvY2VudGVyLmpzb24iLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL2xpZmUtYXNzZXRzLmpzb24iLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL2xpZmUuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfY2VudGVyLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9zdGFnZV9kb29ycy5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfZW5lbXkuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2xpZmUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9GbG9vci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX1dhbGwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9EaWFsb2cuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9Eb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRW5lbXkuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9GaXJlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vSGVhbC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0tleS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL09iamVjdF9QdXNoLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vT2JqZWN0X1Rocm93LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vVGVsZXBvcnQuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9HbG9iYWxBc3NldHMuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ2FuQmVQdXNoZWQuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ2FuQ29sbGVjdC5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19DYW5IdXJ0LmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhblRocm93LmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fRGlhbG9nLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX1NjZW5hcmlvLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX1N0YWdlLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL0NvbGxpc2lvbi5qcyIsImNsaWVudC9lbmdpbmUvY29yZS9HYW1lLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL1JlbmRlci5qcyIsImNsaWVudC9lbmdpbmUvY29yZS9TcHJpdGUuanMiLCJjbGllbnQvZW5naW5lL3VpL1VJLmpzIiwiY2xpZW50L2VuZ2luZS91aS9fRGlhbG9nLmpzIiwiY2xpZW50L2VuZ2luZS91aS9fVUlpdGVtLmpzIiwiY2xpZW50L2dhbWVQcm9wZXJ0aWVzLmpzIiwiY2xpZW50L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0akJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDak1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbm9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIFBsYXllciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVQcm9wcywgcGxheWVyTnVtYmVyLCBwbGF5ZXJQcm9wcykge1xyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgICAgaWYoIHBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfb25lJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoIHBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfdHdvJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFNwcml0ZSggdGhpcy5wbGF5ZXJTcHJpdGUsIDMwMCwgOTYwLCAyMCwgNDApO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHt9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwID0gW107XHJcbiAgICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgICB0aGlzLmluaXRpYWxTdGVwID0gMjtcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICB0aGlzLm1heFN0ZXBzID0gODtcclxuXHJcbiAgICAgIC8vIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIEFuaW1hdGlvblxyXG4gICAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDEyOyAvLyAxMDAwIC8gRlBTXHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgIHRoaXMuY2h1bmtTaXplID0gZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgIHRoaXMueSA9IDA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLngwID0gMDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICB0aGlzLnkwID0gMDtcclxuICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmNodW5rU2l6ZTsgLy9weFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2h1bmtTaXplICogMjsgLy9weFxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcGVlZDAgPSAwLjE3O1xyXG4gICAgICB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnNwZWVkMDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMubmFtZSA9IFwicGxheWVyX1wiICsgcGxheWVyTnVtYmVyO1xyXG4gICAgICB0aGlzLnBsYXllck51bWJlciA9IHBsYXllck51bWJlcjtcclxuICAgICAgdGhpcy50eXBlID0gXCJwbGF5ZXJcIjtcclxuXHJcbiAgICAgIHRoaXMuZ3JhYmluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLndhbGtpbmcgPSBmYWxzZTtcclxuICAgICAgXHJcbiAgICAvLyAjIEV2ZW50cyAgXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmlzQ29sbGlkYWJsZSA9IHRydWU7XHJcbiAgICAgIHRoaXMuaXNNb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICBcclxuICAgICAgLy8gIyBDb2xsaXNpb25cclxuICAgICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGggKiAwLjg7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiAwLjM7XHJcbiAgICAgIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgPSB0aGlzLndpZHRoICogMC4xOyAvLyBVc2VkIHRvIHNldCBjb2xsaXNpb24gWCB3aGVuIHNldHRpbmcgWCBcclxuICAgICAgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSA9IHRoaXMuaGVpZ2h0ICogMC43OyBcclxuICAgICAgdGhpcy5jb2xsaXNpb25YID0gMDsvL3RoaXMueDAgKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkgPSAwOy8vdGhpcy55MCArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGE7XHJcblxyXG4gICAgICB0aGlzLmNvbGxpc2lvblgwID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkwID0gdGhpcy5jb2xsaXNpb25ZO1xyXG5cclxuICAgICAgLy8gR3JhYi9QaWNrIEl0ZW1zIENvbGxpc2lvbiBCb3hcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSAwO1xyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSAwO1xyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gMDtcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IDA7XHJcblxyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBudWxsO1xyXG5cclxuICAgICAgLy8gIyBMaWZlXHJcbiAgICAgIHRoaXMuZGVmYXVsdExpZmVzID0gNjtcclxuICAgICAgdGhpcy5saWZlcyA9IHRoaXMuZGVmYXVsdExpZmVzO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICB0aGlzLmh1cnRDb29sRG93blRpbWUgPSAyMDAwOyAvLzJzXHJcblxyXG4gICAgICAvLyBQbGF5ZXIgUHJvcHMgaWYgaGFzXHJcbiAgICAgIGlmKCBwbGF5ZXJQcm9wcyApIHtcclxuICAgICAgICB0aGlzLmxpZmVzID0gcGxheWVyUHJvcHMubGlmZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMud2Fsa1NvdW5kID0gZmFsc2U7XHJcbiAgICAgIHRoaXMudXNlU291bmQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5odXJ0U291bmQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5ncmFiU291bmQgPSBmYWxzZTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAgIyBTb3VuZHNcclxuICAqL1xyXG4gICAgaW5pdFNvdW5kcygpIHtcclxuICAgICAgLy8gV2Fsa1xyXG4gICAgICB0aGlzLndhbGtTb3VuZCA9IG5ldyBIb3dsKHsgc3JjOiBbJy4vc291bmRzL3BsYXllci93YWxrLm1wMyddLCBsb29wOiB0cnVlLCB2b2x1bWU6IDAuNiB9KTtcclxuICAgICAgLy8gVXNlXHJcbiAgICAgIHRoaXMudXNlU291bmQgPSBuZXcgSG93bCh7IHNyYzogWycuL3NvdW5kcy9wbGF5ZXIvdXNlLm1wMyddIH0pO1xyXG4gICAgICAvLyBIdXJ0XHJcbiAgICAgIHRoaXMuaHVydFNvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvcGxheWVyL2h1cnQubXAzJ10sIHZvbHVtZTogMC41IH0pO1xyXG4gICAgICAvLyBHcmFiXHJcbiAgICAgIHRoaXMuZ3JhYlNvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvcGxheWVyL2dyYWIubXAzJ10gfSk7XHJcbiAgICB9XHJcblxyXG4gIC8qIFxyXG4gICAgICBHcmFiL1BpY2sgSXRlbXMgQ29sbGlzaW9uIEJveFxyXG4gICovXHJcblxyXG4gICAgY2hlY2tHcmFiYmluZ09iamVjdHMoKSB7XHJcbiAgICAgIGxldCBoYXNHcmFiT2JqZWN0ID0gZmFsc2U7XHJcbiAgICAgIC8vIENoZWNrIGlmIHBsYXllciBoYXMgZ3JhYmJlZCBpdGVtc1xyXG4gICAgICBsZXQgcmVuZGVyZWRJdGVtcyA9IHdpbmRvdy5nYW1lLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCk7XHJcbiAgICAgIGZvciggbGV0IGkgaW4gcmVuZGVyZWRJdGVtcyApIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHJlbmRlcmVkSXRlbXNbaV07XHJcbiAgICAgICAgaWYoIGl0ZW0uZ3JhYmJlZCAmJiBpdGVtLnBsYXllcldob0dyYWJiZWQgPT0gdGhpcy5wbGF5ZXJOdW1iZXIgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gaXRlbTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgb2JqLmdyYWJIYW5kbGVyKHRoaXMucGxheWVyTnVtYmVyKTtcclxuICAgICAgICAgIHRoaXMuZ3JhYk9iamVjdCggb2JqICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICBoYXNHcmFiT2JqZWN0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYoICEgaGFzR3JhYk9iamVjdCApIHtcclxuICAgICAgICB0aGlzLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY2hlY2tJdGVtT25HcmFiQ29sbGlzaW9uQm94KCkge1xyXG4gICAgICByZXR1cm4gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpc0dyYWJpbmcoKSB7IHJldHVybiB0aGlzLmdyYWJpbmc7IH1cclxuICAgIHNldE5vdEdyYWJiaW5nKCl7XHJcbiAgICAgIHRoaXMucmVtb3ZlR3JhYmVkT2JqZWN0KCk7XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVHcmFiZWRPYmplY3QoKSB7IFxyXG4gICAgICB0aGlzLmdyYWJpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cmlnZ2VyR3JhYigpe1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgaWYgaGFzIGEgXCJfQ2FuR3JhYlwiIGl0ZW0gY29sbGlkaW5nIHdpdGggZ3JhYiBoaXQgYm94IGFuZCBcInBpY2tcIiBpdGVtXHJcbiAgICAgIGlmKCAhIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgICBpZiggb2JqZWN0ICYmIG9iamVjdC5jYW5HcmFiICkge1xyXG4gICAgICAgICAgaWYoIG9iamVjdC5pc0dyYWJiZWQoKSApIHJldHVybjsgLy8gYXZvaWQgcGxheWVycyBncmFiYmluZyB0aGUgc2FtZSBvYmplY3RcclxuICAgICAgICAgIG9iamVjdC5ncmFiSGFuZGxlcih0aGlzLnBsYXllck51bWJlcik7XHJcbiAgICAgICAgICB0aGlzLmdyYWJPYmplY3QoIG9iamVjdCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdyYWJTb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiggdGhpcy5vYmplY3RHcmFiYmVkICkge1xyXG4gICAgICAgICAgLy8gRHJvcCBpZiBoYXMgbm90aGluZyBvIHBsYXllciBncmFiIGNvbGxpc2lvbiBib3hcclxuICAgICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrQWxsKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgICBpZiggIW9iamVjdCApIHtcclxuICAgICAgICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLmRyb3AoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uLCB0aGlzLmdldEhlaWdodCgpICk7IC8vIFRocm93IGF3YXkgb2JqZWN0XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IGZhbHNlOyAvLyByZW1vdmUgZ3JhYmJlZFxyXG4gICAgICAgICAgICB0aGlzLmdyYWJpbmcgPSAhdGhpcy5ncmFiaW5nO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdyYWJTb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgICB0aGlzLmdyYWJpbmcgPSAhdGhpcy5ncmFiaW5nO1xyXG4gICAgICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlIGl0ZW1zXHJcbiAgICB0cmlnZ2VyVXNlKCkge1xyXG4gICAgICAvLyBJZiBoYXMgb2JqZWN0IGluIGhhbmQsIHVzZSBpdFxyXG4gICAgICBpZiggdGhpcy5vYmplY3RHcmFiYmVkICkge1xyXG4gICAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51c2UoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uLCB0aGlzLmdldEhlaWdodCgpLCB0aGlzICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgbm90LCB0cnkgdG8gdXNlIHRoZSBvbmUgb24gZnJvbnRcclxuICAgICAgICBsZXQgb2JqZWN0ID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgICAgIGlmKCBvYmplY3QgJiYgb2JqZWN0LmNhblVzZSApIHtcclxuICAgICAgICAgIG9iamVjdC51c2VIYW5kbGVyKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnVzZVNvdW5kLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgICBnZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uWTsgfVxyXG5cclxuICAgIC8vIEF0dGFjaCBhbiBpdGVtIHRvIHBsYXllclxyXG4gICAgZ3JhYk9iamVjdCggb2JqZWN0ICkge1xyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBvYmplY3Q7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYmJlZE9iamVjdFBvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IEdyYWJDb2xsaXNpb24gWCBhbmQgWSBjb25zaWRlcmluZyBwbGF5ZXIgbG9vayBkaXJlY3Rpb25cclxuICAgIHVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpIHtcclxuICAgICAgc3dpdGNoKHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSArIHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgICd1cCc6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSAtIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWCAtIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblggKyB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBoYXMgc29tZSBvYmplY3QgZ3JhYmJlZCwgdXBkYXRlIHBvc2l0aW9uXHJcbiAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVHcmFiYmVkT2JqZWN0UG9zaXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpIHtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpICk7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMub2JqZWN0R3JhYmJlZC5nZXRIZWlnaHQoKSArICAoIHRoaXMuZ2V0SGVpZ2h0KCkgKiAwLjEgKSAgKTtcclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcbiAgICAgICAgXHJcbiAgLypcclxuICAgIFNwcml0ZSAvIEFuaW1hdGlvblxyXG4gICovXHJcblxyXG4gICAgZ2V0U3ByaXRlUHJvcHMoKSB7IHJldHVybiB0aGlzLnNwcml0ZVByb3BzOyB9XHJcblxyXG4gICAgXHJcblx0XHRoaWRlUGxheWVyKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyB9XHJcbiAgICBzaG93UGxheWVyKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG4gICAgXHJcbiAgICBsb29rRG93bigpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgICAgXHJcbiAgICAgIC8vIFN0ZXBzXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDcgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1VwKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwNyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDExMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTEyICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE3ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIyICk7XHJcbiAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1JpZ2h0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3OCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3OSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MiApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNyApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcblx0XHRsb29rTGVmdCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0OCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0OSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MiApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIHBsYXllciBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICAgIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblx0XHRcdGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cdCAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gICAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgICBpZih0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgICAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRTdGVwKCkge1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICAgIGNhc2UgJ2xlZnQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyaWdodCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdkb3duJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0TG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKSB7IHRoaXMubG9va0RpcmVjdGlvbiA9IGxvb2tEaXJlY3Rpb247IH1cclxuXHRcdHRyaWdnZXJMb29rRGlyZWN0aW9uKGRpcmVjdGlvbikgeyBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICB9XHJcblx0XHRyZXNldFBvc2l0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuY29sbGlzaW9uWTAgKTtcclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcbiAgICBcclxuICAvKlxyXG4gICAgTW92ZW1lbnRcclxuICAqL1xyXG4gICAgXHJcbiAgICBzZXRTdGFydFBvc2l0aW9uKHgsIHkpIHtcclxuICAgICAgdGhpcy5zZXRYKCB4ICk7XHJcbiAgICAgIHRoaXMuc2V0WSggeSApO1xyXG4gICAgICB0aGlzLngwID0geDtcclxuICAgICAgdGhpcy55MCA9IHk7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWCA9IHggKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkgPSB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYTtcclxuICAgICAgdGhpcy5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgIFxyXG4gICAgZ2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcblxyXG4gICAgc2V0WCh4LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICAgIHRoaXMueCA9IHg7IFxyXG4gICAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25YKCB4ICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSApO1xyXG4gICAgfVxyXG4gICAgc2V0WSh5LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICAgIHRoaXMueSA9IHk7IFxyXG4gICAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25ZKCB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRTcGVlZChzcGVlZCkgeyB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiBzcGVlZDsgfVxyXG4gICAgXHJcblx0XHRtb3ZMZWZ0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgIHRoaXMud2Fsa2luZyA9IHRydWU7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlJpZ2h0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgdGhpcy53YWxraW5nID0gdHJ1ZTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92VXAoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICB0aGlzLndhbGtpbmcgPSB0cnVlO1xyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZEb3duKCkgeyAgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgdGhpcy53YWxraW5nID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgaGFuZGxlTW92ZW1lbnQoIGtleXNEb3duICkge1xyXG5cclxuICAgICAgLy8gSWYgZGlhbG9nIGFjdGl2ZSwgZG9uJ3Qgd2Fsa1xyXG4gICAgICBpZiggd2luZG93LmdhbWUuaXNEaWFsb2dBY3RpdmUoKSApIHJldHVybjtcclxuICAgICAgXHJcbiAgICAgIC8vIFBsYXllciAxIENvbnRyb2xzXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIGlmICgzNyBpbiBrZXlzRG93bikgdGhpcy5tb3ZMZWZ0KCk7ICAvLyBMZWZ0XHJcbiAgICAgICAgaWYgKDM4IGluIGtleXNEb3duKSB0aGlzLm1vdlVwKCk7ICAgIC8vIFVwICBcclxuICAgICAgICBpZiAoMzkgaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHRcclxuICAgICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93blxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMiBDb250cm9sc1xyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoNjUgaW4ga2V5c0Rvd24pIHRoaXMubW92TGVmdCgpOyAgLy8gTGVmdCAgPT4gQVxyXG4gICAgICAgIGlmICg4NyBpbiBrZXlzRG93bikgdGhpcy5tb3ZVcCgpOyAgICAvLyBVcCAgICA9PiBXXHJcbiAgICAgICAgaWYgKDY4IGluIGtleXNEb3duKSB0aGlzLm1vdlJpZ2h0KCk7IC8vIFJpZ2h0ID0+IERcclxuICAgICAgICBpZiAoODMgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93biAgPT4gU1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUtleVVwKGtleVVwKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBJZiBkaWFsb2cgYWN0aXZlLCBkb24ndCB3YWxrXHJcbiAgICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0RpYWxvZ0FjdGl2ZSgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIDFcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgaWYgKGtleVVwID09IDE3KSB0aGlzLnRyaWdnZXJHcmFiKCk7ICAvLyBHcmFiID0+IENUUkxcclxuICAgICAgICBpZiAoa2V5VXAgPT0gMzIpIHRoaXMudHJpZ2dlclVzZSgpOyAgIC8vIFVzZSA9PiBTcGFjZVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQbGF5ZXIgMlxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoa2V5VXAgPT0gNzApIHRoaXMudHJpZ2dlckdyYWIoKTsgIC8vIEdyYWIgPT4gRlxyXG4gICAgICAgIGlmIChrZXlVcCA9PSA2OSkgdGhpcy50cmlnZ2VyVXNlKCk7ICAvLyBVc2UgPT4gRVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLndhbGtpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy53YWxrU291bmQuc3RvcCgpO1xyXG4gICAgfVxyXG5cclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHRcdFxyXG4gIC8qXHJcbiAgICBDb2xsaXNpb25cclxuICAqL1xyXG4gICAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICAgIHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcblxyXG4gICAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgIHJldHVybiB4ICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMjsgXHJcbiAgICB9XHJcbiAgICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICAgIGxldCB5ID0gKCBfeSApID8gX3kgOiB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuICAgICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICAgIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gICAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuXHRcdG5vQ29sbGlzaW9uKCkge1xyXG5cdFx0XHQvLyBXaGF0IGhhcHBlbnMgaWYgdGhlIHBsYXllciBpcyBub3QgY29sbGlkaW5nP1xyXG5cdFx0XHR0aGlzLnNldFNwZWVkKHRoaXMuc3BlZWQwKTsgLy8gUmVzZXQgc3BlZWRcclxuICAgIH1cclxuICAgICAgXHJcbiAgICBjb2xsaXNpb24ob2JqZWN0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblx0XHRcclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHJcblx0LypcclxuICAgIExpZmUgLyBIZWFsIC8gRGVhdGhcclxuICAqL1x0XHJcbiAgICBnZXRMaWZlcygpIHsgcmV0dXJuIHRoaXMubGlmZXM7IH1cclxuXHJcbiAgICBodXJ0UGxheWVyKCBhbW91bnQgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmh1cnRTb3VuZC5wbGF5KCk7XHJcblxyXG4gICAgICAgIC8vIEh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgICAgaWYoIHRoaXMubGlmZXMgPCAwICkgdGhpcy5saWZlcyA9IDA7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IGNvb2xkb3duXHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBwbGF5ZXIgZGllZFxyXG4gICAgICAgIHRoaXMuY2hlY2tQbGF5ZXJEZWF0aCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGVhbFBsYXllciggYW1vdW50ICkge1xyXG4gICAgICB0aGlzLmxpZmVzICs9IHBhcnNlSW50KGFtb3VudCk7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzID4gdGhpcy5kZWZhdWx0TGlmZXMgKSB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tQbGF5ZXJEZWF0aCgpIHtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAxICYmICF3aW5kb3cuZ29kX21vZGUgKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUuZ2FtZU92ZXIodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBcclxuICAgIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFx0XHJcbiAgICAvKlxyXG4gICAgICBHZW5lcmFsXHJcbiAgICAqL1xyXG4gICAgICAgIFxyXG4gICAgICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgICAgIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgICBcclxuICAgICAgZ2V0UGxheWVyTnVtYmVyKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJOdW1iZXI7IH1cclxuXHJcbiAgICAgIGdldENvbG9yKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG4gICAgICAgIFxyXG4gICAgICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgIFxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFxyXG4gIC8qICBcclxuICAgIFJlbmRlclxyXG4gICovXHJcbiAgXHRcdFxyXG5cdCAgcmVuZGVyKGN0eCkge1xyXG4gICAgICBcclxuICAgICAgLy8gQmxpbmsgcGxheWVyIGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgICAgaWYoICEgdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gIXRoaXMuaGlkZVNwcml0ZTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgICBpZiggdGhpcy53YWxraW5nICYmICF0aGlzLndhbGtTb3VuZC5wbGF5aW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy53YWxrU291bmQucGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXaGF0IHRvIGRvIGV2ZXJ5IGZyYW1lIGluIHRlcm1zIG9mIHJlbmRlcj8gRHJhdyB0aGUgcGxheWVyXHJcbiAgICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgICB9IFxyXG4gICAgICBcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1x0XHJcblxyXG4gICAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpICk7XHJcblxyXG4gICAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIE1hdGgucm91bmQodGhpcy5nZXRYKCkpICsgXCIgWTpcIiArIE1hdGgucm91bmQodGhpcy5nZXRZKCkpO1xyXG4gICAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSAyMCk7XHJcblxyXG4gICAgICAgIC8vIEdyYWIgY29sbGlzaW9uXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLCAwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuXHRcdH07XHJcblxyXG5cclxuICAgIHJ1bigpIHtcclxuICAgICAgdGhpcy5pbml0U291bmRzKCk7XHJcbiAgICAgIC8vdGhpcy5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmxvb2tEaXJlY3Rpb24gPSB0aGlzLmxvb2tEb3duKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9XHJcblx0XHRcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcbiAgICBQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IF9TX2NlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2NlbnRlcicpO1xyXG5jb25zdCBfU191cCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX3VwJyk7XHJcbmNvbnN0IF9TX3JpZ2h0ID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfcmlnaHQnKTtcclxuY29uc3QgX1NfYm90dG9tID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfYm90dG9tJyk7XHJcbmNvbnN0IF9TX2xlZnQgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9sZWZ0Jyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1Byb3RvdHlwZSBleHRlbmRzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzYXZlRGF0YSl7XHJcbiAgICBzdXBlcihjdHgsIGNhbnZhcywgXCJwcm90b3R5cGVcIik7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGFnZUlkID0gXCJjZW50ZXJcIjtcclxuICAgIFxyXG4gICAgLy8gRGVmaW5lIHdoaWNoIHN0YWdlIHdpbGwgbG9hZCBvbiBmaXJzdCBydW5cclxuICAgIHRoaXMuc3RhZ2VUb0xvYWQgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5zY2VuYXJpby5zdGFnZUlkIDogdGhpcy5kZWZhdWx0U3RhZ2VJZDtcclxuICAgIFxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhZ2VzXHJcbiAgc2V0U3RhZ2Uoc3RhZ2VfaWQsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIFxyXG4gICAgbGV0IF9zdGFnZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkXHJcbiAgICBzd2l0Y2goc3RhZ2VfaWQpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICBsZXQgc19jZW50ZXIgPSBuZXcgX1NfY2VudGVyKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19jZW50ZXI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICBsZXQgc191cCA9IG5ldyBfU191cCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfdXA7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIGxldCBzX2xlZnQgPSBuZXcgX1NfbGVmdCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfbGVmdDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIGxldCBzX3JpZ2h0ID0gbmV3IF9TX3JpZ2h0KCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19yaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICBsZXQgc19ib3R0b20gPSBuZXcgX1NfYm90dG9tKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19ib3R0b207XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExvYWQgdGhlIHN0YWdlIGRlZmluZWRcclxuICAgICAgdGhpcy5sb2FkU3RhZ2UoX3N0YWdlLCBmaXJzdFN0YWdlKTtcclxuICB9XHJcbiBcclxuICAvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMuc2V0U3RhZ2UoIHRoaXMuc3RhZ2VUb0xvYWQsIHRydWUpOyAgICBcclxuXHR9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvUHJvdG90eXBlOyIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9Cb3R0b20gZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJib3R0b21cIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYyLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdjX2JsLCAgICAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdjX2JyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9Cb3R0b207XHJcbiIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiY2VudGVyXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjIsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgaXdjX2JyLCAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgaXdjX2JsLCAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0IF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgICAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgb2IsICAgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIGl3Y190ciwgICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y190bCwgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ3VwJyB9O1xyXG4gICAgbGV0IHRwXzAzID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgICAgIHRhcmdldFN0YWdlOiAncmlnaHQnIH07XHJcbiAgICBsZXQgdHBfMDQgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdib3R0b20nIH07XHJcbiAgICBsZXQgdHBfMDUgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgICAgdGFyZ2V0U3RhZ2U6ICdsZWZ0JyB9O1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogXCJmaXJlXCIsIHR5cGU6IFwiMDFcIn07IFxyXG5cclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGVmdCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImxlZnRcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3Y190bCwgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0ICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgb2IsICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMiwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX2JsLCB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0xlZnQ7XHJcbiIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9SaWdodCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcInJpZ2h0XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHdjX3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdjX2JyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJsZWZ0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX1JpZ2h0O1xyXG4iLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfVXAgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJ1cFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpOztcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y190bCwgICAgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfVXBcclxuIiwibW9kdWxlLmV4cG9ydHM9eyBcImNvbHVtbnNcIjo2MSxcclxuIFwiaW1hZ2VcIjpcIi4uXFwvY29tbW9uXFwvc3ByaXRlc1xcL2JlYWNoLnBuZ1wiLFxyXG4gXCJpbWFnZWhlaWdodFwiOjEwNTUsXHJcbiBcImltYWdld2lkdGhcIjoxOTgwLFxyXG4gXCJtYXJnaW5cIjowLFxyXG4gXCJuYW1lXCI6XCJjZW50ZXJcIixcclxuIFwic3BhY2luZ1wiOjAsXHJcbiBcInRpbGVjb3VudFwiOjE5NTIsXHJcbiBcInRpbGVkdmVyc2lvblwiOlwiMS4yLjRcIixcclxuIFwidGlsZWhlaWdodFwiOjMyLFxyXG4gXCJ0aWxlc1wiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJib3R0b21cIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNixcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJjb3JuZXJfdG9wX2xlZnRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJjb3JuZXJfdG9wX3JpZ2h0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MjQsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidHJlZV90b3BfbGVmdFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjI1LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInRyZWVfdG9wX3JpZ2h0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6NzIsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidG9wXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6NzcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiY29ybmVyX2JvdHRvbV9sZWZ0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6NzgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiY29ybmVyX2JvdHRvbV9yaWdodFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjg1LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInRyZWVfbWlkZGxlX2xlZnRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjo4NixcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJ0cmVlX21pZGRsZV9yaWdodFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEzNCxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJyaWdodFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEzNSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJsZWZ0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTM2LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEzNyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTQ2LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInRyZWVfYm90dG9tX2xlZnRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNDcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidHJlZV9ib3R0b21fcmlnaHRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxOTcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTk4LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoyNDUsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF9mbG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInNhbmRfMDFcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjo2MjMsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwid2F0ZXJcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjo3MzQsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF9mbG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInNhbmRfMDJcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMjkxLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImZlbmNlXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTcwOCxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImZpcmVcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTc2OSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImhlYWxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiYW5hbmFcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNzcwLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiaGVhbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlcnJ5XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTc3MSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIm9iamVjdF90aHJvd1wiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJhcnJlbFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NzMsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJvYmplY3RfcHVzaFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInN0b25lXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTc3NSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImtleVwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImdyYXlcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNzc2LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwia2V5XCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwicHVycGxlXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTc3NyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImtleVwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInJlZFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NzgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJrZXlcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJncmVlblwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NzksXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZGlhbG9nXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfV0sXHJcbiBcInRpbGV3aWR0aFwiOjMyLFxyXG4gXCJ0eXBlXCI6XCJ0aWxlc2V0XCIsXHJcbiBcInZlcnNpb25cIjoxLjJcclxufSIsIi8qXHJcbiAgU2FuZGJveCBTY2VuYXJpb1xyXG4qL1xyXG5jb25zdCBfU2NlbmFyaW8gPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TY2VuYXJpbycpO1xyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QganNvblNjZW5hcmlvVGlsZVNldCA9IHJlcXVpcmUoJy4vc2FuZGJveC10aWxlc2V0Lmpzb24nKTtcclxuXHJcbmNvbnN0IGpzb25TdGFnZUNlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL2NlbnRlci5qc29uJyk7XHJcbmNvbnN0IGpzb25TdGFnZUNlbnRlckFzc2V0cyA9IHJlcXVpcmUoJy4vc3RhZ2VzL2NlbnRlci1hc3NldHMuanNvbicpO1xyXG5cclxuY29uc3QganNvblN0YWdlTGlmZSA9IHJlcXVpcmUoJy4vc3RhZ2VzL2xpZmUuanNvbicpO1xyXG5jb25zdCBqc29uU3RhZ2VMaWZlQXNzZXRzID0gcmVxdWlyZSgnLi9zdGFnZXMvbGlmZS1hc3NldHMuanNvbicpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9TYW5kYm94IGV4dGVuZHMgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHNhdmVEYXRhKXtcclxuICAgIGxldCBzb3VuZFNyYyA9IFwiLi9zb3VuZHMvc2FuZGJveC1iYWNrZ3JvdW5kLm1wM1wiO1xyXG4gICAgc3VwZXIoY3R4LCBjYW52YXMsIFwic2FuZGJveFwiLCBzb3VuZFNyYyk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGFnZUlkID0gXCJjZW50ZXJcIjtcclxuICAgIFxyXG4gICAgLy8gRGVmaW5lIHdoaWNoIHN0YWdlIHdpbGwgbG9hZCBvbiBmaXJzdCBydW5cclxuICAgIHRoaXMuc3RhZ2VUb0xvYWQgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5zY2VuYXJpby5zdGFnZUlkIDogdGhpcy5kZWZhdWx0U3RhZ2VJZDtcclxuXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICAvLyBTYXZlIGl0ZW1zIHN0YXRlIGJlZm9yZSBjbGVhclxyXG4gICAgaWYoICFmaXJzdFN0YWdlICkge1xyXG4gICAgICB0aGlzLnNhdmVJdGVtc1N0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuXHJcbiAgICAvLyBTZXQgQWN0dWFsIFN0YWdlIElEXHJcbiAgICB0aGlzLnNldEFjdHVhbFN0YWdlSWQoIHN0YWdlX2lkICk7XHJcbiAgICBcclxuICAgIGxldCBfc3RhZ2UgPSBudWxsO1xyXG5cclxuICAgIC8vIENoZWNrIHdoaWNoIHN0YWdlIHdpbGwgbG9hZFxyXG4gICAgc3dpdGNoKHN0YWdlX2lkKSB7XHJcbiAgICAgIGRlZmF1bHQ6IFxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBfU3RhZ2UoIHN0YWdlX2lkLCBqc29uU3RhZ2VDZW50ZXIsIGpzb25TdGFnZUNlbnRlckFzc2V0cywganNvblNjZW5hcmlvVGlsZVNldCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsaWZlJzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgX1N0YWdlKCBzdGFnZV9pZCwganNvblN0YWdlTGlmZSwganNvblN0YWdlTGlmZUFzc2V0cywganNvblNjZW5hcmlvVGlsZVNldCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWQgdGhlIHN0YWdlIGRlZmluZWRcclxuICAgIHRoaXMubG9hZFN0YWdlKF9zdGFnZSwgZmlyc3RTdGFnZSk7XHJcbiAgfVxyXG4gXHJcbiAgLy8gU2V0IERlZmF1bHQgU3RhZ2VcclxuICBydW4oKSB7XHJcbiAgICB0aGlzLnNldFN0YWdlKCB0aGlzLnN0YWdlVG9Mb2FkLCB0cnVlICk7ICAgIFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9TYW5kYm94OyIsIm1vZHVsZS5leHBvcnRzPXtcclxuXHRcInRlbGVwb3J0c1wiOiBbXHJcblx0XHR7XHJcblx0XHRcdFwieEluZGV4XCI6IDcsXHJcblx0XHRcdFwieUluZGV4XCI6IDAsXHJcblx0XHRcdFwicHJvcHNcIjogeyAgXHJcblx0XHRcdFx0XCJ0YXJnZXRcIjoge1xyXG5cdFx0XHRcdFx0XCJzdGFnZVwiOiBcImxpZmVcIixcclxuXHRcdFx0XHRcdFwieFwiOiA3LFxyXG5cdFx0XHRcdFx0XCJ5XCI6IDExXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdFx0e1xyXG5cdFx0XHRcInhJbmRleFwiOiAwLFxyXG5cdFx0XHRcInlJbmRleFwiOiA2LFxyXG5cdFx0XHRcInByb3BzXCI6IHsgIFxyXG5cdFx0XHRcdFwidGFyZ2V0XCI6IHtcclxuXHRcdFx0XHRcdFwic3RhZ2VcIjogXCJlbmVteVwiLFxyXG5cdFx0XHRcdFx0XCJ4XCI6IDE0LFxyXG5cdFx0XHRcdFx0XCJ5XCI6IDVcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHR7XHJcblx0XHRcdFwieEluZGV4XCI6IDE1LFxyXG5cdFx0XHRcInlJbmRleFwiOiA2LFxyXG5cdFx0XHRcInByb3BzXCI6IHsgIFxyXG5cdFx0XHRcdFwidGFyZ2V0XCI6IHtcclxuXHRcdFx0XHRcdFwic3RhZ2VcIjogXCJkb29yc1wiLFxyXG5cdFx0XHRcdFx0XCJ4XCI6IDEsXHJcblx0XHRcdFx0XHRcInlcIjogNVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdF0sXHJcblx0XCJkaWFsb2dzXCI6WyBcclxuXHRcdHtcclxuXHRcdFx0XCJ4XCI6IDEyLFxyXG5cdFx0XHRcInlcIjogOSxcclxuXHRcdFx0XCJkaWFsb2dcIjogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdFwiaGlkZVNwcml0ZVwiOiBmYWxzZSxcclxuXHRcdFx0XHRcdFwidGV4dFwiOiBcIldlbGNvbWUgdG8gR3VmaXRydXAgbXkgZnJpZW5kIVwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJXYWxrIGFyb3VuZCBhbmQgZmVlbCBmcmVlIHRvIHRlc3QgdGhpcyBnYW1lLlwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJJZiB5b3UgZmluZCBhbnkgYnVncy4uLlwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCIuLi5zb3JyeSA+LjwgXCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdFwiaGlkZVNwcml0ZVwiOiBmYWxzZSxcclxuXHRcdFx0XHRcdFwidGV4dFwiOiBcIkJ1dCBsZXQgbWUga25vdyB3aGF0IHlvdSd2ZSBmb3VuZCwgcGxlYXNlIVwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJIYXZlIGZ1biA6RFwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogdHJ1ZSxcclxuXHRcdFx0XHRcdFwidGV4dFwiOiBcIlwiXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdXHJcblx0XHR9LFxyXG5cdFx0e1xyXG5cdFx0XHRcInhcIjogMSxcclxuXHRcdFx0XCJ5XCI6IDUsXHJcblx0XHRcdFwiZGlhbG9nXCI6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJLZXlzIGFuZCBEb29yc1wiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7IFwiaGlkZVNwcml0ZVwiOiB0cnVlLCBcInRleHRcIjogXCJcIiB9XHJcblx0XHRcdF1cclxuXHRcdH0sXHJcblx0XHR7XHJcblx0XHRcdFwieFwiOiA2LFxyXG5cdFx0XHRcInlcIjogMSxcclxuXHRcdFx0XCJkaWFsb2dcIjogW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdFwiaGlkZVNwcml0ZVwiOiBmYWxzZSxcclxuXHRcdFx0XHRcdFwidGV4dFwiOiBcIkZpcmUgYW5kIEhlYWx0aCBpdGVtc1wiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7IFwiaGlkZVNwcml0ZVwiOiB0cnVlLCBcInRleHRcIjogXCJcIiB9XHJcblx0XHRcdF1cclxuXHRcdH0sXHJcblx0XHR7XHJcblx0XHRcdFwieFwiOiAxMyxcclxuXHRcdFx0XCJ5XCI6IDUsXHJcblx0XHRcdFwiZGlhbG9nXCI6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCIhISBEQU5HRVIgISFcIlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XCJoaWRlU3ByaXRlXCI6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XCJ0ZXh0XCI6IFwiRW5lbXlzIGFuZCBCYXJyZWxzXCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgXCJoaWRlU3ByaXRlXCI6IHRydWUsIFwidGV4dFwiOiBcIlwiIH1cclxuXHRcdFx0XVxyXG5cdFx0fSxcclxuXHRdLFxyXG5cdFwiZW5lbWllc1wiOlsgXVxyXG59IiwibW9kdWxlLmV4cG9ydHM9eyBcImhlaWdodFwiOjE0LFxyXG4gXCJpbmZpbml0ZVwiOmZhbHNlLFxyXG4gXCJsYXllcnNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDE3LCAxOTksIDI0NiwgMTM1LCA3OCwgMTM4LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDEzNSwgNjI0LCAxNywgNzMsIDE4LCA2MjQsIDEzNiwgMjQ2LCA3MzUsIDE5OCwgMTgsIDc4LCAxMzgsIDI0NiwgMjQ2LCAxMzcsIDc5LCA2MjQsIDEzNiwgMjQ2LCAxOTgsIDE4LCA3OCwgMTM4LCAyNDYsIDI0NiwgMTk4LCAxOCwgNzgsIDEyLCAxMiwgNzksIDYyNCwgNjI0LCAxMzYsIDczNSwgMjQ2LCAxOTgsIDE4LCAxMzYsIDI0NiwgMjQ2LCAyNDYsIDE5OCwgNzMsIDczLCAxOCwgNjI0LCA2MjQsIDE3LCAxOTksIDI0NiwgMjQ2LCAyNDYsIDE5OCwgMTk5LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxOTgsIDE4LCA2MjQsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDI0NiwgMjQ2LCAxOTgsIDczLCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzOCwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM3LCAxMiwgMTM4LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgMTIsIDc4LCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxOTgsIDE4LCA3OCwgMTM4LCAyNDYsIDI0NiwgMTM3LCA3OSwgNjI0LCA2MjQsIDc4LCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxOTgsIDczLCAxOTksIDI0NiwgMjQ2LCAxOTgsIDE4LCA2MjQsIDE4LCA2MjQsIDc4LCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCA2MjQsIDE5OCwgMTgsIDYyNCwgMTM2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAxMzcsIDc5LCA2MjQsIDI0NiwgMTk4LCAxOCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDEzNywgMTIsIDEzOCwgMjQ2LCAyNDYsIDEzNywgNzksIDYyNCwgNjI0LCA3MzUsIDI0NiwgMTk4LCAxOCwgNzgsIDEyLCAxMiwgNzksIDYyNCwgNzgsIDEyLCAxMiwgNzksIDYyNCwgNjI0LCA2MjRdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MSxcclxuICAgICAgICAgXCJuYW1lXCI6XCJncm91bmRcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTc4MCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTc4MCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTc4MCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTQ3LCAxNDgsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3MDksIDE3MDksIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEyOTIsIDEyOTIsIDAsIDEyOTIsIDAsIDAsIDAsIDAsIDEyOTIsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3ODAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3NzIsIDE3NzIsIDE3NzIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3NzIsIDE3NzIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MixcclxuICAgICAgICAgXCJuYW1lXCI6XCJvYmplY3RzXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6NixcclxuICAgICAgICAgXCJuYW1lXCI6XCJhc3NldHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjozLFxyXG4gICAgICAgICBcIm5hbWVcIjpcInBsYXllclwiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMV94XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxMFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8xX3lcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjEwXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzJfeFwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiMTFcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMl95XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxMFwiXHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjUsIDI2LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCA4NiwgODcsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDI1LCAyNiwgMjUsIDI2LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAyNV0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo4LFxyXG4gICAgICAgICBcIm5hbWVcIjpcIm9iamVjdHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfV0sXHJcbiBcIm5leHRsYXllcmlkXCI6OSxcclxuIFwibmV4dG9iamVjdGlkXCI6MSxcclxuIFwib3JpZW50YXRpb25cIjpcIm9ydGhvZ29uYWxcIixcclxuIFwicmVuZGVyb3JkZXJcIjpcImxlZnQtdXBcIixcclxuIFwidGlsZWR2ZXJzaW9uXCI6XCIxLjIuNFwiLFxyXG4gXCJ0aWxlaGVpZ2h0XCI6MzIsXHJcbiBcInRpbGVzZXRzXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJmaXJzdGdpZFwiOjEsXHJcbiAgICAgICAgIFwic291cmNlXCI6XCIuLlxcL3NhbmRib3gtdGlsZXNldC5qc29uXCJcclxuICAgICAgICB9XSxcclxuIFwidGlsZXdpZHRoXCI6MzIsXHJcbiBcInR5cGVcIjpcIm1hcFwiLFxyXG4gXCJ2ZXJzaW9uXCI6MS4yLFxyXG4gXCJ3aWR0aFwiOjE2XHJcbn0iLCJtb2R1bGUuZXhwb3J0cz17XHJcblx0XCJ0ZWxlcG9ydHNcIjogW1xyXG5cdFx0e1xyXG5cdFx0XHRcInhJbmRleFwiOiA3LFxyXG5cdFx0XHRcInlJbmRleFwiOiAxMyxcclxuXHRcdFx0XCJwcm9wc1wiOiB7ICBcclxuXHRcdFx0XHRcInRhcmdldFwiOiB7XHJcblx0XHRcdFx0XHRcInN0YWdlXCI6IFwiY2VudGVyXCIsXHJcblx0XHRcdFx0XHRcInhcIjogNyxcclxuXHRcdFx0XHRcdFwieVwiOiAwXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XSxcclxuXHRcImRpYWxvZ3NcIjpbIF0sXHJcblx0XCJlbmVtaWVzXCI6WyBdXHJcbn0iLCJtb2R1bGUuZXhwb3J0cz17IFwiaGVpZ2h0XCI6MTQsXHJcbiBcImluZmluaXRlXCI6ZmFsc2UsXHJcbiBcImxheWVyc1wiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOls2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgMTcsIDczLCA3MywgNzMsIDczLCAxOCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgMTcsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxOTgsIDE4LCA2MjQsIDYyNCwgNjI0LCAxNywgNzMsIDczLCA3MywgNzMsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTk4LCAxOCwgNjI0LCAxNywgMTk5LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxOTgsIDE4LCAxMzYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNSwgMTM2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCAxMzYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDc4LCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgNzksIDYyNCwgNzgsIDEyLCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgNzksIDYyNCwgNjI0LCA2MjQsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgMTIsIDEyLCA3OSwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMTM3LCA3OSwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA3OCwgMTM4LCAyNDYsIDEzNywgNzksIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjRdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MSxcclxuICAgICAgICAgXCJuYW1lXCI6XCJncm91bmRcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMTc3MCwgMTc3MCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTcwOSwgMCwgMCwgMCwgMCwgMCwgMCwgMTc3MSwgMCwgMCwgMTcwOSwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMCwgMTcwOSwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTc3MSwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMTcwOSwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMTc3MCwgMCwgMTcwOSwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MiwgMTcwOSwgMTI5MiwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjoyLFxyXG4gICAgICAgICBcIm5hbWVcIjpcIm9iamVjdHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo0LFxyXG4gICAgICAgICBcIm5hbWVcIjpcImFzc2V0c1wiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInR5cGVcIjpcInRpbGVsYXllclwiLFxyXG4gICAgICAgICBcInZpc2libGVcIjp0cnVlLFxyXG4gICAgICAgICBcIndpZHRoXCI6MTYsXHJcbiAgICAgICAgIFwieFwiOjAsXHJcbiAgICAgICAgIFwieVwiOjBcclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOlswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICAgXCJoZWlnaHRcIjoxNCxcclxuICAgICAgICAgXCJpZFwiOjMsXHJcbiAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8xX3hcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjZcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMV95XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxMVwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8yX3hcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjdcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMl95XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxMVwiXHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfV0sXHJcbiBcIm5leHRsYXllcmlkXCI6NSxcclxuIFwibmV4dG9iamVjdGlkXCI6MSxcclxuIFwib3JpZW50YXRpb25cIjpcIm9ydGhvZ29uYWxcIixcclxuIFwicmVuZGVyb3JkZXJcIjpcImxlZnQtdXBcIixcclxuIFwidGlsZWR2ZXJzaW9uXCI6XCIxLjIuNFwiLFxyXG4gXCJ0aWxlaGVpZ2h0XCI6MzIsXHJcbiBcInRpbGVzZXRzXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJmaXJzdGdpZFwiOjEsXHJcbiAgICAgICAgIFwic291cmNlXCI6XCIuLlxcL3NhbmRib3gtdGlsZXNldC5qc29uXCJcclxuICAgICAgICB9XSxcclxuIFwidGlsZXdpZHRoXCI6MzIsXHJcbiBcInR5cGVcIjpcIm1hcFwiLFxyXG4gXCJ2ZXJzaW9uXCI6MS4yLFxyXG4gXCJ3aWR0aFwiOjE2XHJcbn0iLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5jb25zdCBEaWFsb2cgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRGlhbG9nJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIFxyXG4gICAgc3VwZXIoXCJjZW50ZXJcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkaWFsb2dcIjpcclxuICAgICAgICByZXR1cm4gbmV3IERpYWxvZyhpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuICAgICAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgaXdjX2JyLCAgICBmMSwgICAgaXdjX2JsLCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjIsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfYnIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfYmwgXSxcclxuICAgICAgWyBmMSwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGl3Y190ciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y190bCBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMiwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIHdiLCAgICAgICAgd2IsICAgIHdiLCAgICAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfbGYgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdsaWZlJyB9O1xyXG4gICAgbGV0IHRwX2VuZW15ID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgIHRhcmdldFN0YWdlOiAnZW5lbXknIH07XHJcbiAgICBsZXQgdHBfZG9vcnMgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICB0YXJnZXRTdGFnZTogJ2Rvb3JzJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgdGJsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRiciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fcmlnaHRcIiB9OyBcclxuXHJcbiAgICBcclxuICAgIGxldCBicmQyID0geyBuYW1lOiBcImRpYWxvZ1wiLCB0eXBlOiBcImNlbnRlcl9sZWZ0X25vdGljZVwifTtcclxuICAgIGxldCBicmQzID0geyBuYW1lOiBcImRpYWxvZ1wiLCB0eXBlOiBcImNlbnRlcl90b3Bfbm90aWNlXCJ9O1xyXG4gICAgbGV0IGJyZDQgPSB7IG5hbWU6IFwiZGlhbG9nXCIsIHR5cGU6IFwiY2VudGVyX3JpZ2h0X25vdGljZVwifTtcclxuICAgIGxldCBicmR3ID0geyBuYW1lOiBcImRpYWxvZ1wiLCB0eXBlOiBcImNlbnRlcl93ZWxjb21lXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgZmMgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImZlbmNlXCJ9O1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2xmLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBicmQzLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGJyZDIsICAgZmFsc2UsICAgIGZhbHNlLCAgIGZjLCAgICAgIGZjLCAgICAgIGZjLCAgICAgZmMsICAgICAgZmMsICAgICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgIGJyZDQsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGJyZHcsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfZG9vcnMsZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9lbmVteSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGZhbHNlLCAgICAgIGZjLCAgICAgIGZjLCAgIGZjLCAgICAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9DZW50ZXI7IiwiY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBEb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0Rvb3InKTtcclxuY29uc3QgS2V5ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0tleScpO1xyXG5jb25zdCBPYmplY3RfVGhyb3cgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1Rocm93Jyk7XHJcbmNvbnN0IE9iamVjdF9QdXNoID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL09iamVjdF9QdXNoJyk7XHJcbmNvbnN0IERpYWxvZyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9EaWFsb2cnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9Eb29ycyBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImRvb3JzXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSAwO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IERvb3IoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJrZXlcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEtleShpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpICk7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3Rocm93XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfVGhyb3coaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfcHVzaFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1B1c2goaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkaWFsb2dcIjpcclxuICAgICAgICAgIHJldHVybiBuZXcgRGlhbG9nKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICAgICB3dCwgICAgd3QsICAgICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfYmwgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y190bCBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIHdiLCAgICAgICAgd2IsICAgIHdiLCAgICAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcblxyXG4gICAgbGV0IGVuZW15ID0geyBuYW1lOiAnZW5lbXknLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG4gICAgbGV0IGJlcnJ5ID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiZXJyeSd9OyBcclxuXHJcbiAgICBsZXQgYnJybCA9IHsgbmFtZTogJ29iamVjdF90aHJvdycsIHR5cGU6ICdiYXJyZWwnfTsgXHJcbiAgICBsZXQgc3RuZSA9IHsgbmFtZTogJ29iamVjdF9wdXNoJywgdHlwZTogJ3N0b25lJ307IFxyXG5cclxuICAgIGxldCBmbmNlID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJmZW5jZVwifTtcclxuXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdyaWdodCcsIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG5cclxuICAgIGxldCBkZ2JsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyYXlfYmwnfTsgXHJcbiAgICBsZXQgZGd0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X3RsJ307IFxyXG4gICAgbGV0IGRnYnIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV9icid9OyBcclxuICAgIGxldCBkZ3RyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyYXlfdHInfTsgXHJcbiAgICBcclxuICAgIGxldCBkcGJsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3B1cnBsZV9ibCd9OyBcclxuICAgIGxldCBkcHRsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3B1cnBsZV90bCd9OyBcclxuICAgIGxldCBkcGJyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3B1cnBsZV9icid9OyBcclxuICAgIGxldCBkcHRyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3B1cnBsZV90cid9OyBcclxuICAgIFxyXG4gICAgbGV0IGRyYmwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcmVkX2JsJ307IFxyXG4gICAgbGV0IGRydGwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcmVkX3RsJ307IFxyXG4gICAgbGV0IGRyYnIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcmVkX2JyJ307IFxyXG4gICAgbGV0IGRydHIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcmVkX3RyJ307IFxyXG4gICAgXHJcbiAgICBsZXQgZGdyYmwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JlZW5fYmwnfTsgXHJcbiAgICBsZXQgZGdydGwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JlZW5fdGwnfTsgXHJcbiAgICBsZXQgZGdyYnIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JlZW5fYnInfTsgXHJcbiAgICBsZXQgZGdydHIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JlZW5fdHInfTsgXHJcblxyXG4gICAgbGV0IGtfZyA9IHsgbmFtZTogJ2tleScsIHR5cGU6ICdncmF5J307IFxyXG4gICAgbGV0IGtfcCA9IHsgbmFtZTogJ2tleScsIHR5cGU6ICdwdXJwbGUnfTsgXHJcbiAgICBsZXQga19yID0geyBuYW1lOiAna2V5JywgdHlwZTogJ3JlZCd9OyBcclxuICAgIGxldCBrX2dyID0geyBuYW1lOiAna2V5JywgdHlwZTogJ2dyZWVuJ307IFxyXG4gICAgXHJcbiAgICBsZXQgZ250YyA9IHsgbmFtZTogXCJkaWFsb2dcIiwgdHlwZTogXCJkb29yc19ncmF0el9ub3RpY2VcIn07XHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBrX3IsICAgICBmYWxzZSwgICBmbmNlLCAgICBrX2csICAgICBmYWxzZSwgICBmbmNlLCAgICBrX3AsICAgIGZhbHNlLCAgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBnbnRjLCAgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBkZ3RsLCAgICBkZ3RyLCAgICBmbmNlLCAgICBkcHRsLCAgICBkcHRyLCAgICBmbmNlLCAgICBkcnRsLCAgICBkcnRyLCAgICBmbmNlLCAgICBkZ3J0bCwgICBkZ3J0ciwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZm5jZSwgICBkZ2JsLCAgICBkZ2JyLCAgICBmbmNlLCAgICBkcGJsLCAgICBkcGJyLCAgICBmbmNlLCAgICBkcmJsLCAgICBkcmJyLCAgICBmbmNlLCAgICBkZ3JibCwgICBkZ3JiciwgICBmbmNlLCAgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9jIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBicnJsLCAgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXTtcclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBpdGVtc0JvdHRvbS5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0Rvb3JzOyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgSGVhbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9IZWFsJyk7XHJcbmNvbnN0IEVuZW15ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0VuZW15Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5jb25zdCBPYmplY3RfVGhyb3cgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1Rocm93Jyk7XHJcbmNvbnN0IE9iamVjdF9QdXNoID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL09iamVjdF9QdXNoJyk7XHJcbmNvbnN0IEtleSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9LZXknKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9FbmVteSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImVuZW15XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZW5lbXlcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEVuZW15KGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3Rocm93XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfVGhyb3coaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfcHVzaFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1B1c2goaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJrZXlcIjpcclxuICAgICAgICAgIHJldHVybiBuZXcgS2V5KGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkgKTsgXHJcbiAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICAgICB3dCwgICAgd3QsICAgICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfYnIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGYxLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgaXdjX3RyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgICAgIHdiLCAgICB3YiwgICAgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6ICdmaXJlJywgdHlwZTogJzAxJ307IFxyXG5cclxuICAgIGxldCBlbmVteSA9IHsgbmFtZTogJ2VuZW15JywgdHlwZTogJzAxJ307IFxyXG4gICAgbGV0IGJubmEgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JhbmFuYSd9OyBcclxuICAgIGxldCBiZXJyeSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmVycnknfTsgXHJcblxyXG4gICAgbGV0IGJycmwgPSB7IG5hbWU6ICdvYmplY3RfdGhyb3cnLCB0eXBlOiAnYmFycmVsJ307IFxyXG4gICAgbGV0IHN0bmUgPSB7IG5hbWU6ICdvYmplY3RfcHVzaCcsIHR5cGU6ICdzdG9uZSd9OyBcclxuXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdsZWZ0JywgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBrX2dyID0geyBuYW1lOiAna2V5JywgdHlwZTogJ2dyZWVuJ307IFxyXG5cclxuICAgIGxldCBpdGVtc0JvdHRvbSA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGtfZ3IsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGVuZW15LCAgIGVuZW15LCAgIGVuZW15LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGVuZW15LCAgIGZhbHNlLCAgIGVuZW15LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBlbmVteSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgZmFsc2UsICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF9jLCAgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBicnJsLCAgIGZhbHNlLCAgIHN0bmUsICAgIGZhbHNlLCAgIGJycmwsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGJycmwsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfRW5lbXk7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuY29uc3QgSGVhbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9IZWFsJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGlmZSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImxpZmVcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgZjEsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG4gICAgbGV0IGJlcnJ5ID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiZXJyeSd9OyBcclxuXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdib3R0b20nLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmlyZSwgICAgYm5uYSwgICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGJlcnJ5LCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmaXJlLCAgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgYmVycnksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmlyZSwgICBmaXJlLCAgICBmaXJlLCAgICBmaXJlLCAgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgYmVycnksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfTGlmZTsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF9GbG9vciBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJCZWFjaCBGbG9vclwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCIwMVwiOlxyXG4gICAgICBjYXNlIFwic2FuZF8wMVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNDkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcIjAyXCI6XHJcbiAgICAgIGNhc2UgXCJzYW5kXzAyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDkzMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGNvbGxpc2lvbihwbGF5ZXIpeyBcclxuICAgIHBsYXllci5zZXRUZWxlcG9ydGluZyhmYWxzZSk7XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF9GbG9vcjsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF93YWxsIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIkJlYWNoIFdhbGxcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCJ0b3BcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNzMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNzgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg3OSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMDApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwid2F0ZXJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNjMzKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9ic3RhY2xlXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI1MCk7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmVuY2VcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxMik7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjUpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjEwKTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX21pZGRsZV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg4Nyk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNDgpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvbiBTaXplXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25XaWR0aCggdGhpcy5jaHVua1NpemUgKiAwLjMgKTtcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvblgodGhpcy54ICsgdGhpcy5jaHVua1NpemUgKiAwLjcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTQ5KTtcclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkaWFsb2dcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTgwOCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfd2FsbDsiLCJjb25zdCBfRGlhbG9nVHJpZ2dlciA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0RpYWxvZycpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIERpYWxvZyBleHRlbmRzIF9EaWFsb2dUcmlnZ2VyIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZSkge1xyXG5cdFxyXG5cdGxldCBwcm9wcyA9IHtcclxuXHQgIG5hbWU6IFwiZGlhbG9nXCIsXHJcblx0ICB0eXBlOiB0eXBlLFxyXG5cdCAgc3RhZ2U6IHN0YWdlXHJcblx0fVxyXG5cclxuXHRsZXQgcG9zaXRpb24gPSB7XHJcblx0ICB4OiB4MCxcclxuXHQgIHk6IHkwXHJcblx0fVxyXG5cclxuXHRsZXQgZGltZW5zaW9uID0ge1xyXG5cdCAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG5cdCAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG5cdH1cclxuXHJcblx0bGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuXHRsZXQgZXZlbnRzID0ge1xyXG5cdCAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG5cdCAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuXHR9XHJcblx0XHJcblx0c3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCB7IGZyb21TYXZlU3RhdGU6IGZhbHNlIH0pO1xyXG5cclxuXHR0aGlzLnR5cGUgPSAnZGlhbG9nJztcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG5cdFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG5cdFx0c3dpdGNoKHR5cGUpIHtcclxuXHRcdFx0Y2FzZSAnY2VudGVyX3dlbGNvbWUnOlxyXG5cdFx0XHRcdHRoaXMuc2V0RGlhbG9nKFxyXG5cdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJXZWxjb21lIHRvIEd1Zml0cnVwIG15IGZyaWVuZCFcIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJXYWxrIGFyb3VuZCBhbmQgZmVlbCBmcmVlIHRvIHRlc3QgdGhpcyBnYW1lLlwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIklmIHlvdSBmaW5kIGFueSBidWdzLi4uXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiLi4uc29ycnkgPi48IFwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkJ1dCBsZXQgbWUga25vdyB3aGF0IHlvdSd2ZSBmb3VuZCwgcGxlYXNlIVwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkhhdmUgZnVuIDpEXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRdXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImNlbnRlcl9sZWZ0X25vdGljZVwiOlxyXG5cdFx0XHRcdHRoaXMuc2V0RGlhbG9nKFxyXG5cdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJLZXlzIGFuZCBEb29yc1wiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiXCJcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiY2VudGVyX3RvcF9ub3RpY2VcIjpcclxuXHRcdFx0XHR0aGlzLnNldERpYWxvZyhcclxuXHRcdFx0XHRcdFtcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiRmlyZSBhbmQgSGVhbHRoIGl0ZW1zXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRdXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJjZW50ZXJfcmlnaHRfbm90aWNlXCI6XHJcblx0XHRcdFx0XHR0aGlzLnNldERpYWxvZyhcclxuXHRcdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogXCIhISBEQU5HRVIgISFcIlxyXG5cdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkVuZW15cyBhbmQgQmFycmVsc1wiXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImRvb3JzX2dyYXR6X25vdGljZVwiOlxyXG5cdFx0XHRcdFx0dGhpcy5zZXREaWFsb2coXHJcblx0XHRcdFx0XHRcdFtcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IFwiWW91IGRpZCBpdCEgOkRcIlxyXG5cdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IFwiXCJcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdF1cclxuXHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFxyXG5cdFx0fVxyXG5cdFxyXG4gIH1cclxuXHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IERpYWxvZzsiLCJjb25zdCBfQ2FuQ29sbGVjdCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBEb29yIGV4dGVuZHMgX0NhbkNvbGxlY3Qge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJkb29yXCIsXHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIHN0YWdlOiBzdGFnZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2FuQ29sbGVjdFByb3BzID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkNvbGxlY3RQcm9wcyk7XHJcblxyXG4gICAgdGhpcy50eXBlID0gJ2Rvb3InO1xyXG5cclxuICAgIHRoaXMub3BlblNvdW5kID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gICAgdGhpcy5pbml0U291bmRzKCk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAgIyBTb3VuZHNcclxuICAqL1xyXG4gIGluaXRTb3VuZHMoKSB7XHJcbiAgICAvLyBPcGVuXHJcbiAgICB0aGlzLm9wZW5Tb3VuZCA9IG5ldyBIb3dsKHsgc3JjOiBbJy4vc291bmRzL3NjZW5hcmlvcy9kb29yLW9wZW4ubXAzJ10sIHZvbHVtZTogMC40IH0pO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmNvbGxlY3RlZCA9PT0gdHJ1ZSApeyAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaXMgYWxyZWFkeSBncmFiYmVkXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgLy8gR3JheVxyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X3RsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAvLyBQdXJwbGVcclxuICAgICAgY2FzZSBcImRvb3JfcHVycGxlX2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfdHJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU0KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgLy8gUmVkXHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF9ibFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9yZWRfdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU1KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxOCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Nik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIC8vIEdyZWVuXHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Nyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMjApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmVlbl90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU4KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMuc2V0TmVlZFNhdmVTdGF0ZSh0cnVlKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBPcGVuIGRvb3IgPSBoaWRlIGFsbCBkb29ycyB3aXRoIHNhbWUgY29kZSBcclxuICBvcGVuKCkge1xyXG4gICAgbGV0IG9ianMgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uZ2V0Q29sSXRlbnMoKTtcclxuICAgIGZvciAobGV0IGkgaW4gb2Jqcykge1xyXG4gICAgICBpZiggb2Jqc1tpXS50eXBlID09ICdkb29yJyApIHtcclxuICAgICAgICBpZiggb2Jqc1tpXS5nZXRDb2RlKCkgPT0gdGhpcy5nZXRDb2RlKCkgKSB7XHJcbiAgICAgICAgICB0aGlzLm9wZW5Tb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5U3VjY2Vzc1NvdW5kKCk7XHJcbiAgICAgICAgICBvYmpzW2ldLmNvbGxlY3QoKTtcclxuICAgICAgICAgIG9ianNbaV0uaGlkZSgpO1xyXG4gICAgICAgICAgb2Jqc1tpXS5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRG9vcjsiLCJjb25zdCBfQ2FuSHVydCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0Nhbkh1cnQnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBFbmVteSBleHRlbmRzIF9DYW5IdXJ0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJlbmVteVwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAyXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuSHVydFByb3BzID0ge1xyXG4gICAgICBhbW91bnQ6IDFcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwge30sIGV2ZW50cywgY2FuSHVydFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50ID0gMTtcclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPSAxO1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50ID0gMDtcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gKCB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuZnBzIC8gMiApOyAvLyAxMDAwIC8gRlBTXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2VuZW15JyksIDMwMCwgOTYwLCAyMCwgNDApO1xyXG5cclxuICAgIHRoaXMuc3RlcCA9IG5ldyBPYmplY3QoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgdGhpcy5pbml0aWFsU3RlcCA9IDI7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICB0aGlzLm1heFN0ZXBzID0gNDtcclxuXHJcbiAgICB0aGlzLmRpcmVjdGlvbkNvdW50ZG93biA9IDA7XHJcbiAgICB0aGlzLnJhbmREaXJlY3Rpb24gPSAxO1xyXG5cclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHgwO1xyXG4gICAgdGhpcy55ID0geTA7XHJcbiAgICBcclxuICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgdGhpcy55MCA9IHkwO1xyXG4gIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLnNwZWVkMCA9IDAuMjtcclxuICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc3BlZWQwO1xyXG4gICAgdGhpcy50eXBlID0gXCJlbmVteVwiO1xyXG4gICAgXHJcbiAgICAvLyAjIExpZmVcclxuICAgIHRoaXMuZGVmYXVsdExpZmVzID0gMjtcclxuICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgIHRoaXMuZGVhZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdG9wUmVuZGVyaW5nTWUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgdGhpcy5odXJ0Q29vbERvd25UaW1lID0gMTAwMDsgLy8yc1xyXG5cclxuICAgIHRoaXMucGxheWVyQXdhcmVDaHVua3NEaXN0YW5jZTAgPSA1O1xyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlID0gdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlMDtcclxuICAgIHRoaXMucGxheWVyQXdhcmVEaXN0YW5jZSA9IHRoaXMuY2h1bmtTaXplICogdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlO1xyXG5cclxuICAgIHRoaXMuYXdhcmVPZlBsYXllciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMueEZyb21QbGF5ZXJEaXN0YW5jZSA9IDA7XHJcbiAgICB0aGlzLllGcm9tUGxheWVyRGlzdGFuY2UgPSAwO1xyXG5cclxuICAgIHRoaXMuZGVhdGhTb3VuZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaW5pdFNvdW5kcygpO1xyXG5cclxuICAgIHRoaXMucnVuRW5lbXkoKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICAjIFNvdW5kc1xyXG4gICovXHJcbiAgaW5pdFNvdW5kcygpIHtcclxuICAgIFxyXG4gICAgLy8gVXNlXHJcbiAgICB0aGlzLmRlYXRoU291bmQgPSBuZXcgSG93bCh7IHNyYzogWycuL3NvdW5kcy9lbmVteS9kZWF0aC5tcDMnXSB9KTtcclxuXHJcbiAgfVxyXG5cclxuICBpc0RlYWQoKSB7IHJldHVybiB0aGlzLmRlYWQ7IH1cclxuICBzZXREZWFkKGJvb2wpIHsgdGhpcy5kZWFkID0gYm9vbDsgfVxyXG5cclxuICBuZWVkU3RvcFJlbmRlcmluZ01lKCkgeyByZXR1cm4gdGhpcy5zdG9wUmVuZGVyaW5nTWU7IH1cclxuICBzZXRTdG9wUmVuZGVyaW5nTWUoYm9vbCkgeyB0aGlzLnN0b3BSZW5kZXJpbmdNZSA9IGJvb2w7IH1cclxuXHJcbiAgaXNBd2FyZU9mUGxheWVyKCkgeyByZXR1cm4gdGhpcy5hd2FyZU9mUGxheWVyOyB9XHJcbiAgc2V0QXdhcmVPZlBsYXllcihib29sKSB7IHRoaXMuYXdhcmVPZlBsYXllciA9IGJvb2w7IH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgICAgICAvLyBDb2xsaXNpb25cclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbkhlaWdodCh0aGlzLmNvbGxpc2lvbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKHRoaXMuY29sbGlzaW9uWSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNldFNwcml0ZVByb3BzRnJhbWUoc3ByaXRlQW5pbWF0aW9uQ291bnQpe1xyXG4gICAgc3dpdGNoKHNwcml0ZUFuaW1hdGlvbkNvdW50KSB7IFxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlLmdldEtleVdpZHRoKCksIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlLmdldEtleUhlaWdodCgpIFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyBzdGF0ZSBmb3IgZW5lbXkgZGlyZWN0aW9uXHJcbiAgbG9va0Rvd24oKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2Rvd24nO1xyXG4gICAgXHJcbiAgICAvLyBTdGVwc1xyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gIH1cclxuICBcclxuICBsb29rVXAoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTUpO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTYpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTcpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTgpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuICBcclxuICBsb29rUmlnaHQoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzApO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuICAgICAgXHJcbiAgbG9va0xlZnQoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzQpO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzUpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzYpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzcpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuXHJcbiAgZHlpbmcoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2R5aW5nJztcclxuICAgICAgICBcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQwKTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQyKTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQzKTtcclxuICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQ0KTtcclxuICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDI5KTsgLy8gZW1wdHkgZnJhbWVcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICB9XHJcblxyXG4gIC8vICMgTW92ZW1lbnRcclxuICBtb3ZMZWZ0KGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgICBcclxuICBtb3ZSaWdodChpZ25vcmVDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdlVwKGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdkRvd24oaWdub3JlQ29sbGlzaW9uKSB7ICBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gIG1vdlRvRGVhdGgoaWdub3JlQ29sbGlzaW9uKSB7XHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmR5aW5nKCkgKTtcclxuICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgLy8gIyBTZXRzXHJcbiAgICAgIFxyXG4gIHNldFgoeCwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy54ID0geDsgXHJcbiAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25YKCB4ICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSApO1xyXG4gIH1cclxuICBzZXRZKHksIHNldENvbGxpc2lvbikgeyBcclxuICAgIHRoaXMueSA9IHk7IFxyXG4gICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWSggeSArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgKTtcclxuICB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgIFxyXG4gIHNldFNwZWVkKHNwZWVkKSB7IHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHNwZWVkOyB9XHJcblxyXG4gIHNldExvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbikgeyB0aGlzLmxvb2tEaXJlY3Rpb24gPSBsb29rRGlyZWN0aW9uOyB9XHJcbiAgdHJpZ2dlckxvb2tEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRQb3NpdGlvbigpIHtcclxuICAgIHRoaXMuc2V0WCggdGhpcy54MCApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuY29sbGlzaW9uWDAgKTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5jb2xsaXNpb25ZMCApO1xyXG4gIH1cclxuXHJcbiAgaHVydCggYW1vdW50ICkge1xyXG4gICAgaWYoIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICBcclxuICAgICAgLy8gSHVydCBwbGF5ZXJcclxuICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMCApIHRoaXMubGlmZXMgPSAwO1xyXG5cclxuICAgICAgLy8gU3RhcnQgY29vbGRvd25cclxuICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgfSwgdGhpcy5odXJ0Q29vbERvd25UaW1lKTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHBsYXllciBkaWVkXHJcbiAgICAgIHRoaXMuY2hlY2tNeURlYXRoKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjaGVja015RGVhdGgoKSB7XHJcbiAgICBpZiggdGhpcy5saWZlcyA8IDEgKSB7XHJcbiAgICAgIHRoaXMuc2V0RGVhZCh0cnVlKTtcclxuICAgICAgdGhpcy5kZWF0aFNvdW5kLnBsYXkoKTtcclxuICAgICAgaWYoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwiZHlpbmdcIikgdGhpcy5zdGVwQ291bnQgPSAxOyAvLyBJZiBpdCdzIG5vdCBkeWluZywgcmVzZXQgYW5pbWF0aW9uIHN0ZXBcclxuICAgICAgdGhpcy5zZXRTcGVlZCgxLjMpOyAvLyBJbmNyZWFzZSBzcGVlZFxyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7IC8vIFByZXZlbnQgZW5lbXkgaHVydGluZyBwbGF5ZXIgd2hlbiBpbiBkZWF0aCBhbmltYXRpb25cclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDY7XHJcbiAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gODtcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAjIEdldHNcclxuICBcclxuICBnZXRMaWZlcygpIHsgcmV0dXJuIHRoaXMubGlmZXM7IH1cclxuICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgIFxyXG4gIC8vVGhlIGNvbGxpc2lvbiB3aWxsIGJlIGp1c3QgaGFsZiBvZiB0aGUgcGxheWVyIGhlaWdodFxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblg7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgbGV0IHggPSAoIF94ICkgPyBfeCA6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICB9XHJcbiAgZ2V0Q2VudGVyWSggX3kgKSB7IFxyXG4gICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgfVxyXG4gICAgXHJcbiAgZ2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcbiAgZ2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcbiAgICBcclxuICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgIFxyXG4gIGluY3JlYXNlU3RlcCgpIHtcclxuICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAvL0Rvbid0IHJlc2V0IGlmIGl0J3MgaW4gZGVhdGggYW5pbWF0aW9uXHJcbiAgICAgIGlmKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9PSBcImR5aW5nXCIgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLm1heFN0ZXBzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5pbml0aWFsU3RlcDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXNldFN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICBzd2l0Y2ggKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBoaWRlTWUoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7IH1cclxuICBzaG93KCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG4gIFxyXG4gIC8vICMgRW5lbXkgUmVuZGVyICAgIFxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMubmVlZFN0b3BSZW5kZXJpbmdNZSgpICkgcmV0dXJuO1xyXG5cclxuICAgIC8vIEJsaW5rIEVuZW15IGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgIGlmKCAhIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICB0aGlzLmhpZGVTcHJpdGUgPSAhdGhpcy5oaWRlU3ByaXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSAmJiB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiAhPSBcImR5aW5nXCIgICkgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSwgXHJcbiAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICk7XHRcclxuXHJcbiAgICAvLyBQbGF5ZXIgQXdhcmVuZXNzIFxyXG4gICAgaWYoIHRoaXMuaXNBd2FyZU9mUGxheWVyKCkgKSB7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiNTBweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNDQzAwMDBcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCBcIiFcIiwgdGhpcy5nZXRYKCkgKyAoIHRoaXMuY2h1bmtTaXplICogMC4wMyApLCB0aGlzLmdldFkoKSArICggdGhpcy5jaHVua1NpemUgKiAwLjMgKSApOyBcclxuICAgIH1cclxuXHJcbiAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcblxyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSApO1xyXG5cclxuICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFgoKSkgKyBcIiBZOlwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFkoKSk7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDYwKTsgXHJcblxyXG4gICAgICB0ZXh0ID0gXCJkWDogXCIgKyBNYXRoLnJvdW5kKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgKSArIFwiIGRZOlwiICsgTWF0aC5yb3VuZCggdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlICk7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDIwKTsgXHJcbiAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgfTtcclxuXHJcbi8vICMgRW5lbXkgQnJhaW5cclxuICBlbmVteUJyYWluKCkge1xyXG5cclxuICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0dhbWVSZWFkeSgpICYmIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBEZWFkIGJlaGF2aW9yL2FuaW1hdGlvblxyXG4gICAgICBpZiggdGhpcy5pc0RlYWQoKSApIHtcclxuICAgICAgICBcclxuICAgICAgICAvL1doaWxlIG5vdCBvdXQgb2Ygc2NyZWVuXHJcbiAgICAgICAgaWYoIHRoaXMuZ2V0WCgpIDwgd2luZG93LmdhbWUuZ2FtZVByb3BzLmNhbnZhc1dpZHRoICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBTdGFydCBtb3Zpbmcgb3V0IG9mIHNjcmVlblxyXG4gICAgICAgICAgdGhpcy5tb3ZUb0RlYXRoKHRydWUpOyAvLyB0cnVlID0gaWdub3JlIGNvbGxpc2lvbiBjaGVja1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIE9rLCB0aGUgZW5lbXkgaXMgZGVhZCwgc3RvcCByZW5kZXJpbmcgbm93XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BSZW5kZXJpbmdNZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIH0gZWxzZSB7IC8vICMgTm90IGRlYWRcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBuZWFyIGVub3VnaCBvZiBwbGF5ZXIgdG8gZ28gaW4gaGlzIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCBuZWFyUGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgd2luZG93LmdhbWUucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGRpc3RhbmNlIGJldHdlZW4gZW5lbXkgYW5kIHBsYXllclxyXG4gICAgICAgICAgdGhpcy54RnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWCgpIC0gcGxheWVyLmdldENlbnRlclgoKSApO1xyXG4gICAgICAgICAgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWSgpIC0gcGxheWVyLmdldENlbnRlclkoKSApO1xyXG4gICAgICAgICAgLy9JZiBib3RoIGRpc3RhbmNlIGFyZSBiZWxvdyB0aGUgYXdhcmUgZGlzdGFuY2UsIHNldCB0aGlzIHBsYXllciB0byBiZSB0aGUgbmVhciBwbGF5ZXJcclxuICAgICAgICAgIGlmKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgPCB0aGlzLnBsYXllckF3YXJlRGlzdGFuY2UgJiYgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlIDwgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBuZWFyUGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgICBpZiggbmVhclBsYXllciApIHtcclxuXHJcbiAgICAgICAgICAvLyAjIFdhbGsgaW4gcGxheWVyIGRpcmVjdGlvblxyXG4gICAgICAgICAgdGhpcy5zZXRBd2FyZU9mUGxheWVyKHRydWUpO1xyXG5cclxuICAgICAgICAgIC8vIHBvc2l0aW9uc1xyXG4gICAgICAgICAgbGV0IFhlID0gdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgICAgICBsZXQgWWUgPSB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuXHJcbiAgICAgICAgICBsZXQgWHAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblgoKTsgXHJcbiAgICAgICAgICBsZXQgWXAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblkoKTsgXHJcblxyXG4gICAgICAgICAgbGV0IFhkaXN0YW5jZSA9IE1hdGguYWJzKFhlIC0gWHApOy8vIElnbm9yZSBpZiB0aGUgcmVzdWx0IGlzIGEgbmVnYXRpdmUgbnVtYmVyXHJcbiAgICAgICAgICBsZXQgWWRpc3RhbmNlID0gTWF0aC5hYnMoWWUgLSBZcCk7XHJcblxyXG4gICAgICAgICAgLy8gd2hpY2ggZGlyZWN0aW9uIHRvIGxvb2tcclxuICAgICAgICAgIGxldCBYZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIGxldCBZZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgWGRpcmVjdGlvbiA9ICggWGUgPj0gWHAgKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgICBZZGlyZWN0aW9uID0gKCBZZSA+PSBZcCApID8gJ3VwJyA6ICdkb3duJztcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gd2hlcmUgdG8gZ29cclxuICAgICAgICAgIGxldCBnb1RvRGlyZWN0aW9uID0gKCBYZGlzdGFuY2UgPiBZZGlzdGFuY2UgKSA/IFhkaXJlY3Rpb24gOiBZZGlyZWN0aW9uO1xyXG5cclxuICAgICAgICAgIC8vIElmIGhhcyBjb2xsaWRlZCBhIGxvdCwgY2hhbmdlIGRpcmVjdGlvbiB0byBhdm9pZCBnZXR0aW5nIHN0dWNrXHJcbiAgICAgICAgICBpZiggdGhpcy5jb2xsaXNpb25Db3VudCA+IDIwICkge1xyXG4gICAgICAgICAgICAvLyBTdG9wIGdvaW5nIG9uIHRoYXQgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIFRPRE86IFRoaW5rIGFib3V0IGl0ISFcclxuICAgICAgICAgICAgKi9cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gbW92ZVxyXG4gICAgICAgICAgc3dpdGNoKCBnb1RvRGlyZWN0aW9uICkge1xyXG4gICAgICAgICAgICBjYXNlICd1cCc6ICAgIHRoaXMubW92VXAoKTsgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzogdGhpcy5tb3ZSaWdodCgpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZG93bic6ICB0aGlzLm1vdkRvd24oKTsgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzogIHRoaXMubW92TGVmdCgpOyAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gIyBmYXIgZnJvbSBwbGF5ZXIsIHNvIGtlZXAgcmFuZG9tIG1vdmVtZW50XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgc3RvcGVkIHRoZSBtb3ZlIGV2ZW50XHJcbiAgICAgICAgICBpZiggdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPD0gMCApIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kRGlyZWN0aW9uID0gIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpICsgMTsgLy8gMSAtIDRcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPSAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMTA7IC8vIDEgLSA0XHJcbiAgICAgICAgICAgIC8vdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gTW92ZSBkaXJlY3Rpb24gbmVlZGVkXHJcbiAgICAgICAgICBzd2l0Y2goIHRoaXMucmFuZERpcmVjdGlvbiApIHtcclxuICAgICAgICAgICAgY2FzZSAxOiB0aGlzLm1vdlVwKCk7ICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiB0aGlzLm1vdlJpZ2h0KCk7ICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiB0aGlzLm1vdkRvd24oKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OiB0aGlzLm1vdkxlZnQoKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA1OiAvLyBtb3JlIGNoYW5jZXMgdG8gZG9uJ3QgbW92ZVxyXG4gICAgICAgICAgICBjYXNlIDY6IFxyXG4gICAgICAgICAgICBjYXNlIDc6IFxyXG4gICAgICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7IGJyZWFrOyAvLyBkb24ndCBtb3ZlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24tLTtcclxuICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH0gLy8gaWYgZGVhZFxyXG5cclxuICAgIH0vL2lmIGdhbWUgcmVhZHlcclxuXHJcbiAgICBcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5lbmVteUJyYWluLmJpbmQodGhpcykgKTtcclxuICB9XHJcblxyXG4vLyAjIENvbGxpc2lvblxyXG5cclxuICBjb2xsaXNpb24ob2JqKXsgXHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiApIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50Kys7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IFxyXG4gIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICBydW5FbmVteSgpIHtcclxuICAgIC8vIGNoYW5nZSBsb29rIGRpcmVjdGlvblxyXG4gICAgdGhpcy5sb29rRGlyZWN0aW9uID0gdGhpcy5sb29rRG93bigpO1xyXG5cclxuICAgIC8vc3RhcnQgYWxnb3JpdG0gdGhhdCBtb3ZlcyBwbGF5ZXJcclxuICAgIHRoaXMuZW5lbXlCcmFpbigpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7IiwiY29uc3QgX0Nhbkh1cnQgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5IdXJ0Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgRmlyZSBleHRlbmRzIF9DYW5IdXJ0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJGaXJlXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuSHVydFByb3BzID0ge1xyXG4gICAgICBhbW91bnQ6IDFcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkh1cnRQcm9wcyk7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCA9IDM7XHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCkgKyAxOyAvLyBHZW5lcmF0ZSBhIHJhbmQgaW5pdGlhbCBudW1iZXIgdG8gcmFuZG9taXplIGFuaW1hdGlvbiBpbiBjYXNlIG9mIG11bHRpcGxlIEZpcmVzXHJcbiAgICBcclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwLjQ7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcbiAgICB0aGlzLmNvbGxpc2lvblkgPSB5MCArICggd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwLjYpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzcHJpdGUgRlBTIEFuaW1hdGlvblxyXG4gICAgbGV0IHJhbmRGUFMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KSArIDU7IC8vIEdlbmVyYXRlIGEgcmFuZG9tIEZQUywgc28gbXVsdGlwbGUgRmlyZXMgb24gcGFnZSBkb24ndCBhbmltYXRlIHRoZSBzYW1lIHdheSBcclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gcmFuZEZQUzsgLy8gMTAwMCAvIEZQU1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgICAgICAvLyBDb2xsaXNpb25cclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbkhlaWdodCh0aGlzLmNvbGxpc2lvbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKHRoaXMuY29sbGlzaW9uWSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNldFNwcml0ZVByb3BzRnJhbWUoc3ByaXRlQW5pbWF0aW9uQ291bnQpe1xyXG4gICAgc3dpdGNoKHNwcml0ZUFuaW1hdGlvbkNvdW50KSB7IFxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE3MzYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE3MzcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE3MzgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgRmlyZSBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICBiZWZvcmVSZW5kZXIoKSB7XHJcbiAgICAvLyBBbmltYXRlIGZpcmVcclxuICAgIGlmKCB0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpICkge1xyXG4gICAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50Kys7XHJcbiAgICAgIGlmKCB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID4gdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCApIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPSAxO1xyXG4gICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBGaXJlOyIsImNvbnN0IF9DYW5Db2xsZWN0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuQ29sbGVjdCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEhlYWwgZXh0ZW5kcyBfQ2FuQ29sbGVjdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2VfaWQpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBzdGFnZV9pZCArIFwiX3BvdGlvblwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBzdGFnZTogc3RhZ2VfaWRcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuQ29sbGVjdFByb3BzID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuaGFuZGxlUHJvcHMoKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBoYXMgc29tZSBzYXZlIHN0YXRlXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmICEgdGhpcy5jYW5SZXNwYXduKCkgJiYgaXRlbVNhdmVkU3RhdGUuY29sbGVjdGVkID09PSB0cnVlICl7IC8vIENoZWNrIGlmIGhhcyBzYXZlZCBzdGF0ZSBhbmQgY2FuJ3QgcmVzcGF3blxyXG4gICAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICB9XHJcblxyXG4gIHNldEhlYWxBbW91dChhbW91bnQpIHsgdGhpcy5oZWFsQW1vdXQgPSBhbW91bnQ7IH1cclxuICBnZXRIZWFsQW1vdW50KCkgeyByZXR1cm4gdGhpcy5oZWFsQW1vdXQ7IH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdiYW5hbmEnOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNzk4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYmVycnknOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNzk5KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbGxpc2lvbihwbGF5ZXIpeyBcclxuICAgIGlmKCAhdGhpcy5pc0NvbGxlY3RlZCgpICkge1xyXG4gICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgIHBsYXllci5oZWFsUGxheWVyKCB0aGlzLmdldEhlYWxBbW91bnQoKSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgXHJcbiAgICAvLyBTZXQgUHJvcHMgYmFzZWQgb24gdHlwZVxyXG4gICAgc3dpdGNoKCB0aGlzLmdldFR5cGUoKSApIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2JhbmFuYSc6XHJcbiAgICAgICAgdGhpcy5zZXRIZWFsQW1vdXQoMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2JlcnJ5JzpcclxuICAgICAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7IC8vIE1ha2UgdGhpcyBpdGVtIGFibGUgdG8gc2F2ZSBzdGF0ZVxyXG4gICAgICAgIHRoaXMuc2V0SGVhbEFtb3V0KDIpO1xyXG4gICAgICAgIHRoaXMuc2V0Q2FuUmVzcGF3bihmYWxzZSk7IC8vIEl0IGNhbid0IHJlc3Bhd24gaWYgdXNlZFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgc2F2ZWQgYmVmb3JlIGFuZCBjaGFuZ2UgaXQgcHJvcHNcclxuICAgIHRoaXMuY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhbDsiLCJjb25zdCBfQ2FuVGhyb3cgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdycpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEtleSBleHRlbmRzIF9DYW5UaHJvdyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2UsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcImtleVwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBjbGFzczogJ2tleScsXHJcbiAgICAgIHN0YWdlOiBzdGFnZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5UaHJvdyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogZmFsc2UsXHJcbiAgICAgIGNodW5ja3NUaHJvd0Rpc3RhbmNlOiAxLFxyXG4gICAgICBodXJ0QW1vdW50OiAwLFxyXG4gICAgICB1c2VFdmVudDogJ3VzZSdcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblRocm93LCBmcm9tU2F2ZVN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7XHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaGFzIHNvbWUgc2F2ZSBzdGF0ZVxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcblxyXG4gICAgICBsZXQgaXRlbVNhdmVkU3RhdGUgPSBzYXZlZEl0ZW1zU3RhdGVbdGhpcy5nZXROYW1lKCldO1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGlzIGFscmVhZHkgZ3JhYmJlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZ3JhYmJlZCA9PSB0cnVlICl7IFxyXG4gICAgICAgIGlmKCB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgLy8gR3JhYiB0aGUgaXRlbSBzYXZlZFxyXG4gICAgICAgICAgdGhpcy5ncmFiSGFuZGxlciggaXRlbVNhdmVkU3RhdGUuZ3JhYlByb3BzLnBsYXllcldob0dyYWJiZWQgKTsgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgdXNlZCBiZWZvcmVcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmNvbGxlY3RlZCA9PSB0cnVlICkgeyBcclxuICAgICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5jYW5HcmFiID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vQ2hlY2sgaWYgaXQgd2FzIGRyb3BwZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmRyb3BwZWQgPT0gdHJ1ZSApIHsgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBkcm9wcGVkIG9uIHRoaXMgc3RhZ2VcclxuICAgICAgICBpZiggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZSA9PSB3aW5kb3cuZ2FtZS5nZXRDdXJyZW50U3RhZ2UoKSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoICEgdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgICAgLy8gSWdub3JlIHRoZSBpdGVtIGZyb20gc3RhZ2VcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlWCggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVZKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFkgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLngwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLngwO1xyXG4gICAgICAgIHRoaXMueTAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueTA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcm9wWCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWDtcclxuICAgICAgICB0aGlzLmRyb3BZID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZO1xyXG5cclxuICAgICAgICB0aGlzLmRyb3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5zdGFnZTtcclxuICAgICAgICB0aGlzLmRyb3BwZWRTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTcHJpdGVzIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJncmF5XCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE4MDQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicHVycGxlXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTgwNSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJyZWRcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxODA2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImdyZWVuXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxODA3KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgZGlzY2FyZEtleShwbGF5ZXIpIHtcclxuICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRDb2xsZWN0KHRydWUpO1xyXG4gICAgdGhpcy5zZXRHcmFiKGZhbHNlKTtcclxuICAgIHBsYXllci5zZXROb3RHcmFiYmluZygpO1xyXG4gIH1cclxuXHJcbiAgdXNlKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpIHtcclxuICAgIGxldCBvYmogPSBwbGF5ZXIuY2hlY2tJdGVtT25HcmFiQ29sbGlzaW9uQm94KCk7XHJcbiAgICBpZiggb2JqLnR5cGUgPT0gJ2Rvb3InICkge1xyXG4gICAgICBpZiggb2JqLmdldENvZGUoKSA9PSB0aGlzLmdldENvZGUoKSApIHtcclxuICAgICAgICBvYmoub3BlbigpO1xyXG4gICAgICAgIHRoaXMuZGlzY2FyZEtleShwbGF5ZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBLZXk7IiwiY29uc3QgX0NhbkJlUHVzaGVkID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuQmVQdXNoZWQnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBPYmplY3RfUHVzaCBleHRlbmRzIF9DYW5CZVB1c2hlZCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwib2JqZWN0XCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5QdXNoID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlLFxyXG4gICAgICBjaHVuY2tzUHVzaERpc3RhbmNlOiAxNSxcclxuICAgICAgaHVydEFtb3VudDogMlxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuUHVzaCk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIFwic3RvbmVcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTgwMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RfUHVzaDsiLCJjb25zdCBfQ2FuVGhyb3cgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdycpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIE9iamVjdF9UaHJvdyBleHRlbmRzIF9DYW5UaHJvdyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2UsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIm9iamVjdFwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBjbGFzczogJ29iamVjdF90aHJvdycsXHJcbiAgICAgIHN0YWdlOiBzdGFnZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhblRocm93ID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlLFxyXG4gICAgICBjaHVuY2tzVGhyb3dEaXN0YW5jZTogNSxcclxuICAgICAgaHVydEFtb3VudDogMixcclxuICAgICAgdXNlRXZlbnQ6ICd0aHJvdydcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblRocm93LCBmcm9tU2F2ZVN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7Ly9zZXQgdG8gc2F2ZSBqdXN0IHRvIGNoZWNrIGlmIHVzZXIgaXMgZ3JhYmJpbmcgaXQgd2hlbiBsZWF2aW5nIHN0YWdlXHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgY2FzZSBcImJhcnJlbFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxODAwKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMuc2V0Q29kZSh0eXBlKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBoYXMgc29tZSBzYXZlIHN0YXRlXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGlzIGFscmVhZHkgZ3JhYmJlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZ3JhYmJlZCA9PT0gdHJ1ZSApe1xyXG4gICAgICAgIGlmKCB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgLy8gR3JhYiB0aGUgaXRlbSBzYXZlZFxyXG4gICAgICAgICAgdGhpcy5ncmFiSGFuZGxlciggaXRlbVNhdmVkU3RhdGUuZ3JhYlByb3BzLnBsYXllcldob0dyYWJiZWQgKTsgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy9DaGVjayBpZiBpdCB3YXMgZHJvcHBlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZHJvcHBlZCA9PSB0cnVlICkgeyBcclxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGRyb3BwZWQgb24gdGhpcyBzdGFnZVxyXG4gICAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlID09IHdpbmRvdy5nYW1lLmdldEN1cnJlbnRTdGFnZSgpICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiggISB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVYKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFggKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVkoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueDAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueDA7XHJcbiAgICAgICAgdGhpcy55MCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy55MDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyb3BYID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYO1xyXG4gICAgICAgIHRoaXMuZHJvcFkgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFN0YWdlID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLnN0YWdlO1xyXG4gICAgICAgIHRoaXMuZHJvcHBlZFN0YWdlID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZTtcclxuICAgICAgICBcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdF9UaHJvdzsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBUZWxlcG9ydCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IoeCwgeSwgdHBQcm9wcykge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiVGVsZXBvcnRcIixcclxuICAgICAgdHlwZTogJ3RlbGVwb3J0J1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeCxcclxuICAgICAgeTogeVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGZhbHNlLCAwLCAwLCAwLCAwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnByb3BzID0gdHBQcm9wcztcclxuXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ocGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQsIGNvbGxpZGFibGUpIHtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcnMgPSB3aW5kb3cuZ2FtZS5wbGF5ZXJzO1xyXG5cclxuICAgIHRoaXMudGVsZXBvcnQoIHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0ICk7XHJcbiAgICAgIFxyXG4gICAgLy8gTWFrZSBldmVyeXRoaW5nIGRhcmtcclxuICAgIGNvbGxpZGFibGUuc2NlbmFyaW8uY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICB3aW5kb3cuZ2FtZS5sb2FkaW5nKHRydWUpO1xyXG5cclxuICAgIC8vIEhpZGUgYWxsIHBsYXllcnNcclxuICAgIHBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgIHBsYXllci5oaWRlUGxheWVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBOb3cgdGVsZXBvcnQgYWxsIHBsYXllcnMgdG8gc2FtZSBsb2NhdGlvbiBhbmQgZGlyZWN0aW9uXHJcbiAgICBsZXQgdGFyZ2V0WCA9IHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LmdldFgoKTtcclxuICAgIGxldCB0YXJnZXRZID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0WSgpO1xyXG4gICAgbGV0IGxvb2tEaXJlY3Rpb24gPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRTcHJpdGVQcm9wcygpLmRpcmVjdGlvbjtcclxuICAgIFxyXG4gICAgcGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgcGxheWVyLnNldFgodGFyZ2V0WCwgdHJ1ZSk7IC8vIHRydWUgPSBhbHNvIHNldCBjb2xsaXNpb24geCB0b29cclxuICAgICAgcGxheWVyLnNldFkodGFyZ2V0WSwgdHJ1ZSk7XHJcbiAgICAgIHBsYXllci50cmlnZ2VyTG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKTtcclxuICAgICAgcGxheWVyLmNoZWNrR3JhYmJpbmdPYmplY3RzKCk7XHJcbiAgICAgIHBsYXllci5zaG93UGxheWVyKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDaGFuZ2Ugc3RhZ2VcclxuICAgIGNvbGxpZGFibGUuc2NlbmFyaW8uc2V0U3RhZ2UoIFxyXG4gICAgICB0aGlzLnByb3BzLnRhcmdldC5zdGFnZSxcclxuICAgICAgZmFsc2UgLy8gZmlyc3RTdGFnZSA/XHJcbiAgICApO1xyXG5cclxuICAgIHdpbmRvdy5nYW1lLmxvYWRpbmcoZmFsc2UpO1xyXG4gICAgICBcclxuICB9XHJcblxyXG4gIHRlbGVwb3J0KCBwbGF5ZXIgKSB7XHJcbiAgICBwbGF5ZXIuc2V0WCggdGhpcy5wcm9wcy50YXJnZXQueCApOy8vIFRoaXMgaXMgdGhlIFggcG9zaXRpb24gb2YgcGxheWVyIEhFQURFUi4gUmVtZWJlciB0aGF0IGNvbGxpc2lvbiBib3ggaXMgb24gcGxheWVyIGZvb3RcclxuICAgIHBsYXllci5zZXRZKHRoaXMucHJvcHMudGFyZ2V0LnkgKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRlbGVwb3J0OyIsIi8qKlxyXG4gKiAgU3RvcmUgQXNzZXRzIHRoYXQgbmVlZHMgdG8gYmUgb24gYW55IHN0YWdlLCBsaWtlIGtleXMgb3IgaXRlbXMgdGhhdCBwbGF5ZXIgZ3JhYnNcclxuICogXHJcbiAqICBEZWNsYXJlIGFsbCBvZiB0aGlzIGFzc2V0cyBoZXJlXHJcbiAqL1xyXG5cclxuY29uc3QgS2V5ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9LZXknKTtcclxuY29uc3QgT2JqZWN0X1Rocm93ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRmlyZScpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9IZWFsJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBEaWFsb2cgPSByZXF1aXJlKCcuL19EaWFsb2cnKTtcclxuXHJcbmNsYXNzIEdsb2JhbEFzc2V0cyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkgeyBcclxuXHRcdHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG5cdH1cclxuXHJcbiAgZ2V0QXNzZXQoIF9jbGFzcywgcHJvcHMsIGZyb21TYXZlU3RhdGUgKSB7XHJcbiAgICBsZXQgcjtcclxuICAgIHN3aXRjaCggX2NsYXNzICkge1xyXG4gICAgICBjYXNlICdrZXknOlxyXG4gICAgICAgIHIgPSBuZXcgS2V5KCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAsIHByb3BzLnN0YWdlLCBmcm9tU2F2ZVN0YXRlICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ29iamVjdF90aHJvdyc6XHJcbiAgICAgICAgciA9IG5ldyBPYmplY3RfVGhyb3coIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2UsIGZyb21TYXZlU3RhdGUgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImJlYWNoX3dhbGxcIjpcclxuICAgICAgICByID0gbmV3IEJlYWNoX1dhbGwoIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiYmVhY2hfZmxvb3JcIjpcclxuICAgICAgICByID0gbmV3IEJlYWNoX0Zsb29yKCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF90aHJvd1wiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1Rocm93KCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAsIHByb3BzLnN0YWdlSUQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF9wdXNoXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfUHVzaCggcHJvcHMuY29kZSwgcHJvcHMueDAsIHByb3BzLnkwLCBwcm9wcy5zdGFnZUlEICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhlYWxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEhlYWwoIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2VJRCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KHByb3BzLnhJbmRleCwgcHJvcHMueUluZGV4LCBwcm9wcy5wcm9wcyApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZGlhbG9nXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2cocHJvcHMueCwgcHJvcHMueSwgcHJvcHMuZGlhbG9nICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdsb2JhbEFzc2V0czsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5CZVB1c2hlZCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5CZVB1c2hlZFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhblVzZSA9IHRydWU7XHJcbiAgICB0aGlzLl9wdXNoID0gZmFsc2U7XHJcbiAgICB0aGlzLl9jYW5SZXNwYXduID0gY2FuQmVQdXNoZWRQcm9wcy5jYW5SZXNwYXduO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuQmVQdXNoZWRQcm9wcy5odXJ0QW1vdW50O1xyXG4gICAgXHJcbiAgICB0aGlzLnB1c2hEaXN0YW5jZSA9IGNhbkJlUHVzaGVkUHJvcHMuY2h1bmNrc1B1c2hEaXN0YW5jZSAqIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG4gICAgdGhpcy5wdXNoU3BlZWQgPSAwLjg7XHJcbiAgICB0aGlzLnB1c2hEaXN0YW5jZVRyYXZlbGxlZCA9IDA7XHJcbiAgICB0aGlzLnB1c2hNb3ZlbWVudCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wdXNoRGlyZWN0aW9uID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHRoaXMudGFyZ2V0WCA9IDA7XHJcbiAgICB0aGlzLnRhcmdldFkgPSAwO1xyXG4gIH1cclxuXHJcbiAgaXNQdXNoaW5nKCkgeyByZXR1cm4gdGhpcy5fcHVzaDsgfVxyXG4gIHNldFB1c2goYm9vbCkgeyB0aGlzLl9wdXNoID0gYm9vbDsgfVxyXG4gIGdldFB1c2hTcGVlZCgpIHsgcmV0dXJuICB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIHRoaXMucHVzaFNwZWVkOyB9XHJcbiAgY2FsY3VsYXRlUHVzaERpcmVjdGlvbihkaXJlY3Rpb24pIHsgXHJcbiAgICB0aGlzLnB1c2hEaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICBzd2l0Y2goIHRoaXMucHVzaERpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB0aGlzLnB1c2hEaXN0YW5jZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHRoaXMucHVzaERpc3RhbmNlOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpICsgdGhpcy5wdXNoRGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgLSB0aGlzLnB1c2hEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG4gIHVzZUhhbmRsZXIoZGlyZWN0aW9uKSB7XHJcbiAgICB0aGlzLnB1c2goZGlyZWN0aW9uKTtcclxuICB9XHJcblxyXG4gIHN0b3BPYmplY3QoKSB7XHJcbiAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbih0cnVlKTtcclxuICAgIHRoaXMuc2V0UHVzaChmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwdXNoKGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5zZXRQdXNoKHRydWUpO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVQdXNoRGlyZWN0aW9uKCBkaXJlY3Rpb24gKTtcclxuICB9XHJcblxyXG4gIG1vdmVUb1B1c2hEaXJlY3Rpb24oKSB7XHJcbiAgICBzd2l0Y2goIHRoaXMucHVzaERpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAvLyBZXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2VUcmF2ZWxsZWQgKz0gdGhpcy5nZXRQdXNoU3BlZWQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIsIGVuZW15IGFuZCBvYmplY3RzXHJcbiAgICB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbigpO1xyXG5cclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbigpIHtcclxuICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrQWxsKHRoaXMsIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpKTsgXHJcbiAgICBpZiAoIG9iaiAmJiB0aGlzLmlzUHVzaGluZygpICkge1xyXG4gICAgICBzd2l0Y2gob2JqLnR5cGUpIHtcclxuICAgICAgICBjYXNlICdwbGF5ZXInOlxyXG4gICAgICAgICAgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBwbGF5ZXJcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2VuZW15JzpcclxuICAgICAgICAgIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgZW5lbXlcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiggb2JqLm92ZXJsYXBYICkgdGhpcy51cGRhdGVYKCBvYmoub3ZlcmxhcFggKTtcclxuICAgICAgICAgIGlmKCBvYmoub3ZlcmxhcFkgKSB0aGlzLnVwZGF0ZVkoIG9iai5vdmVybGFwWSApO1xyXG4gICAgICAgICAgdGhpcy5zdG9wT2JqZWN0KCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuIFxyXG4gIGJlZm9yZVJlbmRlcigpIHtcclxuICAgIGlmKCB0aGlzLmlzUHVzaGluZygpICkge1xyXG4gICAgICBpZiggdGhpcy5nZXRYKCkgIT0gdGhpcy50YXJnZXRYIHx8IHRoaXMuZ2V0WSgpICE9IHRoaXMudGFyZ2V0WSApIHtcclxuICAgICAgICB0aGlzLm1vdmVUb1B1c2hEaXJlY3Rpb24oKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0b3BPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgfSAgICAgICBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5CZVB1c2hlZDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5Db2xsZWN0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkNvbGxlY3RQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX2NhblJlc3Bhd24gPSBjYW5Db2xsZWN0UHJvcHMuY2FuUmVzcGF3bjtcclxuICB9XHJcblxyXG4gIGlzQ29sbGVjdGVkKCkgeyByZXR1cm4gdGhpcy5jb2xsZWN0ZWQ7IH1cclxuICBjb2xsZWN0KCl7IHRoaXMuY29sbGVjdGVkID0gdHJ1ZTsgfVxyXG4gIHNldENvbGxlY3QoYm9vbCkgeyB0aGlzLmNvbGxlY3QgPSBib29sOyB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuX2NhblJlc3Bhd24gPSBib29sOyB9XHJcbiAgY2FuUmVzcGF3bigpIHsgcmV0dXJuIHRoaXMuX2NhblJlc3Bhd247IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuQ29sbGVjdDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5IdXJ0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsY2FuSHVydFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuSHVydFByb3BzLmFtb3VudDtcclxuICB9XHJcbiAgXHJcbiAgLy8gSWYgaXQncyBub3QgY29sbGlkaW5nIHRvIGFueSB0ZWxlcG9ydCBjaHVuayBhbnltb3JlLCBtYWtlIGl0IHJlYWR5IHRvIHRlbGVwb3J0IGFnYWluXHJcbiAgY29sbGlzaW9uKG9iail7IFxyXG4gICAgaWYoIG9iai50eXBlID09IFwicGxheWVyXCIgKSBvYmouaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpO1xyXG4gICAgaWYoIG9iai50eXBlID09IFwiZW5lbXlcIiApIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxuICBiZWZvcmVSZW5kZXIoY3R4KSB7XHJcbiAgICAvLyBkZWJ1ZyBwb3NpdGlvblxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgbGV0IHggPSBNYXRoLnJvdW5kKHRoaXMuZ2V0Q29sbGlzaW9uWCgpKTtcclxuICAgICAgbGV0IHkgPSBNYXRoLnJvdW5kKHRoaXMuZ2V0Q29sbGlzaW9uWSgpKTtcclxuICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgeCArIFwiIFk6IFwiICsgeTtcclxuICAgICAgY29uc29sZS5sb2codGV4dCk7XHJcbiAgICAgIGN0eC5mb250ID0gXCIyNXB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjRkZGRkZGJztcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwICwgdGhpcy5nZXRZKCkpOyBcclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5IdXJ0OyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgX0NhblRocm93IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblRocm93UHJvcHMsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgZnJvbVNhdmVTdGF0ZSk7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuR3JhYiA9IHRydWU7XHJcbiAgICB0aGlzLmdyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY29sbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wcGVkU3RhZ2UgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcFggPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcFkgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl9jYW5SZXNwYXduID0gY2FuVGhyb3dQcm9wcy5jYW5SZXNwYXduO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuVGhyb3dQcm9wcy5odXJ0QW1vdW50O1xyXG5cclxuICAgIHRoaXMudXNlRXZlbnQgPSBjYW5UaHJvd1Byb3BzLnVzZUV2ZW50O1xyXG4gICAgXHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2UgPSBjYW5UaHJvd1Byb3BzLmNodW5ja3NUaHJvd0Rpc3RhbmNlICogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcbiAgICB0aGlzLnRocm93U3BlZWQgPSAwLjg7XHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2VUcmF2ZWxsZWQgPSAwO1xyXG4gICAgdGhpcy50aHJvd2luZ01vdmVtZW50ID0gZmFsc2U7XHJcbiAgICB0aGlzLnRocm93RGlyZWN0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5kZXN0cm95T25BbmltYXRpb25FbmQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy50YXJnZXRYID0gMDtcclxuICAgIHRoaXMudGFyZ2V0WSA9IDA7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvICggd2luZG93LmdhbWUuZ2FtZVByb3BzLmZwcyAqIDIgKTsgLy8gMTAwMCAvIEZQU1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgIC8vIERlc3Ryb3kgYW5pbWF0aW9uIHByb3BzXHJcbiAgICB0aGlzLmRlc3Ryb3lpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuZGVzdHJveVNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG4gICAgdGhpcy5kZXN0cm95RnJhbWVDb3VudCA9IDE7XHJcbiAgICB0aGlzLmRlc3Ryb3lNYXhGcmFtZUNvdW50ID0gODtcclxuICAgIHRoaXMuZGVzdHJveUluaXRGcmFtZSA9IDM7XHJcblxyXG4gICAgdGhpcy5kcm9wU291bmQgPSBmYWxzZTtcclxuICAgIHRoaXMuYnJlYWtTb3VuZCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudGhyb3dBY3Rpb24gPSBcIlwiO1xyXG5cclxuICAgIHRoaXMuaW5pdFNvdW5kcygpO1xyXG4gIH1cclxuXHJcbiAgaW5pdFNvdW5kcygpIHtcclxuICAgIC8vIERyb3BcclxuICAgIHRoaXMuZHJvcFNvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvc2NlbmFyaW9zL2Ryb3AubXAzJ10gfSk7XHJcbiAgICAvLyBCcmVha1xyXG4gICAgdGhpcy5icmVha1NvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvc2NlbmFyaW9zL2l0ZW0tYnJlYWsubXAzJ10gfSk7XHJcbiAgfVxyXG5cclxuICBpc0NvbGxlY3RlZCgpIHsgcmV0dXJuIHRoaXMuY29sbGVjdGVkOyB9XHJcbiAgY29sbGVjdCgpeyB0aGlzLmNvbGxlY3RlZCA9IHRydWU7IH1cclxuICBzZXRDb2xsZWN0KGJvb2wpIHsgdGhpcy5jb2xsZWN0ZWQgPSBib29sOyB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgaXNEZXN0cm95aW5nKCkgeyByZXR1cm4gdGhpcy5kZXN0cm95aW5nOyB9XHJcbiAgc2V0RGVzdHJveWluZyhib29sKSB7IHRoaXMuZGVzdHJveWluZyA9IGJvb2w7IH1cclxuICBcclxuICBzZXREZXN0cm95T25BbmltYXRpb25FbmQoYm9vbCkgeyB0aGlzLmRlc3Ryb3lPbkFuaW1hdGlvbkVuZCA9IGJvb2w7IH1cclxuXHJcbiAgaXNHcmFiYmVkKCkgeyByZXR1cm4gdGhpcy5ncmFiYmVkOyB9XHJcbiAgZ3JhYigpeyBcclxuICAgIHRoaXMuZ3JhYmJlZCA9IHRydWU7XHJcbiAgICB0aGlzLmRyb3BwZWQgPSBmYWxzZTsgXHJcbiAgfVxyXG4gIHNldEdyYWIoYm9vbCkgeyBcclxuICAgIHRoaXMuZ3JhYmJlZCA9IGJvb2w7IFxyXG4gICAgdGhpcy5kcm9wcGVkID0gIWJvb2w7XHJcbiAgfVxyXG4gIHNldFBsYXllcldob0dyYWJiZWQocGxheWVyTnVtYmVyKSB7IHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IHBsYXllck51bWJlcjsgfVxyXG5cclxuICBpc1Rocm93aW5nKCkgeyByZXR1cm4gdGhpcy50aHJvd2luZ01vdmVtZW50OyB9XHJcbiAgc2V0VGhyb3dpbmcoYm9vbCkgeyB0aGlzLnRocm93aW5nTW92ZW1lbnQgPSBib29sOyB9XHJcbiAgZ2V0VGhyb3dTcGVlZCgpIHsgcmV0dXJuICB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIHRoaXMudGhyb3dTcGVlZDsgfVxyXG4gIGNhbGN1bGF0ZVRocm93RGlyZWN0aW9uKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7IFxyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB0aGlzLnRocm93RGlzdGFuY2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB0aGlzLnRocm93RGlzdGFuY2UgKyB0aGlzLmdldEhlaWdodCgpICogMjsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHRoaXMudGhyb3dEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSAtIHRoaXMudGhyb3dEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBjYWxjdWxhdGVEcm9wRGlyZWN0aW9uKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7IFxyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICsgdGhpcy5nZXRIZWlnaHQoKSAqIDI7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSAtIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyBwbGF5ZXJIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRDYW5SZXNwYXduKGJvb2wpeyB0aGlzLl9jYW5SZXNwYXduID0gYm9vbDsgfVxyXG4gIGNhblJlc3Bhd24oKSB7IHJldHVybiB0aGlzLl9jYW5SZXNwYXduOyB9XHJcbiAgXHJcbiAgc2V0TmFtZShuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHJcbiAgZ3JhYkhhbmRsZXIoIHBsYXllck51bWJlciApIHtcclxuICAgIHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IHBsYXllck51bWJlcjtcclxuICAgIHRoaXMuc2V0R3JhYih0cnVlKTtcclxuICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTsgLy8gYXZvaWQgcGxheWVycyBwdXNoaW5nIG90aGVyIHBsYXllcnMgd2l0aCBpdGVtc1xyXG4gIH1cclxuXHJcbiAgYnJlYWtPYmplY3QoKSB7XHJcblxyXG4gICAgdGhpcy5zZXRUaHJvd2luZyhmYWxzZSk7XHJcbiAgICB0aGlzLnNldEdyYWIoZmFsc2UpO1xyXG5cclxuICAgIGlmKCB0aGlzLnRocm93QWN0aW9uID09IFwidGhyb3dcIiApIHRoaXMuYnJlYWtTb3VuZC5wbGF5KCk7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLmRlc3Ryb3lPbkFuaW1hdGlvbkVuZCApIHtcclxuICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICB0aGlzLnNldERlc3Ryb3lpbmcodHJ1ZSk7IC8vIFN0YXJ0IGRlc3Ryb3kgYW5pbWF0aW9uXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbih0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBpc0Ryb3BwZWQoKSB7IHJldHVybiB0aGlzLmRyb3BwZWQ7IH1cclxuICBkcm9wKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7XHJcblxyXG4gICAgc2V0VGltZW91dCggKCkgPT4geyB0aGlzLmRyb3BTb3VuZC5wbGF5KCk7IH0sIDMwMCk7IC8vIERlbGF5IGRyb3Agc291bmQgdG8gc3luYyB3aXRoIGFuaW1hdGlvblxyXG4gICAgdGhpcy50aHJvd0FjdGlvbiA9IFwiZHJvcFwiO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVEcm9wRGlyZWN0aW9uKCBkaXJlY3Rpb24sIHBsYXllckhlaWdodCApO1xyXG4gICAgdGhpcy5zZXREZXN0cm95T25BbmltYXRpb25FbmQoZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRUaHJvd2luZyh0cnVlKTtcclxuICAgIHRoaXMuc2V0R3JhYihmYWxzZSk7XHJcbiAgICB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcFggPSB0aGlzLnRhcmdldFg7XHJcbiAgICB0aGlzLmRyb3BZID0gdGhpcy50YXJnZXRZO1xyXG4gIH1cclxuXHJcbiAgdGhyb3coZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQsIHBsYXllcikge1xyXG4gICAgdGhpcy50aHJvd0FjdGlvbiA9IFwidGhyb3dcIjtcclxuICAgIHBsYXllci5zZXROb3RHcmFiYmluZygpO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVUaHJvd0RpcmVjdGlvbiggZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQgKTtcclxuICAgIHRoaXMuc2V0RGVzdHJveU9uQW5pbWF0aW9uRW5kKHRydWUpO1xyXG4gICAgdGhpcy5zZXRUaHJvd2luZyh0cnVlKTtcclxuICB9XHJcblxyXG4gIHVzZShkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKSB7XHJcbiAgICBzd2l0Y2goIHRoaXMudXNlRXZlbnQgKSB7XHJcbiAgICAgIGNhc2UgJ3Rocm93JzpcclxuICAgICAgICB0aGlzLnRocm93KGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbW92ZVRvVGhyb3dEaXJlY3Rpb24oKSB7XHJcbiAgICBzd2l0Y2goIHRoaXMudGhyb3dEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpIC8gMyApOyAvLyBTbG93IHRoZSBtb3ZlbWVudFxyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcblxyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAvLyBZXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcbiAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSAvIDMgKTtcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG4gICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICAgaWYgKHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICAgaWYgKHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMudGhyb3dEaXN0YW5jZVRyYXZlbGxlZCArPSB0aGlzLmdldFRocm93U3BlZWQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIGVuZW15IG9ubHlcclxuICAgIHRoaXMuanVzdENoZWNrQ29sbGlzaW9uKCk7XHJcblxyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uKCkge1xyXG4gICAgbGV0IG9iaiA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkpOyBcclxuICAgIGlmICggb2JqICAmJiB0aGlzLmlzVGhyb3dpbmcoKSApIHtcclxuICAgICAgaWYoIG9iai50eXBlID09IFwicGxheWVyXCIgKSB7XHJcbiAgICAgICAgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBwbGF5ZXJcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoIG9iai50eXBlID09IFwiZW5lbXlcIiApIHsgXHJcbiAgICAgICAgb2JqLmh1cnQodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBlbmVteVxyXG4gICAgICAgIHRoaXMuYnJlYWtPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuIFxyXG4gIGJlZm9yZVJlbmRlcihjdHgpIHtcclxuICAgIFxyXG4gICAgLy8gTW92ZW1lbnQgd2hpbGUgdGhyb3dpbmdcclxuICAgIGlmKCB0aGlzLmlzVGhyb3dpbmcoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZ2V0WCgpICE9IHRoaXMudGFyZ2V0WCB8fCB0aGlzLmdldFkoKSAhPSB0aGlzLnRhcmdldFkgKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9UaHJvd0RpcmVjdGlvbigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYnJlYWtPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgfSAgICAgICBcclxuXHJcbiAgICAvLyBEZXN0cm95IGFuaW1hdGlvblxyXG4gICAgaWYoIHRoaXMuaXNEZXN0cm95aW5nKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmRlc3Ryb3lGcmFtZUNvdW50IDwgdGhpcy5kZXN0cm95TWF4RnJhbWVDb3VudCAgKSB7XHJcbiAgICAgICAgaWYoIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5kZXN0cm95U3ByaXRlLmdldFNwcml0ZVByb3BzKCB0aGlzLmRlc3Ryb3lJbml0RnJhbWUgKTtcclxuICAgICAgICAgIHRoaXMuZGVzdHJveUluaXRGcmFtZSsrO1xyXG4gICAgICAgICAgdGhpcy5kZXN0cm95RnJhbWVDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NhblRocm93OyIsImNsYXNzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0gcG9zaXRpb24ueDtcclxuICAgIHRoaXMueSA9IHBvc2l0aW9uLnk7XHJcblxyXG4gICAgdGhpcy54MCA9IHBvc2l0aW9uLng7XHJcbiAgICB0aGlzLnkwID0gcG9zaXRpb24ueTtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodDtcclxuXHJcbiAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgdGhpcy5jb2xsaXNpb25YID0gdGhpcy54O1xyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0gdGhpcy55O1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcblxyXG4gICAgLy8gIyBFdmVudHNcclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gZXZlbnRzLnN0b3BPbkNvbGxpc2lvbjtcclxuICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSBldmVudHMuaGFzQ29sbGlzaW9uRXZlbnQ7XHJcbiAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5zcHJpdGUgPSBzcHJpdGU7XHJcblxyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlID0gc3ByaXRlLnN0YWdlU3ByaXRlO1xyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgXHJcbiAgICB0aGlzLm5hbWUgPSBwcm9wcy5zdGFnZSArIFwiX1wiICsgcHJvcHMubmFtZS5yZXBsYWNlKC9cXHMvZywnJykgKyBcIl9cIiArIHRoaXMueCArIFwieFwiICsgdGhpcy55O1xyXG4gICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB0aGlzLm9yaWdpbmFsTmFtZSA9IHByb3BzLm5hbWU7XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubmVlZFNhdmVTdGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZnJvbVNhdmVkU3RhdGUgPSAoIGZyb21TYXZlU3RhdGUpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IHByb3BzLnR5cGU7XHJcbiAgICB0aGlzLmNvZGUgPSAnJztcclxuICAgIHRoaXMuY2xhc3MgPSBwcm9wcy5jbGFzcztcclxuICAgIHRoaXMub3JpZ2luYWxTdGFnZSA9IHByb3BzLnN0YWdlO1xyXG5cclxuICAgIHRoaXMucnVuKCBwcm9wcy50eXBlICk7XHJcbiAgfVxyXG5cclxuICAvLyAjIENvZGVcclxuICBzZXRDb2RlKGNvZGUpIHsgdGhpcy5jb2RlID0gY29kZTsgfVxyXG4gIGdldENvZGUoKXsgcmV0dXJuIHRoaXMuY29kZTsgfVxyXG5cclxuICAvLyAjIFNldHNcclxuXHJcbiAgdXBkYXRlWCh4KSB7XHJcbiAgICB0aGlzLnNldFgoeCk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoeCk7XHJcbiAgfVxyXG4gIHVwZGF0ZVkoeSkge1xyXG4gICAgdGhpcy5zZXRZKHkpO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKHkpO1xyXG4gIH1cclxuICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHJcbiAgc2V0Q29sbGlzaW9uSGVpZ2h0KGhlaWdodCkgeyB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldENvbGxpc2lvbldpZHRoKHdpZHRoKSB7IHRoaXMuY29sbGlzaW9uV2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICBzZXRDb2xsaXNpb25YKHgpIHsgdGhpcy5jb2xsaXNpb25YID0geDsgfVxyXG4gIHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIC8vICEgTXVzdCBoYXZlIGluIGNoaWxkcyBDbGFzc1xyXG4gIH1cclxuXHJcbiAgc2V0U3RvcE9uQ29sbGlzaW9uKGJvb2wpe1xyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBib29sO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBWaXNpYmlsaXR5XHJcbiAgaGlkZSgpIHsgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyBcclxuICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gZmFsc2U7XHJcbiAgfVxyXG4gIHNob3coKSB7IHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlOyB9XHJcblxyXG4gIC8vICMgIFN0YXRlXHJcbiAgd2lsbE5lZWRTYXZlU3RhdGUoKSB7ICByZXR1cm4gdGhpcy5uZWVkU2F2ZVN0YXRlOyB9XHJcbiAgc2V0TmVlZFNhdmVTdGF0ZShib29sKXsgdGhpcy5uZWVkU2F2ZVN0YXRlID0gYm9vbDsgfVxyXG5cdFx0XHRcclxuXHQvLyAjIEdldHNcclxuICBcclxuICBnZXROYW1lKCkgeyByZXR1cm4gdGhpcy5uYW1lOyB9XHJcblxyXG4gIGdldFR5cGUoKSB7IHJldHVybiB0aGlzLnR5cGU7IH1cclxuICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcblxyXG4gIGdldENvbGxpc2lvblgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvblg7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25ZOyB9XHJcblxyXG4gIGdldENlbnRlclgoIF94ICkgeyAvLyBNYXkgZ2V0IGEgY3VzdG9tIGNlbnRlclgsIHVzZWQgdG8gY2hlY2sgYSBmdXR1cmUgY29sbGlzaW9uXHJcbiAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICByZXR1cm4geCArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDI7IFxyXG4gIH1cclxuICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICBsZXQgeSA9ICggX3kgKSA/IF95IDogdGhpcy5nZXRDb2xsaXNpb25ZKCk7XHJcbiAgICByZXR1cm4geSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyBcclxuICB9XHJcblxyXG4gIC8vIEhvb2sgdG8gcnVuIGJlZm9yZSByZW5kZXJcclxuICBiZWZvcmVSZW5kZXIoY3R4KSB7ICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICBcclxuICAgIHRoaXMuYmVmb3JlUmVuZGVyKGN0eCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIGxldCBzcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlUHJvcHM7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLnNwcml0ZS5nZXRTcHJpdGUoKSApIHsgLy8gT25seSByZW5kZXIgdGV4dHVyZSBpZiBpdCB3YXMgc2V0IGJlZm9yZVxyXG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCksICBcclxuICAgICAgICBzcHJpdGVQcm9wcy5jbGlwX3gsIHNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCBzcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgLy9ERUJVRyBDaHVuayBTaXplXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG5cclxuICAgICAgbGV0IGNvbGxpc2lvbl9wcm9wcyA9IHtcclxuICAgICAgICB3OiB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSxcclxuICAgICAgICB4OiB0aGlzLmdldENvbGxpc2lvblgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldENvbGxpc2lvblkoKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5zdG9wT25Db2xsaXNpb24gPyBcInJnYmEoMjU1LDAsMCwwLjIpXCIgOiBcInJnYmEoMCwyNTUsMCwwLjIpXCI7XHJcbiAgICAgIGN0eC5maWxsUmVjdChjb2xsaXNpb25fcHJvcHMueCwgY29sbGlzaW9uX3Byb3BzLnksIGNvbGxpc2lvbl9wcm9wcy53LCBjb2xsaXNpb25fcHJvcHMuaCk7XHJcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjIpXCI7XHJcbiAgICAgIGN0eC5saW5lV2lkdGggICA9IDU7XHJcbiAgICAgIGN0eC5zdHJva2VSZWN0KGNvbGxpc2lvbl9wcm9wcy54LCBjb2xsaXNpb25fcHJvcHMueSwgY29sbGlzaW9uX3Byb3BzLncsIGNvbGxpc2lvbl9wcm9wcy5oKTtcclxuXHJcbiAgICB9XHJcbiAgXHJcbiAgfVxyXG4gICAgXHJcbiAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gIC8vIFdpbGwgaXQgU3RvcCB0aGUgb3RoZXIgb2JqZWN0IGlmIGNvbGxpZGVzP1xyXG4gIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBObyBDb2xsaXNpb24gRXZlbnRcclxuICBub0NvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBSdW5zIHdoZW4gQ2xhc3Mgc3RhcnRzICBcclxuICBydW4oIHR5cGUgKSB7XHJcbiAgICB0aGlzLnNldFNwcml0ZVR5cGUodHlwZSk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ29sbGlkYWJsZTsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIF9EaWFsb2cgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCB4LCB5LCBkaWFsb2cgKSB7XHJcblx0XHRcclxuXHRcdGxldCBwcm9wcyA9IHtcclxuXHRcdFx0bmFtZTogJ2RpYWxvZycsXHJcblx0XHRcdHR5cGU6ICdkaWFsb2cnXHJcblx0XHR9XHJcblx0XHJcblx0XHRsZXQgcG9zaXRpb24gPSB7XHJcblx0XHRcdHg6IHgsXHJcblx0XHRcdHk6IHlcclxuXHRcdH1cclxuXHRcclxuXHRcdGxldCBkaW1lbnNpb24gPSB7XHJcblx0XHRcdHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuXHRcdFx0aGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG5cdFx0fVxyXG5cdFxyXG5cdFx0bGV0IGV2ZW50cyA9IHtcclxuXHRcdFx0c3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG5cdFx0XHRoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGZhbHNlLCAwLCAwLCAwLCAwKTtcclxuXHRcdFxyXG5cdFx0c3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuXHRcdHRoaXMuY2FuVXNlID0gdHJ1ZTtcclxuXHRcdHRoaXMuZGlhbG9nID0gZGlhbG9nO1xyXG5cdH1cclxuXHRcclxuXHRnZXREaWFsb2coKSB7IHJldHVybiB0aGlzLmRpYWxvZzsgfVxyXG5cclxuXHR1c2VIYW5kbGVyKCkgeyBcclxuXHRcdHdpbmRvdy5nYW1lLnNldERpYWxvZyh0aGlzLmRpYWxvZyk7IFxyXG5cdH1cclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cdFxyXG5cdHNldFNwcml0ZVR5cGUodHlwZSkgeyAgXHR9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9EaWFsb2c7IiwiY2xhc3MgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHNjZW5hcmlvX2lkLCBzb3VuZFNyYyl7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFggPSAwOyBcclxuICAgIHRoaXMucGxheWVyU3RhcnRZID0gMDsgXHJcblxyXG4gICAgdGhpcy5zdGFnZSA9IG51bGw7XHJcbiAgICB0aGlzLnN0YWdlSWQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIHRoaXMuc2NlbmFyaW9faWQgPSBzY2VuYXJpb19pZDtcclxuICAgIFxyXG4gICAgdGhpcy5zb3VuZCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kU3JjID0gc291bmRTcmM7XHJcblxyXG4gICAgdGhpcy5pbml0U291bmQoKTtcclxuICB9XHJcblxyXG4gIGluaXRTb3VuZCgpIHtcclxuICAgIHRoaXMuc291bmQgPSBuZXcgSG93bCh7XHJcbiAgICAgIHNyYzogW3RoaXMuc291bmRTcmNdLFxyXG4gICAgICBsb29wOiB0cnVlLFxyXG4gICAgICB2b2x1bWU6IDAuNVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdldFNjZW5hcmlvU291bmQoKSB7IHJldHVybiB0aGlzLnNvdW5kOyB9XHJcblxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuICBhZGRTdGF0aWNJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG4gIC8vICMgR2V0c1xyXG4gIGdldEN0eCgpIHsgcmV0dXJuIHRoaXMuY3R4OyB9XHJcbiAgZ2V0Q2FudmFzKCkgeyByZXR1cm4gdGhpcy5jYW52YXM7IH1cdFxyXG5cclxuICBnZXRJZCgpIHsgcmV0dXJuIHRoaXMuc2NlbmFyaW9faWQ7IH1cclxuICBnZXRBY3R1YWxTdGFnZUlkKCkgeyByZXR1cm4gdGhpcy5zdGFnZUlkOyB9XHJcbiAgICAgICAgICAgICAgXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtczsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0QWN0dWFsU3RhZ2VJZChpZCl7IFxyXG4gICAgdGhpcy5zdGFnZUlkID0gaWQ7IFxyXG4gICAgd2luZG93LmdhbWUuc2V0Q3VycmVudFN0YWdlKCBpZCApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTYXZlIHRoZSBTdGF0ZSBvZiBpdGVtc1xyXG4gIHNhdmVJdGVtc1N0YXRlKCkge1xyXG4gICAgLy8gQm90dG9tIExheWVyXHJcbiAgICBsZXQgaXRlbXMgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uZ2V0Q29sSXRlbnMoKTtcclxuICAgIGZvciAobGV0IGkgaW4gaXRlbXMpIHtcclxuICAgICAgdGhpcy5oYW5kbGVJdGVtSWZOZWVkU2F2ZShpdGVtc1tpXSk7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuZ2FtZS5zYXZlSXRlbXNTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlSXRlbUlmTmVlZFNhdmUoaXRlbSkge1xyXG4gICAgXHJcbiAgICBpZihpdGVtLnR5cGUgPT0gXCJwbGF5ZXJcIikgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBpZiggaXRlbS53aWxsTmVlZFNhdmVTdGF0ZSgpICkge1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgR3JhYmJlZFxyXG4gICAgICBsZXQgZ3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgICBsZXQgZ3JhYlByb3BzID0ge307XHJcbiAgICAgIGlmKCBpdGVtLmNhbkdyYWIgKSB7XHJcbiAgICAgICAgZ3JhYmJlZCA9IGl0ZW0uaXNHcmFiYmVkKCk7XHJcbiAgICAgICAgaWYoIGdyYWJiZWQgKSB7XHJcbiAgICAgICAgICBncmFiUHJvcHMgPSB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6IGl0ZW0uY2xhc3MsXHJcbiAgICAgICAgICAgICdjb2RlJzogaXRlbS5jb2RlLFxyXG4gICAgICAgICAgICAneDAnOiBpdGVtLngwLFxyXG4gICAgICAgICAgICAneTAnOiBpdGVtLnkwLFxyXG4gICAgICAgICAgICAnbmFtZSc6IGl0ZW0ub3JpZ2luYWxOYW1lLFxyXG4gICAgICAgICAgICAnc3RhZ2UnOiBpdGVtLm9yaWdpbmFsU3RhZ2UsXHJcbiAgICAgICAgICAgICdwbGF5ZXJXaG9HcmFiYmVkJzogaXRlbS5wbGF5ZXJXaG9HcmFiYmVkXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBEcm9wcGVkXHJcbiAgICAgIGxldCBkcm9wcGVkID0gZmFsc2U7XHJcbiAgICAgIGxldCBkcm9wUHJvcHMgPSB7fTtcclxuICAgICAgaWYoIGl0ZW0uY2FuR3JhYiApIHtcclxuICAgICAgICBkcm9wcGVkID0gaXRlbS5pc0Ryb3BwZWQoKTtcclxuICAgICAgICBpZiggZHJvcHBlZCApIHtcclxuICAgICAgICAgIGRyb3BQcm9wcyA9IHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogaXRlbS5jbGFzcyxcclxuICAgICAgICAgICAgJ2NvZGUnOiBpdGVtLmNvZGUsXHJcbiAgICAgICAgICAgICd4MCc6IGl0ZW0ueDAsXHJcbiAgICAgICAgICAgICd5MCc6IGl0ZW0ueTAsXHJcbiAgICAgICAgICAgICdkcm9wWCc6IGl0ZW0uZHJvcFgsXHJcbiAgICAgICAgICAgICdkcm9wWSc6IGl0ZW0uZHJvcFksXHJcbiAgICAgICAgICAgICduYW1lJzogaXRlbS5vcmlnaW5hbE5hbWUsXHJcbiAgICAgICAgICAgICdzdGFnZSc6IGl0ZW0ub3JpZ2luYWxTdGFnZSxcclxuICAgICAgICAgICAgJ2Ryb3BwZWRTdGFnZSc6IChpdGVtLmRyb3BwZWRTdGFnZSkgPyBpdGVtLmRyb3BwZWRTdGFnZSA6IHRoaXMuZ2V0QWN0dWFsU3RhZ2VJZCgpIC8vIElmIGRvbid0IGhhdmUgZHJvcHBlZCBzdGFnZSwgbWVhbnMgd2Ugd2FudCB0aGUgYWN0dWFsIHN0YWdlLiAgSWYgaGFzLCBrZWVwIGl0XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB3aW5kb3cuZ2FtZS5hZGRJdGVtU3RhdGUoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgJ25hbWVfaWQnOiBpdGVtLmdldE5hbWUoKSxcclxuICAgICAgICAgICdjb2xsZWN0ZWQnOiBpdGVtLmlzQ29sbGVjdGVkKCksXHJcbiAgICAgICAgICAnZ3JhYmJlZCc6IGdyYWJiZWQsXHJcbiAgICAgICAgICAnZ3JhYlByb3BzJzogZ3JhYlByb3BzLFxyXG4gICAgICAgICAgJ2Ryb3BwZWQnOiBkcm9wcGVkLFxyXG4gICAgICAgICAgJ2Ryb3BQcm9wcyc6IGRyb3BQcm9wc1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgICBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEZ1bmN0aW9ucyB0byBsb2FkIHNlbGVjdGVkIHN0YWdlXHJcbiAgbG9hZFN0YWdlKHN0YWdlLCBmaXJzdFN0YWdlKSB7XHJcbiAgICBcclxuICAgIHRoaXMuc3RhZ2UgPSBzdGFnZTtcclxuXHJcbiAgICAvLyBDbGVhciBwcmV2aW91cyByZW5kZXIgaXRlbXNcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVySXRlbXNBbmltYXRlZCA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgU3RhdGljIEl0ZW1zXHJcbiAgICB0aGlzLnN0YWdlLmdldFN0YXRpY0l0ZW1zKCkubWFwKCAoaXRlbSkgPT4geyBcclxuICAgICAgaXRlbS5zY2VuYXJpbyA9IHRoaXM7IC8vIFBhc3MgdGhpcyBzY2VuYXJpbyBjbGFzcyBhcyBhbiBhcmd1bWVudCwgc28gb3RoZXIgZnVuY3Rpb25zIGNhbiByZWZlciB0byB0aGlzXHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShpdGVtKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIHBsYXllciBoYXMgc29tZXRoaW5nIGdyYWJiZWQgYW5kIGluY2x1ZGUgaW4gcmVuZGVyXHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICE9IFwie31cIiApIHtcclxuICAgICAgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZShzYXZlZEl0ZW1zU3RhdGUpO1xyXG4gICAgICBmb3IoIGxldCBpIGluIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHNhdmVkSXRlbXNTdGF0ZVtpXTtcclxuICAgICAgICAvLyBJbmNsdWRlIGdyYWJiZWQgaXRlbVxyXG4gICAgICAgIGlmKCBpdGVtLmdyYWJiZWQgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuZ2xvYmFsQXNzZXRzLmdldEFzc2V0KCBpdGVtLmdyYWJQcm9wcy5jbGFzcywgaXRlbS5ncmFiUHJvcHMsIHRydWUgKTsgLy8gdHJ1ZSA9IGNhbWUgZnJvbSBzYXZlIHN0YXRlXHJcbiAgICAgICAgICBvYmouZ3JhYkhhbmRsZXIoIGl0ZW0uZ3JhYlByb3BzLnBsYXllcldob0dyYWJiZWQgKTsgLy8gc3RhcnQgYSBzZXR1cCBvbiB0aGUgb2JqZWN0LCBzbyB0aGUgcGxheWVyIHdpbGwgY2hlY2sgdGhlIHNhdmVkIHN0YXRlIG9mIGl0ZW1cclxuICAgICAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJbmNsdWRlIGRyb3BwZWQgaXRlbVxyXG4gICAgICAgIGlmKCBpdGVtLmRyb3BwZWQgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuZ2xvYmFsQXNzZXRzLmdldEFzc2V0KCBpdGVtLmRyb3BQcm9wcy5jbGFzcywgeyBjb2RlOiBpdGVtLmRyb3BQcm9wcy5jb2RlLCB4MDogaXRlbS5kcm9wUHJvcHMueDAsIHkwOiBpdGVtLmRyb3BQcm9wcy55MCwgc3RhZ2U6IGl0ZW0uZHJvcFByb3BzLnN0YWdlIH0sIHRydWUgKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoIHRoaXMuc3RhZ2UuZ2V0U3RhZ2VJZCgpICE9IGl0ZW0uZHJvcFByb3BzLmRyb3BwZWRTdGFnZSApIHtcclxuICAgICAgICAgICAgb2JqLmhpZGUoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBvYmouZHJvcHBlZFN0YWdlID0gaXRlbS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlO1xyXG4gICAgICAgICAgb2JqLmRyb3BwZWQgPSB0cnVlO1xyXG4gICAgICAgICAgb2JqLnVwZGF0ZVgoIGl0ZW0uZHJvcFByb3BzLmRyb3BYICk7XHJcbiAgICAgICAgICBvYmoudXBkYXRlWSggaXRlbS5kcm9wUHJvcHMuZHJvcFkgKTtcclxuICAgICAgICAgIG9iai5kcm9wWCA9IGl0ZW0uZHJvcFByb3BzLmRyb3BYO1xyXG4gICAgICAgICAgb2JqLmRyb3BZID0gaXRlbS5kcm9wUHJvcHMuZHJvcFk7XHJcbiAgICAgICAgICBvYmoueDAgPSBpdGVtLmRyb3BQcm9wcy54MDtcclxuICAgICAgICAgIG9iai55MCA9IGl0ZW0uZHJvcFByb3BzLnkwO1xyXG5cclxuICAgICAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPbmx5IHNldCBwbGF5ZXIgc3RhcnQgYXQgZmlyc3QgbG9hZFxyXG4gICAgaWYoZmlyc3RTdGFnZSkge1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WCgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXIxU3RhcnRZKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMlN0YXJ0WSgpICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TY2VuYXJpbzsiLCJjbGFzcyBfU3RhZ2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihzdGFnZUlkLCBzdGFnZU1hcCwgc3RhZ2VBc3NldHMsIHNjZW5hcmlvVGlsZVNldCkge1xyXG4gICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXIxU3RhcnRYID0gMDtcclxuICAgIHRoaXMucGxheWVyMVN0YXJ0WSA9IDA7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyMlN0YXJ0WCA9IDA7XHJcbiAgICB0aGlzLnBsYXllcjJTdGFydFkgPSAwO1xyXG5cclxuICAgIHRoaXMuc3RhZ2VJZCA9IHN0YWdlSWQ7XHJcblxyXG4gICAgdGhpcy5qc29uU3RhZ2VNYXAgPSBzdGFnZU1hcDtcclxuICAgIHRoaXMuanNvblN0YWdlQXNzZXRzID0gc3RhZ2VBc3NldHM7XHJcbiAgICB0aGlzLmpzb25UaWxlU2V0ID0gc2NlbmFyaW9UaWxlU2V0O1xyXG5cclxuICAgIHRoaXMuc3RhZ2VNYXAgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLmNvbHMgPSB0aGlzLmpzb25TdGFnZU1hcC53aWR0aDtcclxuICAgIHRoaXMucm93cyA9IHRoaXMuanNvblN0YWdlTWFwLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmNvb3JkaW5hdGVzID0ge307XHJcblxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgR2V0c1xyXG4gIGdldFN0YXRpY0l0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcblxyXG4gIGdldFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuICBcclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG5cclxuICBjYWxjdWxhdGVTdGFnZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIGZvciggbGV0IHI9MDsgcjx0aGlzLnJvd3M7cisrICkge1xyXG4gICAgICAgIGZvciggbGV0IGM9MDsgYzx0aGlzLmNvbHM7YysrICkge1xyXG4gICAgICAgICAgICB0aGlzLmNvb3JkaW5hdGVzW2luZGV4XSA9IHsgXHJcbiAgICAgICAgICAgICAgeDogdGhpcy5jaHVua1NpemUgKiBjLFxyXG4gICAgICAgICAgICAgIHk6IHRoaXMuY2h1bmtTaXplICogclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLyBMb2FkcyBKU09OIGZpbGVcclxuICBsb2FkSlNPTigpIHtcclxuICAgIFxyXG4gICAgLy8gTWFwIGVhY2ggbGF5ZXJcclxuICAgIHRoaXMuanNvblN0YWdlTWFwLmxheWVycy5tYXAoIChsYXllcikgPT4ge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhIHBsYXllciBsYXllclxyXG4gICAgICBpZiggbGF5ZXIubmFtZSA9PSBcInBsYXllclwiKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKCB7Y29kZTogJ3BsYXllcid9ICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WCggbGF5ZXIucHJvcGVydGllcy5maW5kKCB4ID0+IHgubmFtZSA9PT0gJ3BsYXllcl8xX3gnICkudmFsdWUgKiB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggbGF5ZXIucHJvcGVydGllcy5maW5kKCB4ID0+IHgubmFtZSA9PT0gJ3BsYXllcl8xX3knICkudmFsdWUgKiB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgICBcclxuICAgICAgICB0aGlzLnNldFBsYXllcjJTdGFydFgoIGxheWVyLnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICdwbGF5ZXJfMl94JyApLnZhbHVlICogdGhpcy5jaHVua1NpemUgKTtcclxuICAgICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIGxheWVyLnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICdwbGF5ZXJfMl95JyApLnZhbHVlICogdGhpcy5jaHVua1NpemUgKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGl0J3MgdGhlIGFzc2V0cyBsYXllclxyXG4gICAgICBpZiggbGF5ZXIubmFtZSA9PSBcImFzc2V0c1wiKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKHsnY29kZSc6ICdhc3NldHMnfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgIC8vIE1hcCBlYWNoIGl0ZW0gaW5zaWRlIGxheWVyXHJcbiAgICAgIGxheWVyLmRhdGEubWFwKCAob2JqKSA9PiB7XHJcbiAgICAgICAgaWYoIG9iaiAhPSAwICkgeyAvLyBhdm9pZCBlbXB0eSBvYmplY3RzXHJcbiAgICAgICAgICBvYmogPSBwYXJzZUludChvYmogLSAxKTsgLy8gQWRqdXN0IFRpbGVkIElEOiB0aGV5IGFkZCArMSB0byBJRHMgdG8gYWxsb3cgMCBhcyBhIGVtcHR5IHRpbGUgLy8gI2h0dHBzOi8vZGlzY291cnNlLm1hcGVkaXRvci5vcmcvdC93cm9uZy1pZHMtaW4tdGlsZXNldC8xNDI1XHJcbiAgICAgICAgICBsZXQgdGlsZXNldCA9IHRoaXMuanNvblRpbGVTZXQudGlsZXMuZmluZCggeCA9PiB4LmlkID09PSBvYmogKTsgLy8gR2V0IHRoZSBpbmRleCBvZiBjb3JyZXNwb25kaW5nIGlkICAgICAgICAgIFxyXG4gICAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICd4JzogdGhpcy5jb29yZGluYXRlc1tpbmRleF0ueCxcclxuICAgICAgICAgICAgICAneSc6IHRoaXMuY29vcmRpbmF0ZXNbaW5kZXhdLnksXHJcbiAgICAgICAgICAgICAgJ2NvZGUnOiBvYmosXHJcbiAgICAgICAgICAgICAgJ2NsYXNzJzogdGlsZXNldC5wcm9wZXJ0aWVzLmZpbmQoIHggPT4geC5uYW1lID09PSAnY2xhc3MnICkudmFsdWUsXHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiB0aWxlc2V0LnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICd0eXBlJyApLnZhbHVlLFxyXG4gICAgICAgICAgICAgICdzdGFnZUlEJzogdGhpcy5zdGFnZUlkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSAgICAgIFxyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGxvYWRBc3NldHMoKSB7XHJcbiAgICAvLyBUZWxlcG9ydHNcclxuICAgIHRoaXMuanNvblN0YWdlQXNzZXRzLnRlbGVwb3J0cy5tYXAoIChhc3NldCkgPT4ge1xyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeEluZGV4OiAoIGFzc2V0LnhJbmRleCAqIHRoaXMuY2h1bmtTaXplICksXHJcbiAgICAgICAgeUluZGV4OiAoIGFzc2V0LnlJbmRleCAqIHRoaXMuY2h1bmtTaXplICksXHJcbiAgICAgICAgdGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRzdGFnZTogYXNzZXQucHJvcHMudGFyZ2V0LnN0YWdlLFxyXG5cdFx0XHRcdFx0eDogKCBhc3NldC5wcm9wcy50YXJnZXQueCAqIHRoaXMuY2h1bmtTaXplICksXHJcblx0XHRcdFx0XHR5OiAoIGFzc2V0LnByb3BzLnRhcmdldC55ICogdGhpcy5jaHVua1NpemUgKSxcclxuXHRcdFx0XHRcdGxvb2s6IGFzc2V0LnByb3BzLnRhcmdldC5sb29rXHJcblx0XHRcdFx0fVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShcclxuICAgICAgICB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoJ3RlbGVwb3J0JywgeyB4SW5kZXg6IHByb3BzLnhJbmRleCwgeUluZGV4OiBwcm9wcy55SW5kZXgsIHByb3BzOiBwcm9wcyB9LCBmYWxzZSApIFxyXG4gICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRW5lbWllc1xyXG4gICAgdGhpcy5qc29uU3RhZ2VBc3NldHMuZW5lbWllcy5tYXAoIChlbmVteSkgPT4ge1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRGlhbG9nc1xyXG4gICAgdGhpcy5qc29uU3RhZ2VBc3NldHMuZGlhbG9ncy5tYXAoIChkaWFsb2cpID0+IHtcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6ICggZGlhbG9nLnggKiB0aGlzLmNodW5rU2l6ZSApLFxyXG4gICAgICAgIHk6ICggZGlhbG9nLnkgKiB0aGlzLmNodW5rU2l6ZSApLFxyXG4gICAgICAgIGRpYWxvZzogZGlhbG9nLmRpYWxvZ1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShcclxuICAgICAgICB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoJ2RpYWxvZycsIHsgeDogcHJvcHMueCwgeTogcHJvcHMueSwgZGlhbG9nOiBwcm9wcy5kaWFsb2cgfSwgZmFsc2UgKSBcclxuICAgICAgKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBsb2FkU3RhZ2VJdGVtcygpIHtcclxuICAgIHRoaXMuc3RhZ2VNYXAubWFwKCAob2JqKSA9PiB7XHJcblxyXG4gICAgICBzd2l0Y2goIG9iai5jb2RlICkge1xyXG5cclxuICAgICAgICBjYXNlICdwbGF5ZXInOlxyXG4gICAgICAgICAgd2luZG93LmdhbWUucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKCBwbGF5ZXIgKTsgLy8gQWRkcyB0aGUgcGxheWVyIHRvIHRoZSByZW5kZXJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgJ2Fzc2V0cyc6XHJcbiAgICAgICAgICB0aGlzLmxvYWRBc3NldHMoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKFxyXG4gICAgICAgICAgICB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoIG9iai5jbGFzcywgeyBjb2RlOiBvYmoudHlwZSwgeDA6IG9iai54LCB5MDogb2JqLnksIHN0YWdlOiBvYmouc3RhZ2VJRCB9LCBmYWxzZSApIC8vIGZhbHNlID0gbm90IGZyb20gc2F2ZSBzdGF0ZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBydW4gKCkgeyAgXHJcbiAgICB0aGlzLmNhbGN1bGF0ZVN0YWdlQ29vcmRpbmF0ZXMoKTtcclxuICAgIHRoaXMubG9hZEpTT04oKTtcclxuICAgIHRoaXMubG9hZFN0YWdlSXRlbXMoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX1N0YWdlOyIsIi8vIENsYXNzIHRoYXQgZGV0ZWN0cyBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIG90aGVyIG9iamVjdHNcclxuY2xhc3MgQ29sbGlzaW9uIHtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2NlbmFyaW9XaWR0aCwgc2NlbmFyaW9IZWlnaHQsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpOyAvLyBJdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcbiAgICB0aGlzLnNjZW5hcmlvV2lkdGggPSBzY2VuYXJpb1dpZHRoO1xyXG4gICAgdGhpcy5zY2VuYXJpb0hlaWdodCA9IHNjZW5hcmlvSGVpZ2h0O1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgfVxyXG5cclxuICBnZXRDb2xJdGVucygpIHsgcmV0dXJuIHRoaXMuY29sSXRlbnM7IH1cclxuXHRcdFx0XHJcbiAgLy8gIyBDaGVjayBpZiB0aGUgb2JqZWN0IGNvbGxpZGVzIHdpdGggYW55IG9iamVjdCBpbiB2ZWN0b3JcclxuICAvLyBBbGdvcml0aG0gcmVmZXJlbmNlOiBHdXN0YXZvIFNpbHZlaXJhIC0gaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1zN3FpV0xCQnBKd1xyXG4gIGNoZWNrKG9iamVjdCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMSA9IG9iamVjdDtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgdGhpcy5jaGVja0NvbGxpc2lvbihyMSwgcjIpO1xyXG4gICAgfSBcclxuICB9XHJcblxyXG4gIC8vIEByMTogdGhlIG1vdmluZyBvYmplY3RcclxuICAvLyBAcjI6IHRoZSBcIndhbGxcIlxyXG4gIGNoZWNrQ29sbGlzaW9uKHIxLCByMikge1xyXG5cclxuICAgIC8vIERvbid0IGNoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHNhbWUgb2JqZWN0XHJcbiAgICBpZiggcjEubmFtZSA9PSByMi5uYW1lICkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICYmICEgcjIuc3RvcElmQ29sbGlzaW9uKCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gcjEuZ2V0Q2VudGVyWCgpIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSByMS5nZXRDZW50ZXJZKCkgLSByMi5nZXRDZW50ZXJZKCk7XHJcblxyXG4gICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggcjEuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCByMS5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgdmFyIG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgIHZhciBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuXHJcbiAgICAgIGlmKCByMi5zdG9wSWZDb2xsaXNpb24oKSApIHtcclxuICAgICAgICBpZihvdmVybGFwWCA+PSBvdmVybGFwWSApeyAvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gVXAvRG93blxyXG4gICAgICAgICAgaWYoY2F0WSA+IDApeyAvLyBVcFxyXG4gICAgICAgICAgICByMS5zZXRZKCByMS5nZXRZKCkgKyBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25ZKCByMS5nZXRDb2xsaXNpb25ZKCkgKyBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpIC0gb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWSggcjEuZ2V0Q29sbGlzaW9uWSgpIC0gb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Ugey8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBMZWZ0L1JpZ2h0XHJcbiAgICAgICAgICBpZihjYXRYID4gMCl7IC8vIExlZnRcclxuICAgICAgICAgICAgcjEuc2V0WCggcjEuZ2V0WCgpICsgb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWCggcjEuZ2V0Q29sbGlzaW9uWCgpICsgb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSAtIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblgoIHIxLmdldENvbGxpc2lvblgoKSAtIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiggd2luZG93LmRlYnVnQ29sbGlzaW9uICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gYmV0d2VlbicsIHIxLm5hbWUgKyBcIihcIiArIHIxLmdldFgoKSArIFwiL1wiICsgcjEuZ2V0WSgpICsgXCIpXCIsIHIyLm5hbWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcmlnZ2VycyBDb2xsaXNpb24gZXZlbnRcclxuICAgICAgcjEuY29sbGlzaW9uKHIyLCByMSk7XHJcbiAgICAgIHIyLmNvbGxpc2lvbihyMSwgcjIpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyaWdnZXJzIG5vdCBpbiBjb2xsaXNpb24gZXZlbnRcclxuICAgICAgcjEubm9Db2xsaXNpb24ocjIsIHIyKTsgXHJcbiAgICAgIHIyLm5vQ29sbGlzaW9uKHIxLCByMik7IFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIEp1c3QgY2hlY2sgZm9yIGEgc3BlY2lmaWMgY29sbGlzaW9uIGFuZCByZXR1cm4gdGhlIGZpcnQgb2JqZWN0IGNvbGxpZGVkXHJcbiAganVzdENoZWNrKHIxLCBfeCwgX3ksIF93LCBfaCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIGxldCByID0gdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24ocjEsIHIyLCBfeCwgX3ksIF93LCBfaCk7XHJcbiAgICAgIGlmKCByICkgcmV0dXJuIHI7IC8vIGlmIGhhcyBzb21ldGhpbmcsIHJldHVybiBhbmQgc3RvcCBsb29wXHJcbiAgICB9IFxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uKHIxLCByMiwgX3gsIF95LCBfdywgX2gpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9yZXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIG9iamVjdHMgKG11c3QgYmUgcmVjdGFuZ2xlKVxyXG4gICAgdmFyIGNhdFggPSAoIF94ICsgX3cgLyAyICkgLSByMi5nZXRDZW50ZXJYKCk7XHJcbiAgICB2YXIgY2F0WSA9ICggX3kgKyBfaCAvIDIgKSAtIHIyLmdldENlbnRlclkoKTtcclxuIFxyXG4gICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggX3cgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggX2ggLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgcmV0dXJuIHIyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlOyAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gSnVzdCBjaGVjayBmb3IgYSBzcGVjaWZpYyBjb2xsaXNpb24gYW5kIHJldHVybiB0aGUgZmlydCBvYmplY3QgY29sbGlkZWRcclxuICBqdXN0Q2hlY2tBbGwocjEsIF94LCBfeSwgX3csIF9oKSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgbGV0IHIgPSB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbkFsbChyMSwgcjIsIF94LCBfeSwgX3csIF9oKTtcclxuICAgICAgaWYoIHIgKSByZXR1cm4gcjsgLy8gaWYgaGFzIHNvbWV0aGluZywgcmV0dXJuIGFuZCBzdG9wIGxvb3BcclxuICAgIH0gXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb25BbGwocjEsIHIyLCBfeCwgX3ksIF93LCBfaCkge1xyXG5cclxuICAgIC8vIERvbid0IGNoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHNhbWUgb2JqZWN0XHJcbiAgICBpZiggcjEubmFtZSA9PSByMi5uYW1lICkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICYmICEgcjIuc3RvcElmQ29sbGlzaW9uKCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gKCBfeCArIF93IC8gMiApIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSAoIF95ICsgX2ggLyAyICkgLSByMi5nZXRDZW50ZXJZKCk7XHJcbiBcclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIF93IC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIF9oIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIFxyXG4gICAgICAvL2NhbGN1bGF0ZSBvdmVybGFwIGlmIG5lZWQgdG8gc3RvcCBvYmplY3RcclxuICAgICAgbGV0IG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgIGxldCBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuXHJcbiAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZICl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duXHJcbiAgICAgICAgaWYoY2F0WSA+IDApeyAvLyBVcFxyXG4gICAgICAgICAgcjIub3ZlcmxhcFkgPSByMS5nZXRZKCkgKyBvdmVybGFwWTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcjIub3ZlcmxhcFkgPSByMS5nZXRZKCkgLSBvdmVybGFwWTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICBpZihjYXRYID4gMCl7IC8vIExlZnRcclxuICAgICAgICAgIHIyLm92ZXJsYXBYID0gcjEuZ2V0WCgpICsgb3ZlcmxhcFg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHIyLm92ZXJsYXBYID0gcjEuZ2V0WCgpIC0gb3ZlcmxhcFg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcjI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7ICBcclxuICAgIH1cclxuXHJcbiAgfVxyXG4gIFx0XHRcclxuXHQvLyBBZGQgaXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG5cdGFkZEl0ZW0ob2JqZWN0KSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0KTtcclxuICB9O1xyXG4gIFxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xlYXJBcnJheUl0ZW1zKCkge1xyXG4gICAgdGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi8uLi9nYW1lUHJvcGVydGllcycpO1xyXG5jb25zdCBzY2VuYXJpb1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc2NlbmFyaW9Qcm90b3R5cGUnKTtcclxuY29uc3Qgc2NlbmFyaW9TYW5kYm94ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc2NlbmFyaW9TYW5kYm94Jyk7XHJcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9QbGF5ZXInKTtcclxuY29uc3QgQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9Db2xsaXNpb24nKTtcclxuY29uc3QgUmVuZGVyID0gcmVxdWlyZSgnLi9SZW5kZXInKTtcclxuY29uc3QgVUkgPSByZXF1aXJlKCcuLi91aS9VSScpO1xyXG5jb25zdCBHbG9iYWxBc3NldHMgPSByZXF1aXJlKCcuLi9hc3NldHMvR2xvYmFsQXNzZXRzJyk7XHJcblxyXG5jbGFzcyBHYW1lIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gRlBTIENvbnRyb2xcclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSBudWxsOyBcclxuICAgIHRoaXMubm93ID0gbnVsbDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbnVsbDsgXHJcbiAgICB0aGlzLmVsYXBzZWQgPSBudWxsO1xyXG5cclxuICAgIC8vIEV2ZW50c1xyXG4gICAgdGhpcy5rZXlzRG93biA9IHt9O1xyXG4gICAgdGhpcy5rZXlzUHJlc3MgPSB7fTtcclxuXHJcbiAgICAvLyBQYXVzZVxyXG4gICAgdGhpcy5fcGF1c2UgPSBmYWxzZTtcclxuICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gSXRlbXNcclxuICAgIHRoaXMuaXRlbXNTdGF0ZSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICAvLyBHYW1lXHJcbiAgICB0aGlzLmdhbWVQcm9wcyA9IG5ldyBnYW1lUHJvcGVydGllcygpO1xyXG4gICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLmNvbGxpc2lvbiA9IG51bGw7XHJcbiAgICB0aGlzLmRlZmF1bHRTY2VuYXJpbyA9ICdzYW5kYm94JztcclxuICAgIHRoaXMuc2NlbmFyaW8gPSBudWxsO1xyXG4gICAgdGhpcy5VSSA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGFnZU5hbWUgPSAnJztcclxuXHJcbiAgICB0aGlzLmdhbWVSZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubXVsdGlwbGF5ZXIgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBSZW5kZXJzXHJcbiAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG51bGw7XHJcbiAgICB0aGlzLnJlbmRlckxheWVycyA9IG51bGw7XHJcbiAgICB0aGlzLnJlbmRlclVJICAgICA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5nbG9iYWxBc3NldHMgPSBuZXcgR2xvYmFsQXNzZXRzKCB0aGlzLmdhbWVQcm9wcy5jaHVua1NpemUgKTtcclxuXHJcbiAgICAvLyBEaWFsb2cgUHJvcHNcclxuICAgIHRoaXMuZGVmYXVsdERpYWxvZyA9IFsgeyBoaWRlU3ByaXRlOiB0cnVlLCB0ZXh0OiBcIlwiIH0gXTtcclxuICAgIHRoaXMuZGlhbG9nID0gdGhpcy5kZWZhdWx0RGlhbG9nO1xyXG4gICAgdGhpcy5kaWFsb2dBY3RpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuZGlhbG9nSW5kZXggPSAwO1xyXG4gICAgdGhpcy5maXJzdEtleVVwVHJpZ2dlciA9IHRydWU7XHJcblxyXG4gICAgLy8gU291bmRzXHJcbiAgICB0aGlzLm1lbnVTb3VuZFNyYyA9IFwiLi9zb3VuZHMvbWFpbi1tZW51Lm1wM1wiO1xyXG4gICAgdGhpcy5tZW51U291bmQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnN1Y2Nlc3NTb3VuZFNyYyA9IFwiLi9zb3VuZHMvc2NlbmFyaW9zL3N1Y2Nlc3MubXAzXCI7XHJcbiAgICB0aGlzLnN1Y2Nlc3NTb3VuZCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLmdhbWVPdmVyU291bmRTcmMgPSBcIi4vc291bmRzL3NjZW5hcmlvcy9nYW1lLW92ZXIubXAzXCI7XHJcbiAgICB0aGlzLmdhbWVPdmVyU291bmQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnNjZW5hcmlvU291bmQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmluaXRTb3VuZCgpO1xyXG4gIH1cclxuXHJcbiAgaW5pdFNvdW5kKCkge1xyXG4gICAgdGhpcy5tZW51U291bmQgPSBuZXcgSG93bCh7XHJcbiAgICAgIHNyYzogW3RoaXMubWVudVNvdW5kU3JjXSxcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgdm9sdW1lOiAwLjZcclxuICAgIH0pO1xyXG4gICAgdGhpcy5tZW51U291bmQucGxheSgpO1xyXG4gICAgdGhpcy5zdWNjZXNzU291bmQgPSBuZXcgSG93bCh7XHJcbiAgICAgIHNyYzogW3RoaXMuc3VjY2Vzc1NvdW5kU3JjXSxcclxuICAgICAgdm9sdW1lOiAwLjZcclxuICAgIH0pO1xyXG4gICAgdGhpcy5nYW1lT3ZlclNvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICBzcmM6IFt0aGlzLmdhbWVPdmVyU291bmRTcmNdXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHBsYXlTdWNjZXNzU291bmQoKSB7XHJcbiAgICB0aGlzLnNjZW5hcmlvU291bmQudm9sdW1lKDAuMik7XHJcbiAgICB0aGlzLnN1Y2Nlc3NTb3VuZC5wbGF5KCk7XHJcbiAgICB0aGlzLnN1Y2Nlc3NTb3VuZC5vbignZW5kJywgKCkgPT4geyB0aGlzLnNjZW5hcmlvU291bmQudm9sdW1lKDAuNik7IH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gR2V0c1xyXG4gIGlzR2FtZVJlYWR5KCkgeyByZXR1cm4gdGhpcy5nYW1lUmVhZHk7IH1cclxuICBnZXRDaHVua1NpemUoKSB7IHJldHVybiB0aGlzLmdhbWVQcm9wcy5jaHVua1NpemU7IH1cclxuXHJcbiAgZ2V0Q2FudmFzV2lkdGgoKSAgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2FudmFzV2lkdGg7ICB9XHJcbiAgZ2V0Q2FudmFzSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2FudmFzSGVpZ2h0OyB9XHJcblxyXG4gIC8vIFNldHNcclxuICBzZXRHYW1lUmVhZHkoYm9vbCkgeyB0aGlzLmdhbWVSZWFkeSA9IGJvb2w7IH1cclxuXHJcbiAgc2V0Q3VycmVudFN0YWdlKHN0YWdlKXsgdGhpcy5jdXJyZW50U3RhZ2VOYW1lID0gc3RhZ2U7IH1cclxuICBnZXRDdXJyZW50U3RhZ2UoKSB7IHJldHVybiB0aGlzLmN1cnJlbnRTdGFnZU5hbWU7IH1cclxuXHJcbiAgLy8gRGlhbG9nXHJcbiAgaXNEaWFsb2dBY3RpdmUoKXsgcmV0dXJuIHRoaXMuZGlhbG9nQWN0aXZlOyB9XHJcbiAgc2V0RGlhbG9nQWN0aXZlKGJvb2wpIHsgdGhpcy5kaWFsb2dBY3RpdmUgPSBib29sOyB9XHJcbiAgc2V0RGlhbG9nKCBkaWFsb2cpIHtcclxuICAgIHRoaXMuZGlhbG9nID0gZGlhbG9nO1xyXG4gICAgdGhpcy5zZXREaWFsb2dBY3RpdmUodHJ1ZSk7XHJcbiAgfVxyXG4gIHJlc2V0RGlhbG9nKCkge1xyXG4gICAgdGhpcy5kaWFsb2cgPSB0aGlzLmRlZmF1bHREaWFsb2c7XHJcbiAgICB0aGlzLmRpYWxvZ0luZGV4ID0gMDtcclxuICAgIHRoaXMuc2V0RGlhbG9nQWN0aXZlKGZhbHNlKTtcclxuICAgIHRoaXMuZmlyc3RLZXlVcFRyaWdnZXIgPSB0cnVlO1xyXG4gIH1cclxuICAgIFxyXG4gIC8vICMgR28gdG8gbmV4dCBkaWFsb2dcclxuXHRuZXh0RGlhbG9nKCkge1xyXG4gICAgaWYoIHRoaXMuaXNEaWFsb2dBY3RpdmUoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZmlyc3RLZXlVcFRyaWdnZXIgKSB7IC8vIElnbm9yZSB0aGUgZmlyc3Qga2V5VXAgYmVjYXVzZSBpdCdzIHRyaWdnZXJpbmcgdG8gbmV4dCBpbmRleCByaWdodCBhZnRlciB0aGUgcGxheWVyIGFjdGl2YXRlIHRoZSBkaWFsb2dcclxuICAgICAgICB0aGlzLmZpcnN0S2V5VXBUcmlnZ2VyID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kaWFsb2dJbmRleCsrO1xyXG4gICAgICAgIGlmKCB0aGlzLmRpYWxvZ1t0aGlzLmRpYWxvZ0luZGV4XS5oaWRlU3ByaXRlICkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldERpYWxvZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cdH1cclxuXHJcbiAgLy8gIyBLZXkgdXAgaGFuZGxlXHJcblx0aGFuZGxlS2V5VXAoa2V5Q29kZSkge1xyXG4gICAgXHJcbiAgICAvLyBQYXVzZVxyXG4gICAgaWYoIGtleUNvZGUgPT0gMjcgJiYgdGhpcy5nYW1lSXNMb2FkZWQgKSB7IC8vIEVTUVxyXG4gICAgICB0aGlzLnRvZ2dsZVBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlhbG9nXHJcblx0XHRpZiAoa2V5Q29kZSA9PSAzMiB8fCBrZXlDb2RlID09IDY5KSB7IC8vIFNwYWNlIG9yIEVcclxuXHRcdFx0dGhpcy5uZXh0RGlhbG9nKCk7XHJcblx0XHR9IFxyXG4gIFxyXG4gIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgRGVmYXVsdCBFdmVudCBMaXN0ZW5lcnNcclxuICBkZWZhdWx0RXZlbnRMaXN0ZW5lcnMoKSB7XHJcblxyXG4gICAgLy8gTWVudSBDbGlja3NcclxuICAgIGxldCBtZW51SXRlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lbnUtaXRlbScpO1xyXG4gICAgXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lbnVJdGVtLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxldCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgIG1lbnVJdGVtW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMubWVudUFjdGlvbiggdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWFjdGlvblwiKSApO1xyXG4gICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBLZXlib2FyZCBFdmVudHNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICB0aGlzLmtleXNEb3duW2Uua2V5Q29kZV0gPSB0cnVlO1xyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBcclxuICAgICAgLy8gQ2xlYXIgcHJldmlvdXMga2V5c1xyXG4gICAgICBkZWxldGUgdGhpcy5rZXlzRG93bltlLmtleUNvZGVdO1xyXG4gICAgICBcclxuICAgICAgLy8gUmVzZXQgcGxheWVycyBsb29rIGRpcmVjdGlvblxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgaGFuZGxlIGtleXVwXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBwbGF5ZXIuaGFuZGxlS2V5VXAoZS5rZXlDb2RlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2FtZSBIYW5kbGUga2V5cFxyXG4gICAgICB0aGlzLmhhbmRsZUtleVVwKGUua2V5Q29kZSk7XHJcbiAgICAgIFxyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFN0YXJ0L1Jlc3RhcnQgYSBHYW1lXHJcblxyXG4gIHJlZnJlc2hWYXJpYWJsZXMoKSB7XHJcblxyXG4gICAgLy8gQ2xlYXIgc2F2ZSBzdGF0ZVxyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpO1xyXG5cclxuICAgIC8vIFJlbmRlcnNcclxuICAgIHRoaXMuaXRlbXNTdGF0ZSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICB0aGlzLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMuY29sbGlzaW9uID0gbnVsbDtcclxuICAgIHRoaXMuZGVmYXVsdFNjZW5hcmlvID0gJ3NhbmRib3gnO1xyXG4gICAgdGhpcy5zY2VuYXJpbyA9IG51bGw7XHJcbiAgICB0aGlzLlVJID0gbnVsbDtcclxuICAgIHRoaXMuY3VycmVudFN0YWdlTmFtZSA9ICcnO1xyXG5cclxuICAgIC8vIFJlbmRlcnNcclxuICAgIHRoaXMucmVuZGVyU3RhdGljID0gbnVsbDtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbnVsbDtcclxuICAgIHRoaXMucmVuZGVyVUkgICAgID0gbnVsbDtcclxuXHJcbiAgfVxyXG5cclxuICBzdGFydE5ld0dhbWUoIHNhdmVEYXRhICkge1xyXG5cclxuICAgIHRoaXMucmVmcmVzaFZhcmlhYmxlcygpO1xyXG4gICAgXHJcbiAgICAvLyAjIEluaXRcclxuICAgICAgXHJcbiAgICAgIGxldCBjYW52YXNTdGF0aWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX3N0YXRpYycpO1xyXG4gICAgICBsZXQgY29udGV4dFN0YXRpYyA9IGNhbnZhc1N0YXRpYy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgbGV0IGNhbnZhc1VJID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc191aScpO1xyXG4gICAgICBsZXQgY29udGV4dFVJID0gY2FudmFzVUkuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgIGNhbnZhc1N0YXRpYy53aWR0aCA9IGNhbnZhc1VJLndpZHRoID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzV2lkdGgnKTtcclxuICAgICAgY2FudmFzU3RhdGljLmhlaWdodCA9IGNhbnZhc1VJLmhlaWdodCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc0hlaWdodCcpO1xyXG5cclxuICAgIC8vICMgUGxheWVyc1xyXG4gICAgICB0aGlzLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAgIGlmKCAhIHNhdmVEYXRhICkge1xyXG4gICAgICAgIGxldCBwbGF5ZXIgPSBuZXcgUGxheWVyKCB0aGlzLmdhbWVQcm9wcywgMSApOyBcclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xyXG4gICAgICAgIGlmICggdGhpcy5tdWx0aXBsYXllciApIHtcclxuICAgICAgICAgIGxldCBwbGF5ZXIyID0gbmV3IFBsYXllciggdGhpcy5nYW1lUHJvcHMsIDIgKTsgXHJcbiAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2F2ZURhdGEucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIGxldCBfcGxheWVyID0gbmV3IFBsYXllciggdGhpcy5nYW1lUHJvcHMsIHBsYXllci5wbGF5ZXJOdW1iZXIsIHBsYXllciApOyBcclxuICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKCBfcGxheWVyKTtcclxuICAgICAgICB9KTsgIFxyXG4gICAgICB9XHJcbiAgICBcclxuICAgIC8vICMgU2NlbmFyaW9cclxuICAgIFxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggdGhpcy5kZWZhdWx0U2NlbmFyaW8sIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmFyaW8gPSB0aGlzLmdldFNjZW5hcmlvKCBzYXZlRGF0YS5zY2VuYXJpby5zY2VuYXJpb0lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2NlbmFyaW9Tb3VuZCA9IHRoaXMuc2NlbmFyaW8uZ2V0U2NlbmFyaW9Tb3VuZCgpO1xyXG5cclxuICAgICAgLy8gU2V0IHBsYXllciBYIGFuZCBZXHJcbiAgICAgIGlmKCAhIHNhdmVEYXRhICkge1xyXG4gICAgICAgIGxldCBpID0gMTtcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBzd2l0Y2goaSl7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICBwbGF5ZXIuc2V0U3RhcnRQb3NpdGlvbiggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIxU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WSgpICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICBwbGF5ZXIuc2V0U3RhcnRQb3NpdGlvbiggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIyU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMlN0YXJ0WSgpICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpKys7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2F2ZURhdGEucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHN3aXRjaChwbGF5ZXIucGxheWVyTnVtYmVyKXtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRTdGFydFBvc2l0aW9uKCBwbGF5ZXIueCwgcGxheWVyLnkgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgIHRoaXMucGxheWVyc1swXS5zZXRTdGFydFBvc2l0aW9uKCBwbGF5ZXIueCwgcGxheWVyLnkgKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTsgXHJcbiAgICAgIH1cclxuICAgICAgXHJcblxyXG4gICAgLy8gIyBVSVxyXG4gICAgICBcclxuICAgICAgdGhpcy5VSSA9IG5ldyBVSSggdGhpcy5wbGF5ZXJzLCB0aGlzLmdhbWVQcm9wcyk7XHJcblxyXG4gICAgLy8gIyBDb2xsaXNpb24gZGV0ZWN0aW9uIGNsYXNzXHJcblxyXG4gICAgICB0aGlzLmNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oIGNhbnZhc1N0YXRpYy53aWR0aCwgY2FudmFzU3RhdGljLmhlaWdodCApO1xyXG5cclxuICAgIC8vICMgUmVuZGVyXHJcblxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG5ldyBSZW5kZXIoY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljKTsgLy8gUmVuZGVyIGV4ZWN1dGVkIG9ubHkgb25jZVxyXG4gICAgICB0aGlzLnJlbmRlclVJICAgICA9IG5ldyBSZW5kZXIoY29udGV4dFVJLCBjYW52YXNVSSk7IFxyXG5cclxuICAgICAgLy8gQWRkIGl0ZW1zIHRvIGJlIHJlbmRlcmVkXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLnNldFNjZW5hcmlvKHRoaXMuc2NlbmFyaW8pOyAvLyBzZXQgdGhlIHNjZW5hcmlvXHJcbiAgICBcclxuICAgIC8vIEhpZGUgRWxlbWVudHNcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluTWVudVwiKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICAgIHRoaXMubG9hZGluZyhmYWxzZSk7XHJcblxyXG4gICAgLy8gU2hvdyBDYW52YXNcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDYW52YXMnKS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZ2FtZSBpcyBub3QgcGF1c2VkXHJcbiAgICAgIHRoaXMudW5wYXVzZSgpO1xyXG4gICAgXHJcbiAgICAvLyBTY2VuYXJpbyBzb3VuZFxyXG4gICAgICB0aGlzLnNjZW5hcmlvU291bmQucGxheSgpO1xyXG5cclxuICAgIC8vIEZsYWcgXHJcbiAgICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgLy8gT2ssIHJ1biB0aGUgZ2FtZSBub3dcclxuICAgICAgdGhpcy5zZXRHYW1lUmVhZHkodHJ1ZSk7XHJcbiAgICAgIHRoaXMucnVuR2FtZSggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnZnBzJykgKTtcdC8vIEdPIEdPIEdPXHJcblxyXG4gIH0vL25ld0dhbWVcclxuXHJcbiAgICAvLyAjIFRoZSBHYW1lIExvb3BcclxuICAgIHVwZGF0ZUdhbWUoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc1BhdXNlZCgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgdGhpcy5yZW5kZXJVSS5zdGFydCggZGVsdGFUaW1lICk7XHJcbiAgICAgXHJcbiAgICAgIC8vICMgQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSApO1xyXG4gICAgICAvKnRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0ocGxheWVyKTtcclxuICAgICAgfSk7Ki9cclxuICBcclxuICAgICAgLy8gXCJTdGF0aWNcIiBSZW5kZXIgLSBCYWNrZ3JvdW5kXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5hZGRBcnJheUl0ZW0odGhpcy5zY2VuYXJpby5nZXRTdGF0aWNJdGVtcygpKTsgLy8gR2V0IGFsbCBpdGVtcyBmcm9tIHRoZSBzY2VuYXJpbyB0aGF0IG5lZWRzIHRvIGJlIHJlbmRlcmVkXHJcblxyXG4gICAgICAvLyBVSSBSZW5kZXJcclxuICAgICAgdGhpcy5yZW5kZXJVSS5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5yZW5kZXJVSS5hZGRBcnJheUl0ZW0oIHRoaXMuVUkuZ2V0TmV3UmVuZGVySXRlbXMoKSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyAjIE1vdmVtZW50c1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgcGxheWVyLmhhbmRsZU1vdmVtZW50KCB0aGlzLmtleXNEb3duICk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gIyBDaGVjayBpZiBwbGF5ZXIgaXMgY29sbGlkaW5nXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbi5jaGVjayhwbGF5ZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIFwiVGhyZWFkXCIgdGhhIHJ1bnMgdGhlIGdhbWVcclxuICAgIHJ1bkdhbWUoZnBzKSB7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZnBzO1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIHRoaXMuZ2FtZUxvb3AoKTtcclxuICAgIH1cclxuICAgIGdhbWVMb29wKCkge1xyXG5cclxuICAgICAgLy8gY2FsYyBlbGFwc2VkIHRpbWUgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgIHRoaXMubm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5lbGFwc2VkID0gdGhpcy5ub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuXHJcbiAgICAgIC8vIGlmIGVub3VnaCB0aW1lIGhhcyBlbGFwc2VkLCBkcmF3IHRoZSBuZXh0IGZyYW1lXHJcbiAgICAgIGlmICggdGhpcy5lbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICAvLyBHZXQgcmVhZHkgZm9yIG5leHQgZnJhbWUgYnkgc2V0dGluZyB0aGVuPW5vdywgYnV0IGFsc28gYWRqdXN0IGZvciB5b3VyXHJcbiAgICAgICAgLy8gc3BlY2lmaWVkIGZwc0ludGVydmFsIG5vdCBiZWluZyBhIG11bHRpcGxlIG9mIFJBRidzIGludGVydmFsICgxNi43bXMpXHJcbiAgICAgICAgdGhpcy5kZWx0YVRpbWUgPSB0aGlzLm5vdyAtICh0aGlzLmVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVHYW1lKCB0aGlzLmRlbHRhVGltZSApO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUnVucyBvbmx5IHdoZW4gdGhlIGJyb3dzZXIgaXMgaW4gZm9jdXNcclxuICAgICAgLy8gUmVxdWVzdCBhbm90aGVyIGZyYW1lXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldFNjZW5hcmlvKCBzY2VuYXJpb19pZCwgY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApIHtcclxuXHJcbiAgICAgIC8vIEl0ZW1zU3RhdGVcclxuICAgICAgaWYoIHNhdmVEYXRhICkge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19pdGVtc1N0YXRlJywgSlNPTi5zdHJpbmdpZnkoc2F2ZURhdGEuc2NlbmFyaW8uaXRlbXMpICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBKU09OLnN0cmluZ2lmeSh7fSkgKTsgLy8gQ2xlYXIgcHJldmlvdXMgc2F2ZXN0YXRlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN3aXRjaChzY2VuYXJpb19pZCkge1xyXG4gICAgICAgIGNhc2UgXCJwcm90b3R5cGVcIjpcclxuICAgICAgICAgIHJldHVybiBuZXcgc2NlbmFyaW9Qcm90b3R5cGUoY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcInNhbmRib3hcIjpcclxuICAgICAgICAgIHJldHVybiBuZXcgc2NlbmFyaW9TYW5kYm94KGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBNZW51XHJcbiAgXHJcbiAgLy8gQHBhdXNlZCBkZXRlcm1pbmUgaWYgdGhlIGdhbWUgY2FtZSBmcm9tIGEgcGF1c2UgYWN0aW9uIG9yIGEgbmV3IGdhbWUgKHdoZW4gcGFnZSBsb2FkcylcclxuICBtYWluTWVudShwYXVzZWQpIHsgXHJcbiAgICBcclxuICAgIGxldCBkaXZNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51Jyk7XHJcblxyXG4gICAgLy8gU2V0IG1haW5NZW51IGNsYXNzXHJcbiAgICAoIHBhdXNlZCApID8gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKSA6ICcnO1xyXG4gICAgKCBwYXVzZWQgKSA/ICcnIDogZGl2TWVudS5jbGFzc0xpc3QuYWRkKCduZXctZ2FtZScpO1xyXG4gICAgXHJcbiAgICAvLyBUb2dnbGUgTWVudVxyXG4gICAgZGl2TWVudS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICBcclxuICB9XHJcbiAgICAvLyBIYW5kbGUgTWVudSBBY3Rpb25cclxuICAgIG1lbnVBY3Rpb24oYWN0aW9uKSB7XHJcbiAgICAgIHN3aXRjaChhY3Rpb24pIHtcclxuICAgICAgICBjYXNlICdjb250aW51ZSc6XHJcbiAgICAgICAgICB0aGlzLmNvbnRpbnVlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgICB0aGlzLnNhdmVHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsb2FkJzpcclxuICAgICAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldyc6XHJcbiAgICAgICAgICB0aGlzLm11bHRpcGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbmV3LTItcGxheWVycyc6XHJcbiAgICAgICAgICB0aGlzLm11bHRpcGxheWVyID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMubmV3R2FtZShmYWxzZSk7Ly8gZmFsc2UgPSB3b24ndCBsb2FkIHNhdmVEYXRhXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdjb250cm9scyc6XHJcbiAgICAgICAgY2FzZSAnYmFjay1jb250cm9scyc6XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbk1lbnUnKS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJvbHMnKS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBOZXcgR2FtZVxyXG4gIG5ld0dhbWUoc2F2ZURhdGEpIHtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMubWVudVNvdW5kICkge1xyXG4gICAgICBpZiggdGhpcy5tZW51U291bmQucGxheWluZygpICkgdGhpcy5tZW51U291bmQuc3RvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucGF1c2UoKTtcclxuICAgIHRoaXMubG9hZGluZyh0cnVlKTtcclxuICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgdGhpcy5zdGFydE5ld0dhbWUoc2F2ZURhdGEpOyBcclxuICAgIH0sIDUwMCApO1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIENvbnRpbnVlXHJcbiAgY29udGludWVHYW1lKCkge1xyXG4gICAgdGhpcy51bnBhdXNlKCk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiBcclxuICAvLyAjIFNhdmVcclxuICBzYXZlR2FtZSgpIHtcclxuICAgIGlmKCBjb25maXJtKCdTYWx2YXIgbyBqb2dvIGF0dWFsIGlyw6Egc29icmVlc2NyZXZlciBxdWFscXVlciBqb2dvIHNhbHZvIGFudGVyaW9ybWVudGUuIERlc2VqYSBjb250aW51YXI/JykgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTYXZlIGl0ZW1zIHN0YXRlIGZpcnN0XHJcbiAgICAgIHRoaXMuc2NlbmFyaW8uc2F2ZUl0ZW1zU3RhdGUoKTtcclxuXHJcbiAgICAgIGxldCBzYXZlRGF0YSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICAgIC8vIE11bHRpcGxheWVyXHJcbiAgICAgIHNhdmVEYXRhLm11bHRpcGxheWVyID0gdGhpcy5tdWx0aXBsYXllcjtcclxuXHJcbiAgICAgIC8vIFNjZW5hcmlvXHJcbiAgICAgIHNhdmVEYXRhLnNjZW5hcmlvID0ge1xyXG4gICAgICAgIHNjZW5hcmlvSWQ6IHRoaXMuc2NlbmFyaW8uZ2V0SWQoKSxcclxuICAgICAgICBzdGFnZUlkOiB0aGlzLnNjZW5hcmlvLmdldEFjdHVhbFN0YWdlSWQoKSxcclxuICAgICAgICBpdGVtczogdGhpcy5nZXRJdGVtc1N0YXRlKClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUGxheWVyc1xyXG4gICAgICBzYXZlRGF0YS5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgcGxheWVyTnVtYmVyOiBwbGF5ZXIuZ2V0UGxheWVyTnVtYmVyKCksXHJcbiAgICAgICAgICB4OiBwbGF5ZXIuZ2V0WCgpLFxyXG4gICAgICAgICAgeTogcGxheWVyLmdldFkoKSxcclxuICAgICAgICAgIGxpZmVzOiBwbGF5ZXIuZ2V0TGlmZXMoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgIC8vIENvbnZlcnQgdG8gSlNPTlxyXG4gICAgICBzYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHNhdmVEYXRhKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFNhdmUgb24gTG9jYWxTdG9yYWdlXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19zYXZlJywgc2F2ZURhdGEgKTtcclxuXHJcbiAgICAgIGFsZXJ0KCdKb2dvIHNhbHZvIScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFNhdmVcclxuICBsb2FkR2FtZSgpIHtcclxuICAgIFxyXG4gICAgLy8gIyBHZXQgZGF0YSBmcm9tIGxvY2Fsc3RvcmFnZSBhbmQgY29udmVydHMgdG8ganNvblxyXG4gICAgbGV0IHNhdmVEYXRhID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9fc2F2ZScpICk7XHJcblxyXG4gICAgaWYoIHNhdmVEYXRhICkge1xyXG4gICAgICAvLyBXaWxsIGJlICBtdWx0aXBsYXllciBnYW1lP1xyXG4gICAgICB0aGlzLm11bHRpcGxheWVyID0gKCBzYXZlRGF0YSApID8gc2F2ZURhdGEubXVsdGlwbGF5ZXIgOiBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFJlcGxhY2UgaXRlbXMgc3RhdGUgb24gbG9jYWwgc3RvcmFnZSB3aXRoIHNhdmVkIHN0YXRlc1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScsIEpTT04uc3RyaW5naWZ5KCBzYXZlRGF0YS5zY2VuYXJpby5pdGVtcyApICk7XHJcblxyXG4gICAgICAvLyBMb2FkIEl0ZW1zIGl0ZW5zXHJcbiAgICAgIGZvciggbGV0IGkgaW4gc2F2ZURhdGEuc2NlbmFyaW8uaXRlbXMgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRJdGVtU3RhdGUoIHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zW2ldICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyAjIExvYWRzIGEgbmV3IGdhbWUgd2l0aCBzYXZlIGRhdGFcclxuICAgICAgdGhpcy5uZXdHYW1lKHNhdmVEYXRhKTsgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnTsOjbyBow6Egam9nbyBzYWx2byBwcmV2aWFtZW50ZS4nKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFBhdXNlXHJcbiAgaXNQYXVzZWQoKSB7IHJldHVybiB0aGlzLl9wYXVzZTsgfVxyXG4gIHBhdXNlKCkgeyBcclxuICAgIHRoaXMuX3BhdXNlID0gdHJ1ZTsgXHJcbiAgICB0aGlzLm1haW5NZW51KHRydWUpO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5zY2VuYXJpbyApIHRoaXMuc2NlbmFyaW8uc291bmQucGF1c2UoKTtcclxuXHJcbiAgICAvL0hpZGUgQ29udHJvbCBzY3JlZW5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cm9scycpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIFxyXG4gIH1cclxuICB1bnBhdXNlKCkgeyBcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIHRoaXMuX3BhdXNlID0gZmFsc2U7IFxyXG4gICAgXHJcbiAgICB0aGlzLm1lbnVTb3VuZC5zdG9wKCk7XHJcbiAgICBpZiggdGhpcy5zY2VuYXJpbyApIHRoaXMuc2NlbmFyaW8uc291bmQucGxheSgpO1xyXG4gIH1cclxuICB0b2dnbGVQYXVzZSgpIHsgKCB0aGlzLmlzUGF1c2VkKCkgKSA/IHRoaXMudW5wYXVzZSgpIDogdGhpcy5wYXVzZSgpIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGxvYWRpbmcoYm9vbCkge1xyXG4gICAgbGV0IGRpc3BsYXkgPSAoIGJvb2wgKSA/ICdmbGV4JyA6ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGdhbWVPdmVyKGJvb2wpIHtcclxuICAgIGlmKCBib29sICkgdGhpcy5fcGF1c2UgPSB0cnVlOyBcclxuICAgIGxldCBkaXNwbGF5ID0gKCBib29sICkgPyAnZmxleCcgOiAnbm9uZSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZS1vdmVyJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgICBpZiggYm9vbCAmJiB0aGlzLmdhbWVPdmVyU291bmQgKSB7XHJcbiAgICAgIGlmKCB0aGlzLnNjZW5hcmlvICkgdGhpcy5zY2VuYXJpby5zb3VuZC5zdG9wKCk7XHJcbiAgICAgIHRoaXMuZ2FtZU92ZXJTb3VuZC5wbGF5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8qXHJcbiAgICBJdGVtcyBTdGF0ZVxyXG4gICAgLSBUaGlzIGFyZSBmdW5jdGlvbnMgdGhhdCBoYW5kbGVzIGl0ZW1zIHN0YXRlcyBiZXR3ZWVuIGNoYW5naW5nIG9mIHN0YWdlcy4gVGhpcyB3aWxsIG1ha2UgYW4gaXRlbSB0byBub3QgcmVzcGF3biBpZiBpdCB3YXMgY29sbGVjdGVkIGJlZm9yZVxyXG4gICovXHJcbiAgXHJcbiAgICBnZXRJdGVtc1N0YXRlKCkgeyByZXR1cm4gdGhpcy5pdGVtc1N0YXRlOyB9XHJcbiAgICBhZGRJdGVtU3RhdGUoIGl0ZW0gKSB7IFxyXG4gICAgICB0aGlzLml0ZW1zU3RhdGVbaXRlbS5uYW1lX2lkXSA9IGl0ZW07ICBcclxuICAgIH1cclxuXHJcbiAgICBzYXZlSXRlbXNTdGF0ZSgpIHtcclxuICAgICAgbGV0IGl0ZW1zU3RhdGUgPSBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXRJdGVtc1N0YXRlKCkgKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBpdGVtc1N0YXRlICk7XHJcbiAgICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuICBcclxuICAvLyBIZWxwZXJzIGZvciBjbGFzc2VzIHRvIGNoZWNrIGlmIGFuIG9iamVjdCBpcyBjb2xsaWRpbmcgXHJcbiAgY2hlY2tDb2xsaXNpb24oIG9iamVjdCApIHtcclxuICAgIGlmKCB0aGlzLmlzR2FtZVJlYWR5KCkgKVxyXG4gICAgICByZXR1cm4gdGhpcy5jb2xsaXNpb24uY2hlY2sob2JqZWN0KTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBSdW5cclxuICBydW4oKSB7XHJcblxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDYW52YXMnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICB0aGlzLmxvYWRpbmcoZmFsc2UpO1xyXG4gICAgdGhpcy5nYW1lT3ZlcihmYWxzZSk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGhlIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5kZWZhdWx0RXZlbnRMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICAvLyBTaG93cyBNZW51XHJcbiAgICB0aGlzLm1haW5NZW51KGZhbHNlKTtcclxuXHJcbiAgICAvLyBBdXRvIGxvYWQgYSBnYW1lIC0gZGVidWcgbW9kZVxyXG4gICAgaWYoIHdpbmRvdy5hdXRvbG9hZCApIHtcclxuICAgICAgdGhpcy5sb2FkR2FtZSgpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJjbGFzcyBSZW5kZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgcGxheWVyKSB7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDsgXHJcbiAgICB0aGlzLnNjZW5hcmlvID0gXCJcIjtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBcclxuICBnZXRBcnJheUl0ZW1zKCl7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgXHJcbiAgLy8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuICBhZGRJdGVtKG9iamVjdCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuICB9XHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcbiAgICBmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXsgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBzZXRTY2VuYXJpbyhzY2VuYXJpbyl7XHJcbiAgICB0aGlzLnNjZW5hcmlvID0gc2NlbmFyaW87XHJcbiAgfVxyXG4gICAgICAgICAgICBcclxuICAvLyBUaGlzIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZCBjb25zdGFudGx5IHRvIHJlbmRlciBpdGVtc1xyXG4gIHN0YXJ0KGRlbHRhVGltZSkge1x0XHRcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgLy8gQ2xlYXIgY2FudmFzIGJlZm9yZSByZW5kZXIgYWdhaW5cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIHRoaXMuY3R4LnNoYWRvd0JsdXIgPSAwO1xyXG5cclxuICAgIC8vIFNjZW5hcmlvXHJcbiAgICBpZiAoIHRoaXMuc2NlbmFyaW8gIT0gXCJcIikgXHJcbiAgICAgIHRoaXMuc2NlbmFyaW8ucmVuZGVyKHRoaXMuY3R4KTtcclxuICAgICAgXHJcbiAgICAvLyBSZW5kZXIgaXRlbXNcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5yZW5kZXJJdGVtcykge1xyXG4gICAgICAvLyBFeGVjdXRlIHRoZSByZW5kZXIgZnVuY3Rpb24gLSBJbmNsdWRlIHRoaXMgZnVuY3Rpb24gb24gZXZlcnkgY2xhc3NcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtc1tpXS5yZW5kZXIodGhpcy5jdHgsIGRlbHRhVGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbiAgICBcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXIiLCJjbGFzcyBTcHJpdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZSwgdywgaCwga1csIGtIKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBJbWFnZSBTcHJpdGVcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuXHJcbiAgICAgICAgLy8gU2l6ZSBvZiBpbWFnZSBzcHJpdGUgXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHc7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xyXG5cclxuICAgICAgICAvLyBTaXplIG9mIGVhY2ggZnJhbWUgc3F1YXJlIFxyXG4gICAgICAgIHRoaXMua2V5V2lkdGggPSBrVztcclxuICAgICAgICB0aGlzLmtleUhlaWdodCA9IGtIO1xyXG5cclxuICAgICAgICAvLyBSb3dzIGFuZCBDb2xsdW1ucyBxdWFudGl0eVxyXG4gICAgICAgIHRoaXMuY29scyA9IE1hdGguY2VpbCggdGhpcy53aWR0aCAvIHRoaXMua2V5V2lkdGggKTtcclxuICAgICAgICB0aGlzLnJvd3MgPSBNYXRoLmNlaWwoIHRoaXMuaGVpZ2h0IC8gdGhpcy5rZXlIZWlnaHQgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGZyYW1lc1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgR2V0c1xyXG4gICAgZ2V0U3ByaXRlKCkgICAgeyByZXR1cm4gdGhpcy5zcHJpdGU7IH1cclxuICAgIGdldEZyYW1lKG51bSkgIHsgcmV0dXJuIHRoaXMuZnJhbWVzW251bV07IH1cclxuICAgIGdldEtleVdpZHRoKCkgIHsgcmV0dXJuIHRoaXMua2V5V2lkdGg7ICAgIH1cclxuICAgIGdldEtleUhlaWdodCgpIHsgcmV0dXJuIHRoaXMua2V5SGVpZ2h0OyAgIH1cclxuICAgIGdldFNwcml0ZVByb3BzKG51bSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNsaXBfeDogdGhpcy5nZXRGcmFtZShudW0pLngsIGNsaXBfeTogdGhpcy5nZXRGcmFtZShudW0pLnksIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuZ2V0S2V5V2lkdGgoKSwgc3ByaXRlX2hlaWdodDogdGhpcy5nZXRLZXlIZWlnaHQoKSBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBSdW5cclxuICAgIHJ1bigpIHtcclxuICAgICAgICAvLyBHZW4gZWFjaCBmcmFtZSBiYXNlZCBvbiBzaXplcyBcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIGZvciggbGV0IHI9MDsgcjx0aGlzLnJvd3M7cisrICkge1xyXG4gICAgICAgICAgICBmb3IoIGxldCBjPTA7IGM8dGhpcy5jb2xzO2MrKyApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzW2luZGV4XSA9IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5rZXlXaWR0aCAqIGMsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5rZXlIZWlnaHQgKiByXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZTsiLCJjb25zdCBVSWl0ZW0gPSByZXF1aXJlKCcuL19VSWl0ZW0nKTtcclxuY29uc3QgRGlhbG9nID0gcmVxdWlyZSgnLi9fRGlhbG9nJyk7XHJcblxyXG5jbGFzcyBVSSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBsYXllcnMsIGdhbWVQcm9wcykge1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllcnMgPSBwbGF5ZXJzO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICAgIHRoaXMuZ2FtZVByb3BzID0gZ2FtZVByb3BzO1xyXG4gICAgdGhpcy5jaHVua1NpemUgPSB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG4gICAgICAgICAgICAgIFxyXG4gIC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcbiAgYWRkSXRlbShvYmplY3Qpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcbiAgfVxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7IFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgZ2V0UmVuZGVySXRlbXMoKXtcclxuICAgIHJldHVybiB0aGlzLnJlbmRlckl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgYXJyYXkgYW5kIHJlcnVuIGNvZGUgdG8gZ2V0IG5ldyBpdGVtc1xyXG4gIGdldE5ld1JlbmRlckl0ZW1zKCkge1xyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRSZW5kZXJJdGVtcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gTWF0aFxyXG4gIGZyb21SaWdodCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuICggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuSG9yaXpvbnRhbENodW5rcycpICogdGhpcy5jaHVua1NpemUgKSAtIHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcnVuKCkge1xyXG5cclxuICAgIC8vICMgUGxheWVyc1xyXG5cclxuICAgICAgLy8gIyBQbGF5ZXIgMDFcclxuICAgICAgICBpZiggdGhpcy5wbGF5ZXJzWzBdICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5jaHVua1NpemUsXHJcbiAgICAgICAgICAgIDUsIDUsIC8vIHgsIHksXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICAvLyBzcHJpdGVfdywgc3ByaXRlX2gsIFxyXG4gICAgICAgICAgICAwLCAwLCAgICAgIC8vIGNsaXBfeCwgY2xpcF95XHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSAvLyB3LCBoXHJcbiAgICAgICAgICApICk7XHJcblxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgbGV0IF8xeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8xbGlmZXMgPSB0aGlzLnBsYXllcnNbMF0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMWxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMXgsIF8xeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzF4ICs9IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMXggPSAxMjA7XHJcbiAgICAgICAgICAgICAgXzF5ID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gXHJcblxyXG4gICAgICAvLyAjIFBsYXllciAwMlxyXG4gICAgICAgIGlmKCB0aGlzLnBsYXllcnNbMV0gKSB7XHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgIHRoaXMuZnJvbVJpZ2h0KCAyMzAgKSwgNSwgXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICBcclxuICAgICAgICAgICAgNTAsIDAsICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSBcclxuICAgICAgICAgICkgKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzJ4ID0gdGhpcy5mcm9tUmlnaHQoIDUwICk7XHJcbiAgICAgICAgICBsZXQgXzJ5ID0gMTA7XHJcbiAgICAgICAgICBsZXQgXzJsaWZlcyA9IHRoaXMucGxheWVyc1sxXS5nZXRMaWZlcygpO1xyXG4gICAgICAgICAgZm9yKCBsZXQgaT0wOyBpPF8ybGlmZXM7aSsrICkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEl0ZW0oIG5ldyBVSWl0ZW0oXHJcbiAgICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpLFxyXG4gICAgICAgICAgICAgIF8yeCwgXzJ5LFxyXG4gICAgICAgICAgICAgIDUwLCA1MCwgICBcclxuICAgICAgICAgICAgICAxMDAsIDAsICAgICAgXHJcbiAgICAgICAgICAgICAgdGhpcy5jaHVua1NpemUvMywgdGhpcy5jaHVua1NpemUvMyBcclxuICAgICAgICAgICAgKSApO1xyXG4gICAgICAgICAgICBfMnggLT0gMzU7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PSAyICkge1xyXG4gICAgICAgICAgICAgIF8yeCA9IHRoaXMuZnJvbVJpZ2h0KCA1MCApO1xyXG4gICAgICAgICAgICAgIF8yeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIC8vICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAgXHJcblxyXG4gICAgLypcclxuICAgICAgICBEaWFsb2cgQm94XHJcbiAgICAqL1xyXG4gICAgICBcclxuICAgICAgbGV0IGRQcm9wcyA9IHtcclxuICAgICAgICB4OiB0aGlzLmNodW5rU2l6ZSAqIDEsXHJcbiAgICAgICAgeTogd2luZG93LmdhbWUuZ2FtZVByb3BzLmNhbnZhc0hlaWdodCAtICh0aGlzLmNodW5rU2l6ZSAqIDEpLFxyXG4gICAgICAgIHc6IHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5jYW52YXNXaWR0aCAtICh0aGlzLmNodW5rU2l6ZSAqIDIpLFxyXG4gICAgICAgIGg6IHRoaXMuY2h1bmtTaXplICogNCxcclxuICAgICAgICBkaWFsb2c6IHdpbmRvdy5nYW1lLmRpYWxvZ1t3aW5kb3cuZ2FtZS5kaWFsb2dJbmRleF1cclxuICAgICAgfVxyXG4gICAgICBkUHJvcHMueSA9IGRQcm9wcy55IC0gZFByb3BzLmg7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmFkZEl0ZW0oIFxyXG4gICAgICAgIG5ldyBEaWFsb2coIGRQcm9wcy54LCBkUHJvcHMueSwgZFByb3BzLncsIGRQcm9wcy5oLCBkUHJvcHMuZGlhbG9nICkgXHJcbiAgICAgICk7XHJcbiAgfVxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFVJIiwiY2xhc3MgX0RpYWxvZyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCB4LCB5LCB3LCBoLCBkaWFsb2cgKSB7XHJcbiAgICBcclxuICAgIHRoaXMuZGlhbG9nID0gZGlhbG9nO1xyXG4gICAgXHJcbiAgICB0aGlzLnRleHQgPSB7fTtcclxuXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuXHJcbiAgICB0aGlzLncgPSB3O1xyXG5cdFx0dGhpcy5oID0gaDtcclxuXHRcdFxyXG5cdFx0dGhpcy5jb3JuZXJSYWRpdXMgPSAyMDtcclxuXHJcblx0XHR0aGlzLmZpbGxDb2xvciA9IFwicmdiYSgyNTUsMjU1LDI1NSwwLjgpXCI7XHJcblx0XHR0aGlzLnN0cm9rZUNvbG9yID0gXCJyZ2JhKDAsMCwwLDAuOClcIjtcclxuXHRcdFxyXG5cdFx0dGhpcy5mb250ID0gXCIyOHB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgIHRoaXMuZm9udENvbG9yID0gXCJyZ2JhKDAsMCwwLDAuOClcIjtcclxuXHJcbiAgICB0aGlzLnRleHRZID0gdGhpcy55ICsgOTA7XHJcbiAgICB0aGlzLmFkanVzdFRleHQoIHRoaXMuZGlhbG9nLnRleHQsIDQ4ICk7XHJcblxyXG4gIH1cclxuICAgIFxyXG4gIC8vICMgU2V0cyAgICAgIFxyXG4gICAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICAgIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICAgICAgICBcclxuICAgIC8vICMgR2V0cyAgICAgICAgICAgIFxyXG4gICAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cclxuICAgIGFkanVzdFRleHQoIHN0ciwgbGVuZ2h0ICkge1xyXG4gICAgICB0aGlzLnRleHQgPSB0aGlzLnNwbGl0VGV4dChzdHIsIGxlbmdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3BsaXRUZXh0KHN0ciwgbCkgeyAvL3JlZjogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzYyNDcxMy9qcy1zcGxpdHRpbmctYS1sb25nLXN0cmluZy1pbnRvLXN0cmluZ3Mtd2l0aC1jaGFyLWxpbWl0LXdoaWxlLWF2b2lkaW5nLXNwbGl0dGluXHJcbiAgICAgIHZhciBzdHJzID0gW107XHJcbiAgICAgIHdoaWxlKHN0ci5sZW5ndGggPiBsKXtcclxuICAgICAgICAgIHZhciBwb3MgPSBzdHIuc3Vic3RyaW5nKDAsIGwpLmxhc3RJbmRleE9mKCcgJyk7XHJcbiAgICAgICAgICBwb3MgPSBwb3MgPD0gMCA/IGwgOiBwb3M7XHJcbiAgICAgICAgICBzdHJzLnB1c2goc3RyLnN1YnN0cmluZygwLCBwb3MpKTtcclxuICAgICAgICAgIHZhciBpID0gc3RyLmluZGV4T2YoJyAnLCBwb3MpKzE7XHJcbiAgICAgICAgICBpZihpIDwgcG9zIHx8IGkgPiBwb3MrbClcclxuICAgICAgICAgICAgICBpID0gcG9zO1xyXG4gICAgICAgICAgc3RyID0gc3RyLnN1YnN0cmluZyhpKTtcclxuICAgICAgfVxyXG4gICAgICBzdHJzLnB1c2goc3RyKTtcclxuICAgICAgcmV0dXJuIHN0cnM7XHJcbiAgfVxyXG5cclxuICAgIC8vICMgSXRlbSBSZW5kZXJcclxuICAgIHJlbmRlcihjdHgpIHtcclxuICAgICAgICAgIFxyXG4gICAgICBpZiAoIHRoaXMuZGlhbG9nLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBSb3VuZGVkIFJlY3RhbmdsZSAtIHJlZmVyZW5jZTogaHR0cDovL2pzZmlkZGxlLm5ldC9yb2JoYXdrZXMvZ0hDSnQvXHJcbiAgICBcclxuXHRcdCAgLy8gU2V0IGZhdXggcm91bmRlZCBjb3JuZXJzXHJcbiAgICAgIGN0eC5saW5lSm9pbiA9IFwicm91bmRcIjtcclxuICAgICAgY3R4LmxpbmVXaWR0aCA9IHRoaXMuY29ybmVyUmFkaXVzO1xyXG5cclxuXHRcdFx0Ly8gQ2hhbmdlIG9yaWdpbiBhbmQgZGltZW5zaW9ucyB0byBtYXRjaCB0cnVlIHNpemUgKGEgc3Ryb2tlIG1ha2VzIHRoZSBzaGFwZSBhIGJpdCBsYXJnZXIpXHJcblx0XHRcdFxyXG5cdFx0XHQvLyBTdHJva2VcclxuXHRcdFx0Y3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VDb2xvcjtcclxuXHRcdFx0Y3R4LnN0cm9rZVJlY3QodGhpcy54ICsgKCB0aGlzLmNvcm5lclJhZGl1cy8yKSwgdGhpcy55ICsgKHRoaXMuY29ybmVyUmFkaXVzLzIpLCB0aGlzLncgLSB0aGlzLmNvcm5lclJhZGl1cywgdGhpcy5oIC0gdGhpcy5jb3JuZXJSYWRpdXMgKTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIEZpbGxcclxuXHRcdFx0Y3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbENvbG9yO1xyXG4gICAgICBjdHguZmlsbFJlY3QodGhpcy54ICsgKCB0aGlzLmNvcm5lclJhZGl1cy8yKSwgdGhpcy55ICsgKHRoaXMuY29ybmVyUmFkaXVzLzIpLCB0aGlzLncgLSB0aGlzLmNvcm5lclJhZGl1cywgdGhpcy5oIC0gdGhpcy5jb3JuZXJSYWRpdXMgKTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIEZvbnRcclxuXHRcdFx0Y3R4LmZvbnQgPSB0aGlzLmZvbnQ7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmZvbnRDb2xvclxyXG4gICAgICB0aGlzLnRleHQubWFwKCAodGV4dCkgPT4ge1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy54ICsgNTAsIHRoaXMudGV4dFkpO1xyXG4gICAgICAgIHRoaXMudGV4dFkgPSB0aGlzLnRleHRZICsgNTA7XHJcbiAgICAgIH0gKTtcclxuXHRcdFx0XHJcbiAgICB9XHJcbiAgICAgICAgIFxyXG4gIH0vL2NsYXNzXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBfRGlhbG9nO1xyXG4gICAgIiwiY2xhc3MgVUlpdGVtIHtcclxuXHJcbiAgY29uc3RydWN0b3IoaXRlbVNwcml0ZUlELCBjaHVua1NpemUsIHgsIHksIHN3LCBzaCwgY3gsIGN5LCB3LCBoICkge1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuaXRlbVNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW1TcHJpdGVJRCk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7XHJcbiAgICAgIHNwcml0ZV93aWR0aDogc3csXHJcbiAgICAgIHNwcml0ZV9oZWlnaHQ6IHNoLFxyXG4gICAgICBjbGlwX3g6IGN4LFxyXG4gICAgICBjbGlwX3k6IGN5LFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG5cclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IHc7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gaDsgLy9weFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTZXRzICAgICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICBcclxuICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIC8vICMgR2V0cyAgICAgICAgICAgIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICAgIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgIFxyXG4gIC8vICMgSXRlbSBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICAgIFxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgdGhpcy5pdGVtU3ByaXRlLCAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV9oZWlnaHQsIFxyXG4gICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICApO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgIFxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSWl0ZW07XHJcbiIsIi8vIEdhbWUgUHJvcGVydGllcyBjbGFzcyB0byBkZWZpbmUgY29uZmlndXJhdGlvbnNcclxuY2xhc3MgZ2FtZVByb3BlcnRpZXMge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIFxyXG4gICAgLy8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICBcclxuICAgIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyA9IDE2O1xyXG4gICAgdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyA9IDE0O1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbnZhc1dpZHRoID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5Ib3Jpem9udGFsQ2h1bmtzKTtcclxuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyk7Ly8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5mcHMgPSAyNDtcclxuICB9XHJcblxyXG4gIGdldFByb3AocHJvcCkge1xyXG4gICAgcmV0dXJuIHRoaXNbcHJvcF07XHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWVQcm9wZXJ0aWVzO1xyXG5cclxuLy8gR2xvYmFsIHZhbHVlc1xyXG5cclxuICAvLyBEZWJ1Z1xyXG4gIHdpbmRvdy5kZWJ1ZyA9IGZhbHNlOyAvLyBTaG93IGRlYnVnIHNxdWFyZXNcclxuICB3aW5kb3cuZGVidWdDb2xsaXNpb24gPSBmYWxzZTsgLy8gU2hvdyB3aGVuIG9iamVjdHMgY29sbGlkZVxyXG4gIHdpbmRvdy5hdXRvbG9hZCA9IHRydWU7IC8vIGF1dG8gbG9hZCBhIHNhdmVkIGdhbWVcclxuICB3aW5kb3cuZ29kX21vZGUgPSBmYWxzZTsgLy8gUGxheWVycyB3b24ndCBkaWUiLCJjb25zdCBHYW1lID0gcmVxdWlyZSgnLi9lbmdpbmUvY29yZS9HYW1lJyk7XHJcbmNvbnNvbGUuY2xlYXIoKTtcclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gIFxyXG4gIC8vICMgVHJpZ2dlcnMgbmV3IGdhbWUgb25seSB3aGVuIGNsaWNrIG9uIGJ1dHRvbiAtIG5lZWRlZCBzb21lIGludGVyYWN0aW9uIHRvIGFjdGl2YXRlIHRoZSBzb3VuZFxyXG4gIGxldCBzdGFydEdhbWVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQtZ2FtZS1idXR0b24nKTtcclxuICBzdGFydEdhbWVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgIHJ1bkdhbWUoKTtcclxuICB9LCBmYWxzZSk7XHJcblxyXG4gIC8vIERlYnVnXHJcbiAgaWYoIHdpbmRvdy5hdXRvbG9hZCApIHtcclxuICAgIHJ1bkdhbWUoKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhcnQgdGhlIGdhbWVcclxuICBmdW5jdGlvbiBydW5HYW1lKCkge1xyXG4gICAgXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmlyc3Qtc2NyZWVuJykuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuICAgIGxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lID0gZ2FtZTtcclxuICAgIGdhbWUucnVuKCk7XHJcblxyXG4gIH1cclxuIFxyXG59Il19
