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
	setStage(stage_number) {

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
		console.log("setStage: ", stage_number);
		this.loadStage();
	}
	
	// Functions to load selected stage
	loadStage() {
            
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
    
    this.setPlayerStartX( this.stage.getPlayerStartX() );
    this.setPlayerStartY( this.stage.getPlayerStartY() );

		console.log("Stage loaded!");
	}

	// # Run when class loads
	run() {
		
		// Set Default Stage
		this.setStage(1); 
				
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

module.exports = Prototype_Stage_1




/*
    // # Textures
	
					this.bgImage = new Image();
					this.bgImage.src = './assets/scenario/welcome/img/background.jpg';
					
					this.background = this.ctx.createPattern(this.bgImage, 'repeat');
                    this.background = "#333";
                    
    // # Obstacles
					
					// Scenario Borders
					this.addRenderItem( new Wall(ctx, "wallTop", 0, 0, this.width, this.chunkSize) ); //context, name, x0, y0, w, h,
					this.addRenderItem( new Wall(ctx, "wallBottom", 0, this.height - this.chunkSize, this.width, this.chunkSize) );
					this.addRenderItem( new Wall(ctx, "wallLeft", 0, 0, this.chunkSize, this.height) );
					this.addRenderItem( new Wall(ctx, "wallRight", this.width-this.chunkSize, 0, this.chunkSize, this.height) );
						
					// Walls
					/*
					this.addRenderItem( new Wall(ctx, "wall01", 20, 73, 405, 40) );
					this.addRenderItem( new Wall(ctx, "wall02", 90, 190, 80, 80) );
					this.addRenderItem( new Wall(ctx, "wall03", 503, 19, 40, 465) );
					this.addRenderItem( new Wall(ctx, "wall04", 283, 481, 440, 40) );
					this.addRenderItem( new Wall(ctx, "wall05", 244, 292, 40, 229) );
					this.addRenderItem( new Wall(ctx, "wall06", 283, 367, 139, 40) );
					this.addRenderItem( new Wall(ctx, "wall07", 78, 403, 169, 40) );
					this.addRenderItem( new Wall(ctx, "wall08", 536, 189, 79, 40) );
					this.addRenderItem( new Wall(ctx, "wall09", 669, 77, 40, 288) );
					this.addRenderItem( new Wall(ctx, "wall10", 669, 365, 112, 40) );	
					this.addRenderItem( new Wall(ctx, "wall11", 604, 77, 67, 40) );	
					this.addRenderItem( new Wall(ctx, "wall11", 318, 172, 93, 95) );
					this.addRenderItem( new Wall(ctx, "wall11", 82, 510, 75, 74) );	
					*/
					
					// Scenario random obstacles
					
						//Power
							
							// Possibles x, y, w, h for Power
								/*
							var aPower = Array();
									aPower.push( { x: 137, y: 20, w: 167, h: 53 });
									aPower.push( { x: 422, y: 368, w: 80, h: 38 }); 
									aPower.push( { x: 543, y: 406, w: 236, h: 75 }); 
									
							var rPower = Math.floor(Math.random() * 3) + 0;		
							
							this.addRenderItem( new Power(ctx, "power01", aPower[rPower].x, aPower[rPower].y, aPower[rPower].w, aPower[rPower].h) );	
					
					// Water
					//this.addRenderItem( new Water(ctx, "power01", 300, 521, 190, 59) );

					// Exit
					//this.addRenderItemAnimated( new Exit(ctx, "exit", 50, 30, 10, 10) );
					
					// Enemies
						//ctx, colisao, name, x0, y0, tipoMov, minX, maxX, minY, maxY, speed 					
					//this.addRenderItemAnimated( new Enemy(ctx, this.player, "enemy01", 150, 340, 'hor', 25, 230, 0, 0, 0.05) ); 			
			
				
		   
*/
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
    
    // Change stage
    collidable.scenario.setStage( this.teleportProps.targetStage );

    // Teleport the player
    this.teleport( player );

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
            targetX = this.xIndex * this.chunkSize;
            targetY = ((gameProps.getProp('screenVerticalChunks') - 2) * this.chunkSize ) - this.chunkSize; // -2 on X is the square before the last. Why? Why Y you have to use -1 only?
            break;
          case "bottom":
            targetX = this.xIndex * this.chunkSize;
            targetY = 1 * this.chunkSize; // This 1 is just to remeber that it will be teleported to index Xx1 and not Xx0
            break;
          case "right":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = 1 * this.chunkSize;
            break;
          case "left":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = ((gameProps.getProp('screenHorizontalChunks') - 1) * this.chunkSize) - this.chunkSize; // -1 because it will spawn not in last square, but the one before it. 
            break;
        }
        break;
    }

    player.setX( targetX ); // always using X and Y relative to teleport not player because it fix the player position to fit inside destination square.
    player.setY( targetY );
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

    this.stage = [];

		this.chunkSize = gameProps.getProp('chunkSize');

		this.run();
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

	// # Run when class loads
	run() { }

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
	start(mod) {		
				
		// Clear canvas before render again
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.shadowBlur = 0;

		// Scenario
		if ( this.scenario != "") 
			this.scenario.render(this.ctx);
				
		// Render items
		for (let i in this.renderItems) {
			// Execute the render function - Include this function on every class!
			this.renderItems[i].render(this.ctx, mod);
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


  // # The Game Loop

    function updateGame(mod) {

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

      // Runs only when the browser is in focus
      // Request another frame
      requestAnimationFrame(gameLoop);

      // calc elapsed time since last loop
      now = Date.now();
      elapsed = now - deltaTime;

      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        deltaTime = now - (elapsed % fpsInterval);

        updateGame( deltaTime );

        renderStatic.start( deltaTime );  // Static can also chance, because it is the scenario
        renderAnimated.start( deltaTime );

      }

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
    
    this.fps = 30;
  }

  getProp(prop) {
    return this[prop];
  }

}
module.exports = gameProperties

