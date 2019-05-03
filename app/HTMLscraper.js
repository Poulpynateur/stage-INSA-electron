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
var name = '';

module.exports = {
    fromOption: function (option_object) {
        name = option_object.attr('name');
        if (scrape_target.hasOwnProperty(name)) {
            //If we have the target in our scrapping list
            initiScrape(scrape_target[name]);
        }
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
                success(this.responseText);
            }
            else {
                if(error)
                    error(this.responseText);
                else
                    console.error("Oopsy, error occured: %d (%s)", this.status, this.statusText);
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
function initiScrape(_target) {

    target = _target;
    //Refresh the DOM
    $('#site_name').text(target.info.domain_url);
    $('main').removeClass('d-none');

    requestToUrl(getUrl(target.info), function(html) {
        var content = cheerio.load(html);
        
        //Getting total number of article
        if(target.control.total_articles) {
            var total = content(target.control.total_articles).text().match(/(\d*[,.\s]?\d+)(?!.*\d)/g);
            target.info.total_articles = parseInt(total[0].replace(/[.,\s]?/g,''));
        }
        else if(target.control.total_pages) {
            var total = content(target.control.total_pages).text().match(/[0-9]*/g);
            target.info.max_page = parseInt(total[0]);
            target.info.total_articles = target.info.max_page*target.info.article_per_page;
        }
        //For TEST PURPOSE
        target.info.total_articles = target.info.article_per_page;

        //Refresh the DOM
        $('#scrapping_status_total').html('<h5><b>' + target.info.total_articles + '</b> articles founds </h5>');

        scrape(target);

    });
}

function scrape() {
    //Refresh the DOM
    $('#scrapping_in_process').removeClass('d-none');

    requestToUrl(getUrl(target.info), function(html) {
        getArticlesOfPage(html, function(article_index, data) {
            articles.push(data);
            //Refresh the DOM : progress bar
            $('#progress_nbr_article').text(articles.length + ' / ' + target.info.total_articles + ' articles load');
            var progress_percent = articles.length*100/target.info.total_articles;
            $('#progress_bar_article').attr('aria-valuenow', progress_percent).css('width', progress_percent + '%');

            /**
             * Load the next page then all articles are load
             */
            if(articles.length >= target.info.total_articles) {
                return scrappingDone();
            }
            else if(article_index+1 == target.info.article_per_page) {
                return scrape();
            }
        });
    });

    target.info.page_number += 1;
}

/**
 * Load articles from html content()
 * @param {*} callback is launch then article is load
 */
function getArticlesOfPage(html, callback) {
    var content = cheerio.load(html);

    var articles = content(target.control.article);
    /**
     * Some page doesn't give the total number of articles, instead we make an estimation
     * To make sure we stop when all article are done the correct total is set at the last page
     */
    if(target.info.page_number >= target.info.max_page) {
        target.info.total_articles = articles.length + (target.info.max_page - 1)*target.info.article_per_page;
    }

    var article_index = 0;
    articles.each(function() {
        var data = {};
        var link = content(this).find(target.control.link).attr('href');
        data.link = target.info.domain_url + link;

        if(target.query)
            getDataFromHtml(content, target.query, data, content(this));

        if(target.query_page) {
            //One site drop a 403 and send the page anyway, so we have to handle error body
            var page_load = function(html) {
                var content = cheerio.load(html);

                getDataFromHtml(content, target.query_page, data);
                callback(article_index++, data);
            };
            requestToUrl(data.link, page_load, page_load);
        }
        else {
            callback(article_index++, data);
        }
    });
}

function readContentFromQuery(content, queries, article) {
    if(Array.isArray(queries)) {
        var text = "";
        for(var i=0; i<queries.length; i++) {
            text = (article)? article.find(queries[i]).text() : content(queries[i]).text();
            if(text) {
                return text;
            }
        }
        return text;
    }
    else {
        return (article)? article.find(queries).text() : content(queries).text();
    }
}

function getDataFromHtml(content, queries, data, article) {
    for(var key in queries) {
        if(typeof queries[key] === 'object' && !(queries[key] instanceof Array)) {
            var text = readContentFromQuery(content, queries[key].query, article).match(queries[key].regex);
            if(text)
                data[key] = text[0];
        }
        else {
            data[key] = readContentFromQuery(content, queries[key], article);
        }
    }
}

/**
 * Then all articles are scrap
 */
function scrappingDone() {
    console.log(articles);
    fs.writeFile("./ressources/app/" + name + ".articles.json", JSON.stringify(articles), function(err) {
        if(err)
            return console.error(err);
        
        $('#scrapping_done').removeClass('d-none'); 
    });
}