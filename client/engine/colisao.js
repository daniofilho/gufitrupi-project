	// Classe que detecta colisões
	
	function Colisao(cenarioWidth, cenarioHeight, player) {
			
		//Declarações iniciais
		
			this.colItens = new Array(); //Vetor de itens para verificar colisão
			this.cenarioWidth = cenarioWidth;
			this.cenarioHeight = cenarioHeight;
			
			this.player = player;
			
		//Função que verifica se há a colisão do objeto passado com algum objeto do vetor
			
			this.verifica = function(objeto) {

					// !!! Algoritmo de detecção de colisão chamado “Bounding Box 2D”  - 
					// !!! (A.x + A.Largura) > B.x E A.x < (B.x + B.Largura) E (A.y + A.Altura) > B.y E A.y < (B.y + B.Altura)
				

				//if ( !this.foraCenario(objeto) ) { //Se não estiver fora do cenário
				
					// caracteiristicas do objeto passado
						var aLarg = objeto.getX() + objeto.getWidth();
						var aAlt = objeto.getY() + objeto.getHeight();
						var aX = objeto.getX();
						var aY = objeto.getY()
						
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
									
								return this.colItens[i].colisao(objeto);
								
							} else {
								objeto.noColisao();
							}
													
						}
						
				//} else {
				//	return true;
				//}//if foraCenario
	
			};
			
			this.foraCenario = function(objeto) {
				
				var aLarg = objeto.getX() + objeto.getWidth();
				var aAlt = objeto.getY() + objeto.getHeight();
				
				if ( objeto.getX() < 0 || aLarg >= this.cenarioWidth || objeto.getY() < 0 || aAlt >= this.cenarioHeight ) {
				
					return true;
				
				}
				
			}
			
			this.verificaColisaoComPlayer = function(B) { 
				
				//player é uma variável global definida no main.js
					
				// caracteiristicas do objeto passado
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
			
			this.addItem = function (objeto) {
				
				this.colItens.push(objeto);

			};
			
			this.addArrayItem = function(objeto){
				
				for (i in objeto){
					this.colItens.push(objeto[i]);
				}
				
			}


		
	}//var colisao
	
	