// Global values

  // Debug
  window.debug = false;
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,15,14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL3BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlXzEuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zdGFnZXMvc3RhZ2VfMi5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX0Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vQmVhY2hfV2FsbC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL1RlbGVwb3J0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX0NvbGxpZGFibGUuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU2NlbmFyaW8uanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9fU3RhZ2UuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9lbmVtX3Byb3RvdHlwZS5qcyIsImNsaWVudC9lbmdpbmUvY29sbGlzaW9uLmpzIiwiY2xpZW50L2VuZ2luZS9yZW5kZXIuanMiLCJjbGllbnQvZ2FtZS5qcyIsImNsaWVudC9nYW1lUHJvcGVydGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY2xhc3MgUGxheWVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoeDAsIHkwLCBnYW1lUHJvcHMpIHtcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICAgIC8vdGhpcy5wbGF5ZXJTcHJpdGUgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgLy90aGlzLnBsYXllclNwcml0ZS5zcmMgPSAnLi9hc3NldHMvc3ByaXRlcy9wbGF5ZXJfb25lLnBuZyc7XHJcbiAgICAgIHRoaXMucGxheWVyU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wbGF5ZXJfb25lJyk7IC8vIFBlZ2FyIGVzc2UgaWQgZGEgaW5zdGFuY2lhISFcclxuICAgICAgXHJcbiAgICAgIC8vIGh0dHA6Ly9nZXRzcHJpdGV4eS5jb20vIDw9IFBhcmEgbWFwZWFyIG9zIHNwcml0ZXMhXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7XHJcbiAgICAgICAgc3ByaXRlX3dpZHRoOiAyMCwgLy8gUGxheWVyIHNpemUgaW5zaWRlIHNwcml0ZVxyXG4gICAgICAgIHNwcml0ZV9oZWlnaHQ6IDQwXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5zdGVwID0gW107XHJcbiAgICAgIHRoaXMuZGVmYXVsdFN0ZXAgPSAxO1xyXG4gICAgICB0aGlzLmluaXRpYWxTdGVwID0gMztcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICB0aGlzLm1heFN0ZXBzID0gODtcclxuXHJcbiAgICAgIC8vIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIEFuaW1hdGlvblxyXG4gICAgICB0aGlzLmZwc0ludGVydmFsID0gMTAwMCAvIDEyOyAvLyAxMDAwIC8gRlBTXHJcbiAgICAgIHRoaXMuZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgICB0aGlzLnggPSB4MDtcclxuICAgICAgdGhpcy55ID0geTA7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLngwID0geDA7IC8vIGluaXRpYWwgcG9zaXRpb25cclxuICAgICAgdGhpcy55MCA9IHkwO1xyXG5cclxuICAgICAgdGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcblxyXG4gICAgICB0aGlzLmxvb2tEaXJlY3Rpb24gPSB0aGlzLmxvb2tEb3duKCk7XHJcblxyXG4gICAgLy8gIyBQcm9wZXJ0aWVzXHJcbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLmNodW5rU2l6ZTsgLy9weFxyXG4gICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2h1bmtTaXplICogMjsgLy9weFxyXG4gICAgICB0aGlzLnNwZWVkMCA9IDY7XHJcbiAgICAgIHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAvIHRoaXMuc3BlZWQwO1xyXG5cclxuICAgICAgdGhpcy5pc0NvbGxpZGFibGUgPSB0cnVlO1xyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNwcml0ZXMgc3RhdGUgZm9yIHBsYXllciBkaXJlY3Rpb25cclxuICAgIFxyXG4gICAgbG9va0Rvd24oKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnZG93bic7XHJcbiAgICAgIFxyXG4gICAgICAvLyBTdGVwc1xyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAyMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogMCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG5cclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1VwKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3VwJztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiA0MCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rUmlnaHQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAncmlnaHQnO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiA4MCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG5cdFx0bG9va0xlZnQoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAnbGVmdCc7XHJcbiAgICAgICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAyMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogMTIwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcblxyXG4gIC8vICMgQ29udHJvbHMgdGhlIHBsYXllciBGUFMgTW92ZW1lbnQgaW5kZXBlbmRlbnQgb2YgZ2FtZSBGUFNcclxuICAgIGNhblJlbmRlck5leHRGcmFtZSgpIHtcclxuICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblx0XHRcdGxldCBlbGFwc2VkID0gbm93IC0gdGhpcy5kZWx0YVRpbWU7XHJcbiAgICAgIGlmIChlbGFwc2VkID4gdGhpcy5mcHNJbnRlcnZhbCkge1xyXG5cdCAgICAgIHRoaXMuZGVsdGFUaW1lID0gbm93IC0gKGVsYXBzZWQgJSB0aGlzLmZwc0ludGVydmFsKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gIFxyXG4gICAgXHJcblx0Ly8gIyBQbGF5ZXIgTW92ZW1lbnRcclxuXHRcdFxyXG5cdFx0bW92TGVmdCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgLSB0aGlzLmdldFNwZWVkKCkpOyBcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92UmlnaHQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92VXAoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSAtIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIH07XHJcblx0XHRcdFxyXG5cdFx0bW92RG93bigpIHsgIFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgfTtcclxuXHJcbiAgICBoYW5kbGVNb3ZlbWVudCgga2V5c0Rvd24gKSB7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoMzcgaW4ga2V5c0Rvd24pIC8vIExlZnRcclxuICAgICAgICB0aGlzLm1vdkxlZnQoKTtcclxuICAgICAgICBcclxuICAgICAgaWYgKDM4IGluIGtleXNEb3duKSAvLyBVcCAgXHJcbiAgICAgICAgdGhpcy5tb3ZVcCgpO1xyXG4gICAgICAgIFxyXG4gICAgICBpZiAoMzkgaW4ga2V5c0Rvd24pIC8vIFJpZ2h0XHJcbiAgICAgICAgdGhpcy5tb3ZSaWdodCgpO1xyXG5cclxuICAgICAgaWYgKDQwIGluIGtleXNEb3duKSAvLyBEb3duXHJcbiAgICAgICAgdGhpcy5tb3ZEb3duKCk7XHJcblxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBTZXRzXHJcblx0XHRcclxuXHRcdHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG5cdFx0XHRcclxuXHRcdHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuXHRcdHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cdFx0XHRcclxuXHRcdHNldFNwZWVkKHNwZWVkKSB7IHRoaXMuc3BlZWQgPSB0aGlzLmNodW5rU2l6ZSAvIHNwZWVkOyB9XHJcblxyXG5cdFx0c2V0TG9va0RpcmVjdGlvbihsb29rRGlyZWN0aW9uKSB7IHRoaXMubG9va0RpcmVjdGlvbiA9IGxvb2tEaXJlY3Rpb247IH1cclxuXHRcdHNldExvb2tEaXJlY3Rpb25WYWwoc3RyaW5nKSB7IHRoaXMubG9va0RpcmVjdGlvblZhciA9IHN0cmluZzsgfVxyXG5cclxuXHRcdHJlc2V0UG9zaXRpb24oKSB7XHJcblx0XHRcdHRoaXMuc2V0WCggdGhpcy54MCApO1xyXG5cdFx0ICB0aGlzLnNldFkoIHRoaXMueTAgKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdC8vICMgR2V0c1xyXG5cdFx0XHRcclxuXHQgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHRcdFx0XHJcblx0ICBnZXRXaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgICAgIFxyXG4gICAgLy9UaGUgY29sbGlzaW9uIHdpbGwgYmUganVzdCBoYWxmIG9mIHRoZSBwbGF5ZXIgaGVpZ2h0XHJcbiAgICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodCAvIDI7IH1cclxuICAgIGdldENvbGxpc2lvbldpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldENvbGxpc2lvblkoKSB7ICByZXR1cm4gdGhpcy55ICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKTsgfVxyXG5cclxuICAgIGdldENlbnRlclgoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKTsgfVxyXG4gICAgZ2V0Q2VudGVyWSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKTsgfVxyXG5cdFx0XHRcclxuXHRcdGdldENvbG9yKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG5cdFx0Z2V0U3BlZWQoKSB7IHJldHVybiB0aGlzLnNwZWVkOyB9XHJcbiAgICAgIFxyXG4gICAgZ2V0U3ByaXRlUHJvcHMoKSB7IHJldHVybiB0aGlzLnNwcml0ZVByb3BzOyB9XHJcbiAgICAgIFxyXG4gICAgaW5jcmVhc2VTdGVwKCkge1xyXG4gICAgICBpZih0aGlzLmNhblJlbmRlck5leHRGcmFtZSgpKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQrKztcclxuICAgICAgICBpZiggdGhpcy5zdGVwQ291bnQgPiB0aGlzLm1heFN0ZXBzICkge1xyXG4gICAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVzZXRTdGVwKCkge1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHN3aXRjaCAoIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uICkge1xyXG4gICAgICAgIGNhc2UgJ2xlZnQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rTGVmdCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdyaWdodCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICd1cCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlICdkb3duJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0Rvd24oKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHRcdFxyXG5cdC8vICMgUGxheWVyIFJlbmRlclxyXG5cdFx0XHRcdFxyXG5cdCAgcmVuZGVyKGN0eCkge1xyXG4gICAgICAgIFxyXG4gICAgICAvLyBXaGF0IHRvIGRvIGV2ZXJ5IGZyYW1lIGluIHRlcm1zIG9mIHJlbmRlcj8gRHJhdyB0aGUgcGxheWVyXHJcbiAgICAgIGxldCBwcm9wcyA9IHtcclxuICAgICAgICB4OiB0aGlzLmdldFgoKSxcclxuICAgICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgICB3OiB0aGlzLmdldFdpZHRoKCksXHJcbiAgICAgICAgaDogdGhpcy5nZXRIZWlnaHQoKVxyXG4gICAgICB9IFxyXG4gICAgICBcclxuICAgICAgLypwbGF5ZXJTcHJpdGUub25sb2FkID0gZnVuY3Rpb24oKSB7IC8vIG9ubG9hZCBuw6NvIHF1ZXIgY2FycmVnYXIgbm8gcGxheWVyLi5wcSA/P1xyXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UocGxheWVyU3ByaXRlLCBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oKTtcdFxyXG4gICAgICB9XHQqL1xyXG4gICAgICAvL2RyYXdJbWFnZShpbWcsc3gsc3ksc3dpZHRoLHNoZWlnaHQseCx5LHdpZHRoLGhlaWdodCk7XHJcbiAgICAgIC8vICMgaHR0cHM6Ly93d3cudzNzY2hvb2xzLmNvbS90YWdzL2NhbnZhc19kcmF3aW1hZ2UuYXNwXHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnBsYXllclNwcml0ZSwgIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94LCB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfd2lkdGgsIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1x0XHJcbiAgICAgIC8vIERFQlVHIENPTExJU0lPTlxyXG4gICAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDI1NSwgMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdCggcHJvcHMueCwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHByb3BzLncsIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG5cdFx0fTtcclxuICBcclxuICAvLyAjIENvbGxpc2lvblxyXG4gIFxyXG5cdFx0bm9Db2xsaXNpb24oKSB7XHJcblx0XHRcdC8vIFdoYXQgaGFwcGVucyBpZiB0aGUgcGxheWVyIGlzIG5vdCBjb2xsaWRpbmc/XHJcblx0XHRcdHRoaXMuc2V0U3BlZWQodGhpcy5zcGVlZDApOyAvLyBSZXNldCBzcGVlZFxyXG4gICAgfVxyXG4gICAgICBcclxuICAgIGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblx0XHRcclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xyXG4iLCIvKlxyXG5cdFByb3RvdHlwZSBTY2VuYXJpb1xyXG4qL1xyXG5jb25zdCBfU2NlbmFyaW8gPSByZXF1aXJlKCcuLi9jb21tb24vX1NjZW5hcmlvJyk7XHJcblxyXG5jb25zdCBQcm90b3R5cGVfU3RhZ2VfMSA9IHJlcXVpcmUoJy4vc3RhZ2VzL3N0YWdlXzEnKTtcclxuY29uc3QgUHJvdG90eXBlX1N0YWdlXzIgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV8yJyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1Byb3RvdHlwZSBleHRlbmRzIF9TY2VuYXJpbyB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMpe1xyXG5cdFx0c3VwZXIoY3R4LCBjYW52YXMsIGdhbWVQcm9wcyk7XHJcblx0XHR0aGlzLnJ1bigpO1xyXG5cdH1cclxuXHJcblx0Ly8gIyBTdGFnZXNcclxuXHRzZXRTdGFnZShzdGFnZV9udW1iZXIpIHtcclxuXHJcblx0XHRsZXQgc3RhZ2VfMDEgPSBuZXcgUHJvdG90eXBlX1N0YWdlXzEoIHRoaXMuY2h1bmtTaXplICk7XHJcblx0XHRsZXQgc3RhZ2VfMDIgPSBuZXcgUHJvdG90eXBlX1N0YWdlXzIoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICAgICAgICBcclxuXHRcdHN3aXRjaChzdGFnZV9udW1iZXIpIHtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHRoaXMuc3RhZ2UgPSBzdGFnZV8wMTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAyOlxyXG5cdFx0XHRcdHRoaXMuc3RhZ2UgPSBzdGFnZV8wMjtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdGNvbnNvbGUubG9nKFwic2V0U3RhZ2U6IFwiLCBzdGFnZV9udW1iZXIpO1xyXG5cdFx0dGhpcy5sb2FkU3RhZ2UoKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gRnVuY3Rpb25zIHRvIGxvYWQgc2VsZWN0ZWQgc3RhZ2VcclxuXHRsb2FkU3RhZ2UoKSB7XHJcbiAgICAgICAgICAgIFxyXG5cdFx0Ly8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcblx0XHQvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG5cdFx0dGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcblx0XHRcdGl0ZW0uc2NlbmFyaW8gPSB0aGlzOyAvLyBQYXNzIHRoaXMgc2NlbmFyaW8gY2xhc3MgYXMgYW4gYXJndW1lbnQsIHNvIG90aGVyIGZ1bmN0aW9ucyBjYW4gcmVmZXIgdG8gdGhpc1xyXG5cdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oaXRlbSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBBZGQgdGhlIEFuaW1hdGVkIEl0ZW1zXHJcblx0XHR0aGlzLnN0YWdlLmdldExheWVySXRlbXMoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG5cdFx0XHRpdGVtLnNjZW5hcmlvID0gdGhpcztcclxuXHRcdFx0dGhpcy5hZGRSZW5kZXJMYXllckl0ZW0oaXRlbSk7XHJcblx0XHR9KTtcclxuICAgIFxyXG4gICAgdGhpcy5zZXRQbGF5ZXJTdGFydFgoIHRoaXMuc3RhZ2UuZ2V0UGxheWVyU3RhcnRYKCkgKTtcclxuICAgIHRoaXMuc2V0UGxheWVyU3RhcnRZKCB0aGlzLnN0YWdlLmdldFBsYXllclN0YXJ0WSgpICk7XHJcblxyXG5cdFx0Y29uc29sZS5sb2coXCJTdGFnZSBsb2FkZWQhXCIpO1xyXG5cdH1cclxuXHJcblx0Ly8gIyBSdW4gd2hlbiBjbGFzcyBsb2Fkc1xyXG5cdHJ1bigpIHtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0IERlZmF1bHQgU3RhZ2VcclxuXHRcdHRoaXMuc2V0U3RhZ2UoMSk7IFxyXG5cdFx0XHRcdFxyXG5cdH1cclxuXHJcbn0vL2NsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvUHJvdG90eXBlOyIsIi8vIFN0YWdlIDAxXHJcbmNvbnN0IF9TdGFnZSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9fU3RhZ2UnKTtcclxuXHJcbmNvbnN0IEJlYWNoX1dhbGwgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfV2FsbCcpO1xyXG5jb25zdCBCZWFjaF9GbG9vciA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9GbG9vcicpO1xyXG5jb25zdCBUZWxlcG9ydCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9UZWxlcG9ydCcpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlXzEgZXh0ZW5kcyBfU3RhZ2V7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNodW5rU2l6ZSkge1xyXG4gICAgc3VwZXIoY2h1bmtTaXplKTtcclxuXHJcbiAgICBsZXQgcGxheWVyU3RhcnRYID0gY2h1bmtTaXplICogMztcclxuICAgIGxldCBwbGF5ZXJTdGFydFkgPSBjaHVua1NpemUgKiA0O1xyXG5cclxuICAgIHRoaXMucnVuKHBsYXllclN0YXJ0WCwgcGxheWVyU3RhcnRZKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBTY2VuYXJpbyBcclxuICBnZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4LCB5LCB4SW5kZXgsIHlJbmRleCl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgeEluZGV4LCB5SW5kZXgsIHRoaXMuY2h1bmtTaXplLCBpdGVtICk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gRGVzZ2luIChTdGF0aWMpXHJcbiAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgLy8gV2FsbHNcclxuICAgIGxldCB3dCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwidG9wXCJ9O1xyXG4gICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgIGxldCB3YiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiYm90dG9tXCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgIGxldCB3Y190ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9yaWdodFwifTtcclxuICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgXHJcbiAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgXHJcbiAgICAvLyBGbG9vclxyXG4gICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICBsZXQgZjIgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMlwifTtcclxuXHJcbiAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdjX2JsLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdiLCAgIHdjX2JyIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVySXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDIgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcInRvcFwiLCAgICAgdGFyZ2V0U3RhZ2U6IDIgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIHRwXzAyLCAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgdHBfMDIsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4oc2V0UGxheWVyU3RhcnRYLCBzZXRQbGF5ZXJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyU3RhcnRYKHNldFBsYXllclN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllclN0YXJ0WShzZXRQbGF5ZXJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfMVxyXG5cclxuXHJcblxyXG5cclxuLypcclxuICAgIC8vICMgVGV4dHVyZXNcclxuXHRcclxuXHRcdFx0XHRcdHRoaXMuYmdJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0XHRcdFx0dGhpcy5iZ0ltYWdlLnNyYyA9ICcuL2Fzc2V0cy9zY2VuYXJpby93ZWxjb21lL2ltZy9iYWNrZ3JvdW5kLmpwZyc7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHRoaXMuYmFja2dyb3VuZCA9IHRoaXMuY3R4LmNyZWF0ZVBhdHRlcm4odGhpcy5iZ0ltYWdlLCAncmVwZWF0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gXCIjMzMzXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAvLyAjIE9ic3RhY2xlc1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBTY2VuYXJpbyBCb3JkZXJzXHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsVG9wXCIsIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuY2h1bmtTaXplKSApOyAvL2NvbnRleHQsIG5hbWUsIHgwLCB5MCwgdywgaCxcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGxCb3R0b21cIiwgMCwgdGhpcy5oZWlnaHQgLSB0aGlzLmNodW5rU2l6ZSwgdGhpcy53aWR0aCwgdGhpcy5jaHVua1NpemUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsTGVmdFwiLCAwLCAwLCB0aGlzLmNodW5rU2l6ZSwgdGhpcy5oZWlnaHQpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsUmlnaHRcIiwgdGhpcy53aWR0aC10aGlzLmNodW5rU2l6ZSwgMCwgdGhpcy5jaHVua1NpemUsIHRoaXMuaGVpZ2h0KSApO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdC8vIFdhbGxzXHJcblx0XHRcdFx0XHQvKlxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDAxXCIsIDIwLCA3MywgNDA1LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwMlwiLCA5MCwgMTkwLCA4MCwgODApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDNcIiwgNTAzLCAxOSwgNDAsIDQ2NSkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNFwiLCAyODMsIDQ4MSwgNDQwLCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNVwiLCAyNDQsIDI5MiwgNDAsIDIyOSkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNlwiLCAyODMsIDM2NywgMTM5LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwN1wiLCA3OCwgNDAzLCAxNjksIDQwKSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDA4XCIsIDUzNiwgMTg5LCA3OSwgNDApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDlcIiwgNjY5LCA3NywgNDAsIDI4OCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwxMFwiLCA2NjksIDM2NSwgMTEyLCA0MCkgKTtcdFxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDYwNCwgNzcsIDY3LCA0MCkgKTtcdFxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDMxOCwgMTcyLCA5MywgOTUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMTFcIiwgODIsIDUxMCwgNzUsIDc0KSApO1x0XHJcblx0XHRcdFx0XHQqL1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBTY2VuYXJpbyByYW5kb20gb2JzdGFjbGVzXHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Ly9Qb3dlclxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdC8vIFBvc3NpYmxlcyB4LCB5LCB3LCBoIGZvciBQb3dlclxyXG5cdFx0XHRcdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdFx0XHR2YXIgYVBvd2VyID0gQXJyYXkoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YVBvd2VyLnB1c2goIHsgeDogMTM3LCB5OiAyMCwgdzogMTY3LCBoOiA1MyB9KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YVBvd2VyLnB1c2goIHsgeDogNDIyLCB5OiAzNjgsIHc6IDgwLCBoOiAzOCB9KTsgXHJcblx0XHRcdFx0XHRcdFx0XHRcdGFQb3dlci5wdXNoKCB7IHg6IDU0MywgeTogNDA2LCB3OiAyMzYsIGg6IDc1IH0pOyBcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dmFyIHJQb3dlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMDtcdFx0XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgUG93ZXIoY3R4LCBcInBvd2VyMDFcIiwgYVBvd2VyW3JQb3dlcl0ueCwgYVBvd2VyW3JQb3dlcl0ueSwgYVBvd2VyW3JQb3dlcl0udywgYVBvd2VyW3JQb3dlcl0uaCkgKTtcdFxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBXYXRlclxyXG5cdFx0XHRcdFx0Ly90aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYXRlcihjdHgsIFwicG93ZXIwMVwiLCAzMDAsIDUyMSwgMTkwLCA1OSkgKTtcclxuXHJcblx0XHRcdFx0XHQvLyBFeGl0XHJcblx0XHRcdFx0XHQvL3RoaXMuYWRkUmVuZGVySXRlbUFuaW1hdGVkKCBuZXcgRXhpdChjdHgsIFwiZXhpdFwiLCA1MCwgMzAsIDEwLCAxMCkgKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gRW5lbWllc1xyXG5cdFx0XHRcdFx0XHQvL2N0eCwgY29saXNhbywgbmFtZSwgeDAsIHkwLCB0aXBvTW92LCBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBzcGVlZCBcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvL3RoaXMuYWRkUmVuZGVySXRlbUFuaW1hdGVkKCBuZXcgRW5lbXkoY3R4LCB0aGlzLnBsYXllciwgXCJlbmVteTAxXCIsIDE1MCwgMzQwLCAnaG9yJywgMjUsIDIzMCwgMCwgMCwgMC4wNSkgKTsgXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0ICAgXHJcbiovIiwiLy8gU3RhZ2UgMDJcclxuY29uc3QgX1N0YWdlID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL19TdGFnZScpO1xyXG5cclxuY29uc3QgQmVhY2hfV2FsbCA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbi9CZWFjaF9XYWxsJyk7XHJcbmNvbnN0IEJlYWNoX0Zsb29yID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX0Zsb29yJyk7XHJcbmNvbnN0IFRlbGVwb3J0ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL1RlbGVwb3J0Jyk7XHJcblxyXG5jbGFzcyBQcm90b3R5cGVfU3RhZ2VfMiBleHRlbmRzIF9TdGFnZXtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7XHJcbiAgICBzdXBlcihjaHVua1NpemUpO1xyXG5cclxuICAgIGxldCBwbGF5ZXJTdGFydFggPSBjaHVua1NpemUgKiAzO1xyXG4gICAgbGV0IHBsYXllclN0YXJ0WSA9IGNodW5rU2l6ZSAqIDQ7XHJcblxyXG4gICAgdGhpcy5ydW4ocGxheWVyU3RhcnRYLCBwbGF5ZXJTdGFydFkpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHksIHhJbmRleCwgeUluZGV4KXtcclxuICAgIHN3aXRjaChpdGVtLm5hbWUpIHtcclxuICAgICAgY2FzZSBcIndhbGxcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX1dhbGwoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJmbG9vclwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgQmVhY2hfRmxvb3IoaXRlbS50eXBlLCB4LCB5LCB0aGlzLmNodW5rU2l6ZSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJ0ZWxlcG9ydFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgVGVsZXBvcnQoaXRlbS50eXBlLCB4LCB5LCB4SW5kZXgsIHlJbmRleCwgdGhpcy5jaHVua1NpemUsIGl0ZW0gKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd2NfdGwsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd2NfdHIgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjIsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBvYiwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYyLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdLFxyXG4gICAgICBbIHdsLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyIF0sXHJcbiAgICAgIFsgd2wsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IgXSxcclxuICAgICAgWyB3bCwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciBdXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVySXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICBzY2VuYXJpb0Rlc2lnbkxheWVyKCkge1xyXG5cclxuICAgIC8vIFRlbGVwb3J0XHJcbiAgICBsZXQgdHBfMDEgPSB7IG5hbWU6IFwidGVsZXBvcnRcIiwgdHlwZTogXCJcIiwgdGVsZXBvcnRUeXBlOiBcInJlbGF0aXZlXCIsIGNhbWVGcm9tOiBcImJvdHRvbVwiLCAgICAgdGFyZ2V0U3RhZ2U6IDEgfTtcclxuICAgIFxyXG4gICAgbGV0IHNjZW5hcmlvRGVzaWduID0gW1xyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICBmYWxzZSwgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlIF0sXHJcbiAgICAgIFsgZmFsc2UsICAgZmFsc2UsICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSwgICBmYWxzZSBdLFxyXG4gICAgICBbIGZhbHNlLCAgIGZhbHNlLCAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UsICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgICB0cF8wMSwgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIHRwXzAxLCAgIGZhbHNlIF0sXHJcbiAgICBdXHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB5SW5kZXgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeEluZGV4KSA9PiB7XHJcbiAgICAgIGlmKCAhaXRlbSApIHJldHVybjsgLy8gSnVtcCBmYWxzZSBlbGVtZW50c1xyXG4gICAgICBsZXQgeDAgPSB4SW5kZXggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geUluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtKCB0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCwgeEluZGV4LCB5SW5kZXgpICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4oc2V0UGxheWVyU3RhcnRYLCBzZXRQbGF5ZXJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyU3RhcnRYKHNldFBsYXllclN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllclN0YXJ0WShzZXRQbGF5ZXJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfMlxyXG4iLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX0Zsb29yIGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSkge1xyXG4gICAgXHJcbiAgICBsZXQgc3RvcE9uQ29sbGlzaW9uID0gZmFsc2U7XHJcbiAgICBsZXQgaGFzQ29sbGlzaW9uRXZlbnQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgbGV0IG5hbWUgPSBcIkJlYWNoIEZsb29yXCI7XHJcblxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIGxldCBzcHJpdGVXaWR0aCA9IDE2O1xyXG4gICAgbGV0IHNwcml0ZUhlaWdodCA9IDE2O1xyXG4gICAgbGV0IHN0YWdlU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpOyAvLyBURU1QT1JBUllcclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlLnNyYyA9ICcvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zcHJpdGVzL3Byb3RvdHlwZS5wbmcnO1xyXG5cclxuICAgIHN1cGVyKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplLCBzdGFnZVNwcml0ZSwgc3ByaXRlV2lkdGgsIHNwcml0ZUhlaWdodCwgc3RvcE9uQ29sbGlzaW9uLCBoYXNDb2xsaXNpb25FdmVudCwgbmFtZSk7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIC8vICMgU3ByaXRlcyAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCIwMVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAyMTQsIGNsaXBfeTogOSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgXHJcbiAgICAgIGNhc2UgXCIwMlwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAyMTQsIGNsaXBfeTogOTQsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEJlYWNoX0Zsb29yOyIsImNvbnN0IF9Db2xsaWRhYmxlID0gcmVxdWlyZSgnLi9fQ29sbGlkYWJsZScpO1xyXG5cclxuY2xhc3MgQmVhY2hfd2FsbCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUpIHtcclxuICAgIFxyXG4gICAgbGV0IHN0b3BPbkNvbGxpc2lvbiA9IHRydWU7XHJcbiAgICBsZXQgaGFzQ29sbGlzaW9uRXZlbnQgPSBmYWxzZTtcclxuICAgIFxyXG4gICAgbGV0IG5hbWUgPSBcIkJlYWNoIFdhbGxcIjtcclxuXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgbGV0IHNwcml0ZVdpZHRoID0gMTY7XHJcbiAgICBsZXQgc3ByaXRlSGVpZ2h0ID0gMTY7XHJcbiAgICBsZXQgc3RhZ2VTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX2JlYWNoJyk7IC8vIFRFTVBPUkFSWVxyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlID0gbmV3IEltYWdlKCk7XHJcbiAgICAvL3RoaXMuc3RhZ2VTcHJpdGUuc3JjID0gJy9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3Nwcml0ZXMvcHJvdG90eXBlLnBuZyc7XHJcblxyXG4gICAgc3VwZXIodHlwZSwgeDAsIHkwLCBjaHVua1NpemUsIHN0YWdlU3ByaXRlLCBzcHJpdGVXaWR0aCwgc3ByaXRlSGVpZ2h0LCBzdG9wT25Db2xsaXNpb24sIGhhc0NvbGxpc2lvbkV2ZW50LCBuYW1lKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICAgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAxOTcsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJsZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQwOSwgY2xpcF95OiAyMTQsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJyaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzOTIsIGNsaXBfeTogMjE0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAxODAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfdG9wX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDYwLCBjbGlwX3k6IDEwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0NzcsIGNsaXBfeTogMTAsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX2xlZnRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDYwLCBjbGlwX3k6IDI3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9yaWdodFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA1NDUsIGNsaXBfeTogMjcsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgXHJcbiAgICAgIGNhc2UgXCJ3YXRlclwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMjk5LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwib2JzdGFjbGVcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDAsIGNsaXBfeTogNzUsIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gQmVhY2hfd2FsbDsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi8uLi8uLi9nYW1lUHJvcGVydGllcycpOyBcclxuXHJcbmNsYXNzIFRlbGVwb3J0IGV4dGVuZHMgX0NvbGxpZGFibGUge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIHhJbmRleCwgeUluZGV4LCBjaHVua1NpemUsIHRlbGVwb3J0UHJvcHMpIHtcclxuICAgIFxyXG4gICAgbGV0IHN0b3BPbkNvbGxpc2lvbiA9IGZhbHNlO1xyXG4gICAgbGV0IGhhc0NvbGxpc2lvbkV2ZW50ID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgbGV0IG5hbWUgPSBcIlRlbGVwb3J0XCI7XHJcblxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIGxldCBzcHJpdGVXaWR0aCA9IDE2O1xyXG4gICAgbGV0IHNwcml0ZUhlaWdodCA9IDE2O1xyXG5cdCAgbGV0IHN0YWdlU3ByaXRlID0gZmFsc2U7XHJcblx0XHJcbiAgICBzdXBlcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSwgc3RhZ2VTcHJpdGUsIHNwcml0ZVdpZHRoLCBzcHJpdGVIZWlnaHQsIHN0b3BPbkNvbGxpc2lvbiwgaGFzQ29sbGlzaW9uRXZlbnQsIG5hbWUpO1xyXG4gICAgXHJcbiAgICB0aGlzLnRlbGVwb3J0UHJvcHMgPSB0ZWxlcG9ydFByb3BzO1xyXG5cclxuICAgIHRoaXMueEluZGV4ID0geEluZGV4O1xyXG4gICAgdGhpcy55SW5kZXggPSB5SW5kZXg7XHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ocGxheWVyLCBjb2xsaWRhYmxlLCBjb2xsaXNpb25EaXJlY3Rpb24pe1xyXG4gICAgXHJcbiAgICAvLyBDaGFuZ2Ugc3RhZ2VcclxuICAgIGNvbGxpZGFibGUuc2NlbmFyaW8uc2V0U3RhZ2UoIHRoaXMudGVsZXBvcnRQcm9wcy50YXJnZXRTdGFnZSApO1xyXG5cclxuICAgIC8vIFRlbGVwb3J0IHRoZSBwbGF5ZXJcclxuICAgIHRoaXMudGVsZXBvcnQoIHBsYXllciApO1xyXG5cclxuICB9XHJcblxyXG4gIC8vIFdoYXQga2luZCBvZiB0ZWxlcG9ydD9cclxuICB0ZWxlcG9ydCggcGxheWVyICkge1xyXG5cclxuICAgIGxldCBnYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuXHJcbiAgICBsZXQgdHlwZSA9IHRoaXMudGVsZXBvcnRQcm9wcy50ZWxlcG9ydFR5cGU7XHJcbiAgICBsZXQgdGFyZ2V0WCA9IDA7XHJcbiAgICBsZXQgdGFyZ2V0WSA9IDA7XHJcblxyXG4gICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRhcmdldFggPSB0aGlzLnRlbGVwb3J0UHJvcHMudGFyZ2V0WDtcclxuICAgICAgICB0YXJnZXRZID0gdGhpcy50ZWxlcG9ydFByb3BzLnRhcmdldFk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJyZWxhdGl2ZVwiOlxyXG4gICAgICAgIHN3aXRjaCAodGhpcy50ZWxlcG9ydFByb3BzLmNhbWVGcm9tKSB7XHJcbiAgICAgICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgICAgIHRhcmdldFggPSB0aGlzLnhJbmRleCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgICAgICB0YXJnZXRZID0gKChnYW1lUHJvcHMuZ2V0UHJvcCgnc2NyZWVuVmVydGljYWxDaHVua3MnKSAtIDIpICogdGhpcy5jaHVua1NpemUgKSAtIHRoaXMuY2h1bmtTaXplOyAvLyAtMiBvbiBYIGlzIHRoZSBzcXVhcmUgYmVmb3JlIHRoZSBsYXN0LiBXaHk/IFdoeSBZIHlvdSBoYXZlIHRvIHVzZSAtMSBvbmx5P1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICAgICAgdGFyZ2V0WCA9IHRoaXMueEluZGV4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAxICogdGhpcy5jaHVua1NpemU7IC8vIFRoaXMgMSBpcyBqdXN0IHRvIHJlbWViZXIgdGhhdCBpdCB3aWxsIGJlIHRlbGVwb3J0ZWQgdG8gaW5kZXggWHgxIGFuZCBub3QgWHgwXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcInJpZ2h0XCI6XHJcbiAgICAgICAgICAgIHRhcmdldFkgPSAoIHRoaXMueUluZGV4ICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIHRhcmdldFggPSAxICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICAgICAgdGFyZ2V0WSA9ICggdGhpcy55SW5kZXggKiB0aGlzLmNodW5rU2l6ZSkgLSB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICAgICAgdGFyZ2V0WCA9ICgoZ2FtZVByb3BzLmdldFByb3AoJ3NjcmVlbkhvcml6b250YWxDaHVua3MnKSAtIDEpICogdGhpcy5jaHVua1NpemUpIC0gdGhpcy5jaHVua1NpemU7IC8vIC0xIGJlY2F1c2UgaXQgd2lsbCBzcGF3biBub3QgaW4gbGFzdCBzcXVhcmUsIGJ1dCB0aGUgb25lIGJlZm9yZSBpdC4gXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuXHJcbiAgICBwbGF5ZXIuc2V0WCggdGFyZ2V0WCApOyAvLyBhbHdheXMgdXNpbmcgWCBhbmQgWSByZWxhdGl2ZSB0byB0ZWxlcG9ydCBub3QgcGxheWVyIGJlY2F1c2UgaXQgZml4IHRoZSBwbGF5ZXIgcG9zaXRpb24gdG8gZml0IGluc2lkZSBkZXN0aW5hdGlvbiBzcXVhcmUuXHJcbiAgICBwbGF5ZXIuc2V0WSggdGFyZ2V0WSApO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVGVsZXBvcnQ7IiwiY2xhc3MgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSwgc3RhZ2VTcHJpdGUsIHNwcml0ZVdpZHRoLCBzcHJpdGVIZWlnaHQsIHN0b3BPbkNvbGxpc2lvbiwgaGFzQ29sbGlzaW9uRXZlbnQsIG5hbWUpIHtcclxuICAgICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4MDtcclxuICAgIHRoaXMueSA9IHkwO1xyXG4gICAgICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IGNodW5rU2l6ZTsgLy9weFxyXG4gICAgdGhpcy5oZWlnaHQgPSBjaHVua1NpemU7XHJcblxyXG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcblxyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBzdG9wT25Db2xsaXNpb247XHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gaGFzQ29sbGlzaW9uRXZlbnQ7XHJcblxyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5zdGFnZVNwcml0ZSA9IHN0YWdlU3ByaXRlO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlV2lkdGggPSBzcHJpdGVXaWR0aDsgICBcclxuICAgIHRoaXMuc3ByaXRlSGVpZ2h0ID0gc3ByaXRlSGVpZ2h0OyBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLnJ1biggdHlwZSApO1xyXG5cclxuICB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAvLyAhIE11c3QgaGF2ZSBpbiBjaGlsZHMgQ2xhc3NcclxuICB9XHJcblx0XHRcdFxyXG5cdC8vICMgR2V0c1xyXG5cdFx0XHRcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLng7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMueTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCk7IH1cclxuICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblx0XHRcclxuXHQvLyAjIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgbGV0IHNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGVQcm9wcztcclxuICAgIFxyXG4gICAgaWYoIHRoaXMuc3RhZ2VTcHJpdGUgKSB7IC8vIE9ubHkgcmVuZGVyIHRleHR1cmUgaWYgaGF2ZSBpdCBzZXRcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3RhZ2VTcHJpdGUsICBcclxuICAgICAgICBzcHJpdGVQcm9wcy5jbGlwX3gsIHNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCBzcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgLy9ERUJVRyBDaHVuayBTaXplXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5zdG9wT25Db2xsaXNpb24gPyBcInJnYmEoMjU1LDAsMCwwLjIpXCIgOiBcInJnYmEoMCwyNTUsMCwwLjIpXCI7XHJcbiAgICAgIGN0eC5maWxsUmVjdChwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oKTtcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMilcIjtcclxuICAgICAgY3R4LmxpbmVXaWR0aCAgID0gNTtcclxuICAgICAgY3R4LnN0cm9rZVJlY3QocHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaCk7XHJcbiAgICB9XHJcbiAgXHJcbiAgfVxyXG4gICAgXHJcbiAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gIC8vIFdpbGwgaXQgU3RvcCB0aGUgb3RoZXIgb2JqZWN0IGlmIGNvbGxpZGVzP1xyXG4gIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBObyBDb2xsaXNpb24gRXZlbnRcclxuICBub0NvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBSdW5zIHdoZW4gQ2xhc3Mgc3RhcnRzICBcclxuICBydW4oIHR5cGUgKSB7XHJcbiAgICB0aGlzLnNldFNwcml0ZVR5cGUodHlwZSk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ29sbGlkYWJsZTsiLCJjbGFzcyBfU2NlbmFyaW8ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzKXtcclxuXHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0XHRcclxuXHRcdHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLndpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WCA9IDA7IFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFkgPSAwOyBcclxuXHJcbiAgICB0aGlzLnN0YWdlID0gW107XHJcblxyXG5cdFx0dGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcblxyXG5cdFx0dGhpcy5ydW4oKTtcclxuXHR9XHJcblxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRSZW5kZXJJdGVtKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHRhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgXHJcblx0Ly8gIyBHZXRzXHJcblx0Z2V0Q3R4KCkgeyByZXR1cm4gdGhpcy5jdHg7IH1cclxuXHRnZXRDYW52YXMoKSB7IHJldHVybiB0aGlzLmNhbnZhczsgfVx0XHJcblx0XHRcdFx0XHJcblx0Z2V0UmVuZGVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcblx0Z2V0TGF5ZXJJdGVtcygpIHsgIHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBcclxuICBnZXRQbGF5ZXJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllclN0YXJ0WDsgfVxyXG4gIGdldFBsYXllclN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyU3RhcnRZOyB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllclN0YXJ0WCh4KSB7IHRoaXMucGxheWVyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllclN0YXJ0WSh5KSB7IHRoaXMucGxheWVyU3RhcnRZID0geTsgfVxyXG5cclxuICByZW5kZXIoKSB7IH1cclxuXHJcblx0Ly8gIyBSdW4gd2hlbiBjbGFzcyBsb2Fkc1xyXG5cdHJ1bigpIHsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU2NlbmFyaW87IiwiY2xhc3MgX1N0YWdlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllclN0YXJ0WTsgfVxyXG4gIFxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllclN0YXJ0WCh4KSB7IHRoaXMucGxheWVyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllclN0YXJ0WSh5KSB7IHRoaXMucGxheWVyU3RhcnRZID0geTsgfVxyXG4gIFxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRSZW5kZXJJdGVtKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHRhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgXHJcbiAgcnVuICgpIHsgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TdGFnZTsiLCIvLyBPYnN0YWNsZSBjbGFzc1xyXG5cclxuXHRmdW5jdGlvbiBFbmVteShjdHgsIHBsYXllciwgbmFtZSwgeDAsIHkwLCBtb3ZUeXBlLCBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBzcGVlZCApIHtcclxuXHRcdFxyXG5cdFx0Ly8gLSAtIC0gSW5pdCAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdC8vICMgUG9zaXRpb25cclxuXHRcdFx0XHR0aGlzLnggPSB4MDtcclxuXHRcdFx0XHR0aGlzLnkgPSB5MDtcclxuXHRcdFx0XHRcclxuXHRcdFx0Ly8gIyBQcm9wZXJ0aWVzXHJcblx0XHRcdFx0dGhpcy53aWR0aCA9IDEwOyAvL3B4XHJcblx0XHRcdFx0dGhpcy5oZWlnaHQgPSA1MDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmNvbG9yID0gXCIjRjAwXCI7IFxyXG5cdFx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0XHRcdFx0dGhpcy5zcGVlZCA9IHNwZWVkO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gIyBNb3ZlbWVudFxyXG5cdFx0XHRcdHRoaXMucGxheWVyID0gcGxheWVyO1xyXG5cdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdiA9IG1vdlR5cGU7IC8vaG9yLCB2ZXIgPC0gbW92ZW1lbnQgdHlwZXMgdGhhdCB0aGUgZW5lbXkgY2FuIGRvXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5taW5YID0gbWluWDtcclxuXHRcdFx0XHR0aGlzLm1pblkgPSBtaW5ZO1xyXG5cdFx0XHRcdHRoaXMubWF4WCA9IG1heFg7XHJcblx0XHRcdFx0dGhpcy5tYXhZID0gbWF4WTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdlggPSAxO1xyXG5cdFx0XHRcdHRoaXMubW92WSA9IDE7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5lbmVteSA9IG5ldyBPYmplY3Q7XHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LndpZHRoID0gdGhpcy53aWR0aDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG5cdFx0XHQvLyAjIFRleHR1cmVcclxuXHRcdFx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHJcblx0XHRcdFx0dGhpcy5vYmpDb2xsaXNpb24gPSBuZXcgQ29sbGlzaW9uKCAwICwgMCwgdGhpcy5wbGF5ZXIgKTtcclxuXHRcdFx0XHRcclxuXHRcdC8vIC0gLSAtIFNldHMgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHR0aGlzLnNldFggPSAgZnVuY3Rpb24gKHgpIHsgdGhpcy54ID0geDsgfVxyXG5cdFx0XHR0aGlzLnNldFkgPSAgZnVuY3Rpb24gKHkpIHsgdGhpcy55ID0geTsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRIZWlnaHQgPSAgZnVuY3Rpb24gKGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0XHR0aGlzLnNldFdpZHRoID0gIGZ1bmN0aW9uICh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0Q29sb3IgPSAgZnVuY3Rpb24gKGNvbG9yKSB7IHRoaXMuY29sb3IgPSBjb2xvcjsgfVxyXG5cdFx0XHR0aGlzLnNldE5hbWUgPSAgZnVuY3Rpb24gKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cdFxyXG5cdFx0Ly8gLSAtIC0gR2V0cyAtIC0gLVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRYID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0XHR0aGlzLmdldFkgPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFdpZHRoID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcblx0XHRcdHRoaXMuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRDb2xvciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG5cclxuXHJcblx0XHQvLyAtIC0gLSBNb3ZlbWVudCAgLSAtIC1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdkhvciA9IGZ1bmN0aW9uIChtb2QpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1vdlggPT0gMSApIHsvLyBnbyBSaWdodFxyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy54ID0gdGhpcy54ICsgdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnggPj0gdGhpcy5tYXhYIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlggPSAwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy54ID0gdGhpcy54IC0gdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnggPCB0aGlzLm1pblggKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WCA9IDE7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH1cdFxyXG5cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3ZWZXIgPSBmdW5jdGlvbiAobW9kKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICggdGhpcy5tb3ZZID09IDEgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLnkgPSB0aGlzLnkgKyB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueSA+PSB0aGlzLm1heFkgKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WSA9IDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0aGlzLnkgPSB0aGlzLnkgLSB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueSA8IHRoaXMubWluWSApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZZID0gMTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fVx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cclxuXHRcdC8vIC0gLSAtIFJlbmRlciAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY29udGV4dCwgbW9kKSB7IFxyXG5cclxuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5tb3YpIHtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGNhc2UgXCJob3JcIjpcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdkhvcihtb2QpO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y2FzZSBcInZlclwiOlxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92VmVyKG1vZCk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgY29sbGlkZXMgd2l0aCBwbGF5ZXJcclxuXHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LnggPSB0aGlzLng7XHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LnkgPSB0aGlzLnk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm9iakNvbGxpc2lvbi5jaGVja1BsYXllckNvbGxpc2lvbih0aGlzLmVuZW15KSA9PSB0cnVlICkgXHJcblx0XHRcdFx0XHRcdHRoaXMuY29sbGlzaW9uKHRoaXMucGxheWVyKTtcclxuXHRcdFx0XHRcdFxyXG5cclxuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcblx0XHRcdFx0Y29udGV4dC5maWxsUmVjdCggdGhpcy5nZXRYKCksIHRoaXMuZ2V0WSgpLCB0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCkgKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY29sbGlzaW9uID0gZnVuY3Rpb24ob2JqZWN0KSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0b2JqZWN0LnNldENvbG9yKFwiIzMzM1wiKTtcclxuXHRcdFx0XHRvYmplY3QucmVzZXRQb3NpdGlvbigpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fTtcclxuXHJcblx0fS8vY2xhc3MiLCIvLyBDbGFzcyB0aGF0IGRldGVjdHMgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyIGFuZCBvdGhlciBvYmplY3RzXHJcbmNsYXNzIENvbGxpc2lvbiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHNjZW5hcmlvV2lkdGgsIHNjZW5hcmlvSGVpZ2h0LCBwbGF5ZXIpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTsgLy8gSXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG4gICAgdGhpcy5zY2VuYXJpb1dpZHRoID0gc2NlbmFyaW9XaWR0aDtcclxuICAgIHRoaXMuc2NlbmFyaW9IZWlnaHQgPSBzY2VuYXJpb0hlaWdodDtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gIH1cclxuXHRcdFx0XHJcbiAgLy8gIyBDaGVjayBpZiB0aGUgb2JqZWN0IGNvbGxpZGVzIHdpdGggYW55IG9iamVjdCBpbiB2ZWN0b3JcclxuICAvLyBBbGdvcml0aG0gcmVmZXJlbmNlOiBHdXN0YXZvIFNpbHZlaXJhIC0gaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1zN3FpV0xCQnBKd1xyXG4gIGNoZWNrKG9iamVjdCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMSA9IG9iamVjdDtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgdGhpcy5jaGVja0NvbGxpc2lvbihyMSwgcjIpO1xyXG4gICAgfSBcclxuICB9XHJcblxyXG4gIC8vIEByMTogdGhlIG1vdmluZyBvYmplY3RcclxuICAvLyBAcjI6IHRoZSBcIndhbGxcIlxyXG4gIGNoZWNrQ29sbGlzaW9uKHIxLCByMikge1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICYmICEgcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9IHIxLmdldENlbnRlclgoKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggcjEuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgdmFyIG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgIHZhciBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuICAgICAgdmFyIGNvbGxpc2lvbkRpcmVjdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYoIHIyLnN0b3BJZkNvbGxpc2lvbigpICkge1xyXG4gICAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZICl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duXHJcbiAgICAgICAgICBpZihjYXRZID4gMCl7IC8vIFVwXHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwidXBcIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwiZG93blwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICAgIGlmKGNhdFggPiAwKXsgLy8gTGVmdFxyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICBjb2xsaXNpb25EaXJlY3Rpb24gPSBcImxlZnRcIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSAtIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwicmlnaHRcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyaWdnZXJzIENvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5jb2xsaXNpb24ocjIsIHIxLCBjb2xsaXNpb25EaXJlY3Rpb24pO1xyXG4gICAgICByMi5jb2xsaXNpb24ocjEsIHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRyaWdnZXJzIG5vdCBpbiBjb2xsaXNpb24gZXZlbnRcclxuICAgICAgcjEubm9Db2xsaXNpb24ocjIsIHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pOyBcclxuICAgICAgcjIubm9Db2xsaXNpb24ocjEsIHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pOyBcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFx0XHRcclxuXHQvLyBBZGQgaXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG5cdGFkZEl0ZW0ob2JqZWN0KSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0KTtcclxuICB9O1xyXG4gIFxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgY2xlYXJBcnJheUl0ZW1zKCkge1xyXG4gICAgdGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpO1xyXG4gIH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY2xhc3MgUmVuZGVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jdHggPSBjdHg7IFxyXG5cdFx0dGhpcy5zY2VuYXJpbyA9IFwiXCI7XHJcblx0XHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHRcdHRoaXMucGxheWVyID0gcGxheWVyO1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuXHR9XHJcblx0XHQgICAgXHJcblx0Ly8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuXHRhZGRJdGVtKG9iamVjdCl7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuXHR9XHJcblx0YWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcblx0XHRmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcblx0XHRcdHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRjbGVhckFycmF5SXRlbXMoKXsgXHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG5cdH1cclxuXHRzZXRTY2VuYXJpbyhzY2VuYXJpbyl7XHJcblx0XHR0aGlzLnNjZW5hcmlvID0gc2NlbmFyaW87XHJcblx0fVxyXG5cdFx0XHRcclxuXHQvLyBUaGlzIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZCBjb25zdGFudGx5IHRvIHJlbmRlciBpdGVtc1xyXG5cdHN0YXJ0KG1vZCkge1x0XHRcclxuXHRcdFx0XHRcclxuXHRcdC8vIENsZWFyIGNhbnZhcyBiZWZvcmUgcmVuZGVyIGFnYWluXHJcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblx0XHR0aGlzLmN0eC5zaGFkb3dCbHVyID0gMDtcclxuXHJcblx0XHQvLyBTY2VuYXJpb1xyXG5cdFx0aWYgKCB0aGlzLnNjZW5hcmlvICE9IFwiXCIpIFxyXG5cdFx0XHR0aGlzLnNjZW5hcmlvLnJlbmRlcih0aGlzLmN0eCk7XHJcblx0XHRcdFx0XHJcblx0XHQvLyBSZW5kZXIgaXRlbXNcclxuXHRcdGZvciAobGV0IGkgaW4gdGhpcy5yZW5kZXJJdGVtcykge1xyXG5cdFx0XHQvLyBFeGVjdXRlIHRoZSByZW5kZXIgZnVuY3Rpb24gLSBJbmNsdWRlIHRoaXMgZnVuY3Rpb24gb24gZXZlcnkgY2xhc3MhXHJcblx0XHRcdHRoaXMucmVuZGVySXRlbXNbaV0ucmVuZGVyKHRoaXMuY3R4LCBtb2QpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblx0XHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyIiwiY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2dhbWVQcm9wZXJ0aWVzJyk7XHJcbmNvbnN0IHNjZW5hcmlvUHJvdG90eXBlID0gcmVxdWlyZSgnLi9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlJyk7XHJcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vYXNzZXRzL3BsYXllcicpO1xyXG5jb25zdCBDb2xsaXNpb24gPSByZXF1aXJlKCcuL2VuZ2luZS9jb2xsaXNpb24nKTtcclxuY29uc3QgUmVuZGVyID0gcmVxdWlyZSgnLi9lbmdpbmUvcmVuZGVyJyk7XHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIC8vICMgSW5pdFxyXG5cclxuICAgIHZhciBmcHNJbnRlcnZhbCwgbm93LCBkZWx0YVRpbWUsIGVsYXBzZWQ7XHJcbiAgICB2YXIgZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgdmFyIGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcbiAgICB2YXIgY29udGV4dFN0YXRpYyA9IGNhbnZhc1N0YXRpYy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIHZhciBjYW52YXNBbmltYXRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfYW5pbWF0ZWQnKTtcclxuICAgIHZhciBjb250ZXh0QW5pbWF0ZWQgPSBjYW52YXNBbmltYXRlZC5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIGNhbnZhc0FuaW1hdGVkLndpZHRoID0gY2FudmFzU3RhdGljLndpZHRoID0gZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICBjYW52YXNBbmltYXRlZC5oZWlnaHQgPSBjYW52YXNTdGF0aWMuaGVpZ2h0ID0gZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc0hlaWdodCcpO1xyXG5cclxuICAvLyAjIFNjZW5hcmlvXHJcblxyXG4gICAgIHZhciBzY2VuYXJpbyA9IG5ldyBzY2VuYXJpb1Byb3RvdHlwZShjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIGdhbWVQcm9wcyApO1xyXG5cclxuICAvLyAjIFBsYXllcnNcclxuXHJcbiAgICB2YXIgcGxheWVyID0gbmV3IFBsYXllciggc2NlbmFyaW8uZ2V0UGxheWVyU3RhcnRYKCksIHNjZW5hcmlvLmdldFBsYXllclN0YXJ0WSgpLCBnYW1lUHJvcHMsIGNvbnRleHRBbmltYXRlZCApOyAvL3Bvc2nDp8OjbyB4IGUgeVxyXG5cclxuICAvLyAjIENvbGxpc2lvbiBkZXRlY3Rpb24gY2xhc3NcclxuXHJcbiAgICB2YXIgY29sbGlzaW9uID0gbmV3IENvbGxpc2lvbihjYW52YXNBbmltYXRlZC53aWR0aCwgY2FudmFzQW5pbWF0ZWQuaGVpZ2h0ICk7XHJcblxyXG4gICBcclxuXHJcbiAgLy8gIyBSZW5kZXJcclxuXHJcbiAgICB2YXIgcmVuZGVyU3RhdGljID0gbmV3IFJlbmRlcihjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMpOyAvLyBSZW5kZXIgZXhlY3V0ZWQgb25seSBvbmNlXHJcbiAgICB2YXIgcmVuZGVyQW5pbWF0ZWQgPSBuZXcgUmVuZGVyKGNvbnRleHRBbmltYXRlZCwgY2FudmFzQW5pbWF0ZWQpOyAvL1JlbmRlciB3aXRoIGFuaW1hdGVkIG9iamVjdHMgb25seVxyXG5cclxuICAgIC8vIEFkZCBpdGVtcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgIHJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyhzY2VuYXJpbyk7IC8vIHNldCB0aGUgc2NlbmFyaW9cclxuICAgIFxyXG4gICAgXHJcblxyXG5cclxuICAvLyAjIEtleWJvYXJkIEV2ZW50c1xyXG5cclxuICAgIHZhciBrZXlzRG93biA9IHt9O1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGtleXNEb3duW2Uua2V5Q29kZV0gPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGRlbGV0ZSBrZXlzRG93bltlLmtleUNvZGVdO1xyXG4gICAgICBwbGF5ZXIucmVzZXRTdGVwKCk7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gIC8vICMgVGhlIEdhbWUgTG9vcFxyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUdhbWUobW9kKSB7XHJcblxyXG4gICAgICAvLyAjIEFkZCB0aGUgb2JqZWN0cyB0byB0aGUgY29sbGlzaW9uIHZlY3RvclxyXG4gICAgICBjb2xsaXNpb24uY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIGNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHNjZW5hcmlvLmdldFJlbmRlckl0ZW1zKCkgKTtcclxuICAgICAgY29sbGlzaW9uLmFkZEFycmF5SXRlbSggc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtcygpICk7XHJcbiAgICAgIFxyXG4gICAgICByZW5kZXJTdGF0aWMuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHJlbmRlclN0YXRpYy5hZGRBcnJheUl0ZW0oc2NlbmFyaW8uZ2V0UmVuZGVySXRlbXMoKSk7IC8vIEdldCBhbGwgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgICAgcmVuZGVyQW5pbWF0ZWQuY2xlYXJBcnJheUl0ZW1zKCk7XHJcbiAgICAgIHJlbmRlckFuaW1hdGVkLmFkZEl0ZW0oIHBsYXllciApOyAvLyBBZGRzIHRoZSBwbGF5ZXIgdG8gdGhlIGFuaW1hdGlvbiByZW5kZXJcclxuICAgICAgcmVuZGVyQW5pbWF0ZWQuYWRkQXJyYXlJdGVtKCBzY2VuYXJpby5nZXRMYXllckl0ZW1zKCkgKTsgLy8gR2V0IGFsbCBhbmltYXRlZCBpdGVtcyBmcm9tIHRoZSBzY2VuYXJpbyB0aGF0IG5lZWRzIHRvIGJlIHJlbmRlcmVkXHJcblxyXG4gICAgICAvLyAjIE1vdmVtZW50c1xyXG4gICAgICBwbGF5ZXIuaGFuZGxlTW92ZW1lbnQoIGtleXNEb3duICk7XHJcblxyXG4gICAgICAvLyAjIENoZWNrIGlmIHBsYXllciBpcyBjb2xsaWRpbmdcclxuICAgICAgY29sbGlzaW9uLmNoZWNrKHBsYXllcik7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyAjIFwiVGhyZWFkXCIgdGhhIHJ1bnMgdGhlIGdhbWVcclxuICAgIGZ1bmN0aW9uIHJ1bkdhbWUoZnBzKSB7XHJcbiAgICAgIGZwc0ludGVydmFsID0gMTAwMCAvIGZwcztcclxuICAgICAgZGVsdGFUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgc3RhcnRUaW1lID0gZGVsdGFUaW1lO1xyXG4gICAgICBnYW1lTG9vcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdhbWVMb29wKCkge1xyXG5cclxuICAgICAgLy8gUnVucyBvbmx5IHdoZW4gdGhlIGJyb3dzZXIgaXMgaW4gZm9jdXNcclxuICAgICAgLy8gUmVxdWVzdCBhbm90aGVyIGZyYW1lXHJcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcblxyXG4gICAgICAvLyBjYWxjIGVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IGxvb3BcclxuICAgICAgbm93ID0gRGF0ZS5ub3coKTtcclxuICAgICAgZWxhcHNlZCA9IG5vdyAtIGRlbHRhVGltZTtcclxuXHJcbiAgICAgIC8vIGlmIGVub3VnaCB0aW1lIGhhcyBlbGFwc2VkLCBkcmF3IHRoZSBuZXh0IGZyYW1lXHJcbiAgICAgIGlmIChlbGFwc2VkID4gZnBzSW50ZXJ2YWwpIHtcclxuXHJcbiAgICAgICAgLy8gR2V0IHJlYWR5IGZvciBuZXh0IGZyYW1lIGJ5IHNldHRpbmcgdGhlbj1ub3csIGJ1dCBhbHNvIGFkanVzdCBmb3IgeW91clxyXG4gICAgICAgIC8vIHNwZWNpZmllZCBmcHNJbnRlcnZhbCBub3QgYmVpbmcgYSBtdWx0aXBsZSBvZiBSQUYncyBpbnRlcnZhbCAoMTYuN21zKVxyXG4gICAgICAgIGRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgZnBzSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB1cGRhdGVHYW1lKCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgICAgcmVuZGVyU3RhdGljLnN0YXJ0KCBkZWx0YVRpbWUgKTsgIC8vIFN0YXRpYyBjYW4gYWxzbyBjaGFuY2UsIGJlY2F1c2UgaXQgaXMgdGhlIHNjZW5hcmlvXHJcbiAgICAgICAgcmVuZGVyQW5pbWF0ZWQuc3RhcnQoIGRlbHRhVGltZSApO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgLy8gIyBTdGFydHMgdGhlIGdhbWVcclxuICAgIHJ1bkdhbWUoIGdhbWVQcm9wcy5nZXRQcm9wKCdmcHMnKSApO1x0Ly8gR08gR08gR09cclxuXHJcbn0iLCIvLyBHYW1lIFByb3BlcnRpZXMgY2xhc3MgdG8gZGVmaW5lIGNvbmZpZ3VyYXRpb25zXHJcbmNsYXNzIGdhbWVQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBcclxuICAgIC8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuY2h1bmtTaXplID0gMTAwOyAvL3B4IC0gcmVzb2x1dGlvblxyXG4gICAgXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxNjtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxNDtcclxuICAgIFxyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyk7XHJcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MpOy8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICBcclxuICAgIHRoaXMuZnBzID0gMzA7XHJcbiAgfVxyXG5cclxuICBnZXRQcm9wKHByb3ApIHtcclxuICAgIHJldHVybiB0aGlzW3Byb3BdO1xyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBnYW1lUHJvcGVydGllc1xyXG5cclxuLy8gR2xvYmFsIHZhbHVlc1xyXG5cclxuICAvLyBEZWJ1Z1xyXG4gIHdpbmRvdy5kZWJ1ZyA9IGZhbHNlOyJdfQ==
