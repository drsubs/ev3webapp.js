/*
 *
 *   File loop.js
 * 
 * 	First include touch.js containing the Touch class.
 * 
 *
 */ 
 
 /*
  * 	Load some standart lib files.
  */

lib("touch.js");
lib("leds.js");

/*
 * 	Constructor function mytouch.
 * 
 * 	Constructs a Touch class object at sensor port in1. Adds up and down callback function 
 * 	to catch the sensor action. When the sensor is down we turn on the rigth red led and off
 * 	when it´s up.
 */
function mytouch() {
	return new Touch({
		sensor:Sensors.in1,   	   		// choose a sensor port. Here in1.
		led : new Led(System.Leds.get("right","red")),
		up:function() {					// Declare up function. Stop motor on outA, log action and send new state to web app.
			this.led.set(0);
			Msg.send("touchstate","{state:0}");
			Msg.log("Up");
		},
		down:function() { // Declare down function. Set motor speed, start motor, log action and send new state to web app.
			this.led.set(255);
			Msg.send("touchstate","{state:1}");
			Msg.log("Down");
		},
	});
}

var touch = mytouch();	// create the Touch object.

/*
 * 	loop function.
 * 
 * 	This is the main function in the robot program.
 * 	The loop function is being call perpetualy as long as the javascript is running. Between the calls, 
 * 	the web server is being runned. So all messages send to the web app, is not being send until the loop returns
 * 	controlle to the server enginen.
 * 	So it must return as soon as posible.  
 * 
 * 	All we do is to poll the touch sensor by calling touch.run()
 * 
 */
 
Msg.log("Sensor modes: " + Sensors.in1.modes + " num_values: " + Sensors.in1.values);
var loop = function() {
	touch.run();		// Poll sensor state.
};
var epilog=function() {
}
