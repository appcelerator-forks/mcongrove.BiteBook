

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
	
	var result = DB.execute("SELECT id, start FROM bb_trip ORDER BY start DESC LIMIT 1");
	
	var trip_id,
		trip_start = 0;
	
	while(result.isValidRow()) {
		trip_id = result.fieldByName("id");
		trip_start = result.fieldByName("start");
		
		result.next();
	}
	
	result.close();
	DB.close();
	
	if(trip_id == null || typeof trip_id == "undefined" || trip_id === false) {
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
			
			DB.execute("INSERT INTO bb_log (timestamp, trip_id, species, weight, length, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)",
				Math.round(new Date().getTime() / 1000),
				trip_id,
				_catch.species,
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
	
	var result = DB.execute("SELECT id, species, weight, latitude, longitude FROM bb_log WHERE latitude < " + (_geo.latitude + _geo.latitudeDelta) + " AND latitude > " + (_geo.latitude - _geo.latitudeDelta) + " AND longitude < " + (_geo.longitude + _geo.longitudeDelta) + " AND longitude > " + (_geo.longitude - _geo.longitudeDelta) + " LIMIT 25");
	
	var catches = [];
	
	while(result.isValidRow()) {
		var _catch = {
			id: result.fieldByName("id"),
			species: result.fieldByName("species"),
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
	
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT count(*) as CatchCount FROM bb_log WHERE trip_id = ? ORDER BY timestamp DESC", _trip_id);
	
	var count = result.fieldByName("CatchCount");
	
	result.close;
	DB.close();
	
	return count;
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
	DB.close();
	
	return species;
};

exports.speciesGetVisible = function() {
	var DB = Ti.Database.open("BiteBook");
	
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
	DB.close();
	
	return species;
};

exports.speciesGetById = function(_species_id) {
	var DB = Ti.Database.open("BiteBook");
	
	var result = DB.execute("SELECT * FROM bb_species WHERE id = ? LIMIT 1", _species_id);
	
	var name = result.fieldByName("name");
	
	result.close;
	DB.close();
	
	return name;
};

exports.speciesSetVisible = function(_species_id, _visible) {
	var DB = Ti.Database.open("BiteBook");
	
	DB.execute("UPDATE bb_species SET visible = ? WHERE id = ?", _visible, _species_id);
	
	DB.close();
};

exports.populate = function() {
	if(Ti.App.Properties.getBool("DB_INSTALLED", false)) {
		return;
	}
	
	var DB = Ti.Database.open("BiteBook");
	
	DB.file.setRemoteBackup(false);
	
	DB.execute("DROP TABLE IF EXISTS bb_log");
	DB.execute("DROP TABLE IF EXISTS bb_trip");
	DB.execute("DROP TABLE IF EXISTS bb_species");
	DB.execute("CREATE TABLE bb_log (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE, timestamp INTEGER NOT NULL, trip_id INTEGER NOT NULL, species INTEGER NOT NULL, weight BLOB, length BLOB, latitude INTEGER, longitude INTEGER)");
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
	DB.execute("INSERT INTO bb_species VALUES(48,'Sunfish',1)");
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
	
	DB.close();
	
	Ti.App.Properties.setBool("DB_INSTALLED", true);
};

exports.populate();