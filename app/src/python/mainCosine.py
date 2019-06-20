# Main file to calculate cosine-similarity

import src.npm as npm
from sklearn.metrics.pairwise import cosine_similarity

test, training = npm.load_json(
    'ressources/train/training_set.json', 'iso-8859-1',
    'ressources/scraped/archive/jeb.biologists.org.2019.articles.json', 'utf-8'
)

train_data, test_data = npm.clean(test, training, 'title_annotation', 'title')
train_tfidf, test_tfidf = npm.vectorizerTFIDF(train_data[:,0], test_data )

cosine_results = cosine_similarity(test_tfidf, train_tfidf)

index = 40;
npm.show(cosine_results[index] , train_data[:,1])