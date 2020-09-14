import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import websocket from 'websocket';
import objects from './objects.js';
import getData from './sql/getData.js';
import execute from './splitKeyCtns2.js';
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
      let data;

      try {
        command = JSON.parse(message.utf8Data);
      } catch (err) {
        console.log(command);
        console.log('Command is not a JSON, skipping');
        return;
      }
      if (command.topic === 'stop') { }
      if (command.topic === 'inputs') {
        connection.sendUTF(JSON.stringify({ topic: 'inputs', payload: objects.inputs }));
      }
      if (command.topic === 'start') {
        data = await getData(command.payload);
        cache.data = data;
        cache.currentPhase = 1;
        cache.currentPeriod = 0;
        console.log(cache.currentPhase);
        execute(data, connection, cache.currentPhase, cache.currentPeriod);
      }
      if (command.topic === 'phase++') {
        cache.currentPhase++;
        console.log(cache.currentPhase);
        execute(cache.data, connection, cache.currentPhase, cache.currentPeriod);
      }
      if (command.topic === 'period++') {
        cache.currentPhase = 1;
        cache.currentPeriod++;
        console.log(cache.currentPeriod);
        execute(cache.data, connection, cache.currentPhase, cache.currentPeriod);
      }
    });

    connection.on('close', (reasonCode, description) => {
      console.log('Client has disconnected, stopping the experiment');
      experimentExecutor.stop();
    });
  });
};

main();
