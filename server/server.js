const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const predictionRoutes = require("./routes/prediction.routes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/api", predictionRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Sarcasm Detection Backend is running!"
    });
});

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});