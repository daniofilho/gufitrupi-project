const _Collidable = require('./_Collidable');

class _CanHurt extends _Collidable {

  constructor(props, position, dimension, sprite, events,canHurtProps) {
    super(props, position, dimension, sprite, events);
    this.hurtAmount = canHurtProps.amount;
  }
  
  // If it's not colliding to any teleport chunk anymore, make it ready to teleport again
  collision(obj){ 
    if( obj.type == "player" ) obj.hurtPlayer(this.hurtAmount);
    if( obj.type == "enemy" ) obj.hurt(this.hurtAmount);
    return true; 
  }

  beforeRender(ctx) {
    // debug position
    if( window.debug ) {
      let x = Math.round(this.getCollisionX());
      let y = Math.round(this.getCollisionY());
      let text = "X: " + x + " Y: " + y;
      console.log(text);
      ctx.font = "25px 'Press Start 2P'";
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText( text, this.getX() - 20 , this.getY()); 
    }
  }

}//class
module.exports = _CanHurt;