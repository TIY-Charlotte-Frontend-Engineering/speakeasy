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

let playerID = (id) => `main #player-${id}`;

function fill(person) {
    person.input = person.input || 'none yet';
    person.output = person.output || 'none yet';

    return person;
}

window.addEventListener('load', function () {
    const template = document.querySelector('#stage-template').innerHTML;
    const parent = document.querySelector('main');

    function render(folks) {
        // Update all that already exist.
        folks
            .map(fill)
            .filter(folk => document.querySelector(playerID(folk.id)))
            .forEach(folk => {
                let section = document.querySelector(playerID(folk.id));
                section.innerHTML = Mustache.render(template, folk);
            });

        // Create ones that don't yet exist.
        folks
            .map(fill)
            .filter(folk => document.querySelector(playerID(folk.id)) === null)
            .forEach(folk => {
                let section = document.createElement('section');
                section.setAttribute('id', `player-${folk.id}`);
                section.innerHTML = Mustache.render(template, folk);

                parent.appendChild(section);
            });
    }

    document.querySelector('#submit').addEventListener('click', function () {
        messenger.send(document.querySelector('#output').value);
    });

    document.querySelector('#end').addEventListener('click', function () {
        messenger.end();
    })

    // messenger.receiveAll(console.log);
    messenger.receiveAll(render);

    messenger.connect('wss://serene-escarpment-64592.herokuapp.com/people-game')
        .then(() => {
            console.log('registrin');
            messenger.register('Game host', true);
        });
});
