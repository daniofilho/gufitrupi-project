/*
  Sandbox Scenario
*/
const _Scenario = require('../common/_Scenario');

const Stage_Center = require('./stages/stage_center');
const Stage_Life = require('./stages/stage_life');
const Stage_Enemy = require('./stages/stage_enemy');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, gameProps, saveData){
    super(ctx, canvas, gameProps, "sandbox");
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;
    
    this.run();
  }

  // # Stages
  setStage(stage_id, firstStage) {
    
    // Save items state before clear
    if( !firstStage ) {
      this.saveItemsState();
    }

    this.clearArrayItems();
    
    let _stage = null;

    // Check which stage will load
    switch(stage_id) {
      default:
      case 'center':
        _stage = new Stage_Center( this.chunkSize );
        break;
      case 'life':
        _stage = new Stage_Life( this.chunkSize );
        break;
      case 'enemy':
        _stage = new Stage_Enemy( this.chunkSize );
        break;
    }

    // Load the stage defined
    this.loadStage(_stage, firstStage);
  }
 
  // Set Default Stage
  run() {
    this.setStage( this.stageToLoad, true);    
  }

}//class
module.exports = scenarioSandbox;