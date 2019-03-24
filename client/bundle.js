(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Player {

	constructor(x0, y0, gameProps) {
    // # Sprite
      //this.playerSprite = new Image();
      //this.playerSprite.src = './assets/sprites/player_one.png';
      this.playerSprite = document.getElementById('sprite_player_one'); // Pegar esse id da instancia!!
      
      // http://getspritexy.com/ <= Para mapear os sprites!
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
    
    // # Position
      this.x = x0;
      this.y = y0;
      
      this.x0 = x0; // initial position
      this.y0 = y0;

      this.chunkSize = gameProps.getProp('chunkSize');

      this.lookDirection = this.lookDown();

    // # Properties
      this.width = this.chunkSize; //px
      this.height = this.chunkSize * 2; //px
      this.speed0 = 6;
      this.speed = this.chunkSize / this.speed0;

      this.isCollidable = true;
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
      
      if (37 in keysDown) // Left
        this.movLeft();
        
      if (38 in keysDown) // Up  
        this.movUp();
        
      if (39 in keysDown) // Right
        this.movRight();

      if (40 in keysDown) // Down
        this.movDown();

    }
		
	// # Sets
		
		setX(x) { this.x = x; }
		setY(y) { this.y = y; }
			
		setHeight(height) { this.height = height; }
		setWidth(width) { this.width = width; }
			
		setSpeed(speed) { this.speed = this.chunkSize / speed; }

		setLookDirection(lookDirection) { this.lookDirection = lookDirection; }
		setLookDirectionVal(string) { this.lookDirectionVar = string; }

		resetPosition() {
			this.setX( this.x0 );
		  this.setY( this.y0 );
		}
		
	// # Gets
			
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
		
	// # Player Render
				
	  render(ctx) {
        
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
  
		noCollision() {
			// What happens if the player is not colliding?
			this.setSpeed(this.speed0); // Reset speed
    }
      
    collision(object) {
       return this.isCollidable;
    };
		
}//class

module.exports = Player;

},{}],2:[function(require,module,exports){
/*
    Prototype Scenario
*/
const _Scenario = require('../common/_Scenario');

const Prototype_Stage_1 = require('./stages/stage_1');
const Prototype_Stage_2 = require('./stages/stage_2');

class scenarioPrototype extends _Scenario {

  constructor(ctx, canvas, gameProps){
    super(ctx, canvas, gameProps);
    this.run();
  }

  // # Stages
  setStage(stage_number, firstStage) {
    console.log(stage_number);
    let stage_01 = new Prototype_Stage_1( this.chunkSize );
    let stage_02 = new Prototype_Stage_2( this.chunkSize );
          
    switch(stage_number) {
      case 1:
        this.stage = stage_01;
        break;
      case 2:
        this.stage = stage_02;
        break;
      }
      this.loadStage(firstStage);
    }
    
  // Functions to load selected stage
  loadStage(firstStage) {
            
    // Clear previous render items
    this.renderItems = new Array();
    this.renderItemsAnimated = new Array();

    // Add the Static Items
    this.stage.getStaticItems().map( (item) => { 
      item.scenario = this; // Pass this scenario class as an argument, so other functions can refer to this
      this.addRenderItem(item);
    });

    // Add the Animated Items
    this.stage.getLayerItems().map( (item) => { 
      item.scenario = this;
      this.addRenderLayerItem(item);
    });
    
    // Only set player start at first load
    if(firstStage) {
      this.setPlayerStartX( this.stage.getPlayerStartX() );
      this.setPlayerStartY( this.stage.getPlayerStartY() );
    }
    console.log('Stage loaded');
    console.log(this.stage);
    console.trace();
  }

  // Set Default Stage
  run() {
    this.setStage(1, true);    
	}

}//class

module.exports = scenarioPrototype;
},{"../common/_Scenario":9,"./stages/stage_1":3,"./stages/stage_2":4}],3:[function(require,module,exports){
// Stage 01
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_1 extends _Stage{

  constructor(chunkSize) {
    super(chunkSize);

    let playerStartX = chunkSize * 1;
    let playerStartY = chunkSize * 2;

    this.run(playerStartX, playerStartY);
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
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f2,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f2,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wc_bl,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wb,   wc_br ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer() {

    // Teleport
    let tp_02 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "top",     targetStage: 2 };
    
    let scenarioDesign = [
      [ false,   tp_02,  tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   tp_02,   false ],
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
      this.addRenderLayerItem( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(setPlayerStartX, setPlayerStartY) {
    this.setPlayerStartX(setPlayerStartX);
    this.setPlayerStartY(setPlayerStartY);
    this.scenarioDesign();
    this.scenarioDesignLayer();
  }

} // class
module.exports = Prototype_Stage_1;
},{"../../common/Beach_Floor":5,"../../common/Beach_Wall":6,"../../common/Teleport":7,"../../common/_Stage":10}],4:[function(require,module,exports){
// Stage 02
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_2 extends _Stage{

  constructor(chunkSize) {
    super(chunkSize);

    let playerStartX = chunkSize * 3;
    let playerStartY = chunkSize * 4;

    this.run(playerStartX, playerStartY);
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
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wc_tl,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wc_tr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   f2,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   ob,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   f2,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "bottom",     targetStage: 1 };
    
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
      [ false,   tp_01,  tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(setPlayerStartX, setPlayerStartY) {
    this.setPlayerStartX(setPlayerStartX);
    this.setPlayerStartY(setPlayerStartY);
    this.scenarioDesign();
    this.scenarioDesignLayer();
  }

} // class

module.exports = Prototype_Stage_2

},{"../../common/Beach_Floor":5,"../../common/Beach_Wall":6,"../../common/Teleport":7,"../../common/_Stage":10}],5:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class Beach_Floor extends _Collidable {

	constructor(type, x0, y0, chunkSize) {
    
    let stopOnCollision = false;
    let hasCollisionEvent = false;
    
    let name = "Beach Floor";

    // # Sprite
    let spriteWidth = 16;
    let spriteHeight = 16;
    let stageSprite = document.getElementById('sprite_beach'); // TEMPORARY
    //this.stageSprite = new Image();
    //this.stageSprite.src = '/assets/scenario/Prototype/sprites/prototype.png';

    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name);
    
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

}//class
module.exports = Beach_Floor;
},{"./_Collidable":8}],6:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class Beach_wall extends _Collidable {

	constructor(type, x0, y0, chunkSize) {
    
    let stopOnCollision = true;
    let hasCollisionEvent = false;
    
    let name = "Beach Wall";

    // # Sprite
    let spriteWidth = 16;
    let spriteHeight = 16;
    let stageSprite = document.getElementById('sprite_beach'); // TEMPORARY
    //this.stageSprite = new Image();
    //this.stageSprite.src = '/assets/scenario/Prototype/sprites/prototype.png';

    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name);

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
    }

  }

}//class
module.exports = Beach_wall;
},{"./_Collidable":8}],7:[function(require,module,exports){
const _Collidable = require('./_Collidable');
const gameProperties = require('../../../gameProperties'); 

class Teleport extends _Collidable {

	constructor(type, x0, y0, xIndex, yIndex, chunkSize, teleportProps) {
    
    let stopOnCollision = false;
    let hasCollisionEvent = true;
    
    let name = "Teleport";

    // # Sprite
    let spriteWidth = 16;
    let spriteHeight = 16;
	  let stageSprite = false;
	
    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name);
    
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
  collision(player, collidable, collisionDirection){
    this.teleport( player );
    // Change stage
    collidable.scenario.setStage( 
      this.teleportProps.targetStage,
      false // firstStage ?
    );
    
  }

  // What kind of teleport?
  teleport( player ) {

    let gameProps = new gameProperties();

    let type = this.teleportProps.teleportType;
    let targetX = 0;
    let targetY = 0;

    switch(type){
      default:
        targetX = this.teleportProps.targetX;
        targetY = this.teleportProps.targetY;
        break;
      case "relative":
        switch (this.teleportProps.cameFrom) {
          case "top":
           // if( player.spriteProps.direction != "up" ){ return; } // If is looking from the opposite direction, it means that it just came from a teleport
            targetX = this.xIndex * this.chunkSize;
            targetY = ( (gameProps.getProp('screenVerticalChunks') -2) * this.chunkSize) - this.chunkSize; // -1 because of the player collision box
            break;
          case "bottom":
           // if( player.spriteProps.direction != "down" ){ return; }
            targetX = this.xIndex * this.chunkSize;
            targetY = 1 * this.chunkSize; // This 1 is just to remeber that it will be teleported to index Xx1 and not Xx0
            break;
          case "right":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = 1 * this.chunkSize;
            break;
          case "left":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = ( ( gameProps.getProp('screenHorizontalChunks') -1 )  * this.chunkSize) - this.chunkSize; 
            break;
        }
        break;
    }

    player.setX( targetX ); // always using X and Y relative to teleport not player because it fix the player position to fit inside destination square.
    player.setY( targetY );
    
    console.log('teleported');
    console.log(player.spriteProps.direction, this.teleportProps);
    
  }

}//class
module.exports = Teleport;
},{"../../../gameProperties":15,"./_Collidable":8}],8:[function(require,module,exports){
class _Collidable {

  constructor(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name) {
      
    // # Position
    this.x = x0;
    this.y = y0;
      
    // # Properties
    this.width = chunkSize; //px
    this.height = chunkSize;

    this.chunkSize = chunkSize;

    this.stopOnCollision = stopOnCollision;
    this.hasCollisionEvent = hasCollisionEvent;

    this.name = name;
      
    // # Sprite
    this.stageSprite = stageSprite;

    this.spriteWidth = spriteWidth;   
    this.spriteHeight = spriteHeight; 
    this.spriteProps = new Array();

    this.run( type );

  }

  // # Sets
    
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
    
  setHeight(height) { this.height = height; }
  setWidth(width) { this.width = width; }
    
  setSpriteType(type) {
    // ! Must have in childs Class
  }
			
	// # Gets
			
  getX() { return this.x; }
  getY() { return this.y; }
  
  getWidth() { return this.width; }
  getHeight() { return this.height; }

  getCollisionHeight() { return this.height; }
  getCollisionWidth() { return this.width; }
  getCollisionX() {  return this.x; }
  getCollisionY() {  return this.y; }

  getCenterX() { return this.getCollisionX() + this.getCollisionWidth(); }
  getCenterY() { return this.getCollisionY() + this.getCollisionHeight(); }
		
	// # Render
  render(ctx) {
      
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
      ctx.fillStyle = this.stopOnCollision ? "rgba(255,0,0,0.2)" : "rgba(0,255,0,0.2)";
      ctx.fillRect(props.x, props.y, props.w, props.h);
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth   = 5;
      ctx.strokeRect(props.x, props.y, props.w, props.h);
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
},{}],9:[function(require,module,exports){
class _Scenario {

	constructor(ctx, canvas, gameProps){
		this.ctx = ctx;
		this.canvas = canvas;
		
		this.renderItems = new Array();
		this.renderLayerItems = new Array();
		
		this.width = canvas.width;
    this.height = canvas.height;
    
    this.playerStartX = 0; 
    this.playerStartY = 0; 

    this.stage = 0;

		this.chunkSize = gameProps.getProp('chunkSize');
	}

  // # Add Items to the render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderLayerItem(item){
		this.renderLayerItems.push(item);
  }
  
	// # Gets
	getCtx() { return this.ctx; }
	getCanvas() { return this.canvas; }	
				
	getRenderItems() { return this.renderItems; }
	getLayerItems() {  return this.renderLayerItems; }
  
  getPlayerStartX() { return this.playerStartX; }
  getPlayerStartY() { return this.playerStartY; }

  // # Sets
  setPlayerStartX(x) { this.playerStartX = x; }
  setPlayerStartY(y) { this.playerStartY = y; }

  render() { }

}//class
module.exports = _Scenario;
},{}],10:[function(require,module,exports){
class _Stage {

  constructor(chunkSize) {
    this.renderItems = new Array();
    this.renderLayerItems = new Array();
    this.chunkSize = chunkSize;
    this.run();
  }
  
  // # Gets
  getStaticItems() {  return this.renderItems; }
  getLayerItems() {  return this.renderLayerItems; }
  
  getPlayerStartX() { return this.playerStartX; }
  getPlayerStartY() { return this.playerStartY; }
  
  // # Sets
  setPlayerStartX(x) { this.playerStartX = x; }
  setPlayerStartY(y) { this.playerStartY = y; }
  
  // # Add Items to the render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderLayerItem(item){
		this.renderLayerItems.push(item);
  }
  
  run () { }

} // class
module.exports = _Stage;
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
    
    // Only checks objects that needs to be checked
    if( ! r2.triggersCollisionEvent() && ! r2.stopIfCollision() ) { return false; }

    // stores the distance between the objects (must be rectangle)
    var catX = r1.getCenterX() - r2.getCenterX();
    var catY = r1.getCenterY() - r2.getCenterY();

    var sumHalfWidth = ( r1.getCollisionWidth() / 2 ) + ( r2.getCollisionWidth() / 2 );
    var sumHalfHeight = ( r1.getCollisionHeight() / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
      
    if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
      
      var overlapX = sumHalfWidth - Math.abs(catX);
      var overlapY = sumHalfHeight - Math.abs(catY);
      var collisionDirection = false;

      if( r2.stopIfCollision() ) {
        if(overlapX >= overlapY ){ // Direction of collision - Up/Down
          if(catY > 0){ // Up
            r1.setY( r1.getY() + overlapY );
            collisionDirection = "up";
          } else {
            r1.setY( r1.getY() - overlapY );
            collisionDirection = "down";
          }
        } else {// Direction of collision - Left/Right
          if(catX > 0){ // Left
            r1.setX( r1.getX() + overlapX );
            collisionDirection = "left";
          } else {
            r1.setX( r1.getX() - overlapX );
            collisionDirection = "right";
          }
        }
      }

      console.log(r1, r2);

      // Triggers Collision event
      r1.collision(r2, r1, collisionDirection);
      r2.collision(r1, r2, collisionDirection);

    } else {
      // Triggers not in collision event
      r1.noCollision(r2, r2, collisionDirection); 
      r2.noCollision(r1, r2, collisionDirection); 
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
	
},{}],13:[function(require,module,exports){
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
      // Execute the render function - Include this function on every class!
      this.renderItems[i].render(this.ctx, deltaTime);
    }
    
  }
    
}//class
module.exports = Render
},{}],14:[function(require,module,exports){
const gameProperties = require('./gameProperties');
const scenarioPrototype = require('./assets/scenario/Prototype/scenarioPrototype');
const Player = require('./assets/player');
const Collision = require('./engine/collision');
const Render = require('./engine/render');

window.onload = function() {

  // # Init

    var fpsInterval, now, deltaTime, elapsed;
    var gameProps = new gameProperties();

    var canvasStatic = document.getElementById('canvas_static');
    var contextStatic = canvasStatic.getContext('2d');

    var canvasAnimated = document.getElementById('canvas_animated');
    var contextAnimated = canvasAnimated.getContext('2d');

    canvasAnimated.width = canvasStatic.width = gameProps.getProp('canvasWidth');
    canvasAnimated.height = canvasStatic.height = gameProps.getProp('canvasHeight');

  // # Scenario

     var scenario = new scenarioPrototype(contextStatic, canvasStatic, gameProps );

  // # Players

    var player = new Player( scenario.getPlayerStartX(), scenario.getPlayerStartY(), gameProps, contextAnimated ); //posição x e y

  // # Collision detection class

    var collision = new Collision(canvasAnimated.width, canvasAnimated.height );

  // # Render

    var renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
    var renderAnimated = new Render(contextAnimated, canvasAnimated); //Render with animated objects only

    // Add items to be rendered

    renderStatic.setScenario(scenario); // set the scenario
    
  // # Keyboard Events

    var keysDown = {};
    window.addEventListener('keydown', function(e) {
      keysDown[e.keyCode] = true;
    });
    window.addEventListener('keyup', function(e) {
      delete keysDown[e.keyCode];
      player.resetStep();
    });
  
  // Unpause the game when click on screen
    window.addEventListener('keypress', function(e) {
      if( e.keyCode == 13 ) { // Enter
        window.togglePause();
      }
    });

  // # The Game Loop

    function updateGame(deltaTime) {

      if( window.isPaused() ) return;
      
      renderStatic.start( deltaTime );  // Static can also change, because it is the scenario... maybe will change this names to layers
      renderAnimated.start( deltaTime );

      // # Add the objects to the collision vector
      collision.clearArrayItems();
      collision.addArrayItem( scenario.getRenderItems() );
      collision.addArrayItem( scenario.getLayerItems() );
      
      renderStatic.clearArrayItems();
      renderStatic.addArrayItem(scenario.getRenderItems()); // Get all items from the scenario that needs to be rendered

      renderAnimated.clearArrayItems();
      renderAnimated.addItem( player ); // Adds the player to the animation render
      renderAnimated.addArrayItem( scenario.getLayerItems() ); // Get all animated items from the scenario that needs to be rendered

      // # Movements
      player.handleMovement( keysDown );

      // # Check if player is colliding
      collision.check(player);

    };

    // # "Thread" tha runs the game
    function runGame(fps) {
      fpsInterval = 1000 / fps;
      deltaTime = Date.now();
      startTime = deltaTime;
      gameLoop();
    }

    function gameLoop() {

      // calc elapsed time since last loop
      now = Date.now();
      elapsed = now - deltaTime;

      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        deltaTime = now - (elapsed % fpsInterval);

        updateGame( deltaTime );

      }

      // Runs only when the browser is in focus
      // Request another frame
      requestAnimationFrame(gameLoop);

    }

  // # Starts the game
    runGame( gameProps.getProp('fps') );	// GO GO GO

}
},{"./assets/player":1,"./assets/scenario/Prototype/scenarioPrototype":2,"./engine/collision":12,"./engine/render":13,"./gameProperties":15}],15:[function(require,module,exports){
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
module.exports = gameProperties

// Global values

  // Debug
  window.debug = false;
  window._pause = false;
  window.isPaused = function() { return _pause; }
  window.pause = function() { window._pause = true; console.log('Game Paused!'); }
  window.unpause = function() { window._pause = false; console.log('Game Unpaused!'); }
  window.togglePause = function() { 
    if( window._pause ) {
      window.unpause();
    } else {
      window.pause();
    }
  }
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,15,14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL3BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlXzEuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfMi5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX0Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfV2FsbC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL1RlbGVwb3J0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX0NvbGxpZGFibGUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU2NlbmFyaW8uanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU3RhZ2UuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9lbmVtX3Byb3RvdHlwZS5qcyIsImNsaWVudC9lbmdpbmUvY29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9yZW5kZXIuanMiLCJjbGllbnQvZ2FtZS5qcyIsImNsaWVudC9nYW1lUHJvcGVydGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBQbGF5ZXIge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih4MCwgeTAsIGdhbWVQcm9wcykge1xyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgICAgLy90aGlzLnBsYXllclNwcml0ZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAvL3RoaXMucGxheWVyU3ByaXRlLnNyYyA9ICcuL2Fzc2V0cy9zcHJpdGVzL3BsYXllcl9vbmUucG5nJztcclxuICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl9vbmUnKTsgLy8gUGVnYXIgZXNzZSBpZCBkYSBpbnN0YW5jaWEhIVxyXG4gICAgICBcclxuICAgICAgLy8gaHR0cDovL2dldHNwcml0ZXh5LmNvbS8gPD0gUGFyYSBtYXBlYXIgb3Mgc3ByaXRlcyFcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHtcclxuICAgICAgICBzcHJpdGVfd2lkdGg6IDIwLCAvLyBQbGF5ZXIgc2l6ZSBpbnNpZGUgc3ByaXRlXHJcbiAgICAgICAgc3ByaXRlX2hlaWdodDogNDBcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN0ZXAgPSBbXTtcclxuICAgICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICAgIHRoaXMuaW5pdGlhbFN0ZXAgPSAzO1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHRoaXMubWF4U3RlcHMgPSA4O1xyXG5cclxuICAgICAgLy8gQ29udHJvbHMgdGhlIHBsYXllciBGUFMgQW5pbWF0aW9uXHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gMTI7IC8vIDEwMDAgLyBGUFNcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICAgIHRoaXMueCA9IHgwO1xyXG4gICAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICB0aGlzLnkwID0geTA7XHJcblxyXG4gICAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuXHJcbiAgICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2h1bmtTaXplOyAvL3B4XHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jaHVua1NpemUgKiAyOyAvL3B4XHJcbiAgICAgIHRoaXMuc3BlZWQwID0gNjtcclxuICAgICAgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gdGhpcy5zcGVlZDA7XHJcblxyXG4gICAgICB0aGlzLmlzQ29sbGlkYWJsZSA9IHRydWU7XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU3ByaXRlcyBzdGF0ZSBmb3IgcGxheWVyIGRpcmVjdGlvblxyXG4gICAgXHJcbiAgICBsb29rRG93bigpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgICAgXHJcbiAgICAgIC8vIFN0ZXBzXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiAwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rVXAoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAndXAnO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDQwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tSaWdodCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDgwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcblx0XHRsb29rTGVmdCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiAxMjAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gICAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0bGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblx0ICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgICBcclxuXHQvLyAjIFBsYXllciBNb3ZlbWVudFxyXG5cdFx0XHJcblx0XHRtb3ZMZWZ0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZSaWdodCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZVcCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZEb3duKCkgeyAgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB9O1xyXG5cclxuICAgIGhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApIHtcclxuICAgICAgXHJcbiAgICAgIGlmICgzNyBpbiBrZXlzRG93bikgLy8gTGVmdFxyXG4gICAgICAgIHRoaXMubW92TGVmdCgpO1xyXG4gICAgICAgIFxyXG4gICAgICBpZiAoMzggaW4ga2V5c0Rvd24pIC8vIFVwICBcclxuICAgICAgICB0aGlzLm1vdlVwKCk7XHJcbiAgICAgICAgXHJcbiAgICAgIGlmICgzOSBpbiBrZXlzRG93bikgLy8gUmlnaHRcclxuICAgICAgICB0aGlzLm1vdlJpZ2h0KCk7XHJcblxyXG4gICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIC8vIERvd25cclxuICAgICAgICB0aGlzLm1vdkRvd24oKTtcclxuXHJcbiAgICB9XHJcblx0XHRcclxuXHQvLyAjIFNldHNcclxuXHRcdFxyXG5cdFx0c2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuXHRcdHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0c2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gc3BlZWQ7IH1cclxuXHJcblx0XHRzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG5cdFx0c2V0TG9va0RpcmVjdGlvblZhbChzdHJpbmcpIHsgdGhpcy5sb29rRGlyZWN0aW9uVmFyID0gc3RyaW5nOyB9XHJcblxyXG5cdFx0cmVzZXRQb3NpdGlvbigpIHtcclxuXHRcdFx0dGhpcy5zZXRYKCB0aGlzLngwICk7XHJcblx0XHQgIHRoaXMuc2V0WSggdGhpcy55MCApO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0Ly8gIyBHZXRzXHJcblx0XHRcdFxyXG5cdCAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0Z2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHQgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgICAgXHJcbiAgICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0IC8gMjsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLnkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblxyXG4gICAgZ2V0Q2VudGVyWCgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpOyB9XHJcbiAgICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblx0XHRcdFxyXG5cdFx0Z2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblx0XHRnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuICAgICAgXHJcbiAgICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgICAgXHJcbiAgICBpbmNyZWFzZVN0ZXAoKSB7XHJcbiAgICAgIGlmKHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkpIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCsrO1xyXG4gICAgICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuaW5pdGlhbFN0ZXA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXNldFN0ZXAoKSB7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgc3dpdGNoICggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBQbGF5ZXIgUmVuZGVyXHJcblx0XHRcdFx0XHJcblx0ICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIFxyXG4gICAgICAvKnBsYXllclNwcml0ZS5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy8gb25sb2FkIG7Do28gcXVlciBjYXJyZWdhciBubyBwbGF5ZXIuLnBxID8/XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShwbGF5ZXJTcHJpdGUsIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1x0XHJcbiAgICAgIH1cdCovXHJcbiAgICAgIC8vZHJhd0ltYWdlKGltZyxzeCxzeSxzd2lkdGgsc2hlaWdodCx4LHksd2lkdGgsaGVpZ2h0KTtcclxuICAgICAgLy8gIyBodHRwczovL3d3dy53M3NjaG9vbHMuY29tL3RhZ3MvY2FudmFzX2RyYXdpbWFnZS5hc3BcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHRcclxuICAgICAgLy8gREVCVUcgQ09MTElTSU9OXHJcbiAgICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMjU1LCAwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCBwcm9wcy54LCB0aGlzLmdldENvbGxpc2lvblkoKSwgcHJvcHMudywgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSApO1xyXG4gICAgICB9XHJcblx0XHR9O1xyXG4gIFxyXG4gIC8vICMgQ29sbGlzaW9uXHJcbiAgXHJcblx0XHRub0NvbGxpc2lvbigpIHtcclxuXHRcdFx0Ly8gV2hhdCBoYXBwZW5zIGlmIHRoZSBwbGF5ZXIgaXMgbm90IGNvbGxpZGluZz9cclxuXHRcdFx0dGhpcy5zZXRTcGVlZCh0aGlzLnNwZWVkMCk7IC8vIFJlc2V0IHNwZWVkXHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgY29sbGlzaW9uKG9iamVjdCkge1xyXG4gICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfTtcclxuXHRcdFxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcbiAgICBQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgX1NjZW5hcmlvID0gcmVxdWlyZSgnLi4vY29tbW9uL19TY2VuYXJpbycpO1xyXG5cclxuY29uc3QgUHJvdG90eXBlX1N0YWdlXzEgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV8xJyk7XHJcbmNvbnN0IFByb3RvdHlwZV9TdGFnZV8yID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfMicpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9Qcm90b3R5cGUgZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzKXtcclxuICAgIHN1cGVyKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMpO1xyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcblxyXG4gIC8vICMgU3RhZ2VzXHJcbiAgc2V0U3RhZ2Uoc3RhZ2VfbnVtYmVyLCBmaXJzdFN0YWdlKSB7XHJcbiAgICBjb25zb2xlLmxvZyhzdGFnZV9udW1iZXIpO1xyXG4gICAgbGV0IHN0YWdlXzAxID0gbmV3IFByb3RvdHlwZV9TdGFnZV8xKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgbGV0IHN0YWdlXzAyID0gbmV3IFByb3RvdHlwZV9TdGFnZV8yKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgICAgICAgXHJcbiAgICBzd2l0Y2goc3RhZ2VfbnVtYmVyKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICB0aGlzLnN0YWdlID0gc3RhZ2VfMDE7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICB0aGlzLnN0YWdlID0gc3RhZ2VfMDI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5sb2FkU3RhZ2UoZmlyc3RTdGFnZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAvLyBGdW5jdGlvbnMgdG8gbG9hZCBzZWxlY3RlZCBzdGFnZVxyXG4gIGxvYWRTdGFnZShmaXJzdFN0YWdlKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgLy8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG4gICAgdGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcbiAgICAgIGl0ZW0uc2NlbmFyaW8gPSB0aGlzOyAvLyBQYXNzIHRoaXMgc2NlbmFyaW8gY2xhc3MgYXMgYW4gYXJndW1lbnQsIHNvIG90aGVyIGZ1bmN0aW9ucyBjYW4gcmVmZXIgdG8gdGhpc1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckl0ZW0oaXRlbSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIEFuaW1hdGVkIEl0ZW1zXHJcbiAgICB0aGlzLnN0YWdlLmdldExheWVySXRlbXMoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG4gICAgICBpdGVtLnNjZW5hcmlvID0gdGhpcztcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW0oaXRlbSk7XHJcbiAgICB9KTtcclxuICAgIFxyXG4gICAgLy8gT25seSBzZXQgcGxheWVyIHN0YXJ0IGF0IGZpcnN0IGxvYWRcclxuICAgIGlmKGZpcnN0U3RhZ2UpIHtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXJTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyU3RhcnRYKCkgKTtcclxuICAgICAgdGhpcy5zZXRQbGF5ZXJTdGFydFkoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyU3RhcnRZKCkgKTtcclxuICAgIH1cclxuICAgIGNvbnNvbGUubG9nKCdTdGFnZSBsb2FkZWQnKTtcclxuICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhZ2UpO1xyXG4gICAgY29uc29sZS50cmFjZSgpO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0IERlZmF1bHQgU3RhZ2VcclxuICBydW4oKSB7XHJcbiAgICB0aGlzLnNldFN0YWdlKDEsIHRydWUpOyAgICBcclxuXHR9XHJcblxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzY2VuYXJpb1Byb3RvdHlwZTsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV8xIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSk7XHJcblxyXG4gICAgbGV0IHBsYXllclN0YXJ0WCA9IGNodW5rU2l6ZSAqIDE7XHJcbiAgICBsZXQgcGxheWVyU3RhcnRZID0gY2h1bmtTaXplICogMjtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXJTdGFydFgsIHBsYXllclN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3Y19ibCwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3Y19iciBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckl0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgc2NlbmFyaW9EZXNpZ25MYXllcigpIHtcclxuXHJcbiAgICAvLyBUZWxlcG9ydFxyXG4gICAgbGV0IHRwXzAyID0geyBuYW1lOiBcInRlbGVwb3J0XCIsIHR5cGU6IFwiXCIsIHRlbGVwb3J0VHlwZTogXCJyZWxhdGl2ZVwiLCBjYW1lRnJvbTogXCJ0b3BcIiwgICAgIHRhcmdldFN0YWdlOiAyIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgICB0cF8wMiwgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIHRwXzAyLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgXVxyXG5cclxuICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICBzY2VuYXJpb0Rlc2lnbi5tYXAoIChhcnJheSwgeUluZGV4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHhJbmRleCkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIGxldCB5MCA9IHlJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4KSApO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIH1cclxuXHJcbiAgcnVuKHNldFBsYXllclN0YXJ0WCwgc2V0UGxheWVyU3RhcnRZKSB7XHJcbiAgICB0aGlzLnNldFBsYXllclN0YXJ0WChzZXRQbGF5ZXJTdGFydFgpO1xyXG4gICAgdGhpcy5zZXRQbGF5ZXJTdGFydFkoc2V0UGxheWVyU3RhcnRZKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ24oKTtcclxuICAgIHRoaXMuc2NlbmFyaW9EZXNpZ25MYXllcigpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfMTsiLCIvLyBTdGFnZSAwMlxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV8yIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSk7XHJcblxyXG4gICAgbGV0IHBsYXllclN0YXJ0WCA9IGNodW5rU2l6ZSAqIDM7XHJcbiAgICBsZXQgcGxheWVyU3RhcnRZID0gY2h1bmtTaXplICogNDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXJTdGFydFgsIHBsYXllclN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSwgeEluZGV4LCB5SW5kZXgpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9GbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcInRlbGVwb3J0XCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZWxlcG9ydChpdGVtLnR5cGUsIHgsIHksIHhJbmRleCwgeUluZGV4LCB0aGlzLmNodW5rU2l6ZSwgaXRlbSApO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgIC8vIFdhbGxzXHJcbiAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgIGxldCB3ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwicmlnaHRcIn07XHJcbiAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgIFxyXG4gICAgbGV0IHdjX3RsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgIGxldCB3Y19iciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9yaWdodFwifTtcclxuICAgIFxyXG4gICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICBsZXQgb2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIm9ic3RhY2xlXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgLy8gRmxvb3JcclxuICAgIGxldCBmMSA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAxXCJ9O1xyXG4gICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcblxyXG4gICAgLy8gTWFrZSBzaHVyZSB0byBkZXNpZ24gYmFzZWFkIG9uIGdhbWVQcm9wZXJ0aWVzICFcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyB3Y190bCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMiwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIG9iLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjIsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF1cclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXIoKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cF8wMSA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0ZWxlcG9ydFR5cGU6IFwicmVsYXRpdmVcIiwgY2FtZUZyb206IFwiYm90dG9tXCIsICAgICB0YXJnZXRTdGFnZTogMSB9O1xyXG4gICAgXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIHRwXzAxLCAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgdHBfMDEsICAgZmFsc2UgXSxcclxuICAgIF1cclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHlJbmRleCkgPT4ge1xyXG4gICAgICBhcnJheS5tYXAoIChpdGVtLCB4SW5kZXgpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB5SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgdGhpcy5hZGRSZW5kZXJMYXllckl0ZW0oIHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwLCB4SW5kZXgsIHlJbmRleCkgKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICBcclxuICB9XHJcblxyXG4gIHJ1bihzZXRQbGF5ZXJTdGFydFgsIHNldFBsYXllclN0YXJ0WSkge1xyXG4gICAgdGhpcy5zZXRQbGF5ZXJTdGFydFgoc2V0UGxheWVyU3RhcnRYKTtcclxuICAgIHRoaXMuc2V0UGxheWVyU3RhcnRZKHNldFBsYXllclN0YXJ0WSk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduTGF5ZXIoKTtcclxuICB9XHJcblxyXG59IC8vIGNsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3RvdHlwZV9TdGFnZV8yXHJcbiIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfRmxvb3IgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBzdG9wT25Db2xsaXNpb24gPSBmYWxzZTtcclxuICAgIGxldCBoYXNDb2xsaXNpb25FdmVudCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBsZXQgbmFtZSA9IFwiQmVhY2ggRmxvb3JcIjtcclxuXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgbGV0IHNwcml0ZVdpZHRoID0gMTY7XHJcbiAgICBsZXQgc3ByaXRlSGVpZ2h0ID0gMTY7XHJcbiAgICBsZXQgc3RhZ2VTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyk7IC8vIFRFTVBPUkFSWVxyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlID0gbmV3IEltYWdlKCk7XHJcbiAgICAvL3RoaXMuc3RhZ2VTcHJpdGUuc3JjID0gJy9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3Nwcml0ZXMvcHJvdG90eXBlLnBuZyc7XHJcblxyXG4gICAgc3VwZXIodHlwZSwgeDAsIHkwLCBjaHVua1NpemUsIHN0YWdlU3ByaXRlLCBzcHJpdGVXaWR0aCwgc3ByaXRlSGVpZ2h0LCBzdG9wT25Db2xsaXNpb24sIGhhc0NvbGxpc2lvbkV2ZW50LCBuYW1lKTtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcIjAxXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDIxNCwgY2xpcF95OiA5LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcIjAyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDIxNCwgY2xpcF95OiA5NCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfRmxvb3I7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF93YWxsIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSkge1xyXG4gICAgXHJcbiAgICBsZXQgc3RvcE9uQ29sbGlzaW9uID0gdHJ1ZTtcclxuICAgIGxldCBoYXNDb2xsaXNpb25FdmVudCA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICBsZXQgbmFtZSA9IFwiQmVhY2ggV2FsbFwiO1xyXG5cclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICBsZXQgc3ByaXRlV2lkdGggPSAxNjtcclxuICAgIGxldCBzcHJpdGVIZWlnaHQgPSAxNjtcclxuICAgIGxldCBzdGFnZVNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKTsgLy8gVEVNUE9SQVJZXHJcbiAgICAvL3RoaXMuc3RhZ2VTcHJpdGUgPSBuZXcgSW1hZ2UoKTtcclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZS5zcmMgPSAnL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3ByaXRlcy9wcm90b3R5cGUucG5nJztcclxuXHJcbiAgICBzdXBlcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSwgc3RhZ2VTcHJpdGUsIHNwcml0ZVdpZHRoLCBzcHJpdGVIZWlnaHQsIHN0b3BPbkNvbGxpc2lvbiwgaGFzQ29sbGlzaW9uRXZlbnQsIG5hbWUpO1xyXG5cclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCJ0b3BcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMzc1LCBjbGlwX3k6IDE5NywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDA5LCBjbGlwX3k6IDIxNCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDM5MiwgY2xpcF95OiAyMTQsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMzc1LCBjbGlwX3k6IDE4MCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0NjAsIGNsaXBfeTogMTAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfdG9wX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ3NywgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0NjAsIGNsaXBfeTogMjcsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDU0NSwgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcIndhdGVyXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAyOTksIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJvYnN0YWNsZVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MCwgY2xpcF95OiA3NSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF93YWxsOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5jb25zdCBnYW1lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uLy4uLy4uL2dhbWVQcm9wZXJ0aWVzJyk7IFxyXG5cclxuY2xhc3MgVGVsZXBvcnQgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgsIGNodW5rU2l6ZSwgdGVsZXBvcnRQcm9wcykge1xyXG4gICAgXHJcbiAgICBsZXQgc3RvcE9uQ29sbGlzaW9uID0gZmFsc2U7XHJcbiAgICBsZXQgaGFzQ29sbGlzaW9uRXZlbnQgPSB0cnVlO1xyXG4gICAgXHJcbiAgICBsZXQgbmFtZSA9IFwiVGVsZXBvcnRcIjtcclxuXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgbGV0IHNwcml0ZVdpZHRoID0gMTY7XHJcbiAgICBsZXQgc3ByaXRlSGVpZ2h0ID0gMTY7XHJcblx0ICBsZXQgc3RhZ2VTcHJpdGUgPSBmYWxzZTtcclxuXHRcclxuICAgIHN1cGVyKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplLCBzdGFnZVNwcml0ZSwgc3ByaXRlV2lkdGgsIHNwcml0ZUhlaWdodCwgc3RvcE9uQ29sbGlzaW9uLCBoYXNDb2xsaXNpb25FdmVudCwgbmFtZSk7XHJcbiAgICBcclxuICAgIHRoaXMudGVsZXBvcnRQcm9wcyA9IHRlbGVwb3J0UHJvcHM7XHJcblxyXG4gICAgdGhpcy54SW5kZXggPSB4SW5kZXg7XHJcbiAgICB0aGlzLnlJbmRleCA9IHlJbmRleDtcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlc1xyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMCwgY2xpcF95OiAwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihwbGF5ZXIsIGNvbGxpZGFibGUsIGNvbGxpc2lvbkRpcmVjdGlvbil7XHJcbiAgICB0aGlzLnRlbGVwb3J0KCBwbGF5ZXIgKTtcclxuICAgIC8vIENoYW5nZSBzdGFnZVxyXG4gICAgY29sbGlkYWJsZS5zY2VuYXJpby5zZXRTdGFnZSggXHJcbiAgICAgIHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRTdGFnZSxcclxuICAgICAgZmFsc2UgLy8gZmlyc3RTdGFnZSA/XHJcbiAgICApO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyBXaGF0IGtpbmQgb2YgdGVsZXBvcnQ/XHJcbiAgdGVsZXBvcnQoIHBsYXllciApIHtcclxuXHJcbiAgICBsZXQgZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgbGV0IHR5cGUgPSB0aGlzLnRlbGVwb3J0UHJvcHMudGVsZXBvcnRUeXBlO1xyXG4gICAgbGV0IHRhcmdldFggPSAwO1xyXG4gICAgbGV0IHRhcmdldFkgPSAwO1xyXG5cclxuICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0YXJnZXRYID0gdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFg7XHJcbiAgICAgICAgdGFyZ2V0WSA9IHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRZO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwicmVsYXRpdmVcIjpcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudGVsZXBvcnRQcm9wcy5jYW1lRnJvbSkge1xyXG4gICAgICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgICAgIC8vIGlmKCBwbGF5ZXIuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICE9IFwidXBcIiApeyByZXR1cm47IH0gLy8gSWYgaXMgbG9va2luZyBmcm9tIHRoZSBvcHBvc2l0ZSBkaXJlY3Rpb24sIGl0IG1lYW5zIHRoYXQgaXQganVzdCBjYW1lIGZyb20gYSB0ZWxlcG9ydFxyXG4gICAgICAgICAgICB0YXJnZXRYID0gdGhpcy54SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggKGdhbWVQcm9wcy5nZXRQcm9wKCdzY3JlZW5WZXJ0aWNhbENodW5rcycpIC0yKSAqIHRoaXMuY2h1bmtTaXplKSAtIHRoaXMuY2h1bmtTaXplOyAvLyAtMSBiZWNhdXNlIG9mIHRoZSBwbGF5ZXIgY29sbGlzaW9uIGJveFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICAgICAvLyBpZiggcGxheWVyLnNwcml0ZVByb3BzLmRpcmVjdGlvbiAhPSBcImRvd25cIiApeyByZXR1cm47IH1cclxuICAgICAgICAgICAgdGFyZ2V0WCA9IHRoaXMueEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAxICogdGhpcy5jaHVua1NpemU7IC8vIFRoaXMgMSBpcyBqdXN0IHRvIHJlbWViZXIgdGhhdCBpdCB3aWxsIGJlIHRlbGVwb3J0ZWQgdG8gaW5kZXggWHgxIGFuZCBub3QgWHgwXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIHRoaXMueUluZGV4ICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFggPSAxICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggdGhpcy55SW5kZXggKiB0aGlzLmNodW5rU2l6ZSkgLSB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WCA9ICggKCBnYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuSG9yaXpvbnRhbENodW5rcycpIC0xICkgICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7IFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheWVyLnNldFgoIHRhcmdldFggKTsgLy8gYWx3YXlzIHVzaW5nIFggYW5kIFkgcmVsYXRpdmUgdG8gdGVsZXBvcnQgbm90IHBsYXllciBiZWNhdXNlIGl0IGZpeCB0aGUgcGxheWVyIHBvc2l0aW9uIHRvIGZpdCBpbnNpZGUgZGVzdGluYXRpb24gc3F1YXJlLlxyXG4gICAgcGxheWVyLnNldFkoIHRhcmdldFkgKTtcclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coJ3RlbGVwb3J0ZWQnKTtcclxuICAgIGNvbnNvbGUubG9nKHBsYXllci5zcHJpdGVQcm9wcy5kaXJlY3Rpb24sIHRoaXMudGVsZXBvcnRQcm9wcyk7XHJcbiAgICBcclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRlbGVwb3J0OyIsImNsYXNzIF9Db2xsaWRhYmxlIHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUsIHN0YWdlU3ByaXRlLCBzcHJpdGVXaWR0aCwgc3ByaXRlSGVpZ2h0LCBzdG9wT25Db2xsaXNpb24sIGhhc0NvbGxpc2lvbkV2ZW50LCBuYW1lKSB7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDA7XHJcbiAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBjaHVua1NpemU7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2h1bmtTaXplO1xyXG5cclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG5cclxuICAgIHRoaXMuc3RvcE9uQ29sbGlzaW9uID0gc3RvcE9uQ29sbGlzaW9uO1xyXG4gICAgdGhpcy5oYXNDb2xsaXNpb25FdmVudCA9IGhhc0NvbGxpc2lvbkV2ZW50O1xyXG5cclxuICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgIFxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3RhZ2VTcHJpdGUgPSBzdGFnZVNwcml0ZTtcclxuXHJcbiAgICB0aGlzLnNwcml0ZVdpZHRoID0gc3ByaXRlV2lkdGg7ICAgXHJcbiAgICB0aGlzLnNwcml0ZUhlaWdodCA9IHNwcml0ZUhlaWdodDsgXHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5ydW4oIHR5cGUgKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyAjIFNldHNcclxuICAgIFxyXG4gIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgc2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuICAgIFxyXG4gIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgLy8gISBNdXN0IGhhdmUgaW4gY2hpbGRzIENsYXNzXHJcbiAgfVxyXG5cdFx0XHRcclxuXHQvLyAjIEdldHNcclxuXHRcdFx0XHJcbiAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG4gIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICBcclxuICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cclxuICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLnk7IH1cclxuXHJcbiAgZ2V0Q2VudGVyWCgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpOyB9XHJcbiAgZ2V0Q2VudGVyWSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKTsgfVxyXG5cdFx0XHJcblx0Ly8gIyBSZW5kZXJcclxuICByZW5kZXIoY3R4KSB7XHJcbiAgICAgIFxyXG4gICAgbGV0IHByb3BzID0ge1xyXG4gICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgfSBcclxuICAgIGxldCBzcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlUHJvcHM7XHJcbiAgICBcclxuICAgIGlmKCB0aGlzLnN0YWdlU3ByaXRlICkgeyAvLyBPbmx5IHJlbmRlciB0ZXh0dXJlIGlmIGhhdmUgaXQgc2V0XHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnN0YWdlU3ByaXRlLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgICBcclxuICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuc3RvcE9uQ29sbGlzaW9uID8gXCJyZ2JhKDI1NSwwLDAsMC4yKVwiIDogXCJyZ2JhKDAsMjU1LDAsMC4yKVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QocHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaCk7XHJcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjIpXCI7XHJcbiAgICAgIGN0eC5saW5lV2lkdGggICA9IDU7XHJcbiAgICAgIGN0eC5zdHJva2VSZWN0KHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1xyXG4gICAgfVxyXG4gIFxyXG4gIH1cclxuICAgIFxyXG4gIC8vIEhhcyBhIGNvbGxpc2lvbiBFdmVudD9cclxuICB0cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgeyByZXR1cm4gdGhpcy5oYXNDb2xsaXNpb25FdmVudDsgfVxyXG5cclxuICAvLyBXaWxsIGl0IFN0b3AgdGhlIG90aGVyIG9iamVjdCBpZiBjb2xsaWRlcz9cclxuICBzdG9wSWZDb2xsaXNpb24oKSB7IHJldHVybiB0aGlzLnN0b3BPbkNvbGxpc2lvbjsgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gTm8gQ29sbGlzaW9uIEV2ZW50XHJcbiAgbm9Db2xsaXNpb24ob2JqZWN0KXsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgLy8gUnVucyB3aGVuIENsYXNzIHN0YXJ0cyAgXHJcbiAgcnVuKCB0eXBlICkge1xyXG4gICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX0NvbGxpZGFibGU7IiwiY2xhc3MgX1NjZW5hcmlvIHtcclxuXHJcblx0Y29uc3RydWN0b3IoY3R4LCBjYW52YXMsIGdhbWVQcm9wcyl7XHJcblx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHRcdHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLnJlbmRlckxheWVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdFxyXG5cdFx0dGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICAgIFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFggPSAwOyBcclxuICAgIHRoaXMucGxheWVyU3RhcnRZID0gMDsgXHJcblxyXG4gICAgdGhpcy5zdGFnZSA9IDA7XHJcblxyXG5cdFx0dGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcblx0fVxyXG5cclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkUmVuZGVySXRlbShpdGVtKXtcclxuXHRcdHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblx0YWRkUmVuZGVyTGF5ZXJJdGVtKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJMYXllckl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gIFxyXG5cdC8vICMgR2V0c1xyXG5cdGdldEN0eCgpIHsgcmV0dXJuIHRoaXMuY3R4OyB9XHJcblx0Z2V0Q2FudmFzKCkgeyByZXR1cm4gdGhpcy5jYW52YXM7IH1cdFxyXG5cdFx0XHRcdFxyXG5cdGdldFJlbmRlckl0ZW1zKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG5cdGdldExheWVySXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllclN0YXJ0WTsgfVxyXG5cclxuICAvLyAjIFNldHNcclxuICBzZXRQbGF5ZXJTdGFydFgoeCkgeyB0aGlzLnBsYXllclN0YXJ0WCA9IHg7IH1cclxuICBzZXRQbGF5ZXJTdGFydFkoeSkgeyB0aGlzLnBsYXllclN0YXJ0WSA9IHk7IH1cclxuXHJcbiAgcmVuZGVyKCkgeyB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TY2VuYXJpbzsiLCJjbGFzcyBfU3RhZ2Uge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIEdldHNcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgIHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0TGF5ZXJJdGVtcygpIHsgIHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBcclxuICBnZXRQbGF5ZXJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllclN0YXJ0WDsgfVxyXG4gIGdldFBsYXllclN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyU3RhcnRZOyB9XHJcbiAgXHJcbiAgLy8gIyBTZXRzXHJcbiAgc2V0UGxheWVyU3RhcnRYKHgpIHsgdGhpcy5wbGF5ZXJTdGFydFggPSB4OyB9XHJcbiAgc2V0UGxheWVyU3RhcnRZKHkpIHsgdGhpcy5wbGF5ZXJTdGFydFkgPSB5OyB9XHJcbiAgXHJcbiAgLy8gIyBBZGQgSXRlbXMgdG8gdGhlIHJlbmRlclxyXG5cdGFkZFJlbmRlckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cdGFkZFJlbmRlckxheWVySXRlbShpdGVtKXtcclxuXHRcdHRoaXMucmVuZGVyTGF5ZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICBcclxuICBydW4gKCkgeyB9XHJcblxyXG59IC8vIGNsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gX1N0YWdlOyIsIi8vIE9ic3RhY2xlIGNsYXNzXHJcblxyXG5cdGZ1bmN0aW9uIEVuZW15KGN0eCwgcGxheWVyLCBuYW1lLCB4MCwgeTAsIG1vdlR5cGUsIG1pblgsIG1heFgsIG1pblksIG1heFksIHNwZWVkICkge1xyXG5cdFx0XHJcblx0XHQvLyAtIC0gLSBJbml0IC0gLSAtXHJcblx0XHRcclxuXHRcdFx0Ly8gIyBQb3NpdGlvblxyXG5cdFx0XHRcdHRoaXMueCA9IHgwO1xyXG5cdFx0XHRcdHRoaXMueSA9IHkwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHQvLyAjIFByb3BlcnRpZXNcclxuXHRcdFx0XHR0aGlzLndpZHRoID0gMTA7IC8vcHhcclxuXHRcdFx0XHR0aGlzLmhlaWdodCA9IDUwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiNGMDBcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHRcdFx0XHR0aGlzLnNwZWVkID0gc3BlZWQ7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyAjIE1vdmVtZW50XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92ID0gbW92VHlwZTsgLy9ob3IsIHZlciA8LSBtb3ZlbWVudCB0eXBlcyB0aGF0IHRoZSBlbmVteSBjYW4gZG9cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1pblggPSBtaW5YO1xyXG5cdFx0XHRcdHRoaXMubWluWSA9IG1pblk7XHJcblx0XHRcdFx0dGhpcy5tYXhYID0gbWF4WDtcclxuXHRcdFx0XHR0aGlzLm1heFkgPSBtYXhZO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92WCA9IDE7XHJcblx0XHRcdFx0dGhpcy5tb3ZZID0gMTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmVuZW15ID0gbmV3IE9iamVjdDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkud2lkdGggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcblx0XHRcdC8vICMgVGV4dHVyZVxyXG5cdFx0XHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cclxuXHRcdFx0XHR0aGlzLm9iakNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oIDAgLCAwLCB0aGlzLnBsYXllciApO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gLSAtIC0gU2V0cyAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdHRoaXMuc2V0WSA9ICBmdW5jdGlvbiAoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdHRoaXMuc2V0V2lkdGggPSAgZnVuY3Rpb24gKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdHRoaXMuc2V0TmFtZSA9ICBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblx0XHJcblx0XHQvLyAtIC0gLSBHZXRzIC0gLSAtXHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFggPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcblx0XHRcdHRoaXMuZ2V0WSA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0V2lkdGggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuXHRcdFx0dGhpcy5nZXRIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldENvbG9yID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblxyXG5cclxuXHRcdC8vIC0gLSAtIE1vdmVtZW50ICAtIC0gLVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92SG9yID0gZnVuY3Rpb24gKG1vZCkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoIHRoaXMubW92WCA9PSAxICkgey8vIGdvIFJpZ2h0XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLnggPSB0aGlzLnggKyB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueCA+PSB0aGlzLm1heFggKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WCA9IDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0aGlzLnggPSB0aGlzLnggLSB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueCA8IHRoaXMubWluWCApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZYID0gMTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fVx0XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdlZlciA9IGZ1bmN0aW9uIChtb2QpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1vdlkgPT0gMSApIHtcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMueSA9IHRoaXMueSArIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy55ID49IHRoaXMubWF4WSApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZZID0gMDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMueSA9IHRoaXMueSAtIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy55IDwgdGhpcy5taW5ZIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlkgPSAxO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblxyXG5cdFx0Ly8gLSAtIC0gUmVuZGVyIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjb250ZXh0LCBtb2QpIHsgXHJcblxyXG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLm1vdikge1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y2FzZSBcImhvclwiOlxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92SG9yKG1vZCk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRjYXNlIFwidmVyXCI6XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZWZXIobW9kKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHQvLyBDaGVjayBpZiBjb2xsaWRlcyB3aXRoIHBsYXllclxyXG5cclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkueCA9IHRoaXMueDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkueSA9IHRoaXMueTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIHRoaXMub2JqQ29sbGlzaW9uLmNoZWNrUGxheWVyQ29sbGlzaW9uKHRoaXMuZW5lbXkpID09IHRydWUgKSBcclxuXHRcdFx0XHRcdFx0dGhpcy5jb2xsaXNpb24odGhpcy5wbGF5ZXIpO1xyXG5cdFx0XHRcdFx0XHJcblxyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHRcdFx0XHRjb250ZXh0LmZpbGxSZWN0KCB0aGlzLmdldFgoKSwgdGhpcy5nZXRZKCksIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKSApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jb2xsaXNpb24gPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRvYmplY3Quc2V0Q29sb3IoXCIjMzMzXCIpO1xyXG5cdFx0XHRcdG9iamVjdC5yZXNldFBvc2l0aW9uKCk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9jbGFzcyIsIi8vIENsYXNzIHRoYXQgZGV0ZWN0cyBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIG90aGVyIG9iamVjdHNcclxuY2xhc3MgQ29sbGlzaW9uIHtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2NlbmFyaW9XaWR0aCwgc2NlbmFyaW9IZWlnaHQsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpOyAvLyBJdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcbiAgICB0aGlzLnNjZW5hcmlvV2lkdGggPSBzY2VuYXJpb1dpZHRoO1xyXG4gICAgdGhpcy5zY2VuYXJpb0hlaWdodCA9IHNjZW5hcmlvSGVpZ2h0O1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgfVxyXG5cdFx0XHRcclxuICAvLyAjIENoZWNrIGlmIHRoZSBvYmplY3QgY29sbGlkZXMgd2l0aCBhbnkgb2JqZWN0IGluIHZlY3RvclxyXG4gIC8vIEFsZ29yaXRobSByZWZlcmVuY2U6IEd1c3Rhdm8gU2lsdmVpcmEgLSBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PXM3cWlXTEJCcEp3XHJcbiAgY2hlY2sob2JqZWN0KSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIxID0gb2JqZWN0O1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICB0aGlzLmNoZWNrQ29sbGlzaW9uKHIxLCByMik7XHJcbiAgICB9IFxyXG4gIH1cclxuXHJcbiAgLy8gQHIxOiB0aGUgbW92aW5nIG9iamVjdFxyXG4gIC8vIEByMjogdGhlIFwid2FsbFwiXHJcbiAgY2hlY2tDb2xsaXNpb24ocjEsIHIyKSB7XHJcbiAgICBcclxuICAgIC8vIE9ubHkgY2hlY2tzIG9iamVjdHMgdGhhdCBuZWVkcyB0byBiZSBjaGVja2VkXHJcbiAgICBpZiggISByMi50cmlnZ2Vyc0NvbGxpc2lvbkV2ZW50KCkgJiYgISByMi5zdG9wSWZDb2xsaXNpb24oKSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgIHZhciBjYXRYID0gcjEuZ2V0Q2VudGVyWCgpIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgdmFyIGNhdFkgPSByMS5nZXRDZW50ZXJZKCkgLSByMi5nZXRDZW50ZXJZKCk7XHJcblxyXG4gICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggcjEuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCByMS5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgICBcclxuICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgb3ZlcmxhcFggPSBzdW1IYWxmV2lkdGggLSBNYXRoLmFicyhjYXRYKTtcclxuICAgICAgdmFyIG92ZXJsYXBZID0gc3VtSGFsZkhlaWdodCAtIE1hdGguYWJzKGNhdFkpO1xyXG4gICAgICB2YXIgY29sbGlzaW9uRGlyZWN0aW9uID0gZmFsc2U7XHJcblxyXG4gICAgICBpZiggcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7XHJcbiAgICAgICAgaWYob3ZlcmxhcFggPj0gb3ZlcmxhcFkgKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgY29sbGlzaW9uRGlyZWN0aW9uID0gXCJ1cFwiO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpIC0gb3ZlcmxhcFkgKTtcclxuICAgICAgICAgICAgY29sbGlzaW9uRGlyZWN0aW9uID0gXCJkb3duXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwibGVmdFwiO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WCggcjEuZ2V0WCgpIC0gb3ZlcmxhcFggKTtcclxuICAgICAgICAgICAgY29sbGlzaW9uRGlyZWN0aW9uID0gXCJyaWdodFwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc29sZS5sb2cocjEsIHIyKTtcclxuXHJcbiAgICAgIC8vIFRyaWdnZXJzIENvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5jb2xsaXNpb24ocjIsIHIxLCBjb2xsaXNpb25EaXJlY3Rpb24pO1xyXG4gICAgICByMi5jb2xsaXNpb24ocjEsIHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyaWdnZXJzIG5vdCBpbiBjb2xsaXNpb24gZXZlbnRcclxuICAgICAgcjEubm9Db2xsaXNpb24ocjIsIHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pOyBcclxuICAgICAgcjIubm9Db2xsaXNpb24ocjEsIHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pOyBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFx0XHRcclxuXHQvLyBBZGQgaXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG5cdGFkZEl0ZW0ob2JqZWN0KSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0KTtcclxuICB9O1xyXG4gIFxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xlYXJBcnJheUl0ZW1zKCkge1xyXG4gICAgdGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY2xhc3MgUmVuZGVyIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHBsYXllcikge1xyXG4gICAgdGhpcy5jdHggPSBjdHg7IFxyXG4gICAgdGhpcy5zY2VuYXJpbyA9IFwiXCI7XHJcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgICAgICAgICAgIFxyXG4gIC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcbiAgYWRkSXRlbShvYmplY3Qpe1xyXG4gICAgdGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcbiAgfVxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG4gICAgZm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgY2xlYXJBcnJheUl0ZW1zKCl7IFxyXG4gICAgdGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuICB9XHJcbiAgc2V0U2NlbmFyaW8oc2NlbmFyaW8pe1xyXG4gICAgdGhpcy5zY2VuYXJpbyA9IHNjZW5hcmlvO1xyXG4gIH1cclxuICAgICAgICAgICAgXHJcbiAgLy8gVGhpcyBmdW5jdGlvbnMgd2lsbCBiZSBjYWxsZWQgY29uc3RhbnRseSB0byByZW5kZXIgaXRlbXNcclxuICBzdGFydChkZWx0YVRpbWUpIHtcdFx0XHJcbiAgICAgICAgICAgICAgICBcclxuICAgIC8vIENsZWFyIGNhbnZhcyBiZWZvcmUgcmVuZGVyIGFnYWluXHJcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICB0aGlzLmN0eC5zaGFkb3dCbHVyID0gMDtcclxuXHJcbiAgICAvLyBTY2VuYXJpb1xyXG4gICAgaWYgKCB0aGlzLnNjZW5hcmlvICE9IFwiXCIpIFxyXG4gICAgICB0aGlzLnNjZW5hcmlvLnJlbmRlcih0aGlzLmN0eCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgIC8vIFJlbmRlciBpdGVtc1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLnJlbmRlckl0ZW1zKSB7XHJcbiAgICAgIC8vIEV4ZWN1dGUgdGhlIHJlbmRlciBmdW5jdGlvbiAtIEluY2x1ZGUgdGhpcyBmdW5jdGlvbiBvbiBldmVyeSBjbGFzcyFcclxuICAgICAgdGhpcy5yZW5kZXJJdGVtc1tpXS5yZW5kZXIodGhpcy5jdHgsIGRlbHRhVGltZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICB9XHJcbiAgICBcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXIiLCJjb25zdCBnYW1lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4vZ2FtZVByb3BlcnRpZXMnKTtcclxuY29uc3Qgc2NlbmFyaW9Qcm90b3R5cGUgPSByZXF1aXJlKCcuL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc2NlbmFyaW9Qcm90b3R5cGUnKTtcclxuY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi9hc3NldHMvcGxheWVyJyk7XHJcbmNvbnN0IENvbGxpc2lvbiA9IHJlcXVpcmUoJy4vZW5naW5lL2NvbGxpc2lvbicpO1xyXG5jb25zdCBSZW5kZXIgPSByZXF1aXJlKCcuL2VuZ2luZS9yZW5kZXInKTtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgLy8gIyBJbml0XHJcblxyXG4gICAgdmFyIGZwc0ludGVydmFsLCBub3csIGRlbHRhVGltZSwgZWxhcHNlZDtcclxuICAgIHZhciBnYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuXHJcbiAgICB2YXIgY2FudmFzU3RhdGljID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19zdGF0aWMnKTtcclxuICAgIHZhciBjb250ZXh0U3RhdGljID0gY2FudmFzU3RhdGljLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgdmFyIGNhbnZhc0FuaW1hdGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19hbmltYXRlZCcpO1xyXG4gICAgdmFyIGNvbnRleHRBbmltYXRlZCA9IGNhbnZhc0FuaW1hdGVkLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgY2FudmFzQW5pbWF0ZWQud2lkdGggPSBjYW52YXNTdGF0aWMud2lkdGggPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzV2lkdGgnKTtcclxuICAgIGNhbnZhc0FuaW1hdGVkLmhlaWdodCA9IGNhbnZhc1N0YXRpYy5oZWlnaHQgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzSGVpZ2h0Jyk7XHJcblxyXG4gIC8vICMgU2NlbmFyaW9cclxuXHJcbiAgICAgdmFyIHNjZW5hcmlvID0gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgZ2FtZVByb3BzICk7XHJcblxyXG4gIC8vICMgUGxheWVyc1xyXG5cclxuICAgIHZhciBwbGF5ZXIgPSBuZXcgUGxheWVyKCBzY2VuYXJpby5nZXRQbGF5ZXJTdGFydFgoKSwgc2NlbmFyaW8uZ2V0UGxheWVyU3RhcnRZKCksIGdhbWVQcm9wcywgY29udGV4dEFuaW1hdGVkICk7IC8vcG9zacOnw6NvIHggZSB5XHJcblxyXG4gIC8vICMgQ29sbGlzaW9uIGRldGVjdGlvbiBjbGFzc1xyXG5cclxuICAgIHZhciBjb2xsaXNpb24gPSBuZXcgQ29sbGlzaW9uKGNhbnZhc0FuaW1hdGVkLndpZHRoLCBjYW52YXNBbmltYXRlZC5oZWlnaHQgKTtcclxuXHJcbiAgLy8gIyBSZW5kZXJcclxuXHJcbiAgICB2YXIgcmVuZGVyU3RhdGljID0gbmV3IFJlbmRlcihjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMpOyAvLyBSZW5kZXIgZXhlY3V0ZWQgb25seSBvbmNlXHJcbiAgICB2YXIgcmVuZGVyQW5pbWF0ZWQgPSBuZXcgUmVuZGVyKGNvbnRleHRBbmltYXRlZCwgY2FudmFzQW5pbWF0ZWQpOyAvL1JlbmRlciB3aXRoIGFuaW1hdGVkIG9iamVjdHMgb25seVxyXG5cclxuICAgIC8vIEFkZCBpdGVtcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgIHJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyhzY2VuYXJpbyk7IC8vIHNldCB0aGUgc2NlbmFyaW9cclxuICAgIFxyXG4gIC8vICMgS2V5Ym9hcmQgRXZlbnRzXHJcblxyXG4gICAgdmFyIGtleXNEb3duID0ge307XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAga2V5c0Rvd25bZS5rZXlDb2RlXSA9IHRydWU7XHJcbiAgICB9KTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgZGVsZXRlIGtleXNEb3duW2Uua2V5Q29kZV07XHJcbiAgICAgIHBsYXllci5yZXNldFN0ZXAoKTtcclxuICAgIH0pO1xyXG4gIFxyXG4gIC8vIFVucGF1c2UgdGhlIGdhbWUgd2hlbiBjbGljayBvbiBzY3JlZW5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYoIGUua2V5Q29kZSA9PSAxMyApIHsgLy8gRW50ZXJcclxuICAgICAgICB3aW5kb3cudG9nZ2xlUGF1c2UoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gIC8vICMgVGhlIEdhbWUgTG9vcFxyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUdhbWUoZGVsdGFUaW1lKSB7XHJcblxyXG4gICAgICBpZiggd2luZG93LmlzUGF1c2VkKCkgKSByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgICByZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gU3RhdGljIGNhbiBhbHNvIGNoYW5nZSwgYmVjYXVzZSBpdCBpcyB0aGUgc2NlbmFyaW8uLi4gbWF5YmUgd2lsbCBjaGFuZ2UgdGhpcyBuYW1lcyB0byBsYXllcnNcclxuICAgICAgcmVuZGVyQW5pbWF0ZWQuc3RhcnQoIGRlbHRhVGltZSApO1xyXG5cclxuICAgICAgLy8gIyBBZGQgdGhlIG9iamVjdHMgdG8gdGhlIGNvbGxpc2lvbiB2ZWN0b3JcclxuICAgICAgY29sbGlzaW9uLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICBjb2xsaXNpb24uYWRkQXJyYXlJdGVtKCBzY2VuYXJpby5nZXRSZW5kZXJJdGVtcygpICk7XHJcbiAgICAgIGNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHNjZW5hcmlvLmdldExheWVySXRlbXMoKSApO1xyXG4gICAgICBcclxuICAgICAgcmVuZGVyU3RhdGljLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICByZW5kZXJTdGF0aWMuYWRkQXJyYXlJdGVtKHNjZW5hcmlvLmdldFJlbmRlckl0ZW1zKCkpOyAvLyBHZXQgYWxsIGl0ZW1zIGZyb20gdGhlIHNjZW5hcmlvIHRoYXQgbmVlZHMgdG8gYmUgcmVuZGVyZWRcclxuXHJcbiAgICAgIHJlbmRlckFuaW1hdGVkLmNsZWFyQXJyYXlJdGVtcygpO1xyXG4gICAgICByZW5kZXJBbmltYXRlZC5hZGRJdGVtKCBwbGF5ZXIgKTsgLy8gQWRkcyB0aGUgcGxheWVyIHRvIHRoZSBhbmltYXRpb24gcmVuZGVyXHJcbiAgICAgIHJlbmRlckFuaW1hdGVkLmFkZEFycmF5SXRlbSggc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtcygpICk7IC8vIEdldCBhbGwgYW5pbWF0ZWQgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgICAgLy8gIyBNb3ZlbWVudHNcclxuICAgICAgcGxheWVyLmhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApO1xyXG5cclxuICAgICAgLy8gIyBDaGVjayBpZiBwbGF5ZXIgaXMgY29sbGlkaW5nXHJcbiAgICAgIGNvbGxpc2lvbi5jaGVjayhwbGF5ZXIpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gIyBcIlRocmVhZFwiIHRoYSBydW5zIHRoZSBnYW1lXHJcbiAgICBmdW5jdGlvbiBydW5HYW1lKGZwcykge1xyXG4gICAgICBmcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcbiAgICAgIGRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHN0YXJ0VGltZSA9IGRlbHRhVGltZTtcclxuICAgICAgZ2FtZUxvb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnYW1lTG9vcCgpIHtcclxuXHJcbiAgICAgIC8vIGNhbGMgZWxhcHNlZCB0aW1lIHNpbmNlIGxhc3QgbG9vcFxyXG4gICAgICBub3cgPSBEYXRlLm5vdygpO1xyXG4gICAgICBlbGFwc2VkID0gbm93IC0gZGVsdGFUaW1lO1xyXG5cclxuICAgICAgLy8gaWYgZW5vdWdoIHRpbWUgaGFzIGVsYXBzZWQsIGRyYXcgdGhlIG5leHQgZnJhbWVcclxuICAgICAgaWYgKGVsYXBzZWQgPiBmcHNJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICAvLyBHZXQgcmVhZHkgZm9yIG5leHQgZnJhbWUgYnkgc2V0dGluZyB0aGVuPW5vdywgYnV0IGFsc28gYWRqdXN0IGZvciB5b3VyXHJcbiAgICAgICAgLy8gc3BlY2lmaWVkIGZwc0ludGVydmFsIG5vdCBiZWluZyBhIG11bHRpcGxlIG9mIFJBRidzIGludGVydmFsICgxNi43bXMpXHJcbiAgICAgICAgZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSBmcHNJbnRlcnZhbCk7XHJcblxyXG4gICAgICAgIHVwZGF0ZUdhbWUoIGRlbHRhVGltZSApO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUnVucyBvbmx5IHdoZW4gdGhlIGJyb3dzZXIgaXMgaW4gZm9jdXNcclxuICAgICAgLy8gUmVxdWVzdCBhbm90aGVyIGZyYW1lXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAvLyAjIFN0YXJ0cyB0aGUgZ2FtZVxyXG4gICAgcnVuR2FtZSggZ2FtZVByb3BzLmdldFByb3AoJ2ZwcycpICk7XHQvLyBHTyBHTyBHT1xyXG5cclxufSIsIi8vIEdhbWUgUHJvcGVydGllcyBjbGFzcyB0byBkZWZpbmUgY29uZmlndXJhdGlvbnNcclxuY2xhc3MgZ2FtZVByb3BlcnRpZXMge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIFxyXG4gICAgLy8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICBcclxuICAgIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyA9IDE2O1xyXG4gICAgdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyA9IDE0O1xyXG4gICAgXHJcbiAgICB0aGlzLmNhbnZhc1dpZHRoID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5Ib3Jpem9udGFsQ2h1bmtzKTtcclxuICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gKHRoaXMuY2h1bmtTaXplICogdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyk7Ly8gQ2FudmFzIHNpemUgYmFzZWQgb24gXCJjaHVua3NcIiBcclxuICAgIFxyXG4gICAgdGhpcy5mcHMgPSAyNDtcclxuICB9XHJcblxyXG4gIGdldFByb3AocHJvcCkge1xyXG4gICAgcmV0dXJuIHRoaXNbcHJvcF07XHJcbiAgfVxyXG5cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IGdhbWVQcm9wZXJ0aWVzXHJcblxyXG4vLyBHbG9iYWwgdmFsdWVzXHJcblxyXG4gIC8vIERlYnVnXHJcbiAgd2luZG93LmRlYnVnID0gZmFsc2U7XHJcbiAgd2luZG93Ll9wYXVzZSA9IGZhbHNlO1xyXG4gIHdpbmRvdy5pc1BhdXNlZCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gX3BhdXNlOyB9XHJcbiAgd2luZG93LnBhdXNlID0gZnVuY3Rpb24oKSB7IHdpbmRvdy5fcGF1c2UgPSB0cnVlOyBjb25zb2xlLmxvZygnR2FtZSBQYXVzZWQhJyk7IH1cclxuICB3aW5kb3cudW5wYXVzZSA9IGZ1bmN0aW9uKCkgeyB3aW5kb3cuX3BhdXNlID0gZmFsc2U7IGNvbnNvbGUubG9nKCdHYW1lIFVucGF1c2VkIScpOyB9XHJcbiAgd2luZG93LnRvZ2dsZVBhdXNlID0gZnVuY3Rpb24oKSB7IFxyXG4gICAgaWYoIHdpbmRvdy5fcGF1c2UgKSB7XHJcbiAgICAgIHdpbmRvdy51bnBhdXNlKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aW5kb3cucGF1c2UoKTtcclxuICAgIH1cclxuICB9Il19
