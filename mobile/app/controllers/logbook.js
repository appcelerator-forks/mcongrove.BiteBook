// App bootstrap
var App = require("core");

function init() {
	var trips = App.Database.tripGetAll();
	
	var rows = [];
	
	for(var i = 0, x = trips.length; i < x; i++) {
		var row = Alloy.createController("logbook_row", trips[i]).getView();
		
		row.trip_id = trips[i].id;
		
		row.addEventListener("click", function(_event) {
			var trip = Alloy.createController("logbook_trip", { id: _event.row.trip_id }).getView();
			
			App.TabGroup.activeTab.open(trip);
		});
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

if(OS_IOS) {		
	$.Table.addEventListener("delete", function(_event) {
		App.Database.tripRemove(_event.row.trip_id);
	});
} else {	
	$.Table.addEventListener("longclick", function(_event) {
		var row = _event.row;
		
		var dialog = Ti.UI.createOptionDialog({
			options: [ "Yes", "Cancel" ],
			selectedIndex: 0,
			cancel: 1,
			title: "Delete this trip?"
		});
		
		dialog.addEventListener("click", function(_event) {
			if(!_event.cancel) {
				App.Database.tripRemove(row.trip_id);
				
				$.Table.deleteRow(row);
			}
		});
		
		dialog.show();
	});
}

$.LogbookWindow.addEventListener("focus", init);
Ti.App.addEventListener("BB_EDIT", init);
Ti.App.addEventListener("BB_UPDATE", init);