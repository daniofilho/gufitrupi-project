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
        sprite_width: 18, // Player size inside sprite
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
      
      // if ( this.hideSprite ) return; // I think I've made a mistake using this line here, but will keep until I remeber why I did it

      // Player 1 Controls
      if( this.playerNumber == 1 ) {
        if (37 in keysDown) this.movLeft();  // Left
        if (38 in keysDown) this.movUp();    // Up  
        if (39 in keysDown) this.movRight(); // Right
        if (40 in keysDown) this.movDown();  // Down
      }
      
      // Player 2 Controls
      if( this.playerNumber == 2 ) {
        if (65 in keysDown) this.movLeft();  // Left
        if (87 in keysDown) this.movUp();    // Up 
        if (68 in keysDown) this.movRight(); // Right
        if (83 in keysDown) this.movDown();  // Down
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
},{"../common/_Scenario":20,"./stages/stage_bottom":4,"./stages/stage_center":5,"./stages/stage_left":6,"./stages/stage_right":7,"./stages/stage_up":8}],4:[function(require,module,exports){
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":16,"../../common/_Stage":21}],5:[function(require,module,exports){
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
},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Fire":14,"../../common/Teleport":16,"../../common/_Stage":21}],6:[function(require,module,exports){
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":16,"../../common/_Stage":21}],7:[function(require,module,exports){
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":16,"../../common/_Stage":21}],8:[function(require,module,exports){
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

},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Teleport":16,"../../common/_Stage":21}],9:[function(require,module,exports){
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
},{"../common/_Scenario":20,"./stages/stage_center":10,"./stages/stage_life":11}],10:[function(require,module,exports){
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
},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Fire":14,"../../common/Teleport":16,"../../common/_Stage":21}],11:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');
const Heal = require('../../common/Heal');

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
      case "fire":
        return new Fire(item.type, x, y, this.chunkSize);
        break;
      case "heal":
        return new Heal(item.type, x, y, this.chunkSize);
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

    let tp_c = { name: 'teleport', type: '', teleportType: 'relative', cameFrom: 'bottom',        targetStage: 'center' };

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   bnna,    false,   false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   false,  bnna,    false,   false,   false,   false,   false,   false,   false,   false,   fire,    false,   false,   false,   false ],
      [ false,   false,  false,   false,   bnna,    false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   tp_c,    false,   false,   false,   false,   false,   false,   false,   false ],
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
},{"../../common/Beach_Floor":12,"../../common/Beach_Wall":13,"../../common/Fire":14,"../../common/Heal":15,"../../common/Teleport":16,"../../common/_Stage":21}],12:[function(require,module,exports){
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
},{"./_Collidable":19}],13:[function(require,module,exports){
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
},{"./_Collidable":19}],14:[function(require,module,exports){
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
    this.fpsInterval = 1000 / 5; // 1000 / FPS
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
},{"./_CanHurt":18}],15:[function(require,module,exports){
const _CanCollect = require('./_CanCollect');

class Heal extends _CanCollect {

  constructor(type, x0, y0, chunkSize) {
    
    let props = {
      name: "Potion",
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
    
    let canCollectProps = {
      canRespawn: true
    }

    super(props, position, dimension, game, sprite, events, canCollectProps);
    
    this.healAmout = 1;
    this.itemUsed = false;
  }

  setHealAmout(amount) { this.healAmout = amount; }
  getHealAmount() { return this.healAmout; }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
      case 'banana':
        this.setHealAmout(1);
        this.setCanRespawn(false);
        this.spriteProps = { 
          clip_x: 0, clip_y: 50, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteWidth
        }
        break;
    }
  }

  collision(player){ 
    if( ! this.isCollected() ) {
      this.collect();
      this.hide();
      player.healPlayer( this.getHealAmount() );
    }
    return true; 
  }

}//class
module.exports = Heal;
},{"./_CanCollect":17}],16:[function(require,module,exports){
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
},{"../../../gameProperties":29,"./_Collidable":19}],17:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class _CanCollect extends _Collidable {

  constructor(props, position, dimension, game, sprite, events, canCollectProps) {
    super(props, position, dimension, game, sprite, events);
    
    this.collected = false;
    this.canRespawn = canCollectProps.canRespawn;
  }

  isCollected() { return this.collected; }
  collect(){ this.collected = true; }

  setCanRespawn(bool){ this.canRespawn = bool; }
  
  setName(name) { this.name = name; }

}//class
module.exports = _CanCollect;
},{"./_Collidable":19}],18:[function(require,module,exports){
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
},{"./_Collidable":19}],19:[function(require,module,exports){
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
    this.hideSprite = false;

    this.spriteWidth = sprite.width;   
    this.spriteHeight = sprite.height; 
    this.spriteProps = new Array();
    
    this.name = props.name + "(" + this.x + "/" + this.y + ")";

    this.hideSprite

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

  hide() { this.hideSprite = true; }
  show() { this.hideSprite = false; }
			
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

    if ( this.hideSprite ) return;
      
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
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
	
},{}],24:[function(require,module,exports){
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

      //console.log(  );

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

        console.log( this.renderLayers.getArrayItems() );
        
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

    // Auto load a game - debug mode
    if( window.autoload ) {
      this.loadGame();
    }

  }

}
module.exports = Game;
},{"../assets/Player":1,"../assets/scenario/Prototype/scenarioPrototype":3,"../assets/scenario/Sandbox/scenarioSandbox":9,"../gameProperties":29,"./Collision":23,"./Render":25,"./UI":26}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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

          // Debug Position
          if( window.debug ) {
            this.addItem( 
              new UIitem_text(
                "X: " + Math.round(this.players[0].getX())+ " \nY: " + Math.round(this.players[0].getY()), // Text 
                5, 145, // X, Y
                {  color: "#FFFFFF", size: "30px"  } // font props
              ) 
            );
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
},{"./_UIitem":27,"./_UIitem_text":28}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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
  
},{}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
const Game = require('./engine/Game');

