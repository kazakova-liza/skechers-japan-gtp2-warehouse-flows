import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import websocket from 'websocket';

const port = 50001;
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

export default runWebSocketServer;

