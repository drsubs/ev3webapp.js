var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

/*
		Sensor widget.
*/

$.widget("costum.sensor",{
	splist:{driver_name:"Driver",mode:"Mode",value0:"Value"},
	painters: { 
			"allsensor":[sensorInit,sensorUpdate],
			"TOUCH":[sensorTouchInit,sensorTouchUpdate],
			"IR-PROX":[irProxInit,irProxUpdate],
			"COL-AMBIENT":[colorAmbientInit,colorAmbientUpdate],
			"RGB-RAW":[colorRGBInit,colorRGBUpdate],
			"COL-COLOR":[colorColorInit,colorColorUpdate],
			"IR-REM-A":[irRemoteInit,irRemoteUpdate],
			"IR-SEEK":[irSeekInit,irSeekUpdate]
		},
	painter:"",
	options:{
		port : "in1",
		painterInit: sensorInit,
		painterUpdate: sensorUpdate,
		selector:false,
	},
	rcv: function(data) {
		this.update(data);
	},
	_create: function() {
		this.options.painterInit.apply(this,[this]);
		chnlman.on("sensordata."+ this.options.port,this.rcv,this);
		chnlman.send("sensordata:" + this.options.port + ";");
	},
	_destroy: function() {
		chnlman.removeListenerContex(this);
	},
	update: function(data) {
		if(this.painter!="COSTUM") {
			if(data.mode==0) m="allsensor";
				else m=data.mode;
			if(!this.painters[m]) m="allsensor";
			if(this.painter!=m) {
				this.options.painterInit=this.painters[m][0];
				this.options.painterUpdate=this.painters[m][1];
				this.options.painterInit.apply(this,[this]);
				var mds = data.modes.split(' ');
				if(mds.length > 1 && this.options.selector) {
					var slct = Select().options(mds,data.mode).render(this.element.find('.sensormodes'),true);
					this.element.find('select').selectmenu({
						width: 195,
						change: function(event,ui) {
							console.log("select",ui.item.value);
							chnlman.send(data.address + ":mode " + ui.item.value + ";");
						}
					});
					
				}
			}
		}
		this.options.painterUpdate.apply(this,[data]);
	},
	clear: function() {
		console.log("Clear");
		this.painter="allsensor";
		this.options.painterInit=this.painters.allsensor[0];
		this.options.painterUpdate=this.painters.allsensor[1];
		this.options.painterInit.apply(this,[this]);
	},
});

/*
		Motor widget.
*/
function loadMotor(target,port) {
	Fieldset(Legend(port)).id("motor" + port)
		.addClass("motor").render($("#" + target));
	$("#motor" + port).motor({port:port,controls:false});
}

$.widget("costum.motor",{
	_create: function() {
		var self = this;
		this.element.html("<legend>" + self.options.port + "</legend>");
		this.element.append("<div>PortData <span class='portstatus'>Disconnected</span></div>");
		for(var p in this.commands) {
			this.element.append("<div>" + this.commands[p] + ":<span class='motorvalue " + p + "'>0</span></div>");
		}
		if(options.controls) {
			cmds = $('<div>');
			cmds.motorctrl({port:this.options.port,cmd:function(event,data){ if(self.options.connected) self._trigger("cmd",null,data); } } );
			this.element.append(cmds);
		}
		chnlman.on("motordata." + this.options.port,this.update,this);		
	},
	_destroy: function() {
		chnlman.removeListenerContex(this);
	},
	update: function(data) {
		this.options.connected=true;
		this.element.find(".portstatus").html("Connected");
		for(var p in this.commands) {
			this.element.find("." + p).html(data[p]);
		}			
	},
	commands:{stop_command:"Stop command",duty_cycle_sp:"Duty cycle sp",speed:"Speed",state:"State",position:"Position"},
	options:{
		port : "outA",
		cmd:function(event,data) {console.log("Command catch in fallback ",data);},
		connected:false,
		controls:false,
	},
});

/*
		MotorCtrl widgit.
*/

