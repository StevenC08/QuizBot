from flask import Flask, request, render_template, jsonify
from PIL import Image
import pytesseract
import os
import openai
from openai import OpenAI

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    try:
        text = pytesseract.image_to_string(Image.open(filepath))
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

client = OpenAI(api_key = "Your-OpenAI-API-Key")

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    raw_text = data.get('text', '')

    prompt = f"""Generate 5 multiple choice quiz questions based on this text:\n\n{raw_text}\n\nFormat each as:
Question: ...
A. ...
B. ...
C. ...
D. ...
Answer: [letter]"""

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

if __name__ == '__main__':
    app.run(debug=True)
