// Stage 01
const _Stage = require('../../../../engine/assets/_Stage');

const Beach_Wall = require('../../common/Beach_Wall');
const Beach_Floor = require('../../common/Beach_Floor');
const Teleport = require('../../common/Teleport');
const Fire = require('../../common/Fire');

class Prototype_Stage_Center extends _Stage{

  constructor() {
    super("center");

    let player1StartX = window.game.getChunkSize() * 7;
    let player1StartY = window.game.getChunkSize() * 6;
    
    let player2StartX = window.game.getChunkSize() * 8;
    let player2StartY = window.game.getChunkSize() * 6;

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
      case "fire":
        return new Fire(item.type, x, y);
        break;
    }
  }
        
  // # Scenario Design (Static)
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

    let iwc_tl = { name: "wall", type: "inner_corner_top_left"};
    let iwc_tr = { name: "wall", type: "inner_corner_top_right"};
    let iwc_bl = { name: "wall", type: "inner_corner_bottom_left"};
    let iwc_br = { name: "wall", type: "inner_corner_bottom_right"};
    
    let wtr = { name: "wall", type: "water"};
    let ob = { name: "wall", type: "obstacle"};
        
    // Floor
    let f1 = { name: "floor", type: "01"};
    let f2 = { name: "floor", type: "02"};  

    // Make shure to design basead on gameProperties !
    let scenarioDesign = [
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f2,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   ob,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wt,     wt,     wt,     wt,     iwc_br,     f1,   f1,   ob,   f1,   f1,   f1,   iwc_bl,   wt,     wt,     wt,     wt ],
      [ f1,     f1,     f1,     f1,     f1,         f1,   f2,   f1,   f1,   f1,   f1,   f1,       f1,     f1,     f1,     f1 ],
      [ ob,     ob,     ob,     ob,     ob,         ob,   f1,   f1,   f1,   f1,   f1,   f1,       f1,     f1,     f1,     f1 ],
      [ f1,     f1,     f1,     f1,     f1,         f1,   f1,   f1,   f1,   f1,   ob,   ob,       ob,     ob,     ob,     ob ],
      [ f1,     f2,     f1,     f1,     f1,         f1,   f1,   f1,   f1,   f1,   f1,   f2,       f1,     f1,     f1,     f1 ],
      [ wb,     wb,     wb,     wb,     iwc_tr,     f1,   f2,   f1,   f1,   f1,   f1,   iwc_tl,   wb,     wb,     wb,     wb ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ],
      [ wtr,    wtr,    wtr,    wtr,    wl,         f1,   f1,   f1,   f1,   f1,   f1,   wr,       wtr,    wtr,    wtr,    wtr ]
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

  // # Scenario Layer - Bottom
  scenarioDesignLayer__bottom() {

    // Teleport
    let tp_02 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "top",        targetStage: 'up' };
    let tp_03 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "right",      targetStage: 'right' };
    let tp_04 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "bottom",     targetStage: 'bottom' };
    let tp_05 = { name: "teleport", type: "", teleportType: "relative", cameFrom: "left",       targetStage: 'left' };
    
    let fire = { name: "fire", type: "01"}; 

    let tbl = { name: "wall", type: "tree_bottom_left" };  
    let tbr = { name: "wall", type: "tree_bottom_right" }; 

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   tp_02,   tp_02,   false,   tp_02,   tp_02,   tp_02,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_05,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_03 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_03 ],
      [ tp_05,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ tp_05,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   tp_03 ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   tbl,     tbr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   fire,    false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   tp_04,   tp_04,   tp_04,   tp_04,   tp_04,   tp_04,   false,   false,   false,   false,   false ],
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

  scenarioDesignLayer__top() {

    let ttl = { name: "wall", type: "tree_top_left" };  
    let ttr = { name: "wall", type: "tree_top_right" };  
    let tml = { name: "wall", type: "tree_middle_left" };  
    let tmr = { name: "wall", type: "tree_middle_right" };  

    let scenarioDesign = [
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   ttl,     ttr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   tml,     tmr,     false,   false,   false,   false,   false,   false ],
      [ false,   false,  false,   false,   false,   false,   false,   false,   false,   false,     false,   false,   false,   false,   false,   false ],
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
      this.addRenderLayerItem__top( this.getScenarioAssetItem(item, x0, y0, xIndex, yIndex) );
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
    this.scenarioDesignLayer__top();
  }

} // class
module.exports = Prototype_Stage_Center;