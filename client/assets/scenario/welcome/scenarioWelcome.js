// Scenario Class

	//Name: Welcome
	
		function scenarioWelcome(ctx, canvas, player){

			// # Background Render
				
				this.player = player;
				
				this.backgroundRender = function () {
					this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
					this.ctx.fillStyle = this.background;
					this.ctx.fill();	
				}
				
			
			// # Main Render
				
				this.render = function(){
					this.backgroundRender();
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
				
			
			// - - - Init - - - //
			
				this.ctx = ctx;
				this.canvas = canvas;
			    this.renderItems = new Array();
			    this.renderItemsAnimated = new Array();

			    this.collisionItems = new Array();
	
				// # Textures
	
					this.bgImage = new Image();
					this.bgImage.src = './assets/scenario/welcome/img/background.jpg';
					
					this.background = this.ctx.createPattern(this.bgImage, 'repeat');
					

				// # Obstacles
					
					// Scenario Borders
					this.addRenderItem( new Wall(ctx, "wallTop", 0, 0, this.canvas.width, 20) ); //context, name, x0, y0, w, h,
					this.addRenderItem( new Wall(ctx, "wallBottom", 0, this.canvas.height - 20, this.canvas.width, 20) );
					this.addRenderItem( new Wall(ctx, "wallLeft", 0, 0, 20, this.canvas.height) );
					this.addRenderItem( new Wall(ctx, "wallRight", this.canvas.width-20, 0, 20, this.canvas.height) );
						
					// Walls
					this.addRenderItem( new Wall(ctx, "wall01", 20, 73, 405, 40) );
					this.addRenderItem( new Wall(ctx, "wall02", 90, 190, 80, 80) );
					this.addRenderItem( new Wall(ctx, "wall03", 503, 19, 40, 465) );
					this.addRenderItem( new Wall(ctx, "wall04", 283, 481, 440, 40) );
					this.addRenderItem( new Wall(ctx, "wall05", 244, 292, 40, 229) );
					this.addRenderItem( new Wall(ctx, "wall06", 283, 367, 139, 40) );
					this.addRenderItem( new Wall(ctx, "wall07", 78, 403, 169, 40) );
					this.addRenderItem( new Wall(ctx, "wall08", 536, 189, 79, 40) );
					this.addRenderItem( new Wall(ctx, "wall09", 669, 77, 40, 288) );
					this.addRenderItem( new Wall(ctx, "wall10", 669, 365, 112, 40) );	
					this.addRenderItem( new Wall(ctx, "wall11", 604, 77, 67, 40) );	
					this.addRenderItem( new Wall(ctx, "wall11", 318, 172, 93, 95) );
					this.addRenderItem( new Wall(ctx, "wall11", 82, 510, 75, 74) );	
					
					// Scenario random obstacles
					
						//Power
							
							// Possibles x, y, w, h for Power
								
							var aPower = Array();
									aPower.push( { x: 137, y: 20, w: 167, h: 53 });
									aPower.push( { x: 422, y: 368, w: 80, h: 38 }); 
									aPower.push( { x: 543, y: 406, w: 236, h: 75 }); 
									
							var rPower = Math.floor(Math.random() * 3) + 0;		
							
							this.addRenderItem( new Power(ctx, "power01", aPower[rPower].x, aPower[rPower].y, aPower[rPower].w, aPower[rPower].h) );	
						
					// Water
					this.addRenderItem( new Water(ctx, "power01", 300, 521, 190, 59) );

					// Exit
					this.addRenderItemAnimated( new Exit(ctx, "exit", 50, 30, 10, 10) );
					
					// Enemies
						//ctx, colisao, name, x0, y0, tipoMov, minX, maxX, minY, maxY, speed 					
					this.addRenderItemAnimated( new Enemy(ctx, this.player, "enemy01", 150, 340, 'hor', 25, 230, 0, 0, 0.05) ); 			
			
				
		   
		   
			
		}//class
		
		
		