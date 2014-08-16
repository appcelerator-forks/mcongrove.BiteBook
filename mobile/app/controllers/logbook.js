// App bootstrap
var App = require("core");

var DATA = [
	{
		date: "August 9th, 2014",
		species: "Bass, Largemouth (2)"
	},
	{
		date: "August 8th, 2014",
		species: "Bass, Largemouth (1) Catfish (1)"
	},
	{
		date: "August 9th, 2014",
		species: "Bass, Largemouth (2)"
	},
	{
		date: "August 8th, 2014",
		species: "Bass, Largemouth (1) Catfish (1)"
	},
	{
		date: "August 9th, 2014",
		species: "Bass, Largemouth (2)"
	},
	{
		date: "August 8th, 2014",
		species: "Bass, Largemouth (1) Catfish (1)"
	},
	{
		date: "August 9th, 2014",
		species: "Bass, Largemouth (2)"
	},
	{
		date: "August 8th, 2014",
		species: "Bass, Largemouth (1) Catfish (1)"
	},
	{
		date: "August 9th, 2014",
		species: "Bass, Largemouth (2)"
	},
	{
		date: "August 8th, 2014",
		species: "Bass, Largemouth (1) Catfish (1)"
	},
	{
		date: "August 9th, 2014",
		species: "Bass, Largemouth (2)"
	},
	{
		date: "August 8th, 2014",
		species: "Bass, Largemouth (1) Catfish (1)"
	}
];

function init() {
	var rows = [];
	
	for(var i = 0, x = DATA.length; i < x; i++) {
		var row = Alloy.createController("logbook_row", DATA[i]).getView();
		
		row.addEventListener("click", function() {
			var detail = Alloy.createController("logbook_catch", { id: i }).getView();
			
			App.TabGroup.activeTab.open(detail);
		});
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

init();