//cosine similiraty
const fs = require('fs');

module.exports = {
    oldData: function () {
        var data = {};
        readFiles('./ressources/app/output/old/', function (filename, content, isLast) {
            data[filename] = JSON.parse(content);
            if(isLast)
                processData(data);
        }, function (err) {
            throw err;
        });
    }
};

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        var fileRead = 0;
        filenames.forEach(function (filename) {
            fs.readFile(dirname + filename, 'utf-8', function (err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                fileRead++;
                var isLast = (fileRead == filenames.length)? true : false;
                onFileContent(filename, content, isLast);
            });
        });
    });
}

function processData(data) {
    showStat(data);
}

var utlimate_check = {
    'academic.oup.com': {
        field: 'origin',
        contain: ['Corrigenda', 'Interview']
    }
};

function haveEmptyFields(article) {
    return (article.origin == "" || article.title == "" || article.pub_date == "" || article.authors == "") ? true : false;
}
function fieldContain(source, article) {
    if(utlimate_check[source]) {
        var target = utlimate_check[source];
        target.contain.forEach(function(word) {
            if(article[target.field].includes(word)) {
                return true;
            }
        });
    }
    return false;
}

function showStat(data) {
    for(source in data) {
        var stat = {
            source: source,
            total:  data[source].length,
            usable: 0,
            detail: {
                empty: 0,
                tooShort: 0,
                tooLong: 0,
                max: 0
            }
        }
        var average = 0;

        data[source].forEach(function(article) {
            if(article.abstract.length > 100 && !haveEmptyFields(article) && !fieldContain(source, article)) {
                stat.usable++;
            }
            else {
                if(haveEmptyFields(article))
                    stat.detail.empty++;
                if(article.abstract.length <= 100)
                    stat.detail.tooShort++;
            }

            if(article.abstract.length > 3000)
                stat.detail.tooLong++;

            average += article.abstract.length;
            stat.detail.max = Math.max(article.abstract.length, stat.detail.max);
        });
        stat.detail.average = average/stat.total;
        console.log(stat);
    }
}