/*
	Prototype Scenario
*/
const Prototype_Stage_1 = require('./stages/stage_1');

class scenarioPrototype {

	constructor(ctx, canvas, gameProps){
		this.ctx = ctx;
		this.canvas = canvas;
		
		this.renderItems = new Array();
		this.renderItemsAnimated = new Array();

		this.collisionItems = new Array();// Is it in use???
		
		this.width = canvas.width;
		this.height = canvas.height;

		this.chunkSize = gameProps.getProp('chunkSize');

		this.playerStartX = 0;
		this.playerStartY = 0;

		this.run();
	}

	// # Main Render
	render(){
		// ... 
	}	
			
	// # Add Items to the Render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderItemAnimated(item){
		this.renderItemsAnimated.push(item);
	}

	// # Gets
	getCtx() { return this.ctx; }
	getCanvas() { return this.canvas; }	
				
	getRenderItems() { return this.renderItems; }
	getRenderItemsAnimated() { return this.renderItemsAnimated; }
				
	getPlayerStartX() { return this.chunkSize * 4; } // Isso tem que vir do cenário!!!
	getPlayerStartY() { return this.chunkSize * 4; }
      
	// # Stages
	setStage(stage_number) {

		let stage_01 = new Prototype_Stage_1( this.chunkSize );
          
		switch(stage_number) {
			case 1:
				this.stage = stage_01;
				break;
		}
		this.loadStage();
	}
	
	// Functions to load selected stage
	loadStage() {
            
		// Clear previous render items
		this.renderItems = new Array();
		this.renderItemsAnimated = new Array();

		// Add the Static Items
		this.stage.getStaticItems().map( (item) => { 
			this.addRenderItem(item);
		});

		// Add the Animated Items
		this.stage.getAnimatedItems().map( (item) => { 
			this.addRenderItemAnimated(item);
		});
		
	}

	// # Run when class loads
	run() {
		
		// Set Default Stage
		this.setStage(1); 
				
	}

}//class

module.exports = scenarioPrototype;