/**
 * RSSreader.js
 * 
 * Load the RSS feed and check for new articles.
 * Use *HTMLscraper.js* to scrape the new articles.
 * */

const feedRead = require("davefeedread");

//Internal modules
const view = require('./ViewManager.js');
const files = require('./FilesManager.js');

const scrape = require('./HTMLscraper.js');

//Parameters
var rss_param = files.param.rss;

module.exports = {
	checkForNew: function () {
        const timeOutSecs = 30;

        rss_param.last_update = Date.now();
        rss_param.feed_read = 0;
        rss_param.sources.forEach((source) => {
            /**
		    * Using [https://github.com/scripting/feedRead/blob/master/examples/readurl/read.js](davefeedread)
		    * Based on [https://github.com/danmactough/node-feedparser](node-feedparser)
		    *
		    * We obtain a Javascript object from RSS feed
		    */
		    feedRead.parseUrl(source.rss_url, timeOutSecs, function (err, feed) {
		    	if (err)
		    		console.error(err.message);
		    	else 
                    updateArticles(feed, source);
		    });
        });
    }
};

/**
 * Check for new articles and load then
 * 
 * @param {Object} feed represent the RSS feed
 * @param {Object} source setting object from conf file
 */
function updateArticles(feed, source) {
    var articles = [];
    source.info.new_articles = 0;

    //Looking if we found the last article we load in the list
    for(var i=0; i<feed.items.length; i++) {
        var item = feed.items[i];
        if(item.title == source.info.last_title) {
            //If we found the last loaded article we stop
            source.info.new_articles = i;
            break;
        }
        else {
            source.info.new_articles = i+1;
        }
    }
    source.info.total_articles += source.info.new_articles;

    //We set the the newest article from this feed as the need last article
    if(feed.items[0]) {
        source.info.last_title = feed.items[0].title;
    }  

    //If there is no new articles
    if(source.info.new_articles == 0) {
        rss_param.feed_read++;
        view.rss.refresh(rss_param);
    }
    else {
        //Get every new items from RSS feed, every item is an article
        for(var i=0; i<source.info.new_articles; i++) {
            var item = feed.items[i];
            var link = item.link;

            //We scrape then as we did before with the old articles
            scrape.fromUrl(link, source.parameter_name, function(data) {
                articles.push(data);
                //If we reach the end of the feed
                if(articles.length == source.info.new_articles) {
                    rss_param.feed_read++;

                    if(rss_param.feed_read == rss_param.sources.length)
                        files.param.saveRSS(rss_param);

                    updateArticlesDone(source.parameter_name, articles);
                }
            });
        }
    }
}

/**
 * Save param and refresh the view
 */
function updateArticlesDone(name, articles) {
    files.save_article.rss(name, articles);
    view.rss.refresh(rss_param);
}