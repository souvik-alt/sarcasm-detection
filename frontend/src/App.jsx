import { useState } from "react";
import "./App.css";

function App() {
  const [parentComment, setParentComment] = useState("");
  const [comment, setComment] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDetect() {
    setError("");
    setResult(null);

    if (!parentComment.trim() || !comment.trim()) {
      setError("Please enter both the conversation context and the comment.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_comment: parentComment,
          comment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction from server.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">S</span>
          <span>Sarcasm Detector</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#detector">Detector</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="badge">AI-powered language analysis</span>

          <h1>
            Analyze the context.
            <br />
            <span>Detect the sarcasm.</span>
          </h1>

          <p>
            Understand how context and language reveal sarcastic intent
            using AI-powered text analysis.
          </p>

          <a href="#detector" className="hero-button">
            Try Sarcasm Detection →
          </a>
        </div>
      </section>

      {/* Detector Section */}
      <section className="detector-section" id="detector">
        <div className="section-heading">
          <span className="badge">Text Analysis</span>
          <h2>Detect Sarcasm</h2>
          <p>
            Provide the conversation context and the comment you want to analyze.
          </p>
        </div>

        <div className="detector-card">
          {/* Parent Comment */}
          <div className="input-group">
            <label htmlFor="parentComment">
              Conversation Context
            </label>

            <p className="input-description">
              What was said before the comment?
            </p>

            <textarea
              id="parentComment"
              placeholder="Example: I waited three hours for my food..."
              value={parentComment}
              onChange={(e) => setParentComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Target Comment */}
          <div className="input-group">
            <label htmlFor="comment">
              Comment to Analyze
            </label>

            <p className="input-description">
              Enter the comment you want to check for sarcasm.
            </p>

            <textarea
              id="comment"
              placeholder="Example: Wow, such incredibly fast service!"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {/* Detect Button */}
          <button
            className="detect-button"
            type="button"
            onClick={handleDetect}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Detect Sarcasm"}
          </button>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Prediction Result */}
          {result && (
            <div className="result-card">
              <h3>Prediction Result</h3>

              <h2>{result.prediction}</h2>

              <p>
                Confidence: {result.confidence}%
              </p>

              <p>
                Non-sarcastic: {result.non_sarcastic_probability}%
              </p>

              <p>
                Sarcastic: {result.sarcastic_probability}%
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <h2>How does it work?</h2>
        <p>
          Our model analyzes the relationship between the conversation
          context and the target comment using a fine-tuned transformer
          model to identify sarcastic language.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Sarcasm Detector · AI & Machine Learning Project</p>
      </footer>
    </div>
  );
}

export default App;