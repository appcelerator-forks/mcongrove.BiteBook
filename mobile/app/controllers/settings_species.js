// App bootstrap
var App = require("core");

var SPECIES;

function getSpeciesMaster() {
	var contentFile = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "data/species.json");

	var content = contentFile.read();
	
	Ti.API.debug(JSON.parse(content.text));

	return JSON.parse(content.text);
}

function init() {
	SPECIES = getSpeciesMaster();
	
	var rows = [];
	
	for(var i = 0, x = SPECIES.length; i < x; i++) {
		var name = SPECIES[i].major + (SPECIES[i].minor ? ", " + SPECIES[i].minor : "");
		var row = Alloy.createController("settings_species_row", { species: name }).getView();
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();