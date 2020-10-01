let dataForTable = [];
let dates = [];
let JSONtable;

const disableButtons = (buttonName) => {
    const buttons = ['start', 'period++', 'phase++', 'jump', 'dump'];
    if (buttonName === 'all') {
        for (const button of buttons) {
            document.getElementById(button).disabled = true;
        }
    }
    else {
        document.getElementById(buttonName).disabled = true;
    }
}

const enableButtons = (buttonName) => {
    const buttons = ['start', 'period++', 'phase++', 'jump', 'dump'];
    if (buttonName === 'all') {
        for (const button of buttons) {
            document.getElementById(button).disabled = false;
        }
    }
    else {
        document.getElementById(buttonName).disabled = false;
    }
}

const onStartClick = () => {
    let command;
    if (document.getElementById('Variables table') === null) {
        command = {
            topic: 'start',
        };
    }
    else {
        const mySqlTable = document.getElementById('Variables table').value;
        command = {
            topic: 'start',
            payload: {
                mySqlTable,
            }
        };
    }
    ws.send(JSON.stringify(command));
    disableButtons('start');
};

const onJumpClick = () => {
    disableButtons('all');
    const numberOfPeriods = document.getElementById('numberOfPeriods').value;
    const command = {
        topic: 'jump',
        payload: numberOfPeriods,
    };
    ws.send(JSON.stringify(command));
};

const onDumpClick = () => {
    const command = {
        topic: 'dump',
        payload: document.getElementById('mySQLTable').value
    }
    ws.send(JSON.stringify(command));
};

const json2Table = (json) => {
    //https://dev.to/boxofcereal/how-to-generate-a-table-from-json-data-with-es6-methods-2eel
    let cols = Object.keys(json[0]);
    let headerRow = cols
        .map(col => `<th>${col}</th>`)
        .join("");

    let rows = json
        .map(row => {
            let tds = cols.map(col => `<td>${row[col]}</td>`).join("  ");
            return `<tr>${tds}</tr>`;
        })
        .join("  ");

    const table = `
    <table>
      <thead>
        <tr>${headerRow}</tr>
      <thead>
      <tbody>
        ${rows}
      <tbody>
    <table>`;

    return table;
}

const onStopClick = () => {
    const command = {
        topic: 'stop',
    };
    ws.send(JSON.stringify(command));
};

const onPhaseClick = () => {
    disableButtons('all');
    const command = {
        topic: 'phase++',
    };
    console.log(command);
    ws.send(JSON.stringify(command));
};

const onPeriodClick = () => {
    disableButtons('all');
    const command = {
        topic: 'period++',
    };
    ws.send(JSON.stringify(command));
};

const draw = SVG('#svg1');

document.getElementById('svg1').addEventListener('load', function () {
    const svgElement = document.getElementById('svg1');
    var panZoom = svgPanZoom(svgElement, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        minZoom: 0.1,
        mouseWheelZoomEnabled: false,
        // fit: 1,
        center: false
    });
    panZoom.zoom(1);
    panZoom.fit();
    panZoom.resize();
})


if (document.getElementById('table') !== undefined) {
    JSONtable = document.getElementById('table');
}

// if (svgDoc.getElementById('phases') !== null) {
//     const phases = svgDoc.getElementById('phases').childNodes;
//     for (const phase of phases) {
//         phase.style.visibility = 'hidden';
//     }
// }

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
        for (const input of message.payload) {
            html += `<label for="${input.name}"> ${input.name}: </label>
                <textarea id="${input.name}" name="${input.name}" rows="1" cols="20"> </textarea>
                <br>`;
        }
        inputs = document.getElementById('inputs');
        inputs.innerHTML = html;
    }

    if (message.topic == 'disableButtons') {
        disableButtons(message.payload);
    }

    if (message.topic == 'enableButtons') {
        enableButtons(message.payload);
    }

    if (message.topic == 'variablesUpdate') {
        console.log(message);
        for (element of message.payload) {
            const svgObject = document.getElementById('svg1');
            const svgDoc = svgObject.contentDocument;
            const el = svgDoc.getElementById(element.id);
            if (el.getElementsByTagName('tspan') !== undefined) {
                const tspans = el.getElementsByTagName('tspan');
                tspans[0].textContent = element.value;
            }
            else {
                svgDoc.getElementById(element.id).textContent = element.value;
            }
            const currentDate = document.getElementById('period').textContent;
            if (dataForTable.length === 0) {
                dataForTable.push({
                    name: element.id,
                    [currentDate]: element.value
                })
            }
            for (let i = 0; i < dataForTable.length; i++) {
                if (dataForTable[i].name === element.id) {
                    if (!dataForTable[i].hasOwnProperty(currentDate)) {
                        dataForTable[i][currentDate] = element.value;
                    }
                    break;
                }
                if (i === dataForTable.length - 1 && dataForTable[i].name !== element.id) {
                    dataForTable.push({
                        name: element.id,
                        [currentDate]: element.value
                    })
                }
            }
            table.innerHTML = json2Table(dataForTable);
        }
    }

    if (message.topic == 'transitionUpdate') {
        console.log(message);
        for (element of message.payload) {
            const svgObject = document.getElementById('svg1');
            const svgDoc = svgObject.contentDocument;
            const el = svgDoc.getElementById(element.id);
            console.log(el);
            console.log(element.id)
            el.style.visibility = 'visible';
        }
    }

    if (message.topic == 'setToNought') {
        console.log(message);
        const svgObject = document.getElementById('svg1');
        const svgDoc = svgObject.contentDocument;
        const elements = svgDoc.getElementsByClassName('variable');
        for (const element of elements) {
            element.textContent = '-';
        }
        console.log(`data for table: ${dataForTable}`);
        table.innerHTML = json2Table(dataForTable);
    }

    if (message.topic == 'htmlUpdate') {
        console.log(message);
        for (element of message.payload) {
            document.getElementById(element.id).textContent = element.value;
        }
    }

    if (message.topic === 'svgUpdate') {
        console.log(message);
        const svgObject = document.getElementById('svg1');
        const svgDoc = svgObject.contentDocument;
        const elementToUpdate = svgDoc.getElementById(message.payload.id);
        console.log(elementToUpdate);
        elementToUpdate.style.fill = message.payload.color;
    }
};

