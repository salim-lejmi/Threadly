import joblib
import numpy as np
from flask import Flask, jsonify, request
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

risk_model = joblib.load("model.joblib")
SCAM_COL = list(risk_model.classes_).index(1)

embedder = SentenceTransformer("all-MiniLM-L6-v2")
_cache = {}


def embed(texts):
    """Embeds texts (unit-length vectors), remembering results so repeated calls are fast."""
    if len(_cache) > 5000:
        _cache.clear()
    missing = [t for t in set(texts) if t not in _cache]
    if missing:
        vectors = embedder.encode(missing, normalize_embeddings=True)
        for text, vec in zip(missing, vectors):
            _cache[text] = vec
    return np.array([_cache[t] for t in texts])


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.post("/risk")
def risk():
    text = ((request.get_json(silent=True) or {}).get("text") or "").strip()
    if not text:
        return jsonify(error="text is required"), 400
    score = float(risk_model.predict_proba([text])[0][SCAM_COL])
    return jsonify(score=round(score, 4), label="scam" if score >= 0.5 else "legit")


@app.post("/recommend")
def recommend():
    data = request.get_json(silent=True) or {}
    liked = [t for t in data.get("liked", []) if t]
    candidates = [c for c in data.get("candidates", []) if c.get("text")]
    top = int(data.get("top", 10))
    min_score = float(data.get("min_score", 0.25))

    if not liked or not candidates:
        return jsonify(results=[])

    profile = embed(liked).mean(axis=0)
    norm = np.linalg.norm(profile)
    if norm == 0:
        return jsonify(results=[])
    profile = profile / norm

    scores = embed([c["text"] for c in candidates]) @ profile
    order = np.argsort(-scores)[:top]
    results = [
        {"id": candidates[i]["id"], "score": round(float(scores[i]), 4)}
        for i in order
        if scores[i] >= min_score
    ]
    return jsonify(results=results)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)