# 🧠 QuizBot

A simple web app that lets you:

1. Upload an image with text (like a page or sign)
2. Extract the text using OCR (Optical Character Recognition)
3. Generate quiz questions based on the extracted text using the OpenAI API
4. Read both the text and quiz out loud using text-to-speech
5. Use collapsible sections for better organization

---


---

## How to Set It Up

### 1. Prerequisites

Make sure you have the following installed:

- **Python 3.7+**
- **pip** (Python package installer)
- **Tesseract-OCR** (System dependency)

---

### 2. Install Tesseract-OCR (Windows)

Download the installer from:  
https://github.com/tesseract-ocr/tesseract/wiki

Make sure to **add it to your system PATH** during installation.

---

### 3. Install Python Dependencies

In your terminal or VS Code terminal, run:

```bash
pip install -r requirements.txt
```

If requirements.txt is missing, install manually:

```bash
pip install flask pytesseract openai Pillow
```

---

### 4. Set Your OpenAI API Key

You can get a key at: https://platform.openai.com/account/api-keys

Paste it in for the "Your-OpenAI-API-Key" in the row with client in it, be careful with permissions since unwanted people could find your OpenAI API Key

---

### 5. Run the App

```bash
python app.py
```

Then open your browser and go to: http://127.0.0.1:5000/
