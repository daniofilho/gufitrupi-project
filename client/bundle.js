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
        ctx.fillStyle = "rgba(0,0,100, 0.5)";
        ctx.fillRect( this.props.x, this.getCollisionY(), this.props.w, this.getCollisionHeight() );
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

class scenarioPrototype extends _Scenario {

	constructor(ctx, canvas, gameProps){
		super(ctx, canvas, gameProps);
		this.run();
	}

      
	// # Stages
	setStage(stage_number) {

		let stage_01 = new Prototype_Stage_1( this.chunkSize );
          
		switch(stage_number) {
			case 1:
				this.stage = stage_01;
				break;
		}
		this.loadStage();
	}
	
	// Functions to load selected stage
	loadStage() {
            
		// Clear previous render items
		this.renderItems = new Array();
		this.renderItemsAnimated = new Array();

		// Add the Static Items
		this.stage.getStaticItems().map( (item) => { 
			this.addRenderItem(item);
		});

		// Add the Animated Items
		this.stage.getLayerItems().map( (item) => { 
			this.addRenderLayerItem(item);
		});
    
    this.setPlayerStartX( this.stage.getPlayerStartX() );
    this.setPlayerStartY( this.stage.getPlayerStartY() );

	}

	// # Run when class loads
	run() {
		
		// Set Default Stage
		this.setStage(1); 
				
	}

}//class

