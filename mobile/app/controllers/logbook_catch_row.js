var args = arguments[0] || {};

function init() {
	$.Species.text = args.species;
	$.Weight.text = args.weight.pound + " lb " + args.weight.ounce + " oz";
	$.Length.text = args.length.feet + " ft " + args.length.inch + " in";
}

init();