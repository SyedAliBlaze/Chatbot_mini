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
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let timeString = hours + ":" + minutes;
        return '<span class="time">' + timeString + '</span>';
    }

    // Global variable to store uid
    let uid = 0;

    function getResponseFromBackend(userText) {
        $.ajax({
            type: "POST",
            url: "/get-response",
            data: {
                userInput: userText,
                uid: uid
            },
            success: function (response) {
                let botResponse = response.botResponse;
                getBotResponse(botResponse);
            }
        });
    }

    function getloginFromBackend(username, password) {
        $.ajax({
            type: "POST",
            url: "/get-response-login",
            data: {
                username: username,
                password: password
            },
            success: function (response) {
                let botResponse = response.botResponse;
                let userId = response.userId;
                setUid(userId);
                getBotResponse(botResponse);
            }
        });
    }

    function processFeedback(feedback) {
        $.ajax({
            type: "POST",
            url: "/submit-feedback",
            data: {
                feedback: feedback
            },
            success: function (response) {
                let botResponse = response.botResponse;
                getBotResponse(botResponse);
            }
        });
    }

    function getuserFromBackend() {
        $.ajax({
            type: "POST",
            url: "/get-response-user",
            data: {
                uid: uid
            },
            success: function (response) {
                let botResponse = response.botResponse;
                getBotResponse(botResponse);
            }
        });
    }

    function setUid(newUid) {
        uid = newUid;
    }

    function getResponse() {
        let userText = $("#textInput").val();
        let utext = userText;
        let time = getTime();
        let userHtml = time;
        userHtml += '<p class="userText"><span>' + userText + '</span></p>';
        $("#textInput").val("");
        $("#chatbox").append(userHtml);
        document.getElementById("chat-bar-bottom").scrollIntoView(true);

        if (utext.startsWith("/login")) {
            let inputs = userText.split(" ");
            let username = inputs[1];
            let password = inputs[2];
            getloginFromBackend(username, password);
        } else if (utext.startsWith("/feedback")) {
            let feedback = utext.substring("/feedback".length).trim();
            processFeedback(feedback);
        } else if (utext === "/userinfo") {
            let botHtml = '<p class="botText"><span>' + uid + '</span></p>';
            $("#chatbox").append(botHtml);
            document.getElementById("chat-bar-bottom").scrollIntoView(true);
        } else if (utext === "/logout") {
            setUid(0);
            let botResponse = "You have been logged out.";
            let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
            $("#chatbox").append(botHtml);
            document.getElementById("chat-bar-bottom").scrollIntoView(true);
        } else {
            setTimeout(function () {
                getResponseFromBackend(userText);
            }, 1000);
        }
    }

    function getBotResponse(botResponse) {
        let botHtml = '<p class="botText"><span>' + botResponse + '</span></p>';
        $("#chatbox").append(botHtml);
        document.getElementById("chat-bar-bottom").scrollIntoView(true);
    }

    function buttonSendText(sampleText) {
        let userHtml = '<p class="userText"><span>' + sampleText + '</span></p>';
        $("#textInput").val("");
        $("#chatbox").append(userHtml);
        document.getElementById("chat-bar-bottom").scrollIntoView(true);
    }

    function sendButton() {
        getResponse();
    }

    $(document).ready(function () {
        firstBotMessage();
    });

    $("#textInput").keypress(function (e) {
        if (e.which == 13) {
            getResponse();
        }
    });

    function startRecording() {
        var recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = function (event) {
            var transcript = event.results[0][0].transcript;
            let time = getTime();
            let userHtml = time + '<p class="userText"><span>' + transcript + '</span></p>';
            $("#chatbox").append(userHtml);
            document.getElementById("chat-bar-bottom").scrollIntoView(true);
            getResponseFromBackend(transcript);
        };
        recognition.start();
    }

    function updateFlipClockAndDate() {
        const now = new Date();
        // Format date as YYYY-MM-DD
        const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        // Format time as HH:MM:SS
        const timeStr = now.toLocaleTimeString(undefined, { hour12: false });
        document.getElementById('flip-date').textContent = dateStr;
        document.getElementById('flip-clock').textContent = timeStr;
    }

    let lastDate = '';
    let lastTime = '';

    let lastDateDigits = [];
    let lastTimeDigits = [];

    function updateHomeFlipClockAndDate() {
        const now = new Date();

        // Date: YYYY-MM-DD
        const y = now.getFullYear().toString();
        const m = (now.getMonth() + 1).toString().padStart(2, '0');
        const d = now.getDate().toString().padStart(2, '0');
        const dateDigits = [...y, ...m, ...d];

        // Time: HH:MM:SS
        const h = now.getHours().toString().padStart(2, '0');
        const min = now.getMinutes().toString().padStart(2, '0');
        const s = now.getSeconds().toString().padStart(2, '0');
        const timeDigits = [...h, ...min, ...s];

        // Date IDs
        const dateIds = [
            'date-y1', 'date-y2', 'date-y3', 'date-y4',
            'date-m1', 'date-m2',
            'date-d1', 'date-d2'
        ];
        // Time IDs
        const timeIds = [
            'time-h1', 'time-h2',
            'time-m1', 'time-m2',
            'time-s1', 'time-s2'
        ];

        // Update date digits with animation
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

        // Update time digits with animation
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

    // Remove old interval if present, then set new one
    setInterval(updateHomeFlipClockAndDate, 1000);
    updateHomeFlipClockAndDate();
});
