const _Collidable = require('./_Collidable');
const Sprite = require('../../../engine/Sprite');

class Door extends _Collidable {

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

    let sprite = new Sprite(document.getElementById('sprite_beach'), 1980, 1055, 32, 32);

    let events = {
      stopOnCollision: true,
      hasCollisionEvent: true
    }
    
    super(props, position, dimension, sprite, events);

    this.doorCode = '';
    this.type = 'door';

  }

  setDoorCode(code) { this.doorCode = code; }
  getDoorCode(){ return this.doorCode; }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      // Gray
      case "door_gray_bl":
        this.setDoorCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1313);
        break;
      case "door_gray_tl":
        this.setDoorCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1251);
        break;
      case "door_gray_br":
        this.setDoorCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1314);
        break;
      case "door_gray_tr":
        this.setDoorCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1252);
        break;
      // Purple
      case "door_purple_bl":
        this.setDoorCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1315);
        break;
      case "door_purple_tl":
        this.setDoorCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1253);
        break;
      case "door_purple_br":
        this.setDoorCode('purple');  
        this.spriteProps = this.sprite.getSpriteProps(1316);
        break;
      case "door_purple_tr":
        this.setDoorCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1254);
        break;
      // Red
      case "door_red_bl":
        this.setDoorCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1317);
        break;
      case "door_red_tl":
        this.setDoorCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1255);
        break;
      case "door_red_br":
        this.setDoorCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1318);
        break;
      case "door_red_tr":
        this.setDoorCode('red');  
        this.spriteProps = this.sprite.getSpriteProps(1256);
        break;
      // Green
      case "door_green_bl":
        this.setDoorCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1319);
        break;
      case "door_green_tl":
        this.setDoorCode('red');  
        this.spriteProps = this.sprite.getSpriteProps(1257);
        break;
      case "door_green_br":
        this.setDoorCode('red');  
        this.spriteProps = this.sprite.getSpriteProps(1320);
        break;
      case "door_green_tr":
        this.setDoorCode('red');  
        this.spriteProps = this.sprite.getSpriteProps(1258);
        break;
    }

  }

}//class
module.exports = Door;