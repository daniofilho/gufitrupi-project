/**
 *  Store Assets that needs to be on any stage, like keys or items that player grabs
 * 
 *  Declare all of this assets here
 */

const Key = require('../../assets/scenario/common/Key');
const Object_Throw = require('../../assets/scenario/common/Object_Throw');
const Beach_Wall = require('../../assets/scenario/common/Beach_Wall');
const Beach_Floor = require('../../assets/scenario/common/Beach_Floor');
const Dialog = require('../../assets/scenario/common/Dialog');
const Fire = require('../../assets/scenario/common/Fire');
const Heal = require('../../assets/scenario/common/Heal');

class GlobalAssets {

  constructor(chunkSize) { 
		this.chunkSize = chunkSize;
	}

  getAsset( _class, props, fromSaveState ) {
    let r;
    switch( _class ) {
      case 'key':
        r = new Key( props.code, props.x0, props.y0, props.stage, fromSaveState );
        break;
      case 'object_throw':
        r = new Object_Throw( props.code, props.x0, props.y0, props.stage, fromSaveState );
        break;
      case "beach_wall":
        r = new Beach_Wall( props.code, props.x0, props.y0 );
        break;
      case "beach_floor":
        r = new Beach_Floor( props.code, props.x0, props.y0 );
        break;
      case "object_throw":
        return new Object_Throw( props.code, props.x0, props.y0, props.stageID );
        break;
      case "object_push":
        return new Object_Push( props.code, props.x0, props.y0, props.stageID );
        break;
      case "dialog":
        return new Dialog( props.code, props.x0, props.y0 );
        break;
      case "fire":
        return new Fire( props.code, props.x0, props.y0 );
        break;
      case "heal":
        return new Heal( props.code, props.x0, props.y0, props.stageID );
        break;
      /*case "teleport":
        return new Teleport(item.type, x, y, xIndex, yIndex, item );
        break;*/
    }
    return r;
  }

}//class
module.exports = GlobalAssets;