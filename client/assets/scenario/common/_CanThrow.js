const _Collidable = require('./_Collidable');

class _CanThrow extends _Collidable {

  constructor(props, position, dimension, sprite, events, canCollectProps) {
    super(props, position, dimension, sprite, events);
    
    this.grabbed = false;
    this._canRespawn = canCollectProps.canRespawn;
  }

  isGrabbed() { return this.grabbed; }
  grab(){ this.grabbed = true; }
  setGrab(bool) { this.grabbed = bool; }

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

}//class
module.exports = _CanThrow;