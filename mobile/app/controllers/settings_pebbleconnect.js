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
	
	App.Pebble.connect({
		success: watchConnected,
		error: watchDisonnected
	});
}

function watchConnected(_event) {
	$.Status.text = "Syncing Data";
	
	setTimeout(function() {
		App.updateCatchCounts();
		
		$.Status.text = "Connected";
		
		clearInterval(interval);
		
		setTimeout(function() {
			$.Dots.text = "✓";
		}, 500);
	}, 1000);
}

function watchDisonnected(_event) {
	$.Status.text = "Disconnected";
	
	clearInterval(interval);
	
	setTimeout(function() {
		$.Dots.text = "✗";
	}, 500);
}

init();

$.Pebble.addEventListener("click", watchConnected);