// Class that detects collision between player and other objects
class Collision {

	constructor(scenarioWidth, scenarioHeight, player) {
		this.colItens = new Array(); // Items to check for collision
    this.scenarioWidth = scenarioWidth;
    this.scenarioHeight = scenarioHeight;
    this.player = player;
  }
			
  // # Check if the object collides with any object in vector
  // Algorithm reference: Gustavo Silveira - https://www.youtube.com/watch?v=s7qiWLBBpJw
  check(object) {
    for (let i in this.colItens) {
      let r1 = object;
      let r2 = this.colItens[i];
      this.checkCollision(r1, r2);
    } 
  }

  // @r1: the moving object
  // @r2: the "wall"
  checkCollision(r1, r2) {

    // Don't check collision between same object
    if( r1.name == r2.name ) return;
    
    // Only checks objects that needs to be checked
    if( ! r2.triggersCollisionEvent() && ! r2.stopIfCollision() ) return false;

    // stores the distance between the objects (must be rectangle)
    var catX = r1.getCenterX() - r2.getCenterX();
    var catY = r1.getCenterY() - r2.getCenterY();

    var sumHalfWidth = ( r1.getCollisionWidth() / 2 ) + ( r2.getCollisionWidth() / 2 );
    var sumHalfHeight = ( r1.getCollisionHeight() / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
    
    if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
      
      var overlapX = sumHalfWidth - Math.abs(catX);
      var overlapY = sumHalfHeight - Math.abs(catY);

      if( r2.stopIfCollision() ) {
        if(overlapX >= overlapY ){ // Direction of collision - Up/Down
          if(catY > 0){ // Up
            // Only moves if it wont collide
            //if( !this.willCollideInFuture(r1, r1.getCollisionX(), r1.getCollisionY() + overlapY ) ) {
              r1.setY( r1.getY() + overlapY );
              r1.setCollisionY( r1.getCollisionY() + overlapY );
            //}
          } else {
            //if( !this.willCollideInFuture(r1, r1.getCollisionX(), r1.getCollisionY() - overlapY ) ) {
              r1.setY( r1.getY() - overlapY );
              r1.setCollisionY( r1.getCollisionY() - overlapY );
            //}
          }
        } else {// Direction of collision - Left/Right
          if(catX > 0){ // Left
            //if( !this.willCollideInFuture(r1, r1.getCollisionX() + overlapX, r1.getCollisionY() ) ) {
              r1.setX( r1.getX() + overlapX );
              r1.setCollisionX( r1.getCollisionX() + overlapX );
            //}
          } else {
            //if( !this.willCollideInFuture(r1, r1.getCollisionX() - overlapX, r1.getCollisionY() ) ) {
              r1.setX( r1.getX() - overlapX );
              r1.setCollisionX( r1.getCollisionX() - overlapX );
            //}
          }
        }
      }

      if( window.debugCollision ) {
        console.log('Collision between', r1.name + "(" + r1.getX() + "/" + r1.getY() + ")", r2.name);
      }

      // Triggers Collision event
      r1.collision(r2, r1);
      r2.collision(r1, r2);

    } else {
      // Triggers not in collision event
      r1.noCollision(r2, r2); 
      r2.noCollision(r1, r2); 
    }

  }
  
  /*
  // Check a future movement
  willCollideInFuture(object, x, y) {
    let willCollide = false;
    for (let i in this.colItens) {
      let r1 = object;
      let r2 = this.colItens[i];
      willCollide = this.willCollide(r1, r2, x, y);
    } 
    return willCollide;
  }
  willCollide(r1, r2, x, y) {

    // Don't check collision between same object
    if( r1.name == r2.name ) return;
    
    // Only checks objects that needs to be checked
    if( ! r2.triggersCollisionEvent() && ! r2.stopIfCollision() ) return false;

    // stores the distance between the objects (must be rectangle)
    var catX = r1.getCenterX(x) - r2.getCenterX();
    var catY = r1.getCenterY(y) - r2.getCenterY();

    var sumHalfWidth = ( r1.getCollisionWidth() / 2 ) + ( r2.getCollisionWidth() / 2 );
    var sumHalfHeight = ( r1.getCollisionHeight() / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
    
    if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
      return true; // will collide
    } else {
      return false; // no collision
    }

  }*/
			
	// Add items to check for collision
	addItem(object) {
		this.colItens.push(object);
  };
  
  addArrayItem(object){
		for (let i in object){
      this.colItens.push(object[i]);
    }
  }
  
  clearArrayItems() {
    this.colItens = new Array();
  }

}// class

module.exports = Collision;
	