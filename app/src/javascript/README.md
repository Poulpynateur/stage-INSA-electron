# JavaScript

Load articles from sources describe in conf.

- **index.js** : Manage events from the interface.
- **FilesManager.js** : Used to interact with the app files.
- **HTMLscraper.js** : Load and extract data from page web. Use the conf files to extract data.
- **ViewManager.js** : Used to update/refresh the interface (HTML file). It's only for the visual, you don't have to worry about this.
- **RSSreader.js** : Load the RSS feed and check for new articles. Use *HTMLscraper.js* to scrape the new articles.