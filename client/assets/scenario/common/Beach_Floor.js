const _Collidable = require('./_Collidable');

class Beach_Floor extends _Collidable {

	constructor(type, x0, y0) {
    
    let props = {
      name: "Beach Floor",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
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
    
    super(props, position, dimension, sprite, events);
    
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