var args = arguments[0] || {};

function init() {
	$.Date.text = args.date;
	$.Species.text = args.species;
}

init();