const {shell} = require('electron');
const fs = require('fs');

var scrape = require('./HTMLscraper.js');
var rss = require('./RSSreader.js');

var scrape_source = require('../ressources/app/HTMLscraper.json');

/**
 * Generate option from json
 * Show RSS statistics
 */
$(document).ready(function() {
	var select = $('#target_site');
	Object.keys(scrape_source).forEach(function(source) {
		var site = scrape_source[source];
		var option = $(document.createElement('option')).attr({"name": source, "value": site.info.domain_url}).text(site.full_name);
		select.append(option);
	});

	rss.refreshRSSstat();
});

$(document).on('click', '#scrape_articles', function(event) {
	scrape.fromOption($('#target_site').find(":selected"));
});

$(document).on('click', '#navigate_to_site', function(event) {
	shell.openExternal($('#target_site').find(":selected").val());
});

$(document).on('click', '#rss_test_launch', function(event) {
	rss.checkForNew();
});
$(document).on('click', '#rss_refresh_stat', function(event) {
	rss.refreshRSSstat();
});