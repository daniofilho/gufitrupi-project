(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Player

	function Player(x0, y0, gameProps) {
		
		// - - - Init - - -
			
    // # Sprite
				//let playerSprite = new Image();
        //playerSprite.src = './assets/sprites/player_one.png';
        let playerSprite = document.getElementById('sprite_player_one'); // Pegar esse id da instancia!!
        
        // http://getspritexy.com/ <= Para mapear os sprites!
        let spriteProps = {
          sprite_width: 20, // Player size inside sprite
          sprite_height: 40
        }
        let step = [];
        let defaultStep = 1;
        let initialStep = 2;
        let stepCount = initialStep;
        let maxSteps = 8;
        
        // Sprites state for player direction
				this.lookDown = function(){
          spriteProps.direction = 'down';
          
          // Steps
          step[1] = { x: 0, y: 0 };
          step[2] = { x: 20, y: 0 };
          step[3] = { x: 40, y: 0 };
          step[4] = { x: 60, y: 0 };
          step[5] = { x: 80, y: 0 };
          step[6] = { x: 100, y: 0 };
          step[7] = { x: 120, y: 0 };
          step[8] = { x: 140, y: 0 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;

				}
				this.lookUp = function(){
          spriteProps.direction = 'up';
          
          // Steps
          step[1] = { x: 0, y: 40 };
          step[2] = { x: 0, y: 40 };
          step[3] = { x: 40, y: 40 };
          step[4] = { x: 60, y: 40 };
          step[5] = { x: 80, y: 40 };
          step[6] = { x: 100, y: 40 };
          step[7] = { x: 120, y: 40 };
          step[8] = { x: 140, y: 40 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;
				}
				this.lookRight = function(){
          spriteProps.direction = 'right';
          
          // Steps
          step[1] = { x: 0, y: 80 };
          step[2] = { x: 20, y: 80 };
          step[3] = { x: 40, y: 80 };
          step[4] = { x: 60, y: 80 };
          step[5] = { x: 80, y: 80 };
          step[6] = { x: 100, y: 80 };
          step[7] = { x: 120, y: 80 };
          step[8] = { x: 140, y: 80 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;
				}
				this.lookLeft = function(){
          spriteProps.direction = 'left';
          
          // Step 1
          step[1] = { x: 0, y: 120 };
          step[2] = { x: 20, y: 120 };
          step[3] = { x: 40, y: 120 };
          step[4] = { x: 60, y: 120 };
          step[5] = { x: 80, y: 120 };
          step[6] = { x: 100, y: 120 };
          step[7] = { x: 120, y: 120 };
          step[8] = { x: 140, y: 120 };
          
          spriteProps.clip_x = step[stepCount].x;
          spriteProps.clip_y = step[stepCount].y;
				}

			
		
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
			
		// - - - Player Movement - - -
		
			this.movLeft = function() { 
        this.increaseStep();
				this.setLookDirection( this.lookLeft() );
				this.setX( this.getX() - this.getSpeed()); 
			};
			
			this.movRight = function() { 
        this.increaseStep();
				this.setLookDirection( this.lookRight() );
				this.setX( this.getX() + this.getSpeed() ); 
			};
			
			this.movUp = function() { 
        this.increaseStep();
				this.setLookDirection( this.lookUp() );
				this.setY( this.getY() - this.getSpeed() ); 
			};
			
			this.movDown = function() {  
        this.increaseStep();
				this.setLookDirection( this.lookDown() );
				this.setY( this.getY() + this.getSpeed() ); 
			};
		
		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight = function (height) { this.height = height; }
			this.setWidth = function (width) { this.width = width; }
			
			this.setSpeed = function (speed) { this.speed = this.chunkSize / speed; }

			this.setLookDirection = function(lookDirection) { this.lookDirection = lookDirection; }
			this.setLookDirectionVal = function(string) { this.lookDirectionVar = string; }

			
			// Reset player position - !!! Provavelmente não usarei dessa forma mais, a posição inicial vai depender do cenário
			
				this.resetPosition = function() {
					this.setX( this.x0 );
					this.setY( this.y0 );
				}
		
		// - - - Gets - - -
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
      this.getHeight = function() { return this.height; }
      
      //The collision will be just half of the player height
      this.getCollisionHeight = function() { return this.height / 2; }
      this.getCollisionWidth = function() { return this.width; }
      this.getCollisionX = function() {  return this.x; }
      this.getCollisionY = function() {  return this.y + this.getCollisionHeight(); }

      this.getCenterX = function() { return this.getCollisionX() + this.getCollisionWidth(); }
      this.getCenterY = function() { return this.getCollisionY() + this.getCollisionHeight(); }
			
			this.getColor = function() { return this.color; }
			this.getSpeed = function() { return this.speed; }
      
      this.getSpriteProps = function() { return spriteProps; }
      
      this.increaseStep = function() {
        stepCount++;
        if( stepCount > maxSteps ) {
          stepCount = initialStep;
        }
      }
      this.resetStep = function() {
        stepCount = defaultStep;
        switch ( spriteProps.direction ) {
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
		
			
		// - - - Player Render - - - 
				
			this.render = function(ctx) {
        
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
          playerSprite,  
          spriteProps.clip_x, spriteProps.clip_y, 
          spriteProps.sprite_width, spriteProps.sprite_height, 
          props.x, props.y, props.w, props.h
        );	
        // DEBUG COLLISION
        if( window.debug ) {
          ctx.fillStyle = "rgba(0,0,100, 0.5)";
          ctx.fillRect( props.x, this.getCollisionY(), props.w, this.getCollisionHeight() );
        }
			};
			
			this.noCollision = function() {
				// What happens if the player is not colliding?
				this.setSpeed(this.speed0); // Reset speed
      }
      
      this.collision = function(object) {
        return this.isCollidable;
      };
		
	}//class
	

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
// Obstacle class

function Floor(type, x0, y0, chunkSize) {
    
    //console.log(x0, y0);
    
		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = chunkSize; //px
				this.height = chunkSize;
        
        this.isCollidable = false;

			// # Sprite
        let stageSprite = document.getElementById('sprite_prototype'); // TEMPORARY
        
        this.spriteWidth = 15;
        this.spriteHeight = 15;
        this.spriteProps = new Array();


		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight =  function (height) { this.height = height; }
      this.setWidth =  function (width) { this.width = width; }
      
      this.setSpriteType = function(type) {
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
			
		// - - - Gets - - -
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
			this.getHeight = function() { return this.height; }

			this.getCollisionHeight = function() { return this.height; }
      this.getCollisionWidth = function() { return this.width; }
      this.getCollisionX = function() {  return this.x; }
      this.getCollisionY = function() {  return this.y; }

      this.getCenterX = function() { return this.getCollisionX() + this.getCollisionWidth(); }
      this.getCenterY = function() { return this.getCollisionY() + this.getCollisionHeight(); }
		
		// - - - Render - - -
		
			this.render = function(ctx) {
        
        let props = {
					x: this.getX(),
					y: this.getY(),
					w: this.getWidth(),
					h: this.getHeight()
        } 
        let spriteProps = this.spriteProps;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          stageSprite,  
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

			};
			
			this.collision = function(object) {
        return this.isCollidable; // Don't collide
      };
      
    // - - - Sprite Type - - -
      this.setSpriteType(type);

	}//obstaculo
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
// Obstacle class

	function Wall(type, x0, y0, chunkSize) {
    
    // - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = chunkSize; //px
        this.height = chunkSize;

        this.isCollidable = true;
        
			// # Sprite
        let stageSprite = document.getElementById('sprite_prototype'); // TEMPORARY
        
        this.spriteWidth = 16;
        this.spriteHeight = 16;
        this.spriteProps = new Array();


		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight =  function (height) { this.height = height; }
      this.setWidth =  function (width) { this.width = width; }
      
      this.setSpriteType = function(type) {
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
			
		// - - - Gets - - -
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
			this.getHeight = function() { return this.height; }

			this.getCollisionHeight = function() { return this.height; }
      this.getCollisionWidth = function() { return this.width; }
      this.getCollisionX = function() {  return this.x; }
      this.getCollisionY = function() {  return this.y; }

      this.getCenterX = function() { return this.getCollisionX() + this.getCollisionWidth(); }
      this.getCenterY = function() { return this.getCollisionY() + this.getCollisionHeight(); }
		
		// - - - Render - - -
		
			this.render = function(ctx) {
        
        let props = {
					x: this.getX(),
					y: this.getY(),
					w: this.getWidth(),
					h: this.getHeight()
        } 
        let spriteProps = this.spriteProps;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          stageSprite,  
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
			};
			
			this.collision = function(object) {
        return this.isCollidable;
      };
      
    // - - - Sprite Type - - -
      this.setSpriteType(type);

	}//obstaculo
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
// Scenario Class

	//Name: Welcome
	
		function scenario_Prototype(ctx, canvas, gameProps){

      // - - - Init - - - //
			
				this.ctx = ctx;
				this.canvas = canvas;
        
        this.renderItems = new Array();
        this.renderItemsAnimated = new Array();

        this.collisionItems = new Array();// Is it in use???
        
        this.width = canvas.width;
        this.height = canvas.height;

        this.chunkSize = gameProps.getProp('chunkSize');

			// # Background Render
				
				this.backgroundRender = function () {
					this.ctx.rect(0, 0, this.width, this.height);
					this.ctx.fillStyle = this.background;
					this.ctx.fill();	
				}
				
			// # Main Render
				
				this.render = function(){
					//this.backgroundRender();
				}	
			
			// # Add the Items on Render

				this.addRenderItem = function(item){
          this.renderItems.push(item);
				}
				
				this.addRenderItemAnimated = function(item){
					this.renderItemsAnimated.push(item);
				}

			// # Gets
			
				this.getCtx = function() { return this.ctx; }
				this.getCanvas = function() { return this.canvas; }	
				
				this.getRenderItems = function() { return this.renderItems; }
				this.getRenderItemsAnimated = function() { return this.renderItemsAnimated; }
				
				this.getPlayerStartX = function() {
					return this.width / 2;
				}
				this.getPlayerStartY = function() {
					return this.height / 2;
        }
      
      // # Stages
				let stage_1 = new Prototype_Stage_1( this.chunkSize );

				this.stage  = stage_1; // Load default stage

				this.setStage = function(stage_number) {
          
          switch(stage_number) {
						case 1:
              this.stage = stage_1;
							break;
					}
          this.loadStage();
        }
          
          // Functions to load selected stage
					this.loadStage = function() {
            
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
			
			// # Start
        this.setStage(1); // Set Default Stage

		}//class
		
		
		
},{}],8:[function(require,module,exports){
// Stage 01

    function Prototype_Stage_1(chunkSize) {
      
      // # Init
        this.renderItems = new Array();
        this.renderItemsAnimated = new Array();

      // # Gets
        this.getStaticItems = function() {  return this.renderItems; }
        this.getAnimatedItems = function() {  return this.renderItemsAnimated; }
        
      // # Add the Items on Render
				this.addRenderItem = function(item){
					this.renderItems.push(item);
				}
				this.addRenderItemAnimated = function(item){
					this.renderItemsAnimated.push(item);
        }
        
      // # Scenario 
        this.getScenarioAssetItem = function(item, x, y){
          switch(item.name) {
            case "wall":
              return new Wall(item.type, x, y, chunkSize);
              break;
            case "floor":
              return new Floor(item.type, x, y, chunkSize);
              break;
          }
        }
        
      // # Scenario Desgin (Static)

        // Design shorthand

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
        ]


      // # Proccess scenario design
        scenarioDesign.map( (array, x) => {
         array.map( (item, y) => {
          let x0 = y * chunkSize;
          let y0 = x * chunkSize;
          this.addRenderItem(this.getScenarioAssetItem(item, x0, y0));
         });
        });

      // # Scenario Animated items

        // TO DO

    }





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
},{}],9:[function(require,module,exports){
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
window.onload = function() {
	
	// # Init
		var fps, fpsInterval, startTime, now, deltaTime, elapsed;
    var gameProps = new gameProperties();
    
		var canvasStatic = document.getElementById('canvas_static');
		var contextStatic = canvasStatic.getContext('2d');
		
		var canvasAnimated = document.getElementById('canvas_animated');
		var contextAnimated = canvasAnimated.getContext('2d');

		//var canvas_shadow = document.getElementById('canvas_shadow');
		//var context_shadow = canvas_shadow.getContext('2d');
    
		canvasAnimated.width = canvasStatic.width = gameProps.getProp('canvasWidth');
		canvasAnimated.height = canvasStatic.height = gameProps.getProp('canvasHeight');
	
		// # Get mouse X, Y position - DEBUG ONLY
			/*var mousePosition = new MousePosition(canvas_shadow, false); //canvas, debug?
				mousePosition.init();*/


	// # Scenario
		
		var scenario = new scenario_Prototype(contextStatic, canvasStatic, gameProps );

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
		//var render_shadow = new Render(context_shadow, canvas_shadow, "easy", player); //Render with shadow effect - DEACTIVATED
			
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
					//render_shadow.start( Date.now() - time );
	
			}
			
		};
	
	// # Starts the game
		
		renderStatic.start( deltaTime );  // Render the static layers only once
		
		runGame( gameProps.getProp('fps') );	// GO GO GO
	
}
},{}],11:[function(require,module,exports){
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

window.debug = false;
},{}]},{},[1,2,3,4,5,6,7,8,9,11,10]);
