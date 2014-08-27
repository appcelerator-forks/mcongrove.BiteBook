// App bootstrap
var App = require("core"),
	Social = require("social");

var OPTIONS = [
	{
		title: "Connect Pebble Watch",
		controller: "settings_pebbleconnect"
	},
	{
		title: "Download BiteBook on Pebble",
		action: function() {
			Ti.Platform.openURL("pebble://appstore/53fc163a026283911c0000db");
		}
	},
	{
		title: "About BiteBook",
		controller: "settings_about"
	},
	{
		title: "Contact Developer",
		action: function() {
			var email = Ti.UI.createEmailDialog({
				barColor: "#3DA0DA"
			});
		
			email.toRecipients = [ "me@mattcongrove.com" ];
			email.subject = "BiteBook Contact";
			email.messageBody = "";
			email.open();
		}
	},
	{
		title: "Tell Your Friends",
		action: function() {
			Social.share();
		}
	}
];

function init() {
	var rows = [];
	
	for(var i = 0, x = OPTIONS.length; i < x; i++) {
		var row = Alloy.createController("settings_row", { title: OPTIONS[i].title }).getView();
		
		if(OPTIONS[i].controller) {
			row.controller = OPTIONS[i].controller;
			
			row.addEventListener("click", function(_event) {
				var detail = Alloy.createController(_event.row.controller).getView();
				
				$.NavWindow.openWindow(detail);
			});
		} else if(OPTIONS[i].action) {
			row.addEventListener("click", OPTIONS[i].action);
		}
		
		rows.push(row);
	}
	
	$.Table.setData(rows);
}

function closeSettings() {
	$.NavWindow.close();
}

init();