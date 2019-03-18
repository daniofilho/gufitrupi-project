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