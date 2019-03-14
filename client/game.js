
	
	//Declarações iniciais
	
		var canvas_estatico = document.getElementById('canvas_estatico');
		var contexto_estatico = canvas_estatico.getContext('2d');
		
		var canvas_animado = document.getElementById('canvas_animado');
		var contexto_animado = canvas_animado.getContext('2d');
		
		var canvas_sombra = document.getElementById('canvas_sombra');
		var contexto_sombra = canvas_sombra.getContext('2d');
		
		canvas_animado.width = canvas_estatico.width = canvas_sombra.width = 800;
		canvas_animado.height = canvas_estatico.height = canvas_sombra.height = 600;
	
		var time = Date.now();
		

	
		//Lib que pega a posição X e Y do mouse...
		var mousePosition = new MousePosition(canvas_sombra, false); //canvas, debug?
			mousePosition.init();

		//Jogadores

			var player = new Player(300, 420); //posição x e y

		//Cenário
		
			var cenario = new cenarioWelcome(contexto_estatico, canvas_estatico, player );
			

		//Clase de detecção de colisão
	
			var colisao = new Colisao(canvas_animado.width, canvas_animado.height );
			
			//Adiciona os objetos criados ao vetor de objetos de colisão
				colisao.addArrayItem( cenario.getRenderItens() );
				colisao.addArrayItem( cenario.getRenderItensAnimados() );

		
		//Render
		
			var render_estatico = new Render(contexto_estatico, canvas_estatico); //Render que será executado apenas uma vez
			var render_animado = new Render(contexto_animado, canvas_animado); //Render que conterá os objetos que sofrem movimento apenas
			var render_sombra = new Render(contexto_sombra, canvas_sombra, "easy", player); //render do efeito de sombra
			
		
			
			//Adiciona itens para serem renderizados
			
				render_estatico.setCenario(cenario); //Define o cenário 
				render_estatico.addArrayItem(cenario.getRenderItens()); //Pega o itens do cenário em forma de array para renderizar

				render_animado.addArrayItem( cenario.getRenderItensAnimados() ); //Adiciona itens do cenário que serão animados
				render_animado.addItem( player ); //Adiciona o player

			
		
	//Eventos de Teclado (movimento)	
	
		
		var keysDown = {};
		window.addEventListener('keydown', function(e) {
		    keysDown[e.keyCode] = true;
		});
		window.addEventListener('keyup', function(e) {
		    delete keysDown[e.keyCode];
		});


	
	//Funcão de atualização constante (gameLoop)
			
		function updateGame(mod) {
				
				
			var tempX = player.getX();
			var tempY = player.getY();
		    
		    if (37 in keysDown) { //left
				
		    	player.movLeft(mod); //Anda
		    
		    	if ( colisao.verifica(player) == true ) //Se houver colisão, volta...
		        	player.setX(tempX);
    	
		    }
		    
		    if (38 in keysDown) { //Up  
		    	
		    	player.movUp(mod);
		    	
		    	if ( colisao.verifica(player) == true ) 	
		        	player.setY(tempY);
		      
		    }
		    
		    if (39 in keysDown) { //right
		    	
		    	player.movRight(mod);
		    	
		    	if ( colisao.verifica(player) == true )  
		        	player.setX(tempX);
		       
		    }
		    
		    if (40 in keysDown) { // down
		    	
		    	player.movDown(mod);
		    	
		    	if ( colisao.verifica(player) == true ) 
		        	player.setY(tempY);
		        
		    }
		    
		};

	// "Thread" que roda o jogo	

		function runGame() {

			updateGame( (Date.now() - time) / 1000 );
		    
		    render_animado.start( Date.now() - time ); //renderização apenas de objetos animados
			render_sombra.start( Date.now() - time ); //renderiza apenas o efeito de sombra
			
		    time = Date.now();
		
			//Faz com que a função run seja realmente executada apenas quando houver foco no navegador
			//o jogo ainda roda em plano de fundo, mas pelo menos a função de renderização não é chamada sempre...
			requestAnimationFrame(runGame); 	
		
		};
	
	//Inicialização do game
		
		render_estatico.start( Date.now() - time );  //renderiza apenas uma vez

		
		$(document).ready(function() {
			
			$('.start, .objetivos').fadeIn(1000);
			
			
			$('.start a').click(function(event){
				event.preventDefault();
				
				render_sombra.setDificuldade( $(this).data('game') );
				
				$('.start, .objetivos').fadeOut();
				$('canvas').fadeIn();
				
				runGame();
				
			});
	
			
		});			
	
