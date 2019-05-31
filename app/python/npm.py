import itertools
import os
import re
import json
import sys

import keras
import numpy as np

# Disable warning
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

'''
    LOADING and CLEANING
'''
from nltk.corpus import stopwords
from bs4 import BeautifulSoup

REPLACE_BY_SPACE_RE = re.compile('[/(){}\[\]\|@,;]')
BAD_SYMBOLS_RE = re.compile('[^0-9a-z #+_]')
STOPWORDS = set(stopwords.words('english'))

def clean_text(text):
    text = text.lower()                                                         # lowercase text
    text = REPLACE_BY_SPACE_RE.sub(' ', text)                                   # replace REPLACE_BY_SPACE_RE symbols by space in text
    text = BAD_SYMBOLS_RE.sub('', text)                                         # delete symbols which are in BAD_SYMBOLS_RE from text
    text = ' '.join(word for word in text.split() if word not in STOPWORDS)     # delete stopwors from text
    return text

test = json.load(open('ressources/app/train/test_set.json', 'r', encoding='iso-8859-1'))
training = open('ressources/app/train/eda_training_set.txt', 'r', encoding='iso-8859-1')

abstracts = []
principes = []

for line in training:
    line.rstrip('\n')
    content = line.split('\t')

    principes.append(content[0].split(','))
    abstracts.append(content[1])
'''
    PREPROCESSING with sklearn
'''
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

multilabel_binarizer = MultiLabelBinarizer()
y_train = multilabel_binarizer.fit_transform(principes)
classes = multilabel_binarizer.classes_

vectorizer = TfidfVectorizer()
X_train = vectorizer.fit_transform(abstracts)


X_test = []
y_test = []

for article in test :
    X_test.append(clean_text(article['abstract_annotation']))
    y_test.append(article['use_the_principles'])

X_test = vectorizer.transform(X_test)
y_test = multilabel_binarizer.transform(y_test)

'''
    skmultilearn : MLkNN -> 10.7%
'''
from skmultilearn.adapt import MLkNN

classifier = MLkNN(k=20)
classifier.fit(X_train, y_train)

results = classifier.predict_proba(X_test).toarray()

for result in results :
    print(result)

'''
import pickle
with open('ressources/conf/LabelPowerset_clf.pkl', 'rb') as fin:
    vectorizer, classifier, vectorizer, multilabel_binarizer = pickle.load(fin)

for article in target :
    vect = vectorizer.transform([clean_text(article['abstract'])])
    print(multilabel_binarizer.inverse_transform(classifier.predict(vect).toarray()))
'''