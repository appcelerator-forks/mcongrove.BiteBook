Ti.API.info("Background Service Started");

var Pebble = require("pebble"),
	Database = require("database"),
	Geo = {
		latitude: null,
		longitude: null
	};

Pebble.Kit.addEventListener("update", receiveFromPebble);

if(OS_IOS) {
	if(Ti.Geolocation.locationServicesEnabled) {
		Ti.Geolocation.purpose = "Catch Geolocation Logging";
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.distanceFilter = 95;
		Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	}
} else {
	Ti.Geolocation.Android.manualMode = true;
	
	var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
		name: Ti.Geolocation.PROVIDER_GPS,
		minUpdateTime: 60, 
		minUpdateDistance: 95
	});
	
	Ti.Geolocation.Android.addLocationProvider(gpsProvider);
}

Ti.Geolocation.addEventListener("location", function(_event) {
	if(_event.error) {
		Ti.API.error(_event.error);
	} else {
		Geo = _event.coords;
		
		updateCatchCounts();
	}
});

Pebble.connect({
	success: function() {},
	error: function() {}
});

function updateCatchCounts(_event) {
	Ti.API.info("Background:updateCatchCounts");
	
	Pebble.sendMessage({
		message: {
			0: Database.catchGetCountByTrip(),
			1: Database.catchGetCountByLocation(Geo)
		}
	});
};

function receiveFromPebble(_data) {
	Ti.API.info("Background:receiveFromPebble");
	
	if(_data.message.charAt(0) == "{") {
		var _catch = JSON.parse(_data.message);
		
		var VALUES = {
			species: _catch.S,
			weight: {
				pound: _catch.WP,
				ounce: _catch.WO
			},
			length: {
				feet: _catch.LF,
				inch: _catch.LI
			}
		};
		
		Database.catchAdd(VALUES);
	}
	
	setTimeout(updateCatchCounts, 1000);
};