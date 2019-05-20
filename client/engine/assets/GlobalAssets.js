/**
 *  Store Assets that needs to be on any stage, like keys or items that player grabs
 * 
 *  Declare all of this assets here
 */

const Key = require('../../assets/scenario/common/Key');
const Object_Throw = require('../../assets/scenario/common/Object_Throw');

class GlobalAssets {

  constructor(chunkSize) { 
		this.chunkSize = chunkSize;
	}

  getAsset( _class, props ) {
    let r;
    switch( _class ) {
      case 'key':
      	r = new Key( props.code, props.x0, props.y0, ( props.x0 / this.chunkSize), ( props.y0 / this.chunkSize), props );
        break;
      case 'object_throw':
      	//r = new Object_Throw( item.type, x, y, props.stageId );
        break;
    }
    return r;
  }

}//class
module.exports = GlobalAssets;