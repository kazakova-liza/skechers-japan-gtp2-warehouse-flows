import objects from './objects.js';
import executeQuery from './sql/executeQuery.js';
import execute from './execute.js';
import cache from './cache.js';
import runWebSocketServer from './server.js';

const runServer = async () => {
    const wsServer = runWebSocketServer();

    wsServer.on('request', async (request) => {
        cache.connection = request.accept(null, request.origin);

        cache.connection.on('message', async (message) => {
            console.log('Received Message:', message.utf8Data);

            let command;
            let numberOfPeriodsToExecute = 1;
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
            cache.connection.sendUTF(JSON.stringify({
                topic: 'disableButtons',
                payload: 'all'
            }));
            if (command.topic === 'inputs') {
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'inputs',
                    payload: objects.inputs
                }));
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'enableButtons',
                    payload: 'start'
                }));
            }
            if (command.topic === 'jump') {
                if (cache.currentPhase < maxPhase) {

                    await execute(numberOfPeriodsToExecute, 'all');
                }
                cache.currentPeriod++;
                numberOfPeriodsToExecute = command.payload;
                await execute(numberOfPeriodsToExecute, 'all');
                cache.currentPeriod = cache.currentPeriod + numberOfPeriodsToExecute - 1;
            }
            if (command.topic === 'start') {
                cache.currentPhase = 1;
                cache.currentPeriod = 0;
                const phase1 = objects.phases.find((phase) => phase.number === 1);
                const htmlUpdate = [{
                    id: 'phase',
                    value: phase1.textOnProcessing
                }];
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'htmlUpdate',
                    payload: htmlUpdate
                }));
                if (command.payload !== undefined) {
                    cache.table = command.payload.table;
                    cache.daysbeforeArchiveToSlow = command.payload.moveToSlow;
                    cache.ords = await executeQuery('getData', cache.table);
                }
                await execute(numberOfPeriodsToExecute);
            }
            if (command.topic === 'phase++') {
                cache.currentPhase++;
                await execute(numberOfPeriodsToExecute);
            }
            if (command.topic === 'period++') {
                cache.currentPhase = 1;
                cache.currentPeriod++;
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'setToNought'
                }));
                await execute(numberOfPeriodsToExecute);
            }
            if (command.topic === 'execute period') {
                await execute(numberOfPeriodsToExecute, 'all');
            }
            if (command.topic === 'dump') {
                await executeQuery('write', command.payload);
            }
            if (command.topic !== 'inputs') {
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'enableButtons',
                    payload: 'all'
                }));
            }

        });

        cache.connection.on('close', (reasonCode, description) => {
            console.log('Client has disconnected, stopping the experiment');
            // experimentExecutor.stop();
        });
    });
};

runServer();