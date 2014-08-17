// App bootstrap
var App = require("core");

var args = arguments[0] || {};

function init() {
	$.Species.text = args.name;
	
	if(args.visible) {
		$.Visible.image = "images/icon_yes.png";
	} else {
		$.Visible.image = "images/icon_no.png";
	}
}

function toggleVisibility() {
	var db = Ti.Database.open("BiteBook");
	
	if(args.visible) {
		$.Visible.image = "images/icon_no.png";
		args.visible = 0;
		
		App.Database.setSpeciesVisibility(args.id, 0);
	} else {
		$.Visible.image = "images/icon_yes.png";
		args.visible = 1;
		
		App.Database.setSpeciesVisibility(args.id, 1);
	}
}

init();

$.Row.addEventListener("click", toggleVisibility);