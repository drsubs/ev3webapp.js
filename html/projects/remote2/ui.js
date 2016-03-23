/*
 *   File ui.js
 */

$.widget("costum.speedgauge",{
	options:{
		port:"outA",
		value:0,
		text:"Ticks",
		start:220,
		end: 130,
		ratio: 270/2000,
	},
	_create:function() {
		chnlman.on("motordata." + this.options.port,this.update,this);
		this.draw();
	},
	_destroy: function() {
		chnlman.removeListenerContex(this);
	},
	draw: function() {
		var svg=Svg(100,100).append(Circle(50,50,50).stroke("green").stroke_width(4).fill("yellow"));
		var g=G().stroke("black").stroke_width(4);
		var deg = (this.options.value*this.options.ratio);
		var rad=0.0174532925*(deg % 360);
		var x=50+(Math.sin(rad)*50);
		var y=50-(Math.cos(rad)*50);
		g.append(Line(50,50,x,y));
		svg.append(g);
		svg.render(this.element,true);
		Div(this.options.text + " " + this.options.port).addClass("gaugevalue").addStyle("width:100%;text-align:center;margin-top:-45;margin-bottom:30").render(this.element);
		Div(this.options.value).addClass("gaugevalue").addStyle("width:100%;text-align:center;margin-top:-32;margin-bottom:12").render(this.element);
		return this;
	},
	update:function(data) {
			this.options.value=data.speed;
			this.draw();
//			console.log("gague update",data.speed);
			return this;
	}
});
var gauges=Div("Hej").id("gauge1").render($("#custom1"),true);
var gauges=Div("Hej").id("gauge2").render($("#custom1"));
var gauge1=$("#gauge1").speedgauge({port:"outA"});			
var gauge2=$("#gauge2").speedgauge({port:"outB"});			

$("#custom2").html("");
loadMotor("custom2","outA");
loadMotor("custom2","outB");
loadSensor("custom2","in1");
console.log("ui.js loaded ok");
