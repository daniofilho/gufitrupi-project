const UIitem = require('./_UIitem');

class UI {

  constructor(player1, player2, gameProps) {
    this.player1 = player1;
    this.player2 = player2;
    this.renderItems = new Array(); 
    this.gameProps = gameProps;
    this.chunkSize = this.gameProps.getProp('chunkSize');
    this.run();
  }
              
  // Add items to the vector
  addItem(object){
    this.renderItems.push(object);
  }
  addArrayItem(object){
    for (let i in object){
      this.renderItems.push(object[i]);
    }
  }
  clearArrayItems(){ 
    this.renderItems = new Array(); 
  }
  getRenderItems(){
    return this.renderItems;
  }

  // Clear array and rerun code to get new items
  getNewRenderItems() {
    this.clearArrayItems();
    this.run();
    return this.getRenderItems();
  }

  // Math
  fromRight(value) {
    return ( this.gameProps.getProp('screenHorizontalChunks') * this.chunkSize ) - value;
  }

  run() {

    // # Players

      // # Player 01

        // # Avatar
        this.addItem( new UIitem(
          'sprite_ui', this.chunkSize,
          5, 5, // x, y,
          50, 50,   // sprite_w, sprite_h, 
          0, 0,      // clip_x, clip_y
          this.chunkSize, this.chunkSize // w, h
        ) );

        // # Life
        let _1x = 120;
        let _1y = 10;
        let _1lifes = this.player1.getLifes();
        for( let i=0; i<_1lifes;i++ ) {
          this.addItem( new UIitem(
            'sprite_ui', this.gameProps.getProp('chunkSize'),
            _1x, _1y,
            50, 50,   
            100, 0,      
            this.chunkSize/3, this.chunkSize/3 
          ) );
          _1x += 35;

          if( i == 2 ) {
            _1x = 120;
            _1y = 60;
          }
        }
        

      // - - - - - - - - - - - - - - - - - - - - 

      // # Player 02

        // # Avatar
        this.addItem( new UIitem(
          'sprite_ui', this.gameProps.getProp('chunkSize'),
          this.fromRight( 230 ), 5, 
          50, 50,   
          50, 0,      
          this.chunkSize, this.chunkSize 
        ) );
        
        // # Life
        let _2x = this.fromRight( 50 );
        let _2y = 10;
        let _2lifes = this.player2.getLifes();
        for( let i=0; i<_2lifes;i++ ) {
          this.addItem( new UIitem(
            'sprite_ui', this.gameProps.getProp('chunkSize'),
            _2x, _2y,
            50, 50,   
            100, 0,      
            this.chunkSize/3, this.chunkSize/3 
          ) );
          _2x -= 35;

          if( i == 2 ) {
            _2x = this.fromRight( 50 );
            _2y = 60;
          }
        }

    // # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #  
  }
}//class
module.exports = UI