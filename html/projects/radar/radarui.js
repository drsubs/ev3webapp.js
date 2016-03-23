/*
		Radar widget.
*/

$.widget("costum.radar",{
	options:{},
	_create: function() {
		chnlman.on("radar",function(data) { this.update(data); },this);
		svg = Svg(400,200).append(Circle(200,200,200).stroke("green").stroke_width(4).fill("yellow"));
		var g=G().stroke("black").stroke_width(4);
		for(i=1;i<45;i++) {
			var pos1 = ((i-1)*4) - 90;
			var pos2 = (i*4) - 90;
			var rad1=0.0174532925*(pos1 % 360);
			var rad2=0.0174532925*(pos2 % 360);
			var x1=200+(Math.sin(rad1)*20);
			var y1=200-(Math.cos(rad1)*20);
			var x2=200+(Math.sin(rad2)*20);
			var y2=200-(Math.cos(rad2)*20);
			g.append(Line(x1,y1,x2,y2));
		}
		svg.append(g);
		svg.render(this.element,true);
	},
	update: function(data) {
		svg = Svg(400,200).append(Circle(200,200,200).stroke("green").stroke_width(4).fill("yellow"));
		var g=G().stroke("black").stroke_width(4);
		for(i=1;i<45;i++) if(data.samples[i]==0) data.samples[i]=data.samples[i-1];
		for(i=1;i<45;i++) {
			var pos1 = ((i-1)*4) - 90;
			var pos2 = (i*4) - 90;
			var rad1=0.0174532925*(pos1 % 360);
			var rad2=0.0174532925*(pos2 % 360);
			var x1=200+(Math.sin(rad1)*data.samples[i-1]*2);
			var y1=200-(Math.cos(rad1)*data.samples[i-1]*2);
			var x2=200+(Math.sin(rad2)*data.samples[i]*2);
			var y2=200-(Math.cos(rad2)*data.samples[i]*2);
			g.append(Line(x1,y1,x2,y2));
		}
		svg.append(g);
		svg.render(this.element,true);
	},
});
$.widget("costum.modesmenu",{
	options:{address:"in1"},
	_create: function() {
		chnlman.on("modes." + this.options.address,function(data) {
				this.update(data);
		},this);
		var div=Div(Select().addStyle("margin: 0.5em;").options(["None"]));
		div.render(this.element);
		this.element.find("select").selectmenu({width:150});
		chnlman.send("modes:" + this.options.address + ";");
	},
	update: function(data) {
		var div=Div(Select().addStyle("margin: 0.5em;").id("sensor" + this.options.address).options(data.modes,data.mode));
		div.render(this.element,true);
		this.element.find("select").selectmenu({width:150});
	}
});

var rdr=Div().id("radar").render($("#custom1"),true);
var rdr=Div().id("modesmenu").render($("#custom2"),true);

$("#radar").radar();
$("#modesmenu").modesmenu({address:"in1"});

console.log("radarui.js loaded");
