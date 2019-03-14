//Clase que mostra na tela a posição X e Y do mouse dentro do Canvas
	//Adicionado função para mostrar larg e altura de um retângulo desenhado no canvas

	function MousePosition(cv, debug) {
		
		this.x0 = 0;
		this.y0 = 0;
		
		this.canvas = cv;
		
		
		this.init = function() {
			
			var div = "";
			
			div += '<div id="mousePosition">';
				div += '<p class="x">x: <span id="xC">0</span></p>';
				div += '<p class="y">y: <span id="yC">0</span></p><br/><br/>';
				
				div += '<p class="x">x0: <span id="x0">0</span></p>';
				div += '<p class="y">y0: <span id="y0">0</span></p>';
				div += '<p class="x">w: <span id="w">0</span></p>';
				div += '<p class="y">h: <span id="h">0</span></p>';
				
				div += '<input type="text" size="2" id="copy" />';
			div += '</div>';
			
			div += "<style>";
				
				div += "#mousePosition {"
					
					div += "position: fixed;";
					div += "background: #EFEFEF;";
					div += "width: 50px;";
					div += "height: 100px;";
					div += "border: 1px solid #DDD;";
					div += "right:0px;";
					div += "top:0px;"; 
					div += "font-size: 13px;"; 
					div += "line-height:0px;";
					div += "text-align:center;"; 
					div += "margin:10px;";
					div += "z-index:999;";
					
					if (debug == false)
						div += "display:none;";
						
				div += "}";
			
			div += "</style>";
			
			document.write(div);
			
			this.canvas.addEventListener('mousemove', function(evt) {
				
				this.rect = this.getBoundingClientRect();
				
				var x = evt.clientX - this.rect.left;
				var y = evt.clientY - this.rect.top;
				
				document.getElementById("xC").innerHTML = x;
				document.getElementById("yC").innerHTML = y;
			
			}, false);
			
			this.canvas.addEventListener('mousedown', function(evt) {
				
				this.rect = this.getBoundingClientRect();
				
				this.x0 = evt.clientX - this.rect.left;
				this.y0 = evt.clientY - this.rect.top;
			
				document.getElementById("x0").innerHTML = this.x0;
				document.getElementById("y0").innerHTML = this.y0;
			
			});
			
			this.canvas.addEventListener('mouseup', function(evt) {
			
				var rect = this.getBoundingClientRect();
				
				var x = evt.clientX - this.rect.left;
				var y = evt.clientY - this.rect.top;
			
				document.getElementById("w").innerHTML = x - this.x0;
				document.getElementById("h").innerHTML = y - this.y0;
			
				document.getElementById("copy").value = this.x0 + ", " + this.y0 + ", " + (x - this.x0) + ", " + (y - this.y0);
				
			});

	
		};
		
	}//MousePosition