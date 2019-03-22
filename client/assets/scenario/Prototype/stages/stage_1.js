// Stage 01
class Prototype_Stage_1 {

  constructor(chunkSize) {
    this.renderItems = new Array();
    this.renderItemsAnimated = new Array();
    this.chunkSize = chunkSize;
    this.run();
  }
  
  // # Gets
  getStaticItems() {  return this.renderItems; }
  getAnimatedItems() {  return this.renderItemsAnimated; }
        
  // # Add Items to the render
	addRenderItem(item){
		this.renderItems.push(item);
	}
	addRenderItemAnimated(item){
		this.renderItemsAnimated.push(item);
  }
        
  // # Scenario 
  getScenarioAssetItem(item, x, y){
    switch(item.name) {
      case "wall":
        return new Wall(item.type, x, y, this.chunkSize);
        break;
      case "floor":
        return new Floor(item.type, x, y, this.chunkSize);
        break;
    }
  }
        
  // # Scenario Desgin (Static)
    scenarioDesign() {

      // Walls
      let wt = { name: "wall", type: "top"};
      let wl = { name: "wall", type: "left"};
      let wr = { name: "wall", type: "right"};
      let wb = { name: "wall", type: "bottom"};
      
      let wc_tl = { name: "wall", type: "corner_top_left"};
      let wc_tr = { name: "wall", type: "corner_top_right"};
      let wc_bl = { name: "wall", type: "corner_bottom_left"};
      let wc_br = { name: "wall", type: "corner_bottom_right"};
      
      let wtr = { name: "wall", type: "water"};
      let ob = { name: "wall", type: "obstacle"};
          
      // Floor
      let f1 = { name: "floor", type: "01"};
      let f2 = { name: "floor", type: "02"};
        
      // Make shure to design basead on gameProperties !
      let scenarioDesign = [
        [ wtr, wtr,   wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,  wtr,    wtr ],
        [ wtr, wc_tl, wt,   wt,   wt,   wt,   wt,   wt,   wt,   wc_tr,  wtr ],
        [ wtr, wl,    f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   f1,   f1,   f1,   f1,   f2,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   ob,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   f2,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   f1,   f1,   f2,   f1,   f1,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   f2,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   f1,   f1,   ob,   f1,   f2,   f1,   wr,     wtr ],
        [ wtr, wl,    f1,   f1,   f1,   f1,   f1,   f1,   f1,   wr,     wtr ],
        [ wtr, wc_bl, wb,   wb,   wb,   wb,   wb,   wb,   wb,   wc_br,  wtr ],
      ];

      // # Proccess scenario design
      scenarioDesign.map( (array, x) => {
        array.map( (item, y) => {
        let x0 = y * this.chunkSize;
        let y0 = x * this.chunkSize;
        this.addRenderItem(this.getScenarioAssetItem(item, x0, y0));
        });
      });
    }

  // # Scenario Animated items
    // TO DO

  run () {
    this.scenarioDesign();
  }

} // class





/*
    // # Textures
	
					this.bgImage = new Image();
					this.bgImage.src = './assets/scenario/welcome/img/background.jpg';
					
					this.background = this.ctx.createPattern(this.bgImage, 'repeat');
                    this.background = "#333";
                    
    // # Obstacles
					
					// Scenario Borders
					this.addRenderItem( new Wall(ctx, "wallTop", 0, 0, this.width, this.chunkSize) ); //context, name, x0, y0, w, h,
					this.addRenderItem( new Wall(ctx, "wallBottom", 0, this.height - this.chunkSize, this.width, this.chunkSize) );
					this.addRenderItem( new Wall(ctx, "wallLeft", 0, 0, this.chunkSize, this.height) );
					this.addRenderItem( new Wall(ctx, "wallRight", this.width-this.chunkSize, 0, this.chunkSize, this.height) );
						
					// Walls
					/*
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
					*/
					
					// Scenario random obstacles
					
						//Power
							
							// Possibles x, y, w, h for Power
								/*
							var aPower = Array();
									aPower.push( { x: 137, y: 20, w: 167, h: 53 });
									aPower.push( { x: 422, y: 368, w: 80, h: 38 }); 
									aPower.push( { x: 543, y: 406, w: 236, h: 75 }); 
									
							var rPower = Math.floor(Math.random() * 3) + 0;		
							
							this.addRenderItem( new Power(ctx, "power01", aPower[rPower].x, aPower[rPower].y, aPower[rPower].w, aPower[rPower].h) );	
					
					// Water
					//this.addRenderItem( new Water(ctx, "power01", 300, 521, 190, 59) );

					// Exit
					//this.addRenderItemAnimated( new Exit(ctx, "exit", 50, 30, 10, 10) );
					
					// Enemies
						//ctx, colisao, name, x0, y0, tipoMov, minX, maxX, minY, maxY, speed 					
					//this.addRenderItemAnimated( new Enemy(ctx, this.player, "enemy01", 150, 340, 'hor', 25, 230, 0, 0, 0.05) ); 			
			
				
		   
*/