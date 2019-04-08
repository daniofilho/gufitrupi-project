const _Collidable = require('./_Collidable');

class _CanCollect extends _Collidable {

  constructor(props, position, dimension, game, sprite, events, canCollectProps) {
    super(props, position, dimension, game, sprite, events);
    
    this.collected = false;
    this.canRespawn = canCollectProps.canRespawn;
  }

  isCollected() { return this.collected; }
  collect(){ this.collected = true; }

  setCanRespawn(bool){ this.canRespawn = bool; }
  
  setName(name) { this.name = name; }

}//class
module.exports = _CanCollect;