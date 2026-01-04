document.addEventListener("DOMContentLoaded", function () {
    var coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }

    function firstBotMessage() {
        let firstMessage = "How's it going?";
        document.getElementById("botStarterMessage").innerHTML = '<p class="botText"><span>' + firstMessage + '</span></p>';
        let time = getTime();
        document.getElementById("chat-timestamp").innerHTML = time;
        document.getElementById("userInput").scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    function getTime() {
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let timeString = hours + ":" + minutes;
        return '<span class="time">' + timeString + '</span>';
    }

    function getResponseFromBackend(userText) {
        if (!userText.trim()) {
            getBotResponse("Please type or say something!");
            return;
        }
        $.ajax({
            type: "POST",
            url: "/get-response",
            data: { userInput: userText },
            success: function (response) {
                let botResponse = response.botResponse || "Sorry, I didn't get that.";
                getBotResponse(botResponse);
            },
            error: function (xhr, status, error) {
                console.error("AJAX error:", status, error);
                getBotResponse("Sorry, something went wrong. Please try again.");
            }
        });
    }

    function getResponse() {
        let userText = $("#textInput").val().trim();
        if (!userText) {
            getBotResponse("Please type something!");
            return;
        }
        let time = getTime();
        let userHtml = time + '<p class="userText"><span>' + userText + '</span></p>';
        $("#textInput").val("");
        $("#chatbox").append(userHtml);
        document.getElementById("chat-bar-bottom").scrollIntoView({ behavior: 'smooth' });
        console.log("Send button clicked, input:", userText);

        setTimeout(function () {
            getResponseFromBackend(userText);
        }, 1000);
    }

    function getBotResponse(botResponse) {
        let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
        $("#chatbox").append(botHtml);
        document.getElementById("chat-bar-bottom").scrollIntoView({ behavior: 'smooth' });
    }

    function sendButton() {
        console.log("Send button triggered");
        getResponse();
    }

    function startRecording() {
        console.log("Voice button triggered");
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            getBotResponse("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            let time = getTime();
            let userHtml = time + '<p class="userText"><span>' + transcript + '</span></p>';
            $("#chatbox").append(userHtml);
            document.getElementById("chat-bar-bottom").scrollIntoView({ behavior: 'smooth' });
            console.log("Speech recognized:", transcript);
            getResponseFromBackend(transcript);
        };

        recognition.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
            let errorMessage = "Sorry, I couldn't understand you. ";
            if (event.error === "no-speech") {
                errorMessage += "No speech detected.";
            } else if (event.error === "audio-capture") {
                errorMessage += "No microphone found.";
            } else if (event.error === "not-allowed") {
                errorMessage += "Microphone access denied.";
            } else {
                errorMessage += "Please try again.";
            }
            getBotResponse(errorMessage);
        };

        recognition.onend = function () {
            console.log("Speech recognition ended");
        };

        recognition.start();
    }

    $(document).ready(function () {
        firstBotMessage();
        $("#sendButton").off('click').on('click', function () {
            sendButton();
        });
        $("#voiceButton").off('click').on('click', function () {
            startRecording();
        });
    });

    $("#textInput").off('keypress').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            sendButton();
        }
    });

    let lastDateDigits = [];
    let lastTimeDigits = [];

    function updateHomeFlipClockAndDate() {
        const now = new Date();
        const y = now.getFullYear().toString();
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        const d = now.getDate().toString().padStart(2, '0');
        const dateDigits = [...y, ...m, ...d];
        const h = now.getHours().toString().padStart(2, '0');
        const min = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        const timeDigits = [...h, ...min, ...s];

        const dateIds = [
            'date-y1', 'date-y2', 'date-y3', 'date-y4',
            'date-m1', 'date-m2', 'date-d1', 'date-d2'
        ];
        const timeIds = [
            'time-h1', 'time-h2', 'time-m1', 'time-m2', 'time-s1', 'time-s2'
        ];

        dateIds.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (lastDateDigits[i] !== dateDigits[i]) {
                el.textContent = dateDigits[i];
                el.classList.remove('flip-animate');
                void el.offsetWidth;
                el.classList.add('flip-animate');
            }
        });
        lastDateDigits = dateDigits;

        timeIds.forEach((id, i) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (lastTimeDigits[i] !== timeDigits[i]) {
                el.textContent = timeDigits[i];
                el.classList.remove('flip-animate');
                void el.offsetWidth;
                el.classList.add('flip-animate');
            }
        });
        lastTimeDigits = timeDigits;
    }

    setInterval(updateHomeFlipClockAndDate, 1000);
    updateHomeFlipClockAndDate();
});