$.widget("costum.motorctrl",{
	_create: function() {
		var self = this;
		var port=this.options.port;
		
		Div(Select().addClass("cmdselect")
			.options(this.commands,this.options.command))
			.addClass("cmd")
			.append(Button("send").addClass("runcmd")).render(this.element); 
		
		Div(Select()
			.addClass("stopcmdselect")
			.options(this.stop_commands,this.options.stop_command))
			.addClass("cmd")
			.append(Button("send").addClass("runscmd")).render(this.element);
		
		var sldrid = "motorslider" + port;
		var sldrlabelid = "motorsliderlabel" + port;

		Div(Label("Duty Cycle").for(sldrid).id(sldrlabelid).append(Span("0").addStyle("float:right;")))
			.append(Div().id(sldrid)).render(this.element);
		
		this.element.find(".runcmd").button().click(function() {
			self._trigger("cmd",null,{property:"command",port:self.options.port,value:self.options.command});
		});
		this.element.find(".runscmd").button().click(function() {
			self._trigger("cmd",null,{property:"command",port:self.options.port,value:self.options.stop_command});
		});
		this.element.find('.cmdselect').selectmenu({
					width: 190,
					change: function(event,ui) {
						self.options.command=ui.item.value;
					}
				});
		this.element.find('.stopcmdselect').selectmenu({
					width: 190,
					change: function(event,ui) {
						self.options.stop_command=ui.item.value;
					}
				});
		this.element.find("#" + sldrid).slider({
			max:100,
			min:-100,
			value:0,
			change:function(event,ui) {
				console.log("Duty cycles port " + port,$(this).slider("value"));
				var sp = Span(ui.value.toString()).addStyle("float:right;");
				$('#' + sldrlabelid).html("Duty Cycles").append(sp.render());
				self._trigger("cmd",null,{property:"duty_cycles_sp",port:self.options.port,value:ui.value.toString()});
				},
			slide:function(event,ui) {
				var sp = Span(ui.value.toString()).addStyle("float:right;");
				$('#' + sldrlabelid).html("Duty Cycles ").append(sp.render());
				},
			});
	},
	commands : ["run-forever", "run-to-abs-pos", "run-to-rel-pos", "run-timed", "run-direct", "stop", "reset"],
	stop_commands : ["coast", "brake", "hold"],
	options: {
		port: "outA",
		command: "run-forever",
		stop_command: "coast",
		duty_cycles:0
	},

});

/*
 * 	doc widget and loadDoc function.
 * 	Loads the index.html of the project into element of target.
 * 
 * 				loadDoc("custom1");
 */

$.widget("custom.doc",{
	_create:function() {
			var self=this;
			$.get("/projects/" + config.current + "/index.html",function(data) {
					self.element.html(data);
			});
	},
});

function loadDoc(target) {
	var div=Div().id(target + "doc").render($("#" + target));
	$("#" + target + "doc").doc();
}
function loadSensor(target,port) {
	Fieldset(Legend("In1")).id("sensor" + port)
		.addClass("sensor")
		.append(Div().addClass("sensormodes"))
		.append(Div().addClass("sensorcontainer")).render($("#" + target));

	$("#sensor" + port).sensor({port:port,selector:false});
}

/*
	Painter functions for sensors.

*/
function portData(con) {
	return Div("PortData").append(Span(con ? "Connected":"Disconnected").addClass("sensorvalue")).render();
}	
function irProxInit() {
	this.element.find('legend').html(this.options.port + " ir proximation");
	this.element.find('.sensorcontainer').html(portData(false));
	for(var p in this.splist) {
		Div(this.splist[p] + ":")
			.append(Span("0")
			.addClass("sensorvalue " + p))
			.render(this.element.find('.sensorcontainer'));
	}

//	for(var p in this.splist) {
//		this.element.find('.sensorcontainer').append("<div>" + this.splist[p] + ":<span class='sensorvalue " + p + "'>0</span></div>");
//	}
	this.dataline=[];
	svg = Svg(190,50);
	svg.append(Rect(190,50).stroke("green").stroke_width(2).fill("yellow"));
	for(i=0;i<100;i++) {
		this.dataline.push(0);
		var x=i*2;
		var y1=0;
		var y2=1;
		svg.append(Line(x,y1,x,y2).stroke("black").stroke_width(4));
	}
	svg.render(this.element.find('.sensorcontainer'));
}
function irProxUpdate(data) {
	this.painter="IR-PROX";
	this.element.find('legend').html(this.options.port + " Ir proximation");
	this.element.find('.sensorcontainer').html(portData(true));
	for(var p in this.splist) {
		Div(this.splist[p] + ":")
			.append(Span(data[p])
			.addClass("sensorvalue " + p))
			.render(this.element.find('.sensorcontainer'));
	}


//	for(var p in this.splist) {
//		this.element.find('.sensorcontainer').append("<div>" + this.splist[p] + ":<span class='sensorvalue " + p + "'>" + data[p] + "</span></div>");
//	}
	svg = Svg(190,50);
	svg.append(Rect(190,50).stroke("green").stroke_width(2).fill("yellow"));
	this.dataline.unshift(data.value0);
	this.dataline.pop();
	for(i=0;i<100;i++) {
		var x=i*2;
		var y2=(this.dataline[i]/2)+2;
		var y1=y2-2;
		svg.append(Line(x,y1,x,y2).stroke("black").stroke_width(4));
	}
	svg.render(this.element.find('.sensorcontainer'));
}

