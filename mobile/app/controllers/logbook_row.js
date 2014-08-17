// App bootstrap
var App = require("core"),
	Moment = require("alloy/moment");

var args = arguments[0] || {};

function init() {
	var date = Moment.unix(args.start);
	
	$.Date.text = date.format("MMMM Do, YYYY");
	$.Species.text = App.Database.getSpeciesByTrip(args.id);
}

init();