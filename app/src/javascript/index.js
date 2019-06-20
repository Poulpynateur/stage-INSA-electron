/**
 * index.js
 * 
 * Manage events from the interface.
 */

const {shell} = require('electron');

//Internal modules
const files = require('./FilesManager.js');

const scrape = require('./HTMLscraper.js');
const rss = require('./RSSreader.js');

//Parameters
var scrape_param = files.param.scrape;

/**** On page ready event ****/

$(document).ready(function() {
	/**
	 * Generate menu from conf file
	 */
	Object.keys(scrape_param).forEach(function(source) {
		var site = scrape_param[source];
		var option = $(document.createElement('option')).attr({"name": source, "value": site.info.domain_url}).text(site.full_name);
		$('#target_site').append(option);
	});

	/**
	 * Check new articles in RSS feed :
	 * - On start
	 * - Every 7200000 ms (2 hours)
	 */
	rss.checkForNew();
	setInterval(function() {
		 rss.checkForNew();
	}, 7200000);
});

/**** On click buttons events ****/

$(document).on('click', '#scrape_articles', function(event) {
	scrape.fromOption($('#target_site').find(":selected"));
});

$(document).on('click', '#navigate_to_site', function(event) {
	shell.openExternal($('#target_site').find(":selected").val());
});

$(document).on('click', '#rss_test_launch', function(event) {
	rss.checkForNew();
});