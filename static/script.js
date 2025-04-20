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
    const gradeLevel = document.getElementById("gradeLevel").value;
    container.innerHTML = "Generating quiz...";

    fetch('/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, grade_level: gradeLevel })
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

function askAboutText() {
    const question = document.getElementById("userQuestion").value;
    const context = document.getElementById("outputText").innerText;

    fetch("/ask-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("textAnswer").innerText = data.answer || "No answer found.";
        const utterance = new SpeechSynthesisUtterance(data.answer);
        // When speaking starts
        utterance.onstart = () => {
            document.getElementById("avatar").src = "/static/avatar_speaking.gif";
        };
        // When speaking ends
        utterance.onend = () => {
            document.getElementById("avatar").src = "/static/avatar_idle.png";
        };
        window.speechSynthesis.speak(utterance);
    })
    .catch(err => {
        document.getElementById("textAnswer").innerText = "Error asking question.";
        console.error(err);
    });
}

let selectedVoice = null;

// Populate voice dropdown
function populateVoices() {
    const voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById("voiceSelect");

    // Clear and repopulate
    voiceSelect.innerHTML = "";
    voices.forEach((voice, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });

    selectedVoice = voices[0]; // Default voice
}

// Set selected voice
function setSelectedVoice() {
    const voices = speechSynthesis.getVoices();
    const selectedIndex = document.getElementById("voiceSelect").value;
    selectedVoice = voices[selectedIndex];
}

// Update readText function
function readText(elementId) {
    const text = document.getElementById(elementId).innerText;
    if (!text) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
}

function stopReading() {
    speechSynthesis.cancel();
}

// Voices may load asynchronously
window.speechSynthesis.onvoiceschanged = populateVoices;
