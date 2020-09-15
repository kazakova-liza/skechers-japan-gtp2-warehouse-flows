import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const getInventory = () => {
    const svgUpdate = [];
    let rackQtyStart = 0
    cache.cases = cache.cases.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    for (var rack of cache.cases) { rackQtyStart += rack.qty }
    cache.rackSkus = groupBy(cache.cases, ['sku'], ['qty'], [])
    svgUpdate.push({ id: 'inventory', value: rackQtyStart });
    return svgUpdate;
}

export default getInventory;