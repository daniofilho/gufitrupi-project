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
// Obstacle class

	function Exit(ctx, name, x0, y0, w, h) {
		
		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = w; //px
				this.height = h;
				
				this.color = "#3F5"; 
				this.name = name;
			
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

				this.exit = 0;

			// Texture
				this.ctx = ctx;
	

		
		// - - - Render - - -
		
			this.render = function(contexto) { 
				contexto.fillStyle = this.color;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
			};
			
			this.collision = function(objeto) {
				
				switch (this.exit) {
					
					case 0:
						
						this.setX(520);
						this.setY(540);					
						this.exit = 1;						
						break;
					
					case 1:
						
						this.setX(225);
						this.setY(370);						
						this.exit = 2;						
						break;
					
				    case 2:
						
						this.setX(725);
						this.setY(310);
						this.setWidth(40);
						this.setHeight(40);
						
						this.exit = 3;
						
						this.setColor('#00F');
						
						
						break;
						
					case 3:
					
						objeto.setColor("#333");
						objeto.resetPosition();
						
						alert('Win!');
						setTimeout(location.reload(), 2000);
						break;
				}
				
				
				return false;
				
			};

	}//class
},{}],3:[function(require,module,exports){
class Floor {

  constructor(type, x0, y0, chunkSize) {
    
    // # Position
    this.x = x0;
    this.y = y0;
      
    // # Properties
    this.width = chunkSize; //px
    this.height = chunkSize;
      
    this.isCollidable = false;

    // # Sprite
    this.stageSprite = document.getElementById('sprite_prototype'); // TEMPORARY
    //this.stageSprite = new Image();
    //this.stageSprite.src = './assets/scenario/Prototype/sprites/prototype.png'; // Why not working?

    this.spriteWidth = 15;
    this.spriteHeight = 15;
    this.spriteProps = new Array();

    this.run(type);
  }

	// # Sets
		
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }
    
    setHeight(height) { this.height = height; }
    setWidth(width) { this.width = width; }
    
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
        
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.stageSprite,  
        spriteProps.clip_x, spriteProps.clip_y, 
        spriteProps.sprite_width, spriteProps.sprite_height, 
        props.x, props.y, props.w, props.h
      );
        
      //DEBUG Chunk Size
      if( window.debug ) {
        ctx.fillStyle = "rgba(0,255,0,0.4)";
        ctx.fillRect(props.x, props.y, props.w, props.h);

        ctx.rect(props.x, props.y, props.w, props.h);
        ctx.stroke();
      }

    }
			
		collision(object) {
      return this.isCollidable;
    }

    run(type) {
      this.setSpriteType(type);
    }
     
  }//class
  
  module.exports = Floor;
},{}],4:[function(require,module,exports){
// Obstacle class

	function Power(ctx, name, x0, y0, w, h) {
		
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

		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = w; //px
				this.height = h;
				
				this.color = "#3F5"; 
				this.name = name;

			// # Texture
				this.ctx = ctx;
					
				this.grad = this.ctx.createRadialGradient( this.getX(), this.getY(), this.getWidth(), this.getHeight(), 0, 100 );
				this.grad.addColorStop(0, '#B46B2C');   
				this.grad.addColorStop(1, '#CCCA4F');
			
		
	
		
		// - - - Render - - -
		
			this.render = function(context) {  
				context.fillStyle = this.grad;
				context.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
			};
			
			this.collision = function(object) {
				object.setSpeed(0.2);
				object.setColor("#D6142F");
				return false;
			};

	}//obstaculo
},{}],5:[function(require,module,exports){
class Wall {

	constructor(type, x0, y0, chunkSize) {
    
    // # Position
    this.x = x0;
    this.y = y0;
      
    // # Properties
    this.width = chunkSize; //px
    this.height = chunkSize;

    this.isCollidable = true;
      
    // # Sprite
    this.stageSprite = document.getElementById('sprite_prototype'); // TEMPORARY
    //this.stageSprite = new Image();
    //this.stageSprite.src = '/assets/scenario/Prototype/sprites/prototype.png';

    this.spriteWidth = 16;
    this.spriteHeight = 16;
    this.spriteProps = new Array();

    this.run( type );
  }

  // # Sets
    
    setX(x) { this.x = x; }
		setY(y) { this.y = y; }
			
		setHeight(height) { this.height = height; }
    setWidth(width) { this.width = width; }
      
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
        
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        this.stageSprite,  
        spriteProps.clip_x, spriteProps.clip_y, 
        spriteProps.sprite_width, spriteProps.sprite_height, 
        props.x, props.y, props.w, props.h
      );
        
      //DEBUG Chunk Size
      if( window.debug ) {
        ctx.fillStyle = "rgba(255,0,0,0.4)";
        ctx.fillRect(props.x, props.y, props.w, props.h);
        ctx.rect(props.x, props.y, props.w, props.h);
        ctx.stroke();
      }
    
    }
			
		collision(object) {
      return this.isCollidable;
    }
      
    run( type ) {
      this.setSpriteType(type);
    }

  }//class
  
  module.exports = Wall;
},{}],6:[function(require,module,exports){
// Obstacle class

	function Water(ctx, name, x0, y0, w, h) {
		
		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = w; //px
				this.height = h;
				
				this.color = "#3F5"; 
				this.name = name;

			// # Texture
				this.ctx = ctx;
				
				this.imgWater = new Image();
				this.imgWater.src = './assets/scenario/welcome/img/water.jpg';
				
				this.water = this.ctx.createPattern(this.imgWater, 'repeat');
				this.water = "blue";
				
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
		
		
		// - - - Render - - -
		
			this.render = function(contexto) { 
				contexto.fillStyle = this.water;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
			};
			
			this.collision = function(object) {
				
				// If collides, what will happen? 
				object.setSpeed(0.05);
				object.setColor("#86C0F8");
				
				// If the item will trigger a collision action. Walls will make the player stop, but water will only make the player slow
				return false; 
				
			};

	}//class
},{}],7:[function(require,module,exports){
/*
	Prototype Scenario
*/
const Prototype_Stage_1 = require('./stages/stage_1');

class scenarioPrototype {

	constructor(ctx, canvas, gameProps){
		this.ctx = ctx;
		this.canvas = canvas;
		
		this.renderItems = new Array();
		this.renderItemsAnimated = new Array();

		this.collisionItems = new Array();// Is it in use???
		
		this.width = canvas.width;
		this.height = canvas.height;

		this.chunkSize = gameProps.getProp('chunkSize');

		this.playerStartX = 0;
		this.playerStartY = 0;

		this.run();
	}

	// # Main Render
	render(){
		// ... 
	}	
			
	// # Add Items to the Render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderItemAnimated(item){
		this.renderItemsAnimated.push(item);
	}

	// # Gets
	getCtx() { return this.ctx; }
	getCanvas() { return this.canvas; }	
				
	getRenderItems() { return this.renderItems; }
	getRenderItemsAnimated() { return this.renderItemsAnimated; }
				
	getPlayerStartX() { return this.chunkSize * 4; } // Isso tem que vir do cenário!!!
	getPlayerStartY() { return this.chunkSize * 4; }
      
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
		this.stage.getAnimatedItems().map( (item) => { 
			this.addRenderItemAnimated(item);
		});
		
	}

	// # Run when class loads
	run() {
		
		// Set Default Stage
		this.setStage(1); 
				
	}

}//class

