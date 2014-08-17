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
	
	App.Pebble.getVersionInfo({
		success: function(_event) {
			watchConnected();
			launchApp();
		},
		error: function(_event) {
		   watchDisonnected();
		}
	});
}

function watchConnected(_event) {
	$.Status.text = "Connected";
	
	clearInterval(interval);
	$.Dots.text = "✓";
}

function watchDisonnected(_event) {
	$.Status.text = "Disconnected";
	
	clearInterval(interval);
	$.Dots.text = "✗";
}

App.Pebble.addEventListener("watchConnected", watchConnected);
App.Pebble.addEventListener("watchDisconnected", watchDisonnected);

function launchApp() {
	App.Pebble.launchApp({
		success: function(_event) {
			$.Status.text = "Application Launched";
		},
		error: function(_event) {
			$.Status.text = "Could Not Launch";
		}
	});
}

function killApp() {
	App.Pebble.killApp({
		success: function(_event) {
			$.Status.text = "Application Closed";
		},
		error: function(_event) {
			$.Status.text = "Could Not Close";
		}
	});
}

function sendMessage() {
	App.Pebble.sendMessage({
		message: {
			0: 123,
			1: "TiPebble"
		},
		success: function(_event) {
			Ti.API.info(_event);
		},
		error : function(_event) {
			Ti.API.error(_event);
		}
	});
}

init();

$.Pebble.addEventListener("click", sendMessage);