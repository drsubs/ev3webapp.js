/*
 *	File remote.js
 * 
 * Ir sensor in remote mode classes.
 * 
 */
 
function IrRemA(s) {
	this.sensor = s;
	this.state=0;
	this.btnstate=[0,0,0,0,0];
	this.sensor.write("mode","IR-REM-A");
	IrRemA.prototype.get = function(b) { return this.btnstate[b]};
	IrRemA.prototype.update = function() {
		var v=this.sensor.read("value0");
		var changed=0;
		if(v!=384) {
			for(i=1;i<5;i++) {
				if(this.btnstate[i]) {
					var b=(v & 0xf0) >> 4;
					if(! (b & (1 << (i-1))) ) {
						this.btnstate[i]=0;
						changed=1;
					}
				} else {
					var b=(v & 0xf0) >> 4;
					if((b & (1 << (i-1))) ) {
						this.btnstate[i]=1;
						changed=1;
					}
				}
			}
		}
		return changed;
	}
}
var statelist = [
	[0,0],
	[1,0],
	[-1,0],
	[0,1],
	[0,-1],
	[1,1],
	[1,-1],
	[-1,1],
	[-1,-1],
	[0,0]
];
function IrRemote(s,cb,bcb) {
	if(s) this.sensor = s;
		else this.sensor=Sensors.in1;
	if(cb) this.cb=cb;
	if(bcb) this.beaconCallback=bcb;
	
	this.beaconstate=-1;
	this.chnlstate=[[0,0],[0,0],[0,0],[0,0]];
	this.sensor.write("mode","IR-REMOTE");
	
	IrRemote.prototype.setCb= function(cb) {
		this.cb=cb;
		return this;
	}
	IrRemote.prototype.setBeaconCb=function(cb) {
		this.beaconCallback = cb;
		return this;
	}
	IrRemote.prototype.update = function() {
		for(var i=0;i<4;i++) {
			var v=this.sensor.read("value" + i);
			if(v > 8) {
				if(this.beaconstate==-1 && v==9) {
					this.beaconCallback(1);
					this.beaconstate=i;
				}
			} else {
				if(this.beaconstate==i && v < 9) {
					this.beaconCallback(0);
					this.beaconstate=-1;
				}
				var b=statelist[v];			
				if(b!=this.chnlstate[i]) {
					this.chnlstate[i]=b;
	//				Msg.log("Remote (" + i + ") " + b);
					this.cb(i,b);
				} 						
			}
		}
	}
}