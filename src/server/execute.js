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

const execute = async (numberOfPeriodsToExecute, phase = cache.currentPhase) => {
    const t1 = Date.now();
    const dtes = groupBy(cache.ords, ['dte'], [], []);
    console.log('dtes = ', dtes.length);
    dtes.sort((a, b) => a.dte.getTime() - b.dte.getTime());

    for (let i = cache.currentPeriod; i < cache.currentPeriod + parseInt(numberOfPeriodsToExecute); i++) {
        cache.thisDte = dtes[i].dte;
        let svgUpdate;
        cache.connection.sendUTF(JSON.stringify({
            topic: 'htmlUpdate',
            payload:
                [{
                    id: 'period',
                    value: dtes[i].dte.toDateString()
                }]
        }));
        if (phase === 'all') {
            for (const el of objects.phases) {
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'svgUpdate',
                    payload: {
                        id: el.svgTransitionElementId,
                        color: "#ff8000"
                    }
                }));
                if (el.async !== undefined) {
                    svgUpdate = await el.function();
                }
                else {
                    svgUpdate = el.function();
                }
                const htmlUpdate = [{ id: 'phase', value: el.textOnCompletion }];
                cache.connection.sendUTF(JSON.stringify({
                    topic: 'svgUpdate',
                    payload: {
                        id: el.svgTransitionElementId,
                        color: "#bfbfbf"
                    }
                }));
                cache.connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: el.svgTransitionElementId }));
                cache.connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate }));
                cache.connection.sendUTF(JSON.stringify({ topic: 'variablesUpdate', payload: svgUpdate }));
            }
        }
        else {
            const currentPhase = objects.phases.find((el) => el.number === phase);
            cache.connection.sendUTF(JSON.stringify({
                topic: 'htmlUpdate',
                payload:
                    [{
                        id: 'phase',
                        value: currentPhase.textOnProcessing
                    }]
            }));
            cache.connection.sendUTF(JSON.stringify({
                topic: 'svgUpdate',
                payload: {
                    id: currentPhase.svgTransitionElementId,
                    color: "#ff8000"
                }
            }));
            if (currentPhase.async !== undefined) {
                svgUpdate = await currentPhase.function();
            }
            else {
                svgUpdate = currentPhase.function();
            }
            cache.connection.sendUTF(JSON.stringify({
                topic: 'htmlUpdate',
                payload:
                    [{
                        id: 'phase',
                        value: currentPhase.textOnCompletion
                    }]
            }));
            cache.connection.sendUTF(JSON.stringify({
                topic: 'svgUpdate',
                payload: {
                    id: currentPhase.svgTransitionElementId,
                    color: "#bfbfbf"
                }
            }));
            cache.connection.sendUTF(JSON.stringify({ topic: 'variablesUpdate', payload: svgUpdate }));
        }
        if (i !== cache.currentPeriod + parseInt(numberOfPeriodsToExecute) - 1) {
            cache.connection.sendUTF(JSON.stringify({ topic: 'setToNought' }));
        }
    }
    const t2 = Date.now();

    console.log(t2 - t1);
}

export default execute;
