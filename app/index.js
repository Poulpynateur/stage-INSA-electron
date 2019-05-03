const {shell, ipcRenderer} = require('electron');
const fs = require('fs');

var scrape = require('./HTMLscraper.js');
var scrape_source = require('../ressources/app/scrape_target.json');

/**
 * Generate option from json
 */
$(document).ready(function() {
	var select = $('#target_site');
	Object.keys(scrape_source).forEach(function(source) {
		var site = scrape_source[source];
		var option = $(document.createElement('option')).attr({"name": source, "value": site.info.domain_url}).text(site.full_name);
		select.append(option);
	});
});

$(document).on('click', '#scrape_articles', function(event) {
	scrape.fromOption($('#target_site').find(":selected"));
});

$(document).on('click', '#navigate_to_site', function(event) {
	shell.openExternal($('#target_site').find(":selected").val());
});