window.onload = function() {

  // # Start the game
    let game = new Game();
    window.game = game;
    game.run();

}
},{"./engine/Game":24}]},{},[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,29,30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL1BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlX2JvdHRvbS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9jZW50ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfbGVmdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV9yaWdodC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV91cC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zY2VuYXJpb1NhbmRib3guanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1NhbmRib3gvc3RhZ2VzL3N0YWdlX2NlbnRlci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vU2FuZGJveC9zdGFnZXMvc3RhZ2VfbGlmZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX0Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfV2FsbC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0ZpcmUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9IZWFsLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vVGVsZXBvcnQuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fQ2FuQ29sbGVjdC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19DYW5IdXJ0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX0NvbGxpZGFibGUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU2NlbmFyaW8uanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU3RhZ2UuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9lbmVtX3Byb3RvdHlwZS5qcyIsImNsaWVudC9lbmdpbmUvQ29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9HYW1lLmpzIiwiY2xpZW50L2VuZ2luZS9SZW5kZXIuanMiLCJjbGllbnQvZW5naW5lL1VJLmpzIiwiY2xpZW50L2VuZ2luZS9fVUlpdGVtLmpzIiwiY2xpZW50L2VuZ2luZS9fVUlpdGVtX3RleHQuanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiLCJjbGllbnQvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNqWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgUGxheWVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoeDAsIHkwLCBnYW1lUHJvcHMsIHBsYXllck51bWJlciwgcGxheWVyUHJvcHMpIHtcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICAgIGlmKCBwbGF5ZXJOdW1iZXIgPT0gMSApIHtcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX29uZScpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKCBwbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX3R3bycpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzID0ge1xyXG4gICAgICAgIHNwcml0ZV93aWR0aDogMTgsIC8vIFBsYXllciBzaXplIGluc2lkZSBzcHJpdGVcclxuICAgICAgICBzcHJpdGVfaGVpZ2h0OiA0MFxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuc3RlcCA9IFtdO1xyXG4gICAgICB0aGlzLmRlZmF1bHRTdGVwID0gMTtcclxuICAgICAgdGhpcy5pbml0aWFsU3RlcCA9IDM7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDg7XHJcblxyXG4gICAgICAvLyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBBbmltYXRpb25cclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAxMjsgLy8gMTAwMCAvIEZQU1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgICB0aGlzLnggPSB4MDtcclxuICAgICAgdGhpcy55ID0geTA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLngwID0geDA7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgdGhpcy55MCA9IHkwO1xyXG4gICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2h1bmtTaXplOyAvL3B4XHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jaHVua1NpemUgKiAyOyAvL3B4XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwZWVkMCA9IDY7XHJcbiAgICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAvIHRoaXMuc3BlZWQwO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5uYW1lID0gXCJQbGF5ZXIgXCIgKyBwbGF5ZXJOdW1iZXI7XHJcbiAgICAgIHRoaXMucGxheWVyTnVtYmVyID0gcGxheWVyTnVtYmVyO1xyXG4gICAgICBcclxuICAgIC8vICMgRXZlbnRzICBcclxuICAgICAgXHJcbiAgICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gdHJ1ZTtcclxuICAgICAgdGhpcy5pc01vdmluZyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmhpZGVTcHJpdGUgPSBmYWxzZTtcclxuICAgICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICBcclxuICAgICAgLy8gIyBDb2xsaXNpb25cclxuICAgICAgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHRoaXMud2lkdGggKiAwLjg7XHJcbiAgICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiAwLjM7XHJcbiAgICAgIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgPSB0aGlzLndpZHRoICogMC4xOyAvLyBVc2VkIHRvIHNldCBjb2xsaXNpb24gWCB3aGVuIHNldHRpbmcgWCBcclxuICAgICAgdGhpcy5Db2xsaXNpb25ZRm9ybXVsYSA9IHRoaXMuaGVpZ2h0ICogMC43OyBcclxuICAgICAgdGhpcy5jb2xsaXNpb25YID0geDAgKyB0aGlzLkNvbGxpc2lvblhGb3JtdWxhO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkgPSB5MCArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGE7XHJcblxyXG4gICAgICB0aGlzLmNvbGxpc2lvblgwID0gdGhpcy5jb2xsaXNpb25YO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvblkwID0gdGhpcy5jb2xsaXNpb25ZO1xyXG5cclxuICAgIFxyXG4gICAgICAvLyAjIExpZmVcclxuICAgICAgdGhpcy5kZWZhdWx0TGlmZXMgPSA2O1xyXG4gICAgICB0aGlzLmxpZmVzID0gdGhpcy5kZWZhdWx0TGlmZXM7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmNhbkJlSHVydCA9IHRydWU7XHJcbiAgICAgIHRoaXMuaHVydENvb2xEb3duVGltZSA9IDIwMDA7IC8vMnNcclxuXHJcbiAgICAgIC8vIFBsYXllciBQcm9wcyBpZiBoYXNcclxuICAgICAgaWYoIHBsYXllclByb3BzICkge1xyXG4gICAgICAgIHRoaXMubGlmZXMgPSBwbGF5ZXJQcm9wcy5saWZlcztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5ydW4oKTtcclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTcHJpdGVzIHN0YXRlIGZvciBwbGF5ZXIgZGlyZWN0aW9uXHJcbiAgICBcclxuICAgIGxvb2tEb3duKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2Rvd24nO1xyXG4gICAgICBcclxuICAgICAgLy8gU3RlcHNcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tVcCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICd1cCc7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogNDAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1JpZ2h0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAyMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogODAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgICAgICBcclxuXHRcdGxvb2tMZWZ0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDEyMCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuXHQgICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICAgIFxyXG5cdC8vICMgUGxheWVyIE1vdmVtZW50XHJcblx0XHRcclxuXHRcdG1vdkxlZnQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5nZXRDb2xsaXNpb25YKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92UmlnaHQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKCB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZVcCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuZ2V0Q29sbGlzaW9uWSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7XHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdkRvd24oKSB7ICBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgICAgdGhpcy5zZXRDb2xsaXNpb25ZKCB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0U3BlZWQoKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBoYW5kbGVNb3ZlbWVudCgga2V5c0Rvd24gKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjsgLy8gSSB0aGluayBJJ3ZlIG1hZGUgYSBtaXN0YWtlIHVzaW5nIHRoaXMgbGluZSBoZXJlLCBidXQgd2lsbCBrZWVwIHVudGlsIEkgcmVtZWJlciB3aHkgSSBkaWQgaXRcclxuXHJcbiAgICAgIC8vIFBsYXllciAxIENvbnRyb2xzXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllck51bWJlciA9PSAxICkge1xyXG4gICAgICAgIGlmICgzNyBpbiBrZXlzRG93bikgdGhpcy5tb3ZMZWZ0KCk7ICAvLyBMZWZ0XHJcbiAgICAgICAgaWYgKDM4IGluIGtleXNEb3duKSB0aGlzLm1vdlVwKCk7ICAgIC8vIFVwICBcclxuICAgICAgICBpZiAoMzkgaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHRcclxuICAgICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93blxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAvLyBQbGF5ZXIgMiBDb250cm9sc1xyXG4gICAgICBpZiggdGhpcy5wbGF5ZXJOdW1iZXIgPT0gMiApIHtcclxuICAgICAgICBpZiAoNjUgaW4ga2V5c0Rvd24pIHRoaXMubW92TGVmdCgpOyAgLy8gTGVmdFxyXG4gICAgICAgIGlmICg4NyBpbiBrZXlzRG93bikgdGhpcy5tb3ZVcCgpOyAgICAvLyBVcCBcclxuICAgICAgICBpZiAoNjggaW4ga2V5c0Rvd24pIHRoaXMubW92UmlnaHQoKTsgLy8gUmlnaHRcclxuICAgICAgICBpZiAoODMgaW4ga2V5c0Rvd24pIHRoaXMubW92RG93bigpOyAgLy8gRG93blxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBTZXRzXHJcblx0XHRcclxuXHRcdHNldFgoeCwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgICB0aGlzLnggPSB4OyBcclxuICAgICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWCggeCArIHRoaXMuQ29sbGlzaW9uWEZvcm11bGEgKTtcclxuICAgIH1cclxuICAgIHNldFkoeSwgc2V0Q29sbGlzaW9uKSB7IFxyXG4gICAgICB0aGlzLnkgPSB5OyBcclxuICAgICAgaWYoIHNldENvbGxpc2lvbiApIHRoaXMuc2V0Q29sbGlzaW9uWSggeSArIHRoaXMuQ29sbGlzaW9uWUZvcm11bGEgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0Q29sbGlzaW9uWCh4KSB7IHRoaXMuY29sbGlzaW9uWCA9IHg7IH1cclxuXHRcdHNldENvbGxpc2lvblkoeSkgeyB0aGlzLmNvbGxpc2lvblkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0c2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gc3BlZWQ7IH1cclxuXHJcblx0XHRzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG5cdFx0dHJpZ2dlckxvb2tEaXJlY3Rpb24oZGlyZWN0aW9uKSB7IFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgICAgdGhpcy5yZXNldFN0ZXAoKTtcclxuICAgIH1cclxuXHJcblx0XHRyZXNldFBvc2l0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcbiAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWCggdGhpcy5jb2xsaXNpb25YMCApO1xyXG4gICAgICB0aGlzLnNldENvbGxpc2lvblkoIHRoaXMuY29sbGlzaW9uWTAgKTtcclxuICAgIH1cclxuXHJcbiAgICBodXJ0UGxheWVyKCBhbW91bnQgKSB7XHJcbiAgICAgIGlmKCB0aGlzLmNhbkJlSHVydCApIHtcclxuICAgICAgICBcclxuICAgICAgICAvLyBIdXJ0IHBsYXllclxyXG4gICAgICAgIHRoaXMubGlmZXMgLT0gYW1vdW50O1xyXG4gICAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMCApIHRoaXMubGlmZXMgPSAwO1xyXG5cclxuICAgICAgICAvLyBTdGFydCBjb29sZG93blxyXG4gICAgICAgIHRoaXMuY2FuQmVIdXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jYW5CZUh1cnQgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdGhpcy5odXJ0Q29vbERvd25UaW1lKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgcGxheWVyIGRpZWRcclxuICAgICAgICB0aGlzLmNoZWNrUGxheWVyRGVhdGgoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhlYWxQbGF5ZXIoIGFtb3VudCApIHtcclxuICAgICAgdGhpcy5saWZlcyArPSBwYXJzZUludChhbW91bnQpO1xyXG4gICAgICBpZiggdGhpcy5saWZlcyA+IHRoaXMuZGVmYXVsdExpZmVzICkgdGhpcy5saWZlcyA9IHRoaXMuZGVmYXVsdExpZmVzO1xyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrUGxheWVyRGVhdGgoKSB7XHJcbiAgICAgIGlmKCB0aGlzLmxpZmVzIDwgMSAmJiAhd2luZG93LmdvZF9tb2RlICkge1xyXG4gICAgICAgd2luZG93LmdhbWUubmV3R2FtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblx0XHRcclxuXHQvLyAjIEdldHNcclxuICAgIFxyXG4gICAgZ2V0TGlmZXMoKSB7IHJldHVybiB0aGlzLmxpZmVzOyB9XHJcbiAgICBcclxuICAgIGdldFBsYXllck51bWJlcigpIHsgcmV0dXJuIHRoaXMucGxheWVyTnVtYmVyOyB9XHJcblxyXG5cdCAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0Z2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHQgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgICAgXHJcbiAgICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uSGVpZ2h0OyB9XHJcbiAgICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuICAgIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy5jb2xsaXNpb25YOyB9XHJcbiAgICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMuY29sbGlzaW9uWTsgfVxyXG5cclxuICAgIGdldENlbnRlclgoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDI7IH1cclxuICAgIGdldENlbnRlclkoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyOyB9XHJcblx0XHRcdFxyXG5cdFx0Z2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblx0XHRnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuICAgICAgXHJcbiAgICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgICAgXHJcbiAgICBpbmNyZWFzZVN0ZXAoKSB7XHJcbiAgICAgIGlmKHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkpIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCsrO1xyXG4gICAgICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuaW5pdGlhbFN0ZXA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXNldFN0ZXAoKSB7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgc3dpdGNoICggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdFx0aGlkZVBsYXllcigpIHsgdGhpcy5oaWRlU3ByaXRlID0gdHJ1ZTsgfVxyXG4gICAgc2hvd1BsYXllcigpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuICAgIFxyXG5cdC8vICMgUGxheWVyIFJlbmRlclxyXG5cdFx0XHRcdFxyXG5cdCAgcmVuZGVyKGN0eCkge1xyXG5cclxuICAgICAgLy8gQmxpbmsgcGxheWVyIGlmIGl0IGNhbid0IGJlIGh1cnRcclxuICAgICAgaWYoICEgdGhpcy5jYW5CZUh1cnQgKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlU3ByaXRlID0gIXRoaXMuaGlkZVNwcml0ZTtcclxuICAgICAgfVxyXG4gICAgICBcclxuICAgICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcblxyXG4gICAgICAvLyBXaGF0IHRvIGRvIGV2ZXJ5IGZyYW1lIGluIHRlcm1zIG9mIHJlbmRlcj8gRHJhdyB0aGUgcGxheWVyXHJcbiAgICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgICB9IFxyXG4gICAgICBcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHRcclxuXHJcbiAgICAgIC8vIERFQlVHIENPTExJU0lPTlxyXG4gICAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDI1NSwgMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCggdGhpcy5nZXRDb2xsaXNpb25YKCksIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLmdldENvbGxpc2lvbldpZHRoKCksIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG4gICAgICBcclxuXHRcdH07XHJcbiAgXHJcbiAgLy8gIyBDb2xsaXNpb25cclxuICAgIFxyXG4gICAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gICAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICAgIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG5cdFx0bm9Db2xsaXNpb24oKSB7XHJcblx0XHRcdC8vIFdoYXQgaGFwcGVucyBpZiB0aGUgcGxheWVyIGlzIG5vdCBjb2xsaWRpbmc/XHJcblx0XHRcdHRoaXMuc2V0U3BlZWQodGhpcy5zcGVlZDApOyAvLyBSZXNldCBzcGVlZFxyXG4gICAgfVxyXG4gICAgICBcclxuICAgIGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfTtcclxuXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5sb29rRGlyZWN0aW9uID0gdGhpcy5sb29rRG93bigpO1xyXG4gIH1cclxuXHRcdFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjtcclxuIiwiLypcclxuICAgIFByb3RvdHlwZSBTY2VuYXJpb1xyXG4qL1xyXG5jb25zdCBfU2NlbmFyaW8gPSByZXF1aXJlKCcuLi9jb21tb24vX1NjZW5hcmlvJyk7XHJcblxyXG5jb25zdCBfU19jZW50ZXIgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV9jZW50ZXInKTtcclxuY29uc3QgX1NfdXAgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV91cCcpO1xyXG5jb25zdCBfU19yaWdodCA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX3JpZ2h0Jyk7XHJcbmNvbnN0IF9TX2JvdHRvbSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2JvdHRvbScpO1xyXG5jb25zdCBfU19sZWZ0ID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfbGVmdCcpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9Qcm90b3R5cGUgZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzLCBzYXZlRGF0YSl7XHJcbiAgICBzdXBlcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzLCBcInByb3RvdHlwZVwiKTtcclxuICAgIHRoaXMuZGVmYXVsdFN0YWdlSWQgPSBcImNlbnRlclwiO1xyXG4gICAgXHJcbiAgICAvLyBEZWZpbmUgd2hpY2ggc3RhZ2Ugd2lsbCBsb2FkIG9uIGZpcnN0IHJ1blxyXG4gICAgdGhpcy5zdGFnZVRvTG9hZCA9ICggc2F2ZURhdGEgKSA/IHNhdmVEYXRhLnNjZW5hcmlvLnN0YWdlSWQgOiB0aGlzLmRlZmF1bHRTdGFnZUlkO1xyXG4gICAgXHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTdGFnZXNcclxuICBzZXRTdGFnZShzdGFnZV9pZCwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgXHJcbiAgICBsZXQgc19jZW50ZXIgPSBuZXcgX1NfY2VudGVyKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgbGV0IHNfdXAgPSBuZXcgX1NfdXAoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICBsZXQgc19yaWdodCA9IG5ldyBfU19yaWdodCggdGhpcy5jaHVua1NpemUgKTtcclxuICAgIGxldCBzX2JvdHRvbSA9IG5ldyBfU19ib3R0b20oIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICBsZXQgc19sZWZ0ID0gbmV3IF9TX2xlZnQoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICBcclxuICAgIGxldCBfc3RhZ2UgPSBudWxsO1xyXG5cclxuICAgIC8vIENoZWNrIHdoaWNoIHN0YWdlIHdpbGwgbG9hZFxyXG4gICAgc3dpdGNoKHN0YWdlX2lkKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgX3N0YWdlID0gc19jZW50ZXI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICBfc3RhZ2UgPSBzX3VwO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICBfc3RhZ2UgPSBzX2xlZnQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICBfc3RhZ2UgPSBzX3JpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgIF9zdGFnZSA9IHNfYm90dG9tO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMb2FkIHRoZSBzdGFnZSBkZWZpbmVkXHJcbiAgICAgIHRoaXMubG9hZFN0YWdlKF9zdGFnZSwgZmlyc3RTdGFnZSk7XHJcbiAgfVxyXG4gXHJcbiAgLy8gU2V0IERlZmF1bHQgU3RhZ2VcclxuICBydW4oKSB7XHJcbiAgICB0aGlzLnNldFN0YWdlKCB0aGlzLnN0YWdlVG9Mb2FkLCB0cnVlKTsgICAgXHJcblx0fVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBzY2VuYXJpb1Byb3RvdHlwZTsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9Cb3R0b20gZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplLCBcImJvdHRvbVwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IGNodW5rU2l6ZSAqIDA7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gY2h1bmtTaXplICogMTtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgIFxyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYyLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdsLCAgICAgICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHdjX2JsLCAgICAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdjX2JyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgICAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9Cb3R0b207XHJcbiIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9DZW50ZXIgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplLCBcImNlbnRlclwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IGNodW5rU2l6ZSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IGNodW5rU2l6ZSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gY2h1bmtTaXplICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gY2h1bmtTaXplICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjIsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgaXdjX2JyLCAgICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgaXdjX2JsLCAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0IF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgICAgIG9iLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSBdLFxyXG4gICAgICBbIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgb2IsICAgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMiwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgXSxcclxuICAgICAgWyB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIGl3Y190ciwgICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGl3Y190bCwgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd2wsICAgICAgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ3VwJyB9O1xyXG4gICAgbGV0IHRwXzAzID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJyaWdodFwiLCAgICAgIHRhcmdldFN0YWdlOiAncmlnaHQnIH07XHJcbiAgICBsZXQgdHBfMDQgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdib3R0b20nIH07XHJcbiAgICBsZXQgdHBfMDUgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImxlZnRcIiwgICAgICAgdGFyZ2V0U3RhZ2U6ICdsZWZ0JyB9O1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogXCJmaXJlXCIsIHR5cGU6IFwiMDFcIn07IFxyXG5cclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAzIF0sXHJcbiAgICAgIFsgdHBfMDUsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzA1LCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDMgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICB0cF8wNCwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFgocGxheWVyMVN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjFTdGFydFkocGxheWVyMVN0YXJ0WSk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFgocGxheWVyMlN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllcjJTdGFydFkocGxheWVyMlN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlX0NlbnRlcjsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9MZWZ0IGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJsZWZ0XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gY2h1bmtTaXplICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSBjaHVua1NpemUgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSBjaHVua1NpemUgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgdGhpcy5jaHVua1NpemUsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTtcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdjX3RsLCB3dCwgICAgd3QsICAgIHd0LCAgICAgd3QsICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjIsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2wsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBvYiwgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHdsLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEgIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3bCwgICAgZjEsICAgIGYyLCAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxICBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd2NfYmwsIHdiLCAgICB3YiwgICAgd2IsICAgICB3YiwgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiAgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgIHd0ciwgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgICB3dHIsICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwicmlnaHRcIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwXzAxIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfTGVmdDtcclxuIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfUmlnaHQgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplLCBcInJpZ2h0XCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gY2h1bmtTaXplICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSBjaHVua1NpemUgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSBjaHVua1NpemUgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgdGhpcy5jaHVua1NpemUsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgXHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3Y190ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgb2IsICAgICBvYiwgICAgIG9iLCAgICAgb2IsICAgICBvYiwgICAgIG9iLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICB3ciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3Y19iciwgICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICB3dHIsICAgd3RyLCAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwibGVmdFwiLCAgICAgdGFyZ2V0U3RhZ2U6ICdjZW50ZXInIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyB0cF8wMSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIHRwXzAxLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9SaWdodDtcclxuIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfVXAgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplLCBcInVwXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gY2h1bmtTaXplICogMDtcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gY2h1bmtTaXplICogMDtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSBjaHVua1NpemUgKiAxO1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSBjaHVua1NpemUgKiAwO1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpOztcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBcclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3dHIsICAgICAgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3Y190bCwgICAgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyLCAgICB3bCwgICAgICAgICBmMSwgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgICAgd3RyLCAgICB3dHIsICAgIHd0ciwgICAgd3RyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRTdGF0aWNJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXJfX2JvdHRvbSgpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAxID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJib3R0b21cIiwgICAgIHRhcmdldFN0YWdlOiAnY2VudGVyJyB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WChwbGF5ZXIxU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMVN0YXJ0WShwbGF5ZXIxU3RhcnRZKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WChwbGF5ZXIyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WShwbGF5ZXIyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfVXBcclxuIiwiLypcclxuICBTYW5kYm94IFNjZW5hcmlvXHJcbiovXHJcbmNvbnN0IF9TY2VuYXJpbyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IF9TX2NlbnRlciA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlX2NlbnRlcicpO1xyXG5jb25zdCBfU19saWZlID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfbGlmZScpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9TYW5kYm94IGV4dGVuZHMgX1NjZW5hcmlvIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIGdhbWVQcm9wcywgc2F2ZURhdGEpe1xyXG4gICAgc3VwZXIoY3R4LCBjYW52YXMsIGdhbWVQcm9wcywgXCJzYW5kYm94XCIpO1xyXG4gICAgdGhpcy5kZWZhdWx0U3RhZ2VJZCA9IFwiY2VudGVyXCI7XHJcbiAgICBcclxuICAgIC8vIERlZmluZSB3aGljaCBzdGFnZSB3aWxsIGxvYWQgb24gZmlyc3QgcnVuXHJcbiAgICB0aGlzLnN0YWdlVG9Mb2FkID0gKCBzYXZlRGF0YSApID8gc2F2ZURhdGEuc2NlbmFyaW8uc3RhZ2VJZCA6IHRoaXMuZGVmYXVsdFN0YWdlSWQ7XHJcbiAgICBcclxuICAgIHRoaXMucnVuKCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFN0YWdlc1xyXG4gIHNldFN0YWdlKHN0YWdlX2lkLCBmaXJzdFN0YWdlKSB7XHJcbiAgICBcclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICBcclxuICAgIGxldCBzX2NlbnRlciA9IG5ldyBfU19jZW50ZXIoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICBsZXQgc19saWZlID0gbmV3IF9TX2xpZmUoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICBcclxuICAgIGxldCBfc3RhZ2UgPSBudWxsO1xyXG5cclxuICAgIC8vIENoZWNrIHdoaWNoIHN0YWdlIHdpbGwgbG9hZFxyXG4gICAgc3dpdGNoKHN0YWdlX2lkKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2NlbnRlcic6XHJcbiAgICAgICAgX3N0YWdlID0gc19jZW50ZXI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2xpZmUnOlxyXG4gICAgICAgIF9zdGFnZSA9IHNfbGlmZTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICAvLyBMb2FkIHRoZSBzdGFnZSBkZWZpbmVkXHJcbiAgICB0aGlzLmxvYWRTdGFnZShfc3RhZ2UsIGZpcnN0U3RhZ2UpO1xyXG4gIH1cclxuIFxyXG4gIC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcbiAgcnVuKCkge1xyXG4gICAgdGhpcy5zZXRTdGFnZSggdGhpcy5zdGFnZVRvTG9hZCwgdHJ1ZSk7ICAgIFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9TYW5kYm94OyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5jb25zdCBGaXJlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0ZpcmUnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9DZW50ZXIgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplLCBcImNlbnRlclwiKTtcclxuXHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WCA9IGNodW5rU2l6ZSAqIDc7XHJcbiAgICBsZXQgcGxheWVyMVN0YXJ0WSA9IGNodW5rU2l6ZSAqIDY7XHJcbiAgICBcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRYID0gY2h1bmtTaXplICogODtcclxuICAgIGxldCBwbGF5ZXIyU3RhcnRZID0gY2h1bmtTaXplICogNjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXIxU3RhcnRYLCBwbGF5ZXIxU3RhcnRZLCBwbGF5ZXIyU3RhcnRYLCBwbGF5ZXIyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmaXJlXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGaXJlKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICBpd2NfYnIsICAgIGYxLCAgICBpd2NfYmwsICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIGl3Y19iciwgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGl3Y19ibCBdLFxyXG4gICAgICBbIG9iLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIG9iIF0sXHJcbiAgICAgIFsgaXdjX3RyLCAgIGYxLCAgICBmMSwgICAgb2IsICAgIG9iLCAgICBvYiwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgaXdjX3RsIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgb2IsICAgIGYyLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBvYiwgICAgb2IsICAgIG9iLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICAgaXdjX3RyLCAgICBvYiwgICBpd2NfdGwsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3Y19iciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkU3RhdGljSXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gTGF5ZXIgLSBCb3R0b21cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF9sZiA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwidG9wXCIsICAgICAgICB0YXJnZXRTdGFnZTogJ2xpZmUnIH07XHJcbiAgICBcclxuICAgIGxldCB0YmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfYm90dG9tX2xlZnRcIiB9OyAgXHJcbiAgICBsZXQgdGJyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0cmVlX2JvdHRvbV9yaWdodFwiIH07IFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwX2xmLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICB0YmwsICAgICB0YnIsICAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyX190b3AoKSB7XHJcblxyXG4gICAgbGV0IHR0bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV90b3BfbGVmdFwiIH07ICBcclxuICAgIGxldCB0dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfdG9wX3JpZ2h0XCIgfTsgIFxyXG4gICAgbGV0IHRtbCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidHJlZV9taWRkbGVfbGVmdFwiIH07ICBcclxuICAgIGxldCB0bXIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRyZWVfbWlkZGxlX3JpZ2h0XCIgfTsgIFxyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHRsLCAgICAgdHRyLCAgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRtbCwgICAgIHRtciwgICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9DZW50ZXI7IiwiLy8gU3RhZ2UgMDFcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcbmNvbnN0IEZpcmUgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vRmlyZScpO1xyXG5jb25zdCBIZWFsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0hlYWwnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV9MaWZlIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSwgXCJsaWZlXCIpO1xyXG5cclxuICAgIGxldCBwbGF5ZXIxU3RhcnRYID0gY2h1bmtTaXplICogNztcclxuICAgIGxldCBwbGF5ZXIxU3RhcnRZID0gY2h1bmtTaXplICogNjtcclxuICAgIFxyXG4gICAgbGV0IHBsYXllcjJTdGFydFggPSBjaHVua1NpemUgKiA4O1xyXG4gICAgbGV0IHBsYXllcjJTdGFydFkgPSBjaHVua1NpemUgKiA2O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllcjFTdGFydFgsIHBsYXllcjFTdGFydFksIHBsYXllcjJTdGFydFgsIHBsYXllcjJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgdGhpcy5jaHVua1NpemUsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZpcmVcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZpcmUoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoZWFsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIZWFsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2lnbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuXHJcbiAgICBsZXQgaXdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgaXdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IGl3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IGl3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiaW5uZXJfY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07ICBcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIHdjX3RsLCAgICB3dCwgICAgd3QsICAgIHd0LCAgICB3dCwgICAgd3QsICAgICB3dCwgICAgICAgIHd0LCAgICB3dCwgICAgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHd0LCAgICAgd3QsICAgICB3dCwgICAgIHdjX3RyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgIGYxLCAgICAgICAgZjEsICAgIGYxLCAgICAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgd3IgXSxcclxuICAgICAgWyB3bCwgICAgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgIGYxLCAgICAgZjEsICAgICAgICBmMSwgICAgZjEsICAgICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgICAgICBmMSwgICAgZjEsICAgIGYxLCAgICBmMSwgICAgZjEsICAgICBmMSwgICAgICAgIGYxLCAgICBmMSwgICAgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIGYxLCAgICAgZjEsICAgICBmMSwgICAgIHdyIF0sXHJcbiAgICAgIFsgd2NfYmwsICAgIHdiLCAgICB3YiwgICAgd2IsICAgIHdiLCAgICB3YiwgICAgIGl3Y190ciwgICAgZjEsICAgaXdjX3RsLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2IsICAgICB3YiwgICAgIHdiLCAgICAgd2NfYnIgXVxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIExheWVyIC0gQm90dG9tXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fYm90dG9tKCkge1xyXG4gICAgXHJcbiAgICBsZXQgZmlyZSA9IHsgbmFtZTogJ2ZpcmUnLCB0eXBlOiAnMDEnfTsgXHJcbiAgICBsZXQgYm5uYSA9IHsgbmFtZTogJ2hlYWwnLCB0eXBlOiAnYmFuYW5hJ307IFxyXG5cclxuICAgIGxldCB0cF9jID0geyBuYW1lOiAndGVsZXBvcnQnLCB0eXBlOiAnJywgdGVsZXBvcnRUeXBlOiAncmVsYXRpdmUnLCBjYW1lRnJvbTogJ2JvdHRvbScsICAgICAgICB0YXJnZXRTdGFnZTogJ2NlbnRlcicgfTtcclxuXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBibm5hLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmlyZSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZpcmUsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBibm5hLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmaXJlLCAgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgYm5uYSwgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgdHBfYywgICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW1fX2JvdHRvbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCkge1xyXG5cclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fdG9wKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4ocGxheWVyMVN0YXJ0WCwgcGxheWVyMVN0YXJ0WSwgcGxheWVyMlN0YXJ0WCwgcGxheWVyMlN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKHBsYXllcjFTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRZKHBsYXllcjFTdGFydFkpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRYKHBsYXllcjJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKHBsYXllcjJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyX19ib3R0b20oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcl9fdG9wKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV9MaWZlOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfRmxvb3IgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJCZWFjaCBGbG9vclwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogY2h1bmtTaXplLFxyXG4gICAgICBoZWlnaHQ6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBnYW1lID0ge1xyXG4gICAgICBjaHVua1NpemU6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSB7XHJcbiAgICAgIHdpZHRoOiAxNixcclxuICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgc3RhZ2VTcHJpdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiBmYWxzZVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgZ2FtZSwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDFcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDksIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDk0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBwbGF5ZXIuc2V0VGVsZXBvcnRpbmcoZmFsc2UpO1xyXG4gICAgcmV0dXJuIHRydWU7IFxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfRmxvb3I7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF93YWxsIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSkge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiQmVhY2ggV2FsbFwiLFxyXG4gICAgICB0eXBlOiB0eXBlXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBvc2l0aW9uID0ge1xyXG4gICAgICB4OiB4MCxcclxuICAgICAgeTogeTBcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGltZW5zaW9uID0ge1xyXG4gICAgICB3aWR0aDogY2h1bmtTaXplLFxyXG4gICAgICBoZWlnaHQ6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBnYW1lID0ge1xyXG4gICAgICBjaHVua1NpemU6IGNodW5rU2l6ZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzcHJpdGUgPSB7XHJcbiAgICAgIHdpZHRoOiAxNixcclxuICAgICAgaGVpZ2h0OiAxNixcclxuICAgICAgc3RhZ2VTcHJpdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogdHJ1ZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IGZhbHNlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cyk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTk3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MDksIGNsaXBfeTogMjE0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMzkyLCBjbGlwX3k6IDIxNCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTgwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDc3LCBjbGlwX3k6IDEwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNTQ1LCBjbGlwX3k6IDI3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MjYsIGNsaXBfeTogMTAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ0MywgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImlubmVyX2Nvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MjYsIGNsaXBfeTogMjcsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJpbm5lcl9jb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ0MywgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcIndhdGVyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAyOTksIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJvYnN0YWNsZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MCwgY2xpcF95OiA3NSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNjkzLCBjbGlwX3k6OTYsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRTdG9wT25Db2xsaXNpb24oZmFsc2UpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidHJlZV90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNzEwLCBjbGlwX3k6IDk2LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNjkyLCBjbGlwX3k6IDExLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0U3RvcE9uQ29sbGlzaW9uKGZhbHNlKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfbWlkZGxlX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDcxMCwgY2xpcF95OiAxMSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldFN0b3BPbkNvbGxpc2lvbihmYWxzZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0cmVlX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDYyNSwgY2xpcF95OiAxMSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25YKHRoaXMueCArIHRoaXMuY2h1bmtTaXplICogMC43KTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRyZWVfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgLy8gU3ByaXRlXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDc0NCwgY2xpcF95OiAxMSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDb2xsaXNpb24gU2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uV2lkdGgoIHRoaXMuY2h1bmtTaXplICogMC4zICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfd2FsbDsiLCJjb25zdCBfQ2FuSHVydCA9IHJlcXVpcmUoJy4vX0Nhbkh1cnQnKTtcclxuXHJcbmNsYXNzIEZpcmUgZXh0ZW5kcyBfQ2FuSHVydCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJGaXJlXCIsXHJcbiAgICAgIHR5cGU6IHR5cGVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcG9zaXRpb24gPSB7XHJcbiAgICAgIHg6IHgwLFxyXG4gICAgICB5OiB5MFxyXG4gICAgfVxyXG5cclxuICAgIGxldCBkaW1lbnNpb24gPSB7XHJcbiAgICAgIHdpZHRoOiBjaHVua1NpemUsXHJcbiAgICAgIGhlaWdodDogY2h1bmtTaXplXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGdhbWUgPSB7XHJcbiAgICAgIGNodW5rU2l6ZTogY2h1bmtTaXplXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHNwcml0ZSA9IHtcclxuICAgICAgd2lkdGg6IDUwLFxyXG4gICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICBzdGFnZVNwcml0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9jb21tb24nKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxldCBjYW5IdXJ0UHJvcHMgPSB7XHJcbiAgICAgIGFtb3VudDogMVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cywgY2FuSHVydFByb3BzKTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgIHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgPSAzO1xyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gY2h1bmtTaXplICogMC40OyAvLyA4MCUgb2YgQ2h1bmsgU2l6ZVxyXG4gICAgdGhpcy5jb2xsaXNpb25ZID0geTAgKyAoIGNodW5rU2l6ZSAqIDAuNik7IC8vIDgwJSBvZiBDaHVuayBTaXplXHJcblxyXG4gICAgLy8gQ29udHJvbHMgdGhlIHNwcml0ZSBGUFMgQW5pbWF0aW9uXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDU7IC8vIDEwMDAgLyBGUFNcclxuICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkgeyBcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICAvLyBTcHJpdGVcclxuICAgICAgICB0aGlzLnNldFNwcml0ZVByb3BzRnJhbWUodGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCk7XHJcbiAgICAgICAgLy8gQ29sbGlzaW9uXHJcbiAgICAgICAgdGhpcy5zZXRDb2xsaXNpb25IZWlnaHQodGhpcy5jb2xsaXNpb25IZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuc2V0Q29sbGlzaW9uWSh0aGlzLmNvbGxpc2lvblkpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICBzZXRTcHJpdGVQcm9wc0ZyYW1lKHNwcml0ZUFuaW1hdGlvbkNvdW50KXtcclxuICAgIHN3aXRjaChzcHJpdGVBbmltYXRpb25Db3VudCkgeyBcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNTAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAxMDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIEZpcmUgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSBcclxuXHJcbiAgYmVmb3JlUmVuZGVyKCkge1xyXG4gICAgLy8gQW5pbWF0ZSBmaXJlXHJcbiAgICBpZiggdGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSApIHtcclxuICAgICAgdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCsrO1xyXG4gICAgICBpZiggdGhpcy5zcHJpdGVBbmltYXRpb25Db3VudCA+IHRoaXMuc3ByaXRlQW5pbWF0aW9uTWF4Q291bnQgKSB0aGlzLnNwcml0ZUFuaW1hdGlvbkNvdW50ID0gMTtcclxuICAgICAgdGhpcy5zZXRTcHJpdGVQcm9wc0ZyYW1lKHRoaXMuc3ByaXRlQW5pbWF0aW9uQ291bnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gRmlyZTsiLCJjb25zdCBfQ2FuQ29sbGVjdCA9IHJlcXVpcmUoJy4vX0NhbkNvbGxlY3QnKTtcclxuXHJcbmNsYXNzIEhlYWwgZXh0ZW5kcyBfQ2FuQ29sbGVjdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgbmFtZTogXCJQb3Rpb25cIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IGNodW5rU2l6ZSxcclxuICAgICAgaGVpZ2h0OiBjaHVua1NpemVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZ2FtZSA9IHtcclxuICAgICAgY2h1bmtTaXplOiBjaHVua1NpemVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0ge1xyXG4gICAgICB3aWR0aDogNTAsXHJcbiAgICAgIGhlaWdodDogNTAsXHJcbiAgICAgIHN0YWdlU3ByaXRlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2NvbW1vbicpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGV2ZW50cyA9IHtcclxuICAgICAgc3RvcE9uQ29sbGlzaW9uOiBmYWxzZSxcclxuICAgICAgaGFzQ29sbGlzaW9uRXZlbnQ6IHRydWVcclxuICAgIH1cclxuICAgIFxyXG4gICAgbGV0IGNhbkNvbGxlY3RQcm9wcyA9IHtcclxuICAgICAgY2FuUmVzcGF3bjogdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cywgY2FuQ29sbGVjdFByb3BzKTtcclxuICAgIFxyXG4gICAgdGhpcy5oZWFsQW1vdXQgPSAxO1xyXG4gICAgdGhpcy5pdGVtVXNlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgc2V0SGVhbEFtb3V0KGFtb3VudCkgeyB0aGlzLmhlYWxBbW91dCA9IGFtb3VudDsgfVxyXG4gIGdldEhlYWxBbW91bnQoKSB7IHJldHVybiB0aGlzLmhlYWxBbW91dDsgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHsgXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNhc2UgJ2JhbmFuYSc6XHJcbiAgICAgICAgdGhpcy5zZXRIZWFsQW1vdXQoMSk7XHJcbiAgICAgICAgdGhpcy5zZXRDYW5SZXNwYXduKGZhbHNlKTtcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiA1MCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlV2lkdGhcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb2xsaXNpb24ocGxheWVyKXsgXHJcbiAgICBpZiggISB0aGlzLmlzQ29sbGVjdGVkKCkgKSB7XHJcbiAgICAgIHRoaXMuY29sbGVjdCgpO1xyXG4gICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgcGxheWVyLmhlYWxQbGF5ZXIoIHRoaXMuZ2V0SGVhbEFtb3VudCgpICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTsgXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBIZWFsOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBnYW1lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uLy4uLy4uL2dhbWVQcm9wZXJ0aWVzJyk7IFxyXG5cclxuY2xhc3MgVGVsZXBvcnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgsIGNodW5rU2l6ZSwgdGVsZXBvcnRQcm9wcykge1xyXG4gICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIG5hbWU6IFwiVGVsZXBvcnRcIixcclxuICAgICAgdHlwZTogdHlwZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwb3NpdGlvbiA9IHtcclxuICAgICAgeDogeDAsXHJcbiAgICAgIHk6IHkwXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGRpbWVuc2lvbiA9IHtcclxuICAgICAgd2lkdGg6IGNodW5rU2l6ZSxcclxuICAgICAgaGVpZ2h0OiBjaHVua1NpemVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZ2FtZSA9IHtcclxuICAgICAgY2h1bmtTaXplOiBjaHVua1NpemVcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3ByaXRlID0ge1xyXG4gICAgICB3aWR0aDogMTYsXHJcbiAgICAgIGhlaWdodDogMTYsXHJcbiAgICAgIHN0YWdlU3ByaXRlOiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBldmVudHMgPSB7XHJcbiAgICAgIHN0b3BPbkNvbGxpc2lvbjogZmFsc2UsXHJcbiAgICAgIGhhc0NvbGxpc2lvbkV2ZW50OiB0cnVlXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1cGVyKHByb3BzLCBwb3NpdGlvbiwgZGltZW5zaW9uLCBnYW1lLCBzcHJpdGUsIGV2ZW50cyk7XHJcbiAgICBcclxuICAgIHRoaXMudGVsZXBvcnRQcm9wcyA9IHRlbGVwb3J0UHJvcHM7XHJcblxyXG4gICAgdGhpcy54SW5kZXggPSB4SW5kZXg7XHJcbiAgICB0aGlzLnlJbmRleCA9IHlJbmRleDtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAwLCBjbGlwX3k6IDAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgY29sbGlzaW9uKHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LCBjb2xsaWRhYmxlLCBjb2xsaXNpb25EaXJlY3Rpb24pe1xyXG4gICAgXHJcbiAgICBsZXQgcGxheWVycyA9IGNvbGxpZGFibGUuc2NlbmFyaW8uZ2V0UGxheWVycygpO1xyXG5cclxuICAgIC8vIElmIHRoZSBwbGF5ZXIgdGVsZXBvcnRzLCB0aGVuIGNoYW5nZSBzdGFnZVxyXG4gICAgaWYoIHRoaXMudGVsZXBvcnQoIHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0ICkgKSB7XHJcblxyXG4gICAgICAvLyBNYWtlIGV2ZXJ5dGhpbmcgZGFya1xyXG4gICAgICBjb2xsaWRhYmxlLnNjZW5hcmlvLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB3aW5kb3cuZ2FtZS5sb2FkaW5nKHRydWUpO1xyXG5cclxuICAgICAgLy8gSGlkZSBhbGwgcGxheWVyc1xyXG4gICAgICBwbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG4gICAgICAgIHBsYXllci5oaWRlUGxheWVyKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gV2FpdCBzb21lIHRpbWVcclxuICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIE5vdyB0ZWxlcG9ydCBhbGwgcGxheWVycyB0byBzYW1lIGxvY2F0aW9uIGFuZCBkaXJlY3Rpb25cclxuICAgICAgICBsZXQgdGFyZ2V0WCA9IHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LmdldFgoKTtcclxuICAgICAgICBsZXQgdGFyZ2V0WSA9IHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LmdldFkoKTtcclxuICAgICAgICBsZXQgbG9va0RpcmVjdGlvbiA9IHBsYXllcldob0FjdGl2YXRlZFRlbGVwb3J0LmdldFNwcml0ZVByb3BzKCkuZGlyZWN0aW9uO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBwbGF5ZXIuc2V0WCh0YXJnZXRYLCB0cnVlKTsgLy8gdHJ1ZSA9IGFsc28gc2V0IGNvbGxpc2lvbiB4IHRvb1xyXG4gICAgICAgICAgcGxheWVyLnNldFkodGFyZ2V0WSwgdHJ1ZSk7XHJcbiAgICAgICAgICBwbGF5ZXIudHJpZ2dlckxvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbik7XHJcbiAgICAgICAgICBwbGF5ZXIuc2hvd1BsYXllcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDaGFuZ2Ugc3RhZ2VcclxuICAgICAgICBjb2xsaWRhYmxlLnNjZW5hcmlvLnNldFN0YWdlKCBcclxuICAgICAgICAgIHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRTdGFnZSxcclxuICAgICAgICAgIGZhbHNlIC8vIGZpcnN0U3RhZ2UgP1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5nYW1lLmxvYWRpbmcoZmFsc2UpO1xyXG4gICAgICB9LCAzMDApO1xyXG4gICAgICBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvLyBXaGF0IGtpbmQgb2YgdGVsZXBvcnQ/XHJcbiAgdGVsZXBvcnQoIHBsYXllciApIHtcclxuICAgIFxyXG4gICAgbGV0IGdhbWVQcm9wcyA9IG5ldyBnYW1lUHJvcGVydGllcygpO1xyXG5cclxuICAgIGxldCB0eXBlID0gdGhpcy50ZWxlcG9ydFByb3BzLnRlbGVwb3J0VHlwZTtcclxuICAgIGxldCB0YXJnZXRYID0gMDtcclxuICAgIGxldCB0YXJnZXRZID0gMDtcclxuXHJcbiAgICBsZXQgd2lsbFRlbGVwb3J0ID0gZmFsc2U7XHJcblxyXG4gICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRhcmdldFggPSB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0WDtcclxuICAgICAgICB0YXJnZXRZID0gdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFk7XHJcbiAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInJlbGF0aXZlXCI6XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnRlbGVwb3J0UHJvcHMuY2FtZUZyb20pIHtcclxuICAgICAgICAgIGNhc2UgXCJ0b3BcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IHRoaXMueEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIChnYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuVmVydGljYWxDaHVua3MnKSAtIDMgKSAqIHRoaXMuY2h1bmtTaXplKTsgLy8gLTMgYmVjYXVzZSBvZiB0aGUgcGxheWVyIGNvbGxpc2lvbiBib3hcclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgICAgIHRhcmdldFggPSB0aGlzLnhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRZID0gMCAqIHRoaXMuY2h1bmtTaXplOyAvLyBUZWxlcG9ydCB0byBZPTAsIGJ1dCBwbGF5ZXIgaGl0Ym94IHdpbGwgbWFrZSBoaW0gZ28gMSB0aWxlIGRvd25cclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggdGhpcy55SW5kZXggKiB0aGlzLmNodW5rU2l6ZSkgLSB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IDEgKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgd2lsbFRlbGVwb3J0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgICAgICB0YXJnZXRZID0gKCB0aGlzLnlJbmRleCAqIHRoaXMuY2h1bmtTaXplKSAtIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRYID0gKCBnYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuSG9yaXpvbnRhbENodW5rcycpIC0gMiApICogdGhpcy5jaHVua1NpemU7IFxyXG4gICAgICAgICAgICB3aWxsVGVsZXBvcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT25seSB0ZWxlcG9ydHMgaWYgaXQgY2FuIHRlbGVwb3J0XHJcbiAgICBpZiggd2lsbFRlbGVwb3J0ICkge1xyXG4gICAgICBwbGF5ZXIuc2V0WCggdGFyZ2V0WCApOyAvLyBhbHdheXMgdXNpbmcgWCBhbmQgWSByZWxhdGl2ZSB0byB0ZWxlcG9ydCBub3QgcGxheWVyIGJlY2F1c2UgaXQgZml4IHRoZSBwbGF5ZXIgcG9zaXRpb24gdG8gZml0IGluc2lkZSBkZXN0aW5hdGlvbiBzcXVhcmUuXHJcbiAgICAgIHBsYXllci5zZXRZKCB0YXJnZXRZICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHdpbGxUZWxlcG9ydDtcclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBUZWxlcG9ydDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5Db2xsZWN0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgZ2FtZSwgc3ByaXRlLCBldmVudHMsIGNhbkNvbGxlY3RQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIGdhbWUsIHNwcml0ZSwgZXZlbnRzKTtcclxuICAgIFxyXG4gICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuY2FuUmVzcGF3biA9IGNhbkNvbGxlY3RQcm9wcy5jYW5SZXNwYXduO1xyXG4gIH1cclxuXHJcbiAgaXNDb2xsZWN0ZWQoKSB7IHJldHVybiB0aGlzLmNvbGxlY3RlZDsgfVxyXG4gIGNvbGxlY3QoKXsgdGhpcy5jb2xsZWN0ZWQgPSB0cnVlOyB9XHJcblxyXG4gIHNldENhblJlc3Bhd24oYm9vbCl7IHRoaXMuY2FuUmVzcGF3biA9IGJvb2w7IH1cclxuICBcclxuICBzZXROYW1lKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ2FuQ29sbGVjdDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIF9DYW5IdXJ0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgZ2FtZSwgc3ByaXRlLCBldmVudHMsY2FuSHVydFByb3BzKSB7XHJcbiAgICBzdXBlcihwcm9wcywgcG9zaXRpb24sIGRpbWVuc2lvbiwgZ2FtZSwgc3ByaXRlLCBldmVudHMpO1xyXG4gICAgdGhpcy5odXJ0QW1vdW50ID0gY2FuSHVydFByb3BzLmFtb3VudDtcclxuICB9XHJcbiAgXHJcbiAgLy8gSWYgaXQncyBub3QgY29sbGlkaW5nIHRvIGFueSB0ZWxlcG9ydCBjaHVuayBhbnltb3JlLCBtYWtlIGl0IHJlYWR5IHRvIHRlbGVwb3J0IGFnYWluXHJcbiAgY29sbGlzaW9uKHBsYXllcil7IFxyXG4gICAgcGxheWVyLmh1cnRQbGF5ZXIodGhpcy5odXJ0QW1vdW50KTtcclxuICAgIHJldHVybiB0cnVlOyBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9DYW5IdXJ0OyIsImNsYXNzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvcHMsIHBvc2l0aW9uLCBkaW1lbnNpb24sIGdhbWUsIHNwcml0ZSwgZXZlbnRzKSB7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0gcG9zaXRpb24ueDtcclxuICAgIHRoaXMueSA9IHBvc2l0aW9uLnk7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLndpZHRoID0gZGltZW5zaW9uLndpZHRoOyAvL3B4XHJcbiAgICB0aGlzLmhlaWdodCA9IGRpbWVuc2lvbi5oZWlnaHQ7XHJcblxyXG4gICAgLy8gIyBDb2xsaXNpb25cclxuICAgIHRoaXMuY29sbGlzaW9uV2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgdGhpcy5jb2xsaXNpb25IZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgIHRoaXMuY29sbGlzaW9uWCA9IHRoaXMueDtcclxuICAgIHRoaXMuY29sbGlzaW9uWSA9IHRoaXMueTtcclxuXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWUuY2h1bmtTaXplO1xyXG5cclxuICAgIC8vICMgRXZlbnRvc1xyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBldmVudHMuc3RvcE9uQ29sbGlzaW9uO1xyXG4gICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IGV2ZW50cy5oYXNDb2xsaXNpb25FdmVudDtcclxuICBcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICB0aGlzLnN0YWdlU3ByaXRlID0gc3ByaXRlLnN0YWdlU3ByaXRlO1xyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVXaWR0aCA9IHNwcml0ZS53aWR0aDsgICBcclxuICAgIHRoaXMuc3ByaXRlSGVpZ2h0ID0gc3ByaXRlLmhlaWdodDsgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMubmFtZSA9IHByb3BzLm5hbWUgKyBcIihcIiArIHRoaXMueCArIFwiL1wiICsgdGhpcy55ICsgXCIpXCI7XHJcblxyXG4gICAgdGhpcy5oaWRlU3ByaXRlXHJcblxyXG4gICAgdGhpcy5ydW4oIHByb3BzLnR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cclxuICBzZXRDb2xsaXNpb25IZWlnaHQoaGVpZ2h0KSB7IHRoaXMuY29sbGlzaW9uSGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgc2V0Q29sbGlzaW9uV2lkdGgod2lkdGgpIHsgdGhpcy5jb2xsaXNpb25XaWR0aCA9IHdpZHRoOyB9XHJcblxyXG4gIHNldENvbGxpc2lvblgoeCkgeyB0aGlzLmNvbGxpc2lvblggPSB4OyB9XHJcbiAgc2V0Q29sbGlzaW9uWSh5KSB7IHRoaXMuY29sbGlzaW9uWSA9IHk7IH1cclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgLy8gISBNdXN0IGhhdmUgaW4gY2hpbGRzIENsYXNzXHJcbiAgfVxyXG5cclxuICBzZXRTdG9wT25Db2xsaXNpb24oYm9vbCl7XHJcbiAgICB0aGlzLnN0b3BPbkNvbGxpc2lvbiA9IGJvb2w7XHJcbiAgfVxyXG5cclxuICBoaWRlKCkgeyB0aGlzLmhpZGVTcHJpdGUgPSB0cnVlOyB9XHJcbiAgc2hvdygpIHsgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7IH1cclxuXHRcdFx0XHJcblx0Ly8gIyBHZXRzXHJcblx0XHRcdFxyXG4gIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHJcbiAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5jb2xsaXNpb25IZWlnaHQ7IH1cclxuICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uV2lkdGg7IH1cclxuXHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgcmV0dXJuIHRoaXMuY29sbGlzaW9uWDsgfVxyXG4gIGdldENvbGxpc2lvblkoKSB7IHJldHVybiB0aGlzLmNvbGxpc2lvblk7IH1cclxuXHJcbiAgZ2V0Q2VudGVyWCgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpIC8yOyB9XHJcbiAgZ2V0Q2VudGVyWSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSAvMjsgfVxyXG5cclxuICAvLyBIb29rIHRvIHJ1biBiZWZvcmUgcmVuZGVyXHJcbiAgYmVmb3JlUmVuZGVyKCkgeyB9XHJcblx0XHRcclxuXHQvLyAjIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuXHJcbiAgICB0aGlzLmJlZm9yZVJlbmRlcigpO1xyXG5cclxuICAgIGlmICggdGhpcy5oaWRlU3ByaXRlICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgIH0gXHJcbiAgICBsZXQgc3ByaXRlUHJvcHMgPSB0aGlzLnNwcml0ZVByb3BzO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5zdGFnZVNwcml0ZSApIHsgLy8gT25seSByZW5kZXIgdGV4dHVyZSBpZiBoYXZlIGl0IHNldFxyXG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5zdGFnZVNwcml0ZSwgIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLmNsaXBfeCwgc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICBzcHJpdGVQcm9wcy5zcHJpdGVfd2lkdGgsIHNwcml0ZVByb3BzLnNwcml0ZV9oZWlnaHQsIFxyXG4gICAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgICAgXHJcbiAgICAvL0RFQlVHIENodW5rIFNpemVcclxuICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcblxyXG4gICAgICBsZXQgY29sbGlzaW9uX3Byb3BzID0ge1xyXG4gICAgICAgIHc6IHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpLFxyXG4gICAgICAgIHg6IHRoaXMuZ2V0Q29sbGlzaW9uWCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0Q29sbGlzaW9uWSgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnN0b3BPbkNvbGxpc2lvbiA/IFwicmdiYSgyNTUsMCwwLDAuMilcIiA6IFwicmdiYSgwLDI1NSwwLDAuMilcIjtcclxuICAgICAgY3R4LmZpbGxSZWN0KGNvbGxpc2lvbl9wcm9wcy54LCBjb2xsaXNpb25fcHJvcHMueSwgY29sbGlzaW9uX3Byb3BzLncsIGNvbGxpc2lvbl9wcm9wcy5oKTtcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMilcIjtcclxuICAgICAgY3R4LmxpbmVXaWR0aCAgID0gNTtcclxuICAgICAgY3R4LnN0cm9rZVJlY3QoY29sbGlzaW9uX3Byb3BzLngsIGNvbGxpc2lvbl9wcm9wcy55LCBjb2xsaXNpb25fcHJvcHMudywgY29sbGlzaW9uX3Byb3BzLmgpO1xyXG5cclxuICAgIH1cclxuICBcclxuICB9XHJcbiAgICBcclxuICAvLyBIYXMgYSBjb2xsaXNpb24gRXZlbnQ/XHJcbiAgdHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpIHsgcmV0dXJuIHRoaXMuaGFzQ29sbGlzaW9uRXZlbnQ7IH1cclxuXHJcbiAgLy8gV2lsbCBpdCBTdG9wIHRoZSBvdGhlciBvYmplY3QgaWYgY29sbGlkZXM/XHJcbiAgc3RvcElmQ29sbGlzaW9uKCkgeyByZXR1cm4gdGhpcy5zdG9wT25Db2xsaXNpb247IH1cclxuXHJcbiAgLy8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgY29sbGlzaW9uKG9iamVjdCl7IHJldHVybiB0cnVlOyB9XHJcblxyXG4gIC8vIE5vIENvbGxpc2lvbiBFdmVudFxyXG4gIG5vQ29sbGlzaW9uKG9iamVjdCl7IHJldHVybiB0cnVlOyB9XHJcblxyXG4gIC8vIFJ1bnMgd2hlbiBDbGFzcyBzdGFydHMgIFxyXG4gIHJ1biggdHlwZSApIHtcclxuICAgIHRoaXMuc2V0U3ByaXRlVHlwZSh0eXBlKTtcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9Db2xsaWRhYmxlOyIsImNsYXNzIF9TY2VuYXJpbyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMsIHNjZW5hcmlvX2lkLCBzYXZlRGF0YSl7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgICAgIFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLndpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WCA9IDA7IFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFkgPSAwOyBcclxuXHJcbiAgICB0aGlzLnN0YWdlID0gbnVsbDtcclxuICAgIHRoaXMuc3RhZ2VJZCA9IFwiXCI7XHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG5cclxuICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIHRoaXMuc2NlbmFyaW9faWQgPSBzY2VuYXJpb19pZDtcclxuICB9XHJcblxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuICBhZGRTdGF0aWNJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX19ib3R0b20oaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX2JvdHRvbS5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBhZGRSZW5kZXJMYXllckl0ZW1fX3RvcChpdGVtKXtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20gPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fdG9wID0gbmV3IEFycmF5KCk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFBsYXllcnNcclxuICBhZGRQbGF5ZXIocGxheWVyKSB7XHJcbiAgICB0aGlzLnBsYXllcnMucHVzaChwbGF5ZXIpO1xyXG4gIH1cclxuICBnZXRQbGF5ZXJzKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJzOyB9XHJcblxyXG4gIC8vICMgR2V0c1xyXG4gIGdldEN0eCgpIHsgcmV0dXJuIHRoaXMuY3R4OyB9XHJcbiAgZ2V0Q2FudmFzKCkgeyByZXR1cm4gdGhpcy5jYW52YXM7IH1cdFxyXG5cclxuICBnZXRJZCgpIHsgcmV0dXJuIHRoaXMuc2NlbmFyaW9faWQ7IH1cclxuICBnZXRBY3R1YWxTdGFnZUlkKCkgeyByZXR1cm4gdGhpcy5zdGFnZUlkOyB9XHJcbiAgICAgICAgICAgICAgXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXNfX2JvdHRvbSgpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fdG9wKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3A7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcbiAgXHJcbiAgLy8gIyBTZXRzXHJcbiAgc2V0UGxheWVyMVN0YXJ0WCh4KSB7IHRoaXMucGxheWVyMVN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXIxU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXIxU3RhcnRZID0geTsgfVxyXG5cclxuICBzZXRQbGF5ZXIyU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjJTdGFydFkoeSkgeyB0aGlzLnBsYXllcjJTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldEFjdHVhbFN0YWdlSWQoaWQpeyB0aGlzLnN0YWdlSWQgPSBpZDsgfVxyXG5cclxuICAvLyBGdW5jdGlvbnMgdG8gbG9hZCBzZWxlY3RlZCBzdGFnZVxyXG4gIGxvYWRTdGFnZShzdGFnZSwgZmlyc3RTdGFnZSkge1xyXG4gICAgXHJcbiAgICB0aGlzLnN0YWdlID0gc3RhZ2U7XHJcblxyXG4gICAgLy8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG4gICAgdGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzOyAvLyBQYXNzIHRoaXMgc2NlbmFyaW8gY2xhc3MgYXMgYW4gYXJndW1lbnQsIHNvIG90aGVyIGZ1bmN0aW9ucyBjYW4gcmVmZXIgdG8gdGhpc1xyXG4gICAgICB0aGlzLmFkZFN0YXRpY0l0ZW0oaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIEFuaW1hdGVkIEl0ZW1zIC0gQm90dG9tXHJcbiAgICB0aGlzLnN0YWdlLmdldExheWVySXRlbXNfX2JvdHRvbSgpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pO1xyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIHRoaXMuc3RhZ2UuZ2V0TGF5ZXJJdGVtc19fdG9wKCkubWFwKCAoaXRlbSkgPT4geyBcclxuICAgICAgaXRlbS5zY2VuYXJpbyA9IHRoaXM7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZXQgQWN0dWFsIFN0YWdlIElEXHJcbiAgICB0aGlzLnNldEFjdHVhbFN0YWdlSWQoIHRoaXMuc3RhZ2UuZ2V0U3RhZ2VJZCgpICk7XHJcblxyXG4gICAgLy8gT25seSBzZXQgcGxheWVyIHN0YXJ0IGF0IGZpcnN0IGxvYWRcclxuICAgIGlmKGZpcnN0U3RhZ2UpIHtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIxU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllcjFTdGFydFgoKSApO1xyXG4gICAgICB0aGlzLnNldFBsYXllcjFTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyMVN0YXJ0WSgpICk7XHJcbiAgICAgIHRoaXMuc2V0UGxheWVyMlN0YXJ0WCggdGhpcy5zdGFnZS5nZXRQbGF5ZXIyU3RhcnRYKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXIyU3RhcnRZKCB0aGlzLnN0YWdlLmdldFBsYXllcjJTdGFydFkoKSApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgfVxyXG5cclxuICByZW5kZXIoKSB7IH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX1NjZW5hcmlvOyIsImNsYXNzIF9TdGFnZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSwgc3RhZ2VJZCkge1xyXG4gICAgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICBcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3AgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcblxyXG4gICAgdGhpcy5wbGF5ZXIxU3RhcnRYID0gMDtcclxuICAgIHRoaXMucGxheWVyMVN0YXJ0WSA9IDA7XHJcbiAgICBcclxuICAgIHRoaXMucGxheWVyMlN0YXJ0WCA9IDA7XHJcbiAgICB0aGlzLnBsYXllcjJTdGFydFkgPSAwO1xyXG5cclxuICAgIHRoaXMuc3RhZ2VJZCA9IHN0YWdlSWQ7XHJcblxyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXNfX2JvdHRvbSgpIHsgcmV0dXJuIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtc19fdG9wKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zX190b3A7IH1cclxuICBcclxuICBnZXRQbGF5ZXIxU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIxU3RhcnRYOyB9XHJcbiAgZ2V0UGxheWVyMVN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyMVN0YXJ0WTsgfVxyXG4gIFxyXG4gIGdldFBsYXllcjJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllcjJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXIyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXIyU3RhcnRZOyB9XHJcblxyXG4gIGdldFN0YWdlSWQoKSB7IHJldHVybiB0aGlzLnN0YWdlSWQ7IH1cclxuICBcclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXIxU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXIxU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllcjFTdGFydFkoeSkgeyB0aGlzLnBsYXllcjFTdGFydFkgPSB5OyB9XHJcblxyXG4gIHNldFBsYXllcjJTdGFydFgoeCkgeyB0aGlzLnBsYXllcjJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyMlN0YXJ0WSh5KSB7IHRoaXMucGxheWVyMlN0YXJ0WSA9IHk7IH1cclxuICBcclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkU3RhdGljSXRlbShpdGVtKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIGFkZFJlbmRlckxheWVySXRlbV9fYm90dG9tKGl0ZW0pe1xyXG4gICAgdGhpcy5yZW5kZXJMYXllckl0ZW1zX19ib3R0b20ucHVzaChpdGVtKTtcclxuICB9XHJcbiAgYWRkUmVuZGVyTGF5ZXJJdGVtX190b3AoaXRlbSl7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcC5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtc19fYm90dG9tID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXNfX3RvcCA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuICBcclxuICBydW4gKCkgeyB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX1N0YWdlOyIsIi8vIE9ic3RhY2xlIGNsYXNzXHJcblxyXG5cdGZ1bmN0aW9uIEVuZW15KGN0eCwgcGxheWVyLCBuYW1lLCB4MCwgeTAsIG1vdlR5cGUsIG1pblgsIG1heFgsIG1pblksIG1heFksIHNwZWVkICkge1xyXG5cdFx0XHJcblx0XHQvLyAtIC0gLSBJbml0IC0gLSAtXHJcblx0XHRcclxuXHRcdFx0Ly8gIyBQb3NpdGlvblxyXG5cdFx0XHRcdHRoaXMueCA9IHgwO1xyXG5cdFx0XHRcdHRoaXMueSA9IHkwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHQvLyAjIFByb3BlcnRpZXNcclxuXHRcdFx0XHR0aGlzLndpZHRoID0gMTA7IC8vcHhcclxuXHRcdFx0XHR0aGlzLmhlaWdodCA9IDUwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiNGMDBcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHRcdFx0XHR0aGlzLnNwZWVkID0gc3BlZWQ7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyAjIE1vdmVtZW50XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92ID0gbW92VHlwZTsgLy9ob3IsIHZlciA8LSBtb3ZlbWVudCB0eXBlcyB0aGF0IHRoZSBlbmVteSBjYW4gZG9cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1pblggPSBtaW5YO1xyXG5cdFx0XHRcdHRoaXMubWluWSA9IG1pblk7XHJcblx0XHRcdFx0dGhpcy5tYXhYID0gbWF4WDtcclxuXHRcdFx0XHR0aGlzLm1heFkgPSBtYXhZO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92WCA9IDE7XHJcblx0XHRcdFx0dGhpcy5tb3ZZID0gMTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmVuZW15ID0gbmV3IE9iamVjdDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkud2lkdGggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcblx0XHRcdC8vICMgVGV4dHVyZVxyXG5cdFx0XHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cclxuXHRcdFx0XHR0aGlzLm9iakNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oIDAgLCAwLCB0aGlzLnBsYXllciApO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gLSAtIC0gU2V0cyAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdHRoaXMuc2V0WSA9ICBmdW5jdGlvbiAoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdHRoaXMuc2V0V2lkdGggPSAgZnVuY3Rpb24gKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdHRoaXMuc2V0TmFtZSA9ICBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblx0XHJcblx0XHQvLyAtIC0gLSBHZXRzIC0gLSAtXHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFggPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcblx0XHRcdHRoaXMuZ2V0WSA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0V2lkdGggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuXHRcdFx0dGhpcy5nZXRIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldENvbG9yID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblxyXG5cclxuXHRcdC8vIC0gLSAtIE1vdmVtZW50ICAtIC0gLVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92SG9yID0gZnVuY3Rpb24gKG1vZCkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoIHRoaXMubW92WCA9PSAxICkgey8vIGdvIFJpZ2h0XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLnggPSB0aGlzLnggKyB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueCA+PSB0aGlzLm1heFggKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WCA9IDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0aGlzLnggPSB0aGlzLnggLSB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueCA8IHRoaXMubWluWCApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZYID0gMTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fVx0XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdlZlciA9IGZ1bmN0aW9uIChtb2QpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1vdlkgPT0gMSApIHtcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMueSA9IHRoaXMueSArIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy55ID49IHRoaXMubWF4WSApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZZID0gMDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMueSA9IHRoaXMueSAtIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy55IDwgdGhpcy5taW5ZIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlkgPSAxO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblxyXG5cdFx0Ly8gLSAtIC0gUmVuZGVyIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjb250ZXh0LCBtb2QpIHsgXHJcblxyXG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLm1vdikge1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y2FzZSBcImhvclwiOlxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92SG9yKG1vZCk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRjYXNlIFwidmVyXCI6XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZWZXIobW9kKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHQvLyBDaGVjayBpZiBjb2xsaWRlcyB3aXRoIHBsYXllclxyXG5cclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkueCA9IHRoaXMueDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkueSA9IHRoaXMueTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIHRoaXMub2JqQ29sbGlzaW9uLmNoZWNrUGxheWVyQ29sbGlzaW9uKHRoaXMuZW5lbXkpID09IHRydWUgKSBcclxuXHRcdFx0XHRcdFx0dGhpcy5jb2xsaXNpb24odGhpcy5wbGF5ZXIpO1xyXG5cdFx0XHRcdFx0XHJcblxyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHRcdFx0XHRjb250ZXh0LmZpbGxSZWN0KCB0aGlzLmdldFgoKSwgdGhpcy5nZXRZKCksIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKSApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jb2xsaXNpb24gPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRvYmplY3Quc2V0Q29sb3IoXCIjMzMzXCIpO1xyXG5cdFx0XHRcdG9iamVjdC5yZXNldFBvc2l0aW9uKCk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9jbGFzcyIsIi8vIENsYXNzIHRoYXQgZGV0ZWN0cyBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIG90aGVyIG9iamVjdHNcclxuY2xhc3MgQ29sbGlzaW9uIHtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2NlbmFyaW9XaWR0aCwgc2NlbmFyaW9IZWlnaHQsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpOyAvLyBJdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcbiAgICB0aGlzLnNjZW5hcmlvV2lkdGggPSBzY2VuYXJpb1dpZHRoO1xyXG4gICAgdGhpcy5zY2VuYXJpb0hlaWdodCA9IHNjZW5hcmlvSGVpZ2h0O1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgfVxyXG5cdFx0XHRcclxuICAvLyAjIENoZWNrIGlmIHRoZSBvYmplY3QgY29sbGlkZXMgd2l0aCBhbnkgb2JqZWN0IGluIHZlY3RvclxyXG4gIC8vIEFsZ29yaXRobSByZWZlcmVuY2U6IEd1c3Rhdm8gU2lsdmVpcmEgLSBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PXM3cWlXTEJCcEp3XHJcbiAgY2hlY2sob2JqZWN0KSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIxID0gb2JqZWN0O1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICB0aGlzLmNoZWNrQ29sbGlzaW9uKHIxLCByMik7XHJcbiAgICB9IFxyXG4gIH1cclxuXHJcbiAgLy8gQHIxOiB0aGUgbW92aW5nIG9iamVjdFxyXG4gIC8vIEByMjogdGhlIFwid2FsbFwiXHJcbiAgY2hlY2tDb2xsaXNpb24ocjEsIHIyKSB7XHJcblxyXG4gICAgLy8gRG9uJ3QgY2hlY2sgY29sbGlzaW9uIGJldHdlZW4gc2FtZSBvYmplY3RcclxuICAgIGlmKCByMS5uYW1lID09IHIyLm5hbWUgKSByZXR1cm47XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgJiYgISByMi5zdG9wSWZDb2xsaXNpb24oKSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9yZXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIG9iamVjdHMgKG11c3QgYmUgcmVjdGFuZ2xlKVxyXG4gICAgdmFyIGNhdFggPSByMS5nZXRDZW50ZXJYKCkgLSByMi5nZXRDZW50ZXJYKCk7XHJcbiAgICB2YXIgY2F0WSA9IHIxLmdldENlbnRlclkoKSAtIHIyLmdldENlbnRlclkoKTtcclxuXHJcbiAgICB2YXIgc3VtSGFsZldpZHRoID0gKCByMS5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25XaWR0aCgpIC8gMiApO1xyXG4gICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIHIxLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgb3ZlcmxhcFggPSBzdW1IYWxmV2lkdGggLSBNYXRoLmFicyhjYXRYKTtcclxuICAgICAgdmFyIG92ZXJsYXBZID0gc3VtSGFsZkhlaWdodCAtIE1hdGguYWJzKGNhdFkpO1xyXG5cclxuICAgICAgaWYoIHIyLnN0b3BJZkNvbGxpc2lvbigpICkge1xyXG4gICAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZICl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duXHJcbiAgICAgICAgICBpZihjYXRZID4gMCl7IC8vIFVwXHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIHIxLnNldENvbGxpc2lvblkoIHIxLmdldENvbGxpc2lvblkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRZKCByMS5nZXRZKCkgLSBvdmVybGFwWSApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25ZKCByMS5nZXRDb2xsaXNpb25ZKCkgLSBvdmVybGFwWSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICAgIGlmKGNhdFggPiAwKXsgLy8gTGVmdFxyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICByMS5zZXRDb2xsaXNpb25YKCByMS5nZXRDb2xsaXNpb25YKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WCggcjEuZ2V0WCgpIC0gb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgcjEuc2V0Q29sbGlzaW9uWCggcjEuZ2V0Q29sbGlzaW9uWCgpIC0gb3ZlcmxhcFggKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKCB3aW5kb3cuZGVidWdDb2xsaXNpb24gKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBiZXR3ZWVuJywgcjEubmFtZSArIFwiKFwiICsgcjEuZ2V0WCgpICsgXCIvXCIgKyByMS5nZXRZKCkgKyBcIilcIiwgcjIubmFtZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyaWdnZXJzIENvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5jb2xsaXNpb24ocjIsIHIxKTtcclxuICAgICAgcjIuY29sbGlzaW9uKHIxLCByMik7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVHJpZ2dlcnMgbm90IGluIGNvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5ub0NvbGxpc2lvbihyMiwgcjIpOyBcclxuICAgICAgcjIubm9Db2xsaXNpb24ocjEsIHIyKTsgXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcdFx0XHJcblx0Ly8gQWRkIGl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuXHRhZGRJdGVtKG9iamVjdCkge1xyXG5cdFx0dGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdCk7XHJcbiAgfTtcclxuICBcclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5jb2xJdGVucy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIGNsZWFyQXJyYXlJdGVtcygpIHtcclxuICAgIHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTtcclxuICB9XHJcblxyXG59Ly8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uO1xyXG5cdCIsImNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vZ2FtZVByb3BlcnRpZXMnKTtcclxuY29uc3Qgc2NlbmFyaW9Qcm90b3R5cGUgPSByZXF1aXJlKCcuLi9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlJyk7XHJcbmNvbnN0IHNjZW5hcmlvU2FuZGJveCA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9zY2VuYXJpby9TYW5kYm94L3NjZW5hcmlvU2FuZGJveCcpO1xyXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuLi9hc3NldHMvUGxheWVyJyk7XHJcbmNvbnN0IENvbGxpc2lvbiA9IHJlcXVpcmUoJy4vQ29sbGlzaW9uJyk7XHJcbmNvbnN0IFJlbmRlciA9IHJlcXVpcmUoJy4vUmVuZGVyJyk7XHJcbmNvbnN0IFVJID0gcmVxdWlyZSgnLi9VSScpO1xyXG5cclxuY2xhc3MgR2FtZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIEZQUyBDb250cm9sXHJcbiAgICB0aGlzLmZwc0ludGVydmFsID0gbnVsbDsgXHJcbiAgICB0aGlzLm5vdyA9IG51bGw7XHJcbiAgICB0aGlzLmRlbHRhVGltZSA9IG51bGw7IFxyXG4gICAgdGhpcy5lbGFwc2VkID0gbnVsbDtcclxuXHJcbiAgICAvLyBFdmVudHNcclxuICAgIHRoaXMua2V5c0Rvd24gPSB7fTtcclxuXHJcbiAgICAvLyBQYXVzZVxyXG4gICAgdGhpcy5fcGF1c2UgPSBmYWxzZTtcclxuICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gR2FtZVxyXG4gICAgICB0aGlzLmdhbWVQcm9wcyA9IG51bGw7XHJcbiAgICAgIHRoaXMucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbiA9IG51bGw7XHJcbiAgICAgIHRoaXMuZGVmYXVsdFNjZW5hcmlvID0gXCJzYW5kYm94XCI7XHJcbiAgICAgIHRoaXMuc2NlbmFyaW8gPSBudWxsO1xyXG4gICAgICB0aGlzLlVJID0gbnVsbDtcclxuXHJcbiAgICAgIHRoaXMubXVsdGlwbGF5ZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIFJlbmRlcnNcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMgPSBudWxsO1xyXG4gICAgICB0aGlzLnJlbmRlckxheWVycyA9IG51bGw7XHJcbiAgICAgIHRoaXMucmVuZGVyVUkgICAgID0gbnVsbDtcclxuXHJcbiAgfVxyXG4gIFxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBEZWZhdWx0IEV2ZW50IExpc3RlbmVyc1xyXG4gIGRlZmF1bHRFdmVudExpc3RlbmVycygpIHtcclxuXHJcbiAgICAvLyBNZW51IENsaWNrc1xyXG4gICAgbGV0IG1lbnVJdGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbWVudS1pdGVtJyk7XHJcbiAgICBcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVudUl0ZW0ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IF90aGlzID0gdGhpcztcclxuICAgICAgbWVudUl0ZW1baV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBfdGhpcy5tZW51QWN0aW9uKCB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtYWN0aW9uXCIpICk7XHJcbiAgICAgIH0sIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIEtleWJvYXJkIEV2ZW50c1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHRoaXMua2V5c0Rvd25bZS5rZXlDb2RlXSA9IHRydWU7XHJcbiAgICB9LmJpbmQodGhpcyksIGZhbHNlKTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIFxyXG4gICAgICAvLyBDbGVhciBwcmV2aW91cyBrZXlzXHJcbiAgICAgIGRlbGV0ZSB0aGlzLmtleXNEb3duW2Uua2V5Q29kZV07XHJcbiAgICAgIFxyXG4gICAgICAvLyBSZXNldCBwbGF5ZXJzIGxvb2sgZGlyZWN0aW9uXHJcbiAgICAgIGlmKCB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICBwbGF5ZXIucmVzZXRTdGVwKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFBhdXNlIEV2ZW50IExpc3RlbmVyXHJcbiAgICAgIGlmKCBlLmtleUNvZGUgPT0gMjcgJiYgdGhpcy5nYW1lSXNMb2FkZWQgKSB7IC8vIEVTUVxyXG4gICAgICAgIHRoaXMudG9nZ2xlUGF1c2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xyXG5cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTdGFydC9SZXN0YXJ0IGEgR2FtZVxyXG5cclxuICBzdGFydE5ld0dhbWUoIHNhdmVEYXRhICkge1xyXG5cclxuICAgIC8vICMgSW5pdFxyXG4gICAgICB0aGlzLmdhbWVQcm9wcyA9IG5ldyBnYW1lUHJvcGVydGllcygpO1xyXG5cclxuICAgICAgbGV0IGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcbiAgICAgIGxldCBjb250ZXh0U3RhdGljID0gY2FudmFzU3RhdGljLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBsZXQgY2FudmFzTGF5ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19sYXllcnMnKTtcclxuICAgICAgbGV0IGNvbnRleHRMYXllcnMgPSBjYW52YXNMYXllcnMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgXHJcbiAgICAgIGxldCBjYW52YXNVSSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfdWknKTtcclxuICAgICAgbGV0IGNvbnRleHRVSSA9IGNhbnZhc1VJLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICBjYW52YXNMYXllcnMud2lkdGggPSBjYW52YXNTdGF0aWMud2lkdGggPSBjYW52YXNVSS53aWR0aCA9IHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICAgIGNhbnZhc0xheWVycy5oZWlnaHQgPSBjYW52YXNTdGF0aWMuaGVpZ2h0ID0gY2FudmFzVUkuaGVpZ2h0ID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzSGVpZ2h0Jyk7XHJcblxyXG4gICAgLy8gIyBTY2VuYXJpb1xyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICB0aGlzLnNjZW5hcmlvID0gdGhpcy5nZXRTY2VuYXJpbyggdGhpcy5kZWZhdWx0U2NlbmFyaW8sIGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2NlbmFyaW8gPSB0aGlzLmdldFNjZW5hcmlvKCBzYXZlRGF0YS5zY2VuYXJpby5zY2VuYXJpb0lkLCBjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHNhdmVEYXRhICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuICAgICAgdGhpcy5wbGF5ZXJzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgICBpZiggISBzYXZlRGF0YSApIHtcclxuICAgICAgICBsZXQgcGxheWVyID0gbmV3IFBsYXllciggdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIxU3RhcnRYKCksIHRoaXMuc2NlbmFyaW8uZ2V0UGxheWVyMVN0YXJ0WSgpLCB0aGlzLmdhbWVQcm9wcywgMSApOyBcclxuXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLm11bHRpcGxheWVyICkge1xyXG4gICAgICAgICAgbGV0IHBsYXllcjIgPSBuZXcgUGxheWVyKCB0aGlzLnNjZW5hcmlvLmdldFBsYXllcjJTdGFydFgoKSwgdGhpcy5zY2VuYXJpby5nZXRQbGF5ZXIyU3RhcnRZKCksIHRoaXMuZ2FtZVByb3BzLCAyICk7IFxyXG4gICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gocGxheWVyMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNjZW5hcmlvLmFkZFBsYXllcihwbGF5ZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcclxuICAgICAgICBzYXZlRGF0YS5wbGF5ZXJzLm1hcCggKHBsYXllcikgPT4ge1xyXG5cclxuICAgICAgICAgIGxldCBfcGxheWVyID0gbmV3IFBsYXllciggcGxheWVyLngsIHBsYXllci55LCB0aGlzLmdhbWVQcm9wcywgcGxheWVyLnBsYXllck51bWJlciwgcGxheWVyICk7IFxyXG5cclxuICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKCBfcGxheWVyKTtcclxuICAgICAgICAgIHRoaXMuc2NlbmFyaW8uYWRkUGxheWVyKF9wbGF5ZXIpO1xyXG5cclxuICAgICAgICB9KTsgIFxyXG4gICAgICB9XHJcbiAgICAvLyAjIFVJXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLlVJID0gbmV3IFVJKCB0aGlzLnBsYXllcnMsIHRoaXMuZ2FtZVByb3BzKTtcclxuXHJcbiAgICAvLyAjIENvbGxpc2lvbiBkZXRlY3Rpb24gY2xhc3NcclxuXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uID0gbmV3IENvbGxpc2lvbiggY2FudmFzTGF5ZXJzLndpZHRoLCBjYW52YXNMYXllcnMuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gIyBSZW5kZXJcclxuXHJcbiAgICAgIHRoaXMucmVuZGVyU3RhdGljID0gbmV3IFJlbmRlcihjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMpOyAvLyBSZW5kZXIgZXhlY3V0ZWQgb25seSBvbmNlXHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzID0gbmV3IFJlbmRlcihjb250ZXh0TGF5ZXJzLCBjYW52YXNMYXllcnMpOyAvLyBSZW5kZXIgd2l0aCBhbmltYXRlZCBvYmplY3RzIG9ubHlcclxuICAgICAgdGhpcy5yZW5kZXJVSSAgICAgPSBuZXcgUmVuZGVyKGNvbnRleHRVSSwgY2FudmFzVUkpOyBcclxuXHJcbiAgICAgIC8vIEFkZCBpdGVtcyB0byBiZSByZW5kZXJlZFxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyh0aGlzLnNjZW5hcmlvKTsgLy8gc2V0IHRoZSBzY2VuYXJpb1xyXG4gIFxyXG4gICAgLy8gSGlkZSBFbGVtZW50c1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5NZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAvLyBTaG93IENhbnZhc1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUNhbnZhcycpLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcclxuICAgIFxyXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBnYW1lIGlzIG5vdCBwYXVzZWRcclxuICAgICAgdGhpcy51bnBhdXNlKCk7XHJcbiAgICBcclxuICAgIC8vIEZsYWcgXHJcbiAgICAgIHRoaXMuZ2FtZUlzTG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBPaywgcnVuIHRoZSBnYW1lIG5vd1xyXG4gICAgICB0aGlzLnJ1bkdhbWUoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ2ZwcycpICk7XHQvLyBHTyBHTyBHT1xyXG5cclxuICB9Ly9uZXdHYW1lXHJcblxyXG4gICAgLy8gIyBUaGUgR2FtZSBMb29wXHJcbiAgICB1cGRhdGVHYW1lKGRlbHRhVGltZSkge1xyXG5cclxuICAgICAgLy9jb25zb2xlLmxvZyggICk7XHJcblxyXG4gICAgICBpZiggdGhpcy5pc1BhdXNlZCgpICkgcmV0dXJuO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgdGhpcy5yZW5kZXJVSS5zdGFydCggZGVsdGFUaW1lICk7XHJcbiAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLnN0YXJ0KCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIC8vICMgQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICAgIHRoaXMuY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSApO1xyXG4gICAgICB0aGlzLmNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgdGhpcy5jb2xsaXNpb24uYWRkQXJyYXlJdGVtKCB0aGlzLnNjZW5hcmlvLmdldExheWVySXRlbXNfX3RvcCgpICk7XHJcbiAgXHJcbiAgICAgIC8vIFwiU3RhdGljXCIgUmVuZGVyIC0gQmFja2dyb3VuZFxyXG4gICAgICB0aGlzLnJlbmRlclN0YXRpYy5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5yZW5kZXJTdGF0aWMuYWRkQXJyYXlJdGVtKHRoaXMuc2NlbmFyaW8uZ2V0U3RhdGljSXRlbXMoKSk7IC8vIEdldCBhbGwgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgICAgLy8gTGF5ZXJzIFJlbmRlclxyXG4gICAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLmNsZWFyQXJyYXlJdGVtcygpO1xyXG5cclxuICAgICAgICAvLyAjIEJvdHRvbSBcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fYm90dG9tKCkgKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyAjIE1pZGRsZVxyXG4gICAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVuZGVyTGF5ZXJzLmFkZEl0ZW0oIHBsYXllciApOyAvLyBBZGRzIHRoZSBwbGF5ZXIgdG8gdGhlIGFuaW1hdGlvbiByZW5kZXJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gIyBUb3BcclxuICAgICAgICB0aGlzLnJlbmRlckxheWVycy5hZGRBcnJheUl0ZW0oIHRoaXMuc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtc19fdG9wKCkgKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coIHRoaXMucmVuZGVyTGF5ZXJzLmdldEFycmF5SXRlbXMoKSApO1xyXG4gICAgICAgIFxyXG4gICAgICAvLyBVSSBSZW5kZXJcclxuICAgICAgdGhpcy5yZW5kZXJVSS5jbGVhckFycmF5SXRlbXMoKTtcclxuICAgICAgdGhpcy5yZW5kZXJVSS5hZGRBcnJheUl0ZW0oIHRoaXMuVUkuZ2V0TmV3UmVuZGVySXRlbXMoKSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyAjIE1vdmVtZW50c1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgcGxheWVyLmhhbmRsZU1vdmVtZW50KCB0aGlzLmtleXNEb3duICk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBcclxuICAgICAgLy8gIyBDaGVjayBpZiBwbGF5ZXIgaXMgY29sbGlkaW5nXHJcbiAgICAgIHRoaXMucGxheWVycy5tYXAoIChwbGF5ZXIpID0+IHtcclxuICAgICAgICB0aGlzLmNvbGxpc2lvbi5jaGVjayhwbGF5ZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAjIFwiVGhyZWFkXCIgdGhhIHJ1bnMgdGhlIGdhbWVcclxuICAgIHJ1bkdhbWUoZnBzKSB7XHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZnBzO1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIHRoaXMuZ2FtZUxvb3AoKTtcclxuICAgIH1cclxuICAgIGdhbWVMb29wKCkge1xyXG5cclxuICAgICAgLy8gY2FsYyBlbGFwc2VkIHRpbWUgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgIHRoaXMubm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgdGhpcy5lbGFwc2VkID0gdGhpcy5ub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuXHJcbiAgICAgIC8vIGlmIGVub3VnaCB0aW1lIGhhcyBlbGFwc2VkLCBkcmF3IHRoZSBuZXh0IGZyYW1lXHJcbiAgICAgIGlmICggdGhpcy5lbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICAvLyBHZXQgcmVhZHkgZm9yIG5leHQgZnJhbWUgYnkgc2V0dGluZyB0aGVuPW5vdywgYnV0IGFsc28gYWRqdXN0IGZvciB5b3VyXHJcbiAgICAgICAgLy8gc3BlY2lmaWVkIGZwc0ludGVydmFsIG5vdCBiZWluZyBhIG11bHRpcGxlIG9mIFJBRidzIGludGVydmFsICgxNi43bXMpXHJcbiAgICAgICAgdGhpcy5kZWx0YVRpbWUgPSB0aGlzLm5vdyAtICh0aGlzLmVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVHYW1lKCB0aGlzLmRlbHRhVGltZSApO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUnVucyBvbmx5IHdoZW4gdGhlIGJyb3dzZXIgaXMgaW4gZm9jdXNcclxuICAgICAgLy8gUmVxdWVzdCBhbm90aGVyIGZyYW1lXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5nYW1lTG9vcC5iaW5kKHRoaXMpICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldFNjZW5hcmlvKCBzY2VuYXJpb19pZCwgY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBzYXZlRGF0YSApIHtcclxuICAgICAgc3dpdGNoKHNjZW5hcmlvX2lkKSB7XHJcbiAgICAgICAgY2FzZSBcInByb3RvdHlwZVwiOlxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBzY2VuYXJpb1Byb3RvdHlwZShjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIHRoaXMuZ2FtZVByb3BzLCBzYXZlRGF0YSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcInNhbmRib3hcIjpcclxuICAgICAgICAgIHJldHVybiBuZXcgc2NlbmFyaW9TYW5kYm94KGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgdGhpcy5nYW1lUHJvcHMsIHNhdmVEYXRhICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcbiAgXHJcbiAgLy8gIyBNZW51XHJcbiAgXHJcbiAgLy8gQHBhdXNlZCBkZXRlcm1pbmUgaWYgdGhlIGdhbWUgY2FtZSBmcm9tIGEgcGF1c2UgYWN0aW9uIG9yIGEgbmV3IGdhbWUgKHdoZW4gcGFnZSBsb2FkcylcclxuICBtYWluTWVudShwYXVzZWQpIHsgXHJcbiAgICBcclxuICAgIGxldCBkaXZNZW51ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51Jyk7XHJcblxyXG4gICAgLy8gU2V0IG1haW5NZW51IGNsYXNzXHJcbiAgICAoIHBhdXNlZCApID8gZGl2TWVudS5jbGFzc0xpc3QuYWRkKCdwYXVzZWQnKSA6IGRpdk1lbnUuY2xhc3NMaXN0LmFkZCgnbmV3LWdhbWUnKTtcclxuICAgIFxyXG4gICAgLy8gVG9nZ2xlIE1lbnVcclxuICAgIGRpdk1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xyXG4gICAgXHJcbiAgfVxyXG4gICAgLy8gSGFuZGxlIE1lbnUgQWN0aW9uXHJcbiAgICBtZW51QWN0aW9uKGFjdGlvbikge1xyXG4gICAgICBzd2l0Y2goYWN0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnY29udGludWUnOlxyXG4gICAgICAgICAgdGhpcy5jb250aW51ZUdhbWUoKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgdGhpcy5zYXZlR2FtZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbG9hZCc6XHJcbiAgICAgICAgICB0aGlzLmxvYWRHYW1lKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICduZXcnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5uZXdHYW1lKGZhbHNlKTsvLyBmYWxzZSA9IHdvbid0IGxvYWQgc2F2ZURhdGFcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ25ldy0yLXBsYXllcnMnOlxyXG4gICAgICAgICAgdGhpcy5tdWx0aXBsYXllciA9IHRydWU7XHJcbiAgICAgICAgICB0aGlzLm5ld0dhbWUoZmFsc2UpOy8vIGZhbHNlID0gd29uJ3QgbG9hZCBzYXZlRGF0YVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbi8vICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAvL1xyXG4gIFxyXG4gIC8vICMgTmV3IEdhbWVcclxuICBuZXdHYW1lKHNhdmVEYXRhKSB7XHJcbiAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICB0aGlzLmxvYWRpbmcodHJ1ZSk7XHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhcnROZXdHYW1lKHNhdmVEYXRhKTsgXHJcbiAgICB9LCAxMDAwICk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgQ29udGludWVcclxuICBjb250aW51ZUdhbWUoKSB7XHJcbiAgICB0aGlzLnVucGF1c2UoKTtcclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTYXZlXHJcbiAgc2F2ZUdhbWUoKSB7XHJcbiAgICBpZiggY29uZmlybSgnU2FsdmFyIG8gam9nbyBhdHVhbCBpcsOhIHNvYnJlZXNjcmV2ZXIgcXVhbHF1ZXIgam9nbyBzYWx2byBhbnRlcmlvcm1lbnRlLiBEZXNlamEgY29udGludWFyPycpICkge1xyXG4gICAgICBcclxuICAgICAgbGV0IHNhdmVEYXRhID0gbmV3IE9iamVjdCgpO1xyXG5cclxuICAgICAgLy8gTXVsdGlwbGF5ZXJcclxuICAgICAgc2F2ZURhdGEubXVsdGlwbGF5ZXIgPSB0aGlzLm11bHRpcGxheWVyO1xyXG5cclxuICAgICAgLy8gU2NlbmFyaW9cclxuICAgICAgc2F2ZURhdGEuc2NlbmFyaW8gPSB7XHJcbiAgICAgICAgc2NlbmFyaW9JZDogdGhpcy5zY2VuYXJpby5nZXRJZCgpLFxyXG4gICAgICAgIHN0YWdlSWQ6IHRoaXMuc2NlbmFyaW8uZ2V0QWN0dWFsU3RhZ2VJZCgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFBsYXllcnNcclxuICAgICAgc2F2ZURhdGEucGxheWVycyA9IG5ldyBBcnJheSgpO1xyXG4gICAgICB0aGlzLnBsYXllcnMubWFwKCAocGxheWVyKSA9PiB7XHJcbiAgICAgICAgc2F2ZURhdGEucGxheWVycy5wdXNoKHtcclxuICAgICAgICAgIHBsYXllck51bWJlcjogcGxheWVyLmdldFBsYXllck51bWJlcigpLFxyXG4gICAgICAgICAgeDogcGxheWVyLmdldFgoKSxcclxuICAgICAgICAgIHk6IHBsYXllci5nZXRZKCksXHJcbiAgICAgICAgICBsaWZlczogcGxheWVyLmdldExpZmVzKClcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBDb252ZXJ0IHRvIEpTT05cclxuICAgICAgc2F2ZURhdGEgPSBKU09OLnN0cmluZ2lmeShzYXZlRGF0YSk7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTYXZlIG9uIExvY2FsU3RvcmFnZVxyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ2d1Zml0cnVwaV9fc2F2ZScsIHNhdmVEYXRhICk7XHJcblxyXG4gICAgICBhbGVydCgnSm9nbyBzYWx2byEnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4vLyAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogLy9cclxuXHJcbiAgLy8gIyBTYXZlXHJcbiAgbG9hZEdhbWUoKSB7XHJcbiAgICBcclxuICAgIC8vICMgR2V0IGRhdGEgZnJvbSBsb2NhbHN0b3JhZ2UgYW5kIGNvbnZlcnRzIHRvIGpzb25cclxuICAgIGxldCBzYXZlRGF0YSA9IEpTT04ucGFyc2UoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdndWZpdHJ1cGlfX3NhdmUnKSApO1xyXG5cclxuICAgIC8vIFdpbGwgYmUgIG11bHRpcGxheWVyIGdhbWU/XHJcbiAgICB0aGlzLm11bHRpcGxheWVyID0gc2F2ZURhdGEubXVsdGlwbGF5ZXI7XHJcblxyXG4gICAgLy8gIyBMb2FkcyBhIG5ldyBnYW1lIHdpdGggc2F2ZSBkYXRhXHJcbiAgICB0aGlzLm5ld0dhbWUoc2F2ZURhdGEpOyBcclxuXHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgUGF1c2VcclxuICBpc1BhdXNlZCgpIHsgcmV0dXJuIHRoaXMuX3BhdXNlOyB9XHJcbiAgcGF1c2UoKSB7IFxyXG4gICAgdGhpcy5fcGF1c2UgPSB0cnVlOyBcclxuICAgIHRoaXMubWFpbk1lbnUodHJ1ZSk7XHJcbiAgfVxyXG4gIHVucGF1c2UoKSB7IFxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW5NZW51JykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5fcGF1c2UgPSBmYWxzZTsgIFxyXG4gIH1cclxuICB0b2dnbGVQYXVzZSgpIHsgKCB0aGlzLmlzUGF1c2VkKCkgKSA/IHRoaXMudW5wYXVzZSgpIDogdGhpcy5wYXVzZSgpIH1cclxuICBcclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgTG9hZGluZ1xyXG4gIGxvYWRpbmcoYm9vbCkge1xyXG4gICAgbGV0IGRpc3BsYXkgPSAoIGJvb2wgKSA/ICdmbGV4JyA6ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nJykuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XHJcbiAgfVxyXG5cclxuLy8gKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqICogKiAqIC8vXHJcblxyXG4gIC8vICMgUnVuXHJcbiAgcnVuKCkge1xyXG5cclxuICAgIC8vIEhpZGUgRWxlbWVudHNcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluTWVudScpLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lQ2FudmFzJykuY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xyXG4gICAgdGhpcy5sb2FkaW5nKGZhbHNlKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICB0aGlzLmRlZmF1bHRFdmVudExpc3RlbmVycygpO1xyXG4gICAgXHJcbiAgICAvLyBTaG93cyBNZW51XHJcbiAgICB0aGlzLm1haW5NZW51KGZhbHNlKTtcclxuXHJcbiAgICAvLyBBdXRvIGxvYWQgYSBnYW1lIC0gZGVidWcgbW9kZVxyXG4gICAgaWYoIHdpbmRvdy5hdXRvbG9hZCApIHtcclxuICAgICAgdGhpcy5sb2FkR2FtZSgpO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZTsiLCJjbGFzcyBSZW5kZXIge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgcGxheWVyKSB7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDsgXHJcbiAgICB0aGlzLnNjZW5hcmlvID0gXCJcIjtcclxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBcclxuICBnZXRBcnJheUl0ZW1zKCl7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgXHJcbiAgLy8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuICBhZGRJdGVtKG9iamVjdCl7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuICB9XHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcbiAgICBmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBjbGVhckFycmF5SXRlbXMoKXsgXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG4gIH1cclxuICBzZXRTY2VuYXJpbyhzY2VuYXJpbyl7XHJcbiAgICB0aGlzLnNjZW5hcmlvID0gc2NlbmFyaW87XHJcbiAgfVxyXG4gICAgICAgICAgICBcclxuICAvLyBUaGlzIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZCBjb25zdGFudGx5IHRvIHJlbmRlciBpdGVtc1xyXG4gIHN0YXJ0KGRlbHRhVGltZSkge1x0XHRcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgLy8gQ2xlYXIgY2FudmFzIGJlZm9yZSByZW5kZXIgYWdhaW5cclxuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuICAgIHRoaXMuY3R4LnNoYWRvd0JsdXIgPSAwO1xyXG5cclxuICAgIC8vIFNjZW5hcmlvXHJcbiAgICBpZiAoIHRoaXMuc2NlbmFyaW8gIT0gXCJcIikgXHJcbiAgICAgIHRoaXMuc2NlbmFyaW8ucmVuZGVyKHRoaXMuY3R4KTtcclxuICAgICAgXHJcbiAgICAvLyBSZW5kZXIgaXRlbXNcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5yZW5kZXJJdGVtcykge1xyXG4gICAgICAvLyBFeGVjdXRlIHRoZSByZW5kZXIgZnVuY3Rpb24gLSBJbmNsdWRlIHRoaXMgZnVuY3Rpb24gb24gZXZlcnkgY2xhc3NcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtc1tpXS5yZW5kZXIodGhpcy5jdHgsIGRlbHRhVGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbiAgICBcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXIiLCJjb25zdCBVSWl0ZW0gPSByZXF1aXJlKCcuL19VSWl0ZW0nKTtcclxuY29uc3QgVUlpdGVtX3RleHQgPSByZXF1aXJlKCcuL19VSWl0ZW1fdGV4dCcpO1xyXG5cclxuY2xhc3MgVUkge1xyXG5cclxuICBjb25zdHJ1Y3RvcihwbGF5ZXJzLCBnYW1lUHJvcHMpIHtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJzID0gcGxheWVycztcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgICB0aGlzLmdhbWVQcm9wcyA9IGdhbWVQcm9wcztcclxuICAgIHRoaXMuY2h1bmtTaXplID0gdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICAgICAgICAgICAgICBcclxuICAvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG4gIGFkZEl0ZW0ob2JqZWN0KXtcclxuICAgIHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG4gIH1cclxuICBhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuICAgIGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNsZWFyQXJyYXlJdGVtcygpeyBcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcbiAgfVxyXG4gIGdldFJlbmRlckl0ZW1zKCl7XHJcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtcztcclxuICB9XHJcblxyXG4gIC8vIENsZWFyIGFycmF5IGFuZCByZXJ1biBjb2RlIHRvIGdldCBuZXcgaXRlbXNcclxuICBnZXROZXdSZW5kZXJJdGVtcygpIHtcclxuICAgIHRoaXMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVuZGVySXRlbXMoKTtcclxuICB9XHJcblxyXG4gIC8vIE1hdGhcclxuICBmcm9tUmlnaHQodmFsdWUpIHtcclxuICAgIHJldHVybiAoIHRoaXMuZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAqIHRoaXMuY2h1bmtTaXplICkgLSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJ1bigpIHtcclxuXHJcbiAgICAvLyAjIFBsYXllcnNcclxuXHJcbiAgICAgIC8vICMgUGxheWVyIDAxXHJcbiAgICAgICAgaWYoIHRoaXMucGxheWVyc1swXSApIHtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gIyBBdmF0YXJcclxuICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgJ3Nwcml0ZV91aScsIHRoaXMuY2h1bmtTaXplLFxyXG4gICAgICAgICAgICA1LCA1LCAvLyB4LCB5LFxyXG4gICAgICAgICAgICA1MCwgNTAsICAgLy8gc3ByaXRlX3csIHNwcml0ZV9oLCBcclxuICAgICAgICAgICAgMCwgMCwgICAgICAvLyBjbGlwX3gsIGNsaXBfeVxyXG4gICAgICAgICAgICB0aGlzLmNodW5rU2l6ZSwgdGhpcy5jaHVua1NpemUgLy8gdywgaFxyXG4gICAgICAgICAgKSApO1xyXG5cclxuICAgICAgICAgIC8vICMgTGlmZVxyXG4gICAgICAgICAgbGV0IF8xeCA9IDEyMDtcclxuICAgICAgICAgIGxldCBfMXkgPSAxMDtcclxuICAgICAgICAgIGxldCBfMWxpZmVzID0gdGhpcy5wbGF5ZXJzWzBdLmdldExpZmVzKCk7XHJcbiAgICAgICAgICBmb3IoIGxldCBpPTA7IGk8XzFsaWZlcztpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgICAgXzF4LCBfMXksXHJcbiAgICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICAgIDEwMCwgMCwgICAgICBcclxuICAgICAgICAgICAgICB0aGlzLmNodW5rU2l6ZS8zLCB0aGlzLmNodW5rU2l6ZS8zIFxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICAgIF8xeCArPSAzNTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09IDIgKSB7XHJcbiAgICAgICAgICAgICAgXzF4ID0gMTIwO1xyXG4gICAgICAgICAgICAgIF8xeSA9IDYwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRGVidWcgUG9zaXRpb25cclxuICAgICAgICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggXHJcbiAgICAgICAgICAgICAgbmV3IFVJaXRlbV90ZXh0KFxyXG4gICAgICAgICAgICAgICAgXCJYOiBcIiArIE1hdGgucm91bmQodGhpcy5wbGF5ZXJzWzBdLmdldFgoKSkrIFwiIFxcblk6IFwiICsgTWF0aC5yb3VuZCh0aGlzLnBsYXllcnNbMF0uZ2V0WSgpKSwgLy8gVGV4dCBcclxuICAgICAgICAgICAgICAgIDUsIDE0NSwgLy8gWCwgWVxyXG4gICAgICAgICAgICAgICAgeyAgY29sb3I6IFwiI0ZGRkZGRlwiLCBzaXplOiBcIjMwcHhcIiAgfSAvLyBmb250IHByb3BzXHJcbiAgICAgICAgICAgICAgKSBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSAtIC0gLSBcclxuXHJcbiAgICAgIC8vICMgUGxheWVyIDAyXHJcbiAgICAgICAgaWYoIHRoaXMucGxheWVyc1sxXSApIHtcclxuICAgICAgICAgIC8vICMgQXZhdGFyXHJcbiAgICAgICAgICB0aGlzLmFkZEl0ZW0oIG5ldyBVSWl0ZW0oXHJcbiAgICAgICAgICAgICdzcHJpdGVfdWknLCB0aGlzLmdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKSxcclxuICAgICAgICAgICAgdGhpcy5mcm9tUmlnaHQoIDIzMCApLCA1LCBcclxuICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICA1MCwgMCwgICAgICBcclxuICAgICAgICAgICAgdGhpcy5jaHVua1NpemUsIHRoaXMuY2h1bmtTaXplIFxyXG4gICAgICAgICAgKSApO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyAjIExpZmVcclxuICAgICAgICAgIGxldCBfMnggPSB0aGlzLmZyb21SaWdodCggNTAgKTtcclxuICAgICAgICAgIGxldCBfMnkgPSAxMDtcclxuICAgICAgICAgIGxldCBfMmxpZmVzID0gdGhpcy5wbGF5ZXJzWzFdLmdldExpZmVzKCk7XHJcbiAgICAgICAgICBmb3IoIGxldCBpPTA7IGk8XzJsaWZlcztpKysgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkSXRlbSggbmV3IFVJaXRlbShcclxuICAgICAgICAgICAgICAnc3ByaXRlX3VpJywgdGhpcy5nYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyksXHJcbiAgICAgICAgICAgICAgXzJ4LCBfMnksXHJcbiAgICAgICAgICAgICAgNTAsIDUwLCAgIFxyXG4gICAgICAgICAgICAgIDEwMCwgMCwgICAgICBcclxuICAgICAgICAgICAgICB0aGlzLmNodW5rU2l6ZS8zLCB0aGlzLmNodW5rU2l6ZS8zIFxyXG4gICAgICAgICAgICApICk7XHJcbiAgICAgICAgICAgIF8yeCAtPSAzNTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09IDIgKSB7XHJcbiAgICAgICAgICAgICAgXzJ4ID0gdGhpcy5mcm9tUmlnaHQoIDUwICk7XHJcbiAgICAgICAgICAgICAgXzJ5ID0gNjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgLy8gIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICMgIyAjICBcclxuICB9XHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVUkiLCJjbGFzcyBVSWl0ZW0ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihpdGVtU3ByaXRlSUQsIGNodW5rU2l6ZSwgeCwgeSwgc3csIHNoLCBjeCwgY3ksIHcsIGggKSB7XHJcbiAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5pdGVtU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaXRlbVNwcml0ZUlEKTtcclxuICAgIFxyXG4gICAgdGhpcy5zcHJpdGVQcm9wcyA9IHtcclxuICAgICAgc3ByaXRlX3dpZHRoOiBzdyxcclxuICAgICAgc3ByaXRlX2hlaWdodDogc2gsXHJcbiAgICAgIGNsaXBfeDogY3gsXHJcbiAgICAgIGNsaXBfeTogY3ksXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuaGlkZVNwcml0ZSA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4O1xyXG4gICAgdGhpcy55ID0geTtcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcblxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLndpZHRoID0gdzsgLy9weFxyXG4gICAgdGhpcy5oZWlnaHQgPSBoOyAvL3B4XHJcbiAgfVxyXG5cclxuICAvLyAjIFNldHMgICAgICBcclxuICBzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG4gIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHJcbiAgLy8gIyBHZXRzICAgICAgICAgICAgXHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgICAgXHJcbiAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgXHJcbiAgLy8gIyBJdGVtIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgICAgXHJcbiAgICBpZiAoIHRoaXMuaGlkZVNwcml0ZSApIHJldHVybjtcclxuXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICB0aGlzLml0ZW1TcHJpdGUsICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfd2lkdGgsIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICk7XHJcbiAgICBcclxuICB9XHJcbiAgICAgXHJcbn0vL2NsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVJaXRlbTtcclxuIiwiY2xhc3MgVUlpdGVtX3RleHQge1xyXG5cclxuICBjb25zdHJ1Y3RvciggdGV4dCwgeCwgeSwgZm9udCApIHtcclxuICAgIFxyXG4gICAgdGhpcy5oaWRlU3ByaXRlID0gZmFsc2U7XHJcbiAgICBcclxuICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcblxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDtcclxuICAgIHRoaXMueSA9IHk7XHJcbiAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMuZm9udCA9IGZvbnQ7XHJcblxyXG4gIH1cclxuICBcclxuICAvLyAjIFNldHMgICAgICBcclxuICBzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG4gIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBHZXRzICAgICAgICAgICAgXHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgICAgICBcclxuICAvLyAjIEl0ZW0gUmVuZGVyXHJcbiAgcmVuZGVyKGN0eCkge1xyXG4gICAgICAgIFxyXG4gICAgaWYgKCB0aGlzLmhpZGVTcHJpdGUgKSByZXR1cm47XHJcbiAgXHJcbiAgICBjdHguZm9udCA9ICB0aGlzLmZvbnQuc2l6ZSArIFwiICdQcmVzcyBTdGFydCAyUCdcIjtcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmZvbnQuY29sb3I7XHJcbiAgICBjdHguZmlsbFRleHQoIHRoaXMudGV4dCwgdGhpcy54LCB0aGlzLnkpOyBcclxuXHJcbiAgfVxyXG4gICAgICAgXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVUlpdGVtX3RleHQ7XHJcbiAgIiwiLy8gR2FtZSBQcm9wZXJ0aWVzIGNsYXNzIHRvIGRlZmluZSBjb25maWd1cmF0aW9uc1xyXG5jbGFzcyBnYW1lUHJvcGVydGllcyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgXHJcbiAgICAvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IDEwMDsgLy9weCAtIHJlc29sdXRpb25cclxuICAgIFxyXG4gICAgdGhpcy5zY3JlZW5Ib3Jpem9udGFsQ2h1bmtzID0gMTY7XHJcbiAgICB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzID0gMTQ7XHJcbiAgICBcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MpO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzKTsvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgXHJcbiAgICB0aGlzLmZwcyA9IDI0O1xyXG4gIH1cclxuXHJcbiAgZ2V0UHJvcChwcm9wKSB7XHJcbiAgICByZXR1cm4gdGhpc1twcm9wXTtcclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZVByb3BlcnRpZXM7XHJcblxyXG4vLyBHbG9iYWwgdmFsdWVzXHJcblxyXG4gIC8vIERlYnVnXHJcbiAgd2luZG93LmRlYnVnID0gZmFsc2U7IC8vIFNob3cgZGVidWcgc3F1YXJlc1xyXG4gIHdpbmRvdy5kZWJ1Z0NvbGxpc2lvbiA9IGZhbHNlOyAvLyBTaG93IHdoZW4gb2JqZWN0cyBjb2xsaWRlXHJcbiAgd2luZG93LmF1dG9sb2FkID0gdHJ1ZTsgLy8gYXV0byBsb2FkIGEgc2F2ZWQgZ2FtZVxyXG4gIHdpbmRvdy5nb2RfbW9kZSA9IHRydWU7IC8vIFBsYXllcnMgd29uJ3QgZGllIiwiY29uc3QgR2FtZSA9IHJlcXVpcmUoJy4vZW5naW5lL0dhbWUnKTtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgLy8gIyBTdGFydCB0aGUgZ2FtZVxyXG4gICAgbGV0IGdhbWUgPSBuZXcgR2FtZSgpO1xyXG4gICAgd2luZG93LmdhbWUgPSBnYW1lO1xyXG4gICAgZ2FtZS5ydW4oKTtcclxuXHJcbn0iXX0=
