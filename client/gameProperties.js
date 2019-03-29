// Game Properties class to define configurations
class gameProperties {

  constructor() {
    
    // Canvas size based on "chunks" 
    
    this.chunkSize = 100; //px - resolution
    
    this.screenHorizontalChunks = 16;
    this.screenVerticalChunks = 14;
    
    this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
    this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);// Canvas size based on "chunks" 
    
    this.fps = 20;
  }

  getProp(prop) {
    return this[prop];
  }

}
module.exports = gameProperties;

// Global values

  // Debug
  window.debug = true;

  // Pause
  window._pause = false;
  window.isPaused = function() { return _pause; }
  window.pause = function() { window._pause = true; console.log('Game Paused!'); }
  window.unpause = function() { window._pause = false; console.log('Game Unpaused!'); }
  window.togglePause = function() { 
    if( window._pause ) {
      window.unpause();
    } else {
      window.pause();
    }
  }