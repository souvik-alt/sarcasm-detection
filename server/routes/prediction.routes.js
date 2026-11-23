const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/predict", async (req, res) => {
    try {
        const { parent_comment, comment } = req.body;

        const response = await axios.post(
            "http://127.0.0.1:8000/predict",
            {
                parent_comment,
                comment
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error("Prediction error:", error.message);

        res.status(500).json({
            message: "Failed to get prediction from ML service"
        });
    }
});

module.exports = router;