const onStartClick = () => {
    const table = document.getElementById('orders table').value;
    const command = {
        topic: "start",
        payload: table
    }
    ws.send(JSON.stringify(command));
}

const onStopClick = () => {
    const command = {
        topic: "stop"
    }
    ws.send(JSON.stringify(command));
}

const onPhaseClick = () => {
    const command = {
        topic: "increment phase"
    };
    ws.send(JSON.stringify(command));
}

const onPeriodClick = () => {
    const command = {
        topic: "increment period"
    };
    ws.send(JSON.stringify(command));
}

// const onSubmitClick = (inputName) => {
//     const table = document.getElementById(inputName).value;
//     console.log(table);
//     const command = {
//         topic: "data",
//         payload: table,
//     }
//     console.log(command);
//     ws.send(JSON.stringify(command));
// }


let draw = SVG("#svg1");

const ws = new WebSocket('ws://localhost:9615/');
ws.onopen = function () {
    console.log('WebSocket Client Connected');
    const command = {
        topic: 'inputs'
    }
    ws.send(JSON.stringify(command));
}

ws.onmessage = function (e) {
    message = JSON.parse(e.data)
    if (message.topic == 'inputs') {
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
            console.log(document.getElementById(element.id));
            var a = document.getElementById("svg1");
            var svgDoc = a.contentDocument;
            svgDoc.getElementById(element.id).textContent = element.value;
        }
    }
};


 // <button onclick="onSubmitClick('${input.name}')"> submit </button>




