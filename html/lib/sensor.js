/*
 *	sensor.js
 * 
 */
function updateSensor(cmd) {
	var mds = Sensors[cmd].modes;
	var dn = Sensors[cmd].read("driver_name");
	var value = Sensors[cmd].read("value0");
	var md = Sensors[cmd].read("mode");
	var msg={address:cmd,driver_name:dn,mode:md,value0:value,modes:mds};
	Msg.send("sensordata." + cmd,JSON.stringify(msg));	
}

 function Sensor(m) {
	this.sensor=m;
	Sensor.prototype.command = function(cmd) {
		this.sensor.write("command",cmd);
	}
	Sensor.prototype.value = function() {
		return this.sensor.read("value0");
	}
	Sensor.prototype.read = function(p) {
		return this.sensor.read(p);		
	}
	Sensor.prototype.write = function(p,v) {
		return this.sensor.write(p,v);		
	}
	Sensor.prototype.modes = function() {
		return this.sensor.modes.split(" ");
	}	
	Sensor.prototype.mode = function(v) {
		if(!v) return this.sensor.read("mode");
		this.sensor.write("mode",v);
		this.sensor.values = this.sensor.read("num_values");
	}	
}
