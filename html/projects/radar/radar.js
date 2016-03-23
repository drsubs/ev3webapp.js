/*
 * 	radar.js
 * 
 */
lib("motor.js");
lib("sensor.js");
lib("power.js");
lib("leds.js");
lib("limiter.js");

function Radar() {
	var motor=new Motor(Motors.outA);
	var sensor=new Sensor(Sensors.in1);
	var rightled = new Led(System.Leds.right.red);
	var leftled = new Led(System.Leds.left.red);
	var dc_sp=40;
	var ratio=2.2;
	var cw=(ratio*180)+5;	
	var state="init";
	var data=[];
	var ostate="";
	motor.position(0);

	Radar.prototype.run = function() {
		if(ostate!=state) {
			ostate=state;
			//Msg.log("New state " + state);
		}
		switch(state) {
			case "init":
				motor.runTo(cw,dc_sp);
				state="runningCW";
				data = [];
				leftled.set(0);
				rightled.set(255);
				break;
			case "runningCW":
				var p=motor.position();
				if((p>0) && (p<cw)) {
					data[parseInt(p/8)]=parseInt(sensor.value());
				}
				if(p>cw) {
					state="turnCCW";
					motor.stop();
				}
				break;
			case "turnCCW":
				leftled.set(255);
				motor.runTo(-5,dc_sp);
				state="runningCCW";
				break;
			case "runningCCW":
				rightled.set(0);
				var p=motor.position();
				if((p>0) && (p<cw)) {
					data[parseInt( p/8 )]=parseInt(sensor.value());
				}
				if(p<0) {
					state="turnCW";
					motor.stop();
				}
				break;
			case "turnCW":
				rightled.set(255);
				var s={samples:[]};
				for(var i=0;i< data.length;i++) {
					if(data[i]==undefined) data[i]=0;
					s.samples[i]=data[i];
				}
				Msg.send("radar",JSON.stringify(s));
				state="init";
				break;
		}
	}
}
function ModesMenu(s) {
	Msg.on("modes","rcv",this);
	ModesMenu.prototype.rcv = function(cmd) {
		var mds = Sensors[cmd].modes.split(" ");
		var md = Sensors[cmd].read("mode");
		var msg={modes:mds,mode:md};
		Msg.send("modes." + cmd,JSON.stringify(msg));
	}
}
var mm=new ModesMenu();
var r=new Radar();
var pwr=new Power();
var limiter = new Limiter(100,function() {
	pwr.update();
});

function loop() {
	r.run();
	limiter.run();
}
function epilog() {
	for(port in Motors) Motors[port].write("command","reset"); // Reset motors. 
	Msg.log("Radar ended.");
}
Msg.log("radar.js loaded");

