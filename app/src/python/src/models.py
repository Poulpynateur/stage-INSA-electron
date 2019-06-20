'''
    PREPROCESSING with sklearn
'''
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

def preprocessingSklearn(abstracts, principes):
    multilabel_binarizer = MultiLabelBinarizer()
    y = multilabel_binarizer.fit_transform(principes)

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(abstracts)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    return X_train, X_test, y_train, y_test

'''
    PREPROCESSING with Keras
'''
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split

from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences

def preprocessingKeras(abstracts, principes):
    multilabel_binarizer = MultiLabelBinarizer()
    y = multilabel_binarizer.fit_transform(principes)
    classes = multilabel_binarizer.classes_
    
    max_words = 5000
    tokenizer = Tokenizer(num_words=max_words)
    tokenizer.fit_on_texts(abstracts)
    X = tokenizer.texts_to_sequences(abstracts)
    X = pad_sequences(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    return X_train, X_test, y_train, y_test, classes

'''
    Keras : Neural Network
    https://blog.mimacom.com/text-classification/
    https://github.com/keras-team/keras/issues/741
'''
from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from keras.preprocessing import text, sequence
from keras import utils

def neuralNetwork(abstracts, principes):

    X_train, X_test, y_train, y_test, classes = preprocessingKeras(abstracts, principes)

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
    sklearn : Decision Tree
'''

from sklearn.tree import DecisionTreeClassifier

def decisionTree(abstracts, principes):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principes)

    classifier = DecisionTreeClassifier()

    classifier.fit(X_train, y_train)
    results = classifier.score(X_test, y_test)

    print(results)

'''
    skmultilearn : Binary relevance with gaussianNB
'''
from skmultilearn.problem_transform import BinaryRelevance
from sklearn.naive_bayes import GaussianNB

def binaryRelevance(abstracts, principes):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principes)

    classifier = BinaryRelevance(GaussianNB())
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
    skmultilearn : Classifier Chain with gaussianNB
'''
from skmultilearn.problem_transform import ClassifierChain
from sklearn.naive_bayes import GaussianNB

def classifierChain(abstracts, principes):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principes)

    classifier = ClassifierChain(GaussianNB())
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
    skmultilearn : Label Powerset with gaussianNB
'''
from skmultilearn.problem_transform import LabelPowerset
from sklearn.naive_bayes import GaussianNB

def labelPowerset(abstracts, principes):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principes)

    classifier = LabelPowerset(GaussianNB())
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
    skmultilearn : MLkNN
'''
from skmultilearn.adapt import MLkNN

def MLkNNmodel(abstracts, principes):

    X_train, X_test, y_train, y_test = preprocessingSklearn(abstracts, principes)

    classifier = MLkNN(k=20)
    classifier.fit(X_train, y_train)

    print(classifier.score(X_test, y_test))

'''
    Saving

import pickle
with open('ressources/conf/LabelPowerset_clf.pkl', 'wb') as fout:
  pickle.dump((vectorizer, classifier, vectorizer, multilabel_binarizer), fout)
'''
'''
    Import

with open('ressources/conf/LabelPowerset_clf.pkl', 'rb') as fin:
    vectorizer, classifier, vectorizer, multilabel_binarizer = pickle.load(fin)

for article in target :
    vect = vectorizer.transform([clean_text(article['title'])])
    print(multilabel_binarizer.inverse_transform(classifier.predict(vect).toarray()))
'''