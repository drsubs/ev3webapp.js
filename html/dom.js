/*
 * 	dom.js
 * 	Dom constructor kit.
 * 	All DCK element have a contructor function like Div here,
 * 	and all setter return "this", that makes them cascadeable.
 * 
 * 			var div=Div("Hej").id("someid").addClass("someclass").addStyle("color:red;");
 * 			
 * 	Then we render it into a elemnt on the page.
 * 
 * 			div.render($("#sometarget"),true);
 * 	
 * 	All DCK elements have the following metodes:
 * 		add(attribute,value)
 * 		addClass(classes)
 * 		addStyle(style)
 * 		append(element)
 * 		prepend(element)
 * 		id(id)
 * 		value([value])
 * 		render([target][,purgeflag])
 * 	
 * 	Dom elements:
 * 		Div
 * 		Span
 * 		Fieldset
 * 		Legend
 * 		Label
 * 		Li
 * 		Ul
 * 		Button
 * 		Select
 * 		Option
 * 		
 * 	Svg elements:
 * 		Svg
 * 		G
 * 		Rect
 * 		Circle
 * 		Line
 * 		Path
 */
 
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};


function Dom(c) { 
	this.cnt=[];
	if(c) this.cnt.push(c);
	this.attr={};
}
Dom.prototype.append = function(c) { this.cnt.push(c); return this; }
Dom.prototype.prepend = function(c) { this.cnt.shift(c); return this; }
Dom.prototype.render = function(elem,purge) {
	var dom=this.build();
	for(var i=0;i<this.cnt.length;i++) {
		if(this.cnt[i] instanceof Dom) dom.append(this.cnt[i].render());
			else dom.append(this.cnt[i])
	}
	if(elem instanceof jQuery) if(purge===true) elem.html(dom); else elem.append(dom);
	return dom;
}
Dom.prototype.addStyle = function(s) {
	if(!this.attr.style) this.attr.style="";
	this.attr.style+=s;
	return this;
}
Dom.prototype.addClass = function(s) {
	if(!this.attr.class) this.attr.class="";
	this.attr.class+=s;
	return this;
}
Dom.prototype.tag = function() { return ""; };
Dom.prototype.build = function() {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	return $('<' + this.tag() + astr + '>');
}
Dom.prototype.value=function(v) {
	if(v === undefined) return this.attr.value;
	this.attr.value=v;
	return this;
}
Dom.prototype.id=function(v) {
	if(v === undefined) return this.attr.id;
	this.attr.id=v;
	return this;
}
Dom.prototype.add=function(a,v) {
	this.attr[a]=v;
	return this;
}
// Element Option
function _Option(c) { Dom.apply(this,[c]); }
 __extends(_Option,Dom);
_Option.prototype.tag = function() { return "option"; }
function Option(c) { return new _Option(c); }


// Element Select
function _Select(c) { Dom.apply(this,[c]); }
 __extends(_Select,Dom);
_Select.prototype.tag = function() { return "select"; }
_Select.prototype.newOption = function(v,c) { 
	var opt=Option(c).value(v);
	this.append(opt);
	return opt;
}
_Select.prototype.options = function(a,selected) {
	if( Object.prototype.toString.call( a ) === '[object Array]' ) {	
		for(var i=0;i<a.length;i++) if(selected == a[i]) this.newOption(a[i],a[i]).add("selected","selected"); else this.newOption(a[i],a[i]);
	} else {
		for(var v in a) if(selected != v) this.newOption(v,a[v]); this.newOption(v,a[v]).add("selected","selected");
	}
	return this;
}
function Select(c) { return new _Select(c); }

// Element Button
function _Button(c) { Dom.apply(this,[c]); }
 __extends(_Button,Dom);
_Button.prototype.tag = function() { return "button"; }
function Button(c) { return new _Button(c); }

// Element Div
function _Div(c) { Dom.apply(this,[c]); }
 __extends(_Div,Dom);
_Div.prototype.tag = function() { return "div"; }
function Div(c) { return new _Div(c); }

// Element Fieldset
function _Fieldset(c) { Dom.apply(this,[c]); }
 __extends(_Fieldset,Dom);
_Fieldset.prototype.legend = function(c) { this.prepend(Legend(c)); return this; }
_Fieldset.prototype.tag = function() { return "fieldset"; }
function Fieldset(c) { return new _Fieldset(c); }

// Element Legend
function _Legend(c) { Dom.apply(this,[c]); }
 __extends(_Legend,Dom);
_Legend.prototype.tag = function() { return "legend"; }
function Legend(c) { return new _Legend(c); }

// Element Li
function _Li(c) { Dom.apply(this,[c]); }
 __extends(_Li,Dom);
_Li.prototype.tag = function() { return "li"; }
function Li(c) { return new _Li(c); }

// Element Ul
function _Ul(c) { Dom.apply(this,[c]); }
 __extends(_Ul,Dom);
_Ul.prototype.tag = function() { return "ul"; }
function Ul(c) { return new _Ul(c); }



// Element Label
function _Label(c) { Dom.apply(this,[c]); }
 __extends(_Label,Dom);
_Label.prototype.tag = function() { return "label"; }
_Label.prototype.for = function(v) { this.add("for",v); return this; }
function Label(c) { return new _Label(c); }

// Element Span
function _Span(c) { Dom.apply(this,[c]); }
 __extends(_Span,Dom);
