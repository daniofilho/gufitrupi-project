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
    
    this.healAmout = 1;
    this.itemUsed = false;
  }

  setHealAmout(amount) { this.healAmout = amount; }
  getHealAmount() { return this.healAmout; }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
      case 'banana':
        this.setHealAmout(1);
        this.setCanRespawn(false);
        this.spriteProps = { 
          clip_x: 0, clip_y: 50, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteWidth
        }
        break;
    }
  }

  // If it's not colliding to any teleport chunk anymore, make it ready to teleport again
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