// App bootstrap
var App = require("core");

var OPTIONS = [
	{
		title: "Species List",
		callback: function() {}
	},
	{
		title: "Connect Pebble Watch",
		callback: function() {}
	}
];

function init() {
	var rows = [];
	
	for(var i = 0, x = OPTIONS.length; i < x; i++) {
		var row = Alloy.createController("settings_row", { title: OPTIONS[i].title }).getView();
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();