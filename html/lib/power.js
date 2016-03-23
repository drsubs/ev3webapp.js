/*
 *
 *  power.js
 * 
 */

var Power = {
	plist:["current_now","voltage_now","type"],
	cnt:0,
	update: function(chnl) {
		msg={};
		for(var i=0;i<Power.plist.length;i++) {
			msg[Power.plist[i]]=System.Power.read(Power.plist[i]);
		}
		Msg.send("power",JSON.stringify(msg));
	},
	run: function() {
		if(Power.cnt++ > 15) {
			Power.cnt=0;
			Power.update();
		}
	}
}
