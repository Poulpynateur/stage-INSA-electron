import itertools
import os
import re
import json
import sys

import numpy as np

# Disable warning
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

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

test = json.load(open('ressources/app/output/old/jeb.biologists.org.2019.articles.json', 'r', encoding='utf-8'))
training = json.load(open('ressources/app/train/training_set.json', 'r', encoding='iso-8859-1'))

train_data = []
train_principes = []

test_data = []

for article in training:
    if 'abstract_annotation' in article:
        train_data.append(clean_text(article['abstract_annotation']))
        train_principes.append(article['use_the_principles'])

for article in test:
    test_data.append(clean_text(article['abstract']))

'''
    PREPROCESSING with sklearn
'''
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer()
train_tfidf = vectorizer.fit_transform(train_data)

test_tfidf = vectorizer.transform(test_data)

'''
    Cosine similarity
'''
from sklearn.metrics.pairwise import cosine_similarity

cosine_results = cosine_similarity(test_tfidf, train_tfidf)

import matplotlib.pyplot as plt
import seaborn as sns

def ecdf(data):
    """Compute ECDF for a one-dimensional array of measurements."""
    # Number of data points: n
    n = len(data)
    # x-data for the ECDF: x
    x = np.sort(data)
    # y-data for the ECDF: y
    y = np.arange(1, n+1) / n

    return x, y

sns.set()

for cosine in cosine_results[34:36]:
    x, y = ecdf(cosine)
    plt.plot(x, y, marker=".", linestyle="none")

    samples_exp = np.random.exponential(np.mean(cosine), size=10000)
    samples_norm = np.random.normal(np.mean(cosine), np.std(cosine), size=10000)

    x, y = ecdf(samples_exp)
    plt.plot(x, y)
    x, y = ecdf(samples_norm)
    plt.plot(x, y)

plt.show()