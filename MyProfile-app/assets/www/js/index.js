console.log(">>> execute index.js");

// binde die Funktion onDeviceReady an das deviceready-event :::
document.addEventListener("deviceready", onDeviceReady, false);



// myPlugin.echo();

// Datenbank-Zugriffsdaten :::
var dbName = "developer_db";
var dbVersion = "1.0";
var dbDisplayName = "Developer Database";
var dbSize = 200000; // in bytes

// Diese Tabelle wird zum persistieren der OS-Developer-Kontakte verwendet :::
var tableName = "os_developers";

var meLastName = "Siebert";
var meFirstName = "Andreas";
var isOsDeveloper = 1; // 1 = ist ein open-source developer, 0 = ist kein
// open-source developer

console.log(">>> open database");
var DB = window.openDatabase(dbName, dbVersion, dbDisplayName, dbSize);

function onDeviceReady() {
	// Die UI blockieren (siehe API jqMobi)
	$.ui.blockUI(.9);

	initDB();

	if (CONTACTS == null || CONTACTS.length == 0)
		readContacts();
	else
		fillContacts(CONTACTS);

	$.ui.unblockUI();
}

/**
 * Globales Array zur Beschleunigung des Zugriffs auf die Kontakt-Datenbank.
 * 
 * Ein Array aus contact-daten. Jeder Eintrag hat zwei Elemente: contact :
 * contacts[i].displayName, contact_id : contacts[i].id
 * 
 */
var CONTACTS = [];

/**
 * Liest die Kontaktdaten aus der Contact-Datenbank ein. Die eingelesenen
 * Kontakte werden in ein Array (GLOBAL) zwischengespeicher.
 */
function readContacts() {
	var options = new ContactFindOptions();
	options.filter = "";
	options.multiple = true;

	var fields = [ "displayName", "id", "name" ];

	navigator.contacts
			.find(
					fields,

					// onSuccess() -> Kontakte erfolgreich eingelesen
					function(contacts) {
						console.log(">>> found contacts: " + contacts.length);

						var displayNameCounter = 0;
						for ( var i = 0; i < contacts.length; i++) {
							console
									.log(">>> take a contact and put into template.");
							console.log(">>>>> lade " + contacts[i].nickname
									+ " id: " + contacts[i].id + " :::  "
									+ contacts[i].displayName);

							var displayName = contacts[i].displayName;

							if (displayName == null) {
								console.log(">>>> Skip contact id = "
										+ contacts[i].id);
								displayNameCounter++; // zähle übersprungene
								// Kontakte

								continue;
							}

							console.log(">>>> displayname : " + displayName
									+ " ::: length " + displayName.length
									+ " (" + displayName.length < 1 + ")");

							var splitted = splitDisplayName(contacts[i].displayName);

							var entry = {
								contact : contacts[i].displayName,
								contact_id : contacts[i].id,
								contact_lastname : splitted.lastName,
								// contacts[i].familyName,
								contact_firstname : splitted.firstName
							// contacts[i].givenName
							};

							CONTACTS.push(entry);
							console.log("contact pushed. id = "
									+ entry.contact_id);
						}

						// global vormerken (es gibt bessere JS-Patterns als mit
						// den globalen Variablen)
						SKIPED_CONTACTS = displayNameCounter;

						fillContacts(CONTACTS, true);
					},

					function(contactError) {
						alert("Fehler beim Einlesen der Kontakte: "
								+ contactError);
					},

					// options zum filter :::
					options);
}

function closeThisModalAndGoToProfiles() {
	findAllOSDevelopers();
}

/**
 * Füllt das Profile Template mit Werten und ruft dieses MODAL an.
 * 
 * @param contactId
 * @param contractFirstName
 * @param contractLastName
 */
function loadProfile(contactId, contractFirstName, contractLastName) {
	console.log("load profile: " + contractFirstName + " " + contractLastName);
	insertOSDeveloper(contactId, contractFirstName, contractLastName);
}

/**
 * Damit die Performance beim Bauen der Seite mit dem Template nicht zu lange
 * dauert, werden wir hier eine maximale Anzahl der einzulesenden Kontakte
 * definieren.,
 */
var MAX_NR_OF_CONTACTS = 10;

/**
 * diese globale Variable gibt an, wie viele Kontakte beim einlesen übersprungen
 * wurden.
 */
var SKIPED_CONTACTS = 0;

/**
 * Füllt ein Template mit Werten und fügt das Ergebnis in das Content-Panel ein.
 * 
 * @param contacts
 *            nie NULL
 */
function fillContacts(contacts, hideSplashScreen) {
	console.log("fill contacts from buffer");

	$("#contacts_length").html(contacts.length);
	$("contacts_skiped_length").html(SKIPED_CONTACTS);

	for ( var i = 0; i < CONTACTS.length && i < MAX_NR_OF_CONTACTS; i++) {
		var tmpl = $.template("contact_list_template", CONTACTS[i]);

		$("#contacts_list").append(tmpl);
	}

	console.log( ">>> verstecke den Splashscreen" );
	if( hideSplashScreen == true ) {
		// Verstrecke den SplashScreeen nach dem erfolgreichen
		// Laden der App inkl. Ausführen der initialen TX
		navigator.splashscreen.hide();		
	}
}
/**
 * @param displayName
 * @returns
 */
