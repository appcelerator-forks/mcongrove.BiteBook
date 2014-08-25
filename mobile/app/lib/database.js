var DatabaseVersion = 1;

exports.tripAdd = function() {
	var DB = Ti.Database.open("BiteBook");
	
	DB.execute("INSERT INTO bb_trip (start) VALUES (?)", Math.round(new Date().getTime() / 1000));
	
	var result = DB.execute("SELECT id FROM bb_trip ORDER BY id DESC LIMIT 1");
	
	var trip_id = result.fieldByName("id");
	
	result.close();
	DB.close();
	
	return trip_id;
};

exports.tripEnd = function(_trip_id) {
	if(typeof _trip_id == "undefined") {
		_trip_id = exports.tripGetValidId(false);
	}
	
	var DB = Ti.Database.open("BiteBook");
	
	DB.execute("UPDATE bb_trip SET end = ? WHERE id = ?", Math.round(new Date().getTime() / 1000), _trip_id);
	
	DB.close();
};

exports.tripRemove = function(_trip_id) {
	var DB = Ti.Database.open("BiteBook");
	
	DB.execute("DELETE FROM bb_trip WHERE id = ?", _trip_id);
	DB.execute("DELETE FROM bb_log WHERE trip_id = ?", _trip_id);
	
	DB.close();
	
	Ti.App.fireEvent("BB_UPDATE");
};

exports.tripGetValidId = function(_create) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT id, start FROM bb_trip WHERE end < 1 ORDER BY start DESC LIMIT 1");
	
	var trip_id,
		trip_start = 0;
	
	while(result.isValidRow()) {
		trip_id = result.fieldByName("id");
		trip_start = result.fieldByName("start");
		
		result.next();
	}
	
	result.close();
	DB.close();
	
	if(trip_id == null || typeof trip_id == "undefined") {
		if(_create) {
			trip_id = exports.tripAdd();
		}
	} else {
		var now = Math.round(new Date().getTime() / 1000);
		var limit = (6 * 60) * 60; // 6 Hours
		
		if((now - limit) > trip_start) {
			exports.tripEnd(trip_id);
			
			if(_create) {
				trip_id = exports.tripAdd();
			}
		}
	}
	
	return trip_id;
};

exports.tripGetAll = function() {
	var DB = Ti.Database.open("BiteBook");
	
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
	DB.close();
	
	return trips;
};

exports.tripGetById = function(_trip_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT * FROM bb_trip WHERE id = ? LIMIT 1", _trip_id);
	
	var trip = {
		id: result.fieldByName("id"),
		start: result.fieldByName("start"),
		end: result.fieldByName("end")
	};
	
	result.close;
	DB.close();
	
	return trip;
};

exports.tripGetSpeciesList = function(_trid_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT species FROM bb_log WHERE trip_id = ? ORDER BY species ASC", _trid_id);
	
	var species = {},
		species_string_bits = [];
	
	while(result.isValidRow()) {
		species[result.fieldByName("species")] = species[result.fieldByName("species")] ? species[result.fieldByName("species")] + 1 : 1;
		
		result.next();
	}
	
	result.close;
	DB.close();
	
	for(key in species) {
		species_string_bits.push(exports.speciesGetById(key) + " (" + species[key] + ")");
	}
	
	return species_string_bits.join(" • ");
};

exports.catchAdd = function(_catch) {
	var trip_id = exports.tripGetValidId(true);
	
	var geolocation = {};
	
	if(Ti.Geolocation.locationServicesEnabled) {
		Ti.Geolocation.purpose = "Catch Geolocation Logging";
		Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
		Ti.Geolocation.distanceFilter = 15;
		Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
		
		Ti.Geolocation.getCurrentPosition(function(_event) {
			if(_event.error) {
				Ti.API.error(_event.error);
			} else {
				geolocation = _event.coords;
			}
			
			var DB = Ti.Database.open("BiteBook");
			
			DB.execute("INSERT INTO bb_log (timestamp, trip_id, species, subspecies, weight, length, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
				Math.round(new Date().getTime() / 1000),
				trip_id,
				_catch.species,
				_catch.subspecies,
				JSON.stringify(_catch.weight),
				JSON.stringify(_catch.length),
				geolocation.latitude,
				geolocation.longitude
			);
			
			DB.close();
			
			Ti.App.fireEvent("BB_UPDATE");
		});
	} else {
		alert("Please turn on location services");
	}
};

