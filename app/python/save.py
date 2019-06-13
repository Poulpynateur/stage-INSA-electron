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
    if 'title_annotation' in article:
        train_data.append(clean_text(article['title_annotation']))
        train_principes.append(article['use_the_principles'])

for article in test:
    test_data.append(clean_text(article['title']))

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

outArray = []
for i in range(0, 40):
    data = test_data[i]
    cosine = cosine_results[i]

    principes_weigth = np.c_[cosine, train_principes]
    principes_weigth_sorted = np.sort(principes_weigth, axis=0)[::-1]

    outObject = {}
    for j in range(0, principes_weigth_sorted.shape[0]):
        outObject[principes_weigth_sorted[j][0]] = principes_weigth_sorted[j][1]
    
    outArray.append({'data': data, 'cosine_similarity': outObject})

with open('data.json', 'w') as outfile:  
    json.dump(outArray, outfile, indent=4, ensure_ascii=False)