/*
 *	chnlmanager.js
 *
 *	chnlManager handles websocket connection and dispatch messages according to channel.
 *
*/
function get_appropriate_ws_url() {
	var pcol;
	var u = document.URL;
	if (u.substring(0, 5) == "https") {
		pcol = "wss://";
		u = u.substr(8);
	} else {
		pcol = "ws://";
		if (u.substring(0, 4) == "http")
			u = u.substr(7);
	}
	u = u.split('/');
	return pcol + u[0] + "/xxx";
}
function chnlManager() { 
	this.listener = [];
	var chnlm = this;
	if (typeof MozWebSocket != "undefined") {
		this.socket_di = new MozWebSocket(get_appropriate_ws_url(),"port-data-protocol");
	} else {
		this.socket_di = new WebSocket(get_appropriate_ws_url(),"port-data-protocol");
	}
	try {
		this.socket_di.onopen = function() {
			chnlm.dispatch('{channel:"network",data:{status:"connected"}}');
		} 
		this.socket_di.onmessage =function (msg) {
			chnlm.dispatch(msg.data.toString());
		} 
		this.socket_di.onclose = function(){
			chnlm.dispatch('{channel:"network",data:{status:"disconnected"}}');
		}
	} catch(exception) {
		alert('<p>Error' + exception);  
	}
}
chnlManager.prototype.send = function(msg) {
	this.socket_di.send(msg);
}
chnlManager.prototype.on = function(chnl,cb,cntx) { this.listener.push({channel:chnl,callback:cb,contex:cntx}); }
chnlManager.prototype.removeListenerContex = function(cntx) {
	var nl = [];
	while(this.listener.length>0) {
		var e = this.listener.pop();
		if(e.contex!=cntx) nl.push(e);
		}
	this.listener = nl;
}
chnlManager.prototype.removeListener = function(chnl,cb) {
	var nl = [];
	while(this.listener.length>0) {
		var e = this.listener.pop();
		if(e.channel!=chnl && e.callback!=cb) nl.push(e);
		}
	this.listener = nl;
}
chnlManager.prototype.dispatch = function(data) {
	eval("var od=" + data + ";");
	for(var i=0;i < this.listener.length;i++) { 
		var cntx = this.listener[i].contex!=undefined ? this.listener[i].contex : this;
		if(this.listener[i].channel == od.channel) this.listener[i].callback.apply(cntx,[od.data]); 
	}
}
