/*
 *
 *   File touch.js
 *
 * 	Touch object.
 * 
 *  Eksample:
 * 		var t=new Touch({sensor:Sensors.In1,down:function() { startstuf(); }});
 * 	And then in loop: 
 * 		t.run();
 * 
 */

function Touch(o) {
	for(opt in o) {
		this[opt]=o[opt];
	}
	this._state=0;
	if(this._create) this._create();
}
Touch.prototype.up=function() { Msg.log("Button Up"); }
Touch.prototype.down=function() { Msg.log("Button Down"); }
Touch.prototype.run = function() {
	var n=this.sensor.read("value0");
	if(n!=this._state) {
		this._state=n;
		if(n==1) this.down(); else this.up();
	}
}
