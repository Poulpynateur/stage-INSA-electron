/**
 * HTMLscraper.js
 * 
 * Load and extract data from page web.
 * Use the conf files to extract data.
 * */

//Internal modules
const cheerio = require('cheerio');

const view = require('./ViewManager.js');
const files = require('./FilesManager.js');

//Parameters
var scrape_target = files.param.scrape;


var articles = [];
var name = '';
var number_error = 0;

module.exports = {
    fromOption: function (option_object) {
        name = option_object.attr('name');
        if (scrape_target.hasOwnProperty(name)) {
            //If the target is in conf file
            initiScrape(scrape_target[name]);
        }
    },
    fromUrl: function(url, target_name, callback) {
        var target = scrape_target[target_name];
        var page_load = function(html) {
            var content = cheerio.load(html);
            var queries = (target.query_page)? target.query_page : target.query_rss;
            var data = getDataFromHtml(content, queries, data);
            data.link = url;
            
            callback(data);
        };
        requestToUrl(url, page_load, page_load);
    }
};

/**
 * Generate URL from info
 * 
 * @param {Object} info of the actual source
 */
function getUrl(info) {
    var url = info.domain_url;
    url += (info.articles_url)
        .replace(/\*article_per_page\*/g, info.article_per_page)
        .replace(/\*page_number\*/g, info.page_number);
    return url;
}

/**
 * Standard way to handle HTTP request
 * 
 * @param {string} url target
 * @param {Function} success callback on success
 * @param {Function} error callback on error
 */
function requestToUrl(url, success, error) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (event) {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                success(this.responseText);
            }
            else {
                //If the error function is defined (i.e. != null)
                if(error) {
                    number_error++;
                    error(this.responseText);
                }
                else
                    console.error("Oopsy, error occured: %d (%s)", this.status, this.statusText);
            }
        }
    };
    
    req.open('GET', url, true);
    req.send(null);
}

/**
 * Used to get the total number of articles, make sure the site is accessible, and then start scraping
 * 
 * @param {Object} target settings from conf file
 */
function initiScrape(target) {

    //Reset parameters
    number_error = 0;
    articles = [];

    view.scraping.refresh(target.info.domain_url);

    requestToUrl(getUrl(target.info), function(html) {
        var content = cheerio.load(html);
        
        //Getting total number of article
        if(target.control.total_articles) {
            /**
             * Get the HTML element that contain the total number of article
             * from a query of the conf file.
             * Then we apply a regex to clean the number.
             */
            var total = content(target.control.total_articles).text().match(/(\d*[,.\s]?\d+)(?!.*\d)/g);
            target.info.total_articles = parseInt(total[0].replace(/[.,\s]?/g,''));
        }
        //If we can't get the number of articles, we can have at least the number of pages
        else if(target.control.total_pages) {
            var total = content(target.control.total_pages).text().match(/[0-9]*/g);
            target.info.max_page = parseInt(total[0]);
            target.info.total_articles = target.info.max_page*target.info.article_per_page;
        }

        //For test purpose : load only the first page of result is option is checked
        if($('#scrape_only_first').is(':checked'))
            target.info.total_articles = target.info.article_per_page;

        view.scraping.updateTotal(target.info.total_articles);
        scrape(target);
    });
}

/**
 * Load the page and extract data
 * 
 * @param {Object} target settings from conf files
 */
function scrape(target) {
    view.scraping.setState('PROCESS');

    requestToUrl(getUrl(target.info), function(html) {
        getArticlesOfPage(html, target, function(article_index, data) {

            //All loaded articles are stores into the articles list
            articles.push(data);
            view.scraping.updateProgressBar(articles.length, target.info.total_articles);

            //If we load every articles from the site
            if(articles.length >= target.info.total_articles - number_error) {
                return files.save_article.archive(name, articles, function() {
                    view.scraping.setState('DONE');
                });
            }
            //If we load finish to load articles from a result page
            else if(article_index+1 == target.info.article_per_page) {
                files.save_article.archive(name, articles);

                //Pass to the next result page
                return scrape(target);
            }
        });
    });

    target.info.page_number += 1;
}

