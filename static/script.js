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
        document.getElementById("outputText").innerText = data.cleaned_text || "No text found.";
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

let synth = window.speechSynthesis;
let utterance;

function readText(elementId) {
    const text = document.getElementById(elementId).innerText;
    if (!text) return;

    utterance = new SpeechSynthesisUtterance(text);

    // When speaking starts
    utterance.onstart = () => {
        document.getElementById("avatar").src = "/static/avatar_speaking.gif";
    };

    // When speaking ends
    utterance.onend = () => {
        document.getElementById("avatar").src = "/static/avatar_idle.png";
    };

    synth.cancel(); // Cancel anything currently speaking
    synth.speak(utterance);
}

function stopReading() {
    synth.cancel();
    document.getElementById("avatar").src = "/static/avatar_idle.png";
}

function explainTerm() {
    const term = document.getElementById("termInput").value.trim();
    const outputDiv = document.getElementById("termExplanation");

    if (!term) {
        outputDiv.innerHTML = `<span class="text-warning">Please enter a word or phrase.</span>`;
        return;
    }

    outputDiv.innerHTML = `<em>Thinking...</em>`;

    fetch("/explain-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: term })
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.explanation) {
            outputDiv.innerText = data.explanation;
            const utterance = new SpeechSynthesisUtterance(data.explanation);
            // When speaking starts
            utterance.onstart = () => {
                document.getElementById("avatar").src = "/static/avatar_speaking.gif";
            };

            // When speaking ends
            utterance.onend = () => {
                document.getElementById("avatar").src = "/static/avatar_idle.png";
            };
            window.speechSynthesis.speak(utterance);
        } else {
            outputDiv.innerHTML = `<span class="text-danger">Could not generate explanation.</span>`;
        }
    })
    .catch(err => {
        console.error("Explain term error:", err);
        outputDiv.innerHTML = `<span class="text-danger">Something went wrong.</span>`;
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}
