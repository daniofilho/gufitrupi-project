(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Player {

	constructor(x0, y0, gameProps, playerNumber, playerProps) {
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

      this.chunkSize = gameProps.getProp('chunkSize');
    
    // # Position
      this.x = x0;
      this.y = y0;
      
      this.x0 = x0; // initial position
      this.y0 = y0;
    
    // # Properties
      this.width = this.chunkSize; //px
      this.height = this.chunkSize * 2; //px
      
      this.speed0 = 6;
      this.speed = this.chunkSize / this.speed0;
      
      this.name = "Player " + playerNumber;
      this.playerNumber = playerNumber;
      
    // # Events  
      
      this.isCollidable = true;
      this.isMoving = false;
      this.hideSprite = false;
      this.hasCollisionEvent = false;
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
      this.setCollisionX( this.getCollisionX() - this.getSpeed()); 
    };
			
		movRight() { 
      this.increaseStep();
      this.setLookDirection( this.lookRight() );
      this.setX( this.getX() + this.getSpeed() ); 
      this.setCollisionX( this.getCollisionX() + this.getSpeed()); 
    };
			
		movUp() { 
      this.increaseStep();
      this.setLookDirection( this.lookUp() );
      this.setY( this.getY() - this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() - this.getSpeed() );
    };
			
		movDown() {  
      this.increaseStep();
      this.setLookDirection( this.lookDown() );
      this.setY( this.getY() + this.getSpeed() ); 
      this.setCollisionY( this.getCollisionY() + this.getSpeed() );
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
			
		setSpeed(speed) { this.speed = this.chunkSize / speed; }

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

    hurtPlayer( amount ) {
      if( this.canBeHurt ) {
        
        // Hurt player
        this.lifes -= amount;
        if( this.lifes < 0 ) this.lifes = 0;

        // Start cooldown
        this.canBeHurt = false;
        setTimeout( () => {
          this.canBeHurt = true;
          this.hideSprite = false; // avoid problems that
        }, this.hurtCoolDownTime);

        // Check if player died
        this.checkPlayerDeath();
      }
    }

    checkPlayerDeath() {
      if( this.lifes < 1 ) {
        /*this.hideSprite = false;
        this.canBeHurt = true;
        this.lifes = this.defaultLifes;
        this.resetPosition();*/
        window.game.newGame();
        // TODO: Make the game reset Scenario too!!!!
      }
    }
		
	// # Gets
    
    getLifes() { return this.lifes; }
    
    getPlayerNumber() { return this.playerNumber; }

	  getX() { return this.x; }
		getY() { return this.y; }
			
	  getWidth() { return this.width; }
    getHeight() { return this.height; }
      
    //The collision will be just half of the player height
    getCollisionHeight() { return this.collisionHeight; }
    getCollisionWidth() { return this.collisionWidth; }
    getCollisionX() {  return this.collisionX; }
    getCollisionY() {  return this.collisionY; }

    getCenterX() { return this.getCollisionX() + this.getCollisionWidth() / 2; }
    getCenterY() { return this.getCollisionY() + this.getCollisionHeight() / 2; }
			
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
        this.playerSprite,  
        this.spriteProps.clip_x, this.spriteProps.clip_y, 
        this.spriteProps.sprite_width, this.spriteProps.sprite_height, 
        props.x, props.y, props.w, props.h
      );	
      
      // DEBUG COLLISION
      if( window.debug ) {
        ctx.fillStyle = "rgba(0,0,255, 0.4)";
        ctx.fillRect( this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight() );
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

},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
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

  constructor(ctx, canvas, gameProps, saveData){
    super(ctx, canvas, gameProps, "prototype");
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;
    
    this.run();
  }

  // # Stages
  setStage(stage_id, firstStage) {
    
    this.clearArrayItems();
    
    let s_center = new _S_center( this.chunkSize );
    let s_up = new _S_up( this.chunkSize );
    let s_right = new _S_right( this.chunkSize );
    let s_bottom = new _S_bottom( this.chunkSize );
    let s_left = new _S_left( this.chunkSize );
    
    let _stage = null;

    // Check which stage will load
    switch(stage_id) {
      default:
      case 'center':
        _stage = s_center;
        break;
      case 'up':
        _stage = s_up;
        break;
      case 'left':
        _stage = s_left;
        break;
      case 'right':
        _stage = s_right;
        break;
      case 'bottom':
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
},{"../common/_Scenario":18,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Bottom extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "bottom");

    let player1StartX = chunkSize * 0;
    let player1StartY = chunkSize * 0;
    
    let player2StartX = chunkSize * 1;
    let player2StartY = chunkSize * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":15,"../../common/_Stage":19}],5:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');

class Prototype_Stage_Center extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "center");

    let player1StartX = chunkSize * 7;
    let player1StartY = chunkSize * 6;
    
    let player2StartX = chunkSize * 8;
    let player2StartY = chunkSize * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
        break;
      case "fire":
        return new Fire(item.type, x, y, this.chunkSize);
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
},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Fire":14,"../../common/Teleport":15,"../../common/_Stage":19}],6:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Left extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "left");

    let player1StartX = chunkSize * 0;
    let player1StartY = chunkSize * 0;
    
    let player2StartX = chunkSize * 1;
    let player2StartY = chunkSize * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":15,"../../common/_Stage":19}],7:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Right extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "right");

    let player1StartX = chunkSize * 0;
    let player1StartY = chunkSize * 0;
    
    let player2StartX = chunkSize * 1;
    let player2StartY = chunkSize * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":15,"../../common/_Stage":19}],8:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Up extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "up");

    let player1StartX = chunkSize * 0;
    let player1StartY = chunkSize * 0;
    
    let player2StartX = chunkSize * 1;
    let player2StartY = chunkSize * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);;
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":15,"../../common/_Stage":19}],9:[function(require,module,exports){
/*
  Sandbox Scenario
*/
const _Scenario = require('../common/_Scenario');

const _S_center = require('./stages/stage_center');
const _S_life = require('./stages/stage_life');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, gameProps, saveData){
    super(ctx, canvas, gameProps, "sandbox");
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;
    
    this.run();
  }

  // # Stages
  setStage(stage_id, firstStage) {
    
    this.clearArrayItems();
    
    let s_center = new _S_center( this.chunkSize );
    let s_life = new _S_life( this.chunkSize );
    
    let _stage = null;

    // Check which stage will load
    switch(stage_id) {
      default:
      case 'center':
        _stage = s_center;
        break;
      case 'life':
        _stage = s_life;
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
},{"../common/_Scenario":18,"./stages/stage_center":10,"./stages/stage_life":11}],10:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');