module.exports = scenarioPrototype;
},{"../common/_Scenario":8,"./stages/stage_1":3}],3:[function(require,module,exports){
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
  getScenarioAssetItem(item, x, y){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, this.chunkSize, item.targetCoord );
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
      [ wtr, wtr,   wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,    wtr ],
      [ wtr, wc_tl, wt,   wt,   wt,   wt,   wt,   wt,   wt,   wc_tr,  wtr ],
      [ wtr, wl,    f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   f1,   f1,   f1,   f1,   f2,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   ob,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   f2,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   f1,   f1,   f2,   f1,   f1,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   f2,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   f1,   f1,   ob,   f1,   f2,   f1,   wr,     wtr ],
      [ wtr, wl,    f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
      [ wtr, wc_bl, wb,   wb,   wb,   wb,   wb,   wb,   wb,   wc_br,  wtr ],
    ];

    // # Proccess scenario design
    scenarioDesign.map( (array, x) => {
      array.map( (item, y) => {
      if( !item ) return; // Jump false elements
      let x0 = y * this.chunkSize;
      let y0 = x * this.chunkSize;
      this.addRenderItem(this.getScenarioAssetItem(item, x0, y0));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer() {

    // Teleport
    let tp = { name: "teleport", type: "", targetCoord: [3, 9] };
    
    let scenarioDesign = [
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   tp,      false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
      [ false, false,    false,   false,   false,   false,   false,   false,   false,   false,     false ],
    ];

    // # Proccess scenario design
    scenarioDesign.map( (array, x) => {
      array.map( (item, y) => {
      if( !item ) return; // Jump false elements
      let x0 = y * this.chunkSize;
      let y0 = x * this.chunkSize;
      this.addRenderLayerItem( this.getScenarioAssetItem(item, x0, y0) );
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
},{"../../common/Beach_Floor":4,"../../common/Beach_Wall":5,"../../common/Teleport":6,"../../common/_Stage":9}],4:[function(require,module,exports){
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
},{"./_Collidable":7}],5:[function(require,module,exports){
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
},{"./_Collidable":7}],6:[function(require,module,exports){
const _Collidable = require('./_Collidable');

class Teleport extends _Collidable {

	constructor(type, x0, y0, chunkSize) {
    
    let stopOnCollision = false;
    let hasCollisionEvent = true;
    
    let name = "Teleport";

    // # Sprite
    let spriteWidth = 16;
    let spriteHeight = 16;
	  let stageSprite = false;
	
    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name);
    
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
  collision(obj){ 
    //setTimeout(() => {
      obj.resetPosition();
    //}, 400);
  }

}//class
module.exports = Teleport;
},{"./_Collidable":7}],7:[function(require,module,exports){
class _Collidable {

  constructor(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name) {
      
    // # Position
    this.x = x0;
    this.y = y0;
      
    // # Properties
    this.width = chunkSize; //px
    this.height = chunkSize;

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
      ctx.fillStyle = "rgba(255,0,0,0.4)";
      ctx.fillRect(props.x, props.y, props.w, props.h);
      ctx.rect(props.x, props.y, props.w, props.h);
      ctx.stroke();
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
        if(overlapX >= overlapY ){ // Direction of collision - Up/Down && r2.()
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
      r1.collision(r2, collisionDirection);
      r2.collision(r1, collisionDirection);

    } else {
      // Triggers not in collision event
      r1.noCollision(r2, collisionDirection); 
      r2.noCollision(r1, collisionDirection); 
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

}// class

module.exports = Collision;
	
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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

    // Add the objects to the collision vector
    collision.addArrayItem( scenario.getRenderItems() );
    collision.addArrayItem( scenario.getLayerItems() );

  // # Render

    var renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
    var renderAnimated = new Render(contextAnimated, canvasAnimated); //Render with animated objects only

    // Add items to be rendered

    renderStatic.setScenario(scenario); // set the scenario
    renderStatic.addArrayItem(scenario.getRenderItems()); // Get all items from the scenario that needs to be rendered

    renderAnimated.addArrayItem( scenario.getLayerItems() ); // Get all animated items from the scenario that needs to be rendered
    renderAnimated.addItem( player ); // Adds the player to the animation render


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

        renderAnimated.start( deltaTime );

      }

    }

  // # Starts the game

    renderStatic.start( deltaTime );  // Render the static layers only once
    runGame( gameProps.getProp('fps') );	// GO GO GO

}
},{"./assets/player":1,"./assets/scenario/Prototype/scenarioPrototype":2,"./engine/collision":11,"./engine/render":12,"./gameProperties":14}],14:[function(require,module,exports){
// Game Properties class to define configurations
class gameProperties {

  constructor() {
    // Canvas size based on "chunks" 
    this.chunkSize = 100; //px - resolution
    this.screenHorizontalChunks = 11;
    this.screenVerticalChunks = 11;
    this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
    this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);// Canvas size based on "chunks" 
    this.chunkSize = 100; //px - resolution
    this.screenHorizontalChunks = 11;
    this.screenVerticalChunks = 11;
    this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
    this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);

    this.fps = 30;
  }

  getProp(prop) {
    return this[prop];
  }

}
module.exports = gameProperties

window.debug = false;
},{}]},{},[1,2,3,4,5,6,7,8,9,10,14,13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL3BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3RhZ2VzL3N0YWdlXzEuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9CZWFjaF9GbG9vci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL0JlYWNoX1dhbGwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL2NvbW1vbi9UZWxlcG9ydC5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vY29tbW9uL19Db2xsaWRhYmxlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX1NjZW5hcmlvLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vX1N0YWdlLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vZW5lbV9wcm90b3R5cGUuanMiLCJjbGllbnQvZW5naW5lL2NvbGxpc2lvbi5qcyIsImNsaWVudC9lbmdpbmUvcmVuZGVyLmpzIiwiY2xpZW50L2dhbWUuanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNsYXNzIFBsYXllciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHgwLCB5MCwgZ2FtZVByb3BzKSB7XHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgICAvL3RoaXMucGxheWVyU3ByaXRlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIC8vdGhpcy5wbGF5ZXJTcHJpdGUuc3JjID0gJy4vYXNzZXRzL3Nwcml0ZXMvcGxheWVyX29uZS5wbmcnO1xyXG4gICAgICB0aGlzLnBsYXllclNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcGxheWVyX29uZScpOyAvLyBQZWdhciBlc3NlIGlkIGRhIGluc3RhbmNpYSEhXHJcbiAgICAgIFxyXG4gICAgICAvLyBodHRwOi8vZ2V0c3ByaXRleHkuY29tLyA8PSBQYXJhIG1hcGVhciBvcyBzcHJpdGVzIVxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzID0ge1xyXG4gICAgICAgIHNwcml0ZV93aWR0aDogMjAsIC8vIFBsYXllciBzaXplIGluc2lkZSBzcHJpdGVcclxuICAgICAgICBzcHJpdGVfaGVpZ2h0OiA0MFxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuc3RlcCA9IFtdO1xyXG4gICAgICB0aGlzLmRlZmF1bHRTdGVwID0gMTtcclxuICAgICAgdGhpcy5pbml0aWFsU3RlcCA9IDM7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgdGhpcy5tYXhTdGVwcyA9IDg7XHJcblxyXG4gICAgICAvLyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBBbmltYXRpb25cclxuICAgICAgdGhpcy5mcHNJbnRlcnZhbCA9IDEwMDAgLyAxMjsgLy8gMTAwMCAvIEZQU1xyXG4gICAgICB0aGlzLmRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgICBcclxuICAgIC8vICMgUG9zaXRpb25cclxuICAgICAgdGhpcy54ID0geDA7XHJcbiAgICAgIHRoaXMueSA9IHkwO1xyXG4gICAgICBcclxuICAgICAgdGhpcy54MCA9IHgwOyAvLyBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICAgIHRoaXMueTAgPSB5MDtcclxuXHJcbiAgICAgIHRoaXMuY2h1bmtTaXplID0gZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG5cclxuICAgICAgdGhpcy5sb29rRGlyZWN0aW9uID0gdGhpcy5sb29rRG93bigpO1xyXG5cclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5jaHVua1NpemU7IC8vcHhcclxuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNodW5rU2l6ZSAqIDI7IC8vcHhcclxuICAgICAgdGhpcy5zcGVlZDAgPSA2O1xyXG4gICAgICB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgLyB0aGlzLnNwZWVkMDtcclxuXHJcbiAgICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gdHJ1ZTtcclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTcHJpdGVzIHN0YXRlIGZvciBwbGF5ZXIgZGlyZWN0aW9uXHJcbiAgICBcclxuICAgIGxvb2tEb3duKCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2Rvd24nO1xyXG4gICAgICBcclxuICAgICAgLy8gU3RlcHNcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNF0gPSB7IHg6IDYwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzddID0geyB4OiAxMjAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tVcCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICd1cCc7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogNDAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9va1JpZ2h0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ3JpZ2h0JztcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzJdID0geyB4OiAyMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzVdID0geyB4OiA4MCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbOF0gPSB7IHg6IDE0MCwgeTogODAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgICAgICBcclxuXHRcdGxvb2tMZWZ0KCl7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuZGlyZWN0aW9uID0gJ2xlZnQnO1xyXG4gICAgICAgICAgXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbM10gPSB7IHg6IDQwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNl0gPSB7IHg6IDEwMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDEyMCB9O1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ggPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLng7XHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS55O1xyXG4gICAgfVxyXG5cclxuICAvLyAjIENvbnRyb2xzIHRoZSBwbGF5ZXIgRlBTIE1vdmVtZW50IGluZGVwZW5kZW50IG9mIGdhbWUgRlBTXHJcbiAgICBjYW5SZW5kZXJOZXh0RnJhbWUoKSB7XHJcbiAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRsZXQgZWxhcHNlZCA9IG5vdyAtIHRoaXMuZGVsdGFUaW1lO1xyXG4gICAgICBpZiAoZWxhcHNlZCA+IHRoaXMuZnBzSW50ZXJ2YWwpIHtcclxuXHQgICAgICB0aGlzLmRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgdGhpcy5mcHNJbnRlcnZhbCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHRcdH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICBcclxuICAgIFxyXG5cdC8vICMgUGxheWVyIE1vdmVtZW50XHJcblx0XHRcclxuXHRcdG1vdkxlZnQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlJpZ2h0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlVwKCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdkRvd24oKSB7ICBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIH07XHJcblxyXG4gICAgaGFuZGxlTW92ZW1lbnQoIGtleXNEb3duICkge1xyXG4gICAgICBcclxuICAgICAgaWYgKDM3IGluIGtleXNEb3duKSAvLyBMZWZ0XHJcbiAgICAgICAgdGhpcy5tb3ZMZWZ0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgIGlmICgzOCBpbiBrZXlzRG93bikgLy8gVXAgIFxyXG4gICAgICAgIHRoaXMubW92VXAoKTtcclxuICAgICAgICBcclxuICAgICAgaWYgKDM5IGluIGtleXNEb3duKSAvLyBSaWdodFxyXG4gICAgICAgIHRoaXMubW92UmlnaHQoKTtcclxuXHJcbiAgICAgIGlmICg0MCBpbiBrZXlzRG93bikgLy8gRG93blxyXG4gICAgICAgIHRoaXMubW92RG93bigpO1xyXG5cclxuICAgIH1cclxuXHRcdFxyXG5cdC8vICMgU2V0c1xyXG5cdFx0XHJcblx0XHRzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG5cdFx0c2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHJcblx0XHRzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHRcdFx0XHJcblx0XHRzZXRTcGVlZChzcGVlZCkgeyB0aGlzLnNwZWVkID0gdGhpcy5jaHVua1NpemUgLyBzcGVlZDsgfVxyXG5cclxuXHRcdHNldExvb2tEaXJlY3Rpb24obG9va0RpcmVjdGlvbikgeyB0aGlzLmxvb2tEaXJlY3Rpb24gPSBsb29rRGlyZWN0aW9uOyB9XHJcblx0XHRzZXRMb29rRGlyZWN0aW9uVmFsKHN0cmluZykgeyB0aGlzLmxvb2tEaXJlY3Rpb25WYXIgPSBzdHJpbmc7IH1cclxuXHJcblx0XHRyZXNldFBvc2l0aW9uKCkge1xyXG5cdFx0XHR0aGlzLnNldFgoIHRoaXMueDAgKTtcclxuXHRcdCAgdGhpcy5zZXRZKCB0aGlzLnkwICk7XHJcblx0XHR9XHJcblx0XHRcclxuXHQvLyAjIEdldHNcclxuXHRcdFx0XHJcblx0ICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcblx0XHRnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFxyXG5cdCAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgICBcclxuICAgIC8vVGhlIGNvbGxpc2lvbiB3aWxsIGJlIGp1c3QgaGFsZiBvZiB0aGUgcGxheWVyIGhlaWdodFxyXG4gICAgZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQgLyAyOyB9XHJcbiAgICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy54OyB9XHJcbiAgICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMueSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCk7IH1cclxuICAgIGdldENlbnRlclkoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCk7IH1cclxuXHRcdFx0XHJcblx0XHRnZXRDb2xvcigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuXHRcdGdldFNwZWVkKCkgeyByZXR1cm4gdGhpcy5zcGVlZDsgfVxyXG4gICAgICBcclxuICAgIGdldFNwcml0ZVByb3BzKCkgeyByZXR1cm4gdGhpcy5zcHJpdGVQcm9wczsgfVxyXG4gICAgICBcclxuICAgIGluY3JlYXNlU3RlcCgpIHtcclxuICAgICAgaWYodGhpcy5jYW5SZW5kZXJOZXh0RnJhbWUoKSkge1xyXG4gICAgICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICAgICAgaWYoIHRoaXMuc3RlcENvdW50ID4gdGhpcy5tYXhTdGVwcyApIHtcclxuICAgICAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5pbml0aWFsU3RlcDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc2V0U3RlcCgpIHtcclxuICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmRlZmF1bHRTdGVwO1xyXG4gICAgICBzd2l0Y2ggKCB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiApIHtcclxuICAgICAgICBjYXNlICdsZWZ0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAncmlnaHQnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndXAnOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZG93bic6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblx0XHRcclxuXHQvLyAjIFBsYXllciBSZW5kZXJcclxuXHRcdFx0XHRcclxuXHQgIHJlbmRlcihjdHgpIHtcclxuICAgICAgICBcclxuICAgICAgLy8gV2hhdCB0byBkbyBldmVyeSBmcmFtZSBpbiB0ZXJtcyBvZiByZW5kZXI/IERyYXcgdGhlIHBsYXllclxyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgICAgfSBcclxuICAgICAgXHJcbiAgICAgIC8qcGxheWVyU3ByaXRlLm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyAvLyBvbmxvYWQgbsOjbyBxdWVyIGNhcnJlZ2FyIG5vIHBsYXllci4ucHEgPz9cclxuICAgICAgICBjdHguZHJhd0ltYWdlKHBsYXllclNwcml0ZSwgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaCk7XHRcclxuICAgICAgfVx0Ki9cclxuICAgICAgLy9kcmF3SW1hZ2UoaW1nLHN4LHN5LHN3aWR0aCxzaGVpZ2h0LHgseSx3aWR0aCxoZWlnaHQpO1xyXG4gICAgICAvLyAjIGh0dHBzOi8vd3d3Lnczc2Nob29scy5jb20vdGFncy9jYW52YXNfZHJhd2ltYWdlLmFzcFxyXG4gICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgIGN0eC5kcmF3SW1hZ2UoXHJcbiAgICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUsICBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCwgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV9oZWlnaHQsIFxyXG4gICAgICAgIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmhcclxuICAgICAgKTtcdFxyXG4gICAgICAvLyBERUJVRyBDT0xMSVNJT05cclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwxMDAsIDAuNSlcIjtcclxuICAgICAgICBjdHguZmlsbFJlY3QoIHRoaXMucHJvcHMueCwgdGhpcy5nZXRDb2xsaXNpb25ZKCksIHRoaXMucHJvcHMudywgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKSApO1xyXG4gICAgICB9XHJcblx0XHR9O1xyXG4gIFxyXG4gIC8vICMgQ29sbGlzaW9uXHJcbiAgXHJcblx0XHRub0NvbGxpc2lvbigpIHtcclxuXHRcdFx0Ly8gV2hhdCBoYXBwZW5zIGlmIHRoZSBwbGF5ZXIgaXMgbm90IGNvbGxpZGluZz9cclxuXHRcdFx0dGhpcy5zZXRTcGVlZCh0aGlzLnNwZWVkMCk7IC8vIFJlc2V0IHNwZWVkXHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgY29sbGlzaW9uKG9iamVjdCkge1xyXG4gICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfTtcclxuXHRcdFxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XHJcbiIsIi8qXHJcblx0UHJvdG90eXBlIFNjZW5hcmlvXHJcbiovXHJcbmNvbnN0IF9TY2VuYXJpbyA9IHJlcXVpcmUoJy4uL2NvbW1vbi9fU2NlbmFyaW8nKTtcclxuXHJcbmNvbnN0IFByb3RvdHlwZV9TdGFnZV8xID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfMScpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9Qcm90b3R5cGUgZXh0ZW5kcyBfU2NlbmFyaW8ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzKXtcclxuXHRcdHN1cGVyKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMpO1xyXG5cdFx0dGhpcy5ydW4oKTtcclxuXHR9XHJcblxyXG4gICAgICBcclxuXHQvLyAjIFN0YWdlc1xyXG5cdHNldFN0YWdlKHN0YWdlX251bWJlcikge1xyXG5cclxuXHRcdGxldCBzdGFnZV8wMSA9IG5ldyBQcm90b3R5cGVfU3RhZ2VfMSggdGhpcy5jaHVua1NpemUgKTtcclxuICAgICAgICAgIFxyXG5cdFx0c3dpdGNoKHN0YWdlX251bWJlcikge1xyXG5cdFx0XHRjYXNlIDE6XHJcblx0XHRcdFx0dGhpcy5zdGFnZSA9IHN0YWdlXzAxO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5sb2FkU3RhZ2UoKTtcclxuXHR9XHJcblx0XHJcblx0Ly8gRnVuY3Rpb25zIHRvIGxvYWQgc2VsZWN0ZWQgc3RhZ2VcclxuXHRsb2FkU3RhZ2UoKSB7XHJcbiAgICAgICAgICAgIFxyXG5cdFx0Ly8gQ2xlYXIgcHJldmlvdXMgcmVuZGVyIGl0ZW1zXHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuXHJcblx0XHQvLyBBZGQgdGhlIFN0YXRpYyBJdGVtc1xyXG5cdFx0dGhpcy5zdGFnZS5nZXRTdGF0aWNJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcblx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbShpdGVtKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdC8vIEFkZCB0aGUgQW5pbWF0ZWQgSXRlbXNcclxuXHRcdHRoaXMuc3RhZ2UuZ2V0TGF5ZXJJdGVtcygpLm1hcCggKGl0ZW0pID0+IHsgXHJcblx0XHRcdHRoaXMuYWRkUmVuZGVyTGF5ZXJJdGVtKGl0ZW0pO1xyXG5cdFx0fSk7XHJcbiAgICBcclxuICAgIHRoaXMuc2V0UGxheWVyU3RhcnRYKCB0aGlzLnN0YWdlLmdldFBsYXllclN0YXJ0WCgpICk7XHJcbiAgICB0aGlzLnNldFBsYXllclN0YXJ0WSggdGhpcy5zdGFnZS5nZXRQbGF5ZXJTdGFydFkoKSApO1xyXG5cclxuXHR9XHJcblxyXG5cdC8vICMgUnVuIHdoZW4gY2xhc3MgbG9hZHNcclxuXHRydW4oKSB7XHJcblx0XHRcclxuXHRcdC8vIFNldCBEZWZhdWx0IFN0YWdlXHJcblx0XHR0aGlzLnNldFN0YWdlKDEpOyBcclxuXHRcdFx0XHRcclxuXHR9XHJcblxyXG59Ly9jbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzY2VuYXJpb1Byb3RvdHlwZTsiLCIvLyBTdGFnZSAwMVxyXG5jb25zdCBfU3RhZ2UgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vX1N0YWdlJyk7XHJcblxyXG5jb25zdCBCZWFjaF9XYWxsID0gcmVxdWlyZSgnLi4vLi4vY29tbW9uL0JlYWNoX1dhbGwnKTtcclxuY29uc3QgQmVhY2hfRmxvb3IgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vQmVhY2hfRmxvb3InKTtcclxuY29uc3QgVGVsZXBvcnQgPSByZXF1aXJlKCcuLi8uLi9jb21tb24vVGVsZXBvcnQnKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV8xIGV4dGVuZHMgX1N0YWdle1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHN1cGVyKGNodW5rU2l6ZSk7XHJcblxyXG4gICAgbGV0IHBsYXllclN0YXJ0WCA9IGNodW5rU2l6ZSAqIDM7XHJcbiAgICBsZXQgcGxheWVyU3RhcnRZID0gY2h1bmtTaXplICogNDtcclxuXHJcbiAgICB0aGlzLnJ1bihwbGF5ZXJTdGFydFgsIHBsYXllclN0YXJ0WSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCZWFjaF9XYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEJlYWNoX0Zsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwidGVsZXBvcnRcIjpcclxuICAgICAgICByZXR1cm4gbmV3IFRlbGVwb3J0KGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUsIGl0ZW0udGFyZ2V0Q29vcmQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICBzY2VuYXJpb0Rlc2lnbigpIHtcclxuXHJcbiAgICAvLyBXYWxsc1xyXG4gICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICBsZXQgd2wgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImxlZnRcIn07XHJcbiAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICBcclxuICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgbGV0IHdjX2JsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX2xlZnRcIn07XHJcbiAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICBcclxuICAgIGxldCB3dHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcIndhdGVyXCJ9O1xyXG4gICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICBcclxuICAgIC8vIEZsb29yXHJcbiAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG5cclxuICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgIFsgd3RyLCB3dHIsICAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgd3RyLCAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsIHdjX3RsLCB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjEsICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYyLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgWyB3dHIsIHdjX2JsLCB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3Y19iciwgIHd0ciBdLFxyXG4gICAgXTtcclxuXHJcbiAgICAvLyAjIFByb2NjZXNzIHNjZW5hcmlvIGRlc2lnblxyXG4gICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHgpID0+IHtcclxuICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeSkgPT4ge1xyXG4gICAgICBpZiggIWl0ZW0gKSByZXR1cm47IC8vIEp1bXAgZmFsc2UgZWxlbWVudHNcclxuICAgICAgbGV0IHgwID0geSAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICBsZXQgeTAgPSB4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgIHRoaXMuYWRkUmVuZGVySXRlbSh0aGlzLmdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgwLCB5MCkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTY2VuYXJpbyBBbmltYXRlZCBpdGVtc1xyXG4gIHNjZW5hcmlvRGVzaWduTGF5ZXIoKSB7XHJcblxyXG4gICAgLy8gVGVsZXBvcnRcclxuICAgIGxldCB0cCA9IHsgbmFtZTogXCJ0ZWxlcG9ydFwiLCB0eXBlOiBcIlwiLCB0YXJnZXRDb29yZDogWzMsIDldIH07XHJcbiAgICBcclxuICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIHRwLCAgICAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgICAgWyBmYWxzZSwgZmFsc2UsICAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgIGZhbHNlLCAgICAgZmFsc2UgXSxcclxuICAgIF07XHJcblxyXG4gICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB4KSA9PiB7XHJcbiAgICAgIGFycmF5Lm1hcCggKGl0ZW0sIHkpID0+IHtcclxuICAgICAgaWYoICFpdGVtICkgcmV0dXJuOyAvLyBKdW1wIGZhbHNlIGVsZW1lbnRzXHJcbiAgICAgIGxldCB4MCA9IHkgKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgbGV0IHkwID0geCAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICB0aGlzLmFkZFJlbmRlckxheWVySXRlbSggdGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTApICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgXHJcbiAgfVxyXG5cclxuICBydW4oc2V0UGxheWVyU3RhcnRYLCBzZXRQbGF5ZXJTdGFydFkpIHtcclxuICAgIHRoaXMuc2V0UGxheWVyU3RhcnRYKHNldFBsYXllclN0YXJ0WCk7XHJcbiAgICB0aGlzLnNldFBsYXllclN0YXJ0WShzZXRQbGF5ZXJTdGFydFkpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbkxheWVyKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfMVxyXG5cclxuXHJcblxyXG5cclxuLypcclxuICAgIC8vICMgVGV4dHVyZXNcclxuXHRcclxuXHRcdFx0XHRcdHRoaXMuYmdJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0XHRcdFx0dGhpcy5iZ0ltYWdlLnNyYyA9ICcuL2Fzc2V0cy9zY2VuYXJpby93ZWxjb21lL2ltZy9iYWNrZ3JvdW5kLmpwZyc7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHRoaXMuYmFja2dyb3VuZCA9IHRoaXMuY3R4LmNyZWF0ZVBhdHRlcm4odGhpcy5iZ0ltYWdlLCAncmVwZWF0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gXCIjMzMzXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAvLyAjIE9ic3RhY2xlc1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBTY2VuYXJpbyBCb3JkZXJzXHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsVG9wXCIsIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuY2h1bmtTaXplKSApOyAvL2NvbnRleHQsIG5hbWUsIHgwLCB5MCwgdywgaCxcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGxCb3R0b21cIiwgMCwgdGhpcy5oZWlnaHQgLSB0aGlzLmNodW5rU2l6ZSwgdGhpcy53aWR0aCwgdGhpcy5jaHVua1NpemUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsTGVmdFwiLCAwLCAwLCB0aGlzLmNodW5rU2l6ZSwgdGhpcy5oZWlnaHQpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsUmlnaHRcIiwgdGhpcy53aWR0aC10aGlzLmNodW5rU2l6ZSwgMCwgdGhpcy5jaHVua1NpemUsIHRoaXMuaGVpZ2h0KSApO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdC8vIFdhbGxzXHJcblx0XHRcdFx0XHQvKlxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDAxXCIsIDIwLCA3MywgNDA1LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwMlwiLCA5MCwgMTkwLCA4MCwgODApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDNcIiwgNTAzLCAxOSwgNDAsIDQ2NSkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNFwiLCAyODMsIDQ4MSwgNDQwLCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNVwiLCAyNDQsIDI5MiwgNDAsIDIyOSkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNlwiLCAyODMsIDM2NywgMTM5LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwN1wiLCA3OCwgNDAzLCAxNjksIDQwKSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDA4XCIsIDUzNiwgMTg5LCA3OSwgNDApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDlcIiwgNjY5LCA3NywgNDAsIDI4OCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwxMFwiLCA2NjksIDM2NSwgMTEyLCA0MCkgKTtcdFxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDYwNCwgNzcsIDY3LCA0MCkgKTtcdFxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDMxOCwgMTcyLCA5MywgOTUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMTFcIiwgODIsIDUxMCwgNzUsIDc0KSApO1x0XHJcblx0XHRcdFx0XHQqL1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBTY2VuYXJpbyByYW5kb20gb2JzdGFjbGVzXHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Ly9Qb3dlclxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdC8vIFBvc3NpYmxlcyB4LCB5LCB3LCBoIGZvciBQb3dlclxyXG5cdFx0XHRcdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdFx0XHR2YXIgYVBvd2VyID0gQXJyYXkoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YVBvd2VyLnB1c2goIHsgeDogMTM3LCB5OiAyMCwgdzogMTY3LCBoOiA1MyB9KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YVBvd2VyLnB1c2goIHsgeDogNDIyLCB5OiAzNjgsIHc6IDgwLCBoOiAzOCB9KTsgXHJcblx0XHRcdFx0XHRcdFx0XHRcdGFQb3dlci5wdXNoKCB7IHg6IDU0MywgeTogNDA2LCB3OiAyMzYsIGg6IDc1IH0pOyBcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dmFyIHJQb3dlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMDtcdFx0XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgUG93ZXIoY3R4LCBcInBvd2VyMDFcIiwgYVBvd2VyW3JQb3dlcl0ueCwgYVBvd2VyW3JQb3dlcl0ueSwgYVBvd2VyW3JQb3dlcl0udywgYVBvd2VyW3JQb3dlcl0uaCkgKTtcdFxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBXYXRlclxyXG5cdFx0XHRcdFx0Ly90aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYXRlcihjdHgsIFwicG93ZXIwMVwiLCAzMDAsIDUyMSwgMTkwLCA1OSkgKTtcclxuXHJcblx0XHRcdFx0XHQvLyBFeGl0XHJcblx0XHRcdFx0XHQvL3RoaXMuYWRkUmVuZGVySXRlbUFuaW1hdGVkKCBuZXcgRXhpdChjdHgsIFwiZXhpdFwiLCA1MCwgMzAsIDEwLCAxMCkgKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gRW5lbWllc1xyXG5cdFx0XHRcdFx0XHQvL2N0eCwgY29saXNhbywgbmFtZSwgeDAsIHkwLCB0aXBvTW92LCBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBzcGVlZCBcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvL3RoaXMuYWRkUmVuZGVySXRlbUFuaW1hdGVkKCBuZXcgRW5lbXkoY3R4LCB0aGlzLnBsYXllciwgXCJlbmVteTAxXCIsIDE1MCwgMzQwLCAnaG9yJywgMjUsIDIzMCwgMCwgMCwgMC4wNSkgKTsgXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0ICAgXHJcbiovIiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBCZWFjaF9GbG9vciBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUpIHtcclxuICAgIFxyXG4gICAgbGV0IHN0b3BPbkNvbGxpc2lvbiA9IGZhbHNlO1xyXG4gICAgbGV0IGhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGxldCBuYW1lID0gXCJCZWFjaCBGbG9vclwiO1xyXG5cclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICBsZXQgc3ByaXRlV2lkdGggPSAxNjtcclxuICAgIGxldCBzcHJpdGVIZWlnaHQgPSAxNjtcclxuICAgIGxldCBzdGFnZVNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfYmVhY2gnKTsgLy8gVEVNUE9SQVJZXHJcbiAgICAvL3RoaXMuc3RhZ2VTcHJpdGUgPSBuZXcgSW1hZ2UoKTtcclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZS5zcmMgPSAnL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3ByaXRlcy9wcm90b3R5cGUucG5nJztcclxuXHJcbiAgICBzdXBlcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSwgc3RhZ2VTcHJpdGUsIHNwcml0ZVdpZHRoLCBzcHJpdGVIZWlnaHQsIHN0b3BPbkNvbGxpc2lvbiwgaGFzQ29sbGlzaW9uRXZlbnQsIG5hbWUpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXMgIFxyXG4gIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICBcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDFcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDksIFxyXG4gICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIFxyXG4gICAgICBjYXNlIFwiMDJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDk0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG5cclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBCZWFjaF9GbG9vcjsiLCJjb25zdCBfQ29sbGlkYWJsZSA9IHJlcXVpcmUoJy4vX0NvbGxpZGFibGUnKTtcclxuXHJcbmNsYXNzIEJlYWNoX3dhbGwgZXh0ZW5kcyBfQ29sbGlkYWJsZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICBcclxuICAgIGxldCBzdG9wT25Db2xsaXNpb24gPSB0cnVlO1xyXG4gICAgbGV0IGhhc0NvbGxpc2lvbkV2ZW50ID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGxldCBuYW1lID0gXCJCZWFjaCBXYWxsXCI7XHJcblxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIGxldCBzcHJpdGVXaWR0aCA9IDE2O1xyXG4gICAgbGV0IHNwcml0ZUhlaWdodCA9IDE2O1xyXG4gICAgbGV0IHN0YWdlU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9iZWFjaCcpOyAvLyBURU1QT1JBUllcclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlLnNyYyA9ICcvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zcHJpdGVzL3Byb3RvdHlwZS5wbmcnO1xyXG5cclxuICAgIHN1cGVyKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplLCBzdGFnZVNwcml0ZSwgc3ByaXRlV2lkdGgsIHNwcml0ZUhlaWdodCwgc3RvcE9uQ29sbGlzaW9uLCBoYXNDb2xsaXNpb25FdmVudCwgbmFtZSk7XHJcblxyXG4gIH1cclxuXHJcbiAgLy8gIyBTcHJpdGVzXHJcbiAgICBcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgXHJcbiAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICBcclxuICAgICAgY2FzZSBcInRvcFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTk3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiA0MDksIGNsaXBfeTogMjE0LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMzkyLCBjbGlwX3k6IDIxNCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImJvdHRvbVwiOlxyXG4gICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTgwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNDc3LCBjbGlwX3k6IDEwLCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwiY29ybmVyX2JvdHRvbV9sZWZ0XCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogNTQ1LCBjbGlwX3k6IDI3LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICBjYXNlIFwid2F0ZXJcIjpcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgIGNsaXBfeDogMzc1LCBjbGlwX3k6IDI5OSwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgY2FzZSBcIm9ic3RhY2xlXCI6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDQwLCBjbGlwX3k6IDc1LCBcclxuICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IEJlYWNoX3dhbGw7IiwiY29uc3QgX0NvbGxpZGFibGUgPSByZXF1aXJlKCcuL19Db2xsaWRhYmxlJyk7XHJcblxyXG5jbGFzcyBUZWxlcG9ydCBleHRlbmRzIF9Db2xsaWRhYmxlIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUpIHtcclxuICAgIFxyXG4gICAgbGV0IHN0b3BPbkNvbGxpc2lvbiA9IGZhbHNlO1xyXG4gICAgbGV0IGhhc0NvbGxpc2lvbkV2ZW50ID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgbGV0IG5hbWUgPSBcIlRlbGVwb3J0XCI7XHJcblxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIGxldCBzcHJpdGVXaWR0aCA9IDE2O1xyXG4gICAgbGV0IHNwcml0ZUhlaWdodCA9IDE2O1xyXG5cdCAgbGV0IHN0YWdlU3ByaXRlID0gZmFsc2U7XHJcblx0XHJcbiAgICBzdXBlcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSwgc3RhZ2VTcHJpdGUsIHNwcml0ZVdpZHRoLCBzcHJpdGVIZWlnaHQsIHN0b3BPbkNvbGxpc2lvbiwgaGFzQ29sbGlzaW9uRXZlbnQsIG5hbWUpO1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICAvLyAjIFNwcml0ZXNcclxuICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICBjbGlwX3g6IDAsIGNsaXBfeTogMCwgXHJcbiAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBDb2xsaXNpb24gRXZlbnRcclxuICBjb2xsaXNpb24ob2JqKXsgXHJcbiAgICAvL3NldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBvYmoucmVzZXRQb3NpdGlvbigpO1xyXG4gICAgLy99LCA0MDApO1xyXG4gIH1cclxuXHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gVGVsZXBvcnQ7IiwiY2xhc3MgX0NvbGxpZGFibGUge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih0eXBlLCB4MCwgeTAsIGNodW5rU2l6ZSwgc3RhZ2VTcHJpdGUsIHNwcml0ZVdpZHRoLCBzcHJpdGVIZWlnaHQsIHN0b3BPbkNvbGxpc2lvbiwgaGFzQ29sbGlzaW9uRXZlbnQsIG5hbWUpIHtcclxuICAgICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4MDtcclxuICAgIHRoaXMueSA9IHkwO1xyXG4gICAgICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IGNodW5rU2l6ZTsgLy9weFxyXG4gICAgdGhpcy5oZWlnaHQgPSBjaHVua1NpemU7XHJcblxyXG4gICAgdGhpcy5zdG9wT25Db2xsaXNpb24gPSBzdG9wT25Db2xsaXNpb247XHJcbiAgICB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50ID0gaGFzQ29sbGlzaW9uRXZlbnQ7XHJcblxyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5zdGFnZVNwcml0ZSA9IHN0YWdlU3ByaXRlO1xyXG5cclxuICAgIHRoaXMuc3ByaXRlV2lkdGggPSBzcHJpdGVXaWR0aDsgICBcclxuICAgIHRoaXMuc3ByaXRlSGVpZ2h0ID0gc3ByaXRlSGVpZ2h0OyBcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLnJ1biggdHlwZSApO1xyXG5cclxuICB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gICAgXHJcbiAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgc2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG4gIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgXHJcbiAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAvLyAhIE11c3QgaGF2ZSBpbiBjaGlsZHMgQ2xhc3NcclxuICB9XHJcblx0XHRcdFxyXG5cdC8vICMgR2V0c1xyXG5cdFx0XHRcclxuICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgZ2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG4gIFxyXG4gIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gIGdldEhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblxyXG4gIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgZ2V0Q29sbGlzaW9uWCgpIHsgIHJldHVybiB0aGlzLng7IH1cclxuICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMueTsgfVxyXG5cclxuICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCk7IH1cclxuICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblx0XHRcclxuXHQvLyAjIFJlbmRlclxyXG4gIHJlbmRlcihjdHgpIHtcclxuICAgICAgXHJcbiAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICB5OiB0aGlzLmdldFkoKSxcclxuICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICB9IFxyXG4gICAgbGV0IHNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGVQcm9wcztcclxuICAgIFxyXG4gICAgaWYoIHRoaXMuc3RhZ2VTcHJpdGUgKSB7IC8vIE9ubHkgcmVuZGVyIHRleHR1cmUgaWYgaGF2ZSBpdCBzZXRcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3RhZ2VTcHJpdGUsICBcclxuICAgICAgICBzcHJpdGVQcm9wcy5jbGlwX3gsIHNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCBzcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgLy9ERUJVRyBDaHVuayBTaXplXHJcbiAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDAsMC40KVwiO1xyXG4gICAgICBjdHguZmlsbFJlY3QocHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaCk7XHJcbiAgICAgIGN0eC5yZWN0KHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1xyXG4gICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICB9XHJcbiAgXHJcbiAgfVxyXG4gICAgXHJcbiAgLy8gSGFzIGEgY29sbGlzaW9uIEV2ZW50P1xyXG4gIHRyaWdnZXJzQ29sbGlzaW9uRXZlbnQoKSB7IHJldHVybiB0aGlzLmhhc0NvbGxpc2lvbkV2ZW50OyB9XHJcblxyXG4gIC8vIFdpbGwgaXQgU3RvcCB0aGUgb3RoZXIgb2JqZWN0IGlmIGNvbGxpZGVzP1xyXG4gIHN0b3BJZkNvbGxpc2lvbigpIHsgcmV0dXJuIHRoaXMuc3RvcE9uQ29sbGlzaW9uOyB9XHJcblxyXG4gIC8vIENvbGxpc2lvbiBFdmVudFxyXG4gIGNvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBObyBDb2xsaXNpb24gRXZlbnRcclxuICBub0NvbGxpc2lvbihvYmplY3QpeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAvLyBSdW5zIHdoZW4gQ2xhc3Mgc3RhcnRzICBcclxuICBydW4oIHR5cGUgKSB7XHJcbiAgICB0aGlzLnNldFNwcml0ZVR5cGUodHlwZSk7XHJcbiAgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfQ29sbGlkYWJsZTsiLCJjbGFzcyBfU2NlbmFyaW8ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzKXtcclxuXHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0XHRcclxuXHRcdHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHRoaXMucmVuZGVyTGF5ZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0XHJcblx0XHR0aGlzLndpZHRoID0gY2FudmFzLndpZHRoO1xyXG4gICAgdGhpcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgXHJcbiAgICB0aGlzLnBsYXllclN0YXJ0WCA9IDA7IFxyXG4gICAgdGhpcy5wbGF5ZXJTdGFydFkgPSAwOyBcclxuXHJcbiAgICB0aGlzLnN0YWdlID0gW107XHJcblxyXG5cdFx0dGhpcy5jaHVua1NpemUgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2h1bmtTaXplJyk7XHJcblxyXG5cdFx0dGhpcy5ydW4oKTtcclxuXHR9XHJcblxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRSZW5kZXJJdGVtKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHRhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgXHJcblx0Ly8gIyBHZXRzXHJcblx0Z2V0Q3R4KCkgeyByZXR1cm4gdGhpcy5jdHg7IH1cclxuXHRnZXRDYW52YXMoKSB7IHJldHVybiB0aGlzLmNhbnZhczsgfVx0XHJcblx0XHRcdFx0XHJcblx0Z2V0UmVuZGVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcblx0Z2V0TGF5ZXJJdGVtcygpIHsgIHJldHVybiB0aGlzLnJlbmRlckxheWVySXRlbXM7IH1cclxuICBcclxuICBnZXRQbGF5ZXJTdGFydFgoKSB7IHJldHVybiB0aGlzLnBsYXllclN0YXJ0WDsgfVxyXG4gIGdldFBsYXllclN0YXJ0WSgpIHsgcmV0dXJuIHRoaXMucGxheWVyU3RhcnRZOyB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllclN0YXJ0WCh4KSB7IHRoaXMucGxheWVyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllclN0YXJ0WSh5KSB7IHRoaXMucGxheWVyU3RhcnRZID0geTsgfVxyXG5cclxuICByZW5kZXIoKSB7IH1cclxuXHJcblx0Ly8gIyBSdW4gd2hlbiBjbGFzcyBsb2Fkc1xyXG5cdHJ1bigpIHsgfVxyXG5cclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBfU2NlbmFyaW87IiwiY2xhc3MgX1N0YWdlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckxheWVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldExheWVySXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJMYXllckl0ZW1zOyB9XHJcbiAgXHJcbiAgZ2V0UGxheWVyU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5wbGF5ZXJTdGFydFg7IH1cclxuICBnZXRQbGF5ZXJTdGFydFkoKSB7IHJldHVybiB0aGlzLnBsYXllclN0YXJ0WTsgfVxyXG4gIFxyXG4gIC8vICMgU2V0c1xyXG4gIHNldFBsYXllclN0YXJ0WCh4KSB7IHRoaXMucGxheWVyU3RhcnRYID0geDsgfVxyXG4gIHNldFBsYXllclN0YXJ0WSh5KSB7IHRoaXMucGxheWVyU3RhcnRZID0geTsgfVxyXG4gIFxyXG4gIC8vICMgQWRkIEl0ZW1zIHRvIHRoZSByZW5kZXJcclxuXHRhZGRSZW5kZXJJdGVtKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcy5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHRhZGRSZW5kZXJMYXllckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckxheWVySXRlbXMucHVzaChpdGVtKTtcclxuICB9XHJcbiAgXHJcbiAgcnVuICgpIHsgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IF9TdGFnZTsiLCIvLyBPYnN0YWNsZSBjbGFzc1xyXG5cclxuXHRmdW5jdGlvbiBFbmVteShjdHgsIHBsYXllciwgbmFtZSwgeDAsIHkwLCBtb3ZUeXBlLCBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBzcGVlZCApIHtcclxuXHRcdFxyXG5cdFx0Ly8gLSAtIC0gSW5pdCAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdC8vICMgUG9zaXRpb25cclxuXHRcdFx0XHR0aGlzLnggPSB4MDtcclxuXHRcdFx0XHR0aGlzLnkgPSB5MDtcclxuXHRcdFx0XHRcclxuXHRcdFx0Ly8gIyBQcm9wZXJ0aWVzXHJcblx0XHRcdFx0dGhpcy53aWR0aCA9IDEwOyAvL3B4XHJcblx0XHRcdFx0dGhpcy5oZWlnaHQgPSA1MDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmNvbG9yID0gXCIjRjAwXCI7IFxyXG5cdFx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0XHRcdFx0dGhpcy5zcGVlZCA9IHNwZWVkO1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8gIyBNb3ZlbWVudFxyXG5cdFx0XHRcdHRoaXMucGxheWVyID0gcGxheWVyO1xyXG5cdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdiA9IG1vdlR5cGU7IC8vaG9yLCB2ZXIgPC0gbW92ZW1lbnQgdHlwZXMgdGhhdCB0aGUgZW5lbXkgY2FuIGRvXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5taW5YID0gbWluWDtcclxuXHRcdFx0XHR0aGlzLm1pblkgPSBtaW5ZO1xyXG5cdFx0XHRcdHRoaXMubWF4WCA9IG1heFg7XHJcblx0XHRcdFx0dGhpcy5tYXhZID0gbWF4WTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdlggPSAxO1xyXG5cdFx0XHRcdHRoaXMubW92WSA9IDE7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5lbmVteSA9IG5ldyBPYmplY3Q7XHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LndpZHRoID0gdGhpcy53aWR0aDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcblxyXG5cdFx0XHQvLyAjIFRleHR1cmVcclxuXHRcdFx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHJcblx0XHRcdFx0dGhpcy5vYmpDb2xsaXNpb24gPSBuZXcgQ29sbGlzaW9uKCAwICwgMCwgdGhpcy5wbGF5ZXIgKTtcclxuXHRcdFx0XHRcclxuXHRcdC8vIC0gLSAtIFNldHMgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHR0aGlzLnNldFggPSAgZnVuY3Rpb24gKHgpIHsgdGhpcy54ID0geDsgfVxyXG5cdFx0XHR0aGlzLnNldFkgPSAgZnVuY3Rpb24gKHkpIHsgdGhpcy55ID0geTsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRIZWlnaHQgPSAgZnVuY3Rpb24gKGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0XHR0aGlzLnNldFdpZHRoID0gIGZ1bmN0aW9uICh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0Q29sb3IgPSAgZnVuY3Rpb24gKGNvbG9yKSB7IHRoaXMuY29sb3IgPSBjb2xvcjsgfVxyXG5cdFx0XHR0aGlzLnNldE5hbWUgPSAgZnVuY3Rpb24gKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cdFxyXG5cdFx0Ly8gLSAtIC0gR2V0cyAtIC0gLVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRYID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0XHR0aGlzLmdldFkgPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFdpZHRoID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcblx0XHRcdHRoaXMuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRDb2xvciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG5cclxuXHJcblx0XHQvLyAtIC0gLSBNb3ZlbWVudCAgLSAtIC1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdkhvciA9IGZ1bmN0aW9uIChtb2QpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1vdlggPT0gMSApIHsvLyBnbyBSaWdodFxyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy54ID0gdGhpcy54ICsgdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnggPj0gdGhpcy5tYXhYIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlggPSAwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy54ID0gdGhpcy54IC0gdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnggPCB0aGlzLm1pblggKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WCA9IDE7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH1cdFxyXG5cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3ZWZXIgPSBmdW5jdGlvbiAobW9kKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICggdGhpcy5tb3ZZID09IDEgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLnkgPSB0aGlzLnkgKyB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueSA+PSB0aGlzLm1heFkgKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WSA9IDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0aGlzLnkgPSB0aGlzLnkgLSB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueSA8IHRoaXMubWluWSApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZZID0gMTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fVx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cclxuXHRcdC8vIC0gLSAtIFJlbmRlciAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY29udGV4dCwgbW9kKSB7IFxyXG5cclxuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5tb3YpIHtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGNhc2UgXCJob3JcIjpcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdkhvcihtb2QpO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y2FzZSBcInZlclwiOlxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92VmVyKG1vZCk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgY29sbGlkZXMgd2l0aCBwbGF5ZXJcclxuXHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LnggPSB0aGlzLng7XHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LnkgPSB0aGlzLnk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm9iakNvbGxpc2lvbi5jaGVja1BsYXllckNvbGxpc2lvbih0aGlzLmVuZW15KSA9PSB0cnVlICkgXHJcblx0XHRcdFx0XHRcdHRoaXMuY29sbGlzaW9uKHRoaXMucGxheWVyKTtcclxuXHRcdFx0XHRcdFxyXG5cclxuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcblx0XHRcdFx0Y29udGV4dC5maWxsUmVjdCggdGhpcy5nZXRYKCksIHRoaXMuZ2V0WSgpLCB0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCkgKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY29sbGlzaW9uID0gZnVuY3Rpb24ob2JqZWN0KSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0b2JqZWN0LnNldENvbG9yKFwiIzMzM1wiKTtcclxuXHRcdFx0XHRvYmplY3QucmVzZXRQb3NpdGlvbigpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0XHRcclxuXHRcdFx0fTtcclxuXHJcblx0fS8vY2xhc3MiLCIvLyBDbGFzcyB0aGF0IGRldGVjdHMgY29sbGlzaW9uIGJldHdlZW4gcGxheWVyIGFuZCBvdGhlciBvYmplY3RzXHJcbmNsYXNzIENvbGxpc2lvbiB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHNjZW5hcmlvV2lkdGgsIHNjZW5hcmlvSGVpZ2h0LCBwbGF5ZXIpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMgPSBuZXcgQXJyYXkoKTsgLy8gSXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG4gICAgdGhpcy5zY2VuYXJpb1dpZHRoID0gc2NlbmFyaW9XaWR0aDtcclxuICAgIHRoaXMuc2NlbmFyaW9IZWlnaHQgPSBzY2VuYXJpb0hlaWdodDtcclxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gIH1cclxuXHRcdFx0XHJcbiAgLy8gIyBDaGVjayBpZiB0aGUgb2JqZWN0IGNvbGxpZGVzIHdpdGggYW55IG9iamVjdCBpbiB2ZWN0b3JcclxuICAvLyBBbGdvcml0aG0gcmVmZXJlbmNlOiBHdXN0YXZvIFNpbHZlaXJhIC0gaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1zN3FpV0xCQnBKd1xyXG4gIGNoZWNrKG9iamVjdCkge1xyXG4gICAgZm9yIChsZXQgaSBpbiB0aGlzLmNvbEl0ZW5zKSB7XHJcbiAgICAgIGxldCByMSA9IG9iamVjdDtcclxuICAgICAgbGV0IHIyID0gdGhpcy5jb2xJdGVuc1tpXTtcclxuICAgICAgdGhpcy5jaGVja0NvbGxpc2lvbihyMSwgcjIpO1xyXG4gICAgfSBcclxuICB9XHJcblxyXG4gIC8vIEByMTogdGhlIG1vdmluZyBvYmplY3RcclxuICAvLyBAcjI6IHRoZSBcIndhbGxcIlxyXG4gIGNoZWNrQ29sbGlzaW9uKHIxLCByMikge1xyXG4gICAgXHJcbiAgICAvLyBPbmx5IGNoZWNrcyBvYmplY3RzIHRoYXQgbmVlZHMgdG8gYmUgY2hlY2tlZFxyXG4gICAgaWYoICEgcjIudHJpZ2dlcnNDb2xsaXNpb25FdmVudCgpICYmICEgcjIuc3RvcElmQ29sbGlzaW9uKCkgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICB2YXIgY2F0WCA9IHIxLmdldENlbnRlclgoKSAtIHIyLmdldENlbnRlclgoKTtcclxuICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICB2YXIgc3VtSGFsZkhlaWdodCA9ICggcjEuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApIDtcclxuICAgICAgXHJcbiAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICBcclxuICAgICAgdmFyIG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgIHZhciBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuICAgICAgdmFyIGNvbGxpc2lvbkRpcmVjdGlvbiA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYoIHIyLnN0b3BJZkNvbGxpc2lvbigpICkge1xyXG4gICAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZICl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duICYmIHIyLigpXHJcbiAgICAgICAgICBpZihjYXRZID4gMCl7IC8vIFVwXHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwidXBcIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwiZG93blwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICAgIGlmKGNhdFggPiAwKXsgLy8gTGVmdFxyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgICBjb2xsaXNpb25EaXJlY3Rpb24gPSBcImxlZnRcIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSAtIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICAgIGNvbGxpc2lvbkRpcmVjdGlvbiA9IFwicmlnaHRcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRyaWdnZXJzIENvbGxpc2lvbiBldmVudFxyXG4gICAgICByMS5jb2xsaXNpb24ocjIsIGNvbGxpc2lvbkRpcmVjdGlvbik7XHJcbiAgICAgIHIyLmNvbGxpc2lvbihyMSwgY29sbGlzaW9uRGlyZWN0aW9uKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUcmlnZ2VycyBub3QgaW4gY29sbGlzaW9uIGV2ZW50XHJcbiAgICAgIHIxLm5vQ29sbGlzaW9uKHIyLCBjb2xsaXNpb25EaXJlY3Rpb24pOyBcclxuICAgICAgcjIubm9Db2xsaXNpb24ocjEsIGNvbGxpc2lvbkRpcmVjdGlvbik7IFxyXG4gICAgfVxyXG5cclxuICB9XHJcblx0XHRcdFxyXG5cdC8vIEFkZCBpdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcblx0YWRkSXRlbShvYmplY3QpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMucHVzaChvYmplY3QpO1xyXG4gIH07XHJcbiAgXHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcblx0XHRmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMuY29sSXRlbnMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG5cdH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY2xhc3MgUmVuZGVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoY3R4LCBjYW52YXMsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jdHggPSBjdHg7IFxyXG5cdFx0dGhpcy5zY2VuYXJpbyA9IFwiXCI7XHJcblx0XHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHRcdHRoaXMucGxheWVyID0gcGxheWVyO1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpOyBcclxuXHR9XHJcblx0XHQgICAgXHJcblx0Ly8gQWRkIGl0ZW1zIHRvIHRoZSB2ZWN0b3JcclxuXHRhZGRJdGVtKG9iamVjdCl7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0KTtcclxuXHR9XHJcblx0YWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcblx0XHRmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcblx0XHRcdHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3RbaV0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRzZXRTY2VuYXJpbyhzY2VuYXJpbyl7XHJcblx0XHR0aGlzLnNjZW5hcmlvID0gc2NlbmFyaW87XHJcblx0fVxyXG5cdFx0XHRcclxuXHQvLyBUaGlzIGZ1bmN0aW9ucyB3aWxsIGJlIGNhbGxlZCBjb25zdGFudGx5IHRvIHJlbmRlciBpdGVtc1xyXG5cdHN0YXJ0KG1vZCkge1x0XHRcclxuXHRcdFx0XHRcclxuXHRcdC8vIENsZWFyIGNhbnZhcyBiZWZvcmUgcmVuZGVyIGFnYWluXHJcblx0XHR0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcblx0XHR0aGlzLmN0eC5zaGFkb3dCbHVyID0gMDtcclxuXHJcblx0XHQvLyBTY2VuYXJpb1xyXG5cdFx0aWYgKCB0aGlzLnNjZW5hcmlvICE9IFwiXCIpIFxyXG5cdFx0XHR0aGlzLnNjZW5hcmlvLnJlbmRlcih0aGlzLmN0eCk7XHJcblx0XHRcdFx0XHJcblx0XHQvLyBSZW5kZXIgaXRlbXNcclxuXHRcdGZvciAobGV0IGkgaW4gdGhpcy5yZW5kZXJJdGVtcykge1xyXG5cdFx0XHQvLyBFeGVjdXRlIHRoZSByZW5kZXIgZnVuY3Rpb24gLSBJbmNsdWRlIHRoaXMgZnVuY3Rpb24gb24gZXZlcnkgY2xhc3MhXHJcblx0XHRcdHRoaXMucmVuZGVySXRlbXNbaV0ucmVuZGVyKHRoaXMuY3R4LCBtb2QpO1xyXG5cdFx0fVxyXG5cclxuXHR9XHJcblx0XHJcbn0vL2NsYXNzXHJcbm1vZHVsZS5leHBvcnRzID0gUmVuZGVyIiwiY29uc3QgZ2FtZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2dhbWVQcm9wZXJ0aWVzJyk7XHJcbmNvbnN0IHNjZW5hcmlvUHJvdG90eXBlID0gcmVxdWlyZSgnLi9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3NjZW5hcmlvUHJvdG90eXBlJyk7XHJcbmNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vYXNzZXRzL3BsYXllcicpO1xyXG5jb25zdCBDb2xsaXNpb24gPSByZXF1aXJlKCcuL2VuZ2luZS9jb2xsaXNpb24nKTtcclxuY29uc3QgUmVuZGVyID0gcmVxdWlyZSgnLi9lbmdpbmUvcmVuZGVyJyk7XHJcblxyXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIC8vICMgSW5pdFxyXG5cclxuICAgIHZhciBmcHNJbnRlcnZhbCwgbm93LCBkZWx0YVRpbWUsIGVsYXBzZWQ7XHJcbiAgICB2YXIgZ2FtZVByb3BzID0gbmV3IGdhbWVQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgdmFyIGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcbiAgICB2YXIgY29udGV4dFN0YXRpYyA9IGNhbnZhc1N0YXRpYy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIHZhciBjYW52YXNBbmltYXRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfYW5pbWF0ZWQnKTtcclxuICAgIHZhciBjb250ZXh0QW5pbWF0ZWQgPSBjYW52YXNBbmltYXRlZC5nZXRDb250ZXh0KCcyZCcpO1xyXG5cclxuICAgIGNhbnZhc0FuaW1hdGVkLndpZHRoID0gY2FudmFzU3RhdGljLndpZHRoID0gZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc1dpZHRoJyk7XHJcbiAgICBjYW52YXNBbmltYXRlZC5oZWlnaHQgPSBjYW52YXNTdGF0aWMuaGVpZ2h0ID0gZ2FtZVByb3BzLmdldFByb3AoJ2NhbnZhc0hlaWdodCcpO1xyXG5cclxuICAvLyAjIFNjZW5hcmlvXHJcblxyXG4gICAgIHZhciBzY2VuYXJpbyA9IG5ldyBzY2VuYXJpb1Byb3RvdHlwZShjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMsIGdhbWVQcm9wcyApO1xyXG5cclxuICAvLyAjIFBsYXllcnNcclxuXHJcbiAgICB2YXIgcGxheWVyID0gbmV3IFBsYXllciggc2NlbmFyaW8uZ2V0UGxheWVyU3RhcnRYKCksIHNjZW5hcmlvLmdldFBsYXllclN0YXJ0WSgpLCBnYW1lUHJvcHMsIGNvbnRleHRBbmltYXRlZCApOyAvL3Bvc2nDp8OjbyB4IGUgeVxyXG5cclxuICAvLyAjIENvbGxpc2lvbiBkZXRlY3Rpb24gY2xhc3NcclxuXHJcbiAgICB2YXIgY29sbGlzaW9uID0gbmV3IENvbGxpc2lvbihjYW52YXNBbmltYXRlZC53aWR0aCwgY2FudmFzQW5pbWF0ZWQuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBvYmplY3RzIHRvIHRoZSBjb2xsaXNpb24gdmVjdG9yXHJcbiAgICBjb2xsaXNpb24uYWRkQXJyYXlJdGVtKCBzY2VuYXJpby5nZXRSZW5kZXJJdGVtcygpICk7XHJcbiAgICBjb2xsaXNpb24uYWRkQXJyYXlJdGVtKCBzY2VuYXJpby5nZXRMYXllckl0ZW1zKCkgKTtcclxuXHJcbiAgLy8gIyBSZW5kZXJcclxuXHJcbiAgICB2YXIgcmVuZGVyU3RhdGljID0gbmV3IFJlbmRlcihjb250ZXh0U3RhdGljLCBjYW52YXNTdGF0aWMpOyAvLyBSZW5kZXIgZXhlY3V0ZWQgb25seSBvbmNlXHJcbiAgICB2YXIgcmVuZGVyQW5pbWF0ZWQgPSBuZXcgUmVuZGVyKGNvbnRleHRBbmltYXRlZCwgY2FudmFzQW5pbWF0ZWQpOyAvL1JlbmRlciB3aXRoIGFuaW1hdGVkIG9iamVjdHMgb25seVxyXG5cclxuICAgIC8vIEFkZCBpdGVtcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgIHJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyhzY2VuYXJpbyk7IC8vIHNldCB0aGUgc2NlbmFyaW9cclxuICAgIHJlbmRlclN0YXRpYy5hZGRBcnJheUl0ZW0oc2NlbmFyaW8uZ2V0UmVuZGVySXRlbXMoKSk7IC8vIEdldCBhbGwgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cclxuICAgIHJlbmRlckFuaW1hdGVkLmFkZEFycmF5SXRlbSggc2NlbmFyaW8uZ2V0TGF5ZXJJdGVtcygpICk7IC8vIEdldCBhbGwgYW5pbWF0ZWQgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG4gICAgcmVuZGVyQW5pbWF0ZWQuYWRkSXRlbSggcGxheWVyICk7IC8vIEFkZHMgdGhlIHBsYXllciB0byB0aGUgYW5pbWF0aW9uIHJlbmRlclxyXG5cclxuXHJcbiAgLy8gIyBLZXlib2FyZCBFdmVudHNcclxuXHJcbiAgICB2YXIga2V5c0Rvd24gPSB7fTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBrZXlzRG93bltlLmtleUNvZGVdID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBkZWxldGUga2V5c0Rvd25bZS5rZXlDb2RlXTtcclxuICAgICAgcGxheWVyLnJlc2V0U3RlcCgpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAvLyAjIFRoZSBHYW1lIExvb3BcclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVHYW1lKG1vZCkge1xyXG5cclxuICAgICAgLy8gIyBNb3ZlbWVudHNcclxuICAgICAgcGxheWVyLmhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApO1xyXG5cclxuICAgICAgLy8gIyBDaGVjayBpZiBwbGF5ZXIgaXMgY29sbGlkaW5nXHJcbiAgICAgIGNvbGxpc2lvbi5jaGVjayhwbGF5ZXIpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gIyBcIlRocmVhZFwiIHRoYSBydW5zIHRoZSBnYW1lXHJcbiAgICBmdW5jdGlvbiBydW5HYW1lKGZwcykge1xyXG4gICAgICBmcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcbiAgICAgIGRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHN0YXJ0VGltZSA9IGRlbHRhVGltZTtcclxuICAgICAgZ2FtZUxvb3AoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnYW1lTG9vcCgpIHtcclxuXHJcbiAgICAgIC8vIFJ1bnMgb25seSB3aGVuIHRoZSBicm93c2VyIGlzIGluIGZvY3VzXHJcbiAgICAgIC8vIFJlcXVlc3QgYW5vdGhlciBmcmFtZVxyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG5cclxuICAgICAgLy8gY2FsYyBlbGFwc2VkIHRpbWUgc2luY2UgbGFzdCBsb29wXHJcbiAgICAgIG5vdyA9IERhdGUubm93KCk7XHJcbiAgICAgIGVsYXBzZWQgPSBub3cgLSBkZWx0YVRpbWU7XHJcblxyXG4gICAgICAvLyBpZiBlbm91Z2ggdGltZSBoYXMgZWxhcHNlZCwgZHJhdyB0aGUgbmV4dCBmcmFtZVxyXG4gICAgICBpZiAoZWxhcHNlZCA+IGZwc0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIEdldCByZWFkeSBmb3IgbmV4dCBmcmFtZSBieSBzZXR0aW5nIHRoZW49bm93LCBidXQgYWxzbyBhZGp1c3QgZm9yIHlvdXJcclxuICAgICAgICAvLyBzcGVjaWZpZWQgZnBzSW50ZXJ2YWwgbm90IGJlaW5nIGEgbXVsdGlwbGUgb2YgUkFGJ3MgaW50ZXJ2YWwgKDE2LjdtcylcclxuICAgICAgICBkZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIGZwc0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgdXBkYXRlR2FtZSggZGVsdGFUaW1lICk7XHJcblxyXG4gICAgICAgIHJlbmRlckFuaW1hdGVkLnN0YXJ0KCBkZWx0YVRpbWUgKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIC8vICMgU3RhcnRzIHRoZSBnYW1lXHJcblxyXG4gICAgcmVuZGVyU3RhdGljLnN0YXJ0KCBkZWx0YVRpbWUgKTsgIC8vIFJlbmRlciB0aGUgc3RhdGljIGxheWVycyBvbmx5IG9uY2VcclxuICAgIHJ1bkdhbWUoIGdhbWVQcm9wcy5nZXRQcm9wKCdmcHMnKSApO1x0Ly8gR08gR08gR09cclxuXHJcbn0iLCIvLyBHYW1lIFByb3BlcnRpZXMgY2xhc3MgdG8gZGVmaW5lIGNvbmZpZ3VyYXRpb25zXHJcbmNsYXNzIGdhbWVQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MpO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzKTsvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MpO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzKTtcclxuXHJcbiAgICB0aGlzLmZwcyA9IDMwO1xyXG4gIH1cclxuXHJcbiAgZ2V0UHJvcChwcm9wKSB7XHJcbiAgICByZXR1cm4gdGhpc1twcm9wXTtcclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZVByb3BlcnRpZXNcclxuXHJcbndpbmRvdy5kZWJ1ZyA9IGZhbHNlOyJdfQ==
