const _CanThrow = require('./_CanThrow');
const Sprite = require('../../../engine/Sprite');

class Key extends _CanThrow {

	constructor(type, x0, y0) {
    
    let props = {
      name: "key",
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

    let sprite = new Sprite(document.getElementById('sprite_common'), 1000, 980, 50, 50);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }
    
    let canThrow = {
      canRespawn: true,
      chuncksThrowDistance: 1,
      hurtAmount: 0,
      useEvent: 'use'
    }

    let customVars = {
      keyCode: ''
    }

    super(props, position, dimension, sprite, events, canThrow, customVars);

    this.code = '';
  }

  setCode(code) { this.code = code; }
  getCode(){ return this.code; }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      case "gray":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(26);
        break;
      case "purple":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(27);
        break;
      case "red":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(28);
        break;
      case "green":
        this.setCode('green');
        this.spriteProps = this.sprite.getSpriteProps(29);
        break;
    }

  }

  use(direction, playerHeight, player) {
    console.log(this.getCode());
    let obj = player.checkItemOnGrabCollisionBox();
    if( obj.type == 'door' ) {
      console.log('doorCode:', obj.getDoorCode());
    }
  }

}//class
module.exports = Key;