/**
 * Extract articles from HTML content
 * 
 * @param {Function} callback launch then all articles are load
 */
function getArticlesOfPage(html, target, callback) {
    var content = cheerio.load(html);

    var articles_page = content(target.control.article);
    /**
     * If we have the total number of page instead of the total number of articles
     * At the last result page we update the total number of articles
     */
    if(target.info.page_number >= target.info.max_page) {
        target.info.total_articles = articles_page.length + (target.info.max_page - 1)*target.info.article_per_page;
    }

    //Used to detect when the last article is loaded
    var article_index = 0;

    articles_page.each(function() {
        var data = {};
        var link = content(this).find(target.control.link).attr('href');

        //Links are relative to domains in most sites
        if(!link.includes('http'))
            link = target.info.domain_url + link;

        if(target.query) {
            data = getDataFromHtml(content, target.query, content(this));
            data.link = link;
        }
        if(target.query_page) {
            /**
             * Then you handle HTTP request they usualy respond by a 200 ok status
             * 
             * However a site respone with 403 forbiden (basically because the article access is restrain)
             * So we handle the error as it is OK (which is bad)
             */
            var page_load = function(html) {
                var content = cheerio.load(html);

                data = getDataFromHtml(content, target.query_page);
                data.link = link;
                callback(article_index++, data);
            };
            requestToUrl(link, page_load, page_load);
        }
        else {
            //If we dont have to load the page because every data we need are on the result page
            callback(article_index++, data);
        }
    });
}

/**
 * Used to apply the query from the conf file
 * 
 * @param {HTML element} content HTML body of the page
 * @param {String} queries string with query, can be an array of queries
 * @param {HTML element} article the article element (if one), the the query will be search in this (and not in the body)
 * @param {String} attr if we want to get a specific attr value
 * 
 * @returns text that correspond to the query in the content element
 */
function readContentFromQuery(content, queries, article, attr) {
    var result_tag;
    /**
     * If queries is an array we try every query until we get positive result 
     */
    if(Array.isArray(queries)) {
        for(var i=0; i<queries.length; i++) {
            result_tag = (article)? article.find(queries[i]) : content(queries[i]);
            if(result_tag.length > 0)
                break;
        }
    }
    else {
        result_tag = (article)? article.find(queries) : content(queries);
    }

    if(attr) {
        return result_tag.first().attr(attr);
    }
    else {
        //Extracting text from the tag results
        var text = "";
        result_tag.each(function(index) {
            text += $(this).text().trim();
            text += (index < result_tag.length - 1)? ", " : "";
        });
        return text;
    }
}

/**
 * Extract data from a page
 * 
 * @param {HTML element} content HTML body of the page 
 * @param {Object} queries to apply on content, coming from conf file
 * @param {HTML element} article is set if we have a list of articles and want to extract data in it
 */
function getDataFromHtml(content, queries, article) {
    var data = {};
    for(var key in queries) {
        if(typeof queries[key] === 'object' && !(queries[key] instanceof Array)) {

            /**
             * If the query is an object it mean we want to eventually :
             * - Apply a regex match/replace on the result
             * - Want to get a specific attribute from the HTML element (as href for links)
             */

            if(queries[key].regex) {
                var text = readContentFromQuery(content, queries[key].query, article).match(queries[key].regex);
                if(text && text[0])
                    data[key] = text[0];
            }
            if(queries[key].regex_replace) {
                var text = readContentFromQuery(content, queries[key].query, article).replace(queries[key].regex_replace, queries[key].regex_replace_str);
                if(text)
                    data[key] = text;        
            }
            if(queries[key].attr) {
                data[key] =  readContentFromQuery(content, queries[key].query, article, queries[key].attr);
            }
        }
        else {
            data[key] = readContentFromQuery(content, queries[key], article);
        }
    }
    return data;
}