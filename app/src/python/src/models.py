'''
Parameters are the same for every functions :

abstract : numpy array
    Array of clean abstracts
principles : numpy array
    Array of associated principles
'''

'''
PREPROCESSING with sklearn

Transform abstracts into TF-IDF vector [https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html]
Transform principles into binary matrice [https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MultiLabelBinarizer.html]
'''
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

def preprocessingSklearn(abstracts, principles):
    
    # Principles to binary matrice
    multilabel_binarizer = MultiLabelBinarizer()
    y = multilabel_binarizer.fit_transform(principles)

    # Abstracts to TF-IDF vectors
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(abstracts)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    return X_train, X_test, y_train, y_test

'''
    PREPROCESSING with Keras

    Transform abstracts into a token matrice [https://keras.io/preprocessing/text/]
    Transform principles into binary matrice [https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MultiLabelBinarizer.html]
'''
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split

from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences

def preprocessingKeras(abstracts, principles):

    # Principles to binary matrice
    multilabel_binarizer = MultiLabelBinarizer()
    y = multilabel_binarizer.fit_transform(principles)
    classes = multilabel_binarizer.classes_
    
    # Abstracts to Tokens
    max_words = 5000
    tokenizer = Tokenizer(num_words=max_words)
    tokenizer.fit_on_texts(abstracts)

    X = tokenizer.texts_to_sequences(abstracts)
    X = pad_sequences(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    return X_train, X_test, y_train, y_test, classes

'''
Keras : Neural Network

Inspiration :
    https://blog.mimacom.com/text-classification/
    https://github.com/keras-team/keras/issues/741

Based on the Sequential model of keras [https://keras.io/models/sequential/]
'''
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from keras.preprocessing import text, sequence
from keras import utils

def neuralNetwork(abstracts, principles):

    X_train, X_test, y_train, y_test, classes = preprocessingKeras(abstracts, principles)

    batch_size=1
    epochs=50

    model = Sequential()
    model.add(Dense(512))
    model.add(Activation('relu'))
    model.add(Dense(len(classes)))
    model.add(Activation('sigmoid'))
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    model.fit(X_train, y_train, batch_size=batch_size, epochs=epochs, verbose=0)

    results = model.evaluate(X_test, y_test, batch_size=batch_size, verbose=0)
    print(results)

'''
sklearn : Decision Tree [https://scikit-learn.org/stable/modules/tree.html]
'''

from sklearn.tree import DecisionTreeClassifier

def decisionTree(abstracts, principles):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principles)

    classifier = DecisionTreeClassifier()

    classifier.fit(X_train, y_train)
    results = classifier.score(X_test, y_test)

    print(results)

'''
skmultilearn : Binary relevance with gaussianNB [http://scikit.ml/api/skmultilearn.problem_transform.br.html]
'''
from skmultilearn.problem_transform import BinaryRelevance
from sklearn.naive_bayes import GaussianNB

def binaryRelevance(abstracts, principles):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principles)

    classifier = BinaryRelevance(GaussianNB())
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
skmultilearn : Classifier Chain with gaussianNB [http://scikit.ml/api/skmultilearn.problem_transform.cc.html]
'''
from skmultilearn.problem_transform import ClassifierChain
from sklearn.naive_bayes import GaussianNB

def classifierChain(abstracts, principles):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principles)

    classifier = ClassifierChain(GaussianNB())
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
skmultilearn : Label Powerset with gaussianNB [http://scikit.ml/api/skmultilearn.problem_transform.lp.html]
'''
from skmultilearn.problem_transform import LabelPowerset
from sklearn.naive_bayes import GaussianNB

def labelPowerset(abstracts, principles):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principles)

    classifier = LabelPowerset(GaussianNB())
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
skmultilearn : MLkNN [http://scikit.ml/api/skmultilearn.adapt.mlknn.html]
'''
from skmultilearn.adapt import MLkNN

def MLkNNmodel(abstracts, principles):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principles)

    classifier = MLkNN(k=20)
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
# SAVING
# Save a model in a file

import pickle
with open('ressources/conf/LabelPowerset_clf.pkl', 'wb') as fout:
  pickle.dump((vectorizer, classifier, vectorizer, multilabel_binarizer), fout)
'''
'''
# IMPORT
# Import a saved model and use it for classification

with open('ressources/conf/LabelPowerset_clf.pkl', 'rb') as fin:
    vectorizer, classifier, vectorizer, multilabel_binarizer = pickle.load(fin)

for article in target :
    vect = vectorizer.transform([clean_text(article['title'])])
    print(multilabel_binarizer.inverse_transform(classifier.predict(vect).toarray()))
'''