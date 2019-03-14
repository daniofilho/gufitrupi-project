//Classe de obstaculos


	function Power(ctx, name, x0, y0, w, h) {
		
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


			//Declaraçõa das texturas
				this.ctx = ctx;
				
			
			    this.grad = this.ctx.createRadialGradient( this.getX(), this.getY(), this.getWidth(), this.getHeight(), 0, 100 );
			    this.grad.addColorStop(0, '#B46B2C');   
			    this.grad.addColorStop(1, '#CCCA4F');

			      
							
				
		
		//Função de renderização do player
		
			this.render = function(contexto) { //Contexto é o context do Canvas
				
				contexto.fillStyle = this.grad;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
				
			};
			
			this.colisao = function(objeto) {
				
				//Caso há colisão, executa uma função e retorna true (ou false dependendo do objeto)
				objeto.setSpeed(400);
				objeto.setColor("#D6142F");
				return false;
				
			};

	}//obstaculo