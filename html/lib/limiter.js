/*
 *
 *  limiter.js
 * 
 */
function Limiter(rate,fnc) {
	this.cnt=0;
	this.fnc=fnc;
	this.rate=rate;
	Limiter.prototype.run = function() {
		if(this.cnt++ > this.rate) {
			this.cnt=0;
			this.fnc();
		}
	}
	Limiter.prototype.force = function() {
		this.cnt=0;
		this.fnc();
	}
}