function splitDisplayName(displayName) {
	if (displayName == null)
		return null;

	var splittedName = displayName.split(" ");
	var firstName = splittedName[0];
	var lastName = splittedName[1];

	console.log("splitted:" + displayName + " into " + firstName + ", "
			+ lastName);

	return {
		lastName : lastName,
		firstName : firstName
	};
}

/**
 * Füllt die Liste der Profile aus dem Database-Result.
 * 
 * @param results
 */
function fillProfilesView(results) {
	var resultCounter = results.rows.length;
	console.log(">>> found rows results.rows.length : " + resultCounter);

	$("#profiles_list").html("");

	for ( var i = 0; i < resultCounter; i++) {
		var item = results.rows.item(i);

		var tmpl = $.template("profile_list_template", {
			contact_lastname : item.lastname,
			contact_firstname : item.firstname
		});

		$("#profiles_list").append(tmpl);
	}

	$.ui.loadContent('#profiles', false, false, 'pop');
	$.ui.hideModal("#myprofile");
}

/**
 * Markiert einen Kontakt als OS-Developer. Dazu werden die Daten des Kontakts
 * in die Datenbank übertragen.
 * 
 * @param contact
 *            nie NULL
 */
function findAllOSDevelopers() {
	DB.transaction(
	// Transation :::
	function(tx) {
		tx.executeSql("SELECT * FROM " + tableName, [],

		// isertOSDeveloperSuccess
		function(tx, results) {
			fillProfilesView(results);
		},

		// isertOSDeveloperError
		function(err) {
			onError(err);
		})
	},

	function(txErr) {
		onError(txErr);
	},

	// on-success tx:
	function() {
		console.log(">>> Select erfolgreich ausgeführt");
	});
}

/**
 * Markiert einen Kontakt als OS-Developer. Dazu werden die Daten des Kontakts
 * in die Datenbank übertragen.
 * 
 * @param contact
 *            nie NULL
 */
function insertOSDeveloper(contactId, contractFirstName, contractLastName) {
	DB
			.transaction(
					// Transation :::
					function(tx) {
						tx.executeSql(
							"INSERT INTO "
							 + tableName
							 + " ( lastname, firstname, pic, is_os_developer ) VALUES (?, ?, '', 1)",
							 [ contractLastName, contractFirstName ],

							// isertOSDeveloperSuccess :::
							function(tx, results) {
								console
								 .log("Kontakt als OS-Developer in die DB eingetragen. Insert-ID = "
										+ results.insertId);
//								alert("Kontakt als OS-Developer eingetragen.");
							},

							// isertOSDeveloperError :::
							function(err) {
								onError(err);
							})
					},

					function(txErr) {
						onError(txErr);
					},

					// on-success tx:
					function() {
						console.log("Database successful initialized: "
								+ dbName + "(v. " + dbVersion + ")");

						// rufe den nächsten dialog auf ...
						var selected = {
							contact_id : contactId,
							contact_lastname : contractLastName,
							contact_firstname : contractFirstName
						};

						var tmpl = $.template("profile_template", selected);
						$.ui.updateContentDiv('#myprofile', tmpl);
						$.ui.showModal("#myprofile");
					});
}

/**
 * initialisiert die datenbank
 */
function initDB() {
	DB.transaction(
	// Transation :::
	function(tx) {
		console.log("execute transaction.");

		var dropTableQuery = 'DROP TABLE IF EXISTS ' + tableName;
		console.log("query: " + dropTableQuery)
		tx.executeSql(dropTableQuery);

		var createTableQuery = "CREATE TABLE IF NOT EXISTS " + tableName
				+ " (id INTEGER PRIMARY KEY AUTOINCREMENT, "
				+ "  lastname TEXT NOT NULL, " + "  firstname TEXT NOT NULL,"
				+ "  pic TEXT NOT NULL," + "  is_os_developer INTEGER " + ")";
		console.log(createTableQuery);
		tx.executeSql(createTableQuery, [], querySuccess, onError);

		// Füge dich selbst als OS-Developer authomathisch in
		// die DB ein :::
		tx.executeSql("INSERT INTO " + tableName
				+ "( lastname, firstname, pic, is_os_developer ) " + " VALUES "
				+ " ('" + meLastName + "', '" + meFirstName + "', '', "
				+ isOsDeveloper + " )");

	},

	function(txErr) {
		onError(txErr);
	},

	// on-success tx:
	function() {
		console.log("Database successful initialized: " + dbName + "(v. "
				+ dbVersion + ")");
	});
}

function onError(txErr) {
	alert("Die Transaktion/Query wurde mit einem Fehler abgebrochen.  [err-code: "
			+ txErr.code + "]");
}

function onTxSuccess() {
	console.log("Transaktion wurde erfolgreich ausgeführt.");
}

/**
 * Beispiel für eine query.onSuccess-CallBack Funktion
 * 
 * @param tx
 * @param results
 */
function querySuccess(tx, results) {
	console.log("Insert ID = " + results.insertId);
	console.log("Rows Affected = " + results.rowAffected);
	console.log("Selected Rows = " + results.rows.length);
}

/**
 * Beispiel für eine QUERY mit callbacks
 */
function dropTable() {
	db.transaction(function(tx) {
		tx.executeSql("DROP TABLE " + tableName, [],

		function(tx) {
			// showRecords() },
		},

		function(txErr) {
			onError();
		});
	});
}