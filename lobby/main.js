import messenger from '../lib/messenger';

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