// App bootstrap
var App = require("core");

function init() {
	var db = Ti.Database.open("BiteBook");
	var result = db.execute("SELECT * FROM bb_species ORDER BY major ASC, minor ASC");
	var rows = [];
	
	while(result.isValidRow()) {
		var name = result.fieldByName("major") + (result.fieldByName("minor") ? ", " + result.fieldByName("minor") : "");
		
		var row = Alloy.createController("settings_species_row", {
			id: result.fieldByName("id"),
			species: name,
			pebble: result.fieldByName("pebble")
		}).getView();
		
		rows.push(row);
		
		result.next();
	}
	
	$.Table.setData(rows);
	
	result.close();
}

init();