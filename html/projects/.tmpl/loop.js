/*
 *
 *   File loop.js
 * 
 */ 
 
 for(port in Motors) {
	Msg.log("Active motor on " + port);
} 
for(port in Sensors) {
	Msg.log("Active sensor on " + port);
} 

/*
 * 	loop function.
 */

var loop = function() {
};
var epilog=function() {
	for(port in Motors) Motors[port].write("command","reset");
}
