import os
import re
import json
import numpy as np

from nltk.corpus import stopwords

REPLACE_BY_SPACE_RE = re.compile('[/(){}\[\]\|@,;]')
BAD_SYMBOLS_RE = re.compile('[^a-z ]')
BAD_CHAR_RE = re.compile('\s[a-z]\s')
STOPWORDS = set(stopwords.words('english'))

def clean_text(text):
    text = text.lower()                                                         # lowercase text
    text = REPLACE_BY_SPACE_RE.sub(' ', text)                                   # replace REPLACE_BY_SPACE_RE symbols by space in text
    text = BAD_SYMBOLS_RE.sub('', text)                                         # delete symbols which are in BAD_SYMBOLS_RE from text
    text = BAD_CHAR_RE.sub(' ', text)                                           # delete characteres that are left alone (as 'c' from '40°C')
    text = ' '.join(word for word in text.split() if word not in STOPWORDS)     # delete stopwors from text
    return text

'''
    Load files from path, you must give the good encoding of the file to avoid unknow characters
'''
def load_json(train_path, train_encod, test_path, test_encod):
    training = json.load(open(train_path, 'r', encoding=train_encod))
    test = json.load(open(test_path, 'r', encoding=test_encod))

    return test, training

'''
    Reformat and clean the data coming from the load function
'''
def clean(test, training, training_field, test_field):
    train_data = []
    test_data = []

    # Extracting the field that we want to evaluate with the associated principles
    for article in training:
        if training_field in article:
            train_data.append([clean_text(article[training_field]), article['use_the_principles']])

    # Same here
    for article in test:
        test_data.append(clean_text(article[test_field]))

    # Return numpy arrays
    return np.array(train_data), np.array(test_data)

'''
    Transform data to TF-IDF vectors
'''
from sklearn.feature_extraction.text import TfidfVectorizer

def vectorizerTFIDF(train_data, test_data):

    vectorizer = TfidfVectorizer()
    # Add the words of train set to the vector dictionnary
    # return a TF-IDF vector of the train set
    train_tfidf = vectorizer.fit_transform(train_data)

    # return a TF-IDF vector of the test set
    test_tfidf = vectorizer.transform(test_data)
    
    return train_tfidf, test_tfidf

'''
    Compute ECDF for a one-dimensional array of measurements.
    From [https://community.periscopedata.com/t/18bzry/test-for-normal-distribution-of-data-with-python]
'''
def ecdf(data):
    n = len(data)
    y = np.arange(1, n+1) / n

    return data, y

'''
    Display the graph with a normal and a exponential representation
'''
import matplotlib.pyplot as plt
import seaborn as sns
import src.graph as graph

def show(cosine, principles_names):
    # Better visual
    sns.set()

    sorted_cosine = np.c_[cosine, principles_names]     # Join cosine result with their principles
    sorted_cosine = np.sort(sorted_cosine, axis=0)      # Then sort then in function of the cosine value

    x, y = ecdf(sorted_cosine[:,0])

    # Draw points with associated principles
    graph.draw(x, y, sorted_cosine[:,1])

    samples_exp = np.random.exponential(np.mean(cosine), size=10000)                # Calculate the point of the exponential curve
    samples_norm = np.random.normal(np.mean(cosine), np.std(cosine), size=10000)    # Calculate the point of the normal curve

    # Draw then allong the cosine points
    x, y = ecdf(np.sort(samples_exp))
    plt.plot(x, y)
    x, y = ecdf(np.sort(samples_norm))
    plt.plot(x, y)

    plt.show()