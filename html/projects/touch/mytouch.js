/*
 * 	mytouch.js
 * 
 */

var led = new Led(System.Leds.get("right","red"));
function mytouch() {
	return new Touch({
		sensor:Sensors.in1,   	   		// choose a sensor port. Here in1.
		motor: new Motor(Motors.outA),  // Add Motor to Touch class.
		speed:50, 						// Add speed to Touch class, by setting it to 50.
		_create:function() {
			Msg.on("touchdir","touchdir",this); //Add touchdir callback function to recive from web app, on channel touchdir.
		},
		up:function() {					// Declare up function. Stop motor on outA, log action and send new state to web app.
			led.set(0);
			this.motor.stop();
			Msg.log("Motor stop");
			Msg.send("touchstate","{state:0}");
		},
		down:function() { // Declare down function. Set motor speed, start motor, log action and send new state to web app.
			led.set(255);
			this.motor.duty_cycle_sp(this.speed);
			this.motor.command("run-forever");
			if(this.speed>0) Msg.log("Start Motor Speed " + this.speed + " forward");		
					else Msg.log("Start Motor Speed " + this.speed + " backwards");		
			Msg.send("touchstate","{state:1}");
		},
		/*
		 *	touchdir function.
		 *	Toggle speed direction(from positiv to negative and versus). And log action. 
		 *  This message is send from ui.js using: 
		 * 			chnlman.send("touchdir:toggle;");
		 */
		touchdir: function(cmd) {
			if(this.speed===undefined) this.speed=-50;
			Msg.log("Touchdir msg rcv " + cmd);
			if(this.speed>0) this.speed=-50; else this.speed=50;
		}
	});
}
