// Rendes class

	function Render(ctx, canvas, dificuldade, player) {
		
		// - - - Init - - -
			
			this.ctx = ctx; 
			this.scenario = "";
			this.canvas = canvas;
			this.player = player;
			this.renderItems = new Array(); 
			
		
        // - - - Functions - - -
        
            // Add items to the vector
			this.addItem = function(object){
				this.renderItems.push(object);
			}
			this.addArrayItem = function(object){
				for (i in object){
					this.renderItems.push(object[i]);
				}
			}
			this.setScenario = function(scenario){
				this.scenario = scenario;
			}
			
		
        // This functions will be called constantly to render items
			this.start = function (mod) {		
				
                // Clear canvas before render again
					this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
					this.ctx.shadowBlur = 0;

				// Scenario
					if ( this.scenario != "") 
				    	this.scenario.render(this.ctx);
						
                // Render items
					for (i in this.renderItems) {
                        // Execute the render function - Include this function on every class!
						this.renderItems[i].render(this.ctx, mod);
					}
				    
                // If it's the Shadow render - DEACTIVATED
                /*
					if ( this.dificuldade != "" ) {    
					    
					    //Caso seja o quadro de animação, cria o efeito de sombra e luz
							//Preenche tudo de preto
							this.ctx.globalAlpha = 0.98;
							this.ctx.fillStyle = "#000";
							this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
							this.ctx.globalAlpha = 1;
							
						//Cria o recorte do circulo que será visível
							//arc(x, y, radius, startAngle, endAngle, anticlockwise)
							
							this.ctx.save(); //Salva o estado atual

							this.ctx.beginPath();
							this.ctx.arc( this.player.getX() + (this.player.getWidth()/2), this.player.getY() + (this.player.getHeight()/2), this.dificuldade, 360, 0, true);
							
							this.ctx.clip(); //Recorta o elipse criado
							
							//limpa o canvas inteiro, mas como está recortado apenas o elipse, limpe só o elipse
							this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); 			      		
			      		
							this.ctx.restore();//Restaura o contexto
					    
				    }*/
				

		    };
	
	
	}//render