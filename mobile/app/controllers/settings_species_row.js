var args = arguments[0] || {};

function init() {
	$.Species.text = args.species;
	
	if(args.pebble) {
		$.Pebble.image = "images/icon_yes.png";
	} else {
		$.Pebble.image = "images/icon_no.png";
	}
}

function togglePebble() {
	var db = Ti.Database.open("BiteBook");
	
	if(args.pebble) {
		$.Pebble.image = "images/icon_no.png";
		args.pebble = 0;
		
		db.execute("UPDATE bb_species SET pebble=? WHERE id=?", 0, args.id);
	} else {
		$.Pebble.image = "images/icon_yes.png";
		args.pebble = 1;
		
		db.execute("UPDATE bb_species SET pebble=? WHERE id=?", 1, args.id);
	}
}

init();

$.Row.addEventListener("click", togglePebble);
