var DB = Ti.Database.open("BiteBook");

exports.createTrip = function() {
	Ti.API.warn("createTrip");
	
	DB.execute("INSERT INTO bb_trip (start) VALUES (?)", Math.round(new Date().getTime() / 1000));
	
	var result = DB.execute("SELECT id FROM bb_trip ORDER BY id DESC LIMIT 1");
	
	var trip_id;
	
	while(result.isValidRow()) {
		trip_id = result.fieldByName("id");
		
		result.next();
	}
	
	result.close();
	
	return trip_id;
};

exports.endTrip = function(_trip_id) {
	Ti.API.warn("endTrip");
	
	if(typeof _trip_id == "undefined") {
		_trip_id = exports.getValidTripId();
	}
	
	DB.execute("UPDATE bb_trip SET end = ? WHERE id = ?", Math.round(new Date().getTime() / 1000), _trip_id);
};

exports.getValidTripId = function() {
	Ti.API.warn("getValidTripId");
	
	var result = DB.execute("SELECT id, start FROM bb_trip ORDER BY start DESC LIMIT 1");
	
	var trip_id,
		trip_start = 0;
	
	while(result.isValidRow()) {
		trip_id = result.fieldByName("id");
		trip_start = result.fieldByName("start");
		
		result.next();
	}
	
	result.close();
	
	if(trip_id == null || typeof trip_id == "undefined" || trip_id === false) {
		trip_id = exports.createTrip();
	} else {
		var now = Math.round(new Date().getTime() / 1000);
		var limit = (6 * 60) * 60 * 1000; // 6 Hours
		
		if((now - limit) > trip_start) {
			exports.endTrip(trip_id);
			
			trip_id = exports.createTrip();
		}
	}
	
	return trip_id;
};

exports.getAllTrips = function() {
	var result = DB.execute("SELECT * FROM bb_trip ORDER BY start DESC");
	var trips = [];
	
	while(result.isValidRow()) {
		var trip = {
			id: result.fieldByName("id"),
			start: result.fieldByName("start"),
			end: result.fieldByName("end")
		};
		
		trips.push(trip);
		
		result.next();
	}
	
	result.close;
	
	return trips;
};

exports.getTrip = function(_trip_id) {
	Ti.API.warn("getTrip");
	
	var result = DB.execute("SELECT * FROM bb_trip WHERE id = ? LIMIT 1", _trip_id);
	var trip;
	
	while(result.isValidRow()) {
		trip = {
			id: result.fieldByName("id"),
			start: result.fieldByName("start"),
			end: result.fieldByName("end")
		};
		
		result.next();
	}
	
	result.close;
	
	return trip;
};

exports.addCatch = function(_species, _weight, _length) {
	Ti.API.warn("addCatch");
	
	var trip_id = exports.getValidTripId();
	
	var geolocation = {};
	
	if(Ti.Geolocation.locationServicesEnabled) {
		Ti.Geolocation.purpose = "Catch Geolocation Logging";
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.distanceFilter = 15;
		Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
		
		Titanium.Geolocation.getCurrentPosition(function(_event) {
			if(_event.error) {
				Ti.API.error(_event.error);
			} else {
				geolocation = _event.coords;
			}
			
			DB.execute("INSERT INTO bb_log (timestamp, trip_id, species, weight, length, geo) VALUES (?, ?, ?, ?, ?, ?)",
				Math.round(new Date().getTime() / 1000),
				trip_id,
				_species,
				JSON.stringify(_weight),
				JSON.stringify(_length),
				JSON.stringify(geolocation)
			);
		});
	} else {
		alert("Please turn on location services");
	}
};

exports.getCatch = function(_catch_id) {
	var result = DB.execute("SELECT * FROM bb_log WHERE id = ? LIMIT 1", _catch_id);
	
	while(result.isValidRow()) {
		var _catch = {
			id: result.fieldByName("id"),
			timestamp: result.fieldByName("timestamp"),
			trip_id: result.fieldByName("trip_id"),
			species: result.fieldByName("species"),
			weight: JSON.parse(result.fieldByName("weight")),
			length: JSON.parse(result.fieldByName("length")),
			geo: JSON.parse(result.fieldByName("geo"))
		};
		
		result.next();
	}
	
	result.close;
	
	return _catch;
};

