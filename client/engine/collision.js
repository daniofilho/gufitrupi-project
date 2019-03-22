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

  checkCollision(r1, r2) {
        
    //r1 -> the moving object
    //r2 -> the "wall"

    // Only checks "collidable" objects
      if( ! r2.collision() ) return false;
 
    // stores the distance between the objects (must be rectangle)
      var catX = r1.getCenterX() - r2.getCenterX();
      var catY = r1.getCenterY() - r2.getCenterY();

      var sumHalfWidth = ( r1.getCollisionWidth() / 2 ) + ( r2.getCollisionWidth() / 2 );
      var sumHalfHeight = ( r1.getCollisionHeight() / 2 ) + ( r2.getCollisionHeight() / 2 ) ;
        
      if(Math.abs(catX) < sumHalfWidth && Math.abs(catY) < sumHalfHeight){
        
        var overlapX = sumHalfWidth - Math.abs(catX);
        var overlapY = sumHalfHeight - Math.abs(catY);
        
        if(overlapX >= overlapY){ // Direction of collision - Up/Down
          if(catY > 0){ // Up
            r1.setY( r1.getY() + overlapY );
          } else {
            r1.setY( r1.getY() - overlapY );
          }
        } else {// Direction of collision - Left/Right
          if(catX > 0){ // Left
            r1.setX( r1.getX() + overlapX );
          } else {
            r1.setX( r1.getX() - overlapX );
          }
        }

      } else {
        r1.noCollision(); // What happens if it's not colling?
      }
  }
			
	// Add items to check for collision
	addItem(object) {
		this.colItens.push(object);
  };
  
  addArrayItem(object){
		for (let i in object){
      this.colItens.push(object[i]);
    }
	}

}// class

module.exports = Collision;
	