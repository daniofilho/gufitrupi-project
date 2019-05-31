/*
  Sandbox Scenario
*/
const _Scenario = require('../../../engine/assets/_Scenario');
const _Stage = require('../../../engine/assets/_Stage');

const jsonScenarioTileSet = require('./sandbox-tileset.json');

const jsonStageCenter = require('./stages/center.json');
const jsonStageCenterAssets = require('./stages/center-assets.json');

const jsonStageLife = require('./stages/life.json');
const jsonStageLifeAssets = require('./stages/life-assets.json');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, saveData){
    let soundSrc = "./sounds/sandbox-background.mp3";
    super(ctx, canvas, "sandbox", soundSrc);
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
        _stage = new _Stage( stage_id, jsonStageCenter, jsonStageCenterAssets, jsonScenarioTileSet );
        break;
      case 'life':
        _stage = new _Stage( stage_id, jsonStageLife, jsonStageLifeAssets, jsonScenarioTileSet );
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