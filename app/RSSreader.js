const feedRead = require("davefeedread");
const fs = require('fs');

const timeOutSecs = 30;

var scrape = require('./HTMLscraper.js');
var rss_param = require('../ressources/app/RSSreader.json');

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
    },
    refreshRSSstat: refreshDOM
};

function updateArticles(feed, source) {
    var articles = [];
    source.info.new_articles = 0;

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
                if(articles.length == feed.items.length) {
                    articles_load();
                }
            });
        }
    }

    source.info.total_articles += source.info.new_articles;
    articles_load();
}

function updateRSSdone(name, articles) {
    //Save param
    fs.writeFile("./ressources/app/RSSreader.json", JSON.stringify(rss_param, null, 2), function(err) {
        if(err)
            return console.error(err);
    });

    //Save results
    fs.writeFile("./ressources/app/output/rss/" + name + ".rss.json", JSON.stringify(articles), function(err) {
        if(err)
            return console.error(err);
    });
}

function refreshDOM() {
    var param = JSON.parse(fs.readFileSync('./ressources/app/RSSreader.json'));
    var sources = param.sources;
    var timestamp = param.last_update;

    var tbody = document.querySelector('#RSS_statistics tbody');
    var total_new = 0;
    tbody.innerHTML = '';

    sources.forEach((source)=>{
        var tr = document.createElement('tr');
        
        var url = document.createElement('th');
        url.setAttribute('scope', 'row');
        url.innerText = source.parameter_name;

        var rss = document.createElement('td');
        rss.innerHTML = "<a href='"+source.rss_url+"'>"+source.rss_url+"</a>";

        var total = document.createElement('td');
        total.innerText = source.info.total_articles;

        var nbr_new = document.createElement('td');
        nbr_new.className = "text-success text-right";
        nbr_new.innerText = source.info.new_articles + ' new';

        tr.appendChild(url);
        tr.appendChild(rss);
        tr.appendChild(total);
        tr.appendChild(nbr_new);

        tbody.appendChild(tr);
        total_new += source.info.new_articles;
    });

    var date =  new Date(timestamp);
    $('#last_rss_update').text('Last update : '+date.toLocaleString());
    $('#total_rss_new').text(total_new + ' new articles');
}