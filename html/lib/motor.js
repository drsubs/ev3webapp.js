/*
 * 	motor.js
 * 
 *  Options device: Motor or sensor,channel: transmit channel,plist: array of propertys.
 */
 function updateMotor(cmd) {
		var msg={};
		var plist=["stop_command","speed","duty_cycle_sp","position","state"];
		for(var i=0;i < plist.length;i++) {
			msg[plist[i]]=Motors[cmd].read(plist[i]);
		}
		Msg.send("motordata." + cmd, JSON.stringify(msg));
}

function Motor(m) {
	this.motor=m;
	Motor.prototype.runTo = function(pos,sp) {
		this.stop_command("hold");
		this.motor.write("duty_cycle_sp",sp);
		this.motor.write("position_sp",pos);
		this.command("run-to-abs-pos");
	}
	Motor.prototype.position = function(v) {
		if(v==undefined) return this.motor.read("position");
		this.motor.write("position",v);
	}
	Motor.prototype.stop_command = function(cmd) {
		this.motor.write("stop_command",cmd);
	}
	Motor.prototype.speed = function(sp) {
		this.motor.write("speed",sp);
	}
	Motor.prototype.command = function(cmd) {
		this.motor.write("command",cmd);
	}
	Motor.prototype.duty_cycle_sp = function(cmd) {
		this.motor.write("duty_cycle_sp",cmd);
	}
	Motor.prototype.stop = function() {
		this.command("stop");
	}
	Motor.prototype.reset = function() {
		this.command("reset");
	}
}
