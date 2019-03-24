class _Scenario {

	constructor(ctx, canvas, gameProps){
		this.ctx = ctx;
		this.canvas = canvas;
		
		this.renderItems = new Array();
		this.renderLayerItems = new Array();
		
		this.width = canvas.width;
    this.height = canvas.height;
    
    this.playerStartX = 0; 
    this.playerStartY = 0; 

    this.stage = 0;

		this.chunkSize = gameProps.getProp('chunkSize');
	}

  // # Add Items to the render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderLayerItem(item){
		this.renderLayerItems.push(item);
  }
  
	// # Gets
	getCtx() { return this.ctx; }
	getCanvas() { return this.canvas; }	
				
	getRenderItems() { return this.renderItems; }
	getLayerItems() {  return this.renderLayerItems; }
  
  getPlayerStartX() { return this.playerStartX; }
  getPlayerStartY() { return this.playerStartY; }

  // # Sets
  setPlayerStartX(x) { this.playerStartX = x; }
  setPlayerStartY(y) { this.playerStartY = y; }

  render() { }

}//class
module.exports = _Scenario;