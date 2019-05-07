const feedRead = require("davefeedread");
const fs = require('fs');

const timeOutSecs = 30;

var scrape = require('./HTMLscraper.js');
var rss_param = require('../ressources/app/RSSreader.json');

var source

module.exports = {
	checkForNew: function () {
        rss_param.last_update = Date.now();
        rss_param.sources.forEach(source => {
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

function updateArticles(feed, source) {
    console.log(feed);
    var articles = [];
    source.info.new_articles = feed.items.length;

    var articles_load = () => {
        source.info.last_title = feed.items[0].title;
        updateRSSdone(source.parameter_name, articles);
    };

    //Get every items from RSS feed
    for(var i=0; i<feed.items.length; i++) {
        var item = feed.items[i];
        var link = item.link;
        
        if(item.title == source.info.last_title) {
            source.info.new_articles = i;
            break;
        }
        else if(source.properties) {
            //Get data from the feed
            var data = {
                link: link
            };
            for(var property in source.properties) {
                if(Array.isArray(source.properties[property])) {
                    data[property] = item[source.properties[property][0]][source.properties[property][1]];
                }
                else {
                    data[property] = item[source.properties[property]];
                }
            }
            articles.push(data);
        }
        else {
            scrape.fromUrl(link, source.parameter_name, function(data) {
                articles.push(data);
                //If we reach the end of the feed
                if(articles.length == source.info.new_articles) {
                    articles_load();
                }
            });
        }
    }
    if(source.properties) {
        articles_load();
    }
}

function updateRSSdone(name, articles) {
    console.log(articles);
    //Save param
    fs.writeFile("./ressources/app/RSSreader.json", JSON.stringify(rss_param), function(err) {
        if(err)
            return console.error(err);
    });

    //Save results
    fs.writeFile("./ressources/app/output/rss/" + name + ".rss.json", JSON.stringify(articles), function(err) {
        if(err)
            return console.error(err);
    });
}