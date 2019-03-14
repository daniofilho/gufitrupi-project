//Classe de obstaculos


	function Agua(ctx, name, x0, y0, w, h) {
		
		//Setup das Variáveis
		
			//Posição
				this.x = x0;
				this.y = y0;
				
			//Caracteiristicas
				this.width = w; //px
				this.height = h;
				
				this.color = "#3F5"; 
				this.name = name;

			//Declaraçõa das texturas
				this.ctx = ctx;
				
				this.imgAgua = new Image();
				this.imgAgua.src = './assets/cenario/welcome/img/agua.jpg';
				
				this.agua = this.ctx.createPattern(this.imgAgua, 'repeat');
				
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
		
		
		//Função de renderização do player
		
			this.render = function(contexto) { //Contexto é o context do Canvas
				
				contexto.fillStyle = this.agua;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
				
			};
			
			this.colisao = function(objeto) {
				
				//Caso há colisão, executa uma função e retorna true (ou false dependendo do objeto)
				objeto.setSpeed(100);
				objeto.setColor("#86C0F8");
				return false;
				
			};

	}//obstaculo