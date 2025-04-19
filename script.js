function uploadImage() {
    const input = document.getElementById('imageInput');
    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            document.getElementById('outputText').innerText = 'Error: ' + data.error;
        } else {
            document.getElementById('outputText').innerText = data.text;
        }
    });
}

function generateQuiz() {
    const extractedText = document.getElementById("outputText").innerText;
    const container = document.getElementById("quizContainer");
    container.innerHTML = "Generating quiz...";

    fetch('/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            if (data.error.includes("quota")) {
                container.innerHTML = "<strong style='color: red;'>⚠️ Quota Exceeded:</strong> Your OpenAI account has hit its limit.<br>Visit <a href='https://platform.openai.com/account/usage' target='_blank'>OpenAI usage page</a> to check.";
            } else {
                container.innerHTML = "Error: " + data.error;
            }
        } else {
            const quiz = data.quiz.replace(/\n/g, '<br>');
            container.innerHTML = quiz;
        }
    })
    .catch(err => {
        container.innerHTML = "Failed to generate quiz.";
        console.error(err);
    });
}

function readText(elementId) {
    const text = document.getElementById(elementId).innerText;
    if (!text) return alert("Nothing to read.");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;  // Speed (0.1 to 10)
    utterance.pitch = 1; // Pitch (0 to 2)
    
    speechSynthesis.speak(utterance);
}
