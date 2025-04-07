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
});
