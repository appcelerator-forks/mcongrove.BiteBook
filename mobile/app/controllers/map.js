// App bootstrap
var App = require("core");
	Alloy.Globals.Map = require("ti.map");

var args = arguments[0] || {};

var geolocation;

function init() {
	$.Map.setMapType(Alloy.Globals.Map.SATELLITE_TYPE);
}

function updateLocation(_geolocation) {
	$.Map.removeAllAnnotations();
	
	var CATCHES = App.Database.catchGetByLocation(_geolocation);
	
	for(var i = 0, x = CATCHES.length; i < x; i++) {
		var _catch = CATCHES[i];
		
		_catch.species = App.Database.speciesGetById(_catch.species);
		
		var item = Alloy.Globals.Map.createAnnotation({
			latitude: _catch.latitude,
			longitude: _catch.longitude,
			title: _catch.species,
			subtitle: _catch.weight.pound + " lb " + _catch.weight.ounce + " oz",
			image: "images/icon_annotation.png"
		});
		
		$.Map.addAnnotation(item);
	}
}

if(Ti.Geolocation.locationServicesEnabled) {
	Ti.Geolocation.purpose = "Catch Geolocation Logging";
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	Ti.Geolocation.distanceFilter = 95;
	Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	
	Ti.Geolocation.getCurrentPosition(function(_event) {
		if(_event.error) {
			Ti.API.error(_event.error);
		} else {
			geolocation = _event.coords;
			
			$.Map.setRegion({
				latitude: geolocation.latitude,
				longitude: geolocation.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01
			});
		}
	});
}

$.Map.addEventListener("regionchanged", function(_event) {
	// Round deltas to 3 decimal places, then divide in half to get radius delta
	updateLocation({
		latitude: _event.latitude,
		longitude: _event.longitude,
		latitudeDelta: (Math.round(_event.latitudeDelta * 1000) / 2000),
		longitudeDelta: (Math.round(_event.longitudeDelta * 1000) / 2000)
	});
});

init();