var Moment = require("alloy/moment");

var args = arguments[0] || {};

function init() {
	var time = Moment.unix(args.timestamp);
	
	$.Species.text = args.species;
	$.Time.text = time.format("h:mm a");
	$.Weight.text = args.weight.pound + " lb " + args.weight.ounce + " oz";
	$.Length.text = args.length.feet + " ft " + args.length.inch + " in";
}

init();