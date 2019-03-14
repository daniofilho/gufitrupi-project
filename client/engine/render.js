//Clase de Renderização

	function Render(ctx, canvas, dificuldade, player) {
		
		//Declarações iniciais
			
			this.ctx = ctx; //Contexto do Canvas
			this.cenario = "";
			this.canvas = canvas;
			this.player = player;
			this.renderItens = new Array(); //Vetor de itens para renderização
			this.dificuldade = "";

		
		
		//Adiciona um item no vetor de itens para renderização
			this.addItem = function(objeto){
				this.renderItens.push(objeto);
			}
			
			this.addArrayItem = function(objeto){
				
				for (i in objeto){
					this.renderItens.push(objeto[i]);
				}
				
			}
			
			this.setCenario = function(cenario){
				this.cenario = cenario;
			}
			
			this.setDificuldade = function(dificuldade){
				
				switch (dificuldade) {
				
					case "easy":
						this.dificuldade = 150;
						break;
						
					case "normal":
						this.dificuldade = 100;
						break;
					
					case "hard":
						this.dificuldade = 50;
						break;
					
					default:
						this.dificuldade = "";
						break;
				
				}
				
		
			}
		
		//Função que será chamada constamente para renderizar tudo
			this.start = function (mod) {		
				
				//Limpa o canvas antes de renderizar novamente
					this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
					
					this.ctx.shadowBlur = 0;

				//Cenário
					if ( this.cenario != "") 
				    	this.cenario.render(this.ctx);
						
				//Itens normais de renderização
					for (i in this.renderItens) {
				
						// !! Função render() necessariamente deve ser criada em cada objeto que for renderizado !!
						this.renderItens[i].render(this.ctx, mod);
						
					}
				    
				//Caso o render seja o render da sombra...
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
					    
				    }
				

		     };
	
			 this.setDificuldade(dificuldade);
	
	}//render