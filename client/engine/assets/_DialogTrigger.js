const _Collidable = require('./_Collidable');

class _DialogTrigger extends _Collidable {

  constructor(props, position, dimension, sprite, events, dialogTriggerProps) {
		super(props, position, dimension, sprite, events, dialogTriggerProps.fromSaveState);
		this.canUse = true;
	}
	
	setDialog(dialog) { this.dialog = dialog; }
	getDialog() { return this.dialog; }

	useHandler() { window.game.setDialog(this.dialog); }
  setName(name) { this.name = name; }
	
  beforeRender(ctx) { }

}//class
module.exports = _DialogTrigger;