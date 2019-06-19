/**
 * ViewManager.js
 * 
 * Used to interact with the app files
 */

const fs = require('fs');

const rss_param_path = './app/conf/RSSreader.json';

const archive_path = './ressources/scraped/archive/';
const rss_path = './ressources/scraped/rss/';

module.exports = {
    param: {
        scrape: require('../../conf/HTMLscraper.json'),
        rss: require('../../conf/RSSreader.json'),

        saveRSS: function(rss_param) {
            writeFile(rss_param_path, JSON.stringify(rss_param, null, 2));
        }
    },
    save_article: {
        archive: function(name, articles, callback) {
            writeFile(archive_path + name + ".articles.json", JSON.stringify(articles), callback);
        },
        rss: function(name, articles) {
            var path = rss_path + name + ".rss.json";
            if(fs.existsSync(path)) {
                fs.readFile(path, 'utf-8', function (err, content) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    var data = articles.concat(JSON.parse(content));
                    writeFile(path, JSON.stringify(data));
                });
            }
            else {
                writeFile(path, JSON.stringify(articles));
            }
        }
    }
};

function writeFile(path, data, callback) {
    fs.writeFile(path, data, function(err) {
        if(err)
            return console.error(err);

        if(callback)
            callback();
    });
}