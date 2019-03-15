// Game Properties class to define configurations
function gameProperties() {
  
  this.fps = 30;
  this.deltaTime = this.fps;// 1000/this.fps;

  // Canvas size based on "chunks" 
  this.chunkSize = 50; //px
	this.screenHorizontalChunks = 11;
	this.screenVerticalChunks = 11;
  this.canvasWidth = (this.chunkSize * this.screenHorizontalChunks);
  this.canvasHeight = (this.chunkSize * this.screenVerticalChunks);

  this.getProp = function(prop) {
    return this[prop];
  }

}