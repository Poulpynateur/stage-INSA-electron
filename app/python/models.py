'''
Based on : https://blog.mimacom.com/text-classification/
Have to install :
> python -m pip install --user numpy scipy matplotlib ipython jupyter pandas sympy nose
> pip install tensorflow
> pip install keras
> pip install -U nltk

And then :
>>> import nltk
>>> nltk.download('stopwords')
'''
'''
    Load train set
'''
training = open(sys.argv[2], 'r', encoding='iso-8859-1')

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
y = multilabel_binarizer.fit_transform(principes)
classes = multilabel_binarizer.classes_

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(abstracts)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

'''
    PREPROCESSING with Keras
'''
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split

from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences

multilabel_binarizer = MultiLabelBinarizer()
y = multilabel_binarizer.fit_transform(principes)
classes = multilabel_binarizer.classes_

max_words = 5000
tokenizer = Tokenizer(num_words=max_words)
tokenizer.fit_on_texts(abstracts)
X = tokenizer.texts_to_sequences(abstracts)
X = pad_sequences(X)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


'''
    Keras : Neural Network -> 8% - 13% (?)
    https://blog.mimacom.com/text-classification/
    https://github.com/keras-team/keras/issues/741
'''

from keras.models import Sequential
from keras.layers import Dense, Activation, Dropout
from keras.preprocessing import text, sequence
from keras import utils

batch_size = 100
epochs = 100

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
    sklearn : Decision Tree -> ?
'''

from sklearn.tree import DecisionTreeClassifier

classifier = DecisionTreeClassifier()

classifier.fit(X_train, y_train)
results = classifier.score(X_test, y_test)

print(results)

'''
    skmultilearn : Binary relevance with gaussianNB -> 93.9%
'''
from skmultilearn.problem_transform import BinaryRelevance
from sklearn.naive_bayes import GaussianNB

classifier = BinaryRelevance(GaussianNB())
classifier.fit(X_train, y_train)

print(classifier.score(X_test, y_test))

'''
    skmultilearn : Classifier Chain with gaussianNB -> 93.9%
'''
from skmultilearn.problem_transform import ClassifierChain
from sklearn.naive_bayes import GaussianNB

classifier = ClassifierChain(GaussianNB())
classifier.fit(X_train, y_train)

print(classifier.score(X_test, y_test))

'''
    skmultilearn : Label Powerset with gaussianNB -> 98.2%
'''
from skmultilearn.problem_transform import LabelPowerset
from sklearn.naive_bayes import GaussianNB

classifier = LabelPowerset(GaussianNB())
classifier.fit(X_train, y_train)

print(classifier.score(X_test, y_test))

'''
    skmultilearn : MLkNN -> 10.7%
'''
from skmultilearn.adapt import MLkNN

classifier = MLkNN(k=20)
classifier.fit(X_train, y_train)

print(classifier.score(X_test, y_test))

'''
    Saving
'''
import pickle
with open('ressources/conf/LabelPowerset_clf.pkl', 'wb') as fout:
  pickle.dump((vectorizer, classifier, vectorizer, multilabel_binarizer), fout)