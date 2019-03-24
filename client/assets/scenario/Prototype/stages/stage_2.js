// Stage 02
const _Stage = require('../../common/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');

class Prototype_Stage_2 extends _Stage{

  constructor(chunkSize) {
    super(chunkSize);

    let playerStartX = chunkSize * 3;
    let playerStartY = chunkSize * 4;

    this.run(playerStartX, playerStartY);
  }
  
  // # Scenario 
  getScenarioAssetItem(item, x, y, xIndex, yIndex){
    switch(item.name) {
      case "wall":
        return new Beach_Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Beach_Floor(item.type, x, y, this.chunkSize);
        break;
      case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, this.chunkSize, item );
        break;
    }
  }
        
  // # Scenario Desgin (Static)
  scenarioDesign() {

    // Walls
    let wt = { name: "wall", type: "top"};
    let wl = { name: "wall", type: "left"};
    let wr = { name: "wall", type: "right"};
    let wb = { name: "wall", type: "bottom"};
    
    let wc_tl = { name: "wall", type: "corner_top_left"};
    let wc_tr = { name: "wall", type: "corner_top_right"};
    let wc_bl = { name: "wall", type: "corner_bottom_left"};
    let wc_br = { name: "wall", type: "corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wc_tl,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wt,   wc_tr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   f2,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   ob,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f2,   f2,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f2,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ],
      [ wl,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr ]
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderItem(this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex));
      });
    });
  }

  // # Scenario Animated items
  scenarioDesignLayer() {

    // Teleport
    let tp_01 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "bottom",     targetStage: 1 };
    
    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   tp_01,  tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   tp_01,   false ],
    ]

    // # Proccess scenario design
    scenarioDesign.map( (array, yIndex) => {
      array.map( (item, xIndex) => {
      if( !item ) return; // Jump false elements
      let x0 = xIndex * this.chunkSize;
      let y0 = yIndex * this.chunkSize;
      this.addRenderLayerItem( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
      });
    });
  
  }

  run(setPlayerStartX, setPlayerStartY) {
    this.setPlayerStartX(setPlayerStartX);
    this.setPlayerStartY(setPlayerStartY);
    this.scenarioDesign();
    this.scenarioDesignLayer();
  }

} // class

module.exports = Prototype_Stage_2
