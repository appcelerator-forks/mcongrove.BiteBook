// App bootstrap
var App = require("core");

function init() {
	var species = App.Database.getAllSpecies();
	var rows = [];
	
	for(var i = 0, x = species.length; i < x; i++) {
		var row = Alloy.createController("settings_species_row", species[i]).getView();
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();