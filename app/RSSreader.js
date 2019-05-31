const feedRead = require("davefeedread");
const fs = require('fs');

const timeOutSecs = 30;

var scrape = require('./HTMLscraper.js');
var rss_param = require('../ressources/conf/RSSreader.json');

module.exports = {
	checkForNew: function () {
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

function updateArticles(feed, source) {
    var articles = [];
    source.info.new_articles = 0;

    //Cheking if there is last article
    for(var i=0; i<feed.items.length; i++) {
        var item = feed.items[i];
        if(item.title == source.info.last_title) {
            source.info.new_articles = i;
            break;
        }
        else {
            source.info.new_articles = i+1;
        }
    }
    source.info.total_articles += source.info.new_articles;

    if(feed.items[0]) {
        source.info.last_title = feed.items[0].title;
    }  

    if(source.info.new_articles == 0) {
        rss_param.feed_read++;
        refreshDOM(rss_param);
    }
    else {
        //Get every new items from RSS feed
        for(var i=0; i<source.info.new_articles; i++) {
            var item = feed.items[i];
            var link = item.link;

            scrape.fromUrl(link, source.parameter_name, function(data) {
                articles.push(data);
                //If we reach the end of the feed
                if(articles.length == source.info.new_articles) {
                    rss_param.feed_read++;
                    if(rss_param.feed_read == rss_param.sources.length)
                        updateRSSdone(source.parameter_name, articles);
                }
            });
        }
    }
}

//Broken -> never call
function updateRSSdone(name, articles) {
    //Save param
    fs.writeFile("./ressources/app/RSSreader.json", JSON.stringify(rss_param, null, 2), function(err) {
        if(err)
            return console.error(err);
    });

    //Save results
    var path = "./ressources/app/output/rss/save/" + name + ".rss.json";
    if(fs.existsSync(path)) {
        fs.readFile(path, 'utf-8', function (err, content) {
            if (err) {
                console.error(err);
                return;
            }
            var data = articles.concat(JSON.parse(content));
            fs.writeFile(path, JSON.stringify(data), function(err) {
                if(err)
                    return console.error(err);
            });
        });
    }
    else {
        fs.writeFile(path, JSON.stringify(articles), function(err) {
            if(err)
                return console.error(err);
        });
    }

    fs.writeFile("./ressources/app/output/rss/" + name + ".rss.json", JSON.stringify(articles), function(err) {
        if(err)
            return console.error(err);
    });

    refreshDOM(rss_param);
}

function refreshDOM(param) {
    if(!param)
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