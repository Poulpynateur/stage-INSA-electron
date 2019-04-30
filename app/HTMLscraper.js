var cheerio = require('cheerio');
const fs = require('fs');

/**
 * Hold everything about the different site
 * Including :
 * - query : to scrape specific data from the site
 * - info : to navigate on the site
 * - articles[] that old every article that have been process
 */
var scrape_target = require('../ressources/app/scrape_target.json');

var target = {};
var articles = [];
var name;

module.exports = {
    fromOption: function (option_object) {
        name = option_object.attr('name');
        if (scrape_target.hasOwnProperty(name)) {
            //If we have the target in our scrapping list
            initiScrape(scrape_target[name]);
        }
    },
    /**
     * Only for test purpose
     * Basically do the same as everything done there
     * Just stop on first article and show usefull information for debug
     */
    fromObject: function(target, _name) {

        $('#scraping_test_modal_title').text('Testing ' + target.info.domain_url + ' ...');
        name = _name;

        requestToUrl(getUrl(target.info), function(html) {
            var content = cheerio.load(html);
    
            //Getting total number of article
            var total = content(target.query.total_articles).text().match(/(\d+)(?!.*\d)/g);
            target.info.total_articles = parseInt(total[0]);

            var title = content(target.query.article).find(target.query.title).first().text();
            var link = content(target.query.article).find(target.query.link).attr('href');

            if(target.query.abstract_article_page) {
                requestToUrl(target.info.domain_url + link, function(html) {
                    var content = cheerio.load(html);
                    var abstract = content().find(target.query.abstract).text();
    
                    $('#scrapping_test_abstract').text(abstract);
                }, function(status, msg) {
                    console.error("Oupsy, error occured: %d (%s)", status, msg);
                });
            }
            else {
                var abstract = content(target.query.article).find(target.query.abstract).first().text();
                $('#scrapping_test_abstract').text(abstract);
            }


            //Refresh the DOM
            $('#scrapping_test_url').text(getUrl(target.info));
            $('#scrapping_test_total').text(target.info.total_articles + ' articles');
    
            $('#scrapping_test_title').text(title);
            

            $('#scrapping_test_status').html('Success').addClass('text-success');

        }, function(status, msg) {
            $('#scrapping_test_status').html('Fail to scrape'+ getUrl(target.info) +' (status'+status+') : '+msg).addClass('text-danger');
        });
    }
};

/**
 * Cuz my object are way too much complicated
 * Construct url from the site info : 
 * (domain, url to articles, number of article per page, page number)
 */
function getUrl(info) {
    var url = info.domain_url;
    url += (info.articles_url)
        .replace(/\*article_per_page\*/g, info.article_per_page)
        .replace(/\*page_number\*/g, info.page_number);
    return url;
}

/**
 * Don't ask me why I don't use the ajax function of jquery
 */
function requestToUrl(url, success, error) {
    var actual_article = articles.length - 1;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (event) {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                success(this.responseText, actual_article);
            }
            else {
                error(this.status, this.statusText);
            }
        }
    };
    
    req.open('GET', url, true);
    req.send(null);
}

/**
 * Used to get the total number of articles
 * Make sure the site is accessible
 */
function initiScrape(_target, test) {

    target = _target;
    //Refresh the DOM
    $('#site_name').text(target.info.domain_url);
    $('main').removeClass('d-none');

    requestToUrl(getUrl(target.info), function(html) {
        var content = cheerio.load(html);

        //Getting total number of article
        var total = content(target.query.total_articles).text().match(/(\d+)(?!.*\d)/g);
        target.info.total_articles = parseInt(total[0]);

        //Refresh the DOM
        $('#scrapping_status_total').html('<h5><b>' + target.info.total_articles + '</b> articles founds </h5>');

        scrape(target);
    }, function(status, msg) {
        console.error("Oupsy, error occured: %d (%s)", status, msg);
    });
}

function scrape() {
    //Refresh the DOM
    $('#scrapping_in_process').removeClass('d-none');

    while((target.info.article_per_page * (target.info.page_number - 1)) <= target.info.total_articles) {
        requestToUrl(getUrl(target.info), function(html) {
            getArticlesOfPage(html, function() {
                if(articles.length >= target.info.total_articles)
                    scrappingDone();
            });

            //Refresh the DOM : progress bar
            $('#progress_nbr_article').text(articles.length + ' / ' + target.info.total_articles + ' articles load');
            var progress_percent = articles.length*100/target.info.total_articles;
            $('#progress_bar_article').attr('aria-valuenow', progress_percent).css('width', progress_percent + '%');
        }, function(status, msg) {
            console.error("Oupsy, error occured: %d (%s)", status, msg);
        });

        target.info.page_number += 1;
    }
}

/**
 * Load articles from html content
 */
function getArticlesOfPage(html, callback) {
    var content = cheerio.load(html);

    //Get info for each article
    content(target.query.article).each(function(element) {
        var title = content(this).find(target.query.title).text();

        var link = content(this).find(target.query.link).attr('href');

        if(target.query.abstract_article_page) {
            articles.push({
                'title': title,
                'link': target.info.domain_url + link,
            });
            requestToUrl(target.info.domain_url + link, function(html, actual_article) {
                var content = cheerio.load(html);
                var abstract = content().find(target.query.abstract).text();

                articles[actual_article].abstract = abstract;
            }, function(status, msg) {
                console.error("Oupsy, error occured: %d (%s)", status, msg);
            });
        }
        else {
            var abstract = content(this).find(target.query.abstract).text();
            articles.push({
                'title': title,
                'link': target.info.domain_url + link,
                'abstract': abstract
            });
        }
    });
}

/**
 * Then all articles are scrap
 */
function scrappingDone() {
    fs.writeFile("./ressources/app/" + name + ".articles.json", JSON.stringify(articles), function(err) {
        if(err)
            return console.error(err);
        
        $('#scrapping_done').removeClass('d-none'); 
    });
}