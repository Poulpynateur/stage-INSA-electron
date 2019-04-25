const {shell, ipcRenderer} = require('electron');

var rss = require('./RSSreader.js');

$('#RSS_feed_origin').change(function() {
	var url = $(this).find(":selected").val();
	if(url)
		rss.objectFromUrl(url);
});

$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

$(document).on('click', 'button[data-target]',  function(event) {
	ipcRenderer.send('create-popup-htmlextractor', $(this).data('target'));
});