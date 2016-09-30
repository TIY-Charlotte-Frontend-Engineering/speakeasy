import messenger from '../lib/messenger';
import speak from '../lib/speak';

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