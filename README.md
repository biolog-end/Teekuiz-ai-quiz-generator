# Teekuiz: AI Quiz Generator

**Teekuiz** is a web application for automatically generating personalized personality quizzes in the style of [uquiz](https://uquiz.com/) using the Google Gemini neural network. Just enter any topic, and the AI will create a unique quiz for you with questions, results, and even ASCII art.

## 🚀 Key Features

*   **Generation on any topic**: Create quizzes about anything - from "What kind of bread are you?" to "Which character are you from your favorite anime?".
*   **Dynamic interface**: A minimalistic terminal-style retro interface that is fully rendered on the fly based on data received from the AI.
*   **Multilingualism (i18n)**: Support for Russian and English languages for both the interface and the prompts sent to the neural network.
*   **Import and Export**: Save your favorite quizzes in `.json` format and share them with friends or upload them back into the app.
*   **Rarity analysis**: After taking a quiz, you will see rarity statistics for your result, calculated using Monte Carlo simulation.
*   **Adaptive theme**: Background color can change depending on the question, creating the right atmosphere.
*   **Sound effects**: Small sound effects for a more pleasant interaction.

## 🛠️ Tech Stack

*   **Backend**: Python, Flask
*   **Neural Network**: Google Gemini API
*   **Frontend**: HTML, CSS, Vanilla JavaScript (no frameworks)

## ⚙️ Installation and Launch

Follow these steps to run the project locally.

### 1. Prerequisites

*   Installed Python 3.8+
*   `pip` package manager

### 2. Cloning the repository

```bash
git clone https://github.com/biolog-end/Teekuiz-ai-quiz-generator
cd teekuiz
```

### 3. Setting up a virtual environment

It is recommended to use a virtual environment to isolate dependencies.

```bash
# Creating the environment
python -m venv venv

# Activation (Windows)
.\venv\Scripts\activate

# Activation (macOS/Linux)
source venv/bin/activate
```

### 4. Installing dependencies

Install all necessary Python libraries.

```bash
pip install -r requirements.txt
```

### 5. API key configuration

To work with the neural network, you will need a Google API key.

1.  Get your API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Create a `.env` file in the root folder of the project.
3.  Add your key to it in the following format:

    ```env
    # File: .env
    GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```

### 6. Running the server

Now you are ready to start the local Flask server.

```bash
python main.py
```

The server will start, and you will see a message similar to this:

```
* Running on http://127.0.0.1:5003
```

### 7. Open the application

Open your browser and navigate to [http://127.0.0.1:5003](http://127.0.0.1:5003).

## 📁 Project Structure

```
.
├── .gitignore
├── main.py             # Main Flask server file (API endpoints)
├── gemini_client.py    # Logic for interacting with Google Gemini API
├── prompts.py          # Storage of multilingual master prompts for the AI
├── requirements.txt    # List of Python dependencies
├── static/             # Folder with all frontend files
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styles
│   ├── script.js       # Main frontend logic
│   ├── i18n.js         # Script for internationalization (translations)
│   └── sound.js        # Engine for sound effects
└── README.md           # This file
```
