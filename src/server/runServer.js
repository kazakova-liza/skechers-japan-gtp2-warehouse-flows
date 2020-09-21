import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import websocket from 'websocket';
import objects from './objects.js';
import getData from './sql/getData.js';
import execute from './engine.js';
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
    let connection;

    wsServer.on('request', async (request) => {
        connection = request.accept(null, request.origin);

        connection.on('message', async (message) => {
            console.log('Received Message:', message.utf8Data);

            let command;
            let numberOfPeriodsToExecute;
            let data;
            let ords;
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
                connection.sendUTF(JSON.stringify({ topic: 'inputs', payload: objects.inputs }));
            }
            if (command.topic === 'jump') {
                if (cache.currentPhase < maxPhase) {
                    numberOfPeriodsToExecute = 1;
                    await execute(cache.ords, connection, 'all', cache.currentPeriod, numberOfPeriodsToExecute);
                }
                cache.currentPeriod++;
                numberOfPeriodsToExecute = command.payload;
                await execute(cache.ords, connection, 'all', cache.currentPeriod, numberOfPeriodsToExecute);
                cache.currentPeriod = cache.currentPeriod + numberOfPeriodsToExecute - 1;
                console.log(cache.currentPeriod);
            }
            if (command.topic === 'start') {
                numberOfPeriodsToExecute = 1;
                cache.currentPhase = 1;
                cache.currentPeriod = 0;
                const svgUpdate = [{ id: 'phase', value: 'getting orders...' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: svgUpdate }));
                cache.table = command.payload.table;
                cache.groups = command.payload.groups;
                cache.daysbeforeArchiveToSlow = command.payload.moveToSlow;
                cache.ords = await getData(cache.table);
                await execute(cache.ords, connection, cache.currentPhase, cache.currentPeriod, numberOfPeriodsToExecute);
            }
            if (command.topic === 'phase++') {
                numberOfPeriodsToExecute = 1;
                cache.currentPhase++;
                await execute(cache.ords, connection, cache.currentPhase, cache.currentPeriod, numberOfPeriodsToExecute);
            }
            if (command.topic === 'period++') {
                cache.currentPhase = 1;
                numberOfPeriodsToExecute = 1;
                cache.currentPeriod++;
                connection.sendUTF(JSON.stringify({ topic: 'setToNought' }));
                await execute(cache.ords, connection, cache.currentPhase, cache.currentPeriod, numberOfPeriodsToExecute);
            }
            if (command.topic === 'execute period') {
                numberOfPeriodsToExecute = 1;
                await execute(cache.ords, connection, 'all', cache.currentPeriod, numberOfPeriodsToExecute);
            }
        });

        connection.on('close', (reasonCode, description) => {
            console.log('Client has disconnected, stopping the experiment');
            // experimentExecutor.stop();
        });
    });
};

main();
