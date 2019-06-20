import itertools
import os
import re
import json
import sys

import numpy as np
'''
    LOADING and CLEANING
'''
from nltk.corpus import stopwords
from bs4 import BeautifulSoup

REPLACE_BY_SPACE_RE = re.compile('[/(){}\[\]\|@,;]')
BAD_SYMBOLS_RE = re.compile('[^a-z ]')
BAD_CHAR_RE = re.compile('\s[a-z]\s')
STOPWORDS = set(stopwords.words('english'))

def clean_text(text):
    text = text.lower()                                                         # lowercase text
    text = REPLACE_BY_SPACE_RE.sub(' ', text)                                   # replace REPLACE_BY_SPACE_RE symbols by space in text
    text = BAD_SYMBOLS_RE.sub('', text)                                         # delete symbols which are in BAD_SYMBOLS_RE from text
    text = BAD_CHAR_RE.sub(' ', text)
    text = ' '.join(word for word in text.split() if word not in STOPWORDS)     # delete stopwors from text
    return text

def load_json(train_path, train_encod, test_path, test_encod):
    training = json.load(open(train_path, 'r', encoding=train_encod))
    test = json.load(open(test_path, 'r', encoding=test_encod))

    return test, training

def clean(test, training, training_field, test_field):
    train_data = []
    test_data = []

    for article in training:
        if training_field in article:
            train_data.append([clean_text(article[training_field]), article['use_the_principles']])

    for article in test:
        test_data.append(clean_text(article[test_field]))

    return np.array(train_data), np.array(test_data)

'''
    PREPROCESSING with sklearn
'''
from sklearn.feature_extraction.text import TfidfVectorizer

def vectorizerTFIDF(train_data, test_data):
    vectorizer = TfidfVectorizer()
    train_tfidf = vectorizer.fit_transform(train_data)

    test_tfidf = vectorizer.transform(test_data)
    
    return train_tfidf, test_tfidf

import matplotlib.pyplot as plt
import seaborn as sns

def ecdf(data):
    n = len(data)
    y = np.arange(1, n+1) / n

    return data, y

import src.graph as graph
def show(cosine, principes_names):
    sns.set()

    sorted_cosine = np.c_[cosine, principes_names]
    sorted_cosine = np.sort(sorted_cosine, axis=0)

    x, y = ecdf(sorted_cosine[:,0])
    graph.draw(x, y, sorted_cosine[:,1])

    samples_exp = np.random.exponential(np.mean(cosine), size=10000)
    samples_norm = np.random.normal(np.mean(cosine), np.std(cosine), size=10000)

    x, y = ecdf(np.sort(samples_exp))
    plt.plot(x, y)
    x, y = ecdf(np.sort(samples_norm))
    plt.plot(x, y)

    plt.show()