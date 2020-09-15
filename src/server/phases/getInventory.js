import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const getInventory = () => {
    const svgUpdate = [];
    let rackQtyStart = 0
    cache.cases = cache.cases.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    for (var rack of cache.cases) { rackQtyStart += rack.qty }
    cache.rackSkus = groupBy(cache.cases, ['sku'], ['qty'], [])
    svgUpdate.push({ id: 'invStartPairs', value: rackQtyStart });
    svgUpdate.push({ id: 'invStartCases', value: cache.cases.length });
    return svgUpdate;
}

export default getInventory;