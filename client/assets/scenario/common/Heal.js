const _CanCollect = require('./_CanCollect');

class Heal extends _CanCollect {

  constructor(type, x0, y0, chunkSize) {
    
    let props = {
      name: "Potion",
      type: type
    }

    let position = {
      x: x0,
      y: y0
    }

    let dimension = {
      width: chunkSize,
      height: chunkSize
    }

    let game = {
      chunkSize: chunkSize
    }

    let sprite = {
      width: 50,
      height: 50,
      stageSprite: document.getElementById('sprite_common')
    }

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    let canCollectProps = {
      canRespawn: true
    }

    super(props, position, dimension, game, sprite, events, canCollectProps);
    
  }

  setHealAmout(amount) { this.healAmout = amount; }
  getHealAmount() { return this.healAmout; }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
      case 'banana':
        this.setNeedSaveState(true); // DEBUG
        this.setHealAmout(1);
        this.setCanRespawn(true);
        this.spriteProps = { 
          clip_x: 0, clip_y: 50, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteWidth
        }
        break;
      case 'berry':
        this.setNeedSaveState(true); // Make this item able to save state
        this.setHealAmout(2);
        this.setCanRespawn(false); // It can't respawn if used
        this.spriteProps = { 
          clip_x: 50, clip_y: 50, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteWidth
        }
        break;
    }
  }

  collision(player){ 
    if( ! this.isCollected() ) {
      this.collect();
      this.hide();
      player.healPlayer( this.getHealAmount() );
    }
    return true; 
  }

}//class
module.exports = Heal;