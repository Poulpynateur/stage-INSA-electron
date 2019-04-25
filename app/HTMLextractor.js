const { ipcRenderer } = require('electron');
var url;

function cleanHTML(target) {
	//Delete unwanted elements
	target.find('*:not(h1,h2,h3,span,h4,h5,h6,p,div,b,i,u,strike,s,pre,code,tt,blockquote,font,center,b,strong,i,em,mark,small,del,ins,sub,sup)').remove();
	return target;
}

function parseHTML(iframe) {
	//Select only text fields
	var iframe_text_balises = $(iframe).contents().find('h1, h2, h3, h4, h5, h6, p');
	var div = document.createElement('div');
	$(div).append(iframe_text_balises.removeClass());
	$('main').append(cleanHTML($(div)));

	$('#loading').remove();
	$(iframe).remove();
}

ipcRenderer.on('target-url', function (event, _url) {
	url = _url;

	var iframe = document.createElement('iframe');

	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'html',
		success: function (content) {
			$(iframe).addClass('w-100 h-100 border border-primary rounded d-none');
			$('main').append(iframe);
			iframe.contentWindow.document.body.innerHTML = content;
			parseHTML(iframe);
		},
		error: function (xhr, status, error) {
			console.warn("Error ajax request fail : trying to use iframe instead ...");
			iframe.src = url;
			iframe.onload = function () {
				parseHTML(this);
			};
			$(iframe).addClass('w-100 h-100 border border-primary rounded d-none');
			$('main').append(iframe);
		}
	});
});