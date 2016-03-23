/*
 *
 *   File ui.js
 *	Ui example.
 * 	
 * 	First define a new ui widget via widget factory.
 * 	Then a callback function to grap touchstate messages and update the widget.
 * 	Then vi add the widget to a tag(here a div) and log that the ui.js was loaded.
 */

$.widget("custom.touch",{
	options:{},
	touchrcv:function(data) {
		this.update(data);
	},
	_create: function() {
		chnlman.on("touchstate",this.touchrcv,this);	
		var stroke="green";
		svg = Svg(26,26).append(Circle(13,13,10).stroke(stroke).stroke_width(4).fill(stroke));
		svg.addStyle("margin:5px 0 5px 30px;");
		svg.render(this.element,true);
		Div("Touch button").render(this.element);
	},
	_destroy: function() {
		chnlman.removeListenerContex(this);
	},
	update: function(data) {
		if(data.state==1) stroke="red"; else stroke="green";
		svg = Svg(26,26).append(Circle(13,13,10).stroke(stroke).stroke_width(4).fill(stroke));
		svg.addStyle("margin:5px 0 5px 30px;");
		svg.render(this.element,true);
		Div("Touch button").render(this.element);
	},
});
var tpnl = Div(Div().id("tindicator").addClass("touchindicator")).id("touchpanel");
tpnl.render($("#custom3"),true);
$("#tindicator").touch();
console.log("ui.js loaded ok");