module.exports = scenarioPrototype;
},{"./stages/stage_1":8}],8:[function(require,module,exports){
// Stage 01

const Wall = require('../assets/wall');
const Floor = require('../assets/floor');

class Prototype_Stage_1 {

  constructor(chunkSize) {
    this.renderItems = new Array();
    this.renderItemsAnimated = new Array();
    this.chunkSize = chunkSize;
    this.run();
  }
  
  // # Gets
  getStaticItems() {  return this.renderItems; }
  getAnimatedItems() {  return this.renderItemsAnimated; }
        
  // # Add Items to the render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderItemAnimated(item){
		this.renderItemsAnimated.push(item);
  }
        
  // # Scenario 
  getScenarioAssetItem(item, x, y){
    switch(item.name) {
      case "wall":
        return new Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Floor(item.type, x, y, this.chunkSize);
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
        let x0 = y * this.chunkSize;
        let y0 = x * this.chunkSize;
        this.addRenderItem(this.getScenarioAssetItem(item, x0, y0));
        });
      });
    }

  // # Scenario Animated items
    // TO DO

  run () {
    this.scenarioDesign();
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
},{"../assets/floor":3,"../assets/wall":5}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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

  checkCollision(r1, r2) {
        
    //r1 -> the moving object
    //r2 -> the "wall"

    // Only checks "collidable" objects
      if( ! r2.collision() ) return false;
 
    // stores the distance between the objects (must be rectangle)
      var catX = r1.getCenterX() - r2.getCenterX();
      var catY = r1.getCenterY() - r2.getCenterY();

      var sumHalfWidth = ( r1.getCollisionWidth() / 2 ) + ( r2.getCollisionWidth() / 2 );
      var sumHalfHeight = ( r1.getCollisionHeight() / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
        
      if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
        
        var overlapX = sumHalfWidth - Math.abs(catX);
        var overlapY = sumHalfHeight - Math.abs(catY);
        
        if(overlapX >= overlapY){ // Direction of collision - Up/Down
          if(catY > 0){ // Up
            r1.setY( r1.getY() + overlapY );
          } else {
            r1.setY( r1.getY() - overlapY );
          }
        } else {// Direction of collision - Left/Right
          if(catX > 0){ // Left
            r1.setX( r1.getX() + overlapX );
          } else {
            r1.setX( r1.getX() - overlapX );
          }
        }

      } else {
        r1.noCollision(); // What happens if it's not colling?
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
	
},{}],11:[function(require,module,exports){
class Render {

	constructor(ctx, canvas, dificuldade, player) {
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
},{}],12:[function(require,module,exports){
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
		collision.addArrayItem( scenario.getRenderItemsAnimated() );

		
	// # Render
		
		var renderStatic = new Render(contextStatic, canvasStatic); // Render executed only once
		var renderAnimated = new Render(contextAnimated, canvasAnimated); //Render with animated objects only
			
		// Add items to be rendered
		
		renderStatic.setScenario(scenario); // set the scenario
		renderStatic.addArrayItem(scenario.getRenderItems()); // Get all items from the scenario that needs to be rendered
		
		renderAnimated.addArrayItem( scenario.getRenderItemsAnimated() ); // Get all animated items from the scenario that needs to be rendered
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
			
		};
	
	// # Starts the game
		
		renderStatic.start( deltaTime );  // Render the static layers only once
		
		runGame( gameProps.getProp('fps') );	// GO GO GO
	
}
},{"./assets/player":1,"./assets/scenario/Prototype/scenarioPrototype":7,"./engine/collision":10,"./engine/render":11,"./gameProperties":13}],13:[function(require,module,exports){
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
},{}]},{},[1,2,3,4,5,6,7,8,9,13,12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL3BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL2Fzc2V0cy9leGl0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvYXNzZXRzL2Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvYXNzZXRzL3Bvd2VyLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvYXNzZXRzL3dhbGwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9hc3NldHMvd2F0ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zY2VuYXJpb1Byb3RvdHlwZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV8xLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vZW5lbV9wcm90b3R5cGUuanMiLCJjbGllbnQvZW5naW5lL2NvbGxpc2lvbi5qcyIsImNsaWVudC9lbmdpbmUvcmVuZGVyLmpzIiwiY2xpZW50L2dhbWUuanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBQbGF5ZXIge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih4MCwgeTAsIGdhbWVQcm9wcykge1xyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgICAgLy90aGlzLnBsYXllclNwcml0ZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAvL3RoaXMucGxheWVyU3ByaXRlLnNyYyA9ICcuL2Fzc2V0cy9zcHJpdGVzL3BsYXllcl9vbmUucG5nJztcclxuICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl9vbmUnKTsgLy8gUGVnYXIgZXNzZSBpZCBkYSBpbnN0YW5jaWEhIVxyXG4gICAgICBcclxuICAgICAgLy8gaHR0cDovL2dldHNwcml0ZXh5LmNvbS8gPD0gUGFyYSBtYXBlYXIgb3Mgc3ByaXRlcyFcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHtcclxuICAgICAgICBzcHJpdGVfd2lkdGg6IDIwLCAvLyBQbGF5ZXIgc2l6ZSBpbnNpZGUgc3ByaXRlXHJcbiAgICAgICAgc3ByaXRlX2hlaWdodDogNDBcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN0ZXAgPSBbXTtcclxuICAgICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICAgIHRoaXMuaW5pdGlhbFN0ZXAgPSAzO1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuZGVmYXVsdFN0ZXA7XHJcbiAgICAgIHRoaXMubWF4U3RlcHMgPSA4O1xyXG5cclxuICAgICAgLy8gQ29udHJvbHMgdGhlIHBsYXllciBGUFMgQW5pbWF0aW9uXHJcbiAgICAgIHRoaXMuZnBzSW50ZXJ2YWwgPSAxMDAwIC8gMTI7IC8vIDEwMDAgLyBGUFNcclxuICAgICAgdGhpcy5kZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICAgIHRoaXMueCA9IHgwO1xyXG4gICAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICB0aGlzLnkwID0geTA7XHJcblxyXG4gICAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuXHJcbiAgICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2h1bmtTaXplOyAvL3B4XHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jaHVua1NpemUgKiAyOyAvL3B4XHJcbiAgICAgIHRoaXMuc3BlZWQwID0gNjtcclxuICAgICAgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gdGhpcy5zcGVlZDA7XHJcblxyXG4gICAgICB0aGlzLmlzQ29sbGlkYWJsZSA9IHRydWU7XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU3ByaXRlcyBzdGF0ZSBmb3IgcGxheWVyIGRpcmVjdGlvblxyXG4gICAgXHJcbiAgICBsb29rRG93bigpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgICAgXHJcbiAgICAgIC8vIFN0ZXBzXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiAwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rVXAoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAndXAnO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDQwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tSaWdodCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDgwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcblx0XHRsb29rTGVmdCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiAxMjAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuXHJcbiAgLy8gIyBDb250cm9scyB0aGUgcGxheWVyIEZQUyBNb3ZlbWVudCBpbmRlcGVuZGVudCBvZiBnYW1lIEZQU1xyXG4gICAgY2FuUmVuZGVyTmV4dEZyYW1lKCkge1xyXG4gICAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0bGV0IGVsYXBzZWQgPSBub3cgLSB0aGlzLmRlbHRhVGltZTtcclxuICAgICAgaWYgKGVsYXBzZWQgPiB0aGlzLmZwc0ludGVydmFsKSB7XHJcblx0ICAgICAgdGhpcy5kZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIHRoaXMuZnBzSW50ZXJ2YWwpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSAgXHJcbiAgICBcclxuXHQvLyAjIFBsYXllciBNb3ZlbWVudFxyXG5cdFx0XHJcblx0XHRtb3ZMZWZ0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgdGhpcy5zZXRYKCB0aGlzLmdldFgoKSAtIHRoaXMuZ2V0U3BlZWQoKSk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZSaWdodCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rUmlnaHQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpICsgdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZVcCgpIHsgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rVXAoKSApO1xyXG4gICAgICB0aGlzLnNldFkoIHRoaXMuZ2V0WSgpIC0gdGhpcy5nZXRTcGVlZCgpICk7IFxyXG4gICAgfTtcclxuXHRcdFx0XHJcblx0XHRtb3ZEb3duKCkgeyAgXHJcbiAgICAgIHRoaXMuaW5jcmVhc2VTdGVwKCk7XHJcbiAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB9O1xyXG5cclxuICAgIGhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApIHtcclxuICAgICAgXHJcbiAgICAgIGlmICgzNyBpbiBrZXlzRG93bikgLy8gTGVmdFxyXG4gICAgICAgIHRoaXMubW92TGVmdCgpO1xyXG4gICAgICAgIFxyXG4gICAgICBpZiAoMzggaW4ga2V5c0Rvd24pIC8vIFVwICBcclxuICAgICAgICB0aGlzLm1vdlVwKCk7XHJcbiAgICAgICAgXHJcbiAgICAgIGlmICgzOSBpbiBrZXlzRG93bikgLy8gUmlnaHRcclxuICAgICAgICB0aGlzLm1vdlJpZ2h0KCk7XHJcblxyXG4gICAgICBpZiAoNDAgaW4ga2V5c0Rvd24pIC8vIERvd25cclxuICAgICAgICB0aGlzLm1vdkRvd24oKTtcclxuXHJcbiAgICB9XHJcblx0XHRcclxuXHQvLyAjIFNldHNcclxuXHRcdFxyXG5cdFx0c2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuXHRcdHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0c2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gc3BlZWQ7IH1cclxuXHJcblx0XHRzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG5cdFx0c2V0TG9va0RpcmVjdGlvblZhbChzdHJpbmcpIHsgdGhpcy5sb29rRGlyZWN0aW9uVmFyID0gc3RyaW5nOyB9XHJcblxyXG5cdFx0cmVzZXRQb3NpdGlvbigpIHtcclxuXHRcdFx0dGhpcy5zZXRYKCB0aGlzLngwICk7XHJcblx0XHQgIHRoaXMuc2V0WSggdGhpcy55MCApO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0Ly8gIyBHZXRzXHJcblx0XHRcdFxyXG5cdCAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0Z2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHQgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgICAgXHJcbiAgICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0IC8gMjsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLnkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblxyXG4gICAgZ2V0Q2VudGVyWCgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpOyB9XHJcbiAgICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblx0XHRcdFxyXG5cdFx0Z2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblx0XHRnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuICAgICAgXHJcbiAgICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgICAgXHJcbiAgICBpbmNyZWFzZVN0ZXAoKSB7XHJcbiAgICAgIGlmKHRoaXMuY2FuUmVuZGVyTmV4dEZyYW1lKCkpIHtcclxuICAgICAgICB0aGlzLnN0ZXBDb3VudCsrO1xyXG4gICAgICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuaW5pdGlhbFN0ZXA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXNldFN0ZXAoKSB7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgc3dpdGNoICggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBQbGF5ZXIgUmVuZGVyXHJcblx0XHRcdFx0XHJcblx0ICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIFxyXG4gICAgICAvKnBsYXllclNwcml0ZS5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy8gb25sb2FkIG7Do28gcXVlciBjYXJyZWdhciBubyBwbGF5ZXIuLnBxID8/XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShwbGF5ZXJTcHJpdGUsIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1x0XHJcbiAgICAgIH1cdCovXHJcbiAgICAgIC8vZHJhd0ltYWdlKGltZyxzeCxzeSxzd2lkdGgsc2hlaWdodCx4LHksd2lkdGgsaGVpZ2h0KTtcclxuICAgICAgLy8gIyBodHRwczovL3d3dy53M3NjaG9vbHMuY29tL3RhZ3MvY2FudmFzX2RyYXdpbWFnZS5hc3BcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHRcclxuICAgICAgLy8gREVCVUcgQ09MTElTSU9OXHJcbiAgICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMTAwLCAwLjUpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLnByb3BzLngsIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLnByb3BzLncsIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG5cdFx0fTtcclxuICBcclxuICAvLyAjIENvbGxpc2lvblxyXG4gIFxyXG5cdFx0bm9Db2xsaXNpb24oKSB7XHJcblx0XHRcdC8vIFdoYXQgaGFwcGVucyBpZiB0aGUgcGxheWVyIGlzIG5vdCBjb2xsaWRpbmc/XHJcblx0XHRcdHRoaXMuc2V0U3BlZWQodGhpcy5zcGVlZDApOyAvLyBSZXNldCBzcGVlZFxyXG4gICAgfVxyXG4gICAgICBcclxuICAgIGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblx0XHRcclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xyXG4iLCIvLyBPYnN0YWNsZSBjbGFzc1xyXG5cclxuXHRmdW5jdGlvbiBFeGl0KGN0eCwgbmFtZSwgeDAsIHkwLCB3LCBoKSB7XHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIEluaXQgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHQvLyAjIFBvc2l0aW9uXHJcblx0XHRcdFx0dGhpcy54ID0geDA7XHJcblx0XHRcdFx0dGhpcy55ID0geTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdC8vICMgUHJvcGVydGllc1xyXG5cdFx0XHRcdHRoaXMud2lkdGggPSB3OyAvL3B4XHJcblx0XHRcdFx0dGhpcy5oZWlnaHQgPSBoO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiMzRjVcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIC0gLSAtIFNldHMgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdFx0dGhpcy5zZXRZID0gIGZ1bmN0aW9uICh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdFx0dGhpcy5zZXRXaWR0aCA9ICBmdW5jdGlvbiAod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdFx0dGhpcy5zZXROYW1lID0gIGZ1bmN0aW9uIChuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHRcclxuXHRcdFx0Ly8gLSAtIC0gR2V0cyAtIC0gLVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ2V0WCA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdFx0XHR0aGlzLmdldFkgPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG5cdFx0XHRcdHRoaXMuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ2V0Q29sb3IgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuXHJcblx0XHRcdFx0dGhpcy5leGl0ID0gMDtcclxuXHJcblx0XHRcdC8vIFRleHR1cmVcclxuXHRcdFx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHRcclxuXHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIFJlbmRlciAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY29udGV4dG8pIHsgXHJcblx0XHRcdFx0Y29udGV4dG8uZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHRcdFx0XHRjb250ZXh0by5maWxsUmVjdCggdGhpcy5nZXRYKCksIHRoaXMuZ2V0WSgpLCB0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCkgKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY29sbGlzaW9uID0gZnVuY3Rpb24ob2JqZXRvKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLmV4aXQpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y2FzZSAwOlxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXRYKDUyMCk7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0WSg1NDApO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5leGl0ID0gMTtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0WCgyMjUpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnNldFkoMzcwKTtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5leGl0ID0gMjtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHQgICAgY2FzZSAyOlxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXRYKDcyNSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0WSgzMTApO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnNldFdpZHRoKDQwKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXRIZWlnaHQoNDApO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5leGl0ID0gMztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0Q29sb3IoJyMwMEYnKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0b2JqZXRvLnNldENvbG9yKFwiIzMzM1wiKTtcclxuXHRcdFx0XHRcdFx0b2JqZXRvLnJlc2V0UG9zaXRpb24oKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGFsZXJ0KCdXaW4hJyk7XHJcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQobG9jYXRpb24ucmVsb2FkKCksIDIwMDApO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9jbGFzcyIsImNsYXNzIEZsb29yIHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUpIHtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDA7XHJcbiAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBjaHVua1NpemU7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2h1bmtTaXplO1xyXG4gICAgICBcclxuICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3RhZ2VTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3Byb3RvdHlwZScpOyAvLyBURU1QT1JBUllcclxuICAgIC8vdGhpcy5zdGFnZVNwcml0ZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlLnNyYyA9ICcuL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc3ByaXRlcy9wcm90b3R5cGUucG5nJzsgLy8gV2h5IG5vdCB3b3JraW5nP1xyXG5cclxuICAgIHRoaXMuc3ByaXRlV2lkdGggPSAxNTtcclxuICAgIHRoaXMuc3ByaXRlSGVpZ2h0ID0gMTU7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5ydW4odHlwZSk7XHJcbiAgfVxyXG5cclxuXHQvLyAjIFNldHNcclxuXHRcdFxyXG4gICAgc2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuICAgIHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcbiAgICBcclxuICAgIHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICAgIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgXHJcbiAgICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgICBcclxuICAgICAgICBjYXNlIFwiMDFcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDIxNCwgY2xpcF95OiA5LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCIwMlwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogMjE0LCBjbGlwX3k6IDk0LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgfVxyXG4gICAgfVxyXG5cdFx0XHRcclxuXHQvLyAjIEdldHNcclxuXHRcdFx0XHJcblx0XHRnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcblx0XHRnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFxyXG5cdFx0Z2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcblx0XHRnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cclxuXHRcdGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy54OyB9XHJcbiAgICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMueTsgfVxyXG5cclxuICAgIGdldENlbnRlclgoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKTsgfVxyXG4gICAgZ2V0Q2VudGVyWSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKTsgfVxyXG5cdFx0XHJcblx0Ly8gIyBSZW5kZXJcclxuXHRcdFxyXG5cdFx0cmVuZGVyKGN0eCkge1xyXG4gICAgICAgIFxyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgICAgfSBcclxuICAgICAgbGV0IHNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGVQcm9wcztcclxuICAgICAgICBcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3RhZ2VTcHJpdGUsICBcclxuICAgICAgICBzcHJpdGVQcm9wcy5jbGlwX3gsIHNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCBzcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwyNTUsMCwwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1xyXG5cclxuICAgICAgICBjdHgucmVjdChwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblx0XHRcdFxyXG5cdFx0Y29sbGlzaW9uKG9iamVjdCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pc0NvbGxpZGFibGU7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuKHR5cGUpIHtcclxuICAgICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gICAgfVxyXG4gICAgIFxyXG4gIH0vL2NsYXNzXHJcbiAgXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBGbG9vcjsiLCIvLyBPYnN0YWNsZSBjbGFzc1xyXG5cclxuXHRmdW5jdGlvbiBQb3dlcihjdHgsIG5hbWUsIHgwLCB5MCwgdywgaCkge1xyXG5cdFx0XHJcblx0XHQvLyAtIC0gLSBTZXRzIC0gLSAtXHJcblx0XHJcblx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdHRoaXMuc2V0WSA9ICBmdW5jdGlvbiAoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdHRoaXMuc2V0V2lkdGggPSAgZnVuY3Rpb24gKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdHRoaXMuc2V0TmFtZSA9ICBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG5cdFx0Ly8gLSAtIC0gR2V0cyAtIC0gLVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRYID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0XHR0aGlzLmdldFkgPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFdpZHRoID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcblx0XHRcdHRoaXMuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRDb2xvciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG5cclxuXHRcdC8vIC0gLSAtIEluaXQgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHQvLyAjIFBvc2l0aW9uXHJcblx0XHRcdFx0dGhpcy54ID0geDA7XHJcblx0XHRcdFx0dGhpcy55ID0geTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdC8vICMgUHJvcGVydGllc1xyXG5cdFx0XHRcdHRoaXMud2lkdGggPSB3OyAvL3B4XHJcblx0XHRcdFx0dGhpcy5oZWlnaHQgPSBoO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiMzRjVcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHJcblx0XHRcdC8vICMgVGV4dHVyZVxyXG5cdFx0XHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5ncmFkID0gdGhpcy5jdHguY3JlYXRlUmFkaWFsR3JhZGllbnQoIHRoaXMuZ2V0WCgpLCB0aGlzLmdldFkoKSwgdGhpcy5nZXRXaWR0aCgpLCB0aGlzLmdldEhlaWdodCgpLCAwLCAxMDAgKTtcclxuXHRcdFx0XHR0aGlzLmdyYWQuYWRkQ29sb3JTdG9wKDAsICcjQjQ2QjJDJyk7ICAgXHJcblx0XHRcdFx0dGhpcy5ncmFkLmFkZENvbG9yU3RvcCgxLCAnI0NDQ0E0RicpO1xyXG5cdFx0XHRcclxuXHRcdFxyXG5cdFxyXG5cdFx0XHJcblx0XHQvLyAtIC0gLSBSZW5kZXIgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGNvbnRleHQpIHsgIFxyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5ncmFkO1xyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFJlY3QoIHRoaXMuZ2V0WCgpLCB0aGlzLmdldFkoKSwgdGhpcy5nZXRXaWR0aCgpLCB0aGlzLmdldEhlaWdodCgpICk7XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNvbGxpc2lvbiA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG5cdFx0XHRcdG9iamVjdC5zZXRTcGVlZCgwLjIpO1xyXG5cdFx0XHRcdG9iamVjdC5zZXRDb2xvcihcIiNENjE0MkZcIik7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9vYnN0YWN1bG8iLCJjbGFzcyBXYWxsIHtcclxuXHJcblx0Y29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUpIHtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDA7XHJcbiAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBjaHVua1NpemU7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2h1bmtTaXplO1xyXG5cclxuICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gdHJ1ZTtcclxuICAgICAgXHJcbiAgICAvLyAjIFNwcml0ZVxyXG4gICAgdGhpcy5zdGFnZVNwcml0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzcHJpdGVfcHJvdG90eXBlJyk7IC8vIFRFTVBPUkFSWVxyXG4gICAgLy90aGlzLnN0YWdlU3ByaXRlID0gbmV3IEltYWdlKCk7XHJcbiAgICAvL3RoaXMuc3RhZ2VTcHJpdGUuc3JjID0gJy9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3Nwcml0ZXMvcHJvdG90eXBlLnBuZyc7XHJcblxyXG4gICAgdGhpcy5zcHJpdGVXaWR0aCA9IDE2O1xyXG4gICAgdGhpcy5zcHJpdGVIZWlnaHQgPSAxNjtcclxuICAgIHRoaXMuc3ByaXRlUHJvcHMgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgICB0aGlzLnJ1biggdHlwZSApO1xyXG4gIH1cclxuXHJcbiAgLy8gIyBTZXRzXHJcbiAgICBcclxuICAgIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG5cdFx0XHRcclxuXHRcdHNldEhlaWdodChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuICAgIHNldFdpZHRoKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG4gICAgICBcclxuICAgIHNldFNwcml0ZVR5cGUodHlwZSkge1xyXG4gICAgICAgIFxyXG4gICAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJ0b3BcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAxOTcsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwibGVmdFwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogNDA5LCBjbGlwX3k6IDIxNCwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJyaWdodFwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogMzkyLCBjbGlwX3k6IDIxNCwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJib3R0b21cIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAxODAsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwiY29ybmVyX3RvcF9sZWZ0XCI6XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgICAgY2xpcF94OiA0NjAsIGNsaXBfeTogMTAsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwiY29ybmVyX3RvcF9yaWdodFwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogNDc3LCBjbGlwX3k6IDEwLCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fbGVmdFwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogNDYwLCBjbGlwX3k6IDI3LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgY2FzZSBcImNvcm5lcl9ib3R0b21fcmlnaHRcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDU0NSwgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJ3YXRlclwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogMzc1LCBjbGlwX3k6IDI5OSwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJvYnN0YWNsZVwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogNDAsIGNsaXBfeTogNzUsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblx0XHRcdFxyXG5cdC8vICMgR2V0c1xyXG5cdFx0XHRcclxuICAgIGdldFgoKSB7IHJldHVybiB0aGlzLng7IH1cclxuICAgIGdldFkoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuICAgIFxyXG4gICAgZ2V0V2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRIZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcbiAgICBnZXRDb2xsaXNpb25XaWR0aCgpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuICAgIGdldENvbGxpc2lvblgoKSB7ICByZXR1cm4gdGhpcy54OyB9XHJcbiAgICBnZXRDb2xsaXNpb25ZKCkgeyAgcmV0dXJuIHRoaXMueTsgfVxyXG5cclxuICAgIGdldENlbnRlclgoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblgoKSArIHRoaXMuZ2V0Q29sbGlzaW9uV2lkdGgoKTsgfVxyXG4gICAgZ2V0Q2VudGVyWSgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWSgpICsgdGhpcy5nZXRDb2xsaXNpb25IZWlnaHQoKTsgfVxyXG5cdFx0XHJcblx0Ly8gIyBSZW5kZXJcclxuXHRcdFxyXG5cdCAgcmVuZGVyKGN0eCkge1xyXG4gICAgICAgIFxyXG4gICAgICBsZXQgcHJvcHMgPSB7XHJcbiAgICAgICAgeDogdGhpcy5nZXRYKCksXHJcbiAgICAgICAgeTogdGhpcy5nZXRZKCksXHJcbiAgICAgICAgdzogdGhpcy5nZXRXaWR0aCgpLFxyXG4gICAgICAgIGg6IHRoaXMuZ2V0SGVpZ2h0KClcclxuICAgICAgfSBcclxuICAgICAgbGV0IHNwcml0ZVByb3BzID0gdGhpcy5zcHJpdGVQcm9wcztcclxuICAgICAgICBcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMuc3RhZ2VTcHJpdGUsICBcclxuICAgICAgICBzcHJpdGVQcm9wcy5jbGlwX3gsIHNwcml0ZVByb3BzLmNsaXBfeSwgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuc3ByaXRlX3dpZHRoLCBzcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vREVCVUcgQ2h1bmsgU2l6ZVxyXG4gICAgICBpZiggd2luZG93LmRlYnVnICkge1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMCwwLjQpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1xyXG4gICAgICAgIGN0eC5yZWN0KHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1xyXG4gICAgICAgIGN0eC5zdHJva2UoKTtcclxuICAgICAgfVxyXG4gICAgXHJcbiAgICB9XHJcblx0XHRcdFxyXG5cdFx0Y29sbGlzaW9uKG9iamVjdCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pc0NvbGxpZGFibGU7XHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgcnVuKCB0eXBlICkge1xyXG4gICAgICB0aGlzLnNldFNwcml0ZVR5cGUodHlwZSk7XHJcbiAgICB9XHJcblxyXG4gIH0vL2NsYXNzXHJcbiAgXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBXYWxsOyIsIi8vIE9ic3RhY2xlIGNsYXNzXHJcblxyXG5cdGZ1bmN0aW9uIFdhdGVyKGN0eCwgbmFtZSwgeDAsIHkwLCB3LCBoKSB7XHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIEluaXQgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHQvLyAjIFBvc2l0aW9uXHJcblx0XHRcdFx0dGhpcy54ID0geDA7XHJcblx0XHRcdFx0dGhpcy55ID0geTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdC8vICMgUHJvcGVydGllc1xyXG5cdFx0XHRcdHRoaXMud2lkdGggPSB3OyAvL3B4XHJcblx0XHRcdFx0dGhpcy5oZWlnaHQgPSBoO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiMzRjVcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHJcblx0XHRcdC8vICMgVGV4dHVyZVxyXG5cdFx0XHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuaW1nV2F0ZXIgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdFx0XHR0aGlzLmltZ1dhdGVyLnNyYyA9ICcuL2Fzc2V0cy9zY2VuYXJpby93ZWxjb21lL2ltZy93YXRlci5qcGcnO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMud2F0ZXIgPSB0aGlzLmN0eC5jcmVhdGVQYXR0ZXJuKHRoaXMuaW1nV2F0ZXIsICdyZXBlYXQnKTtcclxuXHRcdFx0XHR0aGlzLndhdGVyID0gXCJibHVlXCI7XHJcblx0XHRcdFx0XHJcblx0XHQvLyAtIC0gLSBTZXRzIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5zZXRYID0gIGZ1bmN0aW9uICh4KSB7IHRoaXMueCA9IHg7IH1cclxuXHRcdFx0dGhpcy5zZXRZID0gIGZ1bmN0aW9uICh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0SGVpZ2h0ID0gIGZ1bmN0aW9uIChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCA9ICBmdW5jdGlvbiAod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldENvbG9yID0gIGZ1bmN0aW9uIChjb2xvcikgeyB0aGlzLmNvbG9yID0gY29sb3I7IH1cclxuXHRcdFx0dGhpcy5zZXROYW1lID0gIGZ1bmN0aW9uIChuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHJcblx0XHQvLyAtIC0gLSBHZXRzIC0gLSAtXHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFggPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcblx0XHRcdHRoaXMuZ2V0WSA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0V2lkdGggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuXHRcdFx0dGhpcy5nZXRIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldENvbG9yID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0Ly8gLSAtIC0gUmVuZGVyIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjb250ZXh0bykgeyBcclxuXHRcdFx0XHRjb250ZXh0by5maWxsU3R5bGUgPSB0aGlzLndhdGVyO1xyXG5cdFx0XHRcdGNvbnRleHRvLmZpbGxSZWN0KCB0aGlzLmdldFgoKSwgdGhpcy5nZXRZKCksIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKSApO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jb2xsaXNpb24gPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHQvLyBJZiBjb2xsaWRlcywgd2hhdCB3aWxsIGhhcHBlbj8gXHJcblx0XHRcdFx0b2JqZWN0LnNldFNwZWVkKDAuMDUpO1xyXG5cdFx0XHRcdG9iamVjdC5zZXRDb2xvcihcIiM4NkMwRjhcIik7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gSWYgdGhlIGl0ZW0gd2lsbCB0cmlnZ2VyIGEgY29sbGlzaW9uIGFjdGlvbi4gV2FsbHMgd2lsbCBtYWtlIHRoZSBwbGF5ZXIgc3RvcCwgYnV0IHdhdGVyIHdpbGwgb25seSBtYWtlIHRoZSBwbGF5ZXIgc2xvd1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTsgXHJcblx0XHRcdFx0XHJcblx0XHRcdH07XHJcblxyXG5cdH0vL2NsYXNzIiwiLypcclxuXHRQcm90b3R5cGUgU2NlbmFyaW9cclxuKi9cclxuY29uc3QgUHJvdG90eXBlX1N0YWdlXzEgPSByZXF1aXJlKCcuL3N0YWdlcy9zdGFnZV8xJyk7XHJcblxyXG5jbGFzcyBzY2VuYXJpb1Byb3RvdHlwZSB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBnYW1lUHJvcHMpe1xyXG5cdFx0dGhpcy5jdHggPSBjdHg7XHJcblx0XHR0aGlzLmNhbnZhcyA9IGNhbnZhcztcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkID0gbmV3IEFycmF5KCk7XHJcblxyXG5cdFx0dGhpcy5jb2xsaXNpb25JdGVtcyA9IG5ldyBBcnJheSgpOy8vIElzIGl0IGluIHVzZT8/P1xyXG5cdFx0XHJcblx0XHR0aGlzLndpZHRoID0gY2FudmFzLndpZHRoO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG5cclxuXHRcdHRoaXMuY2h1bmtTaXplID0gZ2FtZVByb3BzLmdldFByb3AoJ2NodW5rU2l6ZScpO1xyXG5cclxuXHRcdHRoaXMucGxheWVyU3RhcnRYID0gMDtcclxuXHRcdHRoaXMucGxheWVyU3RhcnRZID0gMDtcclxuXHJcblx0XHR0aGlzLnJ1bigpO1xyXG5cdH1cclxuXHJcblx0Ly8gIyBNYWluIFJlbmRlclxyXG5cdHJlbmRlcigpe1xyXG5cdFx0Ly8gLi4uIFxyXG5cdH1cdFxyXG5cdFx0XHRcclxuXHQvLyAjIEFkZCBJdGVtcyB0byB0aGUgUmVuZGVyXHJcblx0YWRkUmVuZGVySXRlbShpdGVtKXtcclxuXHRcdHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblx0YWRkUmVuZGVySXRlbUFuaW1hdGVkKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cclxuXHQvLyAjIEdldHNcclxuXHRnZXRDdHgoKSB7IHJldHVybiB0aGlzLmN0eDsgfVxyXG5cdGdldENhbnZhcygpIHsgcmV0dXJuIHRoaXMuY2FudmFzOyB9XHRcclxuXHRcdFx0XHRcclxuXHRnZXRSZW5kZXJJdGVtcygpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXM7IH1cclxuXHRnZXRSZW5kZXJJdGVtc0FuaW1hdGVkKCkgeyByZXR1cm4gdGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkOyB9XHJcblx0XHRcdFx0XHJcblx0Z2V0UGxheWVyU3RhcnRYKCkgeyByZXR1cm4gdGhpcy5jaHVua1NpemUgKiA0OyB9IC8vIElzc28gdGVtIHF1ZSB2aXIgZG8gY2Vuw6FyaW8hISFcclxuXHRnZXRQbGF5ZXJTdGFydFkoKSB7IHJldHVybiB0aGlzLmNodW5rU2l6ZSAqIDQ7IH1cclxuICAgICAgXHJcblx0Ly8gIyBTdGFnZXNcclxuXHRzZXRTdGFnZShzdGFnZV9udW1iZXIpIHtcclxuXHJcblx0XHRsZXQgc3RhZ2VfMDEgPSBuZXcgUHJvdG90eXBlX1N0YWdlXzEoIHRoaXMuY2h1bmtTaXplICk7XHJcbiAgICAgICAgICBcclxuXHRcdHN3aXRjaChzdGFnZV9udW1iZXIpIHtcclxuXHRcdFx0Y2FzZSAxOlxyXG5cdFx0XHRcdHRoaXMuc3RhZ2UgPSBzdGFnZV8wMTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHRcdHRoaXMubG9hZFN0YWdlKCk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIEZ1bmN0aW9ucyB0byBsb2FkIHNlbGVjdGVkIHN0YWdlXHJcblx0bG9hZFN0YWdlKCkge1xyXG4gICAgICAgICAgICBcclxuXHRcdC8vIENsZWFyIHByZXZpb3VzIHJlbmRlciBpdGVtc1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcyA9IG5ldyBBcnJheSgpO1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkID0gbmV3IEFycmF5KCk7XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBTdGF0aWMgSXRlbXNcclxuXHRcdHRoaXMuc3RhZ2UuZ2V0U3RhdGljSXRlbXMoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG5cdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oaXRlbSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBBZGQgdGhlIEFuaW1hdGVkIEl0ZW1zXHJcblx0XHR0aGlzLnN0YWdlLmdldEFuaW1hdGVkSXRlbXMoKS5tYXAoIChpdGVtKSA9PiB7IFxyXG5cdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW1BbmltYXRlZChpdGVtKTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblx0fVxyXG5cclxuXHQvLyAjIFJ1biB3aGVuIGNsYXNzIGxvYWRzXHJcblx0cnVuKCkge1xyXG5cdFx0XHJcblx0XHQvLyBTZXQgRGVmYXVsdCBTdGFnZVxyXG5cdFx0dGhpcy5zZXRTdGFnZSgxKTsgXHJcblx0XHRcdFx0XHJcblx0fVxyXG5cclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc2NlbmFyaW9Qcm90b3R5cGU7IiwiLy8gU3RhZ2UgMDFcclxuXHJcbmNvbnN0IFdhbGwgPSByZXF1aXJlKCcuLi9hc3NldHMvd2FsbCcpO1xyXG5jb25zdCBGbG9vciA9IHJlcXVpcmUoJy4uL2Fzc2V0cy9mbG9vcicpO1xyXG5cclxuY2xhc3MgUHJvdG90eXBlX1N0YWdlXzEge1xyXG5cclxuICBjb25zdHJ1Y3RvcihjaHVua1NpemUpIHtcclxuICAgIHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMucmVuZGVySXRlbXNBbmltYXRlZCA9IG5ldyBBcnJheSgpO1xyXG4gICAgdGhpcy5jaHVua1NpemUgPSBjaHVua1NpemU7XHJcbiAgICB0aGlzLnJ1bigpO1xyXG4gIH1cclxuICBcclxuICAvLyAjIEdldHNcclxuICBnZXRTdGF0aWNJdGVtcygpIHsgIHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcbiAgZ2V0QW5pbWF0ZWRJdGVtcygpIHsgIHJldHVybiB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQ7IH1cclxuICAgICAgICBcclxuICAvLyAjIEFkZCBJdGVtcyB0byB0aGUgcmVuZGVyXHJcblx0YWRkUmVuZGVySXRlbShpdGVtKXtcclxuXHRcdHRoaXMucmVuZGVySXRlbXMucHVzaChpdGVtKTtcclxuXHR9XHJcblx0YWRkUmVuZGVySXRlbUFuaW1hdGVkKGl0ZW0pe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkLnB1c2goaXRlbSk7XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU2NlbmFyaW8gXHJcbiAgZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeCwgeSl7XHJcbiAgICBzd2l0Y2goaXRlbS5uYW1lKSB7XHJcbiAgICAgIGNhc2UgXCJ3YWxsXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBXYWxsKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZmxvb3JcIjpcclxuICAgICAgICByZXR1cm4gbmV3IEZsb29yKGl0ZW0udHlwZSwgeCwgeSwgdGhpcy5jaHVua1NpemUpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIERlc2dpbiAoU3RhdGljKVxyXG4gICAgc2NlbmFyaW9EZXNpZ24oKSB7XHJcblxyXG4gICAgICAvLyBXYWxsc1xyXG4gICAgICBsZXQgd3QgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInRvcFwifTtcclxuICAgICAgbGV0IHdsID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJsZWZ0XCJ9O1xyXG4gICAgICBsZXQgd3IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcInJpZ2h0XCJ9O1xyXG4gICAgICBsZXQgd2IgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImJvdHRvbVwifTtcclxuICAgICAgXHJcbiAgICAgIGxldCB3Y190bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX3RvcF9sZWZ0XCJ9O1xyXG4gICAgICBsZXQgd2NfdHIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfcmlnaHRcIn07XHJcbiAgICAgIGxldCB3Y19ibCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwiY29ybmVyX2JvdHRvbV9sZWZ0XCJ9O1xyXG4gICAgICBsZXQgd2NfYnIgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fcmlnaHRcIn07XHJcbiAgICAgIFxyXG4gICAgICBsZXQgd3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ3YXRlclwifTtcclxuICAgICAgbGV0IG9iID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJvYnN0YWNsZVwifTtcclxuICAgICAgICAgIFxyXG4gICAgICAvLyBGbG9vclxyXG4gICAgICBsZXQgZjEgPSB7IG5hbWU6IFwiZmxvb3JcIiwgdHlwZTogXCIwMVwifTtcclxuICAgICAgbGV0IGYyID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDJcIn07XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIE1ha2Ugc2h1cmUgdG8gZGVzaWduIGJhc2VhZCBvbiBnYW1lUHJvcGVydGllcyAhXHJcbiAgICAgIGxldCBzY2VuYXJpb0Rlc2lnbiA9IFtcclxuICAgICAgICBbIHd0ciwgd3RyLCAgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgIHd0ciwgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdjX3RsLCB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3dCwgICB3Y190ciwgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBvYiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjEsICAgZjEsICAgb2IsICAgZjEsICAgZjIsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdjX2JsLCB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3YiwgICB3Y19iciwgIHd0ciBdLFxyXG4gICAgICBdO1xyXG5cclxuICAgICAgLy8gIyBQcm9jY2VzcyBzY2VuYXJpbyBkZXNpZ25cclxuICAgICAgc2NlbmFyaW9EZXNpZ24ubWFwKCAoYXJyYXksIHgpID0+IHtcclxuICAgICAgICBhcnJheS5tYXAoIChpdGVtLCB5KSA9PiB7XHJcbiAgICAgICAgbGV0IHgwID0geSAqIHRoaXMuY2h1bmtTaXplO1xyXG4gICAgICAgIGxldCB5MCA9IHggKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICB0aGlzLmFkZFJlbmRlckl0ZW0odGhpcy5nZXRTY2VuYXJpb0Fzc2V0SXRlbShpdGVtLCB4MCwgeTApKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIC8vICMgU2NlbmFyaW8gQW5pbWF0ZWQgaXRlbXNcclxuICAgIC8vIFRPIERPXHJcblxyXG4gIHJ1biAoKSB7XHJcbiAgICB0aGlzLnNjZW5hcmlvRGVzaWduKCk7XHJcbiAgfVxyXG5cclxufSAvLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm90b3R5cGVfU3RhZ2VfMVxyXG5cclxuXHJcblxyXG5cclxuLypcclxuICAgIC8vICMgVGV4dHVyZXNcclxuXHRcclxuXHRcdFx0XHRcdHRoaXMuYmdJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0XHRcdFx0dGhpcy5iZ0ltYWdlLnNyYyA9ICcuL2Fzc2V0cy9zY2VuYXJpby93ZWxjb21lL2ltZy9iYWNrZ3JvdW5kLmpwZyc7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHRoaXMuYmFja2dyb3VuZCA9IHRoaXMuY3R4LmNyZWF0ZVBhdHRlcm4odGhpcy5iZ0ltYWdlLCAncmVwZWF0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gXCIjMzMzXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAvLyAjIE9ic3RhY2xlc1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBTY2VuYXJpbyBCb3JkZXJzXHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsVG9wXCIsIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuY2h1bmtTaXplKSApOyAvL2NvbnRleHQsIG5hbWUsIHgwLCB5MCwgdywgaCxcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGxCb3R0b21cIiwgMCwgdGhpcy5oZWlnaHQgLSB0aGlzLmNodW5rU2l6ZSwgdGhpcy53aWR0aCwgdGhpcy5jaHVua1NpemUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsTGVmdFwiLCAwLCAwLCB0aGlzLmNodW5rU2l6ZSwgdGhpcy5oZWlnaHQpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsUmlnaHRcIiwgdGhpcy53aWR0aC10aGlzLmNodW5rU2l6ZSwgMCwgdGhpcy5jaHVua1NpemUsIHRoaXMuaGVpZ2h0KSApO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdC8vIFdhbGxzXHJcblx0XHRcdFx0XHQvKlxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDAxXCIsIDIwLCA3MywgNDA1LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwMlwiLCA5MCwgMTkwLCA4MCwgODApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDNcIiwgNTAzLCAxOSwgNDAsIDQ2NSkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNFwiLCAyODMsIDQ4MSwgNDQwLCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNVwiLCAyNDQsIDI5MiwgNDAsIDIyOSkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwNlwiLCAyODMsIDM2NywgMTM5LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwN1wiLCA3OCwgNDAzLCAxNjksIDQwKSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDA4XCIsIDUzNiwgMTg5LCA3OSwgNDApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDlcIiwgNjY5LCA3NywgNDAsIDI4OCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwxMFwiLCA2NjksIDM2NSwgMTEyLCA0MCkgKTtcdFxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDYwNCwgNzcsIDY3LCA0MCkgKTtcdFxyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDMxOCwgMTcyLCA5MywgOTUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMTFcIiwgODIsIDUxMCwgNzUsIDc0KSApO1x0XHJcblx0XHRcdFx0XHQqL1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBTY2VuYXJpbyByYW5kb20gb2JzdGFjbGVzXHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Ly9Qb3dlclxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdC8vIFBvc3NpYmxlcyB4LCB5LCB3LCBoIGZvciBQb3dlclxyXG5cdFx0XHRcdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdFx0XHR2YXIgYVBvd2VyID0gQXJyYXkoKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YVBvd2VyLnB1c2goIHsgeDogMTM3LCB5OiAyMCwgdzogMTY3LCBoOiA1MyB9KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YVBvd2VyLnB1c2goIHsgeDogNDIyLCB5OiAzNjgsIHc6IDgwLCBoOiAzOCB9KTsgXHJcblx0XHRcdFx0XHRcdFx0XHRcdGFQb3dlci5wdXNoKCB7IHg6IDU0MywgeTogNDA2LCB3OiAyMzYsIGg6IDc1IH0pOyBcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dmFyIHJQb3dlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMDtcdFx0XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgUG93ZXIoY3R4LCBcInBvd2VyMDFcIiwgYVBvd2VyW3JQb3dlcl0ueCwgYVBvd2VyW3JQb3dlcl0ueSwgYVBvd2VyW3JQb3dlcl0udywgYVBvd2VyW3JQb3dlcl0uaCkgKTtcdFxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBXYXRlclxyXG5cdFx0XHRcdFx0Ly90aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYXRlcihjdHgsIFwicG93ZXIwMVwiLCAzMDAsIDUyMSwgMTkwLCA1OSkgKTtcclxuXHJcblx0XHRcdFx0XHQvLyBFeGl0XHJcblx0XHRcdFx0XHQvL3RoaXMuYWRkUmVuZGVySXRlbUFuaW1hdGVkKCBuZXcgRXhpdChjdHgsIFwiZXhpdFwiLCA1MCwgMzAsIDEwLCAxMCkgKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gRW5lbWllc1xyXG5cdFx0XHRcdFx0XHQvL2N0eCwgY29saXNhbywgbmFtZSwgeDAsIHkwLCB0aXBvTW92LCBtaW5YLCBtYXhYLCBtaW5ZLCBtYXhZLCBzcGVlZCBcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvL3RoaXMuYWRkUmVuZGVySXRlbUFuaW1hdGVkKCBuZXcgRW5lbXkoY3R4LCB0aGlzLnBsYXllciwgXCJlbmVteTAxXCIsIDE1MCwgMzQwLCAnaG9yJywgMjUsIDIzMCwgMCwgMCwgMC4wNSkgKTsgXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0ICAgXHJcbiovIiwiLy8gT2JzdGFjbGUgY2xhc3NcclxuXHJcblx0ZnVuY3Rpb24gRW5lbXkoY3R4LCBwbGF5ZXIsIG5hbWUsIHgwLCB5MCwgbW92VHlwZSwgbWluWCwgbWF4WCwgbWluWSwgbWF4WSwgc3BlZWQgKSB7XHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIEluaXQgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHQvLyAjIFBvc2l0aW9uXHJcblx0XHRcdFx0dGhpcy54ID0geDA7XHJcblx0XHRcdFx0dGhpcy55ID0geTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdC8vICMgUHJvcGVydGllc1xyXG5cdFx0XHRcdHRoaXMud2lkdGggPSAxMDsgLy9weFxyXG5cdFx0XHRcdHRoaXMuaGVpZ2h0ID0gNTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5jb2xvciA9IFwiI0YwMFwiOyBcclxuXHRcdFx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdFx0XHRcdHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuXHRcdFx0XHJcblx0XHRcdC8vICMgTW92ZW1lbnRcclxuXHRcdFx0XHR0aGlzLnBsYXllciA9IHBsYXllcjtcclxuXHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3YgPSBtb3ZUeXBlOyAvL2hvciwgdmVyIDwtIG1vdmVtZW50IHR5cGVzIHRoYXQgdGhlIGVuZW15IGNhbiBkb1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubWluWCA9IG1pblg7XHJcblx0XHRcdFx0dGhpcy5taW5ZID0gbWluWTtcclxuXHRcdFx0XHR0aGlzLm1heFggPSBtYXhYO1xyXG5cdFx0XHRcdHRoaXMubWF4WSA9IG1heFk7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3ZYID0gMTtcclxuXHRcdFx0XHR0aGlzLm1vdlkgPSAxO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZW5lbXkgPSBuZXcgT2JqZWN0O1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS53aWR0aCA9IHRoaXMud2lkdGg7XHJcblx0XHRcdFx0XHR0aGlzLmVuZW15LmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG5cclxuXHRcdFx0Ly8gIyBUZXh0dXJlXHJcblx0XHRcdFx0dGhpcy5jdHggPSBjdHg7XHJcblxyXG5cdFx0XHRcdHRoaXMub2JqQ29sbGlzaW9uID0gbmV3IENvbGxpc2lvbiggMCAsIDAsIHRoaXMucGxheWVyICk7XHJcblx0XHRcdFx0XHJcblx0XHQvLyAtIC0gLSBTZXRzIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5zZXRYID0gIGZ1bmN0aW9uICh4KSB7IHRoaXMueCA9IHg7IH1cclxuXHRcdFx0dGhpcy5zZXRZID0gIGZ1bmN0aW9uICh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0SGVpZ2h0ID0gIGZ1bmN0aW9uIChoZWlnaHQpIHsgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7IH1cclxuXHRcdFx0dGhpcy5zZXRXaWR0aCA9ICBmdW5jdGlvbiAod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldENvbG9yID0gIGZ1bmN0aW9uIChjb2xvcikgeyB0aGlzLmNvbG9yID0gY29sb3I7IH1cclxuXHRcdFx0dGhpcy5zZXROYW1lID0gIGZ1bmN0aW9uIChuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHRcclxuXHRcdC8vIC0gLSAtIEdldHMgLSAtIC1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0WCA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdFx0dGhpcy5nZXRZID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG5cdFx0XHR0aGlzLmdldEhlaWdodCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0Q29sb3IgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuXHJcblxyXG5cdFx0Ly8gLSAtIC0gTW92ZW1lbnQgIC0gLSAtXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5tb3ZIb3IgPSBmdW5jdGlvbiAobW9kKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmICggdGhpcy5tb3ZYID09IDEgKSB7Ly8gZ28gUmlnaHRcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMueCA9IHRoaXMueCArIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy54ID49IHRoaXMubWF4WCApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZYID0gMDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMueCA9IHRoaXMueCAtIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy54IDwgdGhpcy5taW5YIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlggPSAxO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHRcclxuXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92VmVyID0gZnVuY3Rpb24gKG1vZCkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoIHRoaXMubW92WSA9PSAxICkge1xyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy55ID0gdGhpcy55ICsgdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnkgPj0gdGhpcy5tYXhZIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlkgPSAwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy55ID0gdGhpcy55IC0gdGhpcy5zcGVlZCAqIG1vZDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGlmICh0aGlzLnkgPCB0aGlzLm1pblkgKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WSA9IDE7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdH1cdFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHJcblx0XHQvLyAtIC0gLSBSZW5kZXIgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHR0aGlzLnJlbmRlciA9IGZ1bmN0aW9uKGNvbnRleHQsIG1vZCkgeyBcclxuXHJcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMubW92KSB7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRjYXNlIFwiaG9yXCI6XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZIb3IobW9kKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGNhc2UgXCJ2ZXJcIjpcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlZlcihtb2QpO1xyXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdC8vIENoZWNrIGlmIGNvbGxpZGVzIHdpdGggcGxheWVyXHJcblxyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS54ID0gdGhpcy54O1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS55ID0gdGhpcy55O1xyXG5cclxuXHRcdFx0XHRcdGlmICggdGhpcy5vYmpDb2xsaXNpb24uY2hlY2tQbGF5ZXJDb2xsaXNpb24odGhpcy5lbmVteSkgPT0gdHJ1ZSApIFxyXG5cdFx0XHRcdFx0XHR0aGlzLmNvbGxpc2lvbih0aGlzLnBsYXllcik7XHJcblx0XHRcdFx0XHRcclxuXHJcblx0XHRcdFx0Y29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFJlY3QoIHRoaXMuZ2V0WCgpLCB0aGlzLmdldFkoKSwgdGhpcy5nZXRXaWR0aCgpLCB0aGlzLmdldEhlaWdodCgpICk7XHJcblx0XHRcdFx0XHJcblx0XHRcdH07XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmNvbGxpc2lvbiA9IGZ1bmN0aW9uKG9iamVjdCkge1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9iamVjdC5zZXRDb2xvcihcIiMzMzNcIik7XHJcblx0XHRcdFx0b2JqZWN0LnJlc2V0UG9zaXRpb24oKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHJcblx0XHRcdH07XHJcblxyXG5cdH0vL2NsYXNzIiwiLy8gQ2xhc3MgdGhhdCBkZXRlY3RzIGNvbGxpc2lvbiBiZXR3ZWVuIHBsYXllciBhbmQgb3RoZXIgb2JqZWN0c1xyXG5jbGFzcyBDb2xsaXNpb24ge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihzY2VuYXJpb1dpZHRoLCBzY2VuYXJpb0hlaWdodCwgcGxheWVyKSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zID0gbmV3IEFycmF5KCk7IC8vIEl0ZW1zIHRvIGNoZWNrIGZvciBjb2xsaXNpb25cclxuICAgIHRoaXMuc2NlbmFyaW9XaWR0aCA9IHNjZW5hcmlvV2lkdGg7XHJcbiAgICB0aGlzLnNjZW5hcmlvSGVpZ2h0ID0gc2NlbmFyaW9IZWlnaHQ7XHJcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICB9XHJcblx0XHRcdFxyXG4gIC8vICMgQ2hlY2sgaWYgdGhlIG9iamVjdCBjb2xsaWRlcyB3aXRoIGFueSBvYmplY3QgaW4gdmVjdG9yXHJcbiAgLy8gQWxnb3JpdGhtIHJlZmVyZW5jZTogR3VzdGF2byBTaWx2ZWlyYSAtIGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9czdxaVdMQkJwSndcclxuICBjaGVjayhvYmplY3QpIHtcclxuICAgIGZvciAobGV0IGkgaW4gdGhpcy5jb2xJdGVucykge1xyXG4gICAgICBsZXQgcjEgPSBvYmplY3Q7XHJcbiAgICAgIGxldCByMiA9IHRoaXMuY29sSXRlbnNbaV07XHJcbiAgICAgIHRoaXMuY2hlY2tDb2xsaXNpb24ocjEsIHIyKTtcclxuICAgIH0gXHJcbiAgfVxyXG5cclxuICBjaGVja0NvbGxpc2lvbihyMSwgcjIpIHtcclxuICAgICAgICBcclxuICAgIC8vcjEgLT4gdGhlIG1vdmluZyBvYmplY3RcclxuICAgIC8vcjIgLT4gdGhlIFwid2FsbFwiXHJcblxyXG4gICAgLy8gT25seSBjaGVja3MgXCJjb2xsaWRhYmxlXCIgb2JqZWN0c1xyXG4gICAgICBpZiggISByMi5jb2xsaXNpb24oKSApIHJldHVybiBmYWxzZTtcclxuIFxyXG4gICAgLy8gc3RvcmVzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBvYmplY3RzIChtdXN0IGJlIHJlY3RhbmdsZSlcclxuICAgICAgdmFyIGNhdFggPSByMS5nZXRDZW50ZXJYKCkgLSByMi5nZXRDZW50ZXJYKCk7XHJcbiAgICAgIHZhciBjYXRZID0gcjEuZ2V0Q2VudGVyWSgpIC0gcjIuZ2V0Q2VudGVyWSgpO1xyXG5cclxuICAgICAgdmFyIHN1bUhhbGZXaWR0aCA9ICggcjEuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uV2lkdGgoKSAvIDIgKTtcclxuICAgICAgdmFyIHN1bUhhbGZIZWlnaHQgPSAoIHIxLmdldENvbGxpc2lvbkhlaWdodCgpIC8gMiApICsgKCByMi5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSA7XHJcbiAgICAgICAgXHJcbiAgICAgIGlmKE1hdGguYWJzKGNhdFgpIDwgc3VtSGFsZldpZHRoICYmIE1hdGguYWJzKGNhdFkpIDwgc3VtSGFsZkhlaWdodCl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG92ZXJsYXBYID0gc3VtSGFsZldpZHRoIC0gTWF0aC5hYnMoY2F0WCk7XHJcbiAgICAgICAgdmFyIG92ZXJsYXBZID0gc3VtSGFsZkhlaWdodCAtIE1hdGguYWJzKGNhdFkpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKG92ZXJsYXBYID49IG92ZXJsYXBZKXsgLy8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIFVwL0Rvd25cclxuICAgICAgICAgIGlmKGNhdFkgPiAwKXsgLy8gVXBcclxuICAgICAgICAgICAgcjEuc2V0WSggcjEuZ2V0WSgpICsgb3ZlcmxhcFkgKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSAtIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsvLyBEaXJlY3Rpb24gb2YgY29sbGlzaW9uIC0gTGVmdC9SaWdodFxyXG4gICAgICAgICAgaWYoY2F0WCA+IDApeyAvLyBMZWZ0XHJcbiAgICAgICAgICAgIHIxLnNldFgoIHIxLmdldFgoKSArIG92ZXJsYXBYICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgLSBvdmVybGFwWCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcjEubm9Db2xsaXNpb24oKTsgLy8gV2hhdCBoYXBwZW5zIGlmIGl0J3Mgbm90IGNvbGxpbmc/XHJcbiAgICAgIH1cclxuICB9XHJcblx0XHRcdFxyXG5cdC8vIEFkZCBpdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcblx0YWRkSXRlbShvYmplY3QpIHtcclxuXHRcdHRoaXMuY29sSXRlbnMucHVzaChvYmplY3QpO1xyXG4gIH07XHJcbiAgXHJcbiAgYWRkQXJyYXlJdGVtKG9iamVjdCl7XHJcblx0XHRmb3IgKGxldCBpIGluIG9iamVjdCl7XHJcbiAgICAgIHRoaXMuY29sSXRlbnMucHVzaChvYmplY3RbaV0pO1xyXG4gICAgfVxyXG5cdH1cclxuXHJcbn0vLyBjbGFzc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2xsaXNpb247XHJcblx0IiwiY2xhc3MgUmVuZGVyIHtcclxuXHJcblx0Y29uc3RydWN0b3IoY3R4LCBjYW52YXMsIGRpZmljdWxkYWRlLCBwbGF5ZXIpIHtcclxuXHRcdHRoaXMuY3R4ID0gY3R4OyBcclxuXHRcdHRoaXMuc2NlbmFyaW8gPSBcIlwiO1xyXG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0XHR0aGlzLnBsYXllciA9IHBsYXllcjtcclxuXHRcdHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTsgXHJcblx0fVxyXG5cdFx0ICAgIFxyXG5cdC8vIEFkZCBpdGVtcyB0byB0aGUgdmVjdG9yXHJcblx0YWRkSXRlbShvYmplY3Qpe1xyXG5cdFx0dGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdCk7XHJcblx0fVxyXG5cdGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG5cdFx0XHR0aGlzLnJlbmRlckl0ZW1zLnB1c2gob2JqZWN0W2ldKTtcclxuXHRcdH1cclxuXHR9XHJcblx0c2V0U2NlbmFyaW8oc2NlbmFyaW8pe1xyXG5cdFx0dGhpcy5zY2VuYXJpbyA9IHNjZW5hcmlvO1xyXG5cdH1cclxuXHRcdFx0XHJcblx0Ly8gVGhpcyBmdW5jdGlvbnMgd2lsbCBiZSBjYWxsZWQgY29uc3RhbnRseSB0byByZW5kZXIgaXRlbXNcclxuXHRzdGFydChtb2QpIHtcdFx0XHJcblx0XHRcdFx0XHJcblx0XHQvLyBDbGVhciBjYW52YXMgYmVmb3JlIHJlbmRlciBhZ2FpblxyXG5cdFx0dGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG5cdFx0dGhpcy5jdHguc2hhZG93Qmx1ciA9IDA7XHJcblxyXG5cdFx0Ly8gU2NlbmFyaW9cclxuXHRcdGlmICggdGhpcy5zY2VuYXJpbyAhPSBcIlwiKSBcclxuXHRcdFx0dGhpcy5zY2VuYXJpby5yZW5kZXIodGhpcy5jdHgpO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gUmVuZGVyIGl0ZW1zXHJcblx0XHRmb3IgKGxldCBpIGluIHRoaXMucmVuZGVySXRlbXMpIHtcclxuXHRcdFx0Ly8gRXhlY3V0ZSB0aGUgcmVuZGVyIGZ1bmN0aW9uIC0gSW5jbHVkZSB0aGlzIGZ1bmN0aW9uIG9uIGV2ZXJ5IGNsYXNzIVxyXG5cdFx0XHR0aGlzLnJlbmRlckl0ZW1zW2ldLnJlbmRlcih0aGlzLmN0eCwgbW9kKTtcclxuXHRcdH1cclxuXHJcblx0fVxyXG5cdFxyXG59Ly9jbGFzc1xyXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlciIsImNvbnN0IGdhbWVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi9nYW1lUHJvcGVydGllcycpO1xyXG5jb25zdCBzY2VuYXJpb1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zY2VuYXJpb1Byb3RvdHlwZScpO1xyXG5jb25zdCBQbGF5ZXIgPSByZXF1aXJlKCcuL2Fzc2V0cy9wbGF5ZXInKTtcclxuY29uc3QgQ29sbGlzaW9uID0gcmVxdWlyZSgnLi9lbmdpbmUvY29sbGlzaW9uJyk7XHJcbmNvbnN0IFJlbmRlciA9IHJlcXVpcmUoJy4vZW5naW5lL3JlbmRlcicpO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cdFxyXG5cdC8vICMgSW5pdFxyXG5cdFx0XHJcblx0XHR2YXIgZnBzSW50ZXJ2YWwsIG5vdywgZGVsdGFUaW1lLCBlbGFwc2VkO1xyXG4gICAgdmFyIGdhbWVQcm9wcyA9IG5ldyBnYW1lUHJvcGVydGllcygpO1xyXG4gICAgXHJcblx0XHR2YXIgY2FudmFzU3RhdGljID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhc19zdGF0aWMnKTtcclxuXHRcdHZhciBjb250ZXh0U3RhdGljID0gY2FudmFzU3RhdGljLmdldENvbnRleHQoJzJkJyk7XHJcblx0XHRcclxuXHRcdHZhciBjYW52YXNBbmltYXRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfYW5pbWF0ZWQnKTtcclxuXHRcdHZhciBjb250ZXh0QW5pbWF0ZWQgPSBjYW52YXNBbmltYXRlZC5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgXHJcblx0XHRjYW52YXNBbmltYXRlZC53aWR0aCA9IGNhbnZhc1N0YXRpYy53aWR0aCA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjYW52YXNXaWR0aCcpO1xyXG5cdFx0Y2FudmFzQW5pbWF0ZWQuaGVpZ2h0ID0gY2FudmFzU3RhdGljLmhlaWdodCA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjYW52YXNIZWlnaHQnKTtcclxuXHJcblx0Ly8gIyBTY2VuYXJpb1xyXG5cdFx0XHJcblx0XHR2YXIgc2NlbmFyaW8gPSBuZXcgc2NlbmFyaW9Qcm90b3R5cGUoY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljLCBnYW1lUHJvcHMgKTtcclxuXHJcblx0Ly8gIyBQbGF5ZXJzXHJcblxyXG5cdFx0dmFyIHBsYXllciA9IG5ldyBQbGF5ZXIoIHNjZW5hcmlvLmdldFBsYXllclN0YXJ0WCgpLCBzY2VuYXJpby5nZXRQbGF5ZXJTdGFydFkoKSwgZ2FtZVByb3BzLCBjb250ZXh0QW5pbWF0ZWQgKTsgLy9wb3Npw6fDo28geCBlIHlcclxuXHJcblx0Ly8gIyBDb2xsaXNpb24gZGV0ZWN0aW9uIGNsYXNzXHJcblx0XHJcblx0XHR2YXIgY29sbGlzaW9uID0gbmV3IENvbGxpc2lvbihjYW52YXNBbmltYXRlZC53aWR0aCwgY2FudmFzQW5pbWF0ZWQuaGVpZ2h0ICk7XHJcblx0XHRcclxuXHRcdC8vIEFkZCB0aGUgb2JqZWN0cyB0byB0aGUgY29sbGlzaW9uIHZlY3RvclxyXG5cdFx0Y29sbGlzaW9uLmFkZEFycmF5SXRlbSggc2NlbmFyaW8uZ2V0UmVuZGVySXRlbXMoKSApO1xyXG5cdFx0Y29sbGlzaW9uLmFkZEFycmF5SXRlbSggc2NlbmFyaW8uZ2V0UmVuZGVySXRlbXNBbmltYXRlZCgpICk7XHJcblxyXG5cdFx0XHJcblx0Ly8gIyBSZW5kZXJcclxuXHRcdFxyXG5cdFx0dmFyIHJlbmRlclN0YXRpYyA9IG5ldyBSZW5kZXIoY29udGV4dFN0YXRpYywgY2FudmFzU3RhdGljKTsgLy8gUmVuZGVyIGV4ZWN1dGVkIG9ubHkgb25jZVxyXG5cdFx0dmFyIHJlbmRlckFuaW1hdGVkID0gbmV3IFJlbmRlcihjb250ZXh0QW5pbWF0ZWQsIGNhbnZhc0FuaW1hdGVkKTsgLy9SZW5kZXIgd2l0aCBhbmltYXRlZCBvYmplY3RzIG9ubHlcclxuXHRcdFx0XHJcblx0XHQvLyBBZGQgaXRlbXMgdG8gYmUgcmVuZGVyZWRcclxuXHRcdFxyXG5cdFx0cmVuZGVyU3RhdGljLnNldFNjZW5hcmlvKHNjZW5hcmlvKTsgLy8gc2V0IHRoZSBzY2VuYXJpb1xyXG5cdFx0cmVuZGVyU3RhdGljLmFkZEFycmF5SXRlbShzY2VuYXJpby5nZXRSZW5kZXJJdGVtcygpKTsgLy8gR2V0IGFsbCBpdGVtcyBmcm9tIHRoZSBzY2VuYXJpbyB0aGF0IG5lZWRzIHRvIGJlIHJlbmRlcmVkXHJcblx0XHRcclxuXHRcdHJlbmRlckFuaW1hdGVkLmFkZEFycmF5SXRlbSggc2NlbmFyaW8uZ2V0UmVuZGVySXRlbXNBbmltYXRlZCgpICk7IC8vIEdldCBhbGwgYW5pbWF0ZWQgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cdFx0cmVuZGVyQW5pbWF0ZWQuYWRkSXRlbSggcGxheWVyICk7IC8vIEFkZHMgdGhlIHBsYXllciB0byB0aGUgYW5pbWF0aW9uIHJlbmRlclxyXG5cclxuXHJcblx0Ly8gIyBLZXlib2FyZCBFdmVudHNcclxuXHRcclxuXHRcdHZhciBrZXlzRG93biA9IHt9O1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcblx0XHQgIGtleXNEb3duW2Uua2V5Q29kZV0gPSB0cnVlO1xyXG5cdFx0fSk7XHJcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcblx0XHRcdGRlbGV0ZSBrZXlzRG93bltlLmtleUNvZGVdO1xyXG5cdFx0XHRwbGF5ZXIucmVzZXRTdGVwKCk7XHJcblx0XHR9KTtcclxuXHJcblxyXG5cdC8vICMgVGhlIEdhbWUgTG9vcFxyXG5cdFx0XHRcclxuXHRcdGZ1bmN0aW9uIHVwZGF0ZUdhbWUobW9kKSB7XHJcblxyXG5cdFx0XHQvLyAjIE1vdmVtZW50cyBcclxuICAgICAgcGxheWVyLmhhbmRsZU1vdmVtZW50KCBrZXlzRG93biApO1xyXG4gICAgICBcclxuICAgICAgLy8gIyBDaGVjayBpZiBwbGF5ZXIgaXMgY29sbGlkaW5nXHJcbiAgICAgIGNvbGxpc2lvbi5jaGVjayhwbGF5ZXIpO1xyXG5cdFx0ICAgIFxyXG5cdFx0fTtcclxuXHJcblxyXG5cdC8vICMgXCJUaHJlYWRcIiB0aGEgcnVucyB0aGUgZ2FtZVxyXG5cdFx0ZnVuY3Rpb24gcnVuR2FtZShmcHMpIHtcclxuXHRcdFx0ZnBzSW50ZXJ2YWwgPSAxMDAwIC8gZnBzO1xyXG5cdFx0XHRkZWx0YVRpbWUgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRzdGFydFRpbWUgPSBkZWx0YVRpbWU7XHJcblx0XHRcdGdhbWVMb29wKCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGZ1bmN0aW9uIGdhbWVMb29wKCkge1xyXG5cclxuXHRcdFx0Ly8gUnVucyBvbmx5IHdoZW4gdGhlIGJyb3dzZXIgaXMgaW4gZm9jdXNcclxuXHRcdFx0Ly8gUmVxdWVzdCBhbm90aGVyIGZyYW1lXHJcblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcblxyXG5cdFx0XHQvLyBjYWxjIGVsYXBzZWQgdGltZSBzaW5jZSBsYXN0IGxvb3BcclxuXHRcdFx0bm93ID0gRGF0ZS5ub3coKTtcclxuXHRcdFx0ZWxhcHNlZCA9IG5vdyAtIGRlbHRhVGltZTtcclxuXHRcclxuXHRcdFx0Ly8gaWYgZW5vdWdoIHRpbWUgaGFzIGVsYXBzZWQsIGRyYXcgdGhlIG5leHQgZnJhbWVcclxuXHRcdFx0aWYgKGVsYXBzZWQgPiBmcHNJbnRlcnZhbCkge1xyXG5cdFxyXG5cdFx0XHRcdC8vIEdldCByZWFkeSBmb3IgbmV4dCBmcmFtZSBieSBzZXR0aW5nIHRoZW49bm93LCBidXQgYWxzbyBhZGp1c3QgZm9yIHlvdXJcclxuXHRcdFx0XHQvLyBzcGVjaWZpZWQgZnBzSW50ZXJ2YWwgbm90IGJlaW5nIGEgbXVsdGlwbGUgb2YgUkFGJ3MgaW50ZXJ2YWwgKDE2LjdtcylcclxuXHRcdFx0XHRkZWx0YVRpbWUgPSBub3cgLSAoZWxhcHNlZCAlIGZwc0ludGVydmFsKTtcclxuXHRcclxuXHRcdFx0XHR1cGRhdGVHYW1lKCBkZWx0YVRpbWUgKTtcclxuXHRcdCAgICBcclxuXHRcdFx0XHRyZW5kZXJBbmltYXRlZC5zdGFydCggZGVsdGFUaW1lICk7IFxyXG5cdFxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0fTtcclxuXHRcclxuXHQvLyAjIFN0YXJ0cyB0aGUgZ2FtZVxyXG5cdFx0XHJcblx0XHRyZW5kZXJTdGF0aWMuc3RhcnQoIGRlbHRhVGltZSApOyAgLy8gUmVuZGVyIHRoZSBzdGF0aWMgbGF5ZXJzIG9ubHkgb25jZVxyXG5cdFx0XHJcblx0XHRydW5HYW1lKCBnYW1lUHJvcHMuZ2V0UHJvcCgnZnBzJykgKTtcdC8vIEdPIEdPIEdPXHJcblx0XHJcbn0iLCIvLyBHYW1lIFByb3BlcnRpZXMgY2xhc3MgdG8gZGVmaW5lIGNvbmZpZ3VyYXRpb25zXHJcbmNsYXNzIGdhbWVQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MpO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzKTsvLyBDYW52YXMgc2l6ZSBiYXNlZCBvbiBcImNodW5rc1wiIFxyXG4gICAgdGhpcy5jaHVua1NpemUgPSAxMDA7IC8vcHggLSByZXNvbHV0aW9uXHJcbiAgICB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MgPSAxMTtcclxuICAgIHRoaXMuY2FudmFzV2lkdGggPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlbkhvcml6b250YWxDaHVua3MpO1xyXG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSAodGhpcy5jaHVua1NpemUgKiB0aGlzLnNjcmVlblZlcnRpY2FsQ2h1bmtzKTtcclxuXHJcbiAgICB0aGlzLmZwcyA9IDMwO1xyXG4gIH1cclxuXHJcbiAgZ2V0UHJvcChwcm9wKSB7XHJcbiAgICByZXR1cm4gdGhpc1twcm9wXTtcclxuICB9XHJcblxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gZ2FtZVByb3BlcnRpZXNcclxuXHJcbndpbmRvdy5kZWJ1ZyA9IGZhbHNlOyJdfQ==
