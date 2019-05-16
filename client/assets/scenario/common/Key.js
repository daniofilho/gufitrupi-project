const _Collidable = require('./_Collidable');
const Sprite = require('../../../engine/Sprite');

class Key extends _Collidable {

	constructor(type, x0, y0) {
    
    let props = {
      name: "door",
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 49);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: false
    }
    
    super(props, position, dimension, sprite, events);

  }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      case "gray":
        this.spriteProps = this.sprite.getSpriteProps(26);
        break;
      case "purple":
        this.spriteProps = this.sprite.getSpriteProps(27);
        break;
      case "red":
        this.spriteProps = this.sprite.getSpriteProps(28);
        break;
      case "green":
        this.spriteProps = this.sprite.getSpriteProps(29);
        break;
    }

  }

}//class
module.exports = Key;