// Scenario Class

	//Name: Welcome
	
		function scenario_Prototype(ctx, canvas, gameProps){

      // - - - Init - - - //
			
				this.ctx = ctx;
				this.canvas = canvas;
        
        this.renderItems = new Array();
        this.renderItemsAnimated = new Array();

        this.collisionItems = new Array();// Is it in use???
        
        this.width = canvas.width;
        this.height = canvas.height;

        this.chunkSize = gameProps.getProp('chunkSize');

			// # Background Render
				
				this.backgroundRender = function () {
					this.ctx.rect(0, 0, this.width, this.height);
					this.ctx.fillStyle = this.background;
					this.ctx.fill();	
				}
				
			// # Main Render
				
				this.render = function(){
					//this.backgroundRender();
				}	
			
			// # Add the Items on Render

				this.addRenderItem = function(item){
          this.renderItems.push(item);
				}
				
				this.addRenderItemAnimated = function(item){
					this.renderItemsAnimated.push(item);
				}

			// # Gets
			
				this.getCtx = function() { return this.ctx; }
				this.getCanvas = function() { return this.canvas; }	
				
				this.getRenderItems = function() { return this.renderItems; }
				this.getRenderItemsAnimated = function() { return this.renderItemsAnimated; }
				
				this.getPlayerStartX = function() {
					return this.width / 2;
				}
				this.getPlayerStartY = function() {
					return this.height / 2;
        }
      
      // # Stages
				let stage_1 = new Prototype_Stage_1( this.chunkSize );

				this.stage  = stage_1; // Load default stage

				this.setStage = function(stage_number) {
          
          switch(stage_number) {
						case 1:
              this.stage = stage_1;
							break;
					}
          this.loadStage();
        }
          
          // Functions to load selected stage
					this.loadStage = function() {
            
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
			
			// # Start
        this.setStage(1); // Set Default Stage

		}//class
		
		
		