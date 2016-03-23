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
lib("sensor.js");
lib("color.js");
lib("limiter.js");

/*
 * 	Load a project lib file.
 */


/*
 * 	Make a Limiter function.
 * 	The limiter only calls the function every n´th time, n here is 5. This is to limit the number of messages when fx. updateing
 * 	the motor position.
 */
 var colorsensor=new Color(Sensors.in1);
 var ocolor="none";
 /*
  *  Limiter updates sensor data to web app.
  *  But we only updates if data have changed.
  */

var limiter = new Limiter(5,function() {
	var color=colorsensor.get();
	if(color!=ocolor) {
		ocolor=color;
		Msg.log("Color " + color);
		updatesensor("in1");
	}
});
function updatesensor(cmd) {
	var mds = Sensors[cmd].modes;
	var dn = Sensors[cmd].read("driver_name");
	var value = Sensors[cmd].read("value0");
	var md = Sensors[cmd].read("mode");
	var msg={address:cmd,driver_name:dn,mode:md,value0:value,modes:mds};
	Msg.send("sensordata." + cmd,JSON.stringify(msg));	
}
function SensorData() {
	Msg.on("sensordata","rcv",this);
	SensorData.prototype.rcv = function(cmd) {
		updatesensor(cmd);
	}
}

/*
 * 	loop function.
 * 
 * 	This is the main function in the robot program.
 * 	The loop function is being call perpetualy as long as the javascript is running. Between the calls, 
 * 	the web server is being runned. So all messages send to the web app, is not being send until the loop returns
 * 	controlle to the server enginen.
 * 	So it must return as soon as posible.  
 * 
 */
 
var sdata = new SensorData();
 
Msg.log("Sensor modes: " + Sensors.in1.modes + " num_values: " + Sensors.in1.values + " cur mode : " + Sensors.in1.read("mode"));
var loop = function() {
	limiter.run();		// run the limiter, it will then call the updater function every 5th time.
};
var epilog=function() {
	for(port in Motors) Motors[port].write("command","reset");
}
