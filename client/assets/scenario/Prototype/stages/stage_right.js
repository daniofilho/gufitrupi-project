// Stage 02
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_Right extends _Stage{

  constructor() {
    super("right");

    let player1StartX = window.game.getChunkSize() * 0;
    let player1StartY = window.game.getChunkSize() * 0;
    
    let player2StartX = window.game.getChunkSize() * 1;
    let player2StartY = window.game.getChunkSize() * 0;

    this.run(player1StartX, player1StartY, player2StartX, player2StartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;
    }
  }
        
  // # Scenario Desgin (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
     
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};
 
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
         
    // Floor
    let f1 = { name: "floor", type: "01"};
    
    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wt,     wt,     wt,     wt,     wt,     wt,    wt,    wt,    wt,    wc_tr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ f1,     f1,     f1,     f1,     f1,     f1,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ f1,     f1,     f1,     f1,     f1,     f1,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ ob,     ob,     ob,     ob,     ob,     ob,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ f1,     f1,     f1,     f1,     f1,     f1,    f1,    f1,    f1,    wr,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wb,     wb,     wb,     wb,     wb,     wb,    wb,    wb,    wb,    wc_br,    wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wtr,    wtr,   wtr,   wtr,   wtr,   wtr,   wtr,   wtr,    wtr,    wtr,    wtr,    wtr ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addStaticItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "left",     targetStage: 'center' };
    
    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_01,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_01,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_01,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem__bottom( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(player1StartX, player1StartY, player2StartX, player2StartY) {
    this.setPlayer1StartX(player1StartX);
    this.setPlayer1StartY(player1StartY);
    this.setPlayer2StartX(player2StartX);
    this.setPlayer2StartY(player2StartY);
    this.scenarioDesign();
    this.scenarioDesignLayer__bottom();
  }

} // class

module.exports = Prototype_Stage_Right;
