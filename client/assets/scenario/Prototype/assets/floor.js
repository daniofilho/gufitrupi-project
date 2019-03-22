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