/*
 *
 *	color.js	
 * 
 */
 
function Color(s) {
	this.sensor=s;
	this.colors = ["none","Black","Blue","Green","Yellow","Red","White","Brown"];
	this.sensor.write("mode","COL-COLOR");
	Color.prototype.get = function() {
			var c=this.sensor.read("value0");
			return this.colors[c & 7];
	}
}