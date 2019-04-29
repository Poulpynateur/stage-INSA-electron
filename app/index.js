const {shell, ipcRenderer} = require('electron');

var scrape = require('./HTMLscraper.js');

$(document).on('click', '#scrape_articles', function(event) {
	scrape.fromOption($('#target_site').find(":selected"));
});

$(document).on('click', '#navigate_to_site', function(event) {
	shell.openExternal($('#target_site').find(":selected").val());
})