class Prototype_Stage_Center extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "center");

    let player1StartX = chunkSize * 7;
    let player1StartY = chunkSize * 6;
    
    let player2StartX = chunkSize * 8;
    let player2StartY = chunkSize * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
        break;
      case "fire":
        return new Fire(item.type, x, y, this.chunkSize);
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
      [ ob,       f1,    f1,    f1,    f1,    f1,     f1,        f1,    f1,        f1,     f1,     f1,     f1,     f1,     f1,     ob ],
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
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
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
},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Fire":14,"../../common/Teleport":15,"../../common/_Stage":19}],11:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Life extends _Stage{

  constructor(chunkSize) {
    super(chunkSize, "life");

    let player1StartX = chunkSize * 7;
    let player1StartY = chunkSize * 6;
    
    let player2StartX = chunkSize * 8;
    let player2StartY = chunkSize * 6;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
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
    
    let tp_c = { name: 'teleport', type: '', teleportType: 'relative', cameFrom: 'bottom',        targetStage: 'center' };

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
      [ false,   false,  false,   false,   false,   false,   false,   tp_c,   false,   false,   false,   false,   false,   false,   false,   false ],
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
},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":15,"../../common/_Stage":19}],12:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class Beach_Floor extends _Collidable {

	constructor(type, x0, y0, chunkSize) {
    
    let props = {
      name: "Beach Floor",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: chunkSize,
      height: chunkSize
    }

    let game = {
      chunkSize: chunkSize
    }

    let sprite = {
      width: 16,
      height: 16,
      stageSprite: document.getElementById('sprite_beach')
    }

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, game, sprite, events);
    
  }

  // # Sprites  
  setSpriteType(type) {
      
    switch(type) {
      
      case "01":
        this.spriteProps = { 
          clip_x: 214, clip_y: 9, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      
      case "02":
        this.spriteProps = { 
          clip_x: 214, clip_y: 94, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;

    }

  }

  collision(player){ 
    player.setTeleporting(false);
    return true; 
  }

}//class
module.exports = Beach_Floor;
},{"./_Collidable":17}],13:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class Beach_wall extends _Collidable {

	constructor(type, x0, y0, chunkSize) {
    
    let props = {
      name: "Beach Wall",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: chunkSize,
      height: chunkSize
    }

    let game = {
      chunkSize: chunkSize
    }

    let sprite = {
      width: 16,
      height: 16,
      stageSprite: document.getElementById('sprite_beach')
    }

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, game, sprite, events);

  }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      
      case "top":
        this.spriteProps = { 
          clip_x: 375, clip_y: 197, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "left":
        this.spriteProps = { 
          clip_x: 409, clip_y: 214, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "right":
        this.spriteProps = { 
          clip_x: 392, clip_y: 214, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "bottom":
        this.spriteProps = { 
          clip_x: 375, clip_y: 180, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "corner_top_left":
        this.spriteProps = { 
          clip_x: 460, clip_y: 10, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "corner_top_right":
        this.spriteProps = { 
          clip_x: 477, clip_y: 10, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "corner_bottom_left":
        this.spriteProps = { 
          clip_x: 460, clip_y: 27, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "corner_bottom_right":
        this.spriteProps = { 
          clip_x: 545, clip_y: 27, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      
      case "inner_corner_top_left":
        this.spriteProps = { 
          clip_x: 426, clip_y: 10, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "inner_corner_top_right":
        this.spriteProps = { 
          clip_x: 443, clip_y: 10, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "inner_corner_bottom_left":
        this.spriteProps = { 
          clip_x: 426, clip_y: 27, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "inner_corner_bottom_right":
        this.spriteProps = { 
          clip_x: 443, clip_y: 27, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "water":
        this.spriteProps = { 
          clip_x: 375, clip_y: 299, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
        
      case "obstacle":
        this.spriteProps = { 
          clip_x: 40, clip_y: 75, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      case "tree_top_left":
        this.spriteProps = { 
          clip_x: 693, clip_y:96, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        this.setStopOnCollision(false);
        break;
      case "tree_top_right":
        this.spriteProps = { 
          clip_x: 710, clip_y: 96, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        this.setStopOnCollision(false);
        break;
      case "tree_middle_left":
        this.spriteProps = { 
          clip_x: 692, clip_y: 11, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        this.setStopOnCollision(false);
        break;
      case "tree_middle_right":
        this.spriteProps = { 
          clip_x: 710, clip_y: 11, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        this.setStopOnCollision(false);
        break;
      case "tree_bottom_left":
        // Sprite
        this.spriteProps = { 
          clip_x: 625, clip_y: 11, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        // Collision Size
        this.setCollisionWidth( this.chunkSize * 0.3 );
        this.setCollisionX(this.x + this.chunkSize * 0.7);
        break;
      case "tree_bottom_right":
        // Sprite
        this.spriteProps = { 
          clip_x: 744, clip_y: 11, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        // Collision Size
        this.setCollisionWidth( this.chunkSize * 0.3 );
        break;
    }

  }

}//class
module.exports = Beach_wall;
},{"./_Collidable":17}],14:[function(require,module,exports){
const _CanHurt = require('./_CanHurt');

class Fire extends _CanHurt {

  constructor(type, x0, y0, chunkSize) {
    
    let props = {
      name: "Fire",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: chunkSize,
      height: chunkSize
    }

    let game = {
      chunkSize: chunkSize
    }

    let sprite = {
      width: 50,
      height: 50,
      stageSprite: document.getElementById('sprite_common')
    }

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    let canHurtProps = {
      amount: 1
    }

    super(props, position, dimension, game, sprite, events, canHurtProps);

    this.spriteAnimationCount = 1;
    this.spriteAnimationMaxCount = 3;

    this.collisionHeight = chunkSize * 0.4; // 80% of Chunk Size
    this.collisionY = y0 + ( chunkSize * 0.6); // 80% of Chunk Size

    // Controls the sprite FPS Animation
    this.fpsInterval = 1000 / 10; // 1000 / FPS
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
        this.spriteProps = { 
          clip_x: 0, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      case 2:
        this.spriteProps = { 
          clip_x: 50, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      case 3:
        this.spriteProps = { 
          clip_x: 100, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
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
},{"./_CanHurt":16}],15:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const gameProperties = require('../../../gameProperties'); 

class Teleport extends _Collidable {

	constructor(type, x0, y0, xIndex, yIndex, chunkSize, teleportProps) {
    
    let props = {
      name: "Teleport",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: chunkSize,
      height: chunkSize
    }

    let game = {
      chunkSize: chunkSize
    }

    let sprite = {
      width: 16,
      height: 16,
      stageSprite: false
    }

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    super(props, position, dimension, game, sprite, events);
    
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
},{"../../../gameProperties":26,"./_Collidable":17}],16:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class _CanHurt extends _Collidable {

  constructor(props, position, dimension, game, sprite, events,canHurtProps) {
    super(props, position, dimension, game, sprite, events);
    this.hurtAmount = canHurtProps.amount;
  }
  
  // If it's not colliding to any teleport chunk anymore, make it ready to teleport again
  collision(player){ 
    player.hurtPlayer(this.hurtAmount);
    return true; 
  }

}//class
module.exports = _CanHurt;
},{"./_Collidable":17}],17:[function(require,module,exports){
class _Collidable {

  constructor(props, position, dimension, game, sprite, events) {
      
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

    this.chunkSize = game.chunkSize;

    // # Eventos
    this.stopOnCollision = events.stopOnCollision;
    this.hasCollisionEvent = events.hasCollisionEvent;
  
    // # Sprite
    this.stageSprite = sprite.stageSprite;

    this.spriteWidth = sprite.width;   
    this.spriteHeight = sprite.height; 
    this.spriteProps = new Array();
    
    this.name = props.name + "(" + this.x + "/" + this.y + ")";

    this.run( props.type );
  }

  // # Sets
    
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
			
	// # Gets
			
  getX() { return this.x; }
  getY() { return this.y; }
  
  getWidth() { return this.width; }
  getHeight() { return this.height; }

  getCollisionHeight() { return this.collisionHeight; }
  getCollisionWidth() { return this.collisionWidth; }

  getCollisionX() { return this.collisionX; }
  getCollisionY() { return this.collisionY; }

  getCenterX() { return this.getCollisionX() + this.getCollisionWidth() /2; }
  getCenterY() { return this.getCollisionY() + this.getCollisionHeight() /2; }

  // Hook to run before render
  beforeRender() { }
		
	// # Render
  render(ctx) {

    this.beforeRender();
      
    let props = {
      x: this.getX(),
      y: this.getY(),
      w: this.getWidth(),
      h: this.getHeight()
    } 
    let spriteProps = this.spriteProps;
    
    if( this.stageSprite ) { // Only render texture if have it set
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.stageSprite,  
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
},{}],18:[function(require,module,exports){
class _Scenario {

  constructor(ctx, canvas, gameProps, scenario_id, saveData){
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
    
    this.chunkSize = gameProps.getProp('chunkSize');

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
},{}],19:[function(require,module,exports){
class _Stage {

  constructor(chunkSize, stageId) {
    
    this.renderItems = new Array();
    
    this.renderLayerItems = new Array();
    this.renderLayerItems__top = new Array();
    this.renderLayerItems__bottom = new Array();

    this.chunkSize = chunkSize;

    this.player1StartX = 0;
    this.player1StartY = 0;
    
    this.player2StartX = 0;
    this.player2StartY = 0;

    this.stageId = stageId;

    this.run();
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
},{}],20:[function(require,module,exports){
// Obstacle class

	function Enemy(ctx, player, name, x0, y0, movType, minX, maxX, minY, maxY, speed ) {
		
		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = 10; //px
				this.height = 50;
				
				this.color = "#F00"; 
				this.name = name;
				this.speed = speed;
			
			// # Movement
				this.player = player;
			
				
				this.mov = movType; //hor, ver <- movement types that the enemy can do
				
				this.minX = minX;
				this.minY = minY;
				this.maxX = maxX;
				this.maxY = maxY;
				
				this.movX = 1;
				this.movY = 1;
				
				this.enemy = new Object;
					this.enemy.width = this.width;
					this.enemy.height = this.height;

			// # Texture
				this.ctx = ctx;

				this.objCollision = new Collision( 0 , 0, this.player );
				
		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight =  function (height) { this.height = height; }
			this.setWidth =  function (width) { this.width = width; }
			
			this.setColor =  function (color) { this.color = color; }
			this.setName =  function (name) { this.name = name; }
	
		// - - - Gets - - -
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
			this.getHeight = function() { return this.height; }
			
			this.getColor = function() { return this.color; }


		// - - - Movement  - - -
				
				this.movHor = function (mod) {
					
					if ( this.movX == 1 ) {// go Right

						this.x = this.x + this.speed * mod;
						
						if (this.x >= this.maxX )
							this.movX = 0;
						
					} else {
					
						this.x = this.x - this.speed * mod;
						
						if (this.x < this.minX )
							this.movX = 1;
					
					}	

				}
				
				this.movVer = function (mod) {
					
					if ( this.movY == 1 ) {

						this.y = this.y + this.speed * mod;
						
						if (this.y >= this.maxY )
							this.movY = 0;
						
					} else {
					
						this.y = this.y - this.speed * mod;
						
						if (this.y < this.minY )
							this.movY = 1;
					
					}	
				}
				

		// - - - Render - - -
		
			this.render = function(context, mod) { 

					switch (this.mov) {
						
						case "hor":
							this.movHor(mod);
							break;
						
						case "ver":
							this.movVer(mod);
							break;

					}
					
				// Check if collides with player

					this.enemy.x = this.x;
					this.enemy.y = this.y;

					if ( this.objCollision.checkPlayerCollision(this.enemy) == true ) 
						this.collision(this.player);
					

				context.fillStyle = this.color;
				context.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
				
			};
			
			this.collision = function(object) {
				
				object.setColor("#333");
				object.resetPosition();
				return false;
				
			};

	}//class
},{}],21:[function(require,module,exports){
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
          } else {
            r1.setY( r1.getY() - overlapY );
            r1.setCollisionY( r1.getCollisionY() - overlapY );
          }
        } else {// Direction of collision - Left/Right
          if(catX > 0){ // Left
            r1.setX( r1.getX() + overlapX );
            r1.setCollisionX( r1.getCollisionX() + overlapX );
          } else {
            r1.setX( r1.getX() - overlapX );
            r1.setCollisionX( r1.getCollisionX() - overlapX );
          }
        }
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
	
},{}],22:[function(require,module,exports){
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

    // Pause
    this._pause = false;
    this.gameIsLoaded = false;

    // Game
      this.gameProps = null;
      this.players = new Array();
      this.collision = null;
      this.defaultScenario = "sandbox";
      this.scenario = null;
      this.UI = null;

      this.multiplayer = false;

      // Renders
      this.renderStatic = null;
      this.renderLayers = null;
      this.renderUI     = null;

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
      
      // Pause Event Listener
      if( e.keyCode == 27 && this.gameIsLoaded ) { // ESQ
        this.togglePause();
      }

    }.bind(this), false);

  }

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

  // # Start/Restart a Game

  startNewGame( saveData ) {

    // # Init
      this.gameProps = new gameProperties();

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
          return new scenarioPrototype(contextStatic, canvasStatic, this.gameProps, saveData );
          break;
        case "sandbox":
          return new scenarioSandbox(contextStatic, canvasStatic, this.gameProps, saveData );
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
        stageId: this.scenario.getActualStageId()
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

    // Will be  multiplayer game?
    this.multiplayer = saveData.multiplayer;

    // # Loads a new game with save data
    this.newGame(saveData); 

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

  }

}
module.exports = Game;
},{"../assets/Player":1,"../assets/scenario/Prototype/scenarioPrototype":3,"../assets/scenario/Sandbox/scenarioSandbox":9,"../gameProperties":26,"./Collision":21,"./Render":23,"./UI":24}],23:[function(require,module,exports){
class Render {

  constructor(ctx, canvas, player) {
    this.ctx = ctx; 
    this.scenario = "";
    this.canvas = canvas;
    this.player = player;
    this.renderItems = new Array(); 
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
},{}],24:[function(require,module,exports){
const UIitem = require('./_UIitem');

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
},{"./_UIitem":25}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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
  window.debug = false;

},{}],27:[function(require,module,exports){
const Game = require('./engine/Game');

window.onload = function() {

  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();

}
},{"./engine/Game":22}]},{},[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,26,27])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2NlbnRlci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfbGlmZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX0Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfV2FsbC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0ZpcmUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9UZWxlcG9ydC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19DYW5IdXJ0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX0NvbGxpZGFibGUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU2NlbmFyaW8uanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU3RhZ2UuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9lbmVtX3Byb3RvdHlwZS5qcyIsImNsaWVudC9lbmdpbmUvQ29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9HYW1lLmpzIiwiY2xpZW50L2VuZ2luZS9SZW5kZXIuanMiLCJjbGllbnQvZW5naW5lL1VJLmpzIiwiY2xpZW50L2VuZ2luZS9fVUlpdGVtLmpzIiwiY2xpZW50L2dhbWVQcm9wZXJ0aWVzLmpzIiwiY2xpZW50L21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBQbGF5ZXIge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih4MCwgeTAsIGdhbWVQcm9wcywgcGxheWVyTnVtYmVyLCBwbGF5ZXJQcm9wcykge1xyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgICAgaWYoIHBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfb25lJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoIHBsYXllck51bWJlciA9PSAyICkge1xyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfdHdvJyk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7XHJcbiAgICAgICAgc3ByaXRlX3dpZHRoOiAyMCwgLy8gUGxheWVyIHNpemUgaW5zaWRlIHNwcml0ZVxyXG4gICAgICAgIHNwcml0ZV9oZWlnaHQ6IDQwXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdGVwID0gW107XHJcbiAgICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgICB0aGlzLmluaXRpYWxTdGVwID0gMztcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICB0aGlzLm1heFN0ZXBzID0gODtcclxuXHJcbiAgICAgIC8vIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIEFuaW1hdGlvblxyXG4gICAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDEyOyAvLyAxMDAwIC8gRlBTXHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgIHRoaXMuY2h1bmtTaXplID0gZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICAgIHRoaXMueCA9IHgwO1xyXG4gICAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICB0aGlzLnkwID0geTA7XHJcbiAgICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5jaHVua1NpemU7IC8vcHhcclxuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNodW5rU2l6ZSAqIDI7IC8vcHhcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3BlZWQwID0gNjtcclxuICAgICAgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gdGhpcy5zcGVlZDA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLm5hbWUgPSBcIlBsYXllciBcIiArIHBsYXllck51bWJlcjtcclxuICAgICAgdGhpcy5wbGF5ZXJOdW1iZXIgPSBwbGF5ZXJOdW1iZXI7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBFdmVudHMgIFxyXG4gICAgICBcclxuICAgICAgdGhpcy5pc0NvbGxpZGFibGUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmlzTW92aW5nID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgICB0aGlzLmNvbGxpc2lvbldpZHRoID0gdGhpcy53aWR0aCAqIDAuODtcclxuICAgICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB0aGlzLmhlaWdodCAqIDAuMztcclxuICAgICAgdGhpcy5Db2xsaXNpb25YRm9ybXVsYSA9IHRoaXMud2lkdGggKiAwLjE7IC8vIFVzZWQgdG8gc2V0IGNvbGxpc2lvbiBYIHdoZW4gc2V0dGluZyBYIFxyXG4gICAgICB0aGlzLkNvbGxpc2lvbllGb3JtdWxhID0gdGhpcy5oZWlnaHQgKiAwLjc7IFxyXG4gICAgICB0aGlzLmNvbGxpc2lvblggPSB4MCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGE7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWSA9IHkwICsgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYTtcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWDAgPSB0aGlzLmNvbGxpc2lvblg7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uWTAgPSB0aGlzLmNvbGxpc2lvblk7XHJcblxyXG4gICAgXHJcbiAgICAgIC8vICMgTGlmZVxyXG4gICAgICB0aGlzLmRlZmF1bHRMaWZlcyA9IDY7XHJcbiAgICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy5odXJ0Q29vbERvd25UaW1lID0gMjAwMDsgLy8yc1xyXG5cclxuICAgICAgLy8gUGxheWVyIFByb3BzIGlmIGhhc1xyXG4gICAgICBpZiggcGxheWVyUHJvcHMgKSB7XHJcbiAgICAgICAgdGhpcy5saWZlcyA9IHBsYXllclByb3BzLmxpZmVzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNwcml0ZXMgc3RhdGUgZm9yIHBsYXllciBkaXJlY3Rpb25cclxuICAgIFxyXG4gICAgbG9va0Rvd24oKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZG93bic7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTdGVwc1xyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAyMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogMCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1VwKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiA0MCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rUmlnaHQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAncmlnaHQnO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiA4MCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cdFx0bG9va0xlZnQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAyMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogMTIwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIHBsYXllciBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICAgIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblx0XHRcdGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cdCAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gICAgXHJcblx0Ly8gIyBQbGF5ZXIgTW92ZW1lbnRcclxuXHRcdFxyXG5cdFx0bW92TGVmdCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZSaWdodCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblgoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlVwKCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSggdGhpcy5nZXRDb2xsaXNpb25ZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTtcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92RG93bigpIHsgIFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApIHtcclxuICAgICAgXHJcbiAgICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gUGxheWVyIDEgQ29udHJvbHNcclxuICAgICAgaWYoIHRoaXMucGxheWVyTnVtYmVyID09IDEgKSB7XHJcbiAgICAgICAgaWYgKDM3IGluIGtleXNEb3duKSAvLyBMZWZ0XHJcbiAgICAgICAgICB0aGlzLm1vdkxlZnQoKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgIGlmICgzOCBpbiBrZXlzRG93bikgLy8gVXAgIFxyXG4gICAgICAgICAgdGhpcy5tb3ZVcCgpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgaWYgKDM5IGluIGtleXNEb3duKSAvLyBSaWdodFxyXG4gICAgICAgICAgdGhpcy5tb3ZSaWdodCgpO1xyXG5cclxuICAgICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIC8vIERvd25cclxuICAgICAgICAgIHRoaXMubW92RG93bigpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMiBDb250cm9sc1xyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoNjUgaW4ga2V5c0Rvd24pIC8vIExlZnRcclxuICAgICAgICAgIHRoaXMubW92TGVmdCgpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgaWYgKDg3IGluIGtleXNEb3duKSAvLyBVcCAgXHJcbiAgICAgICAgICB0aGlzLm1vdlVwKCk7XHJcbiAgICAgICAgICBcclxuICAgICAgICBpZiAoNjggaW4ga2V5c0Rvd24pIC8vIFJpZ2h0XHJcbiAgICAgICAgICB0aGlzLm1vdlJpZ2h0KCk7XHJcblxyXG4gICAgICAgIGlmICg4MyBpbiBrZXlzRG93bikgLy8gRG93blxyXG4gICAgICAgICAgdGhpcy5tb3ZEb3duKCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcblxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBTZXRzXHJcblx0XHRcclxuXHRcdHNldFgoeCwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgICB0aGlzLnggPSB4OyBcclxuICAgICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWCggeCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgKTtcclxuICAgIH1cclxuICAgIHNldFkoeSwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgICB0aGlzLnkgPSB5OyBcclxuICAgICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWSggeSArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuXHRcdHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0c2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gc3BlZWQ7IH1cclxuXHJcblx0XHRzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG5cdFx0dHJpZ2dlckxvb2tEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgIH1cclxuXHJcblx0XHRyZXNldFBvc2l0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuY29sbGlzaW9uWTAgKTtcclxuICAgIH1cclxuXHJcbiAgICBodXJ0UGxheWVyKCBhbW91bnQgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBIdXJ0IHBsYXllclxyXG4gICAgICAgIHRoaXMubGlmZXMgLT0gYW1vdW50O1xyXG4gICAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMCApIHRoaXMubGlmZXMgPSAwO1xyXG5cclxuICAgICAgICAvLyBTdGFydCBjb29sZG93blxyXG4gICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IC8vIGF2b2lkIHByb2JsZW1zIHRoYXRcclxuICAgICAgICB9LCB0aGlzLmh1cnRDb29sRG93blRpbWUpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBwbGF5ZXIgZGllZFxyXG4gICAgICAgIHRoaXMuY2hlY2tQbGF5ZXJEZWF0aCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tQbGF5ZXJEZWF0aCgpIHtcclxuICAgICAgaWYoIHRoaXMubGlmZXMgPCAxICkge1xyXG4gICAgICAgIC8qdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubGlmZXMgPSB0aGlzLmRlZmF1bHRMaWZlcztcclxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTsqL1xyXG4gICAgICAgIHdpbmRvdy5nYW1lLm5ld0dhbWUoKTtcclxuICAgICAgICAvLyBUT0RPOiBNYWtlIHRoZSBnYW1lIHJlc2V0IFNjZW5hcmlvIHRvbyEhISFcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBHZXRzXHJcbiAgICBcclxuICAgIGdldExpZmVzKCkgeyByZXR1cm4gdGhpcy5saWZlczsgfVxyXG4gICAgXHJcbiAgICBnZXRQbGF5ZXJOdW1iZXIoKSB7IHJldHVybiB0aGlzLnBsYXllck51bWJlcjsgfVxyXG5cclxuXHQgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHRcdFx0XHJcblx0ICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgICAgIFxyXG4gICAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbldpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLyAyOyB9XHJcbiAgICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMjsgfVxyXG5cdFx0XHRcclxuXHRcdGdldENvbG9yKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG5cdFx0Z2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcbiAgICAgIFxyXG4gICAgZ2V0U3ByaXRlUHJvcHMoKSB7IHJldHVybiB0aGlzLnNwcml0ZVByb3BzOyB9XHJcbiAgICAgIFxyXG4gICAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgICBpZih0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgICAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRTdGVwKCkge1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICAgIGNhc2UgJ2xlZnQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyaWdodCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdkb3duJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHRcdGhpZGVQbGF5ZXIoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IHRydWU7IH1cclxuICAgIHNob3dQbGF5ZXIoKSB7IHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlOyB9XHJcbiAgICBcclxuXHQvLyAjIFBsYXllciBSZW5kZXJcclxuXHRcdFx0XHRcclxuXHQgIHJlbmRlcihjdHgpIHtcclxuXHJcbiAgICAgIC8vIEJsaW5rIHBsYXllciBpZiBpdCBjYW4ndCBiZSBodXJ0XHJcbiAgICAgIGlmKCAhIHRoaXMuY2FuQmVIdXJ0ICkge1xyXG4gICAgICAgIHRoaXMuaGlkZVNwcml0ZSA9ICF0aGlzLmhpZGVTcHJpdGU7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gV2hhdCB0byBkbyBldmVyeSBmcmFtZSBpbiB0ZXJtcyBvZiByZW5kZXI/IERyYXcgdGhlIHBsYXllclxyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgICAgfSBcclxuICAgICAgXHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSwgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfd2lkdGgsIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1x0XHJcbiAgICAgIFxyXG4gICAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwyNTUsIDAuNClcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMuZ2V0Q29sbGlzaW9uWCgpLCB0aGlzLmdldENvbGxpc2lvblkoKSwgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLCB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpICk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcblx0XHR9O1xyXG4gIFxyXG4gIC8vICMgQ29sbGlzaW9uXHJcbiAgICBcclxuICAgIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICAgIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gICAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuXHRcdG5vQ29sbGlzaW9uKCkge1xyXG5cdFx0XHQvLyBXaGF0IGhhcHBlbnMgaWYgdGhlIHBsYXllciBpcyBub3QgY29sbGlkaW5nP1xyXG5cdFx0XHR0aGlzLnNldFNwZWVkKHRoaXMuc3BlZWQwKTsgLy8gUmVzZXQgc3BlZWRcclxuICAgIH1cclxuICAgICAgXHJcbiAgICBjb2xsaXNpb24ob2JqZWN0KSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuICB9XHJcblx0XHRcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcbiAgICBQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vY29tbW9uL19TY2VuYXJpbycpO1xyXG5cclxuY29uc3QgX1NfY2VudGVyID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfY2VudGVyJyk7XHJcbmNvbnN0IF9TX3VwID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfdXAnKTtcclxuY29uc3QgX1NfcmlnaHQgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9yaWdodCcpO1xyXG5jb25zdCBfU19ib3R0b20gPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9ib3R0b20nKTtcclxuY29uc3QgX1NfbGVmdCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2xlZnQnKTtcclxuXHJcbmNsYXNzIHNjZW5hcmlvUHJvdG90eXBlIGV4dGVuZHMgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIGdhbWVQcm9wcywgc2F2ZURhdGEpe1xyXG4gICAgc3VwZXIoY3R4LCBjYW52YXMsIGdhbWVQcm9wcywgXCJwcm90b3R5cGVcIik7XHJcbiAgICB0aGlzLmRlZmF1bHRTdGFnZUlkID0gXCJjZW50ZXJcIjtcclxuICAgIFxyXG4gICAgLy8gRGVmaW5lIHdoaWNoIHN0YWdlIHdpbGwgbG9hZCBvbiBmaXJzdCBydW5cclxuICAgIHRoaXMuc3RhZ2VUb0xvYWQgPSAoIHNhdmVEYXRhICkgPyBzYXZlRGF0YS5zY2VuYXJpby5zdGFnZUlkIDogdGhpcy5kZWZhdWx0U3RhZ2VJZDtcclxuICAgIFxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhZ2VzXHJcbiAgc2V0U3RhZ2Uoc3RhZ2VfaWQsIGZpcnN0U3RhZ2UpIHtcclxuICAgIFxyXG4gICAgdGhpcy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgIFxyXG4gICAgbGV0IHNfY2VudGVyID0gbmV3IF9TX2NlbnRlciggdGhpcy5jaHVua1NpemUgKTtcclxuICAgIGxldCBzX3VwID0gbmV3IF9TX3VwKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgbGV0IHNfcmlnaHQgPSBuZXcgX1NfcmlnaHQoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICBsZXQgc19ib3R0b20gPSBuZXcgX1NfYm90dG9tKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgbGV0IHNfbGVmdCA9IG5ldyBfU19sZWZ0KCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgXHJcbiAgICBsZXQgX3N0YWdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDaGVjayB3aGljaCBzdGFnZSB3aWxsIGxvYWRcclxuICAgIHN3aXRjaChzdGFnZV9pZCkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIF9zdGFnZSA9IHNfY2VudGVyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgX3N0YWdlID0gc191cDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgX3N0YWdlID0gc19sZWZ0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgX3N0YWdlID0gc19yaWdodDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnYm90dG9tJzpcclxuICAgICAgICBfc3RhZ2UgPSBzX2JvdHRvbTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTG9hZCB0aGUgc3RhZ2UgZGVmaW5lZFxyXG4gICAgICB0aGlzLmxvYWRTdGFnZShfc3RhZ2UsIGZpcnN0U3RhZ2UpO1xyXG4gIH1cclxuIFxyXG4gIC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5zZXRTdGFnZSggdGhpcy5zdGFnZVRvTG9hZCwgdHJ1ZSk7ICAgIFxyXG5cdH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9Qcm90b3R5cGU7IiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQm90dG9tIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJib3R0b21cIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSBjaHVua1NpemUgKiAwO1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSBjaHVua1NpemUgKiAwO1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IGNodW5rU2l6ZSAqIDE7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IGNodW5rU2l6ZSAqIDA7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMiwgICBvYiwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y19ibCwgICAgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3Y19iciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICB0cF8wMSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQm90dG9tO1xyXG4iLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJjZW50ZXJcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSBjaHVua1NpemUgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSBjaHVua1NpemUgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IGNodW5rU2l6ZSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IGNodW5rU2l6ZSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYyLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIGl3Y19iciwgICAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y19ibCwgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgICAgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIG9iLCAgICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiBdLFxyXG4gICAgICBbIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxIF0sXHJcbiAgICAgIFsgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICBpd2NfdHIsICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBpd2NfdGwsICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDIgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICd1cCcgfTtcclxuICAgIGxldCB0cF8wMyA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICAgICB0YXJnZXRTdGFnZTogJ3JpZ2h0JyB9O1xyXG4gICAgbGV0IHRwXzA0ID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnYm90dG9tJyB9O1xyXG4gICAgbGV0IHRwXzA1ID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJsZWZ0XCIsICAgICAgIHRhcmdldFN0YWdlOiAnbGVmdCcgfTtcclxuICAgIFxyXG4gICAgbGV0IGZpcmUgPSB7IG5hbWU6IFwiZmlyZVwiLCB0eXBlOiBcIjAxXCJ9OyBcclxuXHJcbiAgICBsZXQgdGJsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRiciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fcmlnaHRcIiB9OyBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMiwgICB0cF8wMiwgICBmYWxzZSwgICB0cF8wMiwgICB0cF8wMiwgICB0cF8wMiwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wNSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMyBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wNSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdGJsLCAgICAgdGJyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgdHBfMDQsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCB0dGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdHRyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9yaWdodFwiIH07ICBcclxuICAgIGxldCB0bWwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdG1yID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9yaWdodFwiIH07ICBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHR0bCwgICAgIHR0ciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0bWwsICAgICB0bXIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9DZW50ZXI7IiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfTGVmdCBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7XHJcbiAgICBzdXBlcihjaHVua1NpemUsIFwibGVmdFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gY2h1bmtTaXplICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3Y190bCwgd3QsICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0ICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYyLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgb2IsICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMiwgICAgZjEsICAgICBmMSwgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX2JsLCB3YiwgICAgd2IsICAgIHdiLCAgICAgd2IsICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInJpZ2h0XCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wMSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0xlZnQ7XHJcbiIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX1JpZ2h0IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJyaWdodFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gY2h1bmtTaXplICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd2NfdHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgd3IsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2NfYnIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgdHBfMDEsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfUmlnaHQ7XHJcbiIsIi8vIFN0YWdlIDAyXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX1VwIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJ1cFwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gY2h1bmtTaXplICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTs7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICAgICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2NfdGwsICAgICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd2NfdHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwiYm90dG9tXCIsICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX1VwXHJcbiIsIi8qXHJcbiAgU2FuZGJveCBTY2VuYXJpb1xyXG4qL1xyXG5jb25zdCBfU2NlbmFyaW8gPSByZXF1aXJlKCcuLi9jb21tb24vX1NjZW5hcmlvJyk7XHJcblxyXG5jb25zdCBfU19jZW50ZXIgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9jZW50ZXInKTtcclxuY29uc3QgX1NfbGlmZSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2xpZmUnKTtcclxuXHJcbmNsYXNzIHNjZW5hcmlvU2FuZGJveCBleHRlbmRzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMsIHNhdmVEYXRhKXtcclxuICAgIHN1cGVyKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMsIFwic2FuZGJveFwiKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG4gICAgXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgXHJcbiAgICBsZXQgc19jZW50ZXIgPSBuZXcgX1NfY2VudGVyKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgbGV0IHNfbGlmZSA9IG5ldyBfU19saWZlKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgXHJcbiAgICBsZXQgX3N0YWdlID0gbnVsbDtcclxuXHJcbiAgICAvLyBDaGVjayB3aGljaCBzdGFnZSB3aWxsIGxvYWRcclxuICAgIHN3aXRjaChzdGFnZV9pZCkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICdjZW50ZXInOlxyXG4gICAgICAgIF9zdGFnZSA9IHNfY2VudGVyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsaWZlJzpcclxuICAgICAgICBfc3RhZ2UgPSBzX2xpZmU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIExvYWQgdGhlIHN0YWdlIGRlZmluZWRcclxuICAgICAgdGhpcy5sb2FkU3RhZ2UoX3N0YWdlLCBmaXJzdFN0YWdlKTtcclxuICB9XHJcbiBcclxuICAvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG4gIHJ1bigpIHtcclxuICAgIHRoaXMuc2V0U3RhZ2UoIHRoaXMuc3RhZ2VUb0xvYWQsIHRydWUpOyAgICBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvU2FuZGJveDsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuY29uc3QgRmlyZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9GaXJlJyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJjZW50ZXJcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSBjaHVua1NpemUgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSBjaHVua1NpemUgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IGNodW5rU2l6ZSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IGNodW5rU2l6ZSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmlyZVwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgRmlyZShpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNpZ24gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcblxyXG4gICAgbGV0IGl3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCBpd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCBpd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImlubmVyX2Nvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9OyAgXHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICAgaXdjX2JyLCAgICBmMSwgICAgaXdjX2JsLCAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyBpd2NfYnIsICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBpd2NfYmwgXSxcclxuICAgICAgWyBvYiwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBvYiBdLFxyXG4gICAgICBbIGl3Y190ciwgICBmMSwgICAgZjEsICAgIG9iLCAgICBvYiwgICAgb2IsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y190bCBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIG9iLCAgICBmMiwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgb2IsICAgIG9iLCAgICBvYiwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgb2IsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfbGYgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdsaWZlJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgdGJsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9sZWZ0XCIgfTsgIFxyXG4gICAgbGV0IHRiciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9ib3R0b21fcmlnaHRcIiB9OyBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF9sZiwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdGJsLCAgICAgdGJyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCB0dGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdHRyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX3RvcF9yaWdodFwiIH07ICBcclxuICAgIGxldCB0bWwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdG1yID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX21pZGRsZV9yaWdodFwiIH07ICBcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHR0bCwgICAgIHR0ciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0bWwsICAgICB0bXIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcCggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX3RvcCgpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfQ2VudGVyOyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlX0xpZmUgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplLCBcImxpZmVcIik7XHJcblxyXG4gICAgbGV0IHBsYXllcjFTdGFydFggPSBjaHVua1NpemUgKiA3O1xyXG4gICAgbGV0IHBsYXllcjFTdGFydFkgPSBjaHVua1NpemUgKiA2O1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WCA9IGNodW5rU2l6ZSAqIDg7XHJcbiAgICBsZXQgcGxheWVyMlN0YXJ0WSA9IGNodW5rU2l6ZSAqIDY7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgZjEsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgdHBfYyA9IHsgbmFtZTogJ3RlbGVwb3J0JywgdHlwZTogJycsIHRlbGVwb3J0VHlwZTogJ3JlbGF0aXZlJywgY2FtZUZyb206ICdib3R0b20nLCAgICAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcblxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2MsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9MaWZlOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfRmxvb3IgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJCZWFjaCBGbG9vclwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogY2h1bmtTaXplLFxyXG4gICAgICBoZWlnaHQ6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBnYW1lID0ge1xyXG4gICAgICBjaHVua1NpemU6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSB7XHJcbiAgICAgIHdpZHRoOiAxNixcclxuICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgc3RhZ2VTcHJpdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgZ2FtZSwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDFcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDksIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDk0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBwbGF5ZXIuc2V0VGVsZXBvcnRpbmcoZmFsc2UpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfRmxvb3I7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF93YWxsIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggV2FsbFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogY2h1bmtTaXplLFxyXG4gICAgICBoZWlnaHQ6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBnYW1lID0ge1xyXG4gICAgICBjaHVua1NpemU6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSB7XHJcbiAgICAgIHdpZHRoOiAxNixcclxuICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgc3RhZ2VTcHJpdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cyk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTk3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MDksIGNsaXBfeTogMjE0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMzkyLCBjbGlwX3k6IDIxNCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTgwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDc3LCBjbGlwX3k6IDEwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNTQ1LCBjbGlwX3k6IDI3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MjYsIGNsaXBfeTogMTAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ0MywgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MjYsIGNsaXBfeTogMjcsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ0MywgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcIndhdGVyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAyOTksIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJvYnN0YWNsZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MCwgY2xpcF95OiA3NSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNjkzLCBjbGlwX3k6OTYsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNzEwLCBjbGlwX3k6IDk2LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNjkyLCBjbGlwX3k6IDExLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDcxMCwgY2xpcF95OiAxMSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDYyNSwgY2xpcF95OiAxMSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKHRoaXMueCArIHRoaXMuY2h1bmtTaXplICogMC43KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDc0NCwgY2xpcF95OiAxMSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfd2FsbDsiLCJjb25zdCBfQ2FuSHVydCA9IHJlcXVpcmUoJy4vX0Nhbkh1cnQnKTtcclxuXHJcbmNsYXNzIEZpcmUgZXh0ZW5kcyBfQ2FuSHVydCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJGaXJlXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiBjaHVua1NpemUsXHJcbiAgICAgIGhlaWdodDogY2h1bmtTaXplXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGdhbWUgPSB7XHJcbiAgICAgIGNodW5rU2l6ZTogY2h1bmtTaXplXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IHtcclxuICAgICAgd2lkdGg6IDUwLFxyXG4gICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICBzdGFnZVNwcml0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5IdXJ0UHJvcHMgPSB7XHJcbiAgICAgIGFtb3VudDogMVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cywgY2FuSHVydFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAzO1xyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gY2h1bmtTaXplICogMC40OyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyAoIGNodW5rU2l6ZSAqIDAuNik7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDEwOyAvLyAxMDAwIC8gRlBTXHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgICAgIC8vIENvbGxpc2lvblxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uSGVpZ2h0KHRoaXMuY29sbGlzaW9uSGVpZ2h0KTtcclxuICAgICAgICB0aGlzLnNldENvbGxpc2lvblkodGhpcy5jb2xsaXNpb25ZKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgc2V0U3ByaXRlUHJvcHNGcmFtZShzcHJpdGVBbmltYXRpb25Db3VudCl7XHJcbiAgICBzd2l0Y2goc3ByaXRlQW5pbWF0aW9uQ291bnQpIHsgXHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiAwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDUwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMTAwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBGaXJlIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgbGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0gXHJcblxyXG4gIGJlZm9yZVJlbmRlcigpIHtcclxuICAgIC8vIEFuaW1hdGUgZmlyZVxyXG4gICAgaWYoIHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkgKSB7XHJcbiAgICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQrKztcclxuICAgICAgaWYoIHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQgPiB0aGlzLnNwcml0ZUFuaW1hdGlvbk1heENvdW50ICkgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA9IDE7XHJcbiAgICAgIHRoaXMuc2V0U3ByaXRlUHJvcHNGcmFtZSh0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEZpcmU7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcbmNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vLi4vLi4vZ2FtZVByb3BlcnRpZXMnKTsgXHJcblxyXG5jbGFzcyBUZWxlcG9ydCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCwgY2h1bmtTaXplLCB0ZWxlcG9ydFByb3BzKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJUZWxlcG9ydFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogY2h1bmtTaXplLFxyXG4gICAgICBoZWlnaHQ6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBnYW1lID0ge1xyXG4gICAgICBjaHVua1NpemU6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSB7XHJcbiAgICAgIHdpZHRoOiAxNixcclxuICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgc3RhZ2VTcHJpdGU6IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIGdhbWUsIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy50ZWxlcG9ydFByb3BzID0gdGVsZXBvcnRQcm9wcztcclxuXHJcbiAgICB0aGlzLnhJbmRleCA9IHhJbmRleDtcclxuICAgIHRoaXMueUluZGV4ID0geUluZGV4O1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ocGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQsIGNvbGxpZGFibGUsIGNvbGxpc2lvbkRpcmVjdGlvbil7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXJzID0gY29sbGlkYWJsZS5zY2VuYXJpby5nZXRQbGF5ZXJzKCk7XHJcblxyXG4gICAgLy8gSWYgdGhlIHBsYXllciB0ZWxlcG9ydHMsIHRoZW4gY2hhbmdlIHN0YWdlXHJcbiAgICBpZiggdGhpcy50ZWxlcG9ydCggcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQgKSApIHtcclxuXHJcbiAgICAgIC8vIE1ha2UgZXZlcnl0aGluZyBkYXJrXHJcbiAgICAgIGNvbGxpZGFibGUuc2NlbmFyaW8uY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHdpbmRvdy5nYW1lLmxvYWRpbmcodHJ1ZSk7XHJcblxyXG4gICAgICAvLyBIaWRlIGFsbCBwbGF5ZXJzXHJcbiAgICAgIHBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgcGxheWVyLmhpZGVQbGF5ZXIoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBXYWl0IHNvbWUgdGltZVxyXG4gICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gTm93IHRlbGVwb3J0IGFsbCBwbGF5ZXJzIHRvIHNhbWUgbG9jYXRpb24gYW5kIGRpcmVjdGlvblxyXG4gICAgICAgIGxldCB0YXJnZXRYID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0WCgpO1xyXG4gICAgICAgIGxldCB0YXJnZXRZID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0WSgpO1xyXG4gICAgICAgIGxldCBsb29rRGlyZWN0aW9uID0gcGxheWVyV2hvQWN0aXZhdGVkVGVsZXBvcnQuZ2V0U3ByaXRlUHJvcHMoKS5kaXJlY3Rpb247XHJcbiAgICAgICAgXHJcbiAgICAgICAgcGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHBsYXllci5zZXRYKHRhcmdldFgsIHRydWUpOyAvLyB0cnVlID0gYWxzbyBzZXQgY29sbGlzaW9uIHggdG9vXHJcbiAgICAgICAgICBwbGF5ZXIuc2V0WSh0YXJnZXRZLCB0cnVlKTtcclxuICAgICAgICAgIHBsYXllci50cmlnZ2VyTG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKTtcclxuICAgICAgICAgIHBsYXllci5zaG93UGxheWVyKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENoYW5nZSBzdGFnZVxyXG4gICAgICAgIGNvbGxpZGFibGUuc2NlbmFyaW8uc2V0U3RhZ2UoIFxyXG4gICAgICAgICAgdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFN0YWdlLFxyXG4gICAgICAgICAgZmFsc2UgLy8gZmlyc3RTdGFnZSA/XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgd2luZG93LmdhbWUubG9hZGluZyhmYWxzZSk7XHJcbiAgICAgIH0sIDMwMCk7XHJcbiAgICAgIFxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIC8vIFdoYXQga2luZCBvZiB0ZWxlcG9ydD9cclxuICB0ZWxlcG9ydCggcGxheWVyICkge1xyXG4gICAgXHJcbiAgICBsZXQgZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgbGV0IHR5cGUgPSB0aGlzLnRlbGVwb3J0UHJvcHMudGVsZXBvcnRUeXBlO1xyXG4gICAgbGV0IHRhcmdldFggPSAwO1xyXG4gICAgbGV0IHRhcmdldFkgPSAwO1xyXG5cclxuICAgIGxldCB3aWxsVGVsZXBvcnQgPSBmYWxzZTtcclxuXHJcbiAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGFyZ2V0WCA9IHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRYO1xyXG4gICAgICAgIHRhcmdldFkgPSB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0WTtcclxuICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicmVsYXRpdmVcIjpcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudGVsZXBvcnRQcm9wcy5jYW1lRnJvbSkge1xyXG4gICAgICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgICAgICB0YXJnZXRYID0gdGhpcy54SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggKGdhbWVQcm9wcy5nZXRQcm9wKCdzY3JlZW5WZXJ0aWNhbENodW5rcycpIC0gMyApICogdGhpcy5jaHVua1NpemUpOyAvLyAtMyBiZWNhdXNlIG9mIHRoZSBwbGF5ZXIgY29sbGlzaW9uIGJveFxyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IHRoaXMueEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAwICogdGhpcy5jaHVua1NpemU7IC8vIFRlbGVwb3J0IHRvIFk9MCwgYnV0IHBsYXllciBoaXRib3ggd2lsbCBtYWtlIGhpbSBnbyAxIHRpbGUgZG93blxyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJyaWdodFwiOlxyXG4gICAgICAgICAgICB0YXJnZXRZID0gKCB0aGlzLnlJbmRleCAqIHRoaXMuY2h1bmtTaXplKSAtIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRYID0gMSAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJsZWZ0XCI6XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIHRoaXMueUluZGV4ICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFggPSAoIGdhbWVQcm9wcy5nZXRQcm9wKCdzY3JlZW5Ib3Jpem9udGFsQ2h1bmtzJykgLSAyICkgKiB0aGlzLmNodW5rU2l6ZTsgXHJcbiAgICAgICAgICAgIHdpbGxUZWxlcG9ydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBPbmx5IHRlbGVwb3J0cyBpZiBpdCBjYW4gdGVsZXBvcnRcclxuICAgIGlmKCB3aWxsVGVsZXBvcnQgKSB7XHJcbiAgICAgIHBsYXllci5zZXRYKCB0YXJnZXRYICk7IC8vIGFsd2F5cyB1c2luZyBYIGFuZCBZIHJlbGF0aXZlIHRvIHRlbGVwb3J0IG5vdCBwbGF5ZXIgYmVjYXVzZSBpdCBmaXggdGhlIHBsYXllciBwb3NpdGlvbiB0byBmaXQgaW5zaWRlIGRlc3RpbmF0aW9uIHNxdWFyZS5cclxuICAgICAgcGxheWVyLnNldFkoIHRhcmdldFkgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gd2lsbFRlbGVwb3J0O1xyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRlbGVwb3J0OyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgX0Nhbkh1cnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cyxjYW5IdXJ0UHJvcHMpIHtcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICB0aGlzLmh1cnRBbW91bnQgPSBjYW5IdXJ0UHJvcHMuYW1vdW50O1xyXG4gIH1cclxuICBcclxuICAvLyBJZiBpdCdzIG5vdCBjb2xsaWRpbmcgdG8gYW55IHRlbGVwb3J0IGNodW5rIGFueW1vcmUsIG1ha2UgaXQgcmVhZHkgdG8gdGVsZXBvcnQgYWdhaW5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBwbGF5ZXIuaHVydFBsYXllcih0aGlzLmh1cnRBbW91bnQpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0Nhbkh1cnQ7IiwiY2xhc3MgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgZ2FtZSwgc3ByaXRlLCBldmVudHMpIHtcclxuICAgICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSBwb3NpdGlvbi54O1xyXG4gICAgdGhpcy55ID0gcG9zaXRpb24ueTtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBkaW1lbnNpb24ud2lkdGg7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gZGltZW5zaW9uLmhlaWdodDtcclxuXHJcbiAgICAvLyAjIENvbGxpc2lvblxyXG4gICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICB0aGlzLmNvbGxpc2lvbkhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgdGhpcy5jb2xsaXNpb25YID0gdGhpcy54O1xyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0gdGhpcy55O1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gZ2FtZS5jaHVua1NpemU7XHJcblxyXG4gICAgLy8gIyBFdmVudG9zXHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGV2ZW50cy5zdG9wT25Db2xsaXNpb247XHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gZXZlbnRzLmhhc0NvbGxpc2lvbkV2ZW50O1xyXG4gIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3RhZ2VTcHJpdGUgPSBzcHJpdGUuc3RhZ2VTcHJpdGU7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVXaWR0aCA9IHNwcml0ZS53aWR0aDsgICBcclxuICAgIHRoaXMuc3ByaXRlSGVpZ2h0ID0gc3ByaXRlLmhlaWdodDsgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMubmFtZSA9IHByb3BzLm5hbWUgKyBcIihcIiArIHRoaXMueCArIFwiL1wiICsgdGhpcy55ICsgXCIpXCI7XHJcblxyXG4gICAgdGhpcy5ydW4oIHByb3BzLnR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICBzZXRDb2xsaXNpb25IZWlnaHQoaGVpZ2h0KSB7IHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0Q29sbGlzaW9uV2lkdGgod2lkdGgpIHsgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgLy8gISBNdXN0IGhhdmUgaW4gY2hpbGRzIENsYXNzXHJcbiAgfVxyXG5cclxuICBzZXRTdG9wT25Db2xsaXNpb24oYm9vbCl7XHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGJvb2w7XHJcbiAgfVxyXG5cdFx0XHRcclxuXHQvLyAjIEdldHNcclxuXHRcdFx0XHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvbkhlaWdodDsgfVxyXG4gIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25XaWR0aDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25YKCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWSgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCkgLzI7IH1cclxuICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpIC8yOyB9XHJcblxyXG4gIC8vIEhvb2sgdG8gcnVuIGJlZm9yZSByZW5kZXJcclxuICBiZWZvcmVSZW5kZXIoKSB7IH1cclxuXHRcdFxyXG5cdC8vICMgUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG5cclxuICAgIHRoaXMuYmVmb3JlUmVuZGVyKCk7XHJcbiAgICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIGxldCBzcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlUHJvcHM7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLnN0YWdlU3ByaXRlICkgeyAvLyBPbmx5IHJlbmRlciB0ZXh0dXJlIGlmIGhhdmUgaXQgc2V0XHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnN0YWdlU3ByaXRlLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgICBcclxuICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuXHJcbiAgICAgIGxldCBjb2xsaXNpb25fcHJvcHMgPSB7XHJcbiAgICAgICAgdzogdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCksXHJcbiAgICAgICAgeDogdGhpcy5nZXRDb2xsaXNpb25YKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRDb2xsaXNpb25ZKClcclxuICAgICAgfVxyXG5cclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3RvcE9uQ29sbGlzaW9uID8gXCJyZ2JhKDI1NSwwLDAsMC4yKVwiIDogXCJyZ2JhKDAsMjU1LDAsMC4yKVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QoY29sbGlzaW9uX3Byb3BzLngsIGNvbGxpc2lvbl9wcm9wcy55LCBjb2xsaXNpb25fcHJvcHMudywgY29sbGlzaW9uX3Byb3BzLmgpO1xyXG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMCwwLDAsMC4yKVwiO1xyXG4gICAgICBjdHgubGluZVdpZHRoICAgPSA1O1xyXG4gICAgICBjdHguc3Ryb2tlUmVjdChjb2xsaXNpb25fcHJvcHMueCwgY29sbGlzaW9uX3Byb3BzLnksIGNvbGxpc2lvbl9wcm9wcy53LCBjb2xsaXNpb25fcHJvcHMuaCk7XHJcblxyXG4gICAgfVxyXG4gIFxyXG4gIH1cclxuICAgIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gTm8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgbm9Db2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gUnVucyB3aGVuIENsYXNzIHN0YXJ0cyAgXHJcbiAgcnVuKCB0eXBlICkge1xyXG4gICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NvbGxpZGFibGU7IiwiY2xhc3MgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIGdhbWVQcm9wcywgc2NlbmFyaW9faWQsIHNhdmVEYXRhKXtcclxuICAgIHRoaXMuY3R4ID0gY3R4O1xyXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICBcclxuICAgIHRoaXMud2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyU3RhcnRYID0gMDsgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WSA9IDA7IFxyXG5cclxuICAgIHRoaXMuc3RhZ2UgPSBudWxsO1xyXG4gICAgdGhpcy5zdGFnZUlkID0gXCJcIjtcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5zY2VuYXJpb19pZCA9IHNjZW5hcmlvX2lkO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBBZGQgSXRlbXMgdG8gdGhlIHJlbmRlclxyXG4gIGFkZFN0YXRpY0l0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fdG9wKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AucHVzaChpdGVtKTtcclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbSA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG4gIC8vICMgUGxheWVyc1xyXG4gIGFkZFBsYXllcihwbGF5ZXIpIHtcclxuICAgIHRoaXMucGxheWVycy5wdXNoKHBsYXllcik7XHJcbiAgfVxyXG4gIGdldFBsYXllcnMoKSB7IHJldHVybiB0aGlzLnBsYXllcnM7IH1cclxuXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0Q3R4KCkgeyByZXR1cm4gdGhpcy5jdHg7IH1cclxuICBnZXRDYW52YXMoKSB7IHJldHVybiB0aGlzLmNhbnZhczsgfVx0XHJcblxyXG4gIGdldElkKCkgeyByZXR1cm4gdGhpcy5zY2VuYXJpb19pZDsgfVxyXG4gIGdldEFjdHVhbFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICAgICAgICAgICAgICBcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b207IH1cclxuICBnZXRMYXllckl0ZW1zX190b3AoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcDsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0QWN0dWFsU3RhZ2VJZChpZCl7IHRoaXMuc3RhZ2VJZCA9IGlkOyB9XHJcblxyXG4gIC8vIEZ1bmN0aW9ucyB0byBsb2FkIHNlbGVjdGVkIHN0YWdlXHJcbiAgbG9hZFN0YWdlKHN0YWdlLCBmaXJzdFN0YWdlKSB7XHJcbiAgICBcclxuICAgIHRoaXMuc3RhZ2UgPSBzdGFnZTtcclxuXHJcbiAgICAvLyBDbGVhciBwcmV2aW91cyByZW5kZXIgaXRlbXNcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVySXRlbXNBbmltYXRlZCA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgU3RhdGljIEl0ZW1zXHJcbiAgICB0aGlzLnN0YWdlLmdldFN0YXRpY0l0ZW1zKCkubWFwKCAoaXRlbSkgPT4geyBcclxuICAgICAgaXRlbS5zY2VuYXJpbyA9IHRoaXM7IC8vIFBhc3MgdGhpcyBzY2VuYXJpbyBjbGFzcyBhcyBhbiBhcmd1bWVudCwgc28gb3RoZXIgZnVuY3Rpb25zIGNhbiByZWZlciB0byB0aGlzXHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbShpdGVtKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgQW5pbWF0ZWQgSXRlbXMgLSBCb3R0b21cclxuICAgIHRoaXMuc3RhZ2UuZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkubWFwKCAoaXRlbSkgPT4geyBcclxuICAgICAgaXRlbS5zY2VuYXJpbyA9IHRoaXM7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oaXRlbSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgdGhpcy5zdGFnZS5nZXRMYXllckl0ZW1zX190b3AoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpdGVtLnNjZW5hcmlvID0gdGhpcztcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX3RvcChpdGVtKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldCBBY3R1YWwgU3RhZ2UgSURcclxuICAgIHRoaXMuc2V0QWN0dWFsU3RhZ2VJZCggdGhpcy5zdGFnZS5nZXRTdGFnZUlkKCkgKTtcclxuXHJcbiAgICAvLyBPbmx5IHNldCBwbGF5ZXIgc3RhcnQgYXQgZmlyc3QgbG9hZFxyXG4gICAgaWYoZmlyc3RTdGFnZSkge1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WCgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXIxU3RhcnRZKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjJTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMlN0YXJ0WSgpICk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcblxyXG4gIHJlbmRlcigpIHsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU2NlbmFyaW87IiwiY2xhc3MgX1N0YWdlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplLCBzdGFnZUlkKSB7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIFxyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IGNodW5rU2l6ZTtcclxuXHJcbiAgICB0aGlzLnBsYXllcjFTdGFydFggPSAwO1xyXG4gICAgdGhpcy5wbGF5ZXIxU3RhcnRZID0gMDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXIyU3RhcnRYID0gMDtcclxuICAgIHRoaXMucGxheWVyMlN0YXJ0WSA9IDA7XHJcblxyXG4gICAgdGhpcy5zdGFnZUlkID0gc3RhZ2VJZDtcclxuXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIEdldHNcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuICBnZXRMYXllckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b207IH1cclxuICBnZXRMYXllckl0ZW1zX190b3AoKSB7IHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcDsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjFTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjFTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIxU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRZOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyMlN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMucGxheWVyMlN0YXJ0WDsgfVxyXG4gIGdldFBsYXllcjJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFk7IH1cclxuXHJcbiAgZ2V0U3RhZ2VJZCgpIHsgcmV0dXJuIHRoaXMuc3RhZ2VJZDsgfVxyXG4gIFxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllcjFTdGFydFgoeCkgeyB0aGlzLnBsYXllcjFTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMVN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMVN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgc2V0UGxheWVyMlN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMlN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIyU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIyU3RhcnRZID0geTsgfVxyXG4gIFxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRTdGF0aWNJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbS5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX3RvcChpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG4gIFxyXG4gIHJ1biAoKSB7IH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU3RhZ2U7IiwiLy8gT2JzdGFjbGUgY2xhc3NcclxuXHJcblx0ZnVuY3Rpb24gRW5lbXkoY3R4LCBwbGF5ZXIsIG5hbWUsIHgwLCB5MCwgbW92VHlwZSwgbWluWCwgbWF4WCwgbWluWSwgbWF4WSwgc3BlZWQgKSB7XHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIEluaXQgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHQvLyAjIFBvc2l0aW9uXHJcblx0XHRcdFx0dGhpcy54ID0geDA7XHJcblx0XHRcdFx0dGhpcy55ID0geTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdC8vICMgUHJvcGVydGllc1xyXG5cdFx0XHRcdHRoaXMud2lkdGggPSAxMDsgLy9weFxyXG5cdFx0XHRcdHRoaXMuaGVpZ2h0ID0gNTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5jb2xvciA9IFwiI0YwMFwiOyBcclxuXHRcdFx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdFx0XHRcdHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuXHRcdFx0XHJcblx0XHRcdC8vICMgTW92ZW1lbnRcclxuXHRcdFx0XHR0aGlzLnBsYXllciA9IHBsYXllcjtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3YgPSBtb3ZUeXBlOyAvL2hvciwgdmVyIDwtIG1vdmVtZW50IHR5cGVzIHRoYXQgdGhlIGVuZW15IGNhbiBkb1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWluWCA9IG1pblg7XHJcblx0XHRcdFx0dGhpcy5taW5ZID0gbWluWTtcclxuXHRcdFx0XHR0aGlzLm1heFggPSBtYXhYO1xyXG5cdFx0XHRcdHRoaXMubWF4WSA9IG1heFk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3ZYID0gMTtcclxuXHRcdFx0XHR0aGlzLm1vdlkgPSAxO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZW5lbXkgPSBuZXcgT2JqZWN0O1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS53aWR0aCA9IHRoaXMud2lkdGg7XHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuXHRcdFx0Ly8gIyBUZXh0dXJlXHJcblx0XHRcdFx0dGhpcy5jdHggPSBjdHg7XHJcblxyXG5cdFx0XHRcdHRoaXMub2JqQ29sbGlzaW9uID0gbmV3IENvbGxpc2lvbiggMCAsIDAsIHRoaXMucGxheWVyICk7XHJcblx0XHRcdFx0XHJcblx0XHQvLyAtIC0gLSBTZXRzIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5zZXRYID0gIGZ1bmN0aW9uICh4KSB7IHRoaXMueCA9IHg7IH1cclxuXHRcdFx0dGhpcy5zZXRZID0gIGZ1bmN0aW9uICh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0SGVpZ2h0ID0gIGZ1bmN0aW9uIChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCA9ICBmdW5jdGlvbiAod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldENvbG9yID0gIGZ1bmN0aW9uIChjb2xvcikgeyB0aGlzLmNvbG9yID0gY29sb3I7IH1cclxuXHRcdFx0dGhpcy5zZXROYW1lID0gIGZ1bmN0aW9uIChuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHRcclxuXHRcdC8vIC0gLSAtIEdldHMgLSAtIC1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0WCA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdFx0dGhpcy5nZXRZID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG5cdFx0XHR0aGlzLmdldEhlaWdodCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0Q29sb3IgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuXHJcblxyXG5cdFx0Ly8gLSAtIC0gTW92ZW1lbnQgIC0gLSAtXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3ZIb3IgPSBmdW5jdGlvbiAobW9kKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICggdGhpcy5tb3ZYID09IDEgKSB7Ly8gZ28gUmlnaHRcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMueCA9IHRoaXMueCArIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy54ID49IHRoaXMubWF4WCApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZYID0gMDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMueCA9IHRoaXMueCAtIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy54IDwgdGhpcy5taW5YIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlggPSAxO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHRcclxuXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92VmVyID0gZnVuY3Rpb24gKG1vZCkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoIHRoaXMubW92WSA9PSAxICkge1xyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy55ID0gdGhpcy55ICsgdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnkgPj0gdGhpcy5tYXhZIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlkgPSAwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy55ID0gdGhpcy55IC0gdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnkgPCB0aGlzLm1pblkgKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WSA9IDE7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH1cdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHJcblx0XHQvLyAtIC0gLSBSZW5kZXIgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGNvbnRleHQsIG1vZCkgeyBcclxuXHJcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMubW92KSB7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRjYXNlIFwiaG9yXCI6XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZIb3IobW9kKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGNhc2UgXCJ2ZXJcIjpcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlZlcihtb2QpO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdC8vIENoZWNrIGlmIGNvbGxpZGVzIHdpdGggcGxheWVyXHJcblxyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS54ID0gdGhpcy54O1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS55ID0gdGhpcy55O1xyXG5cclxuXHRcdFx0XHRcdGlmICggdGhpcy5vYmpDb2xsaXNpb24uY2hlY2tQbGF5ZXJDb2xsaXNpb24odGhpcy5lbmVteSkgPT0gdHJ1ZSApIFxyXG5cdFx0XHRcdFx0XHR0aGlzLmNvbGxpc2lvbih0aGlzLnBsYXllcik7XHJcblx0XHRcdFx0XHRcclxuXHJcblx0XHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFJlY3QoIHRoaXMuZ2V0WCgpLCB0aGlzLmdldFkoKSwgdGhpcy5nZXRXaWR0aCgpLCB0aGlzLmdldEhlaWdodCgpICk7XHJcblx0XHRcdFx0XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNvbGxpc2lvbiA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9iamVjdC5zZXRDb2xvcihcIiMzMzNcIik7XHJcblx0XHRcdFx0b2JqZWN0LnJlc2V0UG9zaXRpb24oKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHJcblx0XHRcdH07XHJcblxyXG5cdH0vL2NsYXNzIiwiLy8gQ2xhc3MgdGhhdCBkZXRlY3RzIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciBhbmQgb3RoZXIgb2JqZWN0c1xyXG5jbGFzcyBDb2xsaXNpb24ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihzY2VuYXJpb1dpZHRoLCBzY2VuYXJpb0hlaWdodCwgcGxheWVyKSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zID0gbmV3IEFycmF5KCk7IC8vIEl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuICAgIHRoaXMuc2NlbmFyaW9XaWR0aCA9IHNjZW5hcmlvV2lkdGg7XHJcbiAgICB0aGlzLnNjZW5hcmlvSGVpZ2h0ID0gc2NlbmFyaW9IZWlnaHQ7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICB9XHJcblx0XHRcdFxyXG4gIC8vICMgQ2hlY2sgaWYgdGhlIG9iamVjdCBjb2xsaWRlcyB3aXRoIGFueSBvYmplY3QgaW4gdmVjdG9yXHJcbiAgLy8gQWxnb3JpdGhtIHJlZmVyZW5jZTogR3VzdGF2byBTaWx2ZWlyYSAtIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9czdxaVdMQkJwSndcclxuICBjaGVjayhvYmplY3QpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjEgPSBvYmplY3Q7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIHRoaXMuY2hlY2tDb2xsaXNpb24ocjEsIHIyKTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICAvLyBAcjE6IHRoZSBtb3Zpbmcgb2JqZWN0XHJcbiAgLy8gQHIyOiB0aGUgXCJ3YWxsXCJcclxuICBjaGVja0NvbGxpc2lvbihyMSwgcjIpIHtcclxuXHJcbiAgICAvLyBEb24ndCBjaGVjayBjb2xsaXNpb24gYmV0d2VlbiBzYW1lIG9iamVjdFxyXG4gICAgaWYoIHIxLm5hbWUgPT0gcjIubmFtZSApIHJldHVybjtcclxuICAgIFxyXG4gICAgLy8gT25seSBjaGVja3Mgb2JqZWN0cyB0aGF0IG5lZWRzIHRvIGJlIGNoZWNrZWRcclxuICAgIGlmKCAhIHIyLnRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSAmJiAhIHIyLnN0b3BJZkNvbGxpc2lvbigpICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9IHIxLmdldENlbnRlclgoKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggcjEuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgIFxyXG4gICAgaWYoTWF0aC5hYnMoY2F0WCkgPCBzdW1IYWxmV2lkdGggJiYgTWF0aC5hYnMoY2F0WSkgPCBzdW1IYWxmSGVpZ2h0KXtcclxuICAgICAgXHJcbiAgICAgIHZhciBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICB2YXIgb3ZlcmxhcFkgPSBzdW1IYWxmSGVpZ2h0IC0gTWF0aC5hYnMoY2F0WSk7XHJcblxyXG4gICAgICBpZiggcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7XHJcbiAgICAgICAgaWYob3ZlcmxhcFggPj0gb3ZlcmxhcFkgKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWSggcjEuZ2V0Q29sbGlzaW9uWSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblkoIHIxLmdldENvbGxpc2lvblkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblgoIHIxLmdldENvbGxpc2lvblgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25YKCByMS5nZXRDb2xsaXNpb25YKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJpZ2dlcnMgQ29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLmNvbGxpc2lvbihyMiwgcjEpO1xyXG4gICAgICByMi5jb2xsaXNpb24ocjEsIHIyKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmlnZ2VycyBub3QgaW4gY29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLm5vQ29sbGlzaW9uKHIyLCByMik7IFxyXG4gICAgICByMi5ub0NvbGxpc2lvbihyMSwgcjIpOyBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFx0XHRcclxuXHQvLyBBZGQgaXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG5cdGFkZEl0ZW0ob2JqZWN0KSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0KTtcclxuICB9O1xyXG4gIFxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xlYXJBcnJheUl0ZW1zKCkge1xyXG4gICAgdGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9nYW1lUHJvcGVydGllcycpO1xyXG5jb25zdCBzY2VuYXJpb1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc2NlbmFyaW9Qcm90b3R5cGUnKTtcclxuY29uc3Qgc2NlbmFyaW9TYW5kYm94ID0gcmVxdWlyZSgnLi4vYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc2NlbmFyaW9TYW5kYm94Jyk7XHJcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9QbGF5ZXInKTtcclxuY29uc3QgQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9Db2xsaXNpb24nKTtcclxuY29uc3QgUmVuZGVyID0gcmVxdWlyZSgnLi9SZW5kZXInKTtcclxuY29uc3QgVUkgPSByZXF1aXJlKCcuL1VJJyk7XHJcblxyXG5jbGFzcyBHYW1lIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gRlBTIENvbnRyb2xcclxuICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSBudWxsOyBcclxuICAgIHRoaXMubm93ID0gbnVsbDtcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gbnVsbDsgXHJcbiAgICB0aGlzLmVsYXBzZWQgPSBudWxsO1xyXG5cclxuICAgIC8vIEV2ZW50c1xyXG4gICAgdGhpcy5rZXlzRG93biA9IHt9O1xyXG5cclxuICAgIC8vIFBhdXNlXHJcbiAgICB0aGlzLl9wYXVzZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5nYW1lSXNMb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBHYW1lXHJcbiAgICAgIHRoaXMuZ2FtZVByb3BzID0gbnVsbDtcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uID0gbnVsbDtcclxuICAgICAgdGhpcy5kZWZhdWx0U2NlbmFyaW8gPSBcInNhbmRib3hcIjtcclxuICAgICAgdGhpcy5zY2VuYXJpbyA9IG51bGw7XHJcbiAgICAgIHRoaXMuVUkgPSBudWxsO1xyXG5cclxuICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gUmVuZGVyc1xyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYyA9IG51bGw7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbnVsbDtcclxuICAgICAgdGhpcy5yZW5kZXJVSSAgICAgPSBudWxsO1xyXG5cclxuICB9XHJcbiAgXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIERlZmF1bHQgRXZlbnQgTGlzdGVuZXJzXHJcbiAgZGVmYXVsdEV2ZW50TGlzdGVuZXJzKCkge1xyXG5cclxuICAgIC8vIE1lbnUgQ2xpY2tzXHJcbiAgICBsZXQgbWVudUl0ZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtZW51LWl0ZW0nKTtcclxuICAgIFxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZW51SXRlbS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgX3RoaXMgPSB0aGlzO1xyXG4gICAgICBtZW51SXRlbVtpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIF90aGlzLm1lbnVBY3Rpb24oIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1hY3Rpb25cIikgKTtcclxuICAgICAgfSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgS2V5Ym9hcmQgRXZlbnRzXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdGhpcy5rZXlzRG93bltlLmtleUNvZGVdID0gdHJ1ZTtcclxuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgXHJcbiAgICAgIC8vIENsZWFyIHByZXZpb3VzIGtleXNcclxuICAgICAgZGVsZXRlIHRoaXMua2V5c0Rvd25bZS5rZXlDb2RlXTtcclxuICAgICAgXHJcbiAgICAgIC8vIFJlc2V0IHBsYXllcnMgbG9vayBkaXJlY3Rpb25cclxuICAgICAgaWYoIHRoaXMucGxheWVycykge1xyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHBsYXllci5yZXNldFN0ZXAoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgLy8gUGF1c2UgRXZlbnQgTGlzdGVuZXJcclxuICAgICAgaWYoIGUua2V5Q29kZSA9PSAyNyAmJiB0aGlzLmdhbWVJc0xvYWRlZCApIHsgLy8gRVNRXHJcbiAgICAgICAgdGhpcy50b2dnbGVQYXVzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XHJcblxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFN0YXJ0L1Jlc3RhcnQgYSBHYW1lXHJcblxyXG4gIHN0YXJ0TmV3R2FtZSggc2F2ZURhdGEgKSB7XHJcblxyXG4gICAgLy8gIyBJbml0XHJcbiAgICAgIHRoaXMuZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgICBsZXQgY2FudmFzU3RhdGljID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19zdGF0aWMnKTtcclxuICAgICAgbGV0IGNvbnRleHRTdGF0aWMgPSBjYW52YXNTdGF0aWMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgIGxldCBjYW52YXNMYXllcnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX2xheWVycycpO1xyXG4gICAgICBsZXQgY29udGV4dExheWVycyA9IGNhbnZhc0xheWVycy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICBcclxuICAgICAgbGV0IGNhbnZhc1VJID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc191aScpO1xyXG4gICAgICBsZXQgY29udGV4dFVJID0gY2FudmFzVUkuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgICAgIGNhbnZhc0xheWVycy53aWR0aCA9IGNhbnZhc1N0YXRpYy53aWR0aCA9IGNhbnZhc1VJLndpZHRoID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzV2lkdGgnKTtcclxuICAgICAgY2FudmFzTGF5ZXJzLmhlaWdodCA9IGNhbnZhc1N0YXRpYy5oZWlnaHQgPSBjYW52YXNVSS5oZWlnaHQgPSB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjYW52YXNIZWlnaHQnKTtcclxuXHJcbiAgICAvLyAjIFNjZW5hcmlvXHJcbiAgICAgIGlmKCAhIHNhdmVEYXRhICkge1xyXG4gICAgICAgIHRoaXMuc2NlbmFyaW8gPSB0aGlzLmdldFNjZW5hcmlvKCB0aGlzLmRlZmF1bHRTY2VuYXJpbywgY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zY2VuYXJpbyA9IHRoaXMuZ2V0U2NlbmFyaW8oIHNhdmVEYXRhLnNjZW5hcmlvLnNjZW5hcmlvSWQsIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgc2F2ZURhdGEgKTtcclxuICAgICAgfVxyXG5cclxuICAgIC8vICMgUGxheWVyc1xyXG4gICAgICB0aGlzLnBsYXllcnMgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAgIGlmKCAhIHNhdmVEYXRhICkge1xyXG4gICAgICAgIGxldCBwbGF5ZXIgPSBuZXcgUGxheWVyKCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjFTdGFydFgoKSwgdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIxU3RhcnRZKCksIHRoaXMuZ2FtZVByb3BzLCAxICk7IFxyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMubXVsdGlwbGF5ZXIgKSB7XHJcbiAgICAgICAgICBsZXQgcGxheWVyMiA9IG5ldyBQbGF5ZXIoIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMlN0YXJ0WCgpLCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjJTdGFydFkoKSwgdGhpcy5nYW1lUHJvcHMsIDIgKTsgXHJcbiAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2NlbmFyaW8uYWRkUGxheWVyKHBsYXllcik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHNhdmVEYXRhLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcblxyXG4gICAgICAgICAgbGV0IF9wbGF5ZXIgPSBuZXcgUGxheWVyKCBwbGF5ZXIueCwgcGxheWVyLnksIHRoaXMuZ2FtZVByb3BzLCBwbGF5ZXIucGxheWVyTnVtYmVyLCBwbGF5ZXIgKTsgXHJcblxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2goIF9wbGF5ZXIpO1xyXG4gICAgICAgICAgdGhpcy5zY2VuYXJpby5hZGRQbGF5ZXIoX3BsYXllcik7XHJcblxyXG4gICAgICAgIH0pOyAgXHJcbiAgICAgIH1cclxuICAgIC8vICMgVUlcclxuICAgICAgXHJcbiAgICAgIHRoaXMuVUkgPSBuZXcgVUkoIHRoaXMucGxheWVycywgdGhpcy5nYW1lUHJvcHMpO1xyXG5cclxuICAgIC8vICMgQ29sbGlzaW9uIGRldGVjdGlvbiBjbGFzc1xyXG5cclxuICAgICAgdGhpcy5jb2xsaXNpb24gPSBuZXcgQ29sbGlzaW9uKCBjYW52YXNMYXllcnMud2lkdGgsIGNhbnZhc0xheWVycy5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyAjIFJlbmRlclxyXG5cclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBuZXcgUmVuZGVyKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyk7IC8vIFJlbmRlciBleGVjdXRlZCBvbmx5IG9uY2VcclxuICAgICAgdGhpcy5yZW5kZXJMYXllcnMgPSBuZXcgUmVuZGVyKGNvbnRleHRMYXllcnMsIGNhbnZhc0xheWVycyk7IC8vIFJlbmRlciB3aXRoIGFuaW1hdGVkIG9iamVjdHMgb25seVxyXG4gICAgICB0aGlzLnJlbmRlclVJICAgICA9IG5ldyBSZW5kZXIoY29udGV4dFVJLCBjYW52YXNVSSk7IFxyXG5cclxuICAgICAgLy8gQWRkIGl0ZW1zIHRvIGJlIHJlbmRlcmVkXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljLnNldFNjZW5hcmlvKHRoaXMuc2NlbmFyaW8pOyAvLyBzZXQgdGhlIHNjZW5hcmlvXHJcbiAgXHJcbiAgICAvLyBIaWRlIEVsZW1lbnRzXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbk1lbnVcIikuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgICB0aGlzLmxvYWRpbmcoZmFsc2UpO1xyXG5cclxuICAgIC8vIFNob3cgQ2FudmFzXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lQ2FudmFzJykuY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xyXG4gICAgXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGdhbWUgaXMgbm90IHBhdXNlZFxyXG4gICAgICB0aGlzLnVucGF1c2UoKTtcclxuICAgIFxyXG4gICAgLy8gRmxhZyBcclxuICAgICAgdGhpcy5nYW1lSXNMb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIE9rLCBydW4gdGhlIGdhbWUgbm93XHJcbiAgICAgIHRoaXMucnVuR2FtZSggdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnZnBzJykgKTtcdC8vIEdPIEdPIEdPXHJcblxyXG4gIH0vL25ld0dhbWVcclxuXHJcbiAgICAvLyAjIFRoZSBHYW1lIExvb3BcclxuICAgIHVwZGF0ZUdhbWUoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc1BhdXNlZCgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgdGhpcy5yZW5kZXJVSS5zdGFydCggZGVsdGFUaW1lICk7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLnN0YXJ0KCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIC8vICMgQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSApO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgXHJcbiAgICAgIC8vIFwiU3RhdGljXCIgUmVuZGVyIC0gQmFja2dyb3VuZFxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuYWRkQXJyYXlJdGVtKHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSk7IC8vIEdldCBhbGwgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgICAgLy8gTGF5ZXJzIFJlbmRlclxyXG4gICAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG5cclxuICAgICAgICAvLyAjIEJvdHRvbSBcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyAjIE1pZGRsZVxyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLmFkZEl0ZW0oIHBsYXllciApOyAvLyBBZGRzIHRoZSBwbGF5ZXIgdG8gdGhlIGFuaW1hdGlvbiByZW5kZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gIyBUb3BcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fdG9wKCkgKTtcclxuXHJcbiAgICAgIC8vIFVJIFJlbmRlclxyXG4gICAgICB0aGlzLnJlbmRlclVJLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLnJlbmRlclVJLmFkZEFycmF5SXRlbSggdGhpcy5VSS5nZXROZXdSZW5kZXJJdGVtcygpKTtcclxuICAgICAgXHJcbiAgICAgIC8vICMgTW92ZW1lbnRzXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBwbGF5ZXIuaGFuZGxlTW92ZW1lbnQoIHRoaXMua2V5c0Rvd24gKTtcclxuICAgICAgfSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyAjIENoZWNrIGlmIHBsYXllciBpcyBjb2xsaWRpbmdcclxuICAgICAgdGhpcy5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHRoaXMuY29sbGlzaW9uLmNoZWNrKHBsYXllcik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vICMgXCJUaHJlYWRcIiB0aGEgcnVucyB0aGUgZ2FtZVxyXG4gICAgcnVuR2FtZShmcHMpIHtcclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgdGhpcy5nYW1lTG9vcCgpO1xyXG4gICAgfVxyXG4gICAgZ2FtZUxvb3AoKSB7XHJcblxyXG4gICAgICAvLyBjYWxjIGVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgdGhpcy5ub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aGlzLmVsYXBzZWQgPSB0aGlzLm5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG5cclxuICAgICAgLy8gaWYgZW5vdWdoIHRpbWUgaGFzIGVsYXBzZWQsIGRyYXcgdGhlIG5leHQgZnJhbWVcclxuICAgICAgaWYgKCB0aGlzLmVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIEdldCByZWFkeSBmb3IgbmV4dCBmcmFtZSBieSBzZXR0aW5nIHRoZW49bm93LCBidXQgYWxzbyBhZGp1c3QgZm9yIHlvdXJcclxuICAgICAgICAvLyBzcGVjaWZpZWQgZnBzSW50ZXJ2YWwgbm90IGJlaW5nIGEgbXVsdGlwbGUgb2YgUkFGJ3MgaW50ZXJ2YWwgKDE2LjdtcylcclxuICAgICAgICB0aGlzLmRlbHRhVGltZSA9IHRoaXMubm93IC0gKHRoaXMuZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUdhbWUoIHRoaXMuZGVsdGFUaW1lICk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSdW5zIG9ubHkgd2hlbiB0aGUgYnJvd3NlciBpcyBpbiBmb2N1c1xyXG4gICAgICAvLyBSZXF1ZXN0IGFub3RoZXIgZnJhbWVcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLmdhbWVMb29wLmJpbmQodGhpcykgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U2NlbmFyaW8oIHNjZW5hcmlvX2lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICkge1xyXG4gICAgICBzd2l0Y2goc2NlbmFyaW9faWQpIHtcclxuICAgICAgICBjYXNlIFwicHJvdG90eXBlXCI6XHJcbiAgICAgICAgICByZXR1cm4gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgdGhpcy5nYW1lUHJvcHMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwic2FuZGJveFwiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBzY2VuYXJpb1NhbmRib3goY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCB0aGlzLmdhbWVQcm9wcywgc2F2ZURhdGEgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuICBcclxuICAvLyAjIE1lbnVcclxuICBcclxuICAvLyBAcGF1c2VkIGRldGVybWluZSBpZiB0aGUgZ2FtZSBjYW1lIGZyb20gYSBwYXVzZSBhY3Rpb24gb3IgYSBuZXcgZ2FtZSAod2hlbiBwYWdlIGxvYWRzKVxyXG4gIG1haW5NZW51KHBhdXNlZCkgeyBcclxuICAgIFxyXG4gICAgbGV0IGRpdk1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbk1lbnUnKTtcclxuXHJcbiAgICAvLyBTZXQgbWFpbk1lbnUgY2xhc3NcclxuICAgICggcGF1c2VkICkgPyBkaXZNZW51LmNsYXNzTGlzdC5hZGQoJ3BhdXNlZCcpIDogZGl2TWVudS5jbGFzc0xpc3QuYWRkKCduZXctZ2FtZScpO1xyXG4gICAgXHJcbiAgICAvLyBUb2dnbGUgTWVudVxyXG4gICAgZGl2TWVudS5jbGFzc0xpc3QudG9nZ2xlKCdzaG93Jyk7XHJcbiAgICBcclxuICB9XHJcbiAgICAvLyBIYW5kbGUgTWVudSBBY3Rpb25cclxuICAgIG1lbnVBY3Rpb24oYWN0aW9uKSB7XHJcbiAgICAgIHN3aXRjaChhY3Rpb24pIHtcclxuICAgICAgICBjYXNlICdjb250aW51ZSc6XHJcbiAgICAgICAgICB0aGlzLmNvbnRpbnVlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2F2ZSc6XHJcbiAgICAgICAgICB0aGlzLnNhdmVHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdsb2FkJzpcclxuICAgICAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldyc6XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbmV3LTItcGxheWVycyc6XHJcbiAgICAgICAgICB0aGlzLm11bHRpcGxheWVyID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMubmV3R2FtZShmYWxzZSk7Ly8gZmFsc2UgPSB3b24ndCBsb2FkIHNhdmVEYXRhXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBOZXcgR2FtZVxyXG4gIG5ld0dhbWUoc2F2ZURhdGEpIHtcclxuICAgIHRoaXMucGF1c2UoKTtcclxuICAgIHRoaXMubG9hZGluZyh0cnVlKTtcclxuICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgdGhpcy5zdGFydE5ld0dhbWUoc2F2ZURhdGEpOyBcclxuICAgIH0sIDEwMDAgKTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBDb250aW51ZVxyXG4gIGNvbnRpbnVlR2FtZSgpIHtcclxuICAgIHRoaXMudW5wYXVzZSgpO1xyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFNhdmVcclxuICBzYXZlR2FtZSgpIHtcclxuICAgIGlmKCBjb25maXJtKCdTYWx2YXIgbyBqb2dvIGF0dWFsIGlyw6Egc29icmVlc2NyZXZlciBxdWFscXVlciBqb2dvIHNhbHZvIGFudGVyaW9ybWVudGUuIERlc2VqYSBjb250aW51YXI/JykgKSB7XHJcbiAgICAgIFxyXG4gICAgICBsZXQgc2F2ZURhdGEgPSBuZXcgT2JqZWN0KCk7XHJcblxyXG4gICAgICAvLyBNdWx0aXBsYXllclxyXG4gICAgICBzYXZlRGF0YS5tdWx0aXBsYXllciA9IHRoaXMubXVsdGlwbGF5ZXI7XHJcblxyXG4gICAgICAvLyBTY2VuYXJpb1xyXG4gICAgICBzYXZlRGF0YS5zY2VuYXJpbyA9IHtcclxuICAgICAgICBzY2VuYXJpb0lkOiB0aGlzLnNjZW5hcmlvLmdldElkKCksXHJcbiAgICAgICAgc3RhZ2VJZDogdGhpcy5zY2VuYXJpby5nZXRBY3R1YWxTdGFnZUlkKClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUGxheWVyc1xyXG4gICAgICBzYXZlRGF0YS5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgcGxheWVyTnVtYmVyOiBwbGF5ZXIuZ2V0UGxheWVyTnVtYmVyKCksXHJcbiAgICAgICAgICB4OiBwbGF5ZXIuZ2V0WCgpLFxyXG4gICAgICAgICAgeTogcGxheWVyLmdldFkoKSxcclxuICAgICAgICAgIGxpZmVzOiBwbGF5ZXIuZ2V0TGlmZXMoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENvbnZlcnQgdG8gSlNPTlxyXG4gICAgICBzYXZlRGF0YSA9IEpTT04uc3RyaW5naWZ5KHNhdmVEYXRhKTtcclxuICAgICAgXHJcbiAgICAgIC8vIFNhdmUgb24gTG9jYWxTdG9yYWdlXHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnZ3VmaXRydXBpX19zYXZlJywgc2F2ZURhdGEgKTtcclxuXHJcbiAgICAgIGFsZXJ0KCdKb2dvIHNhbHZvIScpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG5cclxuICAvLyAjIFNhdmVcclxuICBsb2FkR2FtZSgpIHtcclxuICAgIFxyXG4gICAgLy8gIyBHZXQgZGF0YSBmcm9tIGxvY2Fsc3RvcmFnZSBhbmQgY29udmVydHMgdG8ganNvblxyXG4gICAgbGV0IHNhdmVEYXRhID0gSlNPTi5wYXJzZSggbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2d1Zml0cnVwaV9fc2F2ZScpICk7XHJcblxyXG4gICAgLy8gV2lsbCBiZSAgbXVsdGlwbGF5ZXIgZ2FtZT9cclxuICAgIHRoaXMubXVsdGlwbGF5ZXIgPSBzYXZlRGF0YS5tdWx0aXBsYXllcjtcclxuXHJcbiAgICAvLyAjIExvYWRzIGEgbmV3IGdhbWUgd2l0aCBzYXZlIGRhdGFcclxuICAgIHRoaXMubmV3R2FtZShzYXZlRGF0YSk7IFxyXG5cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBQYXVzZVxyXG4gIGlzUGF1c2VkKCkgeyByZXR1cm4gdGhpcy5fcGF1c2U7IH1cclxuICBwYXVzZSgpIHsgXHJcbiAgICB0aGlzLl9wYXVzZSA9IHRydWU7IFxyXG4gICAgdGhpcy5tYWluTWVudSh0cnVlKTtcclxuICB9XHJcbiAgdW5wYXVzZSgpIHsgXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFpbk1lbnUnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICB0aGlzLl9wYXVzZSA9IGZhbHNlOyAgXHJcbiAgfVxyXG4gIHRvZ2dsZVBhdXNlKCkgeyAoIHRoaXMuaXNQYXVzZWQoKSApID8gdGhpcy51bnBhdXNlKCkgOiB0aGlzLnBhdXNlKCkgfVxyXG4gIFxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBMb2FkaW5nXHJcbiAgbG9hZGluZyhib29sKSB7XHJcbiAgICBsZXQgZGlzcGxheSA9ICggYm9vbCApID8gJ2ZsZXgnIDogJ25vbmUnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRpbmcnKS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBSdW5cclxuICBydW4oKSB7XHJcblxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDYW52YXMnKS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XHJcbiAgICB0aGlzLmxvYWRpbmcoZmFsc2UpO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBldmVudCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuZGVmYXVsdEV2ZW50TGlzdGVuZXJzKCk7XHJcbiAgICBcclxuICAgIC8vIFNob3dzIE1lbnVcclxuICAgIHRoaXMubWFpbk1lbnUoZmFsc2UpO1xyXG5cclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJjbGFzcyBSZW5kZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgcGxheWVyKSB7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDsgXHJcbiAgICB0aGlzLnNjZW5hcmlvID0gXCJcIjtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICAgICAgICAgICAgXHJcbiAgLy8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuICBhZGRJdGVtKG9iamVjdCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuICB9XHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcbiAgICBmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXsgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBzZXRTY2VuYXJpbyhzY2VuYXJpbyl7XHJcbiAgICB0aGlzLnNjZW5hcmlvID0gc2NlbmFyaW87XHJcbiAgfVxyXG4gICAgICAgICAgICBcclxuICAvLyBUaGlzIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZCBjb25zdGFudGx5IHRvIHJlbmRlciBpdGVtc1xyXG4gIHN0YXJ0KGRlbHRhVGltZSkge1x0XHRcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgLy8gQ2xlYXIgY2FudmFzIGJlZm9yZSByZW5kZXIgYWdhaW5cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIHRoaXMuY3R4LnNoYWRvd0JsdXIgPSAwO1xyXG5cclxuICAgIC8vIFNjZW5hcmlvXHJcbiAgICBpZiAoIHRoaXMuc2NlbmFyaW8gIT0gXCJcIikgXHJcbiAgICAgIHRoaXMuc2NlbmFyaW8ucmVuZGVyKHRoaXMuY3R4KTtcclxuICAgICAgXHJcbiAgICAvLyBSZW5kZXIgaXRlbXNcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5yZW5kZXJJdGVtcykge1xyXG4gICAgICAvLyBFeGVjdXRlIHRoZSByZW5kZXIgZnVuY3Rpb24gLSBJbmNsdWRlIHRoaXMgZnVuY3Rpb24gb24gZXZlcnkgY2xhc3NcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtc1tpXS5yZW5kZXIodGhpcy5jdHgsIGRlbHRhVGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbiAgICBcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXIiLCJjb25zdCBVSWl0ZW0gPSByZXF1aXJlKCcuL19VSWl0ZW0nKTtcclxuXHJcbmNsYXNzIFVJIHtcclxuXHJcbiAgY29uc3RydWN0b3IocGxheWVycywgZ2FtZVByb3BzKSB7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVycyA9IHBsYXllcnM7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gICAgdGhpcy5nYW1lUHJvcHMgPSBnYW1lUHJvcHM7XHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcbiAgICAgICAgICAgICAgXHJcbiAgLy8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuICBhZGRJdGVtKG9iamVjdCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuICB9XHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcbiAgICBmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXsgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBnZXRSZW5kZXJJdGVtcygpe1xyXG4gICAgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhciBhcnJheSBhbmQgcmVydW4gY29kZSB0byBnZXQgbmV3IGl0ZW1zXHJcbiAgZ2V0TmV3UmVuZGVySXRlbXMoKSB7XHJcbiAgICB0aGlzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgdGhpcy5ydW4oKTtcclxuICAgIHJldHVybiB0aGlzLmdldFJlbmRlckl0ZW1zKCk7XHJcbiAgfVxyXG5cclxuICAvLyBNYXRoXHJcbiAgZnJvbVJpZ2h0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gKCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdzY3JlZW5Ib3Jpem9udGFsQ2h1bmtzJykgKiB0aGlzLmNodW5rU2l6ZSApIC0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICBydW4oKSB7XHJcblxyXG4gICAgLy8gIyBQbGF5ZXJzXHJcblxyXG4gICAgICAvLyAjIFBsYXllciAwMVxyXG4gICAgICAgIGlmKCB0aGlzLnBsYXllcnNbMF0gKSB7XHJcbiAgICAgICAgICAvLyAjIEF2YXRhclxyXG4gICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5jaHVua1NpemUsXHJcbiAgICAgICAgICAgIDUsIDUsIC8vIHgsIHksXHJcbiAgICAgICAgICAgIDUwLCA1MCwgICAvLyBzcHJpdGVfdywgc3ByaXRlX2gsIFxyXG4gICAgICAgICAgICAwLCAwLCAgICAgIC8vIGNsaXBfeCwgY2xpcF95XHJcbiAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLCB0aGlzLmNodW5rU2l6ZSAvLyB3LCBoXHJcbiAgICAgICAgICApICk7XHJcblxyXG4gICAgICAgICAgLy8gIyBMaWZlXHJcbiAgICAgICAgICBsZXQgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgbGV0IF8xeSA9IDEwO1xyXG4gICAgICAgICAgbGV0IF8xbGlmZXMgPSB0aGlzLnBsYXllcnNbMF0uZ2V0TGlmZXMoKTtcclxuICAgICAgICAgIGZvciggbGV0IGk9MDsgaTxfMWxpZmVzO2krKyApIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRJdGVtKCBuZXcgVUlpdGVtKFxyXG4gICAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgICBfMXgsIF8xeSxcclxuICAgICAgICAgICAgICA1MCwgNTAsICAgXHJcbiAgICAgICAgICAgICAgMTAwLCAwLCAgICAgIFxyXG4gICAgICAgICAgICAgIHRoaXMuY2h1bmtTaXplLzMsIHRoaXMuY2h1bmtTaXplLzMgXHJcbiAgICAgICAgICAgICkgKTtcclxuICAgICAgICAgICAgXzF4ICs9IDM1O1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT0gMiApIHtcclxuICAgICAgICAgICAgICBfMXggPSAxMjA7XHJcbiAgICAgICAgICAgICAgXzF5ID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSBcclxuXHJcbiAgICAgIC8vICMgUGxheWVyIDAyXHJcbiAgICAgICAgaWYoIHRoaXMucGxheWVyc1sxXSApIHtcclxuICAgICAgICAgIC8vICMgQXZhdGFyXHJcbiAgICAgICAgICB0aGlzLmFkZEl0ZW0oIG5ldyBVSWl0ZW0oXHJcbiAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgdGhpcy5mcm9tUmlnaHQoIDIzMCApLCA1LCBcclxuICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICA1MCwgMCwgICAgICBcclxuICAgICAgICAgICAgdGhpcy5jaHVua1NpemUsIHRoaXMuY2h1bmtTaXplIFxyXG4gICAgICAgICAgKSApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyAjIExpZmVcclxuICAgICAgICAgIGxldCBfMnggPSB0aGlzLmZyb21SaWdodCggNTAgKTtcclxuICAgICAgICAgIGxldCBfMnkgPSAxMDtcclxuICAgICAgICAgIGxldCBfMmxpZmVzID0gdGhpcy5wbGF5ZXJzWzFdLmdldExpZmVzKCk7XHJcbiAgICAgICAgICBmb3IoIGxldCBpPTA7IGk8XzJsaWZlcztpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgICAgXzJ4LCBfMnksXHJcbiAgICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICAgIDEwMCwgMCwgICAgICBcclxuICAgICAgICAgICAgICB0aGlzLmNodW5rU2l6ZS8zLCB0aGlzLmNodW5rU2l6ZS8zIFxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICAgIF8yeCAtPSAzNTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09IDIgKSB7XHJcbiAgICAgICAgICAgICAgXzJ4ID0gdGhpcy5mcm9tUmlnaHQoIDUwICk7XHJcbiAgICAgICAgICAgICAgXzJ5ID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgLy8gIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICBcclxuICB9XHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVUkiLCJjbGFzcyBVSWl0ZW0ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihpdGVtU3ByaXRlSUQsIGNodW5rU2l6ZSwgeCwgeSwgc3csIHNoLCBjeCwgY3ksIHcsIGggKSB7XHJcbiAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5pdGVtU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVNwcml0ZUlEKTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcyA9IHtcclxuICAgICAgc3ByaXRlX3dpZHRoOiBzdyxcclxuICAgICAgc3ByaXRlX2hlaWdodDogc2gsXHJcbiAgICAgIGNsaXBfeDogY3gsXHJcbiAgICAgIGNsaXBfeTogY3ksXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcblxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLndpZHRoID0gdzsgLy9weFxyXG4gICAgdGhpcy5oZWlnaHQgPSBoOyAvL3B4XHJcbiAgfVxyXG5cclxuICAvLyAjIFNldHMgICAgICBcclxuICBzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG4gIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHJcbiAgLy8gIyBHZXRzICAgICAgICAgICAgXHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgICAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgXHJcbiAgLy8gIyBJdGVtIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgICAgXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjtcclxuXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICB0aGlzLml0ZW1TcHJpdGUsICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfd2lkdGgsIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICk7XHJcbiAgICBcclxuICB9XHJcbiAgICAgXHJcbn0vL2NsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJaXRlbTtcclxuIiwiLy8gR2FtZSBQcm9wZXJ0aWVzIGNsYXNzIHRvIGRlZmluZSBjb25maWd1cmF0aW9uc1xyXG5jbGFzcyBnYW1lUHJvcGVydGllcyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgXHJcbiAgICAvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IDEwMDsgLy9weCAtIHJlc29sdXRpb25cclxuICAgIFxyXG4gICAgdGhpcy5zY3JlZW5Ib3Jpem9udGFsQ2h1bmtzID0gMTY7XHJcbiAgICB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzID0gMTQ7XHJcbiAgICBcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MpO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzKTsvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgXHJcbiAgICB0aGlzLmZwcyA9IDI0O1xyXG4gIH1cclxuXHJcbiAgZ2V0UHJvcChwcm9wKSB7XHJcbiAgICByZXR1cm4gdGhpc1twcm9wXTtcclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZVByb3BlcnRpZXM7XHJcblxyXG4vLyBHbG9iYWwgdmFsdWVzXHJcblxyXG4gIC8vIERlYnVnXHJcbiAgd2luZG93LmRlYnVnID0gZmFsc2U7XHJcbiIsImNvbnN0IEdhbWUgPSByZXF1aXJlKCcuL2VuZ2luZS9HYW1lJyk7XHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIC8vICMgU3RhcnQgdGhlIGdhbWVcclxuICAgIGxldCBnYW1lID0gbmV3IEdhbWUoKTtcclxuICAgIHdpbmRvdy5nYW1lID0gZ2FtZTtcclxuICAgIGdhbWUucnVuKCk7XHJcblxyXG59Il19
