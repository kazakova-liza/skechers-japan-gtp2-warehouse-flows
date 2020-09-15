import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const makeReplens = () => {
    const svgUpdate = [];

    let incRackNum = 0
    let usedRacks = cache.cases.map(rack => (rack.rackNum))
    let todayreplens = []
    let ordSkus = groupBy(cache.ords2, ['sku'], ['sqty'], [])
    for (var sku of ordSkus) {
        const rackInv = cache.rackSkus.find((obj) => {
            return obj.sku == sku.sku;
        });
        let inv = 0
        if (rackInv != undefined) { inv = rackInv.qty_sum }
        const rplnCtns = Math.ceil((sku.sqty_sum - inv) / 6)
        for (var i = 1; i <= rplnCtns; i++) {
            while (usedRacks.includes(incRackNum)) incRackNum++

            cache.cases.push({ "rackNum": incRackNum, "sku": sku.sku, "qty": 6, "dteUsed": thisDte })
            todayreplens.push([thisDte, sku.sku, 6, incRackNum])
            incRackNum++
        }
    }
    let replenctns = todayreplens.length

    let rackQtyMid = 0
    let rackCasesMid = 0
    for (var rack of cache.cases) {
        rackCasesMid++
        rackQtyMid += rack.qty
        if (rack.qty > 0) rackCasesMid++
    }
    svgUpdate.push({ id: 'casesToReplenish', value: replenctns });
    return svgUpdate;
}

export default makeReplens;