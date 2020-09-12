import objects from './objects.js';

const get = (connection, key) => {
    let buttons;
    if (key === 'buttons') {
       buttons = objects.buttons;
    }

    connection.sendUTF(JSON.stringify({ "topic": "dates", "payload": buttons }));
}

export default get;