(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Player {

	constructor(x0, y0, gameProps) {
    // # Sprite
      //let playerSprite = new Image();
      //playerSprite.src = './assets/sprites/player_one.png';
      this.playerSprite = document.getElementById('sprite_player_one'); // Pegar esse id da instancia!!
      
      // http://getspritexy.com/ <= Para mapear os sprites!
      this.spriteProps = {
        sprite_width: 20, // Player size inside sprite
        sprite_height: 40
      }
      this.step = [];
      this.defaultStep = 1;
      this.initialStep = 2;
      this.stepCount = this.initialStep;
      this.maxSteps = 8;
    
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
      this.stepCount++;
      if( this.stepCount > this.maxSteps ) {
        this.stepCount = this.initialStep;
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
			
      if (37 in keysDown) //left
        player.movLeft();
        
      if (38 in keysDown) //Up  
        player.movUp();
        
      if (39 in keysDown) //right
        player.movRight();

      if (40 in keysDown) // down
        player.movDown();
      
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvYXNzZXRzL3BsYXllci5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL2Fzc2V0cy9leGl0LmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvYXNzZXRzL2Zsb29yLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvYXNzZXRzL3Bvd2VyLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvYXNzZXRzL3dhbGwuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9hc3NldHMvd2F0ZXIuanMiLCJjbGllbnQvYXNzZXRzL3NjZW5hcmlvL1Byb3RvdHlwZS9zY2VuYXJpb1Byb3RvdHlwZS5qcyIsImNsaWVudC9hc3NldHMvc2NlbmFyaW8vUHJvdG90eXBlL3N0YWdlcy9zdGFnZV8xLmpzIiwiY2xpZW50L2Fzc2V0cy9zY2VuYXJpby9jb21tb24vZW5lbV9wcm90b3R5cGUuanMiLCJjbGllbnQvZW5naW5lL2NvbGxpc2lvbi5qcyIsImNsaWVudC9lbmdpbmUvcmVuZGVyLmpzIiwiY2xpZW50L2dhbWUuanMiLCJjbGllbnQvZ2FtZVByb3BlcnRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjbGFzcyBQbGF5ZXIge1xyXG5cclxuXHRjb25zdHJ1Y3Rvcih4MCwgeTAsIGdhbWVQcm9wcykge1xyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgICAgLy9sZXQgcGxheWVyU3ByaXRlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgIC8vcGxheWVyU3ByaXRlLnNyYyA9ICcuL2Fzc2V0cy9zcHJpdGVzL3BsYXllcl9vbmUucG5nJztcclxuICAgICAgdGhpcy5wbGF5ZXJTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3BsYXllcl9vbmUnKTsgLy8gUGVnYXIgZXNzZSBpZCBkYSBpbnN0YW5jaWEhIVxyXG4gICAgICBcclxuICAgICAgLy8gaHR0cDovL2dldHNwcml0ZXh5LmNvbS8gPD0gUGFyYSBtYXBlYXIgb3Mgc3ByaXRlcyFcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHtcclxuICAgICAgICBzcHJpdGVfd2lkdGg6IDIwLCAvLyBQbGF5ZXIgc2l6ZSBpbnNpZGUgc3ByaXRlXHJcbiAgICAgICAgc3ByaXRlX2hlaWdodDogNDBcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN0ZXAgPSBbXTtcclxuICAgICAgdGhpcy5kZWZhdWx0U3RlcCA9IDE7XHJcbiAgICAgIHRoaXMuaW5pdGlhbFN0ZXAgPSAyO1xyXG4gICAgICB0aGlzLnN0ZXBDb3VudCA9IHRoaXMuaW5pdGlhbFN0ZXA7XHJcbiAgICAgIHRoaXMubWF4U3RlcHMgPSA4O1xyXG4gICAgXHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICAgIHRoaXMueCA9IHgwO1xyXG4gICAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAgIHRoaXMueDAgPSB4MDsgLy8gaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgICB0aGlzLnkwID0geTA7XHJcblxyXG4gICAgICB0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuXHJcbiAgICAgIHRoaXMubG9va0RpcmVjdGlvbiA9IHRoaXMubG9va0Rvd24oKTtcclxuXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2h1bmtTaXplOyAvL3B4XHJcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5jaHVua1NpemUgKiAyOyAvL3B4XHJcbiAgICAgIHRoaXMuc3BlZWQwID0gNjtcclxuICAgICAgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gdGhpcy5zcGVlZDA7XHJcblxyXG4gICAgICB0aGlzLmlzQ29sbGlkYWJsZSA9IHRydWU7XHJcbiAgfVxyXG4gICAgICAgIFxyXG4gIC8vICMgU3ByaXRlcyBzdGF0ZSBmb3IgcGxheWVyIGRpcmVjdGlvblxyXG4gICAgXHJcbiAgICBsb29rRG93bigpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdkb3duJztcclxuICAgICAgXHJcbiAgICAgIC8vIFN0ZXBzXHJcbiAgICAgIHRoaXMuc3RlcFsxXSA9IHsgeDogMCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzRdID0geyB4OiA2MCwgeTogMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs3XSA9IHsgeDogMTIwLCB5OiAwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiAwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb29rVXAoKXtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gPSAndXAnO1xyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGVwWzFdID0geyB4OiAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDQwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiA0MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogNDAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDQwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvb2tSaWdodCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdyaWdodCc7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFsyXSA9IHsgeDogMjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFszXSA9IHsgeDogNDAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs1XSA9IHsgeDogODAsIHk6IDgwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs2XSA9IHsgeDogMTAwLCB5OiA4MCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogODAgfTtcclxuICAgICAgdGhpcy5zdGVwWzhdID0geyB4OiAxNDAsIHk6IDgwIH07XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeCA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueDtcclxuICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3kgPSB0aGlzLnN0ZXBbdGhpcy5zdGVwQ291bnRdLnk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcblx0XHRsb29rTGVmdCgpe1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmRpcmVjdGlvbiA9ICdsZWZ0JztcclxuICAgICAgICAgIFxyXG4gICAgICB0aGlzLnN0ZXBbMV0gPSB7IHg6IDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbMl0gPSB7IHg6IDIwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzNdID0geyB4OiA0MCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs0XSA9IHsgeDogNjAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbNV0gPSB7IHg6IDgwLCB5OiAxMjAgfTtcclxuICAgICAgdGhpcy5zdGVwWzZdID0geyB4OiAxMDAsIHk6IDEyMCB9O1xyXG4gICAgICB0aGlzLnN0ZXBbN10gPSB7IHg6IDEyMCwgeTogMTIwIH07XHJcbiAgICAgIHRoaXMuc3RlcFs4XSA9IHsgeDogMTQwLCB5OiAxMjAgfTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF94ID0gdGhpcy5zdGVwW3RoaXMuc3RlcENvdW50XS54O1xyXG4gICAgICB0aGlzLnNwcml0ZVByb3BzLmNsaXBfeSA9IHRoaXMuc3RlcFt0aGlzLnN0ZXBDb3VudF0ueTtcclxuICAgIH1cclxuICAgIFxyXG5cdC8vICMgUGxheWVyIE1vdmVtZW50XHJcblx0XHRcclxuXHRcdG1vdkxlZnQoKSB7IFxyXG4gICAgICB0aGlzLmluY3JlYXNlU3RlcCgpO1xyXG4gICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va0xlZnQoKSApO1xyXG4gICAgICB0aGlzLnNldFgoIHRoaXMuZ2V0WCgpIC0gdGhpcy5nZXRTcGVlZCgpKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlJpZ2h0KCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tSaWdodCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WCggdGhpcy5nZXRYKCkgKyB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdlVwKCkgeyBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tVcCgpICk7XHJcbiAgICAgIHRoaXMuc2V0WSggdGhpcy5nZXRZKCkgLSB0aGlzLmdldFNwZWVkKCkgKTsgXHJcbiAgICB9O1xyXG5cdFx0XHRcclxuXHRcdG1vdkRvd24oKSB7ICBcclxuICAgICAgdGhpcy5pbmNyZWFzZVN0ZXAoKTtcclxuICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tEb3duKCkgKTtcclxuICAgICAgdGhpcy5zZXRZKCB0aGlzLmdldFkoKSArIHRoaXMuZ2V0U3BlZWQoKSApOyBcclxuICAgIH07XHJcblx0XHRcclxuXHQvLyAjIFNldHNcclxuXHRcdFxyXG5cdFx0c2V0WCh4KSB7IHRoaXMueCA9IHg7IH1cclxuXHRcdHNldFkoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0SGVpZ2h0KGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0c2V0V2lkdGgod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFxyXG5cdFx0c2V0U3BlZWQoc3BlZWQpIHsgdGhpcy5zcGVlZCA9IHRoaXMuY2h1bmtTaXplIC8gc3BlZWQ7IH1cclxuXHJcblx0XHRzZXRMb29rRGlyZWN0aW9uKGxvb2tEaXJlY3Rpb24pIHsgdGhpcy5sb29rRGlyZWN0aW9uID0gbG9va0RpcmVjdGlvbjsgfVxyXG5cdFx0c2V0TG9va0RpcmVjdGlvblZhbChzdHJpbmcpIHsgdGhpcy5sb29rRGlyZWN0aW9uVmFyID0gc3RyaW5nOyB9XHJcblxyXG5cdFx0cmVzZXRQb3NpdGlvbigpIHtcclxuXHRcdFx0dGhpcy5zZXRYKCB0aGlzLngwICk7XHJcblx0XHQgIHRoaXMuc2V0WSggdGhpcy55MCApO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0Ly8gIyBHZXRzXHJcblx0XHRcdFxyXG5cdCAgZ2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0Z2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHQgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuICAgICAgXHJcbiAgICAvL1RoZSBjb2xsaXNpb24gd2lsbCBiZSBqdXN0IGhhbGYgb2YgdGhlIHBsYXllciBoZWlnaHRcclxuICAgIGdldENvbGxpc2lvbkhlaWdodCgpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0IC8gMjsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLnkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblxyXG4gICAgZ2V0Q2VudGVyWCgpIHsgcmV0dXJuIHRoaXMuZ2V0Q29sbGlzaW9uWCgpICsgdGhpcy5nZXRDb2xsaXNpb25XaWR0aCgpOyB9XHJcbiAgICBnZXRDZW50ZXJZKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25ZKCkgKyB0aGlzLmdldENvbGxpc2lvbkhlaWdodCgpOyB9XHJcblx0XHRcdFxyXG5cdFx0Z2V0Q29sb3IoKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblx0XHRnZXRTcGVlZCgpIHsgcmV0dXJuIHRoaXMuc3BlZWQ7IH1cclxuICAgICAgXHJcbiAgICBnZXRTcHJpdGVQcm9wcygpIHsgcmV0dXJuIHRoaXMuc3ByaXRlUHJvcHM7IH1cclxuICAgICAgXHJcbiAgICBpbmNyZWFzZVN0ZXAoKSB7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50Kys7XHJcbiAgICAgIGlmKCB0aGlzLnN0ZXBDb3VudCA+IHRoaXMubWF4U3RlcHMgKSB7XHJcbiAgICAgICAgdGhpcy5zdGVwQ291bnQgPSB0aGlzLmluaXRpYWxTdGVwO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXNldFN0ZXAoKSB7XHJcbiAgICAgIHRoaXMuc3RlcENvdW50ID0gdGhpcy5kZWZhdWx0U3RlcDtcclxuICAgICAgc3dpdGNoICggdGhpcy5zcHJpdGVQcm9wcy5kaXJlY3Rpb24gKSB7XHJcbiAgICAgICAgY2FzZSAnbGVmdCc6IFxyXG4gICAgICAgICAgdGhpcy5zZXRMb29rRGlyZWN0aW9uKCB0aGlzLmxvb2tMZWZ0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3JpZ2h0JzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1JpZ2h0KCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3VwJzogXHJcbiAgICAgICAgICB0aGlzLnNldExvb2tEaXJlY3Rpb24oIHRoaXMubG9va1VwKCkgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Rvd24nOiBcclxuICAgICAgICAgIHRoaXMuc2V0TG9va0RpcmVjdGlvbiggdGhpcy5sb29rRG93bigpICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdFx0XHJcblx0Ly8gIyBQbGF5ZXIgUmVuZGVyXHJcblx0XHRcdFx0XHJcblx0ICByZW5kZXIoY3R4KSB7XHJcbiAgICAgICAgXHJcbiAgICAgIC8vIFdoYXQgdG8gZG8gZXZlcnkgZnJhbWUgaW4gdGVybXMgb2YgcmVuZGVyPyBEcmF3IHRoZSBwbGF5ZXJcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIFxyXG4gICAgICAvKnBsYXllclNwcml0ZS5vbmxvYWQgPSBmdW5jdGlvbigpIHsgLy8gb25sb2FkIG7Do28gcXVlciBjYXJyZWdhciBubyBwbGF5ZXIuLnBxID8/XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShwbGF5ZXJTcHJpdGUsIHByb3BzLngsIHByb3BzLnksIHByb3BzLncsIHByb3BzLmgpO1x0XHJcbiAgICAgIH1cdCovXHJcbiAgICAgIC8vZHJhd0ltYWdlKGltZyxzeCxzeSxzd2lkdGgsc2hlaWdodCx4LHksd2lkdGgsaGVpZ2h0KTtcclxuICAgICAgLy8gIyBodHRwczovL3d3dy53M3NjaG9vbHMuY29tL3RhZ3MvY2FudmFzX2RyYXdpbWFnZS5hc3BcclxuICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICBjdHguZHJhd0ltYWdlKFxyXG4gICAgICAgIHRoaXMucGxheWVyU3ByaXRlLCAgXHJcbiAgICAgICAgdGhpcy5zcHJpdGVQcm9wcy5jbGlwX3gsIHRoaXMuc3ByaXRlUHJvcHMuY2xpcF95LCBcclxuICAgICAgICB0aGlzLnNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgdGhpcy5zcHJpdGVQcm9wcy5zcHJpdGVfaGVpZ2h0LCBcclxuICAgICAgICBwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oXHJcbiAgICAgICk7XHRcclxuICAgICAgLy8gREVCVUcgQ09MTElTSU9OXHJcbiAgICAgIGlmKCB3aW5kb3cuZGVidWcgKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMTAwLCAwLjUpXCI7XHJcbiAgICAgICAgY3R4LmZpbGxSZWN0KCB0aGlzLnByb3BzLngsIHRoaXMuZ2V0Q29sbGlzaW9uWSgpLCB0aGlzLnByb3BzLncsIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgKTtcclxuICAgICAgfVxyXG5cdFx0fTtcclxuICBcclxuICAvLyAjIENvbGxpc2lvblxyXG4gIFxyXG5cdFx0bm9Db2xsaXNpb24oKSB7XHJcblx0XHRcdC8vIFdoYXQgaGFwcGVucyBpZiB0aGUgcGxheWVyIGlzIG5vdCBjb2xsaWRpbmc/XHJcblx0XHRcdHRoaXMuc2V0U3BlZWQodGhpcy5zcGVlZDApOyAvLyBSZXNldCBzcGVlZFxyXG4gICAgfVxyXG4gICAgICBcclxuICAgIGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgIHJldHVybiB0aGlzLmlzQ29sbGlkYWJsZTtcclxuICAgIH07XHJcblx0XHRcclxufS8vY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyO1xyXG4iLCIvLyBPYnN0YWNsZSBjbGFzc1xyXG5cclxuXHRmdW5jdGlvbiBFeGl0KGN0eCwgbmFtZSwgeDAsIHkwLCB3LCBoKSB7XHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIEluaXQgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHQvLyAjIFBvc2l0aW9uXHJcblx0XHRcdFx0dGhpcy54ID0geDA7XHJcblx0XHRcdFx0dGhpcy55ID0geTA7XHJcblx0XHRcdFx0XHJcblx0XHRcdC8vICMgUHJvcGVydGllc1xyXG5cdFx0XHRcdHRoaXMud2lkdGggPSB3OyAvL3B4XHJcblx0XHRcdFx0dGhpcy5oZWlnaHQgPSBoO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiMzRjVcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIC0gLSAtIFNldHMgLSAtIC1cclxuXHRcdFxyXG5cdFx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdFx0dGhpcy5zZXRZID0gIGZ1bmN0aW9uICh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdFx0dGhpcy5zZXRXaWR0aCA9ICBmdW5jdGlvbiAod2lkdGgpIHsgdGhpcy53aWR0aCA9IHdpZHRoOyB9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdFx0dGhpcy5zZXROYW1lID0gIGZ1bmN0aW9uIChuYW1lKSB7IHRoaXMubmFtZSA9IG5hbWU7IH1cclxuXHRcclxuXHRcdFx0Ly8gLSAtIC0gR2V0cyAtIC0gLVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ2V0WCA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdFx0XHR0aGlzLmdldFkgPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0dGhpcy5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG5cdFx0XHRcdHRoaXMuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ2V0Q29sb3IgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuXHJcblx0XHRcdFx0dGhpcy5leGl0ID0gMDtcclxuXHJcblx0XHRcdC8vIFRleHR1cmVcclxuXHRcdFx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHRcclxuXHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIFJlbmRlciAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY29udGV4dG8pIHsgXHJcblx0XHRcdFx0Y29udGV4dG8uZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHRcdFx0XHRjb250ZXh0by5maWxsUmVjdCggdGhpcy5nZXRYKCksIHRoaXMuZ2V0WSgpLCB0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCkgKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY29sbGlzaW9uID0gZnVuY3Rpb24ob2JqZXRvKSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0c3dpdGNoICh0aGlzLmV4aXQpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Y2FzZSAwOlxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXRYKDUyMCk7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0WSg1NDApO1x0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5leGl0ID0gMTtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0WCgyMjUpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnNldFkoMzcwKTtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5leGl0ID0gMjtcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHQgICAgY2FzZSAyOlxyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXRYKDcyNSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0WSgzMTApO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnNldFdpZHRoKDQwKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5zZXRIZWlnaHQoNDApO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0dGhpcy5leGl0ID0gMztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMuc2V0Q29sb3IoJyMwMEYnKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRjYXNlIDM6XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0b2JqZXRvLnNldENvbG9yKFwiIzMzM1wiKTtcclxuXHRcdFx0XHRcdFx0b2JqZXRvLnJlc2V0UG9zaXRpb24oKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGFsZXJ0KCdXaW4hJyk7XHJcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQobG9jYXRpb24ucmVsb2FkKCksIDIwMDApO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9jbGFzcyIsImNsYXNzIEZsb29yIHtcclxuXHJcbiAgY29uc3RydWN0b3IodHlwZSwgeDAsIHkwLCBjaHVua1NpemUpIHtcclxuICAgIFxyXG4gICAgLy8gIyBQb3NpdGlvblxyXG4gICAgdGhpcy54ID0geDA7XHJcbiAgICB0aGlzLnkgPSB5MDtcclxuICAgICAgXHJcbiAgICAvLyAjIFByb3BlcnRpZXNcclxuICAgIHRoaXMud2lkdGggPSBjaHVua1NpemU7IC8vcHhcclxuICAgIHRoaXMuaGVpZ2h0ID0gY2h1bmtTaXplO1xyXG4gICAgICBcclxuICAgIHRoaXMuaXNDb2xsaWRhYmxlID0gZmFsc2U7XHJcblxyXG4gICAgLy8gIyBTcHJpdGVcclxuICAgIHRoaXMuc3RhZ2VTcHJpdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3ByaXRlX3Byb3RvdHlwZScpOyAvLyBURU1QT1JBUllcclxuICAgICAgXHJcbiAgICB0aGlzLnNwcml0ZVdpZHRoID0gMTU7XHJcbiAgICB0aGlzLnNwcml0ZUhlaWdodCA9IDE1O1xyXG4gICAgdGhpcy5zcHJpdGVQcm9wcyA9IG5ldyBBcnJheSgpO1xyXG5cclxuICAgIHRoaXMucnVuKHR5cGUpO1xyXG4gIH1cclxuXHJcblx0Ly8gIyBTZXRzXHJcblx0XHRcclxuICAgIHNldFgoeCkgeyB0aGlzLnggPSB4OyB9XHJcbiAgICBzZXRZKHkpIHsgdGhpcy55ID0geTsgfVxyXG4gICAgXHJcbiAgICBzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgIFxyXG4gICAgc2V0U3ByaXRlVHlwZSh0eXBlKSB7XHJcbiAgICAgIHN3aXRjaCh0eXBlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgY2FzZSBcIjAxXCI6XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgICAgY2xpcF94OiAyMTQsIGNsaXBfeTogOSwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBcclxuICAgICAgICBjYXNlIFwiMDJcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDIxNCwgY2xpcF95OiA5NCwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHRcdFx0XHJcblx0Ly8gIyBHZXRzXHJcblx0XHRcdFxyXG5cdFx0Z2V0WCgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0Z2V0WSgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHRcdGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG5cdFx0Z2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHJcblx0XHRnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLnk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCk7IH1cclxuICAgIGdldENlbnRlclkoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCk7IH1cclxuXHRcdFxyXG5cdC8vICMgUmVuZGVyXHJcblx0XHRcclxuXHRcdHJlbmRlcihjdHgpIHtcclxuICAgICAgICBcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIGxldCBzcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlUHJvcHM7XHJcbiAgICAgICAgXHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnN0YWdlU3ByaXRlLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgICAgIFxyXG4gICAgICAvL0RFQlVHIENodW5rIFNpemVcclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMjU1LDAsMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdChwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oKTtcclxuXHJcbiAgICAgICAgY3R4LnJlY3QocHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaCk7XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cdFx0XHRcclxuXHRcdGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIHJ1bih0eXBlKSB7XHJcbiAgICAgIHRoaXMuc2V0U3ByaXRlVHlwZSh0eXBlKTtcclxuICAgIH1cclxuICAgICBcclxuICB9Ly9jbGFzc1xyXG4gIFxyXG4gIG1vZHVsZS5leHBvcnRzID0gRmxvb3I7IiwiLy8gT2JzdGFjbGUgY2xhc3NcclxuXHJcblx0ZnVuY3Rpb24gUG93ZXIoY3R4LCBuYW1lLCB4MCwgeTAsIHcsIGgpIHtcclxuXHRcdFxyXG5cdFx0Ly8gLSAtIC0gU2V0cyAtIC0gLVxyXG5cdFxyXG5cdFx0XHR0aGlzLnNldFggPSAgZnVuY3Rpb24gKHgpIHsgdGhpcy54ID0geDsgfVxyXG5cdFx0XHR0aGlzLnNldFkgPSAgZnVuY3Rpb24gKHkpIHsgdGhpcy55ID0geTsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRIZWlnaHQgPSAgZnVuY3Rpb24gKGhlaWdodCkgeyB0aGlzLmhlaWdodCA9IGhlaWdodDsgfVxyXG5cdFx0XHR0aGlzLnNldFdpZHRoID0gIGZ1bmN0aW9uICh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc2V0Q29sb3IgPSAgZnVuY3Rpb24gKGNvbG9yKSB7IHRoaXMuY29sb3IgPSBjb2xvcjsgfVxyXG5cdFx0XHR0aGlzLnNldE5hbWUgPSAgZnVuY3Rpb24gKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxyXG5cclxuXHRcdC8vIC0gLSAtIEdldHMgLSAtIC1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0WCA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLng7IH1cclxuXHRcdFx0dGhpcy5nZXRZID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueTsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRXaWR0aCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG5cdFx0XHR0aGlzLmdldEhlaWdodCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0Q29sb3IgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuY29sb3I7IH1cclxuXHJcblx0XHQvLyAtIC0gLSBJbml0IC0gLSAtXHJcblx0XHRcclxuXHRcdFx0Ly8gIyBQb3NpdGlvblxyXG5cdFx0XHRcdHRoaXMueCA9IHgwO1xyXG5cdFx0XHRcdHRoaXMueSA9IHkwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHQvLyAjIFByb3BlcnRpZXNcclxuXHRcdFx0XHR0aGlzLndpZHRoID0gdzsgLy9weFxyXG5cdFx0XHRcdHRoaXMuaGVpZ2h0ID0gaDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmNvbG9yID0gXCIjM0Y1XCI7IFxyXG5cdFx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblxyXG5cdFx0XHQvLyAjIFRleHR1cmVcclxuXHRcdFx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuZ3JhZCA9IHRoaXMuY3R4LmNyZWF0ZVJhZGlhbEdyYWRpZW50KCB0aGlzLmdldFgoKSwgdGhpcy5nZXRZKCksIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKSwgMCwgMTAwICk7XHJcblx0XHRcdFx0dGhpcy5ncmFkLmFkZENvbG9yU3RvcCgwLCAnI0I0NkIyQycpOyAgIFxyXG5cdFx0XHRcdHRoaXMuZ3JhZC5hZGRDb2xvclN0b3AoMSwgJyNDQ0NBNEYnKTtcclxuXHRcdFx0XHJcblx0XHRcclxuXHRcclxuXHRcdFxyXG5cdFx0Ly8gLSAtIC0gUmVuZGVyIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjb250ZXh0KSB7ICBcclxuXHRcdFx0XHRjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ3JhZDtcclxuXHRcdFx0XHRjb250ZXh0LmZpbGxSZWN0KCB0aGlzLmdldFgoKSwgdGhpcy5nZXRZKCksIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKSApO1xyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jb2xsaXNpb24gPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdFx0XHRvYmplY3Quc2V0U3BlZWQoMC4yKTtcclxuXHRcdFx0XHRvYmplY3Quc2V0Q29sb3IoXCIjRDYxNDJGXCIpO1xyXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fTtcclxuXHJcblx0fS8vb2JzdGFjdWxvIiwiY2xhc3MgV2FsbCB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHR5cGUsIHgwLCB5MCwgY2h1bmtTaXplKSB7XHJcbiAgICAvLyAjIFBvc2l0aW9uXHJcbiAgICB0aGlzLnggPSB4MDtcclxuICAgIHRoaXMueSA9IHkwO1xyXG4gICAgICBcclxuICAgIC8vICMgUHJvcGVydGllc1xyXG4gICAgdGhpcy53aWR0aCA9IGNodW5rU2l6ZTsgLy9weFxyXG4gICAgdGhpcy5oZWlnaHQgPSBjaHVua1NpemU7XHJcblxyXG4gICAgdGhpcy5pc0NvbGxpZGFibGUgPSB0cnVlO1xyXG4gICAgICBcclxuICAgIC8vICMgU3ByaXRlXHJcbiAgICB0aGlzLnN0YWdlU3ByaXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nwcml0ZV9wcm90b3R5cGUnKTsgLy8gVEVNUE9SQVJZXHJcbiAgICBcclxuICAgIHRoaXMuc3ByaXRlV2lkdGggPSAxNjtcclxuICAgIHRoaXMuc3ByaXRlSGVpZ2h0ID0gMTY7XHJcbiAgICB0aGlzLnNwcml0ZVByb3BzID0gbmV3IEFycmF5KCk7XHJcblxyXG4gICAgdGhpcy5ydW4oIHR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8vICMgU2V0c1xyXG4gICAgXHJcbiAgICBzZXRYKHgpIHsgdGhpcy54ID0geDsgfVxyXG5cdFx0c2V0WSh5KSB7IHRoaXMueSA9IHk7IH1cclxuXHRcdFx0XHJcblx0XHRzZXRIZWlnaHQoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcbiAgICBzZXRXaWR0aCh3aWR0aCkgeyB0aGlzLndpZHRoID0gd2lkdGg7IH1cclxuICAgICAgXHJcbiAgICBzZXRTcHJpdGVUeXBlKHR5cGUpIHtcclxuICAgICAgICBcclxuICAgICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgICBcclxuICAgICAgICBjYXNlIFwidG9wXCI6XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTk3LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgY2FzZSBcImxlZnRcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDQwOSwgY2xpcF95OiAyMTQsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwicmlnaHRcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDM5MiwgY2xpcF95OiAyMTQsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwiYm90dG9tXCI6XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgICAgY2xpcF94OiAzNzUsIGNsaXBfeTogMTgwLCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgY2FzZSBcImNvcm5lcl90b3BfbGVmdFwiOlxyXG4gICAgICAgICAgdGhpcy5zcHJpdGVQcm9wcyA9IHsgXHJcbiAgICAgICAgICAgIGNsaXBfeDogNDYwLCBjbGlwX3k6IDEwLCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgY2FzZSBcImNvcm5lcl90b3BfcmlnaHRcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDQ3NywgY2xpcF95OiAxMCwgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX2xlZnRcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDQ2MCwgY2xpcF95OiAyNywgXHJcbiAgICAgICAgICAgIHNwcml0ZV93aWR0aDogdGhpcy5zcHJpdGVXaWR0aCwgc3ByaXRlX2hlaWdodDogdGhpcy5zcHJpdGVIZWlnaHQgXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIFxyXG4gICAgICAgIGNhc2UgXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCI6XHJcbiAgICAgICAgICB0aGlzLnNwcml0ZVByb3BzID0geyBcclxuICAgICAgICAgICAgY2xpcF94OiA1NDUsIGNsaXBfeTogMjcsIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwid2F0ZXJcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDM3NSwgY2xpcF95OiAyOTksIFxyXG4gICAgICAgICAgICBzcHJpdGVfd2lkdGg6IHRoaXMuc3ByaXRlV2lkdGgsIHNwcml0ZV9oZWlnaHQ6IHRoaXMuc3ByaXRlSGVpZ2h0IFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBcclxuICAgICAgICBjYXNlIFwib2JzdGFjbGVcIjpcclxuICAgICAgICAgIHRoaXMuc3ByaXRlUHJvcHMgPSB7IFxyXG4gICAgICAgICAgICBjbGlwX3g6IDQwLCBjbGlwX3k6IDc1LCBcclxuICAgICAgICAgICAgc3ByaXRlX3dpZHRoOiB0aGlzLnNwcml0ZVdpZHRoLCBzcHJpdGVfaGVpZ2h0OiB0aGlzLnNwcml0ZUhlaWdodCBcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cdFx0XHRcclxuXHQvLyAjIEdldHNcclxuXHRcdFx0XHJcbiAgICBnZXRYKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcbiAgICBnZXRZKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcbiAgICBcclxuICAgIGdldFdpZHRoKCkgeyByZXR1cm4gdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0SGVpZ2h0KCkgeyByZXR1cm4gdGhpcy5oZWlnaHQ7IH1cclxuXHJcbiAgICBnZXRDb2xsaXNpb25IZWlnaHQoKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uV2lkdGgoKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXRDb2xsaXNpb25YKCkgeyAgcmV0dXJuIHRoaXMueDsgfVxyXG4gICAgZ2V0Q29sbGlzaW9uWSgpIHsgIHJldHVybiB0aGlzLnk7IH1cclxuXHJcbiAgICBnZXRDZW50ZXJYKCkgeyByZXR1cm4gdGhpcy5nZXRDb2xsaXNpb25YKCkgKyB0aGlzLmdldENvbGxpc2lvbldpZHRoKCk7IH1cclxuICAgIGdldENlbnRlclkoKSB7IHJldHVybiB0aGlzLmdldENvbGxpc2lvblkoKSArIHRoaXMuZ2V0Q29sbGlzaW9uSGVpZ2h0KCk7IH1cclxuXHRcdFxyXG5cdC8vICMgUmVuZGVyXHJcblx0XHRcclxuXHQgIHJlbmRlcihjdHgpIHtcclxuICAgICAgICBcclxuICAgICAgbGV0IHByb3BzID0ge1xyXG4gICAgICAgIHg6IHRoaXMuZ2V0WCgpLFxyXG4gICAgICAgIHk6IHRoaXMuZ2V0WSgpLFxyXG4gICAgICAgIHc6IHRoaXMuZ2V0V2lkdGgoKSxcclxuICAgICAgICBoOiB0aGlzLmdldEhlaWdodCgpXHJcbiAgICAgIH0gXHJcbiAgICAgIGxldCBzcHJpdGVQcm9wcyA9IHRoaXMuc3ByaXRlUHJvcHM7XHJcbiAgICAgICAgXHJcbiAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgY3R4LmRyYXdJbWFnZShcclxuICAgICAgICB0aGlzLnN0YWdlU3ByaXRlLCAgXHJcbiAgICAgICAgc3ByaXRlUHJvcHMuY2xpcF94LCBzcHJpdGVQcm9wcy5jbGlwX3ksIFxyXG4gICAgICAgIHNwcml0ZVByb3BzLnNwcml0ZV93aWR0aCwgc3ByaXRlUHJvcHMuc3ByaXRlX2hlaWdodCwgXHJcbiAgICAgICAgcHJvcHMueCwgcHJvcHMueSwgcHJvcHMudywgcHJvcHMuaFxyXG4gICAgICApO1xyXG4gICAgICAgIFxyXG4gICAgICAvL0RFQlVHIENodW5rIFNpemVcclxuICAgICAgaWYoIHdpbmRvdy5kZWJ1ZyApIHtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDAsMC40KVwiO1xyXG4gICAgICAgIGN0eC5maWxsUmVjdChwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oKTtcclxuICAgICAgICBjdHgucmVjdChwcm9wcy54LCBwcm9wcy55LCBwcm9wcy53LCBwcm9wcy5oKTtcclxuICAgICAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgfVxyXG5cdFx0XHRcclxuXHRcdGNvbGxpc2lvbihvYmplY3QpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDb2xsaWRhYmxlO1xyXG4gICAgfVxyXG4gICAgICBcclxuICAgIHJ1biggdHlwZSApIHtcclxuICAgICAgdGhpcy5zZXRTcHJpdGVUeXBlKHR5cGUpO1xyXG4gICAgfVxyXG5cclxuICB9Ly9jbGFzc1xyXG4gIFxyXG4gIG1vZHVsZS5leHBvcnRzID0gV2FsbDsiLCIvLyBPYnN0YWNsZSBjbGFzc1xyXG5cclxuXHRmdW5jdGlvbiBXYXRlcihjdHgsIG5hbWUsIHgwLCB5MCwgdywgaCkge1xyXG5cdFx0XHJcblx0XHQvLyAtIC0gLSBJbml0IC0gLSAtXHJcblx0XHRcclxuXHRcdFx0Ly8gIyBQb3NpdGlvblxyXG5cdFx0XHRcdHRoaXMueCA9IHgwO1xyXG5cdFx0XHRcdHRoaXMueSA9IHkwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHQvLyAjIFByb3BlcnRpZXNcclxuXHRcdFx0XHR0aGlzLndpZHRoID0gdzsgLy9weFxyXG5cdFx0XHRcdHRoaXMuaGVpZ2h0ID0gaDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmNvbG9yID0gXCIjM0Y1XCI7IFxyXG5cdFx0XHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblxyXG5cdFx0XHQvLyAjIFRleHR1cmVcclxuXHRcdFx0XHR0aGlzLmN0eCA9IGN0eDtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmltZ1dhdGVyID0gbmV3IEltYWdlKCk7XHJcblx0XHRcdFx0dGhpcy5pbWdXYXRlci5zcmMgPSAnLi9hc3NldHMvc2NlbmFyaW8vd2VsY29tZS9pbWcvd2F0ZXIuanBnJztcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLndhdGVyID0gdGhpcy5jdHguY3JlYXRlUGF0dGVybih0aGlzLmltZ1dhdGVyLCAncmVwZWF0Jyk7XHJcblx0XHRcdFx0dGhpcy53YXRlciA9IFwiYmx1ZVwiO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gLSAtIC0gU2V0cyAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdHRoaXMuc2V0WSA9ICBmdW5jdGlvbiAoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdHRoaXMuc2V0V2lkdGggPSAgZnVuY3Rpb24gKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdHRoaXMuc2V0TmFtZSA9ICBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblxyXG5cdFx0Ly8gLSAtIC0gR2V0cyAtIC0gLVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRYID0gIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMueDsgfVxyXG5cdFx0XHR0aGlzLmdldFkgPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy55OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFdpZHRoID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLndpZHRoOyB9XHJcblx0XHRcdHRoaXMuZ2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmhlaWdodDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5nZXRDb2xvciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5jb2xvcjsgfVxyXG5cdFx0XHJcblx0XHRcclxuXHRcdC8vIC0gLSAtIFJlbmRlciAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMucmVuZGVyID0gZnVuY3Rpb24oY29udGV4dG8pIHsgXHJcblx0XHRcdFx0Y29udGV4dG8uZmlsbFN0eWxlID0gdGhpcy53YXRlcjtcclxuXHRcdFx0XHRjb250ZXh0by5maWxsUmVjdCggdGhpcy5nZXRYKCksIHRoaXMuZ2V0WSgpLCB0aGlzLmdldFdpZHRoKCksIHRoaXMuZ2V0SGVpZ2h0KCkgKTtcclxuXHRcdFx0fTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuY29sbGlzaW9uID0gZnVuY3Rpb24ob2JqZWN0KSB7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Ly8gSWYgY29sbGlkZXMsIHdoYXQgd2lsbCBoYXBwZW4/IFxyXG5cdFx0XHRcdG9iamVjdC5zZXRTcGVlZCgwLjA1KTtcclxuXHRcdFx0XHRvYmplY3Quc2V0Q29sb3IoXCIjODZDMEY4XCIpO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdC8vIElmIHRoZSBpdGVtIHdpbGwgdHJpZ2dlciBhIGNvbGxpc2lvbiBhY3Rpb24uIFdhbGxzIHdpbGwgbWFrZSB0aGUgcGxheWVyIHN0b3AsIGJ1dCB3YXRlciB3aWxsIG9ubHkgbWFrZSB0aGUgcGxheWVyIHNsb3dcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7IFxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9jbGFzcyIsIi8qXHJcblx0UHJvdG90eXBlIFNjZW5hcmlvXHJcbiovXHJcbmNvbnN0IFByb3RvdHlwZV9TdGFnZV8xID0gcmVxdWlyZSgnLi9zdGFnZXMvc3RhZ2VfMScpO1xyXG5cclxuY2xhc3Mgc2NlbmFyaW9Qcm90b3R5cGUge1xyXG5cclxuXHRjb25zdHJ1Y3RvcihjdHgsIGNhbnZhcywgZ2FtZVByb3BzKXtcclxuXHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cdFx0dGhpcy5jYW52YXMgPSBjYW52YXM7XHJcblx0XHRcclxuXHRcdHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHRoaXMucmVuZGVySXRlbXNBbmltYXRlZCA9IG5ldyBBcnJheSgpO1xyXG5cclxuXHRcdHRoaXMuY29sbGlzaW9uSXRlbXMgPSBuZXcgQXJyYXkoKTsvLyBJcyBpdCBpbiB1c2U/Pz9cclxuXHRcdFxyXG5cdFx0dGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuXHJcblx0XHR0aGlzLmNodW5rU2l6ZSA9IGdhbWVQcm9wcy5nZXRQcm9wKCdjaHVua1NpemUnKTtcclxuXHJcblx0XHR0aGlzLnBsYXllclN0YXJ0WCA9IDA7XHJcblx0XHR0aGlzLnBsYXllclN0YXJ0WSA9IDA7XHJcblxyXG5cdFx0dGhpcy5ydW4oKTtcclxuXHR9XHJcblxyXG5cdC8vICMgTWFpbiBSZW5kZXJcclxuXHRyZW5kZXIoKXtcclxuXHRcdC8vIC4uLiBcclxuXHR9XHRcclxuXHRcdFx0XHJcblx0Ly8gIyBBZGQgSXRlbXMgdG8gdGhlIFJlbmRlclxyXG5cdGFkZFJlbmRlckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cdGFkZFJlbmRlckl0ZW1BbmltYXRlZChpdGVtKXtcclxuXHRcdHRoaXMucmVuZGVySXRlbXNBbmltYXRlZC5wdXNoKGl0ZW0pO1xyXG5cdH1cclxuXHJcblx0Ly8gIyBHZXRzXHJcblx0Z2V0Q3R4KCkgeyByZXR1cm4gdGhpcy5jdHg7IH1cclxuXHRnZXRDYW52YXMoKSB7IHJldHVybiB0aGlzLmNhbnZhczsgfVx0XHJcblx0XHRcdFx0XHJcblx0Z2V0UmVuZGVySXRlbXMoKSB7IHJldHVybiB0aGlzLnJlbmRlckl0ZW1zOyB9XHJcblx0Z2V0UmVuZGVySXRlbXNBbmltYXRlZCgpIHsgcmV0dXJuIHRoaXMucmVuZGVySXRlbXNBbmltYXRlZDsgfVxyXG5cdFx0XHRcdFxyXG5cdGdldFBsYXllclN0YXJ0WCgpIHsgcmV0dXJuIHRoaXMuY2h1bmtTaXplICogNDsgfSAvLyBJc3NvIHRlbSBxdWUgdmlyIGRvIGNlbsOhcmlvISEhXHJcblx0Z2V0UGxheWVyU3RhcnRZKCkgeyByZXR1cm4gdGhpcy5jaHVua1NpemUgKiA0OyB9XHJcbiAgICAgIFxyXG5cdC8vICMgU3RhZ2VzXHJcblx0c2V0U3RhZ2Uoc3RhZ2VfbnVtYmVyKSB7XHJcblxyXG5cdFx0bGV0IHN0YWdlXzAxID0gbmV3IFByb3RvdHlwZV9TdGFnZV8xKCB0aGlzLmNodW5rU2l6ZSApO1xyXG4gICAgICAgICAgXHJcblx0XHRzd2l0Y2goc3RhZ2VfbnVtYmVyKSB7XHJcblx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHR0aGlzLnN0YWdlID0gc3RhZ2VfMDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHR0aGlzLmxvYWRTdGFnZSgpO1xyXG5cdH1cclxuXHRcclxuXHQvLyBGdW5jdGlvbnMgdG8gbG9hZCBzZWxlY3RlZCBzdGFnZVxyXG5cdGxvYWRTdGFnZSgpIHtcclxuICAgICAgICAgICAgXHJcblx0XHQvLyBDbGVhciBwcmV2aW91cyByZW5kZXIgaXRlbXNcclxuXHRcdHRoaXMucmVuZGVySXRlbXMgPSBuZXcgQXJyYXkoKTtcclxuXHRcdHRoaXMucmVuZGVySXRlbXNBbmltYXRlZCA9IG5ldyBBcnJheSgpO1xyXG5cclxuXHRcdC8vIEFkZCB0aGUgU3RhdGljIEl0ZW1zXHJcblx0XHR0aGlzLnN0YWdlLmdldFN0YXRpY0l0ZW1zKCkubWFwKCAoaXRlbSkgPT4geyBcclxuXHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKGl0ZW0pO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gQWRkIHRoZSBBbmltYXRlZCBJdGVtc1xyXG5cdFx0dGhpcy5zdGFnZS5nZXRBbmltYXRlZEl0ZW1zKCkubWFwKCAoaXRlbSkgPT4geyBcclxuXHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtQW5pbWF0ZWQoaXRlbSk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdH1cclxuXHJcblx0Ly8gIyBSdW4gd2hlbiBjbGFzcyBsb2Fkc1xyXG5cdHJ1bigpIHtcclxuXHRcdFxyXG5cdFx0Ly8gU2V0IERlZmF1bHQgU3RhZ2VcclxuXHRcdHRoaXMuc2V0U3RhZ2UoMSk7IFxyXG5cdFx0XHRcdFxyXG5cdH1cclxuXHJcbn0vL2NsYXNzXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNjZW5hcmlvUHJvdG90eXBlOyIsIi8vIFN0YWdlIDAxXHJcblxyXG5jb25zdCBXYWxsID0gcmVxdWlyZSgnLi4vYXNzZXRzL3dhbGwnKTtcclxuY29uc3QgRmxvb3IgPSByZXF1aXJlKCcuLi9hc3NldHMvZmxvb3InKTtcclxuXHJcbmNsYXNzIFByb3RvdHlwZV9TdGFnZV8xIHtcclxuXHJcbiAgY29uc3RydWN0b3IoY2h1bmtTaXplKSB7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7XHJcbiAgICB0aGlzLnJlbmRlckl0ZW1zQW5pbWF0ZWQgPSBuZXcgQXJyYXkoKTtcclxuICAgIHRoaXMuY2h1bmtTaXplID0gY2h1bmtTaXplO1xyXG4gICAgdGhpcy5ydW4oKTtcclxuICB9XHJcbiAgXHJcbiAgLy8gIyBHZXRzXHJcbiAgZ2V0U3RhdGljSXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtczsgfVxyXG4gIGdldEFuaW1hdGVkSXRlbXMoKSB7ICByZXR1cm4gdGhpcy5yZW5kZXJJdGVtc0FuaW1hdGVkOyB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBBZGQgSXRlbXMgdG8gdGhlIHJlbmRlclxyXG5cdGFkZFJlbmRlckl0ZW0oaXRlbSl7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zLnB1c2goaXRlbSk7XHJcblx0fVxyXG5cdGFkZFJlbmRlckl0ZW1BbmltYXRlZChpdGVtKXtcclxuXHRcdHRoaXMucmVuZGVySXRlbXNBbmltYXRlZC5wdXNoKGl0ZW0pO1xyXG4gIH1cclxuICAgICAgICBcclxuICAvLyAjIFNjZW5hcmlvIFxyXG4gIGdldFNjZW5hcmlvQXNzZXRJdGVtKGl0ZW0sIHgsIHkpe1xyXG4gICAgc3dpdGNoKGl0ZW0ubmFtZSkge1xyXG4gICAgICBjYXNlIFwid2FsbFwiOlxyXG4gICAgICAgIHJldHVybiBuZXcgV2FsbChpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImZsb29yXCI6XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGbG9vcihpdGVtLnR5cGUsIHgsIHksIHRoaXMuY2h1bmtTaXplKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgICAgICAgXHJcbiAgLy8gIyBTY2VuYXJpbyBEZXNnaW4gKFN0YXRpYylcclxuICAgIHNjZW5hcmlvRGVzaWduKCkge1xyXG5cclxuICAgICAgLy8gV2FsbHNcclxuICAgICAgbGV0IHd0ID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJ0b3BcIn07XHJcbiAgICAgIGxldCB3bCA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwibGVmdFwifTtcclxuICAgICAgbGV0IHdyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJyaWdodFwifTtcclxuICAgICAgbGV0IHdiID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJib3R0b21cIn07XHJcbiAgICAgIFxyXG4gICAgICBsZXQgd2NfdGwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl90b3BfbGVmdFwifTtcclxuICAgICAgbGV0IHdjX3RyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfdG9wX3JpZ2h0XCJ9O1xyXG4gICAgICBsZXQgd2NfYmwgPSB7IG5hbWU6IFwid2FsbFwiLCB0eXBlOiBcImNvcm5lcl9ib3R0b21fbGVmdFwifTtcclxuICAgICAgbGV0IHdjX2JyID0geyBuYW1lOiBcIndhbGxcIiwgdHlwZTogXCJjb3JuZXJfYm90dG9tX3JpZ2h0XCJ9O1xyXG4gICAgICBcclxuICAgICAgbGV0IHd0ciA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwid2F0ZXJcIn07XHJcbiAgICAgIGxldCBvYiA9IHsgbmFtZTogXCJ3YWxsXCIsIHR5cGU6IFwib2JzdGFjbGVcIn07XHJcbiAgICAgICAgICBcclxuICAgICAgLy8gRmxvb3JcclxuICAgICAgbGV0IGYxID0geyBuYW1lOiBcImZsb29yXCIsIHR5cGU6IFwiMDFcIn07XHJcbiAgICAgIGxldCBmMiA9IHsgbmFtZTogXCJmbG9vclwiLCB0eXBlOiBcIjAyXCJ9O1xyXG4gICAgICAgIFxyXG4gICAgICAvLyBNYWtlIHNodXJlIHRvIGRlc2lnbiBiYXNlYWQgb24gZ2FtZVByb3BlcnRpZXMgIVxyXG4gICAgICBsZXQgc2NlbmFyaW9EZXNpZ24gPSBbXHJcbiAgICAgICAgWyB3dHIsIHd0ciwgICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICB3dHIsICAgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3Y190bCwgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd3QsICAgd2NfdHIsICB3dHIgXSxcclxuICAgICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgb2IsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYyLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBmMSwgICBmMSwgICBmMiwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3bCwgICAgZjEsICAgZjIsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgZjEsICAgd3IsICAgICB3dHIgXSxcclxuICAgICAgICBbIHd0ciwgd2wsICAgIGYxLCAgIGYxLCAgIGYxLCAgIG9iLCAgIGYxLCAgIGYyLCAgIGYxLCAgIHdyLCAgICAgd3RyIF0sXHJcbiAgICAgICAgWyB3dHIsIHdsLCAgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICBmMSwgICB3ciwgICAgIHd0ciBdLFxyXG4gICAgICAgIFsgd3RyLCB3Y19ibCwgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2IsICAgd2NfYnIsICB3dHIgXSxcclxuICAgICAgXTtcclxuXHJcbiAgICAgIC8vICMgUHJvY2Nlc3Mgc2NlbmFyaW8gZGVzaWduXHJcbiAgICAgIHNjZW5hcmlvRGVzaWduLm1hcCggKGFycmF5LCB4KSA9PiB7XHJcbiAgICAgICAgYXJyYXkubWFwKCAoaXRlbSwgeSkgPT4ge1xyXG4gICAgICAgIGxldCB4MCA9IHkgKiB0aGlzLmNodW5rU2l6ZTtcclxuICAgICAgICBsZXQgeTAgPSB4ICogdGhpcy5jaHVua1NpemU7XHJcbiAgICAgICAgdGhpcy5hZGRSZW5kZXJJdGVtKHRoaXMuZ2V0U2NlbmFyaW9Bc3NldEl0ZW0oaXRlbSwgeDAsIHkwKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAvLyAjIFNjZW5hcmlvIEFuaW1hdGVkIGl0ZW1zXHJcbiAgICAvLyBUTyBET1xyXG5cclxuICBydW4gKCkge1xyXG4gICAgdGhpcy5zY2VuYXJpb0Rlc2lnbigpO1xyXG4gIH1cclxuXHJcbn0gLy8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvdG90eXBlX1N0YWdlXzFcclxuXHJcblxyXG5cclxuXHJcbi8qXHJcbiAgICAvLyAjIFRleHR1cmVzXHJcblx0XHJcblx0XHRcdFx0XHR0aGlzLmJnSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuXHRcdFx0XHRcdHRoaXMuYmdJbWFnZS5zcmMgPSAnLi9hc3NldHMvc2NlbmFyaW8vd2VsY29tZS9pbWcvYmFja2dyb3VuZC5qcGcnO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR0aGlzLmJhY2tncm91bmQgPSB0aGlzLmN0eC5jcmVhdGVQYXR0ZXJuKHRoaXMuYmdJbWFnZSwgJ3JlcGVhdCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IFwiIzMzM1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgLy8gIyBPYnN0YWNsZXNcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gU2NlbmFyaW8gQm9yZGVyc1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbFRvcFwiLCAwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmNodW5rU2l6ZSkgKTsgLy9jb250ZXh0LCBuYW1lLCB4MCwgeTAsIHcsIGgsXHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsQm90dG9tXCIsIDAsIHRoaXMuaGVpZ2h0IC0gdGhpcy5jaHVua1NpemUsIHRoaXMud2lkdGgsIHRoaXMuY2h1bmtTaXplKSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbExlZnRcIiwgMCwgMCwgdGhpcy5jaHVua1NpemUsIHRoaXMuaGVpZ2h0KSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbFJpZ2h0XCIsIHRoaXMud2lkdGgtdGhpcy5jaHVua1NpemUsIDAsIHRoaXMuY2h1bmtTaXplLCB0aGlzLmhlaWdodCkgKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHQvLyBXYWxsc1xyXG5cdFx0XHRcdFx0LypcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwMVwiLCAyMCwgNzMsIDQwNSwgNDApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDJcIiwgOTAsIDE5MCwgODAsIDgwKSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDAzXCIsIDUwMywgMTksIDQwLCA0NjUpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDRcIiwgMjgzLCA0ODEsIDQ0MCwgNDApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDVcIiwgMjQ0LCAyOTIsIDQwLCAyMjkpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDZcIiwgMjgzLCAzNjcsIDEzOSwgNDApICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMDdcIiwgNzgsIDQwMywgMTY5LCA0MCkgKTtcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwwOFwiLCA1MzYsIDE4OSwgNzksIDQwKSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDA5XCIsIDY2OSwgNzcsIDQwLCAyODgpICk7XHJcblx0XHRcdFx0XHR0aGlzLmFkZFJlbmRlckl0ZW0oIG5ldyBXYWxsKGN0eCwgXCJ3YWxsMTBcIiwgNjY5LCAzNjUsIDExMiwgNDApICk7XHRcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwxMVwiLCA2MDQsIDc3LCA2NywgNDApICk7XHRcclxuXHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFdhbGwoY3R4LCBcIndhbGwxMVwiLCAzMTgsIDE3MiwgOTMsIDk1KSApO1xyXG5cdFx0XHRcdFx0dGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2FsbChjdHgsIFwid2FsbDExXCIsIDgyLCA1MTAsIDc1LCA3NCkgKTtcdFxyXG5cdFx0XHRcdFx0Ki9cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gU2NlbmFyaW8gcmFuZG9tIG9ic3RhY2xlc1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdC8vUG93ZXJcclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHQvLyBQb3NzaWJsZXMgeCwgeSwgdywgaCBmb3IgUG93ZXJcclxuXHRcdFx0XHRcdFx0XHRcdC8qXHJcblx0XHRcdFx0XHRcdFx0dmFyIGFQb3dlciA9IEFycmF5KCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFQb3dlci5wdXNoKCB7IHg6IDEzNywgeTogMjAsIHc6IDE2NywgaDogNTMgfSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGFQb3dlci5wdXNoKCB7IHg6IDQyMiwgeTogMzY4LCB3OiA4MCwgaDogMzggfSk7IFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRhUG93ZXIucHVzaCggeyB4OiA1NDMsIHk6IDQwNiwgdzogMjM2LCBoOiA3NSB9KTsgXHJcblx0XHRcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHZhciByUG93ZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzKSArIDA7XHRcdFxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHRoaXMuYWRkUmVuZGVySXRlbSggbmV3IFBvd2VyKGN0eCwgXCJwb3dlcjAxXCIsIGFQb3dlcltyUG93ZXJdLngsIGFQb3dlcltyUG93ZXJdLnksIGFQb3dlcltyUG93ZXJdLncsIGFQb3dlcltyUG93ZXJdLmgpICk7XHRcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly8gV2F0ZXJcclxuXHRcdFx0XHRcdC8vdGhpcy5hZGRSZW5kZXJJdGVtKCBuZXcgV2F0ZXIoY3R4LCBcInBvd2VyMDFcIiwgMzAwLCA1MjEsIDE5MCwgNTkpICk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gRXhpdFxyXG5cdFx0XHRcdFx0Ly90aGlzLmFkZFJlbmRlckl0ZW1BbmltYXRlZCggbmV3IEV4aXQoY3R4LCBcImV4aXRcIiwgNTAsIDMwLCAxMCwgMTApICk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdC8vIEVuZW1pZXNcclxuXHRcdFx0XHRcdFx0Ly9jdHgsIGNvbGlzYW8sIG5hbWUsIHgwLCB5MCwgdGlwb01vdiwgbWluWCwgbWF4WCwgbWluWSwgbWF4WSwgc3BlZWQgXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0Ly90aGlzLmFkZFJlbmRlckl0ZW1BbmltYXRlZCggbmV3IEVuZW15KGN0eCwgdGhpcy5wbGF5ZXIsIFwiZW5lbXkwMVwiLCAxNTAsIDM0MCwgJ2hvcicsIDI1LCAyMzAsIDAsIDAsIDAuMDUpICk7IFx0XHRcdFxyXG5cdFx0XHRcclxuXHRcdFx0XHRcclxuXHRcdCAgIFxyXG4qLyIsIi8vIE9ic3RhY2xlIGNsYXNzXHJcblxyXG5cdGZ1bmN0aW9uIEVuZW15KGN0eCwgcGxheWVyLCBuYW1lLCB4MCwgeTAsIG1vdlR5cGUsIG1pblgsIG1heFgsIG1pblksIG1heFksIHNwZWVkICkge1xyXG5cdFx0XHJcblx0XHQvLyAtIC0gLSBJbml0IC0gLSAtXHJcblx0XHRcclxuXHRcdFx0Ly8gIyBQb3NpdGlvblxyXG5cdFx0XHRcdHRoaXMueCA9IHgwO1xyXG5cdFx0XHRcdHRoaXMueSA9IHkwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHQvLyAjIFByb3BlcnRpZXNcclxuXHRcdFx0XHR0aGlzLndpZHRoID0gMTA7IC8vcHhcclxuXHRcdFx0XHR0aGlzLmhlaWdodCA9IDUwO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMuY29sb3IgPSBcIiNGMDBcIjsgXHJcblx0XHRcdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHRcdFx0XHR0aGlzLnNwZWVkID0gc3BlZWQ7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyAjIE1vdmVtZW50XHJcblx0XHRcdFx0dGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcblx0XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92ID0gbW92VHlwZTsgLy9ob3IsIHZlciA8LSBtb3ZlbWVudCB0eXBlcyB0aGF0IHRoZSBlbmVteSBjYW4gZG9cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1pblggPSBtaW5YO1xyXG5cdFx0XHRcdHRoaXMubWluWSA9IG1pblk7XHJcblx0XHRcdFx0dGhpcy5tYXhYID0gbWF4WDtcclxuXHRcdFx0XHR0aGlzLm1heFkgPSBtYXhZO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92WCA9IDE7XHJcblx0XHRcdFx0dGhpcy5tb3ZZID0gMTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLmVuZW15ID0gbmV3IE9iamVjdDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkud2lkdGggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0dGhpcy5lbmVteS5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuXHJcblx0XHRcdC8vICMgVGV4dHVyZVxyXG5cdFx0XHRcdHRoaXMuY3R4ID0gY3R4O1xyXG5cclxuXHRcdFx0XHR0aGlzLm9iakNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oIDAgLCAwLCB0aGlzLnBsYXllciApO1xyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gLSAtIC0gU2V0cyAtIC0gLVxyXG5cdFx0XHJcblx0XHRcdHRoaXMuc2V0WCA9ICBmdW5jdGlvbiAoeCkgeyB0aGlzLnggPSB4OyB9XHJcblx0XHRcdHRoaXMuc2V0WSA9ICBmdW5jdGlvbiAoeSkgeyB0aGlzLnkgPSB5OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnNldEhlaWdodCA9ICBmdW5jdGlvbiAoaGVpZ2h0KSB7IHRoaXMuaGVpZ2h0ID0gaGVpZ2h0OyB9XHJcblx0XHRcdHRoaXMuc2V0V2lkdGggPSAgZnVuY3Rpb24gKHdpZHRoKSB7IHRoaXMud2lkdGggPSB3aWR0aDsgfVxyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zZXRDb2xvciA9ICBmdW5jdGlvbiAoY29sb3IpIHsgdGhpcy5jb2xvciA9IGNvbG9yOyB9XHJcblx0XHRcdHRoaXMuc2V0TmFtZSA9ICBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XHJcblx0XHJcblx0XHQvLyAtIC0gLSBHZXRzIC0gLSAtXHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldFggPSAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy54OyB9XHJcblx0XHRcdHRoaXMuZ2V0WSA9ICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLnk7IH1cclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuZ2V0V2lkdGggPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMud2lkdGg7IH1cclxuXHRcdFx0dGhpcy5nZXRIZWlnaHQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuaGVpZ2h0OyB9XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLmdldENvbG9yID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLmNvbG9yOyB9XHJcblxyXG5cclxuXHRcdC8vIC0gLSAtIE1vdmVtZW50ICAtIC0gLVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHRoaXMubW92SG9yID0gZnVuY3Rpb24gKG1vZCkge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZiAoIHRoaXMubW92WCA9PSAxICkgey8vIGdvIFJpZ2h0XHJcblxyXG5cdFx0XHRcdFx0XHR0aGlzLnggPSB0aGlzLnggKyB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueCA+PSB0aGlzLm1heFggKVxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92WCA9IDA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR0aGlzLnggPSB0aGlzLnggLSB0aGlzLnNwZWVkICogbW9kO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0aWYgKHRoaXMueCA8IHRoaXMubWluWCApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZYID0gMTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0fVx0XHJcblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0aGlzLm1vdlZlciA9IGZ1bmN0aW9uIChtb2QpIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYgKCB0aGlzLm1vdlkgPT0gMSApIHtcclxuXHJcblx0XHRcdFx0XHRcdHRoaXMueSA9IHRoaXMueSArIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy55ID49IHRoaXMubWF4WSApXHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZZID0gMDtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdHRoaXMueSA9IHRoaXMueSAtIHRoaXMuc3BlZWQgKiBtb2Q7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRpZiAodGhpcy55IDwgdGhpcy5taW5ZIClcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm1vdlkgPSAxO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHR9XHRcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblxyXG5cdFx0Ly8gLSAtIC0gUmVuZGVyIC0gLSAtXHJcblx0XHRcclxuXHRcdFx0dGhpcy5yZW5kZXIgPSBmdW5jdGlvbihjb250ZXh0LCBtb2QpIHsgXHJcblxyXG5cdFx0XHRcdFx0c3dpdGNoICh0aGlzLm1vdikge1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0Y2FzZSBcImhvclwiOlxyXG5cdFx0XHRcdFx0XHRcdHRoaXMubW92SG9yKG1vZCk7XHJcblx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRjYXNlIFwidmVyXCI6XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5tb3ZWZXIobW9kKTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHQvLyBDaGVjayBpZiBjb2xsaWRlcyB3aXRoIHBsYXllclxyXG5cclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkueCA9IHRoaXMueDtcclxuXHRcdFx0XHRcdHRoaXMuZW5lbXkueSA9IHRoaXMueTtcclxuXHJcblx0XHRcdFx0XHRpZiAoIHRoaXMub2JqQ29sbGlzaW9uLmNoZWNrUGxheWVyQ29sbGlzaW9uKHRoaXMuZW5lbXkpID09IHRydWUgKSBcclxuXHRcdFx0XHRcdFx0dGhpcy5jb2xsaXNpb24odGhpcy5wbGF5ZXIpO1xyXG5cdFx0XHRcdFx0XHJcblxyXG5cdFx0XHRcdGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcclxuXHRcdFx0XHRjb250ZXh0LmZpbGxSZWN0KCB0aGlzLmdldFgoKSwgdGhpcy5nZXRZKCksIHRoaXMuZ2V0V2lkdGgoKSwgdGhpcy5nZXRIZWlnaHQoKSApO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5jb2xsaXNpb24gPSBmdW5jdGlvbihvYmplY3QpIHtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRvYmplY3Quc2V0Q29sb3IoXCIjMzMzXCIpO1xyXG5cdFx0XHRcdG9iamVjdC5yZXNldFBvc2l0aW9uKCk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9O1xyXG5cclxuXHR9Ly9jbGFzcyIsIi8vIENsYXNzIHRoYXQgZGV0ZWN0cyBjb2xsaXNpb24gYmV0d2VlbiBwbGF5ZXIgYW5kIG90aGVyIG9iamVjdHNcclxuY2xhc3MgQ29sbGlzaW9uIHtcclxuXHJcblx0Y29uc3RydWN0b3Ioc2NlbmFyaW9XaWR0aCwgc2NlbmFyaW9IZWlnaHQsIHBsYXllcikge1xyXG5cdFx0dGhpcy5jb2xJdGVucyA9IG5ldyBBcnJheSgpOyAvLyBJdGVtcyB0byBjaGVjayBmb3IgY29sbGlzaW9uXHJcbiAgICB0aGlzLnNjZW5hcmlvV2lkdGggPSBzY2VuYXJpb1dpZHRoO1xyXG4gICAgdGhpcy5zY2VuYXJpb0hlaWdodCA9IHNjZW5hcmlvSGVpZ2h0O1xyXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcbiAgfVxyXG5cdFx0XHRcclxuICAvLyAjIENoZWNrIGlmIHRoZSBvYmplY3QgY29sbGlkZXMgd2l0aCBhbnkgb2JqZWN0IGluIHZlY3RvclxyXG4gIC8vIEFsZ29yaXRobSByZWZlcmVuY2U6IEd1c3Rhdm8gU2lsdmVpcmEgLSBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PXM3cWlXTEJCcEp3XHJcbiAgY2hlY2sob2JqZWN0KSB7XHJcbiAgICBmb3IgKGxldCBpIGluIHRoaXMuY29sSXRlbnMpIHtcclxuICAgICAgbGV0IHIxID0gb2JqZWN0O1xyXG4gICAgICBsZXQgcjIgPSB0aGlzLmNvbEl0ZW5zW2ldO1xyXG4gICAgICB0aGlzLmNoZWNrQ29sbGlzaW9uKHIxLCByMik7XHJcbiAgICB9IFxyXG4gIH1cclxuXHJcbiAgY2hlY2tDb2xsaXNpb24ocjEsIHIyKSB7XHJcbiAgICAgICAgXHJcbiAgICAvL3IxIC0+IHRoZSBtb3Zpbmcgb2JqZWN0XHJcbiAgICAvL3IyIC0+IHRoZSBcIndhbGxcIlxyXG5cclxuICAgIC8vIE9ubHkgY2hlY2tzIFwiY29sbGlkYWJsZVwiIG9iamVjdHNcclxuICAgICAgaWYoICEgcjIuY29sbGlzaW9uKCkgKSByZXR1cm4gZmFsc2U7XHJcbiBcclxuICAgIC8vIHN0b3JlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgb2JqZWN0cyAobXVzdCBiZSByZWN0YW5nbGUpXHJcbiAgICAgIHZhciBjYXRYID0gcjEuZ2V0Q2VudGVyWCgpIC0gcjIuZ2V0Q2VudGVyWCgpO1xyXG4gICAgICB2YXIgY2F0WSA9IHIxLmdldENlbnRlclkoKSAtIHIyLmdldENlbnRlclkoKTtcclxuXHJcbiAgICAgIHZhciBzdW1IYWxmV2lkdGggPSAoIHIxLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICkgKyAoIHIyLmdldENvbGxpc2lvbldpZHRoKCkgLyAyICk7XHJcbiAgICAgIHZhciBzdW1IYWxmSGVpZ2h0ID0gKCByMS5nZXRDb2xsaXNpb25IZWlnaHQoKSAvIDIgKSArICggcjIuZ2V0Q29sbGlzaW9uSGVpZ2h0KCkgLyAyICkgO1xyXG4gICAgICAgIFxyXG4gICAgICBpZihNYXRoLmFicyhjYXRYKSA8IHN1bUhhbGZXaWR0aCAmJiBNYXRoLmFicyhjYXRZKSA8IHN1bUhhbGZIZWlnaHQpe1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBvdmVybGFwWCA9IHN1bUhhbGZXaWR0aCAtIE1hdGguYWJzKGNhdFgpO1xyXG4gICAgICAgIHZhciBvdmVybGFwWSA9IHN1bUhhbGZIZWlnaHQgLSBNYXRoLmFicyhjYXRZKTtcclxuICAgICAgICBcclxuICAgICAgICBpZihvdmVybGFwWCA+PSBvdmVybGFwWSl7IC8vIERpcmVjdGlvbiBvZiBjb2xsaXNpb24gLSBVcC9Eb3duXHJcbiAgICAgICAgICBpZihjYXRZID4gMCl7IC8vIFVwXHJcbiAgICAgICAgICAgIHIxLnNldFkoIHIxLmdldFkoKSArIG92ZXJsYXBZICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByMS5zZXRZKCByMS5nZXRZKCkgLSBvdmVybGFwWSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7Ly8gRGlyZWN0aW9uIG9mIGNvbGxpc2lvbiAtIExlZnQvUmlnaHRcclxuICAgICAgICAgIGlmKGNhdFggPiAwKXsgLy8gTGVmdFxyXG4gICAgICAgICAgICByMS5zZXRYKCByMS5nZXRYKCkgKyBvdmVybGFwWCApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcjEuc2V0WCggcjEuZ2V0WCgpIC0gb3ZlcmxhcFggKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHIxLm5vQ29sbGlzaW9uKCk7IC8vIFdoYXQgaGFwcGVucyBpZiBpdCdzIG5vdCBjb2xsaW5nP1xyXG4gICAgICB9XHJcbiAgfVxyXG5cdFx0XHRcclxuXHQvLyBBZGQgaXRlbXMgdG8gY2hlY2sgZm9yIGNvbGxpc2lvblxyXG5cdGFkZEl0ZW0ob2JqZWN0KSB7XHJcblx0XHR0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0KTtcclxuICB9O1xyXG4gIFxyXG4gIGFkZEFycmF5SXRlbShvYmplY3Qpe1xyXG5cdFx0Zm9yIChsZXQgaSBpbiBvYmplY3Qpe1xyXG4gICAgICB0aGlzLmNvbEl0ZW5zLnB1c2gob2JqZWN0W2ldKTtcclxuICAgIH1cclxuXHR9XHJcblxyXG59Ly8gY2xhc3NcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sbGlzaW9uO1xyXG5cdCIsImNsYXNzIFJlbmRlciB7XHJcblxyXG5cdGNvbnN0cnVjdG9yKGN0eCwgY2FudmFzLCBkaWZpY3VsZGFkZSwgcGxheWVyKSB7XHJcblx0XHR0aGlzLmN0eCA9IGN0eDsgXHJcblx0XHR0aGlzLnNjZW5hcmlvID0gXCJcIjtcclxuXHRcdHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG5cdFx0dGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcblx0XHR0aGlzLnJlbmRlckl0ZW1zID0gbmV3IEFycmF5KCk7IFxyXG5cdH1cclxuXHRcdCAgICBcclxuXHQvLyBBZGQgaXRlbXMgdG8gdGhlIHZlY3RvclxyXG5cdGFkZEl0ZW0ob2JqZWN0KXtcclxuXHRcdHRoaXMucmVuZGVySXRlbXMucHVzaChvYmplY3QpO1xyXG5cdH1cclxuXHRhZGRBcnJheUl0ZW0ob2JqZWN0KXtcclxuXHRcdGZvciAobGV0IGkgaW4gb2JqZWN0KXtcclxuXHRcdFx0dGhpcy5yZW5kZXJJdGVtcy5wdXNoKG9iamVjdFtpXSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdHNldFNjZW5hcmlvKHNjZW5hcmlvKXtcclxuXHRcdHRoaXMuc2NlbmFyaW8gPSBzY2VuYXJpbztcclxuXHR9XHJcblx0XHRcdFxyXG5cdC8vIFRoaXMgZnVuY3Rpb25zIHdpbGwgYmUgY2FsbGVkIGNvbnN0YW50bHkgdG8gcmVuZGVyIGl0ZW1zXHJcblx0c3RhcnQobW9kKSB7XHRcdFxyXG5cdFx0XHRcdFxyXG5cdFx0Ly8gQ2xlYXIgY2FudmFzIGJlZm9yZSByZW5kZXIgYWdhaW5cclxuXHRcdHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcclxuXHRcdHRoaXMuY3R4LnNoYWRvd0JsdXIgPSAwO1xyXG5cclxuXHRcdC8vIFNjZW5hcmlvXHJcblx0XHRpZiAoIHRoaXMuc2NlbmFyaW8gIT0gXCJcIikgXHJcblx0XHRcdHRoaXMuc2NlbmFyaW8ucmVuZGVyKHRoaXMuY3R4KTtcclxuXHRcdFx0XHRcclxuXHRcdC8vIFJlbmRlciBpdGVtc1xyXG5cdFx0Zm9yIChsZXQgaSBpbiB0aGlzLnJlbmRlckl0ZW1zKSB7XHJcblx0XHRcdC8vIEV4ZWN1dGUgdGhlIHJlbmRlciBmdW5jdGlvbiAtIEluY2x1ZGUgdGhpcyBmdW5jdGlvbiBvbiBldmVyeSBjbGFzcyFcclxuXHRcdFx0dGhpcy5yZW5kZXJJdGVtc1tpXS5yZW5kZXIodGhpcy5jdHgsIG1vZCk7XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHRcclxufS8vY2xhc3NcclxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXIiLCJjb25zdCBnYW1lUHJvcGVydGllcyA9IHJlcXVpcmUoJy4vZ2FtZVByb3BlcnRpZXMnKTtcclxuY29uc3Qgc2NlbmFyaW9Qcm90b3R5cGUgPSByZXF1aXJlKCcuL2Fzc2V0cy9zY2VuYXJpby9Qcm90b3R5cGUvc2NlbmFyaW9Qcm90b3R5cGUnKTtcclxuY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi9hc3NldHMvcGxheWVyJyk7XHJcbmNvbnN0IENvbGxpc2lvbiA9IHJlcXVpcmUoJy4vZW5naW5lL2NvbGxpc2lvbicpO1xyXG5jb25zdCBSZW5kZXIgPSByZXF1aXJlKCcuL2VuZ2luZS9yZW5kZXInKTtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHRcclxuXHQvLyAjIEluaXRcclxuXHRcdFxyXG5cdFx0dmFyIGZwc0ludGVydmFsLCBub3csIGRlbHRhVGltZSwgZWxhcHNlZDtcclxuICAgIHZhciBnYW1lUHJvcHMgPSBuZXcgZ2FtZVByb3BlcnRpZXMoKTtcclxuICAgIFxyXG5cdFx0dmFyIGNhbnZhc1N0YXRpYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXNfc3RhdGljJyk7XHJcblx0XHR2YXIgY29udGV4dFN0YXRpYyA9IGNhbnZhc1N0YXRpYy5nZXRDb250ZXh0KCcyZCcpO1xyXG5cdFx0XHJcblx0XHR2YXIgY2FudmFzQW5pbWF0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzX2FuaW1hdGVkJyk7XHJcblx0XHR2YXIgY29udGV4dEFuaW1hdGVkID0gY2FudmFzQW5pbWF0ZWQuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgIFxyXG5cdFx0Y2FudmFzQW5pbWF0ZWQud2lkdGggPSBjYW52YXNTdGF0aWMud2lkdGggPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzV2lkdGgnKTtcclxuXHRcdGNhbnZhc0FuaW1hdGVkLmhlaWdodCA9IGNhbnZhc1N0YXRpYy5oZWlnaHQgPSBnYW1lUHJvcHMuZ2V0UHJvcCgnY2FudmFzSGVpZ2h0Jyk7XHJcblxyXG5cdC8vICMgU2NlbmFyaW9cclxuXHRcdFxyXG5cdFx0dmFyIHNjZW5hcmlvID0gbmV3IHNjZW5hcmlvUHJvdG90eXBlKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYywgZ2FtZVByb3BzICk7XHJcblxyXG5cdC8vICMgUGxheWVyc1xyXG5cclxuXHRcdHZhciBwbGF5ZXIgPSBuZXcgUGxheWVyKCBzY2VuYXJpby5nZXRQbGF5ZXJTdGFydFgoKSwgc2NlbmFyaW8uZ2V0UGxheWVyU3RhcnRZKCksIGdhbWVQcm9wcywgY29udGV4dEFuaW1hdGVkICk7IC8vcG9zacOnw6NvIHggZSB5XHJcblxyXG5cdC8vICMgQ29sbGlzaW9uIGRldGVjdGlvbiBjbGFzc1xyXG5cdFxyXG5cdFx0dmFyIGNvbGxpc2lvbiA9IG5ldyBDb2xsaXNpb24oY2FudmFzQW5pbWF0ZWQud2lkdGgsIGNhbnZhc0FuaW1hdGVkLmhlaWdodCApO1xyXG5cdFx0XHJcblx0XHQvLyBBZGQgdGhlIG9iamVjdHMgdG8gdGhlIGNvbGxpc2lvbiB2ZWN0b3JcclxuXHRcdGNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHNjZW5hcmlvLmdldFJlbmRlckl0ZW1zKCkgKTtcclxuXHRcdGNvbGxpc2lvbi5hZGRBcnJheUl0ZW0oIHNjZW5hcmlvLmdldFJlbmRlckl0ZW1zQW5pbWF0ZWQoKSApO1xyXG5cclxuXHRcdFxyXG5cdC8vICMgUmVuZGVyXHJcblx0XHRcclxuXHRcdHZhciByZW5kZXJTdGF0aWMgPSBuZXcgUmVuZGVyKGNvbnRleHRTdGF0aWMsIGNhbnZhc1N0YXRpYyk7IC8vIFJlbmRlciBleGVjdXRlZCBvbmx5IG9uY2VcclxuXHRcdHZhciByZW5kZXJBbmltYXRlZCA9IG5ldyBSZW5kZXIoY29udGV4dEFuaW1hdGVkLCBjYW52YXNBbmltYXRlZCk7IC8vUmVuZGVyIHdpdGggYW5pbWF0ZWQgb2JqZWN0cyBvbmx5XHJcblx0XHRcdFxyXG5cdFx0Ly8gQWRkIGl0ZW1zIHRvIGJlIHJlbmRlcmVkXHJcblx0XHRcclxuXHRcdHJlbmRlclN0YXRpYy5zZXRTY2VuYXJpbyhzY2VuYXJpbyk7IC8vIHNldCB0aGUgc2NlbmFyaW9cclxuXHRcdHJlbmRlclN0YXRpYy5hZGRBcnJheUl0ZW0oc2NlbmFyaW8uZ2V0UmVuZGVySXRlbXMoKSk7IC8vIEdldCBhbGwgaXRlbXMgZnJvbSB0aGUgc2NlbmFyaW8gdGhhdCBuZWVkcyB0byBiZSByZW5kZXJlZFxyXG5cdFx0XHJcblx0XHRyZW5kZXJBbmltYXRlZC5hZGRBcnJheUl0ZW0oIHNjZW5hcmlvLmdldFJlbmRlckl0ZW1zQW5pbWF0ZWQoKSApOyAvLyBHZXQgYWxsIGFuaW1hdGVkIGl0ZW1zIGZyb20gdGhlIHNjZW5hcmlvIHRoYXQgbmVlZHMgdG8gYmUgcmVuZGVyZWRcclxuXHRcdHJlbmRlckFuaW1hdGVkLmFkZEl0ZW0oIHBsYXllciApOyAvLyBBZGRzIHRoZSBwbGF5ZXIgdG8gdGhlIGFuaW1hdGlvbiByZW5kZXJcclxuXHJcblxyXG5cdC8vICMgS2V5Ym9hcmQgRXZlbnRzXHJcblx0XHJcblx0XHR2YXIga2V5c0Rvd24gPSB7fTtcclxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0ICBrZXlzRG93bltlLmtleUNvZGVdID0gdHJ1ZTtcclxuXHRcdH0pO1xyXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG5cdFx0XHRkZWxldGUga2V5c0Rvd25bZS5rZXlDb2RlXTtcclxuXHRcdFx0cGxheWVyLnJlc2V0U3RlcCgpO1xyXG5cdFx0fSk7XHJcblxyXG5cclxuXHQvLyAjIFRoZSBHYW1lIExvb3BcclxuXHRcdFx0XHJcblx0XHRmdW5jdGlvbiB1cGRhdGVHYW1lKG1vZCkge1xyXG5cclxuXHRcdFx0Ly8gIyBNb3ZlbWVudHMgXHJcblx0XHRcdFxyXG4gICAgICBpZiAoMzcgaW4ga2V5c0Rvd24pIC8vbGVmdFxyXG4gICAgICAgIHBsYXllci5tb3ZMZWZ0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgIGlmICgzOCBpbiBrZXlzRG93bikgLy9VcCAgXHJcbiAgICAgICAgcGxheWVyLm1vdlVwKCk7XHJcbiAgICAgICAgXHJcbiAgICAgIGlmICgzOSBpbiBrZXlzRG93bikgLy9yaWdodFxyXG4gICAgICAgIHBsYXllci5tb3ZSaWdodCgpO1xyXG5cclxuICAgICAgaWYgKDQwIGluIGtleXNEb3duKSAvLyBkb3duXHJcbiAgICAgICAgcGxheWVyLm1vdkRvd24oKTtcclxuICAgICAgXHJcbiAgICAgIC8vICMgQ2hlY2sgaWYgcGxheWVyIGlzIGNvbGxpZGluZ1xyXG4gICAgICBcclxuICAgICAgY29sbGlzaW9uLmNoZWNrKHBsYXllcik7XHJcblx0XHQgICAgXHJcblx0XHR9O1xyXG5cclxuXHJcblx0Ly8gIyBcIlRocmVhZFwiIHRoYSBydW5zIHRoZSBnYW1lXHJcblx0XHRmdW5jdGlvbiBydW5HYW1lKGZwcykge1xyXG5cdFx0XHRmcHNJbnRlcnZhbCA9IDEwMDAgLyBmcHM7XHJcblx0XHRcdGRlbHRhVGltZSA9IERhdGUubm93KCk7XHJcblx0XHRcdHN0YXJ0VGltZSA9IGRlbHRhVGltZTtcclxuXHRcdFx0Z2FtZUxvb3AoKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0ZnVuY3Rpb24gZ2FtZUxvb3AoKSB7XHJcblxyXG5cdFx0XHQvLyBSdW5zIG9ubHkgd2hlbiB0aGUgYnJvd3NlciBpcyBpbiBmb2N1c1xyXG5cdFx0XHQvLyBSZXF1ZXN0IGFub3RoZXIgZnJhbWVcclxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuXHJcblx0XHRcdC8vIGNhbGMgZWxhcHNlZCB0aW1lIHNpbmNlIGxhc3QgbG9vcFxyXG5cdFx0XHRub3cgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHRlbGFwc2VkID0gbm93IC0gZGVsdGFUaW1lO1xyXG5cdFxyXG5cdFx0XHQvLyBpZiBlbm91Z2ggdGltZSBoYXMgZWxhcHNlZCwgZHJhdyB0aGUgbmV4dCBmcmFtZVxyXG5cdFx0XHRpZiAoZWxhcHNlZCA+IGZwc0ludGVydmFsKSB7XHJcblx0XHJcblx0XHRcdFx0Ly8gR2V0IHJlYWR5IGZvciBuZXh0IGZyYW1lIGJ5IHNldHRpbmcgdGhlbj1ub3csIGJ1dCBhbHNvIGFkanVzdCBmb3IgeW91clxyXG5cdFx0XHRcdC8vIHNwZWNpZmllZCBmcHNJbnRlcnZhbCBub3QgYmVpbmcgYSBtdWx0aXBsZSBvZiBSQUYncyBpbnRlcnZhbCAoMTYuN21zKVxyXG5cdFx0XHRcdGRlbHRhVGltZSA9IG5vdyAtIChlbGFwc2VkICUgZnBzSW50ZXJ2YWwpO1xyXG5cdFxyXG5cdFx0XHRcdHVwZGF0ZUdhbWUoIGRlbHRhVGltZSApO1xyXG5cdFx0ICAgIFxyXG5cdFx0XHRcdHJlbmRlckFuaW1hdGVkLnN0YXJ0KCBkZWx0YVRpbWUgKTsgXHJcblx0XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHR9O1xyXG5cdFxyXG5cdC8vICMgU3RhcnRzIHRoZSBnYW1lXHJcblx0XHRcclxuXHRcdHJlbmRlclN0YXRpYy5zdGFydCggZGVsdGFUaW1lICk7ICAvLyBSZW5kZXIgdGhlIHN0YXRpYyBsYXllcnMgb25seSBvbmNlXHJcblx0XHRcclxuXHRcdHJ1bkdhbWUoIGdhbWVQcm9wcy5nZXRQcm9wKCdmcHMnKSApO1x0Ly8gR08gR08gR09cclxuXHRcclxufSIsIi8vIEdhbWUgUHJvcGVydGllcyBjbGFzcyB0byBkZWZpbmUgY29uZmlndXJhdGlvbnNcclxuY2xhc3MgZ2FtZVByb3BlcnRpZXMge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IDEwMDsgLy9weCAtIHJlc29sdXRpb25cclxuICAgIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyA9IDExO1xyXG4gICAgdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyA9IDExO1xyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyk7XHJcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MpOy8vIENhbnZhcyBzaXplIGJhc2VkIG9uIFwiY2h1bmtzXCIgXHJcbiAgICB0aGlzLmNodW5rU2l6ZSA9IDEwMDsgLy9weCAtIHJlc29sdXRpb25cclxuICAgIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyA9IDExO1xyXG4gICAgdGhpcy5zY3JlZW5WZXJ0aWNhbENodW5rcyA9IDExO1xyXG4gICAgdGhpcy5jYW52YXNXaWR0aCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuSG9yaXpvbnRhbENodW5rcyk7XHJcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9ICh0aGlzLmNodW5rU2l6ZSAqIHRoaXMuc2NyZWVuVmVydGljYWxDaHVua3MpO1xyXG5cclxuICAgIHRoaXMuZnBzID0gMzA7XHJcbiAgfVxyXG5cclxuICBnZXRQcm9wKHByb3ApIHtcclxuICAgIHJldHVybiB0aGlzW3Byb3BdO1xyXG4gIH1cclxuXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSBnYW1lUHJvcGVydGllc1xyXG5cclxud2luZG93LmRlYnVnID0gZmFsc2U7Il19
