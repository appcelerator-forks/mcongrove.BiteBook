var PebbleKit = require("org.beuckman.tipebble");

PebbleKit.setAppUUID("4e212afd-b33e-440e-b20b-7f2c3fafc5ea");

exports.Kit = PebbleKit;

exports.connect = function(_data) {
	Ti.API.info("@Pebble connect");
	
	Ti.App.Properties.setBool("BB_PEBBLE_ENABLED", true);
	
	PebbleKit.launchApp({
		success: function() {
			Ti.API.info("@Pebble connect:success");
			
			_data.success ? _data.success() : null;
		},
		error: function() {
			Ti.API.info("@Pebble connect:error");
			
			_data.error ? _data.error() : null;
		}
	});
};

exports.disconnect = function(_data) {
	Ti.API.info("@Pebble disconnect");
	
	PebbleKit.killApp({
		success: function() {
			Ti.API.info("@Pebble disconnect:success");
		},
		error: function() {
			Ti.API.info("@Pebble disconnect:error");
			
			watchDisconnected();
		}
	});
};

exports.registerBackgroundService = function() {
	Ti.API.info("@Pebble registerBackgroundService");
	
	Ti.App.iOS.registerBackgroundService({
		url: "background.js"
	});
};

exports.sendMessage = function(_data) {
	Ti.API.info("@Pebble sendMessage");
	
	PebbleKit.sendMessage({
		message: _data.message,
		success: function() {
			Ti.API.info("@Pebble sendMessage:success");
			
			_data.success ? _data.success() : null;
		},
		error: function() {
			Ti.API.info("@Pebble sendMessage:error");
			
			_data.error ? _data.error() : null;
		}
	});
};