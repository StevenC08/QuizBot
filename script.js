function extractText() {
    const input = document.getElementById("imageInput");
    const formData = new FormData();
    formData.append("image", input.files[0]);

    fetch("/extract-text", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("outputText").innerText = data.text || "No text found.";
    })
    .catch(err => {
        document.getElementById("outputText").innerText = "Error extracting text.";
        console.error(err);
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
            container.innerHTML = data.quiz.replace(/\n/g, "<br>");
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
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
}

function stopReading() {
    window.speechSynthesis.cancel();
}
