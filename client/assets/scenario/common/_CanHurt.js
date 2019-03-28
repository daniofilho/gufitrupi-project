const _Collidable = require('./_Collidable');

class _CanHurt extends _Collidable {

  constructor(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name, hurtAmount) {
    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name);
    this.hurtAmount = hurtAmount;
  }
  
  // If it's not colliding to any teleport chunk anymore, make it ready to teleport again
  collision(player){ 
    player.hurtPlayer(this.hurtAmount);
    return true; 
  }

}//class
module.exports = _CanHurt;