/*
 *
 *   File ui.js
 *	Ui example.
 * 	
 * 	First define a new ui widget via widget factory.
 * 	
 */
 
Fieldset(Legend("In1")).id("sensorin1")
	.addClass("sensor")
	.append(Div().addClass("sensormodes"))
	.append(Div().addClass("sensorcontainer")).render($("#custom1"),true);

$("#sensorin1").sensor({port:"in1"});
 
console.log("ui.js loaded ok");
