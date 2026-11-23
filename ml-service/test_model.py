import os
import json
import torch

from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 1. Select device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 2. Define model folder path
MODEL_PATH = os.path.join(os.path.dirname(__file__), "roberta_model")

# 3. Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

# 4. Load trained model
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH,
    local_files_only=True
)

model.to(device)
model.eval()

# 5. Load calibration temperature
with open(os.path.join(MODEL_PATH, "calibration.json"), "r") as file:
    calibration_data = json.load(file)

temperature = calibration_data["temperature"]

print("Model loaded successfully!")
print("Device:", device)
print("Temperature:", temperature)

import torch.nn.functional as F


def detect_sarcasm(parent_comment, comment):

    # Tokenize both comments together
    inputs = tokenizer(
        parent_comment,
        comment,
        return_tensors="pt",
        truncation=True,
        max_length=192
    )

    # Move inputs to CPU/GPU
    inputs = {key: value.to(device) for key, value in inputs.items()}

    # Prediction without calculating gradients
    with torch.inference_mode():
        outputs = model(**inputs)

        # Apply temperature scaling
        calibrated_logits = outputs.logits / temperature

        # Convert logits into probabilities
        probabilities = F.softmax(calibrated_logits, dim=1)

    # Extract probabilities
    non_sarcastic_prob = probabilities[0][0].item()
    sarcastic_prob = probabilities[0][1].item()

    # Find predicted class
    prediction = torch.argmax(probabilities, dim=1).item()

    # Convert label into readable text
    result = "Sarcastic" if prediction == 1 else "Non-sarcastic"

    # Confidence of predicted class
    confidence = probabilities[0][prediction].item()

    return {
        "prediction": result,
        "confidence": round(confidence * 100, 2),
        "non_sarcastic_probability": round(non_sarcastic_prob * 100, 2),
        "sarcastic_probability": round(sarcastic_prob * 100, 2)
    }


# Test the model
parent = "I waited three hours for my food."
comment = "Wow, such incredibly fast service!"

result = detect_sarcasm(parent, comment)

print("\nPrediction Result")
print("--------------------")
print("Prediction:", result["prediction"])
print("Confidence:", result["confidence"], "%")
print("Non-sarcastic probability:", result["non_sarcastic_probability"], "%")
print("Sarcastic probability:", result["sarcastic_probability"], "%")