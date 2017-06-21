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

var Dot = function(data) {

	this.x = undefined;
	this.y = undefined;
	this.counts = undefined;

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
		
		// First: Yardline to 50 in steps.
		var yardTo50 = ((50-data.yard)*8)/5 // yards * 8/5

		// if xsteps is IN, flip it.
		if (data.inOut == "in") { data.xSteps *= -1; }

		// Compute x relative to 50
		this.x = yardTo50 + data.xSteps;

		// if the yard is on the negative side, flip x
		if (data.side == "1") { this.x *= -1; }

		// y is easier.
		// flip ysteps if in front
		if (data.frontBack == "front") { data.ySteps *= -1; }

		// compute final y. IMPORTANT: data.yRef must be in the same form as our REF table.
		this.y = REF[data.yReference] + parseFloat(data.ySteps);

		// Finally take counts
		this.counts = data.counts;
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

	// Validate a dot
	this.validate = function(data) {
		return true; //TODO
	}

	this.midset = function(to) {
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

	this.humanReadable = function() {
		var text = "S";
			
		// Decide side of field
		if (this.x <= 0) { // On 50 will say side 1
			text += "1 ";
		}
		else {
			text += "2 ";
		}

		// Determine relative yardline
		// 4 steps max from each yardline, 8 steps between yardlines, yardlines are multiples of 5
		// We calculate this ahead of time because it's used for the other calculations.
		var yard = 50 - Math.floor((Math.abs(this.x)+4)/8)*5;

		// Add steps to yardline (unless on)
		var stepsFromYard = Math.abs(Math.abs(this.x)-(50-yard)*8/5);
		if (stepsFromYard !== 0) {
			text += stepsFromYard + " ";
		}

		// Det. in/out
		if (Math.abs(this.x) < (50-yard)*8/5) {
			text += "in ";
		}
		else if (Math.abs(this.x) > (50-yard)*8/5){
			text += "out ";
		}
		else {
			text += "On ";
		}

		// Now add that yard we calculated early -- this concludes left-to-right
		text += yard + " ";

		// Start front to back
		// First figure out what reference to use
		var front = undefined;
		var reference = undefined;
		if (this.y < REF.FS) {
			// front fs
			front = true;
			reference = "FS";
		}
		else if (this.y < (REF.FH-REF.FS)/2) {
			// behind fs
			front = false;
			reference = "FS";
		}
		else if (this.y < REF.FH) {
			// front fh
			front = true;
			reference = "FH";
		}
		else if (this.y < (REF.FS+REF.FH)+(REF.BH-REF.FH)/2) {
			// behind fh
			front = false;
			reference = "FH";
		}
		else if (this.y < REF.BH) {
			// front bh
			front = true;
			reference = "BH";
		}
		else if (this.y < (REF.FS+REF.FH+REF.BH)+(REF.BS-REF.BH)/2) {
			// behind bh
			front = false;
			reference = "BH";
		}
		else if (this.y <= REF.BS) {
			// front bs
			front = true;
			reference = "BS";
		}
		else {
			// behind bs
			front = false;
			reference = "BS";
		}

		var ySteps = REF[reference]-this.y; // positive ySteps means in front

		if (ySteps !== 0) { // Not on
			text += Math.abs(ySteps) + " " + ((ySteps > 0)?"front":"back") + " " + reference;
		}
		else {
			text += "On " + reference;
		}

		// Done
		return text;
	}

}

a = new Dot({
	side: '2', xSteps: '3.25', inOut: "in", frontBack: "front", ySteps: "13.25", yReference: "FH", yard: 15, counts: 8
});
console.log(a.humanReadable());
