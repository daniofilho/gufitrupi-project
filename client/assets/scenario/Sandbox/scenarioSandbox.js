/*
  Sandbox Scenario
*/
const _Scenario = require('../../../engine/assets/_Scenario');

const Stage_Center = require('./stages/stage_center');
const Stage_Life = require('./stages/stage_life');
const Stage_Enemy = require('./stages/stage_enemy');
const Stage_Doors = require('./stages/stage_doors');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, saveData){
    super(ctx, canvas, "sandbox");
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

    // Set Actual Stage ID
    this.setActualStageId( stage_id );
    
    let _stage = null;

    // Check which stage will load
    switch(stage_id) {
      default:
      case 'center':
        _stage = new Stage_Center();
        break;
      case 'life':
        _stage = new Stage_Life();
        break;
      case 'enemy':
        _stage = new Stage_Enemy();
        break;
      case 'doors':
        _stage = new Stage_Doors();
        break;
    }

    // Load the stage defined
    this.loadStage(_stage, firstStage);
  }
 
  // Set Default Stage
  run() {
    this.setStage( this.stageToLoad, true );    
  }

}//class
module.exports = scenarioSandbox;