/**
 * ViewManager.js
 * 
 * Used to update/refresh the interface (HTML file).
 * It's only for the visual, you don't have to worry about this.
 */

module.exports = {
    scraping: {
        refresh: function(domain_url) {
            //Reset to loading state
            $('#scrapping_done').addClass('d-none');
            $('#scrapping_in_process').addClass('d-none');
            $('#scrapping_status_total').html('<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>');
            
            //Show the url of the actual scrapping target
            $('#site_name').text(domain_url);
            $('#main_scrapper').removeClass('d-none');
        },
        updateTotal: function(total) {
            //Update total number of article to load
            $('#scrapping_status_total').html('<h5><b>' + total + '</b> articles founds </h5>');
        },
        updateProgressBar: function(articles_length, total_articles) {
            //Number of articles load on the total
            $('#progress_nbr_article').text(articles_length + ' / ' + total_articles + ' articles load');
            //Fancy progress bar
            var progress_percent = articles_length*100/total_articles;
            $('#progress_bar_article').attr('aria-valuenow', progress_percent).css('width', progress_percent + '%');
        },
        setState: function(state) {
            //Refresh in function of the scraping state
            if(state == 'PROCESS')
                $('#scrapping_in_process').removeClass('d-none');
            else if(state == 'DONE')
                $('#scrapping_done').removeClass('d-none');
        }
    },
    rss: {
        refresh: function(param) {
            //Get info to show from config
            var sources = param.sources;
            var timestamp = param.last_update;
            
            //Reset the body of the table
            var tbody = document.querySelector('#RSS_statistics tbody');
            var total_new = 0;
            tbody.innerHTML = '';
        
            //Building a new table body
            sources.forEach((source)=>{
                //Row
                var tr = document.createElement('tr');
                
                //Contents of the rows
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
        
                //Adding the content to the row
                tr.appendChild(url);
                tr.appendChild(rss);
                tr.appendChild(total);
                tr.appendChild(nbr_new);
        
                //Adding the row to the table
                tbody.appendChild(tr);
                total_new += source.info.new_articles;
            });
        
            //Refreshing the date
            var date =  new Date(timestamp);
            $('#last_rss_update').text('Last update : ' + date.toLocaleString());
            $('#total_rss_new').text(total_new + ' new articles');
        }
    }
};