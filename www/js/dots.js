/*
 * javascript lib for dots and computuing midsets
 *
 * (c) 2017 Spencer Peterson
 *
 * Important: How we calculate cartesian coords
 * The 50 on the front sideline is (0,0).
 * To the left (side one) is negative. To the right is positive.
 * All y values are positive.
 */

// Reference data
var PRO_REF = {
	FS: 0,
	FH: 32, // behind FS
	BH: 52, // BFS
	BS: 84 // BFS
};

var REF = PRO_REF; // Ideally we should be able to toggle high school, ncaa, etc

/*
 * The dot object should
 * 1. be able to translate human readable forms (HRF) to cartesian coords
 * 2. calculate midsets (and quarters, etc)
 * 3. find yard crossings
 */

class Dot {

	constructor(data) {
		// Set a type. useful for sanity checks.
		this.type = "Dot";

		// Construct cartesian dot from broken down HRF.
		if (data.side !== undefined
			&& data.xSteps !== undefined
			&& data.inOut !== undefined
			&& data.frontBack !== undefined
			&& data.ySteps !== undefined
			&& data.yard !== undefined
			&& data.yReference !== undefined
			&& data.counts !== undefined) {

			// Iterate over keys listed above and copy them
			// Also retains any meta data passed in
			for (var key in data) {
				if (key == "x" || key == "y") {
					throw "Parsing dot - data is of conflicting types";
				}
				else {
					this[key] = data[key];
				}
			}
		}

		// Construct dot from cartesian
		else if (data.x !== undefined && data.y !== undefined && data.counts !== undefined) {
			this.x = data.x;
			this.y = data.y;
			this.counts = data.counts;
		}

		// Construct dot from text
		else if (data.rawtext !== undefined) {
			//TODO
		}

		// Fail
		else {
			throw "Failed to parse dot";
		}
	}

	// Validate a dot
	validate(data) {
		return true; //TODO
	}

	// Midpoint between two dots
	midset(to) {
		if (to.type !== "Dot") {
			return false; // Doesn't make sense
		}
		else {
			return new Dot({
				x: this.x+(to.x-this.x)/2,
				y: this.y+(to.y-this.y)/2,
				counts: to.counts/2
			});
		}
	}

	// Pure funcs compute x and y take human readable data
	// and transform it to a single x or y coord.
	computeX(data) {

		// First: Yardline to 50 in steps.
		var yardTo50 = ((50-data.yard)*8)/5 // yards * 8/5

		// Compute x relative to 50
		var x;
		if (data.inOut == "in") {
			// Invert xSteps if towards 50
			x = yardTo50 + data.xSteps * -1;
		}
		else if (data.inOut == "out") {
			x = yardTo50 + data.xSteps;
		}
		else if (data.inOut.toLowerCase() == "on") {
			// On means don't worry about xSteps. Hopefully xSteps is 0.
			x = yardTo50;
		}
		else {
			console.log("Cannot recognize data.inOut = "+data.inOut);
			x = NaN;
		}

		// if the yard is on the negative side, flip x
		if (data.side == "1") { x *= -1; }

		return x;
	}

	computeY(data) {
		// Important:  data.yReference must be in the same form as the REF table.
		var ref = REF[data.yReference];
		var ySteps = parseFloat(data.ySteps);

		if (data.frontBack == "front") {
			// Invert if in front
			return ref + ySteps * -1;
		}
		// Just in case, check back and behind
		else if (data.frontBack == "back" || data.frontBack == "behind") {
			return ref + ySteps;
		}
		else if (data.frontBack.toLowerCase() == "on") {
			// On means ysteps should be 0.
			return ref;
		}
		else {
			console.log("Cannot recognize data.frontBack = "+data.frontBack);
			return NaN;
		}
	}

	// SET/GET for X/Y
	// setting x/y computes all the human readable stuff.
	// getting x/y computes x/y from the human readable stuff.
	//
	// This way the human readable stuff can be altered easily,
	// and x/y can be computed lazily. Setting x/y is computionally
	// heavier as a result.
	//
	// The human readable stuff (xSteps, yReference, etc) is therefore
	// ALWAYS the master data and x/y are derivative of that data.

	// cartesian x
	set x(x) {
		this._x = x;
		// Compute data from x value

		// A note about the constants used here:
		// 8/5 and its inverse are steps related to yards. 50 is the center.

		//Save side
		if (x < 0) {
			this.side = "1";
		}
		else {
			this.side = "2";
		}

		// Save yard
		// 4 steps max from each yardline, 8 steps between yardlines, yardlines 
		// are multiples of 5.
		this.yard = 50 - Math.floor((Math.abs(x)+4)/8)*5;

		// Compute steps to that yardline
		this.xSteps = Math.abs(Math.abs(x)-(50-this.yard)*8/5);

		// Det. in/out
		if (Math.abs(x) < (50-this.yard)*8/5) {
			this.inOut = "in";
		}
		else if (Math.abs(x) > (50-this.yard)*8/5){
			this.inOut = "out";
		}
		else {
			this.inOut = "on";
		}
	}

	get x() {
		return this.computeX(this);
	}

	// cartesian y
	set y(y) {
		this._y = y;
		// Compute data from y value

		// Start front to back
		// First figure out what reference to use
		if (y < (REF.FH-REF.FS)/2) { // front sideline
			this.yReference = "FS";
		}
		else if (y < (REF.FS+REF.FH)+(REF.BH-REF.FH)/2) { // front hash
			this.yReference = "FH";
		}
		else if (y < (REF.FS+REF.FH+REF.BH)+(REF.BS-REF.BH)/2) { // back hash
			this.yReference = "BH";
		}
		else { // back sideline
			this.yReference = "BS";
		}

		this.ySteps = REF[this.yReference]-y; // positive ySteps means in front, so subtract y

		if (this.ySteps > 0) {
			this.frontBack = "front";
		}
		else if (this.ySteps < 0) {
			this.frontBack = "back";
			// Make sure ySteps is positive
			this.ySteps = Math.abs(this.ySteps);
		}
		else {
			this.frontBack = "on";
		}

	}

	get y() {
		return this.computeY(this);
	}

	// Text for side of the field
	get sideText() {
		return "S"+this.side;
	}

	// Human readable text for left to right
	get leftToRightText() {
		var text = "";
		if (this.inOut.toLowerCase() != "on") {
			text += this.xSteps + " ";
		}
		text += this.inOut + " " + this.yard;
		return text;
	}

	// Get human readable front to back
	get frontToBackText() {
		var text = "";
		if (this.frontBack.toLowerCase() != "on") {
			text += this.ySteps + " ";
		}
		text += this.frontBack + " " + this.yReference;
		return text;
	}

	// Full human readable text
	get humanReadable() {
		return `${this.sideText} ${this.leftToRightText} ${this.frontToBackText}`;
	}

	get hash() {
		var string = this.humanReadable;
		var hash = 0;
		if (string.length == 0) return hash;
		for (var i = 0; i < string.length; i++) {
			var char = string.charCodeAt(i);
			hash = ((hash<<5)-hash)+char;
			hash = hash & hash; // Convert to 32bit integer

		}
		return hash;
	}

}

//a = new Dot({
//	side: '2', xSteps: '3.25', inOut: "in", frontBack: "front", ySteps: "13.25", yReference: "FH", yard: 15, counts: 8
//});
//console.log(a.humanReadable());
