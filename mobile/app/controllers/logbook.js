// App bootstrap
var App = require("core");

function init() {
	var trips = App.Database.tripGetAll();
	
	var rows = [];
	
	for(var i = 0, x = trips.length; i < x; i++) {
		var row = Alloy.createController("logbook_row", trips[i]).getView();
		
		row.trip_id = trips[i].id;
		
		row.addEventListener("click", function(_event) {
			var trip = Alloy.createController("logbook_catch", { id: _event.row.trip_id }).getView();
			
			App.TabGroup.activeTab.open(trip);
		});
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

$.LogbookWindow.addEventListener("focus", init);