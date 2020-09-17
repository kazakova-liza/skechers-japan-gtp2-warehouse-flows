import groupBy from './utils/groupBy.js';
import cache from './cache.js';
import objects from './objects.js'


cache.cases = [];
cache.slowPairs = [];

const blankOne = () => {
    const svgUpdate = [];

    svgUpdate.push({ id: 'zzzzz', value: 999 });

    return svgUpdate;
}

const execute = async (ords, connection, phase, period, numberOfPeriodsToExecute) => {
    const t1 = Date.now();
    const dtes = groupBy(ords, ['dte'], [], []);
    console.log('dtes = ', dtes.length);
    dtes.sort((a, b) => a.dte.getTime() - b.dte.getTime());

    for (let i = period; i < period + numberOfPeriodsToExecute; i++) {
        cache.thisDte = dtes[i].dte;
        let svgUpdate;
        connection.sendUTF(JSON.stringify({
            topic: 'htmlUpdate',
            payload:
                [{
                    id: 'period',
                    value: dtes[i].dte.toDateString()
                }]
        }));
        if (phase === 'all') {
            for (const el of objects.phases) {
                if (el.async !== undefined) {
                    svgUpdate = await el.function();
                }
                else {
                    svgUpdate = el.function();
                }
                const htmlUpdate = [{ id: 'phase', value: el.textOnCompletion }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate }));
            }
        }
        else {
            const currentPhase = objects.phases.find((el) => el.number === phase);
            connection.sendUTF(JSON.stringify({
                topic: 'htmlUpdate',
                payload:
                    [{
                        id: 'phase',
                        value: currentPhase.textOnProcessing
                    }]
            }));
            if (currentPhase.async !== undefined) {
                svgUpdate = await currentPhase.function();
            }
            else {
                svgUpdate = currentPhase.function();
            }
            connection.sendUTF(JSON.stringify({
                topic: 'htmlUpdate',
                payload:
                    [{
                        id: 'phase',
                        value: currentPhase.textOnCompletion
                    }]
            }));
            connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate }));
        }

    }
    const t2 = Date.now();

    console.log(t2 - t1);
}

export default execute;
