let socket = null;
let user = null; // username
let host = null;

let handlers = {
    receive: [],
    receiveAll: [],
};

function _config() {
    socket.onmessage = (msg) => {
        let response = JSON.parse(msg.data);

        // Handlers for receive and receiveAll
        console.log(response);
        handlers.receive.forEach(func => func(response.find(el => el.username === user)));
        handlers.receiveAll.forEach(func => func(response));
    };
}

var messenger = {
    connect(url) {
        socket = new WebSocket(url);
        _config();

        return new Promise((resolve, reject) => {
            socket.onopen = () => resolve();
        });
    },

    /* New players announce themselves. */
    register(name, isHost = false) {
        socket.send(JSON.stringify({ command: 'REGISTER', actor: { username: name, host: isHost } }));
        user = name;
        host = isHost;
    },

    /* Send a message to the server to update state. */
    send(msg) {
        let command = host ? 'START_GAME' : 'MESSAGE';
        socket.send(JSON.stringify({ command: command, actor: { output: msg } }));
    },

    /* Event handler for messages about self. */
    receive(callback) {
        handlers.receive.push(callback);
    },

    /* Event handler for messages about all clients. */
    receiveAll(callback) {
        handlers.receiveAll.push(callback);
    },

    end() {
        socket.send(JSON.stringify({ command: 'END_GAME' }));
    }
}

var speak = function (callback) {
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
}

window.addEventListener('load', function () {
    let inbound = document.querySelector('#inbound');
    let outbound = document.querySelector('#outbound');

    messenger.receive(message => {
        inbound.textContent = message.input;
        outbound.textContent = message.output;
    });

    messenger
        .connect('wss://serene-escarpment-64592.herokuapp.com/people-game')
        .then(() => console.log('connected!'));

    // start game
    document.querySelector('#start').addEventListener('click', function () {
        let name = document.querySelector('#name').value;
        messenger.register(name);

        console.log('attempting to register');
    });

    document.querySelector('#submit').addEventListener('click', function () {
        messenger.send(document.querySelector('#output').value);
    });

    document.querySelector('#speak').addEventListener('click', function () {
        let output = document.querySelector('#output');
        speak(utterance => output.value = utterance);
    });
});
