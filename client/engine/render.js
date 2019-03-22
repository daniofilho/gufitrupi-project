class Render {

	constructor(ctx, canvas, dificuldade, player) {
		this.ctx = ctx; 
		this.scenario = "";
		this.canvas = canvas;
		this.player = player;
		this.renderItems = new Array(); 
	}
		    
	// Add items to the vector
	addItem(object){
		this.renderItems.push(object);
	}
	addArrayItem(object){
		for (let i in object){
			this.renderItems.push(object[i]);
		}
	}
	setScenario(scenario){
		this.scenario = scenario;
	}
			
	// This functions will be called constantly to render items
	start(mod) {		
				
		// Clear canvas before render again
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.shadowBlur = 0;

		// Scenario
		if ( this.scenario != "") 
			this.scenario.render(this.ctx);
				
		// Render items
		for (let i in this.renderItems) {
			// Execute the render function - Include this function on every class!
			this.renderItems[i].render(this.ctx, mod);
		}

	}
	
}//class
module.exports = Render