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

},{"../engine/core/Sprite":46}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"../engine/core/Sprite":46,"dup":1}],3:[function(require,module,exports){
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
},{"../../../engine/assets/_Scenario":41,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Teleport":33}],5:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Fire":28,"../../common/Teleport":33}],6:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Teleport":33}],7:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Teleport":33}],8:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Teleport":33}],9:[function(require,module,exports){
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
         "id":268,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"enemy"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"blue"
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
         "id":1231,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_gray_tl"
                }]
        }, 
        {
         "id":1232,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_gray_tr"
                }]
        }, 
        {
         "id":1233,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_purple_tl"
                }]
        }, 
        {
         "id":1234,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_purple_tr"
                }]
        }, 
        {
         "id":1235,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_red_tl"
                }]
        }, 
        {
         "id":1236,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_red_tr"
                }]
        }, 
        {
         "id":1237,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_green_tl"
                }]
        }, 
        {
         "id":1238,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_green_tr"
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
         "id":1292,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_gray_bl"
                }]
        }, 
        {
         "id":1293,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_gray_br"
                }]
        }, 
        {
         "id":1294,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_purple_bl"
                }]
        }, 
        {
         "id":1295,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_purple_br"
                }]
        }, 
        {
         "id":1296,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_red_bl"
                }]
        }, 
        {
         "id":1297,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_red_br"
                }]
        }, 
        {
         "id":1298,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_green_bl"
                }]
        }, 
        {
         "id":1299,
         "properties":[
                {
                 "name":"class",
                 "type":"string",
                 "value":"door"
                }, 
                {
                 "name":"type",
                 "type":"string",
                 "value":"door_green_br"
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

const jsonStageDoors = require('./stages/doors.json');
const jsonStageDoorsAssets = require('./stages/doors-assets.json');

const jsonStageEnemy = require('./stages/enemy.json');
const jsonStageEnemyssets = require('./stages/enemy-assets.json');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, saveData){
    let soundSrc = "./sounds/sandbox-background.mp3";
    super(ctx, canvas, "sandbox", soundSrc);
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;

    if( !saveData ) {
      let dialog = [
        {
					"hideSprite": false,
					"text": "Welcome to Gufitrupi! This is a sandbox Scenario where you can test all the features of this game. [PRESS SPACE TO CONTINUE]"
				},
        {
					"hideSprite": false,
					"text": "Press the GRAB/DROP button to pick up an object. With the object on your hands, press the USE button again to drop it or press the USE/THROW button to throw it."
				},
        {
					"hideSprite": false,
					"text": "You can also press the USE button in front of a board to read it."
				},
        { "hideSprite": true, "text": "" },
      ];
      window.game.setDialog(dialog); 
    }

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
      case 'doors':
        _stage = new _Stage( stage_id, jsonStageDoors, jsonStageDoorsAssets, jsonScenarioTileSet );
        break;
      case 'enemy':
        _stage = new _Stage( stage_id, jsonStageEnemy, jsonStageEnemyssets, jsonScenarioTileSet );
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
},{"../../../engine/assets/_Scenario":41,"../../../engine/assets/_Stage":42,"./sandbox-tileset.json":9,"./stages/center-assets.json":11,"./stages/center.json":12,"./stages/doors-assets.json":13,"./stages/doors.json":14,"./stages/enemy-assets.json":15,"./stages/enemy.json":16,"./stages/life-assets.json":17,"./stages/life.json":18}],11:[function(require,module,exports){
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
			"xIndex": 15,
			"yIndex": 6,
			"props": {  
				"target": {
					"stage": "enemy",
					"x": 1,
					"y": 5
				}
			}
		},
		{
			"xIndex": 0,
			"yIndex": 6,
			"props": {  
				"target": {
					"stage": "doors",
					"x": 14,
					"y": 5
				}
			}
		}
	],
	"dialogs":[ 
		{
			"x": 6,
			"y": 9,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Try grabbing the key and then using it on the door to unlock it."
				},
				{ "hideSprite": true, "text": "" }
			]
		},
		{
			"x": 4,
			"y": 4,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Go explore the scenario."
				},
				{ "hideSprite": true, "text": "" }
			]
		}
	]
}
},{}],12:[function(require,module,exports){
module.exports={ "height":14,
 "infinite":false,
 "layers":[
        {
         "data":[624, 624, 624, 624, 624, 17, 199, 246, 135, 624, 78, 138, 246, 735, 246, 137, 624, 17, 73, 18, 624, 136, 246, 735, 198, 18, 624, 78, 138, 246, 137, 79, 624, 136, 246, 198, 18, 78, 138, 246, 246, 198, 18, 624, 78, 12, 79, 624, 624, 136, 735, 246, 198, 18, 136, 246, 246, 246, 198, 73, 73, 18, 624, 624, 17, 199, 246, 246, 246, 198, 199, 246, 246, 246, 246, 246, 246, 198, 18, 624, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 198, 73, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 246, 246, 138, 246, 735, 246, 246, 246, 246, 137, 12, 138, 246, 246, 246, 246, 137, 12, 78, 138, 246, 246, 246, 246, 246, 198, 18, 78, 138, 246, 246, 137, 79, 624, 624, 78, 138, 246, 246, 246, 246, 246, 198, 73, 199, 246, 246, 198, 18, 624, 624, 624, 78, 138, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 135, 624, 624, 624, 624, 136, 246, 246, 246, 246, 246, 246, 246, 246, 735, 137, 79, 624, 624, 17, 18, 78, 138, 246, 246, 137, 12, 138, 246, 246, 137, 79, 624, 624, 73, 199, 198, 18, 78, 12, 12, 79, 624, 78, 12, 12, 79, 624, 624, 624],
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
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1780, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 147, 148, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1238, 1239, 0, 0, 0, 0, 1709, 1709, 0, 0, 0, 0, 0, 0, 0, 1292, 1299, 1300, 1292, 0, 0, 0, 0, 1292, 1292, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 1780, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1772, 1772, 1772, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1779, 1772, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
         "id":9,
         "name":"saved-items",
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
 "nextlayerid":10,
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
			"xIndex": 15,
			"yIndex": 6,
			"props": {  
				"target": {
					"stage": "center",
					"x": 1,
					"y": 5
				}
			}
		}
	],
	"dialogs":[ 
		{
			"x": 11,
			"y": 11,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Stand in front of a star block and pres the USE/THROW button to push the block."
				},
				{ "hideSprite": true, "text": "" }
			]
		},
		{
			"x": 9,
			"y": 1,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Congratulations, you did it!"
				},
				{
					"hideSprite": false,
					"text": "That's it for today, stay in touch for updates and thanks for playing this demo."
				},
				{ "hideSprite": true, "text": "" }
			]
		}
	]
}
},{}],14:[function(require,module,exports){
module.exports={ "height":14,
 "infinite":false,
 "layers":[
        {
         "data":[246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 135, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 246, 246, 735, 735, 246, 246, 246, 246, 246, 246, 246, 246, 137, 12, 12, 79, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 137, 79, 17, 73, 73, 138, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 135, 17, 199, 246, 246, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 735, 246, 137, 136, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 135, 136, 246, 246, 135, 136, 246, 246, 246, 735, 246, 246, 246, 246, 137, 12, 79, 136, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 135, 17, 73, 199, 246, 246, 135, 136, 735, 246, 246, 246, 246, 246, 246, 246, 198, 199, 735, 246, 246, 137, 79, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 624, 78, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 79, 17],
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
         "data":[1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 0, 1292, 1777, 0, 0, 0, 1772, 1772, 1292, 0, 1780, 0, 0, 0, 0, 1292, 0, 1292, 86, 87, 0, 0, 1772, 1772, 1292, 0, 0, 0, 1234, 1235, 0, 1292, 0, 1292, 147, 148, 0, 0, 1292, 1292, 1292, 1292, 1292, 1292, 1295, 1296, 1292, 1292, 0, 1292, 0, 0, 0, 0, 1292, 1236, 1237, 0, 1772, 0, 0, 0, 0, 0, 0, 1292, 1292, 0, 0, 1292, 1292, 1297, 1298, 1292, 1292, 1292, 0, 0, 0, 0, 0, 0, 1292, 1232, 1233, 1292, 1709, 0, 0, 1709, 0, 1292, 0, 0, 0, 0, 0, 0, 1292, 1293, 1294, 1292, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 1292, 1292, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 1292, 0, 0, 1780, 0, 0, 0, 0, 0, 1772, 0, 0, 0, 0, 0, 0, 1774, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
         "id":7,
         "name":"saved-items",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 26, 25, 26, 25, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":5,
         "name":"objects",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 269, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":6,
         "name":"enemy",
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
                 "value":"2"
                }, 
                {
                 "name":"player_1_y",
                 "type":"string",
                 "value":"11"
                }, 
                {
                 "name":"player_2_x",
                 "type":"string",
                 "value":"3"
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
        }],
 "nextlayerid":8,
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
module.exports={
	"teleports": [
		{
			"xIndex": 0,
			"yIndex": 6,
			"props": {  
				"target": {
					"stage": "center",
					"x": 14,
					"y": 5
				}
			}
		}
	],
	"dialogs":[ 
		{
			"x": 2,
			"y": 5,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Try throwing barrels at the enemys to kill them."
				},
				{ "hideSprite": true, "text": "" }
			]
		}
	]
}
},{}],16:[function(require,module,exports){
module.exports={ "height":14,
 "infinite":false,
 "layers":[
        {
         "data":[624, 624, 624, 624, 624, 17, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 624, 17, 73, 73, 73, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 624, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 624, 136, 735, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 137, 17, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 246, 135, 246, 246, 246, 246, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 137, 79, 138, 246, 735, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 624, 78, 138, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 624, 624, 78, 138, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 624, 624, 624, 78, 138, 246, 246, 246, 246, 735, 246, 246, 246, 246, 246, 135, 624, 624, 624, 624, 136, 246, 246, 246, 246, 246, 246, 246, 246, 735, 137, 79, 624, 624, 624, 624, 78, 138, 246, 246, 246, 246, 246, 246, 246, 137, 79, 624, 624, 624, 624, 624, 624, 78, 12, 12, 12, 12, 12, 12, 12, 79, 624, 624, 624],
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
         "data":[0, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 0, 0, 0, 0, 0, 0, 1772, 1292, 0, 0, 0, 0, 0, 0, 1776, 1292, 0, 0, 0, 1772, 1772, 1772, 1772, 1292, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 1772, 1772, 1772, 1772, 1292, 1292, 1292, 1772, 1772, 1292, 1292, 1292, 0, 0, 0, 0, 0, 1772, 1772, 1772, 1292, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 1780, 0, 0, 1772, 1772, 1292, 0, 0, 0, 0, 0, 1292, 1292, 0, 0, 0, 0, 0, 0, 0, 1772, 1292, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 1292, 1772, 1772, 1292, 1292, 1292, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 1772, 1772, 1292, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
         "id":10,
         "name":"saved-items",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 269, 0, 269, 0, 269, 0, 269, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 269, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 269, 0, 0, 269, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 269, 0, 0, 269, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":14,
         "id":9,
         "name":"enemy",
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
                 "value":"2"
                }, 
                {
                 "name":"player_1_y",
                 "type":"string",
                 "value":"5"
                }, 
                {
                 "name":"player_2_x",
                 "type":"string",
                 "value":"3"
                }, 
                {
                 "name":"player_2_y",
                 "type":"string",
                 "value":"5"
                }],
         "type":"tilelayer",
         "visible":true,
         "width":16,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 26, 25, 26, 25, 26, 0, 0, 25, 26, 0, 0, 0, 0, 25, 26, 86, 87, 86],
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
 "nextlayerid":11,
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
},{}],17:[function(require,module,exports){
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
	"dialogs":[ 
		{
			"x": 8,
			"y": 11,
			"dialog": [
				{
					"hideSprite": false,
					"text": "Fruits cand recover your life. Some fruits you can only pick up once."
				},
				{ "hideSprite": true, "text": "" }
			]
		}
	]
}
},{}],18:[function(require,module,exports){
module.exports={ "height":14,
 "infinite":false,
 "layers":[
        {
         "data":[624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 624, 17, 73, 73, 73, 73, 18, 624, 624, 624, 624, 624, 624, 624, 624, 624, 17, 199, 246, 246, 246, 246, 198, 18, 624, 624, 624, 17, 73, 73, 73, 73, 199, 246, 246, 246, 246, 246, 246, 198, 18, 624, 17, 199, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 198, 18, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 136, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 135, 78, 138, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 246, 137, 79, 624, 78, 12, 138, 246, 246, 246, 246, 246, 246, 246, 246, 246, 137, 79, 17, 624, 624, 624, 78, 138, 246, 246, 246, 246, 246, 137, 12, 12, 79, 17, 199, 624, 624, 624, 624, 78, 138, 246, 246, 246, 137, 79, 17, 73, 73, 199, 246, 624, 624, 624, 624, 624, 78, 138, 246, 137, 79, 17, 199, 246, 246, 246, 246],
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
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 1770, 1770, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1709, 0, 0, 0, 0, 0, 0, 1771, 0, 0, 1709, 1292, 1292, 1292, 1292, 0, 1709, 0, 0, 0, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 1709, 1292, 1292, 1292, 1292, 1292, 1292, 1292, 0, 0, 0, 0, 0, 0, 1771, 0, 1709, 0, 1292, 0, 0, 0, 0, 0, 1709, 0, 0, 0, 0, 0, 0, 0, 1709, 1778, 1292, 0, 0, 0, 0, 1770, 0, 1709, 0, 0, 0, 0, 0, 0, 1292, 1292, 1292, 1709, 1292, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1780, 1292, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
         "id":5,
         "name":"saved-items",
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
 "nextlayerid":6,
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
},{}],19:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Dialog":25,"../../common/Fire":28,"../../common/Teleport":33}],20:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Dialog":25,"../../common/Door":26,"../../common/Key":30,"../../common/Object_Push":31,"../../common/Object_Throw":32,"../../common/Teleport":33}],21:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Enemy":27,"../../common/Fire":28,"../../common/Heal":29,"../../common/Key":30,"../../common/Object_Push":31,"../../common/Object_Throw":32,"../../common/Teleport":33}],22:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":42,"../../common/Beach_Floor":23,"../../common/Beach_Wall":24,"../../common/Fire":28,"../../common/Heal":29,"../../common/Teleport":33}],23:[function(require,module,exports){
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
},{"../../../engine/assets/_Collidable":39,"../../../engine/core/Sprite":46}],24:[function(require,module,exports){
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
},{"../../../engine/assets/_Collidable":39,"../../../engine/core/Sprite":46}],25:[function(require,module,exports){
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
},{"../../../engine/assets/_Dialog":40,"../../../engine/core/Sprite":46}],26:[function(require,module,exports){
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
},{"../../../engine/assets/_CanCollect":36,"../../../engine/core/Sprite":46}],27:[function(require,module,exports){
const _CanHurt = require('../../../engine/assets/_CanHurt');
const Sprite = require('../../../engine/core/Sprite');

class Enemy extends _CanHurt {

  constructor(type, x0, y0, stage) {
    
    let props = {
      name: "enemy",
      type: type,
      stage: stage
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
      case 'blue':
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
      this.setStopOnCollision(false);
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

    // What to do every frame in terms of render? Draw the enemy
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

    // Check if enemy is in the same stage as original stage, if not, don't
    if( this.originalStage != window.game.getCurrentStage() ) {
      return false;
    }

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
    if( obj.type == "player" ) {
      obj.hurtPlayer(this.hurtAmount); // hurt player
    }
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
},{"../../../engine/assets/_CanHurt":37,"../../../engine/core/Sprite":46}],28:[function(require,module,exports){
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
},{"../../../engine/assets/_CanHurt":37,"../../../engine/core/Sprite":46}],29:[function(require,module,exports){
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
},{"../../../engine/assets/_CanCollect":36,"../../../engine/core/Sprite":46}],30:[function(require,module,exports){
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
},{"../../../engine/assets/_CanThrow":38,"../../../engine/core/Sprite":46}],31:[function(require,module,exports){
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
},{"../../../engine/assets/_CanBePushed":35,"../../../engine/core/Sprite":46}],32:[function(require,module,exports){
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
},{"../../../engine/assets/_CanThrow":38,"../../../engine/core/Sprite":46}],33:[function(require,module,exports){
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
},{"../../../engine/assets/_Collidable":39,"../../../engine/core/Sprite":46}],34:[function(require,module,exports){
/**
 *  Store Assets that needs to be on any stage, like keys or items that player grabs
 * 
 *  Declare all of this assets here
 */

const Key = require('../../assets/scenario/common/Key');
const Object_Throw = require('../../assets/scenario/common/Object_Throw');
const Object_Push = require('../../assets/scenario/common/Object_Push');
const Beach_Wall = require('../../assets/scenario/common/Beach_Wall');
const Beach_Floor = require('../../assets/scenario/common/Beach_Floor');
const Fire = require('../../assets/scenario/common/Fire');
const Heal = require('../../assets/scenario/common/Heal');
const Teleport = require('../../assets/scenario/common/Teleport');
const Door = require('../../assets/scenario/common/Door');
const Enemy = require('../../assets/scenario/common/Enemy');
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
      case "door":
        return new Door( props.code, props.x0, props.y0, props.stageID );
        break;
      case "teleport":
        return new Teleport(props.xIndex, props.yIndex, props.props );
        break;
      case "dialog":
        return new Dialog(props.x, props.y, props.dialog );
        break;
      case "enemy":
        return new Enemy(props.code, props.x0, props.y0, props.stage);
        break;
    }
    return r;
  }

}//class
module.exports = GlobalAssets;
},{"../../assets/scenario/common/Beach_Floor":23,"../../assets/scenario/common/Beach_Wall":24,"../../assets/scenario/common/Door":26,"../../assets/scenario/common/Enemy":27,"../../assets/scenario/common/Fire":28,"../../assets/scenario/common/Heal":29,"../../assets/scenario/common/Key":30,"../../assets/scenario/common/Object_Push":31,"../../assets/scenario/common/Object_Throw":32,"../../assets/scenario/common/Teleport":33,"./_Dialog":40}],35:[function(require,module,exports){
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
},{"./_Collidable":39}],36:[function(require,module,exports){
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
},{"./_Collidable":39}],37:[function(require,module,exports){
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
},{"./_Collidable":39}],38:[function(require,module,exports){
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
    this.destroySprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);
    this.destroyFrameCount = 1;
    this.destroyMaxFrameCount = 8;
    this.destroyInitFrame = 1739;

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
      if( obj.type == "player" && this.throwAction != "drop" ) {
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
},{"../core/Sprite":46,"./_Collidable":39}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
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
},{"../core/Sprite":46,"./_Collidable":39}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
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
      
      // Check if it's the save state layer
      if( layer.name == "saved-items") {
        this.stageMap.push({'code': 'saved-items'});
      }
      
      let index = 0;
      // Map each item inside layer
      layer.data.map( (obj) => {
        if( obj != 0 ) { // avoid empty objects
          obj = parseInt(obj - 1); // Adjust Tiled ID: they add +1 to IDs to allow 0 as a empty tile // #https://discourse.mapeditor.org/t/wrong-ids-in-tileset/1425
          let tileset = this.jsonTileSet.tiles.find( x => x.id === obj ); // Get the index of corresponding id  
          //console.log(this.coordinates[index].x, this.coordinates[index].y, tileset.properties.find( x => x.name === 'type' ).value);        
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

  loadSavedStateItems() {
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
          
          if( this.getStageId() != item.dropProps.droppedStage ) {
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

        case 'saved-items':
          this.loadSavedStateItems();
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
},{}],43:[function(require,module,exports){
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
	
},{}],44:[function(require,module,exports){
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
},{"../../assets/Player":1,"../../assets/scenario/Prototype/scenarioPrototype":3,"../../assets/scenario/Sandbox/scenarioSandbox":10,"../../gameProperties":50,"../assets/GlobalAssets":34,"../ui/UI":47,"./Collision":43,"./Render":45}],45:[function(require,module,exports){
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
},{}],46:[function(require,module,exports){
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
},{}],47:[function(require,module,exports){
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
},{"./_Dialog":48,"./_UIitem":49}],48:[function(require,module,exports){
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
    
},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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
  window.autoload = false; // auto load a saved game
  window.god_mode = false; // Players won't die
},{}],51:[function(require,module,exports){
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
},{"./engine/core/Game":44}]},{},[2,3,4,5,6,7,8,10,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,50,51])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zYW5kYm94LXRpbGVzZXQuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL2NlbnRlci1hc3NldHMuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvY2VudGVyLmpzb24iLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL2Rvb3JzLWFzc2V0cy5qc29uIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9kb29ycy5qc29uIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9lbmVteS1hc3NldHMuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvZW5lbXkuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvbGlmZS1hc3NldHMuanNvbiIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvbGlmZS5qc29uIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2Rvb3JzLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9zdGFnZV9lbmVteS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfbGlmZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX0Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfV2FsbC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0RpYWxvZy5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0Rvb3IuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9FbmVteS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0ZpcmUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9IZWFsLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vS2V5LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vT2JqZWN0X1B1c2guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfVGhyb3cuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9UZWxlcG9ydC5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL0dsb2JhbEFzc2V0cy5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19DYW5CZVB1c2hlZC5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19DYW5Db2xsZWN0LmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0Nhbkh1cnQuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ2FuVGhyb3cuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ29sbGlkYWJsZS5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19EaWFsb2cuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8uanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fU3RhZ2UuanMiLCJjbGllbnQvZW5naW5lL2NvcmUvQ29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL0dhbWUuanMiLCJjbGllbnQvZW5naW5lL2NvcmUvUmVuZGVyLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL1Nwcml0ZS5qcyIsImNsaWVudC9lbmdpbmUvdWkvVUkuanMiLCJjbGllbnQvZW5naW5lL3VpL19EaWFsb2cuanMiLCJjbGllbnQvZW5naW5lL3VpL19VSWl0ZW0uanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiLCJjbGllbnQvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9qQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbm9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIFBsYXllciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGdhbWVQcm9wcywgcGxheWVyTnVtYmVyLCBwbGF5ZXJQcm9wcykge1xyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgICAgaWYoIHBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfb25lJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoIHBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfdHdvJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFNwcml0ZSggdGhpcy5wbGF5ZXJTcHJpdGUsIDMwMCwgOTYwLCAyMCwgNDApO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHt9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwID0gW107XHJcbiAgICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgICB0aGlzLmluaXRpYWxTdGVwID0gMjtcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICB0aGlzLm1heFN0ZXBzID0gODtcclxuXHJcbiAgICAgIC8vIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIEFuaW1hdGlvblxyXG4gICAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDEyOyAvLyAxMDAwIC8gRlBTXHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgIHRoaXMuY2h1bmtTaXplID0gZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICAgIHRoaXMueCA9IDA7XHJcbiAgICAgIHRoaXMueSA9IDA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLngwID0gMDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICB0aGlzLnkwID0gMDtcclxuICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmNodW5rU2l6ZTsgLy9weFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2h1bmtTaXplICogMjsgLy9weFxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcGVlZDAgPSAwLjE3O1xyXG4gICAgICB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnNwZWVkMDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMubmFtZSA9IFwicGxheWVyX1wiICsgcGxheWVyTnVtYmVyO1xyXG4gICAgICB0aGlzLnBsYXllck51bWJlciA9IHBsYXllck51bWJlcjtcclxuICAgICAgdGhpcy50eXBlID0gXCJwbGF5ZXJcIjtcclxuXHJcbiAgICAgIHRoaXMuZ3JhYmluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLndhbGtpbmcgPSBmYWxzZTtcclxuICAgICAgXHJcbiAgICAvLyAjIEV2ZW50cyAgXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmlzQ29sbGlkYWJsZSA9IHRydWU7XHJcbiAgICAgIHRoaXMuaXNNb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSB0cnVlO1xyXG4gICAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICBcclxuICAgICAgLy8gIyBDb2xsaXNpb25cclxuICAgICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGggKiAwLjg7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiAwLjM7XHJcbiAgICAgIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgPSB0aGlzLndpZHRoICogMC4xOyAvLyBVc2VkIHRvIHNldCBjb2xsaXNpb24gWCB3aGVuIHNldHRpbmcgWCBcclxuICAgICAgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSA9IHRoaXMuaGVpZ2h0ICogMC43OyBcclxuICAgICAgdGhpcy5jb2xsaXNpb25YID0gMDsvL3RoaXMueDAgKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkgPSAwOy8vdGhpcy55MCArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGE7XHJcblxyXG4gICAgICB0aGlzLmNvbGxpc2lvblgwID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkwID0gdGhpcy5jb2xsaXNpb25ZO1xyXG5cclxuICAgICAgLy8gR3JhYi9QaWNrIEl0ZW1zIENvbGxpc2lvbiBCb3hcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSAwO1xyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSAwO1xyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gMDtcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IDA7XHJcblxyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBudWxsO1xyXG5cclxuICAgICAgLy8gIyBMaWZlXHJcbiAgICAgIHRoaXMuZGVmYXVsdExpZmVzID0gNjtcclxuICAgICAgdGhpcy5saWZlcyA9IHRoaXMuZGVmYXVsdExpZmVzO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICB0aGlzLmh1cnRDb29sRG93blRpbWUgPSAyMDAwOyAvLzJzXHJcblxyXG4gICAgICAvLyBQbGF5ZXIgUHJvcHMgaWYgaGFzXHJcbiAgICAgIGlmKCBwbGF5ZXJQcm9wcyApIHtcclxuICAgICAgICB0aGlzLmxpZmVzID0gcGxheWVyUHJvcHMubGlmZXM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMud2Fsa1NvdW5kID0gZmFsc2U7XHJcbiAgICAgIHRoaXMudXNlU291bmQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5odXJ0U291bmQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5ncmFiU291bmQgPSBmYWxzZTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAgIyBTb3VuZHNcclxuICAqL1xyXG4gICAgaW5pdFNvdW5kcygpIHtcclxuICAgICAgLy8gV2Fsa1xyXG4gICAgICB0aGlzLndhbGtTb3VuZCA9IG5ldyBIb3dsKHsgc3JjOiBbJy4vc291bmRzL3BsYXllci93YWxrLm1wMyddLCBsb29wOiB0cnVlLCB2b2x1bWU6IDAuNiB9KTtcclxuICAgICAgLy8gVXNlXHJcbiAgICAgIHRoaXMudXNlU291bmQgPSBuZXcgSG93bCh7IHNyYzogWycuL3NvdW5kcy9wbGF5ZXIvdXNlLm1wMyddIH0pO1xyXG4gICAgICAvLyBIdXJ0XHJcbiAgICAgIHRoaXMuaHVydFNvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvcGxheWVyL2h1cnQubXAzJ10sIHZvbHVtZTogMC41IH0pO1xyXG4gICAgICAvLyBHcmFiXHJcbiAgICAgIHRoaXMuZ3JhYlNvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvcGxheWVyL2dyYWIubXAzJ10gfSk7XHJcbiAgICB9XHJcblxyXG4gIC8qIFxyXG4gICAgICBHcmFiL1BpY2sgSXRlbXMgQ29sbGlzaW9uIEJveFxyXG4gICovXHJcblxyXG4gICAgY2hlY2tHcmFiYmluZ09iamVjdHMoKSB7XHJcbiAgICAgIGxldCBoYXNHcmFiT2JqZWN0ID0gZmFsc2U7XHJcbiAgICAgIC8vIENoZWNrIGlmIHBsYXllciBoYXMgZ3JhYmJlZCBpdGVtc1xyXG4gICAgICBsZXQgcmVuZGVyZWRJdGVtcyA9IHdpbmRvdy5nYW1lLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCk7XHJcbiAgICAgIGZvciggbGV0IGkgaW4gcmVuZGVyZWRJdGVtcyApIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHJlbmRlcmVkSXRlbXNbaV07XHJcbiAgICAgICAgaWYoIGl0ZW0uZ3JhYmJlZCAmJiBpdGVtLnBsYXllcldob0dyYWJiZWQgPT0gdGhpcy5wbGF5ZXJOdW1iZXIgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gaXRlbTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgb2JqLmdyYWJIYW5kbGVyKHRoaXMucGxheWVyTnVtYmVyKTtcclxuICAgICAgICAgIHRoaXMuZ3JhYk9iamVjdCggb2JqICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICBoYXNHcmFiT2JqZWN0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYoICEgaGFzR3JhYk9iamVjdCApIHtcclxuICAgICAgICB0aGlzLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY2hlY2tJdGVtT25HcmFiQ29sbGlzaW9uQm94KCkge1xyXG4gICAgICByZXR1cm4gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpc0dyYWJpbmcoKSB7IHJldHVybiB0aGlzLmdyYWJpbmc7IH1cclxuICAgIHNldE5vdEdyYWJiaW5nKCl7XHJcbiAgICAgIHRoaXMucmVtb3ZlR3JhYmVkT2JqZWN0KCk7XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVHcmFiZWRPYmplY3QoKSB7IFxyXG4gICAgICB0aGlzLmdyYWJpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cmlnZ2VyR3JhYigpe1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgaWYgaGFzIGEgXCJfQ2FuR3JhYlwiIGl0ZW0gY29sbGlkaW5nIHdpdGggZ3JhYiBoaXQgYm94IGFuZCBcInBpY2tcIiBpdGVtXHJcbiAgICAgIGlmKCAhIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgICBpZiggb2JqZWN0ICYmIG9iamVjdC5jYW5HcmFiICkge1xyXG4gICAgICAgICAgaWYoIG9iamVjdC5pc0dyYWJiZWQoKSApIHJldHVybjsgLy8gYXZvaWQgcGxheWVycyBncmFiYmluZyB0aGUgc2FtZSBvYmplY3RcclxuICAgICAgICAgIG9iamVjdC5ncmFiSGFuZGxlcih0aGlzLnBsYXllck51bWJlcik7XHJcbiAgICAgICAgICB0aGlzLmdyYWJPYmplY3QoIG9iamVjdCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdyYWJTb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiggdGhpcy5vYmplY3RHcmFiYmVkICkge1xyXG4gICAgICAgICAgLy8gRHJvcCBpZiBoYXMgbm90aGluZyBvIHBsYXllciBncmFiIGNvbGxpc2lvbiBib3hcclxuICAgICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrQWxsKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgICBpZiggIW9iamVjdCApIHtcclxuICAgICAgICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLmRyb3AoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uLCB0aGlzLmdldEhlaWdodCgpICk7IC8vIFRocm93IGF3YXkgb2JqZWN0XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IGZhbHNlOyAvLyByZW1vdmUgZ3JhYmJlZFxyXG4gICAgICAgICAgICB0aGlzLmdyYWJpbmcgPSAhdGhpcy5ncmFiaW5nO1xyXG4gICAgICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmdyYWJTb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgICB0aGlzLmdyYWJpbmcgPSAhdGhpcy5ncmFiaW5nO1xyXG4gICAgICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlIGl0ZW1zXHJcbiAgICB0cmlnZ2VyVXNlKCkge1xyXG4gICAgICAvLyBJZiBoYXMgb2JqZWN0IGluIGhhbmQsIHVzZSBpdFxyXG4gICAgICBpZiggdGhpcy5vYmplY3RHcmFiYmVkICkge1xyXG4gICAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51c2UoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uLCB0aGlzLmdldEhlaWdodCgpLCB0aGlzICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgbm90LCB0cnkgdG8gdXNlIHRoZSBvbmUgb24gZnJvbnRcclxuICAgICAgICBsZXQgb2JqZWN0ID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgICAgIGlmKCBvYmplY3QgJiYgb2JqZWN0LmNhblVzZSApIHtcclxuICAgICAgICAgIG9iamVjdC51c2VIYW5kbGVyKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnVzZVNvdW5kLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgICBnZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uWTsgfVxyXG5cclxuICAgIC8vIEF0dGFjaCBhbiBpdGVtIHRvIHBsYXllclxyXG4gICAgZ3JhYk9iamVjdCggb2JqZWN0ICkge1xyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBvYmplY3Q7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYmJlZE9iamVjdFBvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IEdyYWJDb2xsaXNpb24gWCBhbmQgWSBjb25zaWRlcmluZyBwbGF5ZXIgbG9vayBkaXJlY3Rpb25cclxuICAgIHVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpIHtcclxuICAgICAgc3dpdGNoKHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSArIHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgICd1cCc6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSAtIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWCAtIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblggKyB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBoYXMgc29tZSBvYmplY3QgZ3JhYmJlZCwgdXBkYXRlIHBvc2l0aW9uXHJcbiAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVHcmFiYmVkT2JqZWN0UG9zaXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpIHtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpICk7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMub2JqZWN0R3JhYmJlZC5nZXRIZWlnaHQoKSArICAoIHRoaXMuZ2V0SGVpZ2h0KCkgKiAwLjEgKSAgKTtcclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcbiAgICAgICAgXHJcbiAgLypcclxuICAgIFNwcml0ZSAvIEFuaW1hdGlvblxyXG4gICovXHJcblxyXG4gICAgZ2V0U3ByaXRlUHJvcHMoKSB7IHJldHVybiB0aGlzLnNwcml0ZVByb3BzOyB9XHJcblxyXG4gICAgXHJcblx0XHRoaWRlUGxheWVyKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyB9XHJcbiAgICBzaG93UGxheWVyKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG4gICAgXHJcbiAgICBsb29rRG93bigpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgICAgXHJcbiAgICAgIC8vIFN0ZXBzXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDcgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1VwKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwNyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDExMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTEyICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE3ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIyICk7XHJcbiAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1JpZ2h0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3OCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3OSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MiApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNyApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcblx0XHRsb29rTGVmdCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0OCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0OSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MiApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIHBsYXllciBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICAgIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblx0XHRcdGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cdCAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gICAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgICBpZih0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgICAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRTdGVwKCkge1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICAgIGNhc2UgJ2xlZnQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyaWdodCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdkb3duJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0TG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKSB7IHRoaXMubG9va0RpcmVjdGlvbiA9IGxvb2tEaXJlY3Rpb247IH1cclxuXHRcdHRyaWdnZXJMb29rRGlyZWN0aW9uKGRpcmVjdGlvbikgeyBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICB9XHJcblx0XHRyZXNldFBvc2l0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuY29sbGlzaW9uWTAgKTtcclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcbiAgICBcclxuICAvKlxyXG4gICAgTW92ZW1lbnRcclxuICAqL1xyXG4gICAgXHJcbiAgICBzZXRTdGFydFBvc2l0aW9uKHgsIHkpIHtcclxuICAgICAgdGhpcy5zZXRYKCB4ICk7XHJcbiAgICAgIHRoaXMuc2V0WSggeSApO1xyXG4gICAgICB0aGlzLngwID0geDtcclxuICAgICAgdGhpcy55MCA9IHk7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWCA9IHggKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkgPSB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYTtcclxuICAgICAgdGhpcy5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgIFxyXG4gICAgZ2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcblxyXG4gICAgc2V0WCh4LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICAgIHRoaXMueCA9IHg7IFxyXG4gICAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25YKCB4ICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSApO1xyXG4gICAgfVxyXG4gICAgc2V0WSh5LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICAgIHRoaXMueSA9IHk7IFxyXG4gICAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25ZKCB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRTcGVlZChzcGVlZCkgeyB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiBzcGVlZDsgfVxyXG4gICAgXHJcblx0XHRtb3ZMZWZ0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgIHRoaXMud2Fsa2luZyA9IHRydWU7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlJpZ2h0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgdGhpcy53YWxraW5nID0gdHJ1ZTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92VXAoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICB0aGlzLndhbGtpbmcgPSB0cnVlO1xyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZEb3duKCkgeyAgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgdGhpcy53YWxraW5nID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgaGFuZGxlTW92ZW1lbnQoIGtleXNEb3duICkge1xyXG5cclxuICAgICAgLy8gSWYgZGlhbG9nIGFjdGl2ZSwgZG9uJ3Qgd2Fsa1xyXG4gICAgICBpZiggd2luZG93LmdhbWUuaXNEaWFsb2dBY3RpdmUoKSApIHJldHVybjtcclxuICAgICAgXHJcbiAgICAgIC8vIFBsYXllciAxIENvbnRyb2xzXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIGlmICgzNyBpbiBrZXlzRG93bikgdGhpcy5tb3ZMZWZ0KCk7ICAvLyBMZWZ0XHJcbiAgICAgICAgaWYgKDM4IGluIGtleXNEb3duKSB0aGlzLm1vdlVwKCk7ICAgIC8vIFVwICBcclxuICAgICAgICBpZiAoMzkgaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHRcclxuICAgICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93blxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMiBDb250cm9sc1xyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoNjUgaW4ga2V5c0Rvd24pIHRoaXMubW92TGVmdCgpOyAgLy8gTGVmdCAgPT4gQVxyXG4gICAgICAgIGlmICg4NyBpbiBrZXlzRG93bikgdGhpcy5tb3ZVcCgpOyAgICAvLyBVcCAgICA9PiBXXHJcbiAgICAgICAgaWYgKDY4IGluIGtleXNEb3duKSB0aGlzLm1vdlJpZ2h0KCk7IC8vIFJpZ2h0ID0+IERcclxuICAgICAgICBpZiAoODMgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93biAgPT4gU1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUtleVVwKGtleVVwKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBJZiBkaWFsb2cgYWN0aXZlLCBkb24ndCB3YWxrXHJcbiAgICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0RpYWxvZ0FjdGl2ZSgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIDFcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgaWYgKGtleVVwID09IDE3KSB0aGlzLnRyaWdnZXJHcmFiKCk7ICAvLyBHcmFiID0+IENUUkxcclxuICAgICAgICBpZiAoa2V5VXAgPT0gMzIpIHRoaXMudHJpZ2dlclVzZSgpOyAgIC8vIFVzZSA9PiBTcGFjZVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQbGF5ZXIgMlxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoa2V5VXAgPT0gNzApIHRoaXMudHJpZ2dlckdyYWIoKTsgIC8vIEdyYWIgPT4gRlxyXG4gICAgICAgIGlmIChrZXlVcCA9PSA2OSkgdGhpcy50cmlnZ2VyVXNlKCk7ICAvLyBVc2UgPT4gRVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLndhbGtpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy53YWxrU291bmQuc3RvcCgpO1xyXG4gICAgfVxyXG5cclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHRcdFxyXG4gIC8qXHJcbiAgICBDb2xsaXNpb25cclxuICAqL1xyXG4gICAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICAgIHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcblxyXG4gICAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgIHJldHVybiB4ICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMjsgXHJcbiAgICB9XHJcbiAgICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICAgIGxldCB5ID0gKCBfeSApID8gX3kgOiB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuICAgICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICAgIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gICAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuXHRcdG5vQ29sbGlzaW9uKCkge1xyXG5cdFx0XHQvLyBXaGF0IGhhcHBlbnMgaWYgdGhlIHBsYXllciBpcyBub3QgY29sbGlkaW5nP1xyXG5cdFx0XHR0aGlzLnNldFNwZWVkKHRoaXMuc3BlZWQwKTsgLy8gUmVzZXQgc3BlZWRcclxuICAgIH1cclxuICAgICAgXHJcbiAgICBjb2xsaXNpb24ob2JqZWN0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblx0XHRcclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHJcblx0LypcclxuICAgIExpZmUgLyBIZWFsIC8gRGVhdGhcclxuICAqL1x0XHJcbiAgICBnZXRMaWZlcygpIHsgcmV0dXJuIHRoaXMubGlmZXM7IH1cclxuXHJcbiAgICBodXJ0UGxheWVyKCBhbW91bnQgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmh1cnRTb3VuZC5wbGF5KCk7XHJcblxyXG4gICAgICAgIC8vIEh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgICAgaWYoIHRoaXMubGlmZXMgPCAwICkgdGhpcy5saWZlcyA9IDA7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IGNvb2xkb3duXHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBwbGF5ZXIgZGllZFxyXG4gICAgICAgIHRoaXMuY2hlY2tQbGF5ZXJEZWF0aCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGVhbFBsYXllciggYW1vdW50ICkge1xyXG4gICAgICB0aGlzLmxpZmVzICs9IHBhcnNlSW50KGFtb3VudCk7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzID4gdGhpcy5kZWZhdWx0TGlmZXMgKSB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tQbGF5ZXJEZWF0aCgpIHtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAxICYmICF3aW5kb3cuZ29kX21vZGUgKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUuZ2FtZU92ZXIodHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBcclxuICAgIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFx0XHJcbiAgICAvKlxyXG4gICAgICBHZW5lcmFsXHJcbiAgICAqL1xyXG4gICAgICAgIFxyXG4gICAgICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgICAgIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgICBcclxuICAgICAgZ2V0UGxheWVyTnVtYmVyKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJOdW1iZXI7IH1cclxuXHJcbiAgICAgIGdldENvbG9yKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG4gICAgICAgIFxyXG4gICAgICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgIFxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFxyXG4gIC8qICBcclxuICAgIFJlbmRlclxyXG4gICovXHJcbiAgXHRcdFxyXG5cdCAgcmVuZGVyKGN0eCkge1xyXG4gICAgICBcclxuICAgICAgLy8gQmxpbmsgcGxheWVyIGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgICAgaWYoICEgdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gIXRoaXMuaGlkZVNwcml0ZTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgICBpZiggdGhpcy53YWxraW5nICYmICF0aGlzLndhbGtTb3VuZC5wbGF5aW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy53YWxrU291bmQucGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBXaGF0IHRvIGRvIGV2ZXJ5IGZyYW1lIGluIHRlcm1zIG9mIHJlbmRlcj8gRHJhdyB0aGUgcGxheWVyXHJcbiAgICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgICB9IFxyXG4gICAgICBcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1x0XHJcblxyXG4gICAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpICk7XHJcblxyXG4gICAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIE1hdGgucm91bmQodGhpcy5nZXRYKCkpICsgXCIgWTpcIiArIE1hdGgucm91bmQodGhpcy5nZXRZKCkpO1xyXG4gICAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSAyMCk7XHJcblxyXG4gICAgICAgIC8vIEdyYWIgY29sbGlzaW9uXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLCAwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuXHRcdH07XHJcblxyXG5cclxuICAgIHJ1bigpIHtcclxuICAgICAgdGhpcy5pbml0U291bmRzKCk7XHJcbiAgICAgIC8vdGhpcy5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmxvb2tEaXJlY3Rpb24gPSB0aGlzLmxvb2tEb3duKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9XHJcblx0XHRcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcbiAgICBQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IF9TX2NlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2NlbnRlcicpO1xyXG5jb25zdCBfU191cCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX3VwJyk7XHJcbmNvbnN0IF9TX3JpZ2h0ID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfcmlnaHQnKTtcclxuY29uc3QgX1NfYm90dG9tID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfYm90dG9tJyk7XHJcbmNvbnN0IF9TX2xlZnQgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9sZWZ0Jyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1Byb3RvdHlwZSBleHRlbmRzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzYXZlRGF0YSl7XHJcbiAgICBzdXBlcihjdHgsIGNhbnZhcywgXCJwcm90b3R5cGVcIik7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGFnZUlkID0gXCJjZW50ZXJcIjtcclxuICAgIFxyXG4gICAgLy8gRGVmaW5lIHdoaWNoIHN0YWdlIHdpbGwgbG9hZCBvbiBmaXJzdCBydW5cclxuICAgIHRoaXMuc3RhZ2VUb0xvYWQgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5zY2VuYXJpby5zdGFnZUlkIDogdGhpcy5kZWZhdWx0U3RhZ2VJZDtcclxuICAgIFxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhZ2VzXHJcbiAgc2V0U3RhZ2Uoc3RhZ2VfaWQsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIFxyXG4gICAgbGV0IF9zdGFnZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkXHJcbiAgICBzd2l0Y2goc3RhZ2VfaWQpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICBsZXQgc19jZW50ZXIgPSBuZXcgX1NfY2VudGVyKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19jZW50ZXI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICBsZXQgc191cCA9IG5ldyBfU191cCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfdXA7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIGxldCBzX2xlZnQgPSBuZXcgX1NfbGVmdCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfbGVmdDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIGxldCBzX3JpZ2h0ID0gbmV3IF9TX3JpZ2h0KCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19yaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICBsZXQgc19ib3R0b20gPSBuZXcgX1NfYm90dG9tKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19ib3R0b207XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExvYWQgdGhlIHN0YWdlIGRlZmluZWRcclxuICAgICAgdGhpcy5sb2FkU3RhZ2UoX3N0YWdlLCBmaXJzdFN0YWdlKTtcclxuICB9XHJcbiBcclxuICAvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMuc2V0U3RhZ2UoIHRoaXMuc3RhZ2VUb0xvYWQsIHRydWUpOyAgICBcclxuXHR9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvUHJvdG90eXBlOyIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9Cb3R0b20gZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJib3R0b21cIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYyLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdjX2JsLCAgICAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdjX2JyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9Cb3R0b207XHJcbiIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiY2VudGVyXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjIsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgaXdjX2JyLCAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgaXdjX2JsLCAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0IF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgICAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgb2IsICAgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIGl3Y190ciwgICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y190bCwgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ3VwJyB9O1xyXG4gICAgbGV0IHRwXzAzID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgICAgIHRhcmdldFN0YWdlOiAncmlnaHQnIH07XHJcbiAgICBsZXQgdHBfMDQgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdib3R0b20nIH07XHJcbiAgICBsZXQgdHBfMDUgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgICAgdGFyZ2V0U3RhZ2U6ICdsZWZ0JyB9O1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogXCJmaXJlXCIsIHR5cGU6IFwiMDFcIn07IFxyXG5cclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGVmdCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImxlZnRcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3Y190bCwgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0ICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgb2IsICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMiwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX2JsLCB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0xlZnQ7XHJcbiIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9SaWdodCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcInJpZ2h0XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHdjX3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdjX2JyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJsZWZ0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX1JpZ2h0O1xyXG4iLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfVXAgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJ1cFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpOztcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y190bCwgICAgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfVXBcclxuIiwibW9kdWxlLmV4cG9ydHM9eyBcImNvbHVtbnNcIjo2MSxcclxuIFwiaW1hZ2VcIjpcIi4uXFwvY29tbW9uXFwvc3ByaXRlc1xcL2JlYWNoLnBuZ1wiLFxyXG4gXCJpbWFnZWhlaWdodFwiOjEwNTUsXHJcbiBcImltYWdld2lkdGhcIjoxOTgwLFxyXG4gXCJtYXJnaW5cIjowLFxyXG4gXCJuYW1lXCI6XCJjZW50ZXJcIixcclxuIFwic3BhY2luZ1wiOjAsXHJcbiBcInRpbGVjb3VudFwiOjE5NTIsXHJcbiBcInRpbGVkdmVyc2lvblwiOlwiMS4yLjRcIixcclxuIFwidGlsZWhlaWdodFwiOjMyLFxyXG4gXCJ0aWxlc1wiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJib3R0b21cIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNixcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJjb3JuZXJfdG9wX2xlZnRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJjb3JuZXJfdG9wX3JpZ2h0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MjQsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidHJlZV90b3BfbGVmdFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjI1LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInRyZWVfdG9wX3JpZ2h0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6NzIsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidG9wXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6NzcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiY29ybmVyX2JvdHRvbV9sZWZ0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6NzgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiY29ybmVyX2JvdHRvbV9yaWdodFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjg1LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInRyZWVfbWlkZGxlX2xlZnRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjo4NixcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJ0cmVlX21pZGRsZV9yaWdodFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEzNCxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJyaWdodFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEzNSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJsZWZ0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTM2LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEzNyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJlYWNoX3dhbGxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTQ2LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInRyZWVfYm90dG9tX2xlZnRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNDcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwidHJlZV9ib3R0b21fcmlnaHRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxOTcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTk4LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoyNDUsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF9mbG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInNhbmRfMDFcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoyNjgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJlbmVteVwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImJsdWVcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjo2MjMsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwid2F0ZXJcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjo3MzQsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF9mbG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInNhbmRfMDJcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMjMxLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JfZ3JheV90bFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyMzIsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9ncmF5X3RyXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTIzMyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yX3B1cnBsZV90bFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyMzQsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9wdXJwbGVfdHJcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMjM1LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JfcmVkX3RsXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTIzNixcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yX3JlZF90clwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyMzcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9ncmVlbl90bFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyMzgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9ncmVlbl90clwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyOTEsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZWFjaF93YWxsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZmVuY2VcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMjkyLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JfZ3JheV9ibFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyOTMsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9ncmF5X2JyXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTI5NCxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yX3B1cnBsZV9ibFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyOTUsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9wdXJwbGVfYnJcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxMjk2LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vclwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JfcmVkX2JsXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTI5NyxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRvb3JcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yX3JlZF9iclwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyOTgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9ncmVlbl9ibFwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjEyOTksXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJkb29yXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZG9vcl9ncmVlbl9iclwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3MDgsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJmaXJlXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiMVwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NjksXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJoZWFsXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmFuYW5hXCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTc3MCxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImhlYWxcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiZXJyeVwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NzEsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJvYmplY3RfdGhyb3dcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJiYXJyZWxcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNzczLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwib2JqZWN0X3B1c2hcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJzdG9uZVwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NzUsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJrZXlcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJncmF5XCJcclxuICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImlkXCI6MTc3NixcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwiY2xhc3NcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImtleVwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcInB1cnBsZVwiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJpZFwiOjE3NzcsXHJcbiAgICAgICAgIFwicHJvcGVydGllc1wiOltcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcImNsYXNzXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJrZXlcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJ0eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCJyZWRcIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNzc4LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwia2V5XCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwidHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiZ3JlZW5cIlxyXG4gICAgICAgICAgICAgICAgfV1cclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiaWRcIjoxNzc5LFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJjbGFzc1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiYmVhY2hfd2FsbFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInR5cGVcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcImRpYWxvZ1wiXHJcbiAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgIH1dLFxyXG4gXCJ0aWxld2lkdGhcIjozMixcclxuIFwidHlwZVwiOlwidGlsZXNldFwiLFxyXG4gXCJ2ZXJzaW9uXCI6MS4yXHJcbn0iLCIvKlxyXG4gIFNhbmRib3ggU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8nKTtcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IGpzb25TY2VuYXJpb1RpbGVTZXQgPSByZXF1aXJlKCcuL3NhbmRib3gtdGlsZXNldC5qc29uJyk7XHJcblxyXG5jb25zdCBqc29uU3RhZ2VDZW50ZXIgPSByZXF1aXJlKCcuL3N0YWdlcy9jZW50ZXIuanNvbicpO1xyXG5jb25zdCBqc29uU3RhZ2VDZW50ZXJBc3NldHMgPSByZXF1aXJlKCcuL3N0YWdlcy9jZW50ZXItYXNzZXRzLmpzb24nKTtcclxuXHJcbmNvbnN0IGpzb25TdGFnZUxpZmUgPSByZXF1aXJlKCcuL3N0YWdlcy9saWZlLmpzb24nKTtcclxuY29uc3QganNvblN0YWdlTGlmZUFzc2V0cyA9IHJlcXVpcmUoJy4vc3RhZ2VzL2xpZmUtYXNzZXRzLmpzb24nKTtcclxuXHJcbmNvbnN0IGpzb25TdGFnZURvb3JzID0gcmVxdWlyZSgnLi9zdGFnZXMvZG9vcnMuanNvbicpO1xyXG5jb25zdCBqc29uU3RhZ2VEb29yc0Fzc2V0cyA9IHJlcXVpcmUoJy4vc3RhZ2VzL2Rvb3JzLWFzc2V0cy5qc29uJyk7XHJcblxyXG5jb25zdCBqc29uU3RhZ2VFbmVteSA9IHJlcXVpcmUoJy4vc3RhZ2VzL2VuZW15Lmpzb24nKTtcclxuY29uc3QganNvblN0YWdlRW5lbXlzc2V0cyA9IHJlcXVpcmUoJy4vc3RhZ2VzL2VuZW15LWFzc2V0cy5qc29uJyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1NhbmRib3ggZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgc2F2ZURhdGEpe1xyXG4gICAgbGV0IHNvdW5kU3JjID0gXCIuL3NvdW5kcy9zYW5kYm94LWJhY2tncm91bmQubXAzXCI7XHJcbiAgICBzdXBlcihjdHgsIGNhbnZhcywgXCJzYW5kYm94XCIsIHNvdW5kU3JjKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG5cclxuICAgIGlmKCAhc2F2ZURhdGEgKSB7XHJcbiAgICAgIGxldCBkaWFsb2cgPSBbXHJcbiAgICAgICAge1xyXG5cdFx0XHRcdFx0XCJoaWRlU3ByaXRlXCI6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XCJ0ZXh0XCI6IFwiV2VsY29tZSB0byBHdWZpdHJ1cGkhIFRoaXMgaXMgYSBzYW5kYm94IFNjZW5hcmlvIHdoZXJlIHlvdSBjYW4gdGVzdCBhbGwgdGhlIGZlYXR1cmVzIG9mIHRoaXMgZ2FtZS4gW1BSRVNTIFNQQUNFIFRPIENPTlRJTlVFXVwiXHJcblx0XHRcdFx0fSxcclxuICAgICAgICB7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJQcmVzcyB0aGUgR1JBQi9EUk9QIGJ1dHRvbiB0byBwaWNrIHVwIGFuIG9iamVjdC4gV2l0aCB0aGUgb2JqZWN0IG9uIHlvdXIgaGFuZHMsIHByZXNzIHRoZSBVU0UgYnV0dG9uIGFnYWluIHRvIGRyb3AgaXQgb3IgcHJlc3MgdGhlIFVTRS9USFJPVyBidXR0b24gdG8gdGhyb3cgaXQuXCJcclxuXHRcdFx0XHR9LFxyXG4gICAgICAgIHtcclxuXHRcdFx0XHRcdFwiaGlkZVNwcml0ZVwiOiBmYWxzZSxcclxuXHRcdFx0XHRcdFwidGV4dFwiOiBcIllvdSBjYW4gYWxzbyBwcmVzcyB0aGUgVVNFIGJ1dHRvbiBpbiBmcm9udCBvZiBhIGJvYXJkIHRvIHJlYWQgaXQuXCJcclxuXHRcdFx0XHR9LFxyXG4gICAgICAgIHsgXCJoaWRlU3ByaXRlXCI6IHRydWUsIFwidGV4dFwiOiBcIlwiIH0sXHJcbiAgICAgIF07XHJcbiAgICAgIHdpbmRvdy5nYW1lLnNldERpYWxvZyhkaWFsb2cpOyBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICAvLyBTYXZlIGl0ZW1zIHN0YXRlIGJlZm9yZSBjbGVhclxyXG4gICAgaWYoICFmaXJzdFN0YWdlICkge1xyXG4gICAgICB0aGlzLnNhdmVJdGVtc1N0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuXHJcbiAgICAvLyBTZXQgQWN0dWFsIFN0YWdlIElEXHJcbiAgICB0aGlzLnNldEFjdHVhbFN0YWdlSWQoIHN0YWdlX2lkICk7XHJcbiAgICBcclxuICAgIGxldCBfc3RhZ2UgPSBudWxsO1xyXG5cclxuICAgIC8vIENoZWNrIHdoaWNoIHN0YWdlIHdpbGwgbG9hZFxyXG4gICAgc3dpdGNoKHN0YWdlX2lkKSB7XHJcbiAgICAgIGRlZmF1bHQ6IFxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBfU3RhZ2UoIHN0YWdlX2lkLCBqc29uU3RhZ2VDZW50ZXIsIGpzb25TdGFnZUNlbnRlckFzc2V0cywganNvblNjZW5hcmlvVGlsZVNldCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsaWZlJzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgX1N0YWdlKCBzdGFnZV9pZCwganNvblN0YWdlTGlmZSwganNvblN0YWdlTGlmZUFzc2V0cywganNvblNjZW5hcmlvVGlsZVNldCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb29ycyc6XHJcbiAgICAgICAgX3N0YWdlID0gbmV3IF9TdGFnZSggc3RhZ2VfaWQsIGpzb25TdGFnZURvb3JzLCBqc29uU3RhZ2VEb29yc0Fzc2V0cywganNvblNjZW5hcmlvVGlsZVNldCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdlbmVteSc6XHJcbiAgICAgICAgX3N0YWdlID0gbmV3IF9TdGFnZSggc3RhZ2VfaWQsIGpzb25TdGFnZUVuZW15LCBqc29uU3RhZ2VFbmVteXNzZXRzLCBqc29uU2NlbmFyaW9UaWxlU2V0ICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9hZCB0aGUgc3RhZ2UgZGVmaW5lZFxyXG4gICAgdGhpcy5sb2FkU3RhZ2UoX3N0YWdlLCBmaXJzdFN0YWdlKTtcclxuICB9XHJcbiBcclxuICAvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMuc2V0U3RhZ2UoIHRoaXMuc3RhZ2VUb0xvYWQsIHRydWUgKTsgICAgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBzY2VuYXJpb1NhbmRib3g7IiwibW9kdWxlLmV4cG9ydHM9e1xyXG5cdFwidGVsZXBvcnRzXCI6IFtcclxuXHRcdHtcclxuXHRcdFx0XCJ4SW5kZXhcIjogNyxcclxuXHRcdFx0XCJ5SW5kZXhcIjogMCxcclxuXHRcdFx0XCJwcm9wc1wiOiB7ICBcclxuXHRcdFx0XHRcInRhcmdldFwiOiB7XHJcblx0XHRcdFx0XHRcInN0YWdlXCI6IFwibGlmZVwiLFxyXG5cdFx0XHRcdFx0XCJ4XCI6IDcsXHJcblx0XHRcdFx0XHRcInlcIjogMTFcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHR7XHJcblx0XHRcdFwieEluZGV4XCI6IDE1LFxyXG5cdFx0XHRcInlJbmRleFwiOiA2LFxyXG5cdFx0XHRcInByb3BzXCI6IHsgIFxyXG5cdFx0XHRcdFwidGFyZ2V0XCI6IHtcclxuXHRcdFx0XHRcdFwic3RhZ2VcIjogXCJlbmVteVwiLFxyXG5cdFx0XHRcdFx0XCJ4XCI6IDEsXHJcblx0XHRcdFx0XHRcInlcIjogNVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHRcdHtcclxuXHRcdFx0XCJ4SW5kZXhcIjogMCxcclxuXHRcdFx0XCJ5SW5kZXhcIjogNixcclxuXHRcdFx0XCJwcm9wc1wiOiB7ICBcclxuXHRcdFx0XHRcInRhcmdldFwiOiB7XHJcblx0XHRcdFx0XHRcInN0YWdlXCI6IFwiZG9vcnNcIixcclxuXHRcdFx0XHRcdFwieFwiOiAxNCxcclxuXHRcdFx0XHRcdFwieVwiOiA1XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XSxcclxuXHRcImRpYWxvZ3NcIjpbIFxyXG5cdFx0e1xyXG5cdFx0XHRcInhcIjogNixcclxuXHRcdFx0XCJ5XCI6IDksXHJcblx0XHRcdFwiZGlhbG9nXCI6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJUcnkgZ3JhYmJpbmcgdGhlIGtleSBhbmQgdGhlbiB1c2luZyBpdCBvbiB0aGUgZG9vciB0byB1bmxvY2sgaXQuXCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgXCJoaWRlU3ByaXRlXCI6IHRydWUsIFwidGV4dFwiOiBcIlwiIH1cclxuXHRcdFx0XVxyXG5cdFx0fSxcclxuXHRcdHtcclxuXHRcdFx0XCJ4XCI6IDQsXHJcblx0XHRcdFwieVwiOiA0LFxyXG5cdFx0XHRcImRpYWxvZ1wiOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XCJoaWRlU3ByaXRlXCI6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XCJ0ZXh0XCI6IFwiR28gZXhwbG9yZSB0aGUgc2NlbmFyaW8uXCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgXCJoaWRlU3ByaXRlXCI6IHRydWUsIFwidGV4dFwiOiBcIlwiIH1cclxuXHRcdFx0XVxyXG5cdFx0fVxyXG5cdF1cclxufSIsIm1vZHVsZS5leHBvcnRzPXsgXCJoZWlnaHRcIjoxNCxcclxuIFwiaW5maW5pdGVcIjpmYWxzZSxcclxuIFwibGF5ZXJzXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCAxNywgMTk5LCAyNDYsIDEzNSwgNjI0LCA3OCwgMTM4LCAyNDYsIDczNSwgMjQ2LCAxMzcsIDYyNCwgMTcsIDczLCAxOCwgNjI0LCAxMzYsIDI0NiwgNzM1LCAxOTgsIDE4LCA2MjQsIDc4LCAxMzgsIDI0NiwgMTM3LCA3OSwgNjI0LCAxMzYsIDI0NiwgMTk4LCAxOCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDE5OCwgMTgsIDYyNCwgNzgsIDEyLCA3OSwgNjI0LCA2MjQsIDEzNiwgNzM1LCAyNDYsIDE5OCwgMTgsIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMTk4LCA3MywgNzMsIDE4LCA2MjQsIDYyNCwgMTcsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMTk4LCAxOTksIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDE5OCwgMTgsIDYyNCwgMTk5LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDE5OCwgNzMsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM4LCAyNDYsIDczNSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzcsIDEyLCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM3LCAxMiwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDE5OCwgMTgsIDc4LCAxMzgsIDI0NiwgMjQ2LCAxMzcsIDc5LCA2MjQsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDE5OCwgNzMsIDE5OSwgMjQ2LCAyNDYsIDE5OCwgMTgsIDYyNCwgNjI0LCA2MjQsIDc4LCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDczNSwgMTM3LCA3OSwgNjI0LCA2MjQsIDE3LCAxOCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDEzNywgMTIsIDEzOCwgMjQ2LCAyNDYsIDEzNywgNzksIDYyNCwgNjI0LCA3MywgMTk5LCAxOTgsIDE4LCA3OCwgMTIsIDEyLCA3OSwgNjI0LCA3OCwgMTIsIDEyLCA3OSwgNjI0LCA2MjQsIDYyNF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjoxLFxyXG4gICAgICAgICBcIm5hbWVcIjpcImdyb3VuZFwiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInR5cGVcIjpcInRpbGVsYXllclwiLFxyXG4gICAgICAgICBcInZpc2libGVcIjp0cnVlLFxyXG4gICAgICAgICBcIndpZHRoXCI6MTYsXHJcbiAgICAgICAgIFwieFwiOjAsXHJcbiAgICAgICAgIFwieVwiOjBcclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOlswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxNzgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxNDcsIDE0OCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTIzOCwgMTIzOSwgMCwgMCwgMCwgMCwgMTcwOSwgMTcwOSwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5OSwgMTMwMCwgMTI5MiwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMTc4MCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTc3MiwgMTc3MiwgMTc3MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTc3OSwgMTc3MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjoyLFxyXG4gICAgICAgICBcIm5hbWVcIjpcIm9iamVjdHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo5LFxyXG4gICAgICAgICBcIm5hbWVcIjpcInNhdmVkLWl0ZW1zXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6NixcclxuICAgICAgICAgXCJuYW1lXCI6XCJhc3NldHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjozLFxyXG4gICAgICAgICBcIm5hbWVcIjpcInBsYXllclwiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMV94XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxMFwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8xX3lcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjEwXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzJfeFwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiMTFcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMl95XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIxMFwiXHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjUsIDI2LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCA4NiwgODcsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDI1LCAyNiwgMjUsIDI2LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAyNV0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo4LFxyXG4gICAgICAgICBcIm5hbWVcIjpcIm9iamVjdHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfV0sXHJcbiBcIm5leHRsYXllcmlkXCI6MTAsXHJcbiBcIm5leHRvYmplY3RpZFwiOjEsXHJcbiBcIm9yaWVudGF0aW9uXCI6XCJvcnRob2dvbmFsXCIsXHJcbiBcInJlbmRlcm9yZGVyXCI6XCJsZWZ0LXVwXCIsXHJcbiBcInRpbGVkdmVyc2lvblwiOlwiMS4yLjRcIixcclxuIFwidGlsZWhlaWdodFwiOjMyLFxyXG4gXCJ0aWxlc2V0c1wiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZmlyc3RnaWRcIjoxLFxyXG4gICAgICAgICBcInNvdXJjZVwiOlwiLi5cXC9zYW5kYm94LXRpbGVzZXQuanNvblwiXHJcbiAgICAgICAgfV0sXHJcbiBcInRpbGV3aWR0aFwiOjMyLFxyXG4gXCJ0eXBlXCI6XCJtYXBcIixcclxuIFwidmVyc2lvblwiOjEuMixcclxuIFwid2lkdGhcIjoxNlxyXG59IiwibW9kdWxlLmV4cG9ydHM9e1xyXG5cdFwidGVsZXBvcnRzXCI6IFtcclxuXHRcdHtcclxuXHRcdFx0XCJ4SW5kZXhcIjogMTUsXHJcblx0XHRcdFwieUluZGV4XCI6IDYsXHJcblx0XHRcdFwicHJvcHNcIjogeyAgXHJcblx0XHRcdFx0XCJ0YXJnZXRcIjoge1xyXG5cdFx0XHRcdFx0XCJzdGFnZVwiOiBcImNlbnRlclwiLFxyXG5cdFx0XHRcdFx0XCJ4XCI6IDEsXHJcblx0XHRcdFx0XHRcInlcIjogNVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdF0sXHJcblx0XCJkaWFsb2dzXCI6WyBcclxuXHRcdHtcclxuXHRcdFx0XCJ4XCI6IDExLFxyXG5cdFx0XHRcInlcIjogMTEsXHJcblx0XHRcdFwiZGlhbG9nXCI6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJTdGFuZCBpbiBmcm9udCBvZiBhIHN0YXIgYmxvY2sgYW5kIHByZXMgdGhlIFVTRS9USFJPVyBidXR0b24gdG8gcHVzaCB0aGUgYmxvY2suXCJcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHsgXCJoaWRlU3ByaXRlXCI6IHRydWUsIFwidGV4dFwiOiBcIlwiIH1cclxuXHRcdFx0XVxyXG5cdFx0fSxcclxuXHRcdHtcclxuXHRcdFx0XCJ4XCI6IDksXHJcblx0XHRcdFwieVwiOiAxLFxyXG5cdFx0XHRcImRpYWxvZ1wiOiBbXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XCJoaWRlU3ByaXRlXCI6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XCJ0ZXh0XCI6IFwiQ29uZ3JhdHVsYXRpb25zLCB5b3UgZGlkIGl0IVwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJUaGF0J3MgaXQgZm9yIHRvZGF5LCBzdGF5IGluIHRvdWNoIGZvciB1cGRhdGVzIGFuZCB0aGFua3MgZm9yIHBsYXlpbmcgdGhpcyBkZW1vLlwiXHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHR7IFwiaGlkZVNwcml0ZVwiOiB0cnVlLCBcInRleHRcIjogXCJcIiB9XHJcblx0XHRcdF1cclxuXHRcdH1cclxuXHRdXHJcbn0iLCJtb2R1bGUuZXhwb3J0cz17IFwiaGVpZ2h0XCI6MTQsXHJcbiBcImluZmluaXRlXCI6ZmFsc2UsXHJcbiBcImxheWVyc1wiOltcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOlsyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDczNSwgMjQ2LCAyNDYsIDEzNSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDI0NiwgMjQ2LCA3MzUsIDczNSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgMTIsIDEyLCA3OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgNzksIDE3LCA3MywgNzMsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDE3LCAxOTksIDI0NiwgMjQ2LCAxMzYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCAxMzYsIDczNSwgMjQ2LCAxMzcsIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDEzNiwgMjQ2LCAyNDYsIDEzNSwgMTM2LCAyNDYsIDI0NiwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM3LCAxMiwgNzksIDEzNiwgMjQ2LCAyNDYsIDEzNSwgMTM2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCAxNywgNzMsIDE5OSwgMjQ2LCAyNDYsIDEzNSwgMTM2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTk4LCAxOTksIDczNSwgMjQ2LCAyNDYsIDEzNywgNzksIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDYyNCwgNzgsIDEyLCAxMiwgMTIsIDEyLCAxMiwgMTIsIDEyLCAxMiwgMTIsIDEyLCAxMiwgMTIsIDEyLCA3OSwgMTddLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MSxcclxuICAgICAgICAgXCJuYW1lXCI6XCJncm91bmRcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMCwgMTI5MiwgMTc3NywgMCwgMCwgMCwgMTc3MiwgMTc3MiwgMTI5MiwgMCwgMTc4MCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMTI5MiwgODYsIDg3LCAwLCAwLCAxNzcyLCAxNzcyLCAxMjkyLCAwLCAwLCAwLCAxMjM0LCAxMjM1LCAwLCAxMjkyLCAwLCAxMjkyLCAxNDcsIDE0OCwgMCwgMCwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5NSwgMTI5NiwgMTI5MiwgMTI5MiwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMTI5MiwgMTIzNiwgMTIzNywgMCwgMTc3MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MiwgMCwgMCwgMTI5MiwgMTI5MiwgMTI5NywgMTI5OCwgMTI5MiwgMTI5MiwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTIzMiwgMTIzMywgMTI5MiwgMTcwOSwgMCwgMCwgMTcwOSwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MywgMTI5NCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MiwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMTI5MiwgMCwgMCwgMTI5MiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMTI5MiwgMCwgMCwgMTI5MiwgMCwgMCwgMTc4MCwgMCwgMCwgMCwgMCwgMCwgMTc3MiwgMCwgMCwgMCwgMCwgMCwgMCwgMTc3NCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjoyLFxyXG4gICAgICAgICBcIm5hbWVcIjpcIm9iamVjdHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo3LFxyXG4gICAgICAgICBcIm5hbWVcIjpcInNhdmVkLWl0ZW1zXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDI1LCAyNiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjUsIDI2LCAyNSwgMjYsIDI1LCAyNiwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo1LFxyXG4gICAgICAgICBcIm5hbWVcIjpcIm9iamVjdHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjY5LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICAgXCJoZWlnaHRcIjoxNCxcclxuICAgICAgICAgXCJpZFwiOjYsXHJcbiAgICAgICAgIFwibmFtZVwiOlwiZW5lbXlcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjozLFxyXG4gICAgICAgICBcIm5hbWVcIjpcInBsYXllclwiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInByb3BlcnRpZXNcIjpbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMV94XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIyXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzFfeVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiMTFcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMl94XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIzXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzJfeVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiMTFcIlxyXG4gICAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6NCxcclxuICAgICAgICAgXCJuYW1lXCI6XCJhc3NldHNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfV0sXHJcbiBcIm5leHRsYXllcmlkXCI6OCxcclxuIFwibmV4dG9iamVjdGlkXCI6MSxcclxuIFwib3JpZW50YXRpb25cIjpcIm9ydGhvZ29uYWxcIixcclxuIFwicmVuZGVyb3JkZXJcIjpcImxlZnQtdXBcIixcclxuIFwidGlsZWR2ZXJzaW9uXCI6XCIxLjIuNFwiLFxyXG4gXCJ0aWxlaGVpZ2h0XCI6MzIsXHJcbiBcInRpbGVzZXRzXCI6W1xyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJmaXJzdGdpZFwiOjEsXHJcbiAgICAgICAgIFwic291cmNlXCI6XCIuLlxcL3NhbmRib3gtdGlsZXNldC5qc29uXCJcclxuICAgICAgICB9XSxcclxuIFwidGlsZXdpZHRoXCI6MzIsXHJcbiBcInR5cGVcIjpcIm1hcFwiLFxyXG4gXCJ2ZXJzaW9uXCI6MS4yLFxyXG4gXCJ3aWR0aFwiOjE2XHJcbn0iLCJtb2R1bGUuZXhwb3J0cz17XHJcblx0XCJ0ZWxlcG9ydHNcIjogW1xyXG5cdFx0e1xyXG5cdFx0XHRcInhJbmRleFwiOiAwLFxyXG5cdFx0XHRcInlJbmRleFwiOiA2LFxyXG5cdFx0XHRcInByb3BzXCI6IHsgIFxyXG5cdFx0XHRcdFwidGFyZ2V0XCI6IHtcclxuXHRcdFx0XHRcdFwic3RhZ2VcIjogXCJjZW50ZXJcIixcclxuXHRcdFx0XHRcdFwieFwiOiAxNCxcclxuXHRcdFx0XHRcdFwieVwiOiA1XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XSxcclxuXHRcImRpYWxvZ3NcIjpbIFxyXG5cdFx0e1xyXG5cdFx0XHRcInhcIjogMixcclxuXHRcdFx0XCJ5XCI6IDUsXHJcblx0XHRcdFwiZGlhbG9nXCI6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJUcnkgdGhyb3dpbmcgYmFycmVscyBhdCB0aGUgZW5lbXlzIHRvIGtpbGwgdGhlbS5cIlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0eyBcImhpZGVTcHJpdGVcIjogdHJ1ZSwgXCJ0ZXh0XCI6IFwiXCIgfVxyXG5cdFx0XHRdXHJcblx0XHR9XHJcblx0XVxyXG59IiwibW9kdWxlLmV4cG9ydHM9eyBcImhlaWdodFwiOjE0LFxyXG4gXCJpbmZpbml0ZVwiOmZhbHNlLFxyXG4gXCJsYXllcnNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDE3LCAxOTksIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDYyNCwgMTcsIDczLCA3MywgNzMsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCA2MjQsIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDYyNCwgMTM2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgMTcsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDczNSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgNzksIDEzOCwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCA2MjQsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNSwgNjI0LCA2MjQsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCA3MzUsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDYyNCwgNjI0LCA2MjQsIDYyNCwgMTM2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgNzM1LCAxMzcsIDc5LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDc4LCAxMzgsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM3LCA3OSwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNzgsIDEyLCAxMiwgMTIsIDEyLCAxMiwgMTIsIDEyLCA3OSwgNjI0LCA2MjQsIDYyNF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjoxLFxyXG4gICAgICAgICBcIm5hbWVcIjpcImdyb3VuZFwiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInR5cGVcIjpcInRpbGVsYXllclwiLFxyXG4gICAgICAgICBcInZpc2libGVcIjp0cnVlLFxyXG4gICAgICAgICBcIndpZHRoXCI6MTYsXHJcbiAgICAgICAgIFwieFwiOjAsXHJcbiAgICAgICAgIFwieVwiOjBcclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOlswLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAxNzcyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAxNzc2LCAxMjkyLCAwLCAwLCAwLCAxNzcyLCAxNzcyLCAxNzcyLCAxNzcyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAxNzcyLCAxNzcyLCAxNzcyLCAxNzcyLCAxMjkyLCAxMjkyLCAxMjkyLCAxNzcyLCAxNzcyLCAxMjkyLCAxMjkyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAxNzcyLCAxNzcyLCAxNzcyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAxNzgwLCAwLCAwLCAxNzcyLCAxNzcyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxNzcyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAxNzcyLCAxNzcyLCAxMjkyLCAxMjkyLCAxMjkyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAxMjkyLCAxMjkyLCAxMjkyLCAxNzcyLCAxNzcyLCAxMjkyLCAxMjkyLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICAgXCJoZWlnaHRcIjoxNCxcclxuICAgICAgICAgXCJpZFwiOjIsXHJcbiAgICAgICAgIFwibmFtZVwiOlwib2JqZWN0c1wiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInR5cGVcIjpcInRpbGVsYXllclwiLFxyXG4gICAgICAgICBcInZpc2libGVcIjp0cnVlLFxyXG4gICAgICAgICBcIndpZHRoXCI6MTYsXHJcbiAgICAgICAgIFwieFwiOjAsXHJcbiAgICAgICAgIFwieVwiOjBcclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOlswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICAgXCJoZWlnaHRcIjoxNCxcclxuICAgICAgICAgXCJpZFwiOjYsXHJcbiAgICAgICAgIFwibmFtZVwiOlwiYXNzZXRzXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MTAsXHJcbiAgICAgICAgIFwibmFtZVwiOlwic2F2ZWQtaXRlbXNcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjY5LCAwLCAyNjksIDAsIDI2OSwgMCwgMjY5LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAyNjksIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDI2OSwgMCwgMCwgMjY5LCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAyNjksIDAsIDAsIDI2OSwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0sXHJcbiAgICAgICAgIFwiaGVpZ2h0XCI6MTQsXHJcbiAgICAgICAgIFwiaWRcIjo5LFxyXG4gICAgICAgICBcIm5hbWVcIjpcImVuZW15XCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MyxcclxuICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzFfeFwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiMlwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8xX3lcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjVcIlxyXG4gICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJfMl94XCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6XCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgICBcInZhbHVlXCI6XCIzXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzJfeVwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiNVwiXHJcbiAgICAgICAgICAgICAgICB9XSxcclxuICAgICAgICAgXCJ0eXBlXCI6XCJ0aWxlbGF5ZXJcIixcclxuICAgICAgICAgXCJ2aXNpYmxlXCI6dHJ1ZSxcclxuICAgICAgICAgXCJ3aWR0aFwiOjE2LFxyXG4gICAgICAgICBcInhcIjowLFxyXG4gICAgICAgICBcInlcIjowXHJcbiAgICAgICAgfSwgXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjUsIDI2LCAyNSwgMjYsIDI1LCAyNiwgMCwgMCwgMjUsIDI2LCAwLCAwLCAwLCAwLCAyNSwgMjYsIDg2LCA4NywgODZdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6OCxcclxuICAgICAgICAgXCJuYW1lXCI6XCJvYmplY3RzXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH1dLFxyXG4gXCJuZXh0bGF5ZXJpZFwiOjExLFxyXG4gXCJuZXh0b2JqZWN0aWRcIjoxLFxyXG4gXCJvcmllbnRhdGlvblwiOlwib3J0aG9nb25hbFwiLFxyXG4gXCJyZW5kZXJvcmRlclwiOlwibGVmdC11cFwiLFxyXG4gXCJ0aWxlZHZlcnNpb25cIjpcIjEuMi40XCIsXHJcbiBcInRpbGVoZWlnaHRcIjozMixcclxuIFwidGlsZXNldHNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImZpcnN0Z2lkXCI6MSxcclxuICAgICAgICAgXCJzb3VyY2VcIjpcIi4uXFwvc2FuZGJveC10aWxlc2V0Lmpzb25cIlxyXG4gICAgICAgIH1dLFxyXG4gXCJ0aWxld2lkdGhcIjozMixcclxuIFwidHlwZVwiOlwibWFwXCIsXHJcbiBcInZlcnNpb25cIjoxLjIsXHJcbiBcIndpZHRoXCI6MTZcclxufSIsIm1vZHVsZS5leHBvcnRzPXtcclxuXHRcInRlbGVwb3J0c1wiOiBbXHJcblx0XHR7XHJcblx0XHRcdFwieEluZGV4XCI6IDcsXHJcblx0XHRcdFwieUluZGV4XCI6IDEzLFxyXG5cdFx0XHRcInByb3BzXCI6IHsgIFxyXG5cdFx0XHRcdFwidGFyZ2V0XCI6IHtcclxuXHRcdFx0XHRcdFwic3RhZ2VcIjogXCJjZW50ZXJcIixcclxuXHRcdFx0XHRcdFwieFwiOiA3LFxyXG5cdFx0XHRcdFx0XCJ5XCI6IDBcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRdLFxyXG5cdFwiZGlhbG9nc1wiOlsgXHJcblx0XHR7XHJcblx0XHRcdFwieFwiOiA4LFxyXG5cdFx0XHRcInlcIjogMTEsXHJcblx0XHRcdFwiZGlhbG9nXCI6IFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcImhpZGVTcHJpdGVcIjogZmFsc2UsXHJcblx0XHRcdFx0XHRcInRleHRcIjogXCJGcnVpdHMgY2FuZCByZWNvdmVyIHlvdXIgbGlmZS4gU29tZSBmcnVpdHMgeW91IGNhbiBvbmx5IHBpY2sgdXAgb25jZS5cIlxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0eyBcImhpZGVTcHJpdGVcIjogdHJ1ZSwgXCJ0ZXh0XCI6IFwiXCIgfVxyXG5cdFx0XHRdXHJcblx0XHR9XHJcblx0XVxyXG59IiwibW9kdWxlLmV4cG9ydHM9eyBcImhlaWdodFwiOjE0LFxyXG4gXCJpbmZpbml0ZVwiOmZhbHNlLFxyXG4gXCJsYXllcnNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImRhdGFcIjpbNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDE3LCA3MywgNzMsIDczLCA3MywgMTgsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDE3LCAxOTksIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTk4LCAxOCwgNjI0LCA2MjQsIDYyNCwgMTcsIDczLCA3MywgNzMsIDczLCAxOTksIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDE5OCwgMTgsIDYyNCwgMTcsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTk4LCAxOCwgMTM2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCAxMzYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzUsIDEzNiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNSwgMTM2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMTM1LCA3OCwgMTM4LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzcsIDc5LCA2MjQsIDc4LCAxMiwgMTM4LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAxMzcsIDc5LCAxNywgNjI0LCA2MjQsIDYyNCwgNzgsIDEzOCwgMjQ2LCAyNDYsIDI0NiwgMjQ2LCAyNDYsIDEzNywgMTIsIDEyLCA3OSwgMTcsIDE5OSwgNjI0LCA2MjQsIDYyNCwgNjI0LCA3OCwgMTM4LCAyNDYsIDI0NiwgMjQ2LCAxMzcsIDc5LCAxNywgNzMsIDczLCAxOTksIDI0NiwgNjI0LCA2MjQsIDYyNCwgNjI0LCA2MjQsIDc4LCAxMzgsIDI0NiwgMTM3LCA3OSwgMTcsIDE5OSwgMjQ2LCAyNDYsIDI0NiwgMjQ2XSxcclxuICAgICAgICAgXCJoZWlnaHRcIjoxNCxcclxuICAgICAgICAgXCJpZFwiOjEsXHJcbiAgICAgICAgIFwibmFtZVwiOlwiZ3JvdW5kXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEyOTIsIDAsIDE3NzAsIDE3NzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3MDksIDAsIDAsIDAsIDAsIDAsIDAsIDE3NzEsIDAsIDAsIDE3MDksIDEyOTIsIDEyOTIsIDEyOTIsIDEyOTIsIDAsIDE3MDksIDAsIDAsIDAsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3MDksIDEyOTIsIDEyOTIsIDEyOTIsIDEyOTIsIDEyOTIsIDEyOTIsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDE3NzEsIDAsIDE3MDksIDAsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDE3MDksIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3MDksIDE3NzgsIDEyOTIsIDAsIDAsIDAsIDAsIDE3NzAsIDAsIDE3MDksIDAsIDAsIDAsIDAsIDAsIDAsIDEyOTIsIDEyOTIsIDEyOTIsIDE3MDksIDEyOTIsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDE3ODAsIDEyOTIsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MixcclxuICAgICAgICAgXCJuYW1lXCI6XCJvYmplY3RzXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6NSxcclxuICAgICAgICAgXCJuYW1lXCI6XCJzYXZlZC1pdGVtc1wiLFxyXG4gICAgICAgICBcIm9wYWNpdHlcIjoxLFxyXG4gICAgICAgICBcInR5cGVcIjpcInRpbGVsYXllclwiLFxyXG4gICAgICAgICBcInZpc2libGVcIjp0cnVlLFxyXG4gICAgICAgICBcIndpZHRoXCI6MTYsXHJcbiAgICAgICAgIFwieFwiOjAsXHJcbiAgICAgICAgIFwieVwiOjBcclxuICAgICAgICB9LCBcclxuICAgICAgICB7XHJcbiAgICAgICAgIFwiZGF0YVwiOlswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSxcclxuICAgICAgICAgXCJoZWlnaHRcIjoxNCxcclxuICAgICAgICAgXCJpZFwiOjQsXHJcbiAgICAgICAgIFwibmFtZVwiOlwiYXNzZXRzXCIsXHJcbiAgICAgICAgIFwib3BhY2l0eVwiOjEsXHJcbiAgICAgICAgIFwidHlwZVwiOlwidGlsZWxheWVyXCIsXHJcbiAgICAgICAgIFwidmlzaWJsZVwiOnRydWUsXHJcbiAgICAgICAgIFwid2lkdGhcIjoxNixcclxuICAgICAgICAgXCJ4XCI6MCxcclxuICAgICAgICAgXCJ5XCI6MFxyXG4gICAgICAgIH0sIFxyXG4gICAgICAgIHtcclxuICAgICAgICAgXCJkYXRhXCI6WzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdLFxyXG4gICAgICAgICBcImhlaWdodFwiOjE0LFxyXG4gICAgICAgICBcImlkXCI6MyxcclxuICAgICAgICAgXCJuYW1lXCI6XCJwbGF5ZXJcIixcclxuICAgICAgICAgXCJvcGFjaXR5XCI6MSxcclxuICAgICAgICAgXCJwcm9wZXJ0aWVzXCI6W1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzFfeFwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiNlwiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8xX3lcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjExXCJcclxuICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgIFwibmFtZVwiOlwicGxheWVyXzJfeFwiLFxyXG4gICAgICAgICAgICAgICAgIFwidHlwZVwiOlwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOlwiN1wiXHJcbiAgICAgICAgICAgICAgICB9LCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICBcIm5hbWVcIjpcInBsYXllcl8yX3lcIixcclxuICAgICAgICAgICAgICAgICBcInR5cGVcIjpcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgIFwidmFsdWVcIjpcIjExXCJcclxuICAgICAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICBcInR5cGVcIjpcInRpbGVsYXllclwiLFxyXG4gICAgICAgICBcInZpc2libGVcIjp0cnVlLFxyXG4gICAgICAgICBcIndpZHRoXCI6MTYsXHJcbiAgICAgICAgIFwieFwiOjAsXHJcbiAgICAgICAgIFwieVwiOjBcclxuICAgICAgICB9XSxcclxuIFwibmV4dGxheWVyaWRcIjo2LFxyXG4gXCJuZXh0b2JqZWN0aWRcIjoxLFxyXG4gXCJvcmllbnRhdGlvblwiOlwib3J0aG9nb25hbFwiLFxyXG4gXCJyZW5kZXJvcmRlclwiOlwibGVmdC11cFwiLFxyXG4gXCJ0aWxlZHZlcnNpb25cIjpcIjEuMi40XCIsXHJcbiBcInRpbGVoZWlnaHRcIjozMixcclxuIFwidGlsZXNldHNcIjpbXHJcbiAgICAgICAge1xyXG4gICAgICAgICBcImZpcnN0Z2lkXCI6MSxcclxuICAgICAgICAgXCJzb3VyY2VcIjpcIi4uXFwvc2FuZGJveC10aWxlc2V0Lmpzb25cIlxyXG4gICAgICAgIH1dLFxyXG4gXCJ0aWxld2lkdGhcIjozMixcclxuIFwidHlwZVwiOlwibWFwXCIsXHJcbiBcInZlcnNpb25cIjoxLjIsXHJcbiBcIndpZHRoXCI6MTZcclxufSIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IERpYWxvZyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9EaWFsb2cnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9DZW50ZXIgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgXHJcbiAgICBzdXBlcihcImNlbnRlclwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNztcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRpYWxvZ1wiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG4gICAgICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICBpd2NfYnIsICAgIGYxLCAgICBpd2NfYmwsICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMiwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y19iciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y19ibCBdLFxyXG4gICAgICBbIGYxLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgaXdjX3RyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX3RsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYyLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjIsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICAgICB3YiwgICAgd2IsICAgICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF9sZiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ2xpZmUnIH07XHJcbiAgICBsZXQgdHBfZW5lbXkgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgdGFyZ2V0U3RhZ2U6ICdlbmVteScgfTtcclxuICAgIGxldCB0cF9kb29ycyA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwibGVmdFwiLCAgIHRhcmdldFN0YWdlOiAnZG9vcnMnIH07XHJcbiAgICBcclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIFxyXG4gICAgbGV0IGJyZDIgPSB7IG5hbWU6IFwiZGlhbG9nXCIsIHR5cGU6IFwiY2VudGVyX2xlZnRfbm90aWNlXCJ9O1xyXG4gICAgbGV0IGJyZDMgPSB7IG5hbWU6IFwiZGlhbG9nXCIsIHR5cGU6IFwiY2VudGVyX3RvcF9ub3RpY2VcIn07XHJcbiAgICBsZXQgYnJkNCA9IHsgbmFtZTogXCJkaWFsb2dcIiwgdHlwZTogXCJjZW50ZXJfcmlnaHRfbm90aWNlXCJ9O1xyXG4gICAgbGV0IGJyZHcgPSB7IG5hbWU6IFwiZGlhbG9nXCIsIHR5cGU6IFwiY2VudGVyX3dlbGNvbWVcIn07XHJcbiAgICBcclxuICAgIGxldCBmYyA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiZmVuY2VcIn07XHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfbGYsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJyZDMsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgYnJkMiwgICBmYWxzZSwgICAgZmFsc2UsICAgZmMsICAgICAgZmMsICAgICAgZmMsICAgICBmYywgICAgICBmYywgICAgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICAgYnJkNCwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgYnJkdywgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF9kb29ycyxmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2VuZW15IF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgZmFsc2UsICAgICAgZmMsICAgICAgZmMsICAgZmMsICAgICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRibCwgICAgIHRiciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgdHRsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHR0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfcmlnaHRcIiB9OyAgXHJcbiAgICBsZXQgdG1sID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRtciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfcmlnaHRcIiB9OyAgXHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0dGwsICAgICB0dHIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdG1sLCAgICAgdG1yLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCJjb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IERvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRG9vcicpO1xyXG5jb25zdCBLZXkgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vS2V5Jyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgT2JqZWN0X1B1c2ggPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1B1c2gnKTtcclxuY29uc3QgRGlhbG9nID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0RpYWxvZycpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0Rvb3JzIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiZG9vcnNcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IDA7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImtleVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgS2V5KGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkgKTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfdGhyb3dcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9UaHJvdyhpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF9wdXNoXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfUHVzaChpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRpYWxvZ1wiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2coaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y19ibCBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX3RsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICAgICB3YiwgICAgd2IsICAgICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiAnZmlyZScsIHR5cGU6ICcwMSd9OyBcclxuXHJcbiAgICBsZXQgZW5lbXkgPSB7IG5hbWU6ICdlbmVteScsIHR5cGU6ICcwMSd9OyBcclxuICAgIGxldCBibm5hID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiYW5hbmEnfTsgXHJcbiAgICBsZXQgYmVycnkgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JlcnJ5J307IFxyXG5cclxuICAgIGxldCBicnJsID0geyBuYW1lOiAnb2JqZWN0X3Rocm93JywgdHlwZTogJ2JhcnJlbCd9OyBcclxuICAgIGxldCBzdG5lID0geyBuYW1lOiAnb2JqZWN0X3B1c2gnLCB0eXBlOiAnc3RvbmUnfTsgXHJcblxyXG4gICAgbGV0IGZuY2UgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImZlbmNlXCJ9O1xyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ3JpZ2h0JywgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IGRnYmwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV9ibCd9OyBcclxuICAgIGxldCBkZ3RsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyYXlfdGwnfTsgXHJcbiAgICBsZXQgZGdiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X2JyJ307IFxyXG4gICAgbGV0IGRndHIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV90cid9OyBcclxuICAgIFxyXG4gICAgbGV0IGRwYmwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX2JsJ307IFxyXG4gICAgbGV0IGRwdGwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX3RsJ307IFxyXG4gICAgbGV0IGRwYnIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX2JyJ307IFxyXG4gICAgbGV0IGRwdHIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX3RyJ307IFxyXG4gICAgXHJcbiAgICBsZXQgZHJibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfYmwnfTsgXHJcbiAgICBsZXQgZHJ0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfdGwnfTsgXHJcbiAgICBsZXQgZHJiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfYnInfTsgXHJcbiAgICBsZXQgZHJ0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfdHInfTsgXHJcbiAgICBcclxuICAgIGxldCBkZ3JibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl9ibCd9OyBcclxuICAgIGxldCBkZ3J0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl90bCd9OyBcclxuICAgIGxldCBkZ3JiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl9icid9OyBcclxuICAgIGxldCBkZ3J0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl90cid9OyBcclxuXHJcbiAgICBsZXQga19nID0geyBuYW1lOiAna2V5JywgdHlwZTogJ2dyYXknfTsgXHJcbiAgICBsZXQga19wID0geyBuYW1lOiAna2V5JywgdHlwZTogJ3B1cnBsZSd9OyBcclxuICAgIGxldCBrX3IgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAncmVkJ307IFxyXG4gICAgbGV0IGtfZ3IgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAnZ3JlZW4nfTsgXHJcbiAgICBcclxuICAgIGxldCBnbnRjID0geyBuYW1lOiBcImRpYWxvZ1wiLCB0eXBlOiBcImRvb3JzX2dyYXR6X25vdGljZVwifTtcclxuXHJcbiAgICBsZXQgaXRlbXNCb3R0b20gPSBbXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGtfciwgICAgIGZhbHNlLCAgIGZuY2UsICAgIGtfZywgICAgIGZhbHNlLCAgIGZuY2UsICAgIGtfcCwgICAgZmFsc2UsICAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGdudGMsICAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGRndGwsICAgIGRndHIsICAgIGZuY2UsICAgIGRwdGwsICAgIGRwdHIsICAgIGZuY2UsICAgIGRydGwsICAgIGRydHIsICAgIGZuY2UsICAgIGRncnRsLCAgIGRncnRyLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmbmNlLCAgIGRnYmwsICAgIGRnYnIsICAgIGZuY2UsICAgIGRwYmwsICAgIGRwYnIsICAgIGZuY2UsICAgIGRyYmwsICAgIGRyYnIsICAgIGZuY2UsICAgIGRncmJsLCAgIGRncmJyLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJycmwsICAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfRG9vcnM7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuY29uc3QgRW5lbXkgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRW5lbXknKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgT2JqZWN0X1B1c2ggPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1B1c2gnKTtcclxuY29uc3QgS2V5ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0tleScpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0VuZW15IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiZW5lbXlcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJlbmVteVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRW5lbXkoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhlYWxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEhlYWwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfdGhyb3dcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9UaHJvdyhpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF9wdXNoXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfUHVzaChpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImtleVwiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBLZXkoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSApOyBcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y19iciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgZjEsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfdHIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIHdiLCAgICAgICAgd2IsICAgIHdiLCAgICAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcblxyXG4gICAgbGV0IGVuZW15ID0geyBuYW1lOiAnZW5lbXknLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG4gICAgbGV0IGJlcnJ5ID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiZXJyeSd9OyBcclxuXHJcbiAgICBsZXQgYnJybCA9IHsgbmFtZTogJ29iamVjdF90aHJvdycsIHR5cGU6ICdiYXJyZWwnfTsgXHJcbiAgICBsZXQgc3RuZSA9IHsgbmFtZTogJ29iamVjdF9wdXNoJywgdHlwZTogJ3N0b25lJ307IFxyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ2xlZnQnLCB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IGtfZ3IgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAnZ3JlZW4nfTsgXHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAga19nciwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZW5lbXksICAgZW5lbXksICAgZW5lbXksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZW5lbXksICAgZmFsc2UsICAgZW5lbXksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGVuZW15LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBmYWxzZSwgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwX2MsICAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGJycmwsICAgZmFsc2UsICAgc3RuZSwgICAgZmFsc2UsICAgYnJybCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgYnJybCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF07XHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgaXRlbXNCb3R0b20ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9FbmVteTsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9MaWZlIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwibGlmZVwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNztcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhlYWxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEhlYWwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgICAgd3QsICAgIHd0LCAgICAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgaXdjX3RyLCAgICBmMSwgICBpd2NfdGwsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiAnZmlyZScsIHR5cGU6ICcwMSd9OyBcclxuICAgIGxldCBibm5hID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiYW5hbmEnfTsgXHJcbiAgICBsZXQgYmVycnkgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JlcnJ5J307IFxyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ2JvdHRvbScsICAgICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuXHJcbiAgICBsZXQgaXRlbXNCb3R0b20gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmaXJlLCAgICBibm5hLCAgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgYmVycnksICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZpcmUsICAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBiZXJyeSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgIGZpcmUsICAgIGZpcmUsICAgIGZpcmUsICAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBiZXJyeSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfYywgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF07XHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgaXRlbXNCb3R0b20ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9MaWZlOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX0Zsb29yIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIkJlYWNoIEZsb29yXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogZmFsc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcIjAxXCI6XHJcbiAgICAgIGNhc2UgXCJzYW5kXzAxXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI0OSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDJcIjpcclxuICAgICAgY2FzZSBcInNhbmRfMDJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoOTMwKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29sbGlzaW9uKHBsYXllcil7IFxyXG4gICAgcGxheWVyLnNldFRlbGVwb3J0aW5nKGZhbHNlKTtcclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEJlYWNoX0Zsb29yOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX3dhbGwgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggV2FsbFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogZmFsc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg3Myk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJsZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJyaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDExKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg3OCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDc5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ3YXRlclwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg2MzMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JzdGFjbGVcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjUwKTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmZW5jZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzEyKTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI0KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNSk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9taWRkbGVfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMTApO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDg3KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE0OCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uIFNpemVcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbldpZHRoKCB0aGlzLmNodW5rU2l6ZSAqIDAuMyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCh0aGlzLnggKyB0aGlzLmNodW5rU2l6ZSAqIDAuNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNDkpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvbiBTaXplXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25XaWR0aCggdGhpcy5jaHVua1NpemUgKiAwLjMgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRpYWxvZ1wiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxODA4KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF93YWxsOyIsImNvbnN0IF9EaWFsb2dUcmlnZ2VyID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fRGlhbG9nJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgRGlhbG9nIGV4dGVuZHMgX0RpYWxvZ1RyaWdnZXIge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlKSB7XHJcblx0XHJcblx0bGV0IHByb3BzID0ge1xyXG5cdCAgbmFtZTogXCJkaWFsb2dcIixcclxuXHQgIHR5cGU6IHR5cGUsXHJcblx0ICBzdGFnZTogc3RhZ2VcclxuXHR9XHJcblxyXG5cdGxldCBwb3NpdGlvbiA9IHtcclxuXHQgIHg6IHgwLFxyXG5cdCAgeTogeTBcclxuXHR9XHJcblxyXG5cdGxldCBkaW1lbnNpb24gPSB7XHJcblx0ICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcblx0ICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcblx0fVxyXG5cclxuXHRsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG5cdGxldCBldmVudHMgPSB7XHJcblx0ICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcblx0ICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG5cdH1cclxuXHRcclxuXHRzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIHsgZnJvbVNhdmVTdGF0ZTogZmFsc2UgfSk7XHJcblxyXG5cdHRoaXMudHlwZSA9ICdkaWFsb2cnO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcblx0XHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcblx0XHRzd2l0Y2godHlwZSkge1xyXG5cdFx0XHRjYXNlICdjZW50ZXJfd2VsY29tZSc6XHJcblx0XHRcdFx0dGhpcy5zZXREaWFsb2coXHJcblx0XHRcdFx0XHRbXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIldlbGNvbWUgdG8gR3VmaXRydXAgbXkgZnJpZW5kIVwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIldhbGsgYXJvdW5kIGFuZCBmZWVsIGZyZWUgdG8gdGVzdCB0aGlzIGdhbWUuXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiSWYgeW91IGZpbmQgYW55IGJ1Z3MuLi5cIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCIuLi5zb3JyeSA+LjwgXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiQnV0IGxldCBtZSBrbm93IHdoYXQgeW91J3ZlIGZvdW5kLCBwbGVhc2UhXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiSGF2ZSBmdW4gOkRcIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIlwiXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdF1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiY2VudGVyX2xlZnRfbm90aWNlXCI6XHJcblx0XHRcdFx0dGhpcy5zZXREaWFsb2coXHJcblx0XHRcdFx0XHRbXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIktleXMgYW5kIERvb3JzXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRdXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJjZW50ZXJfdG9wX25vdGljZVwiOlxyXG5cdFx0XHRcdHRoaXMuc2V0RGlhbG9nKFxyXG5cdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJGaXJlIGFuZCBIZWFsdGggaXRlbXNcIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogdHJ1ZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIlwiXHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdF1cclxuXHRcdFx0XHQpO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImNlbnRlcl9yaWdodF9ub3RpY2VcIjpcclxuXHRcdFx0XHRcdHRoaXMuc2V0RGlhbG9nKFxyXG5cdFx0XHRcdFx0XHRbXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBcIiEhIERBTkdFUiAhIVwiXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHRcdHRleHQ6IFwiRW5lbXlzIGFuZCBCYXJyZWxzXCJcclxuXHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBcIlwiXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRdXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiZG9vcnNfZ3JhdHpfbm90aWNlXCI6XHJcblx0XHRcdFx0XHR0aGlzLnNldERpYWxvZyhcclxuXHRcdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogXCJZb3UgZGlkIGl0ISA6RFwiXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0XHJcbiAgfVxyXG5cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRGlhbG9nOyIsImNvbnN0IF9DYW5Db2xsZWN0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuQ29sbGVjdCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBfQ2FuQ29sbGVjdCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2UpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcImRvb3JcIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgc3RhZ2U6IHN0YWdlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBjYW5Db2xsZWN0UHJvcHMgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSAnZG9vcic7XHJcblxyXG4gICAgdGhpcy5vcGVuU291bmQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgICB0aGlzLmluaXRTb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICAjIFNvdW5kc1xyXG4gICovXHJcbiAgaW5pdFNvdW5kcygpIHtcclxuICAgIC8vIE9wZW5cclxuICAgIHRoaXMub3BlblNvdW5kID0gbmV3IEhvd2woeyBzcmM6IFsnLi9zb3VuZHMvc2NlbmFyaW9zL2Rvb3Itb3Blbi5tcDMnXSwgdm9sdW1lOiAwLjQgfSk7XHJcbiAgfVxyXG5cclxuICBjaGVja1NhdmVkSXRlbVN0YXRlKCkge1xyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKSApOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICkge1xyXG4gICAgICBsZXQgaXRlbVNhdmVkU3RhdGUgPSBzYXZlZEl0ZW1zU3RhdGVbdGhpcy5nZXROYW1lKCldO1xyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuY29sbGVjdGVkID09PSB0cnVlICl7IC8vIENoZWNrIGlmIHRoaXMgaXRlbSBpcyBhbHJlYWR5IGdyYWJiZWRcclxuICAgICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAvLyBHcmF5XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxMyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1MSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfdHJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Mik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIC8vIFB1cnBsZVxyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE1KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcHVycGxlX3RsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Myk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV9iclwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAvLyBSZWRcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9yZWRfYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgLy8gR3JlZW5cclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmVlbl90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMyMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcblxyXG4gIC8vIE9wZW4gZG9vciA9IGhpZGUgYWxsIGRvb3JzIHdpdGggc2FtZSBjb2RlIFxyXG4gIG9wZW4oKSB7XHJcbiAgICBsZXQgb2JqcyA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5nZXRDb2xJdGVucygpO1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmpzKSB7XHJcbiAgICAgIGlmKCBvYmpzW2ldLnR5cGUgPT0gJ2Rvb3InICkge1xyXG4gICAgICAgIGlmKCBvYmpzW2ldLmdldENvZGUoKSA9PSB0aGlzLmdldENvZGUoKSApIHtcclxuICAgICAgICAgIHRoaXMub3BlblNvdW5kLnBsYXkoKTtcclxuICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXlTdWNjZXNzU291bmQoKTtcclxuICAgICAgICAgIG9ianNbaV0uY29sbGVjdCgpO1xyXG4gICAgICAgICAgb2Jqc1tpXS5oaWRlKCk7XHJcbiAgICAgICAgICBvYmpzW2ldLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBEb29yOyIsImNvbnN0IF9DYW5IdXJ0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuSHVydCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEVuZW15IGV4dGVuZHMgX0Nhbkh1cnQge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJlbmVteVwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBzdGFnZTogc3RhZ2VcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDJcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5IdXJ0UHJvcHMgPSB7XHJcbiAgICAgIGFtb3VudDogMVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCB7fSwgZXZlbnRzLCBjYW5IdXJ0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAxO1xyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IDE7XHJcbiAgICBcclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcbiAgICB0aGlzLmNvbGxpc2lvblkgPSB5MCArIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uQ291bnQgPSAwO1xyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzcHJpdGUgRlBTIEFuaW1hdGlvblxyXG4gICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAoIHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5mcHMgLyAyICk7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZSA9IG5ldyBTcHJpdGUoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfZW5lbXknKSwgMzAwLCA5NjAsIDIwLCA0MCk7XHJcblxyXG4gICAgdGhpcy5zdGVwID0gbmV3IE9iamVjdCgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICB0aGlzLmluaXRpYWxTdGVwID0gMjtcclxuICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgIHRoaXMubWF4U3RlcHMgPSA0O1xyXG5cclxuICAgIHRoaXMuZGlyZWN0aW9uQ291bnRkb3duID0gMDtcclxuICAgIHRoaXMucmFuZERpcmVjdGlvbiA9IDE7XHJcblxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDA7XHJcbiAgICB0aGlzLnkgPSB5MDtcclxuICAgIFxyXG4gICAgdGhpcy54MCA9IHgwOyAvLyBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICB0aGlzLnkwID0geTA7XHJcbiAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMuc3BlZWQwID0gMC4yO1xyXG4gICAgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplICogdGhpcy5zcGVlZDA7XHJcbiAgICB0aGlzLnR5cGUgPSBcImVuZW15XCI7XHJcbiAgICBcclxuICAgIC8vICMgTGlmZVxyXG4gICAgdGhpcy5kZWZhdWx0TGlmZXMgPSAyO1xyXG4gICAgdGhpcy5saWZlcyA9IHRoaXMuZGVmYXVsdExpZmVzO1xyXG4gICAgdGhpcy5kZWFkID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0b3BSZW5kZXJpbmdNZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICB0aGlzLmh1cnRDb29sRG93blRpbWUgPSAxMDAwOyAvLzJzXHJcblxyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlMCA9IDU7XHJcbiAgICB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2UgPSB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2UwO1xyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2U7XHJcblxyXG4gICAgdGhpcy5hd2FyZU9mUGxheWVyID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy54RnJvbVBsYXllckRpc3RhbmNlID0gMDtcclxuICAgIHRoaXMuWUZyb21QbGF5ZXJEaXN0YW5jZSA9IDA7XHJcblxyXG4gICAgdGhpcy5kZWF0aFNvdW5kID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pbml0U291bmRzKCk7XHJcblxyXG4gICAgdGhpcy5ydW5FbmVteSgpO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgICMgU291bmRzXHJcbiAgKi9cclxuICBpbml0U291bmRzKCkge1xyXG4gICAgXHJcbiAgICAvLyBVc2VcclxuICAgIHRoaXMuZGVhdGhTb3VuZCA9IG5ldyBIb3dsKHsgc3JjOiBbJy4vc291bmRzL2VuZW15L2RlYXRoLm1wMyddIH0pO1xyXG5cclxuICB9XHJcblxyXG4gIGlzRGVhZCgpIHsgcmV0dXJuIHRoaXMuZGVhZDsgfVxyXG4gIHNldERlYWQoYm9vbCkgeyB0aGlzLmRlYWQgPSBib29sOyB9XHJcblxyXG4gIG5lZWRTdG9wUmVuZGVyaW5nTWUoKSB7IHJldHVybiB0aGlzLnN0b3BSZW5kZXJpbmdNZTsgfVxyXG4gIHNldFN0b3BSZW5kZXJpbmdNZShib29sKSB7IHRoaXMuc3RvcFJlbmRlcmluZ01lID0gYm9vbDsgfVxyXG5cclxuICBpc0F3YXJlT2ZQbGF5ZXIoKSB7IHJldHVybiB0aGlzLmF3YXJlT2ZQbGF5ZXI7IH1cclxuICBzZXRBd2FyZU9mUGxheWVyKGJvb2wpIHsgdGhpcy5hd2FyZU9mUGxheWVyID0gYm9vbDsgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2JsdWUnOlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgICAgICAvLyBDb2xsaXNpb25cclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbkhlaWdodCh0aGlzLmNvbGxpc2lvbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKHRoaXMuY29sbGlzaW9uWSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNldFNwcml0ZVByb3BzRnJhbWUoc3ByaXRlQW5pbWF0aW9uQ291bnQpe1xyXG4gICAgc3dpdGNoKHNwcml0ZUFuaW1hdGlvbkNvdW50KSB7IFxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlLmdldEtleVdpZHRoKCksIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlLmdldEtleUhlaWdodCgpIFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyBzdGF0ZSBmb3IgZW5lbXkgZGlyZWN0aW9uXHJcbiAgbG9va0Rvd24oKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2Rvd24nO1xyXG4gICAgXHJcbiAgICAvLyBTdGVwc1xyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gIH1cclxuICBcclxuICBsb29rVXAoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTUpO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTYpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTcpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTgpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuICBcclxuICBsb29rUmlnaHQoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzApO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuICAgICAgXHJcbiAgbG9va0xlZnQoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzQpO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzUpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzYpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzcpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuXHJcbiAgZHlpbmcoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2R5aW5nJztcclxuICAgICAgICBcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQwKTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQyKTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQzKTtcclxuICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQ0KTtcclxuICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDI5KTsgLy8gZW1wdHkgZnJhbWVcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICB9XHJcblxyXG4gIC8vICMgTW92ZW1lbnRcclxuICBtb3ZMZWZ0KGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgICBcclxuICBtb3ZSaWdodChpZ25vcmVDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdlVwKGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdkRvd24oaWdub3JlQ29sbGlzaW9uKSB7ICBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gIG1vdlRvRGVhdGgoaWdub3JlQ29sbGlzaW9uKSB7XHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmR5aW5nKCkgKTtcclxuICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgLy8gIyBTZXRzXHJcbiAgICAgIFxyXG4gIHNldFgoeCwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy54ID0geDsgXHJcbiAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25YKCB4ICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSApO1xyXG4gIH1cclxuICBzZXRZKHksIHNldENvbGxpc2lvbikgeyBcclxuICAgIHRoaXMueSA9IHk7IFxyXG4gICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWSggeSArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgKTtcclxuICB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgIFxyXG4gIHNldFNwZWVkKHNwZWVkKSB7IHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHNwZWVkOyB9XHJcblxyXG4gIHNldExvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbikgeyB0aGlzLmxvb2tEaXJlY3Rpb24gPSBsb29rRGlyZWN0aW9uOyB9XHJcbiAgdHJpZ2dlckxvb2tEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRQb3NpdGlvbigpIHtcclxuICAgIHRoaXMuc2V0WCggdGhpcy54MCApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuY29sbGlzaW9uWDAgKTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5jb2xsaXNpb25ZMCApO1xyXG4gIH1cclxuXHJcbiAgaHVydCggYW1vdW50ICkge1xyXG4gICAgaWYoIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICBcclxuICAgICAgLy8gSHVydCBwbGF5ZXJcclxuICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMCApIHRoaXMubGlmZXMgPSAwO1xyXG5cclxuICAgICAgLy8gU3RhcnQgY29vbGRvd25cclxuICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgfSwgdGhpcy5odXJ0Q29vbERvd25UaW1lKTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHBsYXllciBkaWVkXHJcbiAgICAgIHRoaXMuY2hlY2tNeURlYXRoKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjaGVja015RGVhdGgoKSB7XHJcbiAgICBpZiggdGhpcy5saWZlcyA8IDEgKSB7XHJcbiAgICAgIHRoaXMuc2V0RGVhZCh0cnVlKTtcclxuICAgICAgdGhpcy5kZWF0aFNvdW5kLnBsYXkoKTtcclxuICAgICAgaWYoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwiZHlpbmdcIikgdGhpcy5zdGVwQ291bnQgPSAxOyAvLyBJZiBpdCdzIG5vdCBkeWluZywgcmVzZXQgYW5pbWF0aW9uIHN0ZXBcclxuICAgICAgdGhpcy5zZXRTcGVlZCgxLjMpOyAvLyBJbmNyZWFzZSBzcGVlZFxyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7IC8vIFByZXZlbnQgZW5lbXkgaHVydGluZyBwbGF5ZXIgd2hlbiBpbiBkZWF0aCBhbmltYXRpb25cclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDY7XHJcbiAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gODtcclxuICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICMgR2V0c1xyXG4gIFxyXG4gIGdldExpZmVzKCkgeyByZXR1cm4gdGhpcy5saWZlczsgfVxyXG4gIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgXHJcbiAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25IZWlnaHQ7IH1cclxuICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gIGdldENvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25ZOyB9XHJcblxyXG4gIGdldENlbnRlclgoIF94ICkgeyAvLyBNYXkgZ2V0IGEgY3VzdG9tIGNlbnRlclgsIHVzZWQgdG8gY2hlY2sgYSBmdXR1cmUgY29sbGlzaW9uXHJcbiAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICByZXR1cm4geCArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDI7IFxyXG4gIH1cclxuICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICBsZXQgeSA9ICggX3kgKSA/IF95IDogdGhpcy5nZXRDb2xsaXNpb25ZKCk7XHJcbiAgICByZXR1cm4geSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyBcclxuICB9XHJcbiAgICBcclxuICBnZXRDb2xvcigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuICBnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuICAgIFxyXG4gIGdldFNwcml0ZVByb3BzKCkgeyByZXR1cm4gdGhpcy5zcHJpdGVQcm9wczsgfVxyXG4gICAgXHJcbiAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgIC8vRG9uJ3QgcmVzZXQgaWYgaXQncyBpbiBkZWF0aCBhbmltYXRpb25cclxuICAgICAgaWYoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID09IFwiZHlpbmdcIiApIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMubWF4U3RlcHM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJlc2V0U3RlcCgpIHtcclxuICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICdsZWZ0JzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndXAnOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGhpZGVNZSgpIHsgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgfVxyXG4gIHNob3coKSB7IHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlOyB9XHJcbiAgXHJcbiAgLy8gIyBFbmVteSBSZW5kZXIgICAgXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5uZWVkU3RvcFJlbmRlcmluZ01lKCkgKSByZXR1cm47XHJcblxyXG4gICAgLy8gQmxpbmsgRW5lbXkgaWYgaXQgY2FuJ3QgYmUgaHVydFxyXG4gICAgaWYoICEgdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgIHRoaXMuaGlkZVNwcml0ZSA9ICF0aGlzLmhpZGVTcHJpdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICYmIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwiZHlpbmdcIiAgKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hhdCB0byBkbyBldmVyeSBmcmFtZSBpbiB0ZXJtcyBvZiByZW5kZXI/IERyYXcgdGhlIGVuZW15XHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICB0aGlzLnNwcml0ZS5nZXRTcHJpdGUoKSwgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgdGhpcy5zcHJpdGUuZ2V0S2V5V2lkdGgoKSwgdGhpcy5zcHJpdGUuZ2V0S2V5SGVpZ2h0KCksIFxyXG4gICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICApO1x0XHJcblxyXG4gICAgLy8gUGxheWVyIEF3YXJlbmVzcyBcclxuICAgIGlmKCB0aGlzLmlzQXdhcmVPZlBsYXllcigpICkge1xyXG4gICAgICBjdHguZm9udCA9ICBcIjUwcHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCIjQ0MwMDAwXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggXCIhXCIsIHRoaXMuZ2V0WCgpICsgKCB0aGlzLmNodW5rU2l6ZSAqIDAuMDMgKSwgdGhpcy5nZXRZKCkgKyAoIHRoaXMuY2h1bmtTaXplICogMC4zICkgKTsgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gREVCVUcgQ09MTElTSU9OXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMjU1LCAwLjQpXCI7XHJcbiAgICAgIGN0eC5maWxsUmVjdCggdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuXHJcbiAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIE1hdGgucm91bmQodGhpcy5nZXRYKCkpICsgXCIgWTpcIiArIE1hdGgucm91bmQodGhpcy5nZXRZKCkpO1xyXG4gICAgICBjdHguZm9udCA9ICBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSA2MCk7IFxyXG5cclxuICAgICAgdGV4dCA9IFwiZFg6IFwiICsgTWF0aC5yb3VuZCggdGhpcy54RnJvbVBsYXllckRpc3RhbmNlICkgKyBcIiBkWTpcIiArIE1hdGgucm91bmQoIHRoaXMuWUZyb21QbGF5ZXJEaXN0YW5jZSApO1xyXG4gICAgICBjdHguZm9udCA9ICBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSAyMCk7IFxyXG4gICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gIH07XHJcblxyXG4vLyAjIEVuZW15IEJyYWluXHJcbiAgZW5lbXlCcmFpbigpIHtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBlbmVteSBpcyBpbiB0aGUgc2FtZSBzdGFnZSBhcyBvcmlnaW5hbCBzdGFnZSwgaWYgbm90LCBkb24ndFxyXG4gICAgaWYoIHRoaXMub3JpZ2luYWxTdGFnZSAhPSB3aW5kb3cuZ2FtZS5nZXRDdXJyZW50U3RhZ2UoKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0dhbWVSZWFkeSgpICYmIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBEZWFkIGJlaGF2aW9yL2FuaW1hdGlvblxyXG4gICAgICBpZiggdGhpcy5pc0RlYWQoKSApIHtcclxuICAgICAgICBcclxuICAgICAgICAvL1doaWxlIG5vdCBvdXQgb2Ygc2NyZWVuXHJcbiAgICAgICAgaWYoIHRoaXMuZ2V0WCgpIDwgd2luZG93LmdhbWUuZ2FtZVByb3BzLmNhbnZhc1dpZHRoICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBTdGFydCBtb3Zpbmcgb3V0IG9mIHNjcmVlblxyXG4gICAgICAgICAgdGhpcy5tb3ZUb0RlYXRoKHRydWUpOyAvLyB0cnVlID0gaWdub3JlIGNvbGxpc2lvbiBjaGVja1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIE9rLCB0aGUgZW5lbXkgaXMgZGVhZCwgc3RvcCByZW5kZXJpbmcgbm93XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BSZW5kZXJpbmdNZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIH0gZWxzZSB7IC8vICMgTm90IGRlYWRcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBuZWFyIGVub3VnaCBvZiBwbGF5ZXIgdG8gZ28gaW4gaGlzIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCBuZWFyUGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgd2luZG93LmdhbWUucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGRpc3RhbmNlIGJldHdlZW4gZW5lbXkgYW5kIHBsYXllclxyXG4gICAgICAgICAgdGhpcy54RnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWCgpIC0gcGxheWVyLmdldENlbnRlclgoKSApO1xyXG4gICAgICAgICAgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWSgpIC0gcGxheWVyLmdldENlbnRlclkoKSApO1xyXG4gICAgICAgICAgLy9JZiBib3RoIGRpc3RhbmNlIGFyZSBiZWxvdyB0aGUgYXdhcmUgZGlzdGFuY2UsIHNldCB0aGlzIHBsYXllciB0byBiZSB0aGUgbmVhciBwbGF5ZXJcclxuICAgICAgICAgIGlmKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgPCB0aGlzLnBsYXllckF3YXJlRGlzdGFuY2UgJiYgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlIDwgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBuZWFyUGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgICBpZiggbmVhclBsYXllciApIHtcclxuXHJcbiAgICAgICAgICAvLyAjIFdhbGsgaW4gcGxheWVyIGRpcmVjdGlvblxyXG4gICAgICAgICAgdGhpcy5zZXRBd2FyZU9mUGxheWVyKHRydWUpO1xyXG5cclxuICAgICAgICAgIC8vIHBvc2l0aW9uc1xyXG4gICAgICAgICAgbGV0IFhlID0gdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgICAgICBsZXQgWWUgPSB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuXHJcbiAgICAgICAgICBsZXQgWHAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblgoKTsgXHJcbiAgICAgICAgICBsZXQgWXAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblkoKTsgXHJcblxyXG4gICAgICAgICAgbGV0IFhkaXN0YW5jZSA9IE1hdGguYWJzKFhlIC0gWHApOy8vIElnbm9yZSBpZiB0aGUgcmVzdWx0IGlzIGEgbmVnYXRpdmUgbnVtYmVyXHJcbiAgICAgICAgICBsZXQgWWRpc3RhbmNlID0gTWF0aC5hYnMoWWUgLSBZcCk7XHJcblxyXG4gICAgICAgICAgLy8gd2hpY2ggZGlyZWN0aW9uIHRvIGxvb2tcclxuICAgICAgICAgIGxldCBYZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIGxldCBZZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgWGRpcmVjdGlvbiA9ICggWGUgPj0gWHAgKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgICBZZGlyZWN0aW9uID0gKCBZZSA+PSBZcCApID8gJ3VwJyA6ICdkb3duJztcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gd2hlcmUgdG8gZ29cclxuICAgICAgICAgIGxldCBnb1RvRGlyZWN0aW9uID0gKCBYZGlzdGFuY2UgPiBZZGlzdGFuY2UgKSA/IFhkaXJlY3Rpb24gOiBZZGlyZWN0aW9uO1xyXG5cclxuICAgICAgICAgIC8vIElmIGhhcyBjb2xsaWRlZCBhIGxvdCwgY2hhbmdlIGRpcmVjdGlvbiB0byBhdm9pZCBnZXR0aW5nIHN0dWNrXHJcbiAgICAgICAgICBpZiggdGhpcy5jb2xsaXNpb25Db3VudCA+IDIwICkge1xyXG4gICAgICAgICAgICAvLyBTdG9wIGdvaW5nIG9uIHRoYXQgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIFRPRE86IFRoaW5rIGFib3V0IGl0ISFcclxuICAgICAgICAgICAgKi9cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gbW92ZVxyXG4gICAgICAgICAgc3dpdGNoKCBnb1RvRGlyZWN0aW9uICkge1xyXG4gICAgICAgICAgICBjYXNlICd1cCc6ICAgIHRoaXMubW92VXAoKTsgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzogdGhpcy5tb3ZSaWdodCgpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZG93bic6ICB0aGlzLm1vdkRvd24oKTsgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzogIHRoaXMubW92TGVmdCgpOyAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gIyBmYXIgZnJvbSBwbGF5ZXIsIHNvIGtlZXAgcmFuZG9tIG1vdmVtZW50XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgc3RvcGVkIHRoZSBtb3ZlIGV2ZW50XHJcbiAgICAgICAgICBpZiggdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPD0gMCApIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kRGlyZWN0aW9uID0gIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpICsgMTsgLy8gMSAtIDRcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPSAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMTA7IC8vIDEgLSA0XHJcbiAgICAgICAgICAgIC8vdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gTW92ZSBkaXJlY3Rpb24gbmVlZGVkXHJcbiAgICAgICAgICBzd2l0Y2goIHRoaXMucmFuZERpcmVjdGlvbiApIHtcclxuICAgICAgICAgICAgY2FzZSAxOiB0aGlzLm1vdlVwKCk7ICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiB0aGlzLm1vdlJpZ2h0KCk7ICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiB0aGlzLm1vdkRvd24oKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OiB0aGlzLm1vdkxlZnQoKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA1OiAvLyBtb3JlIGNoYW5jZXMgdG8gZG9uJ3QgbW92ZVxyXG4gICAgICAgICAgICBjYXNlIDY6IFxyXG4gICAgICAgICAgICBjYXNlIDc6IFxyXG4gICAgICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7IGJyZWFrOyAvLyBkb24ndCBtb3ZlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24tLTtcclxuICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH0gLy8gaWYgZGVhZFxyXG5cclxuICAgIH0vL2lmIGdhbWUgcmVhZHlcclxuICAgIFxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmVuZW15QnJhaW4uYmluZCh0aGlzKSApO1xyXG4gIH1cclxuXHJcbi8vICMgQ29sbGlzaW9uXHJcblxyXG4gIGNvbGxpc2lvbihvYmopeyBcclxuICAgIGlmKCBvYmoudHlwZSA9PSBcInBsYXllclwiICkge1xyXG4gICAgICBvYmouaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IHBsYXllclxyXG4gICAgfVxyXG4gICAgdGhpcy5jb2xsaXNpb25Db3VudCsrO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBcclxuICBcclxuICAvLyBIYXMgYSBjb2xsaXNpb24gRXZlbnQ/XHJcbiAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgc3RvcElmQ29sbGlzaW9uKCkgeyByZXR1cm4gdGhpcy5zdG9wT25Db2xsaXNpb247IH1cclxuXHJcbiAgcnVuRW5lbXkoKSB7XHJcbiAgICAvLyBjaGFuZ2UgbG9vayBkaXJlY3Rpb25cclxuICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuXHJcbiAgICAvL3N0YXJ0IGFsZ29yaXRtIHRoYXQgbW92ZXMgcGxheWVyXHJcbiAgICB0aGlzLmVuZW15QnJhaW4oKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15OyIsImNvbnN0IF9DYW5IdXJ0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuSHVydCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEZpcmUgZXh0ZW5kcyBfQ2FuSHVydCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiRmlyZVwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkh1cnRQcm9wcyA9IHtcclxuICAgICAgYW1vdW50OiAxXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5IdXJ0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAzO1xyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQpICsgMTsgLy8gR2VuZXJhdGUgYSByYW5kIGluaXRpYWwgbnVtYmVyIHRvIHJhbmRvbWl6ZSBhbmltYXRpb24gaW4gY2FzZSBvZiBtdWx0aXBsZSBGaXJlc1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMC40OyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyAoIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMC42KTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIGxldCByYW5kRlBTID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNykgKyA1OyAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBGUFMsIHNvIG11bHRpcGxlIEZpcmVzIG9uIHBhZ2UgZG9uJ3QgYW5pbWF0ZSB0aGUgc2FtZSB3YXkgXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIHJhbmRGUFM7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25IZWlnaHQodGhpcy5jb2xsaXNpb25IZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh0aGlzLmNvbGxpc2lvblkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRTcHJpdGVQcm9wc0ZyYW1lKHNwcml0ZUFuaW1hdGlvbkNvdW50KXtcclxuICAgIHN3aXRjaChzcHJpdGVBbmltYXRpb25Db3VudCkgeyBcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNzM2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNzM3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNzM4KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgYmVmb3JlUmVuZGVyKCkge1xyXG4gICAgLy8gQW5pbWF0ZSBmaXJlXHJcbiAgICBpZiggdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCsrO1xyXG4gICAgICBpZiggdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA+IHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgKSB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRmlyZTsiLCJjb25zdCBfQ2FuQ29sbGVjdCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBIZWFsIGV4dGVuZHMgX0NhbkNvbGxlY3Qge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlX2lkKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogc3RhZ2VfaWQgKyBcIl9wb3Rpb25cIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgc3RhZ2U6IHN0YWdlX2lkXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkNvbGxlY3RQcm9wcyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaGFzIHNvbWUgc2F2ZSBzdGF0ZVxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgIGxldCBpdGVtU2F2ZWRTdGF0ZSA9IHNhdmVkSXRlbXNTdGF0ZVt0aGlzLmdldE5hbWUoKV07XHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiAhIHRoaXMuY2FuUmVzcGF3bigpICYmIGl0ZW1TYXZlZFN0YXRlLmNvbGxlY3RlZCA9PT0gdHJ1ZSApeyAvLyBDaGVjayBpZiBoYXMgc2F2ZWQgc3RhdGUgYW5kIGNhbid0IHJlc3Bhd25cclxuICAgICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgfVxyXG5cclxuICBzZXRIZWFsQW1vdXQoYW1vdW50KSB7IHRoaXMuaGVhbEFtb3V0ID0gYW1vdW50OyB9XHJcbiAgZ2V0SGVhbEFtb3VudCgpIHsgcmV0dXJuIHRoaXMuaGVhbEFtb3V0OyB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnYmFuYW5hJzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTc5OCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2JlcnJ5JzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTc5OSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBpZiggIXRoaXMuaXNDb2xsZWN0ZWQoKSApIHtcclxuICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICBwbGF5ZXIuaGVhbFBsYXllciggdGhpcy5nZXRIZWFsQW1vdW50KCkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG4gIC8vIEhhbmRsZSBwcm9wcyB3aGVuIGxvYWRcclxuICBoYW5kbGVQcm9wcygpIHtcclxuICAgIFxyXG4gICAgLy8gU2V0IFByb3BzIGJhc2VkIG9uIHR5cGVcclxuICAgIHN3aXRjaCggdGhpcy5nZXRUeXBlKCkgKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdiYW5hbmEnOlxyXG4gICAgICAgIHRoaXMuc2V0SGVhbEFtb3V0KDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdiZXJyeSc6XHJcbiAgICAgICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpOyAvLyBNYWtlIHRoaXMgaXRlbSBhYmxlIHRvIHNhdmUgc3RhdGVcclxuICAgICAgICB0aGlzLnNldEhlYWxBbW91dCgyKTtcclxuICAgICAgICB0aGlzLnNldENhblJlc3Bhd24oZmFsc2UpOyAvLyBJdCBjYW4ndCByZXNwYXduIGlmIHVzZWRcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWw7IiwiY29uc3QgX0NhblRocm93ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuVGhyb3cnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBLZXkgZXh0ZW5kcyBfQ2FuVGhyb3cge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJrZXlcIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgY2xhc3M6ICdrZXknLFxyXG4gICAgICBzdGFnZTogc3RhZ2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuVGhyb3cgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IGZhbHNlLFxyXG4gICAgICBjaHVuY2tzVGhyb3dEaXN0YW5jZTogMSxcclxuICAgICAgaHVydEFtb3VudDogMCxcclxuICAgICAgdXNlRXZlbnQ6ICd1c2UnXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvdywgZnJvbVNhdmVTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpO1xyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGhhcyBzb21lIHNhdmUgc3RhdGVcclxuICBjaGVja1NhdmVkSXRlbVN0YXRlKCkge1xyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKSApOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICkge1xyXG5cclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBpcyBhbHJlYWR5IGdyYWJiZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmdyYWJiZWQgPT0gdHJ1ZSApeyBcclxuICAgICAgICBpZiggdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgIC8vIEdyYWIgdGhlIGl0ZW0gc2F2ZWRcclxuICAgICAgICAgIHRoaXMuZ3JhYkhhbmRsZXIoIGl0ZW1TYXZlZFN0YXRlLmdyYWJQcm9wcy5wbGF5ZXJXaG9HcmFiYmVkICk7IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHVzZWQgYmVmb3JlXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5jb2xsZWN0ZWQgPT0gdHJ1ZSApIHsgXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuY2FuR3JhYiA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL0NoZWNrIGlmIGl0IHdhcyBkcm9wcGVkXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5kcm9wcGVkID09IHRydWUgKSB7IFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgZHJvcHBlZCBvbiB0aGlzIHN0YWdlXHJcbiAgICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2UgPT0gd2luZG93LmdhbWUuZ2V0Q3VycmVudFN0YWdlKCkgKSB7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmKCAhIHRoaXMuZnJvbVNhdmVkU3RhdGUgKSB7XHJcbiAgICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVgoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWCApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlWSggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy54MCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy54MDtcclxuICAgICAgICB0aGlzLnkwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLnkwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJvcFggPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFg7XHJcbiAgICAgICAgdGhpcy5kcm9wWSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWTtcclxuXHJcbiAgICAgICAgdGhpcy5kcm9wcGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsU3RhZ2UgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuc3RhZ2U7XHJcbiAgICAgICAgdGhpcy5kcm9wcGVkU3RhZ2UgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlO1xyXG4gICAgICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU3ByaXRlcyBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIFwiZ3JheVwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JheScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxODA0KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInB1cnBsZVwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE4MDUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicmVkXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTgwNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJncmVlblwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTgwNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGRpc2NhcmRLZXkocGxheWVyKSB7XHJcbiAgICB0aGlzLmhpZGUoKTtcclxuICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgIHRoaXMuc2V0Q29sbGVjdCh0cnVlKTtcclxuICAgIHRoaXMuc2V0R3JhYihmYWxzZSk7XHJcbiAgICBwbGF5ZXIuc2V0Tm90R3JhYmJpbmcoKTtcclxuICB9XHJcblxyXG4gIHVzZShkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKSB7XHJcbiAgICBsZXQgb2JqID0gcGxheWVyLmNoZWNrSXRlbU9uR3JhYkNvbGxpc2lvbkJveCgpO1xyXG4gICAgaWYoIG9iai50eXBlID09ICdkb29yJyApIHtcclxuICAgICAgaWYoIG9iai5nZXRDb2RlKCkgPT0gdGhpcy5nZXRDb2RlKCkgKSB7XHJcbiAgICAgICAgb2JqLm9wZW4oKTtcclxuICAgICAgICB0aGlzLmRpc2NhcmRLZXkocGxheWVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gS2V5OyIsImNvbnN0IF9DYW5CZVB1c2hlZCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhbkJlUHVzaGVkJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgT2JqZWN0X1B1c2ggZXh0ZW5kcyBfQ2FuQmVQdXNoZWQge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIm9iamVjdFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuUHVzaCA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZSxcclxuICAgICAgY2h1bmNrc1B1c2hEaXN0YW5jZTogMTUsXHJcbiAgICAgIGh1cnRBbW91bnQ6IDJcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblB1c2gpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgY2FzZSBcInN0b25lXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE4MDIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0X1B1c2g7IiwiY29uc3QgX0NhblRocm93ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuVGhyb3cnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBPYmplY3RfVGhyb3cgZXh0ZW5kcyBfQ2FuVGhyb3cge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJvYmplY3RcIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgY2xhc3M6ICdvYmplY3RfdGhyb3cnLFxyXG4gICAgICBzdGFnZTogc3RhZ2VcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5UaHJvdyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZSxcclxuICAgICAgY2h1bmNrc1Rocm93RGlzdGFuY2U6IDUsXHJcbiAgICAgIGh1cnRBbW91bnQ6IDIsXHJcbiAgICAgIHVzZUV2ZW50OiAndGhyb3cnXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvdywgZnJvbVNhdmVTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpOy8vc2V0IHRvIHNhdmUganVzdCB0byBjaGVjayBpZiB1c2VyIGlzIGdyYWJiaW5nIGl0IHdoZW4gbGVhdmluZyBzdGFnZVxyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJiYXJyZWxcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTgwMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldENvZGUodHlwZSk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaGFzIHNvbWUgc2F2ZSBzdGF0ZVxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgIGxldCBpdGVtU2F2ZWRTdGF0ZSA9IHNhdmVkSXRlbXNTdGF0ZVt0aGlzLmdldE5hbWUoKV07XHJcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBpcyBhbHJlYWR5IGdyYWJiZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmdyYWJiZWQgPT09IHRydWUgKXtcclxuICAgICAgICBpZiggdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgIC8vIEdyYWIgdGhlIGl0ZW0gc2F2ZWRcclxuICAgICAgICAgIHRoaXMuZ3JhYkhhbmRsZXIoIGl0ZW1TYXZlZFN0YXRlLmdyYWJQcm9wcy5wbGF5ZXJXaG9HcmFiYmVkICk7IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vQ2hlY2sgaWYgaXQgd2FzIGRyb3BwZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmRyb3BwZWQgPT0gdHJ1ZSApIHsgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBkcm9wcGVkIG9uIHRoaXMgc3RhZ2VcclxuICAgICAgICBpZiggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZSA9PSB3aW5kb3cuZ2FtZS5nZXRDdXJyZW50U3RhZ2UoKSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoICEgdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgICAgLy8gSWdub3JlIHRoZSBpdGVtIGZyb20gc3RhZ2VcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlWCggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVZKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFkgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLngwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLngwO1xyXG4gICAgICAgIHRoaXMueTAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueTA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcm9wWCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWDtcclxuICAgICAgICB0aGlzLmRyb3BZID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZO1xyXG5cclxuICAgICAgICB0aGlzLmRyb3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5zdGFnZTtcclxuICAgICAgICB0aGlzLmRyb3BwZWRTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RfVGhyb3c7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgVGVsZXBvcnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHgsIHksIHRwUHJvcHMpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIlRlbGVwb3J0XCIsXHJcbiAgICAgIHR5cGU6ICd0ZWxlcG9ydCdcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgsXHJcbiAgICAgIHk6IHlcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShmYWxzZSwgMCwgMCwgMCwgMCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5wcm9wcyA9IHRwUHJvcHM7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgY29sbGlzaW9uKHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LCBjb2xsaWRhYmxlKSB7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXJzID0gd2luZG93LmdhbWUucGxheWVycztcclxuXHJcbiAgICB0aGlzLnRlbGVwb3J0KCBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydCApO1xyXG4gICAgICBcclxuICAgIC8vIE1ha2UgZXZlcnl0aGluZyBkYXJrXHJcbiAgICBjb2xsaWRhYmxlLnNjZW5hcmlvLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgd2luZG93LmdhbWUubG9hZGluZyh0cnVlKTtcclxuXHJcbiAgICAvLyBIaWRlIGFsbCBwbGF5ZXJzXHJcbiAgICBwbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICBwbGF5ZXIuaGlkZVBsYXllcigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTm93IHRlbGVwb3J0IGFsbCBwbGF5ZXJzIHRvIHNhbWUgbG9jYXRpb24gYW5kIGRpcmVjdGlvblxyXG4gICAgbGV0IHRhcmdldFggPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRYKCk7XHJcbiAgICBsZXQgdGFyZ2V0WSA9IHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LmdldFkoKTtcclxuICAgIGxldCBsb29rRGlyZWN0aW9uID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0U3ByaXRlUHJvcHMoKS5kaXJlY3Rpb247XHJcbiAgICBcclxuICAgIHBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgIHBsYXllci5zZXRYKHRhcmdldFgsIHRydWUpOyAvLyB0cnVlID0gYWxzbyBzZXQgY29sbGlzaW9uIHggdG9vXHJcbiAgICAgIHBsYXllci5zZXRZKHRhcmdldFksIHRydWUpO1xyXG4gICAgICBwbGF5ZXIudHJpZ2dlckxvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbik7XHJcbiAgICAgIHBsYXllci5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICBwbGF5ZXIuc2hvd1BsYXllcigpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ2hhbmdlIHN0YWdlXHJcbiAgICBjb2xsaWRhYmxlLnNjZW5hcmlvLnNldFN0YWdlKCBcclxuICAgICAgdGhpcy5wcm9wcy50YXJnZXQuc3RhZ2UsXHJcbiAgICAgIGZhbHNlIC8vIGZpcnN0U3RhZ2UgP1xyXG4gICAgKTtcclxuXHJcbiAgICB3aW5kb3cuZ2FtZS5sb2FkaW5nKGZhbHNlKTtcclxuICAgICAgXHJcbiAgfVxyXG5cclxuICB0ZWxlcG9ydCggcGxheWVyICkge1xyXG4gICAgcGxheWVyLnNldFgoIHRoaXMucHJvcHMudGFyZ2V0LnggKTsvLyBUaGlzIGlzIHRoZSBYIHBvc2l0aW9uIG9mIHBsYXllciBIRUFERVIuIFJlbWViZXIgdGhhdCBjb2xsaXNpb24gYm94IGlzIG9uIHBsYXllciBmb290XHJcbiAgICBwbGF5ZXIuc2V0WSh0aGlzLnByb3BzLnRhcmdldC55ICk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBUZWxlcG9ydDsiLCIvKipcclxuICogIFN0b3JlIEFzc2V0cyB0aGF0IG5lZWRzIHRvIGJlIG9uIGFueSBzdGFnZSwgbGlrZSBrZXlzIG9yIGl0ZW1zIHRoYXQgcGxheWVyIGdyYWJzXHJcbiAqIFxyXG4gKiAgRGVjbGFyZSBhbGwgb2YgdGhpcyBhc3NldHMgaGVyZVxyXG4gKi9cclxuXHJcbmNvbnN0IEtleSA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vS2V5Jyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vT2JqZWN0X1Rocm93Jyk7XHJcbmNvbnN0IE9iamVjdF9QdXNoID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfUHVzaCcpO1xyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IEhlYWwgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0hlYWwnKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IERvb3IgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0Rvb3InKTtcclxuY29uc3QgRW5lbXkgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0VuZW15Jyk7XHJcbmNvbnN0IERpYWxvZyA9IHJlcXVpcmUoJy4vX0RpYWxvZycpO1xyXG5cclxuY2xhc3MgR2xvYmFsQXNzZXRzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7IFxyXG5cdFx0dGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcblx0fVxyXG5cclxuICBnZXRBc3NldCggX2NsYXNzLCBwcm9wcywgZnJvbVNhdmVTdGF0ZSApIHtcclxuICAgIGxldCByO1xyXG4gICAgc3dpdGNoKCBfY2xhc3MgKSB7XHJcbiAgICAgIGNhc2UgJ2tleSc6XHJcbiAgICAgICAgciA9IG5ldyBLZXkoIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2UsIGZyb21TYXZlU3RhdGUgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnb2JqZWN0X3Rocm93JzpcclxuICAgICAgICByID0gbmV3IE9iamVjdF9UaHJvdyggcHJvcHMuY29kZSwgcHJvcHMueDAsIHByb3BzLnkwLCBwcm9wcy5zdGFnZSwgZnJvbVNhdmVTdGF0ZSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiYmVhY2hfd2FsbFwiOlxyXG4gICAgICAgIHIgPSBuZXcgQmVhY2hfV2FsbCggcHJvcHMuY29kZSwgcHJvcHMueDAsIHByb3BzLnkwICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJiZWFjaF9mbG9vclwiOlxyXG4gICAgICAgIHIgPSBuZXcgQmVhY2hfRmxvb3IoIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3Rocm93XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfVGhyb3coIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2VJRCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3B1c2hcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9QdXNoKCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAsIHByb3BzLnN0YWdlSUQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiaGVhbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgSGVhbCggcHJvcHMuY29kZSwgcHJvcHMueDAsIHByb3BzLnkwLCBwcm9wcy5zdGFnZUlEICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEb29yKCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAsIHByb3BzLnN0YWdlSUQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChwcm9wcy54SW5kZXgsIHByb3BzLnlJbmRleCwgcHJvcHMucHJvcHMgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRpYWxvZ1wiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRGlhbG9nKHByb3BzLngsIHByb3BzLnksIHByb3BzLmRpYWxvZyApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZW5lbXlcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEVuZW15KHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHI7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBHbG9iYWxBc3NldHM7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuQmVQdXNoZWQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQmVQdXNoZWRQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5Vc2UgPSB0cnVlO1xyXG4gICAgdGhpcy5fcHVzaCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhbkJlUHVzaGVkUHJvcHMuY2FuUmVzcGF3bjtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhbkJlUHVzaGVkUHJvcHMuaHVydEFtb3VudDtcclxuICAgIFxyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2UgPSBjYW5CZVB1c2hlZFByb3BzLmNodW5ja3NQdXNoRGlzdGFuY2UgKiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgIHRoaXMucHVzaFNwZWVkID0gMC44O1xyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2VUcmF2ZWxsZWQgPSAwO1xyXG4gICAgdGhpcy5wdXNoTW92ZW1lbnQgPSBmYWxzZTtcclxuICAgIHRoaXMucHVzaERpcmVjdGlvbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnRhcmdldFggPSAwO1xyXG4gICAgdGhpcy50YXJnZXRZID0gMDtcclxuICB9XHJcblxyXG4gIGlzUHVzaGluZygpIHsgcmV0dXJuIHRoaXMuX3B1c2g7IH1cclxuICBzZXRQdXNoKGJvb2wpIHsgdGhpcy5fcHVzaCA9IGJvb2w7IH1cclxuICBnZXRQdXNoU3BlZWQoKSB7IHJldHVybiAgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiB0aGlzLnB1c2hTcGVlZDsgfVxyXG4gIGNhbGN1bGF0ZVB1c2hEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgdGhpcy5wdXNoRGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgc3dpdGNoKCB0aGlzLnB1c2hEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gdGhpcy5wdXNoRGlzdGFuY2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB0aGlzLnB1c2hEaXN0YW5jZTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHRoaXMucHVzaERpc3RhbmNlOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpIC0gdGhpcy5wdXNoRGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuX2NhblJlc3Bhd24gPSBib29sOyB9XHJcbiAgY2FuUmVzcGF3bigpIHsgcmV0dXJuIHRoaXMuX2NhblJlc3Bhd247IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxuICB1c2VIYW5kbGVyKGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5wdXNoKGRpcmVjdGlvbik7XHJcbiAgfVxyXG5cclxuICBzdG9wT2JqZWN0KCkge1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24odHJ1ZSk7XHJcbiAgICB0aGlzLnNldFB1c2goZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgcHVzaChkaXJlY3Rpb24pIHtcclxuICAgIHRoaXMuc2V0UHVzaCh0cnVlKTtcclxuICAgIHRoaXMuY2FsY3VsYXRlUHVzaERpcmVjdGlvbiggZGlyZWN0aW9uICk7XHJcbiAgfVxyXG5cclxuICBtb3ZlVG9QdXNoRGlyZWN0aW9uKCkge1xyXG4gICAgc3dpdGNoKCB0aGlzLnB1c2hEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRQdXNoU3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgLy8gWVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMucHVzaERpc3RhbmNlVHJhdmVsbGVkICs9IHRoaXMuZ2V0UHVzaFNwZWVkKCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyLCBlbmVteSBhbmQgb2JqZWN0c1xyXG4gICAgdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24oKTtcclxuXHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb24oKSB7XHJcbiAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVja0FsbCh0aGlzLCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSk7IFxyXG4gICAgaWYgKCBvYmogJiYgdGhpcy5pc1B1c2hpbmcoKSApIHtcclxuICAgICAgc3dpdGNoKG9iai50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAncGxheWVyJzpcclxuICAgICAgICAgIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdlbmVteSc6XHJcbiAgICAgICAgICBvYmouaHVydCh0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IGVuZW15XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYoIG9iai5vdmVybGFwWCApIHRoaXMudXBkYXRlWCggb2JqLm92ZXJsYXBYICk7XHJcbiAgICAgICAgICBpZiggb2JqLm92ZXJsYXBZICkgdGhpcy51cGRhdGVZKCBvYmoub3ZlcmxhcFkgKTtcclxuICAgICAgICAgIHRoaXMuc3RvcE9iamVjdCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiBcclxuICBiZWZvcmVSZW5kZXIoKSB7XHJcbiAgICBpZiggdGhpcy5pc1B1c2hpbmcoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZ2V0WCgpICE9IHRoaXMudGFyZ2V0WCB8fCB0aGlzLmdldFkoKSAhPSB0aGlzLnRhcmdldFkgKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9QdXNoRGlyZWN0aW9uKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdG9wT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgICAgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuQmVQdXNoZWQ7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuQ29sbGVjdCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICAgIHRoaXMuY29sbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9jYW5SZXNwYXduID0gY2FuQ29sbGVjdFByb3BzLmNhblJlc3Bhd247XHJcbiAgfVxyXG5cclxuICBpc0NvbGxlY3RlZCgpIHsgcmV0dXJuIHRoaXMuY29sbGVjdGVkOyB9XHJcbiAgY29sbGVjdCgpeyB0aGlzLmNvbGxlY3RlZCA9IHRydWU7IH1cclxuICBzZXRDb2xsZWN0KGJvb2wpIHsgdGhpcy5jb2xsZWN0ID0gYm9vbDsgfVxyXG5cclxuICBzZXRDYW5SZXNwYXduKGJvb2wpeyB0aGlzLl9jYW5SZXNwYXduID0gYm9vbDsgfVxyXG4gIGNhblJlc3Bhd24oKSB7IHJldHVybiB0aGlzLl9jYW5SZXNwYXduOyB9XHJcbiAgXHJcbiAgc2V0TmFtZShuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NhbkNvbGxlY3Q7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuSHVydCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLGNhbkh1cnRQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhbkh1cnRQcm9wcy5hbW91bnQ7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIElmIGl0J3Mgbm90IGNvbGxpZGluZyB0byBhbnkgdGVsZXBvcnQgY2h1bmsgYW55bW9yZSwgbWFrZSBpdCByZWFkeSB0byB0ZWxlcG9ydCBhZ2FpblxyXG4gIGNvbGxpc2lvbihvYmopeyBcclxuICAgIGlmKCBvYmoudHlwZSA9PSBcInBsYXllclwiICkgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTtcclxuICAgIGlmKCBvYmoudHlwZSA9PSBcImVuZW15XCIgKSBvYmouaHVydCh0aGlzLmh1cnRBbW91bnQpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkge1xyXG4gICAgLy8gZGVidWcgcG9zaXRpb25cclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgIGxldCB4ID0gTWF0aC5yb3VuZCh0aGlzLmdldENvbGxpc2lvblgoKSk7XHJcbiAgICAgIGxldCB5ID0gTWF0aC5yb3VuZCh0aGlzLmdldENvbGxpc2lvblkoKSk7XHJcbiAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIHggKyBcIiBZOiBcIiArIHk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xyXG4gICAgICBjdHguZm9udCA9IFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnI0ZGRkZGRic7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCAsIHRoaXMuZ2V0WSgpKTsgXHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuSHVydDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIF9DYW5UaHJvdyBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvd1Byb3BzLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGZyb21TYXZlU3RhdGUpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbkdyYWIgPSB0cnVlO1xyXG4gICAgdGhpcy5ncmFiYmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wbGF5ZXJXaG9HcmFiYmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BwZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcHBlZFN0YWdlID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BYID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BZID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhblRocm93UHJvcHMuY2FuUmVzcGF3bjtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhblRocm93UHJvcHMuaHVydEFtb3VudDtcclxuXHJcbiAgICB0aGlzLnVzZUV2ZW50ID0gY2FuVGhyb3dQcm9wcy51c2VFdmVudDtcclxuICAgIFxyXG4gICAgdGhpcy50aHJvd0Rpc3RhbmNlID0gY2FuVGhyb3dQcm9wcy5jaHVuY2tzVGhyb3dEaXN0YW5jZSAqIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG4gICAgdGhpcy50aHJvd1NwZWVkID0gMC44O1xyXG4gICAgdGhpcy50aHJvd0Rpc3RhbmNlVHJhdmVsbGVkID0gMDtcclxuICAgIHRoaXMudGhyb3dpbmdNb3ZlbWVudCA9IGZhbHNlO1xyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZGVzdHJveU9uQW5pbWF0aW9uRW5kID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHRoaXMudGFyZ2V0WCA9IDA7XHJcbiAgICB0aGlzLnRhcmdldFkgPSAwO1xyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzcHJpdGUgRlBTIEFuaW1hdGlvblxyXG4gICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAoIHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5mcHMgKiAyICk7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBEZXN0cm95IGFuaW1hdGlvbiBwcm9wc1xyXG4gICAgdGhpcy5kZXN0cm95aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmRlc3Ryb3lTcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuICAgIHRoaXMuZGVzdHJveUZyYW1lQ291bnQgPSAxO1xyXG4gICAgdGhpcy5kZXN0cm95TWF4RnJhbWVDb3VudCA9IDg7XHJcbiAgICB0aGlzLmRlc3Ryb3lJbml0RnJhbWUgPSAxNzM5O1xyXG5cclxuICAgIHRoaXMuZHJvcFNvdW5kID0gZmFsc2U7XHJcbiAgICB0aGlzLmJyZWFrU291bmQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnRocm93QWN0aW9uID0gXCJcIjtcclxuXHJcbiAgICB0aGlzLmluaXRTb3VuZHMoKTtcclxuICB9XHJcblxyXG4gIGluaXRTb3VuZHMoKSB7XHJcbiAgICAvLyBEcm9wXHJcbiAgICB0aGlzLmRyb3BTb3VuZCA9IG5ldyBIb3dsKHsgc3JjOiBbJy4vc291bmRzL3NjZW5hcmlvcy9kcm9wLm1wMyddIH0pO1xyXG4gICAgLy8gQnJlYWtcclxuICAgIHRoaXMuYnJlYWtTb3VuZCA9IG5ldyBIb3dsKHsgc3JjOiBbJy4vc291bmRzL3NjZW5hcmlvcy9pdGVtLWJyZWFrLm1wMyddIH0pO1xyXG4gIH1cclxuXHJcbiAgaXNDb2xsZWN0ZWQoKSB7IHJldHVybiB0aGlzLmNvbGxlY3RlZDsgfVxyXG4gIGNvbGxlY3QoKXsgdGhpcy5jb2xsZWN0ZWQgPSB0cnVlOyB9XHJcbiAgc2V0Q29sbGVjdChib29sKSB7IHRoaXMuY29sbGVjdGVkID0gYm9vbDsgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBGaXJlIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gXHJcblxyXG4gIGlzRGVzdHJveWluZygpIHsgcmV0dXJuIHRoaXMuZGVzdHJveWluZzsgfVxyXG4gIHNldERlc3Ryb3lpbmcoYm9vbCkgeyB0aGlzLmRlc3Ryb3lpbmcgPSBib29sOyB9XHJcbiAgXHJcbiAgc2V0RGVzdHJveU9uQW5pbWF0aW9uRW5kKGJvb2wpIHsgdGhpcy5kZXN0cm95T25BbmltYXRpb25FbmQgPSBib29sOyB9XHJcblxyXG4gIGlzR3JhYmJlZCgpIHsgcmV0dXJuIHRoaXMuZ3JhYmJlZDsgfVxyXG4gIGdyYWIoKXsgXHJcbiAgICB0aGlzLmdyYWJiZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5kcm9wcGVkID0gZmFsc2U7IFxyXG4gIH1cclxuICBzZXRHcmFiKGJvb2wpIHsgXHJcbiAgICB0aGlzLmdyYWJiZWQgPSBib29sOyBcclxuICAgIHRoaXMuZHJvcHBlZCA9ICFib29sO1xyXG4gIH1cclxuICBzZXRQbGF5ZXJXaG9HcmFiYmVkKHBsYXllck51bWJlcikgeyB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBwbGF5ZXJOdW1iZXI7IH1cclxuXHJcbiAgaXNUaHJvd2luZygpIHsgcmV0dXJuIHRoaXMudGhyb3dpbmdNb3ZlbWVudDsgfVxyXG4gIHNldFRocm93aW5nKGJvb2wpIHsgdGhpcy50aHJvd2luZ01vdmVtZW50ID0gYm9vbDsgfVxyXG4gIGdldFRocm93U3BlZWQoKSB7IHJldHVybiAgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiB0aGlzLnRocm93U3BlZWQ7IH1cclxuICBjYWxjdWxhdGVUaHJvd0RpcmVjdGlvbihkaXJlY3Rpb24sIHBsYXllckhlaWdodCkgeyBcclxuICAgIHRoaXMudGhyb3dEaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICBzd2l0Y2goIHRoaXMudGhyb3dEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gdGhpcy50aHJvd0Rpc3RhbmNlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgdGhpcy50aHJvd0Rpc3RhbmNlICsgdGhpcy5nZXRIZWlnaHQoKSAqIDI7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgKyB0aGlzLnRocm93RGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgLSB0aGlzLnRocm93RGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgY2FsY3VsYXRlRHJvcERpcmVjdGlvbihkaXJlY3Rpb24sIHBsYXllckhlaWdodCkgeyBcclxuICAgIHRoaXMudGhyb3dEaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICBzd2l0Y2goIHRoaXMudGhyb3dEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSArIHRoaXMuZ2V0SGVpZ2h0KCkgKiAyOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpICsgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgLSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG4gIGdyYWJIYW5kbGVyKCBwbGF5ZXJOdW1iZXIgKSB7XHJcbiAgICB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBwbGF5ZXJOdW1iZXI7XHJcbiAgICB0aGlzLnNldEdyYWIodHJ1ZSk7XHJcbiAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7IC8vIGF2b2lkIHBsYXllcnMgcHVzaGluZyBvdGhlciBwbGF5ZXJzIHdpdGggaXRlbXNcclxuICB9XHJcblxyXG4gIGJyZWFrT2JqZWN0KCkge1xyXG5cclxuICAgIHRoaXMuc2V0VGhyb3dpbmcoZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRHcmFiKGZhbHNlKTtcclxuXHJcbiAgICBpZiggdGhpcy50aHJvd0FjdGlvbiA9PSBcInRocm93XCIgKSB0aGlzLmJyZWFrU291bmQucGxheSgpO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5kZXN0cm95T25BbmltYXRpb25FbmQgKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgdGhpcy5zZXREZXN0cm95aW5nKHRydWUpOyAvLyBTdGFydCBkZXN0cm95IGFuaW1hdGlvblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24odHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgaXNEcm9wcGVkKCkgeyByZXR1cm4gdGhpcy5kcm9wcGVkOyB9XHJcbiAgZHJvcChkaXJlY3Rpb24sIHBsYXllckhlaWdodCkge1xyXG4gICAgXHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IHRoaXMuZHJvcFNvdW5kLnBsYXkoKTsgfSwgMzAwKTsgLy8gRGVsYXkgZHJvcCBzb3VuZCB0byBzeW5jIHdpdGggYW5pbWF0aW9uXHJcbiAgICB0aGlzLnRocm93QWN0aW9uID0gXCJkcm9wXCI7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZURyb3BEaXJlY3Rpb24oIGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0ICk7XHJcbiAgICB0aGlzLnNldERlc3Ryb3lPbkFuaW1hdGlvbkVuZChmYWxzZSk7XHJcbiAgICB0aGlzLnNldFRocm93aW5nKHRydWUpO1xyXG4gICAgdGhpcy5zZXRHcmFiKGZhbHNlKTtcclxuICAgIHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wWCA9IHRoaXMudGFyZ2V0WDtcclxuICAgIHRoaXMuZHJvcFkgPSB0aGlzLnRhcmdldFk7XHJcbiAgfVxyXG5cclxuICB0aHJvdyhkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKSB7XHJcbiAgICB0aGlzLnRocm93QWN0aW9uID0gXCJ0aHJvd1wiO1xyXG4gICAgcGxheWVyLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZVRocm93RGlyZWN0aW9uKCBkaXJlY3Rpb24sIHBsYXllckhlaWdodCApO1xyXG4gICAgdGhpcy5zZXREZXN0cm95T25BbmltYXRpb25FbmQodHJ1ZSk7XHJcbiAgICB0aGlzLnNldFRocm93aW5nKHRydWUpO1xyXG4gIH1cclxuXHJcbiAgdXNlKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpIHtcclxuICAgIHN3aXRjaCggdGhpcy51c2VFdmVudCApIHtcclxuICAgICAgY2FzZSAndGhyb3cnOlxyXG4gICAgICAgIHRoaXMudGhyb3coZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQsIHBsYXllcik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb3ZlVG9UaHJvd0RpcmVjdGlvbigpIHtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgLyAzICk7IC8vIFNsb3cgdGhlIG1vdmVtZW50XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuXHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBpZiAodGhpcy5nZXRYKCkgPCB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgIC8vIFlcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpIC8gMyApO1xyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcbiAgICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgICBpZiAodGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgICBpZiAodGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy50aHJvd0Rpc3RhbmNlVHJhdmVsbGVkICs9IHRoaXMuZ2V0VGhyb3dTcGVlZCgpO1xyXG5cclxuICAgIC8vIENoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciBhbmQgZW5lbXkgb25seVxyXG4gICAgdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24oKTtcclxuXHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb24oKSB7XHJcbiAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSk7IFxyXG4gICAgaWYgKCBvYmogICYmIHRoaXMuaXNUaHJvd2luZygpICkge1xyXG4gICAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiAmJiB0aGlzLnRocm93QWN0aW9uICE9IFwiZHJvcFwiICkge1xyXG4gICAgICAgIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5icmVha09iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKCBvYmoudHlwZSA9PSBcImVuZW15XCIgKSB7IFxyXG4gICAgICAgIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgZW5lbXlcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiBcclxuICBiZWZvcmVSZW5kZXIoY3R4KSB7XHJcbiAgICBcclxuICAgIC8vIE1vdmVtZW50IHdoaWxlIHRocm93aW5nXHJcbiAgICBpZiggdGhpcy5pc1Rocm93aW5nKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmdldFgoKSAhPSB0aGlzLnRhcmdldFggfHwgdGhpcy5nZXRZKCkgIT0gdGhpcy50YXJnZXRZICkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvVGhyb3dEaXJlY3Rpb24oKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgICAgXHJcblxyXG4gICAgLy8gRGVzdHJveSBhbmltYXRpb25cclxuICAgIGlmKCB0aGlzLmlzRGVzdHJveWluZygpICkge1xyXG4gICAgICBpZiggdGhpcy5kZXN0cm95RnJhbWVDb3VudCA8IHRoaXMuZGVzdHJveU1heEZyYW1lQ291bnQgICkge1xyXG4gICAgICAgIGlmKCB0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpICkge1xyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuZGVzdHJveVNwcml0ZS5nZXRTcHJpdGVQcm9wcyggdGhpcy5kZXN0cm95SW5pdEZyYW1lICk7XHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lJbml0RnJhbWUrKztcclxuICAgICAgICAgIHRoaXMuZGVzdHJveUZyYW1lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmRyb3BwZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5UaHJvdzsiLCJjbGFzcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgZnJvbVNhdmVTdGF0ZSkge1xyXG4gICAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHBvc2l0aW9uLng7XHJcbiAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xyXG5cclxuICAgIHRoaXMueDAgPSBwb3NpdGlvbi54O1xyXG4gICAgdGhpcy55MCA9IHBvc2l0aW9uLnk7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLndpZHRoID0gZGltZW5zaW9uLndpZHRoOyAvL3B4XHJcbiAgICB0aGlzLmhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQ7XHJcblxyXG4gICAgLy8gIyBDb2xsaXNpb25cclxuICAgIHRoaXMuY29sbGlzaW9uV2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgIHRoaXMuY29sbGlzaW9uWCA9IHRoaXMueDtcclxuICAgIHRoaXMuY29sbGlzaW9uWSA9IHRoaXMueTtcclxuXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIC8vICMgRXZlbnRzXHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGV2ZW50cy5zdG9wT25Db2xsaXNpb247XHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZXZlbnRzLmhhc0NvbGxpc2lvbkV2ZW50O1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG5cclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZSA9IHNwcml0ZS5zdGFnZVNwcml0ZTtcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgdGhpcy5uYW1lID0gcHJvcHMuc3RhZ2UgKyBcIl9cIiArIHByb3BzLm5hbWUucmVwbGFjZSgvXFxzL2csJycpICsgXCJfXCIgKyB0aGlzLnggKyBcInhcIiArIHRoaXMueTtcclxuICAgIHRoaXMubmFtZSA9IHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdGhpcy5vcmlnaW5hbE5hbWUgPSBwcm9wcy5uYW1lO1xyXG4gICAgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm5lZWRTYXZlU3RhdGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmZyb21TYXZlZFN0YXRlID0gKCBmcm9tU2F2ZVN0YXRlKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBwcm9wcy50eXBlO1xyXG4gICAgdGhpcy5jb2RlID0gJyc7XHJcbiAgICB0aGlzLmNsYXNzID0gcHJvcHMuY2xhc3M7XHJcbiAgICB0aGlzLm9yaWdpbmFsU3RhZ2UgPSBwcm9wcy5zdGFnZTtcclxuXHJcbiAgICB0aGlzLnJ1biggcHJvcHMudHlwZSApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBDb2RlXHJcbiAgc2V0Q29kZShjb2RlKSB7IHRoaXMuY29kZSA9IGNvZGU7IH1cclxuICBnZXRDb2RlKCl7IHJldHVybiB0aGlzLmNvZGU7IH1cclxuXHJcbiAgLy8gIyBTZXRzXHJcblxyXG4gIHVwZGF0ZVgoeCkge1xyXG4gICAgdGhpcy5zZXRYKHgpO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKHgpO1xyXG4gIH1cclxuICB1cGRhdGVZKHkpIHtcclxuICAgIHRoaXMuc2V0WSh5KTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh5KTtcclxuICB9XHJcbiAgICBcclxuICBzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG4gIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICBcclxuICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIHNldENvbGxpc2lvbkhlaWdodChoZWlnaHQpIHsgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRDb2xsaXNpb25XaWR0aCh3aWR0aCkgeyB0aGlzLmNvbGxpc2lvbldpZHRoID0gd2lkdGg7IH1cclxuXHJcbiAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICBzZXRDb2xsaXNpb25ZKHkpIHsgdGhpcy5jb2xsaXNpb25ZID0geTsgfVxyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAvLyAhIE11c3QgaGF2ZSBpbiBjaGlsZHMgQ2xhc3NcclxuICB9XHJcblxyXG4gIHNldFN0b3BPbkNvbGxpc2lvbihib29sKXtcclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gYm9vbDtcclxuICB9XHJcblxyXG4gIC8vICMgVmlzaWJpbGl0eVxyXG4gIGhpZGUoKSB7IFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgXHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGZhbHNlO1xyXG4gIH1cclxuICBzaG93KCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG5cclxuICAvLyAjICBTdGF0ZVxyXG4gIHdpbGxOZWVkU2F2ZVN0YXRlKCkgeyAgcmV0dXJuIHRoaXMubmVlZFNhdmVTdGF0ZTsgfVxyXG4gIHNldE5lZWRTYXZlU3RhdGUoYm9vbCl7IHRoaXMubmVlZFNhdmVTdGF0ZSA9IGJvb2w7IH1cclxuXHRcdFx0XHJcblx0Ly8gIyBHZXRzXHJcbiAgXHJcbiAgZ2V0TmFtZSgpIHsgcmV0dXJuIHRoaXMubmFtZTsgfVxyXG5cclxuICBnZXRUeXBlKCkgeyByZXR1cm4gdGhpcy50eXBlOyB9XHJcbiAgXHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25XaWR0aDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25YKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWSgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgbGV0IHggPSAoIF94ICkgPyBfeCA6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICB9XHJcbiAgZ2V0Q2VudGVyWSggX3kgKSB7IFxyXG4gICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgfVxyXG5cclxuICAvLyBIb29rIHRvIHJ1biBiZWZvcmUgcmVuZGVyXHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkgeyAgIH1cclxuXHRcdFxyXG5cdC8vICMgUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgXHJcbiAgICB0aGlzLmJlZm9yZVJlbmRlcihjdHgpO1xyXG5cclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBsZXQgc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZVByb3BzO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCkgKSB7IC8vIE9ubHkgcmVuZGVyIHRleHR1cmUgaWYgaXQgd2FzIHNldCBiZWZvcmVcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgICBcclxuICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuXHJcbiAgICAgIGxldCBjb2xsaXNpb25fcHJvcHMgPSB7XHJcbiAgICAgICAgdzogdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCksXHJcbiAgICAgICAgeDogdGhpcy5nZXRDb2xsaXNpb25YKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRDb2xsaXNpb25ZKClcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3RvcE9uQ29sbGlzaW9uID8gXCJyZ2JhKDI1NSwwLDAsMC4yKVwiIDogXCJyZ2JhKDAsMjU1LDAsMC4yKVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QoY29sbGlzaW9uX3Byb3BzLngsIGNvbGxpc2lvbl9wcm9wcy55LCBjb2xsaXNpb25fcHJvcHMudywgY29sbGlzaW9uX3Byb3BzLmgpO1xyXG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yKVwiO1xyXG4gICAgICBjdHgubGluZVdpZHRoICAgPSA1O1xyXG4gICAgICBjdHguc3Ryb2tlUmVjdChjb2xsaXNpb25fcHJvcHMueCwgY29sbGlzaW9uX3Byb3BzLnksIGNvbGxpc2lvbl9wcm9wcy53LCBjb2xsaXNpb25fcHJvcHMuaCk7XHJcblxyXG4gICAgfVxyXG4gIFxyXG4gIH1cclxuICAgIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gTm8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgbm9Db2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gUnVucyB3aGVuIENsYXNzIHN0YXJ0cyAgXHJcbiAgcnVuKCB0eXBlICkge1xyXG4gICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NvbGxpZGFibGU7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBfRGlhbG9nIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3RvciggeCwgeSwgZGlhbG9nICkge1xyXG5cdFx0XHJcblx0XHRsZXQgcHJvcHMgPSB7XHJcblx0XHRcdG5hbWU6ICdkaWFsb2cnLFxyXG5cdFx0XHR0eXBlOiAnZGlhbG9nJ1xyXG5cdFx0fVxyXG5cdFxyXG5cdFx0bGV0IHBvc2l0aW9uID0ge1xyXG5cdFx0XHR4OiB4LFxyXG5cdFx0XHR5OiB5XHJcblx0XHR9XHJcblx0XHJcblx0XHRsZXQgZGltZW5zaW9uID0ge1xyXG5cdFx0XHR3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcblx0XHRcdGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuXHRcdH1cclxuXHRcclxuXHRcdGxldCBldmVudHMgPSB7XHJcblx0XHRcdHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuXHRcdFx0aGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShmYWxzZSwgMCwgMCwgMCwgMCk7XHJcblx0XHRcclxuXHRcdHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcblx0XHR0aGlzLmNhblVzZSA9IHRydWU7XHJcblx0XHR0aGlzLmRpYWxvZyA9IGRpYWxvZztcclxuXHR9XHJcblx0XHJcblx0Z2V0RGlhbG9nKCkgeyByZXR1cm4gdGhpcy5kaWFsb2c7IH1cclxuXHJcblx0dXNlSGFuZGxlcigpIHsgXHJcblx0XHR3aW5kb3cuZ2FtZS5zZXREaWFsb2codGhpcy5kaWFsb2cpOyBcclxuXHR9XHJcbiAgc2V0TmFtZShuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHRcclxuXHRzZXRTcHJpdGVUeXBlKHR5cGUpIHsgIFx0fVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfRGlhbG9nOyIsImNsYXNzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzY2VuYXJpb19pZCwgc291bmRTcmMpe1xyXG4gICAgdGhpcy5jdHggPSBjdHg7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICBcclxuICAgIHRoaXMud2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyU3RhcnRYID0gMDsgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WSA9IDA7IFxyXG5cclxuICAgIHRoaXMuc3RhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5zdGFnZUlkID0gXCJcIjtcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuXHJcbiAgICB0aGlzLnNjZW5hcmlvX2lkID0gc2NlbmFyaW9faWQ7XHJcbiAgICBcclxuICAgIHRoaXMuc291bmQgPSBudWxsO1xyXG4gICAgdGhpcy5zb3VuZFNyYyA9IHNvdW5kU3JjO1xyXG5cclxuICAgIHRoaXMuaW5pdFNvdW5kKCk7XHJcbiAgfVxyXG5cclxuICBpbml0U291bmQoKSB7XHJcbiAgICB0aGlzLnNvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICBzcmM6IFt0aGlzLnNvdW5kU3JjXSxcclxuICAgICAgbG9vcDogdHJ1ZSxcclxuICAgICAgdm9sdW1lOiAwLjVcclxuICAgIH0pO1xyXG4gIH1cclxuICBnZXRTY2VuYXJpb1NvdW5kKCkgeyByZXR1cm4gdGhpcy5zb3VuZDsgfVxyXG5cclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcbiAgYWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIEdldHNcclxuICBnZXRDdHgoKSB7IHJldHVybiB0aGlzLmN0eDsgfVxyXG4gIGdldENhbnZhcygpIHsgcmV0dXJuIHRoaXMuY2FudmFzOyB9XHRcclxuXHJcbiAgZ2V0SWQoKSB7IHJldHVybiB0aGlzLnNjZW5hcmlvX2lkOyB9XHJcbiAgZ2V0QWN0dWFsU3RhZ2VJZCgpIHsgcmV0dXJuIHRoaXMuc3RhZ2VJZDsgfVxyXG4gICAgICAgICAgICAgIFxyXG4gIGdldFN0YXRpY0l0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcbiAgXHJcbiAgLy8gIyBTZXRzXHJcbiAgc2V0UGxheWVyMVN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMVN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIxU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIxU3RhcnRZID0geTsgfVxyXG5cclxuICBzZXRQbGF5ZXIyU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjJTdGFydFkoeSkgeyB0aGlzLnBsYXllcjJTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldEFjdHVhbFN0YWdlSWQoaWQpeyBcclxuICAgIHRoaXMuc3RhZ2VJZCA9IGlkOyBcclxuICAgIHdpbmRvdy5nYW1lLnNldEN1cnJlbnRTdGFnZSggaWQgKTtcclxuICB9XHJcblxyXG4gIC8vICMgU2F2ZSB0aGUgU3RhdGUgb2YgaXRlbXNcclxuICBzYXZlSXRlbXNTdGF0ZSgpIHtcclxuICAgIC8vIEJvdHRvbSBMYXllclxyXG4gICAgbGV0IGl0ZW1zID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmdldENvbEl0ZW5zKCk7XHJcbiAgICBmb3IgKGxldCBpIGluIGl0ZW1zKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlSXRlbUlmTmVlZFNhdmUoaXRlbXNbaV0pO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmdhbWUuc2F2ZUl0ZW1zU3RhdGUoKTtcclxuICB9XHJcblxyXG4gIGhhbmRsZUl0ZW1JZk5lZWRTYXZlKGl0ZW0pIHtcclxuICAgIFxyXG4gICAgaWYoaXRlbS50eXBlID09IFwicGxheWVyXCIpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgaWYoIGl0ZW0ud2lsbE5lZWRTYXZlU3RhdGUoKSApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIEdyYWJiZWRcclxuICAgICAgbGV0IGdyYWJiZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IGdyYWJQcm9wcyA9IHt9O1xyXG4gICAgICBpZiggaXRlbS5jYW5HcmFiICkge1xyXG4gICAgICAgIGdyYWJiZWQgPSBpdGVtLmlzR3JhYmJlZCgpO1xyXG4gICAgICAgIGlmKCBncmFiYmVkICkge1xyXG4gICAgICAgICAgZ3JhYlByb3BzID0ge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiBpdGVtLmNsYXNzLFxyXG4gICAgICAgICAgICAnY29kZSc6IGl0ZW0uY29kZSxcclxuICAgICAgICAgICAgJ3gwJzogaXRlbS54MCxcclxuICAgICAgICAgICAgJ3kwJzogaXRlbS55MCxcclxuICAgICAgICAgICAgJ25hbWUnOiBpdGVtLm9yaWdpbmFsTmFtZSxcclxuICAgICAgICAgICAgJ3N0YWdlJzogaXRlbS5vcmlnaW5hbFN0YWdlLFxyXG4gICAgICAgICAgICAncGxheWVyV2hvR3JhYmJlZCc6IGl0ZW0ucGxheWVyV2hvR3JhYmJlZFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgRHJvcHBlZFxyXG4gICAgICBsZXQgZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgICBsZXQgZHJvcFByb3BzID0ge307XHJcbiAgICAgIGlmKCBpdGVtLmNhbkdyYWIgKSB7XHJcbiAgICAgICAgZHJvcHBlZCA9IGl0ZW0uaXNEcm9wcGVkKCk7XHJcbiAgICAgICAgaWYoIGRyb3BwZWQgKSB7XHJcbiAgICAgICAgICBkcm9wUHJvcHMgPSB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6IGl0ZW0uY2xhc3MsXHJcbiAgICAgICAgICAgICdjb2RlJzogaXRlbS5jb2RlLFxyXG4gICAgICAgICAgICAneDAnOiBpdGVtLngwLFxyXG4gICAgICAgICAgICAneTAnOiBpdGVtLnkwLFxyXG4gICAgICAgICAgICAnZHJvcFgnOiBpdGVtLmRyb3BYLFxyXG4gICAgICAgICAgICAnZHJvcFknOiBpdGVtLmRyb3BZLFxyXG4gICAgICAgICAgICAnbmFtZSc6IGl0ZW0ub3JpZ2luYWxOYW1lLFxyXG4gICAgICAgICAgICAnc3RhZ2UnOiBpdGVtLm9yaWdpbmFsU3RhZ2UsXHJcbiAgICAgICAgICAgICdkcm9wcGVkU3RhZ2UnOiAoaXRlbS5kcm9wcGVkU3RhZ2UpID8gaXRlbS5kcm9wcGVkU3RhZ2UgOiB0aGlzLmdldEFjdHVhbFN0YWdlSWQoKSAvLyBJZiBkb24ndCBoYXZlIGRyb3BwZWQgc3RhZ2UsIG1lYW5zIHdlIHdhbnQgdGhlIGFjdHVhbCBzdGFnZS4gIElmIGhhcywga2VlcCBpdFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2luZG93LmdhbWUuYWRkSXRlbVN0YXRlKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICduYW1lX2lkJzogaXRlbS5nZXROYW1lKCksXHJcbiAgICAgICAgICAnY29sbGVjdGVkJzogaXRlbS5pc0NvbGxlY3RlZCgpLFxyXG4gICAgICAgICAgJ2dyYWJiZWQnOiBncmFiYmVkLFxyXG4gICAgICAgICAgJ2dyYWJQcm9wcyc6IGdyYWJQcm9wcyxcclxuICAgICAgICAgICdkcm9wcGVkJzogZHJvcHBlZCxcclxuICAgICAgICAgICdkcm9wUHJvcHMnOiBkcm9wUHJvcHNcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGdW5jdGlvbnMgdG8gbG9hZCBzZWxlY3RlZCBzdGFnZVxyXG4gIGxvYWRTdGFnZShzdGFnZSwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YWdlID0gc3RhZ2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG4gICAgdGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzOyAvLyBQYXNzIHRoaXMgc2NlbmFyaW8gY2xhc3MgYXMgYW4gYXJndW1lbnQsIHNvIG90aGVyIGZ1bmN0aW9ucyBjYW4gcmVmZXIgdG8gdGhpc1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0oaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBPbmx5IHNldCBwbGF5ZXIgc3RhcnQgYXQgZmlyc3QgbG9hZFxyXG4gICAgaWYoZmlyc3RTdGFnZSkge1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WCgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXIxU3RhcnRZKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMlN0YXJ0WSgpICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TY2VuYXJpbzsiLCJjbGFzcyBfU3RhZ2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihzdGFnZUlkLCBzdGFnZU1hcCwgc3RhZ2VBc3NldHMsIHNjZW5hcmlvVGlsZVNldCkge1xyXG4gICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXIxU3RhcnRYID0gMDtcclxuICAgIHRoaXMucGxheWVyMVN0YXJ0WSA9IDA7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyMlN0YXJ0WCA9IDA7XHJcbiAgICB0aGlzLnBsYXllcjJTdGFydFkgPSAwO1xyXG5cclxuICAgIHRoaXMuc3RhZ2VJZCA9IHN0YWdlSWQ7XHJcblxyXG4gICAgdGhpcy5qc29uU3RhZ2VNYXAgPSBzdGFnZU1hcDtcclxuICAgIHRoaXMuanNvblN0YWdlQXNzZXRzID0gc3RhZ2VBc3NldHM7XHJcbiAgICB0aGlzLmpzb25UaWxlU2V0ID0gc2NlbmFyaW9UaWxlU2V0O1xyXG5cclxuICAgIHRoaXMuc3RhZ2VNYXAgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLmNvbHMgPSB0aGlzLmpzb25TdGFnZU1hcC53aWR0aDtcclxuICAgIHRoaXMucm93cyA9IHRoaXMuanNvblN0YWdlTWFwLmhlaWdodDtcclxuXHJcbiAgICB0aGlzLmNvb3JkaW5hdGVzID0ge307XHJcblxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgR2V0c1xyXG4gIGdldFN0YXRpY0l0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcblxyXG4gIGdldFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuICBcclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG5cclxuICBjYWxjdWxhdGVTdGFnZUNvb3JkaW5hdGVzKCkge1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIGZvciggbGV0IHI9MDsgcjx0aGlzLnJvd3M7cisrICkge1xyXG4gICAgICAgIGZvciggbGV0IGM9MDsgYzx0aGlzLmNvbHM7YysrICkge1xyXG4gICAgICAgICAgICB0aGlzLmNvb3JkaW5hdGVzW2luZGV4XSA9IHsgXHJcbiAgICAgICAgICAgICAgeDogdGhpcy5jaHVua1NpemUgKiBjLFxyXG4gICAgICAgICAgICAgIHk6IHRoaXMuY2h1bmtTaXplICogclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICAvLyBMb2FkcyBKU09OIGZpbGVcclxuICBsb2FkSlNPTigpIHtcclxuICAgIFxyXG4gICAgLy8gTWFwIGVhY2ggbGF5ZXJcclxuICAgIHRoaXMuanNvblN0YWdlTWFwLmxheWVycy5tYXAoIChsYXllcikgPT4ge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgaXQncyBhIHBsYXllciBsYXllclxyXG4gICAgICBpZiggbGF5ZXIubmFtZSA9PSBcInBsYXllclwiKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKCB7Y29kZTogJ3BsYXllcid9ICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WCggbGF5ZXIucHJvcGVydGllcy5maW5kKCB4ID0+IHgubmFtZSA9PT0gJ3BsYXllcl8xX3gnICkudmFsdWUgKiB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggbGF5ZXIucHJvcGVydGllcy5maW5kKCB4ID0+IHgubmFtZSA9PT0gJ3BsYXllcl8xX3knICkudmFsdWUgKiB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgICBcclxuICAgICAgICB0aGlzLnNldFBsYXllcjJTdGFydFgoIGxheWVyLnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICdwbGF5ZXJfMl94JyApLnZhbHVlICogdGhpcy5jaHVua1NpemUgKTtcclxuICAgICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIGxheWVyLnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICdwbGF5ZXJfMl95JyApLnZhbHVlICogdGhpcy5jaHVua1NpemUgKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGl0J3MgdGhlIGFzc2V0cyBsYXllclxyXG4gICAgICBpZiggbGF5ZXIubmFtZSA9PSBcImFzc2V0c1wiKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKHsnY29kZSc6ICdhc3NldHMnfSk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIGl0J3MgdGhlIHNhdmUgc3RhdGUgbGF5ZXJcclxuICAgICAgaWYoIGxheWVyLm5hbWUgPT0gXCJzYXZlZC1pdGVtc1wiKSB7XHJcbiAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKHsnY29kZSc6ICdzYXZlZC1pdGVtcyd9KTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgLy8gTWFwIGVhY2ggaXRlbSBpbnNpZGUgbGF5ZXJcclxuICAgICAgbGF5ZXIuZGF0YS5tYXAoIChvYmopID0+IHtcclxuICAgICAgICBpZiggb2JqICE9IDAgKSB7IC8vIGF2b2lkIGVtcHR5IG9iamVjdHNcclxuICAgICAgICAgIG9iaiA9IHBhcnNlSW50KG9iaiAtIDEpOyAvLyBBZGp1c3QgVGlsZWQgSUQ6IHRoZXkgYWRkICsxIHRvIElEcyB0byBhbGxvdyAwIGFzIGEgZW1wdHkgdGlsZSAvLyAjaHR0cHM6Ly9kaXNjb3Vyc2UubWFwZWRpdG9yLm9yZy90L3dyb25nLWlkcy1pbi10aWxlc2V0LzE0MjVcclxuICAgICAgICAgIGxldCB0aWxlc2V0ID0gdGhpcy5qc29uVGlsZVNldC50aWxlcy5maW5kKCB4ID0+IHguaWQgPT09IG9iaiApOyAvLyBHZXQgdGhlIGluZGV4IG9mIGNvcnJlc3BvbmRpbmcgaWQgIFxyXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmNvb3JkaW5hdGVzW2luZGV4XS54LCB0aGlzLmNvb3JkaW5hdGVzW2luZGV4XS55LCB0aWxlc2V0LnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICd0eXBlJyApLnZhbHVlKTsgICAgICAgIFxyXG4gICAgICAgICAgdGhpcy5zdGFnZU1hcC5wdXNoKCBcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICd4JzogdGhpcy5jb29yZGluYXRlc1tpbmRleF0ueCxcclxuICAgICAgICAgICAgICAneSc6IHRoaXMuY29vcmRpbmF0ZXNbaW5kZXhdLnksXHJcbiAgICAgICAgICAgICAgJ2NvZGUnOiBvYmosXHJcbiAgICAgICAgICAgICAgJ2NsYXNzJzogdGlsZXNldC5wcm9wZXJ0aWVzLmZpbmQoIHggPT4geC5uYW1lID09PSAnY2xhc3MnICkudmFsdWUsXHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiB0aWxlc2V0LnByb3BlcnRpZXMuZmluZCggeCA9PiB4Lm5hbWUgPT09ICd0eXBlJyApLnZhbHVlLFxyXG4gICAgICAgICAgICAgICdzdGFnZUlEJzogdGhpcy5zdGFnZUlkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfSAgICAgIFxyXG4gICAgICAgIGluZGV4Kys7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGxvYWRBc3NldHMoKSB7XHJcbiAgICAvLyBUZWxlcG9ydHNcclxuICAgIHRoaXMuanNvblN0YWdlQXNzZXRzLnRlbGVwb3J0cy5tYXAoIChhc3NldCkgPT4ge1xyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeEluZGV4OiAoIGFzc2V0LnhJbmRleCAqIHRoaXMuY2h1bmtTaXplICksXHJcbiAgICAgICAgeUluZGV4OiAoIGFzc2V0LnlJbmRleCAqIHRoaXMuY2h1bmtTaXplICksXHJcbiAgICAgICAgdGFyZ2V0OiB7XHJcblx0XHRcdFx0XHRzdGFnZTogYXNzZXQucHJvcHMudGFyZ2V0LnN0YWdlLFxyXG5cdFx0XHRcdFx0eDogKCBhc3NldC5wcm9wcy50YXJnZXQueCAqIHRoaXMuY2h1bmtTaXplICksXHJcblx0XHRcdFx0XHR5OiAoIGFzc2V0LnByb3BzLnRhcmdldC55ICogdGhpcy5jaHVua1NpemUgKSxcclxuXHRcdFx0XHRcdGxvb2s6IGFzc2V0LnByb3BzLnRhcmdldC5sb29rXHJcblx0XHRcdFx0fVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShcclxuICAgICAgICB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoJ3RlbGVwb3J0JywgeyB4SW5kZXg6IHByb3BzLnhJbmRleCwgeUluZGV4OiBwcm9wcy55SW5kZXgsIHByb3BzOiBwcm9wcyB9LCBmYWxzZSApIFxyXG4gICAgICApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gRGlhbG9nc1xyXG4gICAgdGhpcy5qc29uU3RhZ2VBc3NldHMuZGlhbG9ncy5tYXAoIChkaWFsb2cpID0+IHtcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6ICggZGlhbG9nLnggKiB0aGlzLmNodW5rU2l6ZSApLFxyXG4gICAgICAgIHk6ICggZGlhbG9nLnkgKiB0aGlzLmNodW5rU2l6ZSApLFxyXG4gICAgICAgIGRpYWxvZzogZGlhbG9nLmRpYWxvZ1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShcclxuICAgICAgICB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoJ2RpYWxvZycsIHsgeDogcHJvcHMueCwgeTogcHJvcHMueSwgZGlhbG9nOiBwcm9wcy5kaWFsb2cgfSwgZmFsc2UgKSBcclxuICAgICAgKVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBsb2FkU2F2ZWRTdGF0ZUl0ZW1zKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgcGxheWVyIGhhcyBzb21ldGhpbmcgZ3JhYmJlZCBhbmQgaW5jbHVkZSBpbiByZW5kZXJcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJyk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgIT0gXCJ7fVwiICkge1xyXG4gICAgICBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKHNhdmVkSXRlbXNTdGF0ZSk7XHJcbiAgICAgIGZvciggbGV0IGkgaW4gc2F2ZWRJdGVtc1N0YXRlICkge1xyXG4gICAgICAgIGxldCBpdGVtID0gc2F2ZWRJdGVtc1N0YXRlW2ldO1xyXG4gICAgICAgIC8vIEluY2x1ZGUgZ3JhYmJlZCBpdGVtXHJcbiAgICAgICAgaWYoIGl0ZW0uZ3JhYmJlZCApIHtcclxuICAgICAgICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoIGl0ZW0uZ3JhYlByb3BzLmNsYXNzLCBpdGVtLmdyYWJQcm9wcywgdHJ1ZSApOyAvLyB0cnVlID0gY2FtZSBmcm9tIHNhdmUgc3RhdGVcclxuICAgICAgICAgIG9iai5ncmFiSGFuZGxlciggaXRlbS5ncmFiUHJvcHMucGxheWVyV2hvR3JhYmJlZCApOyAvLyBzdGFydCBhIHNldHVwIG9uIHRoZSBvYmplY3QsIHNvIHRoZSBwbGF5ZXIgd2lsbCBjaGVjayB0aGUgc2F2ZWQgc3RhdGUgb2YgaXRlbVxyXG4gICAgICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEluY2x1ZGUgZHJvcHBlZCBpdGVtXHJcbiAgICAgICAgaWYoIGl0ZW0uZHJvcHBlZCApIHtcclxuICAgICAgICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoIGl0ZW0uZHJvcFByb3BzLmNsYXNzLCB7IGNvZGU6IGl0ZW0uZHJvcFByb3BzLmNvZGUsIHgwOiBpdGVtLmRyb3BQcm9wcy54MCwgeTA6IGl0ZW0uZHJvcFByb3BzLnkwLCBzdGFnZTogaXRlbS5kcm9wUHJvcHMuc3RhZ2UgfSwgdHJ1ZSApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiggdGhpcy5nZXRTdGFnZUlkKCkgIT0gaXRlbS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlICkge1xyXG4gICAgICAgICAgICBvYmouaGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG9iai5kcm9wcGVkU3RhZ2UgPSBpdGVtLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgICBvYmouZHJvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgICBvYmoudXBkYXRlWCggaXRlbS5kcm9wUHJvcHMuZHJvcFggKTtcclxuICAgICAgICAgIG9iai51cGRhdGVZKCBpdGVtLmRyb3BQcm9wcy5kcm9wWSApO1xyXG4gICAgICAgICAgb2JqLmRyb3BYID0gaXRlbS5kcm9wUHJvcHMuZHJvcFg7XHJcbiAgICAgICAgICBvYmouZHJvcFkgPSBpdGVtLmRyb3BQcm9wcy5kcm9wWTtcclxuICAgICAgICAgIG9iai54MCA9IGl0ZW0uZHJvcFByb3BzLngwO1xyXG4gICAgICAgICAgb2JqLnkwID0gaXRlbS5kcm9wUHJvcHMueTA7XHJcblxyXG4gICAgICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbG9hZFN0YWdlSXRlbXMoKSB7XHJcbiAgICB0aGlzLnN0YWdlTWFwLm1hcCggKG9iaikgPT4ge1xyXG5cclxuICAgICAgc3dpdGNoKCBvYmouY29kZSApIHtcclxuXHJcbiAgICAgICAgY2FzZSAncGxheWVyJzpcclxuICAgICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSggcGxheWVyICk7IC8vIEFkZHMgdGhlIHBsYXllciB0byB0aGUgcmVuZGVyXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICdhc3NldHMnOlxyXG4gICAgICAgICAgdGhpcy5sb2FkQXNzZXRzKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAnc2F2ZWQtaXRlbXMnOlxyXG4gICAgICAgICAgdGhpcy5sb2FkU2F2ZWRTdGF0ZUl0ZW1zKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShcclxuICAgICAgICAgICAgd2luZG93LmdhbWUuZ2xvYmFsQXNzZXRzLmdldEFzc2V0KCBvYmouY2xhc3MsIHsgY29kZTogb2JqLnR5cGUsIHgwOiBvYmoueCwgeTA6IG9iai55LCBzdGFnZTogb2JqLnN0YWdlSUQgfSwgZmFsc2UgKSAvLyBmYWxzZSA9IG5vdCBmcm9tIHNhdmUgc3RhdGVcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcnVuICgpIHsgIFxyXG4gICAgdGhpcy5jYWxjdWxhdGVTdGFnZUNvb3JkaW5hdGVzKCk7XHJcbiAgICB0aGlzLmxvYWRKU09OKCk7XHJcbiAgICB0aGlzLmxvYWRTdGFnZUl0ZW1zKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TdGFnZTsiLCIvLyBDbGFzcyB0aGF0IGRldGVjdHMgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyIGFuZCBvdGhlciBvYmplY3RzXHJcbmNsYXNzIENvbGxpc2lvbiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHNjZW5hcmlvV2lkdGgsIHNjZW5hcmlvSGVpZ2h0LCBwbGF5ZXIpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTsgLy8gSXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG4gICAgdGhpcy5zY2VuYXJpb1dpZHRoID0gc2NlbmFyaW9XaWR0aDtcclxuICAgIHRoaXMuc2NlbmFyaW9IZWlnaHQgPSBzY2VuYXJpb0hlaWdodDtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29sSXRlbnMoKSB7IHJldHVybiB0aGlzLmNvbEl0ZW5zOyB9XHJcblx0XHRcdFxyXG4gIC8vICMgQ2hlY2sgaWYgdGhlIG9iamVjdCBjb2xsaWRlcyB3aXRoIGFueSBvYmplY3QgaW4gdmVjdG9yXHJcbiAgLy8gQWxnb3JpdGhtIHJlZmVyZW5jZTogR3VzdGF2byBTaWx2ZWlyYSAtIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9czdxaVdMQkJwSndcclxuICBjaGVjayhvYmplY3QpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjEgPSBvYmplY3Q7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIHRoaXMuY2hlY2tDb2xsaXNpb24ocjEsIHIyKTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICAvLyBAcjE6IHRoZSBtb3Zpbmcgb2JqZWN0XHJcbiAgLy8gQHIyOiB0aGUgXCJ3YWxsXCJcclxuICBjaGVja0NvbGxpc2lvbihyMSwgcjIpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9IHIxLmdldENlbnRlclgoKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggcjEuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgXHJcbiAgICAgIHZhciBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICB2YXIgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZiggcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7XHJcbiAgICAgICAgaWYob3ZlcmxhcFggPj0gb3ZlcmxhcFkgKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWSggcjEuZ2V0Q29sbGlzaW9uWSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblkoIHIxLmdldENvbGxpc2lvblkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblgoIHIxLmdldENvbGxpc2lvblgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25YKCByMS5nZXRDb2xsaXNpb25YKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1Z0NvbGxpc2lvbiApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGJldHdlZW4nLCByMS5uYW1lICsgXCIoXCIgKyByMS5nZXRYKCkgKyBcIi9cIiArIHIxLmdldFkoKSArIFwiKVwiLCByMi5uYW1lKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJpZ2dlcnMgQ29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLmNvbGxpc2lvbihyMiwgcjEpO1xyXG4gICAgICByMi5jb2xsaXNpb24ocjEsIHIyKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmlnZ2VycyBub3QgaW4gY29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLm5vQ29sbGlzaW9uKHIyLCByMik7IFxyXG4gICAgICByMi5ub0NvbGxpc2lvbihyMSwgcjIpOyBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvLyBKdXN0IGNoZWNrIGZvciBhIHNwZWNpZmljIGNvbGxpc2lvbiBhbmQgcmV0dXJuIHRoZSBmaXJ0IG9iamVjdCBjb2xsaWRlZFxyXG4gIGp1c3RDaGVjayhyMSwgX3gsIF95LCBfdywgX2gpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICBsZXQgciA9IHRoaXMuanVzdENoZWNrQ29sbGlzaW9uKHIxLCByMiwgX3gsIF95LCBfdywgX2gpO1xyXG4gICAgICBpZiggciApIHJldHVybiByOyAvLyBpZiBoYXMgc29tZXRoaW5nLCByZXR1cm4gYW5kIHN0b3AgbG9vcFxyXG4gICAgfSBcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbihyMSwgcjIsIF94LCBfeSwgX3csIF9oKSB7XHJcblxyXG4gICAgLy8gRG9uJ3QgY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gc2FtZSBvYmplY3RcclxuICAgIGlmKCByMS5uYW1lID09IHIyLm5hbWUgKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gKCBfeCArIF93IC8gMiApIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSAoIF95ICsgX2ggLyAyICkgLSByMi5nZXRDZW50ZXJZKCk7XHJcbiBcclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIF93IC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIF9oIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIHJldHVybiByMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgIFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIEp1c3QgY2hlY2sgZm9yIGEgc3BlY2lmaWMgY29sbGlzaW9uIGFuZCByZXR1cm4gdGhlIGZpcnQgb2JqZWN0IGNvbGxpZGVkXHJcbiAganVzdENoZWNrQWxsKHIxLCBfeCwgX3ksIF93LCBfaCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIGxldCByID0gdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb25BbGwocjEsIHIyLCBfeCwgX3ksIF93LCBfaCk7XHJcbiAgICAgIGlmKCByICkgcmV0dXJuIHI7IC8vIGlmIGhhcyBzb21ldGhpbmcsIHJldHVybiBhbmQgc3RvcCBsb29wXHJcbiAgICB9IFxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uQWxsKHIxLCByMiwgX3gsIF95LCBfdywgX2gpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9ICggX3ggKyBfdyAvIDIgKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gKCBfeSArIF9oIC8gMiApIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG4gXHJcbiAgICB2YXIgc3VtSGFsZldpZHRoID0gKCBfdyAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCBfaCAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgLy9jYWxjdWxhdGUgb3ZlcmxhcCBpZiBuZWVkIHRvIHN0b3Agb2JqZWN0XHJcbiAgICAgIGxldCBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICBsZXQgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZihvdmVybGFwWCA+PSBvdmVybGFwWSApeyAvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gVXAvRG93blxyXG4gICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgIHIyLm92ZXJsYXBZID0gcjEuZ2V0WSgpICsgb3ZlcmxhcFk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHIyLm92ZXJsYXBZID0gcjEuZ2V0WSgpIC0gb3ZlcmxhcFk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Ugey8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBMZWZ0L1JpZ2h0XHJcbiAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICByMi5vdmVybGFwWCA9IHIxLmdldFgoKSArIG92ZXJsYXBYO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByMi5vdmVybGFwWCA9IHIxLmdldFgoKSAtIG92ZXJsYXBYO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHIyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlOyAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuICBcdFx0XHJcblx0Ly8gQWRkIGl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuXHRhZGRJdGVtKG9iamVjdCkge1xyXG5cdFx0dGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdCk7XHJcbiAgfTtcclxuICBcclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsZWFyQXJyYXlJdGVtcygpIHtcclxuICAgIHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG59Ly8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uO1xyXG5cdCIsImNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vLi4vZ2FtZVByb3BlcnRpZXMnKTtcclxuY29uc3Qgc2NlbmFyaW9Qcm90b3R5cGUgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlJyk7XHJcbmNvbnN0IHNjZW5hcmlvU2FuZGJveCA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3NjZW5hcmlvU2FuZGJveCcpO1xyXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvUGxheWVyJyk7XHJcbmNvbnN0IENvbGxpc2lvbiA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uJyk7XHJcbmNvbnN0IFJlbmRlciA9IHJlcXVpcmUoJy4vUmVuZGVyJyk7XHJcbmNvbnN0IFVJID0gcmVxdWlyZSgnLi4vdWkvVUknKTtcclxuY29uc3QgR2xvYmFsQXNzZXRzID0gcmVxdWlyZSgnLi4vYXNzZXRzL0dsb2JhbEFzc2V0cycpO1xyXG5cclxuY2xhc3MgR2FtZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIEZQUyBDb250cm9sXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gbnVsbDsgXHJcbiAgICB0aGlzLm5vdyA9IG51bGw7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG51bGw7IFxyXG4gICAgdGhpcy5lbGFwc2VkID0gbnVsbDtcclxuXHJcbiAgICAvLyBFdmVudHNcclxuICAgIHRoaXMua2V5c0Rvd24gPSB7fTtcclxuICAgIHRoaXMua2V5c1ByZXNzID0ge307XHJcblxyXG4gICAgLy8gUGF1c2VcclxuICAgIHRoaXMuX3BhdXNlID0gZmFsc2U7XHJcbiAgICB0aGlzLmdhbWVJc0xvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEl0ZW1zXHJcbiAgICB0aGlzLml0ZW1zU3RhdGUgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgLy8gR2FtZVxyXG4gICAgdGhpcy5nYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgdGhpcy5kZWZhdWx0U2NlbmFyaW8gPSAnc2FuZGJveCc7XHJcbiAgICB0aGlzLnNjZW5hcmlvID0gbnVsbDtcclxuICAgIHRoaXMuVUkgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50U3RhZ2VOYW1lID0gJyc7XHJcblxyXG4gICAgdGhpcy5nYW1lUmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm11bHRpcGxheWVyID0gZmFsc2U7XHJcblxyXG4gICAgLy8gUmVuZGVyc1xyXG4gICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBudWxsO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllcnMgPSBudWxsO1xyXG4gICAgdGhpcy5yZW5kZXJVSSAgICAgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZ2xvYmFsQXNzZXRzID0gbmV3IEdsb2JhbEFzc2V0cyggdGhpcy5nYW1lUHJvcHMuY2h1bmtTaXplICk7XHJcblxyXG4gICAgLy8gRGlhbG9nIFByb3BzXHJcbiAgICB0aGlzLmRlZmF1bHREaWFsb2cgPSBbIHsgaGlkZVNwcml0ZTogdHJ1ZSwgdGV4dDogXCJcIiB9IF07XHJcbiAgICB0aGlzLmRpYWxvZyA9IHRoaXMuZGVmYXVsdERpYWxvZztcclxuICAgIHRoaXMuZGlhbG9nQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmRpYWxvZ0luZGV4ID0gMDtcclxuICAgIHRoaXMuZmlyc3RLZXlVcFRyaWdnZXIgPSB0cnVlO1xyXG5cclxuICAgIC8vIFNvdW5kc1xyXG4gICAgdGhpcy5tZW51U291bmRTcmMgPSBcIi4vc291bmRzL21haW4tbWVudS5tcDNcIjtcclxuICAgIHRoaXMubWVudVNvdW5kID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zdWNjZXNzU291bmRTcmMgPSBcIi4vc291bmRzL3NjZW5hcmlvcy9zdWNjZXNzLm1wM1wiO1xyXG4gICAgdGhpcy5zdWNjZXNzU291bmQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy5nYW1lT3ZlclNvdW5kU3JjID0gXCIuL3NvdW5kcy9zY2VuYXJpb3MvZ2FtZS1vdmVyLm1wM1wiO1xyXG4gICAgdGhpcy5nYW1lT3ZlclNvdW5kID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zY2VuYXJpb1NvdW5kID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pbml0U291bmQoKTtcclxuICB9XHJcblxyXG4gIGluaXRTb3VuZCgpIHtcclxuICAgIHRoaXMubWVudVNvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICBzcmM6IFt0aGlzLm1lbnVTb3VuZFNyY10sXHJcbiAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgIHZvbHVtZTogMC42XHJcbiAgICB9KTtcclxuICAgIHRoaXMubWVudVNvdW5kLnBsYXkoKTtcclxuICAgIHRoaXMuc3VjY2Vzc1NvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICBzcmM6IFt0aGlzLnN1Y2Nlc3NTb3VuZFNyY10sXHJcbiAgICAgIHZvbHVtZTogMC42XHJcbiAgICB9KTtcclxuICAgIHRoaXMuZ2FtZU92ZXJTb3VuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgc3JjOiBbdGhpcy5nYW1lT3ZlclNvdW5kU3JjXVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwbGF5U3VjY2Vzc1NvdW5kKCkge1xyXG4gICAgdGhpcy5zY2VuYXJpb1NvdW5kLnZvbHVtZSgwLjIpO1xyXG4gICAgdGhpcy5zdWNjZXNzU291bmQucGxheSgpO1xyXG4gICAgdGhpcy5zdWNjZXNzU291bmQub24oJ2VuZCcsICgpID0+IHsgdGhpcy5zY2VuYXJpb1NvdW5kLnZvbHVtZSgwLjYpOyB9KTtcclxuICB9XHJcblxyXG4gIC8vIEdldHNcclxuICBpc0dhbWVSZWFkeSgpIHsgcmV0dXJuIHRoaXMuZ2FtZVJlYWR5OyB9XHJcbiAgZ2V0Q2h1bmtTaXplKCkgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2h1bmtTaXplOyB9XHJcblxyXG4gIGdldENhbnZhc1dpZHRoKCkgIHsgcmV0dXJuIHRoaXMuZ2FtZVByb3BzLmNhbnZhc1dpZHRoOyAgfVxyXG4gIGdldENhbnZhc0hlaWdodCgpIHsgcmV0dXJuIHRoaXMuZ2FtZVByb3BzLmNhbnZhc0hlaWdodDsgfVxyXG5cclxuICAvLyBTZXRzXHJcbiAgc2V0R2FtZVJlYWR5KGJvb2wpIHsgdGhpcy5nYW1lUmVhZHkgPSBib29sOyB9XHJcblxyXG4gIHNldEN1cnJlbnRTdGFnZShzdGFnZSl7IHRoaXMuY3VycmVudFN0YWdlTmFtZSA9IHN0YWdlOyB9XHJcbiAgZ2V0Q3VycmVudFN0YWdlKCkgeyByZXR1cm4gdGhpcy5jdXJyZW50U3RhZ2VOYW1lOyB9XHJcblxyXG4gIC8vIERpYWxvZ1xyXG4gIGlzRGlhbG9nQWN0aXZlKCl7IHJldHVybiB0aGlzLmRpYWxvZ0FjdGl2ZTsgfVxyXG4gIHNldERpYWxvZ0FjdGl2ZShib29sKSB7IHRoaXMuZGlhbG9nQWN0aXZlID0gYm9vbDsgfVxyXG4gIHNldERpYWxvZyggZGlhbG9nKSB7XHJcbiAgICB0aGlzLmRpYWxvZyA9IGRpYWxvZztcclxuICAgIHRoaXMuc2V0RGlhbG9nQWN0aXZlKHRydWUpO1xyXG4gIH1cclxuICByZXNldERpYWxvZygpIHtcclxuICAgIHRoaXMuZGlhbG9nID0gdGhpcy5kZWZhdWx0RGlhbG9nO1xyXG4gICAgdGhpcy5kaWFsb2dJbmRleCA9IDA7XHJcbiAgICB0aGlzLnNldERpYWxvZ0FjdGl2ZShmYWxzZSk7XHJcbiAgICB0aGlzLmZpcnN0S2V5VXBUcmlnZ2VyID0gdHJ1ZTtcclxuICB9XHJcbiAgICBcclxuICAvLyAjIEdvIHRvIG5leHQgZGlhbG9nXHJcblx0bmV4dERpYWxvZygpIHtcclxuICAgIGlmKCB0aGlzLmlzRGlhbG9nQWN0aXZlKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmZpcnN0S2V5VXBUcmlnZ2VyICkgeyAvLyBJZ25vcmUgdGhlIGZpcnN0IGtleVVwIGJlY2F1c2UgaXQncyB0cmlnZ2VyaW5nIHRvIG5leHQgaW5kZXggcmlnaHQgYWZ0ZXIgdGhlIHBsYXllciBhY3RpdmF0ZSB0aGUgZGlhbG9nXHJcbiAgICAgICAgdGhpcy5maXJzdEtleVVwVHJpZ2dlciA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZGlhbG9nSW5kZXgrKztcclxuICAgICAgICBpZiggdGhpcy5kaWFsb2dbdGhpcy5kaWFsb2dJbmRleF0uaGlkZVNwcml0ZSApIHtcclxuICAgICAgICAgIHRoaXMucmVzZXREaWFsb2coKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHR9XHJcblxyXG4gIC8vICMgS2V5IHVwIGhhbmRsZVxyXG5cdGhhbmRsZUtleVVwKGtleUNvZGUpIHtcclxuICAgIFxyXG4gICAgLy8gUGF1c2VcclxuICAgIGlmKCBrZXlDb2RlID09IDI3ICYmIHRoaXMuZ2FtZUlzTG9hZGVkICkgeyAvLyBFU1FcclxuICAgICAgdGhpcy50b2dnbGVQYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERpYWxvZ1xyXG5cdFx0aWYgKGtleUNvZGUgPT0gMzIgfHwga2V5Q29kZSA9PSA2OSkgeyAvLyBTcGFjZSBvciBFXHJcblx0XHRcdHRoaXMubmV4dERpYWxvZygpO1xyXG5cdFx0fSBcclxuICBcclxuICB9XHJcbiAgXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIERlZmF1bHQgRXZlbnQgTGlzdGVuZXJzXHJcbiAgZGVmYXVsdEV2ZW50TGlzdGVuZXJzKCkge1xyXG5cclxuICAgIC8vIE1lbnUgQ2xpY2tzXHJcbiAgICBsZXQgbWVudUl0ZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZW51LWl0ZW0nKTtcclxuICAgIFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZW51SXRlbS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgX3RoaXMgPSB0aGlzO1xyXG4gICAgICBtZW51SXRlbVtpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm1lbnVBY3Rpb24oIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1hY3Rpb25cIikgKTtcclxuICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgS2V5Ym9hcmQgRXZlbnRzXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdGhpcy5rZXlzRG93bltlLmtleUNvZGVdID0gdHJ1ZTtcclxuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENsZWFyIHByZXZpb3VzIGtleXNcclxuICAgICAgZGVsZXRlIHRoaXMua2V5c0Rvd25bZS5rZXlDb2RlXTtcclxuICAgICAgXHJcbiAgICAgIC8vIFJlc2V0IHBsYXllcnMgbG9vayBkaXJlY3Rpb25cclxuICAgICAgaWYoIHRoaXMucGxheWVycykge1xyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHBsYXllci5yZXNldFN0ZXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIGhhbmRsZSBrZXl1cFxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLmhhbmRsZUtleVVwKGUua2V5Q29kZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEdhbWUgSGFuZGxlIGtleXBcclxuICAgICAgdGhpcy5oYW5kbGVLZXlVcChlLmtleUNvZGUpO1xyXG4gICAgICBcclxuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTdGFydC9SZXN0YXJ0IGEgR2FtZVxyXG5cclxuICByZWZyZXNoVmFyaWFibGVzKCkge1xyXG5cclxuICAgIC8vIENsZWFyIHNhdmUgc3RhdGVcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKTtcclxuXHJcbiAgICAvLyBSZW5kZXJzXHJcbiAgICB0aGlzLml0ZW1zU3RhdGUgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLmNvbGxpc2lvbiA9IG51bGw7XHJcbiAgICB0aGlzLmRlZmF1bHRTY2VuYXJpbyA9ICdzYW5kYm94JztcclxuICAgIHRoaXMuc2NlbmFyaW8gPSBudWxsO1xyXG4gICAgdGhpcy5VSSA9IG51bGw7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGFnZU5hbWUgPSAnJztcclxuXHJcbiAgICAvLyBSZW5kZXJzXHJcbiAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG51bGw7XHJcbiAgICB0aGlzLnJlbmRlckxheWVycyA9IG51bGw7XHJcbiAgICB0aGlzLnJlbmRlclVJICAgICA9IG51bGw7XHJcblxyXG4gIH1cclxuXHJcbiAgc3RhcnROZXdHYW1lKCBzYXZlRGF0YSApIHtcclxuXHJcbiAgICB0aGlzLnJlZnJlc2hWYXJpYWJsZXMoKTtcclxuICAgIFxyXG4gICAgLy8gIyBJbml0XHJcbiAgICAgIFxyXG4gICAgICBsZXQgY2FudmFzU3RhdGljID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19zdGF0aWMnKTtcclxuICAgICAgbGV0IGNvbnRleHRTdGF0aWMgPSBjYW52YXNTdGF0aWMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgIGxldCBjYW52YXNVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfdWknKTtcclxuICAgICAgbGV0IGNvbnRleHRVSSA9IGNhbnZhc1VJLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjYW52YXNTdGF0aWMud2lkdGggPSBjYW52YXNVSS53aWR0aCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICAgIGNhbnZhc1N0YXRpYy5oZWlnaHQgPSBjYW52YXNVSS5oZWlnaHQgPSB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjYW52YXNIZWlnaHQnKTtcclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllciggdGhpcy5nYW1lUHJvcHMsIDEgKTsgXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuICAgICAgICBpZiAoIHRoaXMubXVsdGlwbGF5ZXIgKSB7XHJcbiAgICAgICAgICBsZXQgcGxheWVyMiA9IG5ldyBQbGF5ZXIoIHRoaXMuZ2FtZVByb3BzLCAyICk7IFxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyMik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNhdmVEYXRhLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBsZXQgX3BsYXllciA9IG5ldyBQbGF5ZXIoIHRoaXMuZ2FtZVByb3BzLCBwbGF5ZXIucGxheWVyTnVtYmVyLCBwbGF5ZXIgKTsgXHJcbiAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaCggX3BsYXllcik7XHJcbiAgICAgICAgfSk7ICBcclxuICAgICAgfVxyXG4gICAgXHJcbiAgICAvLyAjIFNjZW5hcmlvXHJcbiAgICBcclxuICAgICAgaWYoICEgc2F2ZURhdGEgKSB7XHJcbiAgICAgICAgdGhpcy5zY2VuYXJpbyA9IHRoaXMuZ2V0U2NlbmFyaW8oIHRoaXMuZGVmYXVsdFNjZW5hcmlvLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggc2F2ZURhdGEuc2NlbmFyaW8uc2NlbmFyaW9JZCwgY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNjZW5hcmlvU291bmQgPSB0aGlzLnNjZW5hcmlvLmdldFNjZW5hcmlvU291bmQoKTtcclxuXHJcbiAgICAgIC8vIFNldCBwbGF5ZXIgWCBhbmQgWVxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICBsZXQgaSA9IDE7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgc3dpdGNoKGkpe1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgcGxheWVyLnNldFN0YXJ0UG9zaXRpb24oIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WCgpLCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjFTdGFydFkoKSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgcGxheWVyLnNldFN0YXJ0UG9zaXRpb24oIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMlN0YXJ0WCgpLCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjJTdGFydFkoKSApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaSsrO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNhdmVEYXRhLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBzd2l0Y2gocGxheWVyLnBsYXllck51bWJlcil7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbMF0uc2V0U3RhcnRQb3NpdGlvbiggcGxheWVyLngsIHBsYXllci55ICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICB0aGlzLnBsYXllcnNbMF0uc2V0U3RhcnRQb3NpdGlvbiggcGxheWVyLngsIHBsYXllci55ICk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7IFxyXG4gICAgICB9XHJcbiAgICAgIFxyXG5cclxuICAgIC8vICMgVUlcclxuICAgICAgXHJcbiAgICAgIHRoaXMuVUkgPSBuZXcgVUkoIHRoaXMucGxheWVycywgdGhpcy5nYW1lUHJvcHMpO1xyXG5cclxuICAgIC8vICMgQ29sbGlzaW9uIGRldGVjdGlvbiBjbGFzc1xyXG5cclxuICAgICAgdGhpcy5jb2xsaXNpb24gPSBuZXcgQ29sbGlzaW9uKCBjYW52YXNTdGF0aWMud2lkdGgsIGNhbnZhc1N0YXRpYy5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyAjIFJlbmRlclxyXG5cclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBuZXcgUmVuZGVyKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyk7IC8vIFJlbmRlciBleGVjdXRlZCBvbmx5IG9uY2VcclxuICAgICAgdGhpcy5yZW5kZXJVSSAgICAgPSBuZXcgUmVuZGVyKGNvbnRleHRVSSwgY2FudmFzVUkpOyBcclxuXHJcbiAgICAgIC8vIEFkZCBpdGVtcyB0byBiZSByZW5kZXJlZFxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyh0aGlzLnNjZW5hcmlvKTsgLy8gc2V0IHRoZSBzY2VuYXJpb1xyXG4gICAgXHJcbiAgICAvLyBIaWRlIEVsZW1lbnRzXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbk1lbnVcIikuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgICB0aGlzLmxvYWRpbmcoZmFsc2UpO1xyXG5cclxuICAgIC8vIFNob3cgQ2FudmFzXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lQ2FudmFzJykuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xyXG4gICAgXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGdhbWUgaXMgbm90IHBhdXNlZFxyXG4gICAgICB0aGlzLnVucGF1c2UoKTtcclxuICAgIFxyXG4gICAgLy8gU2NlbmFyaW8gc291bmRcclxuICAgICAgdGhpcy5zY2VuYXJpb1NvdW5kLnBsYXkoKTtcclxuXHJcbiAgICAvLyBGbGFnIFxyXG4gICAgICB0aGlzLmdhbWVJc0xvYWRlZCA9IHRydWU7XHJcbiAgICBcclxuICAgIC8vIE9rLCBydW4gdGhlIGdhbWUgbm93XHJcbiAgICAgIHRoaXMuc2V0R2FtZVJlYWR5KHRydWUpO1xyXG4gICAgICB0aGlzLnJ1bkdhbWUoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2ZwcycpICk7XHQvLyBHTyBHTyBHT1xyXG5cclxuICB9Ly9uZXdHYW1lXHJcblxyXG4gICAgLy8gIyBUaGUgR2FtZSBMb29wXHJcbiAgICB1cGRhdGVHYW1lKGRlbHRhVGltZSkge1xyXG5cclxuICAgICAgaWYoIHRoaXMuaXNQYXVzZWQoKSApIHJldHVybjtcclxuICAgICAgXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLnN0YXJ0KCBkZWx0YVRpbWUgKTsgIC8vIFN0YXRpYyBjYW4gYWxzbyBjaGFuZ2UsIGJlY2F1c2UgaXQgaXMgdGhlIHNjZW5hcmlvLi4uIG1heWJlIHdpbGwgY2hhbmdlIHRoaXMgbmFtZXMgdG8gbGF5ZXJzXHJcbiAgICAgIHRoaXMucmVuZGVyVUkuc3RhcnQoIGRlbHRhVGltZSApO1xyXG4gICAgIFxyXG4gICAgICAvLyAjIEFkZCB0aGUgb2JqZWN0cyB0byB0aGUgY29sbGlzaW9uIHZlY3RvclxyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCkgKTtcclxuICAgICAgLyp0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKHBsYXllcik7XHJcbiAgICAgIH0pOyovXHJcbiAgXHJcbiAgICAgIC8vIFwiU3RhdGljXCIgUmVuZGVyIC0gQmFja2dyb3VuZFxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuYWRkQXJyYXlJdGVtKHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSk7IC8vIEdldCBhbGwgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgICAgLy8gVUkgUmVuZGVyXHJcbiAgICAgIHRoaXMucmVuZGVyVUkuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHRoaXMucmVuZGVyVUkuYWRkQXJyYXlJdGVtKCB0aGlzLlVJLmdldE5ld1JlbmRlckl0ZW1zKCkpO1xyXG4gICAgICBcclxuICAgICAgLy8gIyBNb3ZlbWVudHNcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5oYW5kbGVNb3ZlbWVudCggdGhpcy5rZXlzRG93biApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vICMgQ2hlY2sgaWYgcGxheWVyIGlzIGNvbGxpZGluZ1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb2xsaXNpb24uY2hlY2socGxheWVyKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBcIlRocmVhZFwiIHRoYSBydW5zIHRoZSBnYW1lXHJcbiAgICBydW5HYW1lKGZwcykge1xyXG4gICAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIGZwcztcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgICB0aGlzLmdhbWVMb29wKCk7XHJcbiAgICB9XHJcbiAgICBnYW1lTG9vcCgpIHtcclxuXHJcbiAgICAgIC8vIGNhbGMgZWxhcHNlZCB0aW1lIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICB0aGlzLm5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMuZWxhcHNlZCA9IHRoaXMubm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcblxyXG4gICAgICAvLyBpZiBlbm91Z2ggdGltZSBoYXMgZWxhcHNlZCwgZHJhdyB0aGUgbmV4dCBmcmFtZVxyXG4gICAgICBpZiAoIHRoaXMuZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuXHJcbiAgICAgICAgLy8gR2V0IHJlYWR5IGZvciBuZXh0IGZyYW1lIGJ5IHNldHRpbmcgdGhlbj1ub3csIGJ1dCBhbHNvIGFkanVzdCBmb3IgeW91clxyXG4gICAgICAgIC8vIHNwZWNpZmllZCBmcHNJbnRlcnZhbCBub3QgYmVpbmcgYSBtdWx0aXBsZSBvZiBSQUYncyBpbnRlcnZhbCAoMTYuN21zKVxyXG4gICAgICAgIHRoaXMuZGVsdGFUaW1lID0gdGhpcy5ub3cgLSAodGhpcy5lbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlR2FtZSggdGhpcy5kZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJ1bnMgb25seSB3aGVuIHRoZSBicm93c2VyIGlzIGluIGZvY3VzXHJcbiAgICAgIC8vIFJlcXVlc3QgYW5vdGhlciBmcmFtZVxyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuZ2FtZUxvb3AuYmluZCh0aGlzKSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRTY2VuYXJpbyggc2NlbmFyaW9faWQsIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKSB7XHJcblxyXG4gICAgICAvLyBJdGVtc1N0YXRlXHJcbiAgICAgIGlmKCBzYXZlRGF0YSApIHtcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScsIEpTT04uc3RyaW5naWZ5KHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zKSApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19pdGVtc1N0YXRlJywgSlNPTi5zdHJpbmdpZnkoe30pICk7IC8vIENsZWFyIHByZXZpb3VzIHNhdmVzdGF0ZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzd2l0Y2goc2NlbmFyaW9faWQpIHtcclxuICAgICAgICBjYXNlIFwicHJvdG90eXBlXCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzYW5kYm94XCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvU2FuZGJveChjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gIFxyXG4gIC8vICMgTWVudVxyXG4gIFxyXG4gIC8vIEBwYXVzZWQgZGV0ZXJtaW5lIGlmIHRoZSBnYW1lIGNhbWUgZnJvbSBhIHBhdXNlIGFjdGlvbiBvciBhIG5ldyBnYW1lICh3aGVuIHBhZ2UgbG9hZHMpXHJcbiAgbWFpbk1lbnUocGF1c2VkKSB7IFxyXG4gICAgXHJcbiAgICBsZXQgZGl2TWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpO1xyXG5cclxuICAgIC8vIFNldCBtYWluTWVudSBjbGFzc1xyXG4gICAgKCBwYXVzZWQgKSA/IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgncGF1c2VkJykgOiAnJztcclxuICAgICggcGF1c2VkICkgPyAnJyA6IGRpdk1lbnUuY2xhc3NMaXN0LmFkZCgnbmV3LWdhbWUnKTtcclxuICAgIFxyXG4gICAgLy8gVG9nZ2xlIE1lbnVcclxuICAgIGRpdk1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgLy8gSGFuZGxlIE1lbnUgQWN0aW9uXHJcbiAgICBtZW51QWN0aW9uKGFjdGlvbikge1xyXG4gICAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnY29udGludWUnOlxyXG4gICAgICAgICAgdGhpcy5jb250aW51ZUdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgdGhpcy5zYXZlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbG9hZCc6XHJcbiAgICAgICAgICB0aGlzLmxvYWRHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICduZXcnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5uZXdHYW1lKGZhbHNlKTsvLyBmYWxzZSA9IHdvbid0IGxvYWQgc2F2ZURhdGFcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldy0yLXBsYXllcnMnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY29udHJvbHMnOlxyXG4gICAgICAgIGNhc2UgJ2JhY2stY29udHJvbHMnOlxyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyb2xzJykuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gIFxyXG4gIC8vICMgTmV3IEdhbWVcclxuICBuZXdHYW1lKHNhdmVEYXRhKSB7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLm1lbnVTb3VuZCApIHtcclxuICAgICAgaWYoIHRoaXMubWVudVNvdW5kLnBsYXlpbmcoKSApIHRoaXMubWVudVNvdW5kLnN0b3AoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB0aGlzLmxvYWRpbmcodHJ1ZSk7XHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhcnROZXdHYW1lKHNhdmVEYXRhKTsgXHJcbiAgICB9LCA1MDAgKTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBDb250aW51ZVxyXG4gIGNvbnRpbnVlR2FtZSgpIHtcclxuICAgIHRoaXMudW5wYXVzZSgpO1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gXHJcbiAgLy8gIyBTYXZlXHJcbiAgc2F2ZUdhbWUoKSB7XHJcbiAgICBpZiggY29uZmlybSgnU2FsdmFyIG8gam9nbyBhdHVhbCBpcsOhIHNvYnJlZXNjcmV2ZXIgcXVhbHF1ZXIgam9nbyBzYWx2byBhbnRlcmlvcm1lbnRlLiBEZXNlamEgY29udGludWFyPycpICkge1xyXG4gICAgICBcclxuICAgICAgLy8gU2F2ZSBpdGVtcyBzdGF0ZSBmaXJzdFxyXG4gICAgICB0aGlzLnNjZW5hcmlvLnNhdmVJdGVtc1N0YXRlKCk7XHJcblxyXG4gICAgICBsZXQgc2F2ZURhdGEgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgICAvLyBNdWx0aXBsYXllclxyXG4gICAgICBzYXZlRGF0YS5tdWx0aXBsYXllciA9IHRoaXMubXVsdGlwbGF5ZXI7XHJcblxyXG4gICAgICAvLyBTY2VuYXJpb1xyXG4gICAgICBzYXZlRGF0YS5zY2VuYXJpbyA9IHtcclxuICAgICAgICBzY2VuYXJpb0lkOiB0aGlzLnNjZW5hcmlvLmdldElkKCksXHJcbiAgICAgICAgc3RhZ2VJZDogdGhpcy5zY2VuYXJpby5nZXRBY3R1YWxTdGFnZUlkKCksXHJcbiAgICAgICAgaXRlbXM6IHRoaXMuZ2V0SXRlbXNTdGF0ZSgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBsYXllcnNcclxuICAgICAgc2F2ZURhdGEucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgc2F2ZURhdGEucGxheWVycy5wdXNoKHtcclxuICAgICAgICAgIHBsYXllck51bWJlcjogcGxheWVyLmdldFBsYXllck51bWJlcigpLFxyXG4gICAgICAgICAgeDogcGxheWVyLmdldFgoKSxcclxuICAgICAgICAgIHk6IHBsYXllci5nZXRZKCksXHJcbiAgICAgICAgICBsaWZlczogcGxheWVyLmdldExpZmVzKClcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDb252ZXJ0IHRvIEpTT05cclxuICAgICAgc2F2ZURhdGEgPSBKU09OLnN0cmluZ2lmeShzYXZlRGF0YSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTYXZlIG9uIExvY2FsU3RvcmFnZVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2d1Zml0cnVwaV9fc2F2ZScsIHNhdmVEYXRhICk7XHJcblxyXG4gICAgICBhbGVydCgnSm9nbyBzYWx2byEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTYXZlXHJcbiAgbG9hZEdhbWUoKSB7XHJcbiAgICBcclxuICAgIC8vICMgR2V0IGRhdGEgZnJvbSBsb2NhbHN0b3JhZ2UgYW5kIGNvbnZlcnRzIHRvIGpzb25cclxuICAgIGxldCBzYXZlRGF0YSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX3NhdmUnKSApO1xyXG5cclxuICAgIGlmKCBzYXZlRGF0YSApIHtcclxuICAgICAgLy8gV2lsbCBiZSAgbXVsdGlwbGF5ZXIgZ2FtZT9cclxuICAgICAgdGhpcy5tdWx0aXBsYXllciA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLm11bHRpcGxheWVyIDogZmFsc2U7XHJcblxyXG4gICAgICAvLyBSZXBsYWNlIGl0ZW1zIHN0YXRlIG9uIGxvY2FsIHN0b3JhZ2Ugd2l0aCBzYXZlZCBzdGF0ZXNcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBKU09OLnN0cmluZ2lmeSggc2F2ZURhdGEuc2NlbmFyaW8uaXRlbXMgKSApO1xyXG5cclxuICAgICAgLy8gTG9hZCBJdGVtcyBpdGVuc1xyXG4gICAgICBmb3IoIGxldCBpIGluIHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zICkge1xyXG4gICAgICAgIHRoaXMuYWRkSXRlbVN0YXRlKCBzYXZlRGF0YS5zY2VuYXJpby5pdGVtc1tpXSApO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gIyBMb2FkcyBhIG5ldyBnYW1lIHdpdGggc2F2ZSBkYXRhXHJcbiAgICAgIHRoaXMubmV3R2FtZShzYXZlRGF0YSk7IFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ07Do28gaMOhIGpvZ28gc2Fsdm8gcHJldmlhbWVudGUuJylcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBQYXVzZVxyXG4gIGlzUGF1c2VkKCkgeyByZXR1cm4gdGhpcy5fcGF1c2U7IH1cclxuICBwYXVzZSgpIHsgXHJcbiAgICB0aGlzLl9wYXVzZSA9IHRydWU7IFxyXG4gICAgdGhpcy5tYWluTWVudSh0cnVlKTtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMuc2NlbmFyaW8gKSB0aGlzLnNjZW5hcmlvLnNvdW5kLnBhdXNlKCk7XHJcblxyXG4gICAgLy9IaWRlIENvbnRyb2wgc2NyZWVuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJvbHMnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICBcclxuICB9XHJcbiAgdW5wYXVzZSgpIHsgXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbk1lbnUnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICB0aGlzLl9wYXVzZSA9IGZhbHNlOyBcclxuICAgIFxyXG4gICAgdGhpcy5tZW51U291bmQuc3RvcCgpO1xyXG4gICAgaWYoIHRoaXMuc2NlbmFyaW8gKSB0aGlzLnNjZW5hcmlvLnNvdW5kLnBsYXkoKTtcclxuICB9XHJcbiAgdG9nZ2xlUGF1c2UoKSB7ICggdGhpcy5pc1BhdXNlZCgpICkgPyB0aGlzLnVucGF1c2UoKSA6IHRoaXMucGF1c2UoKSB9XHJcbiAgXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIExvYWRpbmdcclxuICBsb2FkaW5nKGJvb2wpIHtcclxuICAgIGxldCBkaXNwbGF5ID0gKCBib29sICkgPyAnZmxleCcgOiAnbm9uZSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5O1xyXG4gIH1cclxuICBcclxuICAvLyAjIExvYWRpbmdcclxuICBnYW1lT3Zlcihib29sKSB7XHJcbiAgICBpZiggYm9vbCApIHRoaXMuX3BhdXNlID0gdHJ1ZTsgXHJcbiAgICBsZXQgZGlzcGxheSA9ICggYm9vbCApID8gJ2ZsZXgnIDogJ25vbmUnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUtb3ZlcicpLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5O1xyXG4gICAgaWYoIGJvb2wgJiYgdGhpcy5nYW1lT3ZlclNvdW5kICkge1xyXG4gICAgICBpZiggdGhpcy5zY2VuYXJpbyApIHRoaXMuc2NlbmFyaW8uc291bmQuc3RvcCgpO1xyXG4gICAgICB0aGlzLmdhbWVPdmVyU291bmQucGxheSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvKlxyXG4gICAgSXRlbXMgU3RhdGVcclxuICAgIC0gVGhpcyBhcmUgZnVuY3Rpb25zIHRoYXQgaGFuZGxlcyBpdGVtcyBzdGF0ZXMgYmV0d2VlbiBjaGFuZ2luZyBvZiBzdGFnZXMuIFRoaXMgd2lsbCBtYWtlIGFuIGl0ZW0gdG8gbm90IHJlc3Bhd24gaWYgaXQgd2FzIGNvbGxlY3RlZCBiZWZvcmVcclxuICAqL1xyXG4gIFxyXG4gICAgZ2V0SXRlbXNTdGF0ZSgpIHsgcmV0dXJuIHRoaXMuaXRlbXNTdGF0ZTsgfVxyXG4gICAgYWRkSXRlbVN0YXRlKCBpdGVtICkgeyBcclxuICAgICAgdGhpcy5pdGVtc1N0YXRlW2l0ZW0ubmFtZV9pZF0gPSBpdGVtOyAgXHJcbiAgICB9XHJcblxyXG4gICAgc2F2ZUl0ZW1zU3RhdGUoKSB7XHJcbiAgICAgIGxldCBpdGVtc1N0YXRlID0gSlNPTi5zdHJpbmdpZnkoIHRoaXMuZ2V0SXRlbXNTdGF0ZSgpICk7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19pdGVtc1N0YXRlJywgaXRlbXNTdGF0ZSApO1xyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gSGVscGVycyBmb3IgY2xhc3NlcyB0byBjaGVjayBpZiBhbiBvYmplY3QgaXMgY29sbGlkaW5nIFxyXG4gIGNoZWNrQ29sbGlzaW9uKCBvYmplY3QgKSB7XHJcbiAgICBpZiggdGhpcy5pc0dhbWVSZWFkeSgpIClcclxuICAgICAgcmV0dXJuIHRoaXMuY29sbGlzaW9uLmNoZWNrKG9iamVjdCk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgUnVuXHJcbiAgcnVuKCkge1xyXG5cclxuICAgIC8vIEhpZGUgRWxlbWVudHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lQ2FudmFzJykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuICAgIHRoaXMuZ2FtZU92ZXIoZmFsc2UpO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBldmVudCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuZGVmYXVsdEV2ZW50TGlzdGVuZXJzKCk7XHJcblxyXG4gICAgLy8gU2hvd3MgTWVudVxyXG4gICAgdGhpcy5tYWluTWVudShmYWxzZSk7XHJcblxyXG4gICAgLy8gQXV0byBsb2FkIGEgZ2FtZSAtIGRlYnVnIG1vZGVcclxuICAgIGlmKCB3aW5kb3cuYXV0b2xvYWQgKSB7XHJcbiAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7IiwiY2xhc3MgUmVuZGVyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHBsYXllcikge1xyXG4gICAgdGhpcy5jdHggPSBjdHg7IFxyXG4gICAgdGhpcy5zY2VuYXJpbyA9IFwiXCI7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgXHJcbiAgZ2V0QXJyYXlJdGVtcygpeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIFxyXG4gIC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcbiAgYWRkSXRlbShvYmplY3Qpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcbiAgfVxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7IFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgc2V0U2NlbmFyaW8oc2NlbmFyaW8pe1xyXG4gICAgdGhpcy5zY2VuYXJpbyA9IHNjZW5hcmlvO1xyXG4gIH1cclxuICAgICAgICAgICAgXHJcbiAgLy8gVGhpcyBmdW5jdGlvbnMgd2lsbCBiZSBjYWxsZWQgY29uc3RhbnRseSB0byByZW5kZXIgaXRlbXNcclxuICBzdGFydChkZWx0YVRpbWUpIHtcdFx0XHJcbiAgICAgICAgICAgICAgICBcclxuICAgIC8vIENsZWFyIGNhbnZhcyBiZWZvcmUgcmVuZGVyIGFnYWluXHJcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gMDtcclxuXHJcbiAgICAvLyBTY2VuYXJpb1xyXG4gICAgaWYgKCB0aGlzLnNjZW5hcmlvICE9IFwiXCIpIFxyXG4gICAgICB0aGlzLnNjZW5hcmlvLnJlbmRlcih0aGlzLmN0eCk7XHJcbiAgICAgIFxyXG4gICAgLy8gUmVuZGVyIGl0ZW1zXHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMucmVuZGVySXRlbXMpIHtcclxuICAgICAgLy8gRXhlY3V0ZSB0aGUgcmVuZGVyIGZ1bmN0aW9uIC0gSW5jbHVkZSB0aGlzIGZ1bmN0aW9uIG9uIGV2ZXJ5IGNsYXNzXHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXNbaV0ucmVuZGVyKHRoaXMuY3R4LCBkZWx0YVRpbWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgfVxyXG4gICAgXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyIiwiY2xhc3MgU3ByaXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGUsIHcsIGgsIGtXLCBrSCkge1xyXG5cclxuICAgICAgICAvLyBUaGUgSW1hZ2UgU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBzcHJpdGU7XHJcblxyXG4gICAgICAgIC8vIFNpemUgb2YgaW1hZ2Ugc3ByaXRlIFxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaDtcclxuXHJcbiAgICAgICAgLy8gU2l6ZSBvZiBlYWNoIGZyYW1lIHNxdWFyZSBcclxuICAgICAgICB0aGlzLmtleVdpZHRoID0ga1c7XHJcbiAgICAgICAgdGhpcy5rZXlIZWlnaHQgPSBrSDtcclxuXHJcbiAgICAgICAgLy8gUm93cyBhbmQgQ29sbHVtbnMgcXVhbnRpdHlcclxuICAgICAgICB0aGlzLmNvbHMgPSBNYXRoLmNlaWwoIHRoaXMud2lkdGggLyB0aGlzLmtleVdpZHRoICk7XHJcbiAgICAgICAgdGhpcy5yb3dzID0gTWF0aC5jZWlsKCB0aGlzLmhlaWdodCAvIHRoaXMua2V5SGVpZ2h0ICk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBmcmFtZXNcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5ydW4oKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIEdldHNcclxuICAgIGdldFNwcml0ZSgpICAgIHsgcmV0dXJuIHRoaXMuc3ByaXRlOyB9XHJcbiAgICBnZXRGcmFtZShudW0pICB7IHJldHVybiB0aGlzLmZyYW1lc1tudW1dOyB9XHJcbiAgICBnZXRLZXlXaWR0aCgpICB7IHJldHVybiB0aGlzLmtleVdpZHRoOyAgICB9XHJcbiAgICBnZXRLZXlIZWlnaHQoKSB7IHJldHVybiB0aGlzLmtleUhlaWdodDsgICB9XHJcbiAgICBnZXRTcHJpdGVQcm9wcyhudW0pIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjbGlwX3g6IHRoaXMuZ2V0RnJhbWUobnVtKS54LCBjbGlwX3k6IHRoaXMuZ2V0RnJhbWUobnVtKS55LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLmdldEtleVdpZHRoKCksIHNwcml0ZV9oZWlnaHQ6IHRoaXMuZ2V0S2V5SGVpZ2h0KCkgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vICMgUnVuXHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgLy8gR2VuIGVhY2ggZnJhbWUgYmFzZWQgb24gc2l6ZXMgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBmb3IoIGxldCByPTA7IHI8dGhpcy5yb3dzO3IrKyApIHtcclxuICAgICAgICAgICAgZm9yKCBsZXQgYz0wOyBjPHRoaXMuY29scztjKysgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lc1tpbmRleF0gPSB7IFxyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMua2V5V2lkdGggKiBjLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHRoaXMua2V5SGVpZ2h0ICogclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7IiwiY29uc3QgVUlpdGVtID0gcmVxdWlyZSgnLi9fVUlpdGVtJyk7XHJcbmNvbnN0IERpYWxvZyA9IHJlcXVpcmUoJy4vX0RpYWxvZycpO1xyXG5cclxuY2xhc3MgVUkge1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXJzLCBnYW1lUHJvcHMpIHtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJzID0gcGxheWVycztcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgICB0aGlzLmdhbWVQcm9wcyA9IGdhbWVQcm9wcztcclxuICAgIHRoaXMuY2h1bmtTaXplID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICAgICAgICAgICAgICBcclxuICAvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG4gIGFkZEl0ZW0ob2JqZWN0KXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG4gIH1cclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuICAgIGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpeyBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIGdldFJlbmRlckl0ZW1zKCl7XHJcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtcztcclxuICB9XHJcblxyXG4gIC8vIENsZWFyIGFycmF5IGFuZCByZXJ1biBjb2RlIHRvIGdldCBuZXcgaXRlbXNcclxuICBnZXROZXdSZW5kZXJJdGVtcygpIHtcclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVuZGVySXRlbXMoKTtcclxuICB9XHJcblxyXG4gIC8vIE1hdGhcclxuICBmcm9tUmlnaHQodmFsdWUpIHtcclxuICAgIHJldHVybiAoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAqIHRoaXMuY2h1bmtTaXplICkgLSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJ1bigpIHtcclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuXHJcbiAgICAgIC8vICMgUGxheWVyIDAxXHJcbiAgICAgICAgaWYoIHRoaXMucGxheWVyc1swXSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuY2h1bmtTaXplLFxyXG4gICAgICAgICAgICA1LCA1LCAvLyB4LCB5LFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgLy8gc3ByaXRlX3csIHNwcml0ZV9oLCBcclxuICAgICAgICAgICAgMCwgMCwgICAgICAvLyBjbGlwX3gsIGNsaXBfeVxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgLy8gdywgaFxyXG4gICAgICAgICAgKSApO1xyXG5cclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8xeCA9IDEyMDtcclxuICAgICAgICAgIGxldCBfMXkgPSAxMDtcclxuICAgICAgICAgIGxldCBfMWxpZmVzID0gdGhpcy5wbGF5ZXJzWzBdLmdldExpZmVzKCk7XHJcbiAgICAgICAgICBmb3IoIGxldCBpPTA7IGk8XzFsaWZlcztpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgICAgXzF4LCBfMXksXHJcbiAgICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICAgIDEwMCwgMCwgICAgICBcclxuICAgICAgICAgICAgICB0aGlzLmNodW5rU2l6ZS8zLCB0aGlzLmNodW5rU2l6ZS8zIFxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICAgIF8xeCArPSAzNTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09IDIgKSB7XHJcbiAgICAgICAgICAgICAgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgICAgIF8xeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIFxyXG5cclxuICAgICAgLy8gIyBQbGF5ZXIgMDJcclxuICAgICAgICBpZiggdGhpcy5wbGF5ZXJzWzFdICkge1xyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpLFxyXG4gICAgICAgICAgICB0aGlzLmZyb21SaWdodCggMjMwICksIDUsIFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgIDUwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgXHJcbiAgICAgICAgICApICk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8yeCA9IHRoaXMuZnJvbVJpZ2h0KCA1MCApO1xyXG4gICAgICAgICAgbGV0IF8yeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8ybGlmZXMgPSB0aGlzLnBsYXllcnNbMV0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMmxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMngsIF8yeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzJ4IC09IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMnggPSB0aGlzLmZyb21SaWdodCggNTAgKTtcclxuICAgICAgICAgICAgICBfMnkgPSA2MDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAvLyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIFxyXG5cclxuICAgIC8qXHJcbiAgICAgICAgRGlhbG9nIEJveFxyXG4gICAgKi9cclxuICAgICAgXHJcbiAgICAgIGxldCBkUHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5jaHVua1NpemUgKiAxLFxyXG4gICAgICAgIHk6IHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5jYW52YXNIZWlnaHQgLSAodGhpcy5jaHVua1NpemUgKiAxKSxcclxuICAgICAgICB3OiB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuY2FudmFzV2lkdGggLSAodGhpcy5jaHVua1NpemUgKiAyKSxcclxuICAgICAgICBoOiB0aGlzLmNodW5rU2l6ZSAqIDQsXHJcbiAgICAgICAgZGlhbG9nOiB3aW5kb3cuZ2FtZS5kaWFsb2dbd2luZG93LmdhbWUuZGlhbG9nSW5kZXhdXHJcbiAgICAgIH1cclxuICAgICAgZFByb3BzLnkgPSBkUHJvcHMueSAtIGRQcm9wcy5oO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5hZGRJdGVtKCBcclxuICAgICAgICBuZXcgRGlhbG9nKCBkUHJvcHMueCwgZFByb3BzLnksIGRQcm9wcy53LCBkUHJvcHMuaCwgZFByb3BzLmRpYWxvZyApIFxyXG4gICAgICApO1xyXG4gIH1cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBVSSIsImNsYXNzIF9EaWFsb2cge1xyXG5cclxuICBjb25zdHJ1Y3RvciggeCwgeSwgdywgaCwgZGlhbG9nICkge1xyXG4gICAgXHJcbiAgICB0aGlzLmRpYWxvZyA9IGRpYWxvZztcclxuICAgIFxyXG4gICAgdGhpcy50ZXh0ID0ge307XHJcblxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgdGhpcy53ID0gdztcclxuXHRcdHRoaXMuaCA9IGg7XHJcblx0XHRcclxuXHRcdHRoaXMuY29ybmVyUmFkaXVzID0gMjA7XHJcblxyXG5cdFx0dGhpcy5maWxsQ29sb3IgPSBcInJnYmEoMjU1LDI1NSwyNTUsMC44KVwiO1xyXG5cdFx0dGhpcy5zdHJva2VDb2xvciA9IFwicmdiYSgwLDAsMCwwLjgpXCI7XHJcblx0XHRcclxuXHRcdHRoaXMuZm9udCA9IFwiMjhweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICB0aGlzLmZvbnRDb2xvciA9IFwicmdiYSgwLDAsMCwwLjgpXCI7XHJcblxyXG4gICAgdGhpcy50ZXh0WSA9IHRoaXMueSArIDkwO1xyXG4gICAgdGhpcy5hZGp1c3RUZXh0KCB0aGlzLmRpYWxvZy50ZXh0LCA0OCApO1xyXG5cclxuICB9XHJcbiAgICBcclxuICAvLyAjIFNldHMgICAgICBcclxuICAgIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICAgICAgXHJcbiAgICAvLyAjIEdldHMgICAgICAgICAgICBcclxuICAgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHJcbiAgICBhZGp1c3RUZXh0KCBzdHIsIGxlbmdodCApIHtcclxuICAgICAgdGhpcy50ZXh0ID0gdGhpcy5zcGxpdFRleHQoc3RyLCBsZW5naHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHNwbGl0VGV4dChzdHIsIGwpIHsgLy9yZWY6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MjQ3MTMvanMtc3BsaXR0aW5nLWEtbG9uZy1zdHJpbmctaW50by1zdHJpbmdzLXdpdGgtY2hhci1saW1pdC13aGlsZS1hdm9pZGluZy1zcGxpdHRpblxyXG4gICAgICB2YXIgc3RycyA9IFtdO1xyXG4gICAgICB3aGlsZShzdHIubGVuZ3RoID4gbCl7XHJcbiAgICAgICAgICB2YXIgcG9zID0gc3RyLnN1YnN0cmluZygwLCBsKS5sYXN0SW5kZXhPZignICcpO1xyXG4gICAgICAgICAgcG9zID0gcG9zIDw9IDAgPyBsIDogcG9zO1xyXG4gICAgICAgICAgc3Rycy5wdXNoKHN0ci5zdWJzdHJpbmcoMCwgcG9zKSk7XHJcbiAgICAgICAgICB2YXIgaSA9IHN0ci5pbmRleE9mKCcgJywgcG9zKSsxO1xyXG4gICAgICAgICAgaWYoaSA8IHBvcyB8fCBpID4gcG9zK2wpXHJcbiAgICAgICAgICAgICAgaSA9IHBvcztcclxuICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoaSk7XHJcbiAgICAgIH1cclxuICAgICAgc3Rycy5wdXNoKHN0cik7XHJcbiAgICAgIHJldHVybiBzdHJzO1xyXG4gIH1cclxuXHJcbiAgICAvLyAjIEl0ZW0gUmVuZGVyXHJcbiAgICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgICBcclxuICAgICAgaWYgKCB0aGlzLmRpYWxvZy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gUm91bmRlZCBSZWN0YW5nbGUgLSByZWZlcmVuY2U6IGh0dHA6Ly9qc2ZpZGRsZS5uZXQvcm9iaGF3a2VzL2dIQ0p0L1xyXG4gICAgXHJcblx0XHQgIC8vIFNldCBmYXV4IHJvdW5kZWQgY29ybmVyc1xyXG4gICAgICBjdHgubGluZUpvaW4gPSBcInJvdW5kXCI7XHJcbiAgICAgIGN0eC5saW5lV2lkdGggPSB0aGlzLmNvcm5lclJhZGl1cztcclxuXHJcblx0XHRcdC8vIENoYW5nZSBvcmlnaW4gYW5kIGRpbWVuc2lvbnMgdG8gbWF0Y2ggdHJ1ZSBzaXplIChhIHN0cm9rZSBtYWtlcyB0aGUgc2hhcGUgYSBiaXQgbGFyZ2VyKVxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gU3Ryb2tlXHJcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlQ29sb3I7XHJcblx0XHRcdGN0eC5zdHJva2VSZWN0KHRoaXMueCArICggdGhpcy5jb3JuZXJSYWRpdXMvMiksIHRoaXMueSArICh0aGlzLmNvcm5lclJhZGl1cy8yKSwgdGhpcy53IC0gdGhpcy5jb3JuZXJSYWRpdXMsIHRoaXMuaCAtIHRoaXMuY29ybmVyUmFkaXVzICk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBGaWxsXHJcblx0XHRcdGN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxDb2xvcjtcclxuICAgICAgY3R4LmZpbGxSZWN0KHRoaXMueCArICggdGhpcy5jb3JuZXJSYWRpdXMvMiksIHRoaXMueSArICh0aGlzLmNvcm5lclJhZGl1cy8yKSwgdGhpcy53IC0gdGhpcy5jb3JuZXJSYWRpdXMsIHRoaXMuaCAtIHRoaXMuY29ybmVyUmFkaXVzICk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBGb250XHJcblx0XHRcdGN0eC5mb250ID0gdGhpcy5mb250O1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5mb250Q29sb3JcclxuICAgICAgdGhpcy50ZXh0Lm1hcCggKHRleHQpID0+IHtcclxuICAgICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMueCArIDUwLCB0aGlzLnRleHRZKTtcclxuICAgICAgICB0aGlzLnRleHRZID0gdGhpcy50ZXh0WSArIDUwO1xyXG4gICAgICB9ICk7XHJcblx0XHRcdFxyXG4gICAgfVxyXG4gICAgICAgICBcclxuICB9Ly9jbGFzc1xyXG4gIG1vZHVsZS5leHBvcnRzID0gX0RpYWxvZztcclxuICAgICIsImNsYXNzIFVJaXRlbSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGl0ZW1TcHJpdGVJRCwgY2h1bmtTaXplLCB4LCB5LCBzdywgc2gsIGN4LCBjeSwgdywgaCApIHtcclxuICBcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICB0aGlzLml0ZW1TcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtU3ByaXRlSUQpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0ge1xyXG4gICAgICBzcHJpdGVfd2lkdGg6IHN3LFxyXG4gICAgICBzcHJpdGVfaGVpZ2h0OiBzaCxcclxuICAgICAgY2xpcF94OiBjeCxcclxuICAgICAgY2xpcF95OiBjeSxcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IGNodW5rU2l6ZTtcclxuXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSB3OyAvL3B4XHJcbiAgICB0aGlzLmhlaWdodCA9IGg7IC8vcHhcclxuICB9XHJcblxyXG4gIC8vICMgU2V0cyAgICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICAvLyAjIEdldHMgICAgICAgICAgICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICBcclxuICAvLyAjIEl0ZW0gUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgIHRoaXMuaXRlbVNwcml0ZSwgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgKTtcclxuICAgIFxyXG4gIH1cclxuICAgICBcclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlpdGVtO1xyXG4iLCIvLyBHYW1lIFByb3BlcnRpZXMgY2xhc3MgdG8gZGVmaW5lIGNvbmZpZ3VyYXRpb25zXHJcbmNsYXNzIGdhbWVQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcclxuICAgIC8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gMTAwOyAvL3B4IC0gcmVzb2x1dGlvblxyXG4gICAgXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxNjtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxNDtcclxuICAgIFxyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyk7XHJcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MpOy8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuZnBzID0gMjQ7XHJcbiAgfVxyXG5cclxuICBnZXRQcm9wKHByb3ApIHtcclxuICAgIHJldHVybiB0aGlzW3Byb3BdO1xyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBnYW1lUHJvcGVydGllcztcclxuXHJcbi8vIEdsb2JhbCB2YWx1ZXNcclxuXHJcbiAgLy8gRGVidWdcclxuICB3aW5kb3cuZGVidWcgPSBmYWxzZTsgLy8gU2hvdyBkZWJ1ZyBzcXVhcmVzXHJcbiAgd2luZG93LmRlYnVnQ29sbGlzaW9uID0gZmFsc2U7IC8vIFNob3cgd2hlbiBvYmplY3RzIGNvbGxpZGVcclxuICB3aW5kb3cuYXV0b2xvYWQgPSBmYWxzZTsgLy8gYXV0byBsb2FkIGEgc2F2ZWQgZ2FtZVxyXG4gIHdpbmRvdy5nb2RfbW9kZSA9IGZhbHNlOyAvLyBQbGF5ZXJzIHdvbid0IGRpZSIsImNvbnN0IEdhbWUgPSByZXF1aXJlKCcuL2VuZ2luZS9jb3JlL0dhbWUnKTtcclxuY29uc29sZS5jbGVhcigpO1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgXHJcbiAgLy8gIyBUcmlnZ2VycyBuZXcgZ2FtZSBvbmx5IHdoZW4gY2xpY2sgb24gYnV0dG9uIC0gbmVlZGVkIHNvbWUgaW50ZXJhY3Rpb24gdG8gYWN0aXZhdGUgdGhlIHNvdW5kXHJcbiAgbGV0IHN0YXJ0R2FtZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydC1nYW1lLWJ1dHRvbicpO1xyXG4gIHN0YXJ0R2FtZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgcnVuR2FtZSgpO1xyXG4gIH0sIGZhbHNlKTtcclxuXHJcbiAgLy8gRGVidWdcclxuICBpZiggd2luZG93LmF1dG9sb2FkICkge1xyXG4gICAgcnVuR2FtZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFydCB0aGUgZ2FtZVxyXG4gIGZ1bmN0aW9uIHJ1bkdhbWUoKSB7XHJcbiAgICBcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaXJzdC1zY3JlZW4nKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcblxyXG4gICAgbGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUgPSBnYW1lO1xyXG4gICAgZ2FtZS5ydW4oKTtcclxuXHJcbiAgfVxyXG4gXHJcbn0iXX0=
