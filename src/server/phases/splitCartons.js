import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const splitCartons = () => {
    const svgUpdate = [];
    // find ctns with stles not in this list
    const notEligibleLines = cache.dayOrds.filter((f) => !cache.eligibleStyleColList.includes(f.styleCol));
    console.log('notEligibleLines = ', notEligibleLines.length);
    const notEligibleCarton = notEligibleLines.map((obj) => obj.carton);
    // remove these from eligible cartons
    const eligibleCartonList = cache.possibleCtnsList.filter((f) => !notEligibleCarton.includes(f));
    console.log('eligibleCartonList = ', eligibleCartonList.length);
    // get orders for these ctns
    const keyOrdLines = cache.dayOrds.filter((f) => eligibleCartonList.includes(f.carton));

    let forDB = keyOrdLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty]);

    cache.activeLines = cache.dayOrds.filter((f) => !eligibleCartonList.includes(f.carton));
    console.log('activeLines = ', cache.activeLines.length);
    //forDB = activeLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty]);

    const stats1 = groupBy(keyOrdLines, ['dte'], ['sqty'], ['carton', 'sku']);
    console.log(`stats1: ${stats1} `);
    svgUpdate.push({ id: 'keyLines', value: stats1[0].cnt });
    svgUpdate.push({ id: 'keyCtns', value: stats1[0].carton_dcnt });
    svgUpdate.push({ id: 'keySkus', value: stats1[0].sku_dcnt });
    svgUpdate.push({ id: 'keyPairs', value: stats1[0].sqty_sum });

    const stats2 = groupBy(cache.activeLines, ['dte'], ['sqty'], ['carton', 'sku']);
    svgUpdate.push({ id: 'activeLines', value: stats2[0].cnt });
    svgUpdate.push({ id: 'activeCtns', value: stats2[0].carton_dcnt });
    svgUpdate.push({ id: 'activeSkus', value: stats2[0].sku_dcnt });
    svgUpdate.push({ id: 'activePairs', value: stats2[0].sqty_sum });

    return svgUpdate;
};

export default splitCartons;