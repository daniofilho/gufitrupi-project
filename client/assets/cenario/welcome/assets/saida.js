//Classe de obstaculos


	function Saida(ctx, name, x0, y0, w, h) {
		
		//Setup das Variáveis
		
			//Posição
				this.x = x0;
				this.y = y0;
				
			//Caracteiristicas
				this.width = w; //px
				this.height = h;
				
				this.color = "#3F5"; 
				this.name = name;
			
			//Sets
		
				this.setX =  function (x) { this.x = x; }
				this.setY =  function (y) { this.y = y; }
				
				this.setHeight =  function (height) { this.height = height; }
				this.setWidth =  function (width) { this.width = width; }
				
				this.setColor =  function (color) { this.color = color; }
				this.setName =  function (name) { this.name = name; }
	
			//Gets
				
				this.getX =  function () { return this.x; }
				this.getY =  function () { return this.y; }
				
				this.getWidth = function() { return this.width; }
				this.getHeight = function() { return this.height; }
				
				this.getColor = function() { return this.color; }

				this.exit = 0;

			//Declaraçõa das texturas
				this.ctx = ctx;
	

		
		//Função de renderização do player
		
			this.render = function(contexto) { //Contexto é o context do Canvas
				
				contexto.fillStyle = this.color;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
				
			};
			
			this.colisao = function(objeto) {
				
				//Caso há colisão, executa uma função e retorna true (ou false dependendo do objeto)
				
				switch (this.exit) {
					
					case 0:
						
						this.setX(520);
						this.setY(540);					
						this.exit = 1;						
						break;
					
					case 1:
						
						this.setX(225);
						this.setY(370);						
						this.exit = 2;						
						break;
					
				    case 2:
						
						this.setX(725);
						this.setY(310);
						this.setWidth(40);
						this.setHeight(40);
						
						this.exit = 3;
						
						this.setColor('#00F');
						
						
						break;
						
					case 3:
					
						objeto.setColor("#333");
						objeto.resetPosition();
						
						$('canvas').fadeOut(1000);
						$('.win').fadeIn();
						break;
				}
				
				
				return false;
				
			};

	}//obstaculo