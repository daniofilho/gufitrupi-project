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
      this.grabing = false;
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
       window.game.newGame();
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

},{"../engine/core/Sprite":35}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"../engine/core/Sprite":35,"dup":1}],3:[function(require,module,exports){
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
},{"../../../engine/assets/_Scenario":30,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":23}],5:[function(require,module,exports){
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
},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Fire":18,"../../common/Teleport":23}],6:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":23}],7:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":23}],8:[function(require,module,exports){
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

},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Teleport":23}],9:[function(require,module,exports){
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
    super(ctx, canvas, "sandbox");
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
},{"../../../engine/assets/_Scenario":30,"./stages/stage_center":10,"./stages/stage_doors":11,"./stages/stage_enemy":12,"./stages/stage_life":13}],10:[function(require,module,exports){
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
      [ wc_tl,    wt,    wt,    wt,    wt,    wt,     iwc_br,    f1,    iwc_bl,    wt,     wt,     wt,     wt,     wt,     wt,     wc_tr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ iwc_br,   f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     iwc_bl ],
      [ f1,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     f1 ],
      [ iwc_tr,   f1,    f1,    ob,    ob,    ob,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     iwc_tl ],
      [ wl,       f1,    f1,    ob,    f2,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    ob,    ob,    ob,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     wr ],
      [ wc_bl,    wb,    wb,    wb,    wb,    wb,     iwc_tr,    ob,   iwc_tl,     wb,     wb,     wb,     wb,     wb,     wb,     wc_br ]
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

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   tp_lf,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_doors,false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_enemy ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
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
},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Fire":18,"../../common/Teleport":23}],11:[function(require,module,exports){
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Door = require('../../common/Door');
const Key = require('../../common/Key');
const Object_Throw = require('../../common/Object_Throw');
const Object_Push = require('../../common/Object_Push');

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



    let itemsBottom = [
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false,    fnce,   false,   false ],
        [ false,   false,  false,   false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false,    fnce,   false,   false ],
        [ false,   false,  false,   false,   fnce,    false,   false,   fnce,    false,   false,   fnce,    false,   false,    fnce,   false,   false ],
        [ false,   false,  dgtl,    dgtr,    fnce,    dptl,    dptr,    fnce,    drtl,    drtr,    fnce,    dgrtl,   dgrtr,    fnce,   false,   false ],
        [ false,   fnce,   dgbl,    dgbr,    fnce,    dpbl,    dpbr,    fnce,    drbl,    drbr,    fnce,    dgrbl,   dgrbr,    fnce,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_c ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  k_g,     false,   false,   k_p,     false,   false,   k_r,     false,   false,   k_gr,    false,   false,   false,   false ],
        [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
        [ false,   false,  false,   stne,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   brrl,   false ],
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
},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Door":16,"../../common/Key":20,"../../common/Object_Push":21,"../../common/Object_Throw":22,"../../common/Teleport":23}],12:[function(require,module,exports){
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
      [ wl,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        ob,     f1,     f1,     f1,     f1,     f1,     wr ],
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

    let itemsBottom = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   stne,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   brrl,    brrl,    brrl,    false,   false,   false,   false,   enemy,   enemy,   enemy,   false,   false,   false ],
      [ false,   false,  false,   brrl,    brrl,    brrl,    false,   false,   false,   stne,   enemy,   enemy,   enemy,   false,   false,   false ],
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
},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Enemy":17,"../../common/Fire":18,"../../common/Heal":19,"../../common/Object_Push":21,"../../common/Object_Throw":22,"../../common/Teleport":23}],13:[function(require,module,exports){
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
      [ false,   false,  false,   false,   false,   false,   false,   false,   fire,   false,   false,   bnna,   false,   false,   false,   false ],
      [ false,   false,  false,   fire,   false,   false,   false,   fire,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  fire,   bnna,    fire,   false,   false,   false,   false,   fire,   false,   fire,    false,   false,   false,   false ],
      [ false,   fire,  false,   false,   false,   fire,   fire,   false,   false,   fire,   berry,   fire,    false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   fire,   fire,   fire,    false,   false,   false,   false ],
      [ false,   false,  berry,    false,   false,   false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   fire,  false,   false,   bnna,    false,   false,   false,   false,   false,   false,   fire,   false,   false,   false,   false ],
      [ false,   fire,  fire,   fire,   fire,   fire,   false,   false,   fire,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,   false,   false,   fire,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,   false,   false,   fire,   false,   false,   false,   bnna,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,   false,   false,   fire,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,   fire,   false,   fire,   false,   false,   false,   berry,   false,   false,   false ],
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
},{"../../../../engine/assets/_Stage":31,"../../common/Beach_Floor":14,"../../common/Beach_Wall":15,"../../common/Fire":18,"../../common/Heal":19,"../../common/Teleport":23}],14:[function(require,module,exports){
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
},{"../../../engine/assets/_Collidable":29,"../../../engine/core/Sprite":35}],15:[function(require,module,exports){
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
},{"../../../engine/assets/_Collidable":29,"../../../engine/core/Sprite":35}],16:[function(require,module,exports){
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
},{"../../../engine/assets/_CanCollect":26,"../../../engine/core/Sprite":35}],17:[function(require,module,exports){
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
},{"../../../engine/assets/_CanHurt":27,"../../../engine/core/Sprite":35}],18:[function(require,module,exports){
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
},{"../../../engine/assets/_CanHurt":27,"../../../engine/core/Sprite":35}],19:[function(require,module,exports){
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
},{"../../../engine/assets/_CanCollect":26,"../../../engine/core/Sprite":35}],20:[function(require,module,exports){
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
},{"../../../engine/assets/_CanThrow":28,"../../../engine/core/Sprite":35}],21:[function(require,module,exports){
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
},{"../../../engine/assets/_CanBePushed":25,"../../../engine/core/Sprite":35}],22:[function(require,module,exports){
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
},{"../../../engine/assets/_CanThrow":28,"../../../engine/core/Sprite":35}],23:[function(require,module,exports){
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

      // Wait some time - dont't need it anymore (i think)
      //setTimeout( () => {
        
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

      //}, 300);
      
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
},{"../../../engine/assets/_Collidable":29,"../../../engine/core/Sprite":35,"../../../gameProperties":39}],24:[function(require,module,exports){
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
},{"../../assets/scenario/common/Key":20,"../../assets/scenario/common/Object_Throw":22}],25:[function(require,module,exports){
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
},{"./_Collidable":29}],26:[function(require,module,exports){
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
},{"./_Collidable":29}],27:[function(require,module,exports){
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
},{"./_Collidable":29}],28:[function(require,module,exports){
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
},{"../core/Sprite":35,"./_Collidable":29}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
class _Scenario {

  constructor(ctx, canvas, scenario_id){
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
},{}],31:[function(require,module,exports){
class _Stage {

  constructor(stageId) {
    
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
  
  run () { }

} // class
module.exports = _Stage;
},{}],32:[function(require,module,exports){
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
	
},{}],33:[function(require,module,exports){
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
      
      // Pause Event Listener
      if( e.keyCode == 27 && this.gameIsLoaded ) { // ESQ
        this.togglePause();
      }

      // Player handle keyup
      if( this.players) {
        this.players.map( (player) => {
          player.handleKeyUp(e.keyCode);
        });
      }

    }.bind(this), false);

  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Start/Restart a Game

  refreshVariables() {

    // Clear save state
    localStorage.removeItem('gufitrupi__itemsState');

    // Renders
    this.itemsState = new Object();

  }

  startNewGame( saveData ) {

    this.refreshVariables();
    
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
    ( paused ) ? divMenu.classList.add('paused') : divMenu.classList.add('new-game');
    
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
  }
  unpause() { 
    document.getElementById('mainMenu').classList.remove('show');
    this._pause = false;  
  }
  togglePause() { ( this.isPaused() ) ? this.unpause() : this.pause() }
  
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Loading
  loading(bool) {
    let display = ( bool ) ? 'flex' : 'none';
    document.getElementById('loading').style.display = display;
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
},{"../../assets/Player":1,"../../assets/scenario/Prototype/scenarioPrototype":3,"../../assets/scenario/Sandbox/scenarioSandbox":9,"../../gameProperties":39,"../assets/GlobalAssets":24,"../ui/UI":36,"./Collision":32,"./Render":34}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{}],36:[function(require,module,exports){
const UIitem = require('./_UIitem');
const UIitem_text = require('./_UIitem_text');

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
  }
}//class
module.exports = UI
},{"./_UIitem":37,"./_UIitem_text":38}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
class UIitem_text {

  constructor( text, x, y, font ) {
    
    this.hideSprite = false;
    
    this.text = text;

    // # Position
    this.x = x;
    this.y = y;
  
    // # Properties
    this.font = font;

  }
  
  // # Sets      
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
        
  // # Gets            
  getX() { return this.x; }
  getY() { return this.y; }
        
