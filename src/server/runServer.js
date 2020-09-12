import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import websocket from 'websocket';
import get from './getter.js';


const port = 9615;
const baseDirectory = path.resolve();

const runHttpServer = () => {
    const server = http.createServer(function (request, response) {
        try {
            var requestUrl = url.parse(request.url);
            let normalizedPath = path.normalize(requestUrl.pathname);
            // if (normalizedPath.includes('index.html') || normalizedPath === '\\') {
            //     normalizedPath = '//src//client//index.html';
            // }
            if (normalizedPath.includes('index.html') || normalizedPath === '/') {
                normalizedPath = '/src/client/index.html';
            }
            var fsPath = `${baseDirectory}${normalizedPath}`;
            var fileStream = fs.createReadStream(fsPath)
            fileStream.pipe(response)
            fileStream.on('open', function () {
                response.writeHead(200)
            })
            fileStream.on('error', function (e) {
                console.log(normalizedPath)
                response.writeHead(404)     // assume the file doesn't exist
                response.end()
            })
        } catch (e) {
            response.writeHead(500)
            response.end()     // end the response so browsers don't hang
            console.log(e.stack)
        }
    }).listen(port)
    console.log(`listening on port ${port}`);
    return server;
}

const runWebSocketServer = () => {
    const server = runHttpServer();
    const wsServer = new websocket.server({
        httpServer: server
    });
    return wsServer;
}

const main = async () => {
    const wsServer = runWebSocketServer();
    let connection;

    wsServer.on('request', async (request) => {
        connection = request.accept(null, request.origin);

        connection.on('message', async (message) => {
            console.log('Received Message:', message.utf8Data);

            let command;
            try {
                command = JSON.parse(message.utf8Data);
            } catch (err) {
                console.log(command);
                console.log("Command is not a JSON, skipping");
                return;
            }

            if (command.topic == 'start') { 
                await experimentExecutor.start(command.experimentId, command.date, command.table) }
            if (command.topic == 'stop') { experimentExecutor.stop() }
            if (command.topic == 'buttons') { 
                console.log(get('buttons')) 
            }

        });

        connection.on('close', function (reasonCode, description) {
            console.log('Client has disconnected, stopping the experiment');
            experimentExecutor.stop();
        });
    });
}


main();