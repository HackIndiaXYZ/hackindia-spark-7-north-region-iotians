from pathlib import Path
from typing import Dict

import joblib
import numpy as np
from flask import Flask, jsonify, request

from train_driver_model import FEATURES as DRIVER_FEATURES
from train_truck_model import FEATURES as TRUCK_FEATURES


DRIVER_MODEL_PATH = Path(__file__).resolve().parent / "driver_model.pkl"
TRUCK_MODEL_PATH = Path(__file__).resolve().parent / "truck_model.pkl"

app = Flask(__name__)


def load_model(model_path: Path) -> Dict[str, object]:
    if not model_path.exists():
        raise FileNotFoundError(
            f"Model file not found: {model_path.name}. Run the training script first."
        )
    return joblib.load(model_path)


@app.route("/predict/driver", methods=["POST"])
def predict_driver():
    payload = request.get_json(silent=True) or {}
    missing = [f for f in DRIVER_FEATURES if f not in payload]
    if missing:
        return (
            jsonify({"error": f"Missing features: {', '.join(missing)}"}),
            400,
        )

    try:
        values = np.array([[float(payload[f]) for f in DRIVER_FEATURES]])
    except (TypeError, ValueError):
        return jsonify({"error": "All features must be numeric."}), 400

    try:
        artifact = load_model(DRIVER_MODEL_PATH)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500

    scaler = artifact["feature_scaler"]
    model = artifact["model"]

    pred = model.predict(scaler.transform(values))[0]
    pred = max(0.0, min(100.0, float(pred)))
    return jsonify({"predicted_score": round(pred, 2)})


@app.route("/predict/truck", methods=["POST"])
def predict_truck():
    payload = request.get_json(silent=True) or {}
    missing = [f for f in TRUCK_FEATURES if f not in payload]
    if missing:
        return (
            jsonify({"error": f"Missing features: {', '.join(missing)}"}),
            400,
        )

    try:
        values = np.array([[float(payload[f]) for f in TRUCK_FEATURES]])
    except (TypeError, ValueError):
        return jsonify({"error": "All features must be numeric."}), 400

    try:
        artifact = load_model(TRUCK_MODEL_PATH)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500

    scaler = artifact["feature_scaler"]
    model = artifact["model"]

    pred = model.predict(scaler.transform(values))[0]
    pred = max(0.0, min(100.0, float(pred)))
    return jsonify({"predicted_score": round(pred, 2)})


# Legacy endpoint for backward compatibility
@app.route("/predict", methods=["POST"])
def predict():
    """Legacy endpoint - defaults to driver prediction"""
    return predict_driver()


@app.route("/health", methods=["GET"])
def health():
    driver_model_exists = DRIVER_MODEL_PATH.exists()
    truck_model_exists = TRUCK_MODEL_PATH.exists()
    return jsonify({
        "status": "ok",
        "models": {
            "driver": "loaded" if driver_model_exists else "not_found",
            "truck": "loaded" if truck_model_exists else "not_found"
        }
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