exports.getCatchesByTrip = function(_trip_id) {
	var result = DB.execute("SELECT * FROM bb_log WHERE trip_id = ? ORDER BY timestamp DESC", _trip_id);
	
	var catches = [];
	
	while(result.isValidRow()) {
		var _catch = {
			id: result.fieldByName("id"),
			species: result.fieldByName("species"),
			weight: JSON.parse(result.fieldByName("weight")),
			length: JSON.parse(result.fieldByName("length")),
			geo: JSON.parse(result.fieldByName("geo"))
		};
		
		catches.push(_catch);
		result.next();
	}
	
	result.close;
	
	return catches;
};

exports.getSpeciesByTrip = function(_trid_id) {
	var result = DB.execute("SELECT species FROM bb_log WHERE trip_id = ? ORDER BY species ASC", _trid_id);
	
	var species = {},
		species_string_bits = [];
	
	while(result.isValidRow()) {
		species[result.fieldByName("species")] = species[result.fieldByName("species")] ? species[result.fieldByName("species")] + 1 : 1;
		
		result.next();
	}
	
	result.close;
	
	for(key in species) {
		species_string_bits.push(exports.getSpeciesById(key) + " (" + species[key] + ")");
	}
	
	return species_string_bits.join(", ");
};

exports.getAllSpecies = function() {
	var result = DB.execute("SELECT * FROM bb_species ORDER BY name ASC");
	var species = [];
	
	while(result.isValidRow()) {
		var specy = {
			id: result.fieldByName("id"),
			name: result.fieldByName("name"),
			visible: result.fieldByName("visible")
		};
		
		species.push(specy);
		result.next();
	}
	
	result.close;
	
	return species;
};

exports.getVisibleSpecies = function() {
	var result = DB.execute("SELECT * FROM bb_species WHERE visible = ? ORDER BY name ASC", 1);
	var species = [];
	
	while(result.isValidRow()) {
		var specy = {
			id: result.fieldByName("id"),
			name: result.fieldByName("name")
		};
		
		species.push(specy);
		result.next();
	}
	
	result.close;
	
	return species;
};

exports.getSpeciesById = function(_species_id) {
	var result = DB.execute("SELECT * FROM bb_species WHERE id = ? LIMIT 1", _species_id);
	var name;
	
	while(result.isValidRow()) {
		name = result.fieldByName("name");
		
		result.next();
	}
	
	result.close;
	
	return name;
};

exports.setSpeciesVisibility = function(_species_id, _visible) {
	DB.execute("UPDATE bb_species SET visible = ? WHERE id = ?", _visible, _species_id);
};

exports.populate = function() {
	if(Ti.App.Properties.getBool("DB_INSTALLED", false)) {
		return;
	}
	
	DB.file.setRemoteBackup(false);
	
	Ti.API.info("Pre-populating Database");
	
	DB.execute("DROP TABLE IF EXISTS bb_log");
	DB.execute("DROP TABLE IF EXISTS bb_trip");
	DB.execute("DROP TABLE IF EXISTS bb_species");
	DB.execute("CREATE TABLE bb_log (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, timestamp INTEGER NOT NULL, trip_id INTEGER NOT NULL, species INTEGER NOT NULL, weight BLOB, length BLOB, geo BLOB)");
	DB.execute("CREATE TABLE bb_trip (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, start INTEGER NOT NULL, end INTEGER DEFAULT (0) )");
	DB.execute("CREATE TABLE bb_species (id INTEGER PRIMARY KEY NOT NULL UNIQUE, name TEXT NOT NULL, visible INTEGER NOT NULL DEFAULT (0))");
	DB.execute("BEGIN TRANSACTION");
	DB.execute("INSERT INTO bb_species VALUES(0,'Alewife',0)");
	DB.execute("INSERT INTO bb_species VALUES(1,'Bass',1)");
	DB.execute("INSERT INTO bb_species VALUES(2,'Bass, Hybrid',0)");
	DB.execute("INSERT INTO bb_species VALUES(3,'Bass, Largemouth',0)");
	DB.execute("INSERT INTO bb_species VALUES(4,'Bass, Redeye',0)");
	DB.execute("INSERT INTO bb_species VALUES(5,'Bass, Rock',0)");
	DB.execute("INSERT INTO bb_species VALUES(6,'Bass, Smallmouth',0)");
	DB.execute("INSERT INTO bb_species VALUES(7,'Bass, Spotted',0)");
	DB.execute("INSERT INTO bb_species VALUES(8,'Bass, Striped',0)");
	DB.execute("INSERT INTO bb_species VALUES(9,'Bass, White',0)");
	DB.execute("INSERT INTO bb_species VALUES(10,'Bluegill',1)");
	DB.execute("INSERT INTO bb_species VALUES(11,'Bowfin',0)");
	DB.execute("INSERT INTO bb_species VALUES(12,'Bullhead',0)");
	DB.execute("INSERT INTO bb_species VALUES(13,'Carp',1)");
	DB.execute("INSERT INTO bb_species VALUES(14,'Carp, Common',0)");
	DB.execute("INSERT INTO bb_species VALUES(15,'Carp, Grass',0)");
	DB.execute("INSERT INTO bb_species VALUES(16,'Catfish',1)");
	DB.execute("INSERT INTO bb_species VALUES(17,'Catfish, Blue',0)");
	DB.execute("INSERT INTO bb_species VALUES(18,'Catfish, Bullhead',0)");
	DB.execute("INSERT INTO bb_species VALUES(19,'Catfish, Channel',0)");
	DB.execute("INSERT INTO bb_species VALUES(20,'Catfish, Flathead',0)");
	DB.execute("INSERT INTO bb_species VALUES(21,'Catfish, White',0)");
	DB.execute("INSERT INTO bb_species VALUES(22,'Crappie',1)");
	DB.execute("INSERT INTO bb_species VALUES(23,'Crappie, Black',0)");
	DB.execute("INSERT INTO bb_species VALUES(24,'Crappie, White',0)");
	DB.execute("INSERT INTO bb_species VALUES(25,'Drum',1)");
	DB.execute("INSERT INTO bb_species VALUES(26,'Eel',0)");
	DB.execute("INSERT INTO bb_species VALUES(27,'Flier',0)");
	DB.execute("INSERT INTO bb_species VALUES(28,'Gar',1)");
	DB.execute("INSERT INTO bb_species VALUES(29,'Herring',0)");
	DB.execute("INSERT INTO bb_species VALUES(30,'Muskellunge',0)");
	DB.execute("INSERT INTO bb_species VALUES(31,'Perch',1)");
	DB.execute("INSERT INTO bb_species VALUES(32,'Perch, White',0)");
	DB.execute("INSERT INTO bb_species VALUES(33,'Perch, Yellow',0)");
	DB.execute("INSERT INTO bb_species VALUES(34,'Pickerel',0)");
	DB.execute("INSERT INTO bb_species VALUES(35,'Pickerel, Chain',0)");
	DB.execute("INSERT INTO bb_species VALUES(36,'Pickerel, Redfin',0)");
	DB.execute("INSERT INTO bb_species VALUES(37,'Pike',0)");
	DB.execute("INSERT INTO bb_species VALUES(38,'Pumpkinseed',0)");
	DB.execute("INSERT INTO bb_species VALUES(39,'Sauger',0)");
	DB.execute("INSERT INTO bb_species VALUES(40,'Shad',1)");
	DB.execute("INSERT INTO bb_species VALUES(41,'Shad, American',0)");
	DB.execute("INSERT INTO bb_species VALUES(42,'Shad, Gizzard',0)");
	DB.execute("INSERT INTO bb_species VALUES(43,'Shad, Hickory',0)");
	DB.execute("INSERT INTO bb_species VALUES(44,'Shad, Threadfin',0)");
	DB.execute("INSERT INTO bb_species VALUES(45,'Sturgeon',0)");
	DB.execute("INSERT INTO bb_species VALUES(46,'Sturgeon, Atlantic',0)");
	DB.execute("INSERT INTO bb_species VALUES(47,'Sturgeon, Shortnose',0)");
	DB.execute("INSERT INTO bb_species VALUES(48,'Sunfish',10)");
	DB.execute("INSERT INTO bb_species VALUES(49,'Sunfish, Green',0)");
	DB.execute("INSERT INTO bb_species VALUES(50,'Sunfish, Redbreast',0)");
	DB.execute("INSERT INTO bb_species VALUES(51,'Sunfish, Redear',0)");
	DB.execute("INSERT INTO bb_species VALUES(52,'Sunfish, Spotted',0)");
	DB.execute("INSERT INTO bb_species VALUES(53,'Trout',1)");
	DB.execute("INSERT INTO bb_species VALUES(54,'Trout, Brook',0)");
	DB.execute("INSERT INTO bb_species VALUES(55,'Trout, Brown',0)");
	DB.execute("INSERT INTO bb_species VALUES(56,'Trout, Rainbow',0)");
	DB.execute("INSERT INTO bb_species VALUES(57,'Walleye',0)");
	DB.execute("INSERT INTO bb_species VALUES(58,'Warmouth',0)");
	DB.execute("COMMIT");
	
	Ti.App.Properties.setBool("DB_INSTALLED", true);
};

exports.populate();