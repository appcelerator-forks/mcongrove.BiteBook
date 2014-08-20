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
		url: "http://www.bitebook.net/bitebook.pbw"
		//url: "pebble://appstore/53ee756fbe4dd4f5fe0001cb"
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
				
				$.NavWindow.openWindow(detail);
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

function closeSettings() {
	$.NavWindow.close();
}

init();