class _Stage {

  constructor(chunkSize) {
    this.renderItems = new Array();
    this.renderLayerItems = new Array();
    this.chunkSize = chunkSize;
    this.run();
  }
  
  // # Gets
  getStaticItems() {  return this.renderItems; }
  getLayerItems() {  return this.renderLayerItems; }
  
  getPlayerStartX() { return this.playerStartX; }
  getPlayerStartY() { return this.playerStartY; }
  
  // # Sets
  setPlayerStartX(x) { this.playerStartX = x; }
  setPlayerStartY(y) { this.playerStartY = y; }
  
  // # Add Items to the render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderLayerItem(item){
		this.renderLayerItems.push(item);
  }
  
  run () { }

} // class
module.exports = _Stage;