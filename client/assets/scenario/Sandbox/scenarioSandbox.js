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

const jsonStageDoors = require('./stages/doors.json');
const jsonStageDoorsAssets = require('./stages/doors-assets.json');

const jsonStageEnemy = require('./stages/enemy.json');
const jsonStageEnemyssets = require('./stages/enemy-assets.json');

class scenarioSandbox extends _Scenario {

  constructor(ctx, canvas, saveData){
    let soundSrc = "./sounds/sandbox-background.mp3";
    super(ctx, canvas, "sandbox", soundSrc);
    this.defaultStageId = "center";
    
    // Define which stage will load on first run
    this.stageToLoad = ( saveData ) ? saveData.scenario.stageId : this.defaultStageId;

    if( !saveData ) {
      let dialog = [
        {
					"hideSprite": false,
					"text": "Welcome to Gufitrupi! This is a sandbox Scenario where you can test all the features of this game. [PRESS SPACE TO CONTINUE]"
				},
        {
					"hideSprite": false,
					"text": "Press the GRAB/DROP button to pick up an object. With the object on your hands, press the USE button again to drop it or press the USE/THROW button to throw it."
				},
        {
					"hideSprite": false,
					"text": "You can also press the USE button in front of a board to read it."
				},
        { "hideSprite": true, "text": "" },
      ];
      window.game.setDialog(dialog); 
    }

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
      case 'doors':
        _stage = new _Stage( stage_id, jsonStageDoors, jsonStageDoorsAssets, jsonScenarioTileSet );
        break;
      case 'enemy':
        _stage = new _Stage( stage_id, jsonStageEnemy, jsonStageEnemyssets, jsonScenarioTileSet );
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