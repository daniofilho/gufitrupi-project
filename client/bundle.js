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
  window.debug = false; // Show debug squares
  window.debugCollision = false; // Show when objects collide
  window.autoload = false; // auto load a saved game
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2NlbnRlci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfZG9vcnMuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2VuZW15LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3N0YWdlcy9zdGFnZV9saWZlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfRmxvb3IuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9XYWxsLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRG9vci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0VuZW15LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vRmlyZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0hlYWwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9LZXkuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfUHVzaC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL09iamVjdF9UaHJvdy5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL1RlbGVwb3J0LmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvR2xvYmFsQXNzZXRzLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhbkJlUHVzaGVkLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QuanMiLCJjbGllbnQvZW5naW5lL2Fzc2V0cy9fQ2FuSHVydC5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdy5qcyIsImNsaWVudC9lbmdpbmUvYXNzZXRzL19Db2xsaWRhYmxlLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX1NjZW5hcmlvLmpzIiwiY2xpZW50L2VuZ2luZS9hc3NldHMvX1N0YWdlLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL0NvbGxpc2lvbi5qcyIsImNsaWVudC9lbmdpbmUvY29yZS9HYW1lLmpzIiwiY2xpZW50L2VuZ2luZS9jb3JlL1JlbmRlci5qcyIsImNsaWVudC9lbmdpbmUvY29yZS9TcHJpdGUuanMiLCJjbGllbnQvZW5naW5lL3VpL1VJLmpzIiwiY2xpZW50L2VuZ2luZS91aS9fVUlpdGVtLmpzIiwiY2xpZW50L2VuZ2luZS91aS9fVUlpdGVtX3RleHQuanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiLCJjbGllbnQvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4aUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoeDAsIHkwLCBnYW1lUHJvcHMsIHBsYXllck51bWJlciwgcGxheWVyUHJvcHMpIHtcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICAgIGlmKCBwbGF5ZXJOdW1iZXIgPT0gMSApIHtcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX29uZScpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKCBwbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX3R3bycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnNwcml0ZSA9IG5ldyBTcHJpdGUoIHRoaXMucGxheWVyU3ByaXRlLCAzMDAsIDk2MCwgMjAsIDQwKTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7fTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcCA9IFtdO1xyXG4gICAgICB0aGlzLmRlZmF1bHRTdGVwID0gMTtcclxuICAgICAgdGhpcy5pbml0aWFsU3RlcCA9IDI7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDg7XHJcblxyXG4gICAgICAvLyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBBbmltYXRpb25cclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAxMjsgLy8gMTAwMCAvIEZQU1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgICB0aGlzLnggPSB4MDtcclxuICAgICAgdGhpcy55ID0geTA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLngwID0geDA7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgdGhpcy55MCA9IHkwO1xyXG4gICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2h1bmtTaXplOyAvL3B4XHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jaHVua1NpemUgKiAyOyAvL3B4XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwZWVkMCA9IDAuMTc7XHJcbiAgICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc3BlZWQwO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5uYW1lID0gXCJwbGF5ZXJfXCIgKyBwbGF5ZXJOdW1iZXI7XHJcbiAgICAgIHRoaXMucGxheWVyTnVtYmVyID0gcGxheWVyTnVtYmVyO1xyXG4gICAgICB0aGlzLnR5cGUgPSBcInBsYXllclwiO1xyXG5cclxuICAgICAgdGhpcy5ncmFiaW5nID0gZmFsc2U7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBFdmVudHMgIFxyXG4gICAgICBcclxuICAgICAgdGhpcy5pc0NvbGxpZGFibGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmlzTW92aW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSB0cnVlO1xyXG4gICAgXHJcbiAgICAgIC8vICMgQ29sbGlzaW9uXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uV2lkdGggPSB0aGlzLndpZHRoICogMC44O1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHRoaXMuaGVpZ2h0ICogMC4zO1xyXG4gICAgICB0aGlzLkNvbGxpc2lvblhGb3JtdWxhID0gdGhpcy53aWR0aCAqIDAuMTsgLy8gVXNlZCB0byBzZXQgY29sbGlzaW9uIFggd2hlbiBzZXR0aW5nIFggXHJcbiAgICAgIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgPSB0aGlzLmhlaWdodCAqIDAuNzsgXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWCA9IHgwICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYTtcclxuICAgICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyB0aGlzLkNvbGxpc2lvbllGb3JtdWxhO1xyXG5cclxuICAgICAgdGhpcy5jb2xsaXNpb25YMCA9IHRoaXMuY29sbGlzaW9uWDtcclxuICAgICAgdGhpcy5jb2xsaXNpb25ZMCA9IHRoaXMuY29sbGlzaW9uWTtcclxuXHJcbiAgICAgIC8vIEdyYWIvUGljayBJdGVtcyBDb2xsaXNpb24gQm94XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gMDtcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gMDtcclxuICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IDA7XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSAwO1xyXG5cclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gbnVsbDtcclxuXHJcbiAgICAgIC8vICMgTGlmZVxyXG4gICAgICB0aGlzLmRlZmF1bHRMaWZlcyA9IDY7XHJcbiAgICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5odXJ0Q29vbERvd25UaW1lID0gMjAwMDsgLy8yc1xyXG5cclxuICAgICAgLy8gUGxheWVyIFByb3BzIGlmIGhhc1xyXG4gICAgICBpZiggcGxheWVyUHJvcHMgKSB7XHJcbiAgICAgICAgdGhpcy5saWZlcyA9IHBsYXllclByb3BzLmxpZmVzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLyogXHJcbiAgICAgIEdyYWIvUGljayBJdGVtcyBDb2xsaXNpb24gQm94XHJcbiAgKi9cclxuXHJcbiAgICBjaGVja0dyYWJiaW5nT2JqZWN0cygpIHtcclxuICAgICAgbGV0IGhhc0dyYWJPYmplY3QgPSBmYWxzZTtcclxuICAgICAgLy8gQ2hlY2sgaWYgcGxheWVyIGhhcyBncmFiYmVkIGl0ZW1zXHJcbiAgICAgIGxldCByZW5kZXJlZEl0ZW1zID0gd2luZG93LmdhbWUuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCk7XHJcbiAgICAgIGZvciggbGV0IGkgaW4gcmVuZGVyZWRJdGVtcyApIHtcclxuICAgICAgICBsZXQgaXRlbSA9IHJlbmRlcmVkSXRlbXNbaV07XHJcbiAgICAgICAgaWYoIGl0ZW0uZ3JhYmJlZCAmJiBpdGVtLnBsYXllcldob0dyYWJiZWQgPT0gdGhpcy5wbGF5ZXJOdW1iZXIgKSB7XHJcbiAgICAgICAgICBsZXQgb2JqID0gaXRlbTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgb2JqLmdyYWJIYW5kbGVyKHRoaXMucGxheWVyTnVtYmVyKTtcclxuICAgICAgICAgIHRoaXMuZ3JhYk9iamVjdCggb2JqICk7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICBoYXNHcmFiT2JqZWN0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYoICEgaGFzR3JhYk9iamVjdCApIHtcclxuICAgICAgICB0aGlzLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY2hlY2tJdGVtT25HcmFiQ29sbGlzaW9uQm94KCkge1xyXG4gICAgICByZXR1cm4gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpc0dyYWJpbmcoKSB7IHJldHVybiB0aGlzLmdyYWJpbmc7IH1cclxuICAgIHNldE5vdEdyYWJiaW5nKCl7XHJcbiAgICAgIHRoaXMucmVtb3ZlR3JhYmVkT2JqZWN0KCk7XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVHcmFiZWRPYmplY3QoKSB7IFxyXG4gICAgICB0aGlzLmdyYWJpbmcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cmlnZ2VyR3JhYigpe1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgaWYgaGFzIGEgXCJfQ2FuR3JhYlwiIGl0ZW0gY29sbGlkaW5nIHdpdGggZ3JhYiBoaXQgYm94IGFuZCBcInBpY2tcIiBpdGVtXHJcbiAgICAgIGlmKCAhIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgICBpZiggb2JqZWN0ICYmIG9iamVjdC5jYW5HcmFiICkge1xyXG4gICAgICAgICAgaWYoIG9iamVjdC5pc0dyYWJiZWQoKSApIHJldHVybjsgLy8gYXZvaWQgcGxheWVycyBncmFiYmluZyB0aGUgc2FtZSBvYmplY3RcclxuICAgICAgICAgIG9iamVjdC5ncmFiSGFuZGxlcih0aGlzLnBsYXllck51bWJlcik7XHJcbiAgICAgICAgICB0aGlzLmdyYWJPYmplY3QoIG9iamVjdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdyYWJpbmcgPSAhdGhpcy5ncmFiaW5nO1xyXG4gICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0R3JhYmJlZCApIHtcclxuICAgICAgICAgIC8vIERyb3AgaWYgaGFzIG5vdGhpbmcgbyBwbGF5ZXIgZ3JhYiBjb2xsaXNpb24gYm94XHJcbiAgICAgICAgICBsZXQgb2JqZWN0ID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVja0FsbCh0aGlzLCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkpO1xyXG4gICAgICAgICAgaWYoICFvYmplY3QgKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC5kcm9wKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiwgdGhpcy5nZXRIZWlnaHQoKSApOyAvLyBUaHJvdyBhd2F5IG9iamVjdFxyXG4gICAgICAgICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBmYWxzZTsgLy8gcmVtb3ZlIGdyYWJiZWRcclxuICAgICAgICAgICAgdGhpcy5ncmFiaW5nID0gIXRoaXMuZ3JhYmluZztcclxuICAgICAgICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5ncmFiaW5nID0gIXRoaXMuZ3JhYmluZztcclxuICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBpdGVtc1xyXG4gICAgdHJpZ2dlclVzZSgpIHtcclxuICAgICAgLy8gSWYgaGFzIG9iamVjdCBpbiBoYW5kLCB1c2UgaXRcclxuICAgICAgaWYoIHRoaXMub2JqZWN0R3JhYmJlZCApIHtcclxuICAgICAgICB0aGlzLm9iamVjdEdyYWJiZWQudXNlKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiwgdGhpcy5nZXRIZWlnaHQoKSwgdGhpcyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIElmIG5vdCwgdHJ5IHRvIHVzZSB0aGUgb25lIG9uIGZyb250XHJcbiAgICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgICBpZiggb2JqZWN0ICYmIG9iamVjdC5jYW5Vc2UgKSB7XHJcbiAgICAgICAgICBvYmplY3QudXNlSGFuZGxlciggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgICBnZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uWTsgfVxyXG5cclxuICAgIC8vIEF0dGFjaCBhbiBpdGVtIHRvIHBsYXllclxyXG4gICAgZ3JhYk9iamVjdCggb2JqZWN0ICkge1xyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBvYmplY3Q7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYmJlZE9iamVjdFBvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IEdyYWJDb2xsaXNpb24gWCBhbmQgWSBjb25zaWRlcmluZyBwbGF5ZXIgbG9vayBkaXJlY3Rpb25cclxuICAgIHVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpIHtcclxuICAgICAgc3dpdGNoKHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSArIHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG4gICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgICd1cCc6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25IZWlnaHQgPSB0aGlzLmNvbGxpc2lvbkhlaWdodDtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSAtIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWCAtIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblggKyB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBoYXMgc29tZSBvYmplY3QgZ3JhYmJlZCwgdXBkYXRlIHBvc2l0aW9uXHJcbiAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVHcmFiYmVkT2JqZWN0UG9zaXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpIHtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpICk7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZC51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMub2JqZWN0R3JhYmJlZC5nZXRIZWlnaHQoKSArICAoIHRoaXMuZ2V0SGVpZ2h0KCkgKiAwLjEgKSAgKTtcclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcbiAgICAgICAgXHJcbiAgLypcclxuICAgIFNwcml0ZSAvIEFuaW1hdGlvblxyXG4gICovXHJcblxyXG4gICAgZ2V0U3ByaXRlUHJvcHMoKSB7IHJldHVybiB0aGlzLnNwcml0ZVByb3BzOyB9XHJcblxyXG4gICAgXHJcblx0XHRoaWRlUGxheWVyKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyB9XHJcbiAgICBzaG93UGxheWVyKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG4gICAgXHJcbiAgICBsb29rRG93bigpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgICAgXHJcbiAgICAgIC8vIFN0ZXBzXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2MyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2NyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDcgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1VwKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwNyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDExMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMTEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTEyICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE3ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDE5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDIyICk7XHJcbiAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1JpZ2h0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3NyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3OCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA3OSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA4MiApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzMyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAzNyApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcblx0XHRsb29rTGVmdCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgXHJcbiAgICAgIGlmKCB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5MyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA5NyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NiApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0NyApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0OCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA0OSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs3XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1MiApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIHBsYXllciBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICAgIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblx0XHRcdGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cdCAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gICAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgICBpZih0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgICAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRTdGVwKCkge1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICAgIGNhc2UgJ2xlZnQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyaWdodCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdkb3duJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0TG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKSB7IHRoaXMubG9va0RpcmVjdGlvbiA9IGxvb2tEaXJlY3Rpb247IH1cclxuXHRcdHRyaWdnZXJMb29rRGlyZWN0aW9uKGRpcmVjdGlvbikgeyBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgICB9XHJcblx0XHRyZXNldFBvc2l0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuY29sbGlzaW9uWTAgKTtcclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcbiAgICBcclxuICAvKlxyXG4gICAgTW92ZW1lbnRcclxuICAqL1xyXG4gICAgXHJcbiAgICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICBcclxuICAgIGdldFNwZWVkKCkgeyByZXR1cm4gdGhpcy5zcGVlZDsgfVxyXG5cclxuICAgIHNldFgoeCwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgICB0aGlzLnggPSB4OyBcclxuICAgICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWCggeCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgKTtcclxuICAgIH1cclxuICAgIHNldFkoeSwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgICB0aGlzLnkgPSB5OyBcclxuICAgICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWSggeSArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplICogc3BlZWQ7IH1cclxuICAgIFxyXG5cdFx0bW92TGVmdCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZSaWdodCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlVwKCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92RG93bigpIHsgIFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIFBsYXllciAxIENvbnRyb2xzXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIGlmICgzNyBpbiBrZXlzRG93bikgdGhpcy5tb3ZMZWZ0KCk7ICAvLyBMZWZ0XHJcbiAgICAgICAgaWYgKDM4IGluIGtleXNEb3duKSB0aGlzLm1vdlVwKCk7ICAgIC8vIFVwICBcclxuICAgICAgICBpZiAoMzkgaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHRcclxuICAgICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93blxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMiBDb250cm9sc1xyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoNjUgaW4ga2V5c0Rvd24pIHRoaXMubW92TGVmdCgpOyAgLy8gTGVmdCAgPT4gQVxyXG4gICAgICAgIGlmICg4NyBpbiBrZXlzRG93bikgdGhpcy5tb3ZVcCgpOyAgICAvLyBVcCAgICA9PiBXXHJcbiAgICAgICAgaWYgKDY4IGluIGtleXNEb3duKSB0aGlzLm1vdlJpZ2h0KCk7IC8vIFJpZ2h0ID0+IERcclxuICAgICAgICBpZiAoODMgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93biAgPT4gU1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUtleVVwKGtleVVwKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMVxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMSApIHtcclxuICAgICAgICBpZiAoa2V5VXAgPT0gMTcpIHRoaXMudHJpZ2dlckdyYWIoKTsgIC8vIEdyYWIgPT4gQ1RSTFxyXG4gICAgICAgIGlmIChrZXlVcCA9PSAzMikgdGhpcy50cmlnZ2VyVXNlKCk7ICAgLy8gVXNlID0+IFNwYWNlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBsYXllciAyXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIGlmIChrZXlVcCA9PSA3MCkgdGhpcy50cmlnZ2VyR3JhYigpOyAgLy8gR3JhYiA9PiBGXHJcbiAgICAgICAgaWYgKGtleVVwID09IDY5KSB0aGlzLnRyaWdnZXJVc2UoKTsgIC8vIFVzZSA9PiBFXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFx0XHJcbiAgLypcclxuICAgIENvbGxpc2lvblxyXG4gICovXHJcbiAgICBzZXRDb2xsaXNpb25YKHgpIHsgdGhpcy5jb2xsaXNpb25YID0geDsgfVxyXG4gICAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuXHJcbiAgICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuICAgIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICAgIGdldENlbnRlclgoIF94ICkgeyAvLyBNYXkgZ2V0IGEgY3VzdG9tIGNlbnRlclgsIHVzZWQgdG8gY2hlY2sgYSBmdXR1cmUgY29sbGlzaW9uXHJcbiAgICAgIGxldCB4ID0gKCBfeCApID8gX3ggOiB0aGlzLmdldENvbGxpc2lvblgoKTtcclxuICAgICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICAgIH1cclxuICAgIGdldENlbnRlclkoIF95ICkgeyBcclxuICAgICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgICByZXR1cm4geSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyBcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gICAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICAgIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG5cdFx0bm9Db2xsaXNpb24oKSB7XHJcblx0XHRcdC8vIFdoYXQgaGFwcGVucyBpZiB0aGUgcGxheWVyIGlzIG5vdCBjb2xsaWRpbmc/XHJcblx0XHRcdHRoaXMuc2V0U3BlZWQodGhpcy5zcGVlZDApOyAvLyBSZXNldCBzcGVlZFxyXG4gICAgfVxyXG4gICAgICBcclxuICAgIGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfTtcclxuXHRcdFxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cclxuXHQvKlxyXG4gICAgTGlmZSAvIEhlYWwgLyBEZWF0aFxyXG4gICovXHRcclxuICAgIGdldExpZmVzKCkgeyByZXR1cm4gdGhpcy5saWZlczsgfVxyXG5cclxuICAgIGh1cnRQbGF5ZXIoIGFtb3VudCApIHtcclxuICAgICAgaWYoIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgICAgaWYoIHRoaXMubGlmZXMgPCAwICkgdGhpcy5saWZlcyA9IDA7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IGNvb2xkb3duXHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBwbGF5ZXIgZGllZFxyXG4gICAgICAgIHRoaXMuY2hlY2tQbGF5ZXJEZWF0aCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGVhbFBsYXllciggYW1vdW50ICkge1xyXG4gICAgICB0aGlzLmxpZmVzICs9IHBhcnNlSW50KGFtb3VudCk7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzID4gdGhpcy5kZWZhdWx0TGlmZXMgKSB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tQbGF5ZXJEZWF0aCgpIHtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAxICYmICF3aW5kb3cuZ29kX21vZGUgKSB7XHJcbiAgICAgICB3aW5kb3cuZ2FtZS5uZXdHYW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBcclxuICAgIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFx0XHJcbiAgICAvKlxyXG4gICAgICBHZW5lcmFsXHJcbiAgICAqL1xyXG4gICAgICAgIFxyXG4gICAgICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgICAgIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgICBcclxuICAgICAgZ2V0UGxheWVyTnVtYmVyKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJOdW1iZXI7IH1cclxuXHJcbiAgICAgIGdldENvbG9yKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG4gICAgICAgIFxyXG4gICAgICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgIFxyXG4gIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAvL1xyXG5cdFxyXG4gIC8qICBcclxuICAgIFJlbmRlclxyXG4gICovXHJcbiAgXHRcdFxyXG5cdCAgcmVuZGVyKGN0eCkge1xyXG4gICAgICBcclxuICAgICAgLy8gQmxpbmsgcGxheWVyIGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgICAgaWYoICEgdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gIXRoaXMuaGlkZVNwcml0ZTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgICAvLyBXaGF0IHRvIGRvIGV2ZXJ5IGZyYW1lIGluIHRlcm1zIG9mIHJlbmRlcj8gRHJhdyB0aGUgcGxheWVyXHJcbiAgICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgICB9IFxyXG4gICAgICBcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1x0XHJcblxyXG4gICAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpICk7XHJcblxyXG4gICAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIE1hdGgucm91bmQodGhpcy5nZXRYKCkpICsgXCIgWTpcIiArIE1hdGgucm91bmQodGhpcy5nZXRZKCkpO1xyXG4gICAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiO1xyXG4gICAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSAyMCk7XHJcblxyXG4gICAgICAgIC8vIEdyYWIgY29sbGlzaW9uXHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwwLCAwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldEdyYWJDb2xsaXNpb25YKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblkoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuXHRcdH07XHJcblxyXG5cclxuICAgIHJ1bigpIHtcclxuICAgICAgdGhpcy5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB0aGlzLmxvb2tEaXJlY3Rpb24gPSB0aGlzLmxvb2tEb3duKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9XHJcblx0XHRcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcbiAgICBQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IF9TX2NlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2NlbnRlcicpO1xyXG5jb25zdCBfU191cCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX3VwJyk7XHJcbmNvbnN0IF9TX3JpZ2h0ID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfcmlnaHQnKTtcclxuY29uc3QgX1NfYm90dG9tID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfYm90dG9tJyk7XHJcbmNvbnN0IF9TX2xlZnQgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9sZWZ0Jyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1Byb3RvdHlwZSBleHRlbmRzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzYXZlRGF0YSl7XHJcbiAgICBzdXBlcihjdHgsIGNhbnZhcywgXCJwcm90b3R5cGVcIik7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGFnZUlkID0gXCJjZW50ZXJcIjtcclxuICAgIFxyXG4gICAgLy8gRGVmaW5lIHdoaWNoIHN0YWdlIHdpbGwgbG9hZCBvbiBmaXJzdCBydW5cclxuICAgIHRoaXMuc3RhZ2VUb0xvYWQgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5zY2VuYXJpby5zdGFnZUlkIDogdGhpcy5kZWZhdWx0U3RhZ2VJZDtcclxuICAgIFxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhZ2VzXHJcbiAgc2V0U3RhZ2Uoc3RhZ2VfaWQsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIFxyXG4gICAgbGV0IF9zdGFnZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkXHJcbiAgICBzd2l0Y2goc3RhZ2VfaWQpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICBsZXQgc19jZW50ZXIgPSBuZXcgX1NfY2VudGVyKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19jZW50ZXI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICBsZXQgc191cCA9IG5ldyBfU191cCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfdXA7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIGxldCBzX2xlZnQgPSBuZXcgX1NfbGVmdCgpO1xyXG4gICAgICAgIF9zdGFnZSA9IHNfbGVmdDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIGxldCBzX3JpZ2h0ID0gbmV3IF9TX3JpZ2h0KCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19yaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICBsZXQgc19ib3R0b20gPSBuZXcgX1NfYm90dG9tKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19ib3R0b207XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExvYWQgdGhlIHN0YWdlIGRlZmluZWRcclxuICAgICAgdGhpcy5sb2FkU3RhZ2UoX3N0YWdlLCBmaXJzdFN0YWdlKTtcclxuICB9XHJcbiBcclxuICAvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMuc2V0U3RhZ2UoIHRoaXMuc3RhZ2VUb0xvYWQsIHRydWUpOyAgICBcclxuXHR9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvUHJvdG90eXBlOyIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9Cb3R0b20gZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJib3R0b21cIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYyLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdjX2JsLCAgICAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdjX2JyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9Cb3R0b207XHJcbiIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiY2VudGVyXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjIsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgaXdjX2JyLCAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgaXdjX2JsLCAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0IF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgICAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgb2IsICAgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIGl3Y190ciwgICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y190bCwgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ3VwJyB9O1xyXG4gICAgbGV0IHRwXzAzID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgICAgIHRhcmdldFN0YWdlOiAncmlnaHQnIH07XHJcbiAgICBsZXQgdHBfMDQgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdib3R0b20nIH07XHJcbiAgICBsZXQgdHBfMDUgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgICAgdGFyZ2V0U3RhZ2U6ICdsZWZ0JyB9O1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogXCJmaXJlXCIsIHR5cGU6IFwiMDFcIn07IFxyXG5cclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGVmdCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImxlZnRcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3Y190bCwgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0ICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgb2IsICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMiwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX2JsLCB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0xlZnQ7XHJcbiIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9SaWdodCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcInJpZ2h0XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHdjX3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIHdyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdjX2JyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJsZWZ0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX1JpZ2h0O1xyXG4iLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfVXAgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJ1cFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpOztcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y190bCwgICAgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfVXBcclxuIiwiLypcclxuICBTYW5kYm94IFNjZW5hcmlvXHJcbiovXHJcbmNvbnN0IF9TY2VuYXJpbyA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1NjZW5hcmlvJyk7XHJcblxyXG5jb25zdCBTdGFnZV9DZW50ZXIgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9jZW50ZXInKTtcclxuY29uc3QgU3RhZ2VfTGlmZSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2xpZmUnKTtcclxuY29uc3QgU3RhZ2VfRW5lbXkgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9lbmVteScpO1xyXG5jb25zdCBTdGFnZV9Eb29ycyA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2Rvb3JzJyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1NhbmRib3ggZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgc2F2ZURhdGEpe1xyXG4gICAgc3VwZXIoY3R4LCBjYW52YXMsIFwic2FuZGJveFwiKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG5cclxuICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFN0YWdlc1xyXG4gIHNldFN0YWdlKHN0YWdlX2lkLCBmaXJzdFN0YWdlKSB7XHJcbiAgICBcclxuICAgIC8vIFNhdmUgaXRlbXMgc3RhdGUgYmVmb3JlIGNsZWFyXHJcbiAgICBpZiggIWZpcnN0U3RhZ2UgKSB7XHJcbiAgICAgIHRoaXMuc2F2ZUl0ZW1zU3RhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG5cclxuICAgIC8vIFNldCBBY3R1YWwgU3RhZ2UgSURcclxuICAgIHRoaXMuc2V0QWN0dWFsU3RhZ2VJZCggc3RhZ2VfaWQgKTtcclxuICAgIFxyXG4gICAgbGV0IF9zdGFnZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkXHJcbiAgICBzd2l0Y2goc3RhZ2VfaWQpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgU3RhZ2VfQ2VudGVyKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xpZmUnOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBTdGFnZV9MaWZlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2VuZW15JzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgU3RhZ2VfRW5lbXkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG9vcnMnOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBTdGFnZV9Eb29ycygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWQgdGhlIHN0YWdlIGRlZmluZWRcclxuICAgIHRoaXMubG9hZFN0YWdlKF9zdGFnZSwgZmlyc3RTdGFnZSk7XHJcbiAgfVxyXG4gXHJcbiAgLy8gU2V0IERlZmF1bHQgU3RhZ2VcclxuICBydW4oKSB7XHJcbiAgICB0aGlzLnNldFN0YWdlKCB0aGlzLnN0YWdlVG9Mb2FkLCB0cnVlICk7ICAgIFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9TYW5kYm94OyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiY2VudGVyXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICBpd2NfYnIsICAgIGYxLCAgICBpd2NfYmwsICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y19iciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y19ibCBdLFxyXG4gICAgICBbIGYxLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgaXdjX3RyLCAgIGYxLCAgICBmMSwgICAgb2IsICAgIG9iLCAgICBvYiwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX3RsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgb2IsICAgIGYyLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBvYiwgICAgb2IsICAgIG9iLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgaXdjX3RyLCAgICBvYiwgICBpd2NfdGwsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF9sZiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ2xpZmUnIH07XHJcbiAgICBsZXQgdHBfZW5lbXkgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgdGFyZ2V0U3RhZ2U6ICdlbmVteScgfTtcclxuICAgIGxldCB0cF9kb29ycyA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwibGVmdFwiLCAgIHRhcmdldFN0YWdlOiAnZG9vcnMnIH07XHJcbiAgICBcclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2xmLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfZG9vcnMsZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9lbmVteSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgICBcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCJjb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IERvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRG9vcicpO1xyXG5jb25zdCBLZXkgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vS2V5Jyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgT2JqZWN0X1B1c2ggPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1B1c2gnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9Eb29ycyBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImRvb3JzXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSAwO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IERvb3IoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJrZXlcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEtleShpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpICk7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3Rocm93XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfVGhyb3coaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfcHVzaFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1B1c2goaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgICAgd3QsICAgIHd0LCAgICAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX2JsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfdGwgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgICAgIHdiLCAgICB3YiwgICAgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6ICdmaXJlJywgdHlwZTogJzAxJ307IFxyXG5cclxuICAgIGxldCBlbmVteSA9IHsgbmFtZTogJ2VuZW15JywgdHlwZTogJzAxJ307IFxyXG4gICAgbGV0IGJubmEgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JhbmFuYSd9OyBcclxuICAgIGxldCBiZXJyeSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmVycnknfTsgXHJcblxyXG4gICAgbGV0IGJycmwgPSB7IG5hbWU6ICdvYmplY3RfdGhyb3cnLCB0eXBlOiAnYmFycmVsJ307IFxyXG4gICAgbGV0IHN0bmUgPSB7IG5hbWU6ICdvYmplY3RfcHVzaCcsIHR5cGU6ICdzdG9uZSd9OyBcclxuXHJcbiAgICBsZXQgZm5jZSA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiZmVuY2VcIn07XHJcblxyXG4gICAgbGV0IHRwX2MgPSB7IG5hbWU6ICd0ZWxlcG9ydCcsIHR5cGU6ICcnLCB0ZWxlcG9ydFR5cGU6ICdyZWxhdGl2ZScsIGNhbWVGcm9tOiAncmlnaHQnLCB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuXHJcbiAgICBsZXQgZGdibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X2JsJ307IFxyXG4gICAgbGV0IGRndGwgPSB7IG5hbWU6ICdkb29yJywgdHlwZTogJ2Rvb3JfZ3JheV90bCd9OyBcclxuICAgIGxldCBkZ2JyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyYXlfYnInfTsgXHJcbiAgICBsZXQgZGd0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9ncmF5X3RyJ307IFxyXG4gICAgXHJcbiAgICBsZXQgZHBibCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfYmwnfTsgXHJcbiAgICBsZXQgZHB0bCA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfdGwnfTsgXHJcbiAgICBsZXQgZHBiciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfYnInfTsgXHJcbiAgICBsZXQgZHB0ciA9IHsgbmFtZTogJ2Rvb3InLCB0eXBlOiAnZG9vcl9wdXJwbGVfdHInfTsgXHJcbiAgICBcclxuICAgIGxldCBkcmJsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF9ibCd9OyBcclxuICAgIGxldCBkcnRsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF90bCd9OyBcclxuICAgIGxldCBkcmJyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF9icid9OyBcclxuICAgIGxldCBkcnRyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX3JlZF90cid9OyBcclxuICAgIFxyXG4gICAgbGV0IGRncmJsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX2JsJ307IFxyXG4gICAgbGV0IGRncnRsID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX3RsJ307IFxyXG4gICAgbGV0IGRncmJyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX2JyJ307IFxyXG4gICAgbGV0IGRncnRyID0geyBuYW1lOiAnZG9vcicsIHR5cGU6ICdkb29yX2dyZWVuX3RyJ307IFxyXG5cclxuICAgIGxldCBrX2cgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAnZ3JheSd9OyBcclxuICAgIGxldCBrX3AgPSB7IG5hbWU6ICdrZXknLCB0eXBlOiAncHVycGxlJ307IFxyXG4gICAgbGV0IGtfciA9IHsgbmFtZTogJ2tleScsIHR5cGU6ICdyZWQnfTsgXHJcbiAgICBsZXQga19nciA9IHsgbmFtZTogJ2tleScsIHR5cGU6ICdncmVlbid9OyBcclxuXHJcblxyXG5cclxuICAgIGxldCBpdGVtc0JvdHRvbSA9IFtcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgIGZuY2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgIGZuY2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZm5jZSwgICAgZmFsc2UsICAgZmFsc2UsICAgIGZuY2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZGd0bCwgICAgZGd0ciwgICAgZm5jZSwgICAgZHB0bCwgICAgZHB0ciwgICAgZm5jZSwgICAgZHJ0bCwgICAgZHJ0ciwgICAgZm5jZSwgICAgZGdydGwsICAgZGdydHIsICAgIGZuY2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZuY2UsICAgZGdibCwgICAgZGdiciwgICAgZm5jZSwgICAgZHBibCwgICAgZHBiciwgICAgZm5jZSwgICAgZHJibCwgICAgZHJiciwgICAgZm5jZSwgICAgZGdyYmwsICAgZGdyYnIsICAgIGZuY2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfYyBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBrX2csICAgICBmYWxzZSwgICBmYWxzZSwgICBrX3AsICAgICBmYWxzZSwgICBmYWxzZSwgICBrX3IsICAgICBmYWxzZSwgICBmYWxzZSwgICBrX2dyLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJycmwsICAgZmFsc2UgXSxcclxuICAgICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF07XHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgaXRlbXNCb3R0b20ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9Eb29yczsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEhlYWwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vSGVhbCcpO1xyXG5jb25zdCBFbmVteSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9FbmVteScpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuY29uc3QgT2JqZWN0X1Rocm93ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL09iamVjdF9UaHJvdycpO1xyXG5jb25zdCBPYmplY3RfUHVzaCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfUHVzaCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0VuZW15IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiZW5lbXlcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJlbmVteVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRW5lbXkoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhlYWxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEhlYWwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfdGhyb3dcIjpcclxuICAgICAgICByZXR1cm4gbmV3IE9iamVjdF9UaHJvdyhpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIm9iamVjdF9wdXNoXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfUHVzaChpdGVtLnR5cGUsIHgsIHksIHRoaXMuZ2V0U3RhZ2VJZCgpKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICAgICB3dCwgICAgd3QsICAgICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfYnIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGYxLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgaXdjX3RyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgICAgIHdiLCAgICB3YiwgICAgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6ICdmaXJlJywgdHlwZTogJzAxJ307IFxyXG5cclxuICAgIGxldCBlbmVteSA9IHsgbmFtZTogJ2VuZW15JywgdHlwZTogJzAxJ307IFxyXG4gICAgbGV0IGJubmEgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JhbmFuYSd9OyBcclxuICAgIGxldCBiZXJyeSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmVycnknfTsgXHJcblxyXG4gICAgbGV0IGJycmwgPSB7IG5hbWU6ICdvYmplY3RfdGhyb3cnLCB0eXBlOiAnYmFycmVsJ307IFxyXG4gICAgbGV0IHN0bmUgPSB7IG5hbWU6ICdvYmplY3RfcHVzaCcsIHR5cGU6ICdzdG9uZSd9OyBcclxuXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdsZWZ0JywgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGVuZW15LCAgIGVuZW15LCAgIGVuZW15LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGVuZW15LCAgIGVuZW15LCAgIGVuZW15LCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBlbmVteSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgZmFsc2UsICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF9jLCAgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBicnJsLCAgIGZhbHNlLCAgIHN0bmUsICAgIGZhbHNlLCAgIGJycmwsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGJycmwsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfRW5lbXk7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuY29uc3QgSGVhbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9IZWFsJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGlmZSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImxpZmVcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgZjEsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG4gICAgbGV0IGJlcnJ5ID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiZXJyeSd9OyBcclxuXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdib3R0b20nLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmaXJlLCAgIGJubmEsICAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBiZXJyeSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmaXJlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBiZXJyeSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICBmaXJlLCAgIGZpcmUsICAgZmlyZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgYmVycnksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfTGlmZTsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF9GbG9vciBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJCZWFjaCBGbG9vclwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCIwMVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNDkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcIjAyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDkzMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIGNvbGxpc2lvbihwbGF5ZXIpeyBcclxuICAgIHBsYXllci5zZXRUZWxlcG9ydGluZyhmYWxzZSk7XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF9GbG9vcjsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF93YWxsIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIkJlYWNoIFdhbGxcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg3Myk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJsZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJyaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDExKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg3OCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDc5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMDApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwid2F0ZXJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNjMzKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcIm9ic3RhY2xlXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI1MCk7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmVuY2VcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxMik7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNCk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjUpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjEwKTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX21pZGRsZV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg4Nyk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNDgpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvbiBTaXplXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25XaWR0aCggdGhpcy5jaHVua1NpemUgKiAwLjMgKTtcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvblgodGhpcy54ICsgdGhpcy5jaHVua1NpemUgKiAwLjcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTQ5KTtcclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfd2FsbDsiLCJjb25zdCBfQ2FuQ29sbGVjdCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBEb29yIGV4dGVuZHMgX0NhbkNvbGxlY3Qge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJkb29yXCIsXHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIHN0YWdlOiBzdGFnZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY2FuQ29sbGVjdFByb3BzID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkNvbGxlY3RQcm9wcyk7XHJcblxyXG4gICAgdGhpcy50eXBlID0gJ2Rvb3InO1xyXG5cclxuICAgIHRoaXMuaGFuZGxlUHJvcHMoKTtcclxuICB9XHJcblxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgIGxldCBpdGVtU2F2ZWRTdGF0ZSA9IHNhdmVkSXRlbXNTdGF0ZVt0aGlzLmdldE5hbWUoKV07XHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiBpdGVtU2F2ZWRTdGF0ZS5jb2xsZWN0ZWQgPT09IHRydWUgKXsgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGlzIGFscmVhZHkgZ3JhYmJlZFxyXG4gICAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIC8vIEdyYXlcclxuICAgICAgY2FzZSBcImRvb3JfZ3JheV9ibFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JheScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzEzKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JheV90bFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JheScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjUxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JheV9iclwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JheScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE0KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JheV90clwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JheScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjUyKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgLy8gUHVycGxlXHJcbiAgICAgIGNhc2UgXCJkb29yX3B1cnBsZV9ibFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9wdXJwbGVfdGxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3B1cnBsZScpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMjUzKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcHVycGxlX2JyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcHVycGxlX3RyXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdwdXJwbGUnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1NCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIC8vIFJlZFxyXG4gICAgICBjYXNlIFwiZG9vcl9yZWRfYmxcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzE3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfcmVkX3RsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdyZWQnKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1NSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX3JlZF9iclwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzMTgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9yZWRfdHJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ3JlZCcpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTYpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAvLyBHcmVlblxyXG4gICAgICBjYXNlIFwiZG9vcl9ncmVlbl9ibFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTMxOSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJkb29yX2dyZWVuX3RsXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpOyAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEyNTcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZG9vcl9ncmVlbl9iclwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgnZ3JlZW4nKTsgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzIwKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRvb3JfZ3JlZW5fdHJcIjpcclxuICAgICAgICB0aGlzLnNldENvZGUoJ2dyZWVuJyk7ICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTI1OCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vIEhhbmRsZSBwcm9wcyB3aGVuIGxvYWRcclxuICBoYW5kbGVQcm9wcygpIHtcclxuICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgc2F2ZWQgYmVmb3JlIGFuZCBjaGFuZ2UgaXQgcHJvcHNcclxuICAgIHRoaXMuY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gT3BlbiBkb29yID0gaGlkZSBhbGwgZG9vcnMgd2l0aCBzYW1lIGNvZGUgXHJcbiAgb3BlbigpIHtcclxuICAgIGxldCBvYmpzID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmdldENvbEl0ZW5zKCk7XHJcbiAgICBmb3IgKGxldCBpIGluIG9ianMpIHtcclxuICAgICAgaWYoIG9ianNbaV0udHlwZSA9PSAnZG9vcicgKSB7XHJcbiAgICAgICAgaWYoIG9ianNbaV0uZ2V0Q29kZSgpID09IHRoaXMuZ2V0Q29kZSgpICkge1xyXG4gICAgICAgICAgb2Jqc1tpXS5jb2xsZWN0KCk7XHJcbiAgICAgICAgICBvYmpzW2ldLmhpZGUoKTtcclxuICAgICAgICAgIG9ianNbaV0uc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IERvb3I7IiwiY29uc3QgX0Nhbkh1cnQgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5IdXJ0Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgRW5lbXkgZXh0ZW5kcyBfQ2FuSHVydCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiZW5lbXlcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMlxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkh1cnRQcm9wcyA9IHtcclxuICAgICAgYW1vdW50OiAxXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHt9LCBldmVudHMsIGNhbkh1cnRQcm9wcyk7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25NYXhDb3VudCA9IDE7XHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgIFxyXG4gICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuICAgIHRoaXMuY29sbGlzaW9uWSA9IHkwICsgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcblxyXG4gICAgdGhpcy5jb2xsaXNpb25Db3VudCA9IDA7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvICggd2luZG93LmdhbWUuZ2FtZVByb3BzLmZwcyAvIDIgKTsgLy8gMTAwMCAvIEZQU1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlID0gbmV3IFNwcml0ZSggZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9lbmVteScpLCAzMDAsIDk2MCwgMjAsIDQwKTtcclxuXHJcbiAgICB0aGlzLnN0ZXAgPSBuZXcgT2JqZWN0KCk7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGVwID0gMTtcclxuICAgIHRoaXMuaW5pdGlhbFN0ZXAgPSAyO1xyXG4gICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgdGhpcy5tYXhTdGVwcyA9IDQ7XHJcblxyXG4gICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPSAwO1xyXG4gICAgdGhpcy5yYW5kRGlyZWN0aW9uID0gMTtcclxuXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4MDtcclxuICAgIHRoaXMueSA9IHkwO1xyXG4gICAgXHJcbiAgICB0aGlzLngwID0geDA7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICAgIHRoaXMueTAgPSB5MDtcclxuICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy5zcGVlZDAgPSAwLjI7XHJcbiAgICB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnNwZWVkMDtcclxuICAgIHRoaXMudHlwZSA9IFwiZW5lbXlcIjtcclxuICAgIFxyXG4gICAgLy8gIyBMaWZlXHJcbiAgICB0aGlzLmRlZmF1bHRMaWZlcyA9IDI7XHJcbiAgICB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICB0aGlzLmRlYWQgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RvcFJlbmRlcmluZ01lID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgIHRoaXMuaHVydENvb2xEb3duVGltZSA9IDEwMDA7IC8vMnNcclxuXHJcbiAgICB0aGlzLnBsYXllckF3YXJlQ2h1bmtzRGlzdGFuY2UwID0gNTtcclxuICAgIHRoaXMucGxheWVyQXdhcmVDaHVua3NEaXN0YW5jZSA9IHRoaXMucGxheWVyQXdhcmVDaHVua3NEaXN0YW5jZTA7XHJcbiAgICB0aGlzLnBsYXllckF3YXJlRGlzdGFuY2UgPSB0aGlzLmNodW5rU2l6ZSAqIHRoaXMucGxheWVyQXdhcmVDaHVua3NEaXN0YW5jZTtcclxuXHJcbiAgICB0aGlzLmF3YXJlT2ZQbGF5ZXIgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgPSAwO1xyXG4gICAgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlID0gMDtcclxuXHJcbiAgICB0aGlzLnJ1bkVuZW15KCk7XHJcbiAgfVxyXG5cclxuICBpc0RlYWQoKSB7IHJldHVybiB0aGlzLmRlYWQ7IH1cclxuICBzZXREZWFkKGJvb2wpIHsgdGhpcy5kZWFkID0gYm9vbDsgfVxyXG5cclxuICBuZWVkU3RvcFJlbmRlcmluZ01lKCkgeyByZXR1cm4gdGhpcy5zdG9wUmVuZGVyaW5nTWU7IH1cclxuICBzZXRTdG9wUmVuZGVyaW5nTWUoYm9vbCkgeyB0aGlzLnN0b3BSZW5kZXJpbmdNZSA9IGJvb2w7IH1cclxuXHJcbiAgaXNBd2FyZU9mUGxheWVyKCkgeyByZXR1cm4gdGhpcy5hd2FyZU9mUGxheWVyOyB9XHJcbiAgc2V0QXdhcmVPZlBsYXllcihib29sKSB7IHRoaXMuYXdhcmVPZlBsYXllciA9IGJvb2w7IH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgICAgICAvLyBDb2xsaXNpb25cclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbkhlaWdodCh0aGlzLmNvbGxpc2lvbkhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKHRoaXMuY29sbGlzaW9uWSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHNldFNwcml0ZVByb3BzRnJhbWUoc3ByaXRlQW5pbWF0aW9uQ291bnQpe1xyXG4gICAgc3dpdGNoKHNwcml0ZUFuaW1hdGlvbkNvdW50KSB7IFxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlLmdldEtleVdpZHRoKCksIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlLmdldEtleUhlaWdodCgpIFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyBzdGF0ZSBmb3IgZW5lbXkgZGlyZWN0aW9uXHJcbiAgbG9va0Rvd24oKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2Rvd24nO1xyXG4gICAgXHJcbiAgICAvLyBTdGVwc1xyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gIH1cclxuICBcclxuICBsb29rVXAoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTUpO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTYpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTcpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMTgpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuICBcclxuICBsb29rUmlnaHQoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzApO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuICAgICAgXHJcbiAgbG9va0xlZnQoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzQpO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzUpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzYpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMzcpO1xyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuXHJcbiAgZHlpbmcoKXtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2R5aW5nJztcclxuICAgICAgICBcclxuICAgIHRoaXMuc3RlcFsxXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQwKTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQxKTtcclxuICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQyKTtcclxuICAgIHRoaXMuc3RlcFs0XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQzKTtcclxuICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDQ0KTtcclxuICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDI5KTsgLy8gZW1wdHkgZnJhbWVcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICB9XHJcblxyXG4gIC8vICMgTW92ZW1lbnRcclxuICBtb3ZMZWZ0KGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgICBcclxuICBtb3ZSaWdodChpZ25vcmVDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdlVwKGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdkRvd24oaWdub3JlQ29sbGlzaW9uKSB7ICBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gIG1vdlRvRGVhdGgoaWdub3JlQ29sbGlzaW9uKSB7XHJcbiAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmR5aW5nKCkgKTtcclxuICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgLy8gIyBTZXRzXHJcbiAgICAgIFxyXG4gIHNldFgoeCwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy54ID0geDsgXHJcbiAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25YKCB4ICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSApO1xyXG4gIH1cclxuICBzZXRZKHksIHNldENvbGxpc2lvbikgeyBcclxuICAgIHRoaXMueSA9IHk7IFxyXG4gICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWSggeSArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgKTtcclxuICB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgIFxyXG4gIHNldFNwZWVkKHNwZWVkKSB7IHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHNwZWVkOyB9XHJcblxyXG4gIHNldExvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbikgeyB0aGlzLmxvb2tEaXJlY3Rpb24gPSBsb29rRGlyZWN0aW9uOyB9XHJcbiAgdHJpZ2dlckxvb2tEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICB0aGlzLnJlc2V0U3RlcCgpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRQb3NpdGlvbigpIHtcclxuICAgIHRoaXMuc2V0WCggdGhpcy54MCApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuY29sbGlzaW9uWDAgKTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5jb2xsaXNpb25ZMCApO1xyXG4gIH1cclxuXHJcbiAgaHVydCggYW1vdW50ICkge1xyXG4gICAgaWYoIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICBcclxuICAgICAgLy8gSHVydCBwbGF5ZXJcclxuICAgICAgdGhpcy5saWZlcyAtPSBhbW91bnQ7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMCApIHRoaXMubGlmZXMgPSAwO1xyXG5cclxuICAgICAgLy8gU3RhcnQgY29vbGRvd25cclxuICAgICAgdGhpcy5jYW5CZUh1cnQgPSBmYWxzZTtcclxuICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgfSwgdGhpcy5odXJ0Q29vbERvd25UaW1lKTtcclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIHBsYXllciBkaWVkXHJcbiAgICAgIHRoaXMuY2hlY2tNeURlYXRoKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjaGVja015RGVhdGgoKSB7XHJcbiAgICBpZiggdGhpcy5saWZlcyA8IDEgKSB7XHJcbiAgICAgIHRoaXMuc2V0RGVhZCh0cnVlKTtcclxuXHJcbiAgICAgIGlmKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiAhPSBcImR5aW5nXCIpIHRoaXMuc3RlcENvdW50ID0gMTsgLy8gSWYgaXQncyBub3QgZHlpbmcsIHJlc2V0IGFuaW1hdGlvbiBzdGVwXHJcbiAgICAgIHRoaXMuc2V0U3BlZWQoMS4zKTsgLy8gSW5jcmVhc2Ugc3BlZWRcclxuICAgICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IGZhbHNlOyAvLyBQcmV2ZW50IGVuZW15IGh1cnRpbmcgcGxheWVyIHdoZW4gaW4gZGVhdGggYW5pbWF0aW9uXHJcbiAgICAgIHRoaXMubWF4U3RlcHMgPSA2O1xyXG4gICAgICB0aGlzLnNldEF3YXJlT2ZQbGF5ZXIoZmFsc2UpO1xyXG4gICAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDg7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuLy8gIyBHZXRzXHJcbiAgXHJcbiAgZ2V0TGlmZXMoKSB7IHJldHVybiB0aGlzLmxpZmVzOyB9XHJcbiAgXHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgICBcclxuICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25XaWR0aDsgfVxyXG4gIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgZ2V0Q2VudGVyWCggX3ggKSB7IC8vIE1heSBnZXQgYSBjdXN0b20gY2VudGVyWCwgdXNlZCB0byBjaGVjayBhIGZ1dHVyZSBjb2xsaXNpb25cclxuICAgIGxldCB4ID0gKCBfeCApID8gX3ggOiB0aGlzLmdldENvbGxpc2lvblgoKTtcclxuICAgIHJldHVybiB4ICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMjsgXHJcbiAgfVxyXG4gIGdldENlbnRlclkoIF95ICkgeyBcclxuICAgIGxldCB5ID0gKCBfeSApID8gX3kgOiB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuICAgIHJldHVybiB5ICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDI7IFxyXG4gIH1cclxuICAgIFxyXG4gIGdldENvbG9yKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG4gIGdldFNwZWVkKCkgeyByZXR1cm4gdGhpcy5zcGVlZDsgfVxyXG4gICAgXHJcbiAgZ2V0U3ByaXRlUHJvcHMoKSB7IHJldHVybiB0aGlzLnNwcml0ZVByb3BzOyB9XHJcbiAgICBcclxuICBpbmNyZWFzZVN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCsrO1xyXG4gICAgaWYoIHRoaXMuc3RlcENvdW50ID4gdGhpcy5tYXhTdGVwcyApIHtcclxuICAgICAgLy9Eb24ndCByZXNldCBpZiBpdCdzIGluIGRlYXRoIGFuaW1hdGlvblxyXG4gICAgICBpZiggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPT0gXCJkeWluZ1wiICkge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5tYXhTdGVwcztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuaW5pdGlhbFN0ZXA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgcmVzZXRTdGVwKCkge1xyXG4gICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgc3dpdGNoICggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd1cCc6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgaGlkZU1lKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyB9XHJcbiAgc2hvdygpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuICBcclxuICAvLyAjIEVuZW15IFJlbmRlciAgICBcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLm5lZWRTdG9wUmVuZGVyaW5nTWUoKSApIHJldHVybjtcclxuXHJcbiAgICAvLyBCbGluayBFbmVteSBpZiBpdCBjYW4ndCBiZSBodXJ0XHJcbiAgICBpZiggISB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgdGhpcy5oaWRlU3ByaXRlID0gIXRoaXMuaGlkZVNwcml0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgJiYgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gIT0gXCJkeWluZ1wiICApIHJldHVybjtcclxuXHJcbiAgICAvLyBXaGF0IHRvIGRvIGV2ZXJ5IGZyYW1lIGluIHRlcm1zIG9mIHJlbmRlcj8gRHJhdyB0aGUgcGxheWVyXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICB0aGlzLnNwcml0ZS5nZXRTcHJpdGUoKSwgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgdGhpcy5zcHJpdGUuZ2V0S2V5V2lkdGgoKSwgdGhpcy5zcHJpdGUuZ2V0S2V5SGVpZ2h0KCksIFxyXG4gICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICApO1x0XHJcblxyXG4gICAgLy8gUGxheWVyIEF3YXJlbmVzcyBcclxuICAgIGlmKCB0aGlzLmlzQXdhcmVPZlBsYXllcigpICkge1xyXG4gICAgICBjdHguZm9udCA9ICBcIjUwcHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCIjQ0MwMDAwXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggXCIhXCIsIHRoaXMuZ2V0WCgpICsgKCB0aGlzLmNodW5rU2l6ZSAqIDAuMDMgKSwgdGhpcy5nZXRZKCkgKyAoIHRoaXMuY2h1bmtTaXplICogMC4zICkgKTsgXHJcbiAgICB9XHJcblxyXG4gICAgLy8gREVCVUcgQ09MTElTSU9OXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMjU1LCAwLjQpXCI7XHJcbiAgICAgIGN0eC5maWxsUmVjdCggdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuXHJcbiAgICAgIGxldCB0ZXh0ID0gXCJYOiBcIiArIE1hdGgucm91bmQodGhpcy5nZXRYKCkpICsgXCIgWTpcIiArIE1hdGgucm91bmQodGhpcy5nZXRZKCkpO1xyXG4gICAgICBjdHguZm9udCA9ICBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSA2MCk7IFxyXG5cclxuICAgICAgdGV4dCA9IFwiZFg6IFwiICsgTWF0aC5yb3VuZCggdGhpcy54RnJvbVBsYXllckRpc3RhbmNlICkgKyBcIiBkWTpcIiArIE1hdGgucm91bmQoIHRoaXMuWUZyb21QbGF5ZXJEaXN0YW5jZSApO1xyXG4gICAgICBjdHguZm9udCA9ICBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dCggdGV4dCwgdGhpcy5nZXRYKCkgLSAyMCwgdGhpcy5nZXRZKCkgLSAyMCk7IFxyXG4gICAgICBcclxuICAgIH1cclxuICAgIFxyXG4gIH07XHJcblxyXG4vLyAjIEVuZW15IEJyYWluXHJcbiAgZW5lbXlCcmFpbigpIHtcclxuXHJcbiAgICBpZiggd2luZG93LmdhbWUuaXNHYW1lUmVhZHkoKSAmJiB0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpICkge1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgRGVhZCBiZWhhdmlvci9hbmltYXRpb25cclxuICAgICAgaWYoIHRoaXMuaXNEZWFkKCkgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9XaGlsZSBub3Qgb3V0IG9mIHNjcmVlblxyXG4gICAgICAgIGlmKCB0aGlzLmdldFgoKSA8IHdpbmRvdy5nYW1lLmdhbWVQcm9wcy5jYW52YXNXaWR0aCApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gU3RhcnQgbW92aW5nIG91dCBvZiBzY3JlZW5cclxuICAgICAgICAgIHRoaXMubW92VG9EZWF0aCh0cnVlKTsgLy8gdHJ1ZSA9IGlnbm9yZSBjb2xsaXNpb24gY2hlY2tcclxuICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBPaywgdGhlIGVuZW15IGlzIGRlYWQsIHN0b3AgcmVuZGVyaW5nIG5vd1xyXG4gICAgICAgICAgdGhpcy5zZXRTdG9wUmVuZGVyaW5nTWUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICB9IGVsc2UgeyAvLyAjIE5vdCBkZWFkXHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIGl0J3MgbmVhciBlbm91Z2ggb2YgcGxheWVyIHRvIGdvIGluIGhpcyBkaXJlY3Rpb25cclxuICAgICAgICBsZXQgbmVhclBsYXllciA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICAvLyBDaGVjayBkaXN0YW5jZSBiZXR3ZWVuIGVuZW15IGFuZCBwbGF5ZXJcclxuICAgICAgICAgIHRoaXMueEZyb21QbGF5ZXJEaXN0YW5jZSA9IE1hdGguYWJzKCB0aGlzLmdldENlbnRlclgoKSAtIHBsYXllci5nZXRDZW50ZXJYKCkgKTtcclxuICAgICAgICAgIHRoaXMuWUZyb21QbGF5ZXJEaXN0YW5jZSA9IE1hdGguYWJzKCB0aGlzLmdldENlbnRlclkoKSAtIHBsYXllci5nZXRDZW50ZXJZKCkgKTtcclxuICAgICAgICAgIC8vSWYgYm90aCBkaXN0YW5jZSBhcmUgYmVsb3cgdGhlIGF3YXJlIGRpc3RhbmNlLCBzZXQgdGhpcyBwbGF5ZXIgdG8gYmUgdGhlIG5lYXIgcGxheWVyXHJcbiAgICAgICAgICBpZiggdGhpcy54RnJvbVBsYXllckRpc3RhbmNlIDwgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlICYmIHRoaXMuWUZyb21QbGF5ZXJEaXN0YW5jZSA8IHRoaXMucGxheWVyQXdhcmVEaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgbmVhclBsYXllciA9IHBsYXllcjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgXHJcbiAgICAgICAgaWYoIG5lYXJQbGF5ZXIgKSB7XHJcblxyXG4gICAgICAgICAgLy8gIyBXYWxrIGluIHBsYXllciBkaXJlY3Rpb25cclxuICAgICAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcih0cnVlKTtcclxuXHJcbiAgICAgICAgICAvLyBwb3NpdGlvbnNcclxuICAgICAgICAgIGxldCBYZSA9IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgICAgICAgbGV0IFllID0gdGhpcy5nZXRDb2xsaXNpb25ZKCk7XHJcblxyXG4gICAgICAgICAgbGV0IFhwID0gbmVhclBsYXllci5nZXRDb2xsaXNpb25YKCk7IFxyXG4gICAgICAgICAgbGV0IFlwID0gbmVhclBsYXllci5nZXRDb2xsaXNpb25ZKCk7IFxyXG5cclxuICAgICAgICAgIGxldCBYZGlzdGFuY2UgPSBNYXRoLmFicyhYZSAtIFhwKTsvLyBJZ25vcmUgaWYgdGhlIHJlc3VsdCBpcyBhIG5lZ2F0aXZlIG51bWJlclxyXG4gICAgICAgICAgbGV0IFlkaXN0YW5jZSA9IE1hdGguYWJzKFllIC0gWXApO1xyXG5cclxuICAgICAgICAgIC8vIHdoaWNoIGRpcmVjdGlvbiB0byBsb29rXHJcbiAgICAgICAgICBsZXQgWGRpcmVjdGlvbiA9IFwiXCI7XHJcbiAgICAgICAgICBsZXQgWWRpcmVjdGlvbiA9IFwiXCI7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIFhkaXJlY3Rpb24gPSAoIFhlID49IFhwICkgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgICAgICAgWWRpcmVjdGlvbiA9ICggWWUgPj0gWXAgKSA/ICd1cCcgOiAnZG93bic7XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIHdoZXJlIHRvIGdvXHJcbiAgICAgICAgICBsZXQgZ29Ub0RpcmVjdGlvbiA9ICggWGRpc3RhbmNlID4gWWRpc3RhbmNlICkgPyBYZGlyZWN0aW9uIDogWWRpcmVjdGlvbjtcclxuXHJcbiAgICAgICAgICAvLyBJZiBoYXMgY29sbGlkZWQgYSBsb3QsIGNoYW5nZSBkaXJlY3Rpb24gdG8gYXZvaWQgZ2V0dGluZyBzdHVja1xyXG4gICAgICAgICAgaWYoIHRoaXMuY29sbGlzaW9uQ291bnQgPiAyMCApIHtcclxuICAgICAgICAgICAgLy8gU3RvcCBnb2luZyBvbiB0aGF0IGRpcmVjdGlvblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICBUT0RPOiBUaGluayBhYm91dCBpdCEhXHJcbiAgICAgICAgICAgICovXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIG1vdmVcclxuICAgICAgICAgIHN3aXRjaCggZ29Ub0RpcmVjdGlvbiApIHtcclxuICAgICAgICAgICAgY2FzZSAndXAnOiAgICB0aGlzLm1vdlVwKCk7ICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdyaWdodCc6IHRoaXMubW92UmlnaHQoKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2Rvd24nOiAgdGhpcy5tb3ZEb3duKCk7ICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6ICB0aGlzLm1vdkxlZnQoKTsgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vICMgZmFyIGZyb20gcGxheWVyLCBzbyBrZWVwIHJhbmRvbSBtb3ZlbWVudFxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICB0aGlzLnNldEF3YXJlT2ZQbGF5ZXIoZmFsc2UpO1xyXG5cclxuICAgICAgICAgIC8vIENoZWNrIGlmIHN0b3BlZCB0aGUgbW92ZSBldmVudFxyXG4gICAgICAgICAgaWYoIHRoaXMuZGlyZWN0aW9uQ291bnRkb3duIDw9IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZERpcmVjdGlvbiA9ICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KSArIDE7IC8vIDEgLSA0XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uQ291bnRkb3duID0gIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIDEwOyAvLyAxIC0gNFxyXG4gICAgICAgICAgICAvL3RoaXMucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIE1vdmUgZGlyZWN0aW9uIG5lZWRlZFxyXG4gICAgICAgICAgc3dpdGNoKCB0aGlzLnJhbmREaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMTogdGhpcy5tb3ZVcCgpOyAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogdGhpcy5tb3ZSaWdodCgpOyAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzogdGhpcy5tb3ZEb3duKCk7ICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogdGhpcy5tb3ZMZWZ0KCk7ICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTogLy8gbW9yZSBjaGFuY2VzIHRvIGRvbid0IG1vdmVcclxuICAgICAgICAgICAgY2FzZSA2OiBcclxuICAgICAgICAgICAgY2FzZSA3OiBcclxuICAgICAgICAgICAgICB0aGlzLnJlc2V0U3RlcCgpOyBicmVhazsgLy8gZG9uJ3QgbW92ZVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuZGlyZWN0aW9uQ291bnRkb3duLS07XHJcbiAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB9IC8vIGlmIGRlYWRcclxuXHJcbiAgICB9Ly9pZiBnYW1lIHJlYWR5XHJcblxyXG4gICAgXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuZW5lbXlCcmFpbi5iaW5kKHRoaXMpICk7XHJcbiAgfVxyXG5cclxuLy8gIyBDb2xsaXNpb25cclxuXHJcbiAgY29sbGlzaW9uKG9iail7IFxyXG4gICAgaWYoIG9iai50eXBlID09IFwicGxheWVyXCIgKSBvYmouaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IHBsYXllclxyXG4gICAgdGhpcy5jb2xsaXNpb25Db3VudCsrO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBcclxuICBcclxuICAvLyBIYXMgYSBjb2xsaXNpb24gRXZlbnQ/XHJcbiAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgc3RvcElmQ29sbGlzaW9uKCkgeyByZXR1cm4gdGhpcy5zdG9wT25Db2xsaXNpb247IH1cclxuXHJcbiAgcnVuRW5lbXkoKSB7XHJcbiAgICAvLyBjaGFuZ2UgbG9vayBkaXJlY3Rpb25cclxuICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuXHJcbiAgICAvL3N0YXJ0IGFsZ29yaXRtIHRoYXQgbW92ZXMgcGxheWVyXHJcbiAgICB0aGlzLmVuZW15QnJhaW4oKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEVuZW15OyIsImNvbnN0IF9DYW5IdXJ0ID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2Fzc2V0cy9fQ2FuSHVydCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEZpcmUgZXh0ZW5kcyBfQ2FuSHVydCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiRmlyZVwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA0OSk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkh1cnRQcm9wcyA9IHtcclxuICAgICAgYW1vdW50OiAxXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5IdXJ0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAzO1xyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQpICsgMTsgLy8gR2VuZXJhdGUgYSByYW5kIGluaXRpYWwgbnVtYmVyIHRvIHJhbmRvbWl6ZSBhbmltYXRpb24gaW4gY2FzZSBvZiBtdWx0aXBsZSBGaXJlc1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMC40OyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyAoIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMC42KTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIGxldCByYW5kRlBTID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNykgKyA1OyAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBGUFMsIHNvIG11bHRpcGxlIEZpcmVzIG9uIHBhZ2UgZG9uJ3QgYW5pbWF0ZSB0aGUgc2FtZSB3YXkgXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIHJhbmRGUFM7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25IZWlnaHQodGhpcy5jb2xsaXNpb25IZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh0aGlzLmNvbGxpc2lvblkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRTcHJpdGVQcm9wc0ZyYW1lKHNwcml0ZUFuaW1hdGlvbkNvdW50KXtcclxuICAgIHN3aXRjaChzcHJpdGVBbmltYXRpb25Db3VudCkgeyBcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygwKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgYmVmb3JlUmVuZGVyKCkge1xyXG4gICAgLy8gQW5pbWF0ZSBmaXJlXHJcbiAgICBpZiggdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCsrO1xyXG4gICAgICBpZiggdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA+IHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgKSB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRmlyZTsiLCJjb25zdCBfQ2FuQ29sbGVjdCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhbkNvbGxlY3QnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBIZWFsIGV4dGVuZHMgX0NhbkNvbGxlY3Qge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHN0YWdlX2lkKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogc3RhZ2VfaWQgKyBcIl9wb3Rpb25cIixcclxuICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgc3RhZ2U6IHN0YWdlX2lkXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA1MCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkNvbGxlY3RQcm9wcyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaGFzIHNvbWUgc2F2ZSBzdGF0ZVxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgIGxldCBpdGVtU2F2ZWRTdGF0ZSA9IHNhdmVkSXRlbXNTdGF0ZVt0aGlzLmdldE5hbWUoKV07XHJcbiAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZSAmJiAhIHRoaXMuY2FuUmVzcGF3bigpICYmIGl0ZW1TYXZlZFN0YXRlLmNvbGxlY3RlZCA9PT0gdHJ1ZSApeyAvLyBDaGVjayBpZiBoYXMgc2F2ZWQgc3RhdGUgYW5kIGNhbid0IHJlc3Bhd25cclxuICAgICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgfVxyXG5cclxuICBzZXRIZWFsQW1vdXQoYW1vdW50KSB7IHRoaXMuaGVhbEFtb3V0ID0gYW1vdW50OyB9XHJcbiAgZ2V0SGVhbEFtb3VudCgpIHsgcmV0dXJuIHRoaXMuaGVhbEFtb3V0OyB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnYmFuYW5hJzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdiZXJyeSc6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIxKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbGxpc2lvbihwbGF5ZXIpeyBcclxuICAgIGlmKCAhdGhpcy5pc0NvbGxlY3RlZCgpICkge1xyXG4gICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgIHBsYXllci5oZWFsUGxheWVyKCB0aGlzLmdldEhlYWxBbW91bnQoKSApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbiAgLy8gSGFuZGxlIHByb3BzIHdoZW4gbG9hZFxyXG4gIGhhbmRsZVByb3BzKCkge1xyXG4gICAgXHJcbiAgICAvLyBTZXQgUHJvcHMgYmFzZWQgb24gdHlwZVxyXG4gICAgc3dpdGNoKCB0aGlzLmdldFR5cGUoKSApIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2JhbmFuYSc6XHJcbiAgICAgICAgdGhpcy5zZXRIZWFsQW1vdXQoMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2JlcnJ5JzpcclxuICAgICAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7IC8vIE1ha2UgdGhpcyBpdGVtIGFibGUgdG8gc2F2ZSBzdGF0ZVxyXG4gICAgICAgIHRoaXMuc2V0SGVhbEFtb3V0KDIpO1xyXG4gICAgICAgIHRoaXMuc2V0Q2FuUmVzcGF3bihmYWxzZSk7IC8vIEl0IGNhbid0IHJlc3Bhd24gaWYgdXNlZFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgc2F2ZWQgYmVmb3JlIGFuZCBjaGFuZ2UgaXQgcHJvcHNcclxuICAgIHRoaXMuY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhbDsiLCJjb25zdCBfQ2FuVGhyb3cgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvYXNzZXRzL19DYW5UaHJvdycpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvY29yZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEtleSBleHRlbmRzIF9DYW5UaHJvdyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgc3RhZ2UsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcImtleVwiLFxyXG4gICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICBjbGFzczogJ2tleScsXHJcbiAgICAgIHN0YWdlOiBzdGFnZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDUwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IHRydWUsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5UaHJvdyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogZmFsc2UsXHJcbiAgICAgIGNodW5ja3NUaHJvd0Rpc3RhbmNlOiAxLFxyXG4gICAgICBodXJ0QW1vdW50OiAwLFxyXG4gICAgICB1c2VFdmVudDogJ3VzZSdcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblRocm93LCBmcm9tU2F2ZVN0YXRlKTtcclxuXHJcbiAgICB0aGlzLnNldE5lZWRTYXZlU3RhdGUodHJ1ZSk7XHJcbiAgICB0aGlzLmhhbmRsZVByb3BzKCk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gaGFzIHNvbWUgc2F2ZSBzdGF0ZVxyXG4gIGNoZWNrU2F2ZWRJdGVtU3RhdGUoKSB7XHJcbiAgICBsZXQgc2F2ZWRJdGVtc1N0YXRlID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9faXRlbXNTdGF0ZScpICk7ICBcclxuICAgIGlmKCBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcblxyXG4gICAgICBsZXQgaXRlbVNhdmVkU3RhdGUgPSBzYXZlZEl0ZW1zU3RhdGVbdGhpcy5nZXROYW1lKCldO1xyXG4gICAgICBcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGlzIGFscmVhZHkgZ3JhYmJlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZ3JhYmJlZCA9PSB0cnVlICl7IFxyXG4gICAgICAgIGlmKCB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgLy8gR3JhYiB0aGUgaXRlbSBzYXZlZFxyXG4gICAgICAgICAgdGhpcy5ncmFiSGFuZGxlciggaXRlbVNhdmVkU3RhdGUuZ3JhYlByb3BzLnBsYXllcldob0dyYWJiZWQgKTsgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgaXRlbSB3YXMgdXNlZCBiZWZvcmVcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmNvbGxlY3RlZCA9PSB0cnVlICkgeyBcclxuICAgICAgICB0aGlzLmNvbGxlY3QoKTtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgdGhpcy5jYW5HcmFiID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vQ2hlY2sgaWYgaXQgd2FzIGRyb3BwZWRcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmIGl0ZW1TYXZlZFN0YXRlLmRyb3BwZWQgPT0gdHJ1ZSApIHsgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBkcm9wcGVkIG9uIHRoaXMgc3RhZ2VcclxuICAgICAgICBpZiggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZSA9PSB3aW5kb3cuZ2FtZS5nZXRDdXJyZW50U3RhZ2UoKSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYoICEgdGhpcy5mcm9tU2F2ZWRTdGF0ZSApIHtcclxuICAgICAgICAgICAgLy8gSWdub3JlIHRoZSBpdGVtIGZyb20gc3RhZ2VcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlWCggaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVZKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFkgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLngwID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLngwO1xyXG4gICAgICAgIHRoaXMueTAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueTA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5kcm9wWCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWDtcclxuICAgICAgICB0aGlzLmRyb3BZID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BZO1xyXG5cclxuICAgICAgICB0aGlzLmRyb3BwZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5zdGFnZTtcclxuICAgICAgICB0aGlzLmRyb3BwZWRTdGFnZSA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTcHJpdGVzIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJncmF5XCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmF5Jyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInB1cnBsZVwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncHVycGxlJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInJlZFwiOlxyXG4gICAgICAgIHRoaXMuc2V0Q29kZSgncmVkJyk7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImdyZWVuXCI6XHJcbiAgICAgICAgdGhpcy5zZXRDb2RlKCdncmVlbicpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyOSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcblxyXG4gIGRpc2NhcmRLZXkocGxheWVyKSB7XHJcbiAgICB0aGlzLmhpZGUoKTtcclxuICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgIHRoaXMuc2V0Q29sbGVjdCh0cnVlKTtcclxuICAgIHRoaXMuc2V0R3JhYihmYWxzZSk7XHJcbiAgICBwbGF5ZXIuc2V0Tm90R3JhYmJpbmcoKTtcclxuICB9XHJcblxyXG4gIHVzZShkaXJlY3Rpb24sIHBsYXllckhlaWdodCwgcGxheWVyKSB7XHJcbiAgICBsZXQgb2JqID0gcGxheWVyLmNoZWNrSXRlbU9uR3JhYkNvbGxpc2lvbkJveCgpO1xyXG4gICAgaWYoIG9iai50eXBlID09ICdkb29yJyApIHtcclxuICAgICAgaWYoIG9iai5nZXRDb2RlKCkgPT0gdGhpcy5nZXRDb2RlKCkgKSB7XHJcbiAgICAgICAgb2JqLm9wZW4oKTtcclxuICAgICAgICB0aGlzLmRpc2NhcmRLZXkocGxheWVyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gS2V5OyIsImNvbnN0IF9DYW5CZVB1c2hlZCA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhbkJlUHVzaGVkJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgT2JqZWN0X1B1c2ggZXh0ZW5kcyBfQ2FuQmVQdXNoZWQge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIm9iamVjdFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA1MCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuUHVzaCA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZSxcclxuICAgICAgY2h1bmNrc1B1c2hEaXN0YW5jZTogMTUsXHJcbiAgICAgIGh1cnRBbW91bnQ6IDJcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblB1c2gpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgY2FzZSBcInN0b25lXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI0KTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdF9QdXNoOyIsImNvbnN0IF9DYW5UaHJvdyA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NhblRocm93Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgT2JqZWN0X1Rocm93IGV4dGVuZHMgX0NhblRocm93IHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZSwgZnJvbVNhdmVTdGF0ZSkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwib2JqZWN0XCIsXHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIGNsYXNzOiAnb2JqZWN0X3Rocm93JyxcclxuICAgICAgc3RhZ2U6IHN0YWdlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA1MCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuVGhyb3cgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IHRydWUsXHJcbiAgICAgIGNodW5ja3NUaHJvd0Rpc3RhbmNlOiA1LFxyXG4gICAgICBodXJ0QW1vdW50OiAyLFxyXG4gICAgICB1c2VFdmVudDogJ3Rocm93J1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuVGhyb3csIGZyb21TYXZlU3RhdGUpO1xyXG5cclxuICAgIHRoaXMuc2V0TmVlZFNhdmVTdGF0ZSh0cnVlKTsvL3NldCB0byBzYXZlIGp1c3QgdG8gY2hlY2sgaWYgdXNlciBpcyBncmFiYmluZyBpdCB3aGVuIGxlYXZpbmcgc3RhZ2VcclxuICAgIHRoaXMuaGFuZGxlUHJvcHMoKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIFwiYmFycmVsXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMuc2V0Q29kZSh0eXBlKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBoYXMgc29tZSBzYXZlIHN0YXRlXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIGlzIGFscmVhZHkgZ3JhYmJlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZ3JhYmJlZCA9PT0gdHJ1ZSApe1xyXG4gICAgICAgIGlmKCB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgLy8gR3JhYiB0aGUgaXRlbSBzYXZlZFxyXG4gICAgICAgICAgdGhpcy5ncmFiSGFuZGxlciggaXRlbVNhdmVkU3RhdGUuZ3JhYlByb3BzLnBsYXllcldob0dyYWJiZWQgKTsgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIElnbm9yZSB0aGUgaXRlbSBmcm9tIHN0YWdlXHJcbiAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy9DaGVjayBpZiBpdCB3YXMgZHJvcHBlZFxyXG4gICAgICBpZiggaXRlbVNhdmVkU3RhdGUgJiYgaXRlbVNhdmVkU3RhdGUuZHJvcHBlZCA9PSB0cnVlICkgeyBcclxuICAgICAgICAvLyBDaGVjayBpZiBpdCdzIGRyb3BwZWQgb24gdGhpcyBzdGFnZVxyXG4gICAgICAgIGlmKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlID09IHdpbmRvdy5nYW1lLmdldEN1cnJlbnRTdGFnZSgpICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiggISB0aGlzLmZyb21TYXZlZFN0YXRlICkge1xyXG4gICAgICAgICAgICAvLyBJZ25vcmUgdGhlIGl0ZW0gZnJvbSBzdGFnZVxyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVYKCBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFggKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVkoIGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy5kcm9wWSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMueDAgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMueDA7XHJcbiAgICAgICAgdGhpcy55MCA9IGl0ZW1TYXZlZFN0YXRlLmRyb3BQcm9wcy55MDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmRyb3BYID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BYO1xyXG4gICAgICAgIHRoaXMuZHJvcFkgPSBpdGVtU2F2ZWRTdGF0ZS5kcm9wUHJvcHMuZHJvcFk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFN0YWdlID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLnN0YWdlO1xyXG4gICAgICAgIHRoaXMuZHJvcHBlZFN0YWdlID0gaXRlbVNhdmVkU3RhdGUuZHJvcFByb3BzLmRyb3BwZWRTdGFnZTtcclxuICAgICAgICBcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICAvLyBDaGVjayBpZiB0aGlzIGl0ZW0gd2FzIHNhdmVkIGJlZm9yZSBhbmQgY2hhbmdlIGl0IHByb3BzXHJcbiAgICB0aGlzLmNoZWNrU2F2ZWRJdGVtU3RhdGUoKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdF9UaHJvdzsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9hc3NldHMvX0NvbGxpZGFibGUnKTtcclxuY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9nYW1lUHJvcGVydGllcycpOyBcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL2NvcmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBUZWxlcG9ydCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCwgdGVsZXBvcnRQcm9wcykge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiVGVsZXBvcnRcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZmFsc2UsIDAsIDAsIDAsIDApO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICAgIHRoaXMudGVsZXBvcnRQcm9wcyA9IHRlbGVwb3J0UHJvcHM7XHJcblxyXG4gICAgdGhpcy54SW5kZXggPSB4SW5kZXg7XHJcbiAgICB0aGlzLnlJbmRleCA9IHlJbmRleDtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgY29sbGlzaW9uKHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LCBjb2xsaWRhYmxlLCBjb2xsaXNpb25EaXJlY3Rpb24pe1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVycyA9IGNvbGxpZGFibGUuc2NlbmFyaW8uZ2V0UGxheWVycygpO1xyXG5cclxuICAgIC8vIElmIHRoZSBwbGF5ZXIgdGVsZXBvcnRzLCB0aGVuIGNoYW5nZSBzdGFnZVxyXG4gICAgaWYoIHRoaXMudGVsZXBvcnQoIHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0ICkgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBNYWtlIGV2ZXJ5dGhpbmcgZGFya1xyXG4gICAgICBjb2xsaWRhYmxlLnNjZW5hcmlvLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB3aW5kb3cuZ2FtZS5sb2FkaW5nKHRydWUpO1xyXG5cclxuICAgICAgLy8gSGlkZSBhbGwgcGxheWVyc1xyXG4gICAgICBwbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5oaWRlUGxheWVyKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gV2FpdCBzb21lIHRpbWUgLSBkb250J3QgbmVlZCBpdCBhbnltb3JlIChpIHRoaW5rKVxyXG4gICAgICAvL3NldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBOb3cgdGVsZXBvcnQgYWxsIHBsYXllcnMgdG8gc2FtZSBsb2NhdGlvbiBhbmQgZGlyZWN0aW9uXHJcbiAgICAgICAgbGV0IHRhcmdldFggPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRYKCk7XHJcbiAgICAgICAgbGV0IHRhcmdldFkgPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRZKCk7XHJcbiAgICAgICAgbGV0IGxvb2tEaXJlY3Rpb24gPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRTcHJpdGVQcm9wcygpLmRpcmVjdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICBwbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLnNldFgodGFyZ2V0WCwgdHJ1ZSk7IC8vIHRydWUgPSBhbHNvIHNldCBjb2xsaXNpb24geCB0b29cclxuICAgICAgICAgIHBsYXllci5zZXRZKHRhcmdldFksIHRydWUpO1xyXG4gICAgICAgICAgcGxheWVyLnRyaWdnZXJMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pO1xyXG4gICAgICAgICAgcGxheWVyLmNoZWNrR3JhYmJpbmdPYmplY3RzKCk7XHJcbiAgICAgICAgICBwbGF5ZXIuc2hvd1BsYXllcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDaGFuZ2Ugc3RhZ2VcclxuICAgICAgICBjb2xsaWRhYmxlLnNjZW5hcmlvLnNldFN0YWdlKCBcclxuICAgICAgICAgIHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRTdGFnZSxcclxuICAgICAgICAgIGZhbHNlIC8vIGZpcnN0U3RhZ2UgP1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYW1lLmxvYWRpbmcoZmFsc2UpO1xyXG5cclxuICAgICAgLy99LCAzMDApO1xyXG4gICAgICBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvLyBXaGF0IGtpbmQgb2YgdGVsZXBvcnQ/XHJcbiAgdGVsZXBvcnQoIHBsYXllciApIHtcclxuICAgIFxyXG4gICAgbGV0IGdhbWVQcm9wcyA9IG5ldyBnYW1lUHJvcGVydGllcygpO1xyXG5cclxuICAgIGxldCB0eXBlID0gdGhpcy50ZWxlcG9ydFByb3BzLnRlbGVwb3J0VHlwZTtcclxuICAgIGxldCB0YXJnZXRYID0gMDtcclxuICAgIGxldCB0YXJnZXRZID0gMDtcclxuXHJcbiAgICBsZXQgd2lsbFRlbGVwb3J0ID0gZmFsc2U7XHJcblxyXG4gICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRhcmdldFggPSB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0WDtcclxuICAgICAgICB0YXJnZXRZID0gdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFk7XHJcbiAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInJlbGF0aXZlXCI6XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnRlbGVwb3J0UHJvcHMuY2FtZUZyb20pIHtcclxuICAgICAgICAgIGNhc2UgXCJ0b3BcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IHRoaXMueEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIChnYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuVmVydGljYWxDaHVua3MnKSAtIDMgKSAqIHRoaXMuY2h1bmtTaXplKTsgLy8gLTMgYmVjYXVzZSBvZiB0aGUgcGxheWVyIGNvbGxpc2lvbiBib3hcclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgICAgIHRhcmdldFggPSB0aGlzLnhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRZID0gMCAqIHRoaXMuY2h1bmtTaXplOyAvLyBUZWxlcG9ydCB0byBZPTAsIGJ1dCBwbGF5ZXIgaGl0Ym94IHdpbGwgbWFrZSBoaW0gZ28gMSB0aWxlIGRvd25cclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggdGhpcy55SW5kZXggKiB0aGlzLmNodW5rU2l6ZSkgLSB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IDEgKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgICAgICB0YXJnZXRZID0gKCB0aGlzLnlJbmRleCAqIHRoaXMuY2h1bmtTaXplKSAtIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRYID0gKCBnYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuSG9yaXpvbnRhbENodW5rcycpIC0gMiApICogdGhpcy5jaHVua1NpemU7IFxyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT25seSB0ZWxlcG9ydHMgaWYgaXQgY2FuIHRlbGVwb3J0XHJcbiAgICBpZiggd2lsbFRlbGVwb3J0ICkge1xyXG4gICAgICBwbGF5ZXIuc2V0WCggdGFyZ2V0WCApOyAvLyBhbHdheXMgdXNpbmcgWCBhbmQgWSByZWxhdGl2ZSB0byB0ZWxlcG9ydCBub3QgcGxheWVyIGJlY2F1c2UgaXQgZml4IHRoZSBwbGF5ZXIgcG9zaXRpb24gdG8gZml0IGluc2lkZSBkZXN0aW5hdGlvbiBzcXVhcmUuXHJcbiAgICAgIHBsYXllci5zZXRZKCB0YXJnZXRZICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHdpbGxUZWxlcG9ydDtcclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBUZWxlcG9ydDsiLCIvKipcclxuICogIFN0b3JlIEFzc2V0cyB0aGF0IG5lZWRzIHRvIGJlIG9uIGFueSBzdGFnZSwgbGlrZSBrZXlzIG9yIGl0ZW1zIHRoYXQgcGxheWVyIGdyYWJzXHJcbiAqIFxyXG4gKiAgRGVjbGFyZSBhbGwgb2YgdGhpcyBhc3NldHMgaGVyZVxyXG4gKi9cclxuXHJcbmNvbnN0IEtleSA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vS2V5Jyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2Fzc2V0cy9zY2VuYXJpby9jb21tb24vT2JqZWN0X1Rocm93Jyk7XHJcblxyXG5jbGFzcyBHbG9iYWxBc3NldHMge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHsgXHJcblx0XHR0aGlzLmNodW5rU2l6ZSA9IGNodW5rU2l6ZTtcclxuXHR9XHJcblxyXG4gIGdldEFzc2V0KCBfY2xhc3MsIHByb3BzLCBmcm9tU2F2ZVN0YXRlICkge1xyXG4gICAgbGV0IHI7XHJcbiAgICBzd2l0Y2goIF9jbGFzcyApIHtcclxuICAgICAgY2FzZSAna2V5JzpcclxuICAgICAgICByID0gbmV3IEtleSggcHJvcHMuY29kZSwgcHJvcHMueDAsIHByb3BzLnkwLCBwcm9wcy5zdGFnZSwgZnJvbVNhdmVTdGF0ZSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdvYmplY3RfdGhyb3cnOlxyXG4gICAgICAgIHIgPSBuZXcgT2JqZWN0X1Rocm93KCBwcm9wcy5jb2RlLCBwcm9wcy54MCwgcHJvcHMueTAsIHByb3BzLnN0YWdlLCBmcm9tU2F2ZVN0YXRlICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdsb2JhbEFzc2V0czsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5CZVB1c2hlZCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5CZVB1c2hlZFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNhblVzZSA9IHRydWU7XHJcbiAgICB0aGlzLl9wdXNoID0gZmFsc2U7XHJcbiAgICB0aGlzLl9jYW5SZXNwYXduID0gY2FuQmVQdXNoZWRQcm9wcy5jYW5SZXNwYXduO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuQmVQdXNoZWRQcm9wcy5odXJ0QW1vdW50O1xyXG4gICAgXHJcbiAgICB0aGlzLnB1c2hEaXN0YW5jZSA9IGNhbkJlUHVzaGVkUHJvcHMuY2h1bmNrc1B1c2hEaXN0YW5jZSAqIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG4gICAgdGhpcy5wdXNoU3BlZWQgPSAwLjg7XHJcbiAgICB0aGlzLnB1c2hEaXN0YW5jZVRyYXZlbGxlZCA9IDA7XHJcbiAgICB0aGlzLnB1c2hNb3ZlbWVudCA9IGZhbHNlO1xyXG4gICAgdGhpcy5wdXNoRGlyZWN0aW9uID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHRoaXMudGFyZ2V0WCA9IDA7XHJcbiAgICB0aGlzLnRhcmdldFkgPSAwO1xyXG4gIH1cclxuXHJcbiAgaXNQdXNoaW5nKCkgeyByZXR1cm4gdGhpcy5fcHVzaDsgfVxyXG4gIHNldFB1c2goYm9vbCkgeyB0aGlzLl9wdXNoID0gYm9vbDsgfVxyXG4gIGdldFB1c2hTcGVlZCgpIHsgcmV0dXJuICB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIHRoaXMucHVzaFNwZWVkOyB9XHJcbiAgY2FsY3VsYXRlUHVzaERpcmVjdGlvbihkaXJlY3Rpb24pIHsgXHJcbiAgICB0aGlzLnB1c2hEaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICBzd2l0Y2goIHRoaXMucHVzaERpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB0aGlzLnB1c2hEaXN0YW5jZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHRoaXMucHVzaERpc3RhbmNlOyBcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpICsgdGhpcy5wdXNoRGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgLSB0aGlzLnB1c2hEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG4gIHVzZUhhbmRsZXIoZGlyZWN0aW9uKSB7XHJcbiAgICB0aGlzLnB1c2goZGlyZWN0aW9uKTtcclxuICB9XHJcblxyXG4gIHN0b3BPYmplY3QoKSB7XHJcbiAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbih0cnVlKTtcclxuICAgIHRoaXMuc2V0UHVzaChmYWxzZSk7XHJcbiAgfVxyXG5cclxuICBwdXNoKGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5zZXRQdXNoKHRydWUpO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVQdXNoRGlyZWN0aW9uKCBkaXJlY3Rpb24gKTtcclxuICB9XHJcblxyXG4gIG1vdmVUb1B1c2hEaXJlY3Rpb24oKSB7XHJcbiAgICBzd2l0Y2goIHRoaXMucHVzaERpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAvLyBZXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0UHVzaFNwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2VUcmF2ZWxsZWQgKz0gdGhpcy5nZXRQdXNoU3BlZWQoKTtcclxuXHJcbiAgICAvLyBDaGVjayBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIsIGVuZW15IGFuZCBvYmplY3RzXHJcbiAgICB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbigpO1xyXG5cclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbigpIHtcclxuICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrQWxsKHRoaXMsIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpKTsgXHJcbiAgICBpZiAoIG9iaiAmJiB0aGlzLmlzUHVzaGluZygpICkge1xyXG4gICAgICBzd2l0Y2gob2JqLnR5cGUpIHtcclxuICAgICAgICBjYXNlICdwbGF5ZXInOlxyXG4gICAgICAgICAgb2JqLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTsgLy8gaHVydCBwbGF5ZXJcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2VuZW15JzpcclxuICAgICAgICAgIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgZW5lbXlcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBpZiggb2JqLm92ZXJsYXBYICkgdGhpcy51cGRhdGVYKCBvYmoub3ZlcmxhcFggKTtcclxuICAgICAgICAgIGlmKCBvYmoub3ZlcmxhcFkgKSB0aGlzLnVwZGF0ZVkoIG9iai5vdmVybGFwWSApO1xyXG4gICAgICAgICAgdGhpcy5zdG9wT2JqZWN0KCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuIFxyXG4gIGJlZm9yZVJlbmRlcigpIHtcclxuICAgIGlmKCB0aGlzLmlzUHVzaGluZygpICkge1xyXG4gICAgICBpZiggdGhpcy5nZXRYKCkgIT0gdGhpcy50YXJnZXRYIHx8IHRoaXMuZ2V0WSgpICE9IHRoaXMudGFyZ2V0WSApIHtcclxuICAgICAgICB0aGlzLm1vdmVUb1B1c2hEaXJlY3Rpb24oKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0b3BPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgfSAgICAgICBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5CZVB1c2hlZDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5Db2xsZWN0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhbkNvbGxlY3RQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX2NhblJlc3Bhd24gPSBjYW5Db2xsZWN0UHJvcHMuY2FuUmVzcGF3bjtcclxuICB9XHJcblxyXG4gIGlzQ29sbGVjdGVkKCkgeyByZXR1cm4gdGhpcy5jb2xsZWN0ZWQ7IH1cclxuICBjb2xsZWN0KCl7IHRoaXMuY29sbGVjdGVkID0gdHJ1ZTsgfVxyXG4gIHNldENvbGxlY3QoYm9vbCkgeyB0aGlzLmNvbGxlY3QgPSBib29sOyB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuX2NhblJlc3Bhd24gPSBib29sOyB9XHJcbiAgY2FuUmVzcGF3bigpIHsgcmV0dXJuIHRoaXMuX2NhblJlc3Bhd247IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuQ29sbGVjdDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5IdXJ0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsY2FuSHVydFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuSHVydFByb3BzLmFtb3VudDtcclxuICB9XHJcbiAgXHJcbiAgLy8gSWYgaXQncyBub3QgY29sbGlkaW5nIHRvIGFueSB0ZWxlcG9ydCBjaHVuayBhbnltb3JlLCBtYWtlIGl0IHJlYWR5IHRvIHRlbGVwb3J0IGFnYWluXHJcbiAgY29sbGlzaW9uKG9iail7IFxyXG4gICAgaWYoIG9iai50eXBlID09IFwicGxheWVyXCIgKSBvYmouaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpO1xyXG4gICAgaWYoIG9iai50eXBlID09IFwiZW5lbXlcIiApIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxuICBiZWZvcmVSZW5kZXIoY3R4KSB7XHJcbiAgICAvLyBkZWJ1ZyBwb3NpdGlvblxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgbGV0IHggPSBNYXRoLnJvdW5kKHRoaXMuZ2V0Q29sbGlzaW9uWCgpKTtcclxuICAgICAgbGV0IHkgPSBNYXRoLnJvdW5kKHRoaXMuZ2V0Q29sbGlzaW9uWSgpKTtcclxuICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgeCArIFwiIFk6IFwiICsgeTtcclxuICAgICAgY29uc29sZS5sb2codGV4dCk7XHJcbiAgICAgIGN0eC5mb250ID0gXCIyNXB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjRkZGRkZGJztcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwICwgdGhpcy5nZXRZKCkpOyBcclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5IdXJ0OyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi9jb3JlL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgX0NhblRocm93IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGNhblRocm93UHJvcHMsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgZnJvbVNhdmVTdGF0ZSk7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuR3JhYiA9IHRydWU7XHJcbiAgICB0aGlzLmdyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY29sbGVjdGVkID0gZmFsc2U7XHJcbiAgICB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kcm9wcGVkU3RhZ2UgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcFggPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcFkgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl9jYW5SZXNwYXduID0gY2FuVGhyb3dQcm9wcy5jYW5SZXNwYXduO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuVGhyb3dQcm9wcy5odXJ0QW1vdW50O1xyXG5cclxuICAgIHRoaXMudXNlRXZlbnQgPSBjYW5UaHJvd1Byb3BzLnVzZUV2ZW50O1xyXG4gICAgXHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2UgPSBjYW5UaHJvd1Byb3BzLmNodW5ja3NUaHJvd0Rpc3RhbmNlICogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcbiAgICB0aGlzLnRocm93U3BlZWQgPSAwLjg7XHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2VUcmF2ZWxsZWQgPSAwO1xyXG4gICAgdGhpcy50aHJvd2luZ01vdmVtZW50ID0gZmFsc2U7XHJcbiAgICB0aGlzLnRocm93RGlyZWN0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5kZXN0cm95T25BbmltYXRpb25FbmQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy50YXJnZXRYID0gMDtcclxuICAgIHRoaXMudGFyZ2V0WSA9IDA7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvICggd2luZG93LmdhbWUuZ2FtZVByb3BzLmZwcyAqIDIgKTsgLy8gMTAwMCAvIEZQU1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgIC8vIERlc3Ryb3kgYW5pbWF0aW9uIHByb3BzXHJcbiAgICB0aGlzLmRlc3Ryb3lpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuZGVzdHJveVNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG4gICAgdGhpcy5kZXN0cm95RnJhbWVDb3VudCA9IDE7XHJcbiAgICB0aGlzLmRlc3Ryb3lNYXhGcmFtZUNvdW50ID0gODtcclxuICAgIHRoaXMuZGVzdHJveUluaXRGcmFtZSA9IDM7XHJcbiAgfVxyXG5cclxuICBpc0NvbGxlY3RlZCgpIHsgcmV0dXJuIHRoaXMuY29sbGVjdGVkOyB9XHJcbiAgY29sbGVjdCgpeyB0aGlzLmNvbGxlY3RlZCA9IHRydWU7IH1cclxuICBzZXRDb2xsZWN0KGJvb2wpIHsgdGhpcy5jb2xsZWN0ZWQgPSBib29sOyB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgaXNEZXN0cm95aW5nKCkgeyByZXR1cm4gdGhpcy5kZXN0cm95aW5nOyB9XHJcbiAgc2V0RGVzdHJveWluZyhib29sKSB7IHRoaXMuZGVzdHJveWluZyA9IGJvb2w7IH1cclxuICBcclxuICBzZXREZXN0cm95T25BbmltYXRpb25FbmQoYm9vbCkgeyB0aGlzLmRlc3Ryb3lPbkFuaW1hdGlvbkVuZCA9IGJvb2w7IH1cclxuXHJcbiAgaXNHcmFiYmVkKCkgeyByZXR1cm4gdGhpcy5ncmFiYmVkOyB9XHJcbiAgZ3JhYigpeyBcclxuICAgIHRoaXMuZ3JhYmJlZCA9IHRydWU7XHJcbiAgICB0aGlzLmRyb3BwZWQgPSBmYWxzZTsgXHJcbiAgfVxyXG4gIHNldEdyYWIoYm9vbCkgeyBcclxuICAgIHRoaXMuZ3JhYmJlZCA9IGJvb2w7IFxyXG4gICAgdGhpcy5kcm9wcGVkID0gIWJvb2w7XHJcbiAgfVxyXG4gIHNldFBsYXllcldob0dyYWJiZWQocGxheWVyTnVtYmVyKSB7IHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IHBsYXllck51bWJlcjsgfVxyXG5cclxuICBpc1Rocm93aW5nKCkgeyByZXR1cm4gdGhpcy50aHJvd2luZ01vdmVtZW50OyB9XHJcbiAgc2V0VGhyb3dpbmcoYm9vbCkgeyB0aGlzLnRocm93aW5nTW92ZW1lbnQgPSBib29sOyB9XHJcbiAgZ2V0VGhyb3dTcGVlZCgpIHsgcmV0dXJuICB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIHRoaXMudGhyb3dTcGVlZDsgfVxyXG4gIGNhbGN1bGF0ZVRocm93RGlyZWN0aW9uKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7IFxyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB0aGlzLnRocm93RGlzdGFuY2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB0aGlzLnRocm93RGlzdGFuY2UgKyB0aGlzLmdldEhlaWdodCgpICogMjsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHRoaXMudGhyb3dEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSAtIHRoaXMudGhyb3dEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBjYWxjdWxhdGVEcm9wRGlyZWN0aW9uKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7IFxyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCk7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKSArIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICsgdGhpcy5nZXRIZWlnaHQoKSAqIDI7IFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgdGhpcy50YXJnZXRYID0gdGhpcy5nZXRYKCkgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSAtIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyBwbGF5ZXJIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRDYW5SZXNwYXduKGJvb2wpeyB0aGlzLl9jYW5SZXNwYXduID0gYm9vbDsgfVxyXG4gIGNhblJlc3Bhd24oKSB7IHJldHVybiB0aGlzLl9jYW5SZXNwYXduOyB9XHJcbiAgXHJcbiAgc2V0TmFtZShuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHJcbiAgZ3JhYkhhbmRsZXIoIHBsYXllck51bWJlciApIHtcclxuICAgIHRoaXMucGxheWVyV2hvR3JhYmJlZCA9IHBsYXllck51bWJlcjtcclxuICAgIHRoaXMuc2V0R3JhYih0cnVlKTtcclxuICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTsgLy8gYXZvaWQgcGxheWVycyBwdXNoaW5nIG90aGVyIHBsYXllcnMgd2l0aCBpdGVtc1xyXG4gIH1cclxuXHJcbiAgYnJlYWtPYmplY3QoKSB7XHJcblxyXG4gICAgdGhpcy5zZXRUaHJvd2luZyhmYWxzZSk7XHJcbiAgICB0aGlzLnNldEdyYWIoZmFsc2UpO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5kZXN0cm95T25BbmltYXRpb25FbmQgKSB7XHJcbiAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgdGhpcy5zZXREZXN0cm95aW5nKHRydWUpOyAvLyBTdGFydCBkZXN0cm95IGFuaW1hdGlvblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24odHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgaXNEcm9wcGVkKCkgeyByZXR1cm4gdGhpcy5kcm9wcGVkOyB9XHJcbiAgZHJvcChkaXJlY3Rpb24sIHBsYXllckhlaWdodCkge1xyXG4gICAgdGhpcy5jYWxjdWxhdGVEcm9wRGlyZWN0aW9uKCBkaXJlY3Rpb24sIHBsYXllckhlaWdodCApO1xyXG4gICAgdGhpcy5zZXREZXN0cm95T25BbmltYXRpb25FbmQoZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRUaHJvd2luZyh0cnVlKTtcclxuICAgIHRoaXMuc2V0R3JhYihmYWxzZSk7XHJcbiAgICB0aGlzLnBsYXllcldob0dyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZHJvcFggPSB0aGlzLnRhcmdldFg7XHJcbiAgICB0aGlzLmRyb3BZID0gdGhpcy50YXJnZXRZO1xyXG4gIH1cclxuXHJcbiAgdGhyb3coZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQsIHBsYXllcikge1xyXG4gICAgcGxheWVyLnNldE5vdEdyYWJiaW5nKCk7XHJcbiAgICB0aGlzLmNhbGN1bGF0ZVRocm93RGlyZWN0aW9uKCBkaXJlY3Rpb24sIHBsYXllckhlaWdodCApO1xyXG4gICAgdGhpcy5zZXREZXN0cm95T25BbmltYXRpb25FbmQodHJ1ZSk7XHJcbiAgICB0aGlzLnNldFRocm93aW5nKHRydWUpO1xyXG4gIH1cclxuXHJcbiAgdXNlKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0LCBwbGF5ZXIpIHtcclxuICAgIHN3aXRjaCggdGhpcy51c2VFdmVudCApIHtcclxuICAgICAgY2FzZSAndGhyb3cnOlxyXG4gICAgICAgIHRoaXMudGhyb3coZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQsIHBsYXllcik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBtb3ZlVG9UaHJvd0RpcmVjdGlvbigpIHtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgLyAzICk7IC8vIFNsb3cgdGhlIG1vdmVtZW50XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuXHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBpZiAodGhpcy5nZXRYKCkgPCB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkb3duJzpcclxuICAgICAgIC8vIFlcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgIC8vIFlcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpIC8gMyApO1xyXG4gICAgICAgIC8vIFhcclxuICAgICAgICBpZiAoIHRoaXMuZ2V0WCgpIDwgdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0VGhyb3dTcGVlZCgpICk7XHJcbiAgICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgICBpZiAodGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgICBpZiAodGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMudGFyZ2V0WCApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgdGhpcy50aHJvd0Rpc3RhbmNlVHJhdmVsbGVkICs9IHRoaXMuZ2V0VGhyb3dTcGVlZCgpO1xyXG5cclxuICAgIC8vIENoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciBhbmQgZW5lbXkgb25seVxyXG4gICAgdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24oKTtcclxuXHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb24oKSB7XHJcbiAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVjayh0aGlzLCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSk7IFxyXG4gICAgaWYgKCBvYmogICYmIHRoaXMuaXNUaHJvd2luZygpICkge1xyXG4gICAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiApIHtcclxuICAgICAgICBvYmouaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IHBsYXllclxyXG4gICAgICAgIHRoaXMuYnJlYWtPYmplY3QoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiggb2JqLnR5cGUgPT0gXCJlbmVteVwiICkgeyBcclxuICAgICAgICBvYmouaHVydCh0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IGVuZW15XHJcbiAgICAgICAgdGhpcy5icmVha09iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gXHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkge1xyXG4gICAgXHJcbiAgICAvLyBNb3ZlbWVudCB3aGlsZSB0aHJvd2luZ1xyXG4gICAgaWYoIHRoaXMuaXNUaHJvd2luZygpICkge1xyXG4gICAgICBpZiggdGhpcy5nZXRYKCkgIT0gdGhpcy50YXJnZXRYIHx8IHRoaXMuZ2V0WSgpICE9IHRoaXMudGFyZ2V0WSApIHtcclxuICAgICAgICB0aGlzLm1vdmVUb1Rocm93RGlyZWN0aW9uKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5icmVha09iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgICAgIFxyXG5cclxuICAgIC8vIERlc3Ryb3kgYW5pbWF0aW9uXHJcbiAgICBpZiggdGhpcy5pc0Rlc3Ryb3lpbmcoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZGVzdHJveUZyYW1lQ291bnQgPCB0aGlzLmRlc3Ryb3lNYXhGcmFtZUNvdW50ICApIHtcclxuICAgICAgICBpZiggdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLmRlc3Ryb3lTcHJpdGUuZ2V0U3ByaXRlUHJvcHMoIHRoaXMuZGVzdHJveUluaXRGcmFtZSApO1xyXG4gICAgICAgICAgdGhpcy5kZXN0cm95SW5pdEZyYW1lKys7XHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lGcmFtZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5kcm9wcGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuVGhyb3c7IiwiY2xhc3MgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMsIGZyb21TYXZlU3RhdGUpIHtcclxuICAgICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xyXG4gICAgdGhpcy55ID0gcG9zaXRpb24ueTtcclxuXHJcbiAgICB0aGlzLngwID0gcG9zaXRpb24ueDtcclxuICAgIHRoaXMueTAgPSBwb3NpdGlvbi55O1xyXG4gICAgICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IGRpbWVuc2lvbi53aWR0aDsgLy9weFxyXG4gICAgdGhpcy5oZWlnaHQgPSBkaW1lbnNpb24uaGVpZ2h0O1xyXG5cclxuICAgIC8vICMgQ29sbGlzaW9uXHJcbiAgICB0aGlzLmNvbGxpc2lvbldpZHRoID0gdGhpcy53aWR0aDtcclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICB0aGlzLmNvbGxpc2lvblggPSB0aGlzLng7XHJcbiAgICB0aGlzLmNvbGxpc2lvblkgPSB0aGlzLnk7XHJcblxyXG4gICAgdGhpcy5jaHVua1NpemUgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuXHJcbiAgICAvLyAjIEV2ZW50c1xyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBldmVudHMuc3RvcE9uQ29sbGlzaW9uO1xyXG4gICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IGV2ZW50cy5oYXNDb2xsaXNpb25FdmVudDtcclxuICBcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcclxuXHJcbiAgICAvL3RoaXMuc3RhZ2VTcHJpdGUgPSBzcHJpdGUuc3RhZ2VTcHJpdGU7XHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMubmFtZSA9IHByb3BzLnN0YWdlICsgXCJfXCIgKyBwcm9wcy5uYW1lLnJlcGxhY2UoL1xccy9nLCcnKSArIFwiX1wiICsgdGhpcy54ICsgXCJ4XCIgKyB0aGlzLnk7XHJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm5hbWUudG9Mb3dlckNhc2UoKTtcclxuICAgIHRoaXMub3JpZ2luYWxOYW1lID0gcHJvcHMubmFtZTtcclxuICAgIFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5uZWVkU2F2ZVN0YXRlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5mcm9tU2F2ZWRTdGF0ZSA9ICggZnJvbVNhdmVTdGF0ZSkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgdGhpcy50eXBlID0gcHJvcHMudHlwZTtcclxuICAgIHRoaXMuY29kZSA9ICcnO1xyXG4gICAgdGhpcy5jbGFzcyA9IHByb3BzLmNsYXNzO1xyXG4gICAgdGhpcy5vcmlnaW5hbFN0YWdlID0gcHJvcHMuc3RhZ2U7XHJcblxyXG4gICAgdGhpcy5ydW4oIHByb3BzLnR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8vICMgQ29kZVxyXG4gIHNldENvZGUoY29kZSkgeyB0aGlzLmNvZGUgPSBjb2RlOyB9XHJcbiAgZ2V0Q29kZSgpeyByZXR1cm4gdGhpcy5jb2RlOyB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG5cclxuICB1cGRhdGVYKHgpIHtcclxuICAgIHRoaXMuc2V0WCh4KTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCh4KTtcclxuICB9XHJcbiAgdXBkYXRlWSh5KSB7XHJcbiAgICB0aGlzLnNldFkoeSk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoeSk7XHJcbiAgfVxyXG4gICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICBzZXRDb2xsaXNpb25IZWlnaHQoaGVpZ2h0KSB7IHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0Q29sbGlzaW9uV2lkdGgod2lkdGgpIHsgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgLy8gISBNdXN0IGhhdmUgaW4gY2hpbGRzIENsYXNzXHJcbiAgfVxyXG5cclxuICBzZXRTdG9wT25Db2xsaXNpb24oYm9vbCl7XHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGJvb2w7XHJcbiAgfVxyXG5cclxuICAvLyAjIFZpc2liaWxpdHlcclxuICBoaWRlKCkgeyBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7IFxyXG4gICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBmYWxzZTtcclxuICB9XHJcbiAgc2hvdygpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuXHJcbiAgLy8gIyAgU3RhdGVcclxuICB3aWxsTmVlZFNhdmVTdGF0ZSgpIHsgIHJldHVybiB0aGlzLm5lZWRTYXZlU3RhdGU7IH1cclxuICBzZXROZWVkU2F2ZVN0YXRlKGJvb2wpeyB0aGlzLm5lZWRTYXZlU3RhdGUgPSBib29sOyB9XHJcblx0XHRcdFxyXG5cdC8vICMgR2V0c1xyXG4gIFxyXG4gIGdldE5hbWUoKSB7IHJldHVybiB0aGlzLm5hbWU7IH1cclxuXHJcbiAgZ2V0VHlwZSgpIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxyXG4gIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHJcbiAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25IZWlnaHQ7IH1cclxuICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuXHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gIGdldENvbGxpc2lvblkoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgZ2V0Q2VudGVyWCggX3ggKSB7IC8vIE1heSBnZXQgYSBjdXN0b20gY2VudGVyWCwgdXNlZCB0byBjaGVjayBhIGZ1dHVyZSBjb2xsaXNpb25cclxuICAgIGxldCB4ID0gKCBfeCApID8gX3ggOiB0aGlzLmdldENvbGxpc2lvblgoKTtcclxuICAgIHJldHVybiB4ICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMjsgXHJcbiAgfVxyXG4gIGdldENlbnRlclkoIF95ICkgeyBcclxuICAgIGxldCB5ID0gKCBfeSApID8gX3kgOiB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuICAgIHJldHVybiB5ICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDI7IFxyXG4gIH1cclxuXHJcbiAgLy8gSG9vayB0byBydW4gYmVmb3JlIHJlbmRlclxyXG4gIGJlZm9yZVJlbmRlcihjdHgpIHsgICB9XHJcblx0XHRcclxuXHQvLyAjIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgIFxyXG4gICAgdGhpcy5iZWZvcmVSZW5kZXIoY3R4KTtcclxuXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjtcclxuICAgICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgbGV0IHNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGVQcm9wcztcclxuICAgIFxyXG4gICAgaWYoIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpICkgeyAvLyBPbmx5IHJlbmRlciB0ZXh0dXJlIGlmIGl0IHdhcyBzZXQgYmVmb3JlXHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnNwcml0ZS5nZXRTcHJpdGUoKSwgIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLmNsaXBfeCwgc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICBzcHJpdGVQcm9wcy5zcHJpdGVfd2lkdGgsIHNwcml0ZVByb3BzLnNwcml0ZV9oZWlnaHQsIFxyXG4gICAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgICAgXHJcbiAgICAvL0RFQlVHIENodW5rIFNpemVcclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcblxyXG4gICAgICBsZXQgY29sbGlzaW9uX3Byb3BzID0ge1xyXG4gICAgICAgIHc6IHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpLFxyXG4gICAgICAgIHg6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnN0b3BPbkNvbGxpc2lvbiA/IFwicmdiYSgyNTUsMCwwLDAuMilcIiA6IFwicmdiYSgwLDI1NSwwLDAuMilcIjtcclxuICAgICAgY3R4LmZpbGxSZWN0KGNvbGxpc2lvbl9wcm9wcy54LCBjb2xsaXNpb25fcHJvcHMueSwgY29sbGlzaW9uX3Byb3BzLncsIGNvbGxpc2lvbl9wcm9wcy5oKTtcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMilcIjtcclxuICAgICAgY3R4LmxpbmVXaWR0aCAgID0gNTtcclxuICAgICAgY3R4LnN0cm9rZVJlY3QoY29sbGlzaW9uX3Byb3BzLngsIGNvbGxpc2lvbl9wcm9wcy55LCBjb2xsaXNpb25fcHJvcHMudywgY29sbGlzaW9uX3Byb3BzLmgpO1xyXG5cclxuICAgIH1cclxuICBcclxuICB9XHJcbiAgICBcclxuICAvLyBIYXMgYSBjb2xsaXNpb24gRXZlbnQ/XHJcbiAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgc3RvcElmQ29sbGlzaW9uKCkgeyByZXR1cm4gdGhpcy5zdG9wT25Db2xsaXNpb247IH1cclxuXHJcbiAgLy8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgY29sbGlzaW9uKG9iamVjdCl7IHJldHVybiB0cnVlOyB9XHJcblxyXG4gIC8vIE5vIENvbGxpc2lvbiBFdmVudFxyXG4gIG5vQ29sbGlzaW9uKG9iamVjdCl7IHJldHVybiB0cnVlOyB9XHJcblxyXG4gIC8vIFJ1bnMgd2hlbiBDbGFzcyBzdGFydHMgIFxyXG4gIHJ1biggdHlwZSApIHtcclxuICAgIHRoaXMuc2V0U3ByaXRlVHlwZSh0eXBlKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9Db2xsaWRhYmxlOyIsImNsYXNzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBzY2VuYXJpb19pZCl7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLndpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WCA9IDA7IFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFkgPSAwOyBcclxuXHJcbiAgICB0aGlzLnN0YWdlID0gbnVsbDtcclxuICAgIHRoaXMuc3RhZ2VJZCA9IFwiXCI7XHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5zY2VuYXJpb19pZCA9IHNjZW5hcmlvX2lkO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBBZGQgSXRlbXMgdG8gdGhlIHJlbmRlclxyXG4gIGFkZFN0YXRpY0l0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fdG9wKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AucHVzaChpdGVtKTtcclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbSA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG4gIC8vICMgUGxheWVyc1xyXG4gIGFkZFBsYXllcihwbGF5ZXIpIHtcclxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XHJcbiAgfVxyXG4gIGdldFBsYXllcnMoKSB7IHJldHVybiB0aGlzLnBsYXllcnM7IH1cclxuXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0Q3R4KCkgeyByZXR1cm4gdGhpcy5jdHg7IH1cclxuICBnZXRDYW52YXMoKSB7IHJldHVybiB0aGlzLmNhbnZhczsgfVx0XHJcblxyXG4gIGdldElkKCkgeyByZXR1cm4gdGhpcy5zY2VuYXJpb19pZDsgfVxyXG4gIGdldEFjdHVhbFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICAgICAgICAgICAgICBcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b207IH1cclxuICBnZXRMYXllckl0ZW1zX190b3AoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcDsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0QWN0dWFsU3RhZ2VJZChpZCl7IFxyXG4gICAgdGhpcy5zdGFnZUlkID0gaWQ7IFxyXG4gICAgd2luZG93LmdhbWUuc2V0Q3VycmVudFN0YWdlKCBpZCApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTYXZlIHRoZSBTdGF0ZSBvZiBpdGVtc1xyXG4gIHNhdmVJdGVtc1N0YXRlKCkge1xyXG4gICAgLy8gQm90dG9tIExheWVyXHJcbiAgICBsZXQgaXRlbXMgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uZ2V0Q29sSXRlbnMoKTtcclxuICAgIGZvciAobGV0IGkgaW4gaXRlbXMpIHtcclxuICAgICAgdGhpcy5oYW5kbGVJdGVtSWZOZWVkU2F2ZShpdGVtc1tpXSk7XHJcbiAgICB9XHJcbiAgICB3aW5kb3cuZ2FtZS5zYXZlSXRlbXNTdGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlSXRlbUlmTmVlZFNhdmUoaXRlbSkge1xyXG4gICAgaWYoIGl0ZW0ud2lsbE5lZWRTYXZlU3RhdGUoKSApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIEdyYWJiZWRcclxuICAgICAgbGV0IGdyYWJiZWQgPSBmYWxzZTtcclxuICAgICAgbGV0IGdyYWJQcm9wcyA9IHt9O1xyXG4gICAgICBpZiggaXRlbS5jYW5HcmFiICkge1xyXG4gICAgICAgIGdyYWJiZWQgPSBpdGVtLmlzR3JhYmJlZCgpO1xyXG4gICAgICAgIGlmKCBncmFiYmVkICkge1xyXG4gICAgICAgICAgZ3JhYlByb3BzID0ge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiBpdGVtLmNsYXNzLFxyXG4gICAgICAgICAgICAnY29kZSc6IGl0ZW0uY29kZSxcclxuICAgICAgICAgICAgJ3gwJzogaXRlbS54MCxcclxuICAgICAgICAgICAgJ3kwJzogaXRlbS55MCxcclxuICAgICAgICAgICAgJ25hbWUnOiBpdGVtLm9yaWdpbmFsTmFtZSxcclxuICAgICAgICAgICAgJ3N0YWdlJzogaXRlbS5vcmlnaW5hbFN0YWdlLFxyXG4gICAgICAgICAgICAncGxheWVyV2hvR3JhYmJlZCc6IGl0ZW0ucGxheWVyV2hvR3JhYmJlZFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgRHJvcHBlZFxyXG4gICAgICBsZXQgZHJvcHBlZCA9IGZhbHNlO1xyXG4gICAgICBsZXQgZHJvcFByb3BzID0ge307XHJcbiAgICAgIGlmKCBpdGVtLmNhbkdyYWIgKSB7XHJcbiAgICAgICAgZHJvcHBlZCA9IGl0ZW0uaXNEcm9wcGVkKCk7XHJcbiAgICAgICAgaWYoIGRyb3BwZWQgKSB7XHJcbiAgICAgICAgICBkcm9wUHJvcHMgPSB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6IGl0ZW0uY2xhc3MsXHJcbiAgICAgICAgICAgICdjb2RlJzogaXRlbS5jb2RlLFxyXG4gICAgICAgICAgICAneDAnOiBpdGVtLngwLFxyXG4gICAgICAgICAgICAneTAnOiBpdGVtLnkwLFxyXG4gICAgICAgICAgICAnZHJvcFgnOiBpdGVtLmRyb3BYLFxyXG4gICAgICAgICAgICAnZHJvcFknOiBpdGVtLmRyb3BZLFxyXG4gICAgICAgICAgICAnbmFtZSc6IGl0ZW0ub3JpZ2luYWxOYW1lLFxyXG4gICAgICAgICAgICAnc3RhZ2UnOiBpdGVtLm9yaWdpbmFsU3RhZ2UsXHJcbiAgICAgICAgICAgICdkcm9wcGVkU3RhZ2UnOiAoaXRlbS5kcm9wcGVkU3RhZ2UpID8gaXRlbS5kcm9wcGVkU3RhZ2UgOiB0aGlzLmdldEFjdHVhbFN0YWdlSWQoKSAvLyBJZiBkb24ndCBoYXZlIGRyb3BwZWQgc3RhZ2UsIG1lYW5zIHdlIHdhbnQgdGhlIGFjdHVhbCBzdGFnZS4gIElmIGhhcywga2VlcCBpdFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgd2luZG93LmdhbWUuYWRkSXRlbVN0YXRlKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICduYW1lX2lkJzogaXRlbS5nZXROYW1lKCksXHJcbiAgICAgICAgICAnY29sbGVjdGVkJzogaXRlbS5pc0NvbGxlY3RlZCgpLFxyXG4gICAgICAgICAgJ2dyYWJiZWQnOiBncmFiYmVkLFxyXG4gICAgICAgICAgJ2dyYWJQcm9wcyc6IGdyYWJQcm9wcyxcclxuICAgICAgICAgICdkcm9wcGVkJzogZHJvcHBlZCxcclxuICAgICAgICAgICdkcm9wUHJvcHMnOiBkcm9wUHJvcHNcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBGdW5jdGlvbnMgdG8gbG9hZCBzZWxlY3RlZCBzdGFnZVxyXG4gIGxvYWRTdGFnZShzdGFnZSwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YWdlID0gc3RhZ2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG4gICAgdGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzOyAvLyBQYXNzIHRoaXMgc2NlbmFyaW8gY2xhc3MgYXMgYW4gYXJndW1lbnQsIHNvIG90aGVyIGZ1bmN0aW9ucyBjYW4gcmVmZXIgdG8gdGhpc1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0oaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIEFuaW1hdGVkIEl0ZW1zIC0gQm90dG9tXHJcbiAgICB0aGlzLnN0YWdlLmdldExheWVySXRlbXNfX2JvdHRvbSgpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuc3RhZ2UuZ2V0TGF5ZXJJdGVtc19fdG9wKCkubWFwKCAoaXRlbSkgPT4geyBcclxuICAgICAgaXRlbS5zY2VuYXJpbyA9IHRoaXM7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDaGVjayBpZiBwbGF5ZXIgaGFzIHNvbWV0aGluZyBncmFiYmVkIGFuZCBpbmNsdWRlIGluIHJlbmRlclxyXG4gICAgbGV0IHNhdmVkSXRlbXNTdGF0ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSAhPSBcInt9XCIgKSB7XHJcbiAgICAgIHNhdmVkSXRlbXNTdGF0ZSA9IEpTT04ucGFyc2Uoc2F2ZWRJdGVtc1N0YXRlKTtcclxuICAgICAgZm9yKCBsZXQgaSBpbiBzYXZlZEl0ZW1zU3RhdGUgKSB7XHJcbiAgICAgICAgbGV0IGl0ZW0gPSBzYXZlZEl0ZW1zU3RhdGVbaV07XHJcbiAgICAgICAgLy8gSW5jbHVkZSBncmFiYmVkIGl0ZW1cclxuICAgICAgICBpZiggaXRlbS5ncmFiYmVkICkge1xyXG4gICAgICAgICAgbGV0IG9iaiA9IHdpbmRvdy5nYW1lLmdsb2JhbEFzc2V0cy5nZXRBc3NldCggaXRlbS5ncmFiUHJvcHMuY2xhc3MsIGl0ZW0uZ3JhYlByb3BzLCB0cnVlICk7IC8vIHRydWUgPSBjYW1lIGZyb20gc2F2ZSBzdGF0ZVxyXG4gICAgICAgICAgb2JqLmdyYWJIYW5kbGVyKCBpdGVtLmdyYWJQcm9wcy5wbGF5ZXJXaG9HcmFiYmVkICk7IC8vIHN0YXJ0IGEgc2V0dXAgb24gdGhlIG9iamVjdCwgc28gdGhlIHBsYXllciB3aWxsIGNoZWNrIHRoZSBzYXZlZCBzdGF0ZSBvZiBpdGVtXHJcbiAgICAgICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEluY2x1ZGUgZHJvcHBlZCBpdGVtXHJcbiAgICAgICAgaWYoIGl0ZW0uZHJvcHBlZCApIHtcclxuICAgICAgICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5nbG9iYWxBc3NldHMuZ2V0QXNzZXQoIGl0ZW0uZHJvcFByb3BzLmNsYXNzLCB7IGNvZGU6IGl0ZW0uZHJvcFByb3BzLmNvZGUsIHgwOiBpdGVtLmRyb3BQcm9wcy54MCwgeTA6IGl0ZW0uZHJvcFByb3BzLnkwLCBzdGFnZTogaXRlbS5kcm9wUHJvcHMuc3RhZ2UgfSwgdHJ1ZSApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiggdGhpcy5zdGFnZS5nZXRTdGFnZUlkKCkgIT0gaXRlbS5kcm9wUHJvcHMuZHJvcHBlZFN0YWdlICkge1xyXG4gICAgICAgICAgICBvYmouaGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG9iai5kcm9wcGVkU3RhZ2UgPSBpdGVtLmRyb3BQcm9wcy5kcm9wcGVkU3RhZ2U7XHJcbiAgICAgICAgICBvYmouZHJvcHBlZCA9IHRydWU7XHJcbiAgICAgICAgICBvYmoudXBkYXRlWCggaXRlbS5kcm9wUHJvcHMuZHJvcFggKTtcclxuICAgICAgICAgIG9iai51cGRhdGVZKCBpdGVtLmRyb3BQcm9wcy5kcm9wWSApO1xyXG4gICAgICAgICAgb2JqLmRyb3BYID0gaXRlbS5kcm9wUHJvcHMuZHJvcFg7XHJcbiAgICAgICAgICBvYmouZHJvcFkgPSBpdGVtLmRyb3BQcm9wcy5kcm9wWTtcclxuICAgICAgICAgIG9iai54MCA9IGl0ZW0uZHJvcFByb3BzLngwO1xyXG4gICAgICAgICAgb2JqLnkwID0gaXRlbS5kcm9wUHJvcHMueTA7XHJcblxyXG4gICAgICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShvYmopO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPbmx5IHNldCBwbGF5ZXIgc3RhcnQgYXQgZmlyc3QgbG9hZFxyXG4gICAgaWYoZmlyc3RTdGFnZSkge1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WCgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXIxU3RhcnRZKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMlN0YXJ0WSgpICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cuZ2FtZS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5jaGVja0dyYWJiaW5nT2JqZWN0cygpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TY2VuYXJpbzsiLCJjbGFzcyBfU3RhZ2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihzdGFnZUlkKSB7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIHRoaXMucGxheWVyMVN0YXJ0WCA9IDA7XHJcbiAgICB0aGlzLnBsYXllcjFTdGFydFkgPSAwO1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllcjJTdGFydFggPSAwO1xyXG4gICAgdGhpcy5wbGF5ZXIyU3RhcnRZID0gMDtcclxuXHJcbiAgICB0aGlzLnN0YWdlSWQgPSBzdGFnZUlkO1xyXG4gIH1cclxuICBcclxuICAvLyAjIEdldHNcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b207IH1cclxuICBnZXRMYXllckl0ZW1zX190b3AoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcDsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuXHJcbiAgZ2V0U3RhZ2VJZCgpIHsgcmV0dXJuIHRoaXMuc3RhZ2VJZDsgfVxyXG4gIFxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllcjFTdGFydFgoeCkgeyB0aGlzLnBsYXllcjFTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMVN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMVN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0UGxheWVyMlN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMlN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIyU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIyU3RhcnRZID0geTsgfVxyXG4gIFxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRTdGF0aWNJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbS5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX3RvcChpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJ1biAoKSB7IH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU3RhZ2U7IiwiLy8gQ2xhc3MgdGhhdCBkZXRlY3RzIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciBhbmQgb3RoZXIgb2JqZWN0c1xyXG5jbGFzcyBDb2xsaXNpb24ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihzY2VuYXJpb1dpZHRoLCBzY2VuYXJpb0hlaWdodCwgcGxheWVyKSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zID0gbmV3IEFycmF5KCk7IC8vIEl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuICAgIHRoaXMuc2NlbmFyaW9XaWR0aCA9IHNjZW5hcmlvV2lkdGg7XHJcbiAgICB0aGlzLnNjZW5hcmlvSGVpZ2h0ID0gc2NlbmFyaW9IZWlnaHQ7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICB9XHJcblxyXG4gIGdldENvbEl0ZW5zKCkgeyByZXR1cm4gdGhpcy5jb2xJdGVuczsgfVxyXG5cdFx0XHRcclxuICAvLyAjIENoZWNrIGlmIHRoZSBvYmplY3QgY29sbGlkZXMgd2l0aCBhbnkgb2JqZWN0IGluIHZlY3RvclxyXG4gIC8vIEFsZ29yaXRobSByZWZlcmVuY2U6IEd1c3Rhdm8gU2lsdmVpcmEgLSBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PXM3cWlXTEJCcEp3XHJcbiAgY2hlY2sob2JqZWN0KSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIxID0gb2JqZWN0O1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICB0aGlzLmNoZWNrQ29sbGlzaW9uKHIxLCByMik7XHJcbiAgICB9IFxyXG4gIH1cclxuXHJcbiAgLy8gQHIxOiB0aGUgbW92aW5nIG9iamVjdFxyXG4gIC8vIEByMjogdGhlIFwid2FsbFwiXHJcbiAgY2hlY2tDb2xsaXNpb24ocjEsIHIyKSB7XHJcblxyXG4gICAgLy8gRG9uJ3QgY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gc2FtZSBvYmplY3RcclxuICAgIGlmKCByMS5uYW1lID09IHIyLm5hbWUgKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgJiYgISByMi5zdG9wSWZDb2xsaXNpb24oKSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9yZXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIG9iamVjdHMgKG11c3QgYmUgcmVjdGFuZ2xlKVxyXG4gICAgdmFyIGNhdFggPSByMS5nZXRDZW50ZXJYKCkgLSByMi5nZXRDZW50ZXJYKCk7XHJcbiAgICB2YXIgY2F0WSA9IHIxLmdldENlbnRlclkoKSAtIHIyLmdldENlbnRlclkoKTtcclxuXHJcbiAgICB2YXIgc3VtSGFsZldpZHRoID0gKCByMS5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIHIxLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgb3ZlcmxhcFggPSBzdW1IYWxmV2lkdGggLSBNYXRoLmFicyhjYXRYKTtcclxuICAgICAgdmFyIG92ZXJsYXBZID0gc3VtSGFsZkhlaWdodCAtIE1hdGguYWJzKGNhdFkpO1xyXG5cclxuICAgICAgaWYoIHIyLnN0b3BJZkNvbGxpc2lvbigpICkge1xyXG4gICAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZICl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duXHJcbiAgICAgICAgICBpZihjYXRZID4gMCl7IC8vIFVwXHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblkoIHIxLmdldENvbGxpc2lvblkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRZKCByMS5nZXRZKCkgLSBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25ZKCByMS5nZXRDb2xsaXNpb25ZKCkgLSBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICAgIGlmKGNhdFggPiAwKXsgLy8gTGVmdFxyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25YKCByMS5nZXRDb2xsaXNpb25YKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WCggcjEuZ2V0WCgpIC0gb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWCggcjEuZ2V0Q29sbGlzaW9uWCgpIC0gb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKCB3aW5kb3cuZGVidWdDb2xsaXNpb24gKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBiZXR3ZWVuJywgcjEubmFtZSArIFwiKFwiICsgcjEuZ2V0WCgpICsgXCIvXCIgKyByMS5nZXRZKCkgKyBcIilcIiwgcjIubmFtZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyaWdnZXJzIENvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5jb2xsaXNpb24ocjIsIHIxKTtcclxuICAgICAgcjIuY29sbGlzaW9uKHIxLCByMik7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJpZ2dlcnMgbm90IGluIGNvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5ub0NvbGxpc2lvbihyMiwgcjIpOyBcclxuICAgICAgcjIubm9Db2xsaXNpb24ocjEsIHIyKTsgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gSnVzdCBjaGVjayBmb3IgYSBzcGVjaWZpYyBjb2xsaXNpb24gYW5kIHJldHVybiB0aGUgZmlydCBvYmplY3QgY29sbGlkZWRcclxuICBqdXN0Q2hlY2socjEsIF94LCBfeSwgX3csIF9oKSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgbGV0IHIgPSB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbihyMSwgcjIsIF94LCBfeSwgX3csIF9oKTtcclxuICAgICAgaWYoIHIgKSByZXR1cm4gcjsgLy8gaWYgaGFzIHNvbWV0aGluZywgcmV0dXJuIGFuZCBzdG9wIGxvb3BcclxuICAgIH0gXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb24ocjEsIHIyLCBfeCwgX3ksIF93LCBfaCkge1xyXG5cclxuICAgIC8vIERvbid0IGNoZWNrIGNvbGxpc2lvbiBiZXR3ZWVuIHNhbWUgb2JqZWN0XHJcbiAgICBpZiggcjEubmFtZSA9PSByMi5uYW1lICkgcmV0dXJuO1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9ICggX3ggKyBfdyAvIDIgKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gKCBfeSArIF9oIC8gMiApIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG4gXHJcbiAgICB2YXIgc3VtSGFsZldpZHRoID0gKCBfdyAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCBfaCAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICByZXR1cm4gcjI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7ICBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvLyBKdXN0IGNoZWNrIGZvciBhIHNwZWNpZmljIGNvbGxpc2lvbiBhbmQgcmV0dXJuIHRoZSBmaXJ0IG9iamVjdCBjb2xsaWRlZFxyXG4gIGp1c3RDaGVja0FsbChyMSwgX3gsIF95LCBfdywgX2gpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICBsZXQgciA9IHRoaXMuanVzdENoZWNrQ29sbGlzaW9uQWxsKHIxLCByMiwgX3gsIF95LCBfdywgX2gpO1xyXG4gICAgICBpZiggciApIHJldHVybiByOyAvLyBpZiBoYXMgc29tZXRoaW5nLCByZXR1cm4gYW5kIHN0b3AgbG9vcFxyXG4gICAgfSBcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbkFsbChyMSwgcjIsIF94LCBfeSwgX3csIF9oKSB7XHJcblxyXG4gICAgLy8gRG9uJ3QgY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gc2FtZSBvYmplY3RcclxuICAgIGlmKCByMS5uYW1lID09IHIyLm5hbWUgKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgJiYgISByMi5zdG9wSWZDb2xsaXNpb24oKSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9yZXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIG9iamVjdHMgKG11c3QgYmUgcmVjdGFuZ2xlKVxyXG4gICAgdmFyIGNhdFggPSAoIF94ICsgX3cgLyAyICkgLSByMi5nZXRDZW50ZXJYKCk7XHJcbiAgICB2YXIgY2F0WSA9ICggX3kgKyBfaCAvIDIgKSAtIHIyLmdldENlbnRlclkoKTtcclxuIFxyXG4gICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggX3cgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggX2ggLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgXHJcbiAgICAgIC8vY2FsY3VsYXRlIG92ZXJsYXAgaWYgbmVlZCB0byBzdG9wIG9iamVjdFxyXG4gICAgICBsZXQgb3ZlcmxhcFggPSBzdW1IYWxmV2lkdGggLSBNYXRoLmFicyhjYXRYKTtcclxuICAgICAgbGV0IG92ZXJsYXBZID0gc3VtSGFsZkhlaWdodCAtIE1hdGguYWJzKGNhdFkpO1xyXG5cclxuICAgICAgaWYob3ZlcmxhcFggPj0gb3ZlcmxhcFkgKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICBpZihjYXRZID4gMCl7IC8vIFVwXHJcbiAgICAgICAgICByMi5vdmVybGFwWSA9IHIxLmdldFkoKSArIG92ZXJsYXBZO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByMi5vdmVybGFwWSA9IHIxLmdldFkoKSAtIG92ZXJsYXBZO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgIGlmKGNhdFggPiAwKXsgLy8gTGVmdFxyXG4gICAgICAgICAgcjIub3ZlcmxhcFggPSByMS5nZXRYKCkgKyBvdmVybGFwWDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcjIub3ZlcmxhcFggPSByMS5nZXRYKCkgLSBvdmVybGFwWDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgIFxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgXHRcdFxyXG5cdC8vIEFkZCBpdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcblx0YWRkSXRlbShvYmplY3QpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMucHVzaChvYmplY3QpO1xyXG4gIH07XHJcbiAgXHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcblx0XHRmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMuY29sSXRlbnMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBjbGVhckFycmF5SXRlbXMoKSB7XHJcbiAgICB0aGlzLmNvbEl0ZW5zID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG5cclxufS8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxpc2lvbjtcclxuXHQiLCJjb25zdCBnYW1lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uLy4uL2dhbWVQcm9wZXJ0aWVzJyk7XHJcbmNvbnN0IHNjZW5hcmlvUHJvdG90eXBlID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zY2VuYXJpb1Byb3RvdHlwZScpO1xyXG5jb25zdCBzY2VuYXJpb1NhbmRib3ggPSByZXF1aXJlKCcuLi8uLi9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3gnKTtcclxuY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi4vLi4vYXNzZXRzL1BsYXllcicpO1xyXG5jb25zdCBDb2xsaXNpb24gPSByZXF1aXJlKCcuL0NvbGxpc2lvbicpO1xyXG5jb25zdCBSZW5kZXIgPSByZXF1aXJlKCcuL1JlbmRlcicpO1xyXG5jb25zdCBVSSA9IHJlcXVpcmUoJy4uL3VpL1VJJyk7XHJcbmNvbnN0IEdsb2JhbEFzc2V0cyA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9HbG9iYWxBc3NldHMnKTtcclxuXHJcbmNsYXNzIEdhbWUge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBGUFMgQ29udHJvbFxyXG4gICAgdGhpcy5mcHNJbnRlcnZhbCA9IG51bGw7IFxyXG4gICAgdGhpcy5ub3cgPSBudWxsO1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBudWxsOyBcclxuICAgIHRoaXMuZWxhcHNlZCA9IG51bGw7XHJcblxyXG4gICAgLy8gRXZlbnRzXHJcbiAgICB0aGlzLmtleXNEb3duID0ge307XHJcbiAgICB0aGlzLmtleXNQcmVzcyA9IHt9O1xyXG5cclxuICAgIC8vIFBhdXNlXHJcbiAgICB0aGlzLl9wYXVzZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lSXNMb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBJdGVtc1xyXG4gICAgdGhpcy5pdGVtc1N0YXRlID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICAgIC8vIEdhbWVcclxuICAgICAgdGhpcy5nYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uID0gbnVsbDtcclxuICAgICAgdGhpcy5kZWZhdWx0U2NlbmFyaW8gPSAnc2FuZGJveCc7XHJcbiAgICAgIHRoaXMuc2NlbmFyaW8gPSBudWxsO1xyXG4gICAgICB0aGlzLlVJID0gbnVsbDtcclxuICAgICAgdGhpcy5jdXJyZW50U3RhZ2VOYW1lID0gJyc7XHJcblxyXG4gICAgICB0aGlzLmdhbWVSZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUmVuZGVyc1xyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG51bGw7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbnVsbDtcclxuICAgICAgdGhpcy5yZW5kZXJVSSAgICAgPSBudWxsO1xyXG5cclxuICAgICAgdGhpcy5nbG9iYWxBc3NldHMgPSBuZXcgR2xvYmFsQXNzZXRzKCB0aGlzLmdhbWVQcm9wcy5jaHVua1NpemUgKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyBHZXRzXHJcbiAgaXNHYW1lUmVhZHkoKSB7IHJldHVybiB0aGlzLmdhbWVSZWFkeTsgfVxyXG4gIGdldENodW5rU2l6ZSgpIHsgcmV0dXJuIHRoaXMuZ2FtZVByb3BzLmNodW5rU2l6ZTsgfVxyXG5cclxuICBnZXRDYW52YXNXaWR0aCgpICB7IHJldHVybiB0aGlzLmdhbWVQcm9wcy5jYW52YXNXaWR0aDsgIH1cclxuICBnZXRDYW52YXNIZWlnaHQoKSB7IHJldHVybiB0aGlzLmdhbWVQcm9wcy5jYW52YXNIZWlnaHQ7IH1cclxuXHJcbiAgLy8gU2V0c1xyXG4gIHNldEdhbWVSZWFkeShib29sKSB7IHRoaXMuZ2FtZVJlYWR5ID0gYm9vbDsgfVxyXG5cclxuICBzZXRDdXJyZW50U3RhZ2Uoc3RhZ2UpeyB0aGlzLmN1cnJlbnRTdGFnZU5hbWUgPSBzdGFnZTsgfVxyXG4gIGdldEN1cnJlbnRTdGFnZSgpIHsgcmV0dXJuIHRoaXMuY3VycmVudFN0YWdlTmFtZTsgfVxyXG4gIFxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBEZWZhdWx0IEV2ZW50IExpc3RlbmVyc1xyXG4gIGRlZmF1bHRFdmVudExpc3RlbmVycygpIHtcclxuXHJcbiAgICAvLyBNZW51IENsaWNrc1xyXG4gICAgbGV0IG1lbnVJdGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWVudS1pdGVtJyk7XHJcbiAgICBcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVudUl0ZW0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IF90aGlzID0gdGhpcztcclxuICAgICAgbWVudUl0ZW1baV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5tZW51QWN0aW9uKCB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtYWN0aW9uXCIpICk7XHJcbiAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIEtleWJvYXJkIEV2ZW50c1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHRoaXMua2V5c0Rvd25bZS5rZXlDb2RlXSA9IHRydWU7XHJcbiAgICB9LmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDbGVhciBwcmV2aW91cyBrZXlzXHJcbiAgICAgIGRlbGV0ZSB0aGlzLmtleXNEb3duW2Uua2V5Q29kZV07XHJcbiAgICAgIFxyXG4gICAgICAvLyBSZXNldCBwbGF5ZXJzIGxvb2sgZGlyZWN0aW9uXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBwbGF5ZXIucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFBhdXNlIEV2ZW50IExpc3RlbmVyXHJcbiAgICAgIGlmKCBlLmtleUNvZGUgPT0gMjcgJiYgdGhpcy5nYW1lSXNMb2FkZWQgKSB7IC8vIEVTUVxyXG4gICAgICAgIHRoaXMudG9nZ2xlUGF1c2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUGxheWVyIGhhbmRsZSBrZXl1cFxyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLmhhbmRsZUtleVVwKGUua2V5Q29kZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgU3RhcnQvUmVzdGFydCBhIEdhbWVcclxuXHJcbiAgcmVmcmVzaFZhcmlhYmxlcygpIHtcclxuXHJcbiAgICAvLyBDbGVhciBzYXZlIHN0YXRlXHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJyk7XHJcblxyXG4gICAgLy8gUmVuZGVyc1xyXG4gICAgdGhpcy5pdGVtc1N0YXRlID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICB9XHJcblxyXG4gIHN0YXJ0TmV3R2FtZSggc2F2ZURhdGEgKSB7XHJcblxyXG4gICAgdGhpcy5yZWZyZXNoVmFyaWFibGVzKCk7XHJcbiAgICBcclxuICAgIC8vICMgSW5pdFxyXG4gICAgICBcclxuICAgICAgbGV0IGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcbiAgICAgIGxldCBjb250ZXh0U3RhdGljID0gY2FudmFzU3RhdGljLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBsZXQgY2FudmFzTGF5ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19sYXllcnMnKTtcclxuICAgICAgbGV0IGNvbnRleHRMYXllcnMgPSBjYW52YXNMYXllcnMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgXHJcbiAgICAgIGxldCBjYW52YXNVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfdWknKTtcclxuICAgICAgbGV0IGNvbnRleHRVSSA9IGNhbnZhc1VJLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjYW52YXNMYXllcnMud2lkdGggPSBjYW52YXNTdGF0aWMud2lkdGggPSBjYW52YXNVSS53aWR0aCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICAgIGNhbnZhc0xheWVycy5oZWlnaHQgPSBjYW52YXNTdGF0aWMuaGVpZ2h0ID0gY2FudmFzVUkuaGVpZ2h0ID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzSGVpZ2h0Jyk7XHJcblxyXG4gICAgLy8gIyBTY2VuYXJpb1xyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggdGhpcy5kZWZhdWx0U2NlbmFyaW8sIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmFyaW8gPSB0aGlzLmdldFNjZW5hcmlvKCBzYXZlRGF0YS5zY2VuYXJpby5zY2VuYXJpb0lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllciggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIxU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WSgpLCB0aGlzLmdhbWVQcm9wcywgMSApOyBcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm11bHRpcGxheWVyICkge1xyXG4gICAgICAgICAgbGV0IHBsYXllcjIgPSBuZXcgUGxheWVyKCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjJTdGFydFgoKSwgdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIyU3RhcnRZKCksIHRoaXMuZ2FtZVByb3BzLCAyICk7IFxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNjZW5hcmlvLmFkZFBsYXllcihwbGF5ZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG5cclxuICAgICAgICAgIGxldCBfcGxheWVyID0gbmV3IFBsYXllciggcGxheWVyLngsIHBsYXllci55LCB0aGlzLmdhbWVQcm9wcywgcGxheWVyLnBsYXllck51bWJlciwgcGxheWVyICk7IFxyXG5cclxuICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKCBfcGxheWVyKTtcclxuICAgICAgICAgIHRoaXMuc2NlbmFyaW8uYWRkUGxheWVyKF9wbGF5ZXIpO1xyXG5cclxuICAgICAgICB9KTsgIFxyXG5cclxuICAgICAgfVxyXG4gICAgLy8gIyBVSVxyXG4gICAgICBcclxuICAgICAgdGhpcy5VSSA9IG5ldyBVSSggdGhpcy5wbGF5ZXJzLCB0aGlzLmdhbWVQcm9wcyk7XHJcblxyXG4gICAgLy8gIyBDb2xsaXNpb24gZGV0ZWN0aW9uIGNsYXNzXHJcblxyXG4gICAgICB0aGlzLmNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oIGNhbnZhc0xheWVycy53aWR0aCwgY2FudmFzTGF5ZXJzLmhlaWdodCApO1xyXG5cclxuICAgIC8vICMgUmVuZGVyXHJcblxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG5ldyBSZW5kZXIoY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljKTsgLy8gUmVuZGVyIGV4ZWN1dGVkIG9ubHkgb25jZVxyXG4gICAgICB0aGlzLnJlbmRlckxheWVycyA9IG5ldyBSZW5kZXIoY29udGV4dExheWVycywgY2FudmFzTGF5ZXJzKTsgLy8gUmVuZGVyIHdpdGggYW5pbWF0ZWQgb2JqZWN0cyBvbmx5XHJcbiAgICAgIHRoaXMucmVuZGVyVUkgICAgID0gbmV3IFJlbmRlcihjb250ZXh0VUksIGNhbnZhc1VJKTsgXHJcblxyXG4gICAgICAvLyBBZGQgaXRlbXMgdG8gYmUgcmVuZGVyZWRcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc2V0U2NlbmFyaW8odGhpcy5zY2VuYXJpbyk7IC8vIHNldCB0aGUgc2NlbmFyaW9cclxuICAgIFxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5NZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAvLyBTaG93IENhbnZhc1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUNhbnZhcycpLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnYW1lIGlzIG5vdCBwYXVzZWRcclxuICAgICAgdGhpcy51bnBhdXNlKCk7XHJcbiAgICBcclxuICAgIC8vIEZsYWcgXHJcbiAgICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgLy8gT2ssIHJ1biB0aGUgZ2FtZSBub3dcclxuICAgICAgdGhpcy5zZXRHYW1lUmVhZHkodHJ1ZSk7XHJcbiAgICAgIHRoaXMucnVuR2FtZSggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnZnBzJykgKTtcdC8vIEdPIEdPIEdPXHJcblxyXG4gIH0vL25ld0dhbWVcclxuXHJcbiAgICAvLyAjIFRoZSBHYW1lIExvb3BcclxuICAgIHVwZGF0ZUdhbWUoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc1BhdXNlZCgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgdGhpcy5yZW5kZXJVSS5zdGFydCggZGVsdGFUaW1lICk7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLnN0YXJ0KCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIC8vICMgQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSApO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgICAgIC8qdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmFkZEFycmF5SXRlbShwbGF5ZXIpO1xyXG4gICAgICB9KTsqL1xyXG4gIFxyXG4gICAgICAvLyBcIlN0YXRpY1wiIFJlbmRlciAtIEJhY2tncm91bmRcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLmFkZEFycmF5SXRlbSh0aGlzLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCkpOyAvLyBHZXQgYWxsIGl0ZW1zIGZyb20gdGhlIHNjZW5hcmlvIHRoYXQgbmVlZHMgdG8gYmUgcmVuZGVyZWRcclxuXHJcbiAgICAgIC8vIExheWVycyBSZW5kZXJcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5jbGVhckFycmF5SXRlbXMoKTtcclxuXHJcbiAgICAgICAgLy8gIyBCb3R0b20gXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX2JvdHRvbSgpICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gIyBNaWRkbGVcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRJdGVtKCBwbGF5ZXIgKTsgLy8gQWRkcyB0aGUgcGxheWVyIHRvIHRoZSBhbmltYXRpb24gcmVuZGVyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vICMgVG9wXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIFVJIFJlbmRlclxyXG4gICAgICB0aGlzLnJlbmRlclVJLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLnJlbmRlclVJLmFkZEFycmF5SXRlbSggdGhpcy5VSS5nZXROZXdSZW5kZXJJdGVtcygpKTtcclxuICAgICAgXHJcbiAgICAgIC8vICMgTW92ZW1lbnRzXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuaGFuZGxlTW92ZW1lbnQoIHRoaXMua2V5c0Rvd24gKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyAjIENoZWNrIGlmIHBsYXllciBpcyBjb2xsaWRpbmdcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmNoZWNrKHBsYXllcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgXCJUaHJlYWRcIiB0aGEgcnVucyB0aGUgZ2FtZVxyXG4gICAgcnVuR2FtZShmcHMpIHtcclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgdGhpcy5nYW1lTG9vcCgpO1xyXG4gICAgfVxyXG4gICAgZ2FtZUxvb3AoKSB7XHJcblxyXG4gICAgICAvLyBjYWxjIGVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgdGhpcy5ub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aGlzLmVsYXBzZWQgPSB0aGlzLm5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG5cclxuICAgICAgLy8gaWYgZW5vdWdoIHRpbWUgaGFzIGVsYXBzZWQsIGRyYXcgdGhlIG5leHQgZnJhbWVcclxuICAgICAgaWYgKCB0aGlzLmVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIEdldCByZWFkeSBmb3IgbmV4dCBmcmFtZSBieSBzZXR0aW5nIHRoZW49bm93LCBidXQgYWxzbyBhZGp1c3QgZm9yIHlvdXJcclxuICAgICAgICAvLyBzcGVjaWZpZWQgZnBzSW50ZXJ2YWwgbm90IGJlaW5nIGEgbXVsdGlwbGUgb2YgUkFGJ3MgaW50ZXJ2YWwgKDE2LjdtcylcclxuICAgICAgICB0aGlzLmRlbHRhVGltZSA9IHRoaXMubm93IC0gKHRoaXMuZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUdhbWUoIHRoaXMuZGVsdGFUaW1lICk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSdW5zIG9ubHkgd2hlbiB0aGUgYnJvd3NlciBpcyBpbiBmb2N1c1xyXG4gICAgICAvLyBSZXF1ZXN0IGFub3RoZXIgZnJhbWVcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U2NlbmFyaW8oIHNjZW5hcmlvX2lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICkge1xyXG4gICAgICBzd2l0Y2goc2NlbmFyaW9faWQpIHtcclxuICAgICAgICBjYXNlIFwicHJvdG90eXBlXCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzYW5kYm94XCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvU2FuZGJveChjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBNZW51XHJcbiAgXHJcbiAgLy8gQHBhdXNlZCBkZXRlcm1pbmUgaWYgdGhlIGdhbWUgY2FtZSBmcm9tIGEgcGF1c2UgYWN0aW9uIG9yIGEgbmV3IGdhbWUgKHdoZW4gcGFnZSBsb2FkcylcclxuICBtYWluTWVudShwYXVzZWQpIHsgXHJcbiAgICBcclxuICAgIGxldCBkaXZNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51Jyk7XHJcblxyXG4gICAgLy8gU2V0IG1haW5NZW51IGNsYXNzXHJcbiAgICAoIHBhdXNlZCApID8gZGl2TWVudS5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKSA6IGRpdk1lbnUuY2xhc3NMaXN0LmFkZCgnbmV3LWdhbWUnKTtcclxuICAgIFxyXG4gICAgLy8gVG9nZ2xlIE1lbnVcclxuICAgIGRpdk1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgLy8gSGFuZGxlIE1lbnUgQWN0aW9uXHJcbiAgICBtZW51QWN0aW9uKGFjdGlvbikge1xyXG4gICAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnY29udGludWUnOlxyXG4gICAgICAgICAgdGhpcy5jb250aW51ZUdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgdGhpcy5zYXZlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbG9hZCc6XHJcbiAgICAgICAgICB0aGlzLmxvYWRHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICduZXcnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5uZXdHYW1lKGZhbHNlKTsvLyBmYWxzZSA9IHdvbid0IGxvYWQgc2F2ZURhdGFcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldy0yLXBsYXllcnMnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gIFxyXG4gIC8vICMgTmV3IEdhbWVcclxuICBuZXdHYW1lKHNhdmVEYXRhKSB7XHJcbiAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB0aGlzLmxvYWRpbmcodHJ1ZSk7XHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhcnROZXdHYW1lKHNhdmVEYXRhKTsgXHJcbiAgICB9LCAxMDAwICk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgQ29udGludWVcclxuICBjb250aW51ZUdhbWUoKSB7XHJcbiAgICB0aGlzLnVucGF1c2UoKTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTYXZlXHJcbiAgc2F2ZUdhbWUoKSB7XHJcbiAgICBpZiggY29uZmlybSgnU2FsdmFyIG8gam9nbyBhdHVhbCBpcsOhIHNvYnJlZXNjcmV2ZXIgcXVhbHF1ZXIgam9nbyBzYWx2byBhbnRlcmlvcm1lbnRlLiBEZXNlamEgY29udGludWFyPycpICkge1xyXG4gICAgICBcclxuICAgICAgbGV0IHNhdmVEYXRhID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICAgICAgLy8gTXVsdGlwbGF5ZXJcclxuICAgICAgc2F2ZURhdGEubXVsdGlwbGF5ZXIgPSB0aGlzLm11bHRpcGxheWVyO1xyXG5cclxuICAgICAgLy8gU2NlbmFyaW9cclxuICAgICAgc2F2ZURhdGEuc2NlbmFyaW8gPSB7XHJcbiAgICAgICAgc2NlbmFyaW9JZDogdGhpcy5zY2VuYXJpby5nZXRJZCgpLFxyXG4gICAgICAgIHN0YWdlSWQ6IHRoaXMuc2NlbmFyaW8uZ2V0QWN0dWFsU3RhZ2VJZCgpLFxyXG4gICAgICAgIGl0ZW1zOiB0aGlzLmdldEl0ZW1zU3RhdGUoKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQbGF5ZXJzXHJcbiAgICAgIHNhdmVEYXRhLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHNhdmVEYXRhLnBsYXllcnMucHVzaCh7XHJcbiAgICAgICAgICBwbGF5ZXJOdW1iZXI6IHBsYXllci5nZXRQbGF5ZXJOdW1iZXIoKSxcclxuICAgICAgICAgIHg6IHBsYXllci5nZXRYKCksXHJcbiAgICAgICAgICB5OiBwbGF5ZXIuZ2V0WSgpLFxyXG4gICAgICAgICAgbGlmZXM6IHBsYXllci5nZXRMaWZlcygpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ29udmVydCB0byBKU09OXHJcbiAgICAgIHNhdmVEYXRhID0gSlNPTi5zdHJpbmdpZnkoc2F2ZURhdGEpO1xyXG4gICAgICBcclxuICAgICAgLy8gU2F2ZSBvbiBMb2NhbFN0b3JhZ2VcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX3NhdmUnLCBzYXZlRGF0YSApO1xyXG5cclxuICAgICAgYWxlcnQoJ0pvZ28gc2Fsdm8hJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgU2F2ZVxyXG4gIGxvYWRHYW1lKCkge1xyXG4gICAgXHJcbiAgICAvLyAjIEdldCBkYXRhIGZyb20gbG9jYWxzdG9yYWdlIGFuZCBjb252ZXJ0cyB0byBqc29uXHJcbiAgICBsZXQgc2F2ZURhdGEgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19zYXZlJykgKTtcclxuXHJcbiAgICBpZiggc2F2ZURhdGEgKSB7XHJcbiAgICAgIC8vIFdpbGwgYmUgIG11bHRpcGxheWVyIGdhbWU/XHJcbiAgICAgIHRoaXMubXVsdGlwbGF5ZXIgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5tdWx0aXBsYXllciA6IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUmVwbGFjZSBpdGVtcyBzdGF0ZSBvbiBsb2NhbCBzdG9yYWdlIHdpdGggc2F2ZWQgc3RhdGVzXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19pdGVtc1N0YXRlJywgSlNPTi5zdHJpbmdpZnkoIHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zICkgKTtcclxuXHJcbiAgICAgIC8vIExvYWQgSXRlbXMgaXRlbnNcclxuICAgICAgZm9yKCBsZXQgaSBpbiBzYXZlRGF0YS5zY2VuYXJpby5pdGVtcyApIHtcclxuICAgICAgICB0aGlzLmFkZEl0ZW1TdGF0ZSggc2F2ZURhdGEuc2NlbmFyaW8uaXRlbXNbaV0gKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vICMgTG9hZHMgYSBuZXcgZ2FtZSB3aXRoIHNhdmUgZGF0YVxyXG4gICAgICB0aGlzLm5ld0dhbWUoc2F2ZURhdGEpOyBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdOw6NvIGjDoSBqb2dvIHNhbHZvIHByZXZpYW1lbnRlLicpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgUGF1c2VcclxuICBpc1BhdXNlZCgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlOyB9XHJcbiAgcGF1c2UoKSB7IFxyXG4gICAgdGhpcy5fcGF1c2UgPSB0cnVlOyBcclxuICAgIHRoaXMubWFpbk1lbnUodHJ1ZSk7XHJcbiAgfVxyXG4gIHVucGF1c2UoKSB7IFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5fcGF1c2UgPSBmYWxzZTsgIFxyXG4gIH1cclxuICB0b2dnbGVQYXVzZSgpIHsgKCB0aGlzLmlzUGF1c2VkKCkgKSA/IHRoaXMudW5wYXVzZSgpIDogdGhpcy5wYXVzZSgpIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGxvYWRpbmcoYm9vbCkge1xyXG4gICAgbGV0IGRpc3BsYXkgPSAoIGJvb2wgKSA/ICdmbGV4JyA6ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8qXHJcbiAgICBJdGVtcyBTdGF0ZVxyXG4gICAgLSBUaGlzIGFyZSBmdW5jdGlvbnMgdGhhdCBoYW5kbGVzIGl0ZW1zIHN0YXRlcyBiZXR3ZWVuIGNoYW5naW5nIG9mIHN0YWdlcy4gVGhpcyB3aWxsIG1ha2UgYW4gaXRlbSB0byBub3QgcmVzcGF3biBpZiBpdCB3YXMgY29sbGVjdGVkIGJlZm9yZVxyXG4gICovXHJcbiAgXHJcbiAgICBnZXRJdGVtc1N0YXRlKCkgeyByZXR1cm4gdGhpcy5pdGVtc1N0YXRlOyB9XHJcbiAgICBhZGRJdGVtU3RhdGUoIGl0ZW0gKSB7IFxyXG4gICAgICB0aGlzLml0ZW1zU3RhdGVbaXRlbS5uYW1lX2lkXSA9IGl0ZW07ICBcclxuICAgIH1cclxuXHJcbiAgICBzYXZlSXRlbXNTdGF0ZSgpIHtcclxuICAgICAgbGV0IGl0ZW1zU3RhdGUgPSBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXRJdGVtc1N0YXRlKCkgKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBpdGVtc1N0YXRlICk7XHJcbiAgICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuICBcclxuICAvLyBIZWxwZXJzIGZvciBjbGFzc2VzIHRvIGNoZWNrIGlmIGFuIG9iamVjdCBpcyBjb2xsaWRpbmcgXHJcbiAgY2hlY2tDb2xsaXNpb24oIG9iamVjdCApIHtcclxuICAgIGlmKCB0aGlzLmlzR2FtZVJlYWR5KCkgKVxyXG4gICAgICByZXR1cm4gdGhpcy5jb2xsaXNpb24uY2hlY2sob2JqZWN0KTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBSdW5cclxuICBydW4oKSB7XHJcblxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDYW52YXMnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICB0aGlzLmxvYWRpbmcoZmFsc2UpO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBldmVudCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuZGVmYXVsdEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICBcclxuICAgIC8vIFNob3dzIE1lbnVcclxuICAgIHRoaXMubWFpbk1lbnUoZmFsc2UpO1xyXG5cclxuICAgIC8vIEF1dG8gbG9hZCBhIGdhbWUgLSBkZWJ1ZyBtb2RlXHJcbiAgICBpZiggd2luZG93LmF1dG9sb2FkICkge1xyXG4gICAgICB0aGlzLmxvYWRHYW1lKCk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lOyIsImNsYXNzIFJlbmRlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBwbGF5ZXIpIHtcclxuICAgIHRoaXMuY3R4ID0gY3R4OyBcclxuICAgIHRoaXMuc2NlbmFyaW8gPSBcIlwiO1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIFxyXG4gIGdldEFycmF5SXRlbXMoKXsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBcclxuICAvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG4gIGFkZEl0ZW0ob2JqZWN0KXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG4gIH1cclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuICAgIGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpeyBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIHNldFNjZW5hcmlvKHNjZW5hcmlvKXtcclxuICAgIHRoaXMuc2NlbmFyaW8gPSBzY2VuYXJpbztcclxuICB9XHJcbiAgICAgICAgICAgIFxyXG4gIC8vIFRoaXMgZnVuY3Rpb25zIHdpbGwgYmUgY2FsbGVkIGNvbnN0YW50bHkgdG8gcmVuZGVyIGl0ZW1zXHJcbiAgc3RhcnQoZGVsdGFUaW1lKSB7XHRcdFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAvLyBDbGVhciBjYW52YXMgYmVmb3JlIHJlbmRlciBhZ2FpblxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgdGhpcy5jdHguc2hhZG93Qmx1ciA9IDA7XHJcblxyXG4gICAgLy8gU2NlbmFyaW9cclxuICAgIGlmICggdGhpcy5zY2VuYXJpbyAhPSBcIlwiKSBcclxuICAgICAgdGhpcy5zY2VuYXJpby5yZW5kZXIodGhpcy5jdHgpO1xyXG4gICAgICBcclxuICAgIC8vIFJlbmRlciBpdGVtc1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLnJlbmRlckl0ZW1zKSB7XHJcbiAgICAgIC8vIEV4ZWN1dGUgdGhlIHJlbmRlciBmdW5jdGlvbiAtIEluY2x1ZGUgdGhpcyBmdW5jdGlvbiBvbiBldmVyeSBjbGFzc1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zW2ldLnJlbmRlcih0aGlzLmN0eCwgZGVsdGFUaW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuICAgIFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlciIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3ByaXRlLCB3LCBoLCBrVywga0gpIHtcclxuXHJcbiAgICAgICAgLy8gVGhlIEltYWdlIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG5cclxuICAgICAgICAvLyBTaXplIG9mIGltYWdlIHNwcml0ZSBcclxuICAgICAgICB0aGlzLndpZHRoID0gdztcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XHJcblxyXG4gICAgICAgIC8vIFNpemUgb2YgZWFjaCBmcmFtZSBzcXVhcmUgXHJcbiAgICAgICAgdGhpcy5rZXlXaWR0aCA9IGtXO1xyXG4gICAgICAgIHRoaXMua2V5SGVpZ2h0ID0ga0g7XHJcblxyXG4gICAgICAgIC8vIFJvd3MgYW5kIENvbGx1bW5zIHF1YW50aXR5XHJcbiAgICAgICAgdGhpcy5jb2xzID0gTWF0aC5jZWlsKCB0aGlzLndpZHRoIC8gdGhpcy5rZXlXaWR0aCApO1xyXG4gICAgICAgIHRoaXMucm93cyA9IE1hdGguY2VpbCggdGhpcy5oZWlnaHQgLyB0aGlzLmtleUhlaWdodCApO1xyXG5cclxuICAgICAgICAvLyBUaGUgZnJhbWVzXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMucnVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBHZXRzXHJcbiAgICBnZXRTcHJpdGUoKSAgICB7IHJldHVybiB0aGlzLnNwcml0ZTsgfVxyXG4gICAgZ2V0RnJhbWUobnVtKSAgeyByZXR1cm4gdGhpcy5mcmFtZXNbbnVtXTsgfVxyXG4gICAgZ2V0S2V5V2lkdGgoKSAgeyByZXR1cm4gdGhpcy5rZXlXaWR0aDsgICAgfVxyXG4gICAgZ2V0S2V5SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5rZXlIZWlnaHQ7ICAgfVxyXG4gICAgZ2V0U3ByaXRlUHJvcHMobnVtKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2xpcF94OiB0aGlzLmdldEZyYW1lKG51bSkueCwgY2xpcF95OiB0aGlzLmdldEZyYW1lKG51bSkueSwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5nZXRLZXlXaWR0aCgpLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLmdldEtleUhlaWdodCgpIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyAjIFJ1blxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIC8vIEdlbiBlYWNoIGZyYW1lIGJhc2VkIG9uIHNpemVzIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgZm9yKCBsZXQgcj0wOyByPHRoaXMucm93cztyKysgKSB7XHJcbiAgICAgICAgICAgIGZvciggbGV0IGM9MDsgYzx0aGlzLmNvbHM7YysrICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXNbaW5kZXhdID0geyBcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmtleVdpZHRoICogYyxcclxuICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLmtleUhlaWdodCAqIHJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlOyIsImNvbnN0IFVJaXRlbSA9IHJlcXVpcmUoJy4vX1VJaXRlbScpO1xyXG5jb25zdCBVSWl0ZW1fdGV4dCA9IHJlcXVpcmUoJy4vX1VJaXRlbV90ZXh0Jyk7XHJcblxyXG5jbGFzcyBVSSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBsYXllcnMsIGdhbWVQcm9wcykge1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllcnMgPSBwbGF5ZXJzO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICAgIHRoaXMuZ2FtZVByb3BzID0gZ2FtZVByb3BzO1xyXG4gICAgdGhpcy5jaHVua1NpemUgPSB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG4gICAgICAgICAgICAgIFxyXG4gIC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcbiAgYWRkSXRlbShvYmplY3Qpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcbiAgfVxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7IFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgZ2V0UmVuZGVySXRlbXMoKXtcclxuICAgIHJldHVybiB0aGlzLnJlbmRlckl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgYXJyYXkgYW5kIHJlcnVuIGNvZGUgdG8gZ2V0IG5ldyBpdGVtc1xyXG4gIGdldE5ld1JlbmRlckl0ZW1zKCkge1xyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRSZW5kZXJJdGVtcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gTWF0aFxyXG4gIGZyb21SaWdodCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuICggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuSG9yaXpvbnRhbENodW5rcycpICogdGhpcy5jaHVua1NpemUgKSAtIHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcnVuKCkge1xyXG5cclxuICAgIC8vICMgUGxheWVyc1xyXG5cclxuICAgICAgLy8gIyBQbGF5ZXIgMDFcclxuICAgICAgICBpZiggdGhpcy5wbGF5ZXJzWzBdICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5jaHVua1NpemUsXHJcbiAgICAgICAgICAgIDUsIDUsIC8vIHgsIHksXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICAvLyBzcHJpdGVfdywgc3ByaXRlX2gsIFxyXG4gICAgICAgICAgICAwLCAwLCAgICAgIC8vIGNsaXBfeCwgY2xpcF95XHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSAvLyB3LCBoXHJcbiAgICAgICAgICApICk7XHJcblxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgbGV0IF8xeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8xbGlmZXMgPSB0aGlzLnBsYXllcnNbMF0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMWxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMXgsIF8xeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzF4ICs9IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMXggPSAxMjA7XHJcbiAgICAgICAgICAgICAgXzF5ID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gXHJcblxyXG4gICAgICAvLyAjIFBsYXllciAwMlxyXG4gICAgICAgIGlmKCB0aGlzLnBsYXllcnNbMV0gKSB7XHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgIHRoaXMuZnJvbVJpZ2h0KCAyMzAgKSwgNSwgXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICBcclxuICAgICAgICAgICAgNTAsIDAsICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSBcclxuICAgICAgICAgICkgKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzJ4ID0gdGhpcy5mcm9tUmlnaHQoIDUwICk7XHJcbiAgICAgICAgICBsZXQgXzJ5ID0gMTA7XHJcbiAgICAgICAgICBsZXQgXzJsaWZlcyA9IHRoaXMucGxheWVyc1sxXS5nZXRMaWZlcygpO1xyXG4gICAgICAgICAgZm9yKCBsZXQgaT0wOyBpPF8ybGlmZXM7aSsrICkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEl0ZW0oIG5ldyBVSWl0ZW0oXHJcbiAgICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpLFxyXG4gICAgICAgICAgICAgIF8yeCwgXzJ5LFxyXG4gICAgICAgICAgICAgIDUwLCA1MCwgICBcclxuICAgICAgICAgICAgICAxMDAsIDAsICAgICAgXHJcbiAgICAgICAgICAgICAgdGhpcy5jaHVua1NpemUvMywgdGhpcy5jaHVua1NpemUvMyBcclxuICAgICAgICAgICAgKSApO1xyXG4gICAgICAgICAgICBfMnggLT0gMzU7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PSAyICkge1xyXG4gICAgICAgICAgICAgIF8yeCA9IHRoaXMuZnJvbVJpZ2h0KCA1MCApO1xyXG4gICAgICAgICAgICAgIF8yeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIC8vICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAgXHJcbiAgfVxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFVJIiwiY2xhc3MgVUlpdGVtIHtcclxuXHJcbiAgY29uc3RydWN0b3IoaXRlbVNwcml0ZUlELCBjaHVua1NpemUsIHgsIHksIHN3LCBzaCwgY3gsIGN5LCB3LCBoICkge1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuaXRlbVNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW1TcHJpdGVJRCk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7XHJcbiAgICAgIHNwcml0ZV93aWR0aDogc3csXHJcbiAgICAgIHNwcml0ZV9oZWlnaHQ6IHNoLFxyXG4gICAgICBjbGlwX3g6IGN4LFxyXG4gICAgICBjbGlwX3k6IGN5LFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG5cclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IHc7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gaDsgLy9weFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTZXRzICAgICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICBcclxuICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIC8vICMgR2V0cyAgICAgICAgICAgIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICAgIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgIFxyXG4gIC8vICMgSXRlbSBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICAgIFxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgdGhpcy5pdGVtU3ByaXRlLCAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV9oZWlnaHQsIFxyXG4gICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICApO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgIFxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSWl0ZW07XHJcbiIsImNsYXNzIFVJaXRlbV90ZXh0IHtcclxuXHJcbiAgY29uc3RydWN0b3IoIHRleHQsIHgsIHksIGZvbnQgKSB7XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG5cclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLmZvbnQgPSBmb250O1xyXG5cclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTZXRzICAgICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgR2V0cyAgICAgICAgICAgIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBJdGVtIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgICAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG4gIFxyXG4gICAgY3R4LmZvbnQgPSAgdGhpcy5mb250LnNpemUgKyBcIiAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5mb250LmNvbG9yO1xyXG4gICAgY3R4LmZpbGxUZXh0KCB0aGlzLnRleHQsIHRoaXMueCwgdGhpcy55KTsgXHJcblxyXG4gIH1cclxuICAgICAgIFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFVJaXRlbV90ZXh0O1xyXG4gICIsIi8vIEdhbWUgUHJvcGVydGllcyBjbGFzcyB0byBkZWZpbmUgY29uZmlndXJhdGlvbnNcclxuY2xhc3MgZ2FtZVByb3BlcnRpZXMge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIFxyXG4gICAgLy8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICBcclxuICAgIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyA9IDE2O1xyXG4gICAgdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyA9IDE0O1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbnZhc1dpZHRoID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5Ib3Jpem9udGFsQ2h1bmtzKTtcclxuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyk7Ly8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5mcHMgPSAyNDtcclxuICB9XHJcblxyXG4gIGdldFByb3AocHJvcCkge1xyXG4gICAgcmV0dXJuIHRoaXNbcHJvcF07XHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWVQcm9wZXJ0aWVzO1xyXG5cclxuLy8gR2xvYmFsIHZhbHVlc1xyXG5cclxuICAvLyBEZWJ1Z1xyXG4gIHdpbmRvdy5kZWJ1ZyA9IGZhbHNlOyAvLyBTaG93IGRlYnVnIHNxdWFyZXNcclxuICB3aW5kb3cuZGVidWdDb2xsaXNpb24gPSBmYWxzZTsgLy8gU2hvdyB3aGVuIG9iamVjdHMgY29sbGlkZVxyXG4gIHdpbmRvdy5hdXRvbG9hZCA9IGZhbHNlOyAvLyBhdXRvIGxvYWQgYSBzYXZlZCBnYW1lXHJcbiAgd2luZG93LmdvZF9tb2RlID0gdHJ1ZTsgLy8gUGxheWVycyB3b24ndCBkaWUiLCJjb25zdCBHYW1lID0gcmVxdWlyZSgnLi9lbmdpbmUvY29yZS9HYW1lJyk7XHJcbmNvbnNvbGUuY2xlYXIoKTtcclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gIFxyXG4gIC8vICMgU3RhcnQgdGhlIGdhbWVcclxuICAgIGxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lID0gZ2FtZTtcclxuICAgIGdhbWUucnVuKCk7XHJcbiBcclxufVxyXG5cclxuLyoqXHJcbiAqIFxyXG4gKiBUT0RPOlxyXG4gKiBcclxuICogIC0gQ2xlYXIgU2F2ZVN0YXRlIG9uIE5ldyBHYW1lXHJcbiAqLyJdfQ==
