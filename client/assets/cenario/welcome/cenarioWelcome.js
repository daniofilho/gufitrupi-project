//Classe do Cenário

	//Nome: Welcome
	
		function cenarioWelcome(ctx, canvas, player){

			//Funções de Render
				
				this.player = player;
				
				this.renderFundo = function () {
					
					this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
					this.ctx.fillStyle = this.fundo;
					this.ctx.fill();	
				  
				}
				

			
			
			//Render Princia
			this.render = function(){
				
				this.renderFundo();
				
				
			}	
			
			//Adiciona itens para renderização.
			this.addRenderItem = function(item){
				this.renderItens.push(item);
			}
			
			this.addRenderItemAnimado = function(item){
				this.renderItensAnimados.push(item);
			}

			//Gets
			
				this.getCtx = function() { return this.ctx; }
				this.getCanvas = function() { return this.canvas; }	
				
				this.getRenderItens = function() { return this.renderItens; }
				this.getRenderItensAnimados = function() { return this.renderItensAnimados; }
				
			
			// ------- INIT ------- //
			
				this.ctx = ctx;
				this.canvas = canvas;
			    this.renderItens = new Array();
			    this.renderItensAnimados = new Array();

			    this.colisaoItens = new Array();
	
				//Declaraçõa das texturas
	
					this.imgFundo = new Image();
					this.imgFundo.src = './assets/cenario/welcome/img/fundo.jpg';
					
					this.fundo = this.ctx.createPattern(this.imgFundo, 'repeat');
					
					
					
	
	
				//Obstaculos
					
					//Bordas do Cenário
					this.addRenderItem( new Parede(ctx, "wallTop", 0, 0, this.canvas.width, 20) ); //contexto, x0, y0, w, h, nome
					this.addRenderItem( new Parede(ctx, "wallBottom", 0, this.canvas.height - 20, this.canvas.width, 20) );
					this.addRenderItem( new Parede(ctx, "wallLeft", 0, 0, 20, this.canvas.height) );
					this.addRenderItem( new Parede(ctx, "wallRight", this.canvas.width-20, 0, 20, this.canvas.height) );
						
					//Paredes no meio do cenário
					this.addRenderItem( new Parede(ctx, "wall01", 20, 73, 405, 40) );
					this.addRenderItem( new Parede(ctx, "wall02", 90, 190, 80, 80) );
					this.addRenderItem( new Parede(ctx, "wall03", 503, 19, 40, 465) );
					this.addRenderItem( new Parede(ctx, "wall04", 283, 481, 440, 40) );
					this.addRenderItem( new Parede(ctx, "wall05", 244, 292, 40, 229) );
					this.addRenderItem( new Parede(ctx, "wall06", 283, 367, 139, 40) );
					this.addRenderItem( new Parede(ctx, "wall07", 78, 403, 169, 40) );
					this.addRenderItem( new Parede(ctx, "wall08", 536, 189, 79, 40) );
					this.addRenderItem( new Parede(ctx, "wall09", 669, 77, 40, 288) );
					this.addRenderItem( new Parede(ctx, "wall10", 669, 365, 112, 40) );	
					this.addRenderItem( new Parede(ctx, "wall11", 604, 77, 67, 40) );	
					this.addRenderItem( new Parede(ctx, "wall11", 318, 172, 93, 95) );
					this.addRenderItem( new Parede(ctx, "wall11", 82, 510, 75, 74) );	
					
					//Aqui inicia a renderização randômica do cenário
					
						//Power
							//Possíveis x, y, w, h para o Power
								
								var aPower = Array();
										aPower.push( { x: 137, y: 20, w: 167, h: 53 });
										aPower.push( { x: 422, y: 368, w: 80, h: 38 }); 
										aPower.push( { x: 543, y: 406, w: 236, h: 75 }); 
										
								var rPower = Math.floor(Math.random() * 3) + 0 //Número entre 0 e 3 (3 é excluido) - Tamanho do array acima			
								
								this.addRenderItem( new Power(ctx, "power01", aPower[rPower].x, aPower[rPower].y, aPower[rPower].w, aPower[rPower].h) );	
						
						//!!!!! Terminar de gerar os aleatórios dos demais obstáculos !!!!!
						//Descobrir também como se criar o círculo ao redor do personagem
						
					//Agua
					this.addRenderItem( new Agua(ctx, "power01", 300, 521, 190, 59) );

					//Saída
					this.addRenderItemAnimado( new Saida(ctx, "saida", 50, 30, 10, 10) );
					
					//Inimigos
						//ctx, colisao, name, x0, y0, tipoMov, minX, maxX, minY, maxY, speed 					
					this.addRenderItemAnimado( new Inimigo(ctx, this.player, "inimigo01", 150, 340, 'hor', 25, 230, 0, 0, 0.05) ); 			
			
			
			// ------- INIT ------- //	
		   
		   
			
		}//cenarioWelcome
		
		
		