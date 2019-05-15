(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Sprite = require('../engine/Sprite');

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
    
    isGrabing() { return this.grabing; }
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
          object.grabHandler();
          this.grabObject( object );
        }
      } else {
        if( this.objectGrabbed ) {
          this.objectGrabbed.throw( this.spriteProps.direction, this.getHeight() ); // Throw away object
          this.objectGrabbed = false; // remove grabbed
        }
      }

      this.grabing = !this.grabing;
      this.resetStep();

    }

    // Use items
    triggerUse() {
      let object = window.game.collision.justCheck(this, this.getGrabCollisionX(), this.getGrabCollisionY(), this.getGrabCollisionWidth(), this.getGrabCollisionHeight());
      if( object && object.canUse ) {
        object.useHandler( this.spriteProps.direction );
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
          this.grabCollisionHeight = this.collisionHeight / 2;

          this.grabCollisionX = this.collisionX;
          this.grabCollisionY = this.collisionY + this.collisionHeight;
          break;

        case  'up':
          this.grabCollisionWidth = this.collisionWidth;
          this.grabCollisionHeight = this.collisionHeight / 2;

          this.grabCollisionX = this.collisionX;
          this.grabCollisionY = this.collisionY - this.grabCollisionHeight;
          break;
        
        case 'left':
          this.grabCollisionWidth = this.collisionWidth / 2;
          this.grabCollisionHeight = this.collisionHeight;

          this.grabCollisionX = this.collisionX - this.grabCollisionWidth;
          this.grabCollisionY = this.collisionY;
          break;
        
        case 'right':
          this.grabCollisionWidth = this.collisionWidth / 2;
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
      this.lookDirection = this.lookDown();
      this.updateGrabCollisionXY();
    }
		
}//class
module.exports = Player;

},{"../engine/Sprite":31}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"../engine/Sprite":31,"dup":1}],3:[function(require,module,exports){
/*
    Prototype Scenario
*/
const _Scenario = require('../common/_Scenario');

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
},{"../common/_Scenario":26,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

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

},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Teleport":20,"../../common/_Stage":27}],5:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

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
},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Fire":16,"../../common/Teleport":20,"../../common/_Stage":27}],6:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

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

},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Teleport":20,"../../common/_Stage":27}],7:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

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

},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Teleport":20,"../../common/_Stage":27}],8:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

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

},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Teleport":20,"../../common/_Stage":27}],9:[function(require,module,exports){
/*
  Sandbox Scenario
*/
const _Scenario = require('../common/_Scenario');

const Stage_Center = require('./stages/stage_center');
const Stage_Life = require('./stages/stage_life');
const Stage_Enemy = require('./stages/stage_enemy');

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
    }

    // Load the stage defined
    this.loadStage(_stage, firstStage);
  }
 
  // Set Default Stage
  run() {
    this.setStage( this.stageToLoad, true);    
  }

}//class
module.exports = scenarioSandbox;
},{"../common/_Scenario":26,"./stages/stage_center":10,"./stages/stage_enemy":11,"./stages/stage_life":12}],10:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

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
      [ ob,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     f1 ],
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
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_enemy ],
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
},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Fire":16,"../../common/Teleport":20,"../../common/_Stage":27}],11:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

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
},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Enemy":15,"../../common/Fire":16,"../../common/Heal":17,"../../common/Object_Push":18,"../../common/Object_Throw":19,"../../common/Teleport":20,"../../common/_Stage":27}],12:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

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
},{"../../common/Beach_Floor":13,"../../common/Beach_Wall":14,"../../common/Fire":16,"../../common/Heal":17,"../../common/Teleport":20,"../../common/_Stage":27}],13:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const Sprite = require('../../../engine/Sprite');

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
},{"../../../engine/Sprite":31,"./_Collidable":25}],14:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const Sprite = require('../../../engine/Sprite');

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
},{"../../../engine/Sprite":31,"./_Collidable":25}],15:[function(require,module,exports){
const _CanHurt = require('./_CanHurt');
const Sprite = require('../../../engine/Sprite');

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
},{"../../../engine/Sprite":31,"./_CanHurt":23}],16:[function(require,module,exports){
const _CanHurt = require('./_CanHurt');
const Sprite = require('../../../engine/Sprite');

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
},{"../../../engine/Sprite":31,"./_CanHurt":23}],17:[function(require,module,exports){
const _CanCollect = require('./_CanCollect');
const Sprite = require('../../../engine/Sprite');

class Heal extends _CanCollect {

  constructor(type, x0, y0, stage_id) {
    
    let props = {
      name: stage_id + "_potion",
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
},{"../../../engine/Sprite":31,"./_CanCollect":22}],18:[function(require,module,exports){
const _CanBePushed = require('./_CanBePushed');
const Sprite = require('../../../engine/Sprite');

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
},{"../../../engine/Sprite":31,"./_CanBePushed":21}],19:[function(require,module,exports){
const _CanThrow = require('./_CanThrow');
const Sprite = require('../../../engine/Sprite');

class Object_Throw extends _CanThrow {

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
    
    let canThrow = {
      canRespawn: true,
      chuncksThrowDistance: 5,
      hurtAmount: 2
    }

    super(props, position, dimension, sprite, events, canThrow);
    
  }

  // # Sprites  
  setSpriteType(type) {
    switch(type) {
      case "barrel":
        this.spriteProps = this.sprite.getSpriteProps(22);
        break;
    }
  }

}//class
module.exports = Object_Throw;
},{"../../../engine/Sprite":31,"./_CanThrow":24}],20:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const gameProperties = require('../../../gameProperties'); 
const Sprite = require('../../../engine/Sprite');

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

      // Wait some time
      setTimeout( () => {
        
        // Now teleport all players to same location and direction
        let targetX = playerWhoActivatedTeleport.getX();
        let targetY = playerWhoActivatedTeleport.getY();
        let lookDirection = playerWhoActivatedTeleport.getSpriteProps().direction;
        
        players.map( (player) => {
          player.setX(targetX, true); // true = also set collision x too
          player.setY(targetY, true);
          player.triggerLookDirection(lookDirection);
          player.removeGrabedObject();
          player.showPlayer();
        });

        // Change stage
        collidable.scenario.setStage( 
          this.teleportProps.targetStage,
          false // firstStage ?
        );

        window.game.loading(false);
      }, 300);
      
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
},{"../../../engine/Sprite":31,"../../../gameProperties":35,"./_Collidable":25}],21:[function(require,module,exports){
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
},{"./_Collidable":25}],22:[function(require,module,exports){
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
},{"./_Collidable":25}],23:[function(require,module,exports){
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
},{"./_Collidable":25}],24:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const Sprite = require('../../../engine/Sprite');

class _CanThrow extends _Collidable {

