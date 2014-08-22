// App bootstrap
var App = require("core");

var args = arguments[0] || {};

var VALUES = {
	id: null,
	species: null,
	subspecies: null,
	weight: {
		pound: 0,
		ounce: 0
	},
	length: {
		feet: 0,
		inch: 0
	}
};

function init() {
	var _catch = App.Database.catchGetById(args.id);
	
	VALUES = {
		id: args.id,
		species: _catch.species,
		subspecies: _catch.subspecies,
		weight: _catch.weight,
		length: _catch.length
	};
	
	$.ValueSpecies.text = App.Database.speciesGetById(VALUES.species);
	$.ValueWeight.text = VALUES.weight.pound + " lb " + VALUES.weight.ounce + " oz";
	$.ValueLength.text = VALUES.length.feet + " ft " + VALUES.length.inch + " in";
	
	if(VALUES.subspecies) {
		$.ValueSubspecies.text = App.Database.subspeciesGetById(VALUES.subspecies);
		
		showSubspeciesRow();
	}
	
	$.ValueSpecies.color = "#404556";
	$.ValueSubspecies.color = "#404556";
	$.ValueWeight.color = "#404556";
	$.ValueLength.color = "#404556";
	$.ValueSpecies.font = {
		fontSize: 18,
		fontFamily: "HelveticaNeue-Regular"
	};
	$.ValueSubspecies.font = {
		fontSize: 18,
		fontFamily: "HelveticaNeue-Regular"
	};
	$.ValueWeight.font = {
		fontSize: 18,
		fontFamily: "HelveticaNeue-Regular"
	};
	$.ValueLength.font = {
		fontSize: 18,
		fontFamily: "HelveticaNeue-Regular"
	};
}

function showSubspeciesRow() {
	$.RowSubspecies.height = Ti.UI.SIZE;
	$.RowSubspecies.bottom = 10;
}

function hideSubspeciesRow() {
	$.RowSubspecies.height = 0;
	$.RowSubspecies.bottom = 0;
}

function openPickerSpecies() {
	var picker = Alloy.createController("ui/picker");
	var options = [];
	var species = App.Database.speciesGetAll();
	
	for(var i = 0, x = species.length; i < x; i++) {
		options.push({
			title: species[i].name,
			value: species[i].id
		});
	}
	
	picker.setOptions(options);
	
	picker.setCallback(function(_data) {
		if(_data !== false) {
			$.ValueSpecies.text = App.Database.speciesGetById(_data);
			$.ValueSubspecies.text = "Tap to Select";
			$.ValueSpecies.color = "#404556";
			$.ValueSubspecies.color = "#666";
			$.ValueSpecies.font = {
				fontSize: 18,
				fontFamily: "HelveticaNeue-Regular"
			};
			$.ValueSubspecies.font = {
				fontSize: 18,
				fontFamily: "HelveticaNeue-UltraLightItalic"
			};
			
			VALUES.species = _data;
			
			if(App.Database.speciesHasSubspecies(_data)) {
				showSubspeciesRow();
			} else {
				hideSubspeciesRow();
			}
		}
		
		$.CatchDetailWindow.remove(picker.getView());
	});
	
	$.CatchDetailWindow.add(picker.getView());
	
	picker.open();
}

function openPickerSubspecies() {
	var picker = Alloy.createController("ui/picker");
	var options = [];
	var subspecies = App.Database.subspeciesGetBySpeciesId(VALUES.species);
	
	for(var i = 0, x = subspecies.length; i < x; i++) {
		options.push({
			title: subspecies[i].name,
			value: subspecies[i].id
		});
	}
	
	picker.setOptions(options);
	
	picker.setCallback(function(_data) {
		if(_data !== false) {
			$.ValueSubspecies.text = App.Database.subspeciesGetById(_data);
			$.ValueSubspecies.color = "#404556";
			$.ValueSubspecies.font = {
				fontSize: 18,
				fontFamily: "HelveticaNeue-Regular"
			};
			
			VALUES.subspecies = _data;
		}
		
		$.CatchDetailWindow.remove(picker.getView());
	});
	
	$.CatchDetailWindow.add(picker.getView());
	
	picker.open();
}

function openSliderWeight() {
	var slider = Alloy.createController("ui/slider");
	var options = {
		top: {
			min: 0,
			max: 20,
			segment: 5,
			label: " lb"
		},
		bottom: {
			min: 0,
			max: 15,
			segment: 8,
			label: " oz"
		}
	};
	
	slider.setOptions(options);
	
	slider.setCallback(function(_data) {
		if(_data !== false) {
			VALUES.weight.pound = _data.top;
			VALUES.weight.ounce = _data.bottom;
			
			$.ValueWeight.text = VALUES.weight.pound + " lb " + VALUES.weight.ounce + " oz";
			$.ValueWeight.color = "#404556";
			$.ValueWeight.font = {
				fontSize: 18,
				fontFamily: "HelveticaNeue-Regular"
			};
		}
		
		$.CatchDetailWindow.remove(slider.getView());
	});
	
	$.CatchDetailWindow.add(slider.getView());
	
	slider.open();
}

function openSliderLength() {
	var slider = Alloy.createController("ui/slider");
	var options = {
		top: {
			min: 0,
			max: 5,
			segment: 5,
			label: " ft"
		},
		bottom: {
			min: 0,
			max: 11,
			segment: 6,
			label: " in"
		}
	};
	
	slider.setOptions(options);
	
	slider.setCallback(function(_data) {
		if(_data !== false) {
			VALUES.length.feet = _data.top;
			VALUES.length.inch = _data.bottom;
			
			$.ValueLength.text = VALUES.length.feet + " ft " + VALUES.length.inch + " in";
			$.ValueLength.color = "#404556";
			$.ValueLength.font = {
				fontSize: 18,
				fontFamily: "HelveticaNeue-Regular"
			};
		}
		
		$.CatchDetailWindow.remove(slider.getView());
	});
	
	$.CatchDetailWindow.add(slider.getView());
	
	slider.open();
}

init();

$.Submit.addEventListener("click", function(_event) {
	if(VALUES.species !== null) {
		App.Database.catchEdit(VALUES);
		
		$.CatchDetailWindow.close();
	} else {
		alert("Please select a species");
	}
});

$.RowSpecies.addEventListener("click", openPickerSpecies);
$.RowSubspecies.addEventListener("click", openPickerSubspecies);
$.RowWeight.addEventListener("click", openSliderWeight);
$.RowLength.addEventListener("click", openSliderLength);