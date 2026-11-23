import os
import json
import torch
import torch.nn.functional as F

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = FastAPI(title="Sarcasm Detection ML API")

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), "roberta_model")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

# Load model
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

model.to(device)
model.eval()

# Load calibration temperature
with open(os.path.join(MODEL_PATH, "calibration.json"), "r") as file:
    calibration_data = json.load(file)

temperature = calibration_data["temperature"]


# Request format
class PredictionRequest(BaseModel):
    parent_comment: str
    comment: str


# Prediction function
def detect_sarcasm(parent_comment, comment):

    inputs = tokenizer(
        parent_comment,
        comment,
        return_tensors="pt",
        truncation=True,
        max_length=192
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        outputs = model(**inputs)

        calibrated_logits = outputs.logits / temperature

        probabilities = F.softmax(calibrated_logits, dim=1)

    non_sarcastic_prob = probabilities[0][0].item()
    sarcastic_prob = probabilities[0][1].item()

    prediction = torch.argmax(probabilities, dim=1).item()

    result = "Sarcastic" if prediction == 1 else "Non-sarcastic"

    confidence = probabilities[0][prediction].item()

    return {
        "prediction": result,
        "confidence": round(confidence * 100, 2),
        "non_sarcastic_probability": round(non_sarcastic_prob * 100, 2),
        "sarcastic_probability": round(sarcastic_prob * 100, 2)
    }


# Prediction API endpoint
@app.post("/predict")
def predict(request: PredictionRequest):

    result = detect_sarcasm(
        request.parent_comment,
        request.comment
    )

    return result