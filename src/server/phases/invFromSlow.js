import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const invFromSlow = () => {
    const svgUpdate = [];

    let ordSkus = groupBy(cache.ords2, ['sku'], ['sqty'], [])
    let casesDropped = 0
    let pairsDropped = 0
    for (var sku of ordSkus) {
        const slowInv = cache.slowPairs.find((obj) => {return obj.sku == sku.sku });
        if (slowInv != undefined) {  
            cache.cases.push(slowInv)
            cache.slowPairs = cache.slowPairs.filter((obj) => {return obj.sku !== sku.sku });
            casesDropped++
            pairsDropped += slowInv.qty
        }
    }
    cache.slowPairs = cache.slowPairs.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    let slowQtyMid = 0
    for (var rack of cache.slowPairs) { slowQtyMid += rack.qty }

    let invQty = 0
    for (var rack of cache.cases) {invQty += rack.qty}

    svgUpdate.push({ id: 'slowMidPairs', value: slowQtyMid });
    svgUpdate.push({ id: 'slowMidCases', value: cache.slowPairs.length });
    svgUpdate.push({ id: 'invMid1Pairs', value: invQty });
    svgUpdate.push({ id: 'invMid1Cases', value: cache.cases.length });
    svgUpdate.push({ id: 'slowPairs', value: pairsDropped });
    svgUpdate.push({ id: 'slowCases', value: casesDropped });

    return svgUpdate;
};

export default invFromSlow;