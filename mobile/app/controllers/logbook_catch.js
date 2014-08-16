// App bootstrap
var App = require("core");
	Alloy.Globals.Map = require("ti.map");

var args = arguments[0] || {};

var DATA = {
	id: args.id,
	date: "August 8th, 2014",
	catches: [
		{
			species: "Bass, Largemouth",
			weight: {
				pound: 4,
				ounce: 3
			},
			length: {
				feet: 2,
				inch: 10
			},
			geo: {
				lat: 30.247543,
				lon: -97.724880
			}
		},
		{
			species: "Catfish",
			weight: {
				pound: 4,
				ounce: 3
			},
			length: {
				feet: 2,
				inch: 10
			},
			geo: {
				lat: 30.246097,
				lon: -97.720374
			}
		}
	]
};

function init() {
	var rows = [];
	
	$.LogbookCatchWindow.title = DATA.date;
	
	$.Map.setMapType(Alloy.Globals.Map.SATELLITE_TYPE);
	
	$.Map.setRegion({
		latitude: 30.246097,
		longitude: -97.720374,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01
	});
	
	for(var i = 0, x = DATA.catches.length; i < x; i++) {
		var item = Alloy.Globals.Map.createAnnotation({
			latitude: DATA.catches[i].geo.lat,
			longitude: DATA.catches[i].geo.lon,
			title: DATA.catches[i].species,
			subtitle: "Details Go Here",
			image: "images/icon_annotation.png"
		});
		
		$.Map.addAnnotation(item);
		
		var row = Alloy.createController("logbook_catch_row", DATA.catches[i]).getView();
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();