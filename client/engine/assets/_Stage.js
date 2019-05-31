class _Stage {

  constructor(stageId, stageMap, stageAssets, scenarioTileSet) {
    
    this.renderItems = new Array();
    
    this.renderLayerItems = new Array();

    this.chunkSize = window.game.getChunkSize();

    this.player1StartX = 0;
    this.player1StartY = 0;
    
    this.player2StartX = 0;
    this.player2StartY = 0;

    this.stageId = stageId;

    this.jsonStageMap = stageMap;
    this.jsonStageAssets = stageAssets;
    this.jsonTileSet = scenarioTileSet;

    this.stageMap = new Array();

    this.cols = this.jsonStageMap.width;
    this.rows = this.jsonStageMap.height;

    this.coordinates = {};

    this.run();
  }

  // # Gets
  getStaticItems() { return this.renderItems; }
  getLayerItems() { return this.renderLayerItems; }
  
  getPlayer1StartX() { return this.player1StartX; }
  getPlayer1StartY() { return this.player1StartY; }
  
  getPlayer2StartX() { return this.player2StartX; }
  getPlayer2StartY() { return this.player2StartY; }

  getStageId() { return this.stageId; }
  
  // # Sets
  setPlayer1StartX(x) { this.player1StartX = x; }
  setPlayer1StartY(y) { this.player1StartY = y; }

  setPlayer2StartX(x) { this.player2StartX = x; }
  setPlayer2StartY(y) { this.player2StartY = y; }
  
  // # Add Items to the render
	addStaticItem(item){
    this.renderItems.push(item);
  }
  clearArrayItems(){
    this.renderItems = new Array();
  }

  calculateStageCoordinates() {
    let index = 0;
    for( let r=0; r<this.rows;r++ ) {
        for( let c=0; c<this.cols;c++ ) {
            this.coordinates[index] = { 
              x: this.chunkSize * c,
              y: this.chunkSize * r
            }
            index++;
        }
    }
  }
  
  // Loads JSON file
  loadJSON() {
    
    // Map each layer
    this.jsonStageMap.layers.map( (layer) => {

      // Check if it's a player layer
      if( layer.name == "player") {
        this.stageMap.push( {code: 'player'} );

        this.setPlayer1StartX( layer.properties.find( x => x.name === 'player_1_x' ).value * this.chunkSize );
        this.setPlayer1StartY( layer.properties.find( x => x.name === 'player_1_y' ).value * this.chunkSize );
      
        this.setPlayer2StartX( layer.properties.find( x => x.name === 'player_2_x' ).value * this.chunkSize );
        this.setPlayer2StartY( layer.properties.find( x => x.name === 'player_2_y' ).value * this.chunkSize );

      }

      // Check if it's the assets layer
      if( layer.name == "assets") {
        this.stageMap.push({'code': 'assets'});
      }

      let index = 0;
      // Map each item inside layer
      layer.data.map( (obj) => {
        if( obj != 0 ) { // avoid empty objects
          obj = parseInt(obj - 1); // Adjust Tiled ID: they add +1 to IDs to allow 0 as a empty tile // #https://discourse.mapeditor.org/t/wrong-ids-in-tileset/1425
          let tileset = this.jsonTileSet.tiles.find( x => x.id === obj ); // Get the index of corresponding id          
          this.stageMap.push( 
            {
              'x': this.coordinates[index].x,
              'y': this.coordinates[index].y,
              'code': obj,
              'class': tileset.properties.find( x => x.name === 'class' ).value,
              'type': tileset.properties.find( x => x.name === 'type' ).value,
              'stageID': this.stageId
            }
          );
        }      
        index++;
      });
    });
    
  }

  loadAssets() {
    // Teleports
    this.jsonStageAssets.teleports.map( (asset) => {
      let props = {
        xIndex: ( asset.xIndex * this.chunkSize ),
        yIndex: ( asset.yIndex * this.chunkSize ),
        target: {
					stage: asset.props.target.stage,
					x: ( asset.props.target.x * this.chunkSize ),
					y: ( asset.props.target.y * this.chunkSize ),
					look: asset.props.target.look
				}
      }
      this.addStaticItem(
        window.game.globalAssets.getAsset('teleport', { xIndex: props.xIndex, yIndex: props.yIndex, props: props }, false ) 
      );
    });

    // Enemies
    this.jsonStageAssets.enemies.map( (enemy) => {
    });

    // Dialogs
    this.jsonStageAssets.dialogs.map( (dialog) => {
      let props = {
        x: ( dialog.x * this.chunkSize ),
        y: ( dialog.y * this.chunkSize ),
        dialog: dialog.dialog
      }
      this.addStaticItem(
        window.game.globalAssets.getAsset('dialog', { x: props.x, y: props.y, dialog: props.dialog }, false ) 
      )
    });
  }

  loadStageItems() {
    this.stageMap.map( (obj) => {

      switch( obj.code ) {

        case 'player':
          window.game.players.map( (player) => {
            this.addStaticItem( player ); // Adds the player to the render
          });
          break;

        case 'assets':
          this.loadAssets();
          break;

        default:
          this.addStaticItem(
            window.game.globalAssets.getAsset( obj.class, { code: obj.type, x0: obj.x, y0: obj.y, stage: obj.stageID }, false ) // false = not from save state
          );
          break;
      }

    });
  }

  run () {  
    this.calculateStageCoordinates();
    this.loadJSON();
    this.loadStageItems();
  }

} // class
module.exports = _Stage;