_Span.prototype.tag = function() { return "span"; }
function Span(c) { return new _Span(c); }


// Element G
function _G(c) { Dom.apply(this,[c]); }
 __extends(_G,Dom);
_G.prototype.render = function(elem,purge) {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	var str="<g" + astr + ">";
	for(var i=0;i<this.cnt.length;i++) {
		if(this.cnt[i] instanceof Dom) str+=this.cnt[i].render();
			else str+=this.cnt[i];
	}
	str+="</g>";
	if(elem instanceof jQuery) {
		if(purge) elem.html(str); else elem.append(str);
	}
	return str;
}
_G.prototype.stroke = function(s) { return this.add("stroke",s); }
_G.prototype.stroke_width = function(w) { return this.add("stroke-width",w); }
function G(c) { 
	return new _G(c); 
}

// Element Path
function _Path(c) { Dom.apply(this,[c]); }
 __extends(_Path,Dom);
_Path.prototype.render = function(elem,purge) {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	var str="<path" + astr + ">";
	for(var i=0;i<this.cnt.length;i++) {
		if(this.cnt[i] instanceof Dom) str+=this.cnt[i].render();
			else str+=this.cnt[i];
	}
	str+="</path>";
	if(elem instanceof jQuery) {
		if(purge) elem.html(str); else elem.append(str);
	}
	return str;
}
_Path.prototype.qbezier = function(a,b,c,d) {
	if(attr.d==undefined) attr.d="";
	attr.d+="Q " + a + " " + b + " " + c + " " + d + " ";
}
_Path.prototype.move = function(x,y) {
	if(attr.d==undefined) attr.d="";
	attr.d+="m " + x + " " + y + " ";
}
_Path.prototype.line = function(x,y) {
	if(attr.d==undefined) attr.d="";
	attr.d+="l " + x + " " + y + " ";
}
_Path.prototype.moveTo = function(x,y) {
	if(attr.d==undefined) attr.d="";
	attr.d+="M " + x + " " + y + " ";
}
_Path.prototype.lineTo = function(x,y) {
	if(attr.d==undefined) attr.d="";
	attr.d+="L " + x + " " + y + " ";
}
_Path.prototype.stroke = function(s) { return this.add("stroke",s); }
_Path.prototype.stroke_width = function(w) { return this.add("stroke-width",w); }
function Path(c) { 
	return new _Path(c); 
}

// Element Svg
function _Svg() { Dom.apply(this); }
 __extends(_Svg,Dom);
_Svg.prototype.tag = function() { return "svg"; }
_Svg.prototype.render = function(elem,purge) {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	var str="<svg" + astr + ">";
	for(var i=0;i<this.cnt.length;i++) {
		if(this.cnt[i] instanceof Dom) str+=this.cnt[i].render();
			else str+=this.cnt[i];
	}
	str+="</svg>";
	if(elem instanceof jQuery) {
		if(purge) elem.html(str); else elem.append(str);
	}
	return str;
}

function Svg(w,h) { 
	var s=new _Svg(); 
	return s.add("width",w).add("height",h);
}

// Element Line
function _Line(c) { Dom.apply(this,[c]); }
 __extends(_Line,Dom);
_Line.prototype.tag = function() { return "line"; }
_Line.prototype.build = function() {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	return '<' + this.tag() + astr + ' />';
}
_Line.prototype.set = function(x1,y1,x2,y2) { return this.add("x1",x1).add("y1",y1).add("x2",x2).add("y2",y2); }
_Line.prototype.stroke = function(s) { return this.add("stroke",s); }
_Line.prototype.stroke_width = function(w) { return this.add("stroke-width",w); }
function Line(x1,y1,x2,y2) { 
	var l=new _Line(); if(y2 != undefined) return l.set(x1,y1,x2,y2); 
	return l;
}

// Element Circle
function _Circle(c) { Dom.apply(this,[c]); }
 __extends(_Circle,Dom);
_Circle.prototype.build = function() {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	return "<circle" + astr + " />";
}
_Circle.prototype.render = function() {
	return this.build();
}
_Circle.prototype.set = function(cx,cy,r) { return this.add("cx",cx).add("cy",cy).add("r",r); }
_Circle.prototype.stroke = function(s) { return this.add("stroke",s); }
_Circle.prototype.fill = function(f) { return this.add("fill",f); }
_Circle.prototype.stroke_width = function(w) { return this.add("stroke-width",w); }
function Circle(cx,cy,r) { 
	var l=new _Circle(); if(r != undefined) return l.set(cx,cy,r); 
	return l;
}

// Element Rect
function _Rect(c) { Dom.apply(this,[c]); }
 __extends(_Rect,Dom);
_Rect.prototype.build = function() {
	var astr="";
	for(var a in this.attr) astr+=" " + a + '="' + this.attr[a] +'"';
	return "<rect" + astr + " />";
}
_Rect.prototype.render = function() {
	return this.build();
}
_Rect.prototype.set = function(w,h) { return this.add("width",w).add("height",h); }
_Rect.prototype.stroke = function(s) { return this.add("stroke",s); }
_Rect.prototype.fill = function(f) { return this.add("fill",f); }
_Rect.prototype.stroke_width = function(w) { return this.add("stroke-width",w); }
function Rect(w,h) { 
	var l=new _Rect(); if(h != undefined) return l.set(w,h); 
	return l;
}










