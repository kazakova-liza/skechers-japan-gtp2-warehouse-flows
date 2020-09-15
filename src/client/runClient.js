const onStartClick = () => {
    const table = document.getElementById('orders table').value;
    const command = {
        topic: 'start',
        payload: table,
    };
    ws.send(JSON.stringify(command));
};

const onStopClick = () => {
    const command = {
        topic: 'stop',
    };
    ws.send(JSON.stringify(command));
};

const onPhaseClick = () => {
    const command = {
        topic: 'phase++',
    };
    console.log(command);
    ws.send(JSON.stringify(command));
};

const onPeriodClick = () => {
    const command = {
        topic: 'period++',
    };
    ws.send(JSON.stringify(command));
};

const draw = SVG('#svg1');


const ws = new WebSocket('ws://localhost:9615/');
ws.onopen = function () {
    console.log('WebSocket Client Connected');
    const command = {
        topic: 'inputs',
    };
    ws.send(JSON.stringify(command));
};

ws.onmessage = function (e) {
    message = JSON.parse(e.data);
    if (message.topic === 'inputs') {
        let html = '';
        let labelName;
        for (const input of message.payload) {
            if (input.name === 'orders table') {
                labelName = 'Table name:';
            }
            if (input.name === 'date') {
                labelName = 'Date:';
            }

            html += `<label for="${input.name}"> ${labelName} </label>
                <textarea id="${input.name}" name="${input.name}" rows="1" cols="20"> </textarea>
                <br>`;
        }
        inputs = document.getElementById('inputs');
        inputs.innerHTML = html;
    }

    if (message.topic == 'svgUpdate') {
        console.log(message);
        for (element of message.payload) {
            const a = document.getElementById('svg1');
            const svgDoc = a.contentDocument;
            svgDoc.getElementById(element.id).textContent = element.value;
        }
    }

    if (message.topic == 'setToNought') {
        console.log(message);
        const a = document.getElementById('svg1');
        const svgDoc = a.contentDocument;
        const elements = svgDoc.getElementsByClassName('variable');
        console.log(elements);
        for (const element of elements) {
            element.textContent = 0;
        }
    }

    if (message.topic == 'htmlUpdate') {
        console.log(message);
        for (element of message.payload) {
            document.getElementById(element.id).textContent = element.value;
        }
    }
};

