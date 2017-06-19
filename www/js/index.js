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
		$("#app").show();
    };

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    self.onDeviceReady = function() {
        self.receivedEvent('deviceready');
    };

    // Update DOM on a Received Event
    self.receivedEvent = function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    };

	self.onClickAdd = function() {
		console.log("onClickAdd()");
		// Insert another empty set at the end
		self.vue.sets.splice(self.vue.sets.length, 1, {
			id: self.vue.sets.length,
			text: "",
			show_more: false
		});
	};

	self.onClickSet = function(id) {
		console.log("onClickSet()");
		self.vue.sets[id].show_more = !self.vue.sets[id].show_more;
	};

	self.onClickEditSet = function(id) {
		console.log("onClickEditSet()");
	};
	
	self.vue = new Vue({
		el: "#app",
		data: {
			sets: [
				{id: 0, text: "Left right up down", show_more: false},
				{id: 1, text: "Front of the front hash or other stuff", show_more: false}	
			],
			title: "Midset Calculator"
		},
		methods: {
			onClickAdd: self.onClickAdd,
			onClickSet: self.onClickSet,
			onClickEditSet: self.onClickEditSet
		}
	});

	return self;
};

var APP = null;

jQuery(function() {
	APP = app();
	APP.initialize();
});

