var Pebble = require("org.beuckman.tipebble");

Pebble.setAppUUID("4e212afd-b33e-440e-b20b-7f2c3fafc5ea");

exports.connected = false;
exports.connection = Pebble;

exports.connect = function(_data) {
	Ti.API.info("@Pebble connect");
	
	if(!exports.connected) {
		launchApp(_data ? _data : null);
	} else {
		_data.success ? _data.success() : null;
	}
};

exports.sendMessage = function(_data) {
	Ti.API.info("@Pebble sendMessage");
	
	if(exports.connected) {
		Pebble.sendMessage({
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
	}
};

function watchConnected(_event) {
	Ti.API.info("@Pebble watchConnected");
	
	exports.connected = true;
}

function watchDisconnected(_event) {
	Ti.API.info("@Pebble watchDisconnected");
	
	exports.connected = false;
}

function launchApp(_data) {
	Ti.API.info("@Pebble launchApp");
	
	Pebble.launchApp({
		success: function() {
			Ti.API.info("@Pebble launchApp:success");
			
			watchConnected();
			
			_data.success ? _data.success() : null;
		},
		error: function() {
			Ti.API.info("@Pebble launchApp:error");
			
			watchDisconnected();
			
			_data.error ? _data.error() : null;
		}
	});
}

function killApp(_data) {
	Ti.API.info("@Pebble killApp");
	
	if(exports.connected) {
		Pebble.killApp({
			success: function() {
				Ti.API.info("@Pebble killApp:success");
			},
			error: function() {
				Ti.API.info("@Pebble killApp:error");
				
				watchDisconnected();
			}
		});
	}
}

Pebble.addEventListener("watchConnected", watchConnected);
Pebble.addEventListener("watchDisconnected", watchDisconnected);