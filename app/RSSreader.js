const utils = require("daveutils");
const feedRead = require("davefeedread");

const timeOutSecs = 30;

module.exports = {
	objectFromUrl: function (url) {
		/**
		* Using [https://github.com/scripting/feedRead/blob/master/examples/readurl/read.js](davefeedread)
		* Based on [https://github.com/danmactough/node-feedparser](node-feedparser)
		*
		* We obtain a Javascript object from RSS feed
		*/
		feedRead.parseUrl(url, timeOutSecs, function (err, feed) {
			if (err)
				console.log(err.message);
			else
				showRSS(feed);
		});
	}
};

/**
 * Get only text tags from a HTML string
 * There is a lot of text tags ... so that quite long
 *  */
function cleanHTML(target) {
	var tmp_div = document.createElement('div');
	tmp_div.innerHTML = target;
	$(tmp_div).find('*:not(h1,h2,h3,span,h4,h5,h6,p,div,b,i,u,strike,s,pre,code,tt,blockquote,font,center,b,strong,i,em,mark,small,del,ins,sub,sup)').remove();
	return tmp_div.innerHTML;
}

/**
 * Show the RSS articles
 */
function showRSS(object) {
	$('#RSS_content').html('');

	object.items.forEach(element => {
		var title = $(document.createElement('h3'));
			title.append($(document.createElement('button')).addClass('btn btn-primary mr-3').attr('data-target', element.link).text('Load from site'));
			title.append($(document.createElement('a')).attr({href: element.link}).text(element.title));

		var part_title_abstract = $(document.createElement('h5')).text('Description');

		// /!\ .html -> modify to prevent javascript injection
		var abstract = $(document.createElement('p')).addClass('text-justify').html(cleanHTML(element.description));

		var hr = $(document.createElement('hr')).addClass('my-4');
		$('#RSS_content').append([title, part_title_abstract, abstract, hr]);
	});
}