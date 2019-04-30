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

//TEST add scrape
$(document).on('click', '#add_scraping_test', function(event) {
	var form = $('#add_scraping');

	var domain_url = form.find('[name="domain_url"]').first().val();
	var name = domain_url.slice(domain_url.indexOf('//') + 1);
	name = name.slice(1-name.indexOf('/'));

	var object = formSerialize(form);
	
	scrape.fromObject(object, name);
});

$(document).on('click', '#add_scraping_to_json', function(event) {
	var form = $('#add_scraping');

	var domain_url = form.find('[name="domain_url"]').first().val();
	var name = domain_url.slice(domain_url.indexOf('//') + 1);
	name = name.slice(1-name.indexOf('/'));

	scrape_source[name] = formSerialize(form);

    fs.writeFile("./ressources/app/scrape_target.json", JSON.stringify(scrape_source), function(err) {
        if(err)
            return console.error(err); 
    });
});

function formSerialize(form) {
	var article = form.find('[name="article"]').first().val();
	var object = {
		"full_name": form.find('[name="full_name"]').first().val(),
		"query": {
			"article": article.replace(/html\S*\sbody\S*\s/, ''),
            "link": form.find('[name="link"]').first().val().replace(article, ''),
            "title": form.find('[name="title"]').first().val().replace(article, ''),
            "total_articles": form.find('[name="total_articles"]').first().val().replace(/html\S*\sbody\S*\s/, '')
        },
        "info": {
            "domain_url": form.find('[name="domain_url"]').first().val(),
            "articles_url": form.find('[name="articles_url"]').first().val(),
            "article_per_page": parseInt(form.find('[name="article_per_page"]').first().val()),
            "page_number": parseInt(form.find('[name="page_number"]').first().val())
        }
	};

	if(form.find('[name="abstract_article_page"]').first().is(':checked')) {
		object.query.abstract_article_page = true;
		object.query.abstract = form.find('[name="abstract"]').first().val().replace(/html\S*\sbody\S*\s/, '');
	}
	else {
		object.query.abstract = form.find('[name="abstract"]').first().val().replace(article, '').replace(/html\S*\sbody\S*\s/, '');
	}
	
	return object;
}