// Obstacle class

	function Wall(ctx, name, x0, y0, w, h) {
		
		// - - - Init - - -
		
			// # Position
				this.x = x0;
				this.y = y0;
				
			// # Properties
				this.width = w; //px
				this.height = h;
				
				this.color = "#3F5"; 
				this.name = name;

			// # Texture
				this.ctx = ctx;
				
				let imgSprite = new Image();
				imgSprite.src = './assets/scenario/welcome/img/wall.jpg';


		// - - - Sets - - -
		
			this.setX =  function (x) { this.x = x; }
			this.setY =  function (y) { this.y = y; }
			
			this.setHeight =  function (height) { this.height = height; }
			this.setWidth =  function (width) { this.width = width; }
			
			this.setColor =  function (color) { this.color = color; }
			this.setName =  function (name) { this.name = name; }

		// - - - Gets - - -
			
			this.getX =  function () { return this.x; }
			this.getY =  function () { return this.y; }
			
			this.getWidth = function() { return this.width; }
			this.getHeight = function() { return this.height; }
			
			this.getColor = function() { return this.color; }
		
		
		// - - - Render - - -
		
			this.render = function(ctx) { 
				
				let x0 = this.getX();
				let y0 = this.getY();
				let w  = this.getWidth();
				let h  = this.getHeight();
				
				imgSprite.onload = function(x0, y0, w, h) {
					let sprite = ctx.createPattern(imgSprite, "repeat");
					ctx.rect( x0, y0, w, h );
					ctx.fillStyle = sprite;
					ctx.fill();
				}
				 

				//ctx.fillStyle = 'red';
				//ctx.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );

				console.log( x0, y0, w, h);
				
			};
			
			this.collision = function(object) {
				return true;
			};

	}//obstaculo