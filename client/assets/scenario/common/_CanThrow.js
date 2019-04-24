const _Collidable = require('./_Collidable');

class _CanThrow extends _Collidable {

  constructor(props, position, dimension, sprite, events, canCollectProps) {
    super(props, position, dimension, sprite, events);
    
    this.canGrab = true;
    this.grabbed = false;
    this._canRespawn = canCollectProps.canRespawn;
    this.hurtAmount = canCollectProps.hurtAmount;
    
    this.throwDistance = canCollectProps.chuncksThrowDistance * window.game.getChunkSize();
    this.throwSpeed = 0.6;
    this.throwDistanceTravelled = 0;
    this.throwingMovement = false;
    this.throwDirection = false;
    
    this.targetX = 0;
    this.targetY = 0;
  }

  isGrabbed() { return this.grabbed; }
  grab(){ this.grabbed = true; }
  setGrab(bool) { this.grabbed = bool; }

  isThrowing() { return this.throwingMovement; }
  setThrowing(bool) { this.throwingMovement = bool; }
  getThrowSpeed() { return  window.game.getChunkSize() * this.throwSpeed; }
  calculateThrowDirection(direction, playerHeight) { 
    this.throwDirection = direction;
    switch( this.throwDirection ) {
      case 'up':
        this.targetX = this.getX();  
        this.targetY = this.getY() - this.throwDistance;
        break;
      case 'down':
        this.targetX = this.getX();  
        this.targetY = this.getY() + this.throwDistance; 
        break;
      case 'right':
        this.targetX = this.getX() + this.throwDistance;  
        this.targetY = this.getY() - playerHeight;
        break;
      case 'left':
        this.targetX = this.getX() - this.throwDistance;  
        this.targetY = this.getY() - playerHeight;
        break;
    }

    console.log( this.getX(), "=>",this.targetX );
    console.log( this.getY(), "=>",this.targetY );
  }

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

  throw(direction, playerHeight) {
    this.setThrowing(true);
    this.calculateThrowDirection( direction, playerHeight );
  }

  moveToThrowDirection() {
    
    switch( this.throwDirection ) {
      case 'up':
        // Y
        if ( this.getY() > this.targetY ) this.updateY( this.getY() - this.getThrowSpeed() );
        break;
      case 'left':
        // Y
        if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getThrowSpeed() );
        // X
        if ( this.getX() > this.targetX ) this.updateX( this.getX() - this.getThrowSpeed() );
        break;
      case 'down':
       // Y
       if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getThrowSpeed() );
       break;
      case 'right':
        // Y
        if ( this.getY() < this.targetY ) this.updateY( this.getY() + this.getThrowSpeed() );
        // X
        if ( this.getX() < this.targetX ) this.updateX( this.getX() + this.getThrowSpeed() );
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
      if( this.getX() != this.targetX && this.getY() != this.targetY ) {
        console.log(this.getX(), this.getY());
        this.moveToThrowDirection();
      } else {
        //this.breakObject();
      }
    }
  }

}//class
module.exports = _CanThrow;