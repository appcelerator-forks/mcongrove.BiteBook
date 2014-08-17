// App bootstrap
var App = require("core");

var VALUES = {
	species: null,
	weight: {
		pound: null,
		ounce: null
	},
	length: {
		feet: null,
		inch: null
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

$.Submit.addEventListener("click", function(_event) {
	// TODO: Remove this! It's temporary
	App.Database.addCatch(
		3,
		{
			pound: 4,
			ounce: 3
		},
		{
			feet: 2,
			inch: 10
		}
	);
	// TODO: Remove this! It's temporary
});

$.ValueSpecies.addEventListener("click", openPickerSpecies);