  constructor(props, position, dimension, sprite, events, canCollectProps) {
    super(props, position, dimension, sprite, events);
    
    this.canGrab = true;
    this.grabbed = false;
    this._canRespawn = canCollectProps.canRespawn;
    this.hurtAmount = canCollectProps.hurtAmount;
    
    this.throwDistance = canCollectProps.chuncksThrowDistance * window.game.getChunkSize();
    this.throwSpeed = 0.8;
    this.throwDistanceTravelled = 0;
    this.throwingMovement = false;
    this.throwDirection = false;
    
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

  isGrabbed() { return this.grabbed; }
  grab(){ this.grabbed = true; }
  setGrab(bool) { this.grabbed = bool; }

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

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

  grabHandler( ) {
    this.setGrab(true);
    this.setStopOnCollision(false); // avoid players pushing other players with items
  }

  breakObject() {

    this.setThrowing(false);
    this.setGrab(false);
    this.setStopOnCollision(false);

    // Start destroy animation
    this.setDestroying(true);
    
  }

  throw(direction, playerHeight) {
    this.setThrowing(true);
    this.calculateThrowDirection( direction, playerHeight );
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
      }
    }

  }

}//class
module.exports = _CanThrow;
},{"../../../engine/Sprite":31,"./_Collidable":25}],25:[function(require,module,exports){
class _Collidable {

  constructor(props, position, dimension, sprite, events) {
      
    // # Position
    this.x = position.x;
    this.y = position.y;
      
    // # Properties
    this.width = dimension.width; //px
    this.height = dimension.height;

    // # Collision
    this.collisionWidth = this.width;
    this.collisionHeight = this.height;
    this.collisionX = this.x;
    this.collisionY = this.y;

    this.chunkSize = window.game.getChunkSize();

    // # Eventos
    this.stopOnCollision = events.stopOnCollision;
    this.hasCollisionEvent = events.hasCollisionEvent;
  
    // # Sprite
    this.sprite = sprite;

    //this.stageSprite = sprite.stageSprite;
    this.hideSprite = false;

    //this.spriteWidth = sprite.width;   
    //this.spriteHeight = sprite.height; 
    this.spriteProps = new Array();
    
    this.name = props.name.replace(/\s/g,'') + "_" + this.x + "x" + this.y;
    this.name = this.name.toLowerCase();
    
    this.hideSprite = false;

    this.needSaveState = false;

    this.type = props.type;

    this.run( props.type );
  }

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
  hide() { this.hideSprite = true; }
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
},{}],26:[function(require,module,exports){
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

  setActualStageId(id){ this.stageId = id; }

  // # Save the State of items
  saveItemsState() {

    // Bottom Layer
    this.stage.getLayerItems__bottom().map( (item) => { 
      if( item.willNeedSaveState() ) {
        window.game.addItemState(
          {
            'name_id': item.getName(),
            'collected': item.isCollected()
          }
        );
      }
    });

    // Top Layer
    this.stage.getLayerItems__top().map( (item) => { 
      if( item.willNeedSaveState() ) {
        window.game.addItemState(
          {
            'name_id': item.getName(),
            'collected': item.isCollected()
          }
        );
      }
    });

    window.game.saveItemsState();

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

    // Set Actual Stage ID
    this.setActualStageId( this.stage.getStageId() );

    // Only set player start at first load
    if(firstStage) {
      this.setPlayer1StartX( this.stage.getPlayer1StartX() );
      this.setPlayer1StartY( this.stage.getPlayer1StartY() );
      this.setPlayer2StartX( this.stage.getPlayer2StartX() );
      this.setPlayer2StartY( this.stage.getPlayer2StartY() );
    }
    
  }

  render() { }

}//class
module.exports = _Scenario;
},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
// Class that detects collision between player and other objects
class Collision {

	constructor(scenarioWidth, scenarioHeight, player) {
		this.colItens = new Array(); // Items to check for collision
    this.scenarioWidth = scenarioWidth;
    this.scenarioHeight = scenarioHeight;
    this.player = player;
  }
			
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
	
},{}],29:[function(require,module,exports){
const gameProperties = require('../gameProperties');
const scenarioPrototype = require('../assets/scenario/Prototype/scenarioPrototype');
const scenarioSandbox = require('../assets/scenario/Sandbox/scenarioSandbox');
const Player = require('../assets/Player');
const Collision = require('./Collision');
const Render = require('./Render');
const UI = require('./UI');

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
      this.defaultScenario = "sandbox";
      this.scenario = null;
      this.UI = null;

      this.gameReady = false;

      this.multiplayer = false;

      // Renders
      this.renderStatic = null;
      this.renderLayers = null;
      this.renderUI     = null;

  }

  // Gets
  isGameReady() { return this.gameReady; }
  getChunkSize() { return this.gameProps.chunkSize; }

  getCanvasWidth()  { return this.gameProps.canvasWidth;  }
  getCanvasHeight() { return this.gameProps.canvasHeight; }

  
  // Sets
  setGameReady(bool) { this.gameReady = bool; }
  
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

  startNewGame( saveData ) {

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

  /*
    Fit Screen div on window size 
  */
  adjustScreenDiv() {
    // TODO
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

    // Fit menu on screen
    this.adjustScreenDiv();

  }

}
module.exports = Game;
},{"../assets/Player":1,"../assets/scenario/Prototype/scenarioPrototype":3,"../assets/scenario/Sandbox/scenarioSandbox":9,"../gameProperties":35,"./Collision":28,"./Render":30,"./UI":32}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{}],32:[function(require,module,exports){
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
},{"./_UIitem":33,"./_UIitem_text":34}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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
  
},{}],35:[function(require,module,exports){
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
  window.god_mode = true; // Players won't die
},{}],36:[function(require,module,exports){
const Game = require('./engine/Game');
console.clear();
window.onload = function() {
  
  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();
 
}
},{"./engine/Game":29}]},{},[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,35,36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2NlbnRlci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfZW5lbXkuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2xpZmUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9GbG9vci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX1dhbGwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9FbmVteS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0ZpcmUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9IZWFsLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vT2JqZWN0X1B1c2guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9PYmplY3RfVGhyb3cuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9UZWxlcG9ydC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19DYW5CZVB1c2hlZC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19DYW5Db2xsZWN0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX0Nhbkh1cnQuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fQ2FuVGhyb3cuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fQ29sbGlkYWJsZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19TY2VuYXJpby5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19TdGFnZS5qcyIsImNsaWVudC9lbmdpbmUvQ29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9HYW1lLmpzIiwiY2xpZW50L2VuZ2luZS9SZW5kZXIuanMiLCJjbGllbnQvZW5naW5lL1Nwcml0ZS5qcyIsImNsaWVudC9lbmdpbmUvVUkuanMiLCJjbGllbnQvZW5naW5lL19VSWl0ZW0uanMiLCJjbGllbnQvZW5naW5lL19VSWl0ZW1fdGV4dC5qcyIsImNsaWVudC9nYW1lUHJvcGVydGllcy5qcyIsImNsaWVudC9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcGxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uL2VuZ2luZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIFBsYXllciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHgwLCB5MCwgZ2FtZVByb3BzLCBwbGF5ZXJOdW1iZXIsIHBsYXllclByb3BzKSB7XHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgICBpZiggcGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl9vbmUnKTtcclxuICAgICAgfVxyXG4gICAgICBpZiggcGxheWVyTnVtYmVyID09IDIgKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl90d28nKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCB0aGlzLnBsYXllclNwcml0ZSwgMzAwLCA5NjAsIDIwLCA0MCk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzID0ge307XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXAgPSBbXTtcclxuICAgICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICAgIHRoaXMuaW5pdGlhbFN0ZXAgPSAyO1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHRoaXMubWF4U3RlcHMgPSA4O1xyXG5cclxuICAgICAgLy8gQ29udHJvbHMgdGhlIHBsYXllciBGUFMgQW5pbWF0aW9uXHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gMTI7IC8vIDEwMDAgLyBGUFNcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgdGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcbiAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgICAgdGhpcy54ID0geDA7XHJcbiAgICAgIHRoaXMueSA9IHkwO1xyXG4gICAgICBcclxuICAgICAgdGhpcy54MCA9IHgwOyAvLyBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICAgIHRoaXMueTAgPSB5MDtcclxuICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmNodW5rU2l6ZTsgLy9weFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2h1bmtTaXplICogMjsgLy9weFxyXG4gICAgICBcclxuICAgICAgdGhpcy5zcGVlZDAgPSAwLjE3O1xyXG4gICAgICB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiB0aGlzLnNwZWVkMDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMubmFtZSA9IFwicGxheWVyX1wiICsgcGxheWVyTnVtYmVyO1xyXG4gICAgICB0aGlzLnBsYXllck51bWJlciA9IHBsYXllck51bWJlcjtcclxuICAgICAgdGhpcy50eXBlID0gXCJwbGF5ZXJcIjtcclxuXHJcbiAgICAgIHRoaXMuZ3JhYmluZyA9IGZhbHNlO1xyXG4gICAgICBcclxuICAgIC8vICMgRXZlbnRzICBcclxuICAgICAgXHJcbiAgICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5pc01vdmluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IHRydWU7XHJcbiAgICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgICB0aGlzLmNvbGxpc2lvbldpZHRoID0gdGhpcy53aWR0aCAqIDAuODtcclxuICAgICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB0aGlzLmhlaWdodCAqIDAuMztcclxuICAgICAgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSA9IHRoaXMud2lkdGggKiAwLjE7IC8vIFVzZWQgdG8gc2V0IGNvbGxpc2lvbiBYIHdoZW4gc2V0dGluZyBYIFxyXG4gICAgICB0aGlzLkNvbGxpc2lvbllGb3JtdWxhID0gdGhpcy5oZWlnaHQgKiAwLjc7IFxyXG4gICAgICB0aGlzLmNvbGxpc2lvblggPSB4MCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGE7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWSA9IHkwICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYTtcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWDAgPSB0aGlzLmNvbGxpc2lvblg7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWTAgPSB0aGlzLmNvbGxpc2lvblk7XHJcblxyXG4gICAgICAvLyBHcmFiL1BpY2sgSXRlbXMgQ29sbGlzaW9uIEJveFxyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IDA7XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IDA7XHJcbiAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSAwO1xyXG4gICAgICB0aGlzLmdyYWJDb2xsaXNpb25ZID0gMDtcclxuXHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IG51bGw7XHJcblxyXG4gICAgICAvLyAjIExpZmVcclxuICAgICAgdGhpcy5kZWZhdWx0TGlmZXMgPSA2O1xyXG4gICAgICB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgIHRoaXMuaHVydENvb2xEb3duVGltZSA9IDIwMDA7IC8vMnNcclxuXHJcbiAgICAgIC8vIFBsYXllciBQcm9wcyBpZiBoYXNcclxuICAgICAgaWYoIHBsYXllclByb3BzICkge1xyXG4gICAgICAgIHRoaXMubGlmZXMgPSBwbGF5ZXJQcm9wcy5saWZlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8qIFxyXG4gICAgICBHcmFiL1BpY2sgSXRlbXMgQ29sbGlzaW9uIEJveFxyXG4gICovXHJcbiAgICBcclxuICAgIGlzR3JhYmluZygpIHsgcmV0dXJuIHRoaXMuZ3JhYmluZzsgfVxyXG4gICAgcmVtb3ZlR3JhYmVkT2JqZWN0KCkgeyBcclxuICAgICAgdGhpcy5ncmFiaW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMub2JqZWN0R3JhYmJlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdHJpZ2dlckdyYWIoKXtcclxuICAgICAgXHJcbiAgICAgIC8vIENoZWNrIGlmIGhhcyBhIFwiX0NhbkdyYWJcIiBpdGVtIGNvbGxpZGluZyB3aXRoIGdyYWIgaGl0IGJveCBhbmQgXCJwaWNrXCIgaXRlbVxyXG4gICAgICBpZiggISB0aGlzLmlzR3JhYmluZygpICkge1xyXG4gICAgICAgIGxldCBvYmplY3QgPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSk7XHJcbiAgICAgICAgaWYoIG9iamVjdCAmJiBvYmplY3QuY2FuR3JhYiApIHtcclxuICAgICAgICAgIGlmKCBvYmplY3QuaXNHcmFiYmVkKCkgKSByZXR1cm47IC8vIGF2b2lkIHBsYXllcnMgZ3JhYmJpbmcgdGhlIHNhbWUgb2JqZWN0XHJcbiAgICAgICAgICBvYmplY3QuZ3JhYkhhbmRsZXIoKTtcclxuICAgICAgICAgIHRoaXMuZ3JhYk9iamVjdCggb2JqZWN0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdEdyYWJiZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLm9iamVjdEdyYWJiZWQudGhyb3coIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uLCB0aGlzLmdldEhlaWdodCgpICk7IC8vIFRocm93IGF3YXkgb2JqZWN0XHJcbiAgICAgICAgICB0aGlzLm9iamVjdEdyYWJiZWQgPSBmYWxzZTsgLy8gcmVtb3ZlIGdyYWJiZWRcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZ3JhYmluZyA9ICF0aGlzLmdyYWJpbmc7XHJcbiAgICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBpdGVtc1xyXG4gICAgdHJpZ2dlclVzZSgpIHtcclxuICAgICAgbGV0IG9iamVjdCA9IHdpbmRvdy5nYW1lLmNvbGxpc2lvbi5qdXN0Q2hlY2sodGhpcywgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25ZKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpKTtcclxuICAgICAgaWYoIG9iamVjdCAmJiBvYmplY3QuY2FuVXNlICkge1xyXG4gICAgICAgIG9iamVjdC51c2VIYW5kbGVyKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0R3JhYkNvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGg7IH1cclxuICAgIGdldEdyYWJDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvblg7IH1cclxuICAgIGdldEdyYWJDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuZ3JhYkNvbGxpc2lvblk7IH1cclxuXHJcbiAgICAvLyBBdHRhY2ggYW4gaXRlbSB0byBwbGF5ZXJcclxuICAgIGdyYWJPYmplY3QoIG9iamVjdCApIHtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkID0gb2JqZWN0O1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBHcmFiQ29sbGlzaW9uIFggYW5kIFkgY29uc2lkZXJpbmcgcGxheWVyIGxvb2sgZGlyZWN0aW9uXHJcbiAgICB1cGRhdGVHcmFiQ29sbGlzaW9uWFkoKSB7XHJcbiAgICAgIHN3aXRjaCh0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbikge1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQgLyAyO1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25ZID0gdGhpcy5jb2xsaXNpb25ZICsgdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgY2FzZSAgJ3VwJzpcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbldpZHRoID0gdGhpcy5jb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25YID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWSA9IHRoaXMuY29sbGlzaW9uWSAtIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uV2lkdGggPSB0aGlzLmNvbGxpc2lvbldpZHRoIC8gMjtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvbkhlaWdodCA9IHRoaXMuY29sbGlzaW9uSGVpZ2h0O1xyXG5cclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblggPSB0aGlzLmNvbGxpc2lvblggLSB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aDtcclxuICAgICAgICAgIHRoaXMuZ3JhYkNvbGxpc2lvblkgPSB0aGlzLmNvbGxpc2lvblk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25XaWR0aCA9IHRoaXMuY29sbGlzaW9uV2lkdGggLyAyO1xyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5jb2xsaXNpb25IZWlnaHQ7XHJcblxyXG4gICAgICAgICAgdGhpcy5ncmFiQ29sbGlzaW9uWCA9IHRoaXMuY29sbGlzaW9uWCArIHRoaXMuY29sbGlzaW9uV2lkdGg7XHJcbiAgICAgICAgICB0aGlzLmdyYWJDb2xsaXNpb25ZID0gdGhpcy5jb2xsaXNpb25ZO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIElmIGhhcyBzb21lIG9iamVjdCBncmFiYmVkLCB1cGRhdGUgcG9zaXRpb25cclxuICAgICAgaWYoIHRoaXMub2JqZWN0R3JhYmJlZCApIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZUdyYWJiZWRPYmplY3RQb3NpdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlR3JhYmJlZE9iamVjdFBvc2l0aW9uKCkge1xyXG4gICAgICB0aGlzLm9iamVjdEdyYWJiZWQudXBkYXRlWCggdGhpcy5nZXRYKCkgKTtcclxuICAgICAgdGhpcy5vYmplY3RHcmFiYmVkLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5vYmplY3RHcmFiYmVkLmdldEhlaWdodCgpICsgICggdGhpcy5nZXRIZWlnaHQoKSAqIDAuMSApICApO1xyXG4gICAgfVxyXG5cclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuICAgICAgICBcclxuICAvKlxyXG4gICAgU3ByaXRlIC8gQW5pbWF0aW9uXHJcbiAgKi9cclxuXHJcbiAgICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuXHJcbiAgICBcclxuXHRcdGhpZGVQbGF5ZXIoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7IH1cclxuICAgIHNob3dQbGF5ZXIoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlOyB9XHJcbiAgICBcclxuICAgIGxvb2tEb3duKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2Rvd24nO1xyXG4gICAgICBcclxuICAgICAgLy8gU3RlcHNcclxuICAgICAgaWYoIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDYwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDYxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDYyICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDYzICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDY0ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDY1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDY2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDY3ICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFszXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAyICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDMgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs2XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCA1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDYgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggNyApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rVXAoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAndXAnO1xyXG4gICAgICBcclxuICAgICAgaWYoIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwNSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTA3ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDEwOCApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs1XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMDkgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTEwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDExMSApO1xyXG4gICAgICAgIHRoaXMuc3RlcFs4XSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKCAxMTIgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTUgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTcgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTggKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMTkgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbNl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMjAgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbN10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMjEgKTtcclxuICAgICAgICB0aGlzLnN0ZXBbOF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSggMjIgKTtcclxuICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rUmlnaHQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAncmlnaHQnO1xyXG4gICAgICBcclxuICAgICAgaWYoIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDc1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDc2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDc3ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDc4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDc5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDgwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDgxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDgyICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDMwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDMxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDMyICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDMzICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDM0ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDM1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDM2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDM3ICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgICAgICBcclxuXHRcdGxvb2tMZWZ0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICBcclxuICAgICAgaWYoIHRoaXMuaXNHcmFiaW5nKCkgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDkwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDkxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDkyICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDkzICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDk0ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDk1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDk2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDk3ICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQ1ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQ2ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQ3ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQ4ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDQ5ICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDUwICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzddID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDUxICk7XHJcbiAgICAgICAgdGhpcy5zdGVwWzhdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoIDUyICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gICAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0bGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblx0ICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgICBpbmNyZWFzZVN0ZXAoKSB7XHJcbiAgICAgIGlmKHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkpIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCsrO1xyXG4gICAgICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuaW5pdGlhbFN0ZXA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXNldFN0ZXAoKSB7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgc3dpdGNoICggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG5cdFx0dHJpZ2dlckxvb2tEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgIH1cclxuXHRcdHJlc2V0UG9zaXRpb24oKSB7XHJcblx0XHRcdHRoaXMuc2V0WCggdGhpcy54MCApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMueTAgKTtcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmNvbGxpc2lvblgwICk7XHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5jb2xsaXNpb25ZMCApO1xyXG4gICAgfVxyXG5cclxuICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLy9cclxuICAgIFxyXG4gIC8qXHJcbiAgICBNb3ZlbWVudFxyXG4gICovXHJcbiAgICBcclxuICAgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgIFxyXG4gICAgZ2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcblxyXG4gICAgc2V0WCh4LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICAgIHRoaXMueCA9IHg7IFxyXG4gICAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25YKCB4ICsgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSApO1xyXG4gICAgfVxyXG4gICAgc2V0WSh5LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICAgIHRoaXMueSA9IHk7IFxyXG4gICAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25ZKCB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXRTcGVlZChzcGVlZCkgeyB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgKiBzcGVlZDsgfVxyXG4gICAgXHJcblx0XHRtb3ZMZWZ0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlJpZ2h0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92VXAoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZEb3duKCkgeyAgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgICAgdGhpcy51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgIH07XHJcblxyXG4gICAgaGFuZGxlTW92ZW1lbnQoIGtleXNEb3duICkge1xyXG4gICAgICBcclxuICAgICAgLy8gUGxheWVyIDEgQ29udHJvbHNcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgaWYgKDM3IGluIGtleXNEb3duKSB0aGlzLm1vdkxlZnQoKTsgIC8vIExlZnRcclxuICAgICAgICBpZiAoMzggaW4ga2V5c0Rvd24pIHRoaXMubW92VXAoKTsgICAgLy8gVXAgIFxyXG4gICAgICAgIGlmICgzOSBpbiBrZXlzRG93bikgdGhpcy5tb3ZSaWdodCgpOyAvLyBSaWdodFxyXG4gICAgICAgIGlmICg0MCBpbiBrZXlzRG93bikgdGhpcy5tb3ZEb3duKCk7ICAvLyBEb3duXHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFBsYXllciAyIENvbnRyb2xzXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIGlmICg2NSBpbiBrZXlzRG93bikgdGhpcy5tb3ZMZWZ0KCk7ICAvLyBMZWZ0ICA9PiBBXHJcbiAgICAgICAgaWYgKDg3IGluIGtleXNEb3duKSB0aGlzLm1vdlVwKCk7ICAgIC8vIFVwICAgID0+IFdcclxuICAgICAgICBpZiAoNjggaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHQgPT4gRFxyXG4gICAgICAgIGlmICg4MyBpbiBrZXlzRG93bikgdGhpcy5tb3ZEb3duKCk7ICAvLyBEb3duICA9PiBTXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlS2V5VXAoa2V5VXApIHtcclxuICAgICAgXHJcbiAgICAgIC8vIFBsYXllciAxXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIGlmIChrZXlVcCA9PSAxNykgdGhpcy50cmlnZ2VyR3JhYigpOyAgLy8gR3JhYiA9PiBDVFJMXHJcbiAgICAgICAgaWYgKGtleVVwID09IDMyKSB0aGlzLnRyaWdnZXJVc2UoKTsgICAvLyBVc2UgPT4gU3BhY2VcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUGxheWVyIDJcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDIgKSB7XHJcbiAgICAgICAgaWYgKGtleVVwID09IDcwKSB0aGlzLnRyaWdnZXJHcmFiKCk7ICAvLyBHcmFiID0+IEZcclxuICAgICAgICBpZiAoa2V5VXAgPT0gNjkpIHRoaXMudHJpZ2dlclVzZSgpOyAgLy8gVXNlID0+IEVcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcblx0XHRcclxuICAvKlxyXG4gICAgQ29sbGlzaW9uXHJcbiAgKi9cclxuICAgIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgICBzZXRDb2xsaXNpb25ZKHkpIHsgdGhpcy5jb2xsaXNpb25ZID0geTsgfVxyXG5cclxuICAgIC8vVGhlIGNvbGxpc2lvbiB3aWxsIGJlIGp1c3QgaGFsZiBvZiB0aGUgcGxheWVyIGhlaWdodFxyXG4gICAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25IZWlnaHQ7IH1cclxuICAgIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25XaWR0aDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblg7IH1cclxuICAgIGdldENvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25ZOyB9XHJcblxyXG4gICAgZ2V0Q2VudGVyWCggX3ggKSB7IC8vIE1heSBnZXQgYSBjdXN0b20gY2VudGVyWCwgdXNlZCB0byBjaGVjayBhIGZ1dHVyZSBjb2xsaXNpb25cclxuICAgICAgbGV0IHggPSAoIF94ICkgPyBfeCA6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgICByZXR1cm4geCArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDI7IFxyXG4gICAgfVxyXG4gICAgZ2V0Q2VudGVyWSggX3kgKSB7IFxyXG4gICAgICBsZXQgeSA9ICggX3kgKSA/IF95IDogdGhpcy5nZXRDb2xsaXNpb25ZKCk7XHJcbiAgICAgIHJldHVybiB5ICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDI7IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBIYXMgYSBjb2xsaXNpb24gRXZlbnQ/XHJcbiAgICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAgIC8vIFdpbGwgaXQgU3RvcCB0aGUgb3RoZXIgb2JqZWN0IGlmIGNvbGxpZGVzP1xyXG4gICAgc3RvcElmQ29sbGlzaW9uKCkgeyByZXR1cm4gdGhpcy5zdG9wT25Db2xsaXNpb247IH1cclxuXHJcblx0XHRub0NvbGxpc2lvbigpIHtcclxuXHRcdFx0Ly8gV2hhdCBoYXBwZW5zIGlmIHRoZSBwbGF5ZXIgaXMgbm90IGNvbGxpZGluZz9cclxuXHRcdFx0dGhpcy5zZXRTcGVlZCh0aGlzLnNwZWVkMCk7IC8vIFJlc2V0IHNwZWVkXHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgY29sbGlzaW9uKG9iamVjdCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pc0NvbGxpZGFibGU7XHJcbiAgICB9O1xyXG5cdFx0XHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcblxyXG5cdC8qXHJcbiAgICBMaWZlIC8gSGVhbCAvIERlYXRoXHJcbiAgKi9cdFxyXG4gICAgZ2V0TGlmZXMoKSB7IHJldHVybiB0aGlzLmxpZmVzOyB9XHJcblxyXG4gICAgaHVydFBsYXllciggYW1vdW50ICkge1xyXG4gICAgICBpZiggdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gSHVydCBwbGF5ZXJcclxuICAgICAgICB0aGlzLmxpZmVzIC09IGFtb3VudDtcclxuICAgICAgICBpZiggdGhpcy5saWZlcyA8IDAgKSB0aGlzLmxpZmVzID0gMDtcclxuXHJcbiAgICAgICAgLy8gU3RhcnQgY29vbGRvd25cclxuICAgICAgICB0aGlzLmNhbkJlSHVydCA9IGZhbHNlO1xyXG4gICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgICAgIH0sIHRoaXMuaHVydENvb2xEb3duVGltZSk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIHBsYXllciBkaWVkXHJcbiAgICAgICAgdGhpcy5jaGVja1BsYXllckRlYXRoKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoZWFsUGxheWVyKCBhbW91bnQgKSB7XHJcbiAgICAgIHRoaXMubGlmZXMgKz0gcGFyc2VJbnQoYW1vdW50KTtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPiB0aGlzLmRlZmF1bHRMaWZlcyApIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgIH1cclxuXHJcbiAgICBjaGVja1BsYXllckRlYXRoKCkge1xyXG4gICAgICBpZiggdGhpcy5saWZlcyA8IDEgJiYgIXdpbmRvdy5nb2RfbW9kZSApIHtcclxuICAgICAgIHdpbmRvdy5nYW1lLm5ld0dhbWUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIFxyXG4gICAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcblx0XHRcclxuICAgIC8qXHJcbiAgICAgIEdlbmVyYWxcclxuICAgICovXHJcbiAgICAgICAgXHJcbiAgICAgIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICAgICAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcbiAgICAgIFxyXG4gICAgICBnZXRQbGF5ZXJOdW1iZXIoKSB7IHJldHVybiB0aGlzLnBsYXllck51bWJlcjsgfVxyXG5cclxuICAgICAgZ2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcbiAgICAgICAgXHJcbiAgICAgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgXHJcbiAgLy8gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC8vXHJcblx0XHJcbiAgLyogIFxyXG4gICAgUmVuZGVyXHJcbiAgKi9cclxuICBcdFx0XHJcblx0ICByZW5kZXIoY3R4KSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBCbGluayBwbGF5ZXIgaWYgaXQgY2FuJ3QgYmUgaHVydFxyXG4gICAgICBpZiggISB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICB0aGlzLmhpZGVTcHJpdGUgPSAhdGhpcy5oaWRlU3ByaXRlO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjtcclxuXHJcbiAgICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIFxyXG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCksICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldEtleVdpZHRoKCksIHRoaXMuc3ByaXRlLmdldEtleUhlaWdodCgpLCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHRcclxuXHJcbiAgICAgIC8vIERFQlVHIENPTExJU0lPTlxyXG4gICAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDI1NSwgMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCggdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuXHJcbiAgICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFgoKSkgKyBcIiBZOlwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFkoKSk7XHJcbiAgICAgICAgY3R4LmZvbnQgPSAgXCIyNXB4ICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCI7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDIwKTtcclxuXHJcbiAgICAgICAgLy8gR3JhYiBjb2xsaXNpb25cclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDAsIDAuNClcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0R3JhYkNvbGxpc2lvblgoKSwgdGhpcy5nZXRHcmFiQ29sbGlzaW9uWSgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldEdyYWJDb2xsaXNpb25IZWlnaHQoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG5cdFx0fTtcclxuXHJcblxyXG4gICAgcnVuKCkge1xyXG4gICAgICB0aGlzLmxvb2tEaXJlY3Rpb24gPSB0aGlzLmxvb2tEb3duKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICB9XHJcblx0XHRcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcbiAgICBQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vY29tbW9uL19TY2VuYXJpbycpO1xyXG5cclxuY29uc3QgX1NfY2VudGVyID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfY2VudGVyJyk7XHJcbmNvbnN0IF9TX3VwID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfdXAnKTtcclxuY29uc3QgX1NfcmlnaHQgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9yaWdodCcpO1xyXG5jb25zdCBfU19ib3R0b20gPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9ib3R0b20nKTtcclxuY29uc3QgX1NfbGVmdCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2xlZnQnKTtcclxuXHJcbmNsYXNzIHNjZW5hcmlvUHJvdG90eXBlIGV4dGVuZHMgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHNhdmVEYXRhKXtcclxuICAgIHN1cGVyKGN0eCwgY2FudmFzLCBcInByb3RvdHlwZVwiKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG4gICAgXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgXHJcbiAgICBsZXQgX3N0YWdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDaGVjayB3aGljaCBzdGFnZSB3aWxsIGxvYWRcclxuICAgIHN3aXRjaChzdGFnZV9pZCkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIGxldCBzX2NlbnRlciA9IG5ldyBfU19jZW50ZXIoKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX2NlbnRlcjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIGxldCBzX3VwID0gbmV3IF9TX3VwKCk7XHJcbiAgICAgICAgX3N0YWdlID0gc191cDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgbGV0IHNfbGVmdCA9IG5ldyBfU19sZWZ0KCk7XHJcbiAgICAgICAgX3N0YWdlID0gc19sZWZ0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgbGV0IHNfcmlnaHQgPSBuZXcgX1NfcmlnaHQoKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX3JpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgIGxldCBzX2JvdHRvbSA9IG5ldyBfU19ib3R0b20oKTtcclxuICAgICAgICBfc3RhZ2UgPSBzX2JvdHRvbTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTG9hZCB0aGUgc3RhZ2UgZGVmaW5lZFxyXG4gICAgICB0aGlzLmxvYWRTdGFnZShfc3RhZ2UsIGZpcnN0U3RhZ2UpO1xyXG4gIH1cclxuIFxyXG4gIC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5zZXRTdGFnZSggdGhpcy5zdGFnZVRvTG9hZCwgdHJ1ZSk7ICAgIFxyXG5cdH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9Qcm90b3R5cGU7IiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQm90dG9tIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiYm90dG9tXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMiwgICBvYiwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y19ibCwgICAgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3Y19iciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQm90dG9tO1xyXG4iLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwiY2VudGVyXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjIsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgaXdjX2JyLCAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgaXdjX2JsLCAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0IF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgICAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgb2IsICAgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIGl3Y190ciwgICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y190bCwgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ3VwJyB9O1xyXG4gICAgbGV0IHRwXzAzID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgICAgIHRhcmdldFN0YWdlOiAncmlnaHQnIH07XHJcbiAgICBsZXQgdHBfMDQgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdib3R0b20nIH07XHJcbiAgICBsZXQgdHBfMDUgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgICAgdGFyZ2V0U3RhZ2U6ICdsZWZ0JyB9O1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogXCJmaXJlXCIsIHR5cGU6IFwiMDFcIn07IFxyXG5cclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9MZWZ0IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFwibGVmdFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTtcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX3RsLCB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBvYiwgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYyLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2NfYmwsIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfTGVmdDtcclxuIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfUmlnaHQgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJyaWdodFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3Y190ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3Y19iciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwibGVmdFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9SaWdodDtcclxuIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfVXAgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJ1cFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpOztcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y190bCwgICAgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfVXBcclxuIiwiLypcclxuICBTYW5kYm94IFNjZW5hcmlvXHJcbiovXHJcbmNvbnN0IF9TY2VuYXJpbyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IFN0YWdlX0NlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2NlbnRlcicpO1xyXG5jb25zdCBTdGFnZV9MaWZlID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfbGlmZScpO1xyXG5jb25zdCBTdGFnZV9FbmVteSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2VuZW15Jyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1NhbmRib3ggZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgc2F2ZURhdGEpe1xyXG4gICAgc3VwZXIoY3R4LCBjYW52YXMsIFwic2FuZGJveFwiKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG4gICAgXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICAvLyBTYXZlIGl0ZW1zIHN0YXRlIGJlZm9yZSBjbGVhclxyXG4gICAgaWYoICFmaXJzdFN0YWdlICkge1xyXG4gICAgICB0aGlzLnNhdmVJdGVtc1N0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIFxyXG4gICAgbGV0IF9zdGFnZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkXHJcbiAgICBzd2l0Y2goc3RhZ2VfaWQpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnY2VudGVyJzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgU3RhZ2VfQ2VudGVyKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xpZmUnOlxyXG4gICAgICAgIF9zdGFnZSA9IG5ldyBTdGFnZV9MaWZlKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2VuZW15JzpcclxuICAgICAgICBfc3RhZ2UgPSBuZXcgU3RhZ2VfRW5lbXkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2FkIHRoZSBzdGFnZSBkZWZpbmVkXHJcbiAgICB0aGlzLmxvYWRTdGFnZShfc3RhZ2UsIGZpcnN0U3RhZ2UpO1xyXG4gIH1cclxuIFxyXG4gIC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5zZXRTdGFnZSggdGhpcy5zdGFnZVRvTG9hZCwgdHJ1ZSk7ICAgIFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9TYW5kYm94OyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9DZW50ZXIgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXCJjZW50ZXJcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIGl3Y19iciwgICAgZjEsICAgIGl3Y19ibCwgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgaXdjX2JyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX2JsIF0sXHJcbiAgICAgIFsgb2IsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBpd2NfdHIsICAgZjEsICAgIGYxLCAgICBvYiwgICAgb2IsICAgIG9iLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfdGwgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBvYiwgICAgZjIsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIG9iLCAgICBvYiwgICAgb2IsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgICBpd2NfdHIsICAgIG9iLCAgIGl3Y190bCwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdjX2JyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBMYXllciAtIEJvdHRvbVxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwX2xmID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgICAgIHRhcmdldFN0YWdlOiAnbGlmZScgfTtcclxuICAgIGxldCB0cF9lbmVteSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICB0YXJnZXRTdGFnZTogJ2VuZW15JyB9O1xyXG4gICAgXHJcbiAgICBsZXQgdGJsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRiciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fcmlnaHRcIiB9OyBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9sZiwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfZW5lbXkgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdGJsLCAgICAgdGJyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCB0dGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdHRyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9yaWdodFwiIH07ICBcclxuICAgIGxldCB0bWwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdG1yID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9yaWdodFwiIH07ICBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHR0bCwgICAgIHR0ciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0bWwsICAgICB0bXIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyOyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuY29uc3QgRW5lbXkgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRW5lbXknKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcbmNvbnN0IE9iamVjdF9UaHJvdyA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9PYmplY3RfVGhyb3cnKTtcclxuY29uc3QgT2JqZWN0X1B1c2ggPSByZXF1aXJlKCcuLi8uLi9jb21tb24vT2JqZWN0X1B1c2gnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9FbmVteSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImVuZW15XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZW5lbXlcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEVuZW15KGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwib2JqZWN0X3Rocm93XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPYmplY3RfVGhyb3coaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJvYmplY3RfcHVzaFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgT2JqZWN0X1B1c2goaXRlbS50eXBlLCB4LCB5LCB0aGlzLmdldFN0YWdlSWQoKSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzaWduIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG5cclxuICAgIGxldCBpd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCBpd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgaXdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTsgIFxyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgICAgd3QsICAgIHd0LCAgICAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgaXdjX2JyLCAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBmMSwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y190ciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIG9iLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBvYiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgb2IsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICAgICB3YiwgICAgd2IsICAgICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcbiAgICBcclxuICAgIGxldCBmaXJlID0geyBuYW1lOiAnZmlyZScsIHR5cGU6ICcwMSd9OyBcclxuXHJcbiAgICBsZXQgZW5lbXkgPSB7IG5hbWU6ICdlbmVteScsIHR5cGU6ICcwMSd9OyBcclxuICAgIGxldCBibm5hID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiYW5hbmEnfTsgXHJcbiAgICBsZXQgYmVycnkgPSB7IG5hbWU6ICdoZWFsJywgdHlwZTogJ2JlcnJ5J307IFxyXG5cclxuICAgIGxldCBicnJsID0geyBuYW1lOiAnb2JqZWN0X3Rocm93JywgdHlwZTogJ2JhcnJlbCd9OyBcclxuICAgIGxldCBzdG5lID0geyBuYW1lOiAnb2JqZWN0X3B1c2gnLCB0eXBlOiAnc3RvbmUnfTsgXHJcblxyXG4gICAgbGV0IHRwX2MgPSB7IG5hbWU6ICd0ZWxlcG9ydCcsIHR5cGU6ICcnLCB0ZWxlcG9ydFR5cGU6ICdyZWxhdGl2ZScsIGNhbWVGcm9tOiAnbGVmdCcsIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG5cclxuICAgIGxldCBpdGVtc0JvdHRvbSA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBicnJsLCAgICBicnJsLCAgICBicnJsLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBlbmVteSwgICBlbmVteSwgICBlbmVteSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBlbmVteSwgICBlbmVteSwgICBlbmVteSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgYnJybCwgICAgYnJybCwgICAgYnJybCwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZW5lbXksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGJycmwsICAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHN0bmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGJycmwsICAgIGZhbHNlLCAgIGJycmwsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfYywgICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgc3RuZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgYnJybCwgICBmYWxzZSwgICBzdG5lLCAgICBmYWxzZSwgICBicnJsLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBzdG5lLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBicnJsLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXTtcclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBpdGVtc0JvdHRvbS5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0VuZW15OyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuY29uc3QgSGVhbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9IZWFsJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGlmZSBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihcImxpZmVcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5nZXRTdGFnZUlkKCkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgZjEsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG4gICAgbGV0IGJlcnJ5ID0geyBuYW1lOiAnaGVhbCcsIHR5cGU6ICdiZXJyeSd9OyBcclxuXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdib3R0b20nLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IGl0ZW1zQm90dG9tID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmaXJlLCAgIGJubmEsICAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBiZXJyeSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmaXJlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBiZXJyeSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmaXJlLCAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZpcmUsICBmaXJlLCAgIGZpcmUsICAgZmlyZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGJubmEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICBmaXJlLCAgIGZhbHNlLCAgIGZpcmUsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgYmVycnksICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdO1xyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIGl0ZW1zQm90dG9tLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpIHtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfTGlmZTsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfRmxvb3IgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggRmxvb3JcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpLCAxOTgwLCAxMDU1LCAzMiwgMzIpO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDFcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjQ5KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCIwMlwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg5MzApO1xyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBwbGF5ZXIuc2V0VGVsZXBvcnRpbmcoZmFsc2UpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfRmxvb3I7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX3dhbGwgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggV2FsbFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyksIDE5ODAsIDEwNTUsIDMyLCAzMik7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogZmFsc2VcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDczKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTM3KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDEzNik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE2KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMTcpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDc4KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoNzkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxMzkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIwMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJ3YXRlclwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcyg2MzMpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwib2JzdGFjbGVcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjUwKTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDI0KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNSk7XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV9taWRkbGVfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMTApO1xyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDg3KTtcclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDE0OCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uIFNpemVcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvbldpZHRoKCB0aGlzLmNodW5rU2l6ZSAqIDAuMyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCh0aGlzLnggKyB0aGlzLmNodW5rU2l6ZSAqIDAuNyk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIC8vIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxNDkpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvbiBTaXplXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25XaWR0aCggdGhpcy5jaHVua1NpemUgKiAwLjMgKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF93YWxsOyIsImNvbnN0IF9DYW5IdXJ0ID0gcmVxdWlyZSgnLi9fQ2FuSHVydCcpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBFbmVteSBleHRlbmRzIF9DYW5IdXJ0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJlbmVteVwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiAyXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuSHVydFByb3BzID0ge1xyXG4gICAgICBhbW91bnQ6IDFcclxuICAgIH1cclxuXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwge30sIGV2ZW50cywgY2FuSHVydFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50ID0gMTtcclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPSAxO1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpOyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50ID0gMDtcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gKCB3aW5kb3cuZ2FtZS5nYW1lUHJvcHMuZnBzIC8gMiApOyAvLyAxMDAwIC8gRlBTXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2VuZW15JyksIDMwMCwgOTYwLCAyMCwgNDApO1xyXG5cclxuICAgIHRoaXMuc3RlcCA9IG5ldyBPYmplY3QoKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgdGhpcy5pbml0aWFsU3RlcCA9IDI7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICB0aGlzLm1heFN0ZXBzID0gNDtcclxuXHJcbiAgICB0aGlzLmRpcmVjdGlvbkNvdW50ZG93biA9IDA7XHJcbiAgICB0aGlzLnJhbmREaXJlY3Rpb24gPSAxO1xyXG5cclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHgwO1xyXG4gICAgdGhpcy55ID0geTA7XHJcbiAgICBcclxuICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgdGhpcy55MCA9IHkwO1xyXG4gIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLnNwZWVkMCA9IDAuMjtcclxuICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc3BlZWQwO1xyXG4gICAgdGhpcy50eXBlID0gXCJlbmVteVwiO1xyXG4gICAgXHJcbiAgICAvLyAjIExpZmVcclxuICAgIHRoaXMuZGVmYXVsdExpZmVzID0gMjtcclxuICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgIHRoaXMuZGVhZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zdG9wUmVuZGVyaW5nTWUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgdGhpcy5odXJ0Q29vbERvd25UaW1lID0gMTAwMDsgLy8yc1xyXG5cclxuICAgIHRoaXMucGxheWVyQXdhcmVDaHVua3NEaXN0YW5jZTAgPSA1O1xyXG4gICAgdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlID0gdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlMDtcclxuICAgIHRoaXMucGxheWVyQXdhcmVEaXN0YW5jZSA9IHRoaXMuY2h1bmtTaXplICogdGhpcy5wbGF5ZXJBd2FyZUNodW5rc0Rpc3RhbmNlO1xyXG5cclxuICAgIHRoaXMuYXdhcmVPZlBsYXllciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMueEZyb21QbGF5ZXJEaXN0YW5jZSA9IDA7XHJcbiAgICB0aGlzLllGcm9tUGxheWVyRGlzdGFuY2UgPSAwO1xyXG5cclxuICAgIHRoaXMucnVuRW5lbXkoKTtcclxuICB9XHJcblxyXG4gIGlzRGVhZCgpIHsgcmV0dXJuIHRoaXMuZGVhZDsgfVxyXG4gIHNldERlYWQoYm9vbCkgeyB0aGlzLmRlYWQgPSBib29sOyB9XHJcblxyXG4gIG5lZWRTdG9wUmVuZGVyaW5nTWUoKSB7IHJldHVybiB0aGlzLnN0b3BSZW5kZXJpbmdNZTsgfVxyXG4gIHNldFN0b3BSZW5kZXJpbmdNZShib29sKSB7IHRoaXMuc3RvcFJlbmRlcmluZ01lID0gYm9vbDsgfVxyXG5cclxuICBpc0F3YXJlT2ZQbGF5ZXIoKSB7IHJldHVybiB0aGlzLmF3YXJlT2ZQbGF5ZXI7IH1cclxuICBzZXRBd2FyZU9mUGxheWVyKGJvb2wpIHsgdGhpcy5hd2FyZU9mUGxheWVyID0gYm9vbDsgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvblxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uSGVpZ2h0KHRoaXMuY29sbGlzaW9uSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvblkodGhpcy5jb2xsaXNpb25ZKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgc2V0U3ByaXRlUHJvcHNGcmFtZShzcHJpdGVBbmltYXRpb25Db3VudCl7XHJcbiAgICBzd2l0Y2goc3ByaXRlQW5pbWF0aW9uQ291bnQpIHsgXHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiAwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGUuZ2V0S2V5V2lkdGgoKSwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGUuZ2V0S2V5SGVpZ2h0KCkgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzIHN0YXRlIGZvciBlbmVteSBkaXJlY3Rpb25cclxuICBsb29rRG93bigpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZG93bic7XHJcbiAgICBcclxuICAgIC8vIFN0ZXBzXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgwKTtcclxuICAgIHRoaXMuc3RlcFsyXSA9IHRoaXMuc3ByaXRlLmdldEZyYW1lKDEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzKTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuXHJcbiAgfVxyXG4gIFxyXG4gIGxvb2tVcCgpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAndXAnO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxNSk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxNik7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxNyk7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgxOCk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG4gIFxyXG4gIGxvb2tSaWdodCgpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAncmlnaHQnO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMSk7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzMyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG4gICAgICBcclxuICBsb29rTGVmdCgpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLnN0ZXBbMV0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNCk7XHJcbiAgICB0aGlzLnN0ZXBbMl0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNSk7XHJcbiAgICB0aGlzLnN0ZXBbM10gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNik7XHJcbiAgICB0aGlzLnN0ZXBbNF0gPSB0aGlzLnNwcml0ZS5nZXRGcmFtZSgzNyk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgfVxyXG5cclxuICBkeWluZygpe1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZHlpbmcnO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5zdGVwWzFdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDApO1xyXG4gICAgdGhpcy5zdGVwWzJdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDEpO1xyXG4gICAgdGhpcy5zdGVwWzNdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDIpO1xyXG4gICAgdGhpcy5zdGVwWzRdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDMpO1xyXG4gICAgdGhpcy5zdGVwWzVdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoNDQpO1xyXG4gICAgdGhpcy5zdGVwWzZdID0gdGhpcy5zcHJpdGUuZ2V0RnJhbWUoMjkpOyAvLyBlbXB0eSBmcmFtZVxyXG4gICAgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gIH1cclxuXHJcbiAgLy8gIyBNb3ZlbWVudFxyXG4gIG1vdkxlZnQoaWdub3JlQ29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICBpZiggIWlnbm9yZUNvbGxpc2lvbiApIHdpbmRvdy5nYW1lLmNoZWNrQ29sbGlzaW9uKCB0aGlzICk7XHJcbiAgfTtcclxuICAgIFxyXG4gIG1vdlJpZ2h0KGlnbm9yZUNvbGxpc2lvbikgeyBcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gICAgXHJcbiAgbW92VXAoaWdub3JlQ29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgIGlmKCAhaWdub3JlQ29sbGlzaW9uICkgd2luZG93LmdhbWUuY2hlY2tDb2xsaXNpb24oIHRoaXMgKTtcclxuICB9O1xyXG4gICAgXHJcbiAgbW92RG93bihpZ25vcmVDb2xsaXNpb24pIHsgIFxyXG4gICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH07XHJcbiAgbW92VG9EZWF0aChpZ25vcmVDb2xsaXNpb24pIHtcclxuICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMuZHlpbmcoKSApO1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldFNwZWVkKCkpO1xyXG4gICAgaWYoICFpZ25vcmVDb2xsaXNpb24gKSB3aW5kb3cuZ2FtZS5jaGVja0NvbGxpc2lvbiggdGhpcyApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgRmlyZSBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICAvLyAjIFNldHNcclxuICAgICAgXHJcbiAgc2V0WCh4LCBzZXRDb2xsaXNpb24pIHsgXHJcbiAgICB0aGlzLnggPSB4OyBcclxuICAgIGlmKCBzZXRDb2xsaXNpb24gKSB0aGlzLnNldENvbGxpc2lvblgoIHggKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhICk7XHJcbiAgfVxyXG4gIHNldFkoeSwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgdGhpcy55ID0geTsgXHJcbiAgICBpZiggc2V0Q29sbGlzaW9uICkgdGhpcy5zZXRDb2xsaXNpb25ZKCB5ICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSApO1xyXG4gIH1cclxuXHJcbiAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuICBzZXRDb2xsaXNpb25ZKHkpIHsgdGhpcy5jb2xsaXNpb25ZID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgXHJcbiAgc2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplICogc3BlZWQ7IH1cclxuXHJcbiAgc2V0TG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKSB7IHRoaXMubG9va0RpcmVjdGlvbiA9IGxvb2tEaXJlY3Rpb247IH1cclxuICB0cmlnZ2VyTG9va0RpcmVjdGlvbihkaXJlY3Rpb24pIHsgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHRoaXMucmVzZXRTdGVwKCk7XHJcbiAgfVxyXG5cclxuICByZXNldFBvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5zZXRYKCB0aGlzLngwICk7XHJcbiAgICB0aGlzLnNldFkoIHRoaXMueTAgKTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmNvbGxpc2lvblkwICk7XHJcbiAgfVxyXG5cclxuICBodXJ0KCBhbW91bnQgKSB7XHJcbiAgICBpZiggdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBIdXJ0IHBsYXllclxyXG4gICAgICB0aGlzLmxpZmVzIC09IGFtb3VudDtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAwICkgdGhpcy5saWZlcyA9IDA7XHJcblxyXG4gICAgICAvLyBTdGFydCBjb29sZG93blxyXG4gICAgICB0aGlzLmNhbkJlSHVydCA9IGZhbHNlO1xyXG4gICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgcGxheWVyIGRpZWRcclxuICAgICAgdGhpcy5jaGVja015RGVhdGgoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNoZWNrTXlEZWF0aCgpIHtcclxuICAgIGlmKCB0aGlzLmxpZmVzIDwgMSApIHtcclxuICAgICAgdGhpcy5zZXREZWFkKHRydWUpO1xyXG5cclxuICAgICAgaWYoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwiZHlpbmdcIikgdGhpcy5zdGVwQ291bnQgPSAxOyAvLyBJZiBpdCdzIG5vdCBkeWluZywgcmVzZXQgYW5pbWF0aW9uIHN0ZXBcclxuICAgICAgdGhpcy5zZXRTcGVlZCgxLjMpOyAvLyBJbmNyZWFzZSBzcGVlZFxyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7IC8vIFByZXZlbnQgZW5lbXkgaHVydGluZyBwbGF5ZXIgd2hlbiBpbiBkZWF0aCBhbmltYXRpb25cclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDY7XHJcbiAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gODtcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAjIEdldHNcclxuICBcclxuICBnZXRMaWZlcygpIHsgcmV0dXJuIHRoaXMubGlmZXM7IH1cclxuICBcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gICAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgIFxyXG4gIC8vVGhlIGNvbGxpc2lvbiB3aWxsIGJlIGp1c3QgaGFsZiBvZiB0aGUgcGxheWVyIGhlaWdodFxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblg7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCBfeCApIHsgLy8gTWF5IGdldCBhIGN1c3RvbSBjZW50ZXJYLCB1c2VkIHRvIGNoZWNrIGEgZnV0dXJlIGNvbGxpc2lvblxyXG4gICAgbGV0IHggPSAoIF94ICkgPyBfeCA6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpO1xyXG4gICAgcmV0dXJuIHggKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyBcclxuICB9XHJcbiAgZ2V0Q2VudGVyWSggX3kgKSB7IFxyXG4gICAgbGV0IHkgPSAoIF95ICkgPyBfeSA6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpO1xyXG4gICAgcmV0dXJuIHkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgXHJcbiAgfVxyXG4gICAgXHJcbiAgZ2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcbiAgZ2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcbiAgICBcclxuICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgIFxyXG4gIGluY3JlYXNlU3RlcCgpIHtcclxuICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAvL0Rvbid0IHJlc2V0IGlmIGl0J3MgaW4gZGVhdGggYW5pbWF0aW9uXHJcbiAgICAgIGlmKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9PSBcImR5aW5nXCIgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLm1heFN0ZXBzO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5pbml0aWFsU3RlcDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXNldFN0ZXAoKSB7XHJcbiAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICBzd2l0Y2ggKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBoaWRlTWUoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7IH1cclxuICBzaG93KCkgeyB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTsgfVxyXG4gIFxyXG4gIC8vICMgRW5lbXkgUmVuZGVyICAgIFxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMubmVlZFN0b3BSZW5kZXJpbmdNZSgpICkgcmV0dXJuO1xyXG5cclxuICAgIC8vIEJsaW5rIEVuZW15IGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgIGlmKCAhIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICB0aGlzLmhpZGVTcHJpdGUgPSAhdGhpcy5oaWRlU3ByaXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSAmJiB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiAhPSBcImR5aW5nXCIgICkgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBcclxuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICB0aGlzLnNwcml0ZS5nZXRLZXlXaWR0aCgpLCB0aGlzLnNwcml0ZS5nZXRLZXlIZWlnaHQoKSwgXHJcbiAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICk7XHRcclxuXHJcbiAgICAvLyBQbGF5ZXIgQXdhcmVuZXNzIFxyXG4gICAgaWYoIHRoaXMuaXNBd2FyZU9mUGxheWVyKCkgKSB7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiNTBweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNDQzAwMDBcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCBcIiFcIiwgdGhpcy5nZXRYKCkgKyAoIHRoaXMuY2h1bmtTaXplICogMC4wMyApLCB0aGlzLmdldFkoKSArICggdGhpcy5jaHVua1NpemUgKiAwLjMgKSApOyBcclxuICAgIH1cclxuXHJcbiAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcblxyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSApO1xyXG5cclxuICAgICAgbGV0IHRleHQgPSBcIlg6IFwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFgoKSkgKyBcIiBZOlwiICsgTWF0aC5yb3VuZCh0aGlzLmdldFkoKSk7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDYwKTsgXHJcblxyXG4gICAgICB0ZXh0ID0gXCJkWDogXCIgKyBNYXRoLnJvdW5kKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgKSArIFwiIGRZOlwiICsgTWF0aC5yb3VuZCggdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlICk7XHJcbiAgICAgIGN0eC5mb250ID0gIFwiMjVweCAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KCB0ZXh0LCB0aGlzLmdldFgoKSAtIDIwLCB0aGlzLmdldFkoKSAtIDIwKTsgXHJcbiAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgfTtcclxuXHJcbi8vICMgRW5lbXkgQnJhaW5cclxuICBlbmVteUJyYWluKCkge1xyXG5cclxuICAgIGlmKCB3aW5kb3cuZ2FtZS5pc0dhbWVSZWFkeSgpICYmIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDaGVjayBEZWFkIGJlaGF2aW9yL2FuaW1hdGlvblxyXG4gICAgICBpZiggdGhpcy5pc0RlYWQoKSApIHtcclxuICAgICAgICBcclxuICAgICAgICAvL1doaWxlIG5vdCBvdXQgb2Ygc2NyZWVuXHJcbiAgICAgICAgaWYoIHRoaXMuZ2V0WCgpIDwgd2luZG93LmdhbWUuZ2FtZVByb3BzLmNhbnZhc1dpZHRoICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBTdGFydCBtb3Zpbmcgb3V0IG9mIHNjcmVlblxyXG4gICAgICAgICAgdGhpcy5tb3ZUb0RlYXRoKHRydWUpOyAvLyB0cnVlID0gaWdub3JlIGNvbGxpc2lvbiBjaGVja1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIE9rLCB0aGUgZW5lbXkgaXMgZGVhZCwgc3RvcCByZW5kZXJpbmcgbm93XHJcbiAgICAgICAgICB0aGlzLnNldFN0b3BSZW5kZXJpbmdNZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIH0gZWxzZSB7IC8vICMgTm90IGRlYWRcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQncyBuZWFyIGVub3VnaCBvZiBwbGF5ZXIgdG8gZ28gaW4gaGlzIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCBuZWFyUGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgd2luZG93LmdhbWUucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIC8vIENoZWNrIGRpc3RhbmNlIGJldHdlZW4gZW5lbXkgYW5kIHBsYXllclxyXG4gICAgICAgICAgdGhpcy54RnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWCgpIC0gcGxheWVyLmdldENlbnRlclgoKSApO1xyXG4gICAgICAgICAgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0Q2VudGVyWSgpIC0gcGxheWVyLmdldENlbnRlclkoKSApO1xyXG4gICAgICAgICAgLy9JZiBib3RoIGRpc3RhbmNlIGFyZSBiZWxvdyB0aGUgYXdhcmUgZGlzdGFuY2UsIHNldCB0aGlzIHBsYXllciB0byBiZSB0aGUgbmVhciBwbGF5ZXJcclxuICAgICAgICAgIGlmKCB0aGlzLnhGcm9tUGxheWVyRGlzdGFuY2UgPCB0aGlzLnBsYXllckF3YXJlRGlzdGFuY2UgJiYgdGhpcy5ZRnJvbVBsYXllckRpc3RhbmNlIDwgdGhpcy5wbGF5ZXJBd2FyZURpc3RhbmNlICkge1xyXG4gICAgICAgICAgICBuZWFyUGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgICBpZiggbmVhclBsYXllciApIHtcclxuXHJcbiAgICAgICAgICAvLyAjIFdhbGsgaW4gcGxheWVyIGRpcmVjdGlvblxyXG4gICAgICAgICAgdGhpcy5zZXRBd2FyZU9mUGxheWVyKHRydWUpO1xyXG5cclxuICAgICAgICAgIC8vIHBvc2l0aW9uc1xyXG4gICAgICAgICAgbGV0IFhlID0gdGhpcy5nZXRDb2xsaXNpb25YKCk7XHJcbiAgICAgICAgICBsZXQgWWUgPSB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuXHJcbiAgICAgICAgICBsZXQgWHAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblgoKTsgXHJcbiAgICAgICAgICBsZXQgWXAgPSBuZWFyUGxheWVyLmdldENvbGxpc2lvblkoKTsgXHJcblxyXG4gICAgICAgICAgbGV0IFhkaXN0YW5jZSA9IE1hdGguYWJzKFhlIC0gWHApOy8vIElnbm9yZSBpZiB0aGUgcmVzdWx0IGlzIGEgbmVnYXRpdmUgbnVtYmVyXHJcbiAgICAgICAgICBsZXQgWWRpc3RhbmNlID0gTWF0aC5hYnMoWWUgLSBZcCk7XHJcblxyXG4gICAgICAgICAgLy8gd2hpY2ggZGlyZWN0aW9uIHRvIGxvb2tcclxuICAgICAgICAgIGxldCBYZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIGxldCBZZGlyZWN0aW9uID0gXCJcIjtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgWGRpcmVjdGlvbiA9ICggWGUgPj0gWHAgKSA/ICdsZWZ0JyA6ICdyaWdodCc7XHJcbiAgICAgICAgICBZZGlyZWN0aW9uID0gKCBZZSA+PSBZcCApID8gJ3VwJyA6ICdkb3duJztcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gd2hlcmUgdG8gZ29cclxuICAgICAgICAgIGxldCBnb1RvRGlyZWN0aW9uID0gKCBYZGlzdGFuY2UgPiBZZGlzdGFuY2UgKSA/IFhkaXJlY3Rpb24gOiBZZGlyZWN0aW9uO1xyXG5cclxuICAgICAgICAgIC8vIElmIGhhcyBjb2xsaWRlZCBhIGxvdCwgY2hhbmdlIGRpcmVjdGlvbiB0byBhdm9pZCBnZXR0aW5nIHN0dWNrXHJcbiAgICAgICAgICBpZiggdGhpcy5jb2xsaXNpb25Db3VudCA+IDIwICkge1xyXG4gICAgICAgICAgICAvLyBTdG9wIGdvaW5nIG9uIHRoYXQgZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgIFRPRE86IFRoaW5rIGFib3V0IGl0ISFcclxuICAgICAgICAgICAgKi9cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gbW92ZVxyXG4gICAgICAgICAgc3dpdGNoKCBnb1RvRGlyZWN0aW9uICkge1xyXG4gICAgICAgICAgICBjYXNlICd1cCc6ICAgIHRoaXMubW92VXAoKTsgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzogdGhpcy5tb3ZSaWdodCgpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZG93bic6ICB0aGlzLm1vdkRvd24oKTsgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdsZWZ0JzogIHRoaXMubW92TGVmdCgpOyAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gIyBmYXIgZnJvbSBwbGF5ZXIsIHNvIGtlZXAgcmFuZG9tIG1vdmVtZW50XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIHRoaXMuc2V0QXdhcmVPZlBsYXllcihmYWxzZSk7XHJcblxyXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgc3RvcGVkIHRoZSBtb3ZlIGV2ZW50XHJcbiAgICAgICAgICBpZiggdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPD0gMCApIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5kRGlyZWN0aW9uID0gIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDcpICsgMTsgLy8gMSAtIDRcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24gPSAgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgMTA7IC8vIDEgLSA0XHJcbiAgICAgICAgICAgIC8vdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gTW92ZSBkaXJlY3Rpb24gbmVlZGVkXHJcbiAgICAgICAgICBzd2l0Y2goIHRoaXMucmFuZERpcmVjdGlvbiApIHtcclxuICAgICAgICAgICAgY2FzZSAxOiB0aGlzLm1vdlVwKCk7ICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiB0aGlzLm1vdlJpZ2h0KCk7ICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiB0aGlzLm1vdkRvd24oKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OiB0aGlzLm1vdkxlZnQoKTsgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA1OiAvLyBtb3JlIGNoYW5jZXMgdG8gZG9uJ3QgbW92ZVxyXG4gICAgICAgICAgICBjYXNlIDY6IFxyXG4gICAgICAgICAgICBjYXNlIDc6IFxyXG4gICAgICAgICAgICAgIHRoaXMucmVzZXRTdGVwKCk7IGJyZWFrOyAvLyBkb24ndCBtb3ZlXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgdGhpcy5kaXJlY3Rpb25Db3VudGRvd24tLTtcclxuICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIH0gLy8gaWYgZGVhZFxyXG5cclxuICAgIH0vL2lmIGdhbWUgcmVhZHlcclxuXHJcbiAgICBcclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5lbmVteUJyYWluLmJpbmQodGhpcykgKTtcclxuICB9XHJcblxyXG4vLyAjIENvbGxpc2lvblxyXG5cclxuICBjb2xsaXNpb24ob2JqKXsgXHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiApIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICB0aGlzLmNvbGxpc2lvbkNvdW50Kys7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IFxyXG4gIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICBydW5FbmVteSgpIHtcclxuICAgIC8vIGNoYW5nZSBsb29rIGRpcmVjdGlvblxyXG4gICAgdGhpcy5sb29rRGlyZWN0aW9uID0gdGhpcy5sb29rRG93bigpO1xyXG5cclxuICAgIC8vc3RhcnQgYWxnb3JpdG0gdGhhdCBtb3ZlcyBwbGF5ZXJcclxuICAgIHRoaXMuZW5lbXlCcmFpbigpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRW5lbXk7IiwiY29uc3QgX0Nhbkh1cnQgPSByZXF1aXJlKCcuL19DYW5IdXJ0Jyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIEZpcmUgZXh0ZW5kcyBfQ2FuSHVydCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiRmlyZVwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA0OSk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkh1cnRQcm9wcyA9IHtcclxuICAgICAgYW1vdW50OiAxXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5IdXJ0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAzO1xyXG4gICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQpICsgMTsgLy8gR2VuZXJhdGUgYSByYW5kIGluaXRpYWwgbnVtYmVyIHRvIHJhbmRvbWl6ZSBhbmltYXRpb24gaW4gY2FzZSBvZiBtdWx0aXBsZSBGaXJlc1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMC40OyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyAoIHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpICogMC42KTsgLy8gODAlIG9mIENodW5rIFNpemVcclxuXHJcbiAgICAvLyBDb250cm9scyB0aGUgc3ByaXRlIEZQUyBBbmltYXRpb25cclxuICAgIGxldCByYW5kRlBTID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNykgKyA1OyAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBGUFMsIHNvIG11bHRpcGxlIEZpcmVzIG9uIHBhZ2UgZG9uJ3QgYW5pbWF0ZSB0aGUgc2FtZSB3YXkgXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIHJhbmRGUFM7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25IZWlnaHQodGhpcy5jb2xsaXNpb25IZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh0aGlzLmNvbGxpc2lvblkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRTcHJpdGVQcm9wc0ZyYW1lKHNwcml0ZUFuaW1hdGlvbkNvdW50KXtcclxuICAgIHN3aXRjaChzcHJpdGVBbmltYXRpb25Db3VudCkgeyBcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygwKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgYmVmb3JlUmVuZGVyKCkge1xyXG4gICAgLy8gQW5pbWF0ZSBmaXJlXHJcbiAgICBpZiggdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCsrO1xyXG4gICAgICBpZiggdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA+IHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgKSB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRmlyZTsiLCJjb25zdCBfQ2FuQ29sbGVjdCA9IHJlcXVpcmUoJy4vX0NhbkNvbGxlY3QnKTtcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgSGVhbCBleHRlbmRzIF9DYW5Db2xsZWN0IHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBzdGFnZV9pZCkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IHN0YWdlX2lkICsgXCJfcG90aW9uXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfY29tbW9uJyksIDEwMDAsIDk4MCwgNTAsIDUwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuQ29sbGVjdFByb3BzID0ge1xyXG4gICAgICBjYW5SZXNwYXduOiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpO1xyXG5cclxuICAgIHRoaXMuaGFuZGxlUHJvcHMoKTtcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXRlbSBoYXMgc29tZSBzYXZlIHN0YXRlXHJcbiAgY2hlY2tTYXZlZEl0ZW1TdGF0ZSgpIHtcclxuICAgIGxldCBzYXZlZEl0ZW1zU3RhdGUgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19pdGVtc1N0YXRlJykgKTsgIFxyXG4gICAgaWYoIHNhdmVkSXRlbXNTdGF0ZSApIHtcclxuICAgICAgbGV0IGl0ZW1TYXZlZFN0YXRlID0gc2F2ZWRJdGVtc1N0YXRlW3RoaXMuZ2V0TmFtZSgpXTtcclxuICAgICAgaWYoIGl0ZW1TYXZlZFN0YXRlICYmICEgdGhpcy5jYW5SZXNwYXduKCkgJiYgaXRlbVNhdmVkU3RhdGUuY29sbGVjdGVkID09PSB0cnVlICl7IC8vIENoZWNrIGlmIGhhcyBzYXZlZCBzdGF0ZSBhbmQgY2FuJ3QgcmVzcGF3blxyXG4gICAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICB9XHJcblxyXG4gIHNldEhlYWxBbW91dChhbW91bnQpIHsgdGhpcy5oZWFsQW1vdXQgPSBhbW91bnQ7IH1cclxuICBnZXRIZWFsQW1vdW50KCkgeyByZXR1cm4gdGhpcy5oZWFsQW1vdXQ7IH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7IFxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdiYW5hbmEnOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyMCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2JlcnJ5JzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGUuZ2V0U3ByaXRlUHJvcHMoMjEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29sbGlzaW9uKHBsYXllcil7IFxyXG4gICAgaWYoICF0aGlzLmlzQ29sbGVjdGVkKCkgKSB7XHJcbiAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgcGxheWVyLmhlYWxQbGF5ZXIoIHRoaXMuZ2V0SGVhbEFtb3VudCgpICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxuICAvLyBIYW5kbGUgcHJvcHMgd2hlbiBsb2FkXHJcbiAgaGFuZGxlUHJvcHMoKSB7XHJcbiAgICBcclxuICAgIC8vIFNldCBQcm9wcyBiYXNlZCBvbiB0eXBlXHJcbiAgICBzd2l0Y2goIHRoaXMuZ2V0VHlwZSgpICkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgY2FzZSAnYmFuYW5hJzpcclxuICAgICAgICB0aGlzLnNldEhlYWxBbW91dCgxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYmVycnknOlxyXG4gICAgICAgIHRoaXMuc2V0TmVlZFNhdmVTdGF0ZSh0cnVlKTsgLy8gTWFrZSB0aGlzIGl0ZW0gYWJsZSB0byBzYXZlIHN0YXRlXHJcbiAgICAgICAgdGhpcy5zZXRIZWFsQW1vdXQoMik7XHJcbiAgICAgICAgdGhpcy5zZXRDYW5SZXNwYXduKGZhbHNlKTsgLy8gSXQgY2FuJ3QgcmVzcGF3biBpZiB1c2VkXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpdGVtIHdhcyBzYXZlZCBiZWZvcmUgYW5kIGNoYW5nZSBpdCBwcm9wc1xyXG4gICAgdGhpcy5jaGVja1NhdmVkSXRlbVN0YXRlKCk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBIZWFsOyIsImNvbnN0IF9DYW5CZVB1c2hlZCA9IHJlcXVpcmUoJy4vX0NhbkJlUHVzaGVkJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIE9iamVjdF9QdXNoIGV4dGVuZHMgX0NhbkJlUHVzaGVkIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJvYmplY3RcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpLFxyXG4gICAgICBoZWlnaHQ6IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhblB1c2ggPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IHRydWUsXHJcbiAgICAgIGNodW5ja3NQdXNoRGlzdGFuY2U6IDE1LFxyXG4gICAgICBodXJ0QW1vdW50OiAyXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5QdXNoKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGNhc2UgXCJzdG9uZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZS5nZXRTcHJpdGVQcm9wcygyNCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3RfUHVzaDsiLCJjb25zdCBfQ2FuVGhyb3cgPSByZXF1aXJlKCcuL19DYW5UaHJvdycpO1xyXG5jb25zdCBTcHJpdGUgPSByZXF1aXJlKCcuLi8uLi8uLi9lbmdpbmUvU3ByaXRlJyk7XHJcblxyXG5jbGFzcyBPYmplY3RfVGhyb3cgZXh0ZW5kcyBfQ2FuVGhyb3cge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTApIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIm9iamVjdFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCksXHJcbiAgICAgIGhlaWdodDogd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKClcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpLCAxMDAwLCA5ODAsIDUwLCA1MCk7XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiB0cnVlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsZXQgY2FuVGhyb3cgPSB7XHJcbiAgICAgIGNhblJlc3Bhd246IHRydWUsXHJcbiAgICAgIGNodW5ja3NUaHJvd0Rpc3RhbmNlOiA1LFxyXG4gICAgICBodXJ0QW1vdW50OiAyXHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5UaHJvdyk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBjYXNlIFwiYmFycmVsXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlLmdldFNwcml0ZVByb3BzKDIyKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdF9UaHJvdzsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9nYW1lUHJvcGVydGllcycpOyBcclxuY29uc3QgU3ByaXRlID0gcmVxdWlyZSgnLi4vLi4vLi4vZW5naW5lL1Nwcml0ZScpO1xyXG5cclxuY2xhc3MgVGVsZXBvcnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgsIHRlbGVwb3J0UHJvcHMpIHtcclxuICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICBuYW1lOiBcIlRlbGVwb3J0XCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSxcclxuICAgICAgaGVpZ2h0OiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKGZhbHNlLCAwLCAwLCAwLCAwKTtcclxuXHJcbiAgICBsZXQgZXZlbnRzID0ge1xyXG4gICAgICBzdG9wT25Db2xsaXNpb246IGZhbHNlLFxyXG4gICAgICBoYXNDb2xsaXNpb25FdmVudDogdHJ1ZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLnRlbGVwb3J0UHJvcHMgPSB0ZWxlcG9ydFByb3BzO1xyXG5cclxuICAgIHRoaXMueEluZGV4ID0geEluZGV4O1xyXG4gICAgdGhpcy55SW5kZXggPSB5SW5kZXg7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiAwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydCwgY29sbGlkYWJsZSwgY29sbGlzaW9uRGlyZWN0aW9uKXtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcnMgPSBjb2xsaWRhYmxlLnNjZW5hcmlvLmdldFBsYXllcnMoKTtcclxuXHJcbiAgICAvLyBJZiB0aGUgcGxheWVyIHRlbGVwb3J0cywgdGhlbiBjaGFuZ2Ugc3RhZ2VcclxuICAgIGlmKCB0aGlzLnRlbGVwb3J0KCBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydCApICkge1xyXG4gICAgICBcclxuICAgICAgLy8gTWFrZSBldmVyeXRoaW5nIGRhcmtcclxuICAgICAgY29sbGlkYWJsZS5zY2VuYXJpby5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgd2luZG93LmdhbWUubG9hZGluZyh0cnVlKTtcclxuXHJcbiAgICAgIC8vIEhpZGUgYWxsIHBsYXllcnNcclxuICAgICAgcGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuaGlkZVBsYXllcigpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFdhaXQgc29tZSB0aW1lXHJcbiAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBOb3cgdGVsZXBvcnQgYWxsIHBsYXllcnMgdG8gc2FtZSBsb2NhdGlvbiBhbmQgZGlyZWN0aW9uXHJcbiAgICAgICAgbGV0IHRhcmdldFggPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRYKCk7XHJcbiAgICAgICAgbGV0IHRhcmdldFkgPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRZKCk7XHJcbiAgICAgICAgbGV0IGxvb2tEaXJlY3Rpb24gPSBwbGF5ZXJXaG9BY3RpdmF0ZWRUZWxlcG9ydC5nZXRTcHJpdGVQcm9wcygpLmRpcmVjdGlvbjtcclxuICAgICAgICBcclxuICAgICAgICBwbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgICAgcGxheWVyLnNldFgodGFyZ2V0WCwgdHJ1ZSk7IC8vIHRydWUgPSBhbHNvIHNldCBjb2xsaXNpb24geCB0b29cclxuICAgICAgICAgIHBsYXllci5zZXRZKHRhcmdldFksIHRydWUpO1xyXG4gICAgICAgICAgcGxheWVyLnRyaWdnZXJMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pO1xyXG4gICAgICAgICAgcGxheWVyLnJlbW92ZUdyYWJlZE9iamVjdCgpO1xyXG4gICAgICAgICAgcGxheWVyLnNob3dQbGF5ZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2hhbmdlIHN0YWdlXHJcbiAgICAgICAgY29sbGlkYWJsZS5zY2VuYXJpby5zZXRTdGFnZSggXHJcbiAgICAgICAgICB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0U3RhZ2UsXHJcbiAgICAgICAgICBmYWxzZSAvLyBmaXJzdFN0YWdlID9cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB3aW5kb3cuZ2FtZS5sb2FkaW5nKGZhbHNlKTtcclxuICAgICAgfSwgMzAwKTtcclxuICAgICAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gV2hhdCBraW5kIG9mIHRlbGVwb3J0P1xyXG4gIHRlbGVwb3J0KCBwbGF5ZXIgKSB7XHJcbiAgICBcclxuICAgIGxldCBnYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuXHJcbiAgICBsZXQgdHlwZSA9IHRoaXMudGVsZXBvcnRQcm9wcy50ZWxlcG9ydFR5cGU7XHJcbiAgICBsZXQgdGFyZ2V0WCA9IDA7XHJcbiAgICBsZXQgdGFyZ2V0WSA9IDA7XHJcblxyXG4gICAgbGV0IHdpbGxUZWxlcG9ydCA9IGZhbHNlO1xyXG5cclxuICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0YXJnZXRYID0gdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFg7XHJcbiAgICAgICAgdGFyZ2V0WSA9IHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRZO1xyXG4gICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJyZWxhdGl2ZVwiOlxyXG4gICAgICAgIHN3aXRjaCAodGhpcy50ZWxlcG9ydFByb3BzLmNhbWVGcm9tKSB7XHJcbiAgICAgICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgICAgIHRhcmdldFggPSB0aGlzLnhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRZID0gKCAoZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlblZlcnRpY2FsQ2h1bmtzJykgLSAzICkgKiB0aGlzLmNodW5rU2l6ZSk7IC8vIC0zIGJlY2F1c2Ugb2YgdGhlIHBsYXllciBjb2xsaXNpb24gYm94XHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgICAgICB0YXJnZXRYID0gdGhpcy54SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WSA9IDAgKiB0aGlzLmNodW5rU2l6ZTsgLy8gVGVsZXBvcnQgdG8gWT0wLCBidXQgcGxheWVyIGhpdGJveCB3aWxsIG1ha2UgaGltIGdvIDEgdGlsZSBkb3duXHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIHRoaXMueUluZGV4ICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFggPSAxICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggdGhpcy55SW5kZXggKiB0aGlzLmNodW5rU2l6ZSkgLSB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WCA9ICggZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAtIDIgKSAqIHRoaXMuY2h1bmtTaXplOyBcclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9ubHkgdGVsZXBvcnRzIGlmIGl0IGNhbiB0ZWxlcG9ydFxyXG4gICAgaWYoIHdpbGxUZWxlcG9ydCApIHtcclxuICAgICAgcGxheWVyLnNldFgoIHRhcmdldFggKTsgLy8gYWx3YXlzIHVzaW5nIFggYW5kIFkgcmVsYXRpdmUgdG8gdGVsZXBvcnQgbm90IHBsYXllciBiZWNhdXNlIGl0IGZpeCB0aGUgcGxheWVyIHBvc2l0aW9uIHRvIGZpdCBpbnNpZGUgZGVzdGluYXRpb24gc3F1YXJlLlxyXG4gICAgICBwbGF5ZXIuc2V0WSggdGFyZ2V0WSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB3aWxsVGVsZXBvcnQ7XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVGVsZXBvcnQ7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBfQ2FuQmVQdXNoZWQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQmVQdXNoZWRQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jYW5Vc2UgPSB0cnVlO1xyXG4gICAgdGhpcy5fcHVzaCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhbkJlUHVzaGVkUHJvcHMuY2FuUmVzcGF3bjtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhbkJlUHVzaGVkUHJvcHMuaHVydEFtb3VudDtcclxuICAgIFxyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2UgPSBjYW5CZVB1c2hlZFByb3BzLmNodW5ja3NQdXNoRGlzdGFuY2UgKiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgIHRoaXMucHVzaFNwZWVkID0gMC44O1xyXG4gICAgdGhpcy5wdXNoRGlzdGFuY2VUcmF2ZWxsZWQgPSAwO1xyXG4gICAgdGhpcy5wdXNoTW92ZW1lbnQgPSBmYWxzZTtcclxuICAgIHRoaXMucHVzaERpcmVjdGlvbiA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnRhcmdldFggPSAwO1xyXG4gICAgdGhpcy50YXJnZXRZID0gMDtcclxuICB9XHJcblxyXG4gIGlzUHVzaGluZygpIHsgcmV0dXJuIHRoaXMuX3B1c2g7IH1cclxuICBzZXRQdXNoKGJvb2wpIHsgdGhpcy5fcHVzaCA9IGJvb2w7IH1cclxuICBnZXRQdXNoU3BlZWQoKSB7IHJldHVybiAgd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCkgKiB0aGlzLnB1c2hTcGVlZDsgfVxyXG4gIGNhbGN1bGF0ZVB1c2hEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgdGhpcy5wdXNoRGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgc3dpdGNoKCB0aGlzLnB1c2hEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpIC0gdGhpcy5wdXNoRGlzdGFuY2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB0aGlzLnB1c2hEaXN0YW5jZTsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHRoaXMucHVzaERpc3RhbmNlOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpIC0gdGhpcy5wdXNoRGlzdGFuY2U7ICBcclxuICAgICAgICB0aGlzLnRhcmdldFkgPSB0aGlzLmdldFkoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuX2NhblJlc3Bhd24gPSBib29sOyB9XHJcbiAgY2FuUmVzcGF3bigpIHsgcmV0dXJuIHRoaXMuX2NhblJlc3Bhd247IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxuICB1c2VIYW5kbGVyKGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5wdXNoKGRpcmVjdGlvbik7XHJcbiAgfVxyXG5cclxuICBzdG9wT2JqZWN0KCkge1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24odHJ1ZSk7XHJcbiAgICB0aGlzLnNldFB1c2goZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgcHVzaChkaXJlY3Rpb24pIHtcclxuICAgIHRoaXMuc2V0UHVzaCh0cnVlKTtcclxuICAgIHRoaXMuY2FsY3VsYXRlUHVzaERpcmVjdGlvbiggZGlyZWN0aW9uICk7XHJcbiAgfVxyXG5cclxuICBtb3ZlVG9QdXNoRGlyZWN0aW9uKCkge1xyXG4gICAgc3dpdGNoKCB0aGlzLnB1c2hEaXJlY3Rpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WSgpIDwgdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPiB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRQdXNoU3BlZWQoKSApO1xyXG4gICAgICAgIC8vQWRqdXN0IGlmIHBhc3NlcyBmcm9tIHRhcmdldCB2YWx1ZVxyXG4gICAgICAgIGlmICh0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgLy8gWVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFB1c2hTcGVlZCgpICk7XHJcbiAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0WCgpID4gdGhpcy50YXJnZXRYICkgdGhpcy51cGRhdGVYKCB0aGlzLnRhcmdldFggKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHRoaXMucHVzaERpc3RhbmNlVHJhdmVsbGVkICs9IHRoaXMuZ2V0UHVzaFNwZWVkKCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyLCBlbmVteSBhbmQgb2JqZWN0c1xyXG4gICAgdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb24oKTtcclxuXHJcbiAgfVxyXG5cclxuICBqdXN0Q2hlY2tDb2xsaXNpb24oKSB7XHJcbiAgICBsZXQgb2JqID0gd2luZG93LmdhbWUuY29sbGlzaW9uLmp1c3RDaGVja0FsbCh0aGlzLCB0aGlzLmdldENvbGxpc2lvblgoKSwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSwgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSk7IFxyXG4gICAgaWYgKCBvYmogJiYgdGhpcy5pc1B1c2hpbmcoKSApIHtcclxuICAgICAgc3dpdGNoKG9iai50eXBlKSB7XHJcbiAgICAgICAgY2FzZSAncGxheWVyJzpcclxuICAgICAgICAgIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdlbmVteSc6XHJcbiAgICAgICAgICBvYmouaHVydCh0aGlzLmh1cnRBbW91bnQpOyAvLyBodXJ0IGVuZW15XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgaWYoIG9iai5vdmVybGFwWCApIHRoaXMudXBkYXRlWCggb2JqLm92ZXJsYXBYICk7XHJcbiAgICAgICAgICBpZiggb2JqLm92ZXJsYXBZICkgdGhpcy51cGRhdGVZKCBvYmoub3ZlcmxhcFkgKTtcclxuICAgICAgICAgIHRoaXMuc3RvcE9iamVjdCgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICB9XHJcbiAgfVxyXG4gXHJcbiAgYmVmb3JlUmVuZGVyKCkge1xyXG4gICAgaWYoIHRoaXMuaXNQdXNoaW5nKCkgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmdldFgoKSAhPSB0aGlzLnRhcmdldFggfHwgdGhpcy5nZXRZKCkgIT0gdGhpcy50YXJnZXRZICkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvUHVzaERpcmVjdGlvbigpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RvcE9iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgICAgIFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NhbkJlUHVzaGVkOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgX0NhbkNvbGxlY3QgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fY2FuUmVzcGF3biA9IGNhbkNvbGxlY3RQcm9wcy5jYW5SZXNwYXduO1xyXG4gIH1cclxuXHJcbiAgaXNDb2xsZWN0ZWQoKSB7IHJldHVybiB0aGlzLmNvbGxlY3RlZDsgfVxyXG4gIGNvbGxlY3QoKXsgdGhpcy5jb2xsZWN0ZWQgPSB0cnVlOyB9XHJcbiAgc2V0Q29sbGVjdChib29sKSB7IHRoaXMuY29sbGVjdCA9IGJvb2w7IH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5Db2xsZWN0OyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgX0Nhbkh1cnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyxjYW5IdXJ0UHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICB0aGlzLmh1cnRBbW91bnQgPSBjYW5IdXJ0UHJvcHMuYW1vdW50O1xyXG4gIH1cclxuICBcclxuICAvLyBJZiBpdCdzIG5vdCBjb2xsaWRpbmcgdG8gYW55IHRlbGVwb3J0IGNodW5rIGFueW1vcmUsIG1ha2UgaXQgcmVhZHkgdG8gdGVsZXBvcnQgYWdhaW5cclxuICBjb2xsaXNpb24ob2JqKXsgXHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJwbGF5ZXJcIiApIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7XHJcbiAgICBpZiggb2JqLnR5cGUgPT0gXCJlbmVteVwiICkgb2JqLmh1cnQodGhpcy5odXJ0QW1vdW50KTtcclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG4gIGJlZm9yZVJlbmRlcihjdHgpIHtcclxuICAgIC8vIGRlYnVnIHBvc2l0aW9uXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICBsZXQgeCA9IE1hdGgucm91bmQodGhpcy5nZXRDb2xsaXNpb25YKCkpO1xyXG4gICAgICBsZXQgeSA9IE1hdGgucm91bmQodGhpcy5nZXRDb2xsaXNpb25ZKCkpO1xyXG4gICAgICBsZXQgdGV4dCA9IFwiWDogXCIgKyB4ICsgXCIgWTogXCIgKyB5O1xyXG4gICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcclxuICAgICAgY3R4LmZvbnQgPSBcIjI1cHggJ1ByZXNzIFN0YXJ0IDJQJ1wiO1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gJyNGRkZGRkYnO1xyXG4gICAgICBjdHguZmlsbFRleHQoIHRleHQsIHRoaXMuZ2V0WCgpIC0gMjAgLCB0aGlzLmdldFkoKSk7IFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0Nhbkh1cnQ7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IFNwcml0ZSA9IHJlcXVpcmUoJy4uLy4uLy4uL2VuZ2luZS9TcHJpdGUnKTtcclxuXHJcbmNsYXNzIF9DYW5UaHJvdyBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIHNwcml0ZSwgZXZlbnRzLCBjYW5Db2xsZWN0UHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICAgIHRoaXMuY2FuR3JhYiA9IHRydWU7XHJcbiAgICB0aGlzLmdyYWJiZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuX2NhblJlc3Bhd24gPSBjYW5Db2xsZWN0UHJvcHMuY2FuUmVzcGF3bjtcclxuICAgIHRoaXMuaHVydEFtb3VudCA9IGNhbkNvbGxlY3RQcm9wcy5odXJ0QW1vdW50O1xyXG4gICAgXHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2UgPSBjYW5Db2xsZWN0UHJvcHMuY2h1bmNrc1Rocm93RGlzdGFuY2UgKiB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuICAgIHRoaXMudGhyb3dTcGVlZCA9IDAuODtcclxuICAgIHRoaXMudGhyb3dEaXN0YW5jZVRyYXZlbGxlZCA9IDA7XHJcbiAgICB0aGlzLnRocm93aW5nTW92ZW1lbnQgPSBmYWxzZTtcclxuICAgIHRoaXMudGhyb3dEaXJlY3Rpb24gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy50YXJnZXRYID0gMDtcclxuICAgIHRoaXMudGFyZ2V0WSA9IDA7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvICggd2luZG93LmdhbWUuZ2FtZVByb3BzLmZwcyAqIDIgKTsgLy8gMTAwMCAvIEZQU1xyXG4gICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgIC8vIERlc3Ryb3kgYW5pbWF0aW9uIHByb3BzXHJcbiAgICB0aGlzLmRlc3Ryb3lpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuZGVzdHJveVNwcml0ZSA9IG5ldyBTcHJpdGUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKSwgMTAwMCwgOTgwLCA1MCwgNTApO1xyXG4gICAgdGhpcy5kZXN0cm95RnJhbWVDb3VudCA9IDE7XHJcbiAgICB0aGlzLmRlc3Ryb3lNYXhGcmFtZUNvdW50ID0gODtcclxuICAgIHRoaXMuZGVzdHJveUluaXRGcmFtZSA9IDM7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgRmlyZSBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgIGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICBpc0Rlc3Ryb3lpbmcoKSB7IHJldHVybiB0aGlzLmRlc3Ryb3lpbmc7IH1cclxuICBzZXREZXN0cm95aW5nKGJvb2wpIHsgdGhpcy5kZXN0cm95aW5nID0gYm9vbDsgfVxyXG5cclxuICBpc0dyYWJiZWQoKSB7IHJldHVybiB0aGlzLmdyYWJiZWQ7IH1cclxuICBncmFiKCl7IHRoaXMuZ3JhYmJlZCA9IHRydWU7IH1cclxuICBzZXRHcmFiKGJvb2wpIHsgdGhpcy5ncmFiYmVkID0gYm9vbDsgfVxyXG5cclxuICBpc1Rocm93aW5nKCkgeyByZXR1cm4gdGhpcy50aHJvd2luZ01vdmVtZW50OyB9XHJcbiAgc2V0VGhyb3dpbmcoYm9vbCkgeyB0aGlzLnRocm93aW5nTW92ZW1lbnQgPSBib29sOyB9XHJcbiAgZ2V0VGhyb3dTcGVlZCgpIHsgcmV0dXJuICB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKSAqIHRoaXMudGhyb3dTcGVlZDsgfVxyXG4gIGNhbGN1bGF0ZVRocm93RGlyZWN0aW9uKGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7IFxyXG4gICAgdGhpcy50aHJvd0RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHN3aXRjaCggdGhpcy50aHJvd0RpcmVjdGlvbiApIHtcclxuICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgLSB0aGlzLnRocm93RGlzdGFuY2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIHRoaXMudGFyZ2V0WCA9IHRoaXMuZ2V0WCgpOyAgXHJcbiAgICAgICAgdGhpcy50YXJnZXRZID0gdGhpcy5nZXRZKCkgKyB0aGlzLnRocm93RGlzdGFuY2UgKyB0aGlzLmdldEhlaWdodCgpICogMjsgXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSArIHRoaXMudGhyb3dEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICB0aGlzLnRhcmdldFggPSB0aGlzLmdldFgoKSAtIHRoaXMudGhyb3dEaXN0YW5jZTsgIFxyXG4gICAgICAgIHRoaXMudGFyZ2V0WSA9IHRoaXMuZ2V0WSgpICsgcGxheWVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0Q2FuUmVzcGF3bihib29sKXsgdGhpcy5fY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBjYW5SZXNwYXduKCkgeyByZXR1cm4gdGhpcy5fY2FuUmVzcGF3bjsgfVxyXG4gIFxyXG4gIHNldE5hbWUobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG4gIGdyYWJIYW5kbGVyKCApIHtcclxuICAgIHRoaXMuc2V0R3JhYih0cnVlKTtcclxuICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTsgLy8gYXZvaWQgcGxheWVycyBwdXNoaW5nIG90aGVyIHBsYXllcnMgd2l0aCBpdGVtc1xyXG4gIH1cclxuXHJcbiAgYnJlYWtPYmplY3QoKSB7XHJcblxyXG4gICAgdGhpcy5zZXRUaHJvd2luZyhmYWxzZSk7XHJcbiAgICB0aGlzLnNldEdyYWIoZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG5cclxuICAgIC8vIFN0YXJ0IGRlc3Ryb3kgYW5pbWF0aW9uXHJcbiAgICB0aGlzLnNldERlc3Ryb3lpbmcodHJ1ZSk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIHRocm93KGRpcmVjdGlvbiwgcGxheWVySGVpZ2h0KSB7XHJcbiAgICB0aGlzLnNldFRocm93aW5nKHRydWUpO1xyXG4gICAgdGhpcy5jYWxjdWxhdGVUaHJvd0RpcmVjdGlvbiggZGlyZWN0aW9uLCBwbGF5ZXJIZWlnaHQgKTtcclxuICB9XHJcblxyXG4gIG1vdmVUb1Rocm93RGlyZWN0aW9uKCkge1xyXG4gICAgc3dpdGNoKCB0aGlzLnRocm93RGlyZWN0aW9uICkge1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAvLyBZXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSAvIDMgKTsgLy8gU2xvdyB0aGUgbW92ZW1lbnRcclxuICAgICAgICAvLyBYXHJcbiAgICAgICAgaWYgKCB0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG5cclxuICAgICAgICAvL0FkanVzdCBpZiBwYXNzZXMgZnJvbSB0YXJnZXQgdmFsdWVcclxuICAgICAgICBpZiAodGhpcy5nZXRZKCkgPiB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMudGFyZ2V0WSApO1xyXG4gICAgICAgIGlmICh0aGlzLmdldFgoKSA8IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgLy8gWVxyXG4gICAgICAgaWYgKCB0aGlzLmdldFkoKSA8IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFRocm93U3BlZWQoKSApO1xyXG4gICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICBpZiAoIHRoaXMuZ2V0WSgpID4gdGhpcy50YXJnZXRZICkgdGhpcy51cGRhdGVZKCB0aGlzLnRhcmdldFkgKTtcclxuICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgLy8gWVxyXG4gICAgICAgIGlmICggdGhpcy5nZXRZKCkgPCB0aGlzLnRhcmdldFkgKSB0aGlzLnVwZGF0ZVkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgLyAzICk7XHJcbiAgICAgICAgLy8gWFxyXG4gICAgICAgIGlmICggdGhpcy5nZXRYKCkgPCB0aGlzLnRhcmdldFggKSB0aGlzLnVwZGF0ZVgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRUaHJvd1NwZWVkKCkgKTtcclxuICAgICAgICAgLy9BZGp1c3QgaWYgcGFzc2VzIGZyb20gdGFyZ2V0IHZhbHVlXHJcbiAgICAgICAgIGlmICh0aGlzLmdldFkoKSA+IHRoaXMudGFyZ2V0WSApIHRoaXMudXBkYXRlWSggdGhpcy50YXJnZXRZICk7XHJcbiAgICAgICAgIGlmICh0aGlzLmdldFgoKSA+IHRoaXMudGFyZ2V0WCApIHRoaXMudXBkYXRlWCggdGhpcy50YXJnZXRYICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRocm93RGlzdGFuY2VUcmF2ZWxsZWQgKz0gdGhpcy5nZXRUaHJvd1NwZWVkKCk7XHJcblxyXG4gICAgLy8gQ2hlY2sgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyIGFuZCBlbmVteSBvbmx5XHJcbiAgICB0aGlzLmp1c3RDaGVja0NvbGxpc2lvbigpO1xyXG5cclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbigpIHtcclxuICAgIGxldCBvYmogPSB3aW5kb3cuZ2FtZS5jb2xsaXNpb24uanVzdENoZWNrKHRoaXMsIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpKTsgXHJcbiAgICBpZiAoIG9iaiAgJiYgdGhpcy5pc1Rocm93aW5nKCkgKSB7XHJcbiAgICAgIGlmKCBvYmoudHlwZSA9PSBcInBsYXllclwiICkge1xyXG4gICAgICAgIG9iai5odXJ0UGxheWVyKHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgcGxheWVyXHJcbiAgICAgICAgdGhpcy5icmVha09iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKCBvYmoudHlwZSA9PSBcImVuZW15XCIgKSB7IFxyXG4gICAgICAgIG9iai5odXJ0KHRoaXMuaHVydEFtb3VudCk7IC8vIGh1cnQgZW5lbXlcclxuICAgICAgICB0aGlzLmJyZWFrT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiBcclxuXHJcbiAgYmVmb3JlUmVuZGVyKGN0eCkge1xyXG4gICAgXHJcbiAgICAvLyBNb3ZlbWVudCB3aGlsZSB0aHJvd2luZ1xyXG4gICAgaWYoIHRoaXMuaXNUaHJvd2luZygpICkge1xyXG4gICAgICBpZiggdGhpcy5nZXRYKCkgIT0gdGhpcy50YXJnZXRYIHx8IHRoaXMuZ2V0WSgpICE9IHRoaXMudGFyZ2V0WSApIHtcclxuICAgICAgICB0aGlzLm1vdmVUb1Rocm93RGlyZWN0aW9uKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5icmVha09iamVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICAgICAgIFxyXG5cclxuICAgIC8vIERlc3Ryb3kgYW5pbWF0aW9uXHJcbiAgICBpZiggdGhpcy5pc0Rlc3Ryb3lpbmcoKSApIHtcclxuICAgICAgaWYoIHRoaXMuZGVzdHJveUZyYW1lQ291bnQgPCB0aGlzLmRlc3Ryb3lNYXhGcmFtZUNvdW50ICApIHtcclxuICAgICAgICBpZiggdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB0aGlzLmRlc3Ryb3lTcHJpdGUuZ2V0U3ByaXRlUHJvcHMoIHRoaXMuZGVzdHJveUluaXRGcmFtZSApO1xyXG4gICAgICAgICAgdGhpcy5kZXN0cm95SW5pdEZyYW1lKys7XHJcbiAgICAgICAgICB0aGlzLmRlc3Ryb3lGcmFtZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuVGhyb3c7IiwiY2xhc3MgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgc3ByaXRlLCBldmVudHMpIHtcclxuICAgICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xyXG4gICAgdGhpcy55ID0gcG9zaXRpb24ueTtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodDtcclxuXHJcbiAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgdGhpcy5jb2xsaXNpb25YID0gdGhpcy54O1xyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0gdGhpcy55O1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gd2luZG93LmdhbWUuZ2V0Q2h1bmtTaXplKCk7XHJcblxyXG4gICAgLy8gIyBFdmVudG9zXHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGV2ZW50cy5zdG9wT25Db2xsaXNpb247XHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZXZlbnRzLmhhc0NvbGxpc2lvbkV2ZW50O1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG5cclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZSA9IHNwcml0ZS5zdGFnZVNwcml0ZTtcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vdGhpcy5zcHJpdGVXaWR0aCA9IHNwcml0ZS53aWR0aDsgICBcclxuICAgIC8vdGhpcy5zcHJpdGVIZWlnaHQgPSBzcHJpdGUuaGVpZ2h0OyBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgdGhpcy5uYW1lID0gcHJvcHMubmFtZS5yZXBsYWNlKC9cXHMvZywnJykgKyBcIl9cIiArIHRoaXMueCArIFwieFwiICsgdGhpcy55O1xyXG4gICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubmVlZFNhdmVTdGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudHlwZSA9IHByb3BzLnR5cGU7XHJcblxyXG4gICAgdGhpcy5ydW4oIHByb3BzLnR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG5cclxuICB1cGRhdGVYKHgpIHtcclxuICAgIHRoaXMuc2V0WCh4KTtcclxuICAgIHRoaXMuc2V0Q29sbGlzaW9uWCh4KTtcclxuICB9XHJcbiAgdXBkYXRlWSh5KSB7XHJcbiAgICB0aGlzLnNldFkoeSk7XHJcbiAgICB0aGlzLnNldENvbGxpc2lvblkoeSk7XHJcbiAgfVxyXG4gICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICBzZXRDb2xsaXNpb25IZWlnaHQoaGVpZ2h0KSB7IHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0Q29sbGlzaW9uV2lkdGgod2lkdGgpIHsgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgLy8gISBNdXN0IGhhdmUgaW4gY2hpbGRzIENsYXNzXHJcbiAgfVxyXG5cclxuICBzZXRTdG9wT25Db2xsaXNpb24oYm9vbCl7XHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGJvb2w7XHJcbiAgfVxyXG5cclxuICAvLyAjIFZpc2liaWxpdHlcclxuICBoaWRlKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyB9XHJcbiAgc2hvdygpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuXHJcbiAgLy8gIyAgU3RhdGVcclxuICB3aWxsTmVlZFNhdmVTdGF0ZSgpIHsgIHJldHVybiB0aGlzLm5lZWRTYXZlU3RhdGU7IH1cclxuICBzZXROZWVkU2F2ZVN0YXRlKGJvb2wpeyB0aGlzLm5lZWRTYXZlU3RhdGUgPSBib29sOyB9XHJcblx0XHRcdFxyXG5cdC8vICMgR2V0c1xyXG4gIFxyXG4gIGdldE5hbWUoKSB7IHJldHVybiB0aGlzLm5hbWU7IH1cclxuXHJcbiAgZ2V0VHlwZSgpIHsgcmV0dXJuIHRoaXMudHlwZTsgfVxyXG4gIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHJcbiAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25IZWlnaHQ7IH1cclxuICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuXHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gIGdldENvbGxpc2lvblkoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgZ2V0Q2VudGVyWCggX3ggKSB7IC8vIE1heSBnZXQgYSBjdXN0b20gY2VudGVyWCwgdXNlZCB0byBjaGVjayBhIGZ1dHVyZSBjb2xsaXNpb25cclxuICAgIGxldCB4ID0gKCBfeCApID8gX3ggOiB0aGlzLmdldENvbGxpc2lvblgoKTtcclxuICAgIHJldHVybiB4ICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMjsgXHJcbiAgfVxyXG4gIGdldENlbnRlclkoIF95ICkgeyBcclxuICAgIGxldCB5ID0gKCBfeSApID8gX3kgOiB0aGlzLmdldENvbGxpc2lvblkoKTtcclxuICAgIHJldHVybiB5ICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDI7IFxyXG4gIH1cclxuXHJcbiAgLy8gSG9vayB0byBydW4gYmVmb3JlIHJlbmRlclxyXG4gIGJlZm9yZVJlbmRlcihjdHgpIHsgICB9XHJcblx0XHRcclxuXHQvLyAjIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuXHJcbiAgICB0aGlzLmJlZm9yZVJlbmRlcihjdHgpO1xyXG5cclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBsZXQgc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZVByb3BzO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5zcHJpdGUuZ2V0U3ByaXRlKCkgKSB7IC8vIE9ubHkgcmVuZGVyIHRleHR1cmUgaWYgaXQgd2FzIHNldCBiZWZvcmVcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3ByaXRlLmdldFNwcml0ZSgpLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgICBcclxuICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuXHJcbiAgICAgIGxldCBjb2xsaXNpb25fcHJvcHMgPSB7XHJcbiAgICAgICAgdzogdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCksXHJcbiAgICAgICAgeDogdGhpcy5nZXRDb2xsaXNpb25YKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRDb2xsaXNpb25ZKClcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3RvcE9uQ29sbGlzaW9uID8gXCJyZ2JhKDI1NSwwLDAsMC4yKVwiIDogXCJyZ2JhKDAsMjU1LDAsMC4yKVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QoY29sbGlzaW9uX3Byb3BzLngsIGNvbGxpc2lvbl9wcm9wcy55LCBjb2xsaXNpb25fcHJvcHMudywgY29sbGlzaW9uX3Byb3BzLmgpO1xyXG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yKVwiO1xyXG4gICAgICBjdHgubGluZVdpZHRoICAgPSA1O1xyXG4gICAgICBjdHguc3Ryb2tlUmVjdChjb2xsaXNpb25fcHJvcHMueCwgY29sbGlzaW9uX3Byb3BzLnksIGNvbGxpc2lvbl9wcm9wcy53LCBjb2xsaXNpb25fcHJvcHMuaCk7XHJcblxyXG4gICAgfVxyXG4gIFxyXG4gIH1cclxuICAgIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gTm8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgbm9Db2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gUnVucyB3aGVuIENsYXNzIHN0YXJ0cyAgXHJcbiAgcnVuKCB0eXBlICkge1xyXG4gICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NvbGxpZGFibGU7IiwiY2xhc3MgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHNjZW5hcmlvX2lkKXtcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICBcclxuICAgIHRoaXMud2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyU3RhcnRYID0gMDsgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WSA9IDA7IFxyXG5cclxuICAgIHRoaXMuc3RhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5zdGFnZUlkID0gXCJcIjtcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSB3aW5kb3cuZ2FtZS5nZXRDaHVua1NpemUoKTtcclxuXHJcbiAgICB0aGlzLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLnNjZW5hcmlvX2lkID0gc2NlbmFyaW9faWQ7XHJcbiAgfVxyXG5cclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcbiAgYWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20ucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcC5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBQbGF5ZXJzXHJcbiAgYWRkUGxheWVyKHBsYXllcikge1xyXG4gICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuICB9XHJcbiAgZ2V0UGxheWVycygpIHsgcmV0dXJuIHRoaXMucGxheWVyczsgfVxyXG5cclxuICAvLyAjIEdldHNcclxuICBnZXRDdHgoKSB7IHJldHVybiB0aGlzLmN0eDsgfVxyXG4gIGdldENhbnZhcygpIHsgcmV0dXJuIHRoaXMuY2FudmFzOyB9XHRcclxuXHJcbiAgZ2V0SWQoKSB7IHJldHVybiB0aGlzLnNjZW5hcmlvX2lkOyB9XHJcbiAgZ2V0QWN0dWFsU3RhZ2VJZCgpIHsgcmV0dXJuIHRoaXMuc3RhZ2VJZDsgfVxyXG4gICAgICAgICAgICAgIFxyXG4gIGdldFN0YXRpY0l0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zX19ib3R0b20oKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbTsgfVxyXG4gIGdldExheWVySXRlbXNfX3RvcCgpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMVN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjFTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFk7IH1cclxuICBcclxuICBnZXRQbGF5ZXIyU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMlN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WTsgfVxyXG4gIFxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllcjFTdGFydFgoeCkgeyB0aGlzLnBsYXllcjFTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMVN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMVN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0UGxheWVyMlN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMlN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIyU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIyU3RhcnRZID0geTsgfVxyXG5cclxuICBzZXRBY3R1YWxTdGFnZUlkKGlkKXsgdGhpcy5zdGFnZUlkID0gaWQ7IH1cclxuXHJcbiAgLy8gIyBTYXZlIHRoZSBTdGF0ZSBvZiBpdGVtc1xyXG4gIHNhdmVJdGVtc1N0YXRlKCkge1xyXG5cclxuICAgIC8vIEJvdHRvbSBMYXllclxyXG4gICAgdGhpcy5zdGFnZS5nZXRMYXllckl0ZW1zX19ib3R0b20oKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpZiggaXRlbS53aWxsTmVlZFNhdmVTdGF0ZSgpICkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmFkZEl0ZW1TdGF0ZShcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgJ25hbWVfaWQnOiBpdGVtLmdldE5hbWUoKSxcclxuICAgICAgICAgICAgJ2NvbGxlY3RlZCc6IGl0ZW0uaXNDb2xsZWN0ZWQoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRvcCBMYXllclxyXG4gICAgdGhpcy5zdGFnZS5nZXRMYXllckl0ZW1zX190b3AoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpZiggaXRlbS53aWxsTmVlZFNhdmVTdGF0ZSgpICkge1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLmFkZEl0ZW1TdGF0ZShcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgJ25hbWVfaWQnOiBpdGVtLmdldE5hbWUoKSxcclxuICAgICAgICAgICAgJ2NvbGxlY3RlZCc6IGl0ZW0uaXNDb2xsZWN0ZWQoKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5nYW1lLnNhdmVJdGVtc1N0YXRlKCk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gRnVuY3Rpb25zIHRvIGxvYWQgc2VsZWN0ZWQgc3RhZ2VcclxuICBsb2FkU3RhZ2Uoc3RhZ2UsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgdGhpcy5zdGFnZSA9IHN0YWdlO1xyXG5cclxuICAgIC8vIENsZWFyIHByZXZpb3VzIHJlbmRlciBpdGVtc1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBTdGF0aWMgSXRlbXNcclxuICAgIHRoaXMuc3RhZ2UuZ2V0U3RhdGljSXRlbXMoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpdGVtLnNjZW5hcmlvID0gdGhpczsgLy8gUGFzcyB0aGlzIHNjZW5hcmlvIGNsYXNzIGFzIGFuIGFyZ3VtZW50LCBzbyBvdGhlciBmdW5jdGlvbnMgY2FuIHJlZmVyIHRvIHRoaXNcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKGl0ZW0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBBbmltYXRlZCBJdGVtcyAtIEJvdHRvbVxyXG4gICAgdGhpcy5zdGFnZS5nZXRMYXllckl0ZW1zX19ib3R0b20oKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpdGVtLnNjZW5hcmlvID0gdGhpcztcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShpdGVtKTtcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YWdlLmdldExheWVySXRlbXNfX3RvcCgpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKGl0ZW0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0IEFjdHVhbCBTdGFnZSBJRFxyXG4gICAgdGhpcy5zZXRBY3R1YWxTdGFnZUlkKCB0aGlzLnN0YWdlLmdldFN0YWdlSWQoKSApO1xyXG5cclxuICAgIC8vIE9ubHkgc2V0IHBsYXllciBzdGFydCBhdCBmaXJzdCBsb2FkXHJcbiAgICBpZihmaXJzdFN0YWdlKSB7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WCggdGhpcy5zdGFnZS5nZXRQbGF5ZXIxU3RhcnRYKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKCB0aGlzLnN0YWdlLmdldFBsYXllcjFTdGFydFkoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjJTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMlN0YXJ0WCgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXIyU3RhcnRZKCkgKTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TY2VuYXJpbzsiLCJjbGFzcyBfU3RhZ2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihzdGFnZUlkKSB7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHdpbmRvdy5nYW1lLmdldENodW5rU2l6ZSgpO1xyXG5cclxuICAgIHRoaXMucGxheWVyMVN0YXJ0WCA9IDA7XHJcbiAgICB0aGlzLnBsYXllcjFTdGFydFkgPSAwO1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllcjJTdGFydFggPSAwO1xyXG4gICAgdGhpcy5wbGF5ZXIyU3RhcnRZID0gMDtcclxuXHJcbiAgICB0aGlzLnN0YWdlSWQgPSBzdGFnZUlkO1xyXG4gIH1cclxuICBcclxuICAvLyAjIEdldHNcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b207IH1cclxuICBnZXRMYXllckl0ZW1zX190b3AoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcDsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuXHJcbiAgZ2V0U3RhZ2VJZCgpIHsgcmV0dXJuIHRoaXMuc3RhZ2VJZDsgfVxyXG4gIFxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllcjFTdGFydFgoeCkgeyB0aGlzLnBsYXllcjFTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMVN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMVN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0UGxheWVyMlN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMlN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIyU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIyU3RhcnRZID0geTsgfVxyXG4gIFxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRTdGF0aWNJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbS5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX3RvcChpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJ1biAoKSB7IH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU3RhZ2U7IiwiLy8gQ2xhc3MgdGhhdCBkZXRlY3RzIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciBhbmQgb3RoZXIgb2JqZWN0c1xyXG5jbGFzcyBDb2xsaXNpb24ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihzY2VuYXJpb1dpZHRoLCBzY2VuYXJpb0hlaWdodCwgcGxheWVyKSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zID0gbmV3IEFycmF5KCk7IC8vIEl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuICAgIHRoaXMuc2NlbmFyaW9XaWR0aCA9IHNjZW5hcmlvV2lkdGg7XHJcbiAgICB0aGlzLnNjZW5hcmlvSGVpZ2h0ID0gc2NlbmFyaW9IZWlnaHQ7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICB9XHJcblx0XHRcdFxyXG4gIC8vICMgQ2hlY2sgaWYgdGhlIG9iamVjdCBjb2xsaWRlcyB3aXRoIGFueSBvYmplY3QgaW4gdmVjdG9yXHJcbiAgLy8gQWxnb3JpdGhtIHJlZmVyZW5jZTogR3VzdGF2byBTaWx2ZWlyYSAtIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9czdxaVdMQkJwSndcclxuICBjaGVjayhvYmplY3QpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjEgPSBvYmplY3Q7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIHRoaXMuY2hlY2tDb2xsaXNpb24ocjEsIHIyKTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICAvLyBAcjE6IHRoZSBtb3Zpbmcgb2JqZWN0XHJcbiAgLy8gQHIyOiB0aGUgXCJ3YWxsXCJcclxuICBjaGVja0NvbGxpc2lvbihyMSwgcjIpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9IHIxLmdldENlbnRlclgoKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggcjEuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgXHJcbiAgICAgIHZhciBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICB2YXIgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZiggcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7XHJcbiAgICAgICAgaWYob3ZlcmxhcFggPj0gb3ZlcmxhcFkgKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWSggcjEuZ2V0Q29sbGlzaW9uWSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgaWYoIHIxLnR5cGUgPT0gJ3BsYXllcicgKSByMS51cGRhdGVHcmFiQ29sbGlzaW9uWFkoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblkoIHIxLmdldENvbGxpc2lvblkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblgoIHIxLmdldENvbGxpc2lvblgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGlmKCByMS50eXBlID09ICdwbGF5ZXInICkgcjEudXBkYXRlR3JhYkNvbGxpc2lvblhZKCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25YKCByMS5nZXRDb2xsaXNpb25YKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICBpZiggcjEudHlwZSA9PSAncGxheWVyJyApIHIxLnVwZGF0ZUdyYWJDb2xsaXNpb25YWSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1Z0NvbGxpc2lvbiApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGJldHdlZW4nLCByMS5uYW1lICsgXCIoXCIgKyByMS5nZXRYKCkgKyBcIi9cIiArIHIxLmdldFkoKSArIFwiKVwiLCByMi5uYW1lKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJpZ2dlcnMgQ29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLmNvbGxpc2lvbihyMiwgcjEpO1xyXG4gICAgICByMi5jb2xsaXNpb24ocjEsIHIyKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmlnZ2VycyBub3QgaW4gY29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLm5vQ29sbGlzaW9uKHIyLCByMik7IFxyXG4gICAgICByMi5ub0NvbGxpc2lvbihyMSwgcjIpOyBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvLyBKdXN0IGNoZWNrIGZvciBhIHNwZWNpZmljIGNvbGxpc2lvbiBhbmQgcmV0dXJuIHRoZSBmaXJ0IG9iamVjdCBjb2xsaWRlZFxyXG4gIGp1c3RDaGVjayhyMSwgX3gsIF95LCBfdywgX2gpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICBsZXQgciA9IHRoaXMuanVzdENoZWNrQ29sbGlzaW9uKHIxLCByMiwgX3gsIF95LCBfdywgX2gpO1xyXG4gICAgICBpZiggciApIHJldHVybiByOyAvLyBpZiBoYXMgc29tZXRoaW5nLCByZXR1cm4gYW5kIHN0b3AgbG9vcFxyXG4gICAgfSBcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGp1c3RDaGVja0NvbGxpc2lvbihyMSwgcjIsIF94LCBfeSwgX3csIF9oKSB7XHJcblxyXG4gICAgLy8gRG9uJ3QgY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gc2FtZSBvYmplY3RcclxuICAgIGlmKCByMS5uYW1lID09IHIyLm5hbWUgKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gKCBfeCArIF93IC8gMiApIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSAoIF95ICsgX2ggLyAyICkgLSByMi5nZXRDZW50ZXJZKCk7XHJcbiBcclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIF93IC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIF9oIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIHJldHVybiByMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgIFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIEp1c3QgY2hlY2sgZm9yIGEgc3BlY2lmaWMgY29sbGlzaW9uIGFuZCByZXR1cm4gdGhlIGZpcnQgb2JqZWN0IGNvbGxpZGVkXHJcbiAganVzdENoZWNrQWxsKHIxLCBfeCwgX3ksIF93LCBfaCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIGxldCByID0gdGhpcy5qdXN0Q2hlY2tDb2xsaXNpb25BbGwocjEsIHIyLCBfeCwgX3ksIF93LCBfaCk7XHJcbiAgICAgIGlmKCByICkgcmV0dXJuIHI7IC8vIGlmIGhhcyBzb21ldGhpbmcsIHJldHVybiBhbmQgc3RvcCBsb29wXHJcbiAgICB9IFxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAganVzdENoZWNrQ29sbGlzaW9uQWxsKHIxLCByMiwgX3gsIF95LCBfdywgX2gpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9ICggX3ggKyBfdyAvIDIgKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gKCBfeSArIF9oIC8gMiApIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG4gXHJcbiAgICB2YXIgc3VtSGFsZldpZHRoID0gKCBfdyAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCBfaCAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgLy9jYWxjdWxhdGUgb3ZlcmxhcCBpZiBuZWVkIHRvIHN0b3Agb2JqZWN0XHJcbiAgICAgIGxldCBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICBsZXQgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZihvdmVybGFwWCA+PSBvdmVybGFwWSApeyAvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gVXAvRG93blxyXG4gICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgIHIyLm92ZXJsYXBZID0gcjEuZ2V0WSgpICsgb3ZlcmxhcFk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHIyLm92ZXJsYXBZID0gcjEuZ2V0WSgpIC0gb3ZlcmxhcFk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Ugey8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBMZWZ0L1JpZ2h0XHJcbiAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICByMi5vdmVybGFwWCA9IHIxLmdldFgoKSArIG92ZXJsYXBYO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByMi5vdmVybGFwWCA9IHIxLmdldFgoKSAtIG92ZXJsYXBYO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHIyO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlOyAgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuICBcdFx0XHJcblx0Ly8gQWRkIGl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuXHRhZGRJdGVtKG9iamVjdCkge1xyXG5cdFx0dGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdCk7XHJcbiAgfTtcclxuICBcclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsZWFyQXJyYXlJdGVtcygpIHtcclxuICAgIHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG59Ly8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uO1xyXG5cdCIsImNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vZ2FtZVByb3BlcnRpZXMnKTtcclxuY29uc3Qgc2NlbmFyaW9Qcm90b3R5cGUgPSByZXF1aXJlKCcuLi9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlJyk7XHJcbmNvbnN0IHNjZW5hcmlvU2FuZGJveCA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3NjZW5hcmlvU2FuZGJveCcpO1xyXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuLi9hc3NldHMvUGxheWVyJyk7XHJcbmNvbnN0IENvbGxpc2lvbiA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uJyk7XHJcbmNvbnN0IFJlbmRlciA9IHJlcXVpcmUoJy4vUmVuZGVyJyk7XHJcbmNvbnN0IFVJID0gcmVxdWlyZSgnLi9VSScpO1xyXG5cclxuY2xhc3MgR2FtZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIEZQUyBDb250cm9sXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gbnVsbDsgXHJcbiAgICB0aGlzLm5vdyA9IG51bGw7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG51bGw7IFxyXG4gICAgdGhpcy5lbGFwc2VkID0gbnVsbDtcclxuXHJcbiAgICAvLyBFdmVudHNcclxuICAgIHRoaXMua2V5c0Rvd24gPSB7fTtcclxuICAgIHRoaXMua2V5c1ByZXNzID0ge307XHJcblxyXG4gICAgLy8gUGF1c2VcclxuICAgIHRoaXMuX3BhdXNlID0gZmFsc2U7XHJcbiAgICB0aGlzLmdhbWVJc0xvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEl0ZW1zXHJcbiAgICB0aGlzLml0ZW1zU3RhdGUgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgLy8gR2FtZVxyXG4gICAgICB0aGlzLmdhbWVQcm9wcyA9IG5ldyBnYW1lUHJvcGVydGllcygpO1xyXG4gICAgICB0aGlzLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24gPSBudWxsO1xyXG4gICAgICB0aGlzLmRlZmF1bHRTY2VuYXJpbyA9IFwic2FuZGJveFwiO1xyXG4gICAgICB0aGlzLnNjZW5hcmlvID0gbnVsbDtcclxuICAgICAgdGhpcy5VSSA9IG51bGw7XHJcblxyXG4gICAgICB0aGlzLmdhbWVSZWFkeSA9IGZhbHNlO1xyXG5cclxuICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUmVuZGVyc1xyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG51bGw7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbnVsbDtcclxuICAgICAgdGhpcy5yZW5kZXJVSSAgICAgPSBudWxsO1xyXG5cclxuICB9XHJcblxyXG4gIC8vIEdldHNcclxuICBpc0dhbWVSZWFkeSgpIHsgcmV0dXJuIHRoaXMuZ2FtZVJlYWR5OyB9XHJcbiAgZ2V0Q2h1bmtTaXplKCkgeyByZXR1cm4gdGhpcy5nYW1lUHJvcHMuY2h1bmtTaXplOyB9XHJcblxyXG4gIGdldENhbnZhc1dpZHRoKCkgIHsgcmV0dXJuIHRoaXMuZ2FtZVByb3BzLmNhbnZhc1dpZHRoOyAgfVxyXG4gIGdldENhbnZhc0hlaWdodCgpIHsgcmV0dXJuIHRoaXMuZ2FtZVByb3BzLmNhbnZhc0hlaWdodDsgfVxyXG5cclxuICBcclxuICAvLyBTZXRzXHJcbiAgc2V0R2FtZVJlYWR5KGJvb2wpIHsgdGhpcy5nYW1lUmVhZHkgPSBib29sOyB9XHJcbiAgXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIERlZmF1bHQgRXZlbnQgTGlzdGVuZXJzXHJcbiAgZGVmYXVsdEV2ZW50TGlzdGVuZXJzKCkge1xyXG5cclxuICAgIC8vIE1lbnUgQ2xpY2tzXHJcbiAgICBsZXQgbWVudUl0ZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZW51LWl0ZW0nKTtcclxuICAgIFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZW51SXRlbS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgX3RoaXMgPSB0aGlzO1xyXG4gICAgICBtZW51SXRlbVtpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm1lbnVBY3Rpb24oIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1hY3Rpb25cIikgKTtcclxuICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgS2V5Ym9hcmQgRXZlbnRzXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdGhpcy5rZXlzRG93bltlLmtleUNvZGVdID0gdHJ1ZTtcclxuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENsZWFyIHByZXZpb3VzIGtleXNcclxuICAgICAgZGVsZXRlIHRoaXMua2V5c0Rvd25bZS5rZXlDb2RlXTtcclxuICAgICAgXHJcbiAgICAgIC8vIFJlc2V0IHBsYXllcnMgbG9vayBkaXJlY3Rpb25cclxuICAgICAgaWYoIHRoaXMucGxheWVycykge1xyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHBsYXllci5yZXNldFN0ZXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gUGF1c2UgRXZlbnQgTGlzdGVuZXJcclxuICAgICAgaWYoIGUua2V5Q29kZSA9PSAyNyAmJiB0aGlzLmdhbWVJc0xvYWRlZCApIHsgLy8gRVNRXHJcbiAgICAgICAgdGhpcy50b2dnbGVQYXVzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQbGF5ZXIgaGFuZGxlIGtleXVwXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBwbGF5ZXIuaGFuZGxlS2V5VXAoZS5rZXlDb2RlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTdGFydC9SZXN0YXJ0IGEgR2FtZVxyXG5cclxuICBzdGFydE5ld0dhbWUoIHNhdmVEYXRhICkge1xyXG5cclxuICAgIC8vICMgSW5pdFxyXG4gICAgICBcclxuICAgICAgbGV0IGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcbiAgICAgIGxldCBjb250ZXh0U3RhdGljID0gY2FudmFzU3RhdGljLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBsZXQgY2FudmFzTGF5ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19sYXllcnMnKTtcclxuICAgICAgbGV0IGNvbnRleHRMYXllcnMgPSBjYW52YXNMYXllcnMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgXHJcbiAgICAgIGxldCBjYW52YXNVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfdWknKTtcclxuICAgICAgbGV0IGNvbnRleHRVSSA9IGNhbnZhc1VJLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjYW52YXNMYXllcnMud2lkdGggPSBjYW52YXNTdGF0aWMud2lkdGggPSBjYW52YXNVSS53aWR0aCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICAgIGNhbnZhc0xheWVycy5oZWlnaHQgPSBjYW52YXNTdGF0aWMuaGVpZ2h0ID0gY2FudmFzVUkuaGVpZ2h0ID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzSGVpZ2h0Jyk7XHJcblxyXG4gICAgLy8gIyBTY2VuYXJpb1xyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggdGhpcy5kZWZhdWx0U2NlbmFyaW8sIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmFyaW8gPSB0aGlzLmdldFNjZW5hcmlvKCBzYXZlRGF0YS5zY2VuYXJpby5zY2VuYXJpb0lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllciggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIxU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WSgpLCB0aGlzLmdhbWVQcm9wcywgMSApOyBcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm11bHRpcGxheWVyICkge1xyXG4gICAgICAgICAgbGV0IHBsYXllcjIgPSBuZXcgUGxheWVyKCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjJTdGFydFgoKSwgdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIyU3RhcnRZKCksIHRoaXMuZ2FtZVByb3BzLCAyICk7IFxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNjZW5hcmlvLmFkZFBsYXllcihwbGF5ZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG5cclxuICAgICAgICAgIGxldCBfcGxheWVyID0gbmV3IFBsYXllciggcGxheWVyLngsIHBsYXllci55LCB0aGlzLmdhbWVQcm9wcywgcGxheWVyLnBsYXllck51bWJlciwgcGxheWVyICk7IFxyXG5cclxuICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKCBfcGxheWVyKTtcclxuICAgICAgICAgIHRoaXMuc2NlbmFyaW8uYWRkUGxheWVyKF9wbGF5ZXIpO1xyXG5cclxuICAgICAgICB9KTsgIFxyXG4gICAgICB9XHJcbiAgICAvLyAjIFVJXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLlVJID0gbmV3IFVJKCB0aGlzLnBsYXllcnMsIHRoaXMuZ2FtZVByb3BzKTtcclxuXHJcbiAgICAvLyAjIENvbGxpc2lvbiBkZXRlY3Rpb24gY2xhc3NcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uID0gbmV3IENvbGxpc2lvbiggY2FudmFzTGF5ZXJzLndpZHRoLCBjYW52YXNMYXllcnMuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gIyBSZW5kZXJcclxuXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljID0gbmV3IFJlbmRlcihjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMpOyAvLyBSZW5kZXIgZXhlY3V0ZWQgb25seSBvbmNlXHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbmV3IFJlbmRlcihjb250ZXh0TGF5ZXJzLCBjYW52YXNMYXllcnMpOyAvLyBSZW5kZXIgd2l0aCBhbmltYXRlZCBvYmplY3RzIG9ubHlcclxuICAgICAgdGhpcy5yZW5kZXJVSSAgICAgPSBuZXcgUmVuZGVyKGNvbnRleHRVSSwgY2FudmFzVUkpOyBcclxuXHJcbiAgICAgIC8vIEFkZCBpdGVtcyB0byBiZSByZW5kZXJlZFxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyh0aGlzLnNjZW5hcmlvKTsgLy8gc2V0IHRoZSBzY2VuYXJpb1xyXG4gIFxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5NZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAvLyBTaG93IENhbnZhc1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUNhbnZhcycpLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnYW1lIGlzIG5vdCBwYXVzZWRcclxuICAgICAgdGhpcy51bnBhdXNlKCk7XHJcbiAgICBcclxuICAgIC8vIEZsYWcgXHJcbiAgICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgLy8gT2ssIHJ1biB0aGUgZ2FtZSBub3dcclxuICAgICAgdGhpcy5zZXRHYW1lUmVhZHkodHJ1ZSk7XHJcbiAgICAgIHRoaXMucnVuR2FtZSggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnZnBzJykgKTtcdC8vIEdPIEdPIEdPXHJcblxyXG4gIH0vL25ld0dhbWVcclxuXHJcbiAgICAvLyAjIFRoZSBHYW1lIExvb3BcclxuICAgIHVwZGF0ZUdhbWUoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc1BhdXNlZCgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgdGhpcy5yZW5kZXJVSS5zdGFydCggZGVsdGFUaW1lICk7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLnN0YXJ0KCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIC8vICMgQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSApO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgICAgIC8qdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmFkZEFycmF5SXRlbShwbGF5ZXIpO1xyXG4gICAgICB9KTsqL1xyXG4gIFxyXG4gICAgICAvLyBcIlN0YXRpY1wiIFJlbmRlciAtIEJhY2tncm91bmRcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLmFkZEFycmF5SXRlbSh0aGlzLnNjZW5hcmlvLmdldFN0YXRpY0l0ZW1zKCkpOyAvLyBHZXQgYWxsIGl0ZW1zIGZyb20gdGhlIHNjZW5hcmlvIHRoYXQgbmVlZHMgdG8gYmUgcmVuZGVyZWRcclxuXHJcbiAgICAgIC8vIExheWVycyBSZW5kZXJcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5jbGVhckFycmF5SXRlbXMoKTtcclxuXHJcbiAgICAgICAgLy8gIyBCb3R0b20gXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX2JvdHRvbSgpICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gIyBNaWRkbGVcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRJdGVtKCBwbGF5ZXIgKTsgLy8gQWRkcyB0aGUgcGxheWVyIHRvIHRoZSBhbmltYXRpb24gcmVuZGVyXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vICMgVG9wXHJcbiAgICAgICAgdGhpcy5yZW5kZXJMYXllcnMuYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIFVJIFJlbmRlclxyXG4gICAgICB0aGlzLnJlbmRlclVJLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLnJlbmRlclVJLmFkZEFycmF5SXRlbSggdGhpcy5VSS5nZXROZXdSZW5kZXJJdGVtcygpKTtcclxuICAgICAgXHJcbiAgICAgIC8vICMgTW92ZW1lbnRzXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuaGFuZGxlTW92ZW1lbnQoIHRoaXMua2V5c0Rvd24gKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyAjIENoZWNrIGlmIHBsYXllciBpcyBjb2xsaWRpbmdcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmNoZWNrKHBsYXllcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgXCJUaHJlYWRcIiB0aGEgcnVucyB0aGUgZ2FtZVxyXG4gICAgcnVuR2FtZShmcHMpIHtcclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgdGhpcy5nYW1lTG9vcCgpO1xyXG4gICAgfVxyXG4gICAgZ2FtZUxvb3AoKSB7XHJcblxyXG4gICAgICAvLyBjYWxjIGVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgdGhpcy5ub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aGlzLmVsYXBzZWQgPSB0aGlzLm5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG5cclxuICAgICAgLy8gaWYgZW5vdWdoIHRpbWUgaGFzIGVsYXBzZWQsIGRyYXcgdGhlIG5leHQgZnJhbWVcclxuICAgICAgaWYgKCB0aGlzLmVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIEdldCByZWFkeSBmb3IgbmV4dCBmcmFtZSBieSBzZXR0aW5nIHRoZW49bm93LCBidXQgYWxzbyBhZGp1c3QgZm9yIHlvdXJcclxuICAgICAgICAvLyBzcGVjaWZpZWQgZnBzSW50ZXJ2YWwgbm90IGJlaW5nIGEgbXVsdGlwbGUgb2YgUkFGJ3MgaW50ZXJ2YWwgKDE2LjdtcylcclxuICAgICAgICB0aGlzLmRlbHRhVGltZSA9IHRoaXMubm93IC0gKHRoaXMuZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUdhbWUoIHRoaXMuZGVsdGFUaW1lICk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSdW5zIG9ubHkgd2hlbiB0aGUgYnJvd3NlciBpcyBpbiBmb2N1c1xyXG4gICAgICAvLyBSZXF1ZXN0IGFub3RoZXIgZnJhbWVcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U2NlbmFyaW8oIHNjZW5hcmlvX2lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICkge1xyXG4gICAgICBzd2l0Y2goc2NlbmFyaW9faWQpIHtcclxuICAgICAgICBjYXNlIFwicHJvdG90eXBlXCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJzYW5kYm94XCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvU2FuZGJveChjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBNZW51XHJcbiAgXHJcbiAgLy8gQHBhdXNlZCBkZXRlcm1pbmUgaWYgdGhlIGdhbWUgY2FtZSBmcm9tIGEgcGF1c2UgYWN0aW9uIG9yIGEgbmV3IGdhbWUgKHdoZW4gcGFnZSBsb2FkcylcclxuICBtYWluTWVudShwYXVzZWQpIHsgXHJcbiAgICBcclxuICAgIGxldCBkaXZNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51Jyk7XHJcblxyXG4gICAgLy8gU2V0IG1haW5NZW51IGNsYXNzXHJcbiAgICAoIHBhdXNlZCApID8gZGl2TWVudS5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKSA6IGRpdk1lbnUuY2xhc3NMaXN0LmFkZCgnbmV3LWdhbWUnKTtcclxuICAgIFxyXG4gICAgLy8gVG9nZ2xlIE1lbnVcclxuICAgIGRpdk1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgLy8gSGFuZGxlIE1lbnUgQWN0aW9uXHJcbiAgICBtZW51QWN0aW9uKGFjdGlvbikge1xyXG4gICAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnY29udGludWUnOlxyXG4gICAgICAgICAgdGhpcy5jb250aW51ZUdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgdGhpcy5zYXZlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbG9hZCc6XHJcbiAgICAgICAgICB0aGlzLmxvYWRHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICduZXcnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5uZXdHYW1lKGZhbHNlKTsvLyBmYWxzZSA9IHdvbid0IGxvYWQgc2F2ZURhdGFcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldy0yLXBsYXllcnMnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gIFxyXG4gIC8vICMgTmV3IEdhbWVcclxuICBuZXdHYW1lKHNhdmVEYXRhKSB7XHJcbiAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB0aGlzLmxvYWRpbmcodHJ1ZSk7XHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhcnROZXdHYW1lKHNhdmVEYXRhKTsgXHJcbiAgICB9LCAxMDAwICk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgQ29udGludWVcclxuICBjb250aW51ZUdhbWUoKSB7XHJcbiAgICB0aGlzLnVucGF1c2UoKTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTYXZlXHJcbiAgc2F2ZUdhbWUoKSB7XHJcbiAgICBpZiggY29uZmlybSgnU2FsdmFyIG8gam9nbyBhdHVhbCBpcsOhIHNvYnJlZXNjcmV2ZXIgcXVhbHF1ZXIgam9nbyBzYWx2byBhbnRlcmlvcm1lbnRlLiBEZXNlamEgY29udGludWFyPycpICkge1xyXG4gICAgICBcclxuICAgICAgbGV0IHNhdmVEYXRhID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICAgICAgLy8gTXVsdGlwbGF5ZXJcclxuICAgICAgc2F2ZURhdGEubXVsdGlwbGF5ZXIgPSB0aGlzLm11bHRpcGxheWVyO1xyXG5cclxuICAgICAgLy8gU2NlbmFyaW9cclxuICAgICAgc2F2ZURhdGEuc2NlbmFyaW8gPSB7XHJcbiAgICAgICAgc2NlbmFyaW9JZDogdGhpcy5zY2VuYXJpby5nZXRJZCgpLFxyXG4gICAgICAgIHN0YWdlSWQ6IHRoaXMuc2NlbmFyaW8uZ2V0QWN0dWFsU3RhZ2VJZCgpLFxyXG4gICAgICAgIGl0ZW1zOiB0aGlzLmdldEl0ZW1zU3RhdGUoKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQbGF5ZXJzXHJcbiAgICAgIHNhdmVEYXRhLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHNhdmVEYXRhLnBsYXllcnMucHVzaCh7XHJcbiAgICAgICAgICBwbGF5ZXJOdW1iZXI6IHBsYXllci5nZXRQbGF5ZXJOdW1iZXIoKSxcclxuICAgICAgICAgIHg6IHBsYXllci5nZXRYKCksXHJcbiAgICAgICAgICB5OiBwbGF5ZXIuZ2V0WSgpLFxyXG4gICAgICAgICAgbGlmZXM6IHBsYXllci5nZXRMaWZlcygpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ29udmVydCB0byBKU09OXHJcbiAgICAgIHNhdmVEYXRhID0gSlNPTi5zdHJpbmdpZnkoc2F2ZURhdGEpO1xyXG4gICAgICBcclxuICAgICAgLy8gU2F2ZSBvbiBMb2NhbFN0b3JhZ2VcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX3NhdmUnLCBzYXZlRGF0YSApO1xyXG5cclxuICAgICAgYWxlcnQoJ0pvZ28gc2Fsdm8hJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgU2F2ZVxyXG4gIGxvYWRHYW1lKCkge1xyXG4gICAgXHJcbiAgICAvLyAjIEdldCBkYXRhIGZyb20gbG9jYWxzdG9yYWdlIGFuZCBjb252ZXJ0cyB0byBqc29uXHJcbiAgICBsZXQgc2F2ZURhdGEgPSBKU09OLnBhcnNlKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ3VmaXRydXBpX19zYXZlJykgKTtcclxuXHJcbiAgICBpZiggc2F2ZURhdGEgKSB7XHJcbiAgICAgIC8vIFdpbGwgYmUgIG11bHRpcGxheWVyIGdhbWU/XHJcbiAgICAgIHRoaXMubXVsdGlwbGF5ZXIgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5tdWx0aXBsYXllciA6IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUmVwbGFjZSBpdGVtcyBzdGF0ZSBvbiBsb2NhbCBzdG9yYWdlIHdpdGggc2F2ZWQgc3RhdGVzXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19pdGVtc1N0YXRlJywgSlNPTi5zdHJpbmdpZnkoIHNhdmVEYXRhLnNjZW5hcmlvLml0ZW1zICkgKTtcclxuXHJcbiAgICAgIC8vICMgTG9hZHMgYSBuZXcgZ2FtZSB3aXRoIHNhdmUgZGF0YVxyXG4gICAgICB0aGlzLm5ld0dhbWUoc2F2ZURhdGEpOyBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFsZXJ0KCdOw6NvIGjDoSBqb2dvIHNhbHZvIHByZXZpYW1lbnRlLicpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgUGF1c2VcclxuICBpc1BhdXNlZCgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlOyB9XHJcbiAgcGF1c2UoKSB7IFxyXG4gICAgdGhpcy5fcGF1c2UgPSB0cnVlOyBcclxuICAgIHRoaXMubWFpbk1lbnUodHJ1ZSk7XHJcbiAgfVxyXG4gIHVucGF1c2UoKSB7IFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5fcGF1c2UgPSBmYWxzZTsgIFxyXG4gIH1cclxuICB0b2dnbGVQYXVzZSgpIHsgKCB0aGlzLmlzUGF1c2VkKCkgKSA/IHRoaXMudW5wYXVzZSgpIDogdGhpcy5wYXVzZSgpIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGxvYWRpbmcoYm9vbCkge1xyXG4gICAgbGV0IGRpc3BsYXkgPSAoIGJvb2wgKSA/ICdmbGV4JyA6ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8qXHJcbiAgICBJdGVtcyBTdGF0ZVxyXG4gICAgLSBUaGlzIGFyZSBmdW5jdGlvbnMgdGhhdCBoYW5kbGVzIGl0ZW1zIHN0YXRlcyBiZXR3ZWVuIGNoYW5naW5nIG9mIHN0YWdlcy4gVGhpcyB3aWxsIG1ha2UgYW4gaXRlbSB0byBub3QgcmVzcGF3biBpZiBpdCB3YXMgY29sbGVjdGVkIGJlZm9yZVxyXG4gICovXHJcbiAgXHJcbiAgICBnZXRJdGVtc1N0YXRlKCkgeyByZXR1cm4gdGhpcy5pdGVtc1N0YXRlOyB9XHJcbiAgICBhZGRJdGVtU3RhdGUoIGl0ZW0gKSB7IFxyXG4gICAgICB0aGlzLml0ZW1zU3RhdGVbaXRlbS5uYW1lX2lkXSA9IGl0ZW07ICBcclxuICAgIH1cclxuXHJcbiAgICBzYXZlSXRlbXNTdGF0ZSgpIHtcclxuICAgICAgbGV0IGl0ZW1zU3RhdGUgPSBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXRJdGVtc1N0YXRlKCkgKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICdndWZpdHJ1cGlfX2l0ZW1zU3RhdGUnLCBpdGVtc1N0YXRlICk7XHJcbiAgICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuICBcclxuICAvLyBIZWxwZXJzIGZvciBjbGFzc2VzIHRvIGNoZWNrIGlmIGFuIG9iamVjdCBpcyBjb2xsaWRpbmcgXHJcbiAgY2hlY2tDb2xsaXNpb24oIG9iamVjdCApIHtcclxuICAgIGlmKCB0aGlzLmlzR2FtZVJlYWR5KCkgKVxyXG4gICAgICByZXR1cm4gdGhpcy5jb2xsaXNpb24uY2hlY2sob2JqZWN0KTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLypcclxuICAgIEZpdCBTY3JlZW4gZGl2IG9uIHdpbmRvdyBzaXplIFxyXG4gICovXHJcbiAgYWRqdXN0U2NyZWVuRGl2KCkge1xyXG4gICAgLy8gVE9ET1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFJ1blxyXG4gIHJ1bigpIHtcclxuXHJcbiAgICAvLyBIaWRlIEVsZW1lbnRzXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbk1lbnUnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUNhbnZhcycpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIHRoaXMubG9hZGluZyhmYWxzZSk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGhlIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5kZWZhdWx0RXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgIFxyXG4gICAgLy8gU2hvd3MgTWVudVxyXG4gICAgdGhpcy5tYWluTWVudShmYWxzZSk7XHJcblxyXG4gICAgLy8gQXV0byBsb2FkIGEgZ2FtZSAtIGRlYnVnIG1vZGVcclxuICAgIGlmKCB3aW5kb3cuYXV0b2xvYWQgKSB7XHJcbiAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaXQgbWVudSBvbiBzY3JlZW5cclxuICAgIHRoaXMuYWRqdXN0U2NyZWVuRGl2KCk7XHJcblxyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lOyIsImNsYXNzIFJlbmRlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBwbGF5ZXIpIHtcclxuICAgIHRoaXMuY3R4ID0gY3R4OyBcclxuICAgIHRoaXMuc2NlbmFyaW8gPSBcIlwiO1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIFxyXG4gIGdldEFycmF5SXRlbXMoKXsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBcclxuICAvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG4gIGFkZEl0ZW0ob2JqZWN0KXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG4gIH1cclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuICAgIGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpeyBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIHNldFNjZW5hcmlvKHNjZW5hcmlvKXtcclxuICAgIHRoaXMuc2NlbmFyaW8gPSBzY2VuYXJpbztcclxuICB9XHJcbiAgICAgICAgICAgIFxyXG4gIC8vIFRoaXMgZnVuY3Rpb25zIHdpbGwgYmUgY2FsbGVkIGNvbnN0YW50bHkgdG8gcmVuZGVyIGl0ZW1zXHJcbiAgc3RhcnQoZGVsdGFUaW1lKSB7XHRcdFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAvLyBDbGVhciBjYW52YXMgYmVmb3JlIHJlbmRlciBhZ2FpblxyXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgdGhpcy5jdHguc2hhZG93Qmx1ciA9IDA7XHJcblxyXG4gICAgLy8gU2NlbmFyaW9cclxuICAgIGlmICggdGhpcy5zY2VuYXJpbyAhPSBcIlwiKSBcclxuICAgICAgdGhpcy5zY2VuYXJpby5yZW5kZXIodGhpcy5jdHgpO1xyXG4gICAgICBcclxuICAgIC8vIFJlbmRlciBpdGVtc1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLnJlbmRlckl0ZW1zKSB7XHJcbiAgICAgIC8vIEV4ZWN1dGUgdGhlIHJlbmRlciBmdW5jdGlvbiAtIEluY2x1ZGUgdGhpcyBmdW5jdGlvbiBvbiBldmVyeSBjbGFzc1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zW2ldLnJlbmRlcih0aGlzLmN0eCwgZGVsdGFUaW1lKTtcclxuICAgIH1cclxuICAgIFxyXG4gIH1cclxuICAgIFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlciIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3ByaXRlLCB3LCBoLCBrVywga0gpIHtcclxuXHJcbiAgICAgICAgLy8gVGhlIEltYWdlIFNwcml0ZVxyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xyXG5cclxuICAgICAgICAvLyBTaXplIG9mIGltYWdlIHNwcml0ZSBcclxuICAgICAgICB0aGlzLndpZHRoID0gdztcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XHJcblxyXG4gICAgICAgIC8vIFNpemUgb2YgZWFjaCBmcmFtZSBzcXVhcmUgXHJcbiAgICAgICAgdGhpcy5rZXlXaWR0aCA9IGtXO1xyXG4gICAgICAgIHRoaXMua2V5SGVpZ2h0ID0ga0g7XHJcblxyXG4gICAgICAgIC8vIFJvd3MgYW5kIENvbGx1bW5zIHF1YW50aXR5XHJcbiAgICAgICAgdGhpcy5jb2xzID0gTWF0aC5jZWlsKCB0aGlzLndpZHRoIC8gdGhpcy5rZXlXaWR0aCApO1xyXG4gICAgICAgIHRoaXMucm93cyA9IE1hdGguY2VpbCggdGhpcy5oZWlnaHQgLyB0aGlzLmtleUhlaWdodCApO1xyXG5cclxuICAgICAgICAvLyBUaGUgZnJhbWVzXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMucnVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gIyBHZXRzXHJcbiAgICBnZXRTcHJpdGUoKSAgICB7IHJldHVybiB0aGlzLnNwcml0ZTsgfVxyXG4gICAgZ2V0RnJhbWUobnVtKSAgeyByZXR1cm4gdGhpcy5mcmFtZXNbbnVtXTsgfVxyXG4gICAgZ2V0S2V5V2lkdGgoKSAgeyByZXR1cm4gdGhpcy5rZXlXaWR0aDsgICAgfVxyXG4gICAgZ2V0S2V5SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5rZXlIZWlnaHQ7ICAgfVxyXG4gICAgZ2V0U3ByaXRlUHJvcHMobnVtKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2xpcF94OiB0aGlzLmdldEZyYW1lKG51bSkueCwgY2xpcF95OiB0aGlzLmdldEZyYW1lKG51bSkueSwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5nZXRLZXlXaWR0aCgpLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLmdldEtleUhlaWdodCgpIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyAjIFJ1blxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIC8vIEdlbiBlYWNoIGZyYW1lIGJhc2VkIG9uIHNpemVzIFxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgZm9yKCBsZXQgcj0wOyByPHRoaXMucm93cztyKysgKSB7XHJcbiAgICAgICAgICAgIGZvciggbGV0IGM9MDsgYzx0aGlzLmNvbHM7YysrICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXNbaW5kZXhdID0geyBcclxuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmtleVdpZHRoICogYyxcclxuICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLmtleUhlaWdodCAqIHJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlOyIsImNvbnN0IFVJaXRlbSA9IHJlcXVpcmUoJy4vX1VJaXRlbScpO1xyXG5jb25zdCBVSWl0ZW1fdGV4dCA9IHJlcXVpcmUoJy4vX1VJaXRlbV90ZXh0Jyk7XHJcblxyXG5jbGFzcyBVSSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHBsYXllcnMsIGdhbWVQcm9wcykge1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllcnMgPSBwbGF5ZXJzO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICAgIHRoaXMuZ2FtZVByb3BzID0gZ2FtZVByb3BzO1xyXG4gICAgdGhpcy5jaHVua1NpemUgPSB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG4gICAgICAgICAgICAgIFxyXG4gIC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcbiAgYWRkSXRlbShvYmplY3Qpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcbiAgfVxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7IFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgZ2V0UmVuZGVySXRlbXMoKXtcclxuICAgIHJldHVybiB0aGlzLnJlbmRlckl0ZW1zO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgYXJyYXkgYW5kIHJlcnVuIGNvZGUgdG8gZ2V0IG5ldyBpdGVtc1xyXG4gIGdldE5ld1JlbmRlckl0ZW1zKCkge1xyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRSZW5kZXJJdGVtcygpO1xyXG4gIH1cclxuXHJcbiAgLy8gTWF0aFxyXG4gIGZyb21SaWdodCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuICggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuSG9yaXpvbnRhbENodW5rcycpICogdGhpcy5jaHVua1NpemUgKSAtIHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgcnVuKCkge1xyXG5cclxuICAgIC8vICMgUGxheWVyc1xyXG5cclxuICAgICAgLy8gIyBQbGF5ZXIgMDFcclxuICAgICAgICBpZiggdGhpcy5wbGF5ZXJzWzBdICkge1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5jaHVua1NpemUsXHJcbiAgICAgICAgICAgIDUsIDUsIC8vIHgsIHksXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICAvLyBzcHJpdGVfdywgc3ByaXRlX2gsIFxyXG4gICAgICAgICAgICAwLCAwLCAgICAgIC8vIGNsaXBfeCwgY2xpcF95XHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSAvLyB3LCBoXHJcbiAgICAgICAgICApICk7XHJcblxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgbGV0IF8xeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8xbGlmZXMgPSB0aGlzLnBsYXllcnNbMF0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMWxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMXgsIF8xeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzF4ICs9IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMXggPSAxMjA7XHJcbiAgICAgICAgICAgICAgXzF5ID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAvLyAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gXHJcblxyXG4gICAgICAvLyAjIFBsYXllciAwMlxyXG4gICAgICAgIGlmKCB0aGlzLnBsYXllcnNbMV0gKSB7XHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgIHRoaXMuZnJvbVJpZ2h0KCAyMzAgKSwgNSwgXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICBcclxuICAgICAgICAgICAgNTAsIDAsICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSBcclxuICAgICAgICAgICkgKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzJ4ID0gdGhpcy5mcm9tUmlnaHQoIDUwICk7XHJcbiAgICAgICAgICBsZXQgXzJ5ID0gMTA7XHJcbiAgICAgICAgICBsZXQgXzJsaWZlcyA9IHRoaXMucGxheWVyc1sxXS5nZXRMaWZlcygpO1xyXG4gICAgICAgICAgZm9yKCBsZXQgaT0wOyBpPF8ybGlmZXM7aSsrICkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZEl0ZW0oIG5ldyBVSWl0ZW0oXHJcbiAgICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpLFxyXG4gICAgICAgICAgICAgIF8yeCwgXzJ5LFxyXG4gICAgICAgICAgICAgIDUwLCA1MCwgICBcclxuICAgICAgICAgICAgICAxMDAsIDAsICAgICAgXHJcbiAgICAgICAgICAgICAgdGhpcy5jaHVua1NpemUvMywgdGhpcy5jaHVua1NpemUvMyBcclxuICAgICAgICAgICAgKSApO1xyXG4gICAgICAgICAgICBfMnggLT0gMzU7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PSAyICkge1xyXG4gICAgICAgICAgICAgIF8yeCA9IHRoaXMuZnJvbVJpZ2h0KCA1MCApO1xyXG4gICAgICAgICAgICAgIF8yeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIC8vICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAgXHJcbiAgfVxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFVJIiwiY2xhc3MgVUlpdGVtIHtcclxuXHJcbiAgY29uc3RydWN0b3IoaXRlbVNwcml0ZUlELCBjaHVua1NpemUsIHgsIHksIHN3LCBzaCwgY3gsIGN5LCB3LCBoICkge1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuaXRlbVNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW1TcHJpdGVJRCk7XHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7XHJcbiAgICAgIHNwcml0ZV93aWR0aDogc3csXHJcbiAgICAgIHNwcml0ZV9oZWlnaHQ6IHNoLFxyXG4gICAgICBjbGlwX3g6IGN4LFxyXG4gICAgICBjbGlwX3k6IGN5LFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG5cclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IHc7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gaDsgLy9weFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTZXRzICAgICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICBcclxuICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIC8vICMgR2V0cyAgICAgICAgICAgIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICAgIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgIFxyXG4gIC8vICMgSXRlbSBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICAgIFxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgdGhpcy5pdGVtU3ByaXRlLCAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV9oZWlnaHQsIFxyXG4gICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICApO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgIFxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVSWl0ZW07XHJcbiIsImNsYXNzIFVJaXRlbV90ZXh0IHtcclxuXHJcbiAgY29uc3RydWN0b3IoIHRleHQsIHgsIHksIGZvbnQgKSB7XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG5cclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgIHRoaXMueCA9IHg7XHJcbiAgICB0aGlzLnkgPSB5O1xyXG4gIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLmZvbnQgPSBmb250O1xyXG5cclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTZXRzICAgICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgR2V0cyAgICAgICAgICAgIFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBJdGVtIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgICAgICBcclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG4gIFxyXG4gICAgY3R4LmZvbnQgPSAgdGhpcy5mb250LnNpemUgKyBcIiAnUHJlc3MgU3RhcnQgMlAnXCI7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5mb250LmNvbG9yO1xyXG4gICAgY3R4LmZpbGxUZXh0KCB0aGlzLnRleHQsIHRoaXMueCwgdGhpcy55KTsgXHJcblxyXG4gIH1cclxuICAgICAgIFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFVJaXRlbV90ZXh0O1xyXG4gICIsIi8vIEdhbWUgUHJvcGVydGllcyBjbGFzcyB0byBkZWZpbmUgY29uZmlndXJhdGlvbnNcclxuY2xhc3MgZ2FtZVByb3BlcnRpZXMge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIFxyXG4gICAgLy8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICBcclxuICAgIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyA9IDE2O1xyXG4gICAgdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyA9IDE0O1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbnZhc1dpZHRoID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5Ib3Jpem9udGFsQ2h1bmtzKTtcclxuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyk7Ly8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5mcHMgPSAyNDtcclxuICB9XHJcblxyXG4gIGdldFByb3AocHJvcCkge1xyXG4gICAgcmV0dXJuIHRoaXNbcHJvcF07XHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWVQcm9wZXJ0aWVzO1xyXG5cclxuLy8gR2xvYmFsIHZhbHVlc1xyXG5cclxuICAvLyBEZWJ1Z1xyXG4gIHdpbmRvdy5kZWJ1ZyA9IGZhbHNlOyAvLyBTaG93IGRlYnVnIHNxdWFyZXNcclxuICB3aW5kb3cuZGVidWdDb2xsaXNpb24gPSBmYWxzZTsgLy8gU2hvdyB3aGVuIG9iamVjdHMgY29sbGlkZVxyXG4gIHdpbmRvdy5hdXRvbG9hZCA9IHRydWU7IC8vIGF1dG8gbG9hZCBhIHNhdmVkIGdhbWVcclxuICB3aW5kb3cuZ29kX21vZGUgPSB0cnVlOyAvLyBQbGF5ZXJzIHdvbid0IGRpZSIsImNvbnN0IEdhbWUgPSByZXF1aXJlKCcuL2VuZ2luZS9HYW1lJyk7XHJcbmNvbnNvbGUuY2xlYXIoKTtcclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gIFxyXG4gIC8vICMgU3RhcnQgdGhlIGdhbWVcclxuICAgIGxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lID0gZ2FtZTtcclxuICAgIGdhbWUucnVuKCk7XHJcbiBcclxufSJdfQ==
