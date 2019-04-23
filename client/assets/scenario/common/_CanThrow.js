const _Collidable = require('./_Collidable');

class _CanThrow extends _Collidable {

  constructor(props, position, dimension, sprite, events, canCollectProps) {
    super(props, position, dimension, sprite, events);
    
    this.canGrab = true;
    this.grabbed = false;
    this._canRespawn = canCollectProps.canRespawn;
    this.hurtAmount = canCollectProps.hurtAmount;
    
    this.chuncksThrowDistance = canCollectProps.chuncksThrowDistance * window.game.getChunkSize();
    this.throwSpeed = 0.6;
    this.throwDistanceTravelled = 0;
    this.throwingMovement = false;
    this.throwDirection = false;
  }

  isGrabbed() { return this.grabbed; }
  grab(){ this.grabbed = true; }
  setGrab(bool) { this.grabbed = bool; }

  isThrowing() { return this.throwingMovement; }
  setThrowing(bool) { this.throwingMovement = bool; }
  getThrowSpeed() { return  window.game.getChunkSize() * this.throwSpeed; }
  setThrowDirection(direction) { this.throwDirection = direction; }

  setCanRespawn(bool){ this._canRespawn = bool; }
  canRespawn() { return this._canRespawn; }
  
  setName(name) { this.name = name; }

  grabHandler( ) {
    this.setGrab(true);
    this.setStopOnCollision(false); // avoid players pushing other players with items
  }

  breakObject() {
    this.setThrowing(false);
    this.setGrab(false);
    this.setStopOnCollision(true);
    this.updateX(99999)//take off screen - TEMPORARY
  }

  throw(direction) {
    this.setThrowing(true);
    this.setThrowDirection( direction );
  }

  moveToThrowDirection() {
    
    switch( this.throwDirection ) {
      case 'up':
        this.updateY( this.getY() - this.getThrowSpeed() ); 
        break;
      case 'down':
        this.updateY( this.getY() + this.getThrowSpeed() ); 
        break;
      case 'right':
        this.updateX( this.getX() + this.getThrowSpeed() ); 
        break;
      case 'left':
        this.updateX( this.getX() - this.getThrowSpeed() ); 
        break;
    }
    this.throwDistanceTravelled += this.getThrowSpeed();

    // Check collision between player and enemy only
    this.justCheckCollision();

    // TRY TO MAKE A CURVE THROW
    // . . .
  }

  justCheckCollision() {
    let obj = window.game.collision.justCheck(this, this.getCollisionX(), this.getCollisionY(), this.getCollisionWidth(), this.getCollisionHeight()); 
    if ( obj  && this.isThrowing() ) {
      if( obj.type == "player" ) {
        obj.hurtPlayer(this.hurtAmount); // hurt player
        this.breakObject();
      }
      if( obj.type == "enemy" ) { 
        obj.hurt(this.hurtAmount); // hurt enemy
        this.breakObject();
      }
    }
  }
 

  beforeRender() {
    if( this.isThrowing() ) {
      if( this.throwDistanceTravelled < this.chuncksThrowDistance ) {
        this.moveToThrowDirection();
      } else {
        this.breakObject();
      }
    }
  }

}//class
module.exports = _CanThrow;