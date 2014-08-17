// App bootstrap
var App = require("core");

var VALUES = {
	species: null,
	weight: {
		pound: 0,
		ounce: 0
	},
	length: {
		feet: 0,
		inch: 0
	}
};

function openPickerSpecies() {
	var picker = Alloy.createController("ui/picker");
	var options = [];
	var species = App.Database.getVisibleSpecies();
	
	for(var i = 0, x = species.length; i < x; i++) {
		options.push({
			title: species[i].name,
			value: species[i].id
		});
	}
	
	picker.setOptions(options);
	
	picker.setCallback(function(_data) {
		if(_data !== false) {
			$.ValueSpecies.text = App.Database.getSpeciesById(_data);
			$.ValueSpecies.color = "#404556";
			$.ValueSpecies.font = {
				fontSize: 18,
				fontFamily: "HelveticaNeue-Regular"
			};
			
			VALUES.species = _data;
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
		App.Database.addCatch(VALUES);
		
		VALUES = {
			species: null,
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
		$.ValueWeight.text = "0 lb 0 oz";
		$.ValueLength.text = "0 ft 0 in";
		
		$.ValueSpecies.color = "#666";
		$.ValueWeight.color = "#666";
		$.ValueLength.color = "#666";
		
		$.ValueSpecies.font = {
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
	} else {
		alert("Please select a species");
	}
});

$.ValueSpecies.addEventListener("click", openPickerSpecies);
$.ValueWeight.addEventListener("click", openSliderWeight);
$.ValueLength.addEventListener("click", openSliderLength);