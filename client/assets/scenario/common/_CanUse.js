const _Collidable = require('./_Collidable');
const Sprite = require('../../../engine/Sprite');

class _CanUse extends _Collidable {

  constructor(props, position, dimension, sprite, events, canUseProps) {

		super(props, position, dimension, sprite, events);
    
    this.canGrab = true;
    this.grabbed = false;
    this._canRespawn = canUseProps.canRespawn;
    
    this.canUse = true;
		this.throwDistance = canCollectProps.chuncksThrowDistance * window.game.getChunkSize();
  }

  isGrabbed() { return this.grabbed; }
  grab(){ this.grabbed = true; }
  setGrab(bool) { this.grabbed = bool; }

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

  grabHandler( ) {
    this.setGrab(true);
    this.setStopOnCollision(false); // avoid players pushing other players with items
  }
	
	calculateDropDirection(direction, playerHeight) { 
    this.throwDirection = direction;
    switch( this.throwDirection ) {
      case 'up':
        this.targetX = this.getX();  
        this.targetY = this.getY() - this.throwDistance;
        break;
      case 'down':
        this.targetX = this.getX();  
        this.targetY = this.getY() + this.throwDistance + this.getHeight() * 2; 
        break;
      case 'right':
        this.targetX = this.getX() + this.throwDistance;  
        this.targetY = this.getY() + playerHeight;
        break;
      case 'left':
        this.targetX = this.getX() - this.throwDistance;  
        this.targetY = this.getY() + playerHeight;
        break;
    }
	}
	
	// Throw action just drop item
  throw(direction, playerHeight) {
    console.log('Drop item');
  }

  justCheckCollision() {
    let obj = window.game.collision.justCheck(this, this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight()); 
    if ( obj  && this.isThrowing() ) {
      if( obj.type == "door" ) {
        console.log('...');
      }
    }
  }
 

  beforeRender(ctx) {
    
  }

}//class
module.exports = _CanUse;