// App bootstrap
var App = require("core");

var OPTIONS = [
	{
		title: "Species List",
		controller: "settings_species"
	},
	{
		title: "Connect Pebble Watch",
		controller: "settings_pebbleconnect"
	}
];

function init() {
	var rows = [];
	
	for(var i = 0, x = OPTIONS.length; i < x; i++) {
		var row = Alloy.createController("settings_row", { title: OPTIONS[i].title }).getView();
		
		row.controller = OPTIONS[i].controller;
		
		row.addEventListener("click", function(_event) {
			var detail = Alloy.createController(_event.row.controller).getView();
			
			App.TabGroup.activeTab.open(detail);
		});
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();