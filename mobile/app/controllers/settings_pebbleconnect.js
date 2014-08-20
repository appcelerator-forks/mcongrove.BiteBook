// App bootstrap
var App = require("core");

var interval;

function init() {
	App.Pebble.connect({
		success: watchConnected,
		error: watchDisconnected
	});
	
	if(!App.BackgroundServiceStarted) {
		App.Pebble.registerBackgroundService();
		
		App.BackgroundServiceStarted = true;
	}
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

function watchDisconnected(_event) {
	$.Status.text = "Disconnected";
	
	clearInterval(interval);
	
	setTimeout(function() {
		$.Dots.text = "✗";
	}, 500);
}

init();

$.Pebble.addEventListener("click", watchConnected);