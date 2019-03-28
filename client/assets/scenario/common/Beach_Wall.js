const _Collidable = require('./_Collidable');

class Beach_wall extends _Collidable {

	constructor(type, x0, y0, chunkSize) {
    
    let stopOnCollision = true;
    let hasCollisionEvent = false;
    
    let name = "Beach Wall";

    // # Sprite
    let spriteWidth = 16;
    let spriteHeight = 16;
    let stageSprite = document.getElementById('sprite_beach'); 

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
        this.spriteProps = { 
          clip_x: 625, clip_y: 11, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      case "tree_bottom_right":
        this.spriteProps = { 
          clip_x: 744, clip_y: 11, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
    }

  }

}//class
module.exports = Beach_wall;