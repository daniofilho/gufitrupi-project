/*
	Prototype Scenario
*/
const _Scenario = require('../common/_Scenario');

const Prototype_Stage_1 = require('./stages/stage_1');
const Prototype_Stage_2 = require('./stages/stage_2');

class scenarioPrototype extends _Scenario {

	constructor(ctx, canvas, gameProps){
		super(ctx, canvas, gameProps);
		this.run();
	}

	// # Stages
	setStage(stage_number) {

		let stage_01 = new Prototype_Stage_1( this.chunkSize );
		let stage_02 = new Prototype_Stage_2( this.chunkSize );
          
		switch(stage_number) {
			case 1:
				this.stage = stage_01;
				break;
			case 2:
				this.stage = stage_02;
				break;
		}
		console.log("setStage: ", stage_number);
		this.loadStage();
	}
	
	// Functions to load selected stage
	loadStage() {
            
		// Clear previous render items
		this.renderItems = new Array();
		this.renderItemsAnimated = new Array();

		// Add the Static Items
		this.stage.getStaticItems().map( (item) => { 
			item.scenario = this; // Pass this scenario class as an argument, so other functions can refer to this
			this.addRenderItem(item);
		});

		// Add the Animated Items
		this.stage.getLayerItems().map( (item) => { 
			item.scenario = this;
			this.addRenderLayerItem(item);
		});
    
    this.setPlayerStartX( this.stage.getPlayerStartX() );
    this.setPlayerStartY( this.stage.getPlayerStartY() );

		console.log("Stage loaded!");
	}

	// # Run when class loads
	run() {
		
		// Set Default Stage
		this.setStage(1); 
				
	}

}//class

module.exports = scenarioPrototype;