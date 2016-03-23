/*
 *
 *	leds.js	
 * 
 */
 
function Led(led) {
	this.led=led;
	Led.prototype.set = function(v) {
			this.led.write("brightness",v);
			return this;
	}
	Led.prototype.get = function() {
			return this.led.read("brightness");
	}
}
System.Leds.get = function(side,clr) {
	return System.Leds[side][clr];
}
