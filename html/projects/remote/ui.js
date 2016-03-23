/*
 *   File ui.js
 * 
 * 	Here we just use the build in functions to load index.html from project folder
 * 	and a stock sensor widget.
 */ 
 
loadDoc("custom1");
$("#custom2").html(""); 				// Clear first
loadSensor("custom2","in1"); 	// then add sensor widget. The widget recieves the data from
													//  updateSensor. Notis the port option.

console.log("ui.js loaded ok"); 	// We are loaded.
