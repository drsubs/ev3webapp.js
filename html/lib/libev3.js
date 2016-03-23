function Touch(o) {
	this.sensor=o.sensor;
	if(o.up) this.up=o.up;
	if(o.down) this.down=o.down;
	this.state=0;
}
Touch.prototype.up=function() { log("Button Up"); }
Touch.prototype.down=function() { log("Button Down"); }
Touch.prototype.run = function() {
	var n=this.sensor.read("value0");
	if(n!=this.state) {
		this.state=n;
		if(n==1) this.down(); else this.up();
	}
}
