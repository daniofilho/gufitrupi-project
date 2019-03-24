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
    
    // If the player teleports, then change stage
    if( this.teleport( player ) ) {
      // Change stage
      collidable.scenario.setStage( 
        this.teleportProps.targetStage,
        false // firstStage ?
      );
    }

  }

  // What kind of teleport?
  teleport( player ) {
    
    let gameProps = new gameProperties();

    let type = this.teleportProps.teleportType;
    let targetX = 0;
    let targetY = 0;

    let willTeleport = false;

    switch(type){
      default:
        targetX = this.teleportProps.targetX;
        targetY = this.teleportProps.targetY;
        willTeleport = true;
        break;
      case "relative":
        switch (this.teleportProps.cameFrom) {
          case "top":
            if( player.spriteProps.direction != "up" ){ return; } // If is looking from the opposite direction, it means that it just came from a teleport
            targetX = this.xIndex * this.chunkSize;
            targetY = ( (gameProps.getProp('screenVerticalChunks') -1) * this.chunkSize) - this.chunkSize; // -1 because of the player collision box
            willTeleport = true;
            break;
          case "bottom":
            if( player.spriteProps.direction != "down" ){ return; }
            targetX = this.xIndex * this.chunkSize;
            targetY = ( 0 * this.chunkSize ) - this.chunkSize; // This 0* is just to remeber that it will be teleported to index Xx0, but because of player hit box, it will spawn a chunk above
            willTeleport = true;
            break;
          case "right":
            if( player.spriteProps.direction != "right" ){ return; }
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = 1 * this.chunkSize;
            willTeleport = true;
            break;
          case "left":
            if( player.spriteProps.direction != "left" ){ return; }
            targetY = ( this.yIndex * this.chunkSize) - this.chunkSize;
            targetX = (gameProps.getProp('screenHorizontalChunks') * this.chunkSize) - this.chunkSize; 
            willTeleport = true;
            break;
        }
        break;
    }

    // Only teleports if it can teleport
    if( willTeleport ) {
      player.setX( targetX ); // always using X and Y relative to teleport not player because it fix the player position to fit inside destination square.
      player.setY( targetY );
    }

    return willTeleport;

  }

}//class
module.exports = Teleport;