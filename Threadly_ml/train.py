"""Trains the scam classifier, prints evaluation metrics and saves model.joblib."""
import csv

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline

texts, labels = [], []
with open("data/listings.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        texts.append(row["text"])
        labels.append(int(row["label"]))

X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.2, stratify=labels, random_state=42
)


def build():
    return Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ])


model = build()
model.fit(X_train, y_train)
pred = model.predict(X_test)

print("\n=== Hold-out test set (20%) ===")
print(classification_report(y_test, pred, target_names=["legit", "scam"], digits=3))
print("Confusion matrix (rows = actual, cols = predicted):")
print(confusion_matrix(y_test, pred))
print(f"\nScam-class F1: {f1_score(y_test, pred):.3f}")

cv = cross_val_score(build(), texts, labels, cv=5, scoring="f1")
print(f"5-fold cross-validated F1: {cv.mean():.3f} (+/- {cv.std():.3f})")

# final model uses all the data
final = build().fit(texts, labels)
joblib.dump(final, "model.joblib")
print("\nSaved model.joblib")