  // # Item Render
  render(ctx) {
        
    if ( this.hideSprite ) return;
  
    ctx.font =  this.font.size + " 'Press Start 2P'";
    ctx.fillStyle = this.font.color;
    ctx.fillText( this.text, this.x, this.y); 

  }
       
}//class
module.exports = UIitem_text;
  
},{}],39:[function(require,module,exports){
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
  window.debug = true; // Show debug squares
  window.debugCollision = false; // Show when objects collide
  window.autoload = true; // auto load a saved game
  window.god_mode = true; // Players won't die
},{}],40:[function(require,module,exports){
const Game = require('./engine/core/Game');
console.clear();
window.onload = function() {
  
  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
 
}

/**
 * 
 * TODO:
 * 
 *  - Clear SaveState on New Game
 */
},{"./engine/core/Game":33}]},{},[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,39,40])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2NlbnRlci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfZG9vcnMuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2VuZW15LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9zdGFnZV9saWZlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfRmxvb3IuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9XYWxsLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRG9vci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0VuZW15LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRmlyZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0hlYWwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9LZXkuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfUHVzaC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL09iamVjdF9UaHJvdy5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL1RlbGVwb3J0LmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvR2xvYmFsQXNzZXRzLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhbkJlUHVzaGVkLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ2FuSHVydC5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdy5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX1NjZW5hcmlvLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX1N0YWdlLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL0NvbGxpc2lvbi5qcyIsImNsaWVudC9lbmdpbmUvY29yZS9HYW1lLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL1JlbmRlci5qcyIsImNsaWVudC9lbmdpbmUvY29yZS9TcHJpdGUuanMiLCJjbGllbnQvZW5naW5lL3VpL1VJLmpzIiwiY2xpZW50L2VuZ2luZS91aS9fVUlpdGVtLmpzIiwiY2xpZW50L2VuZ2luZS91aS9fVUlpdGVtX3RleHQuanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiLCJjbGllbnQvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4aUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoeDAsIHkwLCBnYW1lUHJvcHMsIHBsYXllck51bWJlciwgcGxheWVyUHJvcHMpIHtcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICAgIGlmKCBwbGF5ZXJOdW1iZXIgPT0gMSApIHtcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX29uZScpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKCBwbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX3R3bycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNwcml0ZSA9IG5ldyBTcHJpdGUoIHRoaXMucGxheWVyU3ByaXRlLCAzMDAsIDk2MCwgMjAsIDQwKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7fTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcCA9IFtdO1xyXG4gICAgICB0aGlzLmRlZmF1bHRTdGVwID0gMTtcclxuICAgICAgdGhpcy5pbml0aWFsU3RlcCA9IDI7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDg7XHJcblxyXG4gICAgICAvLyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBBbmltYXRpb25cclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAxMjsgLy8gMTAwMCAvIEZQU1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgICB0aGlzLnggPSB4MDtcclxuICAgICAgdGhpcy55ID0geTA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLngwID0geDA7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgdGhpcy55MCA9IHkwO1xyXG4gICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2h1bmtTaXplOyAvL3B4XHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jaHVua1NpemUgKiAyOyAvL3B4XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwZWVkMCA9IDAuMTc7XHJcbiAgICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc3BlZWQwO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5uYW1lID0gXCJwbGF5ZXJfXCIgKyBwbGF5ZXJOdW1iZXI7XHJcbiAgICAgIHRoaXMucGxheWVyTnVtYmVyID0gcGxheWVyTnVtYmVyO1xyXG4gICAgICB0aGlzLnR5cGUgPSBcInBsYXllclwiO1xyXG5cclxuICAgICAgdGhpcy5ncmFiaW5nID0gZmFsc2U7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBFdmVudHMgIFxyXG4gICAgICBcclxuICAgICAgdGhpcy5pc0NvbGxpZGFibGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmlzTW92aW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSB0cnVlO1xyXG4gICAgXHJcbiAgICAgIC8vICMgQ29sbGlzaW9uXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uV2lkdGggPSB0aGlzLndpZHRoICogMC44O1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHRoaXMuaGVpZ2h0ICogMC4zO1xyXG4gICAgICB0aGlzLkNvbGxpc2lvblhGb3JtdWxhID0gdGhpcy53aWR0aCAqIDAuMTsgLy8gVXNlZCB0byBzZXQgY29sbGlzaW9uIFggd2hlbiBzZXR0aW5nIFggXHJcbiAgICAgIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgPSB0aGlzLmhlaWdodCAqIDAuNzsgXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWCA9IHgwICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYTtcclxuICAgICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyB0aGlzLkNvbGxpc2lvbllGb3JtdWxhO1xyXG5cclxuICAgICAgdGhpcy5jb2xsaXNpb25YMCA9IHRoaXMuY29sbGlzaW9uWDtcclxuICAgICAgdGhpcy5jb2xsaXNpb25ZMCA9IHRoaXMuY29sbGlzaW9uWTtcclxuXHJcbiAgICAgIC8vIEdyYWIvUGljayBJdGVtcyBDb2xsaXNpb24gQm94XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gMDtcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gMDtcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IDA7XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSAwO1xyXG5cclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gbnVsbDtcclxuXHJcbiAgICAgIC8vICMgTGlmZVxyXG4gICAgICB0aGlzLmRlZmF1bHRMaWZlcyA9IDY7XHJcbiAgICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5odXJ0Q29vbERvd25UaW1lID0gMjAwMDsgLy8yc1xyXG5cclxuICAgICAgLy8gUGxheWVyIFByb3BzIGlmIGhhc1xyXG4gICAgICBpZiggcGxheWVyUHJvcHMgKSB7XHJcbiAgICAgICAgdGhpcy5saWZlcyA9IHBsYXllclByb3BzLmxpZmVzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLyogXHJcbiAgICAgIEdyYWIvUGljayBJdGVtcyBDb2xsaXNpb24gQm94XHJcbiAgKi9cclxuXHJcbiAgICBjaGVja0dyYWJiaW5nT2JqZWN0cygpIHtcclxuICAgICAgbGV0IGhhc0dyYWJPYmplY3QgPSBmYWxzZTtcclxuICAgICAgLy8gQ2hlY2sgaWYgcGxheWVyIGhhcyBncmFiYmVkIGl0ZW1zXHJcbiAgICAgIGxldCByZW5kZXJlZEl0ZW1zID0gd2luZG93LmdhbWUuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCk7XHJcbiAgICAgIGZvciggbGV0IGkgaW4gcmVuZGVyZWRJdGVtcyApIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHJlbmRlcmVkSXRlbXNbaV07XHJcbiAgICAgICAgaWYoIGl0ZW0uZ3JhYmJlZCAmJiBpdGVtLnBsYXllcldob0dyYWJiZWQgPT0gdGhpcy5wbGF5ZXJOdW1iZXIgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gaXRlbTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgb2JqLmdyYWJIYW5kbGVyKHRoaXMucGxheWVyTnVtYmVyKTtcclxuICAgICAgICAgIHRoaXMuZ3JhYk9iamVjdCggb2JqICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICBoYXNHcmFiT2JqZWN0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYoICEgaGFzR3JhYk9iamVjdCApIHtcclxuICAgICAgICB0aGlzLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY2hlY2tJdGVtT25HcmFiQ29sbGlzaW9uQm94KCkge1xyXG4gICAgICByZXR1cm4gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpc0dyYWJpbmcoKSB7IHJldHVybiB0aGlzLmdyYWJpbmc7IH1cclxuICAgIHNldE5vdEdyYWJiaW5nKCl7XHJcbiAgICAgIHRoaXMuZ3JhYmluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlR3JhYmVkT2JqZWN0KCkgeyBcclxuICAgICAgdGhpcy5ncmFiaW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdHJpZ2dlckdyYWIoKXtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIGhhcyBhIFwiX0NhbkdyYWJcIiBpdGVtIGNvbGxpZGluZyB3aXRoIGdyYWIgaGl0IGJveCBhbmQgXCJwaWNrXCIgaXRlbVxyXG4gICAgICBpZiggISB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgaWYoIG9iamVjdCAmJiBvYmplY3QuY2FuR3JhYiApIHtcclxuICAgICAgICAgIGlmKCBvYmplY3QuaXNHcmFiYmVkKCkgKSByZXR1cm47IC8vIGF2b2lkIHBsYXllcnMgZ3JhYmJpbmcgdGhlIHNhbWUgb2JqZWN0XHJcbiAgICAgICAgICBvYmplY3QuZ3JhYkhhbmRsZXIodGhpcy5wbGF5ZXJOdW1iZXIpO1xyXG4gICAgICAgICAgdGhpcy5ncmFiT2JqZWN0KCBvYmplY3QgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ncmFiaW5nID0gIXRoaXMuZ3JhYmluZztcclxuICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgICAvLyBEcm9wIGlmIGhhcyBub3RoaW5nIG8gcGxheWVyIGdyYWIgY29sbGlzaW9uIGJveFxyXG4gICAgICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2tBbGwodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgICAgIGlmKCAhb2JqZWN0ICkge1xyXG4gICAgICAgICAgICB0aGlzLm9iamVjdEdyYWJiZWQuZHJvcCggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24sIHRoaXMuZ2V0SGVpZ2h0KCkgKTsgLy8gVGhyb3cgYXdheSBvYmplY3RcclxuICAgICAgICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gZmFsc2U7IC8vIHJlbW92ZSBncmFiYmVkXHJcbiAgICAgICAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgaXRlbXNcclxuICAgIHRyaWdnZXJVc2UoKSB7XHJcbiAgICAgIC8vIElmIGhhcyBvYmplY3QgaW4gaGFuZCwgdXNlIGl0XHJcbiAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLnVzZSggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24sIHRoaXMuZ2V0SGVpZ2h0KCksIHRoaXMgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJZiBub3QsIHRyeSB0byB1c2UgdGhlIG9uZSBvbiBmcm9udFxyXG4gICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgaWYoIG9iamVjdCAmJiBvYmplY3QuY2FuVXNlICkge1xyXG4gICAgICAgICAgb2JqZWN0LnVzZUhhbmRsZXIoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGg7IH1cclxuICAgIGdldEdyYWJDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvblg7IH1cclxuICAgIGdldEdyYWJDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvblk7IH1cclxuXHJcbiAgICAvLyBBdHRhY2ggYW4gaXRlbSB0byBwbGF5ZXJcclxuICAgIGdyYWJPYmplY3QoIG9iamVjdCApIHtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gb2JqZWN0O1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBHcmFiQ29sbGlzaW9uIFggYW5kIFkgY29uc2lkZXJpbmcgcGxheWVyIGxvb2sgZGlyZWN0aW9uXHJcbiAgICB1cGRhdGVHcmFiQ29sbGlzaW9uWFkoKSB7XHJcbiAgICAgIHN3aXRjaCh0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbikge1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblkgKyB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlICAndXAnOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblkgLSB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQ7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblggLSB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YICsgdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgaGFzIHNvbWUgb2JqZWN0IGdyYWJiZWQsIHVwZGF0ZSBwb3NpdGlvblxyXG4gICAgICBpZiggdGhpcy5vYmplY3RHcmFiYmVkICkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlR3JhYmJlZE9iamVjdFBvc2l0aW9uKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVHcmFiYmVkT2JqZWN0UG9zaXRpb24oKSB7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51cGRhdGVYKCB0aGlzLmdldFgoKSApO1xyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLm9iamVjdEdyYWJiZWQuZ2V0SGVpZ2h0KCkgKyAgKCB0aGlzLmdldEhlaWdodCgpICogMC4xICkgICk7XHJcbiAgICB9XHJcblxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG4gICAgICAgIFxyXG4gIC8qXHJcbiAgICBTcHJpdGUgLyBBbmltYXRpb25cclxuICAqL1xyXG5cclxuICAgIGdldFNwcml0ZVByb3BzKCkgeyByZXR1cm4gdGhpcy5zcHJpdGVQcm9wczsgfVxyXG5cclxuICAgIFxyXG5cdFx0aGlkZVBsYXllcigpIHsgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgfVxyXG4gICAgc2hvd1BsYXllcigpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuICAgIFxyXG4gICAgbG9va0Rvd24oKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZG93bic7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTdGVwc1xyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNjcgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3ICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tVcCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICd1cCc7XHJcbiAgICAgIFxyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwOSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMTAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTExICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDExMiApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxNyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxOCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxOSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyMiApO1xyXG4gICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tSaWdodCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgIFxyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNzkgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggODAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggODEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggODIgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMzcgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cdFx0bG9va0xlZnQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgIFxyXG4gICAgICBpZiggdGhpcy5pc0dyYWJpbmcoKSApIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTIgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggOTcgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNDkgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNTAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNTIgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuXHQgICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICAgIGluY3JlYXNlU3RlcCgpIHtcclxuICAgICAgaWYodGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSkge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICAgICAgaWYoIHRoaXMuc3RlcENvdW50ID4gdGhpcy5tYXhTdGVwcyApIHtcclxuICAgICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5pbml0aWFsU3RlcDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc2V0U3RlcCgpIHtcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICBzd2l0Y2ggKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApIHtcclxuICAgICAgICBjYXNlICdsZWZ0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmlnaHQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndXAnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZG93bic6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldExvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbikgeyB0aGlzLmxvb2tEaXJlY3Rpb24gPSBsb29rRGlyZWN0aW9uOyB9XHJcblx0XHR0cmlnZ2VyTG9va0RpcmVjdGlvbihkaXJlY3Rpb24pIHsgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgfVxyXG5cdFx0cmVzZXRQb3NpdGlvbigpIHtcclxuXHRcdFx0dGhpcy5zZXRYKCB0aGlzLngwICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy55MCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuY29sbGlzaW9uWDAgKTtcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmNvbGxpc2lvblkwICk7XHJcbiAgICB9XHJcblxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG4gICAgXHJcbiAgLypcclxuICAgIE1vdmVtZW50XHJcbiAgKi9cclxuICAgIFxyXG4gICAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgXHJcbiAgICBnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuXHJcbiAgICBzZXRYKHgsIHNldENvbGxpc2lvbikgeyBcclxuICAgICAgdGhpcy54ID0geDsgXHJcbiAgICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblgoIHggKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhICk7XHJcbiAgICB9XHJcbiAgICBzZXRZKHksIHNldENvbGxpc2lvbikgeyBcclxuICAgICAgdGhpcy55ID0geTsgXHJcbiAgICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblkoIHkgKyB0aGlzLkNvbGxpc2lvbllGb3JtdWxhICk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFNwZWVkKHNwZWVkKSB7IHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHNwZWVkOyB9XHJcbiAgICBcclxuXHRcdG1vdkxlZnQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92UmlnaHQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZVcCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdkRvd24oKSB7ICBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBoYW5kbGVNb3ZlbWVudCgga2V5c0Rvd24gKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMSBDb250cm9sc1xyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMSApIHtcclxuICAgICAgICBpZiAoMzcgaW4ga2V5c0Rvd24pIHRoaXMubW92TGVmdCgpOyAgLy8gTGVmdFxyXG4gICAgICAgIGlmICgzOCBpbiBrZXlzRG93bikgdGhpcy5tb3ZVcCgpOyAgICAvLyBVcCAgXHJcbiAgICAgICAgaWYgKDM5IGluIGtleXNEb3duKSB0aGlzLm1vdlJpZ2h0KCk7IC8vIFJpZ2h0XHJcbiAgICAgICAgaWYgKDQwIGluIGtleXNEb3duKSB0aGlzLm1vdkRvd24oKTsgIC8vIERvd25cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIDIgQ29udHJvbHNcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDIgKSB7XHJcbiAgICAgICAgaWYgKDY1IGluIGtleXNEb3duKSB0aGlzLm1vdkxlZnQoKTsgIC8vIExlZnQgID0+IEFcclxuICAgICAgICBpZiAoODcgaW4ga2V5c0Rvd24pIHRoaXMubW92VXAoKTsgICAgLy8gVXAgICAgPT4gV1xyXG4gICAgICAgIGlmICg2OCBpbiBrZXlzRG93bikgdGhpcy5tb3ZSaWdodCgpOyAvLyBSaWdodCA9PiBEXHJcbiAgICAgICAgaWYgKDgzIGluIGtleXNEb3duKSB0aGlzLm1vdkRvd24oKTsgIC8vIERvd24gID0+IFNcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVLZXlVcChrZXlVcCkge1xyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIDFcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgaWYgKGtleVVwID09IDE3KSB0aGlzLnRyaWdnZXJHcmFiKCk7ICAvLyBHcmFiID0+IENUUkxcclxuICAgICAgICBpZiAoa2V5VXAgPT0gMzIpIHRoaXMudHJpZ2dlclVzZSgpOyAgIC8vIFVzZSA9PiBTcGFjZVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQbGF5ZXIgMlxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoa2V5VXAgPT0gNzApIHRoaXMudHJpZ2dlckdyYWIoKTsgIC8vIEdyYWIgPT4gRlxyXG4gICAgICAgIGlmIChrZXlVcCA9PSA2OSkgdGhpcy50cmlnZ2VyVXNlKCk7ICAvLyBVc2UgPT4gRVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHRcdFxyXG4gIC8qXHJcbiAgICBDb2xsaXNpb25cclxuICAqL1xyXG4gICAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICAgIHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcblxyXG4gICAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgIHJldHVybiB4ICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMjsgXHJcbiAgICB9XHJcbiAgICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICAgIGxldCB5ID0gKCBfeSApID8gX3kgOiB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuICAgICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICAgIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gICAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuXHRcdG5vQ29sbGlzaW9uKCkge1xyXG5cdFx0XHQvLyBXaGF0IGhhcHBlbnMgaWYgdGhlIHBsYXllciBpcyBub3QgY29sbGlkaW5nP1xyXG5cdFx0XHR0aGlzLnNldFNwZWVkKHRoaXMuc3BlZWQwKTsgLy8gUmVzZXQgc3BlZWRcclxuICAgIH1cclxuICAgICAgXHJcbiAgICBjb2xsaXNpb24ob2JqZWN0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblx0XHRcclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHJcblx0LypcclxuICAgIExpZmUgLyBIZWFsIC8gRGVhdGhcclxuICAqL1x0XHJcbiAgICBnZXRMaWZlcygpIHsgcmV0dXJuIHRoaXMubGlmZXM7IH1cclxuXHJcbiAgICBodXJ0UGxheWVyKCBhbW91bnQgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBIdXJ0IHBsYXllclxyXG4gICAgICAgIHRoaXMubGlmZXMgLT0gYW1vdW50O1xyXG4gICAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMCApIHRoaXMubGlmZXMgPSAwO1xyXG5cclxuICAgICAgICAvLyBTdGFydCBjb29sZG93blxyXG4gICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdGhpcy5odXJ0Q29vbERvd25UaW1lKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgcGxheWVyIGRpZWRcclxuICAgICAgICB0aGlzLmNoZWNrUGxheWVyRGVhdGgoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhlYWxQbGF5ZXIoIGFtb3VudCApIHtcclxuICAgICAgdGhpcy5saWZlcyArPSBwYXJzZUludChhbW91bnQpO1xyXG4gICAgICBpZiggdGhpcy5saWZlcyA+IHRoaXMuZGVmYXVsdExpZmVzICkgdGhpcy5saWZlcyA9IHRoaXMuZGVmYXVsdExpZmVzO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrUGxheWVyRGVhdGgoKSB7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMSAmJiAhd2luZG93LmdvZF9tb2RlICkge1xyXG4gICAgICAgd2luZG93LmdhbWUubmV3R2FtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXHJcbiAgICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHRcdFxyXG4gICAgLypcclxuICAgICAgR2VuZXJhbFxyXG4gICAgKi9cclxuICAgICAgICBcclxuICAgICAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gICAgICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgICAgXHJcbiAgICAgIGdldFBsYXllck51bWJlcigpIHsgcmV0dXJuIHRoaXMucGxheWVyTnVtYmVyOyB9XHJcblxyXG4gICAgICBnZXRDb2xvcigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuICAgICAgICBcclxuICAgICAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICAgIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgICBcclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuXHRcclxuICAvKiAgXHJcbiAgICBSZW5kZXJcclxuICAqL1xyXG4gIFx0XHRcclxuXHQgIHJlbmRlcihjdHgpIHtcclxuICAgICAgXHJcbiAgICAgIC8vIEJsaW5rIHBsYXllciBpZiBpdCBjYW4ndCBiZSBodXJ0XHJcbiAgICAgIGlmKCAhIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9ICF0aGlzLmhpZGVTcHJpdGU7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gV2hhdCB0byBkbyBldmVyeSBmcmFtZSBpbiB0ZXJtcyBvZiByZW5kZXI/IERyYXcgdGhlIHBsYXllclxyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgICAgfSBcclxuICAgICAgXHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRTcHJpdGUoKSwgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZ2V0S2V5V2lkdGgoKSwgdGhpcy5zcHJpdGUuZ2V0S2V5SGVpZ2h0KCksIFxyXG4gICAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICAgKTtcdFxyXG5cclxuICAgICAgLy8gREVCVUcgQ09MTElTSU9OXHJcbiAgICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMjU1LCAwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSApO1xyXG5cclxuICAgICAgICBsZXQgdGV4dCA9IFwiWDogXCIgKyBNYXRoLnJvdW5kKHRoaXMuZ2V0WCgpKSArIFwiIFk6XCIgKyBNYXRoLnJvdW5kKHRoaXMuZ2V0WSgpKTtcclxuICAgICAgICBjdHguZm9udCA9ICBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMuZ2V0WCgpIC0gMjAsIHRoaXMuZ2V0WSgpIC0gMjApO1xyXG5cclxuICAgICAgICAvLyBHcmFiIGNvbGxpc2lvblxyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwgMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCggdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcblx0XHR9O1xyXG5cclxuXHJcbiAgICBydW4oKSB7XHJcbiAgICAgIHRoaXMuY2hlY2tHcmFiYmluZ09iamVjdHMoKTtcclxuICAgICAgdGhpcy5sb29rRGlyZWN0aW9uID0gdGhpcy5sb29rRG93bigpO1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfVxyXG5cdFx0XHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xyXG4iLCIvKlxyXG4gICAgUHJvdG90eXBlIFNjZW5hcmlvXHJcbiovXHJcbmNvbnN0IF9TY2VuYXJpbyA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1NjZW5hcmlvJyk7XHJcblxyXG5jb25zdCBfU19jZW50ZXIgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9jZW50ZXInKTtcclxuY29uc3QgX1NfdXAgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV91cCcpO1xyXG5jb25zdCBfU19yaWdodCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX3JpZ2h0Jyk7XHJcbmNvbnN0IF9TX2JvdHRvbSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2JvdHRvbScpO1xyXG5jb25zdCBfU19sZWZ0ID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfbGVmdCcpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9Qcm90b3R5cGUgZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgc2F2ZURhdGEpe1xyXG4gICAgc3VwZXIoY3R4LCBjYW52YXMsIFwicHJvdG90eXBlXCIpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhZ2VJZCA9IFwiY2VudGVyXCI7XHJcbiAgICBcclxuICAgIC8vIERlZmluZSB3aGljaCBzdGFnZSB3aWxsIGxvYWQgb24gZmlyc3QgcnVuXHJcbiAgICB0aGlzLnN0YWdlVG9Mb2FkID0gKCBzYXZlRGF0YSApID8gc2F2ZURhdGEuc2NlbmFyaW8uc3RhZ2VJZCA6IHRoaXMuZGVmYXVsdFN0YWdlSWQ7XHJcbiAgICBcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFN0YWdlc1xyXG4gIHNldFN0YWdlKHN0YWdlX2lkLCBmaXJzdFN0YWdlKSB7XHJcbiAgICBcclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICBcclxuICAgIGxldCBfc3RhZ2UgPSBudWxsO1xyXG5cclxuICAgIC8vIENoZWNrIHdoaWNoIHN0YWdlIHdpbGwgbG9hZFxyXG4gICAgc3dpdGNoKHN0YWdlX2lkKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgbGV0IHNfY2VudGVyID0gbmV3IF9TX2NlbnRlcigpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfY2VudGVyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgbGV0IHNfdXAgPSBuZXcgX1NfdXAoKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX3VwO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICBsZXQgc19sZWZ0ID0gbmV3IF9TX2xlZnQoKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX2xlZnQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICBsZXQgc19yaWdodCA9IG5ldyBfU19yaWdodCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfcmlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2JvdHRvbSc6XHJcbiAgICAgICAgbGV0IHNfYm90dG9tID0gbmV3IF9TX2JvdHRvbSgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfYm90dG9tO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMb2FkIHRoZSBzdGFnZSBkZWZpbmVkXHJcbiAgICAgIHRoaXMubG9hZFN0YWdlKF9zdGFnZSwgZmlyc3RTdGFnZSk7XHJcbiAgfVxyXG4gXHJcbiAgLy8gU2V0IERlZmF1bHQgU3RhZ2VcclxuICBydW4oKSB7XHJcbiAgICB0aGlzLnNldFN0YWdlKCB0aGlzLnN0YWdlVG9Mb2FkLCB0cnVlKTsgICAgXHJcblx0fVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBzY2VuYXJpb1Byb3RvdHlwZTsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQm90dG9tIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiYm90dG9tXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMiwgICBvYiwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y19ibCwgICAgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3Y19iciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQm90dG9tO1xyXG4iLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0NlbnRlciBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImNlbnRlclwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNztcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYyLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIGl3Y19iciwgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y19ibCwgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgICAgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIG9iLCAgICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiBdLFxyXG4gICAgICBbIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICBpd2NfdHIsICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBpd2NfdGwsICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDIgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICd1cCcgfTtcclxuICAgIGxldCB0cF8wMyA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICAgICB0YXJnZXRTdGFnZTogJ3JpZ2h0JyB9O1xyXG4gICAgbGV0IHRwXzA0ID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnYm90dG9tJyB9O1xyXG4gICAgbGV0IHRwXzA1ID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJsZWZ0XCIsICAgICAgIHRhcmdldFN0YWdlOiAnbGVmdCcgfTtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6IFwiZmlyZVwiLCB0eXBlOiBcIjAxXCJ9OyBcclxuXHJcbiAgICBsZXQgdGJsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRiciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fcmlnaHRcIiB9OyBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMiwgICB0cF8wMiwgICBmYWxzZSwgICB0cF8wMiwgICB0cF8wMiwgICB0cF8wMiwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wNSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMyBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wNSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdGJsLCAgICAgdGJyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCB0dGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdHRyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9yaWdodFwiIH07ICBcclxuICAgIGxldCB0bWwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdG1yID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9yaWdodFwiIH07ICBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHR0bCwgICAgIHR0ciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0bWwsICAgICB0bXIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9DZW50ZXI7IiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0xlZnQgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJsZWZ0XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2NfdGwsIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIG9iLCAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjIsICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3Y19ibCwgd2IsICAgIHdiLCAgICB3YiwgICAgIHdiLCAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9MZWZ0O1xyXG4iLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfUmlnaHQgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJyaWdodFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3Y190ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3Y19iciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwibGVmdFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9SaWdodDtcclxuIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX1VwIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwidXBcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTs7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2NfdGwsICAgICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd2NfdHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwiYm90dG9tXCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX1VwXHJcbiIsIi8qXHJcbiAgU2FuZGJveCBTY2VuYXJpb1xyXG4qL1xyXG5jb25zdCBfU2NlbmFyaW8gPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TY2VuYXJpbycpO1xyXG5cclxuY29uc3QgU3RhZ2VfQ2VudGVyID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfY2VudGVyJyk7XHJcbmNvbnN0IFN0YWdlX0xpZmUgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9saWZlJyk7XHJcbmNvbnN0IFN0YWdlX0VuZW15ID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfZW5lbXknKTtcclxuY29uc3QgU3RhZ2VfRG9vcnMgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9kb29ycycpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9TYW5kYm94IGV4dGVuZHMgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHNhdmVEYXRhKXtcclxuICAgIHN1cGVyKGN0eCwgY2FudmFzLCBcInNhbmRib3hcIik7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGFnZUlkID0gXCJjZW50ZXJcIjtcclxuICAgIFxyXG4gICAgLy8gRGVmaW5lIHdoaWNoIHN0YWdlIHdpbGwgbG9hZCBvbiBmaXJzdCBydW5cclxuICAgIHRoaXMuc3RhZ2VUb0xvYWQgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5zY2VuYXJpby5zdGFnZUlkIDogdGhpcy5kZWZhdWx0U3RhZ2VJZDtcclxuXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICAvLyBTYXZlIGl0ZW1zIHN0YXRlIGJlZm9yZSBjbGVhclxyXG4gICAgaWYoICFmaXJzdFN0YWdlICkge1xyXG4gICAgICB0aGlzLnNhdmVJdGVtc1N0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuXHJcbiAgICAvLyBTZXQgQWN0dWFsIFN0YWdlIElEXHJcbiAgICB0aGlzLnNldEFjdHVhbFN0YWdlSWQoIHN0YWdlX2lkICk7XHJcbiAgICBcclxuICAgIGxldCBfc3RhZ2UgPSBudWxsO1xyXG5cclxuICAgIC8vIENoZWNrIHdoaWNoIHN0YWdlIHdpbGwgbG9hZFxyXG4gICAgc3dpdGNoKHN0YWdlX2lkKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgX3N0YWdlID0gbmV3IFN0YWdlX0NlbnRlcigpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsaWZlJzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgU3RhZ2VfTGlmZSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdlbmVteSc6XHJcbiAgICAgICAgX3N0YWdlID0gbmV3IFN0YWdlX0VuZW15KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvb3JzJzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgU3RhZ2VfRG9vcnMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2FkIHRoZSBzdGFnZSBkZWZpbmVkXHJcbiAgICB0aGlzLmxvYWRTdGFnZShfc3RhZ2UsIGZpcnN0U3RhZ2UpO1xyXG4gIH1cclxuIFxyXG4gIC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5zZXRTdGFnZSggdGhpcy5zdGFnZVRvTG9hZCwgdHJ1ZSApOyAgICBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvU2FuZGJveDsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0NlbnRlciBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImNlbnRlclwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNztcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA2O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgaXdjX2JyLCAgICBmMSwgICAgaXdjX2JsLCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfYnIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfYmwgXSxcclxuICAgICAgWyBmMSwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGl3Y190ciwgICBmMSwgICAgZjEsICAgIG9iLCAgICBvYiwgICAgb2IsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y190bCBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIG9iLCAgICBmMiwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgb2IsICAgIG9iLCAgICBvYiwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgb2IsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfbGYgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdsaWZlJyB9O1xyXG4gICAgbGV0IHRwX2VuZW15ID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgIHRhcmdldFN0YWdlOiAnZW5lbXknIH07XHJcbiAgICBsZXQgdHBfZG9vcnMgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICB0YXJnZXRTdGFnZTogJ2Rvb3JzJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgdGJsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRiciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fcmlnaHRcIiB9OyBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9sZiwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwX2Rvb3JzLGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfZW5lbXkgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdGJsLCAgICAgdGJyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCB0dGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdHRyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9yaWdodFwiIH07ICBcclxuICAgIGxldCB0bWwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdG1yID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9yaWdodFwiIH07ICBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHR0bCwgICAgIHR0ciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0bWwsICAgICB0bXIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9DZW50ZXI7IiwiY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBEb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0Rvb3InKTtcclxuY29uc3QgS2V5ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0tleScpO1xyXG5jb25zdCBPYmplY3RfVGhyb3cgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1Rocm93Jyk7XHJcbmNvbnN0IE9iamVjdF9QdXNoID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL09iamVjdF9QdXNoJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfRG9vcnMgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJkb29yc1wiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gMDtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwia2V5XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBLZXkoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSApOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF90aHJvd1wiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1Rocm93KGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3B1c2hcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9QdXNoKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y19ibCBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX3RsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICAgICB3YiwgICAgd2IsICAgICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiAnZmlyZScsIHR5cGU6ICcwMSd9OyBcclxuXHJcbiAgICBsZXQgZW5lbXkgPSB7IG5hbWU6ICdlbmVteScsIHR5cGU6ICcwMSd9OyBcclxuICAgIGxldCBibm5hID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiYW5hbmEnfTsgXHJcbiAgICBsZXQgYmVycnkgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JlcnJ5J307IFxyXG5cclxuICAgIGxldCBicnJsID0geyBuYW1lOiAnb2JqZWN0X3Rocm93JywgdHlwZTogJ2JhcnJlbCd9OyBcclxuICAgIGxldCBzdG5lID0geyBuYW1lOiAnb2JqZWN0X3B1c2gnLCB0eXBlOiAnc3RvbmUnfTsgXHJcblxyXG4gICAgbGV0IGZuY2UgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImZlbmNlXCJ9O1xyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ3JpZ2h0JywgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IGRnYmwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV9ibCd9OyBcclxuICAgIGxldCBkZ3RsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyYXlfdGwnfTsgXHJcbiAgICBsZXQgZGdiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X2JyJ307IFxyXG4gICAgbGV0IGRndHIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV90cid9OyBcclxuICAgIFxyXG4gICAgbGV0IGRwYmwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX2JsJ307IFxyXG4gICAgbGV0IGRwdGwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX3RsJ307IFxyXG4gICAgbGV0IGRwYnIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX2JyJ307IFxyXG4gICAgbGV0IGRwdHIgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfcHVycGxlX3RyJ307IFxyXG4gICAgXHJcbiAgICBsZXQgZHJibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfYmwnfTsgXHJcbiAgICBsZXQgZHJ0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfdGwnfTsgXHJcbiAgICBsZXQgZHJiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfYnInfTsgXHJcbiAgICBsZXQgZHJ0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9yZWRfdHInfTsgXHJcbiAgICBcclxuICAgIGxldCBkZ3JibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl9ibCd9OyBcclxuICAgIGxldCBkZ3J0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl90bCd9OyBcclxuICAgIGxldCBkZ3JiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl9icid9OyBcclxuICAgIGxldCBkZ3J0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmVlbl90cid9OyBcclxuXHJcbiAgICBsZXQga19nID0geyBuYW1lOiAna2V5JywgdHlwZTogJ2dyYXknfTsgXHJcbiAgICBsZXQga19wID0geyBuYW1lOiAna2V5JywgdHlwZTogJ3B1cnBsZSd9OyBcclxuICAgIGxldCBrX3IgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAncmVkJ307IFxyXG4gICAgbGV0IGtfZ3IgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAnZ3JlZW4nfTsgXHJcblxyXG5cclxuXHJcbiAgICBsZXQgaXRlbXNCb3R0b20gPSBbXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgICBmbmNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgICBmbmNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZuY2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgICBmbmNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGRndGwsICAgIGRndHIsICAgIGZuY2UsICAgIGRwdGwsICAgIGRwdHIsICAgIGZuY2UsICAgIGRydGwsICAgIGRydHIsICAgIGZuY2UsICAgIGRncnRsLCAgIGRncnRyLCAgICBmbmNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmbmNlLCAgIGRnYmwsICAgIGRnYnIsICAgIGZuY2UsICAgIGRwYmwsICAgIGRwYnIsICAgIGZuY2UsICAgIGRyYmwsICAgIGRyYnIsICAgIGZuY2UsICAgIGRncmJsLCAgIGRncmJyLCAgICBmbmNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAga19nLCAgICAgZmFsc2UsICAgZmFsc2UsICAga19wLCAgICAgZmFsc2UsICAgZmFsc2UsICAga19yLCAgICAgZmFsc2UsICAgZmFsc2UsICAga19nciwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBicnJsLCAgIGZhbHNlIF0sXHJcbiAgICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfRG9vcnM7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuY29uc3QgRW5lbXkgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRW5lbXknKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgT2JqZWN0X1B1c2ggPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1B1c2gnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9FbmVteSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImVuZW15XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZW5lbXlcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEVuZW15KGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3Rocm93XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfVGhyb3coaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfcHVzaFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1B1c2goaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgICAgd3QsICAgIHd0LCAgICAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgaXdjX2JyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBmMSwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y190ciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICAgICB3YiwgICAgd2IsICAgICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiAnZmlyZScsIHR5cGU6ICcwMSd9OyBcclxuXHJcbiAgICBsZXQgZW5lbXkgPSB7IG5hbWU6ICdlbmVteScsIHR5cGU6ICcwMSd9OyBcclxuICAgIGxldCBibm5hID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiYW5hbmEnfTsgXHJcbiAgICBsZXQgYmVycnkgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JlcnJ5J307IFxyXG5cclxuICAgIGxldCBicnJsID0geyBuYW1lOiAnb2JqZWN0X3Rocm93JywgdHlwZTogJ2JhcnJlbCd9OyBcclxuICAgIGxldCBzdG5lID0geyBuYW1lOiAnb2JqZWN0X3B1c2gnLCB0eXBlOiAnc3RvbmUnfTsgXHJcblxyXG4gICAgbGV0IHRwX2MgPSB7IG5hbWU6ICd0ZWxlcG9ydCcsIHR5cGU6ICcnLCB0ZWxlcG9ydFR5cGU6ICdyZWxhdGl2ZScsIGNhbWVGcm9tOiAnbGVmdCcsIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG5cclxuICAgIGxldCBpdGVtc0JvdHRvbSA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBlbmVteSwgICBlbmVteSwgICBlbmVteSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBlbmVteSwgICBlbmVteSwgICBlbmVteSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZW5lbXksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGZhbHNlLCAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfYywgICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgYnJybCwgICBmYWxzZSwgICBzdG5lLCAgICBmYWxzZSwgICBicnJsLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBicnJsLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXTtcclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBpdGVtc0JvdHRvbS5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0VuZW15OyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IEhlYWwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vSGVhbCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0xpZmUgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJsaWZlXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiaGVhbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgSGVhbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICAgICB3dCwgICAgd3QsICAgICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICBpd2NfdHIsICAgIGYxLCAgIGl3Y190bCwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6ICdmaXJlJywgdHlwZTogJzAxJ307IFxyXG4gICAgbGV0IGJubmEgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JhbmFuYSd9OyBcclxuICAgIGxldCBiZXJyeSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmVycnknfTsgXHJcblxyXG4gICAgbGV0IHRwX2MgPSB7IG5hbWU6ICd0ZWxlcG9ydCcsIHR5cGU6ICcnLCB0ZWxlcG9ydFR5cGU6ICdyZWxhdGl2ZScsIGNhbWVGcm9tOiAnYm90dG9tJywgICAgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG5cclxuICAgIGxldCBpdGVtc0JvdHRvbSA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmlyZSwgICBibm5hLCAgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgYmVycnksICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmlyZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgYmVycnksICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmlyZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgZmlyZSwgICBmaXJlLCAgIGZpcmUsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBibm5hLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmlyZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJlcnJ5LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9jLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXTtcclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBpdGVtc0JvdHRvbS5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0xpZmU7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfRmxvb3IgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggRmxvb3JcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDFcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjQ5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCIwMlwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg5MzApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBwbGF5ZXIuc2V0VGVsZXBvcnRpbmcoZmFsc2UpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfRmxvb3I7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfd2FsbCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJCZWFjaCBXYWxsXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG5cclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCJ0b3BcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNzMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNzgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg3OSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzOCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzOSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjAwKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjAxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcIndhdGVyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDYzMyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJvYnN0YWNsZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNTApOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZlbmNlXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTIpOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjQpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI1KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX21pZGRsZV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIxMCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9taWRkbGVfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoODcpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfYm90dG9tX2xlZnRcIjpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTQ4KTtcclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKHRoaXMueCArIHRoaXMuY2h1bmtTaXplICogMC43KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE0OSk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uIFNpemVcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbldpZHRoKCB0aGlzLmNodW5rU2l6ZSAqIDAuMyApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEJlYWNoX3dhbGw7IiwiY29uc3QgX0NhbkNvbGxlY3QgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5Db2xsZWN0Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgRG9vciBleHRlbmRzIF9DYW5Db2xsZWN0IHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZSkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiZG9vclwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBzdGFnZTogc3RhZ2VcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKSwgMTk4MCwgMTA1NSwgMzIsIDMyKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNhbkNvbGxlY3RQcm9wcyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogZmFsc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMudHlwZSA9ICdkb29yJztcclxuXHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICBjaGVja1NhdmVkSXRlbVN0YXRlKCkge1xyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKSApOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICkge1xyXG4gICAgICBsZXQgaXRlbVNhdmVkU3RhdGUgPSBzYXZlZEl0ZW1zU3RhdGVbdGhpcy5nZXROYW1lKCldO1xyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuY29sbGVjdGVkID09PSB0cnVlICl7IC8vIENoZWNrIGlmIHRoaXMgaXRlbSBpcyBhbHJlYWR5IGdyYWJiZWRcclxuICAgICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAvLyBHcmF5XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxMyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1MSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyYXlfdHJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyYXknKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Mik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIC8vIFB1cnBsZVxyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE1KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcHVycGxlX3RsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1Myk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV9iclwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAvLyBSZWRcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX2JsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9yZWRfYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgLy8gR3JlZW5cclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmVlbl90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjU3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fYnJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMyMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcblxyXG4gIC8vIE9wZW4gZG9vciA9IGhpZGUgYWxsIGRvb3JzIHdpdGggc2FtZSBjb2RlIFxyXG4gIG9wZW4oKSB7XHJcbiAgICBsZXQgb2JqcyA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5nZXRDb2xJdGVucygpO1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmpzKSB7XHJcbiAgICAgIGlmKCBvYmpzW2ldLnR5cGUgPT0gJ2Rvb3InICkge1xyXG4gICAgICAgIGlmKCBvYmpzW2ldLmdldENvZGUoKSA9PSB0aGlzLmdldENvZGUoKSApIHtcclxuICAgICAgICAgIG9ianNbaV0uY29sbGVjdCgpO1xyXG4gICAgICAgICAgb2Jqc1tpXS5oaWRlKCk7XHJcbiAgICAgICAgICBvYmpzW2ldLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBEb29yOyIsImNvbnN0IF9DYW5IdXJ0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuSHVydCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEVuZW15IGV4dGVuZHMgX0Nhbkh1cnQge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcImVuZW15XCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDJcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5IdXJ0UHJvcHMgPSB7XHJcbiAgICAgIGFtb3VudDogMVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCB7fSwgZXZlbnRzLCBjYW5IdXJ0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAxO1xyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IDE7XHJcbiAgICBcclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcbiAgICB0aGlzLmNvbGxpc2lvblkgPSB5MCArIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uQ291bnQgPSAwO1xyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzcHJpdGUgRlBTIEFuaW1hdGlvblxyXG4gICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAoIHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5mcHMgLyAyICk7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZSA9IG5ldyBTcHJpdGUoIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfZW5lbXknKSwgMzAwLCA5NjAsIDIwLCA0MCk7XHJcblxyXG4gICAgdGhpcy5zdGVwID0gbmV3IE9iamVjdCgpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICB0aGlzLmluaXRpYWxTdGVwID0gMjtcclxuICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgIHRoaXMubWF4U3RlcHMgPSA0O1xyXG5cclxuICAgIHRoaXMuZGlyZWN0aW9uQ291bnRkb3duID0gMDtcclxuICAgIHRoaXMucmFuZERpcmVjdGlvbiA9IDE7XHJcblxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDA7XHJcbiAgICB0aGlzLnkgPSB5MDtcclxuICAgIFxyXG4gICAgdGhpcy54MCA9IHgwOyAvLyBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICB0aGlzLnkwID0geTA7XHJcbiAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMuc3BlZWQwID0gMC4yO1xyXG4gICAgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplICogdGhpcy5zcGVlZDA7XHJcbiAgICB0aGlzLnR5cGUgPSBcImVuZW15XCI7XHJcbiAgICBcclxuICAgIC8vICMgTGlmZVxyXG4gICAgdGhpcy5kZWZhdWx0TGlmZXMgPSAyO1xyXG4gICAgdGhpcy5saWZlcyA9IHRoaXMuZGVmYXVsdExpZmVzO1xyXG4gICAgdGhpcy5kZWFkID0gZmFsc2U7XHJcbiAgICB0aGlzLnN0b3BSZW5kZXJpbmdNZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICB0aGlzLmh1cnRDb29sRG93blRpbWUgPSAxMDAwOyAvLzJzXHJcblxyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlMCA9IDU7XHJcbiAgICB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2UgPSB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2UwO1xyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2U7XHJcblxyXG4gICAgdGhpcy5hd2FyZU9mUGxheWVyID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy54RnJvbVBsYXllckRpc3RhbmNlID0gMDtcclxuICAgIHRoaXMuWUZyb21QbGF5ZXJEaXN0YW5jZSA9IDA7XHJcblxyXG4gICAgdGhpcy5ydW5FbmVteSgpO1xyXG4gIH1cclxuXHJcbiAgaXNEZWFkKCkgeyByZXR1cm4gdGhpcy5kZWFkOyB9XHJcbiAgc2V0RGVhZChib29sKSB7IHRoaXMuZGVhZCA9IGJvb2w7IH1cclxuXHJcbiAgbmVlZFN0b3BSZW5kZXJpbmdNZSgpIHsgcmV0dXJuIHRoaXMuc3RvcFJlbmRlcmluZ01lOyB9XHJcbiAgc2V0U3RvcFJlbmRlcmluZ01lKGJvb2wpIHsgdGhpcy5zdG9wUmVuZGVyaW5nTWUgPSBib29sOyB9XHJcblxyXG4gIGlzQXdhcmVPZlBsYXllcigpIHsgcmV0dXJuIHRoaXMuYXdhcmVPZlBsYXllcjsgfVxyXG4gIHNldEF3YXJlT2ZQbGF5ZXIoYm9vbCkgeyB0aGlzLmF3YXJlT2ZQbGF5ZXIgPSBib29sOyB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25IZWlnaHQodGhpcy5jb2xsaXNpb25IZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh0aGlzLmNvbGxpc2lvblkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRTcHJpdGVQcm9wc0ZyYW1lKHNwcml0ZUFuaW1hdGlvbkNvdW50KXtcclxuICAgIHN3aXRjaChzcHJpdGVBbmltYXRpb25Db3VudCkgeyBcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgc3RhdGUgZm9yIGVuZW15IGRpcmVjdGlvblxyXG4gIGxvb2tEb3duKCl7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgIFxyXG4gICAgLy8gU3RlcHNcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDApO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMSk7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgyKTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG5cclxuICB9XHJcbiAgXHJcbiAgbG9va1VwKCl7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICd1cCc7XHJcbiAgICBcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDE1KTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDE2KTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDE3KTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDE4KTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICB9XHJcbiAgXHJcbiAgbG9va1JpZ2h0KCl7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICBcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDMwKTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDMxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDMyKTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDMzKTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICB9XHJcbiAgICAgIFxyXG4gIGxvb2tMZWZ0KCl7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgICBcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDM0KTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDM1KTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDM2KTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDM3KTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICB9XHJcblxyXG4gIGR5aW5nKCl7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkeWluZyc7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSg0MCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSg0MSk7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSg0Mik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSg0Myk7XHJcbiAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSg0NCk7XHJcbiAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgyOSk7IC8vIGVtcHR5IGZyYW1lXHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG5cclxuICAvLyAjIE1vdmVtZW50XHJcbiAgbW92TGVmdChpZ25vcmVDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gICAgXHJcbiAgbW92UmlnaHQoaWdub3JlQ29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldFNwZWVkKCkpO1xyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgICBcclxuICBtb3ZVcChpZ25vcmVDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgICBcclxuICBtb3ZEb3duKGlnbm9yZUNvbGxpc2lvbikgeyAgXHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICBtb3ZUb0RlYXRoKGlnbm9yZUNvbGxpc2lvbikge1xyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5keWluZygpICk7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBGaXJlIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gXHJcblxyXG4gIC8vICMgU2V0c1xyXG4gICAgICBcclxuICBzZXRYKHgsIHNldENvbGxpc2lvbikgeyBcclxuICAgIHRoaXMueCA9IHg7IFxyXG4gICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWCggeCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgKTtcclxuICB9XHJcbiAgc2V0WSh5LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLnkgPSB5OyBcclxuICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblkoIHkgKyB0aGlzLkNvbGxpc2lvbllGb3JtdWxhICk7XHJcbiAgfVxyXG5cclxuICBzZXRDb2xsaXNpb25YKHgpIHsgdGhpcy5jb2xsaXNpb25YID0geDsgfVxyXG4gIHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcbiAgICBcclxuICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcbiAgICBcclxuICBzZXRTcGVlZChzcGVlZCkgeyB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiBzcGVlZDsgfVxyXG5cclxuICBzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG4gIHRyaWdnZXJMb29rRGlyZWN0aW9uKGRpcmVjdGlvbikgeyBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICB9XHJcblxyXG4gIHJlc2V0UG9zaXRpb24oKSB7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuICAgIHRoaXMuc2V0WSggdGhpcy55MCApO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmNvbGxpc2lvblgwICk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuY29sbGlzaW9uWTAgKTtcclxuICB9XHJcblxyXG4gIGh1cnQoIGFtb3VudCApIHtcclxuICAgIGlmKCB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIEh1cnQgcGxheWVyXHJcbiAgICAgIHRoaXMubGlmZXMgLT0gYW1vdW50O1xyXG4gICAgICBpZiggdGhpcy5saWZlcyA8IDAgKSB0aGlzLmxpZmVzID0gMDtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IGNvb2xkb3duXHJcbiAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gZmFsc2U7XHJcbiAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICAgIH0sIHRoaXMuaHVydENvb2xEb3duVGltZSk7XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBwbGF5ZXIgZGllZFxyXG4gICAgICB0aGlzLmNoZWNrTXlEZWF0aCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2hlY2tNeURlYXRoKCkge1xyXG4gICAgaWYoIHRoaXMubGlmZXMgPCAxICkge1xyXG4gICAgICB0aGlzLnNldERlYWQodHJ1ZSk7XHJcblxyXG4gICAgICBpZiggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gIT0gXCJkeWluZ1wiKSB0aGlzLnN0ZXBDb3VudCA9IDE7IC8vIElmIGl0J3Mgbm90IGR5aW5nLCByZXNldCBhbmltYXRpb24gc3RlcFxyXG4gICAgICB0aGlzLnNldFNwZWVkKDEuMyk7IC8vIEluY3JlYXNlIHNwZWVkXHJcbiAgICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSBmYWxzZTsgLy8gUHJldmVudCBlbmVteSBodXJ0aW5nIHBsYXllciB3aGVuIGluIGRlYXRoIGFuaW1hdGlvblxyXG4gICAgICB0aGlzLm1heFN0ZXBzID0gNjtcclxuICAgICAgdGhpcy5zZXRBd2FyZU9mUGxheWVyKGZhbHNlKTtcclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyA4O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICMgR2V0c1xyXG4gIFxyXG4gIGdldExpZmVzKCkgeyByZXR1cm4gdGhpcy5saWZlczsgfVxyXG4gIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgXHJcbiAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25IZWlnaHQ7IH1cclxuICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gIGdldENvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25ZOyB9XHJcblxyXG4gIGdldENlbnRlclgoIF94ICkgeyAvLyBNYXkgZ2V0IGEgY3VzdG9tIGNlbnRlclgsIHVzZWQgdG8gY2hlY2sgYSBmdXR1cmUgY29sbGlzaW9uXHJcbiAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICByZXR1cm4geCArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDI7IFxyXG4gIH1cclxuICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICBsZXQgeSA9ICggX3kgKSA/IF95IDogdGhpcy5nZXRDb2xsaXNpb25ZKCk7XHJcbiAgICByZXR1cm4geSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyBcclxuICB9XHJcbiAgICBcclxuICBnZXRDb2xvcigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuICBnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuICAgIFxyXG4gIGdldFNwcml0ZVByb3BzKCkgeyByZXR1cm4gdGhpcy5zcHJpdGVQcm9wczsgfVxyXG4gICAgXHJcbiAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgIC8vRG9uJ3QgcmVzZXQgaWYgaXQncyBpbiBkZWF0aCBhbmltYXRpb25cclxuICAgICAgaWYoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID09IFwiZHlpbmdcIiApIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMubWF4U3RlcHM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJlc2V0U3RlcCgpIHtcclxuICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICdsZWZ0JzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndXAnOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGhpZGVNZSgpIHsgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgfVxyXG4gIHNob3coKSB7IHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlOyB9XHJcbiAgXHJcbiAgLy8gIyBFbmVteSBSZW5kZXIgICAgXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5uZWVkU3RvcFJlbmRlcmluZ01lKCkgKSByZXR1cm47XHJcblxyXG4gICAgLy8gQmxpbmsgRW5lbXkgaWYgaXQgY2FuJ3QgYmUgaHVydFxyXG4gICAgaWYoICEgdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgIHRoaXMuaGlkZVNwcml0ZSA9ICF0aGlzLmhpZGVTcHJpdGU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICYmIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwiZHlpbmdcIiAgKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hhdCB0byBkbyBldmVyeSBmcmFtZSBpbiB0ZXJtcyBvZiByZW5kZXI/IERyYXcgdGhlIHBsYXllclxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCksICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgIHRoaXMuc3ByaXRlLmdldEtleVdpZHRoKCksIHRoaXMuc3ByaXRlLmdldEtleUhlaWdodCgpLCBcclxuICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgKTtcdFxyXG5cclxuICAgIC8vIFBsYXllciBBd2FyZW5lc3MgXHJcbiAgICBpZiggdGhpcy5pc0F3YXJlT2ZQbGF5ZXIoKSApIHtcclxuICAgICAgY3R4LmZvbnQgPSAgXCI1MHB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI0NDMDAwMFwiO1xyXG4gICAgICBjdHguZmlsbFRleHQoIFwiIVwiLCB0aGlzLmdldFgoKSArICggdGhpcy5jaHVua1NpemUgKiAwLjAzICksIHRoaXMuZ2V0WSgpICsgKCB0aGlzLmNodW5rU2l6ZSAqIDAuMyApICk7IFxyXG4gICAgfVxyXG5cclxuICAgIC8vIERFQlVHIENPTExJU0lPTlxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuXHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDI1NSwgMC40KVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpICk7XHJcblxyXG4gICAgICBsZXQgdGV4dCA9IFwiWDogXCIgKyBNYXRoLnJvdW5kKHRoaXMuZ2V0WCgpKSArIFwiIFk6XCIgKyBNYXRoLnJvdW5kKHRoaXMuZ2V0WSgpKTtcclxuICAgICAgY3R4LmZvbnQgPSAgXCIyNXB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiO1xyXG4gICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMuZ2V0WCgpIC0gMjAsIHRoaXMuZ2V0WSgpIC0gNjApOyBcclxuXHJcbiAgICAgIHRleHQgPSBcImRYOiBcIiArIE1hdGgucm91bmQoIHRoaXMueEZyb21QbGF5ZXJEaXN0YW5jZSApICsgXCIgZFk6XCIgKyBNYXRoLnJvdW5kKCB0aGlzLllGcm9tUGxheWVyRGlzdGFuY2UgKTtcclxuICAgICAgY3R4LmZvbnQgPSAgXCIyNXB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiO1xyXG4gICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMuZ2V0WCgpIC0gMjAsIHRoaXMuZ2V0WSgpIC0gMjApOyBcclxuICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICB9O1xyXG5cclxuLy8gIyBFbmVteSBCcmFpblxyXG4gIGVuZW15QnJhaW4oKSB7XHJcblxyXG4gICAgaWYoIHdpbmRvdy5nYW1lLmlzR2FtZVJlYWR5KCkgJiYgdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIERlYWQgYmVoYXZpb3IvYW5pbWF0aW9uXHJcbiAgICAgIGlmKCB0aGlzLmlzRGVhZCgpICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vV2hpbGUgbm90IG91dCBvZiBzY3JlZW5cclxuICAgICAgICBpZiggdGhpcy5nZXRYKCkgPCB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuY2FudmFzV2lkdGggKSB7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIFN0YXJ0IG1vdmluZyBvdXQgb2Ygc2NyZWVuXHJcbiAgICAgICAgICB0aGlzLm1vdlRvRGVhdGgodHJ1ZSk7IC8vIHRydWUgPSBpZ25vcmUgY29sbGlzaW9uIGNoZWNrXHJcbiAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gT2ssIHRoZSBlbmVteSBpcyBkZWFkLCBzdG9wIHJlbmRlcmluZyBub3dcclxuICAgICAgICAgIHRoaXMuc2V0U3RvcFJlbmRlcmluZ01lKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgfSBlbHNlIHsgLy8gIyBOb3QgZGVhZFxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIG5lYXIgZW5vdWdoIG9mIHBsYXllciB0byBnbyBpbiBoaXMgZGlyZWN0aW9uXHJcbiAgICAgICAgbGV0IG5lYXJQbGF5ZXIgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgZGlzdGFuY2UgYmV0d2VlbiBlbmVteSBhbmQgcGxheWVyXHJcbiAgICAgICAgICB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5nZXRDZW50ZXJYKCkgLSBwbGF5ZXIuZ2V0Q2VudGVyWCgpICk7XHJcbiAgICAgICAgICB0aGlzLllGcm9tUGxheWVyRGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5nZXRDZW50ZXJZKCkgLSBwbGF5ZXIuZ2V0Q2VudGVyWSgpICk7XHJcbiAgICAgICAgICAvL0lmIGJvdGggZGlzdGFuY2UgYXJlIGJlbG93IHRoZSBhd2FyZSBkaXN0YW5jZSwgc2V0IHRoaXMgcGxheWVyIHRvIGJlIHRoZSBuZWFyIHBsYXllclxyXG4gICAgICAgICAgaWYoIHRoaXMueEZyb21QbGF5ZXJEaXN0YW5jZSA8IHRoaXMucGxheWVyQXdhcmVEaXN0YW5jZSAmJiB0aGlzLllGcm9tUGxheWVyRGlzdGFuY2UgPCB0aGlzLnBsYXllckF3YXJlRGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICAgIG5lYXJQbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAgIGlmKCBuZWFyUGxheWVyICkge1xyXG5cclxuICAgICAgICAgIC8vICMgV2FsayBpbiBwbGF5ZXIgZGlyZWN0aW9uXHJcbiAgICAgICAgICB0aGlzLnNldEF3YXJlT2ZQbGF5ZXIodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgLy8gcG9zaXRpb25zXHJcbiAgICAgICAgICBsZXQgWGUgPSB0aGlzLmdldENvbGxpc2lvblgoKTtcclxuICAgICAgICAgIGxldCBZZSA9IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG5cclxuICAgICAgICAgIGxldCBYcCA9IG5lYXJQbGF5ZXIuZ2V0Q29sbGlzaW9uWCgpOyBcclxuICAgICAgICAgIGxldCBZcCA9IG5lYXJQbGF5ZXIuZ2V0Q29sbGlzaW9uWSgpOyBcclxuXHJcbiAgICAgICAgICBsZXQgWGRpc3RhbmNlID0gTWF0aC5hYnMoWGUgLSBYcCk7Ly8gSWdub3JlIGlmIHRoZSByZXN1bHQgaXMgYSBuZWdhdGl2ZSBudW1iZXJcclxuICAgICAgICAgIGxldCBZZGlzdGFuY2UgPSBNYXRoLmFicyhZZSAtIFlwKTtcclxuXHJcbiAgICAgICAgICAvLyB3aGljaCBkaXJlY3Rpb24gdG8gbG9va1xyXG4gICAgICAgICAgbGV0IFhkaXJlY3Rpb24gPSBcIlwiO1xyXG4gICAgICAgICAgbGV0IFlkaXJlY3Rpb24gPSBcIlwiO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBYZGlyZWN0aW9uID0gKCBYZSA+PSBYcCApID8gJ2xlZnQnIDogJ3JpZ2h0JztcclxuICAgICAgICAgIFlkaXJlY3Rpb24gPSAoIFllID49IFlwICkgPyAndXAnIDogJ2Rvd24nO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyB3aGVyZSB0byBnb1xyXG4gICAgICAgICAgbGV0IGdvVG9EaXJlY3Rpb24gPSAoIFhkaXN0YW5jZSA+IFlkaXN0YW5jZSApID8gWGRpcmVjdGlvbiA6IFlkaXJlY3Rpb247XHJcblxyXG4gICAgICAgICAgLy8gSWYgaGFzIGNvbGxpZGVkIGEgbG90LCBjaGFuZ2UgZGlyZWN0aW9uIHRvIGF2b2lkIGdldHRpbmcgc3R1Y2tcclxuICAgICAgICAgIGlmKCB0aGlzLmNvbGxpc2lvbkNvdW50ID4gMjAgKSB7XHJcbiAgICAgICAgICAgIC8vIFN0b3AgZ29pbmcgb24gdGhhdCBkaXJlY3Rpb25cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgVE9ETzogVGhpbmsgYWJvdXQgaXQhIVxyXG4gICAgICAgICAgICAqL1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBtb3ZlXHJcbiAgICAgICAgICBzd2l0Y2goIGdvVG9EaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3VwJzogICAgdGhpcy5tb3ZVcCgpOyAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAncmlnaHQnOiB0aGlzLm1vdlJpZ2h0KCk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdkb3duJzogIHRoaXMubW92RG93bigpOyAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xlZnQnOiAgdGhpcy5tb3ZMZWZ0KCk7ICBicmVhaztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyAjIGZhciBmcm9tIHBsYXllciwgc28ga2VlcCByYW5kb20gbW92ZW1lbnRcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgdGhpcy5zZXRBd2FyZU9mUGxheWVyKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAvLyBDaGVjayBpZiBzdG9wZWQgdGhlIG1vdmUgZXZlbnRcclxuICAgICAgICAgIGlmKCB0aGlzLmRpcmVjdGlvbkNvdW50ZG93biA8PSAwICkge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmREaXJlY3Rpb24gPSAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNykgKyAxOyAvLyAxIC0gNFxyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbkNvdW50ZG93biA9ICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyMCkgKyAxMDsgLy8gMSAtIDRcclxuICAgICAgICAgICAgLy90aGlzLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBNb3ZlIGRpcmVjdGlvbiBuZWVkZWRcclxuICAgICAgICAgIHN3aXRjaCggdGhpcy5yYW5kRGlyZWN0aW9uICkge1xyXG4gICAgICAgICAgICBjYXNlIDE6IHRoaXMubW92VXAoKTsgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IHRoaXMubW92UmlnaHQoKTsgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6IHRoaXMubW92RG93bigpOyAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6IHRoaXMubW92TGVmdCgpOyAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6IC8vIG1vcmUgY2hhbmNlcyB0byBkb24ndCBtb3ZlXHJcbiAgICAgICAgICAgIGNhc2UgNjogXHJcbiAgICAgICAgICAgIGNhc2UgNzogXHJcbiAgICAgICAgICAgICAgdGhpcy5yZXNldFN0ZXAoKTsgYnJlYWs7IC8vIGRvbid0IG1vdmVcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmRpcmVjdGlvbkNvdW50ZG93bi0tO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICBcclxuICAgICAgfSAvLyBpZiBkZWFkXHJcblxyXG4gICAgfS8vaWYgZ2FtZSByZWFkeVxyXG5cclxuICAgIFxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmVuZW15QnJhaW4uYmluZCh0aGlzKSApO1xyXG4gIH1cclxuXHJcbi8vICMgQ29sbGlzaW9uXHJcblxyXG4gIGNvbGxpc2lvbihvYmopeyBcclxuICAgIGlmKCBvYmoudHlwZSA9PSBcInBsYXllclwiICkgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBwbGF5ZXJcclxuICAgIHRoaXMuY29sbGlzaW9uQ291bnQrKztcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gXHJcbiAgXHJcbiAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gIC8vIFdpbGwgaXQgU3RvcCB0aGUgb3RoZXIgb2JqZWN0IGlmIGNvbGxpZGVzP1xyXG4gIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG4gIHJ1bkVuZW15KCkge1xyXG4gICAgLy8gY2hhbmdlIGxvb2sgZGlyZWN0aW9uXHJcbiAgICB0aGlzLmxvb2tEaXJlY3Rpb24gPSB0aGlzLmxvb2tEb3duKCk7XHJcblxyXG4gICAgLy9zdGFydCBhbGdvcml0bSB0aGF0IG1vdmVzIHBsYXllclxyXG4gICAgdGhpcy5lbmVteUJyYWluKCk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBFbmVteTsiLCJjb25zdCBfQ2FuSHVydCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0Nhbkh1cnQnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBGaXJlIGV4dGVuZHMgX0Nhbkh1cnQge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIkZpcmVcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNDkpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5IdXJ0UHJvcHMgPSB7XHJcbiAgICAgIGFtb3VudDogMVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuSHVydFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50ID0gMztcclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50KSArIDE7IC8vIEdlbmVyYXRlIGEgcmFuZCBpbml0aWFsIG51bWJlciB0byByYW5kb21pemUgYW5pbWF0aW9uIGluIGNhc2Ugb2YgbXVsdGlwbGUgRmlyZXNcclxuICAgIFxyXG4gICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDAuNDsgLy8gODAlIG9mIENodW5rIFNpemVcclxuICAgIHRoaXMuY29sbGlzaW9uWSA9IHkwICsgKCB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDAuNik7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICBsZXQgcmFuZEZQUyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpICsgNTsgLy8gR2VuZXJhdGUgYSByYW5kb20gRlBTLCBzbyBtdWx0aXBsZSBGaXJlcyBvbiBwYWdlIGRvbid0IGFuaW1hdGUgdGhlIHNhbWUgd2F5IFxyXG4gICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyByYW5kRlBTOyAvLyAxMDAwIC8gRlBTXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvblxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uSGVpZ2h0KHRoaXMuY29sbGlzaW9uSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvblkodGhpcy5jb2xsaXNpb25ZKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgc2V0U3ByaXRlUHJvcHNGcmFtZShzcHJpdGVBbmltYXRpb25Db3VudCl7XHJcbiAgICBzd2l0Y2goc3ByaXRlQW5pbWF0aW9uQ291bnQpIHsgXHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBGaXJlIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gXHJcblxyXG4gIGJlZm9yZVJlbmRlcigpIHtcclxuICAgIC8vIEFuaW1hdGUgZmlyZVxyXG4gICAgaWYoIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQrKztcclxuICAgICAgaWYoIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPiB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50ICkgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IDE7XHJcbiAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEZpcmU7IiwiY29uc3QgX0NhbkNvbGxlY3QgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5Db2xsZWN0Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgSGVhbCBleHRlbmRzIF9DYW5Db2xsZWN0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZV9pZCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IHN0YWdlX2lkICsgXCJfcG90aW9uXCIsXHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIHN0YWdlOiBzdGFnZV9pZFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5Db2xsZWN0UHJvcHMgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IHRydWVcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkNvbGxlY3RQcm9wcyk7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGhhcyBzb21lIHNhdmUgc3RhdGVcclxuICBjaGVja1NhdmVkSXRlbVN0YXRlKCkge1xyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKSApOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICkge1xyXG4gICAgICBsZXQgaXRlbVNhdmVkU3RhdGUgPSBzYXZlZEl0ZW1zU3RhdGVbdGhpcy5nZXROYW1lKCldO1xyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgISB0aGlzLmNhblJlc3Bhd24oKSAmJiBpdGVtU2F2ZWRTdGF0ZS5jb2xsZWN0ZWQgPT09IHRydWUgKXsgLy8gQ2hlY2sgaWYgaGFzIHNhdmVkIHN0YXRlIGFuZCBjYW4ndCByZXNwYXduXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgc2V0SGVhbEFtb3V0KGFtb3VudCkgeyB0aGlzLmhlYWxBbW91dCA9IGFtb3VudDsgfVxyXG4gIGdldEhlYWxBbW91bnQoKSB7IHJldHVybiB0aGlzLmhlYWxBbW91dDsgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2JhbmFuYSc6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYmVycnknOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBpZiggIXRoaXMuaXNDb2xsZWN0ZWQoKSApIHtcclxuICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICBwbGF5ZXIuaGVhbFBsYXllciggdGhpcy5nZXRIZWFsQW1vdW50KCkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG4gIC8vIEhhbmRsZSBwcm9wcyB3aGVuIGxvYWRcclxuICBoYW5kbGVQcm9wcygpIHtcclxuICAgIFxyXG4gICAgLy8gU2V0IFByb3BzIGJhc2VkIG9uIHR5cGVcclxuICAgIHN3aXRjaCggdGhpcy5nZXRUeXBlKCkgKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdiYW5hbmEnOlxyXG4gICAgICAgIHRoaXMuc2V0SGVhbEFtb3V0KDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdiZXJyeSc6XHJcbiAgICAgICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpOyAvLyBNYWtlIHRoaXMgaXRlbSBhYmxlIHRvIHNhdmUgc3RhdGVcclxuICAgICAgICB0aGlzLnNldEhlYWxBbW91dCgyKTtcclxuICAgICAgICB0aGlzLnNldENhblJlc3Bhd24oZmFsc2UpOyAvLyBJdCBjYW4ndCByZXNwYXduIGlmIHVzZWRcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEhlYWw7IiwiY29uc3QgX0NhblRocm93ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuVGhyb3cnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBLZXkgZXh0ZW5kcyBfQ2FuVGhyb3cge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJrZXlcIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgY2xhc3M6ICdrZXknLFxyXG4gICAgICBzdGFnZTogc3RhZ2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA1MCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuVGhyb3cgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IGZhbHNlLFxyXG4gICAgICBjaHVuY2tzVGhyb3dEaXN0YW5jZTogMSxcclxuICAgICAgaHVydEFtb3VudDogMCxcclxuICAgICAgdXNlRXZlbnQ6ICd1c2UnXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvdywgZnJvbVNhdmVTdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5zZXROZWVkU2F2ZVN0YXRlKHRydWUpO1xyXG4gICAgdGhpcy5oYW5kbGVQcm9wcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGhhcyBzb21lIHNhdmUgc3RhdGVcclxuICBjaGVja1NhdmVkSXRlbVN0YXRlKCkge1xyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKSApOyAgXHJcbiAgICBpZiggc2F2ZWRJdGVtc1N0YXRlICkge1xyXG5cclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBpcyBhbHJlYWR5IGdyYWJiZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmdyYWJiZWQgPT0gdHJ1ZSApeyBcclxuICAgICAgICBpZiggdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgIC8vIEdyYWIgdGhlIGl0ZW0gc2F2ZWRcclxuICAgICAgICAgIHRoaXMuZ3JhYkhhbmRsZXIoIGl0ZW1TYXZlZFN0YXRlLmdyYWJQcm9wcy5wbGF5ZXJXaG9HcmFiYmVkICk7IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHVzZWQgYmVmb3JlXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5jb2xsZWN0ZWQgPT0gdHJ1ZSApIHsgXHJcbiAgICAgICAgdGhpcy5jb2xsZWN0KCk7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuY2FuR3JhYiA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL0NoZWNrIGlmIGl0IHdhcyBkcm9wcGVkXHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5kcm9wcGVkID09IHRydWUgKSB7IFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgZHJvcHBlZCBvbiB0aGlzIHN0YWdlXHJcbiAgICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2UgPT0gd2luZG93LmdhbWUuZ2V0Q3VycmVudFN0YWdlKCkgKSB7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGlmKCAhIHRoaXMuZnJvbVNhdmVkU3RhdGUgKSB7XHJcbiAgICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVgoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWCApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlWSggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy54MCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy54MDtcclxuICAgICAgICB0aGlzLnkwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLnkwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJvcFggPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFg7XHJcbiAgICAgICAgdGhpcy5kcm9wWSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWTtcclxuXHJcbiAgICAgICAgdGhpcy5kcm9wcGVkID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsU3RhZ2UgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuc3RhZ2U7XHJcbiAgICAgICAgdGhpcy5kcm9wcGVkU3RhZ2UgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlO1xyXG4gICAgICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU3ByaXRlcyBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIFwiZ3JheVwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JheScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJwdXJwbGVcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJyZWRcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyOCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJncmVlblwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgfVxyXG5cclxuICBkaXNjYXJkS2V5KHBsYXllcikge1xyXG4gICAgdGhpcy5oaWRlKCk7XHJcbiAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICB0aGlzLnNldENvbGxlY3QodHJ1ZSk7XHJcbiAgICB0aGlzLnNldEdyYWIoZmFsc2UpO1xyXG4gICAgcGxheWVyLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgfVxyXG5cclxuICB1c2UoZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQsIHBsYXllcikge1xyXG4gICAgbGV0IG9iaiA9IHBsYXllci5jaGVja0l0ZW1PbkdyYWJDb2xsaXNpb25Cb3goKTtcclxuICAgIGlmKCBvYmoudHlwZSA9PSAnZG9vcicgKSB7XHJcbiAgICAgIGlmKCBvYmouZ2V0Q29kZSgpID09IHRoaXMuZ2V0Q29kZSgpICkge1xyXG4gICAgICAgIG9iai5vcGVuKCk7XHJcbiAgICAgICAgdGhpcy5kaXNjYXJkS2V5KHBsYXllcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEtleTsiLCJjb25zdCBfQ2FuQmVQdXNoZWQgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5CZVB1c2hlZCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIE9iamVjdF9QdXNoIGV4dGVuZHMgX0NhbkJlUHVzaGVkIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJvYmplY3RcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhblB1c2ggPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IHRydWUsXHJcbiAgICAgIGNodW5ja3NQdXNoRGlzdGFuY2U6IDE1LFxyXG4gICAgICBodXJ0QW1vdW50OiAyXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5QdXNoKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJzdG9uZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RfUHVzaDsiLCJjb25zdCBfQ2FuVGhyb3cgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdycpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIE9iamVjdF9UaHJvdyBleHRlbmRzIF9DYW5UaHJvdyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2UsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIm9iamVjdFwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBjbGFzczogJ29iamVjdF90aHJvdycsXHJcbiAgICAgIHN0YWdlOiBzdGFnZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhblRocm93ID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlLFxyXG4gICAgICBjaHVuY2tzVGhyb3dEaXN0YW5jZTogNSxcclxuICAgICAgaHVydEFtb3VudDogMixcclxuICAgICAgdXNlRXZlbnQ6ICd0aHJvdydcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblRocm93LCBmcm9tU2F2ZVN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7Ly9zZXQgdG8gc2F2ZSBqdXN0IHRvIGNoZWNrIGlmIHVzZXIgaXMgZ3JhYmJpbmcgaXQgd2hlbiBsZWF2aW5nIHN0YWdlXHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgY2FzZSBcImJhcnJlbFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldENvZGUodHlwZSk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaGFzIHNvbWUgc2F2ZSBzdGF0ZVxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgIGxldCBpdGVtU2F2ZWRTdGF0ZSA9IHNhdmVkSXRlbXNTdGF0ZVt0aGlzLmdldE5hbWUoKV07XHJcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBpcyBhbHJlYWR5IGdyYWJiZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmdyYWJiZWQgPT09IHRydWUgKXtcclxuICAgICAgICBpZiggdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgIC8vIEdyYWIgdGhlIGl0ZW0gc2F2ZWRcclxuICAgICAgICAgIHRoaXMuZ3JhYkhhbmRsZXIoIGl0ZW1TYXZlZFN0YXRlLmdyYWJQcm9wcy5wbGF5ZXJXaG9HcmFiYmVkICk7IFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vQ2hlY2sgaWYgaXQgd2FzIGRyb3BwZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmRyb3BwZWQgPT0gdHJ1ZSApIHsgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBkcm9wcGVkIG9uIHRoaXMgc3RhZ2VcclxuICAgICAgICBpZiggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZSA9PSB3aW5kb3cuZ2FtZS5nZXRDdXJyZW50U3RhZ2UoKSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoICEgdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgICAgLy8gSWdub3JlIHRoZSBpdGVtIGZyb20gc3RhZ2VcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlWCggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVZKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFkgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLngwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLngwO1xyXG4gICAgICAgIHRoaXMueTAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueTA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcm9wWCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWDtcclxuICAgICAgICB0aGlzLmRyb3BZID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZO1xyXG5cclxuICAgICAgICB0aGlzLmRyb3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5zdGFnZTtcclxuICAgICAgICB0aGlzLmRyb3BwZWRTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RfVGhyb3c7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vLi4vLi4vZ2FtZVByb3BlcnRpZXMnKTsgXHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgVGVsZXBvcnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgsIHRlbGVwb3J0UHJvcHMpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIlRlbGVwb3J0XCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGZhbHNlLCAwLCAwLCAwLCAwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnRlbGVwb3J0UHJvcHMgPSB0ZWxlcG9ydFByb3BzO1xyXG5cclxuICAgIHRoaXMueEluZGV4ID0geEluZGV4O1xyXG4gICAgdGhpcy55SW5kZXggPSB5SW5kZXg7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiAwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydCwgY29sbGlkYWJsZSwgY29sbGlzaW9uRGlyZWN0aW9uKXtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcnMgPSBjb2xsaWRhYmxlLnNjZW5hcmlvLmdldFBsYXllcnMoKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgcGxheWVyIHRlbGVwb3J0cywgdGhlbiBjaGFuZ2Ugc3RhZ2VcclxuICAgIGlmKCB0aGlzLnRlbGVwb3J0KCBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydCApICkge1xyXG4gICAgICBcclxuICAgICAgLy8gTWFrZSBldmVyeXRoaW5nIGRhcmtcclxuICAgICAgY29sbGlkYWJsZS5zY2VuYXJpby5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgd2luZG93LmdhbWUubG9hZGluZyh0cnVlKTtcclxuXHJcbiAgICAgIC8vIEhpZGUgYWxsIHBsYXllcnNcclxuICAgICAgcGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuaGlkZVBsYXllcigpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFdhaXQgc29tZSB0aW1lIC0gZG9udCd0IG5lZWQgaXQgYW55bW9yZSAoaSB0aGluaylcclxuICAgICAgLy9zZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gTm93IHRlbGVwb3J0IGFsbCBwbGF5ZXJzIHRvIHNhbWUgbG9jYXRpb24gYW5kIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCB0YXJnZXRYID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0WCgpO1xyXG4gICAgICAgIGxldCB0YXJnZXRZID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0WSgpO1xyXG4gICAgICAgIGxldCBsb29rRGlyZWN0aW9uID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0U3ByaXRlUHJvcHMoKS5kaXJlY3Rpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgcGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHBsYXllci5zZXRYKHRhcmdldFgsIHRydWUpOyAvLyB0cnVlID0gYWxzbyBzZXQgY29sbGlzaW9uIHggdG9vXHJcbiAgICAgICAgICBwbGF5ZXIuc2V0WSh0YXJnZXRZLCB0cnVlKTtcclxuICAgICAgICAgIHBsYXllci50cmlnZ2VyTG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKTtcclxuICAgICAgICAgIHBsYXllci5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICAgICAgcGxheWVyLnNob3dQbGF5ZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2hhbmdlIHN0YWdlXHJcbiAgICAgICAgY29sbGlkYWJsZS5zY2VuYXJpby5zZXRTdGFnZSggXHJcbiAgICAgICAgICB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0U3RhZ2UsXHJcbiAgICAgICAgICBmYWxzZSAvLyBmaXJzdFN0YWdlID9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB3aW5kb3cuZ2FtZS5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAgIC8vfSwgMzAwKTtcclxuICAgICAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gV2hhdCBraW5kIG9mIHRlbGVwb3J0P1xyXG4gIHRlbGVwb3J0KCBwbGF5ZXIgKSB7XHJcbiAgICBcclxuICAgIGxldCBnYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuXHJcbiAgICBsZXQgdHlwZSA9IHRoaXMudGVsZXBvcnRQcm9wcy50ZWxlcG9ydFR5cGU7XHJcbiAgICBsZXQgdGFyZ2V0WCA9IDA7XHJcbiAgICBsZXQgdGFyZ2V0WSA9IDA7XHJcblxyXG4gICAgbGV0IHdpbGxUZWxlcG9ydCA9IGZhbHNlO1xyXG5cclxuICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0YXJnZXRYID0gdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFg7XHJcbiAgICAgICAgdGFyZ2V0WSA9IHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRZO1xyXG4gICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJyZWxhdGl2ZVwiOlxyXG4gICAgICAgIHN3aXRjaCAodGhpcy50ZWxlcG9ydFByb3BzLmNhbWVGcm9tKSB7XHJcbiAgICAgICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgICAgIHRhcmdldFggPSB0aGlzLnhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRZID0gKCAoZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlblZlcnRpY2FsQ2h1bmtzJykgLSAzICkgKiB0aGlzLmNodW5rU2l6ZSk7IC8vIC0zIGJlY2F1c2Ugb2YgdGhlIHBsYXllciBjb2xsaXNpb24gYm94XHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgICAgICB0YXJnZXRYID0gdGhpcy54SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WSA9IDAgKiB0aGlzLmNodW5rU2l6ZTsgLy8gVGVsZXBvcnQgdG8gWT0wLCBidXQgcGxheWVyIGhpdGJveCB3aWxsIG1ha2UgaGltIGdvIDEgdGlsZSBkb3duXHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIHRoaXMueUluZGV4ICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFggPSAxICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggdGhpcy55SW5kZXggKiB0aGlzLmNodW5rU2l6ZSkgLSB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WCA9ICggZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAtIDIgKSAqIHRoaXMuY2h1bmtTaXplOyBcclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9ubHkgdGVsZXBvcnRzIGlmIGl0IGNhbiB0ZWxlcG9ydFxyXG4gICAgaWYoIHdpbGxUZWxlcG9ydCApIHtcclxuICAgICAgcGxheWVyLnNldFgoIHRhcmdldFggKTsgLy8gYWx3YXlzIHVzaW5nIFggYW5kIFkgcmVsYXRpdmUgdG8gdGVsZXBvcnQgbm90IHBsYXllciBiZWNhdXNlIGl0IGZpeCB0aGUgcGxheWVyIHBvc2l0aW9uIHRvIGZpdCBpbnNpZGUgZGVzdGluYXRpb24gc3F1YXJlLlxyXG4gICAgICBwbGF5ZXIuc2V0WSggdGFyZ2V0WSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB3aWxsVGVsZXBvcnQ7XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVGVsZXBvcnQ7IiwiLyoqXHJcbiAqICBTdG9yZSBBc3NldHMgdGhhdCBuZWVkcyB0byBiZSBvbiBhbnkgc3RhZ2UsIGxpa2Uga2V5cyBvciBpdGVtcyB0aGF0IHBsYXllciBncmFic1xyXG4gKiBcclxuICogIERlY2xhcmUgYWxsIG9mIHRoaXMgYXNzZXRzIGhlcmVcclxuICovXHJcblxyXG5jb25zdCBLZXkgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0tleScpO1xyXG5jb25zdCBPYmplY3RfVGhyb3cgPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vY29tbW9uL09iamVjdF9UaHJvdycpO1xyXG5cclxuY2xhc3MgR2xvYmFsQXNzZXRzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7IFxyXG5cdFx0dGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcblx0fVxyXG5cclxuICBnZXRBc3NldCggX2NsYXNzLCBwcm9wcywgZnJvbVNhdmVTdGF0ZSApIHtcclxuICAgIGxldCByO1xyXG4gICAgc3dpdGNoKCBfY2xhc3MgKSB7XHJcbiAgICAgIGNhc2UgJ2tleSc6XHJcbiAgICAgICAgciA9IG5ldyBLZXkoIHByb3BzLmNvZGUsIHByb3BzLngwLCBwcm9wcy55MCwgcHJvcHMuc3RhZ2UsIGZyb21TYXZlU3RhdGUgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnb2JqZWN0X3Rocm93JzpcclxuICAgICAgICByID0gbmV3IE9iamVjdF9UaHJvdyggcHJvcHMuY29kZSwgcHJvcHMueDAsIHByb3BzLnkwLCBwcm9wcy5zdGFnZSwgZnJvbVNhdmVTdGF0ZSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHI7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBHbG9iYWxBc3NldHM7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuQmVQdXNoZWQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQmVQdXNoZWRQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5Vc2UgPSB0cnVlO1xyXG4gICAgdGhpcy5fcHVzaCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhbkJlUHVzaGVkUHJvcHMuY2FuUmVzcGF3bjtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhbkJlUHVzaGVkUHJvcHMuaHVydEFtb3VudDtcclxuICAgIFxyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2UgPSBjYW5CZVB1c2hlZFByb3BzLmNodW5ja3NQdXNoRGlzdGFuY2UgKiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgIHRoaXMucHVzaFNwZWVkID0gMC44O1xyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2VUcmF2ZWxsZWQgPSAwO1xyXG4gICAgdGhpcy5wdXNoTW92ZW1lbnQgPSBmYWxzZTtcclxuICAgIHRoaXMucHVzaERpcmVjdGlvbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnRhcmdldFggPSAwO1xyXG4gICAgdGhpcy50YXJnZXRZID0gMDtcclxuICB9XHJcblxyXG4gIGlzUHVzaGluZygpIHsgcmV0dXJuIHRoaXMuX3B1c2g7IH1cclxuICBzZXRQdXNoKGJvb2wpIHsgdGhpcy5fcHVzaCA9IGJvb2w7IH1cclxuICBnZXRQdXNoU3BlZWQoKSB7IHJldHVybiAgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiB0aGlzLnB1c2hTcGVlZDsgfVxyXG4gIGNhbGN1bGF0ZVB1c2hEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgdGhpcy5wdXNoRGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgc3dpdGNoKCB0aGlzLnB1c2hEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gdGhpcy5wdXNoRGlzdGFuY2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB0aGlzLnB1c2hEaXN0YW5jZTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHRoaXMucHVzaERpc3RhbmNlOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpIC0gdGhpcy5wdXNoRGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuX2NhblJlc3Bhd24gPSBib29sOyB9XHJcbiAgY2FuUmVzcGF3bigpIHsgcmV0dXJuIHRoaXMuX2NhblJlc3Bhd247IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxuICB1c2VIYW5kbGVyKGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5wdXNoKGRpcmVjdGlvbik7XHJcbiAgfVxyXG5cclxuICBzdG9wT2JqZWN0KCkge1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24odHJ1ZSk7XHJcbiAgICB0aGlzLnNldFB1c2goZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgcHVzaChkaXJlY3Rpb24pIHtcclxuICAgIHRoaXMuc2V0UHVzaCh0cnVlKTtcclxuICAgIHRoaXMuY2FsY3VsYXRlUHVzaERpcmVjdGlvbiggZGlyZWN0aW9uICk7XHJcbiAgfVxyXG5cclxuICBtb3ZlVG9QdXNoRGlyZWN0aW9uKCkge1xyXG4gICAgc3dpdGNoKCB0aGlzLnB1c2hEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRQdXNoU3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgLy8gWVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMucHVzaERpc3RhbmNlVHJhdmVsbGVkICs9IHRoaXMuZ2V0UHVzaFNwZWVkKCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyLCBlbmVteSBhbmQgb2JqZWN0c1xyXG4gICAgdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24oKTtcclxuXHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb24oKSB7XHJcbiAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVja0FsbCh0aGlzLCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSk7IFxyXG4gICAgaWYgKCBvYmogJiYgdGhpcy5pc1B1c2hpbmcoKSApIHtcclxuICAgICAgc3dpdGNoKG9iai50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAncGxheWVyJzpcclxuICAgICAgICAgIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdlbmVteSc6XHJcbiAgICAgICAgICBvYmouaHVydCh0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IGVuZW15XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYoIG9iai5vdmVybGFwWCApIHRoaXMudXBkYXRlWCggb2JqLm92ZXJsYXBYICk7XHJcbiAgICAgICAgICBpZiggb2JqLm92ZXJsYXBZICkgdGhpcy51cGRhdGVZKCBvYmoub3ZlcmxhcFkgKTtcclxuICAgICAgICAgIHRoaXMuc3RvcE9iamVjdCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiBcclxuICBiZWZvcmVSZW5kZXIoKSB7XHJcbiAgICBpZiggdGhpcy5pc1B1c2hpbmcoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZ2V0WCgpICE9IHRoaXMudGFyZ2V0WCB8fCB0aGlzLmdldFkoKSAhPSB0aGlzLnRhcmdldFkgKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9QdXNoRGlyZWN0aW9uKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdG9wT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gICAgICAgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuQmVQdXNoZWQ7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuQ29sbGVjdCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICAgIHRoaXMuY29sbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLl9jYW5SZXNwYXduID0gY2FuQ29sbGVjdFByb3BzLmNhblJlc3Bhd247XHJcbiAgfVxyXG5cclxuICBpc0NvbGxlY3RlZCgpIHsgcmV0dXJuIHRoaXMuY29sbGVjdGVkOyB9XHJcbiAgY29sbGVjdCgpeyB0aGlzLmNvbGxlY3RlZCA9IHRydWU7IH1cclxuICBzZXRDb2xsZWN0KGJvb2wpIHsgdGhpcy5jb2xsZWN0ID0gYm9vbDsgfVxyXG5cclxuICBzZXRDYW5SZXNwYXduKGJvb2wpeyB0aGlzLl9jYW5SZXNwYXduID0gYm9vbDsgfVxyXG4gIGNhblJlc3Bhd24oKSB7IHJldHVybiB0aGlzLl9jYW5SZXNwYXduOyB9XHJcbiAgXHJcbiAgc2V0TmFtZShuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NhbkNvbGxlY3Q7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuSHVydCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLGNhbkh1cnRQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhbkh1cnRQcm9wcy5hbW91bnQ7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIElmIGl0J3Mgbm90IGNvbGxpZGluZyB0byBhbnkgdGVsZXBvcnQgY2h1bmsgYW55bW9yZSwgbWFrZSBpdCByZWFkeSB0byB0ZWxlcG9ydCBhZ2FpblxyXG4gIGNvbGxpc2lvbihvYmopeyBcclxuICAgIGlmKCBvYmoudHlwZSA9PSBcInBsYXllclwiICkgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTtcclxuICAgIGlmKCBvYmoudHlwZSA9PSBcImVuZW15XCIgKSBvYmouaHVydCh0aGlzLmh1cnRBbW91bnQpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkge1xyXG4gICAgLy8gZGVidWcgcG9zaXRpb25cclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgIGxldCB4ID0gTWF0aC5yb3VuZCh0aGlzLmdldENvbGxpc2lvblgoKSk7XHJcbiAgICAgIGxldCB5ID0gTWF0aC5yb3VuZCh0aGlzLmdldENvbGxpc2lvblkoKSk7XHJcbiAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIHggKyBcIiBZOiBcIiArIHk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xyXG4gICAgICBjdHguZm9udCA9IFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnI0ZGRkZGRic7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCAsIHRoaXMuZ2V0WSgpKTsgXHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuSHVydDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIF9DYW5UaHJvdyBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvd1Byb3BzLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGZyb21TYXZlU3RhdGUpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbkdyYWIgPSB0cnVlO1xyXG4gICAgdGhpcy5ncmFiYmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wbGF5ZXJXaG9HcmFiYmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BwZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcHBlZFN0YWdlID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BYID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BZID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhblRocm93UHJvcHMuY2FuUmVzcGF3bjtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhblRocm93UHJvcHMuaHVydEFtb3VudDtcclxuXHJcbiAgICB0aGlzLnVzZUV2ZW50ID0gY2FuVGhyb3dQcm9wcy51c2VFdmVudDtcclxuICAgIFxyXG4gICAgdGhpcy50aHJvd0Rpc3RhbmNlID0gY2FuVGhyb3dQcm9wcy5jaHVuY2tzVGhyb3dEaXN0YW5jZSAqIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG4gICAgdGhpcy50aHJvd1NwZWVkID0gMC44O1xyXG4gICAgdGhpcy50aHJvd0Rpc3RhbmNlVHJhdmVsbGVkID0gMDtcclxuICAgIHRoaXMudGhyb3dpbmdNb3ZlbWVudCA9IGZhbHNlO1xyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZGVzdHJveU9uQW5pbWF0aW9uRW5kID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHRoaXMudGFyZ2V0WCA9IDA7XHJcbiAgICB0aGlzLnRhcmdldFkgPSAwO1xyXG5cclxuICAgIC8vIENvbnRyb2xzIHRoZSBzcHJpdGUgRlBTIEFuaW1hdGlvblxyXG4gICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAoIHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5mcHMgKiAyICk7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAvLyBEZXN0cm95IGFuaW1hdGlvbiBwcm9wc1xyXG4gICAgdGhpcy5kZXN0cm95aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmRlc3Ryb3lTcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDUwKTtcclxuICAgIHRoaXMuZGVzdHJveUZyYW1lQ291bnQgPSAxO1xyXG4gICAgdGhpcy5kZXN0cm95TWF4RnJhbWVDb3VudCA9IDg7XHJcbiAgICB0aGlzLmRlc3Ryb3lJbml0RnJhbWUgPSAzO1xyXG4gIH1cclxuXHJcbiAgaXNDb2xsZWN0ZWQoKSB7IHJldHVybiB0aGlzLmNvbGxlY3RlZDsgfVxyXG4gIGNvbGxlY3QoKXsgdGhpcy5jb2xsZWN0ZWQgPSB0cnVlOyB9XHJcbiAgc2V0Q29sbGVjdChib29sKSB7IHRoaXMuY29sbGVjdGVkID0gYm9vbDsgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBGaXJlIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gXHJcblxyXG4gIGlzRGVzdHJveWluZygpIHsgcmV0dXJuIHRoaXMuZGVzdHJveWluZzsgfVxyXG4gIHNldERlc3Ryb3lpbmcoYm9vbCkgeyB0aGlzLmRlc3Ryb3lpbmcgPSBib29sOyB9XHJcbiAgXHJcbiAgc2V0RGVzdHJveU9uQW5pbWF0aW9uRW5kKGJvb2wpIHsgdGhpcy5kZXN0cm95T25BbmltYXRpb25FbmQgPSBib29sOyB9XHJcblxyXG4gIGlzR3JhYmJlZCgpIHsgcmV0dXJuIHRoaXMuZ3JhYmJlZDsgfVxyXG4gIGdyYWIoKXsgXHJcbiAgICB0aGlzLmdyYWJiZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5kcm9wcGVkID0gZmFsc2U7IFxyXG4gIH1cclxuICBzZXRHcmFiKGJvb2wpIHsgXHJcbiAgICB0aGlzLmdyYWJiZWQgPSBib29sOyBcclxuICAgIHRoaXMuZHJvcHBlZCA9ICFib29sO1xyXG4gIH1cclxuICBzZXRQbGF5ZXJXaG9HcmFiYmVkKHBsYXllck51bWJlcikgeyB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBwbGF5ZXJOdW1iZXI7IH1cclxuXHJcbiAgaXNUaHJvd2luZygpIHsgcmV0dXJuIHRoaXMudGhyb3dpbmdNb3ZlbWVudDsgfVxyXG4gIHNldFRocm93aW5nKGJvb2wpIHsgdGhpcy50aHJvd2luZ01vdmVtZW50ID0gYm9vbDsgfVxyXG4gIGdldFRocm93U3BlZWQoKSB7IHJldHVybiAgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiB0aGlzLnRocm93U3BlZWQ7IH1cclxuICBjYWxjdWxhdGVUaHJvd0RpcmVjdGlvbihkaXJlY3Rpb24sIHBsYXllckhlaWdodCkgeyBcclxuICAgIHRoaXMudGhyb3dEaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICBzd2l0Y2goIHRoaXMudGhyb3dEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gdGhpcy50aHJvd0Rpc3RhbmNlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgdGhpcy50aHJvd0Rpc3RhbmNlICsgdGhpcy5nZXRIZWlnaHQoKSAqIDI7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgKyB0aGlzLnRocm93RGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgLSB0aGlzLnRocm93RGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgY2FsY3VsYXRlRHJvcERpcmVjdGlvbihkaXJlY3Rpb24sIHBsYXllckhlaWdodCkgeyBcclxuICAgIHRoaXMudGhyb3dEaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICBzd2l0Y2goIHRoaXMudGhyb3dEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSArIHRoaXMuZ2V0SGVpZ2h0KCkgKiAyOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpICsgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHBsYXllckhlaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgLSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG4gIGdyYWJIYW5kbGVyKCBwbGF5ZXJOdW1iZXIgKSB7XHJcbiAgICB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBwbGF5ZXJOdW1iZXI7XHJcbiAgICB0aGlzLnNldEdyYWIodHJ1ZSk7XHJcbiAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7IC8vIGF2b2lkIHBsYXllcnMgcHVzaGluZyBvdGhlciBwbGF5ZXJzIHdpdGggaXRlbXNcclxuICB9XHJcblxyXG4gIGJyZWFrT2JqZWN0KCkge1xyXG5cclxuICAgIHRoaXMuc2V0VGhyb3dpbmcoZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRHcmFiKGZhbHNlKTtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMuZGVzdHJveU9uQW5pbWF0aW9uRW5kICkge1xyXG4gICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgIHRoaXMuc2V0RGVzdHJveWluZyh0cnVlKTsgLy8gU3RhcnQgZGVzdHJveSBhbmltYXRpb25cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKHRydWUpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGlzRHJvcHBlZCgpIHsgcmV0dXJuIHRoaXMuZHJvcHBlZDsgfVxyXG4gIGRyb3AoZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQpIHtcclxuICAgIHRoaXMuY2FsY3VsYXRlRHJvcERpcmVjdGlvbiggZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQgKTtcclxuICAgIHRoaXMuc2V0RGVzdHJveU9uQW5pbWF0aW9uRW5kKGZhbHNlKTtcclxuICAgIHRoaXMuc2V0VGhyb3dpbmcodHJ1ZSk7XHJcbiAgICB0aGlzLnNldEdyYWIoZmFsc2UpO1xyXG4gICAgdGhpcy5wbGF5ZXJXaG9HcmFiYmVkID0gZmFsc2U7XHJcbiAgICB0aGlzLmRyb3BYID0gdGhpcy50YXJnZXRYO1xyXG4gICAgdGhpcy5kcm9wWSA9IHRoaXMudGFyZ2V0WTtcclxuICB9XHJcblxyXG4gIHRocm93KGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpIHtcclxuICAgIHBsYXllci5zZXROb3RHcmFiYmluZygpO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVUaHJvd0RpcmVjdGlvbiggZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQgKTtcclxuICAgIHRoaXMuc2V0RGVzdHJveU9uQW5pbWF0aW9uRW5kKHRydWUpO1xyXG4gICAgdGhpcy5zZXRUaHJvd2luZyh0cnVlKTtcclxuICB9XHJcblxyXG4gIHVzZShkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKSB7XHJcbiAgICBzd2l0Y2goIHRoaXMudXNlRXZlbnQgKSB7XHJcbiAgICAgIGNhc2UgJ3Rocm93JzpcclxuICAgICAgICB0aGlzLnRocm93KGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbW92ZVRvVGhyb3dEaXJlY3Rpb24oKSB7XHJcbiAgICBzd2l0Y2goIHRoaXMudGhyb3dEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpIC8gMyApOyAvLyBTbG93IHRoZSBtb3ZlbWVudFxyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcblxyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAvLyBZXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcbiAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSAvIDMgKTtcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG4gICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICAgaWYgKHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICAgaWYgKHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMudGhyb3dEaXN0YW5jZVRyYXZlbGxlZCArPSB0aGlzLmdldFRocm93U3BlZWQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIGVuZW15IG9ubHlcclxuICAgIHRoaXMuanVzdENoZWNrQ29sbGlzaW9uKCk7XHJcblxyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uKCkge1xyXG4gICAgbGV0IG9iaiA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkpOyBcclxuICAgIGlmICggb2JqICAmJiB0aGlzLmlzVGhyb3dpbmcoKSApIHtcclxuICAgICAgaWYoIG9iai50eXBlID09IFwicGxheWVyXCIgKSB7XHJcbiAgICAgICAgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBwbGF5ZXJcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoIG9iai50eXBlID09IFwiZW5lbXlcIiApIHsgXHJcbiAgICAgICAgb2JqLmh1cnQodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBlbmVteVxyXG4gICAgICAgIHRoaXMuYnJlYWtPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuIFxyXG4gIGJlZm9yZVJlbmRlcihjdHgpIHtcclxuICAgIFxyXG4gICAgLy8gTW92ZW1lbnQgd2hpbGUgdGhyb3dpbmdcclxuICAgIGlmKCB0aGlzLmlzVGhyb3dpbmcoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZ2V0WCgpICE9IHRoaXMudGFyZ2V0WCB8fCB0aGlzLmdldFkoKSAhPSB0aGlzLnRhcmdldFkgKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlVG9UaHJvd0RpcmVjdGlvbigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuYnJlYWtPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgfSAgICAgICBcclxuXHJcbiAgICAvLyBEZXN0cm95IGFuaW1hdGlvblxyXG4gICAgaWYoIHRoaXMuaXNEZXN0cm95aW5nKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmRlc3Ryb3lGcmFtZUNvdW50IDwgdGhpcy5kZXN0cm95TWF4RnJhbWVDb3VudCAgKSB7XHJcbiAgICAgICAgaWYoIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5kZXN0cm95U3ByaXRlLmdldFNwcml0ZVByb3BzKCB0aGlzLmRlc3Ryb3lJbml0RnJhbWUgKTtcclxuICAgICAgICAgIHRoaXMuZGVzdHJveUluaXRGcmFtZSsrO1xyXG4gICAgICAgICAgdGhpcy5kZXN0cm95RnJhbWVDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NhblRocm93OyIsImNsYXNzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBmcm9tU2F2ZVN0YXRlKSB7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0gcG9zaXRpb24ueDtcclxuICAgIHRoaXMueSA9IHBvc2l0aW9uLnk7XHJcblxyXG4gICAgdGhpcy54MCA9IHBvc2l0aW9uLng7XHJcbiAgICB0aGlzLnkwID0gcG9zaXRpb24ueTtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodDtcclxuXHJcbiAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgdGhpcy5jb2xsaXNpb25YID0gdGhpcy54O1xyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0gdGhpcy55O1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcblxyXG4gICAgLy8gIyBFdmVudHNcclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gZXZlbnRzLnN0b3BPbkNvbGxpc2lvbjtcclxuICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSBldmVudHMuaGFzQ29sbGlzaW9uRXZlbnQ7XHJcbiAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5zcHJpdGUgPSBzcHJpdGU7XHJcblxyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlID0gc3ByaXRlLnN0YWdlU3ByaXRlO1xyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgXHJcbiAgICB0aGlzLm5hbWUgPSBwcm9wcy5zdGFnZSArIFwiX1wiICsgcHJvcHMubmFtZS5yZXBsYWNlKC9cXHMvZywnJykgKyBcIl9cIiArIHRoaXMueCArIFwieFwiICsgdGhpcy55O1xyXG4gICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB0aGlzLm9yaWdpbmFsTmFtZSA9IHByb3BzLm5hbWU7XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubmVlZFNhdmVTdGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZnJvbVNhdmVkU3RhdGUgPSAoIGZyb21TYXZlU3RhdGUpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IHByb3BzLnR5cGU7XHJcbiAgICB0aGlzLmNvZGUgPSAnJztcclxuICAgIHRoaXMuY2xhc3MgPSBwcm9wcy5jbGFzcztcclxuICAgIHRoaXMub3JpZ2luYWxTdGFnZSA9IHByb3BzLnN0YWdlO1xyXG5cclxuICAgIHRoaXMucnVuKCBwcm9wcy50eXBlICk7XHJcbiAgfVxyXG5cclxuICAvLyAjIENvZGVcclxuICBzZXRDb2RlKGNvZGUpIHsgdGhpcy5jb2RlID0gY29kZTsgfVxyXG4gIGdldENvZGUoKXsgcmV0dXJuIHRoaXMuY29kZTsgfVxyXG5cclxuICAvLyAjIFNldHNcclxuXHJcbiAgdXBkYXRlWCh4KSB7XHJcbiAgICB0aGlzLnNldFgoeCk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoeCk7XHJcbiAgfVxyXG4gIHVwZGF0ZVkoeSkge1xyXG4gICAgdGhpcy5zZXRZKHkpO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKHkpO1xyXG4gIH1cclxuICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHJcbiAgc2V0Q29sbGlzaW9uSGVpZ2h0KGhlaWdodCkgeyB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldENvbGxpc2lvbldpZHRoKHdpZHRoKSB7IHRoaXMuY29sbGlzaW9uV2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICBzZXRDb2xsaXNpb25YKHgpIHsgdGhpcy5jb2xsaXNpb25YID0geDsgfVxyXG4gIHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIC8vICEgTXVzdCBoYXZlIGluIGNoaWxkcyBDbGFzc1xyXG4gIH1cclxuXHJcbiAgc2V0U3RvcE9uQ29sbGlzaW9uKGJvb2wpe1xyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBib29sO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBWaXNpYmlsaXR5XHJcbiAgaGlkZSgpIHsgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyBcclxuICAgIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gZmFsc2U7XHJcbiAgfVxyXG4gIHNob3coKSB7IHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlOyB9XHJcblxyXG4gIC8vICMgIFN0YXRlXHJcbiAgd2lsbE5lZWRTYXZlU3RhdGUoKSB7ICByZXR1cm4gdGhpcy5uZWVkU2F2ZVN0YXRlOyB9XHJcbiAgc2V0TmVlZFNhdmVTdGF0ZShib29sKXsgdGhpcy5uZWVkU2F2ZVN0YXRlID0gYm9vbDsgfVxyXG5cdFx0XHRcclxuXHQvLyAjIEdldHNcclxuICBcclxuICBnZXROYW1lKCkgeyByZXR1cm4gdGhpcy5uYW1lOyB9XHJcblxyXG4gIGdldFR5cGUoKSB7IHJldHVybiB0aGlzLnR5cGU7IH1cclxuICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcblxyXG4gIGdldENvbGxpc2lvblgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvblg7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25ZOyB9XHJcblxyXG4gIGdldENlbnRlclgoIF94ICkgeyAvLyBNYXkgZ2V0IGEgY3VzdG9tIGNlbnRlclgsIHVzZWQgdG8gY2hlY2sgYSBmdXR1cmUgY29sbGlzaW9uXHJcbiAgICBsZXQgeCA9ICggX3ggKSA/IF94IDogdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICByZXR1cm4geCArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDI7IFxyXG4gIH1cclxuICBnZXRDZW50ZXJZKCBfeSApIHsgXHJcbiAgICBsZXQgeSA9ICggX3kgKSA/IF95IDogdGhpcy5nZXRDb2xsaXNpb25ZKCk7XHJcbiAgICByZXR1cm4geSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyBcclxuICB9XHJcblxyXG4gIC8vIEhvb2sgdG8gcnVuIGJlZm9yZSByZW5kZXJcclxuICBiZWZvcmVSZW5kZXIoY3R4KSB7ICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICBcclxuICAgIHRoaXMuYmVmb3JlUmVuZGVyKGN0eCk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIGxldCBzcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlUHJvcHM7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLnNwcml0ZS5nZXRTcHJpdGUoKSApIHsgLy8gT25seSByZW5kZXIgdGV4dHVyZSBpZiBpdCB3YXMgc2V0IGJlZm9yZVxyXG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCksICBcclxuICAgICAgICBzcHJpdGVQcm9wcy5jbGlwX3gsIHNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCBzcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgLy9ERUJVRyBDaHVuayBTaXplXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG5cclxuICAgICAgbGV0IGNvbGxpc2lvbl9wcm9wcyA9IHtcclxuICAgICAgICB3OiB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSxcclxuICAgICAgICB4OiB0aGlzLmdldENvbGxpc2lvblgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldENvbGxpc2lvblkoKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5zdG9wT25Db2xsaXNpb24gPyBcInJnYmEoMjU1LDAsMCwwLjIpXCIgOiBcInJnYmEoMCwyNTUsMCwwLjIpXCI7XHJcbiAgICAgIGN0eC5maWxsUmVjdChjb2xsaXNpb25fcHJvcHMueCwgY29sbGlzaW9uX3Byb3BzLnksIGNvbGxpc2lvbl9wcm9wcy53LCBjb2xsaXNpb25fcHJvcHMuaCk7XHJcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjIpXCI7XHJcbiAgICAgIGN0eC5saW5lV2lkdGggICA9IDU7XHJcbiAgICAgIGN0eC5zdHJva2VSZWN0KGNvbGxpc2lvbl9wcm9wcy54LCBjb2xsaXNpb25fcHJvcHMueSwgY29sbGlzaW9uX3Byb3BzLncsIGNvbGxpc2lvbl9wcm9wcy5oKTtcclxuXHJcbiAgICB9XHJcbiAgXHJcbiAgfVxyXG4gICAgXHJcbiAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gIC8vIFdpbGwgaXQgU3RvcCB0aGUgb3RoZXIgb2JqZWN0IGlmIGNvbGxpZGVzP1xyXG4gIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBObyBDb2xsaXNpb24gRXZlbnRcclxuICBub0NvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBSdW5zIHdoZW4gQ2xhc3Mgc3RhcnRzICBcclxuICBydW4oIHR5cGUgKSB7XHJcbiAgICB0aGlzLnNldFNwcml0ZVR5cGUodHlwZSk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ29sbGlkYWJsZTsiLCJjbGFzcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgc2NlbmFyaW9faWQpe1xyXG4gICAgdGhpcy5jdHggPSBjdHg7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgICAgICBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbSA9IG5ldyBBcnJheSgpO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFggPSAwOyBcclxuICAgIHRoaXMucGxheWVyU3RhcnRZID0gMDsgXHJcblxyXG4gICAgdGhpcy5zdGFnZSA9IG51bGw7XHJcbiAgICB0aGlzLnN0YWdlSWQgPSBcIlwiO1xyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIHRoaXMuc2NlbmFyaW9faWQgPSBzY2VuYXJpb19pZDtcclxuICB9XHJcblxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuICBhZGRTdGF0aWNJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbS5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX3RvcChpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFBsYXllcnNcclxuICBhZGRQbGF5ZXIocGxheWVyKSB7XHJcbiAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xyXG4gIH1cclxuICBnZXRQbGF5ZXJzKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJzOyB9XHJcblxyXG4gIC8vICMgR2V0c1xyXG4gIGdldEN0eCgpIHsgcmV0dXJuIHRoaXMuY3R4OyB9XHJcbiAgZ2V0Q2FudmFzKCkgeyByZXR1cm4gdGhpcy5jYW52YXM7IH1cdFxyXG5cclxuICBnZXRJZCgpIHsgcmV0dXJuIHRoaXMuc2NlbmFyaW9faWQ7IH1cclxuICBnZXRBY3R1YWxTdGFnZUlkKCkgeyByZXR1cm4gdGhpcy5zdGFnZUlkOyB9XHJcbiAgICAgICAgICAgICAgXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXNfX2JvdHRvbSgpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fdG9wKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3A7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcbiAgXHJcbiAgLy8gIyBTZXRzXHJcbiAgc2V0UGxheWVyMVN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMVN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIxU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIxU3RhcnRZID0geTsgfVxyXG5cclxuICBzZXRQbGF5ZXIyU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjJTdGFydFkoeSkgeyB0aGlzLnBsYXllcjJTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldEFjdHVhbFN0YWdlSWQoaWQpeyBcclxuICAgIHRoaXMuc3RhZ2VJZCA9IGlkOyBcclxuICAgIHdpbmRvdy5nYW1lLnNldEN1cnJlbnRTdGFnZSggaWQgKTtcclxuICB9XHJcblxyXG4gIC8vICMgU2F2ZSB0aGUgU3RhdGUgb2YgaXRlbXNcclxuICBzYXZlSXRlbXNTdGF0ZSgpIHtcclxuICAgIC8vIEJvdHRvbSBMYXllclxyXG4gICAgbGV0IGl0ZW1zID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmdldENvbEl0ZW5zKCk7XHJcbiAgICBmb3IgKGxldCBpIGluIGl0ZW1zKSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlSXRlbUlmTmVlZFNhdmUoaXRlbXNbaV0pO1xyXG4gICAgfVxyXG4gICAgd2luZG93LmdhbWUuc2F2ZUl0ZW1zU3RhdGUoKTtcclxuICB9XHJcblxyXG4gIGhhbmRsZUl0ZW1JZk5lZWRTYXZlKGl0ZW0pIHtcclxuICAgIGlmKCBpdGVtLndpbGxOZWVkU2F2ZVN0YXRlKCkgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBHcmFiYmVkXHJcbiAgICAgIGxldCBncmFiYmVkID0gZmFsc2U7XHJcbiAgICAgIGxldCBncmFiUHJvcHMgPSB7fTtcclxuICAgICAgaWYoIGl0ZW0uY2FuR3JhYiApIHtcclxuICAgICAgICBncmFiYmVkID0gaXRlbS5pc0dyYWJiZWQoKTtcclxuICAgICAgICBpZiggZ3JhYmJlZCApIHtcclxuICAgICAgICAgIGdyYWJQcm9wcyA9IHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogaXRlbS5jbGFzcyxcclxuICAgICAgICAgICAgJ2NvZGUnOiBpdGVtLmNvZGUsXHJcbiAgICAgICAgICAgICd4MCc6IGl0ZW0ueDAsXHJcbiAgICAgICAgICAgICd5MCc6IGl0ZW0ueTAsXHJcbiAgICAgICAgICAgICduYW1lJzogaXRlbS5vcmlnaW5hbE5hbWUsXHJcbiAgICAgICAgICAgICdzdGFnZSc6IGl0ZW0ub3JpZ2luYWxTdGFnZSxcclxuICAgICAgICAgICAgJ3BsYXllcldob0dyYWJiZWQnOiBpdGVtLnBsYXllcldob0dyYWJiZWRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIERyb3BwZWRcclxuICAgICAgbGV0IGRyb3BwZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IGRyb3BQcm9wcyA9IHt9O1xyXG4gICAgICBpZiggaXRlbS5jYW5HcmFiICkge1xyXG4gICAgICAgIGRyb3BwZWQgPSBpdGVtLmlzRHJvcHBlZCgpO1xyXG4gICAgICAgIGlmKCBkcm9wcGVkICkge1xyXG4gICAgICAgICAgZHJvcFByb3BzID0ge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiBpdGVtLmNsYXNzLFxyXG4gICAgICAgICAgICAnY29kZSc6IGl0ZW0uY29kZSxcclxuICAgICAgICAgICAgJ3gwJzogaXRlbS54MCxcclxuICAgICAgICAgICAgJ3kwJzogaXRlbS55MCxcclxuICAgICAgICAgICAgJ2Ryb3BYJzogaXRlbS5kcm9wWCxcclxuICAgICAgICAgICAgJ2Ryb3BZJzogaXRlbS5kcm9wWSxcclxuICAgICAgICAgICAgJ25hbWUnOiBpdGVtLm9yaWdpbmFsTmFtZSxcclxuICAgICAgICAgICAgJ3N0YWdlJzogaXRlbS5vcmlnaW5hbFN0YWdlLFxyXG4gICAgICAgICAgICAnZHJvcHBlZFN0YWdlJzogKGl0ZW0uZHJvcHBlZFN0YWdlKSA/IGl0ZW0uZHJvcHBlZFN0YWdlIDogdGhpcy5nZXRBY3R1YWxTdGFnZUlkKCkgLy8gSWYgZG9uJ3QgaGF2ZSBkcm9wcGVkIHN0YWdlLCBtZWFucyB3ZSB3YW50IHRoZSBhY3R1YWwgc3RhZ2UuICBJZiBoYXMsIGtlZXAgaXRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdpbmRvdy5nYW1lLmFkZEl0ZW1TdGF0ZShcclxuICAgICAgICB7XHJcbiAgICAgICAgICAnbmFtZV9pZCc6IGl0ZW0uZ2V0TmFtZSgpLFxyXG4gICAgICAgICAgJ2NvbGxlY3RlZCc6IGl0ZW0uaXNDb2xsZWN0ZWQoKSxcclxuICAgICAgICAgICdncmFiYmVkJzogZ3JhYmJlZCxcclxuICAgICAgICAgICdncmFiUHJvcHMnOiBncmFiUHJvcHMsXHJcbiAgICAgICAgICAnZHJvcHBlZCc6IGRyb3BwZWQsXHJcbiAgICAgICAgICAnZHJvcFByb3BzJzogZHJvcFByb3BzXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRnVuY3Rpb25zIHRvIGxvYWQgc2VsZWN0ZWQgc3RhZ2VcclxuICBsb2FkU3RhZ2Uoc3RhZ2UsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgdGhpcy5zdGFnZSA9IHN0YWdlO1xyXG5cclxuICAgIC8vIENsZWFyIHByZXZpb3VzIHJlbmRlciBpdGVtc1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBTdGF0aWMgSXRlbXNcclxuICAgIHRoaXMuc3RhZ2UuZ2V0U3RhdGljSXRlbXMoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpdGVtLnNjZW5hcmlvID0gdGhpczsgLy8gUGFzcyB0aGlzIHNjZW5hcmlvIGNsYXNzIGFzIGFuIGFyZ3VtZW50LCBzbyBvdGhlciBmdW5jdGlvbnMgY2FuIHJlZmVyIHRvIHRoaXNcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKGl0ZW0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBBbmltYXRlZCBJdGVtcyAtIEJvdHRvbVxyXG4gICAgdGhpcy5zdGFnZS5nZXRMYXllckl0ZW1zX19ib3R0b20oKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpdGVtLnNjZW5hcmlvID0gdGhpcztcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShpdGVtKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YWdlLmdldExheWVySXRlbXNfX3RvcCgpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKGl0ZW0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgcGxheWVyIGhhcyBzb21ldGhpbmcgZ3JhYmJlZCBhbmQgaW5jbHVkZSBpbiByZW5kZXJcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJyk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgIT0gXCJ7fVwiICkge1xyXG4gICAgICBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKHNhdmVkSXRlbXNTdGF0ZSk7XHJcbiAgICAgIGZvciggbGV0IGkgaW4gc2F2ZWRJdGVtc1N0YXRlICkge1xyXG4gICAgICAgIGxldCBpdGVtID0gc2F2ZWRJdGVtc1N0YXRlW2ldO1xyXG4gICAgICAgIC8vIEluY2x1ZGUgZ3JhYmJlZCBpdGVtXHJcbiAgICAgICAgaWYoIGl0ZW0uZ3JhYmJlZCApIHtcclxuICAgICAgICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoIGl0ZW0uZ3JhYlByb3BzLmNsYXNzLCBpdGVtLmdyYWJQcm9wcywgdHJ1ZSApOyAvLyB0cnVlID0gY2FtZSBmcm9tIHNhdmUgc3RhdGVcclxuICAgICAgICAgIG9iai5ncmFiSGFuZGxlciggaXRlbS5ncmFiUHJvcHMucGxheWVyV2hvR3JhYmJlZCApOyAvLyBzdGFydCBhIHNldHVwIG9uIHRoZSBvYmplY3QsIHNvIHRoZSBwbGF5ZXIgd2lsbCBjaGVjayB0aGUgc2F2ZWQgc3RhdGUgb2YgaXRlbVxyXG4gICAgICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJbmNsdWRlIGRyb3BwZWQgaXRlbVxyXG4gICAgICAgIGlmKCBpdGVtLmRyb3BwZWQgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuZ2xvYmFsQXNzZXRzLmdldEFzc2V0KCBpdGVtLmRyb3BQcm9wcy5jbGFzcywgeyBjb2RlOiBpdGVtLmRyb3BQcm9wcy5jb2RlLCB4MDogaXRlbS5kcm9wUHJvcHMueDAsIHkwOiBpdGVtLmRyb3BQcm9wcy55MCwgc3RhZ2U6IGl0ZW0uZHJvcFByb3BzLnN0YWdlIH0sIHRydWUgKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoIHRoaXMuc3RhZ2UuZ2V0U3RhZ2VJZCgpICE9IGl0ZW0uZHJvcFByb3BzLmRyb3BwZWRTdGFnZSApIHtcclxuICAgICAgICAgICAgb2JqLmhpZGUoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBvYmouZHJvcHBlZFN0YWdlID0gaXRlbS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlO1xyXG4gICAgICAgICAgb2JqLmRyb3BwZWQgPSB0cnVlO1xyXG4gICAgICAgICAgb2JqLnVwZGF0ZVgoIGl0ZW0uZHJvcFByb3BzLmRyb3BYICk7XHJcbiAgICAgICAgICBvYmoudXBkYXRlWSggaXRlbS5kcm9wUHJvcHMuZHJvcFkgKTtcclxuICAgICAgICAgIG9iai5kcm9wWCA9IGl0ZW0uZHJvcFByb3BzLmRyb3BYO1xyXG4gICAgICAgICAgb2JqLmRyb3BZID0gaXRlbS5kcm9wUHJvcHMuZHJvcFk7XHJcbiAgICAgICAgICBvYmoueDAgPSBpdGVtLmRyb3BQcm9wcy54MDtcclxuICAgICAgICAgIG9iai55MCA9IGl0ZW0uZHJvcFByb3BzLnkwO1xyXG5cclxuICAgICAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20ob2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT25seSBzZXQgcGxheWVyIHN0YXJ0IGF0IGZpcnN0IGxvYWRcclxuICAgIGlmKGZpcnN0U3RhZ2UpIHtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjFTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WSgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WCggdGhpcy5zdGFnZS5nZXRQbGF5ZXIyU3RhcnRYKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFkoKSApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2luZG93LmdhbWUucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuY2hlY2tHcmFiYmluZ09iamVjdHMoKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcblxyXG4gIHJlbmRlcigpIHsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU2NlbmFyaW87IiwiY2xhc3MgX1N0YWdlIHtcclxuXHJcbiAgY29uc3RydWN0b3Ioc3RhZ2VJZCkge1xyXG4gICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5jaHVua1NpemUgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuXHJcbiAgICB0aGlzLnBsYXllcjFTdGFydFggPSAwO1xyXG4gICAgdGhpcy5wbGF5ZXIxU3RhcnRZID0gMDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXIyU3RhcnRYID0gMDtcclxuICAgIHRoaXMucGxheWVyMlN0YXJ0WSA9IDA7XHJcblxyXG4gICAgdGhpcy5zdGFnZUlkID0gc3RhZ2VJZDtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXNfX2JvdHRvbSgpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fdG9wKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3A7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcblxyXG4gIGdldFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuICBcclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20ucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcC5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuICBcclxuICBydW4gKCkgeyB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX1N0YWdlOyIsIi8vIENsYXNzIHRoYXQgZGV0ZWN0cyBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIG90aGVyIG9iamVjdHNcclxuY2xhc3MgQ29sbGlzaW9uIHtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2NlbmFyaW9XaWR0aCwgc2NlbmFyaW9IZWlnaHQsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpOyAvLyBJdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcbiAgICB0aGlzLnNjZW5hcmlvV2lkdGggPSBzY2VuYXJpb1dpZHRoO1xyXG4gICAgdGhpcy5zY2VuYXJpb0hlaWdodCA9IHNjZW5hcmlvSGVpZ2h0O1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgfVxyXG5cclxuICBnZXRDb2xJdGVucygpIHsgcmV0dXJuIHRoaXMuY29sSXRlbnM7IH1cclxuXHRcdFx0XHJcbiAgLy8gIyBDaGVjayBpZiB0aGUgb2JqZWN0IGNvbGxpZGVzIHdpdGggYW55IG9iamVjdCBpbiB2ZWN0b3JcclxuICAvLyBBbGdvcml0aG0gcmVmZXJlbmNlOiBHdXN0YXZvIFNpbHZlaXJhIC0gaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1zN3FpV0xCQnBKd1xyXG4gIGNoZWNrKG9iamVjdCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMSA9IG9iamVjdDtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgdGhpcy5jaGVja0NvbGxpc2lvbihyMSwgcjIpO1xyXG4gICAgfSBcclxuICB9XHJcblxyXG4gIC8vIEByMTogdGhlIG1vdmluZyBvYmplY3RcclxuICAvLyBAcjI6IHRoZSBcIndhbGxcIlxyXG4gIGNoZWNrQ29sbGlzaW9uKHIxLCByMikge1xyXG5cclxuICAgIC8vIERvbid0IGNoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHNhbWUgb2JqZWN0XHJcbiAgICBpZiggcjEubmFtZSA9PSByMi5uYW1lICkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICYmICEgcjIuc3RvcElmQ29sbGlzaW9uKCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gcjEuZ2V0Q2VudGVyWCgpIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSByMS5nZXRDZW50ZXJZKCkgLSByMi5nZXRDZW50ZXJZKCk7XHJcblxyXG4gICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggcjEuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCByMS5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgdmFyIG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgIHZhciBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuXHJcbiAgICAgIGlmKCByMi5zdG9wSWZDb2xsaXNpb24oKSApIHtcclxuICAgICAgICBpZihvdmVybGFwWCA+PSBvdmVybGFwWSApeyAvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gVXAvRG93blxyXG4gICAgICAgICAgaWYoY2F0WSA+IDApeyAvLyBVcFxyXG4gICAgICAgICAgICByMS5zZXRZKCByMS5nZXRZKCkgKyBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25ZKCByMS5nZXRDb2xsaXNpb25ZKCkgKyBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpIC0gb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWSggcjEuZ2V0Q29sbGlzaW9uWSgpIC0gb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Ugey8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBMZWZ0L1JpZ2h0XHJcbiAgICAgICAgICBpZihjYXRYID4gMCl7IC8vIExlZnRcclxuICAgICAgICAgICAgcjEuc2V0WCggcjEuZ2V0WCgpICsgb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWCggcjEuZ2V0Q29sbGlzaW9uWCgpICsgb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSAtIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblgoIHIxLmdldENvbGxpc2lvblgoKSAtIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiggd2luZG93LmRlYnVnQ29sbGlzaW9uICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gYmV0d2VlbicsIHIxLm5hbWUgKyBcIihcIiArIHIxLmdldFgoKSArIFwiL1wiICsgcjEuZ2V0WSgpICsgXCIpXCIsIHIyLm5hbWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUcmlnZ2VycyBDb2xsaXNpb24gZXZlbnRcclxuICAgICAgcjEuY29sbGlzaW9uKHIyLCByMSk7XHJcbiAgICAgIHIyLmNvbGxpc2lvbihyMSwgcjIpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyaWdnZXJzIG5vdCBpbiBjb2xsaXNpb24gZXZlbnRcclxuICAgICAgcjEubm9Db2xsaXNpb24ocjIsIHIyKTsgXHJcbiAgICAgIHIyLm5vQ29sbGlzaW9uKHIxLCByMik7IFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIEp1c3QgY2hlY2sgZm9yIGEgc3BlY2lmaWMgY29sbGlzaW9uIGFuZCByZXR1cm4gdGhlIGZpcnQgb2JqZWN0IGNvbGxpZGVkXHJcbiAganVzdENoZWNrKHIxLCBfeCwgX3ksIF93LCBfaCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIGxldCByID0gdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24ocjEsIHIyLCBfeCwgX3ksIF93LCBfaCk7XHJcbiAgICAgIGlmKCByICkgcmV0dXJuIHI7IC8vIGlmIGhhcyBzb21ldGhpbmcsIHJldHVybiBhbmQgc3RvcCBsb29wXHJcbiAgICB9IFxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uKHIxLCByMiwgX3gsIF95LCBfdywgX2gpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9yZXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIG9iamVjdHMgKG11c3QgYmUgcmVjdGFuZ2xlKVxyXG4gICAgdmFyIGNhdFggPSAoIF94ICsgX3cgLyAyICkgLSByMi5nZXRDZW50ZXJYKCk7XHJcbiAgICB2YXIgY2F0WSA9ICggX3kgKyBfaCAvIDIgKSAtIHIyLmdldENlbnRlclkoKTtcclxuIFxyXG4gICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggX3cgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggX2ggLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgcmV0dXJuIHIyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlOyAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gSnVzdCBjaGVjayBmb3IgYSBzcGVjaWZpYyBjb2xsaXNpb24gYW5kIHJldHVybiB0aGUgZmlydCBvYmplY3QgY29sbGlkZWRcclxuICBqdXN0Q2hlY2tBbGwocjEsIF94LCBfeSwgX3csIF9oKSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgbGV0IHIgPSB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbkFsbChyMSwgcjIsIF94LCBfeSwgX3csIF9oKTtcclxuICAgICAgaWYoIHIgKSByZXR1cm4gcjsgLy8gaWYgaGFzIHNvbWV0aGluZywgcmV0dXJuIGFuZCBzdG9wIGxvb3BcclxuICAgIH0gXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb25BbGwocjEsIHIyLCBfeCwgX3ksIF93LCBfaCkge1xyXG5cclxuICAgIC8vIERvbid0IGNoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHNhbWUgb2JqZWN0XHJcbiAgICBpZiggcjEubmFtZSA9PSByMi5uYW1lICkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICYmICEgcjIuc3RvcElmQ29sbGlzaW9uKCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gKCBfeCArIF93IC8gMiApIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSAoIF95ICsgX2ggLyAyICkgLSByMi5nZXRDZW50ZXJZKCk7XHJcbiBcclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIF93IC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIF9oIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIFxyXG4gICAgICAvL2NhbGN1bGF0ZSBvdmVybGFwIGlmIG5lZWQgdG8gc3RvcCBvYmplY3RcclxuICAgICAgbGV0IG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgIGxldCBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuXHJcbiAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZICl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duXHJcbiAgICAgICAgaWYoY2F0WSA+IDApeyAvLyBVcFxyXG4gICAgICAgICAgcjIub3ZlcmxhcFkgPSByMS5nZXRZKCkgKyBvdmVybGFwWTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcjIub3ZlcmxhcFkgPSByMS5nZXRZKCkgLSBvdmVybGFwWTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICBpZihjYXRYID4gMCl7IC8vIExlZnRcclxuICAgICAgICAgIHIyLm92ZXJsYXBYID0gcjEuZ2V0WCgpICsgb3ZlcmxhcFg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHIyLm92ZXJsYXBYID0gcjEuZ2V0WCgpIC0gb3ZlcmxhcFg7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcjI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7ICBcclxuICAgIH1cclxuXHJcbiAgfVxyXG4gIFx0XHRcclxuXHQvLyBBZGQgaXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG5cdGFkZEl0ZW0ob2JqZWN0KSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0KTtcclxuICB9O1xyXG4gIFxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xlYXJBcnJheUl0ZW1zKCkge1xyXG4gICAgdGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi8uLi9nYW1lUHJvcGVydGllcycpO1xyXG5jb25zdCBzY2VuYXJpb1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc2NlbmFyaW9Qcm90b3R5cGUnKTtcclxuY29uc3Qgc2NlbmFyaW9TYW5kYm94ID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc2NlbmFyaW9TYW5kYm94Jyk7XHJcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9QbGF5ZXInKTtcclxuY29uc3QgQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9Db2xsaXNpb24nKTtcclxuY29uc3QgUmVuZGVyID0gcmVxdWlyZSgnLi9SZW5kZXInKTtcclxuY29uc3QgVUkgPSByZXF1aXJlKCcuLi91aS9VSScpO1xyXG5jb25zdCBHbG9iYWxBc3NldHMgPSByZXF1aXJlKCcuLi9hc3NldHMvR2xvYmFsQXNzZXRzJyk7XHJcblxyXG5jbGFzcyBHYW1lIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gRlBTIENvbnRyb2xcclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSBudWxsOyBcclxuICAgIHRoaXMubm93ID0gbnVsbDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbnVsbDsgXHJcbiAgICB0aGlzLmVsYXBzZWQgPSBudWxsO1xyXG5cclxuICAgIC8vIEV2ZW50c1xyXG4gICAgdGhpcy5rZXlzRG93biA9IHt9O1xyXG4gICAgdGhpcy5rZXlzUHJlc3MgPSB7fTtcclxuXHJcbiAgICAvLyBQYXVzZVxyXG4gICAgdGhpcy5fcGF1c2UgPSBmYWxzZTtcclxuICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gSXRlbXNcclxuICAgIHRoaXMuaXRlbXNTdGF0ZSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICAvLyBHYW1lXHJcbiAgICAgIHRoaXMuZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcbiAgICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbiA9IG51bGw7XHJcbiAgICAgIHRoaXMuZGVmYXVsdFNjZW5hcmlvID0gJ3NhbmRib3gnO1xyXG4gICAgICB0aGlzLnNjZW5hcmlvID0gbnVsbDtcclxuICAgICAgdGhpcy5VSSA9IG51bGw7XHJcbiAgICAgIHRoaXMuY3VycmVudFN0YWdlTmFtZSA9ICcnO1xyXG5cclxuICAgICAgdGhpcy5nYW1lUmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIHRoaXMubXVsdGlwbGF5ZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFJlbmRlcnNcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBudWxsO1xyXG4gICAgICB0aGlzLnJlbmRlckxheWVycyA9IG51bGw7XHJcbiAgICAgIHRoaXMucmVuZGVyVUkgICAgID0gbnVsbDtcclxuXHJcbiAgICAgIHRoaXMuZ2xvYmFsQXNzZXRzID0gbmV3IEdsb2JhbEFzc2V0cyggdGhpcy5nYW1lUHJvcHMuY2h1bmtTaXplICk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gR2V0c1xyXG4gIGlzR2FtZVJlYWR5KCkgeyByZXR1cm4gdGhpcy5nYW1lUmVhZHk7IH1cclxuICBnZXRDaHVua1NpemUoKSB7IHJldHVybiB0aGlzLmdhbWVQcm9wcy5jaHVua1NpemU7IH1cclxuXHJcbiAgZ2V0Q2FudmFzV2lkdGgoKSAgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2FudmFzV2lkdGg7ICB9XHJcbiAgZ2V0Q2FudmFzSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2FudmFzSGVpZ2h0OyB9XHJcblxyXG4gIC8vIFNldHNcclxuICBzZXRHYW1lUmVhZHkoYm9vbCkgeyB0aGlzLmdhbWVSZWFkeSA9IGJvb2w7IH1cclxuXHJcbiAgc2V0Q3VycmVudFN0YWdlKHN0YWdlKXsgdGhpcy5jdXJyZW50U3RhZ2VOYW1lID0gc3RhZ2U7IH1cclxuICBnZXRDdXJyZW50U3RhZ2UoKSB7IHJldHVybiB0aGlzLmN1cnJlbnRTdGFnZU5hbWU7IH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgRGVmYXVsdCBFdmVudCBMaXN0ZW5lcnNcclxuICBkZWZhdWx0RXZlbnRMaXN0ZW5lcnMoKSB7XHJcblxyXG4gICAgLy8gTWVudSBDbGlja3NcclxuICAgIGxldCBtZW51SXRlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21lbnUtaXRlbScpO1xyXG4gICAgXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lbnVJdGVtLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxldCBfdGhpcyA9IHRoaXM7XHJcbiAgICAgIG1lbnVJdGVtW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgX3RoaXMubWVudUFjdGlvbiggdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWFjdGlvblwiKSApO1xyXG4gICAgICB9LCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBLZXlib2FyZCBFdmVudHNcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICB0aGlzLmtleXNEb3duW2Uua2V5Q29kZV0gPSB0cnVlO1xyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBcclxuICAgICAgLy8gQ2xlYXIgcHJldmlvdXMga2V5c1xyXG4gICAgICBkZWxldGUgdGhpcy5rZXlzRG93bltlLmtleUNvZGVdO1xyXG4gICAgICBcclxuICAgICAgLy8gUmVzZXQgcGxheWVycyBsb29rIGRpcmVjdGlvblxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLnJlc2V0U3RlcCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQYXVzZSBFdmVudCBMaXN0ZW5lclxyXG4gICAgICBpZiggZS5rZXlDb2RlID09IDI3ICYmIHRoaXMuZ2FtZUlzTG9hZGVkICkgeyAvLyBFU1FcclxuICAgICAgICB0aGlzLnRvZ2dsZVBhdXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBsYXllciBoYW5kbGUga2V5dXBcclxuICAgICAgaWYoIHRoaXMucGxheWVycykge1xyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHBsYXllci5oYW5kbGVLZXlVcChlLmtleUNvZGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFN0YXJ0L1Jlc3RhcnQgYSBHYW1lXHJcblxyXG4gIHJlZnJlc2hWYXJpYWJsZXMoKSB7XHJcblxyXG4gICAgLy8gQ2xlYXIgc2F2ZSBzdGF0ZVxyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpO1xyXG5cclxuICAgIC8vIFJlbmRlcnNcclxuICAgIHRoaXMuaXRlbXNTdGF0ZSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgfVxyXG5cclxuICBzdGFydE5ld0dhbWUoIHNhdmVEYXRhICkge1xyXG5cclxuICAgIHRoaXMucmVmcmVzaFZhcmlhYmxlcygpO1xyXG4gICAgXHJcbiAgICAvLyAjIEluaXRcclxuICAgICAgXHJcbiAgICAgIGxldCBjYW52YXNTdGF0aWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX3N0YXRpYycpO1xyXG4gICAgICBsZXQgY29udGV4dFN0YXRpYyA9IGNhbnZhc1N0YXRpYy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgbGV0IGNhbnZhc0xheWVycyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfbGF5ZXJzJyk7XHJcbiAgICAgIGxldCBjb250ZXh0TGF5ZXJzID0gY2FudmFzTGF5ZXJzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgIFxyXG4gICAgICBsZXQgY2FudmFzVUkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX3VpJyk7XHJcbiAgICAgIGxldCBjb250ZXh0VUkgPSBjYW52YXNVSS5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgICAgY2FudmFzTGF5ZXJzLndpZHRoID0gY2FudmFzU3RhdGljLndpZHRoID0gY2FudmFzVUkud2lkdGggPSB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjYW52YXNXaWR0aCcpO1xyXG4gICAgICBjYW52YXNMYXllcnMuaGVpZ2h0ID0gY2FudmFzU3RhdGljLmhlaWdodCA9IGNhbnZhc1VJLmhlaWdodCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc0hlaWdodCcpO1xyXG5cclxuICAgIC8vICMgU2NlbmFyaW9cclxuICAgICAgaWYoICEgc2F2ZURhdGEgKSB7XHJcbiAgICAgICAgdGhpcy5zY2VuYXJpbyA9IHRoaXMuZ2V0U2NlbmFyaW8oIHRoaXMuZGVmYXVsdFNjZW5hcmlvLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggc2F2ZURhdGEuc2NlbmFyaW8uc2NlbmFyaW9JZCwgY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgLy8gIyBQbGF5ZXJzXHJcbiAgICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgICAgaWYoICEgc2F2ZURhdGEgKSB7XHJcbiAgICAgICAgbGV0IHBsYXllciA9IG5ldyBQbGF5ZXIoIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WCgpLCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjFTdGFydFkoKSwgdGhpcy5nYW1lUHJvcHMsIDEgKTsgXHJcblxyXG4gICAgICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5tdWx0aXBsYXllciApIHtcclxuICAgICAgICAgIGxldCBwbGF5ZXIyID0gbmV3IFBsYXllciggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIyU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMlN0YXJ0WSgpLCB0aGlzLmdhbWVQcm9wcywgMiApOyBcclxuICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcjIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zY2VuYXJpby5hZGRQbGF5ZXIocGxheWVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc2F2ZURhdGEucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuXHJcbiAgICAgICAgICBsZXQgX3BsYXllciA9IG5ldyBQbGF5ZXIoIHBsYXllci54LCBwbGF5ZXIueSwgdGhpcy5nYW1lUHJvcHMsIHBsYXllci5wbGF5ZXJOdW1iZXIsIHBsYXllciApOyBcclxuXHJcbiAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaCggX3BsYXllcik7XHJcbiAgICAgICAgICB0aGlzLnNjZW5hcmlvLmFkZFBsYXllcihfcGxheWVyKTtcclxuXHJcbiAgICAgICAgfSk7ICBcclxuXHJcbiAgICAgIH1cclxuICAgIC8vICMgVUlcclxuICAgICAgXHJcbiAgICAgIHRoaXMuVUkgPSBuZXcgVUkoIHRoaXMucGxheWVycywgdGhpcy5nYW1lUHJvcHMpO1xyXG5cclxuICAgIC8vICMgQ29sbGlzaW9uIGRldGVjdGlvbiBjbGFzc1xyXG5cclxuICAgICAgdGhpcy5jb2xsaXNpb24gPSBuZXcgQ29sbGlzaW9uKCBjYW52YXNMYXllcnMud2lkdGgsIGNhbnZhc0xheWVycy5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyAjIFJlbmRlclxyXG5cclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBuZXcgUmVuZGVyKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyk7IC8vIFJlbmRlciBleGVjdXRlZCBvbmx5IG9uY2VcclxuICAgICAgdGhpcy5yZW5kZXJMYXllcnMgPSBuZXcgUmVuZGVyKGNvbnRleHRMYXllcnMsIGNhbnZhc0xheWVycyk7IC8vIFJlbmRlciB3aXRoIGFuaW1hdGVkIG9iamVjdHMgb25seVxyXG4gICAgICB0aGlzLnJlbmRlclVJICAgICA9IG5ldyBSZW5kZXIoY29udGV4dFVJLCBjYW52YXNVSSk7IFxyXG5cclxuICAgICAgLy8gQWRkIGl0ZW1zIHRvIGJlIHJlbmRlcmVkXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLnNldFNjZW5hcmlvKHRoaXMuc2NlbmFyaW8pOyAvLyBzZXQgdGhlIHNjZW5hcmlvXHJcbiAgICBcclxuICAgIC8vIEhpZGUgRWxlbWVudHNcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluTWVudVwiKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICAgIHRoaXMubG9hZGluZyhmYWxzZSk7XHJcblxyXG4gICAgLy8gU2hvdyBDYW52YXNcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDYW52YXMnKS5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc3VyZSB0aGUgZ2FtZSBpcyBub3QgcGF1c2VkXHJcbiAgICAgIHRoaXMudW5wYXVzZSgpO1xyXG4gICAgXHJcbiAgICAvLyBGbGFnIFxyXG4gICAgICB0aGlzLmdhbWVJc0xvYWRlZCA9IHRydWU7XHJcbiAgICBcclxuICAgIC8vIE9rLCBydW4gdGhlIGdhbWUgbm93XHJcbiAgICAgIHRoaXMuc2V0R2FtZVJlYWR5KHRydWUpO1xyXG4gICAgICB0aGlzLnJ1bkdhbWUoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2ZwcycpICk7XHQvLyBHTyBHTyBHT1xyXG5cclxuICB9Ly9uZXdHYW1lXHJcblxyXG4gICAgLy8gIyBUaGUgR2FtZSBMb29wXHJcbiAgICB1cGRhdGVHYW1lKGRlbHRhVGltZSkge1xyXG5cclxuICAgICAgaWYoIHRoaXMuaXNQYXVzZWQoKSApIHJldHVybjtcclxuICAgICAgXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLnN0YXJ0KCBkZWx0YVRpbWUgKTsgIC8vIFN0YXRpYyBjYW4gYWxzbyBjaGFuZ2UsIGJlY2F1c2UgaXQgaXMgdGhlIHNjZW5hcmlvLi4uIG1heWJlIHdpbGwgY2hhbmdlIHRoaXMgbmFtZXMgdG8gbGF5ZXJzXHJcbiAgICAgIHRoaXMucmVuZGVyVUkuc3RhcnQoIGRlbHRhVGltZSApO1xyXG4gICAgICB0aGlzLnJlbmRlckxheWVycy5zdGFydCggZGVsdGFUaW1lICk7XHJcblxyXG4gICAgICAvLyAjIEFkZCB0aGUgb2JqZWN0cyB0byB0aGUgY29sbGlzaW9uIHZlY3RvclxyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCkgKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX2JvdHRvbSgpICk7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmFkZEFycmF5SXRlbSggdGhpcy5zY2VuYXJpby5nZXRMYXllckl0ZW1zX190b3AoKSApO1xyXG4gICAgICAvKnRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0ocGxheWVyKTtcclxuICAgICAgfSk7Ki9cclxuICBcclxuICAgICAgLy8gXCJTdGF0aWNcIiBSZW5kZXIgLSBCYWNrZ3JvdW5kXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5hZGRBcnJheUl0ZW0odGhpcy5zY2VuYXJpby5nZXRTdGF0aWNJdGVtcygpKTsgLy8gR2V0IGFsbCBpdGVtcyBmcm9tIHRoZSBzY2VuYXJpbyB0aGF0IG5lZWRzIHRvIGJlIHJlbmRlcmVkXHJcblxyXG4gICAgICAvLyBMYXllcnMgUmVuZGVyXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcblxyXG4gICAgICAgIC8vICMgQm90dG9tIFxyXG4gICAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLmFkZEFycmF5SXRlbSggdGhpcy5zY2VuYXJpby5nZXRMYXllckl0ZW1zX19ib3R0b20oKSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vICMgTWlkZGxlXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkSXRlbSggcGxheWVyICk7IC8vIEFkZHMgdGhlIHBsYXllciB0byB0aGUgYW5pbWF0aW9uIHJlbmRlclxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyAjIFRvcFxyXG4gICAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLmFkZEFycmF5SXRlbSggdGhpcy5zY2VuYXJpby5nZXRMYXllckl0ZW1zX190b3AoKSApO1xyXG4gICAgICAgIFxyXG4gICAgICAvLyBVSSBSZW5kZXJcclxuICAgICAgdGhpcy5yZW5kZXJVSS5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5yZW5kZXJVSS5hZGRBcnJheUl0ZW0oIHRoaXMuVUkuZ2V0TmV3UmVuZGVySXRlbXMoKSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyAjIE1vdmVtZW50c1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgcGxheWVyLmhhbmRsZU1vdmVtZW50KCB0aGlzLmtleXNEb3duICk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gIyBDaGVjayBpZiBwbGF5ZXIgaXMgY29sbGlkaW5nXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbi5jaGVjayhwbGF5ZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIFwiVGhyZWFkXCIgdGhhIHJ1bnMgdGhlIGdhbWVcclxuICAgIHJ1bkdhbWUoZnBzKSB7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZnBzO1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIHRoaXMuZ2FtZUxvb3AoKTtcclxuICAgIH1cclxuICAgIGdhbWVMb29wKCkge1xyXG5cclxuICAgICAgLy8gY2FsYyBlbGFwc2VkIHRpbWUgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgIHRoaXMubm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5lbGFwc2VkID0gdGhpcy5ub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuXHJcbiAgICAgIC8vIGlmIGVub3VnaCB0aW1lIGhhcyBlbGFwc2VkLCBkcmF3IHRoZSBuZXh0IGZyYW1lXHJcbiAgICAgIGlmICggdGhpcy5lbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICAvLyBHZXQgcmVhZHkgZm9yIG5leHQgZnJhbWUgYnkgc2V0dGluZyB0aGVuPW5vdywgYnV0IGFsc28gYWRqdXN0IGZvciB5b3VyXHJcbiAgICAgICAgLy8gc3BlY2lmaWVkIGZwc0ludGVydmFsIG5vdCBiZWluZyBhIG11bHRpcGxlIG9mIFJBRidzIGludGVydmFsICgxNi43bXMpXHJcbiAgICAgICAgdGhpcy5kZWx0YVRpbWUgPSB0aGlzLm5vdyAtICh0aGlzLmVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVHYW1lKCB0aGlzLmRlbHRhVGltZSApO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUnVucyBvbmx5IHdoZW4gdGhlIGJyb3dzZXIgaXMgaW4gZm9jdXNcclxuICAgICAgLy8gUmVxdWVzdCBhbm90aGVyIGZyYW1lXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldFNjZW5hcmlvKCBzY2VuYXJpb19pZCwgY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApIHtcclxuICAgICAgc3dpdGNoKHNjZW5hcmlvX2lkKSB7XHJcbiAgICAgICAgY2FzZSBcInByb3RvdHlwZVwiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBzY2VuYXJpb1Byb3RvdHlwZShjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwic2FuZGJveFwiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBzY2VuYXJpb1NhbmRib3goY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gIFxyXG4gIC8vICMgTWVudVxyXG4gIFxyXG4gIC8vIEBwYXVzZWQgZGV0ZXJtaW5lIGlmIHRoZSBnYW1lIGNhbWUgZnJvbSBhIHBhdXNlIGFjdGlvbiBvciBhIG5ldyBnYW1lICh3aGVuIHBhZ2UgbG9hZHMpXHJcbiAgbWFpbk1lbnUocGF1c2VkKSB7IFxyXG4gICAgXHJcbiAgICBsZXQgZGl2TWVudSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpO1xyXG5cclxuICAgIC8vIFNldCBtYWluTWVudSBjbGFzc1xyXG4gICAgKCBwYXVzZWQgKSA/IGRpdk1lbnUuY2xhc3NMaXN0LmFkZCgncGF1c2VkJykgOiBkaXZNZW51LmNsYXNzTGlzdC5hZGQoJ25ldy1nYW1lJyk7XHJcbiAgICBcclxuICAgIC8vIFRvZ2dsZSBNZW51XHJcbiAgICBkaXZNZW51LmNsYXNzTGlzdC50b2dnbGUoJ3Nob3cnKTtcclxuICAgIFxyXG4gIH1cclxuICAgIC8vIEhhbmRsZSBNZW51IEFjdGlvblxyXG4gICAgbWVudUFjdGlvbihhY3Rpb24pIHtcclxuICAgICAgc3dpdGNoKGFjdGlvbikge1xyXG4gICAgICAgIGNhc2UgJ2NvbnRpbnVlJzpcclxuICAgICAgICAgIHRoaXMuY29udGludWVHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdzYXZlJzpcclxuICAgICAgICAgIHRoaXMuc2F2ZUdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2xvYWQnOlxyXG4gICAgICAgICAgdGhpcy5sb2FkR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbmV3JzpcclxuICAgICAgICAgIHRoaXMubXVsdGlwbGF5ZXIgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMubmV3R2FtZShmYWxzZSk7Ly8gZmFsc2UgPSB3b24ndCBsb2FkIHNhdmVEYXRhXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICduZXctMi1wbGF5ZXJzJzpcclxuICAgICAgICAgIHRoaXMubXVsdGlwbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5uZXdHYW1lKGZhbHNlKTsvLyBmYWxzZSA9IHdvbid0IGxvYWQgc2F2ZURhdGFcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuICBcclxuICAvLyAjIE5ldyBHYW1lXHJcbiAgbmV3R2FtZShzYXZlRGF0YSkge1xyXG4gICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgdGhpcy5sb2FkaW5nKHRydWUpO1xyXG4gICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICB0aGlzLnN0YXJ0TmV3R2FtZShzYXZlRGF0YSk7IFxyXG4gICAgfSwgMTAwMCApO1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIENvbnRpbnVlXHJcbiAgY29udGludWVHYW1lKCkge1xyXG4gICAgdGhpcy51bnBhdXNlKCk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgU2F2ZVxyXG4gIHNhdmVHYW1lKCkge1xyXG4gICAgaWYoIGNvbmZpcm0oJ1NhbHZhciBvIGpvZ28gYXR1YWwgaXLDoSBzb2JyZWVzY3JldmVyIHF1YWxxdWVyIGpvZ28gc2Fsdm8gYW50ZXJpb3JtZW50ZS4gRGVzZWphIGNvbnRpbnVhcj8nKSApIHtcclxuICAgICAgXHJcbiAgICAgIGxldCBzYXZlRGF0YSA9IG5ldyBPYmplY3QoKTtcclxuXHJcbiAgICAgIC8vIE11bHRpcGxheWVyXHJcbiAgICAgIHNhdmVEYXRhLm11bHRpcGxheWVyID0gdGhpcy5tdWx0aXBsYXllcjtcclxuXHJcbiAgICAgIC8vIFNjZW5hcmlvXHJcbiAgICAgIHNhdmVEYXRhLnNjZW5hcmlvID0ge1xyXG4gICAgICAgIHNjZW5hcmlvSWQ6IHRoaXMuc2NlbmFyaW8uZ2V0SWQoKSxcclxuICAgICAgICBzdGFnZUlkOiB0aGlzLnNjZW5hcmlvLmdldEFjdHVhbFN0YWdlSWQoKSxcclxuICAgICAgICBpdGVtczogdGhpcy5nZXRJdGVtc1N0YXRlKClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUGxheWVyc1xyXG4gICAgICBzYXZlRGF0YS5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgcGxheWVyTnVtYmVyOiBwbGF5ZXIuZ2V0UGxheWVyTnVtYmVyKCksXHJcbiAgICAgICAgICB4OiBwbGF5ZXIuZ2V0WCgpLFxyXG4gICAgICAgICAgeTogcGxheWVyLmdldFkoKSxcclxuICAgICAgICAgIGxpZmVzOiBwbGF5ZXIuZ2V0TGlmZXMoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENvbnZlcnQgdG8gSlNPTlxyXG4gICAgICBzYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHNhdmVEYXRhKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFNhdmUgb24gTG9jYWxTdG9yYWdlXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19zYXZlJywgc2F2ZURhdGEgKTtcclxuXHJcbiAgICAgIGFsZXJ0KCdKb2dvIHNhbHZvIScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFNhdmVcclxuICBsb2FkR2FtZSgpIHtcclxuICAgIFxyXG4gICAgLy8gIyBHZXQgZGF0YSBmcm9tIGxvY2Fsc3RvcmFnZSBhbmQgY29udmVydHMgdG8ganNvblxyXG4gICAgbGV0IHNhdmVEYXRhID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9fc2F2ZScpICk7XHJcblxyXG4gICAgaWYoIHNhdmVEYXRhICkge1xyXG4gICAgICAvLyBXaWxsIGJlICBtdWx0aXBsYXllciBnYW1lP1xyXG4gICAgICB0aGlzLm11bHRpcGxheWVyID0gKCBzYXZlRGF0YSApID8gc2F2ZURhdGEubXVsdGlwbGF5ZXIgOiBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFJlcGxhY2UgaXRlbXMgc3RhdGUgb24gbG9jYWwgc3RvcmFnZSB3aXRoIHNhdmVkIHN0YXRlc1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScsIEpTT04uc3RyaW5naWZ5KCBzYXZlRGF0YS5zY2VuYXJpby5pdGVtcyApICk7XHJcblxyXG4gICAgICAvLyBMb2FkIEl0ZW1zIGl0ZW5zXHJcbiAgICAgIGZvciggbGV0IGkgaW4gc2F2ZURhdGEuc2NlbmFyaW8uaXRlbXMgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRJdGVtU3RhdGUoIHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zW2ldICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyAjIExvYWRzIGEgbmV3IGdhbWUgd2l0aCBzYXZlIGRhdGFcclxuICAgICAgdGhpcy5uZXdHYW1lKHNhdmVEYXRhKTsgXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbGVydCgnTsOjbyBow6Egam9nbyBzYWx2byBwcmV2aWFtZW50ZS4nKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFBhdXNlXHJcbiAgaXNQYXVzZWQoKSB7IHJldHVybiB0aGlzLl9wYXVzZTsgfVxyXG4gIHBhdXNlKCkgeyBcclxuICAgIHRoaXMuX3BhdXNlID0gdHJ1ZTsgXHJcbiAgICB0aGlzLm1haW5NZW51KHRydWUpO1xyXG4gIH1cclxuICB1bnBhdXNlKCkgeyBcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIHRoaXMuX3BhdXNlID0gZmFsc2U7ICBcclxuICB9XHJcbiAgdG9nZ2xlUGF1c2UoKSB7ICggdGhpcy5pc1BhdXNlZCgpICkgPyB0aGlzLnVucGF1c2UoKSA6IHRoaXMucGF1c2UoKSB9XHJcbiAgXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIExvYWRpbmdcclxuICBsb2FkaW5nKGJvb2wpIHtcclxuICAgIGxldCBkaXNwbGF5ID0gKCBib29sICkgPyAnZmxleCcgOiAnbm9uZSc7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpLnN0eWxlLmRpc3BsYXkgPSBkaXNwbGF5O1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvKlxyXG4gICAgSXRlbXMgU3RhdGVcclxuICAgIC0gVGhpcyBhcmUgZnVuY3Rpb25zIHRoYXQgaGFuZGxlcyBpdGVtcyBzdGF0ZXMgYmV0d2VlbiBjaGFuZ2luZyBvZiBzdGFnZXMuIFRoaXMgd2lsbCBtYWtlIGFuIGl0ZW0gdG8gbm90IHJlc3Bhd24gaWYgaXQgd2FzIGNvbGxlY3RlZCBiZWZvcmVcclxuICAqL1xyXG4gIFxyXG4gICAgZ2V0SXRlbXNTdGF0ZSgpIHsgcmV0dXJuIHRoaXMuaXRlbXNTdGF0ZTsgfVxyXG4gICAgYWRkSXRlbVN0YXRlKCBpdGVtICkgeyBcclxuICAgICAgdGhpcy5pdGVtc1N0YXRlW2l0ZW0ubmFtZV9pZF0gPSBpdGVtOyAgXHJcbiAgICB9XHJcblxyXG4gICAgc2F2ZUl0ZW1zU3RhdGUoKSB7XHJcbiAgICAgIGxldCBpdGVtc1N0YXRlID0gSlNPTi5zdHJpbmdpZnkoIHRoaXMuZ2V0SXRlbXNTdGF0ZSgpICk7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19pdGVtc1N0YXRlJywgaXRlbXNTdGF0ZSApO1xyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gSGVscGVycyBmb3IgY2xhc3NlcyB0byBjaGVjayBpZiBhbiBvYmplY3QgaXMgY29sbGlkaW5nIFxyXG4gIGNoZWNrQ29sbGlzaW9uKCBvYmplY3QgKSB7XHJcbiAgICBpZiggdGhpcy5pc0dhbWVSZWFkeSgpIClcclxuICAgICAgcmV0dXJuIHRoaXMuY29sbGlzaW9uLmNoZWNrKG9iamVjdCk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgUnVuXHJcbiAgcnVuKCkge1xyXG5cclxuICAgIC8vIEhpZGUgRWxlbWVudHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lQ2FudmFzJykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICB0aGlzLmRlZmF1bHRFdmVudExpc3RlbmVycygpO1xyXG4gICAgXHJcbiAgICAvLyBTaG93cyBNZW51XHJcbiAgICB0aGlzLm1haW5NZW51KGZhbHNlKTtcclxuXHJcbiAgICAvLyBBdXRvIGxvYWQgYSBnYW1lIC0gZGVidWcgbW9kZVxyXG4gICAgaWYoIHdpbmRvdy5hdXRvbG9hZCApIHtcclxuICAgICAgdGhpcy5sb2FkR2FtZSgpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJjbGFzcyBSZW5kZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgcGxheWVyKSB7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDsgXHJcbiAgICB0aGlzLnNjZW5hcmlvID0gXCJcIjtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBcclxuICBnZXRBcnJheUl0ZW1zKCl7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgXHJcbiAgLy8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuICBhZGRJdGVtKG9iamVjdCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuICB9XHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcbiAgICBmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXsgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBzZXRTY2VuYXJpbyhzY2VuYXJpbyl7XHJcbiAgICB0aGlzLnNjZW5hcmlvID0gc2NlbmFyaW87XHJcbiAgfVxyXG4gICAgICAgICAgICBcclxuICAvLyBUaGlzIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZCBjb25zdGFudGx5IHRvIHJlbmRlciBpdGVtc1xyXG4gIHN0YXJ0KGRlbHRhVGltZSkge1x0XHRcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgLy8gQ2xlYXIgY2FudmFzIGJlZm9yZSByZW5kZXIgYWdhaW5cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIHRoaXMuY3R4LnNoYWRvd0JsdXIgPSAwO1xyXG5cclxuICAgIC8vIFNjZW5hcmlvXHJcbiAgICBpZiAoIHRoaXMuc2NlbmFyaW8gIT0gXCJcIikgXHJcbiAgICAgIHRoaXMuc2NlbmFyaW8ucmVuZGVyKHRoaXMuY3R4KTtcclxuICAgICAgXHJcbiAgICAvLyBSZW5kZXIgaXRlbXNcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5yZW5kZXJJdGVtcykge1xyXG4gICAgICAvLyBFeGVjdXRlIHRoZSByZW5kZXIgZnVuY3Rpb24gLSBJbmNsdWRlIHRoaXMgZnVuY3Rpb24gb24gZXZlcnkgY2xhc3NcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtc1tpXS5yZW5kZXIodGhpcy5jdHgsIGRlbHRhVGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbiAgICBcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXIiLCJjbGFzcyBTcHJpdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNwcml0ZSwgdywgaCwga1csIGtIKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBJbWFnZSBTcHJpdGVcclxuICAgICAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuXHJcbiAgICAgICAgLy8gU2l6ZSBvZiBpbWFnZSBzcHJpdGUgXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHc7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xyXG5cclxuICAgICAgICAvLyBTaXplIG9mIGVhY2ggZnJhbWUgc3F1YXJlIFxyXG4gICAgICAgIHRoaXMua2V5V2lkdGggPSBrVztcclxuICAgICAgICB0aGlzLmtleUhlaWdodCA9IGtIO1xyXG5cclxuICAgICAgICAvLyBSb3dzIGFuZCBDb2xsdW1ucyBxdWFudGl0eVxyXG4gICAgICAgIHRoaXMuY29scyA9IE1hdGguY2VpbCggdGhpcy53aWR0aCAvIHRoaXMua2V5V2lkdGggKTtcclxuICAgICAgICB0aGlzLnJvd3MgPSBNYXRoLmNlaWwoIHRoaXMuaGVpZ2h0IC8gdGhpcy5rZXlIZWlnaHQgKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIGZyYW1lc1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnJ1bigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgR2V0c1xyXG4gICAgZ2V0U3ByaXRlKCkgICAgeyByZXR1cm4gdGhpcy5zcHJpdGU7IH1cclxuICAgIGdldEZyYW1lKG51bSkgIHsgcmV0dXJuIHRoaXMuZnJhbWVzW251bV07IH1cclxuICAgIGdldEtleVdpZHRoKCkgIHsgcmV0dXJuIHRoaXMua2V5V2lkdGg7ICAgIH1cclxuICAgIGdldEtleUhlaWdodCgpIHsgcmV0dXJuIHRoaXMua2V5SGVpZ2h0OyAgIH1cclxuICAgIGdldFNwcml0ZVByb3BzKG51bSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNsaXBfeDogdGhpcy5nZXRGcmFtZShudW0pLngsIGNsaXBfeTogdGhpcy5nZXRGcmFtZShudW0pLnksIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuZ2V0S2V5V2lkdGgoKSwgc3ByaXRlX2hlaWdodDogdGhpcy5nZXRLZXlIZWlnaHQoKSBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBSdW5cclxuICAgIHJ1bigpIHtcclxuICAgICAgICAvLyBHZW4gZWFjaCBmcmFtZSBiYXNlZCBvbiBzaXplcyBcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIGZvciggbGV0IHI9MDsgcjx0aGlzLnJvd3M7cisrICkge1xyXG4gICAgICAgICAgICBmb3IoIGxldCBjPTA7IGM8dGhpcy5jb2xzO2MrKyApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzW2luZGV4XSA9IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5rZXlXaWR0aCAqIGMsXHJcbiAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5rZXlIZWlnaHQgKiByXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZTsiLCJjb25zdCBVSWl0ZW0gPSByZXF1aXJlKCcuL19VSWl0ZW0nKTtcclxuY29uc3QgVUlpdGVtX3RleHQgPSByZXF1aXJlKCcuL19VSWl0ZW1fdGV4dCcpO1xyXG5cclxuY2xhc3MgVUkge1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXJzLCBnYW1lUHJvcHMpIHtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJzID0gcGxheWVycztcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgICB0aGlzLmdhbWVQcm9wcyA9IGdhbWVQcm9wcztcclxuICAgIHRoaXMuY2h1bmtTaXplID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICAgICAgICAgICAgICBcclxuICAvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG4gIGFkZEl0ZW0ob2JqZWN0KXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG4gIH1cclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuICAgIGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpeyBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIGdldFJlbmRlckl0ZW1zKCl7XHJcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtcztcclxuICB9XHJcblxyXG4gIC8vIENsZWFyIGFycmF5IGFuZCByZXJ1biBjb2RlIHRvIGdldCBuZXcgaXRlbXNcclxuICBnZXROZXdSZW5kZXJJdGVtcygpIHtcclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVuZGVySXRlbXMoKTtcclxuICB9XHJcblxyXG4gIC8vIE1hdGhcclxuICBmcm9tUmlnaHQodmFsdWUpIHtcclxuICAgIHJldHVybiAoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAqIHRoaXMuY2h1bmtTaXplICkgLSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJ1bigpIHtcclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuXHJcbiAgICAgIC8vICMgUGxheWVyIDAxXHJcbiAgICAgICAgaWYoIHRoaXMucGxheWVyc1swXSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuY2h1bmtTaXplLFxyXG4gICAgICAgICAgICA1LCA1LCAvLyB4LCB5LFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgLy8gc3ByaXRlX3csIHNwcml0ZV9oLCBcclxuICAgICAgICAgICAgMCwgMCwgICAgICAvLyBjbGlwX3gsIGNsaXBfeVxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgLy8gdywgaFxyXG4gICAgICAgICAgKSApO1xyXG5cclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8xeCA9IDEyMDtcclxuICAgICAgICAgIGxldCBfMXkgPSAxMDtcclxuICAgICAgICAgIGxldCBfMWxpZmVzID0gdGhpcy5wbGF5ZXJzWzBdLmdldExpZmVzKCk7XHJcbiAgICAgICAgICBmb3IoIGxldCBpPTA7IGk8XzFsaWZlcztpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgICAgXzF4LCBfMXksXHJcbiAgICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICAgIDEwMCwgMCwgICAgICBcclxuICAgICAgICAgICAgICB0aGlzLmNodW5rU2l6ZS8zLCB0aGlzLmNodW5rU2l6ZS8zIFxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICAgIF8xeCArPSAzNTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09IDIgKSB7XHJcbiAgICAgICAgICAgICAgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgICAgIF8xeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIFxyXG5cclxuICAgICAgLy8gIyBQbGF5ZXIgMDJcclxuICAgICAgICBpZiggdGhpcy5wbGF5ZXJzWzFdICkge1xyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpLFxyXG4gICAgICAgICAgICB0aGlzLmZyb21SaWdodCggMjMwICksIDUsIFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgIDUwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgXHJcbiAgICAgICAgICApICk7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8yeCA9IHRoaXMuZnJvbVJpZ2h0KCA1MCApO1xyXG4gICAgICAgICAgbGV0IF8yeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8ybGlmZXMgPSB0aGlzLnBsYXllcnNbMV0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMmxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMngsIF8yeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzJ4IC09IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMnggPSB0aGlzLmZyb21SaWdodCggNTAgKTtcclxuICAgICAgICAgICAgICBfMnkgPSA2MDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAvLyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIFxyXG4gIH1cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBVSSIsImNsYXNzIFVJaXRlbSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGl0ZW1TcHJpdGVJRCwgY2h1bmtTaXplLCB4LCB5LCBzdywgc2gsIGN4LCBjeSwgdywgaCApIHtcclxuICBcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICB0aGlzLml0ZW1TcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtU3ByaXRlSUQpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0ge1xyXG4gICAgICBzcHJpdGVfd2lkdGg6IHN3LFxyXG4gICAgICBzcHJpdGVfaGVpZ2h0OiBzaCxcclxuICAgICAgY2xpcF94OiBjeCxcclxuICAgICAgY2xpcF95OiBjeSxcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IGNodW5rU2l6ZTtcclxuXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSB3OyAvL3B4XHJcbiAgICB0aGlzLmhlaWdodCA9IGg7IC8vcHhcclxuICB9XHJcblxyXG4gIC8vICMgU2V0cyAgICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICAvLyAjIEdldHMgICAgICAgICAgICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICBcclxuICAvLyAjIEl0ZW0gUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgIHRoaXMuaXRlbVNwcml0ZSwgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgKTtcclxuICAgIFxyXG4gIH1cclxuICAgICBcclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVUlpdGVtO1xyXG4iLCJjbGFzcyBVSWl0ZW1fdGV4dCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCB0ZXh0LCB4LCB5LCBmb250ICkge1xyXG4gICAgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy5mb250ID0gZm9udDtcclxuXHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2V0cyAgICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgICAgICBcclxuICAvLyAjIEdldHMgICAgICAgICAgICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgSXRlbSBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjtcclxuICBcclxuICAgIGN0eC5mb250ID0gIHRoaXMuZm9udC5zaXplICsgXCIgJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuZm9udC5jb2xvcjtcclxuICAgIGN0eC5maWxsVGV4dCggdGhpcy50ZXh0LCB0aGlzLngsIHRoaXMueSk7IFxyXG5cclxuICB9XHJcbiAgICAgICBcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBVSWl0ZW1fdGV4dDtcclxuICAiLCIvLyBHYW1lIFByb3BlcnRpZXMgY2xhc3MgdG8gZGVmaW5lIGNvbmZpZ3VyYXRpb25zXHJcbmNsYXNzIGdhbWVQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcclxuICAgIC8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gMTAwOyAvL3B4IC0gcmVzb2x1dGlvblxyXG4gICAgXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxNjtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxNDtcclxuICAgIFxyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyk7XHJcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MpOy8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuZnBzID0gMjQ7XHJcbiAgfVxyXG5cclxuICBnZXRQcm9wKHByb3ApIHtcclxuICAgIHJldHVybiB0aGlzW3Byb3BdO1xyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBnYW1lUHJvcGVydGllcztcclxuXHJcbi8vIEdsb2JhbCB2YWx1ZXNcclxuXHJcbiAgLy8gRGVidWdcclxuICB3aW5kb3cuZGVidWcgPSB0cnVlOyAvLyBTaG93IGRlYnVnIHNxdWFyZXNcclxuICB3aW5kb3cuZGVidWdDb2xsaXNpb24gPSBmYWxzZTsgLy8gU2hvdyB3aGVuIG9iamVjdHMgY29sbGlkZVxyXG4gIHdpbmRvdy5hdXRvbG9hZCA9IHRydWU7IC8vIGF1dG8gbG9hZCBhIHNhdmVkIGdhbWVcclxuICB3aW5kb3cuZ29kX21vZGUgPSB0cnVlOyAvLyBQbGF5ZXJzIHdvbid0IGRpZSIsImNvbnN0IEdhbWUgPSByZXF1aXJlKCcuL2VuZ2luZS9jb3JlL0dhbWUnKTtcclxuY29uc29sZS5jbGVhcigpO1xyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgXHJcbiAgLy8gIyBTdGFydCB0aGUgZ2FtZVxyXG4gICAgbGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUgPSBnYW1lO1xyXG4gICAgZ2FtZS5ydW4oKTtcclxuIFxyXG59XHJcblxyXG4vKipcclxuICogXHJcbiAqIFRPRE86XHJcbiAqIFxyXG4gKiAgLSBDbGVhciBTYXZlU3RhdGUgb24gTmV3IEdhbWVcclxuICovIl19
