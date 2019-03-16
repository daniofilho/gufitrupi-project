// Game Properties class to define configurations
function gameProperties() {
  
  this.fps = 30;

  // Canvas size based on "chunks" 
  this.chunkSize = 100; //px - resolution
	this.screenHorizontalChunks = 15;
	this.screenVerticalChunks = 15;
  this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
  this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);

  this.getProp = function(prop) {
    return this[prop];
  }

}