exports.catchEdit = function(_catch) {
	var DB = Ti.Database.open("BiteBook");
	
	DB.execute("UPDATE bb_log SET species = ?, subspecies = ?, weight = ?, length = ? WHERE id = ?",
		_catch.species,
		_catch.subspecies,
		JSON.stringify(_catch.weight),
		JSON.stringify(_catch.length),
		_catch.id
	);
	
	DB.close();
	
	Ti.App.fireEvent("BB_EDIT");
};

exports.catchRemove = function(_catch_id, _trip_id) {
	var DB = Ti.Database.open("BiteBook");
	
	DB.execute("DELETE FROM bb_log WHERE id = ?", _catch_id);
	
	DB.close();
	
	var trip_count = exports.catchGetCountByTrip(_trip_id);
	
	if(trip_count == 0) {
		exports.tripRemove(_trip_id);
	} else {
		Ti.App.fireEvent("BB_UPDATE");
	}
};

exports.catchGetById = function(_catch_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT * FROM bb_log WHERE id = ? LIMIT 1", _catch_id);
	
	var _catch = {
		id: result.fieldByName("id"),
		timestamp: result.fieldByName("timestamp"),
		trip_id: result.fieldByName("trip_id"),
		species: result.fieldByName("species"),
		subspecies: result.fieldByName("subspecies"),
		weight: JSON.parse(result.fieldByName("weight")),
		length: JSON.parse(result.fieldByName("length")),
		latitude: result.fieldByName("latitude"),
		longitude: result.fieldByName("longitude")
	};
	
	result.close;
	DB.close();
	
	return _catch;
};

exports.catchGetByTripId = function(_trip_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT * FROM bb_log WHERE trip_id = ? ORDER BY timestamp DESC", _trip_id);
	
	var catches = [];
	
	while(result.isValidRow()) {
		var _catch = {
			id: result.fieldByName("id"),
			timestamp: result.fieldByName("timestamp"),
			species: result.fieldByName("species"),
			subspecies: result.fieldByName("subspecies"),
			weight: JSON.parse(result.fieldByName("weight")),
			length: JSON.parse(result.fieldByName("length")),
			latitude: result.fieldByName("latitude"),
			longitude: result.fieldByName("longitude")
		};
		
		catches.push(_catch);
		result.next();
	}
	
	result.close;
	DB.close();
	
	return catches;
};

exports.catchGetByLocation = function(_geo) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT id, species, subspecies, weight, latitude, longitude FROM bb_log WHERE latitude < " + (_geo.latitude + _geo.latitudeDelta) + " AND latitude > " + (_geo.latitude - _geo.latitudeDelta) + " AND longitude < " + (_geo.longitude + _geo.longitudeDelta) + " AND longitude > " + (_geo.longitude - _geo.longitudeDelta) + " LIMIT 25");
	
	var catches = [];
	
	while(result.isValidRow()) {
		var _catch = {
			id: result.fieldByName("id"),
			species: result.fieldByName("species"),
			subspecies: result.fieldByName("subspecies"),
			weight: JSON.parse(result.fieldByName("weight")),
			latitude: result.fieldByName("latitude"),
			longitude: result.fieldByName("longitude")
		};
		
		catches.push(_catch);
		result.next();
	}
	
	result.close;
	DB.close();
	
	return catches;
};

exports.catchGetCountByTrip = function(_trip_id) {
	if(!_trip_id) {
		_trip_id = exports.tripGetValidId(false);
	}
	
	if(_trip_id) {
		var DB = Ti.Database.open("BiteBook");
		
		var result = DB.execute("SELECT count(*) as CatchCount FROM bb_log WHERE trip_id = ? ORDER BY timestamp DESC", _trip_id);
		
		var count = result.fieldByName("CatchCount");
		
		result.close;
		DB.close();
		
		return count;
	} else {
		return 0;
	}
};

