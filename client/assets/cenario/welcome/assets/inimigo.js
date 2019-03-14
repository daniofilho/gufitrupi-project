//Classe de obstaculos


	function Inimigo(ctx, player, name, x0, y0, tipoMov, minX, maxX, minY, maxY, speed ) {
		
		//Setup das Variáveis
		
			//Posição
				this.x = x0;
				this.y = y0;
				
			//Caracteiristicas
				this.width = 10; //px
				this.height = 50;
				
				this.color = "#F00"; 
				this.name = name;
				this.speed = speed;
			
			//Movimento
				this.player = player;
			
				
				this.mov = tipoMov; //hor, ver <- Tipos de Movimento que o Inimigo poderá fazer
				
				this.minX = minX;
				this.minY = minY;
				this.maxX = maxX;
				this.maxY = maxY;
				
				this.movX = 1;
				this.movY = 1;
				
				this.inimigo = new Object;
					this.inimigo.width = this.width;
					this.inimigo.height = this.height;
				
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

				this.objColisao = new Colisao( 0 , 0, this.player );

			//Movimentos
				
				this.movHor = function (mod) {
					
					if ( this.movX == 1 ) {//Movimenta pra direita

						this.x = this.x + this.speed * mod;
						
						if (this.x >= this.maxX )
							this.movX = 0;
						
					} else {
					
						this.x = this.x - this.speed * mod;
						
						if (this.x < this.minX )
							this.movX = 1;
					
					}	

				}
				
				this.movVer = function (mod) {
					
					if ( this.movY == 1 ) {

						this.y = this.y + this.speed * mod;
						
						if (this.y >= this.maxY )
							this.movY = 0;
						
					} else {
					
						this.y = this.y - this.speed * mod;
						
						if (this.y < this.minY )
							this.movY = 1;
					
					}	
				}
				

			
			
		//Função de renderização do player
		
			this.render = function(contexto, mod) { //Contexto é o context do Canvas

				//Movimenta o personagem
					switch (this.mov) {
						
						case "hor":
							this.movHor(mod);
							break;
						
						case "ver":
							this.movVer(mod);
							break;

					}
					
				//Verifica colisão com player
					this.inimigo.x = this.x;
					this.inimigo.y = this.y;

					if ( this.objColisao.verificaColisaoComPlayer(this.inimigo) == true ) 
						this.colisao(this.player);
					

				contexto.fillStyle = this.color;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
				
			};
			
			this.colisao = function(objeto) {
				
				//Caso há colisão, executa uma função e retorna true (ou false dependendo do objeto)
				
				objeto.setColor("#333");
				objeto.resetPosition();
				return false;
				
			};

	}//obstaculo