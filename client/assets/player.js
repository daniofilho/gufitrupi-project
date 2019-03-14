// Classe do jogador

	function Player(x0, y0) {
		
		//Setup das "Variáveis"
		
			//Posição
				this.x = x0;
				this.y = y0;
				
				this.x0 = x0;
				this.y0 = y0;
		
			//Caracteiristicas
				this.width = 25; //px
				this.height = 25; //px
				this.speed0 = 200; // movemento em pixels por segundo
				this.speed = this.speed0;
				
				this.color0 = '#FFF';
				this.color = this.color0; 
			
		//Movimentos do Player
		
			this.movLeft = function(mod) { 
				this.setX( this.getX() - this.getSpeed() * mod); 
			};
			
			this.movRight = function(mod) { 
				this.setX( this.getX() + this.getSpeed() * mod); 
			};
			
			this.movUp = function(mod) { 
				this.setY( this.getY() - this.getSpeed() * mod); 
			};
			
			this.movDown = function(mod) {  
				this.setY( this.getY() + this.getSpeed() * mod); 
			};
		
		//Sets
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight = function (height) { this.height = height; }
			this.setWidth = function (width) { this.width = width; }
			
			this.setColor = function (color) { this.color = color; }
			this.setSpeed = function (speed) { this.speed = speed; }
		
		//Gets
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
			this.getHeight = function() { return this.height; }
			
			this.getColor = function() { return this.color; }
			this.getSpeed = function() { return this.speed; }
			
		//Reinicia a posição do personagem
			
			this.resetPosition = function() {
				
				this.setX( this.x0 );
				this.setY( this.y0 );

			}
			
		//Função de renderização do player
		
			this.render = function(contexto) { //Contexto é o context do Canvas

				contexto.fillStyle = this.getColor();
				contexto.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
				
			};
			
			this.noColisao = function() {
				
				//O que acontece quando o player não colide com nada?
				
				this.setSpeed(this.speed0); //Reseta a velocidade
				this.setColor(this.color0);
			}
		
	}//player
	
