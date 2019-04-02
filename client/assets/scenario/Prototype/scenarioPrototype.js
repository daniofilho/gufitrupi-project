/*
    Prototype Scenario
*/
const _Scenario = require('../common/_Scenario');

const Prototype_Stage_1 = require('./stages/stage_1');
const Prototype_Stage_2 = require('./stages/stage_2');
const Prototype_Stage_3 = require('./stages/stage_3');
const Prototype_Stage_4 = require('./stages/stage_4');
const Prototype_Stage_5 = require('./stages/stage_5');

class scenarioPrototype extends _Scenario {

  constructor(ctx, canvas, gameProps){
    super(ctx, canvas, gameProps);
    this.scenario_id = "prototype";
    this.run();
  }

  // # Stages
  setStage(stage_number, firstStage) {

    this.clearArrayItems();
    
    let stage_01 = new Prototype_Stage_1( this.chunkSize );
    let stage_02 = new Prototype_Stage_2( this.chunkSize );
    let stage_03 = new Prototype_Stage_3( this.chunkSize );
    let stage_04 = new Prototype_Stage_4( this.chunkSize );
    let stage_05 = new Prototype_Stage_5( this.chunkSize );
          
    switch(stage_number) {
      case 1:
        this.stage = stage_01;
        break;
      case 2:
        this.stage = stage_02;
        break;
      case 3:
        this.stage = stage_03;
        break;
      case 4:
        this.stage = stage_04;
        break;
      case 5:
        this.stage = stage_05;
        break;
      }
      this.loadStage(firstStage);
    }
    
  // Functions to load selected stage
  loadStage(firstStage) {
            
    // Clear previous render items
    this.renderItems = new Array();
    this.renderItemsAnimated = new Array();

    // Add the Static Items
    this.stage.getStaticItems().map( (item) => { 
      item.scenario = this; // Pass this scenario class as an argument, so other functions can refer to this
      this.addStaticItem(item);
    });

    // Add the Animated Items - Bottom
    this.stage.getLayerItems__bottom().map( (item) => { 
      item.scenario = this;
      this.addRenderLayerItem__bottom(item);
    });
    
    this.stage.getLayerItems__top().map( (item) => { 
      item.scenario = this;
      this.addRenderLayerItem__top(item);
    });
    
    // Only set player start at first load
    if(firstStage) {
      this.setPlayer1StartX( this.stage.getPlayer1StartX() );
      this.setPlayer1StartY( this.stage.getPlayer1StartY() );
      this.setPlayer2StartX( this.stage.getPlayer2StartX() );
      this.setPlayer2StartY( this.stage.getPlayer2StartY() );
    }
    
  }

  // Set Default Stage
  run() {
    this.setStage(1, true);    
	}

}//class
module.exports = scenarioPrototype;