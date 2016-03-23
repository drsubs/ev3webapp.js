/*
 *
 *   File loop.js
 * 	Example program.
 * 	How to use the IrRemA class to read IR sensor in IR-REM-A mode.
 */ 
 
lib("sensor.js");			// For updateSensor
lib("limiter.js");			// For Limiter
lib("remote.js");			// For IrRemA
lib("leds.js");				// For System.Leds.get
lib("power.js");			// For Power.run
 
/*
 * 	Create a limiter. 
 * 	All it does is, to call the function every Nth time.
 * 	Here we call it every 10th time to update sensor data in the web app, notis port option.
 * 	To recieve the sensor data we create a sensor widget in the web app, (see ui.js)
 */
var limiter = new Limiter(10,function() {
	updateSensor("in1");
});

/*
 * 	Create a remote controller object from IrRemA class.
 */
var remote=new IrRemA(Sensors.in1);

/*
 * 	Create an array of led device for short hand use in updateLeds.
 * 	Notis that element 0(zero) is empty, sinces the buttons is numbers 1 to 4 (not 0 to 3).
 */
var leds=[ 0, System.Leds.get("left","green"),System.Leds.get("left","red"),System.Leds.get("right","green"),System.Leds.get("right","red") ];

/*
 * 	Function updateLeds.
 * 	Set led brightness to either 255 for button down or 0 for button up. And
 * 	write the buttons states to the log.
 * 	In the array leds the order of the leds is set.
 */
 
function updateLeds() {
	var s="Buttons:";
	for(var i=1;i<5;i++) {
		leds[i].write("brightness",remote.get(i) ? 255 : 0);
		s+=" " + remote.get(i); 
	}
	Msg.log(s);
}

/*
 * 	loop function.
 * 	Here we run the limiter and check if the buttons states has changed,
 * 	if so, we update the leds.
 */

var loop = function() {
	limiter.run();
	if(remote.update()) {
		updateLeds();
	}
	Power.run();
}
var epilog=function() {
	for(port in Motors) Motors[port].write("command","reset");
}
