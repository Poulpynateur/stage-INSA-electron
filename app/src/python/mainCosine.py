# Main file to calculate cosine-similarity

import src.nlp as nlp
from sklearn.metrics.pairwise import cosine_similarity

test, training = nlp.load_json(
    'ressources/train/training_set.json', 'iso-8859-1',
    'ressources/scraped/archive/jeb.biologists.org.2019.articles.json', 'utf-8'
)

train_data, test_data = nlp.clean(test, training, 'title_annotation', 'title')

#Passing only the selected fields to vectorizerTFIDF()
train_tfidf, test_tfidf = nlp.vectorizerTFIDF(train_data[:,0], test_data )

cosine_results = cosine_similarity(test_tfidf, train_tfidf)

index = 40;
nlp.show(cosine_results[index] , train_data[:,1])