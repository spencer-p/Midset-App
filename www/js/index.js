/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = function() {

	var self = {};

    // Application Constructor
    self.initialize = function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

		// In the future, we will load old sets here (probably)

		// Update midsets of dots
		self.fillMissingAnalysis();
    };

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    self.onDeviceReady = function() {
		$("#app").show();
		$('.page-footer').show();

        self.receivedEvent('deviceready');
    };

    // Update DOM on a Received Event
    self.receivedEvent = function(id) {
        console.log('Received Event: ' + id);
    };

	// Template for new sets
	self.NEW_SET = function(id) {
		return new Dot({
			id : id,
			show_more : true,
			text : "New set",

			frontBack : "front",
			inOut : "in",
			side : "1",
			xSteps : "0",
			yReference : "FH",
			ySteps : "0",
			yard : "50",
			counts: 0
		});
	}

	self.fillMissingAnalysis = function() {
		for (var i = 0; i < self.vue.sets.length; i++) {
			if (self.vue.sets[i].analysis == undefined) {
				self.computeAnalysis(i);
			}
		}
	}

	// Compute analysis
	// sets set[index] analysis to the midset between the dot before and itself
	self.computeAnalysis = function(index) {
		// Only do work if there is a set before to do math with
		if (index > 0 && index < self.vue.sets.length) {
			var analysis = {};
			// Compute midset
			var midset = self.vue.sets[index-1].midset(self.vue.sets[index]);
			analysis.midset = midset.humanReadable;

			analysis.crossings = self.vue.sets[index-1].yardLineCrossings(self.vue.sets[index]);

			// Update analysis in model
			self.vue.$set(self.vue.sets[index], "analysis", analysis);
		}
	}

	self.onClickAdd = function() {
		console.log("onClickAdd()");
		// Insert another empty set at the end
		self.vue.sets.splice(self.vue.sets.length, 1, self.NEW_SET(self.vue.sets.length));
	};

	self.onClickSet = function(index) {
		console.log("onClickSet()");

		// Leaving show_more - compute new data
		if (self.vue.sets[index].show_more) {
			// update midsets
			self.updateAnalysisAround(index);
		}
		// Enter show_more
		else {

		}

		// Toggle show more
		self.vue.sets[index].show_more = !self.vue.sets[index].show_more;

		// Enable the select inputs. This is set to a timeout of 0
		// because it has to happen after the function returns and Vue
		// actually creates the select elements. I do not know if there
		// is a better way to do this.
		setTimeout(function() {$('select').material_select();}, 0);
	};

	self.onClickDeleteSet = function(index) {
		console.log("onClickDeleteSet()");
		self.vue.sets.splice(index,1);
		// Now we need to update the midset before and at index.
		self.updateAnalysisAround(index);
	};

	// Shuffle function for testing set movement animation
	self.shuffle = function (a) {
		var j, x, i;
		for (i = a.length; i; i--) {
			j = Math.floor(Math.random() * i);
			x = a.splice(i-1, 1, a[j]);
			a.splice(j, 1, x[0]);
		}

	};

	self.updateAnalysisAround = function(index) {
		// Update own midset
		self.computeAnalysis(index);

		// Update midset coming from this set
		self.computeAnalysis(index+1);

		// If this is the first set, there is no preceding set and our analysis should be deleted
		if (index == 0) {
			self.vue.sets[index].analysis = undefined;
		}
	}

	self.vue = new Vue({
		el: "#app",
		data: {
			sets: [
				new Dot({
					id : 0,
					show_more : false,
					text : "Left right up down",

					frontBack : "front",
					inOut : "in",
					side : "1",
					xSteps : "3",
					yReference : "FH",
					ySteps : "6",
					yard : "25",
					counts: 8
				}),
				new Dot({
					id : 1,
					show_more : false,
					text : "Front of the front hash or other stuff",

					frontBack : "behind",
					inOut : "in",
					side : "2",
					xSteps : "4",
					yReference : "BS",
					ySteps : "4",
					yard : "35",
					counts: 8
				})
			],
			title: "Midset Calculator"
		},
		methods: {
			onClickAdd: self.onClickAdd,
			onClickSet: self.onClickSet,
			onClickDeleteSet: self.onClickDeleteSet
		}
	});

	return self;
};

var APP = null;

jQuery(function() {
	APP = app();
	APP.initialize();
});
