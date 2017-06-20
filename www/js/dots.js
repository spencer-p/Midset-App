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
		var yardTo50 = ((data.yard-50)*8)/5 // yards * 8/5

		// if xsteps is IN, flip it.
		if (data.inOut == "in") { data.xSteps *= -1; }
		// if the yard is on the negative side, flip xsteps again
		if (data.side == "1") { data.xSteps *= -1; }

		// Compute final x:
		this.x = yardTo50 + data.xSteps;

		// y is easier.
		// flip ysteps if in front
		if (data.frontBack == "front") { data.ySteps *= -1; }

		// compute final y. IMPORTANT: data.yRef must be in the same form as our REF table.
		this.y = REF[data.yReference] + data.ySteps;

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
		//TODO
	}

}
