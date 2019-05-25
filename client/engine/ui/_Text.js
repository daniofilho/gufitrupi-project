class UIitem_text {

  constructor( text, x, y, font ) {
    
    this.hideSprite = false;
    
    this.text = text;

    // # Position
    this.x = x;
    this.y = y;
  
    // # Properties
    this.font = font;

  }
  
  // # Sets      
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
        
  // # Gets            
  getX() { return this.x; }
  getY() { return this.y; }
        
  // # Item Render
  render(ctx) {
        
    if ( this.hideSprite ) return;
  
    ctx.font =  this.font.size + " 'Press Start 2P'";
    ctx.fillStyle = this.font.color;
    ctx.fillText( this.text, this.x, this.y); 

  }
       
}//class
module.exports = UIitem_text;
  