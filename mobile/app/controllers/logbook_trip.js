// App bootstrap
var App = require("core");
	Alloy.Globals.Map = require("ti.map"),
	Moment = require("alloy/moment");

var args = arguments[0] || {};

var TRIP, CATCHES;

function init() {
	TRIP = App.Database.tripGetById(args.id);
	
	if(!TRIP.id) {
		return;
	}
	
	CATCHES = App.Database.catchGetByTripId(TRIP.id);
	
	var date = Moment.unix(TRIP.start);
	var rows = [];
	
	$.LogbookCatchWindow.title = date.format("MMMM Do, YYYY");
	
	$.Map.removeAllAnnotations();
	$.Map.setMapType(Alloy.Globals.Map.SATELLITE_TYPE);
	
	for(var i = 0, x = CATCHES.length; i < x; i++) {
		var _catch = CATCHES[i];
		
		_catch.species = App.Database.speciesGetById(_catch.species);
		_catch.subspecies = App.Database.subspeciesGetById(_catch.subspecies);
		
		if(i == 0) {
			$.Map.setRegion({
				latitude: _catch.latitude,
				longitude: _catch.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01
			});
		}
		
		var item = Alloy.Globals.Map.createAnnotation({
			latitude: _catch.latitude,
			longitude: _catch.longitude,
			title: _catch.species,
			subtitle: _catch.weight.pound + " lb " + _catch.weight.ounce + " oz",
			image: "/images/icon_annotation.png"
		});
		
		$.Map.addAnnotation(item);
		
		var row = Alloy.createController("logbook_trip_row", _catch).getView();
		
		row.catch_id = _catch.id;
		
		row.addEventListener("click", function(_event) {
			var catch_detail = Alloy.createController("logbook_catch", { id: _event.row.catch_id }).getView();
			
			App.TabGroup.activeTab.open(catch_detail);
		});
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

if(OS_IOS) {		
	$.Table.addEventListener("delete", function(_event) {
		App.Database.catchRemove(_event.row.catch_id, TRIP.id);
	});
} else {	
	$.Table.addEventListener("longclick", function(_event) {
		var row = _event.row;
		
		var dialog = Ti.UI.createOptionDialog({
			options: [ "Yes", "Cancel" ],
			selectedIndex: 0,
			cancel: 1,
			title: "Delete this catch?"
		});
		
		dialog.addEventListener("click", function(_event) {
			if(!_event.cancel) {
				App.Database.catchRemove(row.catch_id, TRIP.id);
				
				$.Table.deleteRow(row);
			}
		});
		
		dialog.show();
	});
}

Ti.App.addEventListener("BB_EDIT", init);
Ti.App.addEventListener("BB_UPDATE", init);

init();