// Obstacle class

	function Water(ctx, name, x0, y0, w, h) {
		
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
				
				this.imgWater = new Image();
				this.imgWater.src = './assets/scenario/welcome/img/water.jpg';
				
				this.water = this.ctx.createPattern(this.imgWater, 'repeat');
				
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
		
			this.render = function(contexto) { 
				contexto.fillStyle = this.water;
				contexto.fillRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() );
			};
			
			this.collision = function(object) {
				
				// If collides, what will happen? 
				object.setSpeed(100);
				object.setColor("#86C0F8");
				
				// If the item will trigger a collision action. Walls will make the player stop, but water will only make the player slow
				return false; 
				
			};

	}//class