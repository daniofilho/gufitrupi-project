// Class that detects collision between player and other objects


	// AINDA PRECISO REVISAR ESTA CLASSE E RELEMBRAR MELHOR COMO FUNCIONA
	
	function Collision(scenarioWidth, scenarioHeight, player) {
			
		// # Init
		
			this.colItens = new Array(); // Items to check for collision
			this.scenarioWidth = scenarioWidth;
			this.scenarioHeight = scenarioHeight;
			
			this.player = player;
			
		// # Check if the object collides with any object in vector
			
			this.check = function(object) {

					// !!! Algoritmo de detecção de colisão chamado “Bounding Box 2D”  - 
					// !!! (A.x + A.Largura) > B.x E A.x < (B.x + B.Largura) E (A.y + A.Altura) > B.y E A.y < (B.y + B.Altura)
				

				//if ( !this.foraCenario(object) ) { //Se não estiver fora do cenário
				
					// caracteiristicas do object passado
						var aLarg = object.getX() + object.getWidth();
						var aAlt = object.getY() + object.getHeight();
						var aX = object.getX();
						var aY = object.getY()
						
					//Percorre o vetor
						for (i in this.colItens) {
							
							// caracteiristicas do obstáculo atual
							var bLarg = this.colItens[i].getX() + this.colItens[i].getWidth();
							var bAlt = this.colItens[i].getY() + this.colItens[i].getHeight();
							var bX = this.colItens[i].getX();
							var bY = this.colItens[i].getY();
							
							//console.clear();
							//console.log("atual "  + this.colItens[i].name );

							if ( aLarg > bX && aX < bLarg && aAlt > bY && aY < bAlt ) {
								
								//DEBUG
									/*
									console.log("--------");
									console.log('colidiu com:');
									console.debug(this.colItens[i].name);
									console.log("--");
									console.log("A.larg: " + aLarg + " / B.larg: " + bLarg);
									console.log("A.alt: " + aAlt + " / B.alt: " + bAlt);
									console.log("A.x: " + aX + " / B.x: " + bX );
									console.log("A.y: " + aY + " / B.y: " + bY );
									console.log("--");
									
									if ( aLarg > bX ) {
										console.log('caso01 - true');
									} else {
										console.log('caso01 - false');
									}
									
									if ( aX < bLarg ) {
										console.log('caso02 - true');
									} else {
										console.log('caso02 - false');
									}
									
									if ( aAlt > bY ) {
										console.log('caso03 - true');
									} else {
										console.log('caso03 - false');
									}
									
									if ( aY < bAlt ) {
										console.log('caso04 - true');
									} else {
										console.log('caso04 - false');
									}
									
									console.log("--------");
									*/
									
								return this.colItens[i].collision(object);
								
							} else {
								object.noCollision();
							}
													
						}
						
				//} else {
				//	return true;
				//}//if foraCenario
	
			};
			
			this.foraCenario = function(object) {
				
				var aLarg = object.getX() + object.getWidth();
				var aAlt = object.getY() + object.getHeight();
				
				if ( object.getX() < 0 || aLarg >= this.scenarioWidth || object.getY() < 0 || aAlt >= this.scenarioHeight ) {
				
					return true;
				
				}
				
			}
			
			this.checkPlayerCollision = function(B) { 
				
				//player é uma variável global definida no main.js
					
				// caracteiristicas do object passado
					var aLarg = this.player.getX() + this.player.getWidth();
					var aAlt = this.player.getY() + this.player.getHeight();
					var aX = this.player.getX();
					var aY = this.player.getY()

				// caracteiristicas do obstáculo atual
					var bLarg = B.x + B.width;
					var bAlt = B.y + B.height;
					var bX = B.x;
					var bY = B.y;
						
					if ( aLarg > bX && aX < bLarg && aAlt > bY && aY < bAlt ) {
					 	return true;
					}
			};
			
			
				
		//Adiciona itens para verificar colisão	
			
			this.addItem = function (object) {
				
				this.colItens.push(object);

			};
			
			this.addArrayItem = function(object){
				
				for (i in object){
					this.colItens.push(object[i]);
				}
				
			}


		
	}//var colisao
	
	