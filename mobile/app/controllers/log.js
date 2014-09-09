// App bootstrap
var App = require("core");

var VALUES = {
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
			$.ValueSubspecies.color = OS_IOS ? "#666" : "#AAA";
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
		
		$.LogWindow.remove(picker.getView());
	});
	
	$.LogWindow.add(picker.getView());
	
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
		
		$.LogWindow.remove(picker.getView());
	});
	
	$.LogWindow.add(picker.getView());
	
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
		
		$.LogWindow.remove(slider.getView());
	});
	
	$.LogWindow.add(slider.getView());
	
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
		
		$.LogWindow.remove(slider.getView());
	});
	
	$.LogWindow.add(slider.getView());
	
	slider.open();
}

$.Submit.addEventListener("click", function(_event) {
	if(VALUES.species !== null) {
		App.Database.catchAdd(VALUES);
		
		Alloy.createWidget("com.mcongrove.toast", null, {
			text: "Catch Logged",
			duration: 2000,
			view: $.LogWindow
		});
		
		VALUES = {
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
		
		$.ValueSpecies.text = "Tap to Select";
		$.ValueSubspecies.text = "Tap to Select";
		$.ValueWeight.text = "0 lb 0 oz";
		$.ValueLength.text = "0 ft 0 in";
		
		$.ValueSpecies.color = OS_IOS ? "#666" : "#AAA";
		$.ValueSubspecies.color = OS_IOS ? "#666" : "#AAA";
		$.ValueWeight.color = OS_IOS ? "#666" : "#AAA";
		$.ValueLength.color = OS_IOS ? "#666" : "#AAA";
		
		$.ValueSpecies.font = {
			fontSize: 18,
			fontFamily: "HelveticaNeue-UltraLightItalic"
		};
		$.ValueSubspecies.font = {
			fontSize: 18,
			fontFamily: "HelveticaNeue-UltraLightItalic"
		};
		$.ValueWeight.font = {
			fontSize: 18,
			fontFamily: "HelveticaNeue-UltraLightItalic"
		};
		$.ValueLength.font = {
			fontSize: 18,
			fontFamily: "HelveticaNeue-UltraLightItalic"
		};
		
		hideSubspeciesRow();
	} else {
		var dialog = Ti.UI.createAlertDialog({
			message: "Please select a species",
			ok: "OK",
			title: "Required Field"
		});
		
		dialog.show();
	}
});

$.RowSpecies.addEventListener("click", openPickerSpecies);
$.RowSubspecies.addEventListener("click", openPickerSubspecies);
$.RowWeight.addEventListener("click", openSliderWeight);
$.RowLength.addEventListener("click", openSliderLength);