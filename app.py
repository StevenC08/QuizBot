from flask import Flask, request, render_template, jsonify
from PIL import Image
import pytesseract
import os
import openai
from openai import OpenAI

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

client = OpenAI(api_key = "Your-OpenAI-API-Key")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/extract-text", methods=["POST"])
def extract_text():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = Image.open(request.files["image"])
    raw_text = pytesseract.image_to_string(image)

    # Send to OpenAI for cleanup
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Clean up and format the following OCR output to be more readable and correct any obvious spelling or grammar errors. Please do not format the text into bullet points."},
                {"role": "user", "content": raw_text}
            ]
        )
        cleaned_text = response.choices[0].message.content.strip()
    except Exception as e:
        print("OpenAI Error:", e)
        cleaned_text = raw_text  # fallback to raw text

    return jsonify({
        "raw_text": raw_text,
        "cleaned_text": cleaned_text
    })

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    raw_text = data.get('text', '')
    grade_level = data.get("grade_level", "8")

    if not raw_text:
        return jsonify({"error": "No text provided"}), 400

    prompt = f"""Generate 5 multiple-choice trivia questions based on the following text, written for a {grade_level} grade reading level. 
Each question should have 4 answer options and indicate the correct answer clearly in the format:
Q: ...
A. ...
B. ...
C. ...
D. ...
Answer: ...
    
Text: {raw_text}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You're a quiz generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        quiz_text = response.choices[0].message.content
        return jsonify({'quiz': quiz_text})
    except Exception as e:
        error_msg = str(e)
        if "insufficient_quota" in error_msg or "quota" in error_msg:
            return jsonify({'error': 'You have exceeded your OpenAI quota. Please check your usage or billing details at https://platform.openai.com/account/usage'}), 429
        return jsonify({'error': str(e)}), 500

@app.route("/explain-term", methods=["POST"])
def explain_term():
    data = request.get_json()
    term = data.get("term", "").strip()

    if not term:
        return jsonify({"error": "No term provided"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that explains words or phrases in simple terms."
                },
                {
                    "role": "user",
                    "content": f"What does this mean: '{term}'?"
                }
            ]
        )
        explanation = response.choices[0].message.content.strip()
        return jsonify({"explanation": explanation})
    except Exception as e:
        print("Error explaining term:", e)
        return jsonify({"error": "Failed to explain term"}), 500

@app.route("/ask-text", methods=["POST"])
def ask_text():
    data = request.get_json()
    question = data.get("question", "")
    context = data.get("context", "")

    if not question or not context:
        return jsonify({"error": "Missing question or context"}), 400

    prompt = f"""You are a helpful assistant. Based on the following article or passage, answer the user's question in a clear and simple way.

Passage:
{context}

Question: {question}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({"answer": answer})
    except Exception as e:
        print("Error answering text question:", e)
        return jsonify({"error": "Failed to get an answer."}), 500


if __name__ == '__main__':
    app.run(debug=True)
