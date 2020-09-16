import groupBy from './utils/groupBy.js';
import cache from './cache.js';
import objects from './objects.js'


cache.cases = [];


const blankOne = () => {
    const svgUpdate = [];

    svgUpdate.push({ id: 'zzzzz', value: 999 });

    return svgUpdate;
}

const execute = async (ords, connection, phase, period) => {
    const t1 = Date.now();
    const dtes = groupBy(ords, ['dte'], [], []);
    console.log('dtes = ', dtes.length);
    dtes.sort((a, b) => a.dte.getTime() - b.dte.getTime());

    for (let i = 0; i < dtes.length; i++) {
        cache.thisDte = dtes[i].dte;
        if (i !== period) {
            continue;
        } else {
            if (phase === 'all') {
                for (const el of objects.phases) {
                    let svgUpdate;
                    if (el.async !== undefined) {
                        svgUpdate = await el.function();
                    }
                    else {
                        svgUpdate = el.function();
                    }
                    console.log('svgUpdate');
                    console.log(svgUpdate);
                    const htmlUpdate = [{ id: 'period', value: dtes[i].dte.toDateString() },
                    { id: 'phase', value: el.textOnCompletion }];
                    connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate }));
                    connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate }));
                }
            }
            let svgUpdate;
            const currentPhase = objects.phases.find((el) => el.number === phase);
            if (currentPhase.async !== undefined) {
                svgUpdate = await currentPhase.function();
            }
            else {
                svgUpdate = currentPhase.function();
            }
            console.log('svgUpdate');
            console.log(svgUpdate);
            const htmlUpdate = [{ id: 'period', value: dtes[i].dte.toDateString() },
            { id: 'phase', value: currentPhase.textOnCompletion }];
            connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate }));
            connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate }));
        }
    }

    const t2 = Date.now();

    console.log(t2 - t1);
};


export default execute;
