const _Collidable = require('../../../engine/assets/_Collidable');
const Sprite = require('../../../engine/core/Sprite');

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

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

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
      case "sand_01":
        this.spriteProps = this.sprite.getSpriteProps(249);
        break;
      
      case "02":
      case "sand_02":
        this.spriteProps = this.sprite.getSpriteProps(930);
        break;

    }

  }

  collision(player){ 
    player.setTeleporting(false);
    return true; 
  }

}//class
module.exports = Beach_Floor;