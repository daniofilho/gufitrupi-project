const _CanCollect = require('../../../engine/assets/_CanCollect');
const Sprite = require('../../../engine/core/Sprite');

class Door extends _CanCollect {

	constructor(type, x0, y0, stage) {
    
    let props = {
      name: "door",
      type: type,
      stage: stage
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

    let canCollectProps = {
      canRespawn: false
    }
    
    super(props, position, dimension, sprite, events, canCollectProps);

    this.type = 'door';

    this.openSound = false;

    this.handleProps();
    this.initSounds();
  }

  /*
    # Sounds
  */
  initSounds() {
    // Open
    this.openSound = new Howl({ src: ['./sounds/scenarios/door-open.mp3'], volume: 0.4 });
  }

  checkSavedItemState() {
    let savedItemsState = JSON.parse( localStorage.getItem('gufitrupi__itemsState') );  
    if( savedItemsState ) {
      let itemSavedState = savedItemsState[this.getName()];
      if( itemSavedState && itemSavedState.collected === true ){ // Check if this item is already grabbed
        this.collect();
        this.hide();
        this.setStopOnCollision(false);
      }
    }  
  }

  // # Sprites
    
  setSpriteType(type) {
      
    switch(type) {
      // Gray
      case "door_gray_bl":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1313);
        break;
      case "door_gray_tl":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1251);
        break;
      case "door_gray_br":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1314);
        break;
      case "door_gray_tr":
        this.setCode('gray');
        this.spriteProps = this.sprite.getSpriteProps(1252);
        break;
      // Purple
      case "door_purple_bl":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1315);
        break;
      case "door_purple_tl":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1253);
        break;
      case "door_purple_br":
        this.setCode('purple');  
        this.spriteProps = this.sprite.getSpriteProps(1316);
        break;
      case "door_purple_tr":
        this.setCode('purple');
        this.spriteProps = this.sprite.getSpriteProps(1254);
        break;
      // Red
      case "door_red_bl":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1317);
        break;
      case "door_red_tl":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1255);
        break;
      case "door_red_br":
        this.setCode('red');
        this.spriteProps = this.sprite.getSpriteProps(1318);
        break;
      case "door_red_tr":
        this.setCode('red');  
        this.spriteProps = this.sprite.getSpriteProps(1256);
        break;
      // Green
      case "door_green_bl":
        this.setCode('green');
        this.spriteProps = this.sprite.getSpriteProps(1319);
        break;
      case "door_green_tl":
        this.setCode('green');  
        this.spriteProps = this.sprite.getSpriteProps(1257);
        break;
      case "door_green_br":
        this.setCode('green');  
        this.spriteProps = this.sprite.getSpriteProps(1320);
        break;
      case "door_green_tr":
        this.setCode('green');  
        this.spriteProps = this.sprite.getSpriteProps(1258);
        break;
    }
    this.setNeedSaveState(true);
    
  }

  // Handle props when load
  handleProps() {
    // Check if this item was saved before and change it props
    this.checkSavedItemState();
  }

  // Open door = hide all doors with same code 
  open() {
    let objs = window.game.collision.getColItens();
    for (let i in objs) {
      if( objs[i].type == 'door' ) {
        if( objs[i].getCode() == this.getCode() ) {
          this.openSound.play();
          window.game.playSuccessSound();
          objs[i].collect();
          objs[i].hide();
          objs[i].setStopOnCollision(false);
        }
      }
    }
  }

}//class
module.exports = Door;