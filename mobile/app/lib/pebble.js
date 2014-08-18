var Pebble = require("org.beuckman.tipebble");

Pebble.setAppUUID("226834ae-786e-4302-a52f-6e7efc9f990b");

exports.connected = false;

exports.connect = function(_data) {
	Pebble.getVersionInfo({
		success: function(_event) {
			watchConnected();
			launchApp(_data ? _data : null);
		},
		error: function(_event) {
		   watchDisonnected();
		   
		   _data.error ? _data.error() : null;
		}
	});
};

exports.sendMessage = function(_data) {
	if(exports.connected) {
		Pebble.sendMessage({
			message: _data.message,
			success: _data.success ? _data.success : null,
			error: _data.error ? _data.error : null
		});
	}
};

function watchConnected(_event) {
	exports.connected = true;
}

function watchDisonnected(_event) {
	exports.connected = false;
}

function launchApp(_data) {
	if(exports.connected) {
		Pebble.launchApp({
			success: function() {},
			error: function() {
				_data.error ? _data.error : null;
				
				watchDisconnected();
			}
		});
		
		_data.success ? _data.success() : null;
	}
}

function killApp(_data) {
	if(exports.connected) {
		Pebble.killApp({
			success: function() {},
			error: function() {
				watchDisconnected();
			}
		});
	}
}

Pebble.addEventListener("watchConnected", watchConnected);
Pebble.addEventListener("watchDisconnected", watchDisonnected);