function sensorValue(lbl,v) {
	return Div(lbl + ":").append(Span(v).addClass("sensorvalue")).render();
}	
function sensorTouchInit() {}
function sensorTouchUpdate(data) {
	this.painter="TOUCH";
	this.element.find('legend').html(data.address + " Touch");
	this.element.find('.sensorcontainer').html(portData(true));
	this.element.find('.sensorcontainer').append(sensorValue("Mode",data.mode));
	this.element.find('.sensorcontainer').append(sensorValue("State",(parseInt(data.value0) ? "Down" : "Up")));
}

function sensorInit() {
	this.element.find('legend').html(this.options.port);
	this.element.find('.sensorcontainer').html(portData(false));
	for(var p in this.splist) {
		Div(this.splist[p] + ":")
			.append(Span("0")
			.addClass("sensorvalue " + p))
			.render(this.element.find('.sensorcontainer'));
	}
}
function sensorUpdate(data) {
	this.painter="allsensor";
	this.element.find(".portstatus").html("Connected");
	for(var p in this.splist) {
		this.element.find("." + p).html(data[p]);
	}			
}
function colorAmbientInit() {
}
function colorAmbientUpdate(data) {
	this.painter="COL-AMBIENT";
	this.element.find('legend').html(data.address + " Color Ambient");
	this.element.find('.sensorcontainer').html(portData(true));
	this.element.find('.sensorcontainer').append(sensorValue("Mode",data.mode));
	this.element.find('.sensorcontainer').append(sensorValue("Value",data.value0));
}
function colorRGBInit() {
}
function RGB(r,g,b) {
	return "RGB(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) + ")";
}
function colorRGBUpdate(data) {
	this.painter="RGB-RAW";
	this.element.find('legend').html(data.address + " Color Ambient");
	this.element.find('.sensorcontainer').html(portData(true));
	this.element.find('.sensorcontainer').append(sensorValue("Mode",data.mode));
	var clrEx = $('<div>').css("width",16)
		.css("height",16)
		.css("background-color", RGB(data.value0[0]/2,data.value0[1]/2,data.value0[2]/2) )
		.css("float","right");
	var vl = sensorValue("Value","R " + data.value0[0] + " G " + data.value0[1] + " B " + data.value0[2]);
	vl.append(clrEx);
	this.element.find('.sensorcontainer').append(vl);
}
function colorColorInit() {
}
var clrTable = ["None","Black","Blue","Green","Yellow","Red","White","Brown"];
function colorColorUpdate(data) {
	this.painter="COL-COLOR";
	this.element.find('legend').html(data.address + " Color Name");
	this.element.find('.sensorcontainer').html(portData(true));
	this.element.find('.sensorcontainer').append(sensorValue("Mode",data.mode));
	this.element.find('.sensorcontainer').append(sensorValue("Value",clrTable[data.value0 & 7]));
}
function irSeekInit() {
	this.element.find('legend').html(this.options.port);
	this.element.find('.sensorcontainer').html(portData(false));
	for(var p in this.splist) {
		this.element.find('.sensorcontainer').append("<div>" + this.splist[p] + ":<span class='sensorvalue " + p + "'>0</span></div>");
	}
}
function irSeekUpdate(data) {
	this.painter="IR-SEEK";	
	this.element.find(".portstatus").html("Connected");
	for(var p in this.splist) {
		this.element.find("." + p).html(data[p]);
	}	
	var str="";
	for(var i=0;i<data.value0.length;i++) {
		str+=data.value0[i] + " "; 
	}
	this.element.find(".value0").html(str);
}
function irRemoteInit() {
	this.btnstate=[0,0,0,0,0];
}
function irRemoteUpdate(data) {
	this.painter="IR-REM-A";	
	if(data.value0!=384) {
		for(i=1;i<5;i++) {
			if(this.btnstate[i]) {
				var b=(data.value0 & 0xf0) >> 4;
				if(! (b & (1 << (i-1))) ) this.btnstate[i]=0;
			} else {
				var b=(data.value0 & 0xf0) >> 4;
				if((b & (1 << (i-1))) ) this.btnstate[i]=1;
			}
		}
	}

	this.element.find('legend').html(data.address + " ir remote");
	this.element.find('.sensorcontainer').html(portData(true));
	this.element.find('.sensorcontainer').append(sensorValue("Value",data.value0==384 ? "Idle" : data.value0));
	var btns = $('<div>');
	for(i=1;i<5;i++) {
		var btn = $('<button>').addClass((this.btnstate[i] ? "btn-down":"btn-up")).html(i);
		btns.append(btn);
	}
	this.element.find('.sensorcontainer').append(btns);
}
