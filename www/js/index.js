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
		return {
			id : id,
			show_more : true,
			text : "New set",
			data: {
				frontBack : "front",
				inOut : "in",
				side : "1",
				xSteps : "0",
				yReference : "FH",
				ySteps : "0",
				yard : "50",
				counts: 0
			}
		}
	}

	// Compute analysis
	self.computeAnalysis = function(index) {
		// Only do work if there is a set after to do math with
		if (index < self.vue.sets.length-1
			&& self.vue.sets[index].dot != undefined
			&& self.vue.sets[index+1].dot != undefined) {
			var analysis = {};
			// Compute midset
			var midset = self.vue.sets[index].dot.midset(self.vue.sets[index+1].dot);
			analysis.midset = midset.humanReadable;

			// Update analysis in model
			self.vue.sets[index].analysis = analysis;
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
			// Generate dot
			self.vue.sets[index].dot = new Dot(self.vue.sets[index].data);
			console.log("Computed dot at "+index+": "+self.vue.sets[index].dot.humanReadable);

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
		// If not last, generate next midset
		self.computeAnalysis(index);

		// If not first, generate prev midset
		if (index != 0) {
			self.computeAnalysis(index-1);
		}
	}

	// Get midset of an indexed set
	self.getMidset = function(index) {
		if (self.vue === undefined || index >= self.vue.sets.length - 1) {
			return;
		}
		var dot1 = new Dot(self.vue.sets[index]);
		console.log(dot1.x + " " + dot1.y)
		var dot2 = new Dot(self.vue.sets[index+1]);
		console.log(dot2.x + " " + dot2.y)
		var midset = dot1.midset(dot2);
		console.log(midset.x);
		console.log(midset.y);
		return midset.humanReadable;
	}

	self.vue = new Vue({
		el: "#app",
		data: {
			sets: [
				{
					id : 0,
					show_more : false,
					text : "Left right up down",
					data: {
						frontBack : "front",
						inOut : "in",
						side : "1",
						xSteps : "3",
						yReference : "FH",
						ySteps : "6",
						yard : "25",
						counts: 8
					}

				},
				{
					id : 1,
					show_more : false,
					text : "Front of the front hash or other stuff",
					data: {
						frontBack : "behind",
						inOut : "in",
						side : "2",
						xSteps : "4",
						yReference : "BS",
						ySteps : "4",
						yard : "35",
						counts: 8
					}
				}
			],
			title: "Midset Calculator"
		},
		methods: {
			onClickAdd: self.onClickAdd,
			onClickSet: self.onClickSet,
			onClickDeleteSet: self.onClickDeleteSet,
			getMidset: self.getMidset
		}
	});

	return self;
};

var APP = null;

jQuery(function() {
	APP = app();
	APP.initialize();
});

