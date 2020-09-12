const onStartClick = () => {
    const command = {
        topic: "start",
    }
    ws.send(JSON.stringify(command));
}

const onStopClick = () => {
    const command = {
        topic: "stop"
    }
    ws.send(JSON.stringify(command));
}


let draw = SVG("#svg1");

const ws = new WebSocket('ws://localhost:9615/');
ws.onopen = function () {
    console.log('WebSocket Client Connected');
    const command = {
        topic: 'button'
    }
    ws.send(JSON.stringify(command));
}

ws.onmessage = function (e) {
    msg = JSON.parse(e.data)
    if (msg.topic == 'buttons') {
        console.log(message.payload)
    }
};







