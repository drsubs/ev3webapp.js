/*
 *
 *   File loop.js
 * 
 */ 
 
lib("limiter.js");
lib("remote.js");
lib("motor.js");
lib("sensor.js");

/*
 * 	Class MotorDriver
 * 
 * 	This class drives 2 motors controlled by a IrRemote class from remote.js.
 * 	MotorDriver is hard coded as you would do with ad-hoc objecter.
 * 	And we use the beacon mode callback to reset the motors.
 */

function MotorDriver() {
	var m1 = new Motor(Motors.outA);
	var m2 = new Motor(Motors.outB);
	this.speed=50;
	
	MotorDriver.prototype.reset = function() {
		m1.reset();
		m2.reset();
	}
	MotorDriver.prototype.run = function(state) {
		if(state[0]==0) m1.stop();
				else {
					m1.duty_cycle_sp(this.speed*state[0]);
					m1.command("run-forever");
				}
		if(state[1]==0) m2.stop();
				else {
					m2.duty_cycle_sp(this.speed*state[1]);
					m2.command("run-forever");
				}
	}
}
var md=new MotorDriver();

remote = new IrRemote(Sensors.in1,function(chnl,btn) {
	if(chnl==0) md.run(btn);
});

remote.setBeaconCb(function(state) {
	md.reset();
});

var limiter = new Limiter(5,function() {
	updateMotor("outA"); 
	updateMotor("outB");	
	updateSensor("in1");
});
 
/*
 * 	loop function.
 */
 
var loop = function() {
	remote.update();
	limiter.run();
};
var epilog=function() {
	for(port in Motors) Motors[port].write("command","reset");
	updateMotor("outA"); 
	updateMotor("outB");	
}

