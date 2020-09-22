import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import websocket from 'websocket';
import objects from './objects.js';
import executeQuery from './sql/executeQuery.js';
import execute from './execute.js';
import cache from './cache.js';

const port = 9615;
const baseDirectory = path.resolve();

const runHttpServer = () => {
    const server = http.createServer((request, response) => {
        try {
            const requestUrl = url.parse(request.url);
            let normalizedPath = path.normalize(requestUrl.pathname);
            //  if (normalizedPath.includes('index.html') || normalizedPath === '\\') {
            //      normalizedPath = '//src//client//index.html';
            //  }
            if (normalizedPath.includes('index.html') || normalizedPath === '/') {
                normalizedPath = '/src/client/index.html';
            }
            if (normalizedPath.includes('.svg')) {
                response.setHeader('Content-Type', 'image/svg+xml');
            }
            const fsPath = `${baseDirectory}${normalizedPath}`;
            console.log(fsPath);
            const fileStream = fs.createReadStream(fsPath);
            fileStream.pipe(response);
            fileStream.on('open', () => {
                response.writeHead(200);
            });
            fileStream.on('error', (e) => {
                console.log(normalizedPath);
                response.writeHead(404); // assume the file doesn't exist
                response.end();
            });
        } catch (e) {
            response.writeHead(500);
            response.end(); // end the response so browsers don't hang
            console.log(e.stack);
        }
    }).listen(port);
    console.log(`listening on port ${port}`);
    return server;
};

const runWebSocketServer = () => {
    const server = runHttpServer();
    const wsServer = new websocket.server({
        httpServer: server,
    });
    return wsServer;
};


const main = async () => {
    const wsServer = runWebSocketServer();

    wsServer.on('request', async (request) => {
        cache.connection = request.accept(null, request.origin);

        cache.connection.on('message', async (message) => {
            console.log('Received Message:', message.utf8Data);

            let command;
            let numberOfPeriodsToExecute;
            let phases = [];

            for (const phase of objects.phases) {
                phases.push(phase.number);
            }

            const maxPhase = Math.max(...phases);

            try {
                command = JSON.parse(message.utf8Data);
            } catch (err) {
                console.log(command);
                console.log('Command is not a JSON, skipping');
                return;
            }
            // if (command.topic === 'stop') { }
            if (command.topic === 'inputs') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'inputs', payload: objects.inputs }));
            }
            if (command.topic === 'jump') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                if (cache.currentPhase < maxPhase) {
                    numberOfPeriodsToExecute = 1;
                    await execute(numberOfPeriodsToExecute, 'all');
                }
                cache.currentPeriod++;
                numberOfPeriodsToExecute = command.payload;
                await execute(numberOfPeriodsToExecute, 'all');
                cache.currentPeriod = cache.currentPeriod + numberOfPeriodsToExecute - 1;
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'start') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                cache.currentPhase = 1;
                cache.currentPeriod = 0;
                const svgUpdate = [{ id: 'phase', value: 'getting orders...' }];
                cache.connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: svgUpdate }));
                cache.table = command.payload.table;
                cache.groups = command.payload.groups;
                cache.daysbeforeArchiveToSlow = command.payload.moveToSlow;
                cache.ords = await executeQuery('getData', cache.table);
                await execute(numberOfPeriodsToExecute);
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'phase++') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                cache.currentPhase++;
                await execute(numberOfPeriodsToExecute);
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'period++') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                cache.currentPhase = 1;
                numberOfPeriodsToExecute = 1;
                cache.currentPeriod++;
                cache.connection.sendUTF(JSON.stringify({ topic: 'setToNought' }));
                await execute(numberOfPeriodsToExecute);
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'execute period') {
                cache.connection.sendUTF(JSON.stringify({ topic: 'disableButtons' }));
                numberOfPeriodsToExecute = 1;
                await execute(numberOfPeriodsToExecute, 'all');
                cache.connection.sendUTF(JSON.stringify({ topic: 'enableButtons' }));
            }
            if (command.topic === 'dump') {
                await executeQuery('write', command.payload);
            }
        });

        cache.connection.on('close', (reasonCode, description) => {
            console.log('Client has disconnected, stopping the experiment');
            // experimentExecutor.stop();
        });
    });
};

main();
