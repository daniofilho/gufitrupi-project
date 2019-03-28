const _CanHurt = require('./_CanHurt');

class Fire extends _CanHurt {

  constructor(type, x0, y0, chunkSize) {
    
    let stopOnCollision = false;
    let hasCollisionEvent = true;
      
    let name = "Fire";

    // # Sprite
    let spriteWidth = 50;
    let spriteHeight = 50;
    let stageSprite = document.getElementById('sprite_common');

    super(type, x0, y0, chunkSize, stageSprite, spriteWidth, spriteHeight, stopOnCollision, hasCollisionEvent, name, 1);
      
    this.spriteAnimationCount = 1;
    this.spriteAnimationMaxCount = 3;

    // Controls the player FPS Animation
    this.fpsInterval = 1000 / 10; // 1000 / FPS
    this.deltaTime = Date.now();
  }

  // # Sprites  
  setSpriteType(type) {
    switch(type) { 
      default:
        this.setSpritePropsFrame(this.spriteAnimationCount);
        break;
    }
  }
  setSpritePropsFrame(spriteAnimationCount){
    switch(spriteAnimationCount) { 
      case 1:
        this.spriteProps = { 
          clip_x: 0, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      case 2:
        this.spriteProps = { 
          clip_x: 50, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
      case 3:
        this.spriteProps = { 
          clip_x: 100, clip_y: 0, 
          sprite_width: this.spriteWidth, sprite_height: this.spriteHeight 
        }
        break;
    }
  }

  // # Controls the Fire FPS Movement independent of game FPS
  canRenderNextFrame() {
    let now = Date.now();
    let elapsed = now - this.deltaTime;
    if (elapsed > this.fpsInterval) {
      this.deltaTime = now - (elapsed % this.fpsInterval);
      return true;
    } else {
      return false;
    }
  } 

  beforeRender() {
    // Animate fire
    if( this.canRenderNextFrame() ) {
      this.spriteAnimationCount++;
      if( this.spriteAnimationCount > this.spriteAnimationMaxCount ) this.spriteAnimationCount = 1;
      this.setSpritePropsFrame(this.spriteAnimationCount);
    }
  }

}//class
module.exports = Fire;