exports.catchGetCountByLocation = function(_geo) {
	var DB = Ti.Database.open("BiteBook");
	
	// 0.001 = 316.8ft
	var result = DB.execute("SELECT count(*) as CatchCount FROM bb_log WHERE latitude < " + (_geo.latitude + 0.001) + " AND latitude > " + (_geo.latitude - 0.001) + " AND longitude < " + (_geo.longitude + 0.001) + " AND longitude > " + (_geo.longitude - 0.001) + " LIMIT 99");
	
	var count = result.fieldByName("CatchCount");
	
	result.close;
	DB.close();
	
	return count;
};

exports.speciesGetAll = function() {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT id, name FROM bb_species ORDER BY name ASC");
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
	DB.close();
	
	return species;
};

exports.speciesGetById = function(_species_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT name FROM bb_species WHERE id = ? LIMIT 1", _species_id);
	
	var name = result.fieldByName("name");
	
	result.close;
	DB.close();
	
	return name;
};

exports.speciesHasSubspecies = function(_species_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT count(*) as SubspeciesCount FROM bb_subspecies WHERE parent_id = ?", _species_id);
	
	var count = result.fieldByName("SubspeciesCount");
	
	result.close;
	DB.close();
	
	if(count > 0) {
		return true;
	} else {
		return false;
	}
};

exports.subspeciesGetBySpeciesId = function(_species_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT id, name FROM bb_subspecies WHERE parent_id = ? ORDER BY name ASC", _species_id);
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
	DB.close();
	
	return species;
};

exports.subspeciesGetById = function(_subspecies_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT name FROM bb_subspecies WHERE id = ? LIMIT 1", _subspecies_id);
	
	var name = result.fieldByName("name");
	
	result.close;
	DB.close();
	
	return name;
};

exports.upgradeDatabase = function() {
	var installed = Ti.App.Properties.getInt("BB_DATABASE_VERSION", 0);
	
	if(installed >= DatabaseVersion) {
		return;
	}
	
	var DB = Ti.Database.open("BiteBook");
	
	DB.file.setRemoteBackup(false);
	
	if(installed == 0) {
		DB.execute("DROP TABLE IF EXISTS bb_log");
		DB.execute("DROP TABLE IF EXISTS bb_trip");
		DB.execute("DROP TABLE IF EXISTS bb_species");
		DB.execute("DROP TABLE IF EXISTS bb_subspecies");
		DB.execute("CREATE TABLE bb_log (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, timestamp INTEGER NOT NULL, trip_id INTEGER NOT NULL, species INTEGER NOT NULL, subspecies INTEGER, weight BLOB, length BLOB, latitude INTEGER, longitude INTEGER)");
		DB.execute("CREATE TABLE bb_trip (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, start INTEGER NOT NULL, end INTEGER DEFAULT (0) )");
		DB.execute("CREATE TABLE bb_species (id INTEGER PRIMARY KEY NOT NULL UNIQUE, name TEXT NOT NULL)");
		DB.execute("CREATE TABLE bb_subspecies (id INTEGER PRIMARY KEY NOT NULL UNIQUE, parent_id INTEGER NOT NULL, name TEXT NOT NULL)");
		DB.execute("BEGIN TRANSACTION");
		DB.execute("INSERT INTO bb_species VALUES(0,'Alewife')");
		DB.execute("INSERT INTO bb_species VALUES(1,'Bass')");
		DB.execute("INSERT INTO bb_species VALUES(2,'Bluegill')");
		DB.execute("INSERT INTO bb_species VALUES(3,'Bowfin')");
		DB.execute("INSERT INTO bb_species VALUES(4,'Bullhead')");
		DB.execute("INSERT INTO bb_species VALUES(5,'Carp')");
		DB.execute("INSERT INTO bb_species VALUES(6,'Catfish')");
		DB.execute("INSERT INTO bb_species VALUES(7,'Crappie')");
		DB.execute("INSERT INTO bb_species VALUES(8,'Drum')");
		DB.execute("INSERT INTO bb_species VALUES(9,'Gar')");
		DB.execute("INSERT INTO bb_species VALUES(10,'Muskellunge')");
		DB.execute("INSERT INTO bb_species VALUES(11,'Perch')");
		DB.execute("INSERT INTO bb_species VALUES(12,'Pickerel')");
		DB.execute("INSERT INTO bb_species VALUES(13,'Pike')");
		DB.execute("INSERT INTO bb_species VALUES(14,'Shad')");
		DB.execute("INSERT INTO bb_species VALUES(15,'Sunfish')");
		DB.execute("INSERT INTO bb_species VALUES(16,'Trout')");
		DB.execute("INSERT INTO bb_species VALUES(17,'Walleye')");
		DB.execute("INSERT INTO bb_species VALUES(18,'Warmouth')");
		DB.execute("INSERT INTO bb_subspecies VALUES(0,1,'Hybrid')");
		DB.execute("INSERT INTO bb_subspecies VALUES(1,1,'Largemouth')");
		DB.execute("INSERT INTO bb_subspecies VALUES(2,1,'Redeye')");
		DB.execute("INSERT INTO bb_subspecies VALUES(3,1,'Rock')");
		DB.execute("INSERT INTO bb_subspecies VALUES(4,1,'Smallmouth')");
		DB.execute("INSERT INTO bb_subspecies VALUES(5,1,'Spotted')");
		DB.execute("INSERT INTO bb_subspecies VALUES(6,1,'Striped')");
		DB.execute("INSERT INTO bb_subspecies VALUES(7,1,'White')");
		DB.execute("INSERT INTO bb_subspecies VALUES(8,5,'Common')");
		DB.execute("INSERT INTO bb_subspecies VALUES(9,5,'Grass')");
		DB.execute("INSERT INTO bb_subspecies VALUES(10,6,'Blue')");
		DB.execute("INSERT INTO bb_subspecies VALUES(11,6,'Bullhead')");
		DB.execute("INSERT INTO bb_subspecies VALUES(12,6,'Channel')");
		DB.execute("INSERT INTO bb_subspecies VALUES(13,6,'Flathead')");
		DB.execute("INSERT INTO bb_subspecies VALUES(14,6,'White')");
		DB.execute("INSERT INTO bb_subspecies VALUES(15,7,'Black')");
		DB.execute("INSERT INTO bb_subspecies VALUES(16,7,'White')");
		DB.execute("INSERT INTO bb_subspecies VALUES(17,11,'White')");
		DB.execute("INSERT INTO bb_subspecies VALUES(18,11,'Yellow')");
		DB.execute("INSERT INTO bb_subspecies VALUES(19,12,'Chain')");
		DB.execute("INSERT INTO bb_subspecies VALUES(20,12,'Redfin')");
		DB.execute("INSERT INTO bb_subspecies VALUES(21,14,'American')");
		DB.execute("INSERT INTO bb_subspecies VALUES(22,14,'Gizzard')");
		DB.execute("INSERT INTO bb_subspecies VALUES(23,14,'Hickory')");
		DB.execute("INSERT INTO bb_subspecies VALUES(24,14,'Threadfin')");
		DB.execute("INSERT INTO bb_subspecies VALUES(25,15,'Green')");
		DB.execute("INSERT INTO bb_subspecies VALUES(26,15,'Redbreast')");
		DB.execute("INSERT INTO bb_subspecies VALUES(27,15,'Redear')");
		DB.execute("INSERT INTO bb_subspecies VALUES(28,15,'Spotted')");
		DB.execute("INSERT INTO bb_subspecies VALUES(29,16,'Brook')");
		DB.execute("INSERT INTO bb_subspecies VALUES(30,16,'Brown')");
		DB.execute("INSERT INTO bb_subspecies VALUES(31,16,'Rainbow')");
		DB.execute("COMMIT");
		
		installed = 1;
	}
	
	DB.close();
	
	Ti.App.Properties.setInt("BB_DATABASE_VERSION", DatabaseVersion);
};

exports.upgradeDatabase();