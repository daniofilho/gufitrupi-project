(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Sprite = require('../engine/core/Sprite');

class Player {

	constructor(x0, y0, gameProps, playerNumber, playerProps) {
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
      this.x = x0;
      this.y = y0;
      
      this.x0 = x0; // initial position
      this.y0 = y0;
    
    // # Properties
      this.width = this.chunkSize; //px
      this.height = this.chunkSize * 2; //px
      
      this.speed0 = 0.17;
      this.speed = this.chunkSize * this.speed0;
      
      this.name = "player_" + playerNumber;
      this.playerNumber = playerNumber;
      this.type = "player";

      this.grabing = false;
      
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
      this.collisionX = x0 + this.CollisionXFormula;
      this.collisionY = y0 + this.CollisionYFormula;

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

      this.run();
  }

  /* 
      Grab/Pick Items Collision Box
  */

    checkGrabbingObjects() {
      let hasGrabObject = false;
      // Check if player has grabbed items
      let renderedItems = window.game.scenario.getLayerItems__bottom();
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
    };
			
		movRight() { 
      this.increaseStep();
      this.setLookDirection( this.lookRight() );
      this.setX( this.getX() + this.getSpeed() ); 
      this.setCollisionX( this.getCollisionX() + this.getSpeed()); 
      this.updateGrabCollisionXY();
    };
			
		movUp() { 
      this.increaseStep();
      this.setLookDirection( this.lookUp() );
      this.setY( this.getY() - this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() - this.getSpeed() );
      this.updateGrabCollisionXY();
    };
			
		movDown() {  
      this.increaseStep();
      this.setLookDirection( this.lookDown() );
      this.setY( this.getY() + this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() + this.getSpeed() );
      this.updateGrabCollisionXY();
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
        setTimeout( () => {
          window.game.loading(true);
          window.game.newGame();
        }, 3000);
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
      this.checkGrabbingObjects();
      this.lookDirection = this.lookDown();
      this.updateGrabCollisionXY();
    }
		
}//class
module.exports = Player;

},{"../engine/core/Sprite":37}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"../engine/core/Sprite":37,"dup":1}],3:[function(require,module,exports){
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
},{"../../../engine/assets/_Scenario":32,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":24}],5:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Fire":19,"../../common/Teleport":24}],6:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":24}],7:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":24}],8:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":24}],9:[function(require,module,exports){
/*
  Sandbox Scenario
*/
const _Scenario = require('../../../engine/assets/_Scenario');

const Stage_Center = require('./stages/stage_center');
const Stage_Life = require('./stages/stage_life');
const Stage_Enemy = require('./stages/stage_enemy');
const Stage_Doors = require('./stages/stage_doors');

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
        _stage = new Stage_Center();
        break;
      case 'life':
        _stage = new Stage_Life();
        break;
      case 'enemy':
        _stage = new Stage_Enemy();
        break;
      case 'doors':
        _stage = new Stage_Doors();
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
},{"../../../engine/assets/_Scenario":32,"./stages/stage_center":10,"./stages/stage_doors":11,"./stages/stage_enemy":12,"./stages/stage_life":13}],10:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Dialog":16,"../../common/Fire":19,"../../common/Teleport":24}],11:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Dialog":16,"../../common/Door":17,"../../common/Key":21,"../../common/Object_Push":22,"../../common/Object_Throw":23,"../../common/Teleport":24}],12:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Enemy":18,"../../common/Fire":19,"../../common/Heal":20,"../../common/Key":21,"../../common/Object_Push":22,"../../common/Object_Throw":23,"../../common/Teleport":24}],13:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":33,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Fire":19,"../../common/Heal":20,"../../common/Teleport":24}],14:[function(require,module,exports){
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
        this.spriteProps = this.sprite.getSpriteProps(249);
        break;
      
      case "02":
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
},{"../../../engine/assets/_Collidable":30,"../../../engine/core/Sprite":37}],15:[function(require,module,exports){
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
    }

  }

}//class
module.exports = Beach_wall;
},{"../../../engine/assets/_Collidable":30,"../../../engine/core/Sprite":37}],16:[function(require,module,exports){
const _DialogTrigger = require('../../../engine/assets/_DialogTrigger');
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

	let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);

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
				this.spriteProps = this.sprite.getSpriteProps(30);
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
				this.spriteProps = this.sprite.getSpriteProps(30);
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
				this.spriteProps = this.sprite.getSpriteProps(30);
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
					this.spriteProps = this.sprite.getSpriteProps(30);
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
					this.spriteProps = this.sprite.getSpriteProps(30);
				break;
			
		}
	
  }


}//class
module.exports = Dialog;
},{"../../../engine/assets/_DialogTrigger":31,"../../../engine/core/Sprite":37}],17:[function(require,module,exports){
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

    this.handleProps();
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
          objs[i].collect();
          objs[i].hide();
          objs[i].setStopOnCollision(false);
        }
      }
    }
  }

}//class
module.exports = Door;
},{"../../../engine/assets/_CanCollect":27,"../../../engine/core/Sprite":37}],18:[function(require,module,exports){
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

    this.runEnemy();
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
},{"../../../engine/assets/_CanHurt":28,"../../../engine/core/Sprite":37}],19:[function(require,module,exports){
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 49);

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
        this.spriteProps = this.sprite.getSpriteProps(0);
        break;
      case 2:
        this.spriteProps = this.sprite.getSpriteProps(1);
        break;
      case 3:
        this.spriteProps = this.sprite.getSpriteProps(2);
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
},{"../../../engine/assets/_CanHurt":28,"../../../engine/core/Sprite":37}],20:[function(require,module,exports){
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);

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
        this.spriteProps = this.sprite.getSpriteProps(20);
        break;
      case 'berry':
        this.spriteProps = this.sprite.getSpriteProps(21);
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
},{"../../../engine/assets/_CanCollect":27,"../../../engine/core/Sprite":37}],21:[function(require,module,exports){
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);

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
        this.spriteProps = this.sprite.getSpriteProps(26);
        break;
      case "purple":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(27);
        break;
      case "red":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(28);
        break;
      case "green":
        this.setCode('green');
        this.spriteProps = this.sprite.getSpriteProps(29);
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
},{"../../../engine/assets/_CanThrow":29,"../../../engine/core/Sprite":37}],22:[function(require,module,exports){
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);

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
        this.spriteProps = this.sprite.getSpriteProps(24);
        break;
    }
  }

}//class
module.exports = Object_Push;
},{"../../../engine/assets/_CanBePushed":26,"../../../engine/core/Sprite":37}],23:[function(require,module,exports){
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);

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
        this.spriteProps = this.sprite.getSpriteProps(22);
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
},{"../../../engine/assets/_CanThrow":29,"../../../engine/core/Sprite":37}],24:[function(require,module,exports){
const _Collidable = require('../../../engine/assets/_Collidable');
const gameProperties = require('../../../gameProperties'); 
const Sprite = require('../../../engine/core/Sprite');

class Teleport extends _Collidable {

	constructor(type, x0, y0, xIndex, yIndex, teleportProps) {
    
    let props = {
      name: "Teleport",
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

    let sprite = new Sprite(false, 0, 0, 0, 0);

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    super(props, position, dimension, sprite, events);
    
    this.teleportProps = teleportProps;

    this.xIndex = xIndex;
    this.yIndex = yIndex;
    
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
  collision(playerWhoActivatedTeleport, collidable, collisionDirection){
    
    let players = collidable.scenario.getPlayers();

    // If the player teleports, then change stage
    if( this.teleport( playerWhoActivatedTeleport ) ) {
      
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
        this.teleportProps.targetStage,
        false // firstStage ?
      );

      window.game.loading(false);
      
    }

  }

  // What kind of teleport?
  teleport( player ) {
    
    let gameProps = new gameProperties();

    let type = this.teleportProps.teleportType;
    let targetX = 0;
    let targetY = 0;

    let willTeleport = false;

    switch(type){
      default:
        targetX = this.teleportProps.targetX;
        targetY = this.teleportProps.targetY;
        willTeleport = true;
        break;
      case "relative":
        switch (this.teleportProps.cameFrom) {
          case "top":
            targetX = this.xIndex * this.chunkSize;
            targetY = ( (gameProps.getProp('screenVerticalChunks') - 3 ) * this.chunkSize); // -3 because of the player collision box
            willTeleport = true;
            break;
          case "bottom":
            targetX = this.xIndex * this.chunkSize;
            targetY = 0 * this.chunkSize; // Teleport to Y=0, but player hitbox will make him go 1 tile down
            willTeleport = true;
            break;
          case "right":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = 1 * this.chunkSize;
            willTeleport = true;
            break;
          case "left":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = ( gameProps.getProp('screenHorizontalChunks') - 2 ) * this.chunkSize; 
            willTeleport = true;
            break;
        }
        break;
    }

    // Only teleports if it can teleport
    if( willTeleport ) {
      player.setX( targetX ); // always using X and Y relative to teleport not player because it fix the player position to fit inside destination square.
      player.setY( targetY );
    }

    return willTeleport;

  }

}//class
module.exports = Teleport;
},{"../../../engine/assets/_Collidable":30,"../../../engine/core/Sprite":37,"../../../gameProperties":41}],25:[function(require,module,exports){
/**
 *  Store Assets that needs to be on any stage, like keys or items that player grabs
 * 
 *  Declare all of this assets here
 */

const Key = require('../../assets/scenario/common/Key');
const Object_Throw = require('../../assets/scenario/common/Object_Throw');

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
    }
    return r;
  }

}//class
module.exports = GlobalAssets;
},{"../../assets/scenario/common/Key":21,"../../assets/scenario/common/Object_Throw":23}],26:[function(require,module,exports){
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
},{"./_Collidable":30}],27:[function(require,module,exports){
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
},{"./_Collidable":30}],28:[function(require,module,exports){
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
},{"./_Collidable":30}],29:[function(require,module,exports){
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
    
    if( this.destroyOnAnimationEnd ) {
      this.setStopOnCollision(false);
      this.setDestroying(true); // Start destroy animation
    } else {
      this.setStopOnCollision(true);
    }

  }

  isDropped() { return this.dropped; }
  drop(direction, playerHeight) {
    this.calculateDropDirection( direction, playerHeight );
    this.setDestroyOnAnimationEnd(false);
    this.setThrowing(true);
    this.setGrab(false);
    this.playerWhoGrabbed = false;
    this.dropX = this.targetX;
    this.dropY = this.targetY;
  }

  throw(direction, playerHeight, player) {
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
},{"../core/Sprite":37,"./_Collidable":30}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class _DialogTrigger extends _Collidable {

  constructor(props, position, dimension, sprite, events, dialogTriggerProps) {
		super(props, position, dimension, sprite, events, dialogTriggerProps.fromSaveState);
		this.canUse = true;
	}
	
	setDialog(dialog) { this.dialog = dialog; }
	getDialog() { return this.dialog; }

	useHandler() { window.game.setDialog(this.dialog); }
  setName(name) { this.name = name; }
	
  beforeRender(ctx) { }

}//class
module.exports = _DialogTrigger;
},{"./_Collidable":30}],32:[function(require,module,exports){
class _Scenario {

  constructor(ctx, canvas, scenario_id, soundSrc){
    this.ctx = ctx;
    this.canvas = canvas;
        
    this.renderItems = new Array();
    this.renderLayerItems__top = new Array();
    this.renderLayerItems__bottom = new Array();
        
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.playerStartX = 0; 
    this.playerStartY = 0; 

    this.stage = null;
    this.stageId = "";
    
    this.chunkSize = window.game.getChunkSize();

    this.players = new Array();

    this.scenario_id = scenario_id;
    
    this.sound = null;
    this.soundSrc = soundSrc;

    this.initSound();
  }

  initSound() {
    this.sound = new Howl({
      src: [this.soundSrc]
    });
    this.sound.play();
  }

  // # Add Items to the render
  addStaticItem(item){
    this.renderItems.push(item);
  }
  addRenderLayerItem(item){
    this.renderLayerItems.push(item);
  }
  addRenderLayerItem__bottom(item){
    this.renderLayerItems__bottom.push(item);
  }
  addRenderLayerItem__top(item){
    this.renderLayerItems__top.push(item);
  }
  clearArrayItems(){
    this.renderItems = new Array();
    this.renderLayerItems__bottom = new Array();
    this.renderLayerItems__top = new Array();
  }

  // # Players
  addPlayer(player) {
    this.players.push(player);
  }
  getPlayers() { return this.players; }

  // # Gets
  getCtx() { return this.ctx; }
  getCanvas() { return this.canvas; }	

  getId() { return this.scenario_id; }
  getActualStageId() { return this.stageId; }
              
  getStaticItems() { return this.renderItems; }
  getLayerItems() { return this.renderLayerItems; }
  getLayerItems__bottom() { return this.renderLayerItems__bottom; }
  getLayerItems__top() { return this.renderLayerItems__top; }
  
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

    // Add the Animated Items - Bottom
    this.stage.getLayerItems__bottom().map( (item) => { 
      item.scenario = this;
      this.addRenderLayerItem__bottom(item);
    });
    
    this.stage.getLayerItems__top().map( (item) => { 
      item.scenario = this;
      this.addRenderLayerItem__top(item);
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
          this.addRenderLayerItem__bottom(obj);
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

          this.addRenderLayerItem__bottom(obj);
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
},{}],33:[function(require,module,exports){
class _Stage {

  constructor(stageId, soundSrc) {
    
    this.renderItems = new Array();
    
    this.renderLayerItems = new Array();
    this.renderLayerItems__top = new Array();
    this.renderLayerItems__bottom = new Array();

    this.chunkSize = window.game.getChunkSize();

    this.player1StartX = 0;
    this.player1StartY = 0;
    
    this.player2StartX = 0;
    this.player2StartY = 0;

    this.stageId = stageId;

    this.sound = false;
    this.soundSrc = soundSrc;

  }

  // # Gets
  getStaticItems() { return this.renderItems; }
  getLayerItems() { return this.renderLayerItems; }
  getLayerItems__bottom() { return this.renderLayerItems__bottom; }
  getLayerItems__top() { return this.renderLayerItems__top; }
  
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
  addRenderLayerItem(item){
    this.renderLayerItems.push(item);
  }
  addRenderLayerItem__bottom(item){
    this.renderLayerItems__bottom.push(item);
  }
  addRenderLayerItem__top(item){
    this.renderLayerItems__top.push(item);
  }
  clearArrayItems(){
    this.renderItems = new Array();
    this.renderLayerItems__bottom = new Array();
    this.renderLayerItems__top = new Array();
  }
  
  run () {  }

} // class
module.exports = _Stage;
},{}],34:[function(require,module,exports){
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
	
},{}],35:[function(require,module,exports){
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
    this.menuSound = null;
  }

  initSound() {
    this.menuSound = new Howl({
      src: [this.menuSoundSrc]
    });
    this.menuSound.play();
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

    this.gameOver(false);
  }

  startNewGame( saveData ) {

    this.refreshVariables();
    this.menuSound.stop();
    
    // # Init
      
      let canvasStatic = document.getElementById('canvas_static');
      let contextStatic = canvasStatic.getContext('2d');

      let canvasLayers = document.getElementById('canvas_layers');
      let contextLayers = canvasLayers.getContext('2d');
      
      let canvasUI = document.getElementById('canvas_ui');
      let contextUI = canvasUI.getContext('2d');

      canvasLayers.width = canvasStatic.width = canvasUI.width = this.gameProps.getProp('canvasWidth');
      canvasLayers.height = canvasStatic.height = canvasUI.height = this.gameProps.getProp('canvasHeight');

    // # Scenario
      if( ! saveData ) {
        this.scenario = this.getScenario( this.defaultScenario, contextStatic, canvasStatic );
      } else {
        this.scenario = this.getScenario( saveData.scenario.scenarioId, contextStatic, canvasStatic, saveData );
      }

    // # Players
      this.players = new Array();

      if( ! saveData ) {
        let player = new Player( this.scenario.getPlayer1StartX(), this.scenario.getPlayer1StartY(), this.gameProps, 1 ); 

        this.players.push(player);

        if ( this.multiplayer ) {
          let player2 = new Player( this.scenario.getPlayer2StartX(), this.scenario.getPlayer2StartY(), this.gameProps, 2 ); 
          this.players.push(player2);
        }

        this.players.map( (player) => {
          this.scenario.addPlayer(player);
        });

      } else {
        
        saveData.players.map( (player) => {

          let _player = new Player( player.x, player.y, this.gameProps, player.playerNumber, player ); 

          this.players.push( _player);
          this.scenario.addPlayer(_player);

        });  

      }
    // # UI
      
      this.UI = new UI( this.players, this.gameProps);

    // # Collision detection class

      this.collision = new Collision( canvasLayers.width, canvasLayers.height );

    // # Render

      this.renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
      this.renderLayers = new Render(contextLayers, canvasLayers); // Render with animated objects only
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
      this.renderLayers.start( deltaTime );

      // # Add the objects to the collision vector
      this.collision.clearArrayItems();
      this.collision.addArrayItem( this.scenario.getStaticItems() );
      this.collision.addArrayItem( this.scenario.getLayerItems__bottom() );
      this.collision.addArrayItem( this.scenario.getLayerItems__top() );
      /*this.players.map( (player) => {
        this.collision.addArrayItem(player);
      });*/
  
      // "Static" Render - Background
      this.renderStatic.clearArrayItems();
      this.renderStatic.addArrayItem(this.scenario.getStaticItems()); // Get all items from the scenario that needs to be rendered

      // Layers Render
        this.renderLayers.clearArrayItems();

        // # Bottom 
        this.renderLayers.addArrayItem( this.scenario.getLayerItems__bottom() );
        
        // # Middle
        this.players.map( (player) => {
          this.renderLayers.addItem( player ); // Adds the player to the animation render
        });

        // # Top
        this.renderLayers.addArrayItem( this.scenario.getLayerItems__top() );
        
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
    this.pause();
    this.loading(true);
    setTimeout( () => {
      this.startNewGame(saveData); 
    }, 1000 );
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

    this.menuSound.play();
    if( this.scenario ) this.scenario.sound.pause();
    
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
    
    this.initSound(); 

    // Shows Menu
    this.mainMenu(false);

    // Auto load a game - debug mode
    if( window.autoload ) {
      this.loadGame();
    }

  }

}
module.exports = Game;
},{"../../assets/Player":1,"../../assets/scenario/Prototype/scenarioPrototype":3,"../../assets/scenario/Sandbox/scenarioSandbox":9,"../../gameProperties":41,"../assets/GlobalAssets":25,"../ui/UI":38,"./Collision":34,"./Render":36}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
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
},{"./_Dialog":39,"./_UIitem":40}],39:[function(require,module,exports){
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
    
},{}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
const Game = require('./engine/core/Game');
console.clear();
window.onload = function() {
  
  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
 
}
},{"./engine/core/Game":35}]},{},[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,41,42])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2NlbnRlci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfZG9vcnMuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2VuZW15LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9zdGFnZV9saWZlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfRmxvb3IuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9XYWxsLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRGlhbG9nLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRG9vci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0VuZW15LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRmlyZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0hlYWwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9LZXkuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfUHVzaC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL09iamVjdF9UaHJvdy5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL1RlbGVwb3J0LmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvR2xvYmFsQXNzZXRzLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhbkJlUHVzaGVkLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ2FuSHVydC5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdy5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0RpYWxvZ1RyaWdnZXIuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8uanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fU3RhZ2UuanMiLCJjbGllbnQvZW5naW5lL2NvcmUvQ29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL0dhbWUuanMiLCJjbGllbnQvZW5naW5lL2NvcmUvUmVuZGVyLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL1Nwcml0ZS5qcyIsImNsaWVudC9lbmdpbmUvdWkvVUkuanMiLCJjbGllbnQvZW5naW5lL3VpL19EaWFsb2cuanMiLCJjbGllbnQvZW5naW5lL3VpL19VSWl0ZW0uanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiLCJjbGllbnQvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOW9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4aUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIFBsYXllciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHgwLCB5MCwgZ2FtZVByb3BzLCBwbGF5ZXJOdW1iZXIsIHBsYXllclByb3BzKSB7XHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgICBpZiggcGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl9vbmUnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiggcGxheWVyTnVtYmVyID09IDIgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl90d28nKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCB0aGlzLnBsYXllclNwcml0ZSwgMzAwLCA5NjAsIDIwLCA0MCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzID0ge307XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXAgPSBbXTtcclxuICAgICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICAgIHRoaXMuaW5pdGlhbFN0ZXAgPSAyO1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHRoaXMubWF4U3RlcHMgPSA4O1xyXG5cclxuICAgICAgLy8gQ29udHJvbHMgdGhlIHBsYXllciBGUFMgQW5pbWF0aW9uXHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gMTI7IC8vIDEwMDAgLyBGUFNcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgdGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcbiAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgICAgdGhpcy54ID0geDA7XHJcbiAgICAgIHRoaXMueSA9IHkwO1xyXG4gICAgICBcclxuICAgICAgdGhpcy54MCA9IHgwOyAvLyBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICAgIHRoaXMueTAgPSB5MDtcclxuICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmNodW5rU2l6ZTsgLy9weFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2h1bmtTaXplICogMjsgLy9weFxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcGVlZDAgPSAwLjE3O1xyXG4gICAgICB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnNwZWVkMDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMubmFtZSA9IFwicGxheWVyX1wiICsgcGxheWVyTnVtYmVyO1xyXG4gICAgICB0aGlzLnBsYXllck51bWJlciA9IHBsYXllck51bWJlcjtcclxuICAgICAgdGhpcy50eXBlID0gXCJwbGF5ZXJcIjtcclxuXHJcbiAgICAgIHRoaXMuZ3JhYmluZyA9IGZhbHNlO1xyXG4gICAgICBcclxuICAgIC8vICMgRXZlbnRzICBcclxuICAgICAgXHJcbiAgICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5pc01vdmluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IHRydWU7XHJcbiAgICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgICB0aGlzLmNvbGxpc2lvbldpZHRoID0gdGhpcy53aWR0aCAqIDAuODtcclxuICAgICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB0aGlzLmhlaWdodCAqIDAuMztcclxuICAgICAgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSA9IHRoaXMud2lkdGggKiAwLjE7IC8vIFVzZWQgdG8gc2V0IGNvbGxpc2lvbiBYIHdoZW4gc2V0dGluZyBYIFxyXG4gICAgICB0aGlzLkNvbGxpc2lvbllGb3JtdWxhID0gdGhpcy5oZWlnaHQgKiAwLjc7IFxyXG4gICAgICB0aGlzLmNvbGxpc2lvblggPSB4MCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGE7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWSA9IHkwICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYTtcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWDAgPSB0aGlzLmNvbGxpc2lvblg7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWTAgPSB0aGlzLmNvbGxpc2lvblk7XHJcblxyXG4gICAgICAvLyBHcmFiL1BpY2sgSXRlbXMgQ29sbGlzaW9uIEJveFxyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IDA7XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IDA7XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSAwO1xyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25ZID0gMDtcclxuXHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IG51bGw7XHJcblxyXG4gICAgICAvLyAjIExpZmVcclxuICAgICAgdGhpcy5kZWZhdWx0TGlmZXMgPSA2O1xyXG4gICAgICB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgIHRoaXMuaHVydENvb2xEb3duVGltZSA9IDIwMDA7IC8vMnNcclxuXHJcbiAgICAgIC8vIFBsYXllciBQcm9wcyBpZiBoYXNcclxuICAgICAgaWYoIHBsYXllclByb3BzICkge1xyXG4gICAgICAgIHRoaXMubGlmZXMgPSBwbGF5ZXJQcm9wcy5saWZlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8qIFxyXG4gICAgICBHcmFiL1BpY2sgSXRlbXMgQ29sbGlzaW9uIEJveFxyXG4gICovXHJcblxyXG4gICAgY2hlY2tHcmFiYmluZ09iamVjdHMoKSB7XHJcbiAgICAgIGxldCBoYXNHcmFiT2JqZWN0ID0gZmFsc2U7XHJcbiAgICAgIC8vIENoZWNrIGlmIHBsYXllciBoYXMgZ3JhYmJlZCBpdGVtc1xyXG4gICAgICBsZXQgcmVuZGVyZWRJdGVtcyA9IHdpbmRvdy5nYW1lLnNjZW5hcmlvLmdldExheWVySXRlbXNfX2JvdHRvbSgpO1xyXG4gICAgICBmb3IoIGxldCBpIGluIHJlbmRlcmVkSXRlbXMgKSB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSByZW5kZXJlZEl0ZW1zW2ldO1xyXG4gICAgICAgIGlmKCBpdGVtLmdyYWJiZWQgJiYgaXRlbS5wbGF5ZXJXaG9HcmFiYmVkID09IHRoaXMucGxheWVyTnVtYmVyICkge1xyXG4gICAgICAgICAgbGV0IG9iaiA9IGl0ZW07XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIG9iai5ncmFiSGFuZGxlcih0aGlzLnBsYXllck51bWJlcik7XHJcbiAgICAgICAgICB0aGlzLmdyYWJPYmplY3QoIG9iaiApO1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYmluZyA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgICAgaGFzR3JhYk9iamVjdCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmKCAhIGhhc0dyYWJPYmplY3QgKSB7XHJcbiAgICAgICAgdGhpcy5zZXROb3RHcmFiYmluZygpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNoZWNrSXRlbU9uR3JhYkNvbGxpc2lvbkJveCgpIHtcclxuICAgICAgcmV0dXJuIHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNHcmFiaW5nKCkgeyByZXR1cm4gdGhpcy5ncmFiaW5nOyB9XHJcbiAgICBzZXROb3RHcmFiYmluZygpe1xyXG4gICAgICB0aGlzLnJlbW92ZUdyYWJlZE9iamVjdCgpO1xyXG4gICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlR3JhYmVkT2JqZWN0KCkgeyBcclxuICAgICAgdGhpcy5ncmFiaW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdHJpZ2dlckdyYWIoKXtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIGhhcyBhIFwiX0NhbkdyYWJcIiBpdGVtIGNvbGxpZGluZyB3aXRoIGdyYWIgaGl0IGJveCBhbmQgXCJwaWNrXCIgaXRlbVxyXG4gICAgICBpZiggISB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgaWYoIG9iamVjdCAmJiBvYmplY3QuY2FuR3JhYiApIHtcclxuICAgICAgICAgIGlmKCBvYmplY3QuaXNHcmFiYmVkKCkgKSByZXR1cm47IC8vIGF2b2lkIHBsYXllcnMgZ3JhYmJpbmcgdGhlIHNhbWUgb2JqZWN0XHJcbiAgICAgICAgICBvYmplY3QuZ3JhYkhhbmRsZXIodGhpcy5wbGF5ZXJOdW1iZXIpO1xyXG4gICAgICAgICAgdGhpcy5ncmFiT2JqZWN0KCBvYmplY3QgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ncmFiaW5nID0gIXRoaXMuZ3JhYmluZztcclxuICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgICAvLyBEcm9wIGlmIGhhcyBub3RoaW5nIG8gcGxheWVyIGdyYWIgY29sbGlzaW9uIGJveFxyXG4gICAgICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2tBbGwodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgICAgIGlmKCAhb2JqZWN0ICkge1xyXG4gICAgICAgICAgICB0aGlzLm9iamVjdEdyYWJiZWQuZHJvcCggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24sIHRoaXMuZ2V0SGVpZ2h0KCkgKTsgLy8gVGhyb3cgYXdheSBvYmplY3RcclxuICAgICAgICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gZmFsc2U7IC8vIHJlbW92ZSBncmFiYmVkXHJcbiAgICAgICAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgaXRlbXNcclxuICAgIHRyaWdnZXJVc2UoKSB7XHJcbiAgICAgIC8vIElmIGhhcyBvYmplY3QgaW4gaGFuZCwgdXNlIGl0XHJcbiAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLnVzZSggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24sIHRoaXMuZ2V0SGVpZ2h0KCksIHRoaXMgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJZiBub3QsIHRyeSB0byB1c2UgdGhlIG9uZSBvbiBmcm9udFxyXG4gICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgaWYoIG9iamVjdCAmJiBvYmplY3QuY2FuVXNlICkge1xyXG4gICAgICAgICAgb2JqZWN0LnVzZUhhbmRsZXIoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGg7IH1cclxuICAgIGdldEdyYWJDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvblg7IH1cclxuICAgIGdldEdyYWJDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvblk7IH1cclxuXHJcbiAgICAvLyBBdHRhY2ggYW4gaXRlbSB0byBwbGF5ZXJcclxuICAgIGdyYWJPYmplY3QoIG9iamVjdCApIHtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gb2JqZWN0O1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBHcmFiQ29sbGlzaW9uIFggYW5kIFkgY29uc2lkZXJpbmcgcGxheWVyIGxvb2sgZGlyZWN0aW9uXHJcbiAgICB1cGRhdGVHcmFiQ29sbGlzaW9uWFkoKSB7XHJcbiAgICAgIHN3aXRjaCh0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbikge1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblkgKyB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICAndXAnOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblkgLSB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQ7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblggLSB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YICsgdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgaGFzIHNvbWUgb2JqZWN0IGdyYWJiZWQsIHVwZGF0ZSBwb3NpdGlvblxyXG4gICAgICBpZiggdGhpcy5vYmplY3RHcmFiYmVkICkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlR3JhYmJlZE9iamVjdFBvc2l0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVHcmFiYmVkT2JqZWN0UG9zaXRpb24oKSB7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51cGRhdGVYKCB0aGlzLmdldFgoKSApO1xyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLm9iamVjdEdyYWJiZWQuZ2V0SGVpZ2h0KCkgKyAgKCB0aGlzLmdldEhlaWdodCgpICogMC4xICkgICk7XHJcbiAgICB9XHJcblxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG4gICAgICAgIFxyXG4gIC8qXHJcbiAgICBTcHJpdGUgLyBBbmltYXRpb25cclxuICAqL1xyXG5cclxuICAgIGdldFNwcml0ZVByb3BzKCkgeyByZXR1cm4gdGhpcy5zcHJpdGVQcm9wczsgfVxyXG5cclxuICAgIFxyXG5cdFx0aGlkZVBsYXllcigpIHsgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgfVxyXG4gICAgc2hvd1BsYXllcigpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuICAgIFxyXG4gICAgbG9va0Rvd24oKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZG93bic7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTdGVwc1xyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjcgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3ICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tVcCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICd1cCc7XHJcbiAgICAgIFxyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwOSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMTAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTExICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDExMiApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxNyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxOCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxOSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyMiApO1xyXG4gICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tSaWdodCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgIFxyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzkgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggODAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggODEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggODIgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzcgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cdFx0bG9va0xlZnQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgIFxyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTcgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDkgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNTAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNTIgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuXHQgICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICAgIGluY3JlYXNlU3RlcCgpIHtcclxuICAgICAgaWYodGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSkge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICAgICAgaWYoIHRoaXMuc3RlcENvdW50ID4gdGhpcy5tYXhTdGVwcyApIHtcclxuICAgICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5pbml0aWFsU3RlcDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc2V0U3RlcCgpIHtcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICBzd2l0Y2ggKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApIHtcclxuICAgICAgICBjYXNlICdsZWZ0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmlnaHQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndXAnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZG93bic6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldExvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbikgeyB0aGlzLmxvb2tEaXJlY3Rpb24gPSBsb29rRGlyZWN0aW9uOyB9XHJcblx0XHR0cmlnZ2VyTG9va0RpcmVjdGlvbihkaXJlY3Rpb24pIHsgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgfVxyXG5cdFx0cmVzZXRQb3NpdGlvbigpIHtcclxuXHRcdFx0dGhpcy5zZXRYKCB0aGlzLngwICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy55MCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuY29sbGlzaW9uWDAgKTtcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmNvbGxpc2lvblkwICk7XHJcbiAgICB9XHJcblxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG4gICAgXHJcbiAgLypcclxuICAgIE1vdmVtZW50XHJcbiAgKi9cclxuICAgIFxyXG4gICAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgXHJcbiAgICBnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuXHJcbiAgICBzZXRYKHgsIHNldENvbGxpc2lvbikgeyBcclxuICAgICAgdGhpcy54ID0geDsgXHJcbiAgICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblgoIHggKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhICk7XHJcbiAgICB9XHJcbiAgICBzZXRZKHksIHNldENvbGxpc2lvbikgeyBcclxuICAgICAgdGhpcy55ID0geTsgXHJcbiAgICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblkoIHkgKyB0aGlzLkNvbGxpc2lvbllGb3JtdWxhICk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFNwZWVkKHNwZWVkKSB7IHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHNwZWVkOyB9XHJcbiAgICBcclxuXHRcdG1vdkxlZnQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92UmlnaHQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZVcCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdkRvd24oKSB7ICBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBoYW5kbGVNb3ZlbWVudCgga2V5c0Rvd24gKSB7XHJcblxyXG4gICAgICAvLyBJZiBkaWFsb2cgYWN0aXZlLCBkb24ndCB3YWxrXHJcbiAgICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0RpYWxvZ0FjdGl2ZSgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIDEgQ29udHJvbHNcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgaWYgKDM3IGluIGtleXNEb3duKSB0aGlzLm1vdkxlZnQoKTsgIC8vIExlZnRcclxuICAgICAgICBpZiAoMzggaW4ga2V5c0Rvd24pIHRoaXMubW92VXAoKTsgICAgLy8gVXAgIFxyXG4gICAgICAgIGlmICgzOSBpbiBrZXlzRG93bikgdGhpcy5tb3ZSaWdodCgpOyAvLyBSaWdodFxyXG4gICAgICAgIGlmICg0MCBpbiBrZXlzRG93bikgdGhpcy5tb3ZEb3duKCk7ICAvLyBEb3duXHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFBsYXllciAyIENvbnRyb2xzXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIGlmICg2NSBpbiBrZXlzRG93bikgdGhpcy5tb3ZMZWZ0KCk7ICAvLyBMZWZ0ICA9PiBBXHJcbiAgICAgICAgaWYgKDg3IGluIGtleXNEb3duKSB0aGlzLm1vdlVwKCk7ICAgIC8vIFVwICAgID0+IFdcclxuICAgICAgICBpZiAoNjggaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHQgPT4gRFxyXG4gICAgICAgIGlmICg4MyBpbiBrZXlzRG93bikgdGhpcy5tb3ZEb3duKCk7ICAvLyBEb3duICA9PiBTXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlS2V5VXAoa2V5VXApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIElmIGRpYWxvZyBhY3RpdmUsIGRvbid0IHdhbGtcclxuICAgICAgaWYoIHdpbmRvdy5nYW1lLmlzRGlhbG9nQWN0aXZlKCkgKSByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMVxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMSApIHtcclxuICAgICAgICBpZiAoa2V5VXAgPT0gMTcpIHRoaXMudHJpZ2dlckdyYWIoKTsgIC8vIEdyYWIgPT4gQ1RSTFxyXG4gICAgICAgIGlmIChrZXlVcCA9PSAzMikgdGhpcy50cmlnZ2VyVXNlKCk7ICAgLy8gVXNlID0+IFNwYWNlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBsYXllciAyXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIGlmIChrZXlVcCA9PSA3MCkgdGhpcy50cmlnZ2VyR3JhYigpOyAgLy8gR3JhYiA9PiBGXHJcbiAgICAgICAgaWYgKGtleVVwID09IDY5KSB0aGlzLnRyaWdnZXJVc2UoKTsgIC8vIFVzZSA9PiBFXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFx0XHJcbiAgLypcclxuICAgIENvbGxpc2lvblxyXG4gICovXHJcbiAgICBzZXRDb2xsaXNpb25YKHgpIHsgdGhpcy5jb2xsaXNpb25YID0geDsgfVxyXG4gICAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuXHJcbiAgICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuICAgIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICAgIGdldENlbnRlclgoIF94ICkgeyAvLyBNYXkgZ2V0IGEgY3VzdG9tIGNlbnRlclgsIHVzZWQgdG8gY2hlY2sgYSBmdXR1cmUgY29sbGlzaW9uXHJcbiAgICAgIGxldCB4ID0gKCBfeCApID8gX3ggOiB0aGlzLmdldENvbGxpc2lvblgoKTtcclxuICAgICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICAgIH1cclxuICAgIGdldENlbnRlclkoIF95ICkgeyBcclxuICAgICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgICByZXR1cm4geSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyBcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gICAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICAgIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG5cdFx0bm9Db2xsaXNpb24oKSB7XHJcblx0XHRcdC8vIFdoYXQgaGFwcGVucyBpZiB0aGUgcGxheWVyIGlzIG5vdCBjb2xsaWRpbmc/XHJcblx0XHRcdHRoaXMuc2V0U3BlZWQodGhpcy5zcGVlZDApOyAvLyBSZXNldCBzcGVlZFxyXG4gICAgfVxyXG4gICAgICBcclxuICAgIGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfTtcclxuXHRcdFxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cclxuXHQvKlxyXG4gICAgTGlmZSAvIEhlYWwgLyBEZWF0aFxyXG4gICovXHRcclxuICAgIGdldExpZmVzKCkgeyByZXR1cm4gdGhpcy5saWZlczsgfVxyXG5cclxuICAgIGh1cnRQbGF5ZXIoIGFtb3VudCApIHtcclxuICAgICAgaWYoIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgICAgaWYoIHRoaXMubGlmZXMgPCAwICkgdGhpcy5saWZlcyA9IDA7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IGNvb2xkb3duXHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBwbGF5ZXIgZGllZFxyXG4gICAgICAgIHRoaXMuY2hlY2tQbGF5ZXJEZWF0aCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGVhbFBsYXllciggYW1vdW50ICkge1xyXG4gICAgICB0aGlzLmxpZmVzICs9IHBhcnNlSW50KGFtb3VudCk7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzID4gdGhpcy5kZWZhdWx0TGlmZXMgKSB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tQbGF5ZXJEZWF0aCgpIHtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAxICYmICF3aW5kb3cuZ29kX21vZGUgKSB7XHJcbiAgICAgICAgd2luZG93LmdhbWUuZ2FtZU92ZXIodHJ1ZSk7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgICAgd2luZG93LmdhbWUubG9hZGluZyh0cnVlKTtcclxuICAgICAgICAgIHdpbmRvdy5nYW1lLm5ld0dhbWUoKTtcclxuICAgICAgICB9LCAzMDAwKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIFxyXG4gICAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcblx0XHRcclxuICAgIC8qXHJcbiAgICAgIEdlbmVyYWxcclxuICAgICovXHJcbiAgICAgICAgXHJcbiAgICAgIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICAgICAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcbiAgICAgIFxyXG4gICAgICBnZXRQbGF5ZXJOdW1iZXIoKSB7IHJldHVybiB0aGlzLnBsYXllck51bWJlcjsgfVxyXG5cclxuICAgICAgZ2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcbiAgICAgICAgXHJcbiAgICAgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcblx0XHJcbiAgLyogIFxyXG4gICAgUmVuZGVyXHJcbiAgKi9cclxuICBcdFx0XHJcblx0ICByZW5kZXIoY3R4KSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBCbGluayBwbGF5ZXIgaWYgaXQgY2FuJ3QgYmUgaHVydFxyXG4gICAgICBpZiggISB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSAhdGhpcy5oaWRlU3ByaXRlO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjtcclxuXHJcbiAgICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIFxyXG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCksICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldEtleVdpZHRoKCksIHRoaXMuc3ByaXRlLmdldEtleUhlaWdodCgpLCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHRcclxuXHJcbiAgICAgIC8vIERFQlVHIENPTExJU0lPTlxyXG4gICAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDI1NSwgMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCggdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuXHJcbiAgICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFgoKSkgKyBcIiBZOlwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFkoKSk7XHJcbiAgICAgICAgY3R4LmZvbnQgPSAgXCIyNXB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCI7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDIwKTtcclxuXHJcbiAgICAgICAgLy8gR3JhYiBjb2xsaXNpb25cclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDAsIDAuNClcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG5cdFx0fTtcclxuXHJcblxyXG4gICAgcnVuKCkge1xyXG4gICAgICB0aGlzLmNoZWNrR3JhYmJpbmdPYmplY3RzKCk7XHJcbiAgICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgIH1cclxuXHRcdFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuIiwiLypcclxuICAgIFByb3RvdHlwZSBTY2VuYXJpb1xyXG4qL1xyXG5jb25zdCBfU2NlbmFyaW8gPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TY2VuYXJpbycpO1xyXG5cclxuY29uc3QgX1NfY2VudGVyID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfY2VudGVyJyk7XHJcbmNvbnN0IF9TX3VwID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfdXAnKTtcclxuY29uc3QgX1NfcmlnaHQgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9yaWdodCcpO1xyXG5jb25zdCBfU19ib3R0b20gPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9ib3R0b20nKTtcclxuY29uc3QgX1NfbGVmdCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2xlZnQnKTtcclxuXHJcbmNsYXNzIHNjZW5hcmlvUHJvdG90eXBlIGV4dGVuZHMgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHNhdmVEYXRhKXtcclxuICAgIHN1cGVyKGN0eCwgY2FudmFzLCBcInByb3RvdHlwZVwiKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG4gICAgXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgXHJcbiAgICBsZXQgX3N0YWdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDaGVjayB3aGljaCBzdGFnZSB3aWxsIGxvYWRcclxuICAgIHN3aXRjaChzdGFnZV9pZCkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIGxldCBzX2NlbnRlciA9IG5ldyBfU19jZW50ZXIoKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX2NlbnRlcjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIGxldCBzX3VwID0gbmV3IF9TX3VwKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc191cDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgbGV0IHNfbGVmdCA9IG5ldyBfU19sZWZ0KCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19sZWZ0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgbGV0IHNfcmlnaHQgPSBuZXcgX1NfcmlnaHQoKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX3JpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgIGxldCBzX2JvdHRvbSA9IG5ldyBfU19ib3R0b20oKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX2JvdHRvbTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTG9hZCB0aGUgc3RhZ2UgZGVmaW5lZFxyXG4gICAgICB0aGlzLmxvYWRTdGFnZShfc3RhZ2UsIGZpcnN0U3RhZ2UpO1xyXG4gIH1cclxuIFxyXG4gIC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5zZXRTdGFnZSggdGhpcy5zdGFnZVRvTG9hZCwgdHJ1ZSk7ICAgIFxyXG5cdH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9Qcm90b3R5cGU7IiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0JvdHRvbSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImJvdHRvbVwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTtcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjIsICAgb2IsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2NfYmwsICAgICAgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2NfYnIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0JvdHRvbTtcclxuIiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9DZW50ZXIgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJjZW50ZXJcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMiwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICBpd2NfYnIsICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICBpd2NfYmwsICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICAgICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBvYiwgICBvYiwgICAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IgXSxcclxuICAgICAgWyBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgaXdjX3RyLCAgICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgaXdjX3RsLCAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAyID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgICAgIHRhcmdldFN0YWdlOiAndXAnIH07XHJcbiAgICBsZXQgdHBfMDMgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgICAgdGFyZ2V0U3RhZ2U6ICdyaWdodCcgfTtcclxuICAgIGxldCB0cF8wNCA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwiYm90dG9tXCIsICAgICB0YXJnZXRTdGFnZTogJ2JvdHRvbScgfTtcclxuICAgIGxldCB0cF8wNSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwibGVmdFwiLCAgICAgICB0YXJnZXRTdGFnZTogJ2xlZnQnIH07XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiBcImZpcmVcIiwgdHlwZTogXCIwMVwifTsgXHJcblxyXG4gICAgbGV0IHRibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fbGVmdFwiIH07ICBcclxuICAgIGxldCB0YnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX3JpZ2h0XCIgfTsgXHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDIsICAgdHBfMDIsICAgZmFsc2UsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMyBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyB0cF8wNSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMyBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRibCwgICAgIHRiciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzA0LCAgIHRwXzA0LCAgIHRwXzA0LCAgIHRwXzA0LCAgIHRwXzA0LCAgIHRwXzA0LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgdHRsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHR0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfcmlnaHRcIiB9OyAgXHJcbiAgICBsZXQgdG1sID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRtciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfcmlnaHRcIiB9OyAgXHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0dGwsICAgICB0dHIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdG1sLCAgICAgdG1yLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyOyIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9MZWZ0IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwibGVmdFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTtcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX3RsLCB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBvYiwgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYyLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2NfYmwsIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfTGVmdDtcclxuIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX1JpZ2h0IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwicmlnaHRcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd2NfdHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2NfYnIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfUmlnaHQ7XHJcbiIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9VcCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcInVwXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7O1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdjX3RsLCAgICAgIHd0LCAgIHd0LCAgIHd0LCAgIHd0LCAgIHd0LCAgIHd0LCAgIHdjX3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSwgICB0cF8wMSwgICBmYWxzZSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9VcFxyXG4iLCIvKlxyXG4gIFNhbmRib3ggU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IFN0YWdlX0NlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2NlbnRlcicpO1xyXG5jb25zdCBTdGFnZV9MaWZlID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfbGlmZScpO1xyXG5jb25zdCBTdGFnZV9FbmVteSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2VuZW15Jyk7XHJcbmNvbnN0IFN0YWdlX0Rvb3JzID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfZG9vcnMnKTtcclxuXHJcbmNsYXNzIHNjZW5hcmlvU2FuZGJveCBleHRlbmRzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzYXZlRGF0YSl7XHJcbiAgICBsZXQgc291bmRTcmMgPSBcIi4vc291bmRzL3NhbmRib3gtYmFja2dyb3VuZC5tcDNcIjtcclxuICAgIHN1cGVyKGN0eCwgY2FudmFzLCBcInNhbmRib3hcIiwgc291bmRTcmMpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhZ2VJZCA9IFwiY2VudGVyXCI7XHJcbiAgICBcclxuICAgIC8vIERlZmluZSB3aGljaCBzdGFnZSB3aWxsIGxvYWQgb24gZmlyc3QgcnVuXHJcbiAgICB0aGlzLnN0YWdlVG9Mb2FkID0gKCBzYXZlRGF0YSApID8gc2F2ZURhdGEuc2NlbmFyaW8uc3RhZ2VJZCA6IHRoaXMuZGVmYXVsdFN0YWdlSWQ7XHJcblxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhZ2VzXHJcbiAgc2V0U3RhZ2Uoc3RhZ2VfaWQsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgLy8gU2F2ZSBpdGVtcyBzdGF0ZSBiZWZvcmUgY2xlYXJcclxuICAgIGlmKCAhZmlyc3RTdGFnZSApIHtcclxuICAgICAgdGhpcy5zYXZlSXRlbXNTdGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcblxyXG4gICAgLy8gU2V0IEFjdHVhbCBTdGFnZSBJRFxyXG4gICAgdGhpcy5zZXRBY3R1YWxTdGFnZUlkKCBzdGFnZV9pZCApO1xyXG4gICAgXHJcbiAgICBsZXQgX3N0YWdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDaGVjayB3aGljaCBzdGFnZSB3aWxsIGxvYWRcclxuICAgIHN3aXRjaChzdGFnZV9pZCkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBTdGFnZV9DZW50ZXIoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGlmZSc6XHJcbiAgICAgICAgX3N0YWdlID0gbmV3IFN0YWdlX0xpZmUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZW5lbXknOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBTdGFnZV9FbmVteSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb29ycyc6XHJcbiAgICAgICAgX3N0YWdlID0gbmV3IFN0YWdlX0Rvb3JzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTG9hZCB0aGUgc3RhZ2UgZGVmaW5lZFxyXG4gICAgdGhpcy5sb2FkU3RhZ2UoX3N0YWdlLCBmaXJzdFN0YWdlKTtcclxuICB9XHJcbiBcclxuICAvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMuc2V0U3RhZ2UoIHRoaXMuc3RhZ2VUb0xvYWQsIHRydWUgKTsgICAgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBzY2VuYXJpb1NhbmRib3g7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuY29uc3QgRGlhbG9nID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0RpYWxvZycpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0NlbnRlciBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcclxuICAgIHN1cGVyKFwiY2VudGVyXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZGlhbG9nXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEaWFsb2coaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcbiAgICAgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIGl3Y19iciwgICAgZjEsICAgIGl3Y19ibCwgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYyLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgaXdjX2JyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX2JsIF0sXHJcbiAgICAgIFsgZjEsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBpd2NfdHIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfdGwgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjIsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMiwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgICAgIHdiLCAgICB3YiwgICAgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwX2xmID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgICAgIHRhcmdldFN0YWdlOiAnbGlmZScgfTtcclxuICAgIGxldCB0cF9lbmVteSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICB0YXJnZXRTdGFnZTogJ2VuZW15JyB9O1xyXG4gICAgbGV0IHRwX2Rvb3JzID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJsZWZ0XCIsICAgdGFyZ2V0U3RhZ2U6ICdkb29ycycgfTtcclxuICAgIFxyXG4gICAgbGV0IHRibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fbGVmdFwiIH07ICBcclxuICAgIGxldCB0YnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX3JpZ2h0XCIgfTsgXHJcblxyXG4gICAgXHJcbiAgICBsZXQgYnJkMiA9IHsgbmFtZTogXCJkaWFsb2dcIiwgdHlwZTogXCJjZW50ZXJfbGVmdF9ub3RpY2VcIn07XHJcbiAgICBsZXQgYnJkMyA9IHsgbmFtZTogXCJkaWFsb2dcIiwgdHlwZTogXCJjZW50ZXJfdG9wX25vdGljZVwifTtcclxuICAgIGxldCBicmQ0ID0geyBuYW1lOiBcImRpYWxvZ1wiLCB0eXBlOiBcImNlbnRlcl9yaWdodF9ub3RpY2VcIn07XHJcbiAgICBsZXQgYnJkdyA9IHsgbmFtZTogXCJkaWFsb2dcIiwgdHlwZTogXCJjZW50ZXJfd2VsY29tZVwifTtcclxuICAgIFxyXG4gICAgbGV0IGZjID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJmZW5jZVwifTtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9sZiwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgYnJkMywgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBicmQyLCAgIGZhbHNlLCAgICBmYWxzZSwgICBmYywgICAgICBmYywgICAgICBmYywgICAgIGZjLCAgICAgIGZjLCAgICAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICBicmQ0LCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBicmR3LCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwX2Rvb3JzLGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmMsICAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfZW5lbXkgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZjLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYywgICAgICBmYWxzZSwgICAgICBmYywgICAgICBmYywgICBmYywgICAgICBmYywgICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdGJsLCAgICAgdGJyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCB0dGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdHRyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9yaWdodFwiIH07ICBcclxuICAgIGxldCB0bWwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdG1yID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9yaWdodFwiIH07ICBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHR0bCwgICAgIHR0ciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0bWwsICAgICB0bXIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyOyIsImNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9Eb29yJyk7XHJcbmNvbnN0IEtleSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9LZXknKTtcclxuY29uc3QgT2JqZWN0X1Rocm93ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL09iamVjdF9UaHJvdycpO1xyXG5jb25zdCBPYmplY3RfUHVzaCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfUHVzaCcpO1xyXG5jb25zdCBEaWFsb2cgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRGlhbG9nJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfRG9vcnMgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJkb29yc1wiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gMDtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwia2V5XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBLZXkoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSApOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF90aHJvd1wiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1Rocm93KGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3B1c2hcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9QdXNoKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZGlhbG9nXCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IERpYWxvZyhpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgICAgd3QsICAgIHd0LCAgICAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX2JsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfdGwgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgICAgIHdiLCAgICB3YiwgICAgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6ICdmaXJlJywgdHlwZTogJzAxJ307IFxyXG5cclxuICAgIGxldCBlbmVteSA9IHsgbmFtZTogJ2VuZW15JywgdHlwZTogJzAxJ307IFxyXG4gICAgbGV0IGJubmEgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JhbmFuYSd9OyBcclxuICAgIGxldCBiZXJyeSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmVycnknfTsgXHJcblxyXG4gICAgbGV0IGJycmwgPSB7IG5hbWU6ICdvYmplY3RfdGhyb3cnLCB0eXBlOiAnYmFycmVsJ307IFxyXG4gICAgbGV0IHN0bmUgPSB7IG5hbWU6ICdvYmplY3RfcHVzaCcsIHR5cGU6ICdzdG9uZSd9OyBcclxuXHJcbiAgICBsZXQgZm5jZSA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiZmVuY2VcIn07XHJcblxyXG4gICAgbGV0IHRwX2MgPSB7IG5hbWU6ICd0ZWxlcG9ydCcsIHR5cGU6ICcnLCB0ZWxlcG9ydFR5cGU6ICdyZWxhdGl2ZScsIGNhbWVGcm9tOiAncmlnaHQnLCB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuXHJcbiAgICBsZXQgZGdibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X2JsJ307IFxyXG4gICAgbGV0IGRndGwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV90bCd9OyBcclxuICAgIGxldCBkZ2JyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyYXlfYnInfTsgXHJcbiAgICBsZXQgZGd0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X3RyJ307IFxyXG4gICAgXHJcbiAgICBsZXQgZHBibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfYmwnfTsgXHJcbiAgICBsZXQgZHB0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfdGwnfTsgXHJcbiAgICBsZXQgZHBiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfYnInfTsgXHJcbiAgICBsZXQgZHB0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfdHInfTsgXHJcbiAgICBcclxuICAgIGxldCBkcmJsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF9ibCd9OyBcclxuICAgIGxldCBkcnRsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF90bCd9OyBcclxuICAgIGxldCBkcmJyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF9icid9OyBcclxuICAgIGxldCBkcnRyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF90cid9OyBcclxuICAgIFxyXG4gICAgbGV0IGRncmJsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX2JsJ307IFxyXG4gICAgbGV0IGRncnRsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX3RsJ307IFxyXG4gICAgbGV0IGRncmJyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX2JyJ307IFxyXG4gICAgbGV0IGRncnRyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX3RyJ307IFxyXG5cclxuICAgIGxldCBrX2cgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAnZ3JheSd9OyBcclxuICAgIGxldCBrX3AgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAncHVycGxlJ307IFxyXG4gICAgbGV0IGtfciA9IHsgbmFtZTogJ2tleScsIHR5cGU6ICdyZWQnfTsgXHJcbiAgICBcclxuICAgIGxldCBnbnRjID0geyBuYW1lOiBcImRpYWxvZ1wiLCB0eXBlOiBcImRvb3JzX2dyYXR6X25vdGljZVwifTtcclxuXHJcbiAgICBsZXQgaXRlbXNCb3R0b20gPSBbXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGtfciwgICAgIGZhbHNlLCAgIGZuY2UsICAgIGtfZywgICAgIGZhbHNlLCAgIGZuY2UsICAgIGtfcCwgICAgZmFsc2UsICAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGdudGMsICAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGRndGwsICAgIGRndHIsICAgIGZuY2UsICAgIGRwdGwsICAgIGRwdHIsICAgIGZuY2UsICAgIGRydGwsICAgIGRydHIsICAgIGZuY2UsICAgIGRncnRsLCAgIGRncnRyLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmbmNlLCAgIGRnYmwsICAgIGRnYnIsICAgIGZuY2UsICAgIGRwYmwsICAgIGRwYnIsICAgIGZuY2UsICAgIGRyYmwsICAgIGRyYnIsICAgIGZuY2UsICAgIGRncmJsLCAgIGRncmJyLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJycmwsICAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfRG9vcnM7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuY29uc3QgRW5lbXkgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRW5lbXknKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgT2JqZWN0X1B1c2ggPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1B1c2gnKTtcclxuY29uc3QgS2V5ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0tleScpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0VuZW15IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiZW5lbXlcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJlbmVteVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRW5lbXkoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhlYWxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEhlYWwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfdGhyb3dcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9UaHJvdyhpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF9wdXNoXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfUHVzaChpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImtleVwiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBLZXkoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSApOyBcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y19iciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgZjEsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfdHIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIHdiLCAgICAgICAgd2IsICAgIHdiLCAgICAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcblxyXG4gICAgbGV0IGVuZW15ID0geyBuYW1lOiAnZW5lbXknLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG4gICAgbGV0IGJlcnJ5ID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiZXJyeSd9OyBcclxuXHJcbiAgICBsZXQgYnJybCA9IHsgbmFtZTogJ29iamVjdF90aHJvdycsIHR5cGU6ICdiYXJyZWwnfTsgXHJcbiAgICBsZXQgc3RuZSA9IHsgbmFtZTogJ29iamVjdF9wdXNoJywgdHlwZTogJ3N0b25lJ307IFxyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ2xlZnQnLCB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IGtfZ3IgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAnZ3JlZW4nfTsgXHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAga19nciwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZW5lbXksICAgZW5lbXksICAgZW5lbXksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZW5lbXksICAgZmFsc2UsICAgZW5lbXksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGVuZW15LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBmYWxzZSwgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwX2MsICAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGJycmwsICAgZmFsc2UsICAgc3RuZSwgICAgZmFsc2UsICAgYnJybCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgYnJybCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF07XHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgaXRlbXNCb3R0b20ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9FbmVteTsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9MaWZlIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwibGlmZVwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNztcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhlYWxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEhlYWwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgICAgd3QsICAgIHd0LCAgICAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgaXdjX3RyLCAgICBmMSwgICBpd2NfdGwsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiAnZmlyZScsIHR5cGU6ICcwMSd9OyBcclxuICAgIGxldCBibm5hID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiYW5hbmEnfTsgXHJcbiAgICBsZXQgYmVycnkgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JlcnJ5J307IFxyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ2JvdHRvbScsICAgICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuXHJcbiAgICBsZXQgaXRlbXNCb3R0b20gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmaXJlLCAgICBibm5hLCAgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgYmVycnksICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZpcmUsICAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBiZXJyeSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgIGZpcmUsICAgIGZpcmUsICAgIGZpcmUsICAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBiZXJyeSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfYywgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF07XHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgaXRlbXNCb3R0b20ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9MaWZlOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX0Zsb29yIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIkJlYWNoIEZsb29yXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogZmFsc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcIjAxXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI0OSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoOTMwKTtcclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgY29sbGlzaW9uKHBsYXllcil7IFxyXG4gICAgcGxheWVyLnNldFRlbGVwb3J0aW5nKGZhbHNlKTtcclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEJlYWNoX0Zsb29yOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX3dhbGwgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggV2FsbFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogZmFsc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDczKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDc4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNzkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJ3YXRlclwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg2MzMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwib2JzdGFjbGVcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjUwKTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmZW5jZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzEyKTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI0KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNSk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9taWRkbGVfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMTApO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDg3KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE0OCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uIFNpemVcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbldpZHRoKCB0aGlzLmNodW5rU2l6ZSAqIDAuMyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCh0aGlzLnggKyB0aGlzLmNodW5rU2l6ZSAqIDAuNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNDkpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvbiBTaXplXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25XaWR0aCggdGhpcy5jaHVua1NpemUgKiAwLjMgKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF93YWxsOyIsImNvbnN0IF9EaWFsb2dUcmlnZ2VyID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fRGlhbG9nVHJpZ2dlcicpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIERpYWxvZyBleHRlbmRzIF9EaWFsb2dUcmlnZ2VyIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZSkge1xyXG5cdFxyXG5cdGxldCBwcm9wcyA9IHtcclxuXHQgIG5hbWU6IFwiZGlhbG9nXCIsXHJcblx0ICB0eXBlOiB0eXBlLFxyXG5cdCAgc3RhZ2U6IHN0YWdlXHJcblx0fVxyXG5cclxuXHRsZXQgcG9zaXRpb24gPSB7XHJcblx0ICB4OiB4MCxcclxuXHQgIHk6IHkwXHJcblx0fVxyXG5cclxuXHRsZXQgZGltZW5zaW9uID0ge1xyXG5cdCAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG5cdCAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG5cdH1cclxuXHJcblx0bGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG5cclxuXHRsZXQgZXZlbnRzID0ge1xyXG5cdCAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG5cdCAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuXHR9XHJcblx0XHJcblx0c3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCB7IGZyb21TYXZlU3RhdGU6IGZhbHNlIH0pO1xyXG5cclxuXHR0aGlzLnR5cGUgPSAnZGlhbG9nJztcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG5cdFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG5cdFx0c3dpdGNoKHR5cGUpIHtcclxuXHRcdFx0Y2FzZSAnY2VudGVyX3dlbGNvbWUnOlxyXG5cdFx0XHRcdHRoaXMuc2V0RGlhbG9nKFxyXG5cdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJXZWxjb21lIHRvIEd1Zml0cnVwIG15IGZyaWVuZCFcIlxyXG5cdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJXYWxrIGFyb3VuZCBhbmQgZmVlbCBmcmVlIHRvIHRlc3QgdGhpcyBnYW1lLlwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIklmIHlvdSBmaW5kIGFueSBidWdzLi4uXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiLi4uc29ycnkgPi48IFwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkJ1dCBsZXQgbWUga25vdyB3aGF0IHlvdSd2ZSBmb3VuZCwgcGxlYXNlIVwiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkhhdmUgZnVuIDpEXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRdXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHR0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMzApO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiY2VudGVyX2xlZnRfbm90aWNlXCI6XHJcblx0XHRcdFx0dGhpcy5zZXREaWFsb2coXHJcblx0XHRcdFx0XHRbXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIktleXMgYW5kIERvb3JzXCJcclxuXHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRdXHJcblx0XHRcdFx0KTtcclxuXHRcdFx0XHR0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMzApO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcImNlbnRlcl90b3Bfbm90aWNlXCI6XHJcblx0XHRcdFx0dGhpcy5zZXREaWFsb2coXHJcblx0XHRcdFx0XHRbXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiBmYWxzZSxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkZpcmUgYW5kIEhlYWx0aCBpdGVtc1wiXHJcblx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRcdHRleHQ6IFwiXCJcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XVxyXG5cdFx0XHRcdCk7XHJcblx0XHRcdFx0dGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDMwKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJjZW50ZXJfcmlnaHRfbm90aWNlXCI6XHJcblx0XHRcdFx0XHR0aGlzLnNldERpYWxvZyhcclxuXHRcdFx0XHRcdFx0W1xyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IGZhbHNlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogXCIhISBEQU5HRVIgISFcIlxyXG5cdFx0XHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBcIkVuZW15cyBhbmQgQmFycmVsc1wiXHJcblx0XHRcdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdFx0XHRoaWRlU3ByaXRlOiB0cnVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogXCJcIlxyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XVxyXG5cdFx0XHRcdFx0KTtcclxuXHRcdFx0XHRcdHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygzMCk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJkb29yc19ncmF0el9ub3RpY2VcIjpcclxuXHRcdFx0XHRcdHRoaXMuc2V0RGlhbG9nKFxyXG5cdFx0XHRcdFx0XHRbXHJcblx0XHRcdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRcdFx0aGlkZVNwcml0ZTogZmFsc2UsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBcIllvdSBkaWQgaXQhIDpEXCJcclxuXHRcdFx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0XHRcdGhpZGVTcHJpdGU6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBcIlwiXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRdXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0dGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDMwKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0XHJcbiAgfVxyXG5cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRGlhbG9nOyIsImNvbnN0IF9DYW5Db2xsZWN0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuQ29sbGVjdCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIERvb3IgZXh0ZW5kcyBfQ2FuQ29sbGVjdCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2UpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcImRvb3JcIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgc3RhZ2U6IHN0YWdlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBjYW5Db2xsZWN0UHJvcHMgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSAnZG9vcic7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmNvbGxlY3RlZCA9PT0gdHJ1ZSApeyAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaXMgYWxyZWFkeSBncmFiYmVkXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgLy8gR3JheVxyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X3RsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmF5X3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAvLyBQdXJwbGVcclxuICAgICAgY2FzZSBcImRvb3JfcHVycGxlX2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfdHJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU0KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgLy8gUmVkXHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF9ibFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9yZWRfdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU1KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxOCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Nik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIC8vIEdyZWVuXHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Nyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMjApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmVlbl90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU4KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMuc2V0TmVlZFNhdmVTdGF0ZSh0cnVlKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBPcGVuIGRvb3IgPSBoaWRlIGFsbCBkb29ycyB3aXRoIHNhbWUgY29kZSBcclxuICBvcGVuKCkge1xyXG4gICAgbGV0IG9ianMgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uZ2V0Q29sSXRlbnMoKTtcclxuICAgIGZvciAobGV0IGkgaW4gb2Jqcykge1xyXG4gICAgICBpZiggb2Jqc1tpXS50eXBlID09ICdkb29yJyApIHtcclxuICAgICAgICBpZiggb2Jqc1tpXS5nZXRDb2RlKCkgPT0gdGhpcy5nZXRDb2RlKCkgKSB7XHJcbiAgICAgICAgICBvYmpzW2ldLmNvbGxlY3QoKTtcclxuICAgICAgICAgIG9ianNbaV0uaGlkZSgpO1xyXG4gICAgICAgICAgb2Jqc1tpXS5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRG9vcjsiLCJjb25zdCBfQ2FuSHVydCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0Nhbkh1cnQnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBFbmVteSBleHRlbmRzIF9DYW5IdXJ0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJlbmVteVwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAyXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuSHVydFByb3BzID0ge1xyXG4gICAgICBhbW91bnQ6IDFcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwge30sIGV2ZW50cywgY2FuSHVydFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50ID0gMTtcclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPSAxO1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50ID0gMDtcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gKCB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuZnBzIC8gMiApOyAvLyAxMDAwIC8gRlBTXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2VuZW15JyksIDMwMCwgOTYwLCAyMCwgNDApO1xyXG5cclxuICAgIHRoaXMuc3RlcCA9IG5ldyBPYmplY3QoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgdGhpcy5pbml0aWFsU3RlcCA9IDI7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICB0aGlzLm1heFN0ZXBzID0gNDtcclxuXHJcbiAgICB0aGlzLmRpcmVjdGlvbkNvdW50ZG93biA9IDA7XHJcbiAgICB0aGlzLnJhbmREaXJlY3Rpb24gPSAxO1xyXG5cclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHgwO1xyXG4gICAgdGhpcy55ID0geTA7XHJcbiAgICBcclxuICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgdGhpcy55MCA9IHkwO1xyXG4gIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLnNwZWVkMCA9IDAuMjtcclxuICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc3BlZWQwO1xyXG4gICAgdGhpcy50eXBlID0gXCJlbmVteVwiO1xyXG4gICAgXHJcbiAgICAvLyAjIExpZmVcclxuICAgIHRoaXMuZGVmYXVsdExpZmVzID0gMjtcclxuICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgIHRoaXMuZGVhZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdG9wUmVuZGVyaW5nTWUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgdGhpcy5odXJ0Q29vbERvd25UaW1lID0gMTAwMDsgLy8yc1xyXG5cclxuICAgIHRoaXMucGxheWVyQXdhcmVDaHVua3NEaXN0YW5jZTAgPSA1O1xyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlID0gdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlMDtcclxuICAgIHRoaXMucGxheWVyQXdhcmVEaXN0YW5jZSA9IHRoaXMuY2h1bmtTaXplICogdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlO1xyXG5cclxuICAgIHRoaXMuYXdhcmVPZlBsYXllciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMueEZyb21QbGF5ZXJEaXN0YW5jZSA9IDA7XHJcbiAgICB0aGlzLllGcm9tUGxheWVyRGlzdGFuY2UgPSAwO1xyXG5cclxuICAgIHRoaXMucnVuRW5lbXkoKTtcclxuICB9XHJcblxyXG4gIGlzRGVhZCgpIHsgcmV0dXJuIHRoaXMuZGVhZDsgfVxyXG4gIHNldERlYWQoYm9vbCkgeyB0aGlzLmRlYWQgPSBib29sOyB9XHJcblxyXG4gIG5lZWRTdG9wUmVuZGVyaW5nTWUoKSB7IHJldHVybiB0aGlzLnN0b3BSZW5kZXJpbmdNZTsgfVxyXG4gIHNldFN0b3BSZW5kZXJpbmdNZShib29sKSB7IHRoaXMuc3RvcFJlbmRlcmluZ01lID0gYm9vbDsgfVxyXG5cclxuICBpc0F3YXJlT2ZQbGF5ZXIoKSB7IHJldHVybiB0aGlzLmF3YXJlT2ZQbGF5ZXI7IH1cclxuICBzZXRBd2FyZU9mUGxheWVyKGJvb2wpIHsgdGhpcy5hd2FyZU9mUGxheWVyID0gYm9vbDsgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvblxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uSGVpZ2h0KHRoaXMuY29sbGlzaW9uSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvblkodGhpcy5jb2xsaXNpb25ZKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgc2V0U3ByaXRlUHJvcHNGcmFtZShzcHJpdGVBbmltYXRpb25Db3VudCl7XHJcbiAgICBzd2l0Y2goc3ByaXRlQW5pbWF0aW9uQ291bnQpIHsgXHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiAwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGUuZ2V0S2V5V2lkdGgoKSwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGUuZ2V0S2V5SGVpZ2h0KCkgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzIHN0YXRlIGZvciBlbmVteSBkaXJlY3Rpb25cclxuICBsb29rRG93bigpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZG93bic7XHJcbiAgICBcclxuICAgIC8vIFN0ZXBzXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgwKTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzKTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuXHJcbiAgfVxyXG4gIFxyXG4gIGxvb2tVcCgpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAndXAnO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxNSk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxNik7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxNyk7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxOCk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG4gIFxyXG4gIGxvb2tSaWdodCgpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAncmlnaHQnO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMSk7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG4gICAgICBcclxuICBsb29rTGVmdCgpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNSk7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG5cclxuICBkeWluZygpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZHlpbmcnO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDApO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDMpO1xyXG4gICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDQpO1xyXG4gICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMjkpOyAvLyBlbXB0eSBmcmFtZVxyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuXHJcbiAgLy8gIyBNb3ZlbWVudFxyXG4gIG1vdkxlZnQoaWdub3JlQ29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdlJpZ2h0KGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gICAgXHJcbiAgbW92VXAoaWdub3JlQ29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gICAgXHJcbiAgbW92RG93bihpZ25vcmVDb2xsaXNpb24pIHsgIFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgbW92VG9EZWF0aChpZ25vcmVDb2xsaXNpb24pIHtcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMuZHlpbmcoKSApO1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldFNwZWVkKCkpO1xyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgRmlyZSBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICAvLyAjIFNldHNcclxuICAgICAgXHJcbiAgc2V0WCh4LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLnggPSB4OyBcclxuICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblgoIHggKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhICk7XHJcbiAgfVxyXG4gIHNldFkoeSwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy55ID0geTsgXHJcbiAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25ZKCB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSApO1xyXG4gIH1cclxuXHJcbiAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICBzZXRDb2xsaXNpb25ZKHkpIHsgdGhpcy5jb2xsaXNpb25ZID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgXHJcbiAgc2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplICogc3BlZWQ7IH1cclxuXHJcbiAgc2V0TG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKSB7IHRoaXMubG9va0RpcmVjdGlvbiA9IGxvb2tEaXJlY3Rpb247IH1cclxuICB0cmlnZ2VyTG9va0RpcmVjdGlvbihkaXJlY3Rpb24pIHsgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgfVxyXG5cclxuICByZXNldFBvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLngwICk7XHJcbiAgICB0aGlzLnNldFkoIHRoaXMueTAgKTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmNvbGxpc2lvblkwICk7XHJcbiAgfVxyXG5cclxuICBodXJ0KCBhbW91bnQgKSB7XHJcbiAgICBpZiggdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBIdXJ0IHBsYXllclxyXG4gICAgICB0aGlzLmxpZmVzIC09IGFtb3VudDtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAwICkgdGhpcy5saWZlcyA9IDA7XHJcblxyXG4gICAgICAvLyBTdGFydCBjb29sZG93blxyXG4gICAgICB0aGlzLmNhbkJlSHVydCA9IGZhbHNlO1xyXG4gICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgcGxheWVyIGRpZWRcclxuICAgICAgdGhpcy5jaGVja015RGVhdGgoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNoZWNrTXlEZWF0aCgpIHtcclxuICAgIGlmKCB0aGlzLmxpZmVzIDwgMSApIHtcclxuICAgICAgdGhpcy5zZXREZWFkKHRydWUpO1xyXG5cclxuICAgICAgaWYoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwiZHlpbmdcIikgdGhpcy5zdGVwQ291bnQgPSAxOyAvLyBJZiBpdCdzIG5vdCBkeWluZywgcmVzZXQgYW5pbWF0aW9uIHN0ZXBcclxuICAgICAgdGhpcy5zZXRTcGVlZCgxLjMpOyAvLyBJbmNyZWFzZSBzcGVlZFxyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7IC8vIFByZXZlbnQgZW5lbXkgaHVydGluZyBwbGF5ZXIgd2hlbiBpbiBkZWF0aCBhbmltYXRpb25cclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDY7XHJcbiAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gODtcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAjIEdldHNcclxuICBcclxuICBnZXRMaWZlcygpIHsgcmV0dXJuIHRoaXMubGlmZXM7IH1cclxuICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgIFxyXG4gIC8vVGhlIGNvbGxpc2lvbiB3aWxsIGJlIGp1c3QgaGFsZiBvZiB0aGUgcGxheWVyIGhlaWdodFxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblg7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgbGV0IHggPSAoIF94ICkgPyBfeCA6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICB9XHJcbiAgZ2V0Q2VudGVyWSggX3kgKSB7IFxyXG4gICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgfVxyXG4gICAgXHJcbiAgZ2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcbiAgZ2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcbiAgICBcclxuICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgIFxyXG4gIGluY3JlYXNlU3RlcCgpIHtcclxuICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAvL0Rvbid0IHJlc2V0IGlmIGl0J3MgaW4gZGVhdGggYW5pbWF0aW9uXHJcbiAgICAgIGlmKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9PSBcImR5aW5nXCIgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLm1heFN0ZXBzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5pbml0aWFsU3RlcDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXNldFN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICBzd2l0Y2ggKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBoaWRlTWUoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7IH1cclxuICBzaG93KCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG4gIFxyXG4gIC8vICMgRW5lbXkgUmVuZGVyICAgIFxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMubmVlZFN0b3BSZW5kZXJpbmdNZSgpICkgcmV0dXJuO1xyXG5cclxuICAgIC8vIEJsaW5rIEVuZW15IGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgIGlmKCAhIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICB0aGlzLmhpZGVTcHJpdGUgPSAhdGhpcy5oaWRlU3ByaXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSAmJiB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiAhPSBcImR5aW5nXCIgICkgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSwgXHJcbiAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICk7XHRcclxuXHJcbiAgICAvLyBQbGF5ZXIgQXdhcmVuZXNzIFxyXG4gICAgaWYoIHRoaXMuaXNBd2FyZU9mUGxheWVyKCkgKSB7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiNTBweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNDQzAwMDBcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCBcIiFcIiwgdGhpcy5nZXRYKCkgKyAoIHRoaXMuY2h1bmtTaXplICogMC4wMyApLCB0aGlzLmdldFkoKSArICggdGhpcy5jaHVua1NpemUgKiAwLjMgKSApOyBcclxuICAgIH1cclxuXHJcbiAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcblxyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSApO1xyXG5cclxuICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFgoKSkgKyBcIiBZOlwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFkoKSk7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDYwKTsgXHJcblxyXG4gICAgICB0ZXh0ID0gXCJkWDogXCIgKyBNYXRoLnJvdW5kKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgKSArIFwiIGRZOlwiICsgTWF0aC5yb3VuZCggdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlICk7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDIwKTsgXHJcbiAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgfTtcclxuXHJcbi8vICMgRW5lbXkgQnJhaW5cclxuICBlbmVteUJyYWluKCkge1xyXG5cclxuICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0dhbWVSZWFkeSgpICYmIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBEZWFkIGJlaGF2aW9yL2FuaW1hdGlvblxyXG4gICAgICBpZiggdGhpcy5pc0RlYWQoKSApIHtcclxuICAgICAgICBcclxuICAgICAgICAvL1doaWxlIG5vdCBvdXQgb2Ygc2NyZWVuXHJcbiAgICAgICAgaWYoIHRoaXMuZ2V0WCgpIDwgd2luZG93LmdhbWUuZ2FtZVByb3BzLmNhbnZhc1dpZHRoICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBTdGFydCBtb3Zpbmcgb3V0IG9mIHNjcmVlblxyXG4gICAgICAgICAgdGhpcy5tb3ZUb0RlYXRoKHRydWUpOyAvLyB0cnVlID0gaWdub3JlIGNvbGxpc2lvbiBjaGVja1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIE9rLCB0aGUgZW5lbXkgaXMgZGVhZCwgc3RvcCByZW5kZXJpbmcgbm93XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BSZW5kZXJpbmdNZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIH0gZWxzZSB7IC8vICMgTm90IGRlYWRcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBuZWFyIGVub3VnaCBvZiBwbGF5ZXIgdG8gZ28gaW4gaGlzIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCBuZWFyUGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgd2luZG93LmdhbWUucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGRpc3RhbmNlIGJldHdlZW4gZW5lbXkgYW5kIHBsYXllclxyXG4gICAgICAgICAgdGhpcy54RnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWCgpIC0gcGxheWVyLmdldENlbnRlclgoKSApO1xyXG4gICAgICAgICAgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWSgpIC0gcGxheWVyLmdldENlbnRlclkoKSApO1xyXG4gICAgICAgICAgLy9JZiBib3RoIGRpc3RhbmNlIGFyZSBiZWxvdyB0aGUgYXdhcmUgZGlzdGFuY2UsIHNldCB0aGlzIHBsYXllciB0byBiZSB0aGUgbmVhciBwbGF5ZXJcclxuICAgICAgICAgIGlmKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgPCB0aGlzLnBsYXllckF3YXJlRGlzdGFuY2UgJiYgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlIDwgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBuZWFyUGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgICBpZiggbmVhclBsYXllciApIHtcclxuXHJcbiAgICAgICAgICAvLyAjIFdhbGsgaW4gcGxheWVyIGRpcmVjdGlvblxyXG4gICAgICAgICAgdGhpcy5zZXRBd2FyZU9mUGxheWVyKHRydWUpO1xyXG5cclxuICAgICAgICAgIC8vIHBvc2l0aW9uc1xyXG4gICAgICAgICAgbGV0IFhlID0gdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgICAgICBsZXQgWWUgPSB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuXHJcbiAgICAgICAgICBsZXQgWHAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblgoKTsgXHJcbiAgICAgICAgICBsZXQgWXAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblkoKTsgXHJcblxyXG4gICAgICAgICAgbGV0IFhkaXN0YW5jZSA9IE1hdGguYWJzKFhlIC0gWHApOy8vIElnbm9yZSBpZiB0aGUgcmVzdWx0IGlzIGEgbmVnYXRpdmUgbnVtYmVyXHJcbiAgICAgICAgICBsZXQgWWRpc3RhbmNlID0gTWF0aC5hYnMoWWUgLSBZcCk7XHJcblxyXG4gICAgICAgICAgLy8gd2hpY2ggZGlyZWN0aW9uIHRvIGxvb2tcclxuICAgICAgICAgIGxldCBYZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIGxldCBZZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgWGRpcmVjdGlvbiA9ICggWGUgPj0gWHAgKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgICBZZGlyZWN0aW9uID0gKCBZZSA+PSBZcCApID8gJ3VwJyA6ICdkb3duJztcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gd2hlcmUgdG8gZ29cclxuICAgICAgICAgIGxldCBnb1RvRGlyZWN0aW9uID0gKCBYZGlzdGFuY2UgPiBZZGlzdGFuY2UgKSA/IFhkaXJlY3Rpb24gOiBZZGlyZWN0aW9uO1xyXG5cclxuICAgICAgICAgIC8vIElmIGhhcyBjb2xsaWRlZCBhIGxvdCwgY2hhbmdlIGRpcmVjdGlvbiB0byBhdm9pZCBnZXR0aW5nIHN0dWNrXHJcbiAgICAgICAgICBpZiggdGhpcy5jb2xsaXNpb25Db3VudCA+IDIwICkge1xyXG4gICAgICAgICAgICAvLyBTdG9wIGdvaW5nIG9uIHRoYXQgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIFRPRE86IFRoaW5rIGFib3V0IGl0ISFcclxuICAgICAgICAgICAgKi9cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gbW92ZVxyXG4gICAgICAgICAgc3dpdGNoKCBnb1RvRGlyZWN0aW9uICkge1xyXG4gICAgICAgICAgICBjYXNlICd1cCc6ICAgIHRoaXMubW92VXAoKTsgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzogdGhpcy5tb3ZSaWdodCgpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZG93bic6ICB0aGlzLm1vdkRvd24oKTsgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzogIHRoaXMubW92TGVmdCgpOyAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gIyBmYXIgZnJvbSBwbGF5ZXIsIHNvIGtlZXAgcmFuZG9tIG1vdmVtZW50XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgc3RvcGVkIHRoZSBtb3ZlIGV2ZW50XHJcbiAgICAgICAgICBpZiggdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPD0gMCApIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kRGlyZWN0aW9uID0gIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpICsgMTsgLy8gMSAtIDRcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPSAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMTA7IC8vIDEgLSA0XHJcbiAgICAgICAgICAgIC8vdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gTW92ZSBkaXJlY3Rpb24gbmVlZGVkXHJcbiAgICAgICAgICBzd2l0Y2goIHRoaXMucmFuZERpcmVjdGlvbiApIHtcclxuICAgICAgICAgICAgY2FzZSAxOiB0aGlzLm1vdlVwKCk7ICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiB0aGlzLm1vdlJpZ2h0KCk7ICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiB0aGlzLm1vdkRvd24oKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OiB0aGlzLm1vdkxlZnQoKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA1OiAvLyBtb3JlIGNoYW5jZXMgdG8gZG9uJ3QgbW92ZVxyXG4gICAgICAgICAgICBjYXNlIDY6IFxyXG4gICAgICAgICAgICBjYXNlIDc6IFxyXG4gICAgICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7IGJyZWFrOyAvLyBkb24ndCBtb3ZlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24tLTtcclxuICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH0gLy8gaWYgZGVhZFxyXG5cclxuICAgIH0vL2lmIGdhbWUgcmVhZHlcclxuXHJcbiAgICBcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5lbmVteUJyYWluLmJpbmQodGhpcykgKTtcclxuICB9XHJcblxyXG4vLyAjIENvbGxpc2lvblxyXG5cclxuICBjb2xsaXNpb24ob2JqKXsgXHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiApIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50Kys7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IFxyXG4gIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICBydW5FbmVteSgpIHtcclxuICAgIC8vIGNoYW5nZSBsb29rIGRpcmVjdGlvblxyXG4gICAgdGhpcy5sb29rRGlyZWN0aW9uID0gdGhpcy5sb29rRG93bigpO1xyXG5cclxuICAgIC8vc3RhcnQgYWxnb3JpdG0gdGhhdCBtb3ZlcyBwbGF5ZXJcclxuICAgIHRoaXMuZW5lbXlCcmFpbigpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7IiwiY29uc3QgX0Nhbkh1cnQgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5IdXJ0Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgRmlyZSBleHRlbmRzIF9DYW5IdXJ0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJGaXJlXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDQ5KTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuSHVydFByb3BzID0ge1xyXG4gICAgICBhbW91bnQ6IDFcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkh1cnRQcm9wcyk7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCA9IDM7XHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCkgKyAxOyAvLyBHZW5lcmF0ZSBhIHJhbmQgaW5pdGlhbCBudW1iZXIgdG8gcmFuZG9taXplIGFuaW1hdGlvbiBpbiBjYXNlIG9mIG11bHRpcGxlIEZpcmVzXHJcbiAgICBcclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwLjQ7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcbiAgICB0aGlzLmNvbGxpc2lvblkgPSB5MCArICggd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwLjYpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzcHJpdGUgRlBTIEFuaW1hdGlvblxyXG4gICAgbGV0IHJhbmRGUFMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KSArIDU7IC8vIEdlbmVyYXRlIGEgcmFuZG9tIEZQUywgc28gbXVsdGlwbGUgRmlyZXMgb24gcGFnZSBkb24ndCBhbmltYXRlIHRoZSBzYW1lIHdheSBcclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gcmFuZEZQUzsgLy8gMTAwMCAvIEZQU1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgICAgICAvLyBDb2xsaXNpb25cclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbkhlaWdodCh0aGlzLmNvbGxpc2lvbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKHRoaXMuY29sbGlzaW9uWSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNldFNwcml0ZVByb3BzRnJhbWUoc3ByaXRlQW5pbWF0aW9uQ291bnQpe1xyXG4gICAgc3dpdGNoKHNwcml0ZUFuaW1hdGlvbkNvdW50KSB7IFxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgRmlyZSBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICBiZWZvcmVSZW5kZXIoKSB7XHJcbiAgICAvLyBBbmltYXRlIGZpcmVcclxuICAgIGlmKCB0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpICkge1xyXG4gICAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50Kys7XHJcbiAgICAgIGlmKCB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID4gdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCApIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPSAxO1xyXG4gICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBGaXJlOyIsImNvbnN0IF9DYW5Db2xsZWN0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuQ29sbGVjdCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEhlYWwgZXh0ZW5kcyBfQ2FuQ29sbGVjdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2VfaWQpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBzdGFnZV9pZCArIFwiX3BvdGlvblwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBzdGFnZTogc3RhZ2VfaWRcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDUwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuQ29sbGVjdFByb3BzID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuaGFuZGxlUHJvcHMoKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBoYXMgc29tZSBzYXZlIHN0YXRlXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmICEgdGhpcy5jYW5SZXNwYXduKCkgJiYgaXRlbVNhdmVkU3RhdGUuY29sbGVjdGVkID09PSB0cnVlICl7IC8vIENoZWNrIGlmIGhhcyBzYXZlZCBzdGF0ZSBhbmQgY2FuJ3QgcmVzcGF3blxyXG4gICAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICB9XHJcblxyXG4gIHNldEhlYWxBbW91dChhbW91bnQpIHsgdGhpcy5oZWFsQW1vdXQgPSBhbW91bnQ7IH1cclxuICBnZXRIZWFsQW1vdW50KCkgeyByZXR1cm4gdGhpcy5oZWFsQW1vdXQ7IH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdiYW5hbmEnOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2JlcnJ5JzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29sbGlzaW9uKHBsYXllcil7IFxyXG4gICAgaWYoICF0aGlzLmlzQ29sbGVjdGVkKCkgKSB7XHJcbiAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgcGxheWVyLmhlYWxQbGF5ZXIoIHRoaXMuZ2V0SGVhbEFtb3VudCgpICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICBcclxuICAgIC8vIFNldCBQcm9wcyBiYXNlZCBvbiB0eXBlXHJcbiAgICBzd2l0Y2goIHRoaXMuZ2V0VHlwZSgpICkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnYmFuYW5hJzpcclxuICAgICAgICB0aGlzLnNldEhlYWxBbW91dCgxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYmVycnknOlxyXG4gICAgICAgIHRoaXMuc2V0TmVlZFNhdmVTdGF0ZSh0cnVlKTsgLy8gTWFrZSB0aGlzIGl0ZW0gYWJsZSB0byBzYXZlIHN0YXRlXHJcbiAgICAgICAgdGhpcy5zZXRIZWFsQW1vdXQoMik7XHJcbiAgICAgICAgdGhpcy5zZXRDYW5SZXNwYXduKGZhbHNlKTsgLy8gSXQgY2FuJ3QgcmVzcGF3biBpZiB1c2VkXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBIZWFsOyIsImNvbnN0IF9DYW5UaHJvdyA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhblRocm93Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgS2V5IGV4dGVuZHMgX0NhblRocm93IHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZSwgZnJvbVNhdmVTdGF0ZSkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwia2V5XCIsXHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIGNsYXNzOiAna2V5JyxcclxuICAgICAgc3RhZ2U6IHN0YWdlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhblRocm93ID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiBmYWxzZSxcclxuICAgICAgY2h1bmNrc1Rocm93RGlzdGFuY2U6IDEsXHJcbiAgICAgIGh1cnRBbW91bnQ6IDAsXHJcbiAgICAgIHVzZUV2ZW50OiAndXNlJ1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuVGhyb3csIGZyb21TYXZlU3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc2V0TmVlZFNhdmVTdGF0ZSh0cnVlKTtcclxuICAgIHRoaXMuaGFuZGxlUHJvcHMoKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBoYXMgc29tZSBzYXZlIHN0YXRlXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuXHJcbiAgICAgIGxldCBpdGVtU2F2ZWRTdGF0ZSA9IHNhdmVkSXRlbXNTdGF0ZVt0aGlzLmdldE5hbWUoKV07XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaXMgYWxyZWFkeSBncmFiYmVkXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5ncmFiYmVkID09IHRydWUgKXsgXHJcbiAgICAgICAgaWYoIHRoaXMuZnJvbVNhdmVkU3RhdGUgKSB7XHJcbiAgICAgICAgICAvLyBHcmFiIHRoZSBpdGVtIHNhdmVkXHJcbiAgICAgICAgICB0aGlzLmdyYWJIYW5kbGVyKCBpdGVtU2F2ZWRTdGF0ZS5ncmFiUHJvcHMucGxheWVyV2hvR3JhYmJlZCApOyBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gSWdub3JlIHRoZSBpdGVtIGZyb20gc3RhZ2VcclxuICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyB1c2VkIGJlZm9yZVxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuY29sbGVjdGVkID09IHRydWUgKSB7IFxyXG4gICAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICB0aGlzLmNhbkdyYWIgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy9DaGVjayBpZiBpdCB3YXMgZHJvcHBlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZHJvcHBlZCA9PSB0cnVlICkgeyBcclxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGRyb3BwZWQgb24gdGhpcyBzdGFnZVxyXG4gICAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlID09IHdpbmRvdy5nYW1lLmdldEN1cnJlbnRTdGFnZSgpICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiggISB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVYKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFggKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVkoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueDAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueDA7XHJcbiAgICAgICAgdGhpcy55MCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy55MDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyb3BYID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYO1xyXG4gICAgICAgIHRoaXMuZHJvcFkgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFN0YWdlID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLnN0YWdlO1xyXG4gICAgICAgIHRoaXMuZHJvcHBlZFN0YWdlID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZTtcclxuICAgICAgICBcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEhhbmRsZSBwcm9wcyB3aGVuIGxvYWRcclxuICBoYW5kbGVQcm9wcygpIHtcclxuICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgc2F2ZWQgYmVmb3JlIGFuZCBjaGFuZ2UgaXQgcHJvcHNcclxuICAgIHRoaXMuY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNwcml0ZXMgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgY2FzZSBcImdyYXlcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicHVycGxlXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicmVkXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZ3JlZW5cIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI5KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgZGlzY2FyZEtleShwbGF5ZXIpIHtcclxuICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRDb2xsZWN0KHRydWUpO1xyXG4gICAgdGhpcy5zZXRHcmFiKGZhbHNlKTtcclxuICAgIHBsYXllci5zZXROb3RHcmFiYmluZygpO1xyXG4gIH1cclxuXHJcbiAgdXNlKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpIHtcclxuICAgIGxldCBvYmogPSBwbGF5ZXIuY2hlY2tJdGVtT25HcmFiQ29sbGlzaW9uQm94KCk7XHJcbiAgICBpZiggb2JqLnR5cGUgPT0gJ2Rvb3InICkge1xyXG4gICAgICBpZiggb2JqLmdldENvZGUoKSA9PSB0aGlzLmdldENvZGUoKSApIHtcclxuICAgICAgICBvYmoub3BlbigpO1xyXG4gICAgICAgIHRoaXMuZGlzY2FyZEtleShwbGF5ZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBLZXk7IiwiY29uc3QgX0NhbkJlUHVzaGVkID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuQmVQdXNoZWQnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBPYmplY3RfUHVzaCBleHRlbmRzIF9DYW5CZVB1c2hlZCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwib2JqZWN0XCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDUwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5QdXNoID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlLFxyXG4gICAgICBjaHVuY2tzUHVzaERpc3RhbmNlOiAxNSxcclxuICAgICAgaHVydEFtb3VudDogMlxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuUHVzaCk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIFwic3RvbmVcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0X1B1c2g7IiwiY29uc3QgX0NhblRocm93ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuVGhyb3cnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBPYmplY3RfVGhyb3cgZXh0ZW5kcyBfQ2FuVGhyb3cge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJvYmplY3RcIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgY2xhc3M6ICdvYmplY3RfdGhyb3cnLFxyXG4gICAgICBzdGFnZTogc3RhZ2VcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDUwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5UaHJvdyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZSxcclxuICAgICAgY2h1bmNrc1Rocm93RGlzdGFuY2U6IDUsXHJcbiAgICAgIGh1cnRBbW91bnQ6IDIsXHJcbiAgICAgIHVzZUV2ZW50OiAndGhyb3cnXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvdywgZnJvbVNhdmVTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpOy8vc2V0IHRvIHNhdmUganVzdCB0byBjaGVjayBpZiB1c2VyIGlzIGdyYWJiaW5nIGl0IHdoZW4gbGVhdmluZyBzdGFnZVxyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJiYXJyZWxcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zZXRDb2RlKHR5cGUpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGhhcyBzb21lIHNhdmUgc3RhdGVcclxuICBjaGVja1NhdmVkSXRlbVN0YXRlKCkge1xyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKSApOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICkge1xyXG4gICAgICBsZXQgaXRlbVNhdmVkU3RhdGUgPSBzYXZlZEl0ZW1zU3RhdGVbdGhpcy5nZXROYW1lKCldO1xyXG4gICAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaXMgYWxyZWFkeSBncmFiYmVkXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5ncmFiYmVkID09PSB0cnVlICl7XHJcbiAgICAgICAgaWYoIHRoaXMuZnJvbVNhdmVkU3RhdGUgKSB7XHJcbiAgICAgICAgICAvLyBHcmFiIHRoZSBpdGVtIHNhdmVkXHJcbiAgICAgICAgICB0aGlzLmdyYWJIYW5kbGVyKCBpdGVtU2F2ZWRTdGF0ZS5ncmFiUHJvcHMucGxheWVyV2hvR3JhYmJlZCApOyBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gSWdub3JlIHRoZSBpdGVtIGZyb20gc3RhZ2VcclxuICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvL0NoZWNrIGlmIGl0IHdhcyBkcm9wcGVkXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5kcm9wcGVkID09IHRydWUgKSB7IFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgZHJvcHBlZCBvbiB0aGlzIHN0YWdlXHJcbiAgICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2UgPT0gd2luZG93LmdhbWUuZ2V0Q3VycmVudFN0YWdlKCkgKSB7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmKCAhIHRoaXMuZnJvbVNhdmVkU3RhdGUgKSB7XHJcbiAgICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVgoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWCApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlWSggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy54MCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy54MDtcclxuICAgICAgICB0aGlzLnkwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLnkwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJvcFggPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFg7XHJcbiAgICAgICAgdGhpcy5kcm9wWSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWTtcclxuXHJcbiAgICAgICAgdGhpcy5kcm9wcGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsU3RhZ2UgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuc3RhZ2U7XHJcbiAgICAgICAgdGhpcy5kcm9wcGVkU3RhZ2UgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlO1xyXG4gICAgICAgIFxyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICB9XHJcblxyXG4gIC8vIEhhbmRsZSBwcm9wcyB3aGVuIGxvYWRcclxuICBoYW5kbGVQcm9wcygpIHtcclxuICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgc2F2ZWQgYmVmb3JlIGFuZCBjaGFuZ2UgaXQgcHJvcHNcclxuICAgIHRoaXMuY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0X1Rocm93OyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBnYW1lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uLy4uLy4uL2dhbWVQcm9wZXJ0aWVzJyk7IFxyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIFRlbGVwb3J0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4LCB0ZWxlcG9ydFByb3BzKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJUZWxlcG9ydFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShmYWxzZSwgMCwgMCwgMCwgMCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy50ZWxlcG9ydFByb3BzID0gdGVsZXBvcnRQcm9wcztcclxuXHJcbiAgICB0aGlzLnhJbmRleCA9IHhJbmRleDtcclxuICAgIHRoaXMueUluZGV4ID0geUluZGV4O1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ocGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQsIGNvbGxpZGFibGUsIGNvbGxpc2lvbkRpcmVjdGlvbil7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXJzID0gY29sbGlkYWJsZS5zY2VuYXJpby5nZXRQbGF5ZXJzKCk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHBsYXllciB0ZWxlcG9ydHMsIHRoZW4gY2hhbmdlIHN0YWdlXHJcbiAgICBpZiggdGhpcy50ZWxlcG9ydCggcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQgKSApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIE1ha2UgZXZlcnl0aGluZyBkYXJrXHJcbiAgICAgIGNvbGxpZGFibGUuc2NlbmFyaW8uY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHdpbmRvdy5nYW1lLmxvYWRpbmcodHJ1ZSk7XHJcblxyXG4gICAgICAvLyBIaWRlIGFsbCBwbGF5ZXJzXHJcbiAgICAgIHBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgcGxheWVyLmhpZGVQbGF5ZXIoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBOb3cgdGVsZXBvcnQgYWxsIHBsYXllcnMgdG8gc2FtZSBsb2NhdGlvbiBhbmQgZGlyZWN0aW9uXHJcbiAgICAgIGxldCB0YXJnZXRYID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0WCgpO1xyXG4gICAgICBsZXQgdGFyZ2V0WSA9IHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LmdldFkoKTtcclxuICAgICAgbGV0IGxvb2tEaXJlY3Rpb24gPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRTcHJpdGVQcm9wcygpLmRpcmVjdGlvbjtcclxuICAgICAgXHJcbiAgICAgIHBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgcGxheWVyLnNldFgodGFyZ2V0WCwgdHJ1ZSk7IC8vIHRydWUgPSBhbHNvIHNldCBjb2xsaXNpb24geCB0b29cclxuICAgICAgICBwbGF5ZXIuc2V0WSh0YXJnZXRZLCB0cnVlKTtcclxuICAgICAgICBwbGF5ZXIudHJpZ2dlckxvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbik7XHJcbiAgICAgICAgcGxheWVyLmNoZWNrR3JhYmJpbmdPYmplY3RzKCk7XHJcbiAgICAgICAgcGxheWVyLnNob3dQbGF5ZXIoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDaGFuZ2Ugc3RhZ2VcclxuICAgICAgY29sbGlkYWJsZS5zY2VuYXJpby5zZXRTdGFnZSggXHJcbiAgICAgICAgdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFN0YWdlLFxyXG4gICAgICAgIGZhbHNlIC8vIGZpcnN0U3RhZ2UgP1xyXG4gICAgICApO1xyXG5cclxuICAgICAgd2luZG93LmdhbWUubG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIFdoYXQga2luZCBvZiB0ZWxlcG9ydD9cclxuICB0ZWxlcG9ydCggcGxheWVyICkge1xyXG4gICAgXHJcbiAgICBsZXQgZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgbGV0IHR5cGUgPSB0aGlzLnRlbGVwb3J0UHJvcHMudGVsZXBvcnRUeXBlO1xyXG4gICAgbGV0IHRhcmdldFggPSAwO1xyXG4gICAgbGV0IHRhcmdldFkgPSAwO1xyXG5cclxuICAgIGxldCB3aWxsVGVsZXBvcnQgPSBmYWxzZTtcclxuXHJcbiAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGFyZ2V0WCA9IHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRYO1xyXG4gICAgICAgIHRhcmdldFkgPSB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0WTtcclxuICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicmVsYXRpdmVcIjpcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudGVsZXBvcnRQcm9wcy5jYW1lRnJvbSkge1xyXG4gICAgICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgICAgICB0YXJnZXRYID0gdGhpcy54SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggKGdhbWVQcm9wcy5nZXRQcm9wKCdzY3JlZW5WZXJ0aWNhbENodW5rcycpIC0gMyApICogdGhpcy5jaHVua1NpemUpOyAvLyAtMyBiZWNhdXNlIG9mIHRoZSBwbGF5ZXIgY29sbGlzaW9uIGJveFxyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IHRoaXMueEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAwICogdGhpcy5jaHVua1NpemU7IC8vIFRlbGVwb3J0IHRvIFk9MCwgYnV0IHBsYXllciBoaXRib3ggd2lsbCBtYWtlIGhpbSBnbyAxIHRpbGUgZG93blxyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJyaWdodFwiOlxyXG4gICAgICAgICAgICB0YXJnZXRZID0gKCB0aGlzLnlJbmRleCAqIHRoaXMuY2h1bmtTaXplKSAtIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRYID0gMSAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJsZWZ0XCI6XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIHRoaXMueUluZGV4ICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFggPSAoIGdhbWVQcm9wcy5nZXRQcm9wKCdzY3JlZW5Ib3Jpem9udGFsQ2h1bmtzJykgLSAyICkgKiB0aGlzLmNodW5rU2l6ZTsgXHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBPbmx5IHRlbGVwb3J0cyBpZiBpdCBjYW4gdGVsZXBvcnRcclxuICAgIGlmKCB3aWxsVGVsZXBvcnQgKSB7XHJcbiAgICAgIHBsYXllci5zZXRYKCB0YXJnZXRYICk7IC8vIGFsd2F5cyB1c2luZyBYIGFuZCBZIHJlbGF0aXZlIHRvIHRlbGVwb3J0IG5vdCBwbGF5ZXIgYmVjYXVzZSBpdCBmaXggdGhlIHBsYXllciBwb3NpdGlvbiB0byBmaXQgaW5zaWRlIGRlc3RpbmF0aW9uIHNxdWFyZS5cclxuICAgICAgcGxheWVyLnNldFkoIHRhcmdldFkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gd2lsbFRlbGVwb3J0O1xyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRlbGVwb3J0OyIsIi8qKlxyXG4gKiAgU3RvcmUgQXNzZXRzIHRoYXQgbmVlZHMgdG8gYmUgb24gYW55IHN0YWdlLCBsaWtlIGtleXMgb3IgaXRlbXMgdGhhdCBwbGF5ZXIgZ3JhYnNcclxuICogXHJcbiAqICBEZWNsYXJlIGFsbCBvZiB0aGlzIGFzc2V0cyBoZXJlXHJcbiAqL1xyXG5cclxuY29uc3QgS2V5ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9LZXknKTtcclxuY29uc3QgT2JqZWN0X1Rocm93ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuXHJcbmNsYXNzIEdsb2JhbEFzc2V0cyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkgeyBcclxuXHRcdHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG5cdH1cclxuXHJcbiAgZ2V0QXNzZXQoIF9jbGFzcywgcHJvcHMsIGZyb21TYXZlU3RhdGUgKSB7XHJcbiAgICBsZXQgcjtcclxuICAgIHN3aXRjaCggX2NsYXNzICkge1xyXG4gICAgICBjYXNlICdrZXknOlxyXG4gICAgICAgIHIgPSBuZXcgS2V5KCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAsIHByb3BzLnN0YWdlLCBmcm9tU2F2ZVN0YXRlICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ29iamVjdF90aHJvdyc6XHJcbiAgICAgICAgciA9IG5ldyBPYmplY3RfVGhyb3coIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2UsIGZyb21TYXZlU3RhdGUgKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiByO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gR2xvYmFsQXNzZXRzOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgX0NhbkJlUHVzaGVkIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkJlUHVzaGVkUHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuVXNlID0gdHJ1ZTtcclxuICAgIHRoaXMuX3B1c2ggPSBmYWxzZTtcclxuICAgIHRoaXMuX2NhblJlc3Bhd24gPSBjYW5CZVB1c2hlZFByb3BzLmNhblJlc3Bhd247XHJcbiAgICB0aGlzLmh1cnRBbW91bnQgPSBjYW5CZVB1c2hlZFByb3BzLmh1cnRBbW91bnQ7XHJcbiAgICBcclxuICAgIHRoaXMucHVzaERpc3RhbmNlID0gY2FuQmVQdXNoZWRQcm9wcy5jaHVuY2tzUHVzaERpc3RhbmNlICogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcbiAgICB0aGlzLnB1c2hTcGVlZCA9IDAuODtcclxuICAgIHRoaXMucHVzaERpc3RhbmNlVHJhdmVsbGVkID0gMDtcclxuICAgIHRoaXMucHVzaE1vdmVtZW50ID0gZmFsc2U7XHJcbiAgICB0aGlzLnB1c2hEaXJlY3Rpb24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy50YXJnZXRYID0gMDtcclxuICAgIHRoaXMudGFyZ2V0WSA9IDA7XHJcbiAgfVxyXG5cclxuICBpc1B1c2hpbmcoKSB7IHJldHVybiB0aGlzLl9wdXNoOyB9XHJcbiAgc2V0UHVzaChib29sKSB7IHRoaXMuX3B1c2ggPSBib29sOyB9XHJcbiAgZ2V0UHVzaFNwZWVkKCkgeyByZXR1cm4gIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogdGhpcy5wdXNoU3BlZWQ7IH1cclxuICBjYWxjdWxhdGVQdXNoRGlyZWN0aW9uKGRpcmVjdGlvbikgeyBcclxuICAgIHRoaXMucHVzaERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHN3aXRjaCggdGhpcy5wdXNoRGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSAtIHRoaXMucHVzaERpc3RhbmNlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgdGhpcy5wdXNoRGlzdGFuY2U7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgKyB0aGlzLnB1c2hEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSAtIHRoaXMucHVzaERpc3RhbmNlOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRDYW5SZXNwYXduKGJvb2wpeyB0aGlzLl9jYW5SZXNwYXduID0gYm9vbDsgfVxyXG4gIGNhblJlc3Bhd24oKSB7IHJldHVybiB0aGlzLl9jYW5SZXNwYXduOyB9XHJcbiAgXHJcbiAgc2V0TmFtZShuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHJcbiAgdXNlSGFuZGxlcihkaXJlY3Rpb24pIHtcclxuICAgIHRoaXMucHVzaChkaXJlY3Rpb24pO1xyXG4gIH1cclxuXHJcbiAgc3RvcE9iamVjdCgpIHtcclxuICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKHRydWUpO1xyXG4gICAgdGhpcy5zZXRQdXNoKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHB1c2goZGlyZWN0aW9uKSB7XHJcbiAgICB0aGlzLnNldFB1c2godHJ1ZSk7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZVB1c2hEaXJlY3Rpb24oIGRpcmVjdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgbW92ZVRvUHVzaERpcmVjdGlvbigpIHtcclxuICAgIHN3aXRjaCggdGhpcy5wdXNoRGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRQdXNoU3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRYKCkgPCB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgIC8vIFlcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRQdXNoU3BlZWQoKSApO1xyXG4gICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPCB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRQdXNoU3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnB1c2hEaXN0YW5jZVRyYXZlbGxlZCArPSB0aGlzLmdldFB1c2hTcGVlZCgpO1xyXG5cclxuICAgIC8vIENoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciwgZW5lbXkgYW5kIG9iamVjdHNcclxuICAgIHRoaXMuanVzdENoZWNrQ29sbGlzaW9uKCk7XHJcblxyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uKCkge1xyXG4gICAgbGV0IG9iaiA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2tBbGwodGhpcywgdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkpOyBcclxuICAgIGlmICggb2JqICYmIHRoaXMuaXNQdXNoaW5nKCkgKSB7XHJcbiAgICAgIHN3aXRjaChvYmoudHlwZSkge1xyXG4gICAgICAgIGNhc2UgJ3BsYXllcic6XHJcbiAgICAgICAgICBvYmouaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IHBsYXllclxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZW5lbXknOlxyXG4gICAgICAgICAgb2JqLmh1cnQodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBlbmVteVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGlmKCBvYmoub3ZlcmxhcFggKSB0aGlzLnVwZGF0ZVgoIG9iai5vdmVybGFwWCApO1xyXG4gICAgICAgICAgaWYoIG9iai5vdmVybGFwWSApIHRoaXMudXBkYXRlWSggb2JqLm92ZXJsYXBZICk7XHJcbiAgICAgICAgICB0aGlzLnN0b3BPYmplY3QoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gXHJcbiAgYmVmb3JlUmVuZGVyKCkge1xyXG4gICAgaWYoIHRoaXMuaXNQdXNoaW5nKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmdldFgoKSAhPSB0aGlzLnRhcmdldFggfHwgdGhpcy5nZXRZKCkgIT0gdGhpcy50YXJnZXRZICkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvUHVzaERpcmVjdGlvbigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RvcE9iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgICAgIFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NhbkJlUHVzaGVkOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgX0NhbkNvbGxlY3QgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhbkNvbGxlY3RQcm9wcy5jYW5SZXNwYXduO1xyXG4gIH1cclxuXHJcbiAgaXNDb2xsZWN0ZWQoKSB7IHJldHVybiB0aGlzLmNvbGxlY3RlZDsgfVxyXG4gIGNvbGxlY3QoKXsgdGhpcy5jb2xsZWN0ZWQgPSB0cnVlOyB9XHJcbiAgc2V0Q29sbGVjdChib29sKSB7IHRoaXMuY29sbGVjdCA9IGJvb2w7IH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5Db2xsZWN0OyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgX0Nhbkh1cnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyxjYW5IdXJ0UHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICB0aGlzLmh1cnRBbW91bnQgPSBjYW5IdXJ0UHJvcHMuYW1vdW50O1xyXG4gIH1cclxuICBcclxuICAvLyBJZiBpdCdzIG5vdCBjb2xsaWRpbmcgdG8gYW55IHRlbGVwb3J0IGNodW5rIGFueW1vcmUsIG1ha2UgaXQgcmVhZHkgdG8gdGVsZXBvcnQgYWdhaW5cclxuICBjb2xsaXNpb24ob2JqKXsgXHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiApIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7XHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJlbmVteVwiICkgb2JqLmh1cnQodGhpcy5odXJ0QW1vdW50KTtcclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG4gIGJlZm9yZVJlbmRlcihjdHgpIHtcclxuICAgIC8vIGRlYnVnIHBvc2l0aW9uXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICBsZXQgeCA9IE1hdGgucm91bmQodGhpcy5nZXRDb2xsaXNpb25YKCkpO1xyXG4gICAgICBsZXQgeSA9IE1hdGgucm91bmQodGhpcy5nZXRDb2xsaXNpb25ZKCkpO1xyXG4gICAgICBsZXQgdGV4dCA9IFwiWDogXCIgKyB4ICsgXCIgWTogXCIgKyB5O1xyXG4gICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcclxuICAgICAgY3R4LmZvbnQgPSBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gJyNGRkZGRkYnO1xyXG4gICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMuZ2V0WCgpIC0gMjAgLCB0aGlzLmdldFkoKSk7IFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0Nhbkh1cnQ7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBfQ2FuVGhyb3cgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuVGhyb3dQcm9wcywgZnJvbVNhdmVTdGF0ZSkge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBmcm9tU2F2ZVN0YXRlKTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5HcmFiID0gdHJ1ZTtcclxuICAgIHRoaXMuZ3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wcGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BwZWRTdGFnZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wWCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wWSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX2NhblJlc3Bhd24gPSBjYW5UaHJvd1Byb3BzLmNhblJlc3Bhd247XHJcbiAgICB0aGlzLmh1cnRBbW91bnQgPSBjYW5UaHJvd1Byb3BzLmh1cnRBbW91bnQ7XHJcblxyXG4gICAgdGhpcy51c2VFdmVudCA9IGNhblRocm93UHJvcHMudXNlRXZlbnQ7XHJcbiAgICBcclxuICAgIHRoaXMudGhyb3dEaXN0YW5jZSA9IGNhblRocm93UHJvcHMuY2h1bmNrc1Rocm93RGlzdGFuY2UgKiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgIHRoaXMudGhyb3dTcGVlZCA9IDAuODtcclxuICAgIHRoaXMudGhyb3dEaXN0YW5jZVRyYXZlbGxlZCA9IDA7XHJcbiAgICB0aGlzLnRocm93aW5nTW92ZW1lbnQgPSBmYWxzZTtcclxuICAgIHRoaXMudGhyb3dEaXJlY3Rpb24gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmRlc3Ryb3lPbkFuaW1hdGlvbkVuZCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnRhcmdldFggPSAwO1xyXG4gICAgdGhpcy50YXJnZXRZID0gMDtcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gKCB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuZnBzICogMiApOyAvLyAxMDAwIC8gRlBTXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgLy8gRGVzdHJveSBhbmltYXRpb24gcHJvcHNcclxuICAgIHRoaXMuZGVzdHJveWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5kZXN0cm95U3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA1MCk7XHJcbiAgICB0aGlzLmRlc3Ryb3lGcmFtZUNvdW50ID0gMTtcclxuICAgIHRoaXMuZGVzdHJveU1heEZyYW1lQ291bnQgPSA4O1xyXG4gICAgdGhpcy5kZXN0cm95SW5pdEZyYW1lID0gMztcclxuICB9XHJcblxyXG4gIGlzQ29sbGVjdGVkKCkgeyByZXR1cm4gdGhpcy5jb2xsZWN0ZWQ7IH1cclxuICBjb2xsZWN0KCl7IHRoaXMuY29sbGVjdGVkID0gdHJ1ZTsgfVxyXG4gIHNldENvbGxlY3QoYm9vbCkgeyB0aGlzLmNvbGxlY3RlZCA9IGJvb2w7IH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgRmlyZSBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICBpc0Rlc3Ryb3lpbmcoKSB7IHJldHVybiB0aGlzLmRlc3Ryb3lpbmc7IH1cclxuICBzZXREZXN0cm95aW5nKGJvb2wpIHsgdGhpcy5kZXN0cm95aW5nID0gYm9vbDsgfVxyXG4gIFxyXG4gIHNldERlc3Ryb3lPbkFuaW1hdGlvbkVuZChib29sKSB7IHRoaXMuZGVzdHJveU9uQW5pbWF0aW9uRW5kID0gYm9vbDsgfVxyXG5cclxuICBpc0dyYWJiZWQoKSB7IHJldHVybiB0aGlzLmdyYWJiZWQ7IH1cclxuICBncmFiKCl7IFxyXG4gICAgdGhpcy5ncmFiYmVkID0gdHJ1ZTtcclxuICAgIHRoaXMuZHJvcHBlZCA9IGZhbHNlOyBcclxuICB9XHJcbiAgc2V0R3JhYihib29sKSB7IFxyXG4gICAgdGhpcy5ncmFiYmVkID0gYm9vbDsgXHJcbiAgICB0aGlzLmRyb3BwZWQgPSAhYm9vbDtcclxuICB9XHJcbiAgc2V0UGxheWVyV2hvR3JhYmJlZChwbGF5ZXJOdW1iZXIpIHsgdGhpcy5wbGF5ZXJXaG9HcmFiYmVkID0gcGxheWVyTnVtYmVyOyB9XHJcblxyXG4gIGlzVGhyb3dpbmcoKSB7IHJldHVybiB0aGlzLnRocm93aW5nTW92ZW1lbnQ7IH1cclxuICBzZXRUaHJvd2luZyhib29sKSB7IHRoaXMudGhyb3dpbmdNb3ZlbWVudCA9IGJvb2w7IH1cclxuICBnZXRUaHJvd1NwZWVkKCkgeyByZXR1cm4gIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogdGhpcy50aHJvd1NwZWVkOyB9XHJcbiAgY2FsY3VsYXRlVGhyb3dEaXJlY3Rpb24oZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQpIHsgXHJcbiAgICB0aGlzLnRocm93RGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgc3dpdGNoKCB0aGlzLnRocm93RGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSAtIHRoaXMudGhyb3dEaXN0YW5jZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHRoaXMudGhyb3dEaXN0YW5jZSArIHRoaXMuZ2V0SGVpZ2h0KCkgKiAyOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpICsgdGhpcy50aHJvd0Rpc3RhbmNlOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyBwbGF5ZXJIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpIC0gdGhpcy50aHJvd0Rpc3RhbmNlOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyBwbGF5ZXJIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNhbGN1bGF0ZURyb3BEaXJlY3Rpb24oZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQpIHsgXHJcbiAgICB0aGlzLnRocm93RGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgc3dpdGNoKCB0aGlzLnRocm93RGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSAtIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKyB0aGlzLmdldEhlaWdodCgpICogMjsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyBwbGF5ZXJIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpIC0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuX2NhblJlc3Bhd24gPSBib29sOyB9XHJcbiAgY2FuUmVzcGF3bigpIHsgcmV0dXJuIHRoaXMuX2NhblJlc3Bhd247IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxuICBncmFiSGFuZGxlciggcGxheWVyTnVtYmVyICkge1xyXG4gICAgdGhpcy5wbGF5ZXJXaG9HcmFiYmVkID0gcGxheWVyTnVtYmVyO1xyXG4gICAgdGhpcy5zZXRHcmFiKHRydWUpO1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpOyAvLyBhdm9pZCBwbGF5ZXJzIHB1c2hpbmcgb3RoZXIgcGxheWVycyB3aXRoIGl0ZW1zXHJcbiAgfVxyXG5cclxuICBicmVha09iamVjdCgpIHtcclxuXHJcbiAgICB0aGlzLnNldFRocm93aW5nKGZhbHNlKTtcclxuICAgIHRoaXMuc2V0R3JhYihmYWxzZSk7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLmRlc3Ryb3lPbkFuaW1hdGlvbkVuZCApIHtcclxuICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICB0aGlzLnNldERlc3Ryb3lpbmcodHJ1ZSk7IC8vIFN0YXJ0IGRlc3Ryb3kgYW5pbWF0aW9uXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbih0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBpc0Ryb3BwZWQoKSB7IHJldHVybiB0aGlzLmRyb3BwZWQ7IH1cclxuICBkcm9wKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZURyb3BEaXJlY3Rpb24oIGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0ICk7XHJcbiAgICB0aGlzLnNldERlc3Ryb3lPbkFuaW1hdGlvbkVuZChmYWxzZSk7XHJcbiAgICB0aGlzLnNldFRocm93aW5nKHRydWUpO1xyXG4gICAgdGhpcy5zZXRHcmFiKGZhbHNlKTtcclxuICAgIHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wWCA9IHRoaXMudGFyZ2V0WDtcclxuICAgIHRoaXMuZHJvcFkgPSB0aGlzLnRhcmdldFk7XHJcbiAgfVxyXG5cclxuICB0aHJvdyhkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKSB7XHJcbiAgICBwbGF5ZXIuc2V0Tm90R3JhYmJpbmcoKTtcclxuICAgIHRoaXMuY2FsY3VsYXRlVGhyb3dEaXJlY3Rpb24oIGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0ICk7XHJcbiAgICB0aGlzLnNldERlc3Ryb3lPbkFuaW1hdGlvbkVuZCh0cnVlKTtcclxuICAgIHRoaXMuc2V0VGhyb3dpbmcodHJ1ZSk7XHJcbiAgfVxyXG5cclxuICB1c2UoZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQsIHBsYXllcikge1xyXG4gICAgc3dpdGNoKCB0aGlzLnVzZUV2ZW50ICkge1xyXG4gICAgICBjYXNlICd0aHJvdyc6XHJcbiAgICAgICAgdGhpcy50aHJvdyhkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG1vdmVUb1Rocm93RGlyZWN0aW9uKCkge1xyXG4gICAgc3dpdGNoKCB0aGlzLnRocm93RGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSAvIDMgKTsgLy8gU2xvdyB0aGUgbW92ZW1lbnRcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG5cclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgIGlmICh0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgLy8gWVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG4gICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgLyAzICk7XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPCB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuICAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgIGlmICh0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgIGlmICh0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2VUcmF2ZWxsZWQgKz0gdGhpcy5nZXRUaHJvd1NwZWVkKCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyIGFuZCBlbmVteSBvbmx5XHJcbiAgICB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbigpO1xyXG5cclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbigpIHtcclxuICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpKTsgXHJcbiAgICBpZiAoIG9iaiAgJiYgdGhpcy5pc1Rocm93aW5nKCkgKSB7XHJcbiAgICAgIGlmKCBvYmoudHlwZSA9PSBcInBsYXllclwiICkge1xyXG4gICAgICAgIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5icmVha09iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKCBvYmoudHlwZSA9PSBcImVuZW15XCIgKSB7IFxyXG4gICAgICAgIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgZW5lbXlcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiBcclxuICBiZWZvcmVSZW5kZXIoY3R4KSB7XHJcbiAgICBcclxuICAgIC8vIE1vdmVtZW50IHdoaWxlIHRocm93aW5nXHJcbiAgICBpZiggdGhpcy5pc1Rocm93aW5nKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmdldFgoKSAhPSB0aGlzLnRhcmdldFggfHwgdGhpcy5nZXRZKCkgIT0gdGhpcy50YXJnZXRZICkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvVGhyb3dEaXJlY3Rpb24oKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgICAgXHJcblxyXG4gICAgLy8gRGVzdHJveSBhbmltYXRpb25cclxuICAgIGlmKCB0aGlzLmlzRGVzdHJveWluZygpICkge1xyXG4gICAgICBpZiggdGhpcy5kZXN0cm95RnJhbWVDb3VudCA8IHRoaXMuZGVzdHJveU1heEZyYW1lQ291bnQgICkge1xyXG4gICAgICAgIGlmKCB0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpICkge1xyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuZGVzdHJveVNwcml0ZS5nZXRTcHJpdGVQcm9wcyggdGhpcy5kZXN0cm95SW5pdEZyYW1lICk7XHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lJbml0RnJhbWUrKztcclxuICAgICAgICAgIHRoaXMuZGVzdHJveUZyYW1lQ291bnQrKztcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmRyb3BwZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5UaHJvdzsiLCJjbGFzcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgZnJvbVNhdmVTdGF0ZSkge1xyXG4gICAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHBvc2l0aW9uLng7XHJcbiAgICB0aGlzLnkgPSBwb3NpdGlvbi55O1xyXG5cclxuICAgIHRoaXMueDAgPSBwb3NpdGlvbi54O1xyXG4gICAgdGhpcy55MCA9IHBvc2l0aW9uLnk7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLndpZHRoID0gZGltZW5zaW9uLndpZHRoOyAvL3B4XHJcbiAgICB0aGlzLmhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQ7XHJcblxyXG4gICAgLy8gIyBDb2xsaXNpb25cclxuICAgIHRoaXMuY29sbGlzaW9uV2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgIHRoaXMuY29sbGlzaW9uWCA9IHRoaXMueDtcclxuICAgIHRoaXMuY29sbGlzaW9uWSA9IHRoaXMueTtcclxuXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIC8vICMgRXZlbnRzXHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGV2ZW50cy5zdG9wT25Db2xsaXNpb247XHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZXZlbnRzLmhhc0NvbGxpc2lvbkV2ZW50O1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG5cclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZSA9IHNwcml0ZS5zdGFnZVNwcml0ZTtcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgdGhpcy5uYW1lID0gcHJvcHMuc3RhZ2UgKyBcIl9cIiArIHByb3BzLm5hbWUucmVwbGFjZSgvXFxzL2csJycpICsgXCJfXCIgKyB0aGlzLnggKyBcInhcIiArIHRoaXMueTtcclxuICAgIHRoaXMubmFtZSA9IHRoaXMubmFtZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdGhpcy5vcmlnaW5hbE5hbWUgPSBwcm9wcy5uYW1lO1xyXG4gICAgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm5lZWRTYXZlU3RhdGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmZyb21TYXZlZFN0YXRlID0gKCBmcm9tU2F2ZVN0YXRlKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnR5cGUgPSBwcm9wcy50eXBlO1xyXG4gICAgdGhpcy5jb2RlID0gJyc7XHJcbiAgICB0aGlzLmNsYXNzID0gcHJvcHMuY2xhc3M7XHJcbiAgICB0aGlzLm9yaWdpbmFsU3RhZ2UgPSBwcm9wcy5zdGFnZTtcclxuXHJcbiAgICB0aGlzLnJ1biggcHJvcHMudHlwZSApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBDb2RlXHJcbiAgc2V0Q29kZShjb2RlKSB7IHRoaXMuY29kZSA9IGNvZGU7IH1cclxuICBnZXRDb2RlKCl7IHJldHVybiB0aGlzLmNvZGU7IH1cclxuXHJcbiAgLy8gIyBTZXRzXHJcblxyXG4gIHVwZGF0ZVgoeCkge1xyXG4gICAgdGhpcy5zZXRYKHgpO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKHgpO1xyXG4gIH1cclxuICB1cGRhdGVZKHkpIHtcclxuICAgIHRoaXMuc2V0WSh5KTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh5KTtcclxuICB9XHJcbiAgICBcclxuICBzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG4gIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICBcclxuICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIHNldENvbGxpc2lvbkhlaWdodChoZWlnaHQpIHsgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRDb2xsaXNpb25XaWR0aCh3aWR0aCkgeyB0aGlzLmNvbGxpc2lvbldpZHRoID0gd2lkdGg7IH1cclxuXHJcbiAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICBzZXRDb2xsaXNpb25ZKHkpIHsgdGhpcy5jb2xsaXNpb25ZID0geTsgfVxyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAvLyAhIE11c3QgaGF2ZSBpbiBjaGlsZHMgQ2xhc3NcclxuICB9XHJcblxyXG4gIHNldFN0b3BPbkNvbGxpc2lvbihib29sKXtcclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gYm9vbDtcclxuICB9XHJcblxyXG4gIC8vICMgVmlzaWJpbGl0eVxyXG4gIGhpZGUoKSB7IFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgXHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGZhbHNlO1xyXG4gIH1cclxuICBzaG93KCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG5cclxuICAvLyAjICBTdGF0ZVxyXG4gIHdpbGxOZWVkU2F2ZVN0YXRlKCkgeyAgcmV0dXJuIHRoaXMubmVlZFNhdmVTdGF0ZTsgfVxyXG4gIHNldE5lZWRTYXZlU3RhdGUoYm9vbCl7IHRoaXMubmVlZFNhdmVTdGF0ZSA9IGJvb2w7IH1cclxuXHRcdFx0XHJcblx0Ly8gIyBHZXRzXHJcbiAgXHJcbiAgZ2V0TmFtZSgpIHsgcmV0dXJuIHRoaXMubmFtZTsgfVxyXG5cclxuICBnZXRUeXBlKCkgeyByZXR1cm4gdGhpcy50eXBlOyB9XHJcbiAgXHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25XaWR0aDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25YKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWSgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgbGV0IHggPSAoIF94ICkgPyBfeCA6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICB9XHJcbiAgZ2V0Q2VudGVyWSggX3kgKSB7IFxyXG4gICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgfVxyXG5cclxuICAvLyBIb29rIHRvIHJ1biBiZWZvcmUgcmVuZGVyXHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkgeyAgIH1cclxuXHRcdFxyXG5cdC8vICMgUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgXHJcbiAgICB0aGlzLmJlZm9yZVJlbmRlcihjdHgpO1xyXG5cclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBsZXQgc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZVByb3BzO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCkgKSB7IC8vIE9ubHkgcmVuZGVyIHRleHR1cmUgaWYgaXQgd2FzIHNldCBiZWZvcmVcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgICBcclxuICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuXHJcbiAgICAgIGxldCBjb2xsaXNpb25fcHJvcHMgPSB7XHJcbiAgICAgICAgdzogdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCksXHJcbiAgICAgICAgeDogdGhpcy5nZXRDb2xsaXNpb25YKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRDb2xsaXNpb25ZKClcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3RvcE9uQ29sbGlzaW9uID8gXCJyZ2JhKDI1NSwwLDAsMC4yKVwiIDogXCJyZ2JhKDAsMjU1LDAsMC4yKVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QoY29sbGlzaW9uX3Byb3BzLngsIGNvbGxpc2lvbl9wcm9wcy55LCBjb2xsaXNpb25fcHJvcHMudywgY29sbGlzaW9uX3Byb3BzLmgpO1xyXG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yKVwiO1xyXG4gICAgICBjdHgubGluZVdpZHRoICAgPSA1O1xyXG4gICAgICBjdHguc3Ryb2tlUmVjdChjb2xsaXNpb25fcHJvcHMueCwgY29sbGlzaW9uX3Byb3BzLnksIGNvbGxpc2lvbl9wcm9wcy53LCBjb2xsaXNpb25fcHJvcHMuaCk7XHJcblxyXG4gICAgfVxyXG4gIFxyXG4gIH1cclxuICAgIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gTm8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgbm9Db2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gUnVucyB3aGVuIENsYXNzIHN0YXJ0cyAgXHJcbiAgcnVuKCB0eXBlICkge1xyXG4gICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NvbGxpZGFibGU7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfRGlhbG9nVHJpZ2dlciBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBkaWFsb2dUcmlnZ2VyUHJvcHMpIHtcclxuXHRcdHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgZGlhbG9nVHJpZ2dlclByb3BzLmZyb21TYXZlU3RhdGUpO1xyXG5cdFx0dGhpcy5jYW5Vc2UgPSB0cnVlO1xyXG5cdH1cclxuXHRcclxuXHRzZXREaWFsb2coZGlhbG9nKSB7IHRoaXMuZGlhbG9nID0gZGlhbG9nOyB9XHJcblx0Z2V0RGlhbG9nKCkgeyByZXR1cm4gdGhpcy5kaWFsb2c7IH1cclxuXHJcblx0dXNlSGFuZGxlcigpIHsgd2luZG93LmdhbWUuc2V0RGlhbG9nKHRoaXMuZGlhbG9nKTsgfVxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblx0XHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9EaWFsb2dUcmlnZ2VyOyIsImNsYXNzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzY2VuYXJpb19pZCwgc291bmRTcmMpe1xyXG4gICAgdGhpcy5jdHggPSBjdHg7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFggPSAwOyBcclxuICAgIHRoaXMucGxheWVyU3RhcnRZID0gMDsgXHJcblxyXG4gICAgdGhpcy5zdGFnZSA9IG51bGw7XHJcbiAgICB0aGlzLnN0YWdlSWQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIHRoaXMuc2NlbmFyaW9faWQgPSBzY2VuYXJpb19pZDtcclxuICAgIFxyXG4gICAgdGhpcy5zb3VuZCA9IG51bGw7XHJcbiAgICB0aGlzLnNvdW5kU3JjID0gc291bmRTcmM7XHJcblxyXG4gICAgdGhpcy5pbml0U291bmQoKTtcclxuICB9XHJcblxyXG4gIGluaXRTb3VuZCgpIHtcclxuICAgIHRoaXMuc291bmQgPSBuZXcgSG93bCh7XHJcbiAgICAgIHNyYzogW3RoaXMuc291bmRTcmNdXHJcbiAgICB9KTtcclxuICAgIHRoaXMuc291bmQucGxheSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBBZGQgSXRlbXMgdG8gdGhlIHJlbmRlclxyXG4gIGFkZFN0YXRpY0l0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fdG9wKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AucHVzaChpdGVtKTtcclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbSA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG4gIC8vICMgUGxheWVyc1xyXG4gIGFkZFBsYXllcihwbGF5ZXIpIHtcclxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XHJcbiAgfVxyXG4gIGdldFBsYXllcnMoKSB7IHJldHVybiB0aGlzLnBsYXllcnM7IH1cclxuXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0Q3R4KCkgeyByZXR1cm4gdGhpcy5jdHg7IH1cclxuICBnZXRDYW52YXMoKSB7IHJldHVybiB0aGlzLmNhbnZhczsgfVx0XHJcblxyXG4gIGdldElkKCkgeyByZXR1cm4gdGhpcy5zY2VuYXJpb19pZDsgfVxyXG4gIGdldEFjdHVhbFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICAgICAgICAgICAgICBcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b207IH1cclxuICBnZXRMYXllckl0ZW1zX190b3AoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcDsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0QWN0dWFsU3RhZ2VJZChpZCl7IFxyXG4gICAgdGhpcy5zdGFnZUlkID0gaWQ7IFxyXG4gICAgd2luZG93LmdhbWUuc2V0Q3VycmVudFN0YWdlKCBpZCApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTYXZlIHRoZSBTdGF0ZSBvZiBpdGVtc1xyXG4gIHNhdmVJdGVtc1N0YXRlKCkge1xyXG4gICAgLy8gQm90dG9tIExheWVyXHJcbiAgICBsZXQgaXRlbXMgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uZ2V0Q29sSXRlbnMoKTtcclxuICAgIGZvciAobGV0IGkgaW4gaXRlbXMpIHtcclxuICAgICAgdGhpcy5oYW5kbGVJdGVtSWZOZWVkU2F2ZShpdGVtc1tpXSk7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuZ2FtZS5zYXZlSXRlbXNTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlSXRlbUlmTmVlZFNhdmUoaXRlbSkge1xyXG4gICAgaWYoIGl0ZW0ud2lsbE5lZWRTYXZlU3RhdGUoKSApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIEdyYWJiZWRcclxuICAgICAgbGV0IGdyYWJiZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IGdyYWJQcm9wcyA9IHt9O1xyXG4gICAgICBpZiggaXRlbS5jYW5HcmFiICkge1xyXG4gICAgICAgIGdyYWJiZWQgPSBpdGVtLmlzR3JhYmJlZCgpO1xyXG4gICAgICAgIGlmKCBncmFiYmVkICkge1xyXG4gICAgICAgICAgZ3JhYlByb3BzID0ge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiBpdGVtLmNsYXNzLFxyXG4gICAgICAgICAgICAnY29kZSc6IGl0ZW0uY29kZSxcclxuICAgICAgICAgICAgJ3gwJzogaXRlbS54MCxcclxuICAgICAgICAgICAgJ3kwJzogaXRlbS55MCxcclxuICAgICAgICAgICAgJ25hbWUnOiBpdGVtLm9yaWdpbmFsTmFtZSxcclxuICAgICAgICAgICAgJ3N0YWdlJzogaXRlbS5vcmlnaW5hbFN0YWdlLFxyXG4gICAgICAgICAgICAncGxheWVyV2hvR3JhYmJlZCc6IGl0ZW0ucGxheWVyV2hvR3JhYmJlZFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgRHJvcHBlZFxyXG4gICAgICBsZXQgZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgICBsZXQgZHJvcFByb3BzID0ge307XHJcbiAgICAgIGlmKCBpdGVtLmNhbkdyYWIgKSB7XHJcbiAgICAgICAgZHJvcHBlZCA9IGl0ZW0uaXNEcm9wcGVkKCk7XHJcbiAgICAgICAgaWYoIGRyb3BwZWQgKSB7XHJcbiAgICAgICAgICBkcm9wUHJvcHMgPSB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6IGl0ZW0uY2xhc3MsXHJcbiAgICAgICAgICAgICdjb2RlJzogaXRlbS5jb2RlLFxyXG4gICAgICAgICAgICAneDAnOiBpdGVtLngwLFxyXG4gICAgICAgICAgICAneTAnOiBpdGVtLnkwLFxyXG4gICAgICAgICAgICAnZHJvcFgnOiBpdGVtLmRyb3BYLFxyXG4gICAgICAgICAgICAnZHJvcFknOiBpdGVtLmRyb3BZLFxyXG4gICAgICAgICAgICAnbmFtZSc6IGl0ZW0ub3JpZ2luYWxOYW1lLFxyXG4gICAgICAgICAgICAnc3RhZ2UnOiBpdGVtLm9yaWdpbmFsU3RhZ2UsXHJcbiAgICAgICAgICAgICdkcm9wcGVkU3RhZ2UnOiAoaXRlbS5kcm9wcGVkU3RhZ2UpID8gaXRlbS5kcm9wcGVkU3RhZ2UgOiB0aGlzLmdldEFjdHVhbFN0YWdlSWQoKSAvLyBJZiBkb24ndCBoYXZlIGRyb3BwZWQgc3RhZ2UsIG1lYW5zIHdlIHdhbnQgdGhlIGFjdHVhbCBzdGFnZS4gIElmIGhhcywga2VlcCBpdFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2luZG93LmdhbWUuYWRkSXRlbVN0YXRlKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICduYW1lX2lkJzogaXRlbS5nZXROYW1lKCksXHJcbiAgICAgICAgICAnY29sbGVjdGVkJzogaXRlbS5pc0NvbGxlY3RlZCgpLFxyXG4gICAgICAgICAgJ2dyYWJiZWQnOiBncmFiYmVkLFxyXG4gICAgICAgICAgJ2dyYWJQcm9wcyc6IGdyYWJQcm9wcyxcclxuICAgICAgICAgICdkcm9wcGVkJzogZHJvcHBlZCxcclxuICAgICAgICAgICdkcm9wUHJvcHMnOiBkcm9wUHJvcHNcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGdW5jdGlvbnMgdG8gbG9hZCBzZWxlY3RlZCBzdGFnZVxyXG4gIGxvYWRTdGFnZShzdGFnZSwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YWdlID0gc3RhZ2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG4gICAgdGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzOyAvLyBQYXNzIHRoaXMgc2NlbmFyaW8gY2xhc3MgYXMgYW4gYXJndW1lbnQsIHNvIG90aGVyIGZ1bmN0aW9ucyBjYW4gcmVmZXIgdG8gdGhpc1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0oaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIEFuaW1hdGVkIEl0ZW1zIC0gQm90dG9tXHJcbiAgICB0aGlzLnN0YWdlLmdldExheWVySXRlbXNfX2JvdHRvbSgpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuc3RhZ2UuZ2V0TGF5ZXJJdGVtc19fdG9wKCkubWFwKCAoaXRlbSkgPT4geyBcclxuICAgICAgaXRlbS5zY2VuYXJpbyA9IHRoaXM7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBwbGF5ZXIgaGFzIHNvbWV0aGluZyBncmFiYmVkIGFuZCBpbmNsdWRlIGluIHJlbmRlclxyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSAhPSBcInt9XCIgKSB7XHJcbiAgICAgIHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2Uoc2F2ZWRJdGVtc1N0YXRlKTtcclxuICAgICAgZm9yKCBsZXQgaSBpbiBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSBzYXZlZEl0ZW1zU3RhdGVbaV07XHJcbiAgICAgICAgLy8gSW5jbHVkZSBncmFiYmVkIGl0ZW1cclxuICAgICAgICBpZiggaXRlbS5ncmFiYmVkICkge1xyXG4gICAgICAgICAgbGV0IG9iaiA9IHdpbmRvdy5nYW1lLmdsb2JhbEFzc2V0cy5nZXRBc3NldCggaXRlbS5ncmFiUHJvcHMuY2xhc3MsIGl0ZW0uZ3JhYlByb3BzLCB0cnVlICk7IC8vIHRydWUgPSBjYW1lIGZyb20gc2F2ZSBzdGF0ZVxyXG4gICAgICAgICAgb2JqLmdyYWJIYW5kbGVyKCBpdGVtLmdyYWJQcm9wcy5wbGF5ZXJXaG9HcmFiYmVkICk7IC8vIHN0YXJ0IGEgc2V0dXAgb24gdGhlIG9iamVjdCwgc28gdGhlIHBsYXllciB3aWxsIGNoZWNrIHRoZSBzYXZlZCBzdGF0ZSBvZiBpdGVtXHJcbiAgICAgICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEluY2x1ZGUgZHJvcHBlZCBpdGVtXHJcbiAgICAgICAgaWYoIGl0ZW0uZHJvcHBlZCApIHtcclxuICAgICAgICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoIGl0ZW0uZHJvcFByb3BzLmNsYXNzLCB7IGNvZGU6IGl0ZW0uZHJvcFByb3BzLmNvZGUsIHgwOiBpdGVtLmRyb3BQcm9wcy54MCwgeTA6IGl0ZW0uZHJvcFByb3BzLnkwLCBzdGFnZTogaXRlbS5kcm9wUHJvcHMuc3RhZ2UgfSwgdHJ1ZSApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiggdGhpcy5zdGFnZS5nZXRTdGFnZUlkKCkgIT0gaXRlbS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlICkge1xyXG4gICAgICAgICAgICBvYmouaGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG9iai5kcm9wcGVkU3RhZ2UgPSBpdGVtLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgICBvYmouZHJvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgICBvYmoudXBkYXRlWCggaXRlbS5kcm9wUHJvcHMuZHJvcFggKTtcclxuICAgICAgICAgIG9iai51cGRhdGVZKCBpdGVtLmRyb3BQcm9wcy5kcm9wWSApO1xyXG4gICAgICAgICAgb2JqLmRyb3BYID0gaXRlbS5kcm9wUHJvcHMuZHJvcFg7XHJcbiAgICAgICAgICBvYmouZHJvcFkgPSBpdGVtLmRyb3BQcm9wcy5kcm9wWTtcclxuICAgICAgICAgIG9iai54MCA9IGl0ZW0uZHJvcFByb3BzLngwO1xyXG4gICAgICAgICAgb2JqLnkwID0gaXRlbS5kcm9wUHJvcHMueTA7XHJcblxyXG4gICAgICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPbmx5IHNldCBwbGF5ZXIgc3RhcnQgYXQgZmlyc3QgbG9hZFxyXG4gICAgaWYoZmlyc3RTdGFnZSkge1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WCgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXIxU3RhcnRZKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMlN0YXJ0WSgpICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TY2VuYXJpbzsiLCJjbGFzcyBfU3RhZ2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihzdGFnZUlkLCBzb3VuZFNyYykge1xyXG4gICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5jaHVua1NpemUgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuXHJcbiAgICB0aGlzLnBsYXllcjFTdGFydFggPSAwO1xyXG4gICAgdGhpcy5wbGF5ZXIxU3RhcnRZID0gMDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXIyU3RhcnRYID0gMDtcclxuICAgIHRoaXMucGxheWVyMlN0YXJ0WSA9IDA7XHJcblxyXG4gICAgdGhpcy5zdGFnZUlkID0gc3RhZ2VJZDtcclxuXHJcbiAgICB0aGlzLnNvdW5kID0gZmFsc2U7XHJcbiAgICB0aGlzLnNvdW5kU3JjID0gc291bmRTcmM7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXNfX2JvdHRvbSgpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fdG9wKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3A7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcblxyXG4gIGdldFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuICBcclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20ucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcC5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuICBcclxuICBydW4gKCkgeyAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TdGFnZTsiLCIvLyBDbGFzcyB0aGF0IGRldGVjdHMgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyIGFuZCBvdGhlciBvYmplY3RzXHJcbmNsYXNzIENvbGxpc2lvbiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHNjZW5hcmlvV2lkdGgsIHNjZW5hcmlvSGVpZ2h0LCBwbGF5ZXIpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTsgLy8gSXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG4gICAgdGhpcy5zY2VuYXJpb1dpZHRoID0gc2NlbmFyaW9XaWR0aDtcclxuICAgIHRoaXMuc2NlbmFyaW9IZWlnaHQgPSBzY2VuYXJpb0hlaWdodDtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29sSXRlbnMoKSB7IHJldHVybiB0aGlzLmNvbEl0ZW5zOyB9XHJcblx0XHRcdFxyXG4gIC8vICMgQ2hlY2sgaWYgdGhlIG9iamVjdCBjb2xsaWRlcyB3aXRoIGFueSBvYmplY3QgaW4gdmVjdG9yXHJcbiAgLy8gQWxnb3JpdGhtIHJlZmVyZW5jZTogR3VzdGF2byBTaWx2ZWlyYSAtIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9czdxaVdMQkJwSndcclxuICBjaGVjayhvYmplY3QpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjEgPSBvYmplY3Q7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIHRoaXMuY2hlY2tDb2xsaXNpb24ocjEsIHIyKTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICAvLyBAcjE6IHRoZSBtb3Zpbmcgb2JqZWN0XHJcbiAgLy8gQHIyOiB0aGUgXCJ3YWxsXCJcclxuICBjaGVja0NvbGxpc2lvbihyMSwgcjIpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9IHIxLmdldENlbnRlclgoKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggcjEuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgXHJcbiAgICAgIHZhciBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICB2YXIgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZiggcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7XHJcbiAgICAgICAgaWYob3ZlcmxhcFggPj0gb3ZlcmxhcFkgKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWSggcjEuZ2V0Q29sbGlzaW9uWSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblkoIHIxLmdldENvbGxpc2lvblkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblgoIHIxLmdldENvbGxpc2lvblgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25YKCByMS5nZXRDb2xsaXNpb25YKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1Z0NvbGxpc2lvbiApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGJldHdlZW4nLCByMS5uYW1lICsgXCIoXCIgKyByMS5nZXRYKCkgKyBcIi9cIiArIHIxLmdldFkoKSArIFwiKVwiLCByMi5uYW1lKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJpZ2dlcnMgQ29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLmNvbGxpc2lvbihyMiwgcjEpO1xyXG4gICAgICByMi5jb2xsaXNpb24ocjEsIHIyKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmlnZ2VycyBub3QgaW4gY29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLm5vQ29sbGlzaW9uKHIyLCByMik7IFxyXG4gICAgICByMi5ub0NvbGxpc2lvbihyMSwgcjIpOyBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvLyBKdXN0IGNoZWNrIGZvciBhIHNwZWNpZmljIGNvbGxpc2lvbiBhbmQgcmV0dXJuIHRoZSBmaXJ0IG9iamVjdCBjb2xsaWRlZFxyXG4gIGp1c3RDaGVjayhyMSwgX3gsIF95LCBfdywgX2gpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICBsZXQgciA9IHRoaXMuanVzdENoZWNrQ29sbGlzaW9uKHIxLCByMiwgX3gsIF95LCBfdywgX2gpO1xyXG4gICAgICBpZiggciApIHJldHVybiByOyAvLyBpZiBoYXMgc29tZXRoaW5nLCByZXR1cm4gYW5kIHN0b3AgbG9vcFxyXG4gICAgfSBcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbihyMSwgcjIsIF94LCBfeSwgX3csIF9oKSB7XHJcblxyXG4gICAgLy8gRG9uJ3QgY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gc2FtZSBvYmplY3RcclxuICAgIGlmKCByMS5uYW1lID09IHIyLm5hbWUgKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gKCBfeCArIF93IC8gMiApIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSAoIF95ICsgX2ggLyAyICkgLSByMi5nZXRDZW50ZXJZKCk7XHJcbiBcclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIF93IC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIF9oIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIHJldHVybiByMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgIFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIEp1c3QgY2hlY2sgZm9yIGEgc3BlY2lmaWMgY29sbGlzaW9uIGFuZCByZXR1cm4gdGhlIGZpcnQgb2JqZWN0IGNvbGxpZGVkXHJcbiAganVzdENoZWNrQWxsKHIxLCBfeCwgX3ksIF93LCBfaCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIGxldCByID0gdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb25BbGwocjEsIHIyLCBfeCwgX3ksIF93LCBfaCk7XHJcbiAgICAgIGlmKCByICkgcmV0dXJuIHI7IC8vIGlmIGhhcyBzb21ldGhpbmcsIHJldHVybiBhbmQgc3RvcCBsb29wXHJcbiAgICB9IFxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uQWxsKHIxLCByMiwgX3gsIF95LCBfdywgX2gpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9ICggX3ggKyBfdyAvIDIgKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gKCBfeSArIF9oIC8gMiApIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG4gXHJcbiAgICB2YXIgc3VtSGFsZldpZHRoID0gKCBfdyAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCBfaCAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgLy9jYWxjdWxhdGUgb3ZlcmxhcCBpZiBuZWVkIHRvIHN0b3Agb2JqZWN0XHJcbiAgICAgIGxldCBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICBsZXQgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZihvdmVybGFwWCA+PSBvdmVybGFwWSApeyAvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gVXAvRG93blxyXG4gICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgIHIyLm92ZXJsYXBZID0gcjEuZ2V0WSgpICsgb3ZlcmxhcFk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHIyLm92ZXJsYXBZID0gcjEuZ2V0WSgpIC0gb3ZlcmxhcFk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Ugey8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBMZWZ0L1JpZ2h0XHJcbiAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICByMi5vdmVybGFwWCA9IHIxLmdldFgoKSArIG92ZXJsYXBYO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByMi5vdmVybGFwWCA9IHIxLmdldFgoKSAtIG92ZXJsYXBYO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHIyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlOyAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuICBcdFx0XHJcblx0Ly8gQWRkIGl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuXHRhZGRJdGVtKG9iamVjdCkge1xyXG5cdFx0dGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdCk7XHJcbiAgfTtcclxuICBcclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsZWFyQXJyYXlJdGVtcygpIHtcclxuICAgIHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG59Ly8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uO1xyXG5cdCIsImNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vLi4vZ2FtZVByb3BlcnRpZXMnKTtcclxuY29uc3Qgc2NlbmFyaW9Qcm90b3R5cGUgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlJyk7XHJcbmNvbnN0IHNjZW5hcmlvU2FuZGJveCA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3NjZW5hcmlvU2FuZGJveCcpO1xyXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvUGxheWVyJyk7XHJcbmNvbnN0IENvbGxpc2lvbiA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uJyk7XHJcbmNvbnN0IFJlbmRlciA9IHJlcXVpcmUoJy4vUmVuZGVyJyk7XHJcbmNvbnN0IFVJID0gcmVxdWlyZSgnLi4vdWkvVUknKTtcclxuY29uc3QgR2xvYmFsQXNzZXRzID0gcmVxdWlyZSgnLi4vYXNzZXRzL0dsb2JhbEFzc2V0cycpO1xyXG5cclxuY2xhc3MgR2FtZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIEZQUyBDb250cm9sXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gbnVsbDsgXHJcbiAgICB0aGlzLm5vdyA9IG51bGw7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG51bGw7IFxyXG4gICAgdGhpcy5lbGFwc2VkID0gbnVsbDtcclxuXHJcbiAgICAvLyBFdmVudHNcclxuICAgIHRoaXMua2V5c0Rvd24gPSB7fTtcclxuICAgIHRoaXMua2V5c1ByZXNzID0ge307XHJcblxyXG4gICAgLy8gUGF1c2VcclxuICAgIHRoaXMuX3BhdXNlID0gZmFsc2U7XHJcbiAgICB0aGlzLmdhbWVJc0xvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEl0ZW1zXHJcbiAgICB0aGlzLml0ZW1zU3RhdGUgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgLy8gR2FtZVxyXG4gICAgdGhpcy5nYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgdGhpcy5kZWZhdWx0U2NlbmFyaW8gPSAnc2FuZGJveCc7XHJcbiAgICB0aGlzLnNjZW5hcmlvID0gbnVsbDtcclxuICAgIHRoaXMuVUkgPSBudWxsO1xyXG4gICAgdGhpcy5jdXJyZW50U3RhZ2VOYW1lID0gJyc7XHJcblxyXG4gICAgdGhpcy5nYW1lUmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm11bHRpcGxheWVyID0gZmFsc2U7XHJcblxyXG4gICAgLy8gUmVuZGVyc1xyXG4gICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBudWxsO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllcnMgPSBudWxsO1xyXG4gICAgdGhpcy5yZW5kZXJVSSAgICAgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZ2xvYmFsQXNzZXRzID0gbmV3IEdsb2JhbEFzc2V0cyggdGhpcy5nYW1lUHJvcHMuY2h1bmtTaXplICk7XHJcblxyXG4gICAgLy8gRGlhbG9nIFByb3BzXHJcbiAgICB0aGlzLmRlZmF1bHREaWFsb2cgPSBbIHsgaGlkZVNwcml0ZTogdHJ1ZSwgdGV4dDogXCJcIiB9IF07XHJcbiAgICB0aGlzLmRpYWxvZyA9IHRoaXMuZGVmYXVsdERpYWxvZztcclxuICAgIHRoaXMuZGlhbG9nQWN0aXZlID0gZmFsc2U7XHJcbiAgICB0aGlzLmRpYWxvZ0luZGV4ID0gMDtcclxuICAgIHRoaXMuZmlyc3RLZXlVcFRyaWdnZXIgPSB0cnVlO1xyXG5cclxuICAgIC8vIFNvdW5kc1xyXG4gICAgdGhpcy5tZW51U291bmRTcmMgPSBcIi4vc291bmRzL21haW4tbWVudS5tcDNcIjtcclxuICAgIHRoaXMubWVudVNvdW5kID0gbnVsbDtcclxuICB9XHJcblxyXG4gIGluaXRTb3VuZCgpIHtcclxuICAgIHRoaXMubWVudVNvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICBzcmM6IFt0aGlzLm1lbnVTb3VuZFNyY11cclxuICAgIH0pO1xyXG4gICAgdGhpcy5tZW51U291bmQucGxheSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gR2V0c1xyXG4gIGlzR2FtZVJlYWR5KCkgeyByZXR1cm4gdGhpcy5nYW1lUmVhZHk7IH1cclxuICBnZXRDaHVua1NpemUoKSB7IHJldHVybiB0aGlzLmdhbWVQcm9wcy5jaHVua1NpemU7IH1cclxuXHJcbiAgZ2V0Q2FudmFzV2lkdGgoKSAgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2FudmFzV2lkdGg7ICB9XHJcbiAgZ2V0Q2FudmFzSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2FudmFzSGVpZ2h0OyB9XHJcblxyXG4gIC8vIFNldHNcclxuICBzZXRHYW1lUmVhZHkoYm9vbCkgeyB0aGlzLmdhbWVSZWFkeSA9IGJvb2w7IH1cclxuXHJcbiAgc2V0Q3VycmVudFN0YWdlKHN0YWdlKXsgdGhpcy5jdXJyZW50U3RhZ2VOYW1lID0gc3RhZ2U7IH1cclxuICBnZXRDdXJyZW50U3RhZ2UoKSB7IHJldHVybiB0aGlzLmN1cnJlbnRTdGFnZU5hbWU7IH1cclxuXHJcbiAgLy8gRGlhbG9nXHJcbiAgaXNEaWFsb2dBY3RpdmUoKXsgcmV0dXJuIHRoaXMuZGlhbG9nQWN0aXZlOyB9XHJcbiAgc2V0RGlhbG9nQWN0aXZlKGJvb2wpIHsgdGhpcy5kaWFsb2dBY3RpdmUgPSBib29sOyB9XHJcbiAgc2V0RGlhbG9nKCBkaWFsb2cpIHtcclxuICAgIHRoaXMuZGlhbG9nID0gZGlhbG9nO1xyXG4gICAgdGhpcy5zZXREaWFsb2dBY3RpdmUodHJ1ZSk7XHJcbiAgfVxyXG4gIHJlc2V0RGlhbG9nKCkge1xyXG4gICAgdGhpcy5kaWFsb2cgPSB0aGlzLmRlZmF1bHREaWFsb2c7XHJcbiAgICB0aGlzLmRpYWxvZ0luZGV4ID0gMDtcclxuICAgIHRoaXMuc2V0RGlhbG9nQWN0aXZlKGZhbHNlKTtcclxuICAgIHRoaXMuZmlyc3RLZXlVcFRyaWdnZXIgPSB0cnVlO1xyXG4gIH1cclxuICAgIFxyXG4gIC8vICMgR28gdG8gbmV4dCBkaWFsb2dcclxuXHRuZXh0RGlhbG9nKCkge1xyXG4gICAgaWYoIHRoaXMuaXNEaWFsb2dBY3RpdmUoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZmlyc3RLZXlVcFRyaWdnZXIgKSB7IC8vIElnbm9yZSB0aGUgZmlyc3Qga2V5VXAgYmVjYXVzZSBpdCdzIHRyaWdnZXJpbmcgdG8gbmV4dCBpbmRleCByaWdodCBhZnRlciB0aGUgcGxheWVyIGFjdGl2YXRlIHRoZSBkaWFsb2dcclxuICAgICAgICB0aGlzLmZpcnN0S2V5VXBUcmlnZ2VyID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kaWFsb2dJbmRleCsrO1xyXG4gICAgICAgIGlmKCB0aGlzLmRpYWxvZ1t0aGlzLmRpYWxvZ0luZGV4XS5oaWRlU3ByaXRlICkge1xyXG4gICAgICAgICAgdGhpcy5yZXNldERpYWxvZygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cdH1cclxuXHJcbiAgLy8gIyBLZXkgdXAgaGFuZGxlXHJcblx0aGFuZGxlS2V5VXAoa2V5Q29kZSkge1xyXG4gICAgXHJcbiAgICAvLyBQYXVzZVxyXG4gICAgaWYoIGtleUNvZGUgPT0gMjcgJiYgdGhpcy5nYW1lSXNMb2FkZWQgKSB7IC8vIEVTUVxyXG4gICAgICB0aGlzLnRvZ2dsZVBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlhbG9nXHJcblx0XHRpZiAoa2V5Q29kZSA9PSAzMiB8fCBrZXlDb2RlID09IDY5KSB7IC8vIFNwYWNlIG9yIEVcclxuXHRcdFx0dGhpcy5uZXh0RGlhbG9nKCk7XHJcblx0XHR9IFxyXG4gIFxyXG4gIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgRGVmYXVsdCBFdmVudCBMaXN0ZW5lcnNcclxuICBkZWZhdWx0RXZlbnRMaXN0ZW5lcnMoKSB7XHJcblxyXG4gICAgLy8gTWVudSBDbGlja3NcclxuICAgIGxldCBtZW51SXRlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lbnUtaXRlbScpO1xyXG4gICAgXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lbnVJdGVtLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxldCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgIG1lbnVJdGVtW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMubWVudUFjdGlvbiggdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWFjdGlvblwiKSApO1xyXG4gICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBLZXlib2FyZCBFdmVudHNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICB0aGlzLmtleXNEb3duW2Uua2V5Q29kZV0gPSB0cnVlO1xyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBcclxuICAgICAgLy8gQ2xlYXIgcHJldmlvdXMga2V5c1xyXG4gICAgICBkZWxldGUgdGhpcy5rZXlzRG93bltlLmtleUNvZGVdO1xyXG4gICAgICBcclxuICAgICAgLy8gUmVzZXQgcGxheWVycyBsb29rIGRpcmVjdGlvblxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgaGFuZGxlIGtleXVwXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBwbGF5ZXIuaGFuZGxlS2V5VXAoZS5rZXlDb2RlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2FtZSBIYW5kbGUga2V5cFxyXG4gICAgICB0aGlzLmhhbmRsZUtleVVwKGUua2V5Q29kZSk7XHJcbiAgICAgIFxyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFN0YXJ0L1Jlc3RhcnQgYSBHYW1lXHJcblxyXG4gIHJlZnJlc2hWYXJpYWJsZXMoKSB7XHJcblxyXG4gICAgLy8gQ2xlYXIgc2F2ZSBzdGF0ZVxyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpO1xyXG5cclxuICAgIC8vIFJlbmRlcnNcclxuICAgIHRoaXMuaXRlbXNTdGF0ZSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICB0aGlzLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMuY29sbGlzaW9uID0gbnVsbDtcclxuICAgIHRoaXMuZGVmYXVsdFNjZW5hcmlvID0gJ3NhbmRib3gnO1xyXG4gICAgdGhpcy5zY2VuYXJpbyA9IG51bGw7XHJcbiAgICB0aGlzLlVJID0gbnVsbDtcclxuICAgIHRoaXMuY3VycmVudFN0YWdlTmFtZSA9ICcnO1xyXG5cclxuICAgIC8vIFJlbmRlcnNcclxuICAgIHRoaXMucmVuZGVyU3RhdGljID0gbnVsbDtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbnVsbDtcclxuICAgIHRoaXMucmVuZGVyVUkgICAgID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmdhbWVPdmVyKGZhbHNlKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0TmV3R2FtZSggc2F2ZURhdGEgKSB7XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoVmFyaWFibGVzKCk7XHJcbiAgICB0aGlzLm1lbnVTb3VuZC5zdG9wKCk7XHJcbiAgICBcclxuICAgIC8vICMgSW5pdFxyXG4gICAgICBcclxuICAgICAgbGV0IGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcbiAgICAgIGxldCBjb250ZXh0U3RhdGljID0gY2FudmFzU3RhdGljLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBsZXQgY2FudmFzTGF5ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19sYXllcnMnKTtcclxuICAgICAgbGV0IGNvbnRleHRMYXllcnMgPSBjYW52YXNMYXllcnMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgXHJcbiAgICAgIGxldCBjYW52YXNVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfdWknKTtcclxuICAgICAgbGV0IGNvbnRleHRVSSA9IGNhbnZhc1VJLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjYW52YXNMYXllcnMud2lkdGggPSBjYW52YXNTdGF0aWMud2lkdGggPSBjYW52YXNVSS53aWR0aCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICAgIGNhbnZhc0xheWVycy5oZWlnaHQgPSBjYW52YXNTdGF0aWMuaGVpZ2h0ID0gY2FudmFzVUkuaGVpZ2h0ID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzSGVpZ2h0Jyk7XHJcblxyXG4gICAgLy8gIyBTY2VuYXJpb1xyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggdGhpcy5kZWZhdWx0U2NlbmFyaW8sIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmFyaW8gPSB0aGlzLmdldFNjZW5hcmlvKCBzYXZlRGF0YS5zY2VuYXJpby5zY2VuYXJpb0lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllciggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIxU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WSgpLCB0aGlzLmdhbWVQcm9wcywgMSApOyBcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm11bHRpcGxheWVyICkge1xyXG4gICAgICAgICAgbGV0IHBsYXllcjIgPSBuZXcgUGxheWVyKCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjJTdGFydFgoKSwgdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIyU3RhcnRZKCksIHRoaXMuZ2FtZVByb3BzLCAyICk7IFxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNjZW5hcmlvLmFkZFBsYXllcihwbGF5ZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG5cclxuICAgICAgICAgIGxldCBfcGxheWVyID0gbmV3IFBsYXllciggcGxheWVyLngsIHBsYXllci55LCB0aGlzLmdhbWVQcm9wcywgcGxheWVyLnBsYXllck51bWJlciwgcGxheWVyICk7IFxyXG5cclxuICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKCBfcGxheWVyKTtcclxuICAgICAgICAgIHRoaXMuc2NlbmFyaW8uYWRkUGxheWVyKF9wbGF5ZXIpO1xyXG5cclxuICAgICAgICB9KTsgIFxyXG5cclxuICAgICAgfVxyXG4gICAgLy8gIyBVSVxyXG4gICAgICBcclxuICAgICAgdGhpcy5VSSA9IG5ldyBVSSggdGhpcy5wbGF5ZXJzLCB0aGlzLmdhbWVQcm9wcyk7XHJcblxyXG4gICAgLy8gIyBDb2xsaXNpb24gZGV0ZWN0aW9uIGNsYXNzXHJcblxyXG4gICAgICB0aGlzLmNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oIGNhbnZhc0xheWVycy53aWR0aCwgY2FudmFzTGF5ZXJzLmhlaWdodCApO1xyXG5cclxuICAgIC8vICMgUmVuZGVyXHJcblxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG5ldyBSZW5kZXIoY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljKTsgLy8gUmVuZGVyIGV4ZWN1dGVkIG9ubHkgb25jZVxyXG4gICAgICB0aGlzLnJlbmRlckxheWVycyA9IG5ldyBSZW5kZXIoY29udGV4dExheWVycywgY2FudmFzTGF5ZXJzKTsgLy8gUmVuZGVyIHdpdGggYW5pbWF0ZWQgb2JqZWN0cyBvbmx5XHJcbiAgICAgIHRoaXMucmVuZGVyVUkgICAgID0gbmV3IFJlbmRlcihjb250ZXh0VUksIGNhbnZhc1VJKTsgXHJcblxyXG4gICAgICAvLyBBZGQgaXRlbXMgdG8gYmUgcmVuZGVyZWRcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc2V0U2NlbmFyaW8odGhpcy5zY2VuYXJpbyk7IC8vIHNldCB0aGUgc2NlbmFyaW9cclxuICAgIFxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5NZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAvLyBTaG93IENhbnZhc1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUNhbnZhcycpLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnYW1lIGlzIG5vdCBwYXVzZWRcclxuICAgICAgdGhpcy51bnBhdXNlKCk7XHJcbiAgICBcclxuICAgIC8vIEZsYWcgXHJcbiAgICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgLy8gT2ssIHJ1biB0aGUgZ2FtZSBub3dcclxuICAgICAgdGhpcy5zZXRHYW1lUmVhZHkodHJ1ZSk7XHJcbiAgICAgIHRoaXMucnVuR2FtZSggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnZnBzJykgKTtcdC8vIEdPIEdPIEdPXHJcblxyXG4gIH0vL25ld0dhbWVcclxuXHJcbiAgICAvLyAjIFRoZSBHYW1lIExvb3BcclxuICAgIHVwZGF0ZUdhbWUoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc1BhdXNlZCgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgdGhpcy5yZW5kZXJVSS5zdGFydCggZGVsdGFUaW1lICk7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLnN0YXJ0KCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIC8vICMgQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSApO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgICAgIC8qdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmFkZEFycmF5SXRlbShwbGF5ZXIpO1xyXG4gICAgICB9KTsqL1xyXG4gIFxyXG4gICAgICAvLyBcIlN0YXRpY1wiIFJlbmRlciAtIEJhY2tncm91bmRcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLmFkZEFycmF5SXRlbSh0aGlzLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCkpOyAvLyBHZXQgYWxsIGl0ZW1zIGZyb20gdGhlIHNjZW5hcmlvIHRoYXQgbmVlZHMgdG8gYmUgcmVuZGVyZWRcclxuXHJcbiAgICAgIC8vIExheWVycyBSZW5kZXJcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5jbGVhckFycmF5SXRlbXMoKTtcclxuXHJcbiAgICAgICAgLy8gIyBCb3R0b20gXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX2JvdHRvbSgpICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gIyBNaWRkbGVcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRJdGVtKCBwbGF5ZXIgKTsgLy8gQWRkcyB0aGUgcGxheWVyIHRvIHRoZSBhbmltYXRpb24gcmVuZGVyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vICMgVG9wXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIFVJIFJlbmRlclxyXG4gICAgICB0aGlzLnJlbmRlclVJLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLnJlbmRlclVJLmFkZEFycmF5SXRlbSggdGhpcy5VSS5nZXROZXdSZW5kZXJJdGVtcygpKTtcclxuICAgICAgXHJcbiAgICAgIC8vICMgTW92ZW1lbnRzXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuaGFuZGxlTW92ZW1lbnQoIHRoaXMua2V5c0Rvd24gKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyAjIENoZWNrIGlmIHBsYXllciBpcyBjb2xsaWRpbmdcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmNoZWNrKHBsYXllcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgXCJUaHJlYWRcIiB0aGEgcnVucyB0aGUgZ2FtZVxyXG4gICAgcnVuR2FtZShmcHMpIHtcclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgdGhpcy5nYW1lTG9vcCgpO1xyXG4gICAgfVxyXG4gICAgZ2FtZUxvb3AoKSB7XHJcblxyXG4gICAgICAvLyBjYWxjIGVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgdGhpcy5ub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aGlzLmVsYXBzZWQgPSB0aGlzLm5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG5cclxuICAgICAgLy8gaWYgZW5vdWdoIHRpbWUgaGFzIGVsYXBzZWQsIGRyYXcgdGhlIG5leHQgZnJhbWVcclxuICAgICAgaWYgKCB0aGlzLmVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIEdldCByZWFkeSBmb3IgbmV4dCBmcmFtZSBieSBzZXR0aW5nIHRoZW49bm93LCBidXQgYWxzbyBhZGp1c3QgZm9yIHlvdXJcclxuICAgICAgICAvLyBzcGVjaWZpZWQgZnBzSW50ZXJ2YWwgbm90IGJlaW5nIGEgbXVsdGlwbGUgb2YgUkFGJ3MgaW50ZXJ2YWwgKDE2LjdtcylcclxuICAgICAgICB0aGlzLmRlbHRhVGltZSA9IHRoaXMubm93IC0gKHRoaXMuZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUdhbWUoIHRoaXMuZGVsdGFUaW1lICk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSdW5zIG9ubHkgd2hlbiB0aGUgYnJvd3NlciBpcyBpbiBmb2N1c1xyXG4gICAgICAvLyBSZXF1ZXN0IGFub3RoZXIgZnJhbWVcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U2NlbmFyaW8oIHNjZW5hcmlvX2lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICkge1xyXG4gICAgICBzd2l0Y2goc2NlbmFyaW9faWQpIHtcclxuICAgICAgICBjYXNlIFwicHJvdG90eXBlXCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzYW5kYm94XCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvU2FuZGJveChjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBNZW51XHJcbiAgXHJcbiAgLy8gQHBhdXNlZCBkZXRlcm1pbmUgaWYgdGhlIGdhbWUgY2FtZSBmcm9tIGEgcGF1c2UgYWN0aW9uIG9yIGEgbmV3IGdhbWUgKHdoZW4gcGFnZSBsb2FkcylcclxuICBtYWluTWVudShwYXVzZWQpIHsgXHJcbiAgICBcclxuICAgIGxldCBkaXZNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51Jyk7XHJcblxyXG4gICAgLy8gU2V0IG1haW5NZW51IGNsYXNzXHJcbiAgICAoIHBhdXNlZCApID8gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKSA6ICcnO1xyXG4gICAgKCBwYXVzZWQgKSA/ICcnIDogZGl2TWVudS5jbGFzc0xpc3QuYWRkKCduZXctZ2FtZScpO1xyXG4gICAgXHJcbiAgICAvLyBUb2dnbGUgTWVudVxyXG4gICAgZGl2TWVudS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICBcclxuICB9XHJcbiAgICAvLyBIYW5kbGUgTWVudSBBY3Rpb25cclxuICAgIG1lbnVBY3Rpb24oYWN0aW9uKSB7XHJcbiAgICAgIHN3aXRjaChhY3Rpb24pIHtcclxuICAgICAgICBjYXNlICdjb250aW51ZSc6XHJcbiAgICAgICAgICB0aGlzLmNvbnRpbnVlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgICB0aGlzLnNhdmVHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsb2FkJzpcclxuICAgICAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldyc6XHJcbiAgICAgICAgICB0aGlzLm11bHRpcGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbmV3LTItcGxheWVycyc6XHJcbiAgICAgICAgICB0aGlzLm11bHRpcGxheWVyID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMubmV3R2FtZShmYWxzZSk7Ly8gZmFsc2UgPSB3b24ndCBsb2FkIHNhdmVEYXRhXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdjb250cm9scyc6XHJcbiAgICAgICAgY2FzZSAnYmFjay1jb250cm9scyc6XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbk1lbnUnKS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJvbHMnKS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBOZXcgR2FtZVxyXG4gIG5ld0dhbWUoc2F2ZURhdGEpIHtcclxuICAgIHRoaXMucGF1c2UoKTtcclxuICAgIHRoaXMubG9hZGluZyh0cnVlKTtcclxuICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgdGhpcy5zdGFydE5ld0dhbWUoc2F2ZURhdGEpOyBcclxuICAgIH0sIDEwMDAgKTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBDb250aW51ZVxyXG4gIGNvbnRpbnVlR2FtZSgpIHtcclxuICAgIHRoaXMudW5wYXVzZSgpO1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFNhdmVcclxuICBzYXZlR2FtZSgpIHtcclxuICAgIGlmKCBjb25maXJtKCdTYWx2YXIgbyBqb2dvIGF0dWFsIGlyw6Egc29icmVlc2NyZXZlciBxdWFscXVlciBqb2dvIHNhbHZvIGFudGVyaW9ybWVudGUuIERlc2VqYSBjb250aW51YXI/JykgKSB7XHJcbiAgICAgIFxyXG4gICAgICBsZXQgc2F2ZURhdGEgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgICAvLyBNdWx0aXBsYXllclxyXG4gICAgICBzYXZlRGF0YS5tdWx0aXBsYXllciA9IHRoaXMubXVsdGlwbGF5ZXI7XHJcblxyXG4gICAgICAvLyBTY2VuYXJpb1xyXG4gICAgICBzYXZlRGF0YS5zY2VuYXJpbyA9IHtcclxuICAgICAgICBzY2VuYXJpb0lkOiB0aGlzLnNjZW5hcmlvLmdldElkKCksXHJcbiAgICAgICAgc3RhZ2VJZDogdGhpcy5zY2VuYXJpby5nZXRBY3R1YWxTdGFnZUlkKCksXHJcbiAgICAgICAgaXRlbXM6IHRoaXMuZ2V0SXRlbXNTdGF0ZSgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBsYXllcnNcclxuICAgICAgc2F2ZURhdGEucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgc2F2ZURhdGEucGxheWVycy5wdXNoKHtcclxuICAgICAgICAgIHBsYXllck51bWJlcjogcGxheWVyLmdldFBsYXllck51bWJlcigpLFxyXG4gICAgICAgICAgeDogcGxheWVyLmdldFgoKSxcclxuICAgICAgICAgIHk6IHBsYXllci5nZXRZKCksXHJcbiAgICAgICAgICBsaWZlczogcGxheWVyLmdldExpZmVzKClcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDb252ZXJ0IHRvIEpTT05cclxuICAgICAgc2F2ZURhdGEgPSBKU09OLnN0cmluZ2lmeShzYXZlRGF0YSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTYXZlIG9uIExvY2FsU3RvcmFnZVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2d1Zml0cnVwaV9fc2F2ZScsIHNhdmVEYXRhICk7XHJcblxyXG4gICAgICBhbGVydCgnSm9nbyBzYWx2byEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTYXZlXHJcbiAgbG9hZEdhbWUoKSB7XHJcbiAgICBcclxuICAgIC8vICMgR2V0IGRhdGEgZnJvbSBsb2NhbHN0b3JhZ2UgYW5kIGNvbnZlcnRzIHRvIGpzb25cclxuICAgIGxldCBzYXZlRGF0YSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX3NhdmUnKSApO1xyXG5cclxuICAgIGlmKCBzYXZlRGF0YSApIHtcclxuICAgICAgLy8gV2lsbCBiZSAgbXVsdGlwbGF5ZXIgZ2FtZT9cclxuICAgICAgdGhpcy5tdWx0aXBsYXllciA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLm11bHRpcGxheWVyIDogZmFsc2U7XHJcblxyXG4gICAgICAvLyBSZXBsYWNlIGl0ZW1zIHN0YXRlIG9uIGxvY2FsIHN0b3JhZ2Ugd2l0aCBzYXZlZCBzdGF0ZXNcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBKU09OLnN0cmluZ2lmeSggc2F2ZURhdGEuc2NlbmFyaW8uaXRlbXMgKSApO1xyXG5cclxuICAgICAgLy8gTG9hZCBJdGVtcyBpdGVuc1xyXG4gICAgICBmb3IoIGxldCBpIGluIHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zICkge1xyXG4gICAgICAgIHRoaXMuYWRkSXRlbVN0YXRlKCBzYXZlRGF0YS5zY2VuYXJpby5pdGVtc1tpXSApO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gIyBMb2FkcyBhIG5ldyBnYW1lIHdpdGggc2F2ZSBkYXRhXHJcbiAgICAgIHRoaXMubmV3R2FtZShzYXZlRGF0YSk7IFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWxlcnQoJ07Do28gaMOhIGpvZ28gc2Fsdm8gcHJldmlhbWVudGUuJylcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBQYXVzZVxyXG4gIGlzUGF1c2VkKCkgeyByZXR1cm4gdGhpcy5fcGF1c2U7IH1cclxuICBwYXVzZSgpIHsgXHJcbiAgICB0aGlzLl9wYXVzZSA9IHRydWU7IFxyXG4gICAgdGhpcy5tYWluTWVudSh0cnVlKTtcclxuXHJcbiAgICB0aGlzLm1lbnVTb3VuZC5wbGF5KCk7XHJcbiAgICBpZiggdGhpcy5zY2VuYXJpbyApIHRoaXMuc2NlbmFyaW8uc291bmQucGF1c2UoKTtcclxuICAgIFxyXG4gIH1cclxuICB1bnBhdXNlKCkgeyBcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIHRoaXMuX3BhdXNlID0gZmFsc2U7IFxyXG4gICAgXHJcbiAgICB0aGlzLm1lbnVTb3VuZC5zdG9wKCk7XHJcbiAgICBpZiggdGhpcy5zY2VuYXJpbyApIHRoaXMuc2NlbmFyaW8uc291bmQucGxheSgpO1xyXG4gIH1cclxuICB0b2dnbGVQYXVzZSgpIHsgKCB0aGlzLmlzUGF1c2VkKCkgKSA/IHRoaXMudW5wYXVzZSgpIDogdGhpcy5wYXVzZSgpIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGxvYWRpbmcoYm9vbCkge1xyXG4gICAgbGV0IGRpc3BsYXkgPSAoIGJvb2wgKSA/ICdmbGV4JyA6ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGdhbWVPdmVyKGJvb2wpIHtcclxuICAgIGlmKCBib29sICkgdGhpcy5fcGF1c2UgPSB0cnVlOyBcclxuICAgIGxldCBkaXNwbGF5ID0gKCBib29sICkgPyAnZmxleCcgOiAnbm9uZSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZS1vdmVyJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8qXHJcbiAgICBJdGVtcyBTdGF0ZVxyXG4gICAgLSBUaGlzIGFyZSBmdW5jdGlvbnMgdGhhdCBoYW5kbGVzIGl0ZW1zIHN0YXRlcyBiZXR3ZWVuIGNoYW5naW5nIG9mIHN0YWdlcy4gVGhpcyB3aWxsIG1ha2UgYW4gaXRlbSB0byBub3QgcmVzcGF3biBpZiBpdCB3YXMgY29sbGVjdGVkIGJlZm9yZVxyXG4gICovXHJcbiAgXHJcbiAgICBnZXRJdGVtc1N0YXRlKCkgeyByZXR1cm4gdGhpcy5pdGVtc1N0YXRlOyB9XHJcbiAgICBhZGRJdGVtU3RhdGUoIGl0ZW0gKSB7IFxyXG4gICAgICB0aGlzLml0ZW1zU3RhdGVbaXRlbS5uYW1lX2lkXSA9IGl0ZW07ICBcclxuICAgIH1cclxuXHJcbiAgICBzYXZlSXRlbXNTdGF0ZSgpIHtcclxuICAgICAgbGV0IGl0ZW1zU3RhdGUgPSBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXRJdGVtc1N0YXRlKCkgKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBpdGVtc1N0YXRlICk7XHJcbiAgICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuICBcclxuICAvLyBIZWxwZXJzIGZvciBjbGFzc2VzIHRvIGNoZWNrIGlmIGFuIG9iamVjdCBpcyBjb2xsaWRpbmcgXHJcbiAgY2hlY2tDb2xsaXNpb24oIG9iamVjdCApIHtcclxuICAgIGlmKCB0aGlzLmlzR2FtZVJlYWR5KCkgKVxyXG4gICAgICByZXR1cm4gdGhpcy5jb2xsaXNpb24uY2hlY2sob2JqZWN0KTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBSdW5cclxuICBydW4oKSB7XHJcblxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDYW52YXMnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICB0aGlzLmxvYWRpbmcoZmFsc2UpO1xyXG4gICAgdGhpcy5nYW1lT3ZlcihmYWxzZSk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGhlIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5kZWZhdWx0RXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIFxyXG4gICAgdGhpcy5pbml0U291bmQoKTsgXHJcblxyXG4gICAgLy8gU2hvd3MgTWVudVxyXG4gICAgdGhpcy5tYWluTWVudShmYWxzZSk7XHJcblxyXG4gICAgLy8gQXV0byBsb2FkIGEgZ2FtZSAtIGRlYnVnIG1vZGVcclxuICAgIGlmKCB3aW5kb3cuYXV0b2xvYWQgKSB7XHJcbiAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7IiwiY2xhc3MgUmVuZGVyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHBsYXllcikge1xyXG4gICAgdGhpcy5jdHggPSBjdHg7IFxyXG4gICAgdGhpcy5zY2VuYXJpbyA9IFwiXCI7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgXHJcbiAgZ2V0QXJyYXlJdGVtcygpeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIFxyXG4gIC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcbiAgYWRkSXRlbShvYmplY3Qpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcbiAgfVxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7IFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgc2V0U2NlbmFyaW8oc2NlbmFyaW8pe1xyXG4gICAgdGhpcy5zY2VuYXJpbyA9IHNjZW5hcmlvO1xyXG4gIH1cclxuICAgICAgICAgICAgXHJcbiAgLy8gVGhpcyBmdW5jdGlvbnMgd2lsbCBiZSBjYWxsZWQgY29uc3RhbnRseSB0byByZW5kZXIgaXRlbXNcclxuICBzdGFydChkZWx0YVRpbWUpIHtcdFx0XHJcbiAgICAgICAgICAgICAgICBcclxuICAgIC8vIENsZWFyIGNhbnZhcyBiZWZvcmUgcmVuZGVyIGFnYWluXHJcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gMDtcclxuXHJcbiAgICAvLyBTY2VuYXJpb1xyXG4gICAgaWYgKCB0aGlzLnNjZW5hcmlvICE9IFwiXCIpIFxyXG4gICAgICB0aGlzLnNjZW5hcmlvLnJlbmRlcih0aGlzLmN0eCk7XHJcbiAgICAgIFxyXG4gICAgLy8gUmVuZGVyIGl0ZW1zXHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMucmVuZGVySXRlbXMpIHtcclxuICAgICAgLy8gRXhlY3V0ZSB0aGUgcmVuZGVyIGZ1bmN0aW9uIC0gSW5jbHVkZSB0aGlzIGZ1bmN0aW9uIG9uIGV2ZXJ5IGNsYXNzXHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXNbaV0ucmVuZGVyKHRoaXMuY3R4LCBkZWx0YVRpbWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgfVxyXG4gICAgXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyIiwiY2xhc3MgU3ByaXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcHJpdGUsIHcsIGgsIGtXLCBrSCkge1xyXG5cclxuICAgICAgICAvLyBUaGUgSW1hZ2UgU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBzcHJpdGU7XHJcblxyXG4gICAgICAgIC8vIFNpemUgb2YgaW1hZ2Ugc3ByaXRlIFxyXG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaDtcclxuXHJcbiAgICAgICAgLy8gU2l6ZSBvZiBlYWNoIGZyYW1lIHNxdWFyZSBcclxuICAgICAgICB0aGlzLmtleVdpZHRoID0ga1c7XHJcbiAgICAgICAgdGhpcy5rZXlIZWlnaHQgPSBrSDtcclxuXHJcbiAgICAgICAgLy8gUm93cyBhbmQgQ29sbHVtbnMgcXVhbnRpdHlcclxuICAgICAgICB0aGlzLmNvbHMgPSBNYXRoLmNlaWwoIHRoaXMud2lkdGggLyB0aGlzLmtleVdpZHRoICk7XHJcbiAgICAgICAgdGhpcy5yb3dzID0gTWF0aC5jZWlsKCB0aGlzLmhlaWdodCAvIHRoaXMua2V5SGVpZ2h0ICk7XHJcblxyXG4gICAgICAgIC8vIFRoZSBmcmFtZXNcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5ydW4oKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIEdldHNcclxuICAgIGdldFNwcml0ZSgpICAgIHsgcmV0dXJuIHRoaXMuc3ByaXRlOyB9XHJcbiAgICBnZXRGcmFtZShudW0pICB7IHJldHVybiB0aGlzLmZyYW1lc1tudW1dOyB9XHJcbiAgICBnZXRLZXlXaWR0aCgpICB7IHJldHVybiB0aGlzLmtleVdpZHRoOyAgICB9XHJcbiAgICBnZXRLZXlIZWlnaHQoKSB7IHJldHVybiB0aGlzLmtleUhlaWdodDsgICB9XHJcbiAgICBnZXRTcHJpdGVQcm9wcyhudW0pIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjbGlwX3g6IHRoaXMuZ2V0RnJhbWUobnVtKS54LCBjbGlwX3k6IHRoaXMuZ2V0RnJhbWUobnVtKS55LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLmdldEtleVdpZHRoKCksIHNwcml0ZV9oZWlnaHQ6IHRoaXMuZ2V0S2V5SGVpZ2h0KCkgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vICMgUnVuXHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgLy8gR2VuIGVhY2ggZnJhbWUgYmFzZWQgb24gc2l6ZXMgXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBmb3IoIGxldCByPTA7IHI8dGhpcy5yb3dzO3IrKyApIHtcclxuICAgICAgICAgICAgZm9yKCBsZXQgYz0wOyBjPHRoaXMuY29scztjKysgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lc1tpbmRleF0gPSB7IFxyXG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMua2V5V2lkdGggKiBjLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHRoaXMua2V5SGVpZ2h0ICogclxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGU7IiwiY29uc3QgVUlpdGVtID0gcmVxdWlyZSgnLi9fVUlpdGVtJyk7XHJcbmNvbnN0IERpYWxvZyA9IHJlcXVpcmUoJy4vX0RpYWxvZycpO1xyXG5cclxuY2xhc3MgVUkge1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXJzLCBnYW1lUHJvcHMpIHtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJzID0gcGxheWVycztcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgICB0aGlzLmdhbWVQcm9wcyA9IGdhbWVQcm9wcztcclxuICAgIHRoaXMuY2h1bmtTaXplID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICAgICAgICAgICAgICBcclxuICAvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG4gIGFkZEl0ZW0ob2JqZWN0KXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG4gIH1cclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuICAgIGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpeyBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIGdldFJlbmRlckl0ZW1zKCl7XHJcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtcztcclxuICB9XHJcblxyXG4gIC8vIENsZWFyIGFycmF5IGFuZCByZXJ1biBjb2RlIHRvIGdldCBuZXcgaXRlbXNcclxuICBnZXROZXdSZW5kZXJJdGVtcygpIHtcclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVuZGVySXRlbXMoKTtcclxuICB9XHJcblxyXG4gIC8vIE1hdGhcclxuICBmcm9tUmlnaHQodmFsdWUpIHtcclxuICAgIHJldHVybiAoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAqIHRoaXMuY2h1bmtTaXplICkgLSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJ1bigpIHtcclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuXHJcbiAgICAgIC8vICMgUGxheWVyIDAxXHJcbiAgICAgICAgaWYoIHRoaXMucGxheWVyc1swXSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuY2h1bmtTaXplLFxyXG4gICAgICAgICAgICA1LCA1LCAvLyB4LCB5LFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgLy8gc3ByaXRlX3csIHNwcml0ZV9oLCBcclxuICAgICAgICAgICAgMCwgMCwgICAgICAvLyBjbGlwX3gsIGNsaXBfeVxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgLy8gdywgaFxyXG4gICAgICAgICAgKSApO1xyXG5cclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8xeCA9IDEyMDtcclxuICAgICAgICAgIGxldCBfMXkgPSAxMDtcclxuICAgICAgICAgIGxldCBfMWxpZmVzID0gdGhpcy5wbGF5ZXJzWzBdLmdldExpZmVzKCk7XHJcbiAgICAgICAgICBmb3IoIGxldCBpPTA7IGk8XzFsaWZlcztpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgICAgXzF4LCBfMXksXHJcbiAgICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICAgIDEwMCwgMCwgICAgICBcclxuICAgICAgICAgICAgICB0aGlzLmNodW5rU2l6ZS8zLCB0aGlzLmNodW5rU2l6ZS8zIFxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICAgIF8xeCArPSAzNTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09IDIgKSB7XHJcbiAgICAgICAgICAgICAgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgICAgIF8xeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIFxyXG5cclxuICAgICAgLy8gIyBQbGF5ZXIgMDJcclxuICAgICAgICBpZiggdGhpcy5wbGF5ZXJzWzFdICkge1xyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpLFxyXG4gICAgICAgICAgICB0aGlzLmZyb21SaWdodCggMjMwICksIDUsIFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgIDUwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgXHJcbiAgICAgICAgICApICk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8yeCA9IHRoaXMuZnJvbVJpZ2h0KCA1MCApO1xyXG4gICAgICAgICAgbGV0IF8yeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8ybGlmZXMgPSB0aGlzLnBsYXllcnNbMV0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMmxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMngsIF8yeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzJ4IC09IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMnggPSB0aGlzLmZyb21SaWdodCggNTAgKTtcclxuICAgICAgICAgICAgICBfMnkgPSA2MDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAvLyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIFxyXG5cclxuICAgIC8qXHJcbiAgICAgICAgRGlhbG9nIEJveFxyXG4gICAgKi9cclxuICAgICAgXHJcbiAgICAgIGxldCBkUHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5jaHVua1NpemUgKiAxLFxyXG4gICAgICAgIHk6IHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5jYW52YXNIZWlnaHQgLSAodGhpcy5jaHVua1NpemUgKiAxKSxcclxuICAgICAgICB3OiB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuY2FudmFzV2lkdGggLSAodGhpcy5jaHVua1NpemUgKiAyKSxcclxuICAgICAgICBoOiB0aGlzLmNodW5rU2l6ZSAqIDQsXHJcbiAgICAgICAgZGlhbG9nOiB3aW5kb3cuZ2FtZS5kaWFsb2dbd2luZG93LmdhbWUuZGlhbG9nSW5kZXhdXHJcbiAgICAgIH1cclxuICAgICAgZFByb3BzLnkgPSBkUHJvcHMueSAtIGRQcm9wcy5oO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5hZGRJdGVtKCBcclxuICAgICAgICBuZXcgRGlhbG9nKCBkUHJvcHMueCwgZFByb3BzLnksIGRQcm9wcy53LCBkUHJvcHMuaCwgZFByb3BzLmRpYWxvZyApIFxyXG4gICAgICApO1xyXG4gIH1cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBVSSIsImNsYXNzIF9EaWFsb2cge1xyXG5cclxuICBjb25zdHJ1Y3RvciggeCwgeSwgdywgaCwgZGlhbG9nICkge1xyXG4gICAgXHJcbiAgICB0aGlzLmRpYWxvZyA9IGRpYWxvZztcclxuICAgIFxyXG4gICAgdGhpcy50ZXh0ID0ge307XHJcblxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgdGhpcy53ID0gdztcclxuXHRcdHRoaXMuaCA9IGg7XHJcblx0XHRcclxuXHRcdHRoaXMuY29ybmVyUmFkaXVzID0gMjA7XHJcblxyXG5cdFx0dGhpcy5maWxsQ29sb3IgPSBcInJnYmEoMjU1LDI1NSwyNTUsMC44KVwiO1xyXG5cdFx0dGhpcy5zdHJva2VDb2xvciA9IFwicmdiYSgwLDAsMCwwLjgpXCI7XHJcblx0XHRcclxuXHRcdHRoaXMuZm9udCA9IFwiMjhweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICB0aGlzLmZvbnRDb2xvciA9IFwicmdiYSgwLDAsMCwwLjgpXCI7XHJcblxyXG4gICAgdGhpcy50ZXh0WSA9IHRoaXMueSArIDkwO1xyXG4gICAgdGhpcy5hZGp1c3RUZXh0KCB0aGlzLmRpYWxvZy50ZXh0LCA0OCApO1xyXG5cclxuICB9XHJcbiAgICBcclxuICAvLyAjIFNldHMgICAgICBcclxuICAgIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICAgICAgXHJcbiAgICAvLyAjIEdldHMgICAgICAgICAgICBcclxuICAgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHJcbiAgICBhZGp1c3RUZXh0KCBzdHIsIGxlbmdodCApIHtcclxuICAgICAgdGhpcy50ZXh0ID0gdGhpcy5zcGxpdFRleHQoc3RyLCBsZW5naHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHNwbGl0VGV4dChzdHIsIGwpIHsgLy9yZWY6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MjQ3MTMvanMtc3BsaXR0aW5nLWEtbG9uZy1zdHJpbmctaW50by1zdHJpbmdzLXdpdGgtY2hhci1saW1pdC13aGlsZS1hdm9pZGluZy1zcGxpdHRpblxyXG4gICAgICB2YXIgc3RycyA9IFtdO1xyXG4gICAgICB3aGlsZShzdHIubGVuZ3RoID4gbCl7XHJcbiAgICAgICAgICB2YXIgcG9zID0gc3RyLnN1YnN0cmluZygwLCBsKS5sYXN0SW5kZXhPZignICcpO1xyXG4gICAgICAgICAgcG9zID0gcG9zIDw9IDAgPyBsIDogcG9zO1xyXG4gICAgICAgICAgc3Rycy5wdXNoKHN0ci5zdWJzdHJpbmcoMCwgcG9zKSk7XHJcbiAgICAgICAgICB2YXIgaSA9IHN0ci5pbmRleE9mKCcgJywgcG9zKSsxO1xyXG4gICAgICAgICAgaWYoaSA8IHBvcyB8fCBpID4gcG9zK2wpXHJcbiAgICAgICAgICAgICAgaSA9IHBvcztcclxuICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoaSk7XHJcbiAgICAgIH1cclxuICAgICAgc3Rycy5wdXNoKHN0cik7XHJcbiAgICAgIHJldHVybiBzdHJzO1xyXG4gIH1cclxuXHJcbiAgICAvLyAjIEl0ZW0gUmVuZGVyXHJcbiAgICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgICBcclxuICAgICAgaWYgKCB0aGlzLmRpYWxvZy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gUm91bmRlZCBSZWN0YW5nbGUgLSByZWZlcmVuY2U6IGh0dHA6Ly9qc2ZpZGRsZS5uZXQvcm9iaGF3a2VzL2dIQ0p0L1xyXG4gICAgXHJcblx0XHQgIC8vIFNldCBmYXV4IHJvdW5kZWQgY29ybmVyc1xyXG4gICAgICBjdHgubGluZUpvaW4gPSBcInJvdW5kXCI7XHJcbiAgICAgIGN0eC5saW5lV2lkdGggPSB0aGlzLmNvcm5lclJhZGl1cztcclxuXHJcblx0XHRcdC8vIENoYW5nZSBvcmlnaW4gYW5kIGRpbWVuc2lvbnMgdG8gbWF0Y2ggdHJ1ZSBzaXplIChhIHN0cm9rZSBtYWtlcyB0aGUgc2hhcGUgYSBiaXQgbGFyZ2VyKVxyXG5cdFx0XHRcclxuXHRcdFx0Ly8gU3Ryb2tlXHJcblx0XHRcdGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlQ29sb3I7XHJcblx0XHRcdGN0eC5zdHJva2VSZWN0KHRoaXMueCArICggdGhpcy5jb3JuZXJSYWRpdXMvMiksIHRoaXMueSArICh0aGlzLmNvcm5lclJhZGl1cy8yKSwgdGhpcy53IC0gdGhpcy5jb3JuZXJSYWRpdXMsIHRoaXMuaCAtIHRoaXMuY29ybmVyUmFkaXVzICk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBGaWxsXHJcblx0XHRcdGN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxDb2xvcjtcclxuICAgICAgY3R4LmZpbGxSZWN0KHRoaXMueCArICggdGhpcy5jb3JuZXJSYWRpdXMvMiksIHRoaXMueSArICh0aGlzLmNvcm5lclJhZGl1cy8yKSwgdGhpcy53IC0gdGhpcy5jb3JuZXJSYWRpdXMsIHRoaXMuaCAtIHRoaXMuY29ybmVyUmFkaXVzICk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBGb250XHJcblx0XHRcdGN0eC5mb250ID0gdGhpcy5mb250O1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5mb250Q29sb3JcclxuICAgICAgdGhpcy50ZXh0Lm1hcCggKHRleHQpID0+IHtcclxuICAgICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMueCArIDUwLCB0aGlzLnRleHRZKTtcclxuICAgICAgICB0aGlzLnRleHRZID0gdGhpcy50ZXh0WSArIDUwO1xyXG4gICAgICB9ICk7XHJcblx0XHRcdFxyXG4gICAgfVxyXG4gICAgICAgICBcclxuICB9Ly9jbGFzc1xyXG4gIG1vZHVsZS5leHBvcnRzID0gX0RpYWxvZztcclxuICAgICIsImNsYXNzIFVJaXRlbSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGl0ZW1TcHJpdGVJRCwgY2h1bmtTaXplLCB4LCB5LCBzdywgc2gsIGN4LCBjeSwgdywgaCApIHtcclxuICBcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICB0aGlzLml0ZW1TcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtU3ByaXRlSUQpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0ge1xyXG4gICAgICBzcHJpdGVfd2lkdGg6IHN3LFxyXG4gICAgICBzcHJpdGVfaGVpZ2h0OiBzaCxcclxuICAgICAgY2xpcF94OiBjeCxcclxuICAgICAgY2xpcF95OiBjeSxcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IGNodW5rU2l6ZTtcclxuXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSB3OyAvL3B4XHJcbiAgICB0aGlzLmhlaWdodCA9IGg7IC8vcHhcclxuICB9XHJcblxyXG4gIC8vICMgU2V0cyAgICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICAvLyAjIEdldHMgICAgICAgICAgICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICBcclxuICAvLyAjIEl0ZW0gUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgIHRoaXMuaXRlbVNwcml0ZSwgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgKTtcclxuICAgIFxyXG4gIH1cclxuICAgICBcclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlpdGVtO1xyXG4iLCIvLyBHYW1lIFByb3BlcnRpZXMgY2xhc3MgdG8gZGVmaW5lIGNvbmZpZ3VyYXRpb25zXHJcbmNsYXNzIGdhbWVQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcclxuICAgIC8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gMTAwOyAvL3B4IC0gcmVzb2x1dGlvblxyXG4gICAgXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxNjtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxNDtcclxuICAgIFxyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyk7XHJcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MpOy8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuZnBzID0gMjQ7XHJcbiAgfVxyXG5cclxuICBnZXRQcm9wKHByb3ApIHtcclxuICAgIHJldHVybiB0aGlzW3Byb3BdO1xyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBnYW1lUHJvcGVydGllcztcclxuXHJcbi8vIEdsb2JhbCB2YWx1ZXNcclxuXHJcbiAgLy8gRGVidWdcclxuICB3aW5kb3cuZGVidWcgPSBmYWxzZTsgLy8gU2hvdyBkZWJ1ZyBzcXVhcmVzXHJcbiAgd2luZG93LmRlYnVnQ29sbGlzaW9uID0gZmFsc2U7IC8vIFNob3cgd2hlbiBvYmplY3RzIGNvbGxpZGVcclxuICB3aW5kb3cuYXV0b2xvYWQgPSBmYWxzZTsgLy8gYXV0byBsb2FkIGEgc2F2ZWQgZ2FtZVxyXG4gIHdpbmRvdy5nb2RfbW9kZSA9IGZhbHNlOyAvLyBQbGF5ZXJzIHdvbid0IGRpZSIsImNvbnN0IEdhbWUgPSByZXF1aXJlKCcuL2VuZ2luZS9jb3JlL0dhbWUnKTtcclxuY29uc29sZS5jbGVhcigpO1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgXHJcbiAgLy8gIyBTdGFydCB0aGUgZ2FtZVxyXG4gICAgbGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUgPSBnYW1lO1xyXG4gICAgZ2FtZS5ydW4oKTtcclxuIFxyXG59Il19
