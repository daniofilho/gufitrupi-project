const _Collidable = require('./_Collidable');
const Sprite = require('../core/Sprite');

class _Dialog extends _Collidable {

  constructor( x, y, dialog ) {
		
		let props = {
			name: 'dialog',
			type: 'dialog'
		}
	
		let position = {
			x: x,
			y: y
		}
	
		let dimension = {
			width: window.game.getChunkSize(),
			height: window.game.getChunkSize()
		}
	
		let events = {
			stopOnCollision: true,
			hasCollisionEvent: true
		}

		let sprite = new Sprite(false, 0, 0, 0, 0);
		
		super(props, position, dimension, sprite, events);
		this.canUse = true;
		this.dialog = dialog;
	}
	
	getDialog() { return this.dialog; }

	useHandler() { 
		window.game.setDialog(this.dialog); 
	}
  setName(name) { this.name = name; }
	
	setSpriteType(type) {  	}

}//class
module.exports = _Dialog;