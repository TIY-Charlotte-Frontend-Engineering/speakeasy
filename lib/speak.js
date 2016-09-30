export default function (callback) {
    let recognition = new webkitSpeechRecognition();
    recognition.interimResults = true;

    recognition.onresult = function (event) {
        if (event.results.length > 0) callback(event.results[0][0].transcript);
    };

    recognition.onerror = function (event) {
        console.error('ERROR ERROR ERROR HOW EMBARASSING');
        console.log(event);
    };

    recognition.start();
};