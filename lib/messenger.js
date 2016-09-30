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

export default {
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