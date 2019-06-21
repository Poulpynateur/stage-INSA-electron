# Main file to use models from src.models

import src.nlp as nlp
import src.models as models

test, training = nlp.load_json(
    'ressources/train/training_set.json', 'iso-8859-1',
    'ressources/scraped/archive/jeb.biologists.org.2019.articles.json', 'utf-8'
)

train_data, test_data = nlp.clean(test, training, 'abstract_annotation', 'abstract')

abstracts = train_data[:,0]
principles = train_data[:,1]

# Here you can change the model
models.neuralNetwork(abstracts, principles)