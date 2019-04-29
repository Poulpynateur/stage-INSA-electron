var cheerio = require('cheerio');

module.exports = {
    fromOption: function (option_object) {
        var name = option_object.attr('name');
        if (scrape_target.hasOwnProperty(name)) {
            //If we have the target in our scrapping list
            initiScrape( scrape_target[name]);
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

function requestToUrl(url, callback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (event) {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                callback(this.responseText);
            }
            else {
                console.error("Oupsy, error occured: %d (%s)", this.status, this.statusText);
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
        var total = content(target.query.total_articles).text().match(/f.*r/g);
        target.info.total_articles = parseInt(total[0].slice(2,-2));

        //Refresh the DOM
        $('#scrapping_status_total').html('<h5><b>' + target.info.total_articles + '</b> articles founds </h5>');

        scrape(target);
    });
}

function scrape() {
    //Refresh the DOM
    $('#scrapping_in_process').removeClass('d-none');
   
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (event) {
        if (this.readyState === XMLHttpRequest.DONE) {
            if (this.status === 200) {
                getArticlesOfPage(this.responseText);

                console.log(target.articles.length);

                //Refresh the DOM
                $('#progress_nbr_article').text(target.articles.length + ' / ' + target.info.total_articles + ' articles load');
                var progress_percent = target.articles.length*100/target.info.total_articles;
                $('#progress_bar_article').attr('aria-valuenow', progress_percent).css('width', progress_percent + '%');
            }
            else
                console.error("Response status: %d (%s)", this.status, this.statusText);
        }
    };

    do {
        var url = target.info.domain_url;
        url += (target.info.articles_url)
            .replace(/\*article_per_page\*/g,target.info.article_per_page)
            .replace(/\*page_number\*/g,target.info.page_number);
        
        req.open('GET', url, true);
        req.send(null);
    }
    while(false);
    //while(target.info.article_per_page * target.info.page_number < target.info.total_articles);
}

/**
 * Load articles from html content
 */
function getArticlesOfPage(html) {
    var content = cheerio.load(html);

    //Get info for each article
    content(target.query.article).each(function(element) {
        var title = content(this).find(target.query.title).text();

        //Title is often the same as the article link
        if(target.query.link)
            var link = content(this).find(target.query.link).attr('href');
        else
            var link = content(this).find(target.query.title).attr('href');

        var abstract = content(this).find('div.article-text.view-text-small p').text();

        target.articles.push({
            'title': title,
            'link': link,
            'abstract': abstract
        });
    });
}

/**
 * Hold everything about the different site
 * Including :
 * - query : to scrape specific data from the site
 * - info : to navigate on the site
 * - articles[] that old every article that have been process
 */
var target = {};
var scrape_target = {
    "iopscience.iop": {
        query: {
            article: 'div.art-list-item.reveal-container',
            title: 'h2 a',
            abstract: 'div.abstract p',
            next_page: 'a.index-item.index-item-clear[href^="/collection"]',
            total_articles: '#wd-iop-col-2nd-controls span'
        },
        info: {
            domain_url: 'https://iopscience.iop.org',
            articles_url: '/collection/*article_per_page*/*page_number*?collectionType=PHYSICS_REVIEWS',
            article_per_page: 50,
            page_number: 1
        },
        articles: []
    },
    "jeb.biologists": {
        query: {
            title: 'h1',
            abstract: 'div.abstract p',
            next_page: 'a'
        },
        articles_url: 'http://jeb.biologists.org/search/'
    },
    "academic.oup": {
        query: {
            title: 'h1',
            abstract: 'div.abstract p',
            next_page: 'a'
        },
        articles_url: 'https://academic.oup.com/jxb/search-results?page=1&f_ContentType=Journal+Article&f_ArticleTypeDisplayName=Research+Article&fl_SiteID=5304'
    }
};