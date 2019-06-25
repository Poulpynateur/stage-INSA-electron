/**
 * FilesManager.js
 * 
 * Used to interact with the app files
 */

const fs = require('fs');
const path = require('path');
const app = require('electron').remote.app;

/**
 * Production :
 * const scraper_param_path = './resources/conf/HTMLscraper.json';
 * const rss_param_path = './resources/conf/RSSreader.json';
 * 
 * const scraped_folder = '../../resources/scraped';
 * const archive_path = './resources/scraped/archive/';
 * const rss_path = './resources/scraped/rss/';
 **/

/**
 * Developpement :
 * const scraper_param_path = './app/conf/HTMLscraper.json';
 * const rss_param_path = './app/conf/RSSreader.json';
 * 
 * const scraped_folder = '/ressources/scraped';
 * const archive_path = './ressources/scraped/archive/';
 * const rss_path = './ressources/scraped/rss/';
 */

const scraper_param_path = './app/conf/HTMLscraper.json';
const rss_param_path = './app/conf/RSSreader.json';
const scraped_folder = '/ressources/scraped';
const archive_path = './ressources/scraped/archive/';
const rss_path = './ressources/scraped/rss/';

module.exports = {
    openScrapedFolder: function() {
        require('child_process').exec('start "" "'+ path.join(app.getAppPath(), scraped_folder) +'"');
    },
    param: {
        scrape: readJSONFile(scraper_param_path),
        rss: readJSONFile(rss_param_path),

        saveRSS: function(rss_param) {
            writeFile(rss_param_path, JSON.stringify(rss_param, null, 2));
        }
    },
    save_article: {
        archive: function(name, articles, callback) {
            writeFile(archive_path + name + ".articles.json", JSON.stringify(articles), callback);
        },
        rss: function(name, articles) {

            /**
             * If the file does not exist, create a new one
             * Else take the existing file and add the new content
             */

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

function readJSONFile(path) {
    return JSON.parse(fs.readFileSync(path));
}

function writeFile(path, data, callback) {
    fs.writeFile(path, data, function(err) {
        if(err)
            return console.error(err);

        if(callback)
            callback();
    });
}