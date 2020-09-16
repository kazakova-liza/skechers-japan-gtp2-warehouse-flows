import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const getInventory = () => {
    const svgUpdate = [];
    let rackQtyStart = 0
    cache.cases = cache.cases.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    for (var rack of cache.cases) { rackQtyStart += rack.qty }
    
    let slowQtyStart = 0
    cache.slowPairs = cache.slowPairs.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    for (var rack of cache.slowPairs) { slowQtyStart += rack.qty }

    svgUpdate.push({ id: 'invStartP', value: rackQtyStart });
    svgUpdate.push({ id: 'invStartC', value: cache.cases.length });
    svgUpdate.push({ id: 'slowStartPairs', value: slowQtyStart });
    svgUpdate.push({ id: 'slowStartCases', value: cache.slowPairs.length });
    return svgUpdate;
}

export default getInventory;