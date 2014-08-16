// App bootstrap
var App = require("core");

var interval;

function init() {
	$.Status.text = "Connecting to Pebble";
	
	interval = setInterval(function() {
		if($.Dots.text.length > 2) {
			$.Dots.text = "";
		} else {
			$.Dots.text = $.Dots.text + ".";
		}
	}, 500);
}

init();







/*
var Pebble = require("org.beuckman.tipebble");

Pebble.setAppUUID("XXX-XXX-XXXX");

function watchConnected(e) {
	$.Status.text = "Connected";
	
	clearInterval(interval);
}

function watchDisonnected(e) {
	$.Status.text = "Disconnected";
}

Pebble.addEventListener("watchConnected", watchConnected);
Pebble.addEventListener("watchDisconnected", watchDisonnected);

function launchApp() {
	Pebble.launchApp({
		success: function(e) {
			$.Status.text = "Application Launched";
		},
		error: function(e) {
			$.Status.text = "Could Not Launch";
		}
	});
}

function killApp() {
	Pebble.killApp({
		success: function(e) {
			$.Status.text = "Application Closed";
		},
		error: function(e) {
			$.Status.text = "Could Not Close";
		}
	});
}
*/