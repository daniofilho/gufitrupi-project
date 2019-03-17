// Game Properties class to define configurations
function gameProperties() {
  
  this.fps = 24;

  // Canvas size based on "chunks" 
  this.chunkSize = 100; //px - resolution
	this.screenHorizontalChunks = 11;
	this.screenVerticalChunks = 11;
  this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
  this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);

  this.getProp = function(prop) {
    return this[prop];
  }

}

window.debug = true;