// App bootstrap
var App = require("core");

var OPTIONS = [
	/*
	{
		title: "Species List",
		controller: "settings_species"
	},
	*/
	{
		title: "Download BiteBook on Pebble",
		url: "pebble://appstore/52cdd45efc5bf835cb00001e"
	},
	{
		title: "Connect Pebble Watch",
		controller: "settings_pebbleconnect"
	},
	{
		title: "About BiteBook",
		controller: "settings_about"
	}
];

function init() {
	var rows = [];
	
	for(var i = 0, x = OPTIONS.length; i < x; i++) {
		var row = Alloy.createController("settings_row", { title: OPTIONS[i].title }).getView();
		
		if(OPTIONS[i].controller) {
			row.controller = OPTIONS[i].controller;
			
			row.addEventListener("click", function(_event) {
				var detail = Alloy.createController(_event.row.controller).getView();
				
				App.TabGroup.activeTab.open(detail);
			});
		} else if(OPTIONS[i].url) {
			row.url = OPTIONS[i].url;
			
			row.addEventListener("click", function(_event) {
				Ti.Platform.openURL(_event.row.url);
			});
		}
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();