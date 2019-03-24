const _Collidable = require('./_Collidable');
const gameProperties = require('../../../gameProperties'); 

class Teleport extends _Collidable {

	constructor(type, x0, y0, xIndex, yIndex, chunkSize, teleportProps) {
    
    let stopOnCollision = false;
    let hasCollisionEvent = true;
    
    let name = "Teleport";

    // # Sprite
    let spriteWidth = 16;
    let spriteHeight = 16;
	  let stageSprite = false;
	
    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name);
    
    this.teleportProps = teleportProps;

    this.xIndex = xIndex;
    this.yIndex = yIndex;
  }

  // # Sprites
  setSpriteType(type) {
    switch(type) {
      default:
        this.spriteProps = { 
          clip_x: 0, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
      break;
    }
  }

  // Collision Event
  collision(player, collidable, collisionDirection){
    
    // Change stage
    collidable.scenario.setStage( this.teleportProps.targetStage );

    // Teleport the player
    this.teleport( player );

  }

  // What kind of teleport?
  teleport( player ) {

    let gameProps = new gameProperties();

    let type = this.teleportProps.teleportType;
    let targetX = 0;
    let targetY = 0;

    switch(type){
      default:
        targetX = this.teleportProps.targetX;
        targetY = this.teleportProps.targetY;
        break;
      case "relative":
        switch (this.teleportProps.cameFrom) {
          case "top":
            targetX = this.xIndex * this.chunkSize;
            targetY = ((gameProps.getProp('screenVerticalChunks') - 2) * this.chunkSize ) - this.chunkSize; // -2 on X is the square before the last. Why? Why Y you have to use -1 only?
            break;
          case "bottom":
            targetX = this.xIndex * this.chunkSize;
            targetY = 1 * this.chunkSize; // This 1 is just to remeber that it will be teleported to index Xx1 and not Xx0
            break;
          case "right":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = 1 * this.chunkSize;
            break;
          case "left":
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = ((gameProps.getProp('screenHorizontalChunks') - 1) * this.chunkSize) - this.chunkSize; // -1 because it will spawn not in last square, but the one before it. 
            break;
        }
        break;
    }

    player.setX( targetX ); // always using X and Y relative to teleport not player because it fix the player position to fit inside destination square.
    player.setY( targetY );
  }

}//class
module.exports = Teleport;