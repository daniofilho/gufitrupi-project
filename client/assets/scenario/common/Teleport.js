const _Collidable = require('../../../engine/assets/_Collidable');
const Sprite = require('../../../engine/core/Sprite');

class Teleport extends _Collidable {

	constructor(x, y, tpProps) {
    
    let props = {
      name: "Teleport",
      type: 'teleport'
    }

    let position = {
      x: x,
      y: y
    }

    let dimension = {
      width: window.game.getChunkSize(),
      height: window.game.getChunkSize()
    }

    let sprite = new Sprite(false, 0, 0, 0, 0);

    let events = {
      stopOnCollision: false,
      hasCollisionEvent: true
    }
    
    super(props, position, dimension, sprite, events);
    
    this.props = tpProps;

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
  collision(playerWhoActivatedTeleport, collidable) {
    
    let players = window.game.players;

    this.teleport( playerWhoActivatedTeleport );
      
    // Make everything dark
    collidable.scenario.clearArrayItems();
    window.game.loading(true);

    // Hide all players
    players.map( (player) => {
      player.hidePlayer();
    });

    // Now teleport all players to same location and direction
    let targetX = playerWhoActivatedTeleport.getX();
    let targetY = playerWhoActivatedTeleport.getY();
    let lookDirection = playerWhoActivatedTeleport.getSpriteProps().direction;
    
    players.map( (player) => {
      player.setX(targetX, true); // true = also set collision x too
      player.setY(targetY, true);
      player.triggerLookDirection(lookDirection);
      player.checkGrabbingObjects();
      player.showPlayer();
    });

    // Change stage
    collidable.scenario.setStage( 
      this.props.target.stage,
      false // firstStage ?
    );

    window.game.loading(false);
      
  }

  teleport( player ) {
    player.setX( this.props.target.x );// This is the X position of player HEADER. Remeber that collision box is on player foot
    player.setY(this.props.target.y );
  }

}//class
module.exports = Teleport;