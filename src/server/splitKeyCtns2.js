import groupBy from './utils/groupBy.js';
import cache from './cache.js';
import getOrders from './phases/getOrders.js'
import findPossibleCartons from './phases/findPossibleCartons.js'
import listEligibleStyleColor from './phases/findPossibleCartons.js'
import splitCartons from './phases/splitCartons.js'
import affinityPrep from './phases/affinityPrep.js'
import affinityGroup from './phases/affinityPrep.js'
import getInventory from './phases/getInventory.js'
import makeReplens from './phases/makeReplens.js'
import assignInventory from './phases/makeReplens.js'

let thisDte = '';
cache.cases = [];


const blankOne = () => {
    const svgUpdate = [];

    svgUpdate.push({ id: 'zzzzz', value: 999 });

    return svgUpdate;
}

const execute = (ords, connection, phase, period) => {
    const t1 = Date.now();

    const dtes = groupBy(ords, ['dte'], [], []);
    console.log('dtes = ', dtes.length);
    dtes.sort((a, b) => a.dte.getTime() - b.dte.getTime());
    //hello
    for (let i = 0; i < dtes.length; i++) {
        cache.thisDte = dtes[i].dte;
        if (i !== period) {
            continue;
        } else {
            if (phase === 1) {
                const svgUpdate1 = getOrders(ords);
                const htmlUpdate1 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'got orders' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate1 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate1 }));
            }
            if (phase === 2) {
                const svgUpdate2 = findPossibleCartons();
                const htmlUpdate2 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'found possible cartons' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate2 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate2 }));
            }

            if (phase === 3) {
                const svgUpdate3 = listEligibleStyleColor();
                const htmlUpdate3 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'found eligible style/colors' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate3 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate3 }));
            }

            if (phase === 4) {
                const svgUpdate4 = splitCartons();
                console.log(cache.eligibleStyleColList);
                const htmlUpdate4 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'split cartons' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate4 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate4 }));
            }
            if (phase === 5) {
                const svgUpdate5 = affinityprep();
                console.log(cache.eligibleStyleColList);
                const htmlUpdate5 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'Affinity martrix ready' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate5 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate5 }));
            }
            if (phase === 6) {
                const svgUpdate6 = affinityGroup();
                console.log(cache);
                const htmlUpdate6 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'Affinity groups ready' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate6 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate6 }));
            }
            if (phase === 7) {
                const svgUpdate7 = GetInventory();
                const htmlUpdate7 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'Getting current inventory' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate7 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate7 }));
            }
            if (phase === 8) {
                const svgUpdate8 = makeReplens();
                const htmlUpdate8 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'Calculating what needs replenishment' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate8 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate8 }));
            }
            if (phase === 9) {
                const svgUpdate9 = assignInventory();
                const htmlUpdate9 = [{ id: 'period', value: dtes[i].dte.toDateString() },
                { id: 'phase', value: 'Assigning inventory for cartons' }];
                connection.sendUTF(JSON.stringify({ topic: 'htmlUpdate', payload: htmlUpdate9 }));
                connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate9 }));
            }
        }
    }

    const t2 = Date.now();

    console.log(t2 - t1